import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Palette, Check } from 'lucide-react';
import { useBackgroundTheme, BG_THEMES } from '../theme/BackgroundThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface ThemeSelectorProps {
  isDark: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isDark }) => {
  const { bgTheme, setBgTheme } = useBackgroundTheme();
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = BG_THEMES.find(t2 => t2.id === bgTheme) || BG_THEMES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title={t('themePicker.label')}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border transition-colors',
          isDark
            ? 'border-brand-border hover:border-brand-azure/50 bg-brand-card/60'
            : 'border-gray-200 hover:border-brand-azure/40 bg-white/60'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Palette className="w-4 h-4" style={{ color: current.swatch }} />
      </button>

      {open && (
        <div
          className={clsx(
            'absolute right-0 top-full mt-2 w-56 rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-fade-in p-1.5',
            isDark ? 'bg-brand-card/95 border-brand-border' : 'bg-white/95 border-gray-200'
          )}
          role="listbox"
        >
          <div className={clsx('px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest', isDark ? 'text-gray-500' : 'text-gray-400')}>
            {t('themePicker.label')}
          </div>
          {BG_THEMES.map(themeOpt => (
            <button
              key={themeOpt.id}
              onClick={() => {
                setBgTheme(themeOpt.id);
                setOpen(false);
              }}
              role="option"
              aria-selected={themeOpt.id === bgTheme}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
                themeOpt.id === bgTheme
                  ? 'bg-brand-azure/15 text-brand-azure'
                  : isDark
                  ? 'text-gray-300 hover:bg-white/5'
                  : 'text-brand-dark hover:bg-black/5'
              )}
            >
              <span
                className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                style={{ background: themeOpt.swatch }}
              />
              <span className="flex-1 text-left">
                {lang === 'it' ? themeOpt.nameIt : themeOpt.nameEn}
              </span>
              {themeOpt.id === bgTheme && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
