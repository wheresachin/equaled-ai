/**
 * useEyeTracking — MediaPipe FaceMesh with iris tracking + mesh overlay
 *
 * Draws the full face mesh + iris landmarks on the camera canvas.
 * Tracks iris position to move a red gaze cursor on screen.
 * Top/bottom 10% of screen triggers scroll.
 */
import { useEffect, useRef, useState } from 'react';

const FACE_MESH_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js';
const CAMERA_URL    = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js';
const DRAWING_URL   = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js';

// Iris landmark indices (only available when refineLandmarks: true)
const LEFT_IRIS  = 473; // left iris center
const RIGHT_IRIS = 468; // right iris center

const loadScript = (src, id) =>
  new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.id = id; s.src = src; s.crossOrigin = 'anonymous';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

export const useEyeTracking = (enabled) => {
  const [status, setStatus]   = useState('idle');
  const cameraRef  = useRef(null);
  const meshRef    = useRef(null);
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const gazeHist   = useRef([]);
  const scrollCD   = useRef(false);

  const smoothGaze = (x, y) => {
    gazeHist.current.push({ x, y });
    if (gazeHist.current.length > 8) gazeHist.current.shift();
    const n = gazeHist.current.length;
    const s = gazeHist.current.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
    return { x: s.x / n, y: s.y / n };
  };

  // ── Build camera preview DOM ─────────────────────────────────────
  const createPreview = () => {
    if (document.getElementById('eye-cam-container')) {
      return {
        video:  document.getElementById('eye-cam-video'),
        canvas: document.getElementById('eye-cam-canvas'),
      };
    }
    const container = document.createElement('div');
    container.id = 'eye-cam-container';
    Object.assign(container.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      width: '320px', height: '240px', zIndex: '999998',
      borderRadius: '20px', overflow: 'hidden',
      border: '3px solid rgba(239,68,68,0.95)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
      background: '#000',
    });

    // Video — mirrored so user sees natural selfie view
    const video = document.createElement('video');
    video.id = 'eye-cam-video'; video.playsInline = true; video.muted = true;
    Object.assign(video.style, {
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%', objectFit: 'cover',
      transform: 'scaleX(-1)', display: 'block',
    });

    // Canvas — also mirrored to match video, draw at original coords
    const canvas = document.createElement('canvas');
    canvas.id = 'eye-cam-canvas'; canvas.width = 320; canvas.height = 240;
    Object.assign(canvas.style, {
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      transform: 'scaleX(-1)',   // mirror to match video
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      position: 'absolute', bottom: '8px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)', color: '#fff',
      fontSize: '12px', fontWeight: '600',
      padding: '3px 14px', borderRadius: '99px',
      whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: '2',
    });
    label.textContent = '👁️ Eye Tracker';

    // Close button
    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      position: 'absolute', top: '8px', right: '8px',
      width: '28px', height: '28px',
      borderRadius: '50%',
      background: 'rgba(239,68,68,0.85)',
      border: 'none', color: '#fff',
      fontSize: '16px', fontWeight: '700', lineHeight: '1',
      cursor: 'pointer', zIndex: '3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    });
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close Eye Tracker';
    closeBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('equaled:eye-close'));
    });

    container.appendChild(video);
    container.appendChild(canvas);
    container.appendChild(label);
    container.appendChild(closeBtn);
    document.body.appendChild(container);
    return { video, canvas };
  };

  // ── Process FaceMesh results ─────────────────────────────────────
  const onResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;
    const lm = results.multiFaceLandmarks[0];

    // ── Draw face mesh via MediaPipe drawing utils ───────────────
    if (window.drawConnectors && window.FACEMESH_TESSELATION) {
      // Dim tesselation mesh
      window.drawConnectors(ctx, lm, window.FACEMESH_TESSELATION, {
        color: 'rgba(255,255,255,0.12)', lineWidth: 1,
      });
      // Face contours
      window.drawConnectors(ctx, lm, window.FACEMESH_FACE_OVAL, {
        color: 'rgba(255,255,255,0.5)', lineWidth: 1.5,
      });
      // Eyes
      window.drawConnectors(ctx, lm, window.FACEMESH_RIGHT_EYE, {
        color: 'rgba(239,68,68,0.8)', lineWidth: 2,
      });
      window.drawConnectors(ctx, lm, window.FACEMESH_LEFT_EYE, {
        color: 'rgba(239,68,68,0.8)', lineWidth: 2,
      });
    }

    // ── Draw iris rings ──────────────────────────────────────────
    if (window.drawConnectors && window.FACEMESH_RIGHT_IRIS && window.FACEMESH_LEFT_IRIS) {
      window.drawConnectors(ctx, lm, window.FACEMESH_RIGHT_IRIS, {
        color: 'rgba(59,130,246,0.95)', lineWidth: 2,
      });
      window.drawConnectors(ctx, lm, window.FACEMESH_LEFT_IRIS, {
        color: 'rgba(59,130,246,0.95)', lineWidth: 2,
      });
    }

    // ── Draw iris center dots ────────────────────────────────────
    [LEFT_IRIS, RIGHT_IRIS].forEach(idx => {
      if (!lm[idx]) return;
      ctx.beginPath();
      ctx.arc(lm[idx].x * canvas.width, lm[idx].y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(59,130,246,1)';
      ctx.fill();
    });

    // ── Compute gaze position (iris center → screen coords) ──────
    if (!lm[LEFT_IRIS] || !lm[RIGHT_IRIS]) return;
    const irisX = (lm[LEFT_IRIS].x + lm[RIGHT_IRIS].x) / 2;
    const irisY = (lm[LEFT_IRIS].y + lm[RIGHT_IRIS].y) / 2;

    // irisX in camera space (0=left of camera, 1=right)
    // After scaleX(-1) mirror, 0=left of screen when user holds hand left.
    // (1 - irisX) converts to screen space.
    const rawX = (1 - irisX) * window.innerWidth;
    // Vertical: typical face centre is ~0.4-0.6, expand to full screen
    const rawY = ((irisY - 0.25) / 0.5) * window.innerHeight;
    const { x, y } = smoothGaze(rawX, Math.max(0, Math.min(window.innerHeight, rawY)));

    // ── Gaze cursor ──────────────────────────────────────────────
    let cursor = document.getElementById('gaze-cursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'gaze-cursor';
      Object.assign(cursor.style, {
        position: 'fixed', width: '28px', height: '28px',
        borderRadius: '50%',
        border: '3px solid rgba(239,68,68,0.9)',
        background: 'rgba(239,68,68,0.2)',
        pointerEvents: 'none', zIndex: '999999',
        transform: 'translate(-50%,-50%)',
        transition: 'left 0.1s ease, top 0.1s ease',
        boxShadow: '0 0 20px rgba(239,68,68,0.5)',
      });
      document.body.appendChild(cursor);
    }
    cursor.style.left = `${x}px`;
    cursor.style.top  = `${y}px`;

    // ── Edge scroll ──────────────────────────────────────────────
    if (!scrollCD.current) {
      const vh = window.innerHeight;
      if (y < vh * 0.1) {
        window.scrollBy({ top: -100, behavior: 'smooth' });
        scrollCD.current = true;
        setTimeout(() => { scrollCD.current = false; }, 500);
      } else if (y > vh * 0.9) {
        window.scrollBy({ top: 100, behavior: 'smooth' });
        scrollCD.current = true;
        setTimeout(() => { scrollCD.current = false; }, 500);
      }
    }
  };

  // ── Init ─────────────────────────────────────────────────────────
  const init = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
      });
    } catch (err) {
      console.error('[EyeTracking] Camera denied:', err);
      setStatus('error');
      return;
    }

    const { video, canvas } = createPreview();
    videoRef.current = video;
    canvasRef.current = canvas;
    video.srcObject = stream;
    await video.play();

    const faceMesh = new window.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,        // required for iris landmarks (468-477)
      minDetectionConfidence: 0.55,
      minTrackingConfidence: 0.55,
    });
    faceMesh.onResults(onResults);
    meshRef.current = faceMesh;

    const camera = new window.Camera(video, {
      onFrame: async () => {
        if (meshRef.current) await meshRef.current.send({ image: video });
      },
      width: 320, height: 240,
    });
    cameraRef.current = camera;
    camera.start();

    setStatus('active');
    console.log('[EyeTracking] FaceMesh started with iris tracking.');
  };

  // ── Cleanup ──────────────────────────────────────────────────────
  const cleanup = () => {
    try { cameraRef.current?.stop(); } catch (e) {}
    try { meshRef.current?.close(); } catch (e) {}
    cameraRef.current = null; meshRef.current = null;
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    videoRef.current = null;
    ['eye-cam-container', 'gaze-cursor'].forEach(id =>
      document.getElementById(id)?.remove()
    );
    gazeHist.current = [];
    scrollCD.current = false;
    setStatus('idle');
  };

  useEffect(() => {
    if (!enabled) { cleanup(); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setStatus('error'); return; }
    setStatus('loading');

    Promise.all([
      loadScript(DRAWING_URL,   'mp-drawing'),
      loadScript(FACE_MESH_URL, 'mp-facemesh'),
      loadScript(CAMERA_URL,    'mp-camera'),
    ])
      .then(() => setTimeout(() => {
        if (window.FaceMesh && window.Camera) init();
        else setStatus('error');
      }, 400))
      .catch(() => setStatus('error'));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { status };
};
