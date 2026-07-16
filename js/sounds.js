/* ════════════════════════════════════════════════════
   SOUNDS.JS – Web Audio API synthesized sounds
   Zero external audio files required.
   ════════════════════════════════════════════════════ */

let audioCtx = null;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio API not available');
  }
}

// ── Ambient loading hum ───────────────────────────────
let humOsc = null, humGain = null;

function playHum() {
  initAudio();
  if (!audioCtx) return;
  try {
    humOsc = audioCtx.createOscillator();
    humGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(100, audioCtx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, audioCtx.currentTime);
    humGain.gain.setValueAtTime(0, audioCtx.currentTime);
    humGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 2);
    humOsc.connect(filter);
    filter.connect(humGain);
    humGain.connect(audioCtx.destination);
    humOsc.start();
  } catch (e) {}
}

function stopHum() {
  if (humGain && audioCtx) {
    try {
      humGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
      setTimeout(() => { if (humOsc) { humOsc.stop(); humOsc.disconnect(); humOsc = null; } }, 1000);
    } catch (e) {}
  }
}

// ── Click/nav sound ───────────────────────────────────
function playClick() {
  initAudio();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}
}

// ── Pump squish sound ─────────────────────────────────
function playSquish() {
  initAudio();
  if (!audioCtx) return;
  try {
    const bufLen = audioCtx.sampleRate * 0.25;
    const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(900, audioCtx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    src.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
    src.start(); src.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

// ── Bubble pop ────────────────────────────────────────
function playBubble() {
  initAudio();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, audioCtx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {}
}

// ── Hover tick ────────────────────────────────────────
function playTick() {
  initAudio();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.008, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.03);
  } catch (e) {}
}

// ── Success chord ─────────────────────────────────────
function playChime() {
  initAudio();
  if (!audioCtx) return;
  try {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.025, audioCtx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 0.3);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.08);
      osc.stop(audioCtx.currentTime + i * 0.08 + 0.3);
    });
  } catch (e) {}
}

// ── Immersive shampoo lather bubbling sound (procedural) ──
let latherInterval = null;
let isLatherPlaying = false;

function startLatherSound() {
  initAudio();
  if (!audioCtx || isLatherPlaying) return;
  isLatherPlaying = true;

  latherInterval = setInterval(() => {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    const r = Math.random();

    // 1. Soft bubble pop (medium pitch)
    if (r < 0.28) {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const freq = 180 + Math.random() * 240;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 3, audioCtx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.005 + Math.random() * 0.005, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}
    }

    // 2. High-pitch foam crackles (tiny pops)
    if (r < 0.5) {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200 + Math.random() * 1800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.002, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.015);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.015);
      } catch (e) {}
    }

    // 3. Gentle liquid swish (low pitch filter sweep)
    if (r < 0.06) {
      try {
        const bufferSize = audioCtx.sampleRate * 0.4;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.0, audioCtx.currentTime);
        filter.frequency.setValueAtTime(140 + Math.random() * 80, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.35);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

        noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
        noise.start(); noise.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}
    }
  }, 100);
}

function stopLatherSound() {
  if (latherInterval) {
    clearInterval(latherInterval);
    latherInterval = null;
  }
  isLatherPlaying = false;
}

