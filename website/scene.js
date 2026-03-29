/* ═══════════════════════════════════════════════════════════════
   Three.js 3D Robot Scene
   Animated floating geometric wireframes + particle field
   ═══════════════════════════════════════════════════════════════ */

(function () {
  const canvas = document.getElementById('robot-canvas');
  if (!canvas) return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.position.set(0, 0, 18);

  /* ── Palette ──────────────────────────────────────────────── */
  const C = {
    accent: 0x61afef,
    purple: 0xc678dd,
    green:  0x98c379,
    dim:    0x3e4451,
  };

  /* ── Floating wireframe bodies (robot feel) ────────────────── */
  const wireframeMat = (color) => new THREE.MeshBasicMaterial({
    color, wireframe: true, transparent: true, opacity: 0.25,
  });

  // Torso block
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 3.2, 1.6, 3, 4, 2),
    wireframeMat(C.accent)
  );
  torso.position.set(5, 1.5, -4);
  scene.add(torso);

  // Head sphere
  const head = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, 1),
    wireframeMat(C.purple)
  );
  head.position.set(5, 4.2, -4);
  scene.add(head);

  // Left arm cylinder
  const armL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.22, 2.8, 6, 4, true),
    wireframeMat(C.green)
  );
  armL.position.set(3.2, 1.8, -4);
  armL.rotation.z = 0.3;
  scene.add(armL);

  // Right arm cylinder
  const armR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.22, 2.8, 6, 4, true),
    wireframeMat(C.green)
  );
  armR.position.set(6.8, 1.8, -4);
  armR.rotation.z = -0.3;
  scene.add(armR);

  // Leg cylinders
  const legL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.26, 3.2, 6, 4, true),
    wireframeMat(C.dim)
  );
  legL.position.set(4.2, -1.8, -4);
  scene.add(legL);

  const legR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.26, 3.2, 6, 4, true),
    wireframeMat(C.dim)
  );
  legR.position.set(5.8, -1.8, -4);
  scene.add(legR);

  const robotParts = [torso, head, armL, armR, legL, legR];

  /* ── Floating tech shapes ──────────────────────────────────── */
  const shapes = [];
  const geos = [
    new THREE.OctahedronGeometry(0.6, 0),
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.TorusGeometry(0.5, 0.15, 8, 12),
    new THREE.DodecahedronGeometry(0.45, 0),
    new THREE.BoxGeometry(0.7, 0.7, 0.7, 1, 1, 1),
  ];
  const colors = [C.accent, C.purple, C.green, C.dim, C.accent];

  for (let i = 0; i < 12; i++) {
    const geo = geos[i % geos.length];
    const mesh = new THREE.Mesh(geo, wireframeMat(colors[i % colors.length]));
    mesh.position.set(
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 10 - 5
    );
    mesh.userData = {
      speedX: (Math.random() - 0.5) * 0.008,
      speedY: (Math.random() - 0.5) * 0.008,
      rotX:   (Math.random() - 0.5) * 0.012,
      rotY:   (Math.random() - 0.5) * 0.012,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  /* ── Particle cloud ────────────────────────────────────────── */
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    color: C.accent,
    size: 0.04,
    transparent: true,
    opacity: 0.45,
  }));
  scene.add(particles);

  /* ── Grid floor ────────────────────────────────────────────── */
  const grid = new THREE.GridHelper(40, 40, 0x1e2228, 0x1e2228);
  grid.position.y = -6;
  grid.material.transparent = true;
  grid.material.opacity = 0.25;
  scene.add(grid);

  /* ── Mouse parallax ────────────────────────────────────────── */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ── Animation ─────────────────────────────────────────────── */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    // Robot breathing / idle
    robotParts.forEach((part, i) => {
      part.position.y += Math.sin(t * 1.5 + i * 0.5) * 0.002;
      part.rotation.y += 0.002;
    });

    // Arms swing
    armL.rotation.x = Math.sin(t * 2) * 0.15;
    armR.rotation.x = Math.sin(t * 2 + Math.PI) * 0.15;

    // Head look
    head.rotation.y = Math.sin(t * 0.8) * 0.3;
    head.rotation.x = Math.sin(t * 0.5) * 0.1;

    // Floating shapes
    shapes.forEach((s) => {
      s.position.x += s.userData.speedX;
      s.position.y += s.userData.speedY;
      s.rotation.x += s.userData.rotX;
      s.rotation.y += s.userData.rotY;

      // Wrap around
      if (s.position.x > 16) s.position.x = -16;
      if (s.position.x < -16) s.position.x = 16;
      if (s.position.y > 10) s.position.y = -10;
      if (s.position.y < -10) s.position.y = 10;
    });

    // Particles drift
    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;

    // Grid rotation
    grid.rotation.y += 0.0005;

    // Camera parallax
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;
    camera.lookAt(2, 0, -4);

    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize ────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
