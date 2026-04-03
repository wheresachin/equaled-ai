/**
 * useHandTracking — MediaPipe Hands with simplified gestures
 *
 * Gestures:
 *   ☝️  Index finger up only    → Scroll Up
 *   ✌️  Index + middle up       → Scroll Down
 *   👌  Pinch (thumb + index)   → Click element under cursor
 *   🖐️  All 4 fingers up        → Go Back
 */
import { useEffect, useRef, useState } from 'react';

const HANDS_URL   = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js';
const CAMERA_URL  = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js';
const DRAWING_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js';

// ─── Landmark indices ──────────────────────────────────────────────
const WRIST = 0;
const THUMB_TIP = 4;
const IDX_TIP = 8, IDX_PIP = 6, IDX_MCP = 5;
const MID_TIP = 12, MID_PIP = 10, MID_MCP = 9;
const RING_TIP = 16, RING_PIP = 14, RING_MCP = 13;
const PINKY_TIP = 20, PINKY_PIP = 18, PINKY_MCP = 17;

// ─── Helpers ───────────────────────────────────────────────────────
const dist2D = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// A finger is "up" when the tip is clearly above the PIP joint
const fingerUp = (tip, pip) => tip.y < pip.y - 0.02;

const detectGesture = (lm) => {
  if (!lm || lm.length < 21) return 'none';

  const indexUp  = fingerUp(lm[IDX_TIP],   lm[IDX_PIP]);
  const middleUp = fingerUp(lm[MID_TIP],   lm[MID_PIP]);
  const ringUp   = fingerUp(lm[RING_TIP],  lm[RING_PIP]);
  const pinkyUp  = fingerUp(lm[PINKY_TIP], lm[PINKY_PIP]);

  // Pinch: thumb tip close to index tip
  const pinchDist = dist2D(lm[THUMB_TIP], lm[IDX_TIP]);
  if (pinchDist < 0.08) return 'pinch';

  // All 4 fingers up → back
  if (indexUp && middleUp && ringUp && pinkyUp) return 'open';

  // Peace ✌ → index + middle up, ring + pinky down
  if (indexUp && middleUp && !ringUp && !pinkyUp) return 'peace';

  // Point ☝ → only index up
  if (indexUp && !middleUp && !ringUp && !pinkyUp) return 'point';

  return 'none';
};

const loadScript = (src, id) =>
  new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.id = id; s.src = src; s.crossOrigin = 'anonymous';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

