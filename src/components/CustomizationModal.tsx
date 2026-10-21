import React, { useState } from 'react';
import { KIKI_SKINS, SENPAI_SKINS } from '../game/save';
import { PlayerStats, SkinItem } from '../types/game';

interface CustomizationModalProps {
  stats: PlayerStats;
  onEquipSkin: (character: 'senpai' | 'kiki', skinId: string) => void;
  onBuySkin: (skin: SkinItem) => boolean;
  onClose: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  stats,
  onEquipSkin,
  onBuySkin,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'senpai' | 'kiki'>('senpai');

  const skinList = activeTab === 'senpai' ? SENPAI_SKINS : KIKI_SKINS;
  const equippedId = activeTab === 'senpai' ? stats.equippedSenpaiSkin : stats.equippedKikiSkin;

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👘</span>
            <div>
              <h2 className="font-anime font-extrabold text-2xl text-white">CHARACTER WARDROBE</h2>
              <p className="text-xs text-slate-400">Unlock outfits with coins to customize your look</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800 border border-amber-500/40">
            <span>🪙</span>
            <span className="font-anime font-bold text-amber-300 text-base tabular-nums">
              {stats.totalCoins}
            </span>
          </div>
        </div>

        {/* Character Tabs */}
        <div className="flex items-center gap-2 my-4">
          <button
            onClick={() => setActiveTab('senpai')}
            className={`flex-1 py-2.5 rounded-xl font-anime font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'senpai'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>👦</span> Senpai Outfits
          </button>
          <button
            onClick={() => setActiveTab('kiki')}
            className={`flex-1 py-2.5 rounded-xl font-anime font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'kiki'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>👧</span> Kiki Outfits ♥
          </button>
        </div>

        {/* Outfit Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skinList.map((skin) => {
            const isUnlocked = stats.unlockedSkins.includes(skin.id);
            const isEquipped = equippedId === skin.id;
            const canAfford = stats.totalCoins >= skin.price;

            return (
              <div
                key={skin.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                  isEquipped
                    ? 'bg-blue-950/60 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-anime font-bold text-base text-white">{skin.name}</span>
                    {/* Swatch preview */}
                    <div className="flex items-center gap-1">
                      <div
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{ backgroundColor: skin.colors.primary }}
                        title="Primary Color"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{ backgroundColor: skin.colors.secondary }}
                        title="Secondary Color"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    {skin.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                  {isUnlocked ? (
                    isEquipped ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        ✓ EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => onEquipSkin(activeTab, skin.id)}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-anime font-bold text-xs transition cursor-pointer"
                      >
                        EQUIP
                      </button>
                    )
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-anime font-bold text-amber-300 text-xs flex items-center gap-1">
                        🪙 {skin.price}
                      </span>
                      <button
                        disabled={!canAfford}
                        onClick={() => onBuySkin(skin)}
                        className={`px-3 py-1.5 rounded-xl font-anime font-bold text-xs transition cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        UNLOCK
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-anime font-bold text-sm cursor-pointer transition"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
