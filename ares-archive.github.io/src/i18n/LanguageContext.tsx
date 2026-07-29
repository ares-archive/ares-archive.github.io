import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language } from './translations';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string, vars?: Record<string, string | number>) => any;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'ares_lang';

const getInitialLang = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'it' || stored === 'en') return stored;
  // Rileva la lingua del browser come fallback iniziale
  const browserLang = navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en';
  return browserLang;
};

// Naviga un percorso puntato (es. "home.title") dentro all'oggetto delle traduzioni
const resolvePath = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

const interpolate = (str: string, vars?: Record<string, string | number>): string => {
  if (!vars) return str;
  return Object.keys(vars).reduce(
    (acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(vars[key])),
    str
  );
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    // Notifica altre parti dell'app (es. fetch dei giochi) che la lingua è cambiata
    window.dispatchEvent(new CustomEvent('ares-lang-change', { detail: lang }));
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const value = resolvePath(translations[lang], path) ?? resolvePath(translations.en, path);
      if (typeof value === 'string') return interpolate(value, vars);
      return value;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
