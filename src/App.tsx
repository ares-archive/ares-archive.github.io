import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { useLanguage } from './i18n/LanguageContext';
import { useBackgroundTheme } from './theme/BackgroundThemeContext';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabase';

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

  // User-Agent detection to block bots
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    // List of known bot user agents
    const botPatterns = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /crawler/i,
      /spider/i,
      /bot/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /perl/i,
      /ruby/i,
      /php/i,
      /http/i,
      /scan/i,
      /crawl/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /puppeteer/i,
      /playwright/i,
      /aws/i,
      /azure/i,
      /cloudflare/i,
      /lighthouse/i,
      /page-speed/i,
      /insights/i,
      /monitor/i,
      /audit/i,
      /test/i,
      /check/i,
      /validate/i,
      /verify/i,
      /analyze/i,
      /measure/i,
      /optimize/i,
      /performance/i,
      /seo/i,
      /index/i,
      /archive/i,
      /wayback/i,
      /snapshot/i,
      /cache/i,
      /proxy/i,
      /vpn/i,
      /tor/i,
      /anonymous/i,
      /private/i,
      /incognito/i,
      /stealth/i,
      /ghost/i,
      /hidden/i,
      /secret/i,
      /invisible/i,
      /undetectable/i,
      /untraceable/i
    ];

    const isBot = botPatterns.some(pattern => pattern.test(userAgent));

    if (isBot) {
      // Redirect to a blank page or show access denied
      document.body.innerHTML = '<h1 style="color: white; text-align: center; margin-top: 50vh;">Access Denied</h1>';
      window.location.href = 'about:blank';
    }
  }, []);

  // Anti-preloading and external script protection
  useEffect(() => {
    // Block external script injection
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(document, tagName);

      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name: string, value: string) {
          if (name.toLowerCase() === 'src') {
            // Block external scripts that are not from trusted domains
            const trustedDomains = [
              window.location.hostname,
              'cdn.jsdelivr.net',
              'unpkg.com',
              'cdnjs.cloudflare.com'
            ];

            try {
              const url = new URL(value, window.location.href);
              const isTrusted = trustedDomains.some(domain => url.hostname.includes(domain));

              if (!isTrusted) {
                console.warn('Blocked external script:', value);
                return;
              }
            } catch {
              console.warn('Blocked invalid script URL:', value);
              return;
            }
          }
          return originalSetAttribute.call(this, name, value);
        };
      }

      return element;
    };

    // Block DOM manipulation from external sources
    const originalInsertBefore = Node.prototype.insertBefore;
    // @ts-ignore - Intentionally overriding native API for security
    Node.prototype.insertBefore = function(newNode: Node, referenceNode: Node | null) {
      if (newNode instanceof HTMLScriptElement) {
        const src = newNode.getAttribute('src');
        if (src && !src.startsWith(window.location.origin)) {
          console.warn('Blocked external script insertion:', src);
          return this as Node;
        }
      }
      return originalInsertBefore.call(this, newNode, referenceNode);
    };

    // Block eval and Function constructor
    const originalEval = window.eval;
    window.eval = function(_code: string) {
      console.warn('Blocked eval() call');
      throw new Error('eval() is disabled');
    };

    // Block Function constructor (simplified to avoid type errors)
    const originalFunction = window.Function;
    // @ts-ignore - Intentionally overriding Function constructor
    window.Function = function() {
      console.warn('Blocked Function() constructor');
      throw new Error('Function() constructor is disabled');
    };

    // Monitor for suspicious DOM modifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check for injected scripts or iframes
            if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
              const src = (node as HTMLScriptElement | HTMLIFrameElement).getAttribute('src');
              if (src && !src.startsWith(window.location.origin)) {
                console.warn('Blocked injected external element:', src);
                node.remove();
              }
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return () => {
      document.createElement = originalCreateElement;
      Node.prototype.insertBefore = originalInsertBefore;
      window.eval = originalEval;
      window.Function = originalFunction;
      observer.disconnect();
    };
  }, []);

  // IP tracking and blocking system
  useEffect(() => {
    const trackAndBlockIP = async () => {
      try {
        // Get real IP using multiple services for accuracy
        const ipServices = [
          'https://api.ipify.org?format=json',
          'https://api.ipify.org',
          'https://ipapi.co/json/',
          'https://ip-api.com/json/'
        ];

        let realIP = '';
        for (const service of ipServices) {
          try {
            const response = await fetch(service);
            const data = await response.json();
            
            if (data.ip) {
              realIP = data.ip;
              break;
            }
          } catch {
            continue;
          }
        }

        if (!realIP) {
          console.warn('Could not determine real IP');
          return;
        }

        // Check if IP is blocked in localStorage (client-side check)
        const blockedIPs = JSON.parse(localStorage.getItem('ares_blocked_ips') || '[]');
        if (blockedIPs.includes(realIP)) {
          document.body.innerHTML = '<h1 style="color: white; text-align: center; margin-top: 50vh;">Access Denied</h1>';
          window.location.href = 'about:blank';
          return;
        }

        // Track IP activity in localStorage (rate limiting per IP)
        const ipActivity = JSON.parse(localStorage.getItem('ares_ip_activity') || '{}');
        const now = Date.now();
        
        if (!ipActivity[realIP]) {
          ipActivity[realIP] = { count: 0, firstSeen: now, lastSeen: now };
        }
        
        ipActivity[realIP].count++;
        ipActivity[realIP].lastSeen = now;
        
        // Auto-block if too many requests in short time (spam detection)
        const timeWindow = 60000; // 1 minute
        const maxRequests = 100; // Max 100 requests per minute
        
        if (ipActivity[realIP].count > maxRequests && (now - ipActivity[realIP].firstSeen) < timeWindow) {
          blockedIPs.push(realIP);
          localStorage.setItem('ares_blocked_ips', JSON.stringify(blockedIPs));
          
          // Log to console for Supabase tracking (would be sent to backend in production)
          console.warn('IP blocked due to spam:', realIP);
          
          document.body.innerHTML = '<h1 style="color: white; text-align: center; margin-top: 50vh;">Access Denied - Too Many Requests</h1>';
          window.location.href = 'about:blank';
          return;
        }
        
        localStorage.setItem('ares_ip_activity', JSON.stringify(ipActivity));

        // Send IP info to Supabase for tracking
        const userStr = localStorage.getItem('ares_discord_user');
        const userId = userStr ? JSON.parse(userStr).id : null;
        const userAgent = navigator.userAgent;

        try {
          // Check if IP already exists in database
          const { data: existingIP } = await supabase
            .from('ip_tracking')
            .select('id, request_count, is_blocked')
            .eq('ip_address', realIP)
            .single();

          if (existingIP) {
            // Update existing IP record
            if (existingIP.is_blocked) {
              // IP is already blocked, deny access
              document.body.innerHTML = '<h1 style="color: white; text-align: center; margin-top: 50vh;">Access Denied - IP Blocked</h1>';
              window.location.href = 'about:blank';
              return;
            }

            // Update request count and last seen
            await supabase
              .from('ip_tracking')
              .update({
                request_count: existingIP.request_count + 1,
                last_seen: new Date().toISOString(),
                user_agent: userAgent,
                user_id: userId
              })
              .eq('id', existingIP.id);
          } else {
            // Insert new IP record
            await supabase
              .from('ip_tracking')
              .insert({
                ip_address: realIP,
                user_id: userId,
                request_count: 1,
                user_agent: userAgent,
                metadata: {
                  first_request: new Date().toISOString()
                }
              });
          }
        } catch (error) {
          console.error('Error saving IP to Supabase:', error);
          // Continue even if Supabase fails, localStorage still works
        }
        
      } catch (error) {
        console.error('Error tracking IP:', error);
      }
    };

    trackAndBlockIP();
  }, []);

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

    // Debugger detection using timing attack
    const detectDebugger = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        console.clear();
        window.location.reload();
      }
    };

    // Periodic checks for protection bypass
    const checkProtections = () => {
      // Re-apply CSS protections
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';

      // Check if debugger is detected
      detectDebugger();
    };

    // Run checks periodically
    const protectionInterval = setInterval(checkProtections, 1000);

    // Initial debugger check
    detectDebugger();

    return () => {
      document.removeEventListener('keydown', preventDevTools, true);
      document.removeEventListener('contextmenu', preventRightClick, true);
      document.removeEventListener('dragstart', preventDrag, true);
      document.removeEventListener('drop', preventDrag, true);
      clearInterval(protectionInterval);
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