import React from 'react';
import { Hotspot, Language, ShiftType } from '../types';
import { getAvailability, getNearestAvailableAlternatives } from '../utils/booking';
import { formatScore, getRelativeScoreTier } from '../utils/scoring';
import { t } from '../utils/translations';
import {
  X,
  Plus,
  Check,
  AlertTriangle,
  Building2,
  Users,
  Calendar,
  MessageSquare,
  Scale,
  Navigation,
  ArrowRight,
} from 'lucide-react';

interface BottomSheetProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  selectedHotspots: Hotspot[];
  onToggleSelectHotspot: (hotspot: Hotspot) => void;
  onSelectAlternative: (currentSpot: Hotspot, replacementSpot: Hotspot) => void;
  allHotspots: Hotspot[];
  shift: ShiftType;
  date: string;
  lang: Language;
  allScores: number[];
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  hotspot,
  onClose,
  selectedHotspots,
  onToggleSelectHotspot,
  onSelectAlternative,
  allHotspots,
  shift,
  date,
  lang,
  allScores,
}) => {
  if (!hotspot) return null;

  const isSelected = selectedHotspots.some((s) => s.id === hotspot.id);
  const avail = getAvailability(hotspot, shift, date);
  const tier = getRelativeScoreTier(hotspot.totalScore, allScores);

  // If full, get 3 nearest available alternatives
  const alternatives = avail.isFull
    ? getNearestAvailableAlternatives(
        hotspot,
        allHotspots,
        shift,
        date,
        selectedHotspots.map((s) => s.id)
      )
    : [];

  return (
    <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[88vh] flex flex-col z-10">
        {/* Drag handle on mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${tier.bgColor} ${tier.borderColor} ${tier.textColor}`}>
                {tier.label}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  avail.isFull
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                    : avail.isAlmostFull
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                {avail.isFull
                  ? t(lang, 'occupiedBadge')
                  : avail.isAlmostFull
                  ? t(lang, 'almostFullBadge')
                  : t(lang, 'openBadge')}{' '}
                ({avail.bookedCount}/{avail.maxPickers})
              </span>
            </div>

            <h3 className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {lang === 'mr' ? hotspot.marathiName : lang === 'hi' ? hotspot.hindiName : hotspot.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {hotspot.name} · {hotspot.zone}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm">
          {/* Total Score Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                {t(lang, 'colScore')}
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                {formatScore(hotspot.totalScore)}
              </span>
              <span className="text-xs text-slate-400 ml-1">/ 100.0</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                {t(lang, 'colYield')}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                ~{hotspot.estimatedKgPerDay} kg
              </span>
              <span className="text-xs text-slate-400 block">per shift</span>
            </div>
          </div>

          {/* C/P/E/F Factor Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {t(lang, 'colBreakdown')}
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" /> Commercial 40%
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {hotspot.commercialFactor}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${hotspot.commercialFactor}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-500" /> Population 30%
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {hotspot.populationFactor}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${hotspot.populationFactor}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Events 20%
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {hotspot.eventsFactor}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${hotspot.eventsFactor}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> Feedback 10%
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {hotspot.feedbackFactor}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${hotspot.feedbackFactor}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Waste Types & Nearest Depot */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Dominant Recyclables:</span>
              <div className="flex flex-wrap gap-1">
                {hotspot.primaryWasteTypes.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Nearest Scrap Shed:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                {hotspot.nearestScrapCenter} ({hotspot.scrapCenterDistanceKm} km)
              </span>
            </div>
          </div>

          {/* FULL WARNING & ALTERNATIVE SPOTS SUGGESTION */}
          {avail.isFull && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3">
              <div className="flex items-start gap-2 text-rose-800 dark:text-rose-200 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  {t(lang, 'spotOccupiedMsg', {
                    booked: avail.bookedCount,
                    max: avail.maxPickers,
                  })}
                </p>
              </div>

              {alternatives.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-rose-200 dark:border-rose-800/60">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {t(lang, 'suggestedAlternatives')}
                  </span>
                  <div className="space-y-1.5">
                    {alternatives.map((alt) => (
                      <div
                        key={alt.hotspot.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {lang === 'mr' ? alt.hotspot.marathiName : alt.hotspot.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {alt.distanceKm} km away · {alt.availableSlots} slots open
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onSelectAlternative(hotspot, alt.hotspot);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap min-h-[36px] flex items-center gap-1 cursor-pointer"
                        >
                          <span>{t(lang, 'addInstead')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={() => {
              if (!avail.isFull || isSelected) {
                onToggleSelectHotspot(hotspot);
                onClose();
              }
            }}
            disabled={avail.isFull && !isSelected}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSelected
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                : avail.isFull
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t(lang, 'removeFromRoute')}</span>
              </>
            ) : avail.isFull ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>{t(lang, 'occupiedBadge')} ({avail.bookedCount}/{avail.maxPickers})</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t(lang, 'addToRoute')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
