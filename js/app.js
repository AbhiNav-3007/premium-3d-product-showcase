/* ════════════════════════════════════════════════════
   APP.JS – Master controller
   Wires up: loading, cursor overlays, particles,
   scroll logic, pump interaction, ingredients, benefits, reviews
   ════════════════════════════════════════════════════ */

// ── Safe wrappers for sounds.js functions to prevent caching / loading order crashes ──
function safePlayHum() { if (typeof playHum === 'function') playHum(); }
function safeStopHum() { if (typeof stopHum === 'function') stopHum(); }
function safePlayClick() { if (typeof playClick === 'function') playClick(); }
function safePlayTick() { if (typeof playTick === 'function') playTick(); }
function safePlayBubble() { if (typeof playBubble === 'function') playBubble(); }
function safePlaySquish() { if (typeof playSquish === 'function') playSquish(); }
function safePlayChime() { if (typeof playChime === 'function') playChime(); }
function safeStartLatherSound() { if (typeof startLatherSound === 'function') startLatherSound(); }
function safeStopLatherSound() { if (typeof stopLatherSound === 'function') stopLatherSound(); }

// ══════════════════════════════════════════════════════
//  LOADING SCREEN
// ══════════════════════════════════════════════════════
let loadPct = 0;
const liquidRect = document.getElementById('liquid-fill');
const pctLabel = document.getElementById('percent-label');
const loadScreen = document.getElementById('loading-screen');

const loadInterval = setInterval(() => {
  loadPct++;
  if (liquidRect) liquidRect.setAttribute('y', 220 - 220 * (loadPct / 100));
  if (pctLabel) pctLabel.textContent = loadPct + '%';
  if (loadPct >= 100) {
    clearInterval(loadInterval);
    setTimeout(finishLoading, 400);
  }
}, 20);

// Click anywhere to init audio context (browser policy)
document.addEventListener('click', function audioInit() {
  initAudio();
  safePlayHum();
  document.removeEventListener('click', audioInit);
}, { once: true });

function finishLoading() {
  safeStopHum();
  if (loadScreen) loadScreen.classList.add('loaded');
  // Trigger hero text reveal
  setTimeout(() => {
    const headline = document.getElementById('hero-headline');
    if (headline) headline.classList.add('visible');
    const desc = document.querySelector('.hero-desc');
    if (desc) desc.classList.add('show');
    const btns = document.querySelector('.hero-btns');
    if (btns) btns.classList.add('show');
  }, 250);
}

// ══════════════════════════════════════════════════════
//  PARTICLES (Background canvas)
// ══════════════════════════════════════════════════════
const pCanvas = document.getElementById('particles-canvas');
const pCtx = pCanvas ? pCanvas.getContext('2d') : null;
let particles = [];

if (pCanvas && pCtx) {
  function resizeParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeParticles);
  resizeParticles();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * pCanvas.width;
      this.y = pCanvas.height + Math.random() * 200;
      this.speed = 0.25 + Math.random() * 0.4;
      this.size = 2 + Math.random() * 3.5;
      this.opacity = 0.04 + Math.random() * 0.08;
      this.t = Math.random() * 100;
      this.freq = 0.005 + Math.random() * 0.005;
    }
    update() {
      this.y -= this.speed;
      this.t += this.freq;
      this.x += Math.sin(this.t) * 0.12;
      if (this.y < -30) this.reset();
    }
    draw() {
      pCtx.beginPath();
      pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(123,111,208,${this.opacity})`;
      pCtx.fill();
    }
  }

  for (let i = 0; i < 22; i++) particles.push(new Particle());

  function drawParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// ══════════════════════════════════════════════════════
//  NAVBAR SCROLL EFFECT + ACTIVE SECTION TRACKING
// ══════════════════════════════════════════════════════
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sectionIds = ['hero', 'features', 'why-choose', 'ingredients', 'benefits', 'usage', 'reviews', 'cta', 'contact'];

window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  let current = 'hero';
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 240) current = id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
});

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    safePlayClick();
    const target = document.getElementById(link.dataset.section);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    safePlayClick();
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ══════════════════════════════════════════════════════
//  REVIEWS MARQUEE
// ══════════════════════════════════════════════════════
const REVIEWS = [
  { name: 'David Miller', text: 'No more flakes on my shirts. Absolutely brilliant formulation.', pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80' },
  { name: 'Sarah Connor', text: 'The cooling sensation stopped my itchy scalp immediately.', pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80' },
  { name: 'Elena Rostova', text: 'After 2 weeks my hair feels stronger and dandruff is gone!', pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80' },
  { name: 'James Carter', text: 'Clean scent, zero sulfates. Amazing everyday shampoo.', pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80' },
  { name: 'Amelia Gray', text: 'Cleanses deeply without drying my long curls.', pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80' },
];

const reviewsTrack = document.getElementById('reviews-track');
if (reviewsTrack) {
  [...REVIEWS, ...REVIEWS].forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-card glass-card';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="${r.pic}" class="review-avatar" alt="${r.name}" />
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-stars">⭐⭐⭐⭐⭐</div>
        </div>
      </div>
      <p class="review-text">"${r.text}"</p>
    `;
    reviewsTrack.appendChild(card);
  });
}

