import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Game } from '../types/game';
import { supabase } from '../supabase';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('ares_discord_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
      checkFavorite(JSON.parse(userStr).id, game.id);
    }
  }, [game.id]);

  const checkFavorite = async (userId: string, gameId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', parseInt(gameId))
      .single();
    setIsFavorite(!!data);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Connect with Discord to save favorites');
      return;
    }

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('game_id', parseInt(game.id));
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert([{ user_id: currentUser.id, game_id: parseInt(game.id) }]);
      setIsFavorite(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-brand-card rounded-2xl overflow-hidden border border-brand-border hover:border-brand-azure/40 transition-all group shadow-xl"
    >
      <Link to={`/game/${game.id}`}>
        <div className="aspect-[16/9] overflow-hidden relative">
          <img
            src={game.bannerImage}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent opacity-60" />
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all z-10"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button>
        </div>
        
        <div className="p-5">
          <h3 className="font-black text-xl text-white group-hover:text-brand-azure transition-colors mb-2 tracking-tight">
            {game.title}
          </h3>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
            {game.description}
          </p>
          
          <div className="flex items-center">
            <span className="text-[10px] font-black px-2 py-1 bg-brand-border rounded text-gray-400 uppercase tracking-widest">
              {game.releaseDate}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};