import React, { createContext, useContext, useState, useEffect } from 'react';

// Temi di sfondo personalizzati per ARES Archive.
// Ogni tema applica una classe CSS al wrapper radice; gli stili sono
// definiti in index.css (vedi sezione "BACKGROUND THEMES").
export const BG_THEMES = [
  { id: 'ares-default', nameEn: 'ARES Default', nameIt: 'ARES Predefinito', swatch: '#050608' },
  { id: 'azure-grid', nameEn: 'Azure Grid', nameIt: 'Griglia Azzurra', swatch: '#007BFF' },
  { id: 'crimson-protocol', nameEn: 'Crimson Protocol', nameIt: 'Protocollo Cremisi', swatch: '#DC3545' },
  { id: 'emerald-terminal', nameEn: 'Emerald Terminal', nameIt: 'Terminale Smeraldo', swatch: '#28A745' },
  { id: 'nebula', nameEn: 'Nebula Violet', nameIt: 'Nebulosa Violetta', swatch: '#7c3aed' },
  { id: 'sunset-archive', nameEn: 'Sunset Archive', nameIt: 'Archivio al Tramonto', swatch: '#ff7849' },
] as const;

export type BgThemeId = typeof BG_THEMES[number]['id'];

interface BackgroundThemeContextValue {
  bgTheme: BgThemeId;
  setBgTheme: (id: BgThemeId) => void;
}

const BackgroundThemeContext = createContext<BackgroundThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'ares_bg_theme';

const getInitialTheme = (): BgThemeId => {
  if (typeof window === 'undefined') return 'ares-default';
  const stored = localStorage.getItem(STORAGE_KEY) as BgThemeId | null;
  if (stored && BG_THEMES.some(t => t.id === stored)) return stored;
  return 'ares-default';
};

export const BackgroundThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bgTheme, setBgThemeState] = useState<BgThemeId>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, bgTheme);
    document.documentElement.setAttribute('data-bg-theme', bgTheme);
  }, [bgTheme]);

  const setBgTheme = (id: BgThemeId) => setBgThemeState(id);

  return (
    <BackgroundThemeContext.Provider value={{ bgTheme, setBgTheme }}>
      {children}
    </BackgroundThemeContext.Provider>
  );
};

export const useBackgroundTheme = (): BackgroundThemeContextValue => {
  const ctx = useContext(BackgroundThemeContext);
  if (!ctx) throw new Error('useBackgroundTheme must be used within a BackgroundThemeProvider');
  return ctx;
};
