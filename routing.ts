import { CollectionAssumptions, Hotspot, OptimizedRoute, RouteStep, RouteStop, ShiftType } from '../types';
import {
  calculateHaulCapacity,
  calculateProjectedRevenue,
  calculateStopCollectionTimeMins,
  calculateWalkingTimeMins,
} from './assumptions';

/**
 * Calculates straight line distance (Haversine) in kilometers between two GPS coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Solves Traveling Salesperson Problem (Greedy Nearest Neighbor heuristic)
 * starting from startLocation to order stops for minimum walking distance.
 */
export function optimizeStopSequence(
  startLoc: { lat: number; lng: number },
  hotspots: Hotspot[]
): Hotspot[] {
  if (hotspots.length <= 1) return [...hotspots];

  const unvisited = [...hotspots];
  const ordered: Hotspot[] = [];

  let currentLat = startLoc.lat;
  let currentLng = startLoc.lng;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateHaversineDistance(
        currentLat,
        currentLng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    ordered.push(nextStop);
    currentLat = nextStop.lat;
    currentLng = nextStop.lng;
  }

  return ordered;
}

interface OsrmStep {
  maneuver: {
    instruction?: string;
    type?: string;
    modifier?: string;
  };
  name?: string;
  distance: number;
  duration: number;
}

/**
 * Fetches real walking roads from OpenStreetMap OSRM foot profile.
 * If OSRM fails or times out, falls back to straight lines and sets isFallback: true.
 */
