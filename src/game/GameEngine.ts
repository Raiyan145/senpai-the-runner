import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ActivePowerUps, GameMode, GameState, RunnerState, WorldTheme } from '../types/game';
import { globalAudio } from './audio';
import { KikiCharacter } from './characters/Kiki';
import { SenpaiCharacter } from './characters/Senpai';
import {
  BASE_RUN_SPEED,
  calculateRunSpeed,
  checkObstacleCollision,
  DEFAULT_CHASE_DISTANCE,
  getLaneX,
  getWorldThemeForDistance,
  handleCollisionImpact,
  updateChaseDistance,
} from './logic';
import { ParticleManager } from './particles';
import { TrackGenerator } from './track/TrackGenerator';

export interface GameEngineCallbacks {
  onDistanceChange: (distance: number) => void;
  onCoinsChange: (coins: number) => void;
  onChaseChange: (distanceBehind: number, tension: number) => void;
  onPowerUpsChange: (powerUps: ActivePowerUps) => void;
  onWorldChange: (world: WorldTheme) => void;
  onGameOver: (summary: { distance: number; coins: number; world: WorldTheme }) => void;
  onCinematicStep?: (step: number, speaker: string, text: string) => void;
  onStateChange: (state: GameState) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private pmremGenerator!: THREE.PMREMGenerator;

  // Lighting & Environment
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private fog!: THREE.Fog;

  // Game Objects
  private senpai!: SenpaiCharacter;
  private kiki!: KikiCharacter;
  private trackGen!: TrackGenerator;
  private particles!: ParticleManager;

  // Game States
  public state: GameState = 'title';
  public mode: GameMode = 'endless';
  private currentWorld: WorldTheme = 'jungle';

  // Simulation State
  private runner: RunnerState = {
    lane: 0,
    targetX: 0,
    currentX: 0,
    y: 0,
    z: 0,
    vy: 0,
    isJumping: false,
    isSliding: false,
    jumpTimer: 0,
    slideTimer: 0,
    stumbleTimer: 0,
    invulnerableTimer: 0,
    speed: BASE_RUN_SPEED,
    distance: 0,
    coins: 0,
    runJumps: 0,
    runSlides: 0,
    powerUps: {
      shield: 0,
      magnet: 0,
      speed: 0,
      secondChance: true,
    },
  };

  private chaseDistanceBehind = DEFAULT_CHASE_DISTANCE;
  private chaseTension = 0;
  private isCatching = false;
  private catchProgress = 0;
  private hitstopTimer = 0;

  // Cinematic timer & steps
  private cinematicTimer = 0;
  private cinematicStep = 0;

  // Frame loop
  private animFrameId = 0;
  private lastTime = 0;
  private isSoftwareGl = false;

