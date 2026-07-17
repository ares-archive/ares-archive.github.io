import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Dice1, ArrowRight } from 'lucide-react';
import { Game } from '../types/game';

interface RandomGameWidgetProps {
  games: Game[];
}

const ROULETTE_DURATION = 1000; // ms
const TICK_INTERVAL = 70; // ms

const RandomGameWidget: React.FC<RandomGameWidgetProps> = ({ games }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [rouletteTitle, setRouletteTitle] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickRandomGame = useCallback((): Game => {
    const archivedGames = games.filter(g => !g.isUpcoming);
    if (archivedGames.length === 0) return games[0];
    return archivedGames[Math.floor(Math.random() * archivedGames.length)];
  }, [games]);

  const startRoulette = useCallback(() => {
    if (isSpinning || games.length === 0) return;

    // Reset state
    setSelectedGame(null);
    setIsSpinning(true);

    // Roulette: cycle through random titles
    let tickCount = 0;
    const totalTicks = Math.floor(ROULETTE_DURATION / TICK_INTERVAL);

    intervalRef.current = setInterval(() => {
      tickCount++;
      const randomGame = pickRandomGame();
      setRouletteTitle(randomGame.title);

      if (tickCount >= totalTicks) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;

        // Land on final pick
        const finalPick = pickRandomGame();
        setRouletteTitle(finalPick.title);
        setSelectedGame(finalPick);
        setIsSpinning(false);
      }
    }, TICK_INTERVAL);
  }, [isSpinning, games, pickRandomGame]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (games.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-azure/10 via-brand-azure/5 to-transparent border border-brand-border rounded-2xl p-6 flex flex-col justify-between gap-6">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-brand-azure rounded-full blur-[60px] opacity-20 pointer-events-none" />

      <div className="flex items-start gap-4 z-[1]">
        <div className="p-3 bg-brand-azure/10 border border-brand-azure/20 rounded-xl shrink-0">
          <Dice1 className="w-6 h-6 text-brand-azure" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white mb-1">
            Random Pick
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Let fate decide your next game from the archive.
          </p>
        </div>
      </div>

      <div className="z-[1] space-y-4">
        {/* Roulette / Result Area */}
        <AnimatePresence mode="wait">
          {selectedGame ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-brand-dark/60 border border-brand-azure/20 rounded-xl overflow-hidden group"
            >
              <Link to={`/game/${selectedGame.id}`} className="block">
                <div className="flex gap-3 p-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-brand-border">
                    <img
                      src={selectedGame.bannerImage || 'https://via.placeholder.com/64'}
                      alt={selectedGame.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white group-hover:text-brand-azure transition-colors truncate">
                      {selectedGame.title}
                    </h3>
                    {selectedGame.developer && (
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
                        {selectedGame.developer}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      {selectedGame.genres && selectedGame.genres.length > 0 && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-brand-azure/10 text-brand-azure rounded uppercase tracking-wider">
                          {selectedGame.genres[0]}
                        </span>
                      )}
                      <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">
                        {selectedGame.releaseDate}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-brand-azure opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="roulette"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isSpinning ? (
                <div className="bg-brand-dark/60 border border-brand-azure/30 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Shuffle className="w-5 h-5 text-brand-azure animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-azure truncate animate-pulse">
                        {rouletteTitle}
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        Searching archives...
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <button
          onClick={startRoulette}
          disabled={isSpinning}
          className="inline-flex items-center justify-center w-full gap-2 px-5 py-2.5 bg-brand-azure hover:bg-brand-azure/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-azure/20 hover:shadow-brand-azure/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'Rolling...' : selectedGame ? 'Roll Again' : 'Recommend a Game'}
        </button>
      </div>
    </div>
  );
};

export default RandomGameWidget;