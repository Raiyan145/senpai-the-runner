import React from 'react';

interface CinematicOverlayProps {
  step: number;
  speaker: string;
  text: string;
  onSkip: () => void;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({
  speaker,
  text,
  onSkip,
}) => {
  const isKiki = speaker.toLowerCase().includes('kiki');

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 z-30">
      {/* Top right skip button */}
      <div className="flex justify-end pointer-events-auto">
        <button
          onClick={onSkip}
          className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700/80 transition shadow-lg cursor-pointer flex items-center gap-2"
        >
          <span>Skip Cinematic</span>
          <span className="text-xs text-slate-400">[ESC]</span>
        </button>
      </div>

      {/* Bottom Dialogue Box */}
      <div className="w-full max-w-2xl mx-auto pointer-events-auto">
        <div
          className={`p-5 rounded-2xl border-2 shadow-2xl transition-all duration-300 ${
            isKiki
              ? 'bg-rose-950/90 border-rose-500/80 shadow-rose-900/50'
              : 'bg-blue-950/90 border-blue-500/80 shadow-blue-900/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-anime font-extrabold uppercase tracking-wider ${
                isKiki ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {speaker}
            </span>
            <span className="text-xs text-slate-400">
              {isKiki ? '♥ Desperate Bride-to-be ♥' : '🏃 Runaway Groom 🏃'}
            </span>
          </div>

          <p className="font-anime text-lg sm:text-2xl text-white font-bold leading-relaxed drop-shadow">
            “{text}”
          </p>

          <div className="mt-2 text-right">
            <span className="text-xs text-slate-400 animate-pulse">
              Playing voice audio...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