// ══════════════════════════════════════════════════════
//  INGREDIENTS BUBBLES & FOAM SIMULATION
// ══════════════════════════════════════════════════════
const INGREDIENTS = [
  { name: 'Tea Tree Oil', benefit: 'Dandruff Defense', desc: 'Naturally purifies roots and inhibits dandruff-causing fungi.', icon: '🍃', why: 'Chosen for its high efficacy against Malassezia' },
  { name: 'Aloe Vera', benefit: 'Scalp Soothing', desc: 'Moisturizes and soothes dry, itchy scalp cells.', icon: '🌵', why: 'Rich in proteolytic enzymes to repair dead cells' },
  { name: 'Neem Extract', benefit: 'Deep Cleansing', desc: 'Detoxifies follicles and prevents dandruff recurrence.', icon: '🌿', why: 'Antifungal agent that keeps the scalp clear' },
  { name: 'Vitamin E', benefit: 'Cell Repair', desc: 'Antioxidants rebuild damaged scalp skin barriers.', icon: '💧', why: 'Provides vital support against oxidising stressors' },
  { name: 'Biotin', benefit: 'Strand Strength', desc: 'Rebuilds keratin layers from the follicle base.', icon: '✨', why: 'Supports natural hair growth and thickness' },
];

const bubblesContainer = document.getElementById('bubbles-container');
const bubbleEls = [];
let hoveredIngIdx = -1;
let clickedIngIdx = -1;
let lastScrollActiveIdx = -1;

if (bubblesContainer) {
  INGREDIENTS.forEach((ing, i) => {
    const el = document.createElement('div');
    el.className = 'ingredient-bubble';
    el.style.width = '76px';
    el.style.height = '76px';
    el.innerHTML = `<span>${ing.icon}</span>`;
    bubblesContainer.appendChild(el);
    bubbleEls.push(el);

    // Initial spiral layout positions
    const angle = (i / INGREDIENTS.length) * Math.PI * 2;
    const radius = 240;
    el._defX = Math.cos(angle) * radius;
    el._defY = Math.sin(angle) * radius;
    el.style.transform = `translate(${el._defX}px, ${el._defY}px)`;

    el.addEventListener('mouseenter', () => {
      hoveredIngIdx = i;
      safePlayTick();
    });
    el.addEventListener('mouseleave', () => {
      if (hoveredIngIdx === i) hoveredIngIdx = -1;
    });
    el.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent document click listener from closing it instantly
      clickedIngIdx = i;
      safePlayBubble();
    });
  });
}

// Click anywhere on document to close a locked/clicked bubble
document.addEventListener('click', (e) => {
  if (!e.target.closest('.ingredient-bubble')) {
    clickedIngIdx = -1;
  }
});

// Procedural foam lather bubbles that rise up from the bottom corners (with glossy 3D reflections)
let activeLatherBubbles = [];
function spawnLatherBubble(side) {
  const b = document.createElement('div');
  b.className = 'lather-bubble';
  const size = 16 + Math.random() * 28; // slightly bigger, recognizable bubbles
  b.style.width = size + 'px';
  b.style.height = size + 'px';

  // Spawn position spread horizontally
  let startX = 0;
  if (side === 'left') {
    startX = Math.random() * (window.innerWidth * 0.4);
  } else {
    startX = (window.innerWidth * 0.6) + Math.random() * (window.innerWidth * 0.4);
  }
  b.style.left = startX + 'px';

  let yOffset = window.innerHeight + 20;
  b.style.top = yOffset + 'px';

  document.body.appendChild(b);
  activeLatherBubbles.push(b);

  const speed = 0.4 + Math.random() * 1.2;
  const driftFreq = 0.008 + Math.random() * 0.015;
  const driftAmplitude = 0.8 + Math.random() * 1.6;
  let t = 0;

  function floatUp() {
    if (!b.parentNode) return;
    t++;
    yOffset -= speed;
    b.style.top = yOffset + 'px';
    // Wobbling drift left/right
    const dx = Math.sin(t * driftFreq) * driftAmplitude * 15;
    b.style.transform = `translateX(${dx}px)`;

    // Pop bubble if floats too high (e.g. above top of screen)
    if (yOffset < -50 || Math.random() < 0.0015) {
      b.style.transition = 'transform 0.2s, opacity 0.2s';
      b.style.transform = `scale(1.45)`;
      b.style.opacity = '0';
      setTimeout(() => {
        if (b.parentNode) b.parentNode.removeChild(b);
      }, 200);
      activeLatherBubbles = activeLatherBubbles.filter(item => item !== b);
    } else {
      requestAnimationFrame(floatUp);
    }
  }
  requestAnimationFrame(floatUp);
}

