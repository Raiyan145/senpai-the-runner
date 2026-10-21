/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CinematicOverlay } from './components/CinematicOverlay';
import { CustomizationModal } from './components/CustomizationModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { MissionsModal } from './components/MissionsModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { StoryModal } from './components/StoryModal';
import { TitleScreen } from './components/TitleScreen';
import { globalAudio } from './game/audio';
import { GameEngine } from './game/GameEngine';
import { loadPlayerStats, savePlayerStats } from './game/save';
import { ActivePowerUps, GameMode, GameState, Mission, SkinItem, StoryChapter, WorldTheme } from './types/game';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Player Stats
  const [stats, setStats] = useState(() => loadPlayerStats());

  // Game UI States
  const [gameState, setGameState] = useState<GameState>('title');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [activeModal, setActiveModal] = useState<
    'wardrobe' | 'story' | 'missions' | 'daily' | 'settings' | null
  >(null);

  // Cinematic State
  const [cinematic, setCinematic] = useState({
    step: 0,
    speaker: 'Kiki',
    text: "I wanna marry you! Don't run!",
  });

  // In-Game HUD States
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [distanceBehind, setDistanceBehind] = useState(16);
  const [tension, setTension] = useState(0);
  const [world, setWorld] = useState<WorldTheme>('jungle');
  const [powerUps, setPowerUps] = useState<ActivePowerUps>({
    shield: 0,
    magnet: 0,
    speed: 0,
    secondChance: true,
  });

  // Game Over summary
  const [gameOverSummary, setGameOverSummary] = useState({
    distance: 0,
    coins: 0,
    world: 'jungle' as WorldTheme,
    isNewBest: false,
  });

  // Sound mute state
  const [isMuted, setIsMuted] = useState(false);

  // Initialize GameEngine
  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize audio volumes
    globalAudio.setVolumes(
      stats.settings.bgmVolume,
      stats.settings.sfxVolume,
      stats.settings.voiceVolume
    );

    const engine = new GameEngine(mountRef.current, {
      onDistanceChange: (d) => setDistance(d),
      onCoinsChange: (c) => setCoins(c),
      onChaseChange: (dist, tens) => {
        setDistanceBehind(dist);
        setTension(tens);
      },
      onPowerUpsChange: (pUps) => setPowerUps(pUps),
      onWorldChange: (w) => setWorld(w),
      onStateChange: (st) => setGameState(st),
      onCinematicStep: (step, speaker, text) => {
        setCinematic({ step, speaker, text });
      },
      onGameOver: (summary) => {
        handleGameOver(summary);
      },
    });

    // Apply equipped skins
    engine.applyCustomSkins(stats.equippedSenpaiSkin, stats.equippedKikiSkin);

    engineRef.current = engine;

    // Check ?autostart=1 support for verification and headless mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      setTimeout(() => {
        engine.startRunning();
      }, 100);
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleGameOver = (summary: { distance: number; coins: number; world: WorldTheme }) => {
    setStats((prev) => {
      const isNewBest = summary.distance > prev.bestDistance;
      const newBestDistance = Math.max(prev.bestDistance, summary.distance);
      const newTotalCoins = prev.totalCoins + summary.coins;

      // Update missions progress
      const updatedMissions = prev.missions.map((m) => {
        let current = m.current;
        if (m.type === 'distance') current = Math.max(current, summary.distance);
        if (m.type === 'coins') current += summary.coins;
        if (m.type === 'reach_world') {
          if (
            (m.id === 'm7' && (summary.world === 'garden' || summary.world === 'sky' || summary.world === 'temple')) ||
            (m.id === 'm8' && (summary.world === 'sky' || summary.world === 'temple'))
          ) {
            current = m.target;
          }
        }
        const completed = current >= m.target;
        return { ...m, current, completed };
      });

      // Update daily challenge if applicable
      let daily = { ...prev.dailyChallenge };
      if (
        !daily.completed &&
        summary.distance >= daily.targetMeters &&
        summary.coins >= daily.targetCoins
      ) {
        daily.completed = true;
      }

      // Check story chapter advancement
      let storyChapter = prev.storyChapter;
      if (gameMode === 'story') {
        if (summary.distance >= 400 && storyChapter < 4) {
          storyChapter++;
        }
      }

      const newStats = {
        ...prev,
        bestDistance: newBestDistance,
        totalCoins: newTotalCoins + (daily.completed && !prev.dailyChallenge.completed ? daily.rewardCoins : 0),
        totalRuns: prev.totalRuns + 1,
        missions: updatedMissions,
        dailyChallenge: daily,
        storyChapter,
      };

      savePlayerStats(newStats);

      setGameOverSummary({
        distance: summary.distance,
        coins: summary.coins,
        world: summary.world,
        isNewBest,
      });

      return newStats;
    });
  };

  const handleStartRun = (mode: GameMode = gameMode) => {
    setGameMode(mode);
    setActiveModal(null);
    if (engineRef.current) {
      engineRef.current.startCinematicIntro(mode);
    }
  };

  const handleSkipCinematic = () => {
    if (engineRef.current) {
      engineRef.current.skipCinematic();
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartRun();
    }
  };

  const handleMainMenu = () => {
    setGameState('title');
    document.body.dataset.state = 'title';
    if (engineRef.current) {
      engineRef.current.state = 'title';
    }
  };

  const handleAction = (action: 'left' | 'right' | 'jump' | 'slide') => {
    if (engineRef.current) {
      engineRef.current.triggerAction(action);
    }
  };

  const handleEquipSkin = (character: 'senpai' | 'kiki', skinId: string) => {
    setStats((prev) => {
      const next = {
        ...prev,
        [character === 'senpai' ? 'equippedSenpaiSkin' : 'equippedKikiSkin']: skinId,
      };
      savePlayerStats(next);
      if (engineRef.current) {
        engineRef.current.applyCustomSkins(next.equippedSenpaiSkin, next.equippedKikiSkin);
      }
      return next;
    });
  };

  const handleBuySkin = (skin: SkinItem): boolean => {
    if (stats.totalCoins < skin.price) return false;
    setStats((prev) => {
      const next = {
        ...prev,
        totalCoins: prev.totalCoins - skin.price,
        unlockedSkins: [...prev.unlockedSkins, skin.id],
      };
      savePlayerStats(next);
      globalAudio.playPowerUp();
      return next;
    });
    return true;
  };

  const handleClaimReward = (mission: Mission) => {
    setStats((prev) => {
      const next = {
        ...prev,
        totalCoins: prev.totalCoins + mission.reward,
        missions: prev.missions.map((m) =>
          m.id === mission.id ? { ...m, claimed: true } : m
        ),
      };
      savePlayerStats(next);
      globalAudio.playPowerUp();
      return next;
    });
  };

  const handleUpdateSettings = (newSettings: typeof stats.settings) => {
    setStats((prev) => {
      const next = { ...prev, settings: newSettings };
      savePlayerStats(next);
      globalAudio.setVolumes(
        newSettings.bgmVolume,
        newSettings.sfxVolume,
        newSettings.voiceVolume
      );
      return next;
    });
  };

  const handleMuteToggle = () => {
    const muted = globalAudio.toggleMute();
    setIsMuted(muted);
    return muted;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Canvas Isolated Ref Container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Title Screen Overlay */}
      {gameState === 'title' && !activeModal && (
        <TitleScreen
          stats={stats}
          selectedMode={gameMode}
          onSelectMode={(mode) => setGameMode(mode)}
          onStart={() => handleStartRun(gameMode)}
          onOpenWardrobe={() => setActiveModal('wardrobe')}
          onOpenMissions={() => setActiveModal('missions')}
          onOpenStory={() => setActiveModal('story')}
          onOpenDaily={() => setActiveModal('daily')}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* Opening Cinematic Dialogue Overlay */}
      {gameState === 'cinematic' && (
        <CinematicOverlay
          step={cinematic.step}
          speaker={cinematic.speaker}
          text={cinematic.text}
          onSkip={handleSkipCinematic}
        />
      )}

      {/* Active In-Game HUD */}
      {gameState === 'playing' && (
        <GameHUD
          distance={distance}
          coins={coins}
          distanceBehind={distanceBehind}
          tension={tension}
          powerUps={powerUps}
          world={world}
          showOnScreenControls={stats.settings.showOnScreenControls}
          onPause={handlePause}
          onAction={handleAction}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          onMuteToggle={handleMuteToggle}
          isMuted={isMuted}
        />
      )}

      {/* Game Over Caught Ending Modal */}
      {gameState === 'caught' && (
        <GameOverModal
          distance={gameOverSummary.distance}
          coins={gameOverSummary.coins}
          bestDistance={stats.bestDistance}
          world={gameOverSummary.world}
          isNewBest={gameOverSummary.isNewBest}
          onRunAgain={handleRestart}
          onMainMenu={handleMainMenu}
          onOpenMissions={() => setActiveModal('missions')}
          onOpenWardrobe={() => setActiveModal('wardrobe')}
        />
      )}

      {/* Secondary Modals */}
      {activeModal === 'wardrobe' && (
        <CustomizationModal
          stats={stats}
          onEquipSkin={handleEquipSkin}
          onBuySkin={handleBuySkin}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'story' && (
        <StoryModal
          stats={stats}
          onSelectChapter={(chap: StoryChapter) => {
            handleStartRun('story');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'missions' && (
        <MissionsModal
          stats={stats}
          onClaimReward={handleClaimReward}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'daily' && (
        <DailyChallengeModal
          stats={stats}
          onStartDaily={() => handleStartRun('daily')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          stats={stats}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
