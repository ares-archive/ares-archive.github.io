import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';
import { supabase } from '../supabase';

import { Session } from '@supabase/supabase-js';

interface DiscordUser {
  id: string;
  username: string;
  globalName: string;
  avatar: string;
}

interface HeaderProps {
  onSearch: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

// Funzione helper sicura per rilevare l'account di sviluppo autorizzato
const checkIsDeveloper = (user: DiscordUser | null): boolean => {
  if (!user) return false;
  
  const username = (user.username || '').toLowerCase().trim();
  const globalName = (user.globalName || '').toLowerCase().trim();
  
  // Lista di sviluppatori autorizzati (username unico o global display name)
  const allowedDevs = [
    "il dente proibito", "ildenteproibito",
    "shadoweddyx12",
    "🥏lukinok🥏", "lukinok"
  ];
  
  return allowedDevs.includes(username) || allowedDevs.includes(globalName);
};

const HeaderComponent: React.FC<HeaderProps> = ({ onSearch, isDark, onToggleTheme }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);

  useEffect(() => {
    const handleAuthChange = (session: Session | null) => {
      if (session?.user && session.user.app_metadata?.provider === 'discord') {
        const metadata = session.user.user_metadata;
        const mappedUser = {
          id: session.user.id,
          username: metadata.preferred_username || metadata.name || '',
          globalName: metadata.full_name || metadata.name || metadata.preferred_username || '',
          avatar: metadata.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'
        };
        localStorage.setItem('ares_discord_user', JSON.stringify(mappedUser));
        setDiscordUser(mappedUser);
      } else {
        const customUser = localStorage.getItem('ares_discord_user');
        if (customUser) {
          setDiscordUser(JSON.parse(customUser));
        } else {
          setDiscordUser(null);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    const loadUser = () => {
      const user = localStorage.getItem('ares_discord_user');
      if (user) {
        setDiscordUser(JSON.parse(user));
      } else {
        setDiscordUser(null);
      }
    };

    window.addEventListener('ares-discord-login', loadUser);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('ares-discord-login', loadUser);
    };
  }, []);

  const handleDiscordConnect = useCallback(() => {
    supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin
      }
    }).catch((err) => {
      console.error("Supabase sign in error:", err);
    });
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    localStorage.removeItem('ares_discord_user');
    localStorage.removeItem('ares_admin_token');
    setDiscordUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <header className={clsx(
      "sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300",
      isDark ? "bg-brand-dark/90 border-brand-border text-white" : "bg-white/90 border-gray-200 text-brand-dark"
    )}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <span className={clsx(
            "text-3xl font-black tracking-tighter italic transition-colors",
            isDark ? "text-white" : "text-brand-dark"
          )}>
            ARES
          </span>
        </Link>

        {/* Barra di ricerca animata con motion.div */}
        <motion.div 
          initial={{ width: '384px' }}
          whileHover={{ width: '512px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative hidden sm:block"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            onChange={(e) => onSearch(e.target.value)}
            className={clsx(
              "w-full border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 transition-all",
              isDark 
                ? "bg-brand-card border-brand-border text-white placeholder:text-gray-600 focus:ring-brand-azure/50" 
                : "bg-gray-50 border-gray-200 text-brand-dark placeholder:text-gray-400 focus:ring-brand-azure/30"
            )}
          />
        </motion.div>

        <nav className="flex items-center gap-2 md:gap-6">
          <ThemeSelector isDark={isDark} />
          <LanguageSelector isDark={isDark} />

          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-brand-dark" />}
          </button>

          <Link to="/about" className="text-sm font-semibold hover:text-brand-azure transition-colors opacity-70 hidden md:block">{t('header.about')}</Link>
          
          {/* Link Requests */}
          <Link to="/requests" className="text-sm font-semibold hover:text-brand-azure transition-colors opacity-70 hidden md:block">{t('header.requests')}</Link>
          
          {/* Link Hypervisor Crack aggiunto con lo stesso stile visivo */}
          <Link to="/hypervisor" className="text-sm font-semibold hover:text-brand-azure transition-colors opacity-70 hidden md:block">{t('header.hypervisor')}</Link>
          

          {discordUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-brand-border animate-fade-in">
              <img src={discordUser.avatar} className="w-8 h-8 rounded-full border border-brand-azure object-cover" alt="Avatar" />
              <span className="text-sm font-bold opacity-80 hidden md:inline">{discordUser.globalName}</span>
              
              {/* Badge "DEVELOPER" Esclusivo per te e i tuoi collaboratori autorizzati */}
              {checkIsDeveloper(discordUser) && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-brand-azure/20 border border-brand-azure/40 text-brand-azure rounded shadow-lg shadow-brand-azure/5 select-none shrink-0 hidden md:inline-block">
                  {t('header.developerBadge')}
                </span>
              )}
              
              <button onClick={handleLogout} className="opacity-60 hover:text-brand-red transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleDiscordConnect}
              className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-lg transition-all uppercase tracking-wider shadow-lg shadow-indigo-500/10"
            >
              <User className="w-4 h-4" />
              {t('header.connect')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export const Header = memo(HeaderComponent);