// Global Ambient Bubble Spawner: runs continuously across the entire landing page
let globalBubbleSpawner = setInterval(() => {
  spawnLatherBubble(Math.random() < 0.5 ? 'left' : 'right');
}, 1800); // ambient spawning rate

let prevActiveIngIdx = -1;

// ══════════════════════════════════════════════════════
//  PUMP INTERACTION & FEATURE DISCOVERY
// ══════════════════════════════════════════════════════
const FEATURES = [
  { name: 'pH Balanced (5.5)', desc: 'Maintains optimal scalp protection barrier.', icon: '🧪', animation: 'entrance-slide-left' },
  { name: 'Pure Tea Tree Extract', desc: 'Cleanses root follicles, stopping dandruff.', icon: '🍃', animation: 'entrance-fade' },
  { name: 'Active Vitamin E & Neem', desc: 'Rebuilds outer cells and stops itching.', icon: '🌿', animation: 'entrance-slide-right' },
  { name: 'Deep Hydration', desc: 'Locks in scalp moisture to prevent dry flaking.', icon: '💧', animation: 'entrance-slide-left' },
  { name: 'Silk Proteins', desc: 'Smoothens hair shafts and gives a premium glow.', icon: '✨', animation: 'entrance-fade' },
  { name: 'Flake Guard Barrier', desc: 'Defends roots from environmental pollutant buildup.', icon: '🛡️', animation: 'entrance-slide-right' }
];

let featuresFound = 0;
let isPumpBusy = false;
let isDraggedByUser = false;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();
let isMouseOverBottle = false;
let scrollSpeedForRotation = 0;
let lastScrollYForRotation = 0;

// Check if user is scrolled exactly in features section
function isAtFeaturesSection() {
  const scrollTop = window.scrollY;
  const featuresEl = document.getElementById('features');
  if (!featuresEl) return false;
  const top = featuresEl.offsetTop;
  const height = featuresEl.clientHeight;
  return scrollTop >= top - 250 && scrollTop < top + height - 250;
}

// ── Hover Detection (Glow Indicators, Tooltip & Hand Pointer) ──
window.addEventListener('mousemove', (e) => {
  mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (!bottleGroup) return;
  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(bottleGroup.children, true);

  // Track if mouse is hovering over the bottle
  isMouseOverBottle = hits.length > 0;

  const tooltip = document.getElementById('cap-tooltip');
  const threeContainer = document.getElementById('three-container');

  const capInteractive = isAtFeaturesSection() && featuresFound < FEATURES.length && !isPumpBusy;

  if (hits.length > 0) {
    if (isPumpPart(hits[0].object)) {
      if (threeContainer) threeContainer.style.cursor = capInteractive ? 'pointer' : 'default';
      if (tooltip && capInteractive) {
        tooltip.style.opacity = '1';
      }
    } else {
      if (threeContainer) threeContainer.style.cursor = isDragging ? 'grabbing' : 'grab';
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
    }
  } else {
    if (threeContainer) threeContainer.style.cursor = 'default';
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }
});

// ── Drag & Click Handler on Document (Avoid blockages) ────────────────
let isDragging = false;
let dragPrevX = 0, dragPrevY = 0;
let dragVelX = 0, dragVelY = 0;

