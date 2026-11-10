import React from 'react';
import { Hotspot, Language, ShiftType } from '../types';
import { getAvailability } from '../utils/booking';
import { t } from '../utils/translations';
import { Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface LiveOccupancySectionProps {
  hotspots: Hotspot[];
  shift: ShiftType;
  date: string;
  lang: Language;
  onSelectHotspot: (hotspot: Hotspot) => void;
}

export const LiveOccupancySection: React.FC<LiveOccupancySectionProps> = ({
  hotspots,
  shift,
  date,
  lang,
  onSelectHotspot,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{t(lang, 'liveOccupancyTitle')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(lang, 'liveOccupancyDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{shift.split(' ')[0]} · {date}</span>
        </div>
      </div>

      {/* Grid of spot occupancy status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
        {hotspots.map((h) => {
          const avail = getAvailability(h, shift, date);
          const isFull = avail.isFull;
          const isAlmostFull = avail.isAlmostFull;

          return (
            <button
              key={h.id}
              onClick={() => onSelectHotspot(h)}
              className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between min-h-[82px] ${
                isFull
                  ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/80'
                  : isAlmostFull
                  ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/80'
                  : 'bg-slate-50/80 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                  {lang === 'mr' ? h.marathiName : lang === 'hi' ? h.hindiName : h.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {h.zone}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                <span
                  className={`font-semibold ${
                    isFull
                      ? 'text-rose-700 dark:text-rose-400'
                      : isAlmostFull
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {isFull
                    ? t(lang, 'occupiedBadge')
                    : isAlmostFull
                    ? t(lang, 'almostFullBadge')
                    : t(lang, 'openBadge')}
                </span>

                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {avail.bookedCount}/{avail.maxPickers}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
