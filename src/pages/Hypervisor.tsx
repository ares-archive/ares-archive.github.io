import React, { useState, useEffect } from 'react';
import { GameCard } from '../components/GameCard';
import { supabase } from '../supabase'; 
import { Game } from '../types/game';
import { Shield, Loader2, Sparkles, Terminal, AlertCircle } from 'lucide-react';

const Hypervisor: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Errore nel recupero dei giochi Hypervisor:", error);
    } else if (data) {
      const userLang = localStorage.getItem('ares_lang') || 'en';

      const mappedGames: Game[] = data.map(dbGame => {
        const title = 
          (userLang === 'it' && (dbGame as any).title_it) ? (dbGame as any).title_it : 
          (userLang === 'es' && (dbGame as any).title_es) ? (dbGame as any).title_es : 
          dbGame.title;

        const description = 
          (userLang === 'it' && (dbGame as any).description_it) ? (dbGame as any).description_it : 
          (userLang === 'es' && (dbGame as any).description_es) ? (dbGame as any).description_es : 
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
          pearcryptLink: dbGame.pearcrypt_url || '',
          buzzheavierLink: dbGame.buzzheavier_url || dbGame.pearcrypt_url || '',
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
          genres: dbGame.genres || [], 
          platforms: ['windows'],
          releaseDate: formattedReleaseDate,
        };
      });
      
      // Filtra i giochi craccati dal team "DenuvOwO" (case-insensitive)
      const denuvowoList = mappedGames.filter(
        game => game.crackedBy?.toLowerCase() === 'denuvowo'
      );
      setGames(denuvowoList);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Separiamo i giochi rilasciati da quelli in arrivo (Upcoming)
  const releasedCracks = games.filter(game => !game.isUpcoming);
  const upcomingCracks = games.filter(game => game.isUpcoming);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-azure animate-spin mb-4" />
        <p className="text-gray-400 animate-pulse">Decrypting Hypervisor database...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Intestazione Sezione */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tight mb-3 flex items-center justify-center md:justify-start gap-3">
          <Terminal className="w-10 h-10 text-brand-azure" />
          Hypervisor Bypass Directory
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Dedicated archive showcasing all active bypasses, emulations, and upcoming projects completed by the DenuvOwO team.
        </p>
      </div>

      {/* SEZIONE 1: RELEASED CRACKS */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-brand-azure" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Released Bypasses & Cracks</h2>
        </div>

        {releasedCracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {releasedCracks.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-brand-card rounded-2xl border border-dashed border-brand-border">
            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No completed bypasses found in our archives.</p>
          </div>
        )}
      </section>

      {/* SEZIONE UPCOMING CRACKS */}
      {upcomingCracks.length > 0 && (
        <section className="mt-20 pt-12 border-t border-brand-border">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-brand-azure animate-pulse" />
              Upcoming Cracks & Projects
            </h2>
            <p className="text-gray-400">Most anticipated upcoming bypasses and decryption progress.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingCracks.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Hypervisor;