export async function fetchOSRMWalkingRoute(
  waypoints: { name: string; lat: number; lng: number }[]
): Promise<{
  geometry: [number, number][];
  distanceKm: number;
  instructions: string[];
  legs: { distanceKm: number; durationMins: number }[];
  isFallback: boolean;
}> {
  if (waypoints.length <= 1) {
    return {
      geometry: waypoints.map((p) => [p.lat, p.lng]),
      distanceKm: 0,
      instructions: ['Starting at ' + (waypoints[0]?.name || 'Hub')],
      legs: [],
      isFallback: false,
    };
  }

  const allCoords = waypoints.map((p) => `${p.lng},${p.lat}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${allCoords}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout

    const response = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM coordinates are [lng, lat], convert to [lat, lng]
        const geometry: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        const distanceKm = Number((route.distance / 1000).toFixed(1));
        const instructions: string[] = [];
        const legs: { distanceKm: number; durationMins: number }[] = [];

        if (route.legs) {
          route.legs.forEach((leg: { distance: number; duration: number; steps?: OsrmStep[] }, legIdx: number) => {
            const legDistKm = Number((leg.distance / 1000).toFixed(1));
            const legDurMins = Math.round(leg.duration / 60);
            legs.push({ distanceKm: legDistKm, durationMins: legDurMins });

            const destName = waypoints[legIdx + 1]?.name || 'Next stop';
            instructions.push(`Leg ${legIdx + 1}: Walk to ${destName} (${legDistKm} km)`);
          });
        }

        return {
          geometry,
          distanceKm,
          instructions,
          legs,
          isFallback: false,
        };
      }
    }
  } catch (err) {
    console.warn('OSRM foot routing failed or timed out. Using straight line fallback.', err);
  }

  // Fallback to straight lines between waypoints
  const points: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);
  let totalDist = 0;
  const legs: { distanceKm: number; durationMins: number }[] = [];
  const instructions: string[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = calculateHaversineDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
    // Multiply by ~1.25 for typical street walking factor
    const legDist = Number((d * 1.25).toFixed(1));
    totalDist += legDist;
    const legMins = Math.round((legDist / 3.8) * 60);
    legs.push({ distanceKm: legDist, durationMins: legMins });
    instructions.push(`Direct Walk to ${waypoints[i + 1]?.name || 'Stop'} (${legDist} km)`);
  }

  return {
    geometry: points,
    distanceKm: Number(totalDist.toFixed(1)),
    instructions,
    legs,
    isFallback: true,
  };
}

/**
 * Builds the complete OptimizedRoute with three labelled times:
 * 1. Walking time = total distance / walking speed with cart (default 3.8 km/h)
 * 2. Collection time = per stop (expected kg / loading rate + 5 min sorting)
 * 3. Total shift time = walking time + collection time
 */
export async function buildOptimizedRoute(
  startLoc: { name: string; lat: number; lng: number },
  stopsList: Hotspot[],
  shift: ShiftType,
  date: string,
  returnToHub: boolean,
  isManualOrder: boolean,
  assumptions: CollectionAssumptions
): Promise<OptimizedRoute> {
  // Order stops: Auto (nearest first) or Manual
  const orderedHotspots = isManualOrder
    ? [...stopsList]
    : optimizeStopSequence(startLoc, stopsList);

  // Prepare waypoints list
  const waypoints = [startLoc, ...orderedHotspots];
  if (returnToHub && orderedHotspots.length > 0) {
    waypoints.push(startLoc);
  }

  // Fetch real walking street paths from OSRM
  const routeData = await fetchOSRMWalkingRoute(waypoints);

  // Compute three times & stop metrics
  const walkingTimeMins = calculateWalkingTimeMins(
    routeData.distanceKm,
    assumptions.walkingSpeedKmH
  );

  let totalCollectionTimeMins = 0;
  const stopExpectedWeights: number[] = [];
  const routeStops: RouteStop[] = [];
  const steps: RouteStep[] = [];

  orderedHotspots.forEach((spot, idx) => {
    // Expected haul from this stop based on efficiency %
    const estimatedHaulKg = Math.round(
      spot.estimatedKgPerDay * (assumptions.collectionEfficiencyPct / 100)
    );
    stopExpectedWeights.push(spot.estimatedKgPerDay);

    const stopColMins = calculateStopCollectionTimeMins(
      estimatedHaulKg,
      assumptions.loadingRateKgPerMin,
      assumptions.sortingMinsPerStop
    );
    totalCollectionTimeMins += stopColMins;

    const leg = routeData.legs[idx] || { distanceKm: 1.0, durationMins: 15 };
    const prevPoint = idx === 0 ? startLoc.name : orderedHotspots[idx - 1].name;

    steps.push({
      fromName: prevPoint,
      toName: spot.name,
      distanceKm: leg.distanceKm,
      durationMins: calculateWalkingTimeMins(leg.distanceKm, assumptions.walkingSpeedKmH),
    });

    routeStops.push({
      hotspot: spot,
      stopOrder: idx + 1,
      estimatedWeightKg: estimatedHaulKg,
      walkingDistanceKm: leg.distanceKm,
      walkingTimeMins: calculateWalkingTimeMins(leg.distanceKm, assumptions.walkingSpeedKmH),
      collectionTimeMins: stopColMins,
      legDistanceKm: leg.distanceKm,
      legDurationMins: leg.durationMins,
    });
  });

  // If returning to hub, add final return step
  if (returnToHub && orderedHotspots.length > 0) {
    const returnLeg = routeData.legs[orderedHotspots.length] || { distanceKm: 1.5, durationMins: 20 };
    steps.push({
      fromName: orderedHotspots[orderedHotspots.length - 1].name,
      toName: startLoc.name,
      distanceKm: returnLeg.distanceKm,
      durationMins: calculateWalkingTimeMins(returnLeg.distanceKm, assumptions.walkingSpeedKmH),
    });
  }

  // Calculate haul capacity & cart cap
  const { uncappedKg, cappedKg, isCapped } = calculateHaulCapacity(
    stopExpectedWeights,
    assumptions.collectionEfficiencyPct,
    assumptions.cartCapacityKg
  );

  // Calculate revenue based on materials and scrap rates
  const stopsForRevenue = routeStops.map((s) => ({
    primaryWasteTypes: s.hotspot.primaryWasteTypes,
    estimatedHaulKg: s.estimatedWeightKg,
  }));
  const estimatedEarningsInr = calculateProjectedRevenue(
    stopsForRevenue,
    assumptions.scrapRates
  );

  const totalShiftTimeMins = walkingTimeMins + totalCollectionTimeMins;

  return {
    id: `route-${Date.now()}`,
    name: `Route: ${startLoc.name.split(' ')[0]} → ${orderedHotspots.map((s) => s.name.split(' ')[0]).join(' → ')}`,
    date,
    shift,
    startLocation: startLoc,
    stops: routeStops,
    returnToStart: returnToHub,
    totalDistanceKm: routeData.distanceKm,
    walkingTimeMins,
    collectionTimeMins: totalCollectionTimeMins,
    totalShiftTimeMins,
    totalEstimatedKg: cappedKg,
    isCappedAtCapacity: isCapped,
    uncappedEstimatedKg: uncappedKg,
    estimatedEarningsInr,
    routeGeometry: routeData.geometry,
    turnInstructions: routeData.instructions,
    steps,
    isRoutingFallback: routeData.isFallback,
  };
}
