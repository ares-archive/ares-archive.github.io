import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './i18n/LanguageContext';
import { BackgroundThemeProvider } from './theme/BackgroundThemeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BackgroundThemeProvider>
        <App />
      </BackgroundThemeProvider>
    </LanguageProvider>
  </StrictMode>,
);