document.addEventListener('mousedown', (e) => {
  if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.ingredient-bubble')) return;

  if (!bottleGroup) return;
  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(bottleGroup.children, true);

  if (hits.length > 0) {
    const capInteractive = isAtFeaturesSection() && featuresFound < FEATURES.length && !isPumpBusy;
    if (isPumpPart(hits[0].object) && capInteractive) {
      firePump();
    } else {
      isDragging = true;
      document.body.classList.add('dragging'); // Disable page text selection
      isDraggedByUser = true;
      dragPrevX = e.clientX;
      dragPrevY = e.clientY;
      dragVelX = 0;
      dragVelY = 0;
    }
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDragging && bottleGroup) {
    const dx = e.clientX - dragPrevX;
    const dy = e.clientY - dragPrevY;
    dragVelX = dx * 0.002;
    dragVelY = dy * 0.002;
    dragPrevX = e.clientX;
    dragPrevY = e.clientY;

    bottleGroup.rotation.y += dragVelX;
    bottleGroup.rotation.x = Math.max(-0.4, Math.min(0.8, bottleGroup.rotation.x + dragVelY));
  }
});

document.addEventListener('mouseup', () => { 
  isDragging = false; 
  document.body.classList.remove('dragging'); // Re-enable text selection
  // Gracefully resume auto-rotation after 2 seconds of inactivity
  setTimeout(() => {
    if (!isDragging) isDraggedByUser = false;
  }, 2000);
});

// Touch support
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.ingredient-bubble')) return;
  if (!bottleGroup || e.touches.length !== 1) return;
  const t = e.touches[0];
  mouseNDC.x = (t.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(t.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(bottleGroup.children, true);

  if (hits.length > 0) {
    const capInteractive = isAtFeaturesSection() && featuresFound < FEATURES.length && !isPumpBusy;
    if (isPumpPart(hits[0].object) && capInteractive) {
      firePump();
    } else {
      isDragging = true;
      document.body.classList.add('dragging'); // Disable page text selection
      isDraggedByUser = true;
      dragPrevX = t.clientX;
      dragPrevY = t.clientY;
      dragVelX = 0;
      dragVelY = 0;
    }
  }
});

document.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches.length === 1) {
    const t = e.touches[0];
    const dx = t.clientX - dragPrevX;
    const dy = t.clientY - dragPrevY;
    dragVelY = dy * 0.002;
    dragPrevX = t.clientX;
    dragPrevY = t.clientY;

    bottleGroup.rotation.y += dragVelX;
    bottleGroup.rotation.x = Math.max(-0.4, Math.min(0.8, bottleGroup.rotation.x + dragVelY));
  }
});

document.addEventListener('touchend', () => { 
  isDragging = false; 
  document.body.classList.remove('dragging'); // Re-enable text selection
  // Gracefully resume auto-rotation after 2 seconds of inactivity
  setTimeout(() => {
    if (!isDragging) isDraggedByUser = false;
  }, 2000);
});

// ── Fire Pump Dispenser & Liquid Morph ─────────────────────────────
let presentationTilt = 0;

function firePump() {
  if (isPumpBusy || featuresFound >= FEATURES.length) return;
  isPumpBusy = true;
  safePlaySquish();

  const tooltip = document.getElementById('cap-tooltip');
  if (tooltip) tooltip.style.opacity = '0';

  // Correct constants matching three-scene.js (SY = 2.52)
  const SY = 2.52, STEM_BOT = SY + 0.34, STEM_H = 0.90;
  const HEAD_Y = STEM_BOT + STEM_H, NZ_Y = HEAD_Y + 0.08;
  let t = 0;

  const pressInt = setInterval(() => {
    t += 0.06;
    let offset = 0;
    if (t <= 0.22) offset = t * 1.25;
    else if (t <= 0.9) offset = 0.275 - (t - 0.22) * 0.39;
    else { offset = 0; clearInterval(pressInt); isPumpBusy = false; }

    if (stemMesh) stemMesh.position.y = (STEM_BOT + STEM_H * 0.5) - offset;
    if (headBody) headBody.position.y = (HEAD_Y + 0.08) - offset;
    if (headDome) headDome.position.y = (HEAD_Y + 0.16) - offset;
    if (nozzleGroup) nozzleGroup.position.y = NZ_Y - offset;
  }, 16);

  setTimeout(dispenseAndReveal, 140);
}



