/**
 * Procedural Web Audio API Sound Engine & Speech Synthesis for Senpai - The Endless Chase
 * 100% self-contained with ZERO external audio file dependencies.
 */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isBgmPlaying = false;
  private bgmIntervalId: number | null = null;
  private currentStep = 0;
  private baseBpm = 138;
  private currentBpm = 138;

  private heartbeatIntervalId: number | null = null;
  private isHeartbeatActive = false;

  public bgmVolume = 0.7;
  public sfxVolume = 0.85;
  public voiceVolume = 0.9;
  public isMuted = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.value = this.voiceVolume;
      this.voiceGain.connect(this.masterGain);
    } catch (err) {
      console.warn('Web Audio API not supported', err);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(bgm: number, sfx: number, voice: number) {
    this.bgmVolume = bgm;
    this.sfxVolume = sfx;
    this.voiceVolume = voice;

    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : bgm, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : sfx, this.ctx.currentTime);
    }
    if (this.voiceGain && this.ctx) {
      this.voiceGain.gain.setValueAtTime(this.isMuted ? 0 : voice, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // ================= Procedural BGM Engine =================
  // Anime style energetic progression: F major -> G major -> E minor -> A minor
  private readonly chordRootFrequencies = [
    174.61, // F3
    196.00, // G3
    164.81, // E3
    220.00, // A3
  ];

  public startBGM() {
    this.init();
    this.resume();
    if (this.isBgmPlaying || !this.ctx) return;
    this.isBgmPlaying = true;
    this.currentStep = 0;
    this.scheduleNextBgmBeat();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearTimeout(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.stopHeartbeat();
  }

  public setBgmTempoMultiplier(tensionRatio: number) {
    // When tension increases (Kiki closer), BPM ramps from 138 up to 168!
    this.currentBpm = this.baseBpm + tensionRatio * 30;
  }

  private scheduleNextBgmBeat() {
    if (!this.isBgmPlaying || !this.ctx) return;

    const stepDuration = 60 / this.currentBpm / 4; // 16th notes
    const time = this.ctx.currentTime;

    const bar = Math.floor(this.currentStep / 16) % 4;
    const beat = this.currentStep % 16;
    const rootFreq = this.chordRootFrequencies[bar];

    // Bassline on 8th notes (0, 2, 4, 6, 8, 10, 12, 14)
    if (beat % 2 === 0) {
      this.playSynthNote(rootFreq * 0.5, time, 0.12, 'sawtooth', 0.22, this.bgmGain!);
    }

    // Hi-hat groove
    if (beat % 2 === 0) {
      this.playNoisePerc(time, 0.03, beat % 4 === 2 ? 0.15 : 0.08);
    }

    // Snare on beats 4 and 12
    if (beat === 4 || beat === 12) {
      this.playSnare(time, 0.18);
    }

    // Kick on beats 0, 8, and syncopated on 14
    if (beat === 0 || beat === 8 || beat === 14) {
      this.playKick(time, 0.25);
    }

    // Melodic Arpeggios (Anime style bright chime lead)
    const arpScale = [1, 1.25, 1.5, 1.75, 2]; // Major/Minor triad harmonics
    const noteIdx = (beat * 3) % arpScale.length;
    const leadFreq = rootFreq * 2 * arpScale[noteIdx];
    this.playSynthNote(leadFreq, time, 0.08, 'triangle', 0.12, this.bgmGain!);

    this.currentStep++;
    const msToWait = stepDuration * 1000;
    this.bgmIntervalId = window.setTimeout(() => this.scheduleNextBgmBeat(), msToWait);
  }

  private playSynthNote(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    vol: number,
    dest: GainNode
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playKick(startTime: number, vol = 0.25) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, startTime);
    osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.12);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(startTime);
    osc.stop(startTime + 0.14);
  }

  private playSnare(startTime: number, vol = 0.18) {
    if (!this.ctx || !this.bgmGain) return;
    // Noise burst + tone body
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(startTime);
  }

  private playNoisePerc(startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.bgmGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(startTime);
  }

  // ================= Sound Effects =================
  public playFootstep() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 + Math.random() * 40, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.04);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  public playJump() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, time);
    osc.frequency.exponentialRampToValueAtTime(620, time + 0.18);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  public playSlide() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.linearRampToValueAtTime(400, time + 0.25);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(time);
  }

  public playCoin() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const freqs = [1046.5, 1318.51, 1567.98]; // C6, E6, G6 sparkle
    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time + idx * 0.04);

      gain.gain.setValueAtTime(0.18, time + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.04 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time + idx * 0.04);
      osc.stop(time + idx * 0.04 + 0.18);
    });
  }

  public playPowerUp() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major fanfares
    notes.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, time + i * 0.05);

      gain.gain.setValueAtTime(0.22, time + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time + i * 0.05);
      osc.stop(time + i * 0.05 + 0.25);
    });
  }

  public playStumble() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.25);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  public playShieldBreak() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    // Energy deflection sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, time);
    osc.frequency.linearRampToValueAtTime(300, time + 0.2);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  // ================= Critical Heartbeat Sound =================
  public updateHeartbeat(tensionRatio: number) {
    if (tensionRatio > 0.65 && !this.isHeartbeatActive) {
      this.startHeartbeat();
    } else if (tensionRatio <= 0.65 && this.isHeartbeatActive) {
      this.stopHeartbeat();
    }
  }

  private startHeartbeat() {
    if (this.isHeartbeatActive || !this.ctx) return;
    this.isHeartbeatActive = true;
    const beat = () => {
      if (!this.isHeartbeatActive || !this.ctx || this.isMuted) return;
      const time = this.ctx.currentTime;

      // Lub
      this.playSubBassThump(time, 65, 0.22);
      // Dub
      this.playSubBassThump(time + 0.16, 52, 0.18);

      this.heartbeatIntervalId = window.setTimeout(beat, 650);
    };
    beat();
  }

  private stopHeartbeat() {
    this.isHeartbeatActive = false;
    if (this.heartbeatIntervalId !== null) {
      clearTimeout(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private playSubBassThump(time: number, freq: number, vol: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.14);
  }

  // ================= Speech Synthesis System =================
  public speak(text: string, voiceType: 'kiki' | 'senpai', onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || this.isMuted || this.voiceVolume <= 0.05) {
      if (onEnd) setTimeout(onEnd, 1400);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      if (voiceType === 'kiki') {
        // Higher pitched, sweet feminine voice
        utterance.pitch = 1.35;
        utterance.rate = 1.15;
        // Search for pleasant female voice if available
        const femaleVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Female') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen') ||
              v.name.includes('Victoria') ||
              v.name.includes('Google UK English Female') ||
              v.name.includes('Natural'))
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        // Senpai: youthful male voice
        utterance.pitch = 0.95;
        utterance.rate = 1.1;
        const maleVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Male') ||
              v.name.includes('Alex') ||
              v.name.includes('Daniel') ||
              v.name.includes('Google UK English Male') ||
              v.name.includes('David'))
        );
        if (maleVoice) utterance.voice = maleVoice;
      }

      utterance.volume = this.voiceVolume;
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) setTimeout(onEnd, 1200);
    }
  }
}

export const globalAudio = new AudioManager();
