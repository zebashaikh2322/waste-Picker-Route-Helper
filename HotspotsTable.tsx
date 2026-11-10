import React, { useState } from 'react';
import { Hotspot, Language, ShiftType } from '../types';
import { getAvailability } from '../utils/booking';
import { formatScore, getRelativeScoreTier } from '../utils/scoring';
import { t } from '../utils/translations';
import { Search, ArrowUpDown, Plus, Check, MessageSquarePlus, AlertTriangle } from 'lucide-react';

interface HotspotsTableProps {
  hotspots: Hotspot[];
  selectedHotspots: Hotspot[];
  onToggleSelectHotspot: (hotspot: Hotspot) => void;
  onOpenFeedbackModal: (hotspot: Hotspot) => void;
  onTapHotspot: (hotspot: Hotspot) => void;
  shift: ShiftType;
  date: string;
  lang: Language;
}

export const HotspotsTable: React.FC<HotspotsTableProps> = ({
  hotspots,
  selectedHotspots,
  onToggleSelectHotspot,
  onOpenFeedbackModal,
  onTapHotspot,
  shift,
  date,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortField, setSortField] = useState<'totalScore' | 'estimatedKgPerDay' | 'avgScrapRatePerKg'>('totalScore');
  const [sortAsc, setSortAsc] = useState(false);

  const allScores = hotspots.map((h) => h.totalScore);

  const filtered = hotspots.filter((h) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      h.name.toLowerCase().includes(query) ||
      h.marathiName.toLowerCase().includes(query) ||
      (h.hindiName && h.hindiName.toLowerCase().includes(query)) ||
      h.zone.toLowerCase().includes(query) ||
      h.primaryWasteTypes.some((t) => t.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    if (showOnlyAvailable) {
      const avail = getAvailability(h, shift, date);
      return !avail.isFull;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const handleSort = (field: 'totalScore' | 'estimatedKgPerDay' | 'avgScrapRatePerKg') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
            {t(lang, 'directoryTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            40% Commercial · 30% Population · 20% Events · 10% Feedback · Slot capacity
          </p>
        </div>

        {/* Search & "Show only available" Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="whitespace-nowrap">{t(lang, 'filterOnlyAvailable')}</span>
          </label>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t(lang, 'searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 font-bold">{t(lang, 'colHotspot')}</th>
              <th
                className="py-3 px-3 font-bold text-right cursor-pointer select-none"
                onClick={() => handleSort('totalScore')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t(lang, 'colScore')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 font-bold text-center hidden md:table-cell">
                {t(lang, 'colBreakdown')}
              </th>
              <th
                className="py-3 px-3 font-bold text-right cursor-pointer select-none"
                onClick={() => handleSort('estimatedKgPerDay')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t(lang, 'colYield')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 font-bold text-center">
                {t(lang, 'colOccupancy')}
              </th>
              <th className="py-3 px-4 font-bold text-right">{t(lang, 'colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No hotspots match your filters.
                </td>
              </tr>
            ) : (
              sorted.map((spot) => {
                const isSelected = selectedHotspots.some((s) => s.id === spot.id);
                const avail = getAvailability(spot, shift, date);
                const tier = getRelativeScoreTier(spot.totalScore, allScores);

                return (
                  <tr
                    key={spot.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onTapHotspot(spot)}
                  >
                    {/* Hotspot & Locality */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === 'mr' ? spot.marathiName : lang === 'hi' ? spot.hindiName : spot.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{spot.name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          {spot.zone}
                        </span>
                      </div>
                    </td>

                    {/* Total Score with ONE DECIMAL */}
                    <td className="py-3.5 px-3 text-right">
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono font-black text-xs border"
                        style={{
                          backgroundColor: `${tier.color}15`,
                          borderColor: `${tier.color}40`,
                          color: tier.color,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                        <span>{formatScore(spot.totalScore)}</span>
                      </div>
                    </td>

                    {/* Factor Breakdown */}
                    <td className="py-3.5 px-3 hidden md:table-cell text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                        <span title="Commercial 40%">C:{spot.commercialFactor}</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span title="Population 30%">P:{spot.populationFactor}</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span title="Events 20%">E:{spot.eventsFactor}</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span title="Feedback 10%">F:{spot.feedbackFactor}</span>
                      </div>
                    </td>

                    {/* Daily Yield */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                      ~{spot.estimatedKgPerDay} kg
                    </td>

                    {/* Slot Occupancy ("2/3 pickers", Open / Almost full / Full) */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md font-bold text-[11px] border ${
                          avail.isFull
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                            : avail.isAlmostFull
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {avail.bookedCount}/{avail.maxPickers}{' '}
                        {avail.isFull ? t(lang, 'occupiedBadge') : avail.isAlmostFull ? t(lang, 'almostFullBadge') : t(lang, 'openBadge')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (!avail.isFull || isSelected) {
                              onToggleSelectHotspot(spot);
                            } else {
                              onTapHotspot(spot);
                            }
                          }}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors min-h-[44px] cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200'
                              : avail.isFull
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                          title={avail.isFull ? 'Spot is full - tap to view alternatives' : isSelected ? 'Remove from route' : 'Add to route'}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{t(lang, 'removeFromRoute')}</span>
                            </>
                          ) : avail.isFull ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{t(lang, 'occupiedBadge')}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>{t(lang, 'addToRoute')}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onOpenFeedbackModal(spot)}
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          title="Submit ground feedback for this hotspot"
                        >
                          <MessageSquarePlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