function dispenseAndReveal() {
  const drop = document.getElementById('shampoo-drop');
  if (!drop) return;
  const start = getSpoutScreenPos();

  drop.style.left = start.x + 'px';
  drop.style.top = start.y + 'px';
  drop.style.width = '18px';
  drop.style.height = '18px';
  drop.style.opacity = '1';
  drop.style.transform = 'translate(-50%,-50%) scale(1)';

  const featuresSection = document.getElementById('features');
  const targetX = window.innerWidth * 0.5;
  const targetY = (featuresSection ? featuresSection.offsetTop - window.scrollY : 200) + 300;

  let p = 0;
  const dropInt = setInterval(() => {
    p += 0.012; // Slower motion speed
    const sp = getSpoutScreenPos();
    const curX = sp.x + (targetX - sp.x) * p;
    const curY = sp.y + (targetY - sp.y) * p;

    // Keep perfectly circular (same width & height) — bubble shape
    const size = 18 + p * 68;
    // Add subtle wobble to simulate soap bubble physics
    const wobbleX = 1 + Math.sin(p * Math.PI * 6) * 0.04;
    const wobbleY = 1 - Math.sin(p * Math.PI * 6) * 0.04;

    drop.style.left = curX + 'px';
    drop.style.top = curY + 'px';
    drop.style.width = size + 'px';
    drop.style.height = size + 'px';
    drop.style.transform = `translate(-50%,-50%) scale(${wobbleX}, ${wobbleY})`;

    if (p >= 1.0) {
      clearInterval(dropInt);
      // Final pop burst: scale up then fade
      drop.style.transform = 'translate(-50%,-50%) scale(1.3)';
      drop.style.opacity = '0.6';
      setTimeout(() => {
        drop.style.opacity = '0';
        drop.style.transform = 'translate(-50%,-50%) scale(0.8)';
      }, 180);
      safePlayBubble();
      spawnFeatureCard();
    }
  }, 16);
}

function spawnFeatureCard() {
  const rowsContainer = document.getElementById('feature-rows-container');
  if (!rowsContainer) return;

  const feat = FEATURES[featuresFound];
  const card = document.createElement('div');
  card.className = `feature-card glass-card ${feat.animation}`;
  card.innerHTML = `
    <div class="feature-icon">${feat.icon}</div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      <div class="feature-name">${feat.name}</div>
      <div class="feature-desc">${feat.desc}</div>
    </div>
  `;
  rowsContainer.appendChild(card);
  setTimeout(() => card.classList.add('visible'), 50);

  const tiltDirections = [-0.15, 0, 0.15, -0.15, 0, 0.15];
  presentationTilt = tiltDirections[featuresFound];
  setTimeout(() => { presentationTilt = 0; }, 2500);

  featuresFound++;

  const label = document.getElementById('pump-label');
  if (label) {
    if (featuresFound >= FEATURES.length) {
      label.textContent = 'All Premium Features Discovered! ✓';
      safePlayChime();
    } else {
      label.textContent = `Discovered ${featuresFound} / ${FEATURES.length} features. Click pump again!`;
    }
  }
}

// Reset user drag when scrolling down + track scroll speed for rotation boost
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  scrollSpeedForRotation = Math.abs(currentScrollY - lastScrollYForRotation);
  lastScrollYForRotation = currentScrollY;

  // Decay scroll speed over time
  setTimeout(() => { scrollSpeedForRotation *= 0.85; }, 150);

  if (currentScrollY > 20) {
    isDraggedByUser = false;
  }
});

// ══════════════════════════════════════════════════════
//  SCROLL-DRIVEN SECTION POSITIONS FOR BOTTLE
// ══════════════════════════════════════════════════════
const SECTION_POSES = [
  // hero (shifted upward, tilted sideways on the X-Y plane, bolly branding faces front immediately)
  { pos: { x: 0, y: -0.22, z: 0 }, rot: { x: 0.05, y: Math.PI, z: -0.32 }, scl: 0.68 },
  // features (moves left, rotates 25 degrees, sits behind cards focus)
  { pos: { x: -0.9, y: -0.22, z: -0.5 }, rot: { x: 0.35, y: BOTTLE_Y_ROT + 0.45, z: -0.06 }, scl: 0.72 },
  // why-choose (offset right)
  { pos: { x: 1.1, y: -0.38, z: 0 }, rot: { x: 0.38, y: BOTTLE_Y_ROT - 0.4, z: -0.04 }, scl: 0.65 },
  // ingredients (moved slightly to left, observer role)
  { pos: { x: -1.0, y: -0.48, z: 0 }, rot: { x: 0.3, y: BOTTLE_Y_ROT + 0.1, z: 0 }, scl: 0.58 },
  // benefits (left)
  { pos: { x: -1.1, y: -0.38, z: 0 }, rot: { x: 0.35, y: BOTTLE_Y_ROT + 0.4, z: -0.05 }, scl: 0.65 },
  // usage (right)
  { pos: { x: 1.0, y: -0.38, z: 0 }, rot: { x: 0.38, y: BOTTLE_Y_ROT - 0.25, z: -0.03 }, scl: 0.68 },
  // reviews (offset right, scaled down)
  { pos: { x: 1.7, y: -0.38, z: 0 }, rot: { x: 0.35, y: BOTTLE_Y_ROT + 0.6, z: -0.02 }, scl: 0.48 },
  // cta (centered)
  { pos: { x: 0, y: -0.38, z: 0 }, rot: { x: 0.3, y: BOTTLE_Y_ROT, z: 0 }, scl: 0.8 },
];

