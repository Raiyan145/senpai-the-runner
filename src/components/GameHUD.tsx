import React from 'react';
import { ActivePowerUps, WorldTheme } from '../types/game';

interface GameHUDProps {
  distance: number;
  coins: number;
  distanceBehind: number;
  tension: number;
  powerUps: ActivePowerUps;
  world: WorldTheme;
  showOnScreenControls: boolean;
  onPause: () => void;
  onAction: (action: 'left' | 'right' | 'jump' | 'slide') => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  distance,
  coins,
  distanceBehind,
  tension,
  powerUps,
  world,
  showOnScreenControls,
  onPause,
  onAction,
}) => {
  const isDanger = distanceBehind < 7.0;

  const worldLabels: Record<WorldTheme, { name: string; icon: string; color: string }> = {
    jungle: { name: 'Ancient Jungle', icon: '🌴', color: 'text-emerald-400 border-emerald-500/50' },
    garden: { name: 'Blossom Garden', icon: '🌸', color: 'text-pink-400 border-pink-500/50' },
    sky: { name: 'Sky Ruins', icon: '☁️', color: 'text-sky-300 border-sky-400/50' },
    temple: { name: 'Moonlit Temple', icon: '🏮', color: 'text-purple-300 border-purple-500/50' },
  };

  const currentWorldInfo = worldLabels[world];

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
      {/* Danger Screen Edge Vignette when Kiki is dangerously close (< 7m) */}
      {isDanger && (
        <div className="absolute inset-0 border-8 sm:border-[16px] border-rose-600/60 pointer-events-none animate-pulse transition-opacity" />
      )}

      {/* TOP ROW: Distance / World / Chase Meter / Coins / Pause */}
      <div className="w-full flex items-start justify-between gap-2 max-w-6xl mx-auto">
        {/* Top-Left: Distance & World */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-950/85 px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Distance</span>
            <span className="font-anime font-extrabold text-2xl sm:text-3xl text-white tabular-nums">
              {distance}
            </span>
            <span className="text-xs text-sky-400 font-bold">M</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border text-xs font-bold ${currentWorldInfo.color}`}>
            <span>{currentWorldInfo.icon}</span>
            <span>{currentWorldInfo.name}</span>
          </div>
        </div>

        {/* Center-Top: Dynamic Chase Distance Meter */}
        <div className="flex flex-col items-center pointer-events-auto max-w-[220px] sm:max-w-sm w-full">
          <div
            className={`w-full p-2.5 rounded-2xl border shadow-xl flex flex-col items-center transition-all ${
              isDanger
                ? 'bg-rose-950/95 border-rose-500 shadow-rose-900/60 animate-bounce'
                : 'bg-slate-950/90 border-slate-700'
            }`}
          >
            <div className="w-full flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                {/* Expressive Mini Kiki Chaser Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 border border-white flex items-center justify-center text-xs shadow-inner">
                  👧
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-anime font-extrabold text-rose-300 flex items-center gap-1">
                    <span>KIKI ♥</span>
                  </span>
                  <span className="text-[9px] text-slate-300 italic -mt-0.5">
                    {distanceBehind > 14
                      ? '“Wait for me~!”'
                      : distanceBehind > 8
                      ? '“Catching up! ♥”'
                      : '“ALMOST GOT YOU! 💍”'}
                  </span>
                </div>
              </div>

              <span className={`tabular-nums text-xs font-bold ${isDanger ? 'text-rose-400 font-extrabold animate-pulse' : 'text-slate-300'}`}>
                {distanceBehind.toFixed(1)}m
              </span>
            </div>

            {/* Chase Gauge Bar */}
            <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-800 overflow-hidden relative border border-white/10">
              <div
                className={`h-full transition-all duration-150 rounded-full ${
                  isDanger
                    ? 'bg-gradient-to-r from-red-600 to-rose-400'
                    : 'bg-gradient-to-r from-blue-500 to-rose-500'
                }`}
                style={{ width: `${Math.max(5, (distanceBehind / 25) * 100)}%` }}
              />
            </div>

            {isDanger && (
              <span className="text-[10px] font-anime font-bold text-rose-300 tracking-wider mt-1 uppercase animate-pulse">
                ⚠️ She is right behind you!
              </span>
            )}
          </div>
        </div>

        {/* Top-Right: Coins & Pause Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coin Counter */}
          <div className="flex items-center gap-2 bg-slate-950/85 px-3.5 py-2 rounded-2xl border border-amber-500/40 shadow-lg">
            <span className="text-base sm:text-lg">🪙</span>
            <span className="font-anime font-extrabold text-xl sm:text-2xl text-amber-300 tabular-nums">
              {coins}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            tabIndex={-1}
            className="w-11 h-11 rounded-2xl bg-slate-950/85 border border-slate-700 hover:border-slate-500 text-white flex items-center justify-center transition shadow-lg cursor-pointer active:scale-95"
            aria-label="Pause Game"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* ACTIVE POWER-UPS HUD CLUSTER (Mid Left) */}
      <div className="flex flex-col gap-2 pointer-events-auto max-w-[160px]">
        {powerUps.shield > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/90 border border-blue-400/60 shadow-lg">
            <span className="text-lg">🛡️</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Shield</span>
              <span className="text-xs font-bold text-white tabular-nums">
                {powerUps.shield.toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {powerUps.magnet > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-400/60 shadow-lg">
            <span className="text-lg">🧲</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-red-200 font-bold uppercase tracking-wider">Magnet</span>
              <span className="text-xs font-bold text-white tabular-nums">
                {powerUps.magnet.toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {powerUps.speed > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-400/60 shadow-lg">
            <span className="text-lg">⚡</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Boost</span>
              <span className="text-xs font-bold text-white tabular-nums">
                {powerUps.speed.toFixed(1)}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM: Optional Mobile Controls */}
      {showOnScreenControls && (
        <div className="w-full max-w-lg mx-auto flex items-center justify-between pb-2 pointer-events-auto">
          {/* Left / Right Lane Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAction('left')}
              className="w-14 h-14 rounded-2xl bg-slate-900/80 border-2 border-slate-700 active:border-sky-400 active:bg-sky-600/40 text-white font-extrabold text-2xl flex items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
              aria-label="Shift Lane Left"
            >
              ◀
            </button>
            <button
              onClick={() => onAction('right')}
              className="w-14 h-14 rounded-2xl bg-slate-900/80 border-2 border-slate-700 active:border-sky-400 active:bg-sky-600/40 text-white font-extrabold text-2xl flex items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
              aria-label="Shift Lane Right"
            >
              ▶
            </button>
          </div>

          {/* Jump / Slide Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAction('slide')}
              className="w-14 h-14 rounded-2xl bg-amber-950/80 border-2 border-amber-600/80 active:bg-amber-600 text-white font-anime font-extrabold text-sm flex flex-col items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
              aria-label="Slide Down"
            >
              <span>▼</span>
              <span className="text-[10px]">SLIDE</span>
            </button>

            <button
              onClick={() => onAction('jump')}
              className="w-16 h-16 rounded-2xl bg-blue-600/90 border-2 border-sky-400 active:bg-blue-500 text-white font-anime font-extrabold text-base flex flex-col items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer"
              aria-label="Jump Up"
            >
              <span>▲</span>
              <span className="text-[11px]">JUMP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
