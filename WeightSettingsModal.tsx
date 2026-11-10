import React, { useState } from 'react';
import { Language, ScoringWeights } from '../types';
import { DEFAULT_WEIGHTS } from '../utils/scoring';
import { t } from '../utils/translations';
import { X, Sliders, RotateCcw, Check, Info } from 'lucide-react';

interface WeightSettingsModalProps {
  weights: ScoringWeights;
  onUpdateWeights: (weights: ScoringWeights) => void;
  onClose: () => void;
  lang: Language;
}

export const WeightSettingsModal: React.FC<WeightSettingsModalProps> = ({
  weights,
  onUpdateWeights,
  onClose,
  lang,
}) => {
  const [commercial, setCommercial] = useState(Math.round(weights.commercial * 100));
  const [population, setPopulation] = useState(Math.round(weights.population * 100));
  const [events, setEvents] = useState(Math.round(weights.events * 100));
  const [feedback, setFeedback] = useState(Math.round(weights.feedback * 100));

  const total = commercial + population + events + feedback;
  const isValid = total === 100;

  // Live recalculate helper
  const applyLive = (c: number, p: number, e: number, f: number) => {
    if (c + p + e + f === 100) {
      onUpdateWeights({
        commercial: c / 100,
        population: p / 100,
        events: e / 100,
        feedback: f / 100,
      });
    }
  };

  const handleSliderChange = (
    field: 'c' | 'p' | 'e' | 'f',
    newVal: number
  ) => {
    let newC = commercial;
    let newP = population;
    let newE = events;
    let newF = feedback;

    if (field === 'c') newC = newVal;
    if (field === 'p') newP = newVal;
    if (field === 'e') newE = newVal;
    if (field === 'f') newF = newVal;

    setCommercial(newC);
    setPopulation(newP);
    setEvents(newE);
    setFeedback(newF);

    applyLive(newC, newP, newE, newF);
  };

  const handleNormalizeTo100 = () => {
    const sum = commercial + population + events + feedback || 100;
    const normC = Math.round((commercial / sum) * 100);
    const normP = Math.round((population / sum) * 100);
    const normE = Math.round((events / sum) * 100);
    const normF = 100 - (normC + normP + normE);

    setCommercial(normC);
    setPopulation(normP);
    setEvents(normE);
    setFeedback(normF);
    applyLive(normC, normP, normE, normF);
  };

  const handleReset = () => {
    setCommercial(40);
    setPopulation(30);
    setEvents(20);
    setFeedback(10);
    applyLive(40, 30, 20, 10);
  };

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t(lang, 'adjustWeightsTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              Standard Formula: <b>Commercial 40%</b>, <b>Population 30%</b>, <b>Events 20%</b>, <b>Feedback 10%</b>.
              Scores recalculate live as you move any slider.
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t(lang, 'commercialWeight')}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {commercial}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={commercial}
                onChange={(e) => handleSliderChange('c', Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t(lang, 'populationWeight')}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {population}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={population}
                onChange={(e) => handleSliderChange('p', Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t(lang, 'eventsWeight')}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {events}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={events}
                onChange={(e) => handleSliderChange('e', Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t(lang, 'feedbackWeight')}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {feedback}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={feedback}
                onChange={(e) => handleSliderChange('f', Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Sum Validator & Auto Balance button */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between font-mono font-bold text-xs ${
              isValid
                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-700 dark:text-rose-300'
            }`}
          >
            <span>Total Sum: {total}%</span>
            {isValid ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Valid 100% (Applied Live)
              </span>
            ) : (
              <button
                type="button"
                onClick={handleNormalizeTo100}
                className="px-2 py-1 rounded bg-rose-600 text-white font-sans text-[11px] font-bold cursor-pointer"
              >
                Auto-Fit to 100%
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t(lang, 'resetWeights')}</span>
          </button>

          <button
            onClick={onClose}
            disabled={!isValid}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold min-h-[44px] cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
