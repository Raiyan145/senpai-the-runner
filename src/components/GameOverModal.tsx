import React from 'react';
import { WorldTheme } from '../types/game';

interface GameOverModalProps {
  distance: number;
  coins: number;
  bestDistance: number;
  world: WorldTheme;
  isNewBest: boolean;
  onRunAgain: () => void;
  onMainMenu: () => void;
  onOpenMissions: () => void;
  onOpenWardrobe: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  distance,
  coins,
  bestDistance,
  world,
  isNewBest,
  onRunAgain,
  onMainMenu,
  onOpenMissions,
  onOpenWardrobe,
}) => {
  const worldNames: Record<WorldTheme, string> = {
    jungle: 'Ancient Jungle',
    garden: 'Blossom Garden',
    sky: 'Sky Ruins',
    temple: 'Moonlit Temple',
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-40 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-rose-500/80 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.35)] flex flex-col items-center text-center">
        {/* Heart Rings Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
          <span>♥</span> CAUGHT BY KIKI! <span>♥</span>
        </div>

        <h2 className="font-anime font-extrabold text-3xl sm:text-4xl text-white tracking-tight drop-shadow">
          WEDDING TIME! 💍
        </h2>

        {/* Narrative Ending Line */}
        <div className="my-3 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-sm sm:text-base font-semibold italic">
          “You're not running away anymore. I'm going to marry you now! ♥”
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Distance</span>
            <span className="font-anime font-extrabold text-2xl text-sky-400 tabular-nums">
              {distance} m
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coins Pocketed</span>
            <span className="font-anime font-extrabold text-2xl text-amber-300 tabular-nums flex items-center gap-1">
              <span>+{coins}</span>
              <span className="text-sm">🪙</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Best Record</span>
            <span className="font-anime font-extrabold text-2xl text-emerald-400 tabular-nums">
              {bestDistance} m
            </span>
            {isNewBest && (
              <span className="text-[10px] text-amber-400 font-extrabold uppercase animate-pulse">
                ★ NEW RECORD! ★
              </span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">World Reached</span>
            <span className="font-anime font-extrabold text-sm sm:text-base text-purple-300 mt-1">
              {worldNames[world]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            data-start="true"
            onClick={onRunAgain}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-anime font-extrabold text-xl shadow-lg active:scale-98 transition cursor-pointer border-2 border-white/30"
          >
            RUN AGAIN 🏃💨
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenMissions}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-anime font-bold text-sm border border-slate-700 transition cursor-pointer"
            >
              🎯 Missions
            </button>
            <button
              onClick={onOpenWardrobe}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-anime font-bold text-sm border border-slate-700 transition cursor-pointer"
            >
              👘 Wardrobe
            </button>
          </div>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-anime font-bold text-sm border border-slate-700 transition cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
