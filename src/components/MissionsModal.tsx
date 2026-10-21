import React from 'react';
import { Mission, PlayerStats } from '../types/game';

interface MissionsModalProps {
  stats: PlayerStats;
  onClaimReward: (mission: Mission) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  stats,
  onClaimReward,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h2 className="font-anime font-extrabold text-2xl text-white">MISSIONS & BOUNTIES</h2>
              <p className="text-xs text-slate-400">Complete challenges to earn reward coins</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800 border border-amber-500/40">
            <span>🪙</span>
            <span className="font-anime font-bold text-amber-300 text-base tabular-nums">
              {stats.totalCoins}
            </span>
          </div>
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 my-4">
          {stats.missions.map((m) => {
            const progress = Math.min(100, Math.floor((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                    <span className="font-anime font-bold text-base text-white">{m.title}</span>
                    <span className="font-anime text-xs font-bold text-amber-400 flex items-center gap-1">
                      🪙 +{m.reward}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">{m.description}</p>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden relative">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                    {m.current} / {m.target} ({progress}%)
                  </span>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                  {m.claimed ? (
                    <span className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-xl bg-slate-800">
                      CLAIMED ✓
                    </span>
                  ) : m.completed ? (
                    <button
                      onClick={() => onClaimReward(m)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-anime font-extrabold text-xs shadow-md transition cursor-pointer animate-bounce"
                    >
                      CLAIM REWARD 🪙
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-800">
                      IN PROGRESS
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-anime font-bold text-sm cursor-pointer transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
