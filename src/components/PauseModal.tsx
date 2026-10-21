import React from 'react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onMuteToggle: () => boolean;
  isMuted: boolean;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  onMuteToggle,
  isMuted,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Title */}
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400 flex items-center justify-center text-2xl mb-3">
          ⏸️
        </div>
        <h2 className="font-anime font-extrabold text-3xl text-white tracking-wide">
          CHASE PAUSED
        </h2>
        <p className="text-slate-400 text-xs mt-1 mb-6">
          Catch your breath before Kiki catches you!
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-anime font-bold text-lg shadow-lg active:scale-98 transition cursor-pointer border border-white/20"
          >
            RESUME RUN [ESC]
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-anime font-bold text-base border border-slate-600 transition cursor-pointer"
          >
            RESTART RUN
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-anime font-bold text-base border border-slate-600 transition cursor-pointer"
          >
            MAIN MENU
          </button>
        </div>

        {/* Audio Mute Quick Toggle */}
        <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400">
          <span>Audio:</span>
          <button
            onClick={onMuteToggle}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            <span>{isMuted ? '🔇 Muted' : '🔊 Sound On'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
