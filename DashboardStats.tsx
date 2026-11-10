import React from 'react';
import { Hotspot, Language, ScoringWeights } from '../types';
import { formatScore } from '../utils/scoring';
import { t } from '../utils/translations';
import { Sliders, Calendar, Sparkles, Clock, Info } from 'lucide-react';

interface DashboardStatsProps {
  hotspots: Hotspot[];
  weights: ScoringWeights;
  onOpenWeightsModal: () => void;
  onOpenEventsModal: () => void;
  lang: Language;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  hotspots,
  weights,
  onOpenWeightsModal,
  onOpenEventsModal,
  lang,
}) => {
  const totalHotspots = hotspots.length;
  const avgScore =
    hotspots.reduce((acc, h) => acc + h.totalScore, 0) / (totalHotspots || 1);
  const totalDailyKg = hotspots.reduce((acc, h) => acc + h.estimatedKgPerDay, 0);

  // Sort by score
  const topHotspots = [...hotspots].sort((a, b) => b.totalScore - a.totalScore);
  const topSpot = topHotspots[0];

  return (
    <div className="space-y-3.5">
      {/* Sample Data Notice Banner with Last Updated timestamp */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shrink-0">
            Sample Data
          </span>
          <span className="font-medium">
            {t(lang, 'sampleDataNotice')}
          </span>
          <span className="text-emerald-700/80 dark:text-emerald-300/80 text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t(lang, 'dataLastUpdated')}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={onOpenEventsModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg font-bold text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors shadow-2xs min-h-[40px] cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events (20%)</span>
          </button>

          <button
            onClick={onOpenWeightsModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg font-bold text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-slate-800 transition-colors shadow-2xs min-h-[40px] cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t(lang, 'adjustWeightsTitle')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Hotspots */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t(lang, 'kpiMonitoredHotspots')}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalHotspots}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Active
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {t(lang, 'kpiAcrossZones')}
          </div>
        </div>

        {/* Card 2: Average Waste Potential Score (formatted with 1 decimal) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t(lang, 'kpiAvgScore')}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatScore(avgScore)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {t(lang, 'kpiScoreScale')}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Formula 40/30/20/10
          </div>
        </div>

        {/* Card 3: Daily Scrap Generation Pool */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t(lang, 'kpiRecyclablePool')}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
              ~{totalDailyKg.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              kg
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {t(lang, 'kpiKgPerDay')}
          </div>
        </div>

        {/* Card 4: Top Opportunity Hub (FIXED CUTOFF & TRUNCATION) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t(lang, 'kpiTopSpot')}
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-1">
            <span
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate"
              title={topSpot ? topSpot.name : ''}
            >
              {topSpot ? topSpot.name.split(' ')[0] : 'None'}
            </span>
            <span className="text-base sm:text-lg font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
              {topSpot ? formatScore(topSpot.totalScore) : '0.0'} pts
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {topSpot ? (lang === 'mr' ? topSpot.marathiName : lang === 'hi' ? topSpot.hindiName : topSpot.name) : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
