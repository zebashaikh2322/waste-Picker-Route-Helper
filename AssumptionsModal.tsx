import React, { useState } from 'react';
import { CollectionAssumptions, Language } from '../types';
import { DEFAULT_COLLECTION_ASSUMPTIONS, DEFAULT_SCRAP_RATES, SHARED_WASTE_TYPES } from '../utils/assumptions';
import { t } from '../utils/translations';
import { X, Sliders, RotateCcw, Check, Info, IndianRupee } from 'lucide-react';

interface AssumptionsModalProps {
  assumptions: CollectionAssumptions;
  onSaveAssumptions: (assumptions: CollectionAssumptions) => void;
  onClose: () => void;
  lang: Language;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({
  assumptions,
  onSaveAssumptions,
  onClose,
  lang,
}) => {
  const [walkingSpeed, setWalkingSpeed] = useState(assumptions.walkingSpeedKmH);
  const [loadingRate, setLoadingRate] = useState(assumptions.loadingRateKgPerMin);
  const [sortingMins, setSortingMins] = useState(assumptions.sortingMinsPerStop);
  const [efficiency, setEfficiency] = useState(assumptions.collectionEfficiencyPct);
  const [cartCapacity, setCartCapacity] = useState(assumptions.cartCapacityKg);
  const [rates, setRates] = useState<Record<string, number>>({ ...assumptions.scrapRates });

  const handleRateChange = (material: string, val: number) => {
    setRates((prev) => ({ ...prev, [material]: Math.max(1, val) }));
  };

  const handleReset = () => {
    setWalkingSpeed(DEFAULT_COLLECTION_ASSUMPTIONS.walkingSpeedKmH);
    setLoadingRate(DEFAULT_COLLECTION_ASSUMPTIONS.loadingRateKgPerMin);
    setSortingMins(DEFAULT_COLLECTION_ASSUMPTIONS.sortingMinsPerStop);
    setEfficiency(DEFAULT_COLLECTION_ASSUMPTIONS.collectionEfficiencyPct);
    setCartCapacity(DEFAULT_COLLECTION_ASSUMPTIONS.cartCapacityKg);
    setRates({ ...DEFAULT_SCRAP_RATES });
  };

  const handleSave = () => {
    onSaveAssumptions({
      walkingSpeedKmH: Number(walkingSpeed) || 3.8,
      loadingRateKgPerMin: Number(loadingRate) || 10,
      sortingMinsPerStop: Number(sortingMins) || 5,
      collectionEfficiencyPct: Number(efficiency) || 28,
      cartCapacityKg: Number(cartCapacity) || 150,
      scrapRates: rates,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t(lang, 'collectionAssumptionsTitle')}
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              These factors directly calibrate your walk times, per-stop loading estimates, sack capacity limits, and projected scrap revenue across Pune.
            </div>
          </div>

          {/* Core Numerical Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'walkingSpeed')}
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="8.0"
                value={walkingSpeed}
                onChange={(e) => setWalkingSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: 3.8 km/h loaded cart
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'loadingRate')}
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={loadingRate}
                onChange={(e) => setLoadingRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: 10 kg/min
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'sortingMins')}
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={sortingMins}
                onChange={(e) => setSortingMins(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: 5 minutes per stop
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'collectionEfficiency')}
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={efficiency}
                onChange={(e) => setEfficiency(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Default: 28% of daily spot potential
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'cartCapacity')}
              </label>
              <input
                type="number"
                min="30"
                max="500"
                value={cartCapacity}
                onChange={(e) => setCartCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Default: 150 kg maximum capacity before warning cap
              </span>
            </div>
          </div>

          {/* Recyclables Scrap Rates Table */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t(lang, 'scrapRateTable')}
              </span>
              <span className="text-[10px] text-slate-400">
                Official SWaCH / Pune market rates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SHARED_WASTE_TYPES.map((mat) => (
                <div
                  key={mat}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate mr-2">
                    {mat}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={rates[mat] || 15}
                      onChange={(e) => handleRateChange(mat, Number(e.target.value))}
                      className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t(lang, 'resetAssumptions')}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold min-h-[44px] cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t(lang, 'saveAssumptions')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
