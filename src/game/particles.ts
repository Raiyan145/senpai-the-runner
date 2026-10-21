import * as THREE from 'three';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scale: number;
  color: THREE.Color;
  type: 'spark' | 'petal' | 'dust' | 'heart' | 'trail';
}

const MAX_PARTICLES = 160;

export class ParticleManager {
  public group: THREE.Group;
  private instancedMesh: THREE.InstancedMesh;
  private particles: Particle[] = [];
  private dummy: THREE.Object3D;
  private tempColor = new THREE.Color();

  constructor() {
    this.group = new THREE.Group();
    this.dummy = new THREE.Object3D();

    // Use a lightweight faceted geometry for particles
    const geo = new THREE.DodecahedronGeometry(0.12, 0);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.85,
    });

    this.instancedMesh = new THREE.InstancedMesh(geo, mat, MAX_PARTICLES);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.instancedMesh);

    // Pre-allocate particle buffer
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        scale: 1,
        color: new THREE.Color(1, 1, 1),
        type: 'spark',
      });
      this.dummy.position.set(0, -999, 0);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  private spawnParticle(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    maxLife: number,
    scale: number,
    colorHex: number,
    type: Particle['type']
  ) {
    // Find inactive or oldest particle
    let p = this.particles.find((item) => !item.active);
    if (!p) {
      p = this.particles[0]; // recycle oldest
    }

    p.active = true;
    p.x = x;
    p.y = y;
    p.z = z;
    p.vx = vx;
    p.vy = vy;
    p.vz = vz;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.scale = scale;
    p.color.setHex(colorHex);
    p.type = type;
  }

  public emitCoinSparks(x: number, y: number, z: number) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.spawnParticle(
        x,
        y,
        z,
        Math.cos(angle) * speed,
        Math.random() * 3 + 1,
        Math.sin(angle) * speed,
        0.5 + Math.random() * 0.3,
        0.9 + Math.random() * 0.4,
        0xfbbf24, // Gold
        'spark'
      );
    }
  }

  public emitDust(x: number, y: number, z: number) {
    for (let i = 0; i < 3; i++) {
      this.spawnParticle(
        x + (Math.random() - 0.5) * 0.3,
        y + 0.1,
        z - 0.2,
        (Math.random() - 0.5) * 1.5,
        Math.random() * 0.8 + 0.2,
        -1.5,
        0.35,
        0.6,
        0xd1d5db,
        'dust'
      );
    }
  }

  public emitHearts(x: number, y: number, z: number) {
    this.spawnParticle(
      x + (Math.random() - 0.5) * 0.6,
      y + 1.2 + Math.random() * 0.5,
      z,
      (Math.random() - 0.5) * 1.0,
      1.2 + Math.random() * 1.2,
      (Math.random() - 0.5) * 1.0,
      0.8,
      1.2,
      0xf43f5e, // Hot pink heart
      'heart'
    );
  }

  public emitPetals(playerZ: number) {
    // Ambient falling sakura petals
    if (Math.random() < 0.25) {
      this.spawnParticle(
        (Math.random() - 0.5) * 14,
        6 + Math.random() * 4,
        playerZ + 15 + Math.random() * 25,
        (Math.random() - 0.5) * 1.2,
        -1.5 - Math.random() * 1.5,
        -1.0 - Math.random() * 1.0,
        3.5,
        0.7,
        0xf472b6, // Sakura pink
        'petal'
      );
    }
  }

  public emitSpeedTrail(x: number, y: number, z: number) {
    this.spawnParticle(
      x + (Math.random() - 0.5) * 0.4,
      y + 0.5 + Math.random() * 0.8,
      z - 0.4,
      0,
      0,
      -3,
      0.25,
      0.8,
      0x38bdf8, // Neon cyan
      'trail'
    );
  }

  public update(dt: number) {
    let hasActive = false;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) {
        this.dummy.position.set(0, -999, 0);
        this.dummy.scale.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        continue;
      }

      hasActive = true;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      // Physics integration
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      if (p.type === 'spark' || p.type === 'dust') {
        p.vy -= 9.8 * dt; // gravity
      } else if (p.type === 'petal') {
        p.vx += Math.sin(p.life * 4) * 0.05; // flutter
      }

      const lifeRatio = p.life / p.maxLife;
      const currentScale = p.scale * lifeRatio;

      this.dummy.position.set(p.x, p.y, p.z);
      this.dummy.scale.set(currentScale, currentScale, currentScale);
      this.dummy.rotation.x += dt * 3;
      this.dummy.rotation.y += dt * 4;
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      this.instancedMesh.setColorAt(i, p.color);
    }

    if (hasActive) {
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      if (this.instancedMesh.instanceColor) {
        this.instancedMesh.instanceColor.needsUpdate = true;
      }
    }
  }
}
