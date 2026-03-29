import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

    /* ─── Robot Wireframe (Humanoid) ─── */
    const robot = new THREE.Group();
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x61afef, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.25 
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 1), wireframeMaterial);
    robot.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), wireframeMaterial);
    head.position.y = 2.2;
    robot.add(head);

    // Arms
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 0.5), wireframeMaterial);
    leftArm.position.set(-1.4, 0.3, 0);
    leftArm.rotation.z = 0.2;
    robot.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 0.5), wireframeMaterial);
    rightArm.position.set(1.4, 0.3, 0);
    rightArm.rotation.z = -0.2;
    robot.add(rightArm);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3, 0.7), wireframeMaterial);
    leftLeg.position.set(-0.6, -3.2, 0);
    robot.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3, 0.7), wireframeMaterial);
    rightLeg.position.set(0.6, -3.2, 0);
    robot.add(rightLeg);

    robot.position.set(2, 0, -5);
    scene.add(robot);

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
      robot.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      robot.rotation.y += 0.002;

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
      camera.lookAt(2, 0, -4);

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
