import * as THREE from 'three';
import { Humanoid } from './Humanoid';
import { Queue } from './Queue';

export class SceneManager {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  bot: Humanoid;
  camTarget: THREE.Vector3;
  orbit: { r: number; th: number; ph: number };
  drag = false;
  lx = 0;
  ly = 0;
  last = performance.now();
  animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x21252b);
    this.scene.fog = new THREE.Fog(0x21252b, 18, 38);

    this.camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    this.camTarget = new THREE.Vector3(0, 2.0, 0);
    this.orbit = { r: 7.5, th: 0.35, ph: 1.1 };

    this.updateCam();

    // Lights
    this.scene.add(new THREE.AmbientLight(0x8899bb, 0.9));
    const sun = new THREE.DirectionalLight(0xfff4e8, 1.5);
    sun.position.set(5, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 9, bottom: -1, near: 0.5, far: 30 });
    this.scene.add(sun);
    
    const fill = new THREE.DirectionalLight(0x3366aa, 0.55);
    fill.position.set(-4, 5, -4);
    this.scene.add(fill);
    
    const rim = new THREE.DirectionalLight(0x00aaff, 0.3);
    rim.position.set(0, 6, -7);
    this.scene.add(rim);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x282c34, roughness: 0.95, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    const grid = new THREE.GridHelper(40, 40, 0x3e4451, 0x2c313a);
    grid.position.y = 0.001;
    this.scene.add(grid);

    this.bot = new Humanoid(this.scene, this.camTarget, this.updateCam.bind(this));

    this.setupEvents(canvas);
    this.resize(canvas.parentElement!);
    this.loop();
  }

  updateCam() {
    this.camera.position.set(
      this.camTarget.x + this.orbit.r * Math.sin(this.orbit.ph) * Math.sin(this.orbit.th),
      this.camTarget.y - 1.5 + this.orbit.r * Math.cos(this.orbit.ph),
      this.camTarget.z + this.orbit.r * Math.sin(this.orbit.ph) * Math.cos(this.orbit.th)
    );
    this.camera.lookAt(this.camTarget);
  }

  setupEvents(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', e => { this.drag = true; this.lx = e.clientX; this.ly = e.clientY; });
    window.addEventListener('mouseup', () => this.drag = false);
    window.addEventListener('mousemove', e => {
      if (!this.drag) return;
      this.orbit.th -= (e.clientX - this.lx) * 0.007;
      this.orbit.ph = Math.max(0.14, Math.min(Math.PI / 2.1, this.orbit.ph + (e.clientY - this.ly) * 0.007));
      this.lx = e.clientX; this.ly = e.clientY;
      this.updateCam();
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.orbit.r = Math.max(3, Math.min(18, this.orbit.r + e.deltaY * 0.011));
      this.updateCam();
    }, { passive: false });
  }

  resize(el: HTMLElement) {
    if (!el) return;
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.camera.aspect = el.clientWidth / el.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  loop = () => {
    this.animationId = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    
    if (!Queue.running) {
      this.bot.updateIdle(dt);
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}
