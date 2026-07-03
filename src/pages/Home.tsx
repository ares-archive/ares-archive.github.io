import React, { useState, useEffect } from 'react';
import { GameCard } from '../components/GameCard';
import { supabase } from '../supabase'; 
import { Game } from '../types/game';
import { Filter, ChevronDown, Loader2, Sparkles, FolderArchive, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HomeProps {
  searchQuery: string;
}

// Icona ufficiale di Discord
const DiscordIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className, style, ...props }) => (
  <img
    src="/discord.png"
    alt="Discord"
    className={`object-contain ${className || ''}`.trim()}
    style={style}
    {...props}
  />
);

// Icona ufficiale di Ko-fi
const KofiIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className, style, ...props }) => (
  <img
    src="/kofi.png"
    alt="Ko-fi"
    className={`object-contain ${className || ''}`.trim()}
    style={style}
    {...props}
  />
);

const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const { t, lang } = useLanguage();

  const [visibleLimit, setVisibleLimit] = useState(24);

  // Mappatura generi italiano -> inglese per normalizzazione
  const normalizeGenre = (genre: string): string => {
    const genreMap: { [key: string]: string } = {
      'Azione': 'Action',
      'Avventura': 'Adventure',
      'RPG': 'RPG',
      'Indie': 'Indie',
      'Strategia': 'Strategy',
      'Action': 'Action',
      'Adventure': 'Adventure',
      'Strategy': 'Strategy'
    };
    return genreMap[genre] || genre;
  };

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
        const userLang = lang;

        const mappedGames: Game[] = data.map(dbGame => {
          const title = 
            (userLang === 'it' && (dbGame as any).title_it) ? (dbGame as any).title_it : 
            ((userLang as string) === 'es' && (dbGame as any).title_es) ? (dbGame as any).title_es : 
            dbGame.title;

          const description = 
            (userLang === 'it' && (dbGame as any).description_it) ? (dbGame as any).description_it : 
            ((userLang as string) === 'es' && (dbGame as any).description_es) ? (dbGame as any).description_es : 
            dbGame.description;

          // Se non c'è una data nel database, il valore di fallback diventa automaticamente "TBA"
          const formattedReleaseDate = dbGame.release_date
            ? new Date(dbGame.release_date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'TBA';

          return {
            id: dbGame.id.toString(),
            title: title || '',
            description: description || '',
            developer: dbGame.developer || '',
            buzzheavierLink: dbGame.pearcrypt_url || dbGame.buzzheavier_url || '',
            bannerImage: dbGame.banner_url || '',
            videoUrl: dbGame.video_url || '',
            steamScreenshots: dbGame.screenshots || [],
            isUpcoming: dbGame.is_upcoming || false,
            steamUrl: dbGame.steam_url || '',
            gogUrl: dbGame.gog_url || '',
            epicUrl: dbGame.epic_url || '',
            goldbergUrl: dbGame.goldberg_url || '',
            minimumRequirements: dbGame.minimum_requirements || '',
            recommendedRequirements: dbGame.recommended_requirements || '',
            crackedBy: dbGame.cracked_by || '',
            tags: ['New'],
            genres: dbGame.genre ? [dbGame.genre] : [],
            platforms: ['windows'],
            releaseDate: formattedReleaseDate,
          };
        });
        
        setGames(mappedGames);
      }
      setLoading(false);
    };
    fetchGames();
  }, [lang]);

  const archivedGames = games.filter(game => !game.isUpcoming && game.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const upcomingGames = games.filter(game => game.isUpcoming && game.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredArchivedGames = archivedGames.filter(game => {
    if (activeFilter === 'All') return true;
    const normalizedFilter = normalizeGenre(activeFilter);
    return game.genres?.some(genre => normalizeGenre(genre) === normalizedFilter);
  });

  const displayedArchivedGames = filteredArchivedGames.slice(0, visibleLimit);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-azure animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">{t('home.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2 flex items-center gap-2">
            <FolderArchive className="w-8 h-8 text-brand-azure" />
            {t('home.title')}
          </h1>
          <p className="text-gray-400">{t('home.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-card border border-brand-border rounded-lg text-sm hover:border-brand-azure transition-colors text-white">
              <Filter className="w-4 h-4" />
              <span>{t('home.genreLabel')}: {t(`home.genres.${activeFilter}`)}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-brand-card border border-brand-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {['All', 'Action', 'Adventure', 'RPG', 'Indie', 'Strategy'].map(genre => (
                <button
                  key={genre}
                  onClick={() => setActiveFilter(genre)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-brand-azure hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg text-gray-300"
                >
                  {t(`home.genres.${genre}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Promo & Support Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Discord Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#5865F2]/10 via-[#5865F2]/5 to-transparent border border-brand-border rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-[#5865F2] rounded-full blur-[60px] opacity-20 pointer-events-none" />
          
          <div className="flex items-start gap-4 z-[1]">
            <div className="p-3 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-xl shrink-0">
              <DiscordIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                {t('home.discordCardTitle')}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('home.discordCardDesc')}
              </p>
            </div>
          </div>

          <div className="z-[1]">
            <a
              href="https://discord.gg/sqkxTDqqBj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/30 transform hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              {/* Filtro drop-shadow applicato ai contorni trasparenti del PNG */}
              <DiscordIcon 
                className="w-4 h-4" 
                style={{ filter: 'drop-shadow(1px 0px 0px black) drop-shadow(-1px 0px 0px black) drop-shadow(0px 1px 0px black) drop-shadow(0px -1px 0px black)' }} 
              />
              {t('home.discordCardCta')}
            </a>
          </div>
        </div>

        {/* Ko-fi Support Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#FF5E5B]/10 via-[#FF5E5B]/5 to-transparent border border-brand-border rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-[#FF5E5B] rounded-full blur-[60px] opacity-20 pointer-events-none" />
          
          <div className="flex items-start gap-4 z-[1]">
            <div className="p-3 bg-[#FF5E5B]/10 border border-[#FF5E5B]/20 rounded-xl shrink-0">
              <KofiIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                {t('home.kofiCardTitle')}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('home.kofiCardDesc')}
              </p>
            </div>
          </div>

          <div className="z-[1]">
            <a
              href="https://ko-fi.com/aresarchive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 bg-[#FF5E5B] hover:bg-[#e04f4c] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#FF5E5B]/20 hover:shadow-[#FF5E5B]/30 transform hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              <KofiIcon className="w-3.5 h-3.5" />
              {t('home.kofiCardCta')}
            </a>
          </div>
        </div>
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
                {t('home.loadMore')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 bg-brand-card rounded-2xl border border-dashed border-brand-border">
          <p className="text-gray-400 text-sm">{t('home.noResults')}</p>
        </div>
      )}

      {upcomingGames.length > 0 && (
        <div className="mt-20 pt-12 border-t border-brand-border">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-brand-azure animate-pulse" />
              {t('home.upcomingTitle')}
            </h2>
            <p className="text-gray-400">{t('home.upcomingSubtitle')}</p>
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