import * as THREE from 'three';
import { CoinData, ObstacleData, PowerUpItemData, WorldTheme } from '../../types/game';
import { getLaneX, getWorldThemeForDistance } from '../logic';

export interface TrackChunk {
  id: number;
  startZ: number;
  endZ: number;
  world: WorldTheme;
  group: THREE.Group;
  obstacles: ObstacleData[];
  coins: CoinData[];
  powerUps: PowerUpItemData[];
}

const CHUNK_LENGTH = 40;
const ROAD_WIDTH = 9.2; // 3 lanes ~2.8m apart plus curbs
const TERRAIN_WIDTH = 140;

export class TrackGenerator {
  public group: THREE.Group;
  public chunks: TrackChunk[] = [];
  private nextChunkZ = -20;
  private chunkCounter = 0;
  private obstacleCounter = 0;
  private coinCounter = 0;
  private powerUpCounter = 0;

  // Shared Geometries
  private roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, CHUNK_LENGTH);
  private terrainGeo = new THREE.PlaneGeometry(TERRAIN_WIDTH, CHUNK_LENGTH, 10, 4);
  private curbGeo = new THREE.BoxGeometry(0.5, 0.45, CHUNK_LENGTH);
  private lowBarrierGeo = new THREE.BoxGeometry(8.5, 0.65, 0.6);
  private highBarrierGeo = new THREE.BoxGeometry(8.5, 0.6, 0.6);
  private monolithGeo = new THREE.BoxGeometry(2.2, 2.5, 1.2);
  private coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12);
  private powerUpGeo = new THREE.OctahedronGeometry(0.45, 0);

  // Materials by world
  private roadMats: Record<WorldTheme, THREE.MeshStandardMaterial>;
  private terrainMats: Record<WorldTheme, THREE.MeshStandardMaterial>;
  private curbMats: Record<WorldTheme, THREE.MeshStandardMaterial>;
  private pillarMats: Record<WorldTheme, THREE.MeshStandardMaterial>;
  private obstacleMats: Record<string, THREE.MeshStandardMaterial>;
  private coinMat: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // Rotate horizontal planes
    this.roadGeo.rotateX(-Math.PI / 2);
    this.terrainGeo.rotateX(-Math.PI / 2);

    // Initialize stylized PBR materials for the 4 worlds
    this.roadMats = {
      jungle: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, metalness: 0.05 }), // Mossy stone
      garden: new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.75, metalness: 0.1 }), // Polished paving
      sky: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 }), // Marble cloud bridge
      temple: new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6, metalness: 0.15 }), // Dark lacquered wood
    };

    this.terrainMats = {
      jungle: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.95, metalness: 0.0 }), // Lush jungle grass
      garden: new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9, metalness: 0.0 }), // Vibrant spring grass
      sky: new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.75 }), // Cloud sea
      temple: new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.95, metalness: 0.0 }), // Midnight moss
    };

    this.curbMats = {
      jungle: new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 }),
      garden: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }), // Crimson railings
      sky: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.3 }), // Sky glow trim
      temple: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.3 }), // Gold trim
    };

    this.pillarMats = {
      jungle: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }),
      garden: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 }),
      sky: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 }),
      temple: new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }),
    };

    this.obstacleMats = {
      stone: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.85 }),
      crimson: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 }),
    };

    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });

    // Generate initial track runway
    for (let i = 0; i < 7; i++) {
      this.generateChunk(i === 0 || i === 1); // first 2 chunks safe without obstacles
    }
  }

  public update(playerZ: number, kikiZ: number) {
    // Generate new chunks ahead
    while (this.nextChunkZ < playerZ + 220) {
      this.generateChunk(false);
    }

    // Recycle chunks far behind Kiki (safe margin 40m)
    const cleanupThreshold = Math.min(playerZ, kikiZ) - 40;
    while (this.chunks.length > 0 && this.chunks[0].endZ < cleanupThreshold) {
      const oldChunk = this.chunks.shift()!;
      this.group.remove(oldChunk.group);
      // Clean up child meshes
      oldChunk.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry !== this.roadGeo) {
          // geometries are reused so we don't dispose shared ones
        }
      });
    }

    // Spin coins
    const time = Date.now() * 0.0035;
    for (const chunk of this.chunks) {
      for (const coinMesh of chunk.group.children) {
        if (coinMesh.name === 'coin') {
          coinMesh.rotation.y = time;
        } else if (coinMesh.name === 'powerup') {
          coinMesh.rotation.y = time * 1.5;
          coinMesh.rotation.x = Math.sin(time) * 0.3;
        }
      }
    }
  }

  private generateChunk(isSafeRunway: boolean) {
    const chunkZ = this.nextChunkZ;
    const endZ = chunkZ + CHUNK_LENGTH;
    const centerZ = chunkZ + CHUNK_LENGTH / 2;
    const world = getWorldThemeForDistance(centerZ);

    const chunkGroup = new THREE.Group();
    chunkGroup.position.set(0, 0, centerZ);

    // Wide ground terrain extending across landscape
    const terrain = new THREE.Mesh(this.terrainGeo, this.terrainMats[world]);
    terrain.position.set(0, -0.06, 0);
    terrain.receiveShadow = true;
    chunkGroup.add(terrain);

    // Road surface
    const road = new THREE.Mesh(this.roadGeo, this.roadMats[world]);
    road.position.set(0, 0.02, 0);
    road.receiveShadow = true;
    chunkGroup.add(road);

    // Left and Right Curbs / Railings
    const curbL = new THREE.Mesh(this.curbGeo, this.curbMats[world]);
    curbL.position.set(-ROAD_WIDTH / 2, 0.22, 0);
    chunkGroup.add(curbL);

    const curbR = new THREE.Mesh(this.curbGeo, this.curbMats[world]);
    curbR.position.set(ROAD_WIDTH / 2, 0.22, 0);
    chunkGroup.add(curbR);

    // Decorative Environment Props along sides
    this.addSideScenery(chunkGroup, world);

    const chunkObstacles: ObstacleData[] = [];
    const chunkCoins: CoinData[] = [];
    const chunkPowerUps: PowerUpItemData[] = [];

    if (!isSafeRunway) {
      // Add obstacles
      this.populateObstacles(chunkGroup, centerZ, world, chunkObstacles);
      // Add coins & power-ups
      this.populateCollectibles(chunkGroup, centerZ, chunkObstacles, chunkCoins, chunkPowerUps);
    }

    this.group.add(chunkGroup);

    this.chunks.push({
      id: this.chunkCounter++,
      startZ: chunkZ,
      endZ,
      world,
      group: chunkGroup,
      obstacles: chunkObstacles,
      coins: chunkCoins,
      powerUps: chunkPowerUps,
    });

    this.nextChunkZ = endZ;
  }

  private addSideScenery(chunkGroup: THREE.Group, world: WorldTheme) {
    // Near props along curbs
    for (const side of [-1, 1]) {
      for (const zOffset of [-14, 2, 14]) {
        const xPos = side * (ROAD_WIDTH / 2 + 2.8);
        const prop = this.createWorldProp(world);
        prop.position.set(xPos, 0, zOffset);
        if (side > 0) prop.rotation.y = Math.PI;
        chunkGroup.add(prop);
      }
    }

    // Far dense forest & mountain rocks in the distance
    for (const side of [-1, 1]) {
      for (const zOffset of [-16, 8]) {
        const xPos = side * (ROAD_WIDTH / 2 + 12 + Math.random() * 4);
        const farProp = this.createWorldProp(world);
        farProp.scale.set(1.4, 1.4, 1.4);
        farProp.position.set(xPos, 0, zOffset);
        chunkGroup.add(farProp);
      }
    }
  }

  private createWorldProp(world: WorldTheme): THREE.Group {
    const prop = new THREE.Group();

    if (world === 'jungle') {
      // Ancient stone pillar with vines
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 5, 8), this.pillarMats.jungle);
      pillar.position.y = 2.5;
      prop.add(pillar);

      // Top leafy cap
      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.4, 1),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 })
      );
      foliage.position.y = 5.2;
      prop.add(foliage);
    } else if (world === 'garden') {
      // Cherry Blossom Tree or Garden Torii post
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.5, 4.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
      );
      trunk.position.y = 2.25;
      prop.add(trunk);

      // Pink Sakura canopy
      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.8 })
      );
      canopy.position.y = 4.8;
      prop.add(canopy);

      // Hanging lantern
      const lantern = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.6, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.6 })
      );
      lantern.position.set(0.6, 3.2, 0);
      prop.add(lantern);
    } else if (world === 'sky') {
      // Floating marble obelisk with azure crystal
      const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.7, 4, 4), this.pillarMats.sky);
      obelisk.position.y = 2.0;
      prop.add(obelisk);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
      );
      crystal.position.y = 4.4;
      prop.add(crystal);
    } else {
      // Moonlit Temple Crimson Shrine Lantern
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.8, 8), this.pillarMats.temple);
      post.position.y = 1.9;
      prop.add(post);

      const shrineHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.9, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
      );
      shrineHead.position.y = 4.0;
      prop.add(shrineHead);

      const moonGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.8 })
      );
      moonGlow.position.y = 4.0;
      prop.add(moonGlow);
    }

    return prop;
  }

  private populateObstacles(
    chunkGroup: THREE.Group,
    centerZ: number,
    world: WorldTheme,
    obstaclesOut: ObstacleData[]
  ) {
    // Generate 1-2 obstacles per chunk with fair spacing
    const typeRoll = Math.random();

    if (typeRoll < 0.35) {
      // Low Barrier (requires Jump!) spans across lanes
      const localZ = 0;
      const worldZ = centerZ + localZ;
      const barrier = new THREE.Mesh(this.lowBarrierGeo, this.obstacleMats.wood);
      barrier.position.set(0, 0.35, localZ);
      barrier.castShadow = true;
      chunkGroup.add(barrier);

      // Warning hazard stripes or warning poles
      const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8), this.obstacleMats.crimson);
      poleL.position.set(-ROAD_WIDTH / 2 + 0.4, 0.6, localZ);
      chunkGroup.add(poleL);
      const poleR = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8), this.obstacleMats.crimson);
      poleR.position.set(ROAD_WIDTH / 2 - 0.4, 0.6, localZ);
      chunkGroup.add(poleR);

      obstaclesOut.push({
        id: this.obstacleCounter++,
        type: 'low_barrier',
        lane: 99, // all lanes
        z: worldZ,
        width: 8.5,
        height: 0.7,
        depth: 0.6,
        passed: false,
        cleared: false,
      });
    } else if (typeRoll < 0.65) {
      // High Overhead Barrier (requires Slide!)
      const localZ = 0;
      const worldZ = centerZ + localZ;

      // Overhead beam
      const beam = new THREE.Mesh(this.highBarrierGeo, this.obstacleMats.wood);
      beam.position.set(0, 1.65, localZ);
      beam.castShadow = true;
      chunkGroup.add(beam);

      // Support pillars
      const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8), this.obstacleMats.wood);
      pL.position.set(-ROAD_WIDTH / 2 + 0.5, 0.9, localZ);
      chunkGroup.add(pL);
      const pR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8), this.obstacleMats.wood);
      pR.position.set(ROAD_WIDTH / 2 - 0.5, 0.9, localZ);
      chunkGroup.add(pR);

      obstaclesOut.push({
        id: this.obstacleCounter++,
        type: 'high_barrier',
        lane: 99,
        z: worldZ,
        width: 8.5,
        height: 1.2,
        depth: 0.6,
        passed: false,
        cleared: false,
      });
    } else {
      // 1 or 2 Monoliths blocking specific lanes (requires Lane Change!)
      const blockedLanes: (-1 | 0 | 1)[] = [];
      const laneCandidates: (-1 | 0 | 1)[] = [-1, 0, 1];
      // Pick 1 or 2 lanes to block, always leave at least 1 lane open
      const blockCount = Math.random() < 0.45 ? 2 : 1;
      laneCandidates.sort(() => Math.random() - 0.5);

      for (let i = 0; i < blockCount; i++) {
        const lane = laneCandidates[i];
        blockedLanes.push(lane);
        const xPos = getLaneX(lane);
        const localZ = 0;
        const worldZ = centerZ + localZ;

        const monolith = new THREE.Mesh(this.monolithGeo, this.obstacleMats.stone);
        monolith.position.set(xPos, 1.25, localZ);
        monolith.castShadow = true;
        chunkGroup.add(monolith);

        obstaclesOut.push({
          id: this.obstacleCounter++,
          type: 'monolith',
          lane,
          z: worldZ,
          width: 2.2,
          height: 2.5,
          depth: 1.2,
          passed: false,
          cleared: false,
        });
      }
    }
  }

  private populateCollectibles(
    chunkGroup: THREE.Group,
    centerZ: number,
    obstacles: ObstacleData[],
    coinsOut: CoinData[],
    powerUpsOut: PowerUpItemData[]
  ) {
    // Pick open lanes for coins
    const lanes: (-1 | 0 | 1)[] = [-1, 0, 1];
    const coinLane = lanes[Math.floor(Math.random() * lanes.length)];

    // Place an arc of 4-6 coins in this chunk
    const count = 5;
    for (let i = 0; i < count; i++) {
      const localZ = -14 + i * 4.5;
      const worldZ = centerZ + localZ;
      const xPos = getLaneX(coinLane);

      // Check if coin coincides with low barrier (if so, form a jump arch!)
      let yPos = 0.8;
      const nearLowBarrier = obstacles.some(
        (o) => o.type === 'low_barrier' && Math.abs(o.z - worldZ) < 4
      );
      if (nearLowBarrier) {
        yPos = 1.8 + Math.sin((i / (count - 1)) * Math.PI) * 0.8;
      }

      const coinMesh = new THREE.Mesh(this.coinGeo, this.coinMat);
      coinMesh.name = 'coin';
      coinMesh.rotation.x = Math.PI / 2;
      coinMesh.position.set(xPos, yPos, localZ);
      chunkGroup.add(coinMesh);

      coinsOut.push({
        id: this.coinCounter++,
        lane: coinLane,
        x: xPos,
        y: yPos,
        z: worldZ,
        collected: false,
      });
    }

    // Rare Power-up spawn (15% chance per chunk)
    if (Math.random() < 0.16) {
      const types: ('shield' | 'magnet' | 'speed' | 'secondChance')[] = [
        'shield',
        'magnet',
        'speed',
        'secondChance',
      ];
      const pType = types[Math.floor(Math.random() * types.length)];
      const pLane = lanes[Math.floor(Math.random() * lanes.length)];
      const localZ = 12;
      const worldZ = centerZ + localZ;
      const xPos = getLaneX(pLane);

      const colorMap = {
        shield: 0x3b82f6, // Blue
        magnet: 0xef4444, // Red
        speed: 0x10b981, // Green
        secondChance: 0xf43f5e, // Pink
      };

      const pMat = new THREE.MeshStandardMaterial({
        color: colorMap[pType],
        roughness: 0.2,
        metalness: 0.4,
        emissive: colorMap[pType],
        emissiveIntensity: 0.4,
      });

      const pMesh = new THREE.Mesh(this.powerUpGeo, pMat);
      pMesh.name = 'powerup';
      pMesh.position.set(xPos, 1.2, localZ);
      chunkGroup.add(pMesh);

      powerUpsOut.push({
        id: this.powerUpCounter++,
        type: pType,
        lane: pLane,
        x: xPos,
        y: 1.2,
        z: worldZ,
        collected: false,
      });
    }
  }

  public removeCoinMesh(chunk: TrackChunk, coinId: number) {
    // Find coin and hide it
    for (let i = chunk.group.children.length - 1; i >= 0; i--) {
      const child = chunk.group.children[i];
      if (child.name === 'coin') {
        // We match by nearest position
        chunk.group.remove(child);
        break;
      }
    }
  }

  public removePowerUpMesh(chunk: TrackChunk) {
    for (let i = chunk.group.children.length - 1; i >= 0; i--) {
      const child = chunk.group.children[i];
      if (child.name === 'powerup') {
        chunk.group.remove(child);
        break;
      }
    }
  }
}
