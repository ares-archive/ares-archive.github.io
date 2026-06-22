import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Monitor, Apple, Terminal } from 'lucide-react';
import { Game } from '../types/game';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
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
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {game.platforms.includes('windows') && <Monitor className="w-3.5 h-3.5 text-gray-400" />}
            {game.platforms.includes('mac') && <Apple className="w-3.5 h-3.5 text-gray-400" />}
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="font-black text-xl text-white group-hover:text-brand-azure transition-colors mb-2 tracking-tight">
            {game.title}
          </h3>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
            {game.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black px-2 py-1 bg-brand-border rounded text-gray-400 uppercase tracking-widest">
              {game.releaseDate}
            </span>
            
            <div className="flex items-center gap-2 text-brand-azure font-bold text-sm">
              <Download className="w-4 h-4" />
              <span>GET</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
