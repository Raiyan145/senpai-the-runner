import * as THREE from 'three';
import { SENPAI_SKINS } from '../save';

export class SenpaiCharacter {
  public group: THREE.Group;
  private torso!: THREE.Mesh;
  private hood!: THREE.Mesh;
  private head!: THREE.Group;
  private hair!: THREE.Group;
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private shadow!: THREE.Mesh;
  private nameTag!: THREE.Sprite;

  // Materials
  private hoodieMat!: THREE.MeshStandardMaterial;
  private pantsMat!: THREE.MeshStandardMaterial;
  private sneakerMat!: THREE.MeshStandardMaterial;
  private hairMat!: THREE.MeshStandardMaterial;
  private skinMat!: THREE.MeshStandardMaterial;
  private trimMat!: THREE.MeshStandardMaterial;

  private runPhase = 0;
  private currentSkinId = 'senpai_classic';

  constructor() {
    this.group = new THREE.Group();
    this.initMaterials();
    this.buildCharacter();
    this.createNameTag();
    this.createContactShadow();
  }

  private initMaterials() {
    this.hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.65,
      metalness: 0.05,
    });
    this.pantsMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.75,
      metalness: 0.02,
    });
    this.sneakerMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1,
    });
    this.hairMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.1,
    });
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xffdfc4,
      roughness: 0.55,
      metalness: 0.0,
    });
    this.trimMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
    });
  }

  public applySkin(skinId: string) {
    this.currentSkinId = skinId;
    const skin = SENPAI_SKINS.find((s) => s.id === skinId) || SENPAI_SKINS[0];
    this.hoodieMat.color.set(skin.colors.primary);
    this.pantsMat.color.set(skin.colors.secondary);
    this.sneakerMat.color.set(skin.colors.accent);
    if (skin.colors.hair) {
      this.hairMat.color.set(skin.colors.hair);
    }
  }

  private buildCharacter() {
    // Height ~ 1.75m. Pivot at bottom center (y=0)

    // 1. Torso & Hoodie
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.7, 12);
    this.torso = new THREE.Mesh(torsoGeo, this.hoodieMat);
    this.torso.position.y = 1.05;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Kangaroo front pocket
    const pocketGeo = new THREE.BoxGeometry(0.34, 0.18, 0.14);
    const pocket = new THREE.Mesh(pocketGeo, this.hoodieMat);
    pocket.position.set(0, -0.15, 0.22);
    this.torso.add(pocket);

    // Hood resting fold behind neck
    const hoodGeo = new THREE.TorusGeometry(0.24, 0.1, 8, 16, Math.PI);
    this.hood = new THREE.Mesh(hoodGeo, this.hoodieMat);
    this.hood.rotation.x = Math.PI * 0.45;
    this.hood.position.set(0, 0.3, -0.18);
    this.torso.add(this.hood);

    // Drawstrings
    const strGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
    const stringL = new THREE.Mesh(strGeo, this.trimMat);
    stringL.position.set(-0.08, 0.15, 0.27);
    this.torso.add(stringL);
    const stringR = new THREE.Mesh(strGeo, this.trimMat);
    stringR.position.set(0.08, 0.15, 0.27);
    this.torso.add(stringR);

    // 2. Head & Neck
    this.head = new THREE.Group();
    this.head.position.set(0, 0.48, 0);
    this.torso.add(this.head);

    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.15, 8);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = -0.05;
    this.head.add(neck);

    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    headGeo.scale(1, 1.1, 1);
    const face = new THREE.Mesh(headGeo, this.skinMat);
    face.position.y = 0.18;
    this.head.add(face);

    // Anime Eyes
    const eyeGeo = new THREE.PlaneGeometry(0.08, 0.09);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.1, 0.2, 0.25);
    this.head.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.1, 0.2, 0.25);
    this.head.add(eyeR);

    // Eye highlight pupils
    const pupilGeo = new THREE.PlaneGeometry(0.03, 0.03);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupL = new THREE.Mesh(pupilGeo, pupilMat);
    pupL.position.set(-0.09, 0.22, 0.255);
    this.head.add(pupL);
    const pupR = new THREE.Mesh(pupilGeo, pupilMat);
    pupR.position.set(0.11, 0.22, 0.255);
    this.head.add(pupR);

    // 3. Anime Hair (spiked fringe and layered clumps)
    this.hair = new THREE.Group();
    this.head.add(this.hair);

    const hairBaseGeo = new THREE.SphereGeometry(0.28, 12, 12);
    hairBaseGeo.scale(1.05, 1.05, 1.1);
    const hairBase = new THREE.Mesh(hairBaseGeo, this.hairMat);
    hairBase.position.set(0, 0.22, -0.04);
    this.hair.add(hairBase);

    // Spiked tufts
    const tuftGeo = new THREE.ConeGeometry(0.08, 0.22, 6);
    for (let i = -3; i <= 3; i++) {
      const tuft = new THREE.Mesh(tuftGeo, this.hairMat);
      tuft.position.set(i * 0.07, 0.35 - Math.abs(i) * 0.03, 0.15 + (1 - Math.abs(i) * 0.15) * 0.12);
      tuft.rotation.x = 0.35;
      tuft.rotation.z = -i * 0.2;
      this.hair.add(tuft);
    }

    // 4. Arms
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.6, 8);
    armGeo.translate(0, -0.3, 0); // pivot at shoulder

    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.4, 0.28, 0);
    const armMeshL = new THREE.Mesh(armGeo, this.hoodieMat);
    this.leftArm.add(armMeshL);
    // Hand
    const handGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const handL = new THREE.Mesh(handGeo, this.skinMat);
    handL.position.y = -0.62;
    this.leftArm.add(handL);
    this.torso.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.4, 0.28, 0);
    const armMeshR = new THREE.Mesh(armGeo, this.hoodieMat);
    this.rightArm.add(armMeshR);
    const handR = new THREE.Mesh(handGeo, this.skinMat);
    handR.position.y = -0.62;
    this.rightArm.add(handR);
    this.torso.add(this.rightArm);

    // 5. Legs & Sneakers
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8);
    legGeo.translate(0, -0.35, 0); // pivot at hip

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.18, 0.72, 0);
    const legMeshL = new THREE.Mesh(legGeo, this.pantsMat);
    this.leftLeg.add(legMeshL);

    // Sneaker L
    const shoeGeo = new THREE.BoxGeometry(0.18, 0.14, 0.32);
    shoeGeo.translate(0, -0.07, 0.08);
    const shoeL = new THREE.Mesh(shoeGeo, this.sneakerMat);
    shoeL.position.y = -0.68;
    this.leftLeg.add(shoeL);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.18, 0.72, 0);
    const legMeshR = new THREE.Mesh(legGeo, this.pantsMat);
    this.rightLeg.add(legMeshR);

    // Sneaker R
    const shoeR = new THREE.Mesh(shoeGeo, this.sneakerMat);
    shoeR.position.y = -0.68;
    this.rightLeg.add(shoeR);
    this.group.add(this.rightLeg);
  }

  private createNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Rounded rectangle background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(10, 10, 236, 60, 16);
    ctx.fill();

    // Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SENPAI', 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.nameTag = new THREE.Sprite(spriteMat);
    this.nameTag.scale.set(1.5, 0.45, 1);
    this.nameTag.position.set(0, 2.2, 0);
    this.group.add(this.nameTag);
  }

  private createContactShadow() {
    const shadowGeo = new THREE.CircleGeometry(0.45, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02;
    this.group.add(this.shadow);
  }

  public updateAnimation(
    dt: number,
    speed: number,
    isJumping: boolean,
    isSliding: boolean,
    laneOffset: number,
    stumbleTimer: number
  ) {
    // Keep shadow grounded
    if (this.shadow) {
      this.shadow.position.y = -this.group.position.y + 0.02;
      const jumpScale = Math.max(0.3, 1 - (this.group.position.y * 0.3));
      this.shadow.scale.set(jumpScale, jumpScale, 1);
    }

    // Stumble effect
    if (stumbleTimer > 0) {
      this.torso.rotation.x = THREE.MathUtils.damp(this.torso.rotation.x, -0.4, 15, dt);
      this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, 1.2, 15, dt);
      this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, -1.2, 15, dt);
      this.torso.rotation.z = Math.sin(Date.now() * 0.03) * 0.2;
      return;
    }

    // Jumping animation
    if (isJumping) {
      this.torso.rotation.x = THREE.MathUtils.damp(this.torso.rotation.x, 0.2, 12, dt);
      this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, -0.8, 12, dt);
      this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, -0.6, 12, dt);
      this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, -1.1, 12, dt);
      this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, -1.1, 12, dt);
      this.torso.rotation.z = THREE.MathUtils.damp(this.torso.rotation.z, 0, 10, dt);
      return;
    }

    // Sliding animation
    if (isSliding) {
      this.torso.rotation.x = THREE.MathUtils.damp(this.torso.rotation.x, 1.35, 18, dt);
      this.torso.position.y = THREE.MathUtils.damp(this.torso.position.y, 0.45, 18, dt);
      this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, 1.4, 18, dt);
      this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, 1.2, 18, dt);
      this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, 0.8, 18, dt);
      this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, 0.8, 18, dt);
      return;
    }

    // Restore sliding offsets
    this.torso.position.y = THREE.MathUtils.damp(this.torso.position.y, 1.05, 15, dt);

    // Lateral banking when switching lanes
    const targetRoll = -laneOffset * 0.18;
    this.group.rotation.z = THREE.MathUtils.damp(this.group.rotation.z, targetRoll, 14, dt);

    // Running gait cycle
    this.runPhase += dt * speed * 0.75;
    const swingL = Math.sin(this.runPhase);
    const swingR = -swingL;

    // Legs swing
    this.leftLeg.rotation.x = swingL * 0.85;
    this.rightLeg.rotation.x = swingR * 0.85;

    // Opposite arms swing
    this.leftArm.rotation.x = -swingL * 0.85;
    this.rightArm.rotation.x = -swingR * 0.85;

    // Subtle torso bounce & lean
    const bounce = Math.abs(Math.sin(this.runPhase * 2)) * 0.08;
    this.torso.position.y = 1.05 + bounce;
    this.torso.rotation.x = 0.12 + bounce * 0.2; // slight forward run lean
    this.torso.rotation.y = swingL * 0.08;

    // Hair sway
    this.hair.rotation.z = swingL * 0.06;
  }
}
