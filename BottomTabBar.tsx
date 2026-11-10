import React from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Home, MapPin, Navigation, ListFilter, MessageSquareText } from 'lucide-react';

export type TabKey = 'dashboard' | 'map' | 'router' | 'directory' | 'feedback';

interface BottomTabBarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  lang: Language;
  selectedStopsCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  selectedStopsCount,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: t(lang, 'tabHome'), icon: <Home className="w-5 h-5" /> },
    { key: 'map', label: t(lang, 'tabMap'), icon: <MapPin className="w-5 h-5" /> },
    {
      key: 'router',
      label: t(lang, 'tabRoute'),
      icon: <Navigation className="w-5 h-5" />,
      badge: selectedStopsCount > 0 ? selectedStopsCount : undefined,
    },
    { key: 'directory', label: t(lang, 'tabSpots'), icon: <ListFilter className="w-5 h-5" /> },
    { key: 'feedback', label: t(lang, 'tabFeedback'), icon: <MessageSquareText className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-mono font-bold leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[12px] sm:text-xs tracking-tight mt-1 truncate max-w-[68px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
