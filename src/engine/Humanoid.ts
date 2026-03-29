import * as THREE from 'three';
import { EasingType } from '../store';

export function applyEasing(t: number, easing: EasingType): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return t * (2 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'bounce': {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
      if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
      t -= 2.625 / 2.75;
      return 7.5625 * t * t + 0.984375;
    }
    default:
      return t;
  }
}

export class Humanoid {
  root: THREE.Group;
  parts: Record<string, { g: THREE.Group; defaultRot: { x: number; y: number; z: number }; defaultPos?: { x: number; y: number; z: number } }>;
  _locked: Set<string>;
  _idleT: number;
  mats: {
    body: THREE.MeshStandardMaterial;
    joint: THREE.MeshStandardMaterial;
    panel: THREE.MeshStandardMaterial;
    visor: THREE.MeshStandardMaterial;
    glow: THREE.MeshStandardMaterial;
  };
  _hlPart: string | null = null;
  camTarget: THREE.Vector3;
  updateCam: () => void;
  _weightShift: THREE.Vector3;
  poseState: 'standing' | 'crouching' | 'laying' | 'one_leg_left' | 'one_leg_right' | 'custom' = 'standing';
  _playbackRafId: number | null = null;

  constructor(scene: THREE.Scene, camTarget: THREE.Vector3, updateCam: () => void) {
    this.root = new THREE.Group();
    this.parts = {};
    this._locked = new Set();
    this._idleT = 0;
    this._weightShift = new THREE.Vector3(0, 0, 0);
    this.camTarget = camTarget;
    this.updateCam = updateCam;

    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const M = (color: number, metal = 0.1, rough = 0.5) =>
      new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });

    this.mats = {
      body: M(0xffffff, 0.1, 0.4), // White armor
      joint: M(0x222222, 0.5, 0.8), // Dark joints
      panel: M(0x333333, 0.2, 0.6), // Dark abdomen/neck
      visor: M(0xffffff, 0.1, 0.4), // Same as body for faceless look
      glow: new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff5500, emissiveIntensity: 2.0, metalness: 0.3, roughness: 0.4 }),
    };

    const add = (name: string, parentGroup: THREE.Group, pos: THREE.Vector3) => {
      const g = new THREE.Group();
      g.position.copy(pos);
      parentGroup.add(g);
      this.parts[name] = { g, defaultRot: { x: 0, y: 0, z: 0 } };
      return g;
    };

    const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, g: THREE.Group, offset: THREE.Vector3, shadow = true) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(offset);
      m.castShadow = shadow;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };

    const R = this.root;
    const { body, joint, panel, visor } = this.mats;

    // Hips (Pelvis)
    const hips = add('hips', R, V(0, 1.18, 0));
    mesh(new THREE.BoxGeometry(0.35, 0.2, 0.25), body, hips, V(0, 0, 0));

    // Torso (Abdomen + Chest)
    const torso = add('torso', hips, V(0, 0.1, 0));
    mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.25, 16), panel, torso, V(0, 0.15, 0)); // Abdomen
    mesh(new THREE.BoxGeometry(0.45, 0.35, 0.25), body, torso, V(0, 0.45, 0)); // Chest

    // Neck
    const neck = add('neck', torso, V(0, 0.65, 0));
    mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 16), panel, neck, V(0, 0.05, 0));

    // Head
    const head = add('head', neck, V(0, 0.1, 0));
    mesh(new THREE.BoxGeometry(0.22, 0.28, 0.25), body, head, V(0, 0.14, 0));

    // LEFT ARM
    const ls = add('left_shoulder', torso, V(-0.3, 0.5, 0));
    mesh(new THREE.SphereGeometry(0.08, 16, 16), joint, ls, V(0, 0, 0));
    mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), body, ls, V(-0.05, 0.05, 0)); // Shoulder pad

    const lua = add('left_upper_arm', ls, V(0, 0, 0));
    lua.rotation.z = 0.1; this.parts.left_upper_arm.defaultRot = { x: 0, y: 0, z: 0.1 };
    mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 16), body, lua, V(-0.05, -0.2, 0));

    const le = add('left_elbow', lua, V(-0.05, -0.4, 0));
    mesh(new THREE.SphereGeometry(0.06, 16, 16), joint, le, V(0, 0, 0));

    const lfa = add('left_forearm', le, V(0, 0, 0));
    mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.35, 16), body, lfa, V(0, -0.2, 0));

    const lh = add('left_hand', lfa, V(0, -0.4, 0));
    mesh(new THREE.BoxGeometry(0.08, 0.12, 0.05), body, lh, V(0, -0.06, 0));

    // RIGHT ARM
    const rs = add('right_shoulder', torso, V(0.3, 0.5, 0));
    mesh(new THREE.SphereGeometry(0.08, 16, 16), joint, rs, V(0, 0, 0));
    mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), body, rs, V(0.05, 0.05, 0)); // Shoulder pad

    const rua = add('right_upper_arm', rs, V(0, 0, 0));
    rua.rotation.z = -0.1; this.parts.right_upper_arm.defaultRot = { x: 0, y: 0, z: -0.1 };
    mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 16), body, rua, V(0.05, -0.2, 0));

    const re = add('right_elbow', rua, V(0.05, -0.4, 0));
    mesh(new THREE.SphereGeometry(0.06, 16, 16), joint, re, V(0, 0, 0));

    const rfa = add('right_forearm', re, V(0, 0, 0));
    mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.35, 16), body, rfa, V(0, -0.2, 0));

    const rh = add('right_hand', rfa, V(0, -0.4, 0));
    mesh(new THREE.BoxGeometry(0.08, 0.12, 0.05), body, rh, V(0, -0.06, 0));

    // LEFT LEG
    const lhip = add('left_hip', hips, V(-0.12, -0.1, 0));
    mesh(new THREE.SphereGeometry(0.08, 16, 16), joint, lhip, V(0, 0, 0));

    const lth = add('left_thigh', lhip, V(0, 0, 0));
    mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.45, 16), body, lth, V(0, -0.25, 0));

    const lk = add('left_knee', lth, V(0, -0.5, 0));
    mesh(new THREE.SphereGeometry(0.07, 16, 16), joint, lk, V(0, 0, 0));

    const lsh = add('left_shin', lk, V(0, 0, 0));
    mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.45, 16), body, lsh, V(0, -0.25, 0));

    const lf = add('left_foot', lsh, V(0, -0.5, 0));
    mesh(new THREE.BoxGeometry(0.1, 0.08, 0.22), body, lf, V(0, -0.04, 0.05));

    // RIGHT LEG
    const rhip = add('right_hip', hips, V(0.12, -0.1, 0));
    mesh(new THREE.SphereGeometry(0.08, 16, 16), joint, rhip, V(0, 0, 0));

    const rth = add('right_thigh', rhip, V(0, 0, 0));
    mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.45, 16), body, rth, V(0, -0.25, 0));

    const rk = add('right_knee', rth, V(0, -0.5, 0));
    mesh(new THREE.SphereGeometry(0.07, 16, 16), joint, rk, V(0, 0, 0));

    const rsh = add('right_shin', rk, V(0, 0, 0));
    mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.45, 16), body, rsh, V(0, -0.25, 0));

    const rf = add('right_foot', rsh, V(0, -0.5, 0));
    mesh(new THREE.BoxGeometry(0.1, 0.08, 0.22), body, rf, V(0, -0.04, 0.05));

    // Fix defaults
    for (const [n, p] of Object.entries(this.parts)) {
      if (n !== 'left_upper_arm' && n !== 'right_upper_arm') {
        p.defaultRot = { x: p.g.rotation.x, y: p.g.rotation.y, z: p.g.rotation.z };
        p.defaultPos = { x: p.g.position.x, y: p.g.position.y, z: p.g.position.z };
      }
    }

    scene.add(R);
  }

  private clampToPlatform(pos: THREE.Vector3) {
    pos.x = Math.max(-19.5, Math.min(19.5, pos.x));
    pos.z = Math.max(-19.5, Math.min(19.5, pos.z));
  }

  preventFloorClipping() {
    this.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.root);
    if (box.min.y < 0) {
      this.root.position.y -= box.min.y;
      this.root.updateMatrixWorld(true);
    }
  }

  animateJoint(name: string, target: { x?: number; y?: number; z?: number }, ms = 620): Promise<void> {
    const part = this.parts[name];
    if (!part) return Promise.resolve();
    this._locked.add(name);
    const s = { x: part.g.rotation.x, y: part.g.rotation.y, z: part.g.rotation.z };
    const t0 = performance.now();
    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const rot = part.g.rotation;
        rot.x = s.x + ((target.x ?? s.x) - s.x) * e;
        rot.y = s.y + ((target.y ?? s.y) - s.y) * e;
        rot.z = s.z + ((target.z ?? s.z) - s.z) * e;
        this.preventFloorClipping();
        if (t < 1) requestAnimationFrame(tick);
        else { this._locked.delete(name); res(); }
      };
      requestAnimationFrame(tick);
    });
  }

  walkForward(steps: number, dir = 1): Promise<void> {
    if (this.poseState !== 'standing') return Promise.reject(new Error(`Cannot walk while ${this.poseState}. Please stand up first.`));
    if (steps < 0) {
      steps = Math.abs(steps);
      dir = -dir;
    }
    const ms = steps * 520;
    const startPos = this.root.position.clone();
    
    // Calculate forward vector based on current rotation
    // The robot model faces +Z initially (left arm at -X, right arm at +X).
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.root.quaternion);
    
    const targetPos = startPos.clone().add(forward.multiplyScalar(steps * 0.55 * dir));
    
    const t0 = performance.now();
    // We don't lock arms, torso, or hips if they are already locked by another animation.
    // But we lock legs to ensure walking works.
    const legs = ['left_thigh', 'right_thigh', 'left_shin', 'right_shin'];
    legs.forEach(n => this._locked.add(n));
    
    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        this.root.position.lerpVectors(startPos, targetPos, t);
        this.clampToPlatform(this.root.position);
        this.camTarget.copy(this.root.position);
        this.camTarget.y += 2.0; // Keep camera target at head height
        
        const cyc = (now - t0) / 380 * Math.PI * 2;
        const sw = 0.45;
        const p = this.parts;
        
        // Legs (always animated during walk)
        if (p.left_thigh) p.left_thigh.g.rotation.x = Math.sin(cyc) * sw * dir;
        if (p.right_thigh) p.right_thigh.g.rotation.x = -Math.sin(cyc) * sw * dir;
        if (p.left_shin) p.left_shin.g.rotation.x = Math.max(0, -Math.sin(cyc) * sw * 0.5 * dir);
        if (p.right_shin) p.right_shin.g.rotation.x = Math.max(0, Math.sin(cyc) * sw * 0.5 * dir);
        
        // Arms (only if not locked by another animation)
        if (p.left_upper_arm && !this._locked.has('left_upper_arm')) {
          p.left_upper_arm.g.rotation.x = -Math.sin(cyc) * 0.28 * dir;
        }
        if (p.right_upper_arm && !this._locked.has('right_upper_arm')) {
          p.right_upper_arm.g.rotation.x = Math.sin(cyc) * 0.28 * dir;
        }
        
        // Torso and Hips (subtle gait, only if not locked)
        if (p.hips && !this._locked.has('hips')) {
          p.hips.g.rotation.y = -Math.sin(cyc) * 0.12 * dir; // Increased yaw
          p.hips.g.rotation.z = Math.sin(cyc * 2) * 0.05; // Increased roll (sway)
          if (p.hips.defaultPos) {
            p.hips.g.position.y = p.hips.defaultPos.y + Math.abs(Math.sin(cyc * 2)) * 0.03; // Subtle vertical bobbing
          }
        }
        if (p.torso && !this._locked.has('torso')) {
          p.torso.g.rotation.y = Math.sin(cyc) * 0.12 * dir; // Counter-yaw to hips
          p.torso.g.rotation.z = -Math.sin(cyc * 2) * 0.05; // Counter-roll to hips
          p.torso.g.rotation.x = p.torso.defaultRot.x + 0.05; // Slight forward lean
        }

        this.updateCam();
        if (t < 1) requestAnimationFrame(tick);
        else {
          legs.forEach(n => { this._locked.delete(n); });
          
          // Restore all parts that we might have animated
          const partsToRestore = [
            'left_thigh', 'right_thigh', 'left_shin', 'right_shin',
            'left_upper_arm', 'right_upper_arm', 'hips', 'torso'
          ];
          
          partsToRestore.forEach(n => {
            if (p[n] && !this._locked.has(n)) {
              const d = p[n].defaultRot;
              p[n].g.rotation.set(d.x, d.y, d.z);
              if (p[n].defaultPos) {
                const dp = p[n].defaultPos;
                p[n].g.position.set(dp.x, dp.y, dp.z);
              }
            }
          });
          res();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  jump(height: number = 1.0): Promise<void> {
    if (this.poseState !== 'standing') return Promise.reject(new Error(`Cannot jump while ${this.poseState}. Please stand up first.`));
    if (height < 0) return Promise.reject(new Error(`Jump height cannot be negative.`));
    const ms = 1200;
    const t0 = performance.now();
    const lock = ['left_thigh', 'right_thigh', 'left_shin', 'right_shin', 'left_upper_arm', 'right_upper_arm', 'torso'];
    lock.forEach(n => this._locked.add(n));
    const startY = this.root.position.y;

    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const p = this.parts;

        let yOffset = 0;
        let thighRot = 0;
        let shinRot = 0;
        let armRot = 0;
        let torsoRot = 0;

        if (t < 0.2) {
          // Crouch
          const nt = t / 0.2;
          const ease = Math.sin(nt * Math.PI / 2);
          yOffset = -0.2 * ease;
          thighRot = -0.5 * ease;
          shinRot = 0.5 * ease;
          armRot = -0.2 * ease;
          torsoRot = 0.2 * ease;
        } else if (t < 0.5) {
          // Launch to peak
          const nt = (t - 0.2) / 0.3;
          const ease = 1 - Math.pow(1 - nt, 2);
          yOffset = -0.2 + (height + 0.2) * ease;
          thighRot = -0.5 + 0.7 * ease;
          shinRot = 0.5 - 0.5 * ease;
          armRot = -0.2 + 0.5 * ease;
          torsoRot = 0.2 - 0.2 * ease;
        } else if (t < 0.8) {
          // Fall
          const nt = (t - 0.5) / 0.3;
          const ease = Math.pow(nt, 2);
          yOffset = height - height * ease;
          thighRot = 0.2 - 0.3 * ease;
          shinRot = 0.1 * ease;
          armRot = 0.3 - 0.1 * ease;
          torsoRot = 0;
        } else if (t < 0.9) {
          // Land absorb
          const nt = (t - 0.8) / 0.1;
          const ease = Math.sin(nt * Math.PI / 2);
          yOffset = -0.2 * ease;
          thighRot = -0.1 - 0.4 * ease;
          shinRot = 0.1 + 0.4 * ease;
          armRot = 0.2 - 0.4 * ease;
          torsoRot = 0.2 * ease;
        } else {
          // Recover
          const nt = (t - 0.9) / 0.1;
          const ease = 1 - Math.cos(nt * Math.PI / 2);
          yOffset = -0.2 * (1 - ease);
          thighRot = -0.5 * (1 - ease);
          shinRot = 0.5 * (1 - ease);
          armRot = -0.2 * (1 - ease);
          torsoRot = 0.2 * (1 - ease);
        }

        this.root.position.y = startY + yOffset;
        this.clampToPlatform(this.root.position);
        this.preventFloorClipping();
        this.camTarget.y = this.root.position.y + 2.0;

        if (p.left_thigh) p.left_thigh.g.rotation.x = thighRot;
        if (p.right_thigh) p.right_thigh.g.rotation.x = thighRot;
        if (p.left_shin) p.left_shin.g.rotation.x = shinRot;
        if (p.right_shin) p.right_shin.g.rotation.x = shinRot;
        if (p.left_upper_arm) p.left_upper_arm.g.rotation.x = armRot;
        if (p.right_upper_arm) p.right_upper_arm.g.rotation.x = armRot;
        if (p.torso) p.torso.g.rotation.x = torsoRot;

        this.updateCam();

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          lock.forEach(n => this._locked.delete(n));
          lock.forEach(n => {
            if (p[n]) {
              const d = p[n].defaultRot;
              p[n].g.rotation.set(d.x, d.y, d.z);
            }
          });
          this.root.position.y = startY;
          this.camTarget.y = startY + 2.0;
          this.updateCam();
          res();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  crouch(): Promise<void> {
    if (this.poseState === 'crouching') return Promise.reject(new Error('Robot is already crouching.'));
    if (this.poseState !== 'standing') return Promise.reject(new Error(`Cannot crouch from ${this.poseState} pose. Please stand up first.`));
    this.poseState = 'crouching';
    const ms = 1000;
    const t0 = performance.now();
    const lock = ['left_thigh', 'right_thigh', 'left_shin', 'right_shin', 'left_foot', 'right_foot', 'left_upper_arm', 'right_upper_arm', 'torso', 'hips'];
    lock.forEach(n => this._locked.add(n));
    
    const startPos = this.root.position.clone();
    const targetPos = startPos.clone();
    targetPos.y -= 0.5;
    targetPos.sub(this._weightShift);
    this.clampToPlatform(targetPos);
    this._weightShift.set(0, 0, 0);

    const p = this.parts;
    const startRots: Record<string, {x: number, y: number, z: number}> = {};
    lock.forEach(n => {
      if (p[n]) startRots[n] = { x: p[n].g.rotation.x, y: p[n].g.rotation.y, z: p[n].g.rotation.z };
    });

    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        this.root.position.lerpVectors(startPos, targetPos, e);
        this.preventFloorClipping();
        this.camTarget.y = this.root.position.y + 2.0;

        lock.forEach(n => {
          if (p[n]) {
             const sr = startRots[n];
             const dr = p[n].defaultRot;
             let trX = dr.x, trY = dr.y, trZ = dr.z;

             if (n === 'left_thigh' || n === 'right_thigh') trX = -1.05;
             if (n === 'left_shin' || n === 'right_shin') trX = 2.1;
             if (n === 'left_foot' || n === 'right_foot') trX = -1.05;
             if (n === 'left_upper_arm' || n === 'right_upper_arm') trX = -0.5;
             if (n === 'torso') trX = 0.3;

             p[n].g.rotation.x = sr.x + (trX - sr.x) * e;
             p[n].g.rotation.y = sr.y + (trY - sr.y) * e;
             p[n].g.rotation.z = sr.z + (trZ - sr.z) * e;
          }
        });

        this.updateCam();

        if (t < 1) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
  }

  layDown(): Promise<void> {
    if (this.poseState === 'laying') return Promise.reject(new Error('Robot is already laying down.'));
    if (this.poseState !== 'standing') return Promise.reject(new Error(`Cannot lay down from ${this.poseState} pose. Please stand up first.`));
    this.poseState = 'laying';
    const ms = 1000;
    const t0 = performance.now();
    const lock = ['left_thigh', 'right_thigh', 'left_shin', 'right_shin', 'left_upper_arm', 'right_upper_arm', 'torso', 'hips'];
    lock.forEach(n => this._locked.add(n));
    
    const startPos = this.root.position.clone();
    const targetPos = startPos.clone();
    targetPos.y = 0.1;
    targetPos.sub(this._weightShift);
    this.clampToPlatform(targetPos);
    this._weightShift.set(0, 0, 0);

    const startRotX = this.root.rotation.x;
    const targetRotX = -Math.PI / 2;

    const p = this.parts;
    const startRots: Record<string, {x: number, y: number, z: number}> = {};
    lock.forEach(n => {
      if (p[n]) startRots[n] = { x: p[n].g.rotation.x, y: p[n].g.rotation.y, z: p[n].g.rotation.z };
    });

    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        this.root.position.lerpVectors(startPos, targetPos, e);
        this.root.rotation.x = startRotX + (targetRotX - startRotX) * e;
        this.preventFloorClipping();
        this.camTarget.y = this.root.position.y + 2.0;

        lock.forEach(n => {
          if (p[n]) {
             const sr = startRots[n];
             const dr = p[n].defaultRot;
             let trX = dr.x, trY = dr.y, trZ = dr.z;

             if (n === 'left_upper_arm') trZ = -1.2;
             if (n === 'right_upper_arm') trZ = 1.2;

             p[n].g.rotation.x = sr.x + (trX - sr.x) * e;
             p[n].g.rotation.y = sr.y + (trY - sr.y) * e;
             p[n].g.rotation.z = sr.z + (trZ - sr.z) * e;
          }
        });

        this.updateCam();

        if (t < 1) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
  }

  standOnOneLeg(leg: 'left' | 'right' = 'left'): Promise<void> {
    if (this.poseState !== 'standing' && !this.poseState.startsWith('one_leg')) return Promise.reject(new Error(`Cannot stand on one leg from ${this.poseState} pose. Please stand up first.`));
    if (this.poseState === `one_leg_${leg}`) return Promise.reject(new Error(`Robot is already standing on ${leg} leg.`));
    this.poseState = `one_leg_${leg}` as any;
    const ms = 1000;
    const t0 = performance.now();
    const lock = ['left_thigh', 'right_thigh', 'left_shin', 'right_shin', 'left_upper_arm', 'right_upper_arm', 'torso', 'hips'];
    lock.forEach(n => this._locked.add(n));
    
    const startPos = this.root.position.clone();
    const shiftAmt = leg === 'left' ? -0.15 : 0.15;
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(this.root.quaternion);
    
    // Calculate the absolute target shift we want
    const desiredShiftVec = rightVector.clone().multiplyScalar(shiftAmt);
    
    // Calculate how much we need to move from current position to reach the desired shift
    const movementVec = desiredShiftVec.clone().sub(this._weightShift);
    
    const targetPos = startPos.clone().add(movementVec);
    this.clampToPlatform(targetPos);
    this._weightShift.copy(desiredShiftVec);

    const p = this.parts;
    const startRots: Record<string, {x: number, y: number, z: number}> = {};
    lock.forEach(n => {
      if (p[n]) startRots[n] = { x: p[n].g.rotation.x, y: p[n].g.rotation.y, z: p[n].g.rotation.z };
    });

    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        this.root.position.lerpVectors(startPos, targetPos, e);
        this.preventFloorClipping();

        lock.forEach(n => {
          if (p[n]) {
             const sr = startRots[n];
             const dr = p[n].defaultRot;
             let trX = dr.x, trY = dr.y, trZ = dr.z;

             if (leg === 'left') {
               if (n === 'right_thigh') trX = 1.2;
               if (n === 'right_shin') trX = 1.2;
             } else {
               if (n === 'left_thigh') trX = 1.2;
               if (n === 'left_shin') trX = 1.2;
             }

             if (n === 'left_upper_arm') trZ = -0.5;
             if (n === 'right_upper_arm') trZ = 0.5;

             p[n].g.rotation.x = sr.x + (trX - sr.x) * e;
             p[n].g.rotation.y = sr.y + (trY - sr.y) * e;
             p[n].g.rotation.z = sr.z + (trZ - sr.z) * e;
          }
        });

        this.updateCam();

        if (t < 1) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
  }

  standUp(): Promise<void> {
    if (this.poseState === 'standing') return Promise.reject(new Error('Robot is already standing.'));
    this.poseState = 'standing';
    const ms = 1000;
    const t0 = performance.now();
    const p = this.parts;
    
    const startPos = this.root.position.clone();
    const targetPos = startPos.clone();
    targetPos.y = 0;
    targetPos.sub(this._weightShift);
    this.clampToPlatform(targetPos);
    this._weightShift.set(0, 0, 0);

    const startRotX = this.root.rotation.x;
    const targetRotX = 0;

    const startRots: Record<string, {x: number, y: number, z: number}> = {};
    this._locked.forEach(n => {
      if (p[n]) {
        startRots[n] = { x: p[n].g.rotation.x, y: p[n].g.rotation.y, z: p[n].g.rotation.z };
      }
    });

    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        this.root.position.lerpVectors(startPos, targetPos, e);
        this.root.rotation.x = startRotX + (targetRotX - startRotX) * e;
        this.preventFloorClipping();
        this.camTarget.y = this.root.position.y + 2.0;

        Object.keys(startRots).forEach(n => {
          if (p[n]) {
            const sr = startRots[n];
            const dr = p[n].defaultRot;
            p[n].g.rotation.x = sr.x + (dr.x - sr.x) * e;
            p[n].g.rotation.y = sr.y + (dr.y - sr.y) * e;
            p[n].g.rotation.z = sr.z + (dr.z - sr.z) * e;
          }
        });

        this.updateCam();

        if (t < 1) requestAnimationFrame(tick);
        else {
          this._locked.clear();
          res();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  turn(deg: number): Promise<void> {
    if (this.poseState !== 'standing') return Promise.reject(new Error(`Cannot turn while ${this.poseState}. Please stand up first.`));
    const ms = 600;
    const sr = this.root.rotation.y;
    const tr = sr + deg * Math.PI / 180;
    const t0 = performance.now();
    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        this.root.rotation.y = sr + (tr - sr) * e;
        if (t < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
  }

  highlight(name: string | null) {
    if (this._hlPart) this._restoreMat(this._hlPart);
    this._hlPart = name;
    if (!name || !this.parts[name]) return;
    const g = this.parts[name].g;
    g.traverse((c: any) => {
      if (c.isMesh && c.material !== this.mats.joint && c.material !== this.mats.visor) {
        c.material = this.mats.glow;
      }
    });
  }

  _restoreMat(name: string) {
    const part = this.parts[name];
    if (!part) return;
    part.g.traverse((c: any) => {
      if (!c.isMesh) return;
      const isJoint = c.geometry instanceof THREE.SphereGeometry;
      c.material = isJoint ? this.mats.joint : this.mats.body;
    });
  }

  resetPose(animated = true): Promise<void> {
    this.poseState = 'standing';
    this._locked.clear();
    this._weightShift.set(0, 0, 0);
    Object.entries(this.parts).map(([name, part]) => {
      const d = part.defaultRot;
      const dp = part.defaultPos;
      if (!animated && dp) {
        part.g.position.set(dp.x, dp.y, dp.z);
      }
      return animated
        ? this.animateJoint(name, { x: d.x, y: d.y, z: d.z }, 500)
        : (part.g.rotation.set(d.x, d.y, d.z), Promise.resolve());
    });
    const t0 = performance.now();
    const ms = 500;
    const sx = this.root.position.x, sz = this.root.position.z, sy = this.root.rotation.y;
    const s_py = this.root.position.y, s_rx = this.root.rotation.x;
    return new Promise(res => {
      const tick = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        this.root.position.x = sx * (1 - e);
        this.root.position.y = s_py * (1 - e);
        this.root.position.z = sz * (1 - e);
        this.root.rotation.x = s_rx * (1 - e);
        this.root.rotation.y = sy * (1 - e);
        this.preventFloorClipping();
        this.camTarget.x = this.root.position.x;
        this.camTarget.y = this.root.position.y + 2.0;
        this.camTarget.z = this.root.position.z;
        this.updateCam();
        if (t < 1) requestAnimationFrame(tick);
        else { this._hlPart && this._restoreMat(this._hlPart); this._hlPart = null; res(); }
      };
      if (animated) requestAnimationFrame(tick);
      else { 
        this.root.position.set(0, 0, 0); 
        this.root.rotation.set(0, 0, 0); 
        this.preventFloorClipping();
        this.camTarget.set(0, 2.0, 0);
        this.updateCam();
        res(); 
      }
    });
  }

  stopPlayback() {
    if (this._playbackRafId !== null) {
      cancelAnimationFrame(this._playbackRafId);
      this._playbackRafId = null;
    }
  }

  getAnimPoseAtTime(anim: any, t: number) {
    const keyframes = anim.keyframes || [];
    const animatedParts = new Set<string>();
    keyframes.forEach((kf: any) => {
      Object.keys(kf.rotations).forEach(p => animatedParts.add(p));
    });

    const defaultY = this.parts.hips?.defaultPos?.y ?? 1.18;
    const sortedKfs = [...keyframes].sort((a: any, b: any) => a.time - b.time);

    const fullKeyframes = [
      {
        time: 0,
        rotations: Object.fromEntries(Array.from(animatedParts).map(p => [p, { x: 0, y: 0, z: 0 }])),
        rootOffset: { y: 0 },
        easing: 'linear' as EasingType
      },
      ...sortedKfs
    ];

    let kfIndex = 0;
    while (kfIndex < fullKeyframes.length - 1 && fullKeyframes[kfIndex + 1].time <= t) {
      kfIndex++;
    }

    const kf1 = fullKeyframes[kfIndex];
    const kf2 = fullKeyframes[Math.min(kfIndex + 1, fullKeyframes.length - 1)];

    let localT = 0;
    if (kf2.time > kf1.time) {
      localT = (t - kf1.time) / (kf2.time - kf1.time);
    }

    const easingFn = kf1.easing || 'linear';
    const easedT = applyEasing(localT, easingFn);

    return { animatedParts, kf1, kf2, easedT, defaultY };
  }

  scrubTo(anim: any, t: number) {
    const { animatedParts, kf1, kf2, easedT, defaultY } = this.getAnimPoseAtTime(anim, t);

    animatedParts.forEach(partName => {
      const r1 = kf1.rotations[partName] || { x: 0, y: 0, z: 0 };
      const r2 = kf2.rotations[partName] || { x: 0, y: 0, z: 0 };

      const x = r1.x + (r2.x - r1.x) * easedT;
      const y = r1.y + (r2.y - r1.y) * easedT;
      const z = r1.z + (r2.z - r1.z) * easedT;

      if (partName === 'root') {
        this.root.rotation.set(x, y, z);
      } else if (this.parts[partName]) {
        this.parts[partName].g.rotation.set(x, y, z);
      }
    });

    const y1 = defaultY + (kf1.rootOffset?.y ?? 0);
    const y2 = defaultY + (kf2.rootOffset?.y ?? 0);
    this.root.position.y = y1 + (y2 - y1) * easedT;

    this.clampToPlatform(this.root.position);
    this.preventFloorClipping();
    this.camTarget.y = this.root.position.y + 2.0;
    this.updateCam();
  }

  async playCustom(anim: any, onProgress?: (t: number) => void): Promise<void> {
    this.stopPlayback();
    if (this.poseState !== 'standing') await this.standUp();
    this.poseState = 'custom';

    const keyframes = anim.keyframes || [];
    const animatedParts = new Set<string>();
    keyframes.forEach((kf: any) => {
      Object.keys(kf.rotations).forEach(p => animatedParts.add(p));
    });

    const startRots: Record<string, { x: number; y: number; z: number }> = {};
    animatedParts.forEach(partName => {
      if (partName === 'root') {
        startRots['root'] = { x: this.root.rotation.x, y: this.root.rotation.y, z: this.root.rotation.z };
      } else if (this.parts[partName]) {
        const r = this.parts[partName].g.rotation;
        startRots[partName] = { x: r.x, y: r.y, z: r.z };
        this._locked.add(partName);
      }
    });

    const startY = this.root.position.y;
    const defaultY = this.parts.hips?.defaultPos?.y ?? 1.18;

    const sortedKfs = [...keyframes].sort((a: any, b: any) => a.time - b.time);
    const fullKeyframes = [
      {
        time: 0,
        rotations: Object.fromEntries(Array.from(animatedParts).map(p => [p, startRots[p] || { x: 0, y: 0, z: 0 }])),
        rootOffset: { y: startY - defaultY },
        easing: 'linear' as EasingType
      },
      ...sortedKfs
    ];

    return new Promise<void>(res => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / anim.duration, 1);

        if (onProgress) onProgress(t);

        let kfIndex = 0;
        while (kfIndex < fullKeyframes.length - 1 && fullKeyframes[kfIndex + 1].time <= t) {
          kfIndex++;
        }

        const kf1 = fullKeyframes[kfIndex];
        const kf2 = fullKeyframes[Math.min(kfIndex + 1, fullKeyframes.length - 1)];

        let localT = 0;
        if (kf2.time > kf1.time) {
          localT = (t - kf1.time) / (kf2.time - kf1.time);
        }

        const easingFn = kf1.easing || 'linear';
        const easedT = applyEasing(localT, easingFn);

        animatedParts.forEach(partName => {
          const r1 = kf1.rotations[partName] || startRots[partName] || { x: 0, y: 0, z: 0 };
          const r2 = kf2.rotations[partName] || startRots[partName] || { x: 0, y: 0, z: 0 };

          const x = r1.x + (r2.x - r1.x) * easedT;
          const y = r1.y + (r2.y - r1.y) * easedT;
          const z = r1.z + (r2.z - r1.z) * easedT;

          if (partName === 'root') {
            this.root.rotation.set(x, y, z);
          } else if (this.parts[partName]) {
            this.parts[partName].g.rotation.set(x, y, z);
          }
        });

        const y1 = defaultY + kf1.rootOffset.y;
        const y2 = defaultY + kf2.rootOffset.y;
        this.root.position.y = y1 + (y2 - y1) * easedT;

        this.clampToPlatform(this.root.position);
        this.preventFloorClipping();

        this.camTarget.y = this.root.position.y + 2.0;
        this.updateCam();

        if (t < 1) {
          this._playbackRafId = requestAnimationFrame(tick);
        } else {
          this._playbackRafId = null;
          res();
        }
      };
      this._playbackRafId = requestAnimationFrame(tick);
    });
  }

  updateIdle(dt: number) {
    this._idleT += dt;
    const t = this._idleT;
    if (!this._locked.has('torso') && this.parts.torso)
      this.parts.torso.g.scale.y = 1 + Math.sin(t * 1.1) * 0.007;
    if (!this._locked.has('head') && this.parts.head)
      this.parts.head.g.rotation.y = Math.sin(t * 0.38) * 0.22;
  }
}
