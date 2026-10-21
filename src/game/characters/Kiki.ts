import * as THREE from 'three';
import { KIKI_SKINS } from '../save';

export class KikiCharacter {
  public group: THREE.Group;
  private torso!: THREE.Mesh;
  private skirt!: THREE.Mesh;
  private head!: THREE.Group;
  private hair!: THREE.Group;
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private shadow!: THREE.Mesh;
  private nameTag!: THREE.Sprite;

  // Materials
  private dressMat!: THREE.MeshStandardMaterial;
  private frillMat!: THREE.MeshStandardMaterial;
  private shoeMat!: THREE.MeshStandardMaterial;
  private hairMat!: THREE.MeshStandardMaterial;
  private hairHighlightMat!: THREE.MeshStandardMaterial;
  private skinMat!: THREE.MeshStandardMaterial;

  private runPhase = 0;
  private currentSkinId = 'kiki_rose';

  constructor() {
    this.group = new THREE.Group();
    this.initMaterials();
    this.buildCharacter();
    this.createNameTag();
    this.createContactShadow();
  }

  private initMaterials() {
    this.dressMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.55,
      metalness: 0.05,
    });
    this.frillMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.6,
      metalness: 0.0,
    });
    this.shoeMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.25,
      metalness: 0.2,
    });
    this.hairMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.45,
      metalness: 0.1,
    });
    this.hairHighlightMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.4,
      metalness: 0.2,
    });
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xffe4e6,
      roughness: 0.5,
      metalness: 0.0,
    });
  }

  public applySkin(skinId: string) {
    this.currentSkinId = skinId;
    const skin = KIKI_SKINS.find((s) => s.id === skinId) || KIKI_SKINS[0];
    this.dressMat.color.set(skin.colors.primary);
    this.frillMat.color.set(skin.colors.secondary);
    this.shoeMat.color.set(skin.colors.accent);
    if (skin.colors.hair) {
      this.hairMat.color.set(skin.colors.hair);
    }
  }

  private buildCharacter() {
    // 1. Torso & Upper Dress
    const bodiceGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.55, 12);
    this.torso = new THREE.Mesh(bodiceGeo, this.dressMat);
    this.torso.position.y = 1.05;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Waist ribbon
    const ribbonGeo = new THREE.TorusGeometry(0.23, 0.03, 8, 16);
    const ribbon = new THREE.Mesh(ribbonGeo, this.frillMat);
    ribbon.rotation.x = Math.PI / 2;
    ribbon.position.y = -0.25;
    this.torso.add(ribbon);

    // Flared Skirt
    const skirtGeo = new THREE.ConeGeometry(0.48, 0.48, 16, 1, true);
    skirtGeo.rotateX(Math.PI);
    this.skirt = new THREE.Mesh(skirtGeo, this.dressMat);
    this.skirt.position.set(0, -0.4, 0);
    this.torso.add(this.skirt);

    // Frill bottom hem
    const frillGeo = new THREE.TorusGeometry(0.46, 0.035, 6, 16);
    const hem = new THREE.Mesh(frillGeo, this.frillMat);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = -0.62;
    this.torso.add(hem);

    // 2. Head & Neck
    this.head = new THREE.Group();
    this.head.position.set(0, 0.38, 0);
    this.torso.add(this.head);

    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.14, 8);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = -0.05;
    this.head.add(neck);

    const faceGeo = new THREE.SphereGeometry(0.24, 16, 16);
    faceGeo.scale(1, 1.05, 1);
    const face = new THREE.Mesh(faceGeo, this.skinMat);
    face.position.y = 0.16;
    this.head.add(face);

    // Anime Eyes (Sparkling, Loving Pink-Red)
    const eyeGeo = new THREE.PlaneGeometry(0.075, 0.085);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.09, 0.18, 0.23);
    this.head.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.09, 0.18, 0.23);
    this.head.add(eyeR);

    // Blush spots
    const blushGeo = new THREE.PlaneGeometry(0.06, 0.03);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.65 });
    const blushL = new THREE.Mesh(blushGeo, blushMat);
    blushL.position.set(-0.11, 0.12, 0.235);
    this.head.add(blushL);
    const blushR = new THREE.Mesh(blushGeo, blushMat);
    blushR.position.set(0.11, 0.12, 0.235);
    this.head.add(blushR);

    // 3. Hair (Long twin tails / flowing locks with blue highlights)
    this.hair = new THREE.Group();
    this.head.add(this.hair);

    const hairCapGeo = new THREE.SphereGeometry(0.26, 14, 14);
    hairCapGeo.scale(1.05, 1.05, 1.15);
    const hairCap = new THREE.Mesh(hairCapGeo, this.hairMat);
    hairCap.position.set(0, 0.18, -0.05);
    this.hair.add(hairCap);

    // Long Flowing Locks
    const lockGeo = new THREE.CylinderGeometry(0.08, 0.03, 0.8, 8);
    lockGeo.translate(0, -0.4, 0);

    const lockL = new THREE.Mesh(lockGeo, this.hairMat);
    lockL.position.set(-0.18, 0.2, -0.15);
    lockL.rotation.z = 0.15;
    this.hair.add(lockL);

    const lockR = new THREE.Mesh(lockGeo, this.hairMat);
    lockR.position.set(0.18, 0.2, -0.15);
    lockR.rotation.z = -0.15;
    this.hair.add(lockR);

    // Blue Highlights
    const highlightGeo = new THREE.CylinderGeometry(0.03, 0.015, 0.65, 6);
    highlightGeo.translate(0, -0.32, 0);
    const hlL = new THREE.Mesh(highlightGeo, this.hairHighlightMat);
    hlL.position.set(-0.21, 0.18, -0.08);
    this.hair.add(hlL);
    const hlR = new THREE.Mesh(highlightGeo, this.hairHighlightMat);
    hlR.position.set(0.21, 0.18, -0.08);
    this.hair.add(hlR);

    // 4. Arms (reaching out to hug/catch Senpai!)
    const armGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.55, 8);
    armGeo.translate(0, -0.27, 0);

    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.32, 0.22, 0);
    const armL = new THREE.Mesh(armGeo, this.skinMat);
    this.leftArm.add(armL);
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), this.skinMat);
    handL.position.y = -0.55;
    this.leftArm.add(handL);
    this.torso.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.32, 0.22, 0);
    const armR = new THREE.Mesh(armGeo, this.skinMat);
    this.rightArm.add(armR);
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), this.skinMat);
    handR.position.y = -0.55;
    this.rightArm.add(handR);
    this.torso.add(this.rightArm);

    // 5. Legs & Red Shoes
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.68, 8);
    legGeo.translate(0, -0.34, 0);

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.14, 0.68, 0);
    const legL = new THREE.Mesh(legGeo, this.skinMat);
    this.leftLeg.add(legL);
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), this.shoeMat);
    shoeL.position.set(0, -0.66, 0.06);
    this.leftLeg.add(shoeL);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.14, 0.68, 0);
    const legR = new THREE.Mesh(legGeo, this.skinMat);
    this.rightLeg.add(legR);
    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.24), this.shoeMat);
    shoeR.position.set(0, -0.66, 0.06);
    this.rightLeg.add(shoeR);
    this.group.add(this.rightLeg);
  }

  private createNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Rounded rectangle pink aura
    ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
    ctx.roundRect(10, 10, 236, 60, 16);
    ctx.fill();

    // Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('KIKI ♥', 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.nameTag = new THREE.Sprite(spriteMat);
    this.nameTag.scale.set(1.5, 0.45, 1);
    this.nameTag.position.set(0, 2.2, 0);
    this.group.add(this.nameTag);
  }

  private createContactShadow() {
    const shadowGeo = new THREE.CircleGeometry(0.42, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
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
    distanceBehind: number,
    isCatching: boolean
  ) {
    if (this.shadow) {
      this.shadow.position.y = -this.group.position.y + 0.02;
    }

    // Catching pose (reaching out to embrace Senpai!)
    if (isCatching) {
      this.torso.rotation.x = THREE.MathUtils.damp(this.torso.rotation.x, 0.3, 10, dt);
      this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, -1.5, 12, dt);
      this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, -1.5, 12, dt);
      this.leftArm.rotation.z = THREE.MathUtils.damp(this.leftArm.rotation.z, -0.4, 12, dt);
      this.rightArm.rotation.z = THREE.MathUtils.damp(this.rightArm.rotation.z, 0.4, 12, dt);
      return;
    }

    // Dynamic chase animation
    this.runPhase += dt * speed * 0.78;
    const swingL = Math.sin(this.runPhase);
    const swingR = -swingL;

    // Running legs
    this.leftLeg.rotation.x = swingL * 0.8;
    this.rightLeg.rotation.x = swingR * 0.8;

    // As Kiki gets closer (< 8m), she reaches her hands forward eagerly!
    const closenessRatio = Math.max(0, Math.min(1, 1 - distanceBehind / 12));
    const forwardArmBase = -0.3 - (closenessRatio * 0.9); // reaching out!

    this.leftArm.rotation.x = forwardArmBase - (swingL * 0.45);
    this.rightArm.rotation.x = forwardArmBase - (swingR * 0.45);

    // Skirt & hair sway
    this.skirt.rotation.z = swingL * 0.12;
    this.hair.rotation.z = swingL * 0.15;
    this.hair.rotation.x = -0.25 - (speed * 0.015); // hair blown back by wind

    // Torso running lean
    this.torso.rotation.x = 0.2 + closenessRatio * 0.15;
  }
}
