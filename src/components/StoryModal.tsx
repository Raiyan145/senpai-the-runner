import React from 'react';
import { STORY_CHAPTERS } from '../game/save';
import { PlayerStats, StoryChapter } from '../types/game';

interface StoryModalProps {
  stats: PlayerStats;
  onSelectChapter: (chapter: StoryChapter) => void;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  stats,
  onSelectChapter,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <h2 className="font-anime font-extrabold text-2xl text-white">STORY MODE: CHAPTERS</h2>
              <p className="text-xs text-slate-400">Play through the hilarious romantic chase saga</p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-xs font-bold text-blue-300">
            Chapter {stats.storyChapter} / 4
          </div>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 my-4">
          {STORY_CHAPTERS.map((chapter) => {
            const isUnlocked = chapter.id <= stats.storyChapter;
            const isCompleted = chapter.id < stats.storyChapter;

            return (
              <div
                key={chapter.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  isUnlocked
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-anime font-extrabold text-base text-white">
                      {chapter.title}
                    </span>
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        COMPLETED ✓
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-rose-400 block mb-1">
                    {chapter.subtitle}
                  </span>
                  <p className="text-xs text-slate-300">
                    {chapter.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Target: {chapter.requiredDistance}m</span>
                    <span>Coins: {chapter.requiredCoins}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectChapter(chapter)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-anime font-bold text-sm shadow-md transition cursor-pointer"
                    >
                      PLAY CHAPTER
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 px-4 py-2 rounded-xl bg-slate-800">
                      LOCKED 🔒
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
