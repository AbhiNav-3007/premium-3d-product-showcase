/* ════════════════════════════════════════════════════
   THREE-SCENE.JS – 3D Bottle Model, Lighting, Pump
   ════════════════════════════════════════════════════ */

// ── Globals exported for app.js ───────────────────────
let scene, camera, renderer;
let bottleGroup;      // root group for bottle + pump
let bodyMaterial;     // so app.js can change roughness etc.
let labelTex;         // canvas texture
let labelCanvas, labelCtx;

// Pump parts (needed for click detection + animation)
let stemMesh, headBody, headDome, nozzleGroup, tipSphere, spoutMesh;
let collarMesh, lipMesh;

// ── Config ────────────────────────────────────────────
const BOTTLE_TILT = 0.02; // ~1 degree forward tilt (flat depth, sideways X-Y plane tilt)
const BOTTLE_Y_ROT = Math.PI + 0.25; // default Y rotation (label faces viewer)

// ── Label Canvas ──────────────────────────────────────
function createLabelCanvas() {
  labelCanvas = document.createElement('canvas');
  labelCanvas.width = 2048;
  labelCanvas.height = 2048;
  labelCtx = labelCanvas.getContext('2d');
  labelTex = new THREE.CanvasTexture(labelCanvas);
  labelTex.encoding = THREE.sRGBEncoding;
  labelTex.minFilter = THREE.LinearMipmapLinearFilter;
  labelTex.magFilter = THREE.LinearFilter;
  labelTex.anisotropy = 16;
}

