import React, { useState } from 'react';
import { CollectionAssumptions, Hotspot, Language, OptimizedRoute, ShiftType } from '../types';
import { PUNE_STARTING_HUBS } from '../data/puneHotspots';
import { formatDurationHoursMins } from '../utils/assumptions';
import { getAvailability, getNearestAvailableAlternatives } from '../utils/booking';
import { t } from '../utils/translations';
import {
  Navigation,
  Sparkles,
  Trash2,
  ArrowUp,
  ArrowDown,
  Share2,
  Clock,
  Footprints,
  IndianRupee,
  Package,
  Loader2,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Info,
  CornerDownRight,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface RouteOptimizerProps {
  allHotspots: Hotspot[];
  selectedHotspots: Hotspot[];
  onToggleSelectHotspot: (hotspot: Hotspot) => void;
  onClearSelectedHotspots: () => void;
  onSelectTopHotspots: (count: number) => void;
  activeRoute: OptimizedRoute | null;
  onOpenWhatsAppModal: () => void;
  onOpenAssumptionsModal: () => void;
  shift: ShiftType;
  date: string;
  lang: Language;
  assumptions: CollectionAssumptions;
  onReplaceQueuedSpot: (oldSpot: Hotspot, newSpot: Hotspot) => void;
  onReorderHotspots?: (reordered: Hotspot[]) => void;
  selectedHubIndex: number;
  onSelectedHubIndexChange: (index: number) => void;
  returnToHub: boolean;
  onReturnToHubChange: (value: boolean) => void;
  isManualOrder: boolean;
  onManualOrderChange: (value: boolean) => void;
  isOptimizing: boolean;
  routeError: string;
  onRequestOptimize: () => void;
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  allHotspots,
  selectedHotspots,
  onToggleSelectHotspot,
  onClearSelectedHotspots,
  onSelectTopHotspots,
  activeRoute,
  onOpenWhatsAppModal,
  onOpenAssumptionsModal,
  shift,
  date,
  lang,
  assumptions,
  onReplaceQueuedSpot,
  onReorderHotspots,
  selectedHubIndex,
  onSelectedHubIndexChange,
  returnToHub,
  onReturnToHubChange,
  isManualOrder,
  onManualOrderChange,
  isOptimizing,
  routeError,
  onRequestOptimize,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const queueHotspots = activeRoute
    ? activeRoute.stops.map((stop) => stop.hotspot).filter((spot) => selectedHotspots.some((selected) => selected.id === spot.id))
    : selectedHotspots;

  const handleGenerateRoute = (
    customStops = selectedHotspots,
    manual = isManualOrder,
    retHub = returnToHub
  ) => {
    if (customStops.length === 0) return;
    if (customStops !== selectedHotspots) onReorderHotspots?.(customStops);
    if (manual !== isManualOrder) onManualOrderChange(manual);
    if (retHub !== returnToHub) onReturnToHubChange(retHub);
    onRequestOptimize();
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= queueHotspots.length) return;

    const updated = [...queueHotspots];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    // In manual mode, immediately recompute with updated exact sequence
    handleGenerateRoute(updated, true, returnToHub);
  };

  // Check shift window duration limit (4 hours = 240 mins)
  const maxShiftWindowMins = 240;
  const isShiftOverLimit = activeRoute ? activeRoute.totalShiftTimeMins > maxShiftWindowMins : false;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <span>{t(lang, 'tabRoute')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real pedestrian paths via OpenStreetMap · Auto or Manual ordering · Capacity limits
          </p>
        </div>

        {/* Assumptions Button & Quick Helpers */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={onOpenAssumptionsModal}
            className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors min-h-[44px] flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t(lang, 'collectionAssumptionsBtn')}</span>
          </button>

          <button
            onClick={() => onSelectTopHotspots(3)}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors min-h-[44px] cursor-pointer"
          >
            {t(lang, 'autoTop3')}
          </button>

          <button
            onClick={() => onSelectTopHotspots(5)}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors min-h-[44px] cursor-pointer"
          >
            {t(lang, 'autoTop5')}
          </button>

          {selectedHotspots.length > 0 && (
            <button
              onClick={onClearSelectedHotspots}
              className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors min-h-[44px] cursor-pointer"
            >
              {t(lang, 'clearQueue')}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Controls: Starting Hub, Order Mode, Return to Hub Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t(lang, 'startHub')}
            </label>
            <select
              value={selectedHubIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                onSelectedHubIndexChange(idx);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white min-h-[44px]"
            >
              {PUNE_STARTING_HUBS.map((hub, idx) => (
                <option key={hub.name} value={idx}>
                  {hub.name} ({hub.zone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Routing Ordering Mode
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[44px]">
              <button
                onClick={() => {
                  onManualOrderChange(false);
                  handleGenerateRoute(selectedHotspots, false, returnToHub);
                }}
                className={`flex-1 py-1 px-2 text-xs font-bold rounded-md transition-colors ${
                  !isManualOrder
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Auto (Nearest)
              </button>
              <button
                onClick={() => {
                  onManualOrderChange(true);
                  handleGenerateRoute(selectedHotspots, true, returnToHub);
                }}
                className={`flex-1 py-1 px-2 text-xs font-bold rounded-md transition-colors ${
                  isManualOrder
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Manual (Arrows)
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={returnToHub}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onReturnToHubChange(checked);
                  onRequestOptimize();
                }}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t(lang, 'returnToHub')}
              </span>
            </label>
          </div>
        </div>

        {/* OSRM Routing Fallback Notice (if API failed) */}
        {activeRoute?.isRoutingFallback && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t(lang, 'osrmFallbackNotice')}</span>
          </div>
        )}

        {/* Selected Stops Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>
              {t(lang, 'stopsQueue')} ({selectedHotspots.length})
            </span>
            <span className="text-slate-400 font-normal">
              {isManualOrder
                ? 'Use up/down arrows to change visit sequence'
                : 'Ordered automatically by nearest distance'}
            </span>
          </div>

          {selectedHotspots.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No collection stops added yet. Tap <b>"+ Add to route"</b> on any hotspot or click <b>"Auto Top 3"</b>.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {queueHotspots.map((spot, idx) => {
                const avail = getAvailability(spot, shift, date);
                const isFull = avail.isFull;

                return (
                  <div
                    key={spot.id}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      isFull
                        ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Queue number matching map marker */}
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {activeRoute ? `#${idx + 1}` : '·'}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 dark:text-white truncate text-sm">
                            {lang === 'mr' ? spot.marathiName : spot.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            ~{spot.estimatedKgPerDay} kg potential · {avail.bookedCount}/{avail.maxPickers} pickers
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Arrows shown ONLY in Manual mode */}
                        {isManualOrder && (
                          <>
                            <button
                              onClick={() => moveStop(idx, 'up')}
                              disabled={idx === 0}
                              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                              title="Move up in route order"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveStop(idx, 'down')}
                              disabled={idx === queueHotspots.length - 1}
                              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                              title="Move down in route order"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onToggleSelectHotspot(spot)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors ml-1 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                          title="Remove stop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Warning if a queued stop has become full later! */}
                    {isFull && (
                      <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[11px] flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          Spot is now occupied ({avail.bookedCount}/{avail.maxPickers} pickers).
                        </span>
                        {/* Alternative suggestion button */}
                        {(() => {
                          const alts = getNearestAvailableAlternatives(
                            spot,
                            allHotspots,
                            shift,
                            date,
                            selectedHotspots.map((s) => s.id)
                          );
                          if (alts.length > 0) {
                            return (
                              <button
                                onClick={() => onReplaceQueuedSpot(spot, alts[0].hotspot)}
                                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] whitespace-nowrap cursor-pointer"
                              >
                                Replace with {alts[0].hotspot.name.split(' ')[0]}
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Optimize Button */}
        <div>
          <button
            onClick={() => handleGenerateRoute()}
            disabled={selectedHotspots.length === 0 || isOptimizing}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t(lang, 'optimizingBtn')}</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>{t(lang, 'optimizeBtn')} ({selectedHotspots.length} Stops)</span>
              </>
            )}
          </button>
        </div>

        {routeError && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {routeError}
          </p>
        )}

        {/* THREE LABELLED TIMES & CALCULATED ROUTE SUMMARY */}
        {activeRoute && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t(lang, 'routeSummaryTitle')}</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Distance: {activeRoute.totalDistanceKm} km
              </span>
            </div>

            {/* THREE TIMES GRID (EACH WITH "How is this calculated?" TOOLTIP) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* 1. Walking Time */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 relative">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Footprints className="w-4 h-4 text-emerald-600" />
                    {t(lang, 'walkingTimeLabel')}
                  </span>
                  <button
                    onClick={() =>
                      setActiveTooltip(activeTooltip === 'walking' ? null : 'walking')
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="How is this calculated?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1 font-mono font-black text-xl text-slate-900 dark:text-white">
                  {formatDurationHoursMins(activeRoute.walkingTimeMins)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {activeRoute.totalDistanceKm} km @ {assumptions.walkingSpeedKmH} km/h
                </div>

                {activeTooltip === 'walking' && (
                  <div className="mt-2 p-2 bg-slate-900 text-white rounded text-[10px] leading-relaxed animate-fade-in">
                    {t(lang, 'walkingTimeTooltip')}
                  </div>
                )}
              </div>

              {/* 2. Collection Time */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 relative">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Package className="w-4 h-4 text-amber-600" />
                    {t(lang, 'collectionTimeLabel')}
                  </span>
                  <button
                    onClick={() =>
                      setActiveTooltip(activeTooltip === 'collection' ? null : 'collection')
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="How is this calculated?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1 font-mono font-black text-xl text-slate-900 dark:text-white">
                  {formatDurationHoursMins(activeRoute.collectionTimeMins)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {activeRoute.stops.length} stops ({assumptions.loadingRateKgPerMin} kg/min + {assumptions.sortingMinsPerStop}m sorting)
                </div>

                {activeTooltip === 'collection' && (
                  <div className="mt-2 p-2 bg-slate-900 text-white rounded text-[10px] leading-relaxed animate-fade-in">
                    {t(lang, 'collectionTimeTooltip')}
                  </div>
                )}
              </div>

              {/* 3. Total Shift Time (Warns if over 4-hour window) */}
              <div
                className={`p-3.5 rounded-xl border relative ${
                  isShiftOverLimit
                    ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Clock className="w-4 h-4 text-purple-600" />
                    {t(lang, 'totalShiftTimeLabel')}
                  </span>
                  <button
                    onClick={() =>
                      setActiveTooltip(activeTooltip === 'shift' ? null : 'shift')
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="How is this calculated?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div
                  className={`mt-1 font-mono font-black text-xl ${
                    isShiftOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {formatDurationHoursMins(activeRoute.totalShiftTimeMins)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Walking + Collection combined
                </div>

                {activeTooltip === 'shift' && (
                  <div className="mt-2 p-2 bg-slate-900 text-white rounded text-[10px] leading-relaxed animate-fade-in">
                    {t(lang, 'totalShiftTimeTooltip')}
                  </div>
                )}
              </div>
            </div>

            {/* SHIFT OVER-LIMIT WARNING BANNER */}
            {isShiftOverLimit && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {t(lang, 'shiftWindowWarning', {
                    time: formatDurationHoursMins(activeRoute.totalShiftTimeMins),
                    maxTime: '4 hours',
                  })}
                </span>
              </div>
            )}

            {/* RECYCLABLES & REVENUE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Expected Recyclables (Capped warning) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold flex items-center gap-1">
                    <Package className="w-4 h-4 text-blue-600" />
                    {t(lang, 'expectedRecyclables')}
                  </span>
                  <span className="font-mono text-[11px]">
                    Cap: {assumptions.cartCapacityKg} kg
                  </span>
                </div>
                <div className="mt-1 font-mono font-black text-xl text-emerald-700 dark:text-emerald-400">
                  ~{activeRoute.totalEstimatedKg} kg
                </div>
                {activeRoute.isCappedAtCapacity && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded text-[11px] text-amber-800 dark:text-amber-200">
                    {t(lang, 'cartCapWarning', {
                      cap: assumptions.cartCapacityKg,
                      expected: activeRoute.uncappedEstimatedKg,
                    })}
                  </div>
                )}
              </div>

              {/* Projected Revenue */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    {t(lang, 'projectedRevenue')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    By material rates
                  </span>
                </div>
                <div className="mt-1 font-mono font-black text-xl text-slate-900 dark:text-white">
                  ₹{activeRoute.estimatedEarningsInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {t(lang, 'revenueTooltip')}
                </div>
              </div>
            </div>

            {/* STEP LIST ("Start -> Stop 1: 2.1 km, 32 min") */}
            {activeRoute.steps && activeRoute.steps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t(lang, 'stepList')}
                </span>

                <div className="space-y-1.5">
                  {activeRoute.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate mr-2">
                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          <b>{st.fromName.split(' ')[0]}</b> → <b>{st.toName.split(' ')[0]}</b>
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 shrink-0">
                        {st.distanceKm} km · {st.durationMins}m walk
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dispatch Action */}
            <button
              onClick={onOpenWhatsAppModal}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
              <span>{t(lang, 'dispatchWhatsApp')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
