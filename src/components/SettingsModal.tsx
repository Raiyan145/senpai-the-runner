import React from 'react';
import { PlayerStats } from '../types/game';

interface SettingsModalProps {
  stats: PlayerStats;
  onUpdateSettings: (settings: PlayerStats['settings']) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  stats,
  onUpdateSettings,
  onClose,
}) => {
  const { settings } = stats;

  const handleVolumeChange = (key: 'bgmVolume' | 'sfxVolume' | 'voiceVolume', val: number) => {
    onUpdateSettings({
      ...settings,
      [key]: val,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 sm:p-8 shadow-2xl flex flex-col">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <span className="text-3xl">⚙️</span>
          <div>
            <h2 className="font-anime font-extrabold text-2xl text-white">SETTINGS</h2>
            <p className="text-xs text-slate-400">Audio, controls, and performance preferences</p>
          </div>
        </div>

        {/* Audio Sliders */}
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audio Channels</h3>

          {/* BGM */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Music (BGM)</span>
              <span>{Math.round(settings.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmVolume}
              onChange={(e) => handleVolumeChange('bgmVolume', parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* SFX */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Sound Effects (SFX)</span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Voice */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Character Voices & Speech</span>
              <span>{Math.round(settings.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.voiceVolume}
              onChange={(e) => handleVolumeChange('voiceVolume', parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Gameplay Controls */}
        <div className="flex flex-col gap-4 mb-6 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Controls & Display</h3>

          {/* Mobile buttons toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">On-Screen Action Buttons</span>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  showOnScreenControls: !settings.showOnScreenControls,
                })
              }
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                settings.showOnScreenControls
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {settings.showOnScreenControls ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Close */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-anime font-bold text-sm cursor-pointer transition border border-slate-700"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
