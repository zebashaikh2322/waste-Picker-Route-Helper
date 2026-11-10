import React from 'react';
import { DemoPicker, Language } from '../types';
import { t } from '../utils/translations';
import { Moon, Sun, Recycle, HelpCircle, LogOut } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  onSelectLang: (lang: Language) => void;
  activePicker: DemoPicker;
  onLogout: () => void;
  onOpenGuide: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onSelectLang,
  activePicker,
  onLogout,
  onOpenGuide,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Recycle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {t(lang, 'brandName')}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              {t(lang, 'tagline')}
            </p>
            <p className="sm:hidden max-w-48 truncate text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              {activePicker.name} ({activePicker.badgeId})
            </p>
          </div>
        </div>

        {/* Action Controls: User, Language, Guide, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="hidden sm:block text-right leading-tight">
            <p className="max-w-40 truncate text-xs font-bold text-slate-800 dark:text-slate-100">
              {activePicker.name} ({activePicker.badgeId})
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Signed in</p>
          </div>

          {/* Multilingual Switcher: English / मराठी / हिंदी */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onSelectLang('en')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors min-h-[36px] cursor-pointer ${
                lang === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSelectLang('mr')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors min-h-[36px] cursor-pointer ${
                lang === 'mr'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => onSelectLang('hi')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors min-h-[36px] cursor-pointer ${
                lang === 'hi'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Beginner Guide (?) Icon Button */}
          <button
            onClick={onOpenGuide}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Beginner Setup & Run Guide"
            aria-label="Beginner Guide"
          >
            <HelpCircle className="w-5 h-5 text-emerald-600" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onLogout}
            className="flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
