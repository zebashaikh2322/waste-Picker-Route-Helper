import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hotspot, Language, OptimizedRoute, ShiftType } from '../types';
import { PUNE_STARTING_HUBS } from '../data/puneHotspots';
import { getAvailability } from '../utils/booking';
import { formatScore, getRelativeScoreTier } from '../utils/scoring';
import { t } from '../utils/translations';
import { Layers, MapPin, Navigation, Warehouse, CheckCircle2 } from 'lucide-react';

interface HotspotExplorerMapProps {
  hotspots: Hotspot[];
  selectedHotspots: Hotspot[];
  onToggleSelectHotspot: (hotspot: Hotspot) => void;
  activeRoute: OptimizedRoute | null;
  onTapHotspot: (hotspot: Hotspot) => void;
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  lang: Language;
  shift: ShiftType;
  date: string;
}

export const HotspotExplorerMap: React.FC<HotspotExplorerMapProps> = ({
  hotspots,
  selectedHotspots,
  onToggleSelectHotspot,
  activeRoute,
  onTapHotspot,
  selectedZone,
  onSelectZone,
  lang,
  shift,
  date,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const depotsLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);

  const [showDepots, setShowDepots] = useState<boolean>(true);

  // All scores for relative quantile calculation
  const allScores = hotspots.map((h) => h.totalScore);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: [18.5204, 73.8567],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      depotsLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Hotspot Markers & Depots
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !depotsLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    const depotsGroup = depotsLayerRef.current;

    markersGroup.clearLayers();
    depotsGroup.clearLayers();

    // 1. Render Collection Depots (if toggled on)
    if (showDepots) {
      PUNE_STARTING_HUBS.forEach((hub) => {
        const depotIcon = L.divIcon({
          className: 'custom-depot-pin',
          html: `
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-700 text-white text-[11px] font-bold shadow-md border-2 border-white" title="${hub.name}">
              🏛️
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const m = L.marker([hub.lat, hub.lng], { icon: depotIcon });
        m.bindPopup(`<b class="text-xs text-indigo-900">${hub.name}</b><br><span class="text-[11px] text-slate-500">Official Municipal Sorting Depot</span>`);
        m.addTo(depotsGroup);
      });
    }

    // 2. Render Hotspots with Relative Color Bands & Queue Number Matching
    const filteredHotspots =
      selectedZone === 'All'
        ? hotspots
        : hotspots.filter((h) => h.zone === selectedZone);

    filteredHotspots.forEach((spot) => {
      // Stop labels always follow the optimized route order, never selection order.
      const routeStop = activeRoute?.stops.find((stop) => stop.hotspot.id === spot.id);
      const isQueued = selectedHotspots.some((selected) => selected.id === spot.id);
      const queueNumber = routeStop?.stopOrder;

      const avail = getAvailability(spot, shift, date);
      const tier = getRelativeScoreTier(spot.totalScore, allScores);

      // Pin background color: if queued, show distinct emerald green ring with matching order number
      // If not queued, use relative tier color (green top 33%, orange mid 33%, grey bottom 33%)
      const pinColor = isQueued ? '#059669' : tier.color;

      const markerHtml = `
        <div class="relative group cursor-pointer text-center select-none">
          <div class="w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-lg border-2 ${
            isQueued
              ? 'border-yellow-300 ring-4 ring-yellow-400/40 scale-110'
              : 'border-white'
          }" style="background-color: ${pinColor}; transition: transform 0.2s ease;">
            <span class="text-xs leading-none font-mono font-black">
              ${queueNumber ? `#${queueNumber}` : formatScore(spot.totalScore)}
            </span>
            <span class="text-[8px] font-mono leading-none opacity-90 mt-0.5">
              ${avail.bookedCount}/${avail.maxPickers}
            </span>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${pinColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-hotspot-marker',
        html: markerHtml,
        iconSize: [40, 44],
        iconAnchor: [20, 42],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon });

      // Tapping hotspot triggers bottom sheet
      marker.on('click', () => {
        onTapHotspot(spot);
      });

      marker.addTo(markersGroup);
    });
  }, [
    hotspots,
    selectedHotspots,
    activeRoute,
    selectedZone,
    showDepots,
    shift,
    date,
    onTapHotspot,
    allScores,
  ]);

  // Update Route Polyline & Start Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old route polyline & start pin
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }

    if (activeRoute && activeRoute.routeGeometry && activeRoute.routeGeometry.length > 0) {
      // Draw walking path line
      const polyline = L.polyline(activeRoute.routeGeometry, {
        color: '#059669', // Emerald
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: activeRoute.isRoutingFallback ? '6, 8' : undefined,
      }).addTo(map);

      // Add Start Hub Pin
      const startIcon = L.divIcon({
        className: 'custom-start-hub',
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold border-2 border-white shadow-lg">
            🚩
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const startMarker = L.marker(
        [activeRoute.startLocation.lat, activeRoute.startLocation.lng],
        { icon: startIcon }
      )
        .bindPopup(`<b>Start Hub:</b> ${activeRoute.startLocation.name}`)
        .addTo(map);

      routePolylineRef.current = polyline;
      startMarkerRef.current = startMarker;

      // Fit bounds to route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [activeRoute]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([18.5204, 73.8567], 13);
    }
  };

  const zones = ['All', 'Central Pune', 'West Pune', 'East Pune', 'South Pune'];

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      {/* Map Control Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Zone Filters */}
        <div className="flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-auto overflow-x-auto max-w-full">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Zone:
          </span>
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => onSelectZone(zone)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors min-h-[36px] cursor-pointer ${
                selectedZone === zone
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Map View Utilities */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowDepots(!showDepots)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border shadow-sm transition-colors backdrop-blur-md min-h-[40px] cursor-pointer ${
              showDepots
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title="Toggle collection depots / scrap sorting sheds"
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>{t(lang, 'toggleDepots')}</span>
          </button>

          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors backdrop-blur-md min-h-[40px] cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t(lang, 'centerPune')}</span>
          </button>
        </div>
      </div>

      {/* Relative Quantile Legend Overlay at Bottom Left (ALWAYS HAS LABELS) */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-xs pointer-events-auto space-y-2 max-w-xs">
        <div className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between gap-3 text-xs">
          <span>{t(lang, 'mapTitle')}</span>
          <span className="text-[10px] text-slate-400 font-normal">Relative Tiers</span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <span>{t(lang, 'colorHigh')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-600 shrink-0" />
            <span>{t(lang, 'colorMed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
            <span>{t(lang, 'colorLow')}</span>
          </div>
          {showDepots && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-indigo-700 dark:text-indigo-400 font-semibold">
              <span>🏛️</span>
              <span>Sorting Depots</span>
            </div>
          )}
        </div>

        {selectedHotspots.length > 0 && (
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {selectedHotspots.length} queued
            </span>
            <span className="text-slate-400 font-normal">Pins show #1, #2...</span>
          </div>
        )}
      </div>

      {/* Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
