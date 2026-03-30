import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 8;

    /* ─── Lighting ─── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x61afef, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    /* ─── Robot Model Loading ─── */
    const MODEL_URL = '/models/robot.glb'; // EDIT THIS PATH ANYTIME TO SWAP MODELS
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const loader = new GLTFLoader();
    
    // Wireframe material for background shapes and fallback
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x61afef, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.25 
    });

    loader.load(
      MODEL_URL,
      (gltf: any) => {
        const model = gltf.scene;

        // 1. Calculate Bounding Box for "Auto-Scaling"
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // 2. Center the Model Pivot
        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);

        // 3. Scale to a Standard Viz Height (e.g., 5 units tall)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.setScalar(scale);

        robotGroup.add(model);
        robotGroup.position.set(-4.5, 0, -5);
      },
      (xhr: ProgressEvent) => {
        console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error: ErrorEvent | any) => {
        console.error('Model failed to load:', error);
        // Fallback: Show a simple wireframe sphere if model missing
        const fallback = new THREE.Mesh(
          new THREE.IcosahedronGeometry(2, 1),
          wireframeMaterial
        );
        robotGroup.add(fallback);
        robotGroup.position.set(-4.5, 0, -5);
      }
    );

    /* ─── Floating Shapes ─── */
    const shapes: THREE.Mesh[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.4, 0),
      new THREE.TorusGeometry(0.3, 0.1, 8, 16),
      new THREE.DodecahedronGeometry(0.4, 0),
      new THREE.BoxGeometry(0.4, 0.4, 0.4)
    ];

    for (let i = 0; i < 12; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mesh = new THREE.Mesh(geo, wireframeMaterial);
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      shapes.push(mesh);
    }

    /* ─── Particles ─── */
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 600;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 25;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.5
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    /* ─── Grid ─── */
    const grid = new THREE.GridHelper(40, 40, 0x61afef, 0x1e242e);
    grid.position.y = -6;
    grid.material.transparent = true;
    grid.material.opacity = 0.15;
    scene.add(grid);

    /* ─── Mouse Tracking ─── */
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    /* ─── Animation ─── */
    const animate = () => {
      requestAnimationFrame(animate);

      // Idle breathing for robot
      robotGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      robotGroup.rotation.y += 0.002;

      // Shapes animation
      shapes.forEach((s) => {
        s.rotation.x += 0.005;
        s.rotation.y += 0.005;
        s.position.y += 0.002;
        if (s.position.y > 10) s.position.y = -10;
        if (s.position.x > 16) s.position.x = -16;
        if (s.position.x < -16) s.position.x = 16;
      });

      // Particles & Grid
      particles.rotation.y += 0.0003;
      grid.rotation.y += 0.0005;

      // Camera parallax
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;
      camera.lookAt(-4.5, 0, -4);

      renderer.render(scene, camera);
    };

    animate();

    /* ─── Resize ─── */
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    /* ─── Cleanup ─── */
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach(g => g.dispose());
      wireframeMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 0, 
        pointerEvents: 'none', 
        opacity: 0.45 
      }} 
    />
  );
};

export default ThreeScene;