  // Inputs
  private touchStartX = 0;
  private touchStartY = 0;
  private bufferedInput: 'left' | 'right' | 'jump' | 'slide' | null = null;
  private bufferTimer = 0;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.detectSoftwareGl();
    this.initThree();
    this.setupInputs();
    this.lastTime = performance.now();
    this.startLoop();
  }

  private detectSoftwareGl() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
        this.isSoftwareGl = true;
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      this.isSoftwareGl = true;
    }
  }

  private initThree() {
    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 2. Scene & Environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Sky blue initially

    this.fog = new THREE.Fog(0x38bdf8, 50, 180);
    this.scene.fog = this.fog;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.pmremGenerator.dispose();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(
      65,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 5, -8);

    // 4. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x334155, 1.1);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    this.dirLight.position.set(20, 40, 20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 120;
      this.dirLight.shadow.camera.left = -15;
      this.dirLight.shadow.camera.right = 15;
      this.dirLight.shadow.camera.top = 15;
      this.dirLight.shadow.camera.bottom = -15;
      this.dirLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.dirLight);

    // 5. Game Objects
    this.trackGen = new TrackGenerator();
    this.scene.add(this.trackGen.group);

    this.senpai = new SenpaiCharacter();
    this.scene.add(this.senpai.group);

    this.kiki = new KikiCharacter();
    this.scene.add(this.kiki.group);
    this.kiki.group.position.set(0, 0, -DEFAULT_CHASE_DISTANCE);

    this.particles = new ParticleManager();
    this.scene.add(this.particles.group);

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public applyCustomSkins(senpaiSkinId: string, kikiSkinId: string) {
    if (this.senpai) this.senpai.applySkin(senpaiSkinId);
    if (this.kiki) this.kiki.applySkin(kikiSkinId);
  }

  // ================= State Control =================
  public startCinematicIntro(mode: GameMode = 'endless') {
    this.mode = mode;
    this.state = 'cinematic';
    this.callbacks.onStateChange('cinematic');
    this.resetRunVariables();
    this.cinematicTimer = 0;
    this.cinematicStep = 0;

    // Face each other on the stone bridge
    this.senpai.group.position.set(0, 0, 5);
    this.senpai.group.rotation.y = Math.PI; // facing Kiki
    this.kiki.group.position.set(0, 0, -2);
    this.kiki.group.rotation.y = 0; // facing Senpai

    // Trigger Kiki line
    this.triggerCinematicStep(0);
  }

  private triggerCinematicStep(step: number) {
    this.cinematicStep = step;
    if (step === 0) {
      const line = "I wanna marry you! Don't run!";
      if (this.callbacks.onCinematicStep) {
        this.callbacks.onCinematicStep(0, 'Kiki', line);
      }
      globalAudio.speak(line, 'kiki');
      setTimeout(() => {
        if (this.state === 'cinematic' && this.cinematicStep === 0) {
          this.triggerCinematicStep(1);
        }
      }, 2600);
    } else if (step === 1) {
      const line = "I don't want to marry you!";
      if (this.callbacks.onCinematicStep) {
        this.callbacks.onCinematicStep(1, 'Senpai', line);
      }
      globalAudio.speak(line, 'senpai');
      setTimeout(() => {
        if (this.state === 'cinematic' && this.cinematicStep === 1) {
          this.startRunning();
        }
      }, 2200);
    }
  }

  public skipCinematic() {
    if (this.state === 'cinematic') {
      this.startRunning();
    }
  }

  public startRunning() {
    this.state = 'playing';
    this.callbacks.onStateChange('playing');
    document.body.dataset.state = 'playing';

    // Senpai turns forward and sprints!
    this.senpai.group.rotation.y = 0;
    this.kiki.group.rotation.y = 0;

    this.runner.distance = 0;
    this.runner.z = 0;
    this.runner.lane = 0;
    this.runner.targetX = 0;
    this.runner.currentX = 0;
    this.runner.y = 0;
    this.runner.speed = BASE_RUN_SPEED;
    this.chaseDistanceBehind = DEFAULT_CHASE_DISTANCE;
    this.isCatching = false;
    this.catchProgress = 0;

    globalAudio.startBGM();
  }

  public pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.callbacks.onStateChange('paused');
      document.body.dataset.state = 'paused';
      globalAudio.stopBGM();
    }
  }

  public resumeGame() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.callbacks.onStateChange('playing');
      document.body.dataset.state = 'playing';
      this.lastTime = performance.now();
      globalAudio.startBGM();
    }
  }

  public restartRun() {
    this.resetRunVariables();
    this.startRunning();
  }

  private resetRunVariables() {
    this.runner = {
      lane: 0,
      targetX: 0,
      currentX: 0,
      y: 0,
      z: 0,
      vy: 0,
      isJumping: false,
      isSliding: false,
      jumpTimer: 0,
      slideTimer: 0,
      stumbleTimer: 0,
      invulnerableTimer: 0,
      speed: BASE_RUN_SPEED,
      distance: 0,
      coins: 0,
      runJumps: 0,
      runSlides: 0,
      powerUps: {
        shield: 0,
        magnet: 0,
        speed: 0,
        secondChance: true,
      },
    };
    this.chaseDistanceBehind = DEFAULT_CHASE_DISTANCE;
    this.chaseTension = 0;
    this.isCatching = false;
    this.catchProgress = 0;
    this.hitstopTimer = 0;

    // Rebuild fresh track chunks starting at z = -20
    if (this.trackGen) {
      this.scene.remove(this.trackGen.group);
      this.trackGen = new TrackGenerator();
      this.scene.add(this.trackGen.group);
    }

    this.currentWorld = 'jungle';
    this.updateWorldAtmosphere('jungle');
  }

  // ================= Input Handling =================
  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (this.state === 'title' || this.state === 'caught') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          this.startCinematicIntro(this.mode);
        }
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (this.state === 'playing') this.pauseGame();
        else if (this.state === 'paused') this.resumeGame();
        return;
      }

      if (this.state !== 'playing') return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.triggerAction('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.triggerAction('right');
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          e.preventDefault();
          this.triggerAction('jump');
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          this.triggerAction('slide');
          break;
      }
    });

    // Touch swipe handling
    const dom = this.renderer.domElement;
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    dom.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 28) {
          if (absX > absY) {
            if (dx > 0) this.triggerAction('right');
            else this.triggerAction('left');
          } else {
            if (dy < 0) this.triggerAction('jump');
            else this.triggerAction('slide');
          }
        }
      }
    }, { passive: true });

    // Focus loss hygiene
    window.addEventListener('blur', () => {
      this.bufferedInput = null;
    });
  }

  public triggerAction(action: 'left' | 'right' | 'jump' | 'slide') {
    if (this.state !== 'playing') return;

    if (action === 'left') {
      if (this.runner.lane > -1) {
        this.runner.lane = (this.runner.lane - 1) as -1 | 0 | 1;
        this.runner.targetX = getLaneX(this.runner.lane);
      }
    } else if (action === 'right') {
      if (this.runner.lane < 1) {
        this.runner.lane = (this.runner.lane + 1) as -1 | 0 | 1;
        this.runner.targetX = getLaneX(this.runner.lane);
      }
    } else if (action === 'jump') {
      if (!this.runner.isJumping) {
        this.runner.isJumping = true;
        this.runner.vy = 12.5; // Jump launch velocity
        this.runner.isSliding = false; // Jump cancels slide
        this.runner.runJumps++;
        globalAudio.playJump();
        this.particles.emitDust(this.runner.currentX, 0, this.runner.z);
      } else {
        // Buffer jump input
        this.bufferedInput = 'jump';
        this.bufferTimer = 0.14;
      }
    } else if (action === 'slide') {
      this.runner.isSliding = true;
      this.runner.slideTimer = 0.75;
      if (this.runner.isJumping) {
        // Fast dive down!
        this.runner.vy = -18;
      }
      this.runner.runSlides++;
      globalAudio.playSlide();
      this.particles.emitDust(this.runner.currentX, 0, this.runner.z);
    }
  }

  // ================= Animation & Game Loop =================
  private startLoop() {
    const loop = () => {
      const now = performance.now();
      const rawDt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamped dt

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private update(dt: number) {
    if (this.state === 'title') {
      this.updateTitleCamera(dt);
      this.senpai.updateAnimation(dt, 0, false, false, 0, 0);
      this.kiki.updateAnimation(dt, 0, 15, false);
      return;
    }

    if (this.state === 'cinematic') {
      this.updateCinematic(dt);
      return;
    }

    if (this.state === 'caught') {
      this.updateCaughtAnimation(dt);
      return;
    }

    if (this.state === 'paused') {
      return;
    }

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.particles.update(dt);
      return;
    }

    // Input buffer expiration
    if (this.bufferTimer > 0) {
      this.bufferTimer -= dt;
      if (this.bufferTimer <= 0) this.bufferedInput = null;
    }

    // 1. Advance Speed and Position
    const hasSpeedBoost = this.runner.powerUps.speed > 0;
    this.runner.speed = calculateRunSpeed(this.runner.distance, hasSpeedBoost);
    const stepDist = this.runner.speed * dt;
    this.runner.z += stepDist;
    this.runner.distance = Math.floor(this.runner.z);

    // 2. Smooth Lane Interpolation
    const laneDiff = this.runner.targetX - this.runner.currentX;
    this.runner.currentX = THREE.MathUtils.damp(this.runner.currentX, this.runner.targetX, 16, dt);

    // 3. Jump Physics
    if (this.runner.isJumping) {
      this.runner.y += this.runner.vy * dt;
      this.runner.vy -= 34 * dt; // Gravity
      if (this.runner.y <= 0) {
        this.runner.y = 0;
        this.runner.isJumping = false;
        this.runner.vy = 0;
        this.particles.emitDust(this.runner.currentX, 0, this.runner.z);

        // Check buffered jump
        if (this.bufferedInput === 'jump') {
          this.bufferedInput = null;
          this.triggerAction('jump');
        }
      }
    }

    // 4. Slide Timer
    if (this.runner.isSliding) {
      this.runner.slideTimer -= dt;
      if (this.runner.slideTimer <= 0) {
        this.runner.isSliding = false;
      }
    }

    // 5. Timers
    if (this.runner.stumbleTimer > 0) {
      this.runner.stumbleTimer -= dt;
    }
    if (this.runner.invulnerableTimer > 0) {
      this.runner.invulnerableTimer -= dt;
    }

    // Power-up durations
    if (this.runner.powerUps.shield > 0) {
      this.runner.powerUps.shield -= dt;
    }
    if (this.runner.powerUps.magnet > 0) {
      this.runner.powerUps.magnet -= dt;
    }
    if (this.runner.powerUps.speed > 0) {
      this.runner.powerUps.speed -= dt;
      this.particles.emitSpeedTrail(this.runner.currentX, this.runner.y, this.runner.z);
    }

    // 6. Update World Theme and Fog
    const targetWorld = getWorldThemeForDistance(this.runner.distance);
    if (targetWorld !== this.currentWorld) {
      this.currentWorld = targetWorld;
      this.callbacks.onWorldChange(targetWorld);
      this.updateWorldAtmosphere(targetWorld);
    }

    // 7. Update Track & Recycled Chunks
    const kikiZ = this.runner.z - this.chaseDistanceBehind;
    this.trackGen.update(this.runner.z, kikiZ);

    // 8. Update Kiki Chase AI
    const isCleanRunning = this.runner.stumbleTimer <= 0;
    const chaseResult = updateChaseDistance(
      this.chaseDistanceBehind,
      dt,
      isCleanRunning,
      hasSpeedBoost
    );
    this.chaseDistanceBehind = chaseResult.newDistanceBehind;
    this.chaseTension = chaseResult.tension;

    // Audio & Tempo update
    globalAudio.setBgmTempoMultiplier(this.chaseTension);
    globalAudio.updateHeartbeat(this.chaseTension);

    // Kiki Position: tracks Senpai's Z with a lag on X
    const kikiTargetX = this.runner.currentX;
    const currentKikiX = this.kiki.group.position.x;
    const newKikiX = THREE.MathUtils.damp(currentKikiX, kikiTargetX, 4.5, dt);
    this.kiki.group.position.set(newKikiX, 0, this.runner.z - this.chaseDistanceBehind);

    // Random Kiki romantic hearts
    if (Math.random() < 0.12) {
      this.particles.emitHearts(this.kiki.group.position.x, 0, this.kiki.group.position.z);
    }

    // Check Catch condition!
    if (chaseResult.isCaught) {
      this.triggerCatchGameOver();
      return;
    }

    // 9. Collisions & Collectibles Check
    this.handleCollisions();

    // 10. Update Character Models
    this.senpai.group.position.set(this.runner.currentX, this.runner.y, this.runner.z);
    this.senpai.updateAnimation(
      dt,
      this.runner.speed,
      this.runner.isJumping,
      this.runner.isSliding,
      laneDiff,
      this.runner.stumbleTimer
    );

    this.kiki.updateAnimation(dt, this.runner.speed, this.chaseDistanceBehind, false);

    // 11. Particles & Scenery
    if (this.currentWorld === 'garden') {
      this.particles.emitPetals(this.runner.z);
    }
    this.particles.update(dt);

    // 12. Camera Follow Rig
    this.updateGameplayCamera(dt, hasSpeedBoost);

    // 13. Directional Light Follow
    this.dirLight.position.set(this.runner.currentX + 18, 35, this.runner.z + 18);
    this.dirLight.target = this.senpai.group;

    // 14. Report HUD Updates (throttled)
    this.callbacks.onDistanceChange(this.runner.distance);
    this.callbacks.onCoinsChange(this.runner.coins);
    this.callbacks.onChaseChange(this.chaseDistanceBehind, this.chaseTension);
    this.callbacks.onPowerUpsChange({ ...this.runner.powerUps });
  }

  private handleCollisions() {
    // Check nearest active chunks
    for (const chunk of this.trackGen.chunks) {
      // 1. Check Obstacles
      for (const obstacle of chunk.obstacles) {
        if (obstacle.passed) continue;

        if (this.runner.z > obstacle.z + 2) {
          obstacle.passed = true;
          continue;
        }

        const colResult = checkObstacleCollision(this.runner, obstacle);
        if (colResult.collided) {
          obstacle.passed = true;
          const impact = handleCollisionImpact(this.runner.powerUps, this.chaseDistanceBehind);

          if (impact.shieldAbsorbed) {
            // Shield saved us!
            this.runner.powerUps = impact.newPowerUps;
            this.runner.invulnerableTimer = impact.newInvulnerableTimer;
            this.hitstopTimer = 0.04;
            globalAudio.playShieldBreak();
            this.particles.emitCoinSparks(this.runner.currentX, this.runner.y + 1, this.runner.z);
          } else {
            // Stumble!
            this.runner.stumbleTimer = 0.9;
            this.runner.invulnerableTimer = impact.newInvulnerableTimer;
            this.chaseDistanceBehind = impact.newChaseDistance;
            this.hitstopTimer = 0.06;
            globalAudio.playStumble();
            this.particles.emitDust(this.runner.currentX, this.runner.y + 0.5, this.runner.z);

            // Dialogue reaction
            if (Math.random() < 0.4) {
              globalAudio.speak('Whoa! Almost tripped!', 'senpai');
            }
          }
        }
      }

      // 2. Check Coins
      for (const coin of chunk.coins) {
        if (coin.collected) continue;

        const dz = Math.abs(this.runner.z - coin.z);
        const dx = Math.abs(this.runner.currentX - coin.x);

        // Coin magnet pull
        if (this.runner.powerUps.magnet > 0 && dz < 15) {
          coin.x = THREE.MathUtils.damp(coin.x, this.runner.currentX, 12, 0.02);
          coin.z = THREE.MathUtils.damp(coin.z, this.runner.z, 12, 0.02);
        }

        if (dz < 1.4 && dx < 1.2 && Math.abs(this.runner.y - (coin.y - 0.8)) < 1.4) {
          coin.collected = true;
          this.runner.coins++;
          this.trackGen.removeCoinMesh(chunk, coin.id);
          this.particles.emitCoinSparks(coin.x, coin.y, coin.z);
          globalAudio.playCoin();
        }
      }

      // 3. Check Power-Ups
      for (const pUp of chunk.powerUps) {
        if (pUp.collected) continue;

        const dz = Math.abs(this.runner.z - pUp.z);
        const dx = Math.abs(this.runner.currentX - pUp.x);

        if (dz < 1.5 && dx < 1.3) {
          pUp.collected = true;
          this.trackGen.removePowerUpMesh(chunk);
          globalAudio.playPowerUp();
          this.particles.emitCoinSparks(pUp.x, pUp.y, pUp.z);

          if (pUp.type === 'shield') {
            this.runner.powerUps.shield = 12.0;
          } else if (pUp.type === 'magnet') {
            this.runner.powerUps.magnet = 15.0;
          } else if (pUp.type === 'speed') {
            this.runner.powerUps.speed = 8.0;
          } else if (pUp.type === 'secondChance') {
            this.runner.powerUps.secondChance = true;
          }
        }
      }
    }
  }

  private triggerCatchGameOver() {
    this.state = 'caught';
    this.callbacks.onStateChange('caught');
    document.body.dataset.state = 'gameover';
    this.isCatching = true;
    this.catchProgress = 0;

    globalAudio.stopBGM();
    globalAudio.playStumble();

    // Funny ending voice line
    setTimeout(() => {
      globalAudio.speak(
        "You're not running away anymore. I'm going to marry you now!",
        'kiki',
        () => {
          this.callbacks.onGameOver({
            distance: this.runner.distance,
            coins: this.runner.coins,
            world: this.currentWorld,
          });
        }
      );
    }, 400);
  }

  private updateCaughtAnimation(dt: number) {
    this.catchProgress = Math.min(1, this.catchProgress + dt * 0.8);

    // Kiki lunges directly next to Senpai
    this.kiki.group.position.z = THREE.MathUtils.damp(
      this.kiki.group.position.z,
      this.senpai.group.position.z - 0.4,
      8,
      dt
    );
    this.kiki.group.position.x = THREE.MathUtils.damp(
      this.kiki.group.position.x,
      this.senpai.group.position.x + 0.6,
      8,
      dt
    );

    this.kiki.updateAnimation(dt, 0, 0, true);
    this.senpai.updateAnimation(dt, 0, false, false, 0, 1.0);

    // Dramatic romantic slow-motion orbital camera
    const orbitAngle = Date.now() * 0.0015;
    const radius = 4.2;
    this.camera.position.set(
      this.senpai.group.position.x + Math.sin(orbitAngle) * radius,
      this.senpai.group.position.y + 2.2,
      this.senpai.group.position.z + Math.cos(orbitAngle) * radius
    );
    this.camera.lookAt(
      this.senpai.group.position.x,
      this.senpai.group.position.y + 1.2,
      this.senpai.group.position.z
    );

    // Heart explosion around them!
    if (Math.random() < 0.25) {
      this.particles.emitHearts(
        this.senpai.group.position.x,
        this.senpai.group.position.y,
        this.senpai.group.position.z
      );
    }
    this.particles.update(dt);
  }

  private updateTitleCamera(dt: number) {
    const time = Date.now() * 0.0006;
    // Stage characters
    this.senpai.group.position.set(-0.5, 0, 10);
    this.senpai.group.rotation.y = -Math.PI * 0.65; // looking back nervously

    this.kiki.group.position.set(0.9, 0, 8.6);
    this.kiki.group.rotation.y = Math.PI * 0.35; // reaching for Senpai

    // Gentle camera orbit
    const camX = Math.sin(time) * 4.8;
    const camZ = 10 + Math.cos(time) * 4.8;
    this.camera.position.set(camX, 2.5 + Math.sin(time * 1.5) * 0.2, camZ);
    this.camera.lookAt(0.2, 1.3, 9.4);

    if (Math.random() < 0.1) {
      this.particles.emitHearts(0.9, 0, 8.6);
    }
    this.particles.update(dt);
  }

  private updateCinematic(dt: number) {
    this.cinematicTimer += dt;
    // Smooth cinematic pan from Kiki to Senpai
    const progress = Math.min(1, this.cinematicTimer / 3.5);
    const startCam = { x: 3.5, y: 2.5, z: -4 };
    const endCam = { x: -2.8, y: 2.2, z: 8 };

    this.camera.position.set(
      THREE.MathUtils.lerp(startCam.x, endCam.x, progress),
      THREE.MathUtils.lerp(startCam.y, endCam.y, progress),
      THREE.MathUtils.lerp(startCam.z, endCam.z, progress)
    );
    this.camera.lookAt(0, 1.4, 2);

    this.senpai.updateAnimation(dt, 0, false, false, 0, 0);
    this.kiki.updateAnimation(dt, 0, 5, false);
  }

  private updateGameplayCamera(dt: number, hasSpeedBoost: boolean) {
    // Follow smoothly behind Senpai
    const targetX = this.runner.currentX * 0.65;
    const targetY = 3.6 + (this.runner.y * 0.45);
    const targetZ = this.runner.z - 6.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetX, 12, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetY, 10, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetZ, 16, dt);

    const lookTargetX = this.runner.currentX * 0.35;
    const lookTargetY = 1.35 + (this.runner.y * 0.3);
    const lookTargetZ = this.runner.z + 7.5;

    this.camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);

    // Speed FOV kick
    const targetFov = hasSpeedBoost ? 74 : 65;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 8, dt);
      this.camera.updateProjectionMatrix();
    }
  }

  private updateWorldAtmosphere(world: WorldTheme) {
    const skyColors = {
      jungle: 0x38bdf8,
      garden: 0xf472b6,
      sky: 0x0284c7,
      temple: 0x1e1b4b,
    };
    const fogColors = {
      jungle: 0x67e8f9,
      garden: 0xfbcfe8,
      sky: 0xbae6fd,
      temple: 0x312e81,
    };

    const targetSky = new THREE.Color(skyColors[world]);
    const targetFog = new THREE.Color(fogColors[world]);

    this.scene.background = targetSky;
    this.fog.color = targetFog;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    globalAudio.stopBGM();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