function drawLabel(hex) {
  const W = 2048, H = 2048;
  labelCtx.clearRect(0, 0, W, H);

  // Base deep purple color fill
  labelCtx.fillStyle = hex;
  labelCtx.fillRect(0, 0, W, H);

  // Slightly darker at edges for depth / curvature feeling
  const edgeDark = labelCtx.createLinearGradient(0, 0, W, 0);
  edgeDark.addColorStop(0,    'rgba(0,0,0,0.22)');
  edgeDark.addColorStop(0.15, 'rgba(0,0,0,0.04)');
  edgeDark.addColorStop(0.5,  'rgba(0,0,0,0.00)');
  edgeDark.addColorStop(0.85, 'rgba(0,0,0,0.04)');
  edgeDark.addColorStop(1,    'rgba(0,0,0,0.22)');
  labelCtx.fillStyle = edgeDark;
  labelCtx.fillRect(0, 0, W, H);

  // Strong front upper-corner specular highlight (white shine from top-left)
  // This bakes the light reflection directly into the texture for maximum visual impact
  const shine = labelCtx.createRadialGradient(320, 280, 10, 400, 380, 520);
  shine.addColorStop(0,    'rgba(255,255,255,0.42)');
  shine.addColorStop(0.3,  'rgba(255,255,255,0.18)');
  shine.addColorStop(0.65, 'rgba(255,255,255,0.04)');
  shine.addColorStop(1,    'rgba(255,255,255,0.00)');
  labelCtx.fillStyle = shine;
  labelCtx.fillRect(0, 0, W, H);

  // --- FRONT SIDE (Centered at X = 512) ---
  const cxFront = 512;
  labelCtx.fillStyle = 'rgba(255,255,255,0.95)';
  labelCtx.textAlign = 'center';
  labelCtx.textBaseline = 'middle';

  // "bolly" branding
  labelCtx.font = '900 380px "Outfit", sans-serif';
  labelCtx.fillText('bolly', cxFront, H * 0.44);

  // "Clarity"
  labelCtx.font = '700 130px "Outfit", sans-serif';
  labelCtx.fillText('Clarity', cxFront, H * 0.62);

  // "Anti Dandruff Shampoo"
  labelCtx.font = '400 58px "Outfit", sans-serif';
  labelCtx.fillText('Anti Dandruff', cxFront, H * 0.69);
  labelCtx.fillText('Shampoo', cxFront, H * 0.73);

  // "250ml | 8.45 fl oz"
  labelCtx.font = '500 50px "Outfit", sans-serif';
  labelCtx.fillText('250ml | 8.45 fl oz', cxFront, H * 0.82);


  // --- LEFT SIDE TEXT (Centered at X = 150) ---
  labelCtx.save();
  labelCtx.translate(130, H * 0.45);
  labelCtx.rotate(-Math.PI / 2);
  labelCtx.fillStyle = 'rgba(255,255,255,0.8)';
  labelCtx.font = '400 48px "Outfit", sans-serif';
  labelCtx.textAlign = 'center';
  labelCtx.fillText('Shampoo', 0, 0);
  labelCtx.restore();


  // --- BACK SIDE (Centered at X = 1536) ---
  const cxBack = 1536;
  labelCtx.fillStyle = 'rgba(255,255,255,0.9)';
  labelCtx.textAlign = 'center';

  // Title on back
  labelCtx.font = '700 80px "Outfit", sans-serif';
  labelCtx.fillText('Clarity', cxBack, H * 0.22);
  labelCtx.font = '400 48px "Outfit", sans-serif';
  labelCtx.fillText('Anti Dandruff Shampoo', cxBack, H * 0.27);

  // Description
  labelCtx.font = '400 36px "Outfit", sans-serif';
  const descLines = [
    'With the goodness of',
    'natural actives for a healthy',
    'scalp and strong hair.'
  ];
  descLines.forEach((line, idx) => {
    labelCtx.fillText(line, cxBack, H * 0.36 + idx * 48);
  });

  // Icons placeholder drawings
  const iconY = H * 0.56;
  const iconSpacing = 160;
  const icons = [
    { label: 'No Parabens', icon: 'Ⓟ' },
    { label: 'No Sulphates', icon: 'Ⓢ' },
    { label: 'Cruelty Free', icon: '🐰' }
  ];
  icons.forEach((ico, idx) => {
    const x = cxBack + (idx - 1) * iconSpacing;
    // draw small white circle outline
    labelCtx.strokeStyle = 'rgba(255,255,255,0.7)';
    labelCtx.lineWidth = 4;
    labelCtx.beginPath();
    labelCtx.arc(x, iconY, 45, 0, Math.PI * 2);
    labelCtx.stroke();
    // draw icon char
    labelCtx.font = '500 40px "Outfit", sans-serif';
    labelCtx.fillText(ico.icon, x, iconY + 2);
    // label text below
    labelCtx.font = '600 24px "Outfit", sans-serif';
    labelCtx.fillText(ico.label, x, iconY + 75);
  });

  // Barcode representation
  const barY = H * 0.78;
  labelCtx.fillStyle = 'rgba(255,255,255,0.85)';
  labelCtx.fillRect(cxBack - 140, barY, 280, 100);

  // Black stripes inside barcode
  labelCtx.fillStyle = '#000';
  let currX = cxBack - 130;
  while (currX < cxBack + 130) {
    const w = 4 + Math.floor(Math.random() * 12);
    labelCtx.fillRect(currX, barY + 5, w, 70);
    currX += w + 4 + Math.floor(Math.random() * 8);
  }
  // Barcode numbers
  labelCtx.fillStyle = 'rgba(255,255,255,0.8)';
  labelCtx.font = '500 28px monospace';
  labelCtx.fillText('5 901234 567890', cxBack, barY + 90);

  labelTex.needsUpdate = true;
}