// ─── Hook ─────────────────────────────────────────────────────────
export const useHandTracking = (enabled) => {
  const [status, setStatus] = useState('idle');
  const cameraRef   = useRef(null);
  const handsRef    = useRef(null);
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const pinchLatch  = useRef(false);
  const lastGesture = useRef('none');
  const scrollCD    = useRef(false);
  const backCD      = useRef(false);

  // ── cleanup ────────────────────────────────────────────────────
  const cleanup = () => {
    try { cameraRef.current?.stop(); } catch (e) {}
    try { handsRef.current?.close(); } catch (e) {}
    cameraRef.current = null; handsRef.current = null;
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    videoRef.current = null;
    ['hand-cam-container', 'hand-cursor', 'hand-badge'].forEach(id =>
      document.getElementById(id)?.remove()
    );
    setStatus('idle');
  };

  // ── Create preview + canvas ─────────────────────────────────────
  const createPreview = () => {
    if (document.getElementById('hand-cam-container')) {
      return {
        video: document.getElementById('hand-video'),
        canvas: document.getElementById('hand-canvas'),
      };
    }
    const container = document.createElement('div');
    container.id = 'hand-cam-container';
    Object.assign(container.style, {
      position: 'fixed', bottom: '24px', left: '24px', zIndex: '999998',
      width: '320px', height: '240px', borderRadius: '20px', overflow: 'hidden',
      border: '3px solid rgba(99,102,241,0.95)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.55)', background: '#000',
    });

    const video = document.createElement('video');
    video.id = 'hand-video'; video.playsInline = true; video.muted = true;
    Object.assign(video.style, {
      width: '100%', height: '100%', objectFit: 'cover',
      transform: 'scaleX(-1)', display: 'block',
    });

    const canvas = document.createElement('canvas');
    canvas.id = 'hand-canvas'; canvas.width = 320; canvas.height = 240;
    Object.assign(canvas.style, {
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%', transform: 'scaleX(-1)',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '12px', fontWeight: '600',
      padding: '3px 14px', borderRadius: '99px', whiteSpace: 'nowrap',
      pointerEvents: 'none', zIndex: '1',
    });
    label.textContent = '✋ Hand Control';

    // Close button
    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      position: 'absolute', top: '8px', right: '8px',
      width: '28px', height: '28px',
      borderRadius: '50%',
      background: 'rgba(99,102,241,0.85)',
      border: 'none', color: '#fff',
      fontSize: '16px', fontWeight: '700', lineHeight: '1',
      cursor: 'pointer', zIndex: '3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    });
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close Hand Control';
    closeBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('equaled:hand-close'));
    });

    container.appendChild(video); container.appendChild(canvas);
    container.appendChild(label); container.appendChild(closeBtn);
    document.body.appendChild(container);
    return { video, canvas };
  };

  // ── Draw hand skeleton on canvas ─────────────────────────────────
  const drawSkeleton = (lm, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas has CSS scaleX(-1), so draw at original (non-mirrored) coords.
    // The CSS transform will flip it to match the mirrored video.
    const px = (pt) => pt.x * canvas.width;
    const py = (pt) => pt.y * canvas.height;

    // Try MediaPipe's drawConnectors first (best quality)
    if (window.drawConnectors && window.HAND_CONNECTIONS) {
      window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
        color: 'rgba(99,102,241,0.75)', lineWidth: 2,
      });
      window.drawLandmarks && window.drawLandmarks(ctx, lm, {
        color: 'rgba(99,102,241,0.9)', fillColor: 'rgba(99,102,241,0.5)',
        lineWidth: 1, radius: 4,
      });
    } else {
      // Fallback: manual drawing
      const connections = [
        [0,1],[1,2],[2,3],[3,4],          // thumb
        [0,5],[5,6],[6,7],[7,8],          // index
        [0,9],[9,10],[10,11],[11,12],     // middle
        [0,13],[13,14],[14,15],[15,16],   // ring
        [0,17],[17,18],[18,19],[19,20],   // pinky
        [5,9],[9,13],[13,17],             // palm
      ];
      ctx.strokeStyle = 'rgba(99,102,241,0.75)';
      ctx.lineWidth = 2;
      connections.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(px(lm[a]), py(lm[a]));
        ctx.lineTo(px(lm[b]), py(lm[b]));
        ctx.stroke();
      });
      lm.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(px(pt), py(pt), i === IDX_TIP ? 8 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = i === IDX_TIP ? 'rgba(239,68,68,0.95)' : 'rgba(99,102,241,0.9)';
        ctx.fill();
      });
    }
  };

  // ── Show gesture badge ─────────────────────────────────────────
  const showBadge = (text, color) => {
    let badge = document.getElementById('hand-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'hand-badge';
      Object.assign(badge.style, {
        position: 'fixed', bottom: '280px', left: '24px',
        padding: '8px 18px', borderRadius: '99px',
        fontSize: '14px', fontWeight: '700', color: '#fff',
        pointerEvents: 'none', zIndex: '999999',
        transition: 'opacity 0.25s',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      });
      document.body.appendChild(badge);
    }
    badge.textContent = text;
    badge.style.background = color;
    badge.style.opacity = '1';
    clearTimeout(badge._t);
    badge._t = setTimeout(() => { badge.style.opacity = '0'; }, 1000);
  };

  // ── Move purple cursor ──────────────────────────────────────────
  const moveCursor = (x, y) => {
    let cursor = document.getElementById('hand-cursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'hand-cursor';
      Object.assign(cursor.style, {
        position: 'fixed', width: '28px', height: '28px',
        borderRadius: '50%', border: '3px solid rgba(99,102,241,0.9)',
        background: 'rgba(99,102,241,0.2)', pointerEvents: 'none',
        zIndex: '999999', transform: 'translate(-50%,-50%)',
        transition: 'left 0.05s, top 0.05s',
        boxShadow: '0 0 18px rgba(99,102,241,0.5)',
      });
      document.body.appendChild(cursor);
    }
    cursor.style.left = `${x}px`;
    cursor.style.top  = `${y}px`;
  };

  // ── Process hand results ────────────────────────────────────────
  const onResults = (results) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const lm = results.multiHandLandmarks[0];

    // Draw skeleton
    if (canvas) drawSkeleton(lm, canvas);

    // Index tip → cursor position (mirrored)
    const screenX = (1 - lm[IDX_TIP].x) * window.innerWidth;
    const screenY = lm[IDX_TIP].y * window.innerHeight;
    moveCursor(screenX, screenY);

    const gesture = detectGesture(lm);

    // ── Pinch → click ───────────────────────────────────────────
    if (gesture === 'pinch' && !pinchLatch.current) {
      pinchLatch.current = true;
      showBadge('👌 Click', '#10b981');
      const el = document.elementFromPoint(screenX, screenY);
      if (el) el.click();
    } else if (gesture !== 'pinch') {
      pinchLatch.current = false;
    }

    // ── Point ☝ → scroll up ─────────────────────────────────────
    if (gesture === 'point' && !scrollCD.current) {
      window.scrollBy({ top: -80, behavior: 'smooth' });
      scrollCD.current = true;
      showBadge('☝️ Scroll Up', '#6366f1');
      setTimeout(() => { scrollCD.current = false; }, 400);
    }

    // ── Peace ✌ → scroll down ───────────────────────────────────
    if (gesture === 'peace' && !scrollCD.current) {
      window.scrollBy({ top: 80, behavior: 'smooth' });
      scrollCD.current = true;
      showBadge('✌️ Scroll Down', '#8b5cf6');
      setTimeout(() => { scrollCD.current = false; }, 400);
    }

    // ── Open 🖐 → back (debounced) ───────────────────────────────
    if (gesture === 'open' && lastGesture.current !== 'open' && !backCD.current) {
      backCD.current = true;
      showBadge('🖐️ Back', '#f59e0b');
      setTimeout(() => { window.history.back(); backCD.current = false; }, 800);
    }

    lastGesture.current = gesture;
  };

  // ── Init ────────────────────────────────────────────────────────
  const init = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
      });
    } catch (err) {
      console.error('[HandTracking] Camera denied:', err);
      setStatus('error');
      return;
    }

    const { video, canvas } = createPreview();
    videoRef.current = video;
    canvasRef.current = canvas;
    video.srcObject = stream;
    await video.play();

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });
    hands.onResults(onResults);
    handsRef.current = hands;

    const camera = new window.Camera(video, {
      onFrame: async () => {
        if (handsRef.current) await handsRef.current.send({ image: video });
      },
      width: 320, height: 240,
    });
    cameraRef.current = camera;
    camera.start();

    setStatus('active');
    console.log('[HandTracking] Started.');
  };

  useEffect(() => {
    if (!enabled) { cleanup(); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setStatus('error'); return; }

    setStatus('loading');

    Promise.all([
      loadScript(DRAWING_URL, 'mp-drawing'),
      loadScript(HANDS_URL, 'mp-hands'),
      loadScript(CAMERA_URL, 'mp-camera'),
    ])
      .then(() => setTimeout(() => {
        if (window.Hands && window.Camera) init();
        else setStatus('error');
      }, 300))
      .catch(() => setStatus('error'));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { status };
};
