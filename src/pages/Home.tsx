import React, { useState, useEffect } from 'react';
import { GameCard } from '../components/GameCard';
import { supabase } from '../supabase'; 
import { Game } from '../types/game';
import { Filter, ChevronDown, Loader2, Sparkles, FolderArchive, ChevronRight } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
}

// Icona SVG ufficiale di Discord ottimizzata per l'uso inline in React
const DiscordIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 127.14 96.36"
    fill="currentColor"
    {...props}
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.71-1.32,2.51-2a75.52,75.52,0,0,0,73,0c.8.71,1.64,1.39,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,50.7,122.64,27.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [visibleLimit, setVisibleLimit] = useState(24);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error("Errore nel recupero dei giochi:", error);
      } else if (data) {
        // Recupera la lingua attiva nel browser dell'utente (di default 'en')
        const userLang = localStorage.getItem('ares_lang') || 'en';

        const mappedGames: Game[] = data.map(dbGame => {
          // Seleziona dinamicamente il titolo tradotto se presente in tabella, altrimenti usa l'originale
          const title = 
            (userLang === 'it' && (dbGame as any).title_it) ? (dbGame as any).title_it : 
            (userLang === 'es' && (dbGame as any).title_es) ? (dbGame as any).title_es : 
            dbGame.title;

          // Seleziona dinamicamente la descrizione tradotta se presente in tabella, altrimenti usa l'originale
          const description = 
            (userLang === 'it' && (dbGame as any).description_it) ? (dbGame as any).description_it : 
            (userLang === 'es' && (dbGame as any).description_es) ? (dbGame as any).description_es : 
            dbGame.description;

          return {
            id: dbGame.id.toString(),
            title: title || '',
            description: description || '',
            developer: dbGame.developer || '',
            pearcryptLink: dbGame.pearcrypt_url || '',
            bannerImage: dbGame.banner_url || '',
            videoUrl: dbGame.video_url || '',
            steamScreenshots: dbGame.screenshots || [],
            isUpcoming: dbGame.is_upcoming || false, 
            tags: ['New'],
            genres: dbGame.genres || [], 
            platforms: ['windows'],
            releaseDate: dbGame.release_date || dbGame.created_at || new Date().toLocaleDateString(),
          };
        });
        
        setGames(mappedGames);
      }
      setLoading(false);
    };
    fetchGames();
  }, []);

  const archivedGames = games.filter(game => !game.isUpcoming && game.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const upcomingGames = games.filter(game => game.isUpcoming && game.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredArchivedGames = archivedGames.filter(game => {
    if (activeFilter === 'All') return true;
    return game.genres?.includes(activeFilter);
  });

  const displayedArchivedGames = filteredArchivedGames.slice(0, visibleLimit);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-azure animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Accessing archives...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2 flex items-center gap-2">
            <FolderArchive className="w-8 h-8 text-brand-azure" />
            Preservation Database
          </h1>
          <p className="text-gray-400">Archiving digital history, one byte at a time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-card border border-brand-border rounded-lg text-sm hover:border-brand-azure transition-colors text-white">
              <Filter className="w-4 h-4" />
              <span>Genre: {activeFilter}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-brand-card border border-brand-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {['All', 'Action', 'Adventure', 'RPG', 'Indie', 'Strategy'].map(genre => (
                <button
                  key={genre}
                  onClick={() => setActiveFilter(genre)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-brand-azure hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg text-gray-300"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discord Promo Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#5865F2]/10 via-[#5865F2]/5 to-transparent border border-brand-border rounded-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#5865F2] rounded-full blur-[80px] opacity-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left z-[1]">
          <div className="p-4 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-xl text-[#5865F2] shrink-0">
            <DiscordIcon className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1">
              Join the ARES community
            </h2>
            <p className="text-sm text-gray-400 max-w-xl">
              Preserve digital history with us. Access saves and details for the newest titles, receive notifications on daily updates, and seamlessly link your account via OAuth2.
            </p>
          </div>
        </div>

        <a
          href="https://discord.gg/sqkxTDqqBj"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5865F2]/30 hover:shadow-[#5865F2]/40 transform hover:-translate-y-0.5 active:translate-y-0 text-center z-[1] whitespace-nowrap shrink-0"
        >
          <DiscordIcon className="w-4 h-4 fill-current" />
          Join Us Now
        </a>
      </div>

      {displayedArchivedGames.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedArchivedGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {filteredArchivedGames.length > visibleLimit && (
            <div className="flex justify-center mt-12">
              <button 
                onClick={() => setVisibleLimit(prev => prev + 12)} 
                className="flex items-center gap-2 px-6 py-3 bg-brand-card hover:bg-brand-azure/20 border border-brand-border hover:border-brand-azure text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest"
              >
                Load More Games
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 bg-brand-card rounded-2xl border border-dashed border-brand-border">
          <p className="text-gray-400 text-sm">No archived records found matching your criteria.</p>
        </div>
      )}

      {upcomingGames.length > 0 && (
        <div className="mt-20 pt-12 border-t border-brand-border">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-brand-azure animate-pulse" />
              Upcoming Games
            </h2>
            <p className="text-gray-400">Most anticipated contemporary releases and digital-only files.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;