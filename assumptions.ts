import { CollectionAssumptions } from '../types';

export const SHARED_WASTE_TYPES = [
  'Cardboard',
  'Paper/Newspaper',
  'PET bottles',
  'Rigid plastic',
  'Plastic film',
  'Beverage/Tin cans',
  'Metal scrap',
  'Glass',
  'Tetra Pak',
] as const;

export type SharedWasteType = typeof SHARED_WASTE_TYPES[number];

export const DEFAULT_SCRAP_RATES: Record<string, number> = {
  'Cardboard': 16,
  'Paper/Newspaper': 14,
  'PET bottles': 22,
  'Rigid plastic': 18,
  'Plastic film': 12,
  'Beverage/Tin cans': 26,
  'Metal scrap': 34,
  'Glass': 4,
  'Tetra Pak': 9,
};

export const DEFAULT_COLLECTION_ASSUMPTIONS: CollectionAssumptions = {
  walkingSpeedKmH: 3.8, // default 3.8 km/h with loaded cart
  loadingRateKgPerMin: 10, // default 10 kg/min
  sortingMinsPerStop: 5, // default 5 min negotiation & sorting per stop
  collectionEfficiencyPct: 28, // default 28% of total daily hotspot potential collected on one shift
  cartCapacityKg: 150, // default 150 kg cart capacity
  scrapRates: { ...DEFAULT_SCRAP_RATES },
};

const ASSUMPTIONS_STORAGE_KEY = 'swach_pune_assumptions_v2';

export function loadSavedAssumptions(): CollectionAssumptions {
  if (typeof window === 'undefined') return DEFAULT_COLLECTION_ASSUMPTIONS;
  try {
    const raw = localStorage.getItem(ASSUMPTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_COLLECTION_ASSUMPTIONS,
        ...parsed,
        scrapRates: { ...DEFAULT_SCRAP_RATES, ...(parsed.scrapRates || {}) },
      };
    }
  } catch (e) {
    console.warn('Failed to parse assumptions from storage', e);
  }
  return DEFAULT_COLLECTION_ASSUMPTIONS;
}

export function saveAssumptions(assumptions: CollectionAssumptions): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASSUMPTIONS_STORAGE_KEY, JSON.stringify(assumptions));
  } catch (e) {
    console.warn('Failed to save assumptions to storage', e);
  }
}

/**
 * Calculates walking time in minutes based on total distance and walking speed.
 * Formula: (distanceKm / walkingSpeedKmH) * 60
 */
export function calculateWalkingTimeMins(distanceKm: number, walkingSpeedKmH: number): number {
  if (walkingSpeedKmH <= 0 || distanceKm <= 0) return 0;
  return Math.round((distanceKm / walkingSpeedKmH) * 60);
}

/**
 * Calculates collection time for a single stop in minutes.
 * Formula: (expectedKg / loadingRateKgPerMin) + sortingMinsPerStop
 */
export function calculateStopCollectionTimeMins(
  expectedKg: number,
  loadingRateKgPerMin: number,
  sortingMinsPerStop: number
): number {
  const loadingTime = loadingRateKgPerMin > 0 ? expectedKg / loadingRateKgPerMin : 0;
  return Math.round(loadingTime + sortingMinsPerStop);
}

/**
 * Formats minutes into "Xh Ym" or "Ym"
 */
export function formatDurationHoursMins(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculates expected recyclables haul across stops, capped at cart capacity
 */
export function calculateHaulCapacity(
  stopsEstimatedKg: number[],
  efficiencyPct: number,
  cartCapacityKg: number
): {
  uncappedKg: number;
  cappedKg: number;
  isCapped: boolean;
} {
  const totalPredicted = stopsEstimatedKg.reduce((acc, kg) => acc + kg, 0);
  const uncappedKg = Math.round(totalPredicted * (efficiencyPct / 100));
  const isCapped = uncappedKg > cartCapacityKg;
  const cappedKg = isCapped ? cartCapacityKg : uncappedKg;
  return { uncappedKg, cappedKg, isCapped };
}

/**
 * Calculates projected revenue in INR across stops based on materials and rates
 */
export function calculateProjectedRevenue(
  stops: { primaryWasteTypes: string[]; estimatedHaulKg: number }[],
  rates: Record<string, number>
): number {
  let totalRevenue = 0;
  stops.forEach((stop) => {
    const materials = stop.primaryWasteTypes.length > 0 ? stop.primaryWasteTypes : ['Cardboard'];
    const portionPerMaterial = stop.estimatedHaulKg / materials.length;
    materials.forEach((mat) => {
      const rate = rates[mat] || rates['Cardboard'] || 16;
      totalRevenue += portionPerMaterial * rate;
    });
  });
  return Math.round(totalRevenue);
}