function getScrollState() {
  const scrollTop = window.scrollY;
  const sections = sectionIds.map(id => {
    const el = document.getElementById(id);
    return el ? el.offsetTop : 0;
  });

  let idx = 0, frac = 0;
  for (let i = 0; i < sections.length - 1; i++) {
    if (scrollTop >= sections[i] && scrollTop < sections[i + 1]) {
      idx = i;
      frac = (scrollTop - sections[i]) / (sections[i + 1] - sections[i]);
      break;
    }
  }
  if (scrollTop >= sections[sections.length - 1]) {
    idx = sections.length - 1;
    frac = 0;
  }
  return { idx, frac, scrollTop };
}

// ══════════════════════════════════════════════════════
//  MAIN ANIMATION LOOP
// ══════════════════════════════════════════════════════
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (!bottleGroup || !renderer) return;

  const time = clock.getElapsedTime();
  const { idx, frac, scrollTop } = getScrollState();
  const poseA = SECTION_POSES[Math.min(idx, SECTION_POSES.length - 1)];
  const poseB = SECTION_POSES[Math.min(idx + 1, SECTION_POSES.length - 1)];

  // Lerp position
  const lerpSpeed = 0.05;
  let tgtX = poseA.pos.x + (poseB.pos.x - poseA.pos.x) * frac;
  let tgtY = poseA.pos.y + (poseB.pos.y - poseA.pos.y) * frac;
  let tgtZ = poseA.pos.z + (poseB.pos.z - poseA.pos.z) * frac;

  // Add slow idle floating bobbing ONLY at the top (Hero) and when not dragging
  if (scrollTop < 50 && !isDragging) {
    tgtY += Math.sin(time * 1.5) * 0.05;
  }

  bottleGroup.position.x += (tgtX - bottleGroup.position.x) * lerpSpeed;
  bottleGroup.position.y += (tgtY - bottleGroup.position.y) * lerpSpeed;
  bottleGroup.position.z += (tgtZ - bottleGroup.position.z) * lerpSpeed;

  // Lerp scale
  const tgtS = poseA.scl + (poseB.scl - poseA.scl) * frac;
  bottleGroup.scale.lerp(new THREE.Vector3(tgtS, tgtS, tgtS), lerpSpeed);

  // Lerp rotation
  if (!isDragging && !isDraggedByUser) {
    const tgtRX = poseA.rot.x + (poseB.rot.x - poseA.rot.x) * frac;
    let tgtRY = poseA.rot.y + (poseB.rot.y - poseA.rot.y) * frac;
    const tgtRZ = poseA.rot.z + (poseB.rot.z - poseA.rot.z) * frac;

    // Apply mouse parallax only when near top
    if (scrollTop < 200) {
      tgtRY += mouseNDC.x * 0.08;
    }

    // Apply temporary presentation tilt offset
    tgtRY += presentationTilt;

    // ── Auto-rotation with cursor-hover deceleration ──
    // Base speed: 0.065 rad/s (fast elegant spin, between 0.05-0.1 rad/s)
    // When hovering over the bottle (isMouseOverBottle), slow it down to 0.012 rad/s for easier cap tapping
    const baseAutoSpeed = isMouseOverBottle ? 0.012 : 0.065;
    const hoverScrollBoost = isMouseOverBottle ? scrollSpeedForRotation * 0.001 : 0;
    const autoRotSpeed = baseAutoSpeed + hoverScrollBoost;

    // Apply continuous auto-rotation and slow scroll-based rotation globally
    const rotationOffset = time * autoRotSpeed + scrollTop * 0.00015;
    tgtRY += rotationOffset;

    bottleGroup.rotation.x += (tgtRX - bottleGroup.rotation.x) * lerpSpeed;
    bottleGroup.rotation.y += (tgtRY - bottleGroup.rotation.y) * lerpSpeed;
    bottleGroup.rotation.z += (tgtRZ - bottleGroup.rotation.z) * lerpSpeed;

    // Decay dragging momentum
    dragVelX *= 0.95;
    dragVelY *= 0.95;
    bottleGroup.rotation.y += dragVelX;
    bottleGroup.rotation.x = Math.max(-0.4, Math.min(0.8, bottleGroup.rotation.x + dragVelY));
  } else if (isDragging) {
    dragVelX *= 0.95;
    dragVelY *= 0.95;
  } else {
    dragVelX *= 0.95;
    dragVelY *= 0.95;
    bottleGroup.rotation.y += dragVelX;
    bottleGroup.rotation.x = Math.max(-0.4, Math.min(0.8, bottleGroup.rotation.x + dragVelY));
  }

  // ─── Cap tooltip positioning ───────────
  const tooltip = document.getElementById('cap-tooltip');
  if (tooltip && isAtFeaturesSection() && featuresFound < FEATURES.length && !isPumpBusy) {
    const capPos = getCapScreenPos();
    tooltip.style.left = capPos.x + 'px';
    tooltip.style.top = capPos.y + 'px';
    tooltip.style.opacity = '1';
  } else {
    if (tooltip) tooltip.style.opacity = '0';
  }

  // ─── Ingredients Bubble & Lather Activation ────────────────────
  const ingSection = document.getElementById('ingredients');
  if (ingSection) {
    const ingTop = ingSection.offsetTop;
    const ingH = ingSection.clientHeight;

    const rect = ingSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible) {
      document.body.classList.add('foam-active');
      
      // Spawn extra lather foam bubbles in real-time when actively scrolling ingredients!
      if (Math.random() < 0.12) {
        spawnLatherBubble('left');
        spawnLatherBubble('right');
      }
      safeStartLatherSound();

      const range = ingH - window.innerHeight;
      const progress = range > 0 ? Math.max(0, Math.min(1, (scrollTop - ingTop) / range)) : 0.5;
      
      // Map progress (0 to 1) to active index with neutral padding at start and end
      // 5 bubbles: indices 0, 1, 2, 3, 4.
      // progress < 0.15: Neutral (all bubbles in original positions)
      // progress >= 0.15 && progress < 0.90: Bubbles 0 to 4 activate one-by-one
      // progress >= 0.90: Neutral (all bubbles return to original positions)
      let scrollActiveIdx = -1;
      if (progress >= 0.15 && progress < 0.90) {
        const scaledProgress = (progress - 0.15) / (0.90 - 0.15); // 0 to 1
        scrollActiveIdx = Math.min(4, Math.floor(scaledProgress * 5));
      }

      // Priority: 1. Hovered bubble, 2. Clicked/locked bubble, 3. Scroll-active bubble
      let activeIdx = scrollActiveIdx;
      if (hoveredIngIdx !== -1) {
        activeIdx = hoveredIngIdx;
      } else if (clickedIngIdx !== -1) {
        activeIdx = clickedIngIdx;
      }

      // Hide detail card if no bubble is active
      if (activeIdx === -1) {
        const detailCard = document.getElementById('ingredient-detail-card');
        if (detailCard) {
          detailCard.style.opacity = '0';
          detailCard.style.transform = 'translateX(30px)';
        }
      }

      INGREDIENTS.forEach((ing, i) => {
        const el = bubbleEls[i];
        if (!el) return;

        if (i === activeIdx) {
          el.className = 'ingredient-bubble active';
          el.style.transform = `translate(${el._defX}px, ${el._defY}px) scale(1.32)`;
          el.style.borderColor = '#5B4FA3';
          el.style.boxShadow = '0 0 25px rgba(91,79,163,0.45), inset 0 0 10px rgba(255,255,255,0.8)';
          
          // Update the central details display card
          const detailCard = document.getElementById('ingredient-detail-card');
          if (detailCard) {
            detailCard.innerHTML = `
              <div style="font-size: 54px; filter: drop-shadow(0 4px 10px rgba(91,79,163,0.25));">${ing.icon}</div>
              <div>
                <h3 style="font-size: 20px; font-weight: 800; color: #111; margin: 0;">${ing.name}</h3>
                <span style="display:inline-block; margin-top: 4px; background: rgba(91, 79, 163, 0.08); color: #5B4FA3; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 99px; text-transform: uppercase;">${ing.benefit}</span>
              </div>
              <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 6px 0;">${ing.desc}</p>
              <div style="font-size: 11px; color: #888; font-style: italic; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 10px; margin-top: 4px; width: 100%;">
                🔬 ${ing.why}
              </div>
            `;
            detailCard.style.opacity = '1';
            detailCard.style.transform = 'translateX(0px)';
          }

          if (prevActiveIngIdx !== activeIdx) {
            prevActiveIngIdx = activeIdx;
            safePlayBubble();
          }
        } else {
          el.className = 'ingredient-bubble';
          el.style.transform = `translate(${el._defX}px, ${el._defY + Math.sin(time * 0.8 + i) * 12}px) scale(0.95)`;
          el.style.borderColor = 'rgba(255, 255, 255, 0.75)';
          el.style.boxShadow = 'inset -2px -2px 6px rgba(91,79,163,0.15), inset 2px 2px 6px rgba(255,255,255,0.75), 0 8px 28px rgba(91,79,163,0.08)';
        }
      });
    } else {
      document.body.classList.remove('foam-active');
      safeStopLatherSound();

      // Hide the details display card
      const detailCard = document.getElementById('ingredient-detail-card');
      if (detailCard) {
        detailCard.style.opacity = '0';
        detailCard.style.transform = 'translateX(30px)';
      }

      INGREDIENTS.forEach((ing, i) => {
        const el = bubbleEls[i];
        if (el) {
          el.className = 'ingredient-bubble';
          el.style.transform = `translate(${el._defX}px, ${el._defY}px) scale(1)`;
          el.style.borderColor = 'rgba(255, 255, 255, 0.75)';
          el.style.boxShadow = 'inset -2px -2px 6px rgba(91,79,163,0.15), inset 2px 2px 6px rgba(255,255,255,0.75), 0 8px 28px rgba(91,79,163,0.08)';
        }
      });
      prevActiveIngIdx = -1;
    }
  }

  // ─── Benefits Progress Circles ───────────────────
  const benSection = document.getElementById('benefits');
  if (benSection && scrollTop > benSection.offsetTop - window.innerHeight * 0.7) {
    document.querySelectorAll('.progress-circle').forEach(circle => {
      const pct = parseInt(circle.dataset.percent);
      const offset = 251.2 - (251.2 * pct / 100);
      circle.style.strokeDashoffset = offset;

      const textEl = circle.closest('.benefit-ring').querySelector('.benefit-pct');
      if (textEl && textEl.textContent === '0%') {
        let cur = 0;
        const ci = setInterval(() => {
          cur++;
          textEl.textContent = cur + '%';
          if (cur >= pct) clearInterval(ci);
        }, 18);
      }
    });
  }

  // ─── Usage Timeline Steps ────────────────────────
  const usageSection = document.getElementById('usage');
  if (usageSection) {
    const usageTop = usageSection.offsetTop;
    const steps = document.querySelectorAll('.timeline-step');
    let activeSteps = 0;
    steps.forEach((step, i) => {
      if (scrollTop > usageTop + i * 120 - window.innerHeight * 0.5) {
        step.classList.add('visible');
        activeSteps++;
      }
    });
    const fillEl = document.getElementById('timeline-fill');
    if (fillEl) {
      const linePct = Math.max(0, Math.min(100, ((activeSteps - 1) / (steps.length - 1)) * 100));
      fillEl.style.height = linePct + '%';
    }
  }

  // Render Scene
  renderer.render(scene, camera);
}