// ── Build Bottle Body ─────────────────
function buildBottle() {
  createLabelCanvas();
  drawLabel('#4A2FA8'); // Deep rich dark purple

  // Slightly taller cylinder than before (little more height as requested)
  const pts = [
    new THREE.Vector2(0.00,  0.00),  // center bottom
    new THREE.Vector2(0.92,  0.00),  // base flat
    new THREE.Vector2(1.05,  0.07),  // base chamfer
    new THREE.Vector2(1.09,  0.25),  // lower wall flare
    new THREE.Vector2(1.10,  0.65),  // lower straight wall
    new THREE.Vector2(1.10,  1.15),  // mid wall
    new THREE.Vector2(1.10,  1.75),  // upper mid wall (slightly taller)
    new THREE.Vector2(1.09,  2.05),  // upper wall
    new THREE.Vector2(1.03,  2.22),  // pre-shoulder
    new THREE.Vector2(0.88,  2.36),  // shoulder curve
    new THREE.Vector2(0.62,  2.48),  // neck transition
    new THREE.Vector2(0.42,  2.56),  // neck
    new THREE.Vector2(0.36,  2.64),  // neck top
  ];

  const bodyGeo = new THREE.LatheGeometry(pts, 96);
  bodyGeo.computeVertexNormals();

  // Deep dark shiny purple – glossy premium plastic
  bodyMaterial = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.16,
    metalness: 0.10,
    envMapIntensity: 1.8,
  });

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bodyMesh.rotation.y = Math.PI - 0.72; // align label text with nozzle pointing left
  bodyMesh.name = 'bottleBody';

  // Flat bottom cap
  const capMesh = new THREE.Mesh(
    new THREE.CircleGeometry(1.04, 64),
    bodyMaterial
  );
  capMesh.rotation.x = -Math.PI / 2;
  capMesh.position.y = 0.005;
  capMesh.name = 'bottleCap';

  bottleGroup = new THREE.Group();
  bottleGroup.add(bodyMesh, capMesh);
}

