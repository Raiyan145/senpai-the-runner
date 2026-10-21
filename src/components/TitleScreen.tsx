import React from 'react';
import { GameMode, PlayerStats } from '../types/game';

interface TitleScreenProps {
  stats: PlayerStats;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStart: () => void;
  onOpenWardrobe: () => void;
  onOpenMissions: () => void;
  onOpenStory: () => void;
  onOpenDaily: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  stats,
  selectedMode,
  onSelectMode,
  onStart,
  onOpenWardrobe,
  onOpenMissions,
  onOpenStory,
  onOpenDaily,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-8 z-20">
      {/* Top Bar: Coin Bank & Quick Stats & Settings */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pointer-events-auto">
        {/* Coin Bank */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-lg">
          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center font-bold text-amber-950 text-xs shadow-inner">
            🪙
          </div>
          <span className="font-anime font-bold text-amber-300 text-lg tabular-nums">
            {stats.totalCoins}
          </span>
        </div>

        {/* Best Score Trophy */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-blue-500/40 shadow-lg">
          <span className="text-sm text-blue-400 font-semibold uppercase tracking-wider">Best:</span>
          <span className="font-anime font-bold text-white text-lg tabular-nums">
            {stats.bestDistance} m
          </span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
          aria-label="Game Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Center Hero Title Emblem Lockup */}
      <div className="flex flex-col items-center justify-center text-center my-auto pointer-events-auto select-none">
        {/* Anime Title Badge */}
        <div className="relative mb-2 animate-bounce duration-1000">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 text-xs font-bold tracking-widest uppercase">
            <span>♥</span> Romantic Comedy 3D Runner <span>♥</span>
          </div>
        </div>

        {/* Bespoke Title SVG / Lockup */}
        <h1 className="font-anime font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] flex flex-col items-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 text-stroke-md">
            SENPAI
          </span>
          <span className="text-2xl sm:text-3xl md:text-4xl text-rose-400 font-bold tracking-wider -mt-1 sm:-mt-2 drop-shadow-md flex items-center gap-2">
            THE ENDLESS CHASE <span className="text-xl">💍</span>
          </span>
        </h1>

        <p className="text-slate-200 text-sm sm:text-base font-medium max-w-md mt-3 drop-shadow bg-slate-950/60 px-4 py-1.5 rounded-xl border border-white/10">
          Kiki wants to marry Senpai! Sprint, dodge obstacles, and protect your bachelor freedom!
        </p>

        {/* Primary Start CTA Button */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            data-start="true"
            onClick={onStart}
            className="group relative px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white font-anime font-extrabold text-2xl sm:text-3xl shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:shadow-[0_0_35px_rgba(56,189,248,0.7)] transform active:scale-95 transition-all cursor-pointer border-2 border-white/40"
          >
            <span className="flex items-center gap-3">
              <span>ESCAPE NOW!</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">🏃‍♂️💨</span>
            </span>
          </button>
          <span className="text-xs text-slate-300 font-medium tracking-wide drop-shadow bg-slate-900/80 px-3 py-1 rounded-full">
            Press [Space] or [Enter] to Start
          </span>
        </div>
      </div>

      {/* Bottom Nav / Mode Strip */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3 pointer-events-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-900/90 border border-slate-700/80 p-1.5 sm:p-2 rounded-2xl shadow-2xl">
          <button
            onClick={() => {
              onSelectMode('endless');
              onStart();
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl font-anime font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 ${
              selectedMode === 'endless'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🏃</span> Endless Run
          </button>

          <button
            onClick={onOpenStory}
            className="px-3 sm:px-4 py-2 rounded-xl font-anime font-bold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>📖</span> Story Mode
          </button>

          <button
            onClick={onOpenMissions}
            className="px-3 sm:px-4 py-2 rounded-xl font-anime font-bold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🎯</span> Missions
          </button>

          <button
            onClick={onOpenDaily}
            className="px-3 sm:px-4 py-2 rounded-xl font-anime font-bold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>📅</span> Daily
          </button>

          <button
            onClick={onOpenWardrobe}
            className="px-3 sm:px-4 py-2 rounded-xl font-anime font-bold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>👘</span> Wardrobe
          </button>
        </div>

        {/* Flat Single-Line Control Hint */}
        <div className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide">
          WASD / Arrow Keys Move · Space Jump · S / Down Slide · Esc Pause
        </div>
      </div>
    </div>
  );
};