// ══════════════════════════════════════════════════════
//  BOOT + FAQ MODAL CONTROLS
// ══════════════════════════════════════════════════════
document.fonts.ready.then(() => {
  initThreeScene();
  animate();
  setupFaqListeners();
}).catch(() => {
  initThreeScene();
  animate();
  setupFaqListeners();
});

function setupFaqListeners() {
  const faqBtn = document.getElementById('faq-btn');
  const faqModal = document.getElementById('faq-modal');
  const faqCloseBtn = document.getElementById('faq-close-btn');

  if (faqBtn && faqModal) {
    faqBtn.addEventListener('click', () => {
      faqModal.style.display = 'flex';
      setTimeout(() => {
        faqModal.style.opacity = '1';
        faqModal.querySelector('.modal-content').style.transform = 'scale(1)';
      }, 50);
      safePlayClick();
    });
  }

  if (faqCloseBtn && faqModal) {
    faqCloseBtn.addEventListener('click', () => {
      faqModal.style.opacity = '0';
      faqModal.querySelector('.modal-content').style.transform = 'scale(0.9)';
      setTimeout(() => { faqModal.style.display = 'none'; }, 400);
      safePlayClick();
    });

    // Close on background overlay click
    faqModal.addEventListener('click', (e) => {
      if (e.target === faqModal) {
        faqCloseBtn.click();
      }
    });
  }
}