// ── Build Pump – CAD spec: 24-410 lotion pump dispenser
//    Ribbed threaded collar | cylindrical plunger stem | saddle-head actuator
function buildPump() {
  // Matte whitish-grey plastic – rough 0.4 per spec
  const white = new THREE.MeshStandardMaterial({
    color: 0xEDEBE8,
    roughness: 0.40,
    metalness: 0.02,
  });
  // Slightly less rough for the saddle head surface
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xF2F0ED,
    roughness: 0.35,
    metalness: 0.02,
  });

  const SY = 2.52; // shoulder Y matching new taller bottle neck top

  // ─────────────────────────────────────────────────
  // 1. RIBBED THREADED BASE COLLAR (24-410 standard)
  // ─────────────────────────────────────────────────
  // Main collar body (wide, solid)
  collarMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.54, 0.28, 64),
    white
  );
  collarMesh.position.y = SY + 0.14;
  collarMesh.castShadow = true;
  collarMesh.name = 'pumpCollar';
  bottleGroup.add(collarMesh);

  // Ribbed texture on collar – add 8 thin vertical rib rings
  for (let r = 0; r < 8; r++) {
    const ribAngle = (r / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.26, 0.04),
      white
    );
    rib.position.set(
      Math.cos(ribAngle) * 0.53,
      SY + 0.14,
      Math.sin(ribAngle) * 0.53
    );
    rib.rotation.y = ribAngle;
    rib.name = 'pumpRib_' + r;
    bottleGroup.add(rib);
  }

  // Lower lip that seats on bottle neck
  lipMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.47, 0.52, 0.10, 64),
    white
  );
  lipMesh.position.y = SY - 0.05;
  lipMesh.name = 'pumpLip';
  bottleGroup.add(lipMesh);

  // Collar top cap (flat disc)
  const collarTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.52, 0.04, 64),
    white
  );
  collarTop.position.y = SY + 0.30;
  collarTop.name = 'pumpCollarTop';
  bottleGroup.add(collarTop);

  // ─────────────────────────────────────────────────
  // 2. UNIFORM CYLINDRICAL TELESCOPING PLUNGER STEM
  // ─────────────────────────────────────────────────
  const STEM_R = 0.095; // uniform cylindrical – same top & bottom
  const STEM_BOT = SY + 0.34;
  const STEM_H = 0.90;
  stemMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(STEM_R, STEM_R, STEM_H, 48), // perfectly cylindrical
    white
  );
  stemMesh.position.y = STEM_BOT + STEM_H * 0.5;
  stemMesh.castShadow = true;
  stemMesh.name = 'pumpStem';
  bottleGroup.add(stemMesh);

  // ─────────────────────────────────────────────────
  // 3. SMOOTH SADDLE-HEAD ACTUATOR (nozzle integrated)
  //    Wide rounded pad with integrated nozzle channel
  // ─────────────────────────────────────────────────
  const HEAD_Y = STEM_BOT + STEM_H;
  const HEAD_R = 0.46;

  // Main head disc (slightly tapered – saddle effect)
  headBody = new THREE.Mesh(
    new THREE.CylinderGeometry(HEAD_R, HEAD_R * 0.90, 0.16, 64),
    headMat
  );
  headBody.position.y = HEAD_Y + 0.08;
  headBody.castShadow = true;
  headBody.name = 'pumpHead';
  bottleGroup.add(headBody);

  // Rounded dome cap (smooth saddle top)
  headDome = new THREE.Mesh(
    new THREE.SphereGeometry(HEAD_R, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.30),
    headMat
  );
  headDome.position.y = HEAD_Y + 0.16;
  headDome.name = 'pumpDome';
  bottleGroup.add(headDome);

  // Stem collar insert (ring where stem enters head)
  const stemRing = new THREE.Mesh(
    new THREE.CylinderGeometry(STEM_R + 0.025, STEM_R + 0.04, 0.08, 40),
    white
  );
  stemRing.position.y = HEAD_Y + 0.02;
  stemRing.name = 'pumpStemRing';
  bottleGroup.add(stemRing);

  // ─────────────────────────────────────────────────
  // 4. NOZZLE ARM (smooth, clean tube from side of head)
  // ─────────────────────────────────────────────────
  const NR = 0.060;
  const NZ_Y = HEAD_Y + 0.08;
  const ARM = 0.82;

  nozzleGroup = new THREE.Group();
  nozzleGroup.position.set(0, NZ_Y, 0);
  nozzleGroup.name = 'nozzleGroup';

  // Exit port stub from head side (smooth flush join)
  const rootStub = new THREE.Mesh(
    new THREE.CylinderGeometry(NR, NR, 0.16, 32),
    white
  );
  rootStub.rotation.z = Math.PI / 2;
  rootStub.position.x = HEAD_R + 0.06;
  rootStub.name = 'nozzleRoot';
  nozzleGroup.add(rootStub);

  // Main nozzle arm (uniform tube, slight taper at tip)
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(NR, NR * 0.82, ARM, 32),
    white
  );
  arm.rotation.z = Math.PI / 2;
  arm.position.x = HEAD_R + 0.16 + ARM * 0.5;
  arm.name = 'nozzleArm';
  nozzleGroup.add(arm);

  nozzleGroup.rotation.z = -0.10; // slight upward angle

  // Elbow transition sphere
  const elbX = HEAD_R + 0.16 + ARM;
  const elbow = new THREE.Mesh(new THREE.SphereGeometry(NR * 1.02, 32, 32), white);
  elbow.position.x = elbX;
  elbow.name = 'nozzleElbow';
  nozzleGroup.add(elbow);

  // Downward dispensing spout
  const SPOUT = 0.36;
  spoutMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(NR * 0.75, NR * 0.55, SPOUT, 28),
    white
  );
  spoutMesh.rotation.z = 0.20;
  spoutMesh.position.set(
    elbX + Math.sin(0.20) * SPOUT * 0.5,
    -SPOUT * 0.5 * Math.cos(0.20),
    0
  );
  spoutMesh.castShadow = true;
  spoutMesh.name = 'nozzleSpout';
  nozzleGroup.add(spoutMesh);

  // Dispensing tip
  tipSphere = new THREE.Mesh(new THREE.SphereGeometry(NR * 0.55, 24, 24), white);
  tipSphere.position.set(
    elbX + Math.sin(0.20) * SPOUT,
    -SPOUT * Math.cos(0.20),
    0
  );
  tipSphere.name = 'nozzleTip';
  nozzleGroup.add(tipSphere);

  bottleGroup.add(nozzleGroup);
}

