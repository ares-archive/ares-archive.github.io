import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

interface LanguageSelectorProps {
  isDark: boolean;
}

const OPTIONS: { code: Language; flag: string; label: string }[] = [
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isDark }) => {
  const { lang, setLang } = useLanguage();
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

  const current = OPTIONS.find(o => o.code === lang) || OPTIONS[1];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors',
          isDark
            ? 'border-brand-border hover:border-brand-azure/50 text-gray-300 hover:text-white bg-brand-card/60'
            : 'border-gray-200 hover:border-brand-azure/40 text-brand-dark bg-white/60'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 opacity-70" />
        <span>{current.flag}</span>
        <span className="hidden md:inline">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div
          className={clsx(
            'absolute right-0 top-full mt-2 w-40 rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-fade-in',
            isDark ? 'bg-brand-card/95 border-brand-border' : 'bg-white/95 border-gray-200'
          )}
          role="listbox"
        >
          {OPTIONS.map(opt => (
            <button
              key={opt.code}
              onClick={() => {
                setLang(opt.code);
                setOpen(false);
              }}
              role="option"
              aria-selected={opt.code === lang}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors',
                opt.code === lang
                  ? 'bg-brand-azure/15 text-brand-azure'
                  : isDark
                  ? 'text-gray-300 hover:bg-white/5'
                  : 'text-brand-dark hover:bg-black/5'
              )}
            >
              <span className="text-base">{opt.flag}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
