import React from 'react';
import { X, BookOpen, Terminal, CheckCircle2, ShieldCheck, HeartHandshake, Compass } from 'lucide-react';

interface SetupGuideModalProps {
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm leading-tight">
                Beginner Setup & Run Guide
              </h3>
              <p className="text-[11px] text-slate-300">
                100% Free Tools · No API keys · No Paid Subscriptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1: Quick Run */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>1. How to Run Locally (Beginner Friendly)</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              This app is self-contained and requires no backend database or external keys. Follow these two simple terminal commands:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1 overflow-x-auto">
              <div className="text-slate-400"># Step 1: Install all packages</div>
              <div className="text-emerald-400">npm install</div>
              <div className="text-slate-400 pt-2"># Step 2: Start the local development server</div>
              <div className="text-emerald-400">npm run dev</div>
            </div>
            <p className="text-[11px] text-slate-500">
              Open your browser at <code className="font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded">http://localhost:3000</code>. That is it!
            </p>
          </div>

          {/* Section 2: Zero Paid Dependencies */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. 100% Free Tools & Services Used</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  OpenStreetMap (OSM)
                </span>
                <span className="text-[11px] text-slate-500">
                  Global crowdsourced street cartography. Free map tiles, no Google billing account or credit card required.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  OSRM Walking Router
                </span>
                <span className="text-[11px] text-slate-500">
                  Open Source Routing Machine (OSRM) foot-routing API for pedestrian street paths and turn-by-turn walking steps.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Leaflet.js Map Library
                </span>
                <span className="text-[11px] text-slate-500">
                  Lightweight, open-source JavaScript map engine with zero tracking and smooth interactive vector markers.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  WhatsApp Direct Protocol
                </span>
                <span className="text-[11px] text-slate-500">
                  Standard browser <code className="font-mono">wa.me</code> deep links for mobile sharing. Zero cost, no third-party SMS gateway.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Formula Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>3. How Waste Potential Scoring Works</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Each Pune locality is evaluated on four weighted factors to prioritize routes that maximize scrap earnings per kilometer walked:
            </p>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-600 dark:text-slate-400">
              <li>
                <b>Commercial Density (40%):</b> High retail, cafe, and wholesale activity generates high-value cardboard boxes, beverage cans, and scrap metals.
              </li>
              <li>
                <b>Population Density (30%):</b> High-density residential societies generate continuous streams of dry paper, plastics, and milk pouches.
              </li>
              <li>
                <b>Events & Footfall (20%):</b> Weekly vegetable mandis, college fests, transit hubs, and festivals produce concentrated surges of PET bottles and containers.
              </li>
              <li>
                <b>Ground Feedback (10%):</b> Direct verification submitted by SWaCH waste collectors updates reliability scores continuously.
              </li>
            </ul>
          </div>

          {/* Section 4: Pune Cooperative Impact */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
            <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px]">
              <span className="font-bold text-xs block">
                Empowering Pune's Waste Pickers (SWaCH & KKPKP)
              </span>
              <p>
                Pune is world-renowned for its pioneering waste-picker cooperative SWaCH (Solid Waste Collection and Handling) and KKPKP trade union. By providing walking-optimized itineraries directly to smartphones via WhatsApp in Marathi and English, pickers avoid unnecessary backtracking, reduce heavy pushcart strain, and secure maximum scrap returns.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Got it, Let's Explore Pune!
          </button>
        </div>
      </div>
    </div>
  );
};
