import React from 'react';
import { DailyChallenge, PlayerStats } from '../types/game';

interface DailyChallengeModalProps {
  stats: PlayerStats;
  onStartDaily: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  stats,
  onStartDaily,
  onClose,
}) => {
  const daily: DailyChallenge = stats.dailyChallenge;

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/80 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl mb-3 shadow-inner">
          📅
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <span>★</span> TODAY'S CHALLENGE: {daily.dateKey} <span>★</span>
        </div>

        <h2 className="font-anime font-extrabold text-2xl sm:text-3xl text-white">
          {daily.title}
        </h2>

        <p className="text-slate-300 text-sm mt-2 mb-4 leading-relaxed">
          {daily.description}
        </p>

        {/* Goal Specs */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Target Distance</span>
            <span className="font-anime font-extrabold text-xl text-sky-400">
              {daily.targetMeters} m
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Target Coins</span>
            <span className="font-anime font-extrabold text-xl text-amber-300">
              {daily.targetCoins} 🪙
            </span>
          </div>
        </div>

        {/* Reward */}
        <div className="w-full p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-between mb-6">
          <span className="text-xs text-amber-200 font-bold uppercase tracking-wider">Completion Bounty:</span>
          <span className="font-anime font-extrabold text-lg text-amber-300 flex items-center gap-1">
            <span>+{daily.rewardCoins}</span>
            <span>🪙</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="w-full flex flex-col gap-2.5">
          {daily.completed ? (
            <div className="w-full py-3.5 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-anime font-bold text-base flex items-center justify-center gap-2">
              <span>✓</span> COMPLETED TODAY!
            </div>
          ) : (
            <button
              onClick={onStartDaily}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-anime font-extrabold text-xl shadow-lg active:scale-98 transition cursor-pointer"
            >
              START CHALLENGE 🏃💨
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-anime font-bold text-sm border border-slate-700 transition cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