// ── Lighting ───────────────────────────────────
function setupLighting() {
  // Ambient – cool-purple tinted for depth
  scene.add(new THREE.AmbientLight(0xE8E0FF, 0.45));

  // Key light – strong right-top for main illumination
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(5, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -2;
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  scene.add(key);

  // FRONT UPPER-LEFT CORNER highlight – the bright specular reflection the user wants
  // This creates the glossy "shine" visible from the front-upper-left corner
  const frontHighlight = new THREE.DirectionalLight(0xFFFFFF, 2.8);
  frontHighlight.position.set(-3.5, 5, 6); // front-upper-left
  scene.add(frontHighlight);

  // Secondary front specular – slightly warmer, broader
  const frontWarm = new THREE.DirectionalLight(0xF0EEFF, 1.2);
  frontWarm.position.set(-2, 4, 7);
  scene.add(frontWarm);

  // Fill light – purple-tinted from the right for color depth
  const fill = new THREE.DirectionalLight(0xC8B8FF, 0.7);
  fill.position.set(4, 2, 3);
  scene.add(fill);

  // Rim / back light for edge separation
  const rim = new THREE.DirectionalLight(0xffffff, 0.9);
  rim.position.set(3, 5, -6);
  scene.add(rim);

  // Top-down light for shoulder shine
  const top = new THREE.DirectionalLight(0xffffff, 0.5);
  top.position.set(0, 10, 1);
  scene.add(top);
}

// ── Init Three.js Scene ───────────────────────────────
function initThreeScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 8.5);

  const container = document.getElementById('three-container');
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // Build model
  buildBottle();
  buildPump();

  // Set fixed position & tilt – NO bobbing, NO jumping
  bottleGroup.position.set(0, -0.22, 0);
  bottleGroup.rotation.set(0.05, Math.PI, -0.32);
  bottleGroup.scale.set(0.68, 0.68, 0.68);

  scene.add(bottleGroup);

  // Lighting
  setupLighting();

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ── Get spout tip screen position ─────────────────────
function getSpoutScreenPos() {
  const v = new THREE.Vector3();
  tipSphere.getWorldPosition(v);
  v.project(camera);
  return {
    x: (v.x * 0.5 + 0.5) * window.innerWidth,
    y: (v.y * -0.5 + 0.5) * window.innerHeight
  };
}

// ── Get pump dome screen position ─────────────────────
function getCapScreenPos() {
  if (!headDome) return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3 };
  const v = new THREE.Vector3();
  headDome.getWorldPosition(v);
  v.project(camera);
  return {
    x: (v.x * 0.5 + 0.5) * window.innerWidth,
    y: (v.y * -0.5 + 0.5) * window.innerHeight
  };
}

// ── Check if a mesh is part of the pump ───────────────
function isPumpPart(obj) {
  if (!obj) return false;
  const pumpNames = ['pumpCollar', 'pumpLip', 'pumpStem', 'pumpHead', 'pumpDome', 'pumpCollarTop', 'pumpStemRing',
    'nozzleGroup', 'nozzleRoot', 'nozzleArm', 'nozzleElbow', 'nozzleSpout', 'nozzleTip'];
  // Check object itself and its parent
  if (pumpNames.includes(obj.name)) return true;
  if (obj.parent && pumpNames.includes(obj.parent.name)) return true;
  // Check rib parts too
  if (obj.name && obj.name.startsWith('pumpRib_')) return true;
  return false;
}

