import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface HeaderProps {
  onSearch: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, isDark, onToggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [discordUser, setDiscordUser] = useState<any>(null);
  const isAdmin = localStorage.getItem('ares_admin_token') === 'ares-secret-token';
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const loadUser = () => {
      const user = localStorage.getItem('ares_discord_user');
      if (user) setDiscordUser(JSON.parse(user));
    };

    loadUser();
    window.addEventListener('ares-discord-login', loadUser);

    return () => {
      window.removeEventListener('ares-discord-login', loadUser);
    };
  }, []);

  const handleDiscordConnect = () => {
    window.location.href = "https://discord.com/oauth2/authorize?client_id=1518053081919520799&response_type=code&redirect_uri=https%3A%2F%2Fares-archive.github.io%2Fdiscord-callback&scope=identify";
  };

  const handleLogout = () => {
    localStorage.removeItem('ares_discord_user');
    localStorage.removeItem('ares_admin_token');
    setDiscordUser(null);
    navigate('/');
  };

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
            placeholder="Search ARES database..."
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
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-brand-dark" />}
          </button>

          <Link to="/about" className="text-sm font-semibold hover:text-brand-azure transition-colors opacity-70 hidden md:block">About</Link>
          
          {/* Link Requests aggiunto con lo stesso stile visivo di About */}
          <Link to="/requests" className="text-sm font-semibold hover:text-brand-azure transition-colors opacity-70 hidden md:block">Requests</Link>
          
          {isAdmin && isAdminRoute && (
            <Link to="/admin" className="p-2 text-brand-azure hover:bg-brand-azure/10 rounded-lg transition-colors">
              <Shield className="w-5 h-5" />
            </Link>
          )}

          {discordUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-brand-border animate-fade-in">
              <img src={discordUser.avatar} className="w-8 h-8 rounded-full border border-brand-azure object-cover" alt="Avatar" />
              <span className="text-sm font-bold opacity-80 hidden md:inline">{discordUser.globalName}</span>
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
              Connect
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};