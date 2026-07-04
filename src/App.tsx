import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { useLanguage } from './i18n/LanguageContext';
import { useBackgroundTheme } from './theme/BackgroundThemeContext';
import { Loader2 } from 'lucide-react';

// Lazy loading delle pagine per ridurre il bundle iniziale
const Home = lazy(() => import('./pages/Home'));
const GameDetails = lazy(() => import('./pages/GameDetails'));
const About = lazy(() => import('./pages/About'));
const Legal = lazy(() => import('./pages/Legal'));
const Privacy = lazy(() => import('./pages/Privacy'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DiscordCallback = lazy(() => import('./pages/DiscordCallback'));
const Requests = lazy(() => import('./pages/Requests'));
const Hypervisor = lazy(() => import('./pages/Hypervisor'));

// Componente di loading per Suspense
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <Loader2 className="w-12 h-12 text-brand-azure animate-spin mb-4" />
    <p className="text-gray-400 animate-pulse">Loading...</p>
  </div>
);

function App() {
  const spaRedirect = new URLSearchParams(window.location.search).get('spa-redirect');
  if (spaRedirect) {
    window.history.replaceState(null, '', spaRedirect);
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ares_theme') !== 'light');
  const { t } = useLanguage();
  const { bgTheme } = useBackgroundTheme();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ares_theme', isDark ? 'dark' : 'light');

    // Anti-inspection protection
    const preventDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for dev tools
    document.addEventListener('keydown', preventDevTools, true);
    // Disable right-click
    document.addEventListener('contextmenu', preventRightClick, true);
    // Disable drag events
    document.addEventListener('dragstart', preventDrag, true);
    document.addEventListener('drop', preventDrag, true);

    // Disable text selection and copy via CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('keydown', preventDevTools, true);
      document.removeEventListener('contextmenu', preventRightClick, true);
      document.removeEventListener('dragstart', preventDrag, true);
      document.removeEventListener('drop', preventDrag, true);
    };
  }, [isDark]);

  return (
    // Rimosso il basename perché ora siamo sulla root del dominio di ares-archive
    <Router>
      <div className={`ares-bg-theme min-h-screen bg-brand-dark text-white selection:bg-brand-azure selection:text-white ${isDark ? 'theme-dark' : 'theme-light'}`} data-bg-theme={bgTheme}>
        <Header onSearch={setSearchQuery} isDark={isDark} onToggleTheme={() => setIsDark(value => !value)} />
        <main className="min-h-[80vh]">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/game/:id" element={<GameDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/discord-callback" element={<DiscordCallback />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/hypervisor" element={<Hypervisor />} />
            </Routes>
          </Suspense>
        </main>
        
        <footer className="border-t border-brand-border py-16 bg-brand-dark">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.dualite.app/122a7ac9-a3d4-45b9-922b-59a2e01416f6/asset-99cd15ba-c40b-47cc-a2b5-6f6a4576c289.webp" 
                  alt="ARES" 
                  className="w-8 h-8 opacity-50"
                />
                <span className="font-black text-gray-600 tracking-tighter">ARES ARCHIVE</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <Link to="/legal" className="hover:text-brand-azure transition-colors">{t('footer.legal')}</Link>
                <Link to="/privacy" className="hover:text-brand-azure transition-colors">{t('footer.privacy')}</Link>
                <Link to="/about" className="hover:text-brand-azure transition-colors">{t('footer.about')}</Link>
                <Link to="/requests" className="hover:text-brand-azure transition-colors">{t('footer.requests')}</Link>
                <Link to="/hypervisor" className="hover:text-brand-azure transition-colors">{t('footer.hypervisor')}</Link> {/* Nuovo link nel Footer */}
                <a 
                  href="https://discord.gg/sqkxTDqqBj" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#5865F2] transition-colors"
                >
                  {t('footer.discord')}
                </a>
                <a 
                  href="https://ko-fi.com/aresarchive" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#FF5E5B] transition-colors"
                >
                  {t('footer.kofi')}
                </a>
              </div>

              <p className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">
                {t('footer.est')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;