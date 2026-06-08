'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

// Token-like ASCII chars — looks like raw token stream
const ASCII_CHARS = 'token<>{}[]()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-+=!@#$%^&*|';

const generateCode = (width: number, height: number): string => {
  let out = '';
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      out += ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
    }
    out += '\n';
  }
  return out;
};

type ScannerCardStreamProps = {
  cardImages?: string[];
  repeat?: number;
  cardGap?: number;
  initialSpeed?: number;
  direction?: -1 | 1;
  friction?: number;
  scanEffect?: 'scramble' | 'clip';
  containerHeight?: number;
  cardWidth?: number;
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=720&q=80&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=720&q=80&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=720&q=80&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=720&q=80&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=720&q=80&fit=crop&crop=center',
];

export function ScannerCardStream({
  cardImages = DEFAULT_IMAGES,
  repeat = 4,
  cardGap = 32,
  initialSpeed = 110,
  direction = -1,
  friction = 0.97,
  scanEffect = 'scramble',
  containerHeight = 260,
  cardWidth = 340,
}: ScannerCardStreamProps) {
  const CARD_H = containerHeight - 24;

  const [isScanning, setIsScanning] = useState(false);

  const isPausedRef = useRef(false);
  const isScanningRef = useRef(false);

  const cards = useMemo(() => {
    const total = cardImages.length * repeat;
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      image: cardImages[i % cardImages.length],
      ascii: generateCode(Math.floor(cardWidth / 6.5), Math.floor(CARD_H / 13)),
    }));
  }, [cardImages, repeat, cardWidth, CARD_H]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardLineRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const origAscii = useRef(new Map<number, string>());

  const streamRef = useRef({
    pos: 0,
    vel: initialSpeed,
    dir: direction as number,
    dragging: false,
    lastX: 0,
    lastT: 0,
    totalW: (cardWidth + cardGap) * cards.length,
    minVel: 18,
  });

  useEffect(() => {
    const container = containerRef.current;
    const cardLine = cardLineRef.current;
    const pCanvas = particleCanvasRef.current;
    const sCanvas = scannerCanvasRef.current;
    if (!container || !cardLine || !pCanvas || !sCanvas) return;

    cards.forEach(c => origAscii.current.set(c.id, c.ascii));

    const W = container.offsetWidth || window.innerWidth;
    const H = containerHeight;
    streamRef.current.totalW = (cardWidth + cardGap) * cards.length;
    streamRef.current.lastT = performance.now();

    // ── Three.js ambient particles ──────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-W/2, W/2, H/2, -H/2, 1, 1000);
    camera.position.z = 100;
    const renderer = new THREE.WebGLRenderer({ canvas: pCanvas, alpha: true, antialias: false });
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const N = 180;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N);
    const alp = new Float32Array(N);

    const tc = document.createElement('canvas');
    tc.width = 64; tc.height = 64;
    const tctx = tc.getContext('2d')!;
    const gr = tctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0.02, '#fff');
    gr.addColorStop(0.12, 'hsl(270, 75%, 55%)');
    gr.addColorStop(0.38, 'hsl(270, 65%, 10%)');
    gr.addColorStop(1, 'transparent');
    tctx.fillStyle = gr;
    tctx.beginPath(); tctx.arc(32, 32, 32, 0, Math.PI * 2); tctx.fill();
    const tex = new THREE.CanvasTexture(tc);

    for (let i = 0; i < N; i++) {
      pos[i*3] = (Math.random() - 0.5) * W * 2.2;
      pos[i*3+1] = (Math.random() - 0.5) * H;
      vel[i] = Math.random() * 35 + 15;
      alp[i] = Math.random() * 0.45 + 0.05;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alp, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { tex: { value: tex } },
      vertexShader: `attribute float alpha; varying float va; void main() { va = alpha; vec4 mvp = modelViewMatrix * vec4(position, 1.0); gl_PointSize = 9.0; gl_Position = projectionMatrix * mvp; }`,
      fragmentShader: `uniform sampler2D tex; varying float va; void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, va) * texture2D(tex, gl_PointCoord); }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // ── Scanner line particles ──────────────────────────────────────────
    sCanvas.width = W; sCanvas.height = H;
    const ctx = sCanvas.getContext('2d')!;

    type SP = { x: number; y: number; vx: number; vy: number; r: number; a: number; life: number; decay: number };
    let sparr: SP[] = [];
    const baseN = 250, scanN = 1100;
    let curN = baseN;
    const mkSP = (): SP => ({
      x: W/2 + (Math.random() - 0.5) * 3,
      y: Math.random() * H,
      vx: Math.random() * 0.5 + 0.1,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 0.5 + 0.25,
      a: Math.random() * 0.45 + 0.5,
      life: 1, decay: Math.random() * 0.012 + 0.003,
    });
    for (let i = 0; i < baseN; i++) sparr.push(mkSP());

    // ── Scramble effect ─────────────────────────────────────────────────
    const runScramble = (el: HTMLElement, id: number) => {
      if (el.dataset.scrambling === '1') return;
      el.dataset.scrambling = '1';
      const orig = origAscii.current.get(id % cards.length) || '';
      let n = 0;
      const tick = setInterval(() => {
        el.textContent = generateCode(Math.floor(cardWidth / 6.5), Math.floor(CARD_H / 13));
        if (++n >= 7) { clearInterval(tick); el.textContent = orig; delete el.dataset.scrambling; }
      }, 45);
    };

    // ── Card clipping update ────────────────────────────────────────────
    const updateCards = () => {
      const sX = W / 2;
      const sHalf = 4;
      const sL = sX - sHalf, sR = sX + sHalf;
      const cRect = container.getBoundingClientRect();
      let any = false;

      cardLine.querySelectorAll<HTMLElement>('.sc-card').forEach((wrapper, idx) => {
        const r = wrapper.getBoundingClientRect();
        const relL = r.left - cRect.left;
        const relR = r.right - cRect.left;
        const normal = wrapper.querySelector<HTMLElement>('.sc-normal')!;
        const ascii = wrapper.querySelector<HTMLElement>('.sc-ascii')!;
        const pre = ascii.querySelector<HTMLElement>('pre')!;

        if (relL < sR && relR > sL) {
          any = true;
          if (scanEffect === 'scramble' && wrapper.dataset.scanned !== '1') {
            runScramble(pre, idx);
          }
          wrapper.dataset.scanned = '1';
          const iL = Math.max(sL - relL, 0);
          const iR = Math.min(sR - relL, r.width);
          normal.style.setProperty('--cr', `${(iL / r.width) * 100}%`);
          ascii.style.setProperty('--cl', `${(iR / r.width) * 100}%`);
        } else {
          delete wrapper.dataset.scanned;
          if (relR < sL) {
            normal.style.setProperty('--cr', '100%');
            ascii.style.setProperty('--cl', '100%');
          } else {
            normal.style.setProperty('--cr', '0%');
            ascii.style.setProperty('--cl', '0%');
          }
        }
      });

      if (any !== isScanningRef.current) {
        isScanningRef.current = any;
        setIsScanning(any);
      }
    };

    // ── Mouse / touch / wheel handlers ──────────────────────────────────
    const onDown = (e: MouseEvent | TouchEvent) => {
      streamRef.current.dragging = true;
      streamRef.current.lastX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      streamRef.current.vel = 0;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!streamRef.current.dragging) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const dx = x - streamRef.current.lastX;
      streamRef.current.pos += dx;
      streamRef.current.vel = Math.abs(dx) * 28;
      streamRef.current.dir = dx > 0 ? 1 : -1;
      streamRef.current.lastX = x;
    };
    const onUp = () => { streamRef.current.dragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      streamRef.current.vel = Math.min(Math.abs(e.deltaY) * 2.5, 350);
      streamRef.current.dir = e.deltaY > 0 ? -1 : 1;
    };

    cardLine.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    cardLine.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    cardLine.addEventListener('wheel', onWheel, { passive: false });

    // ── Animation loop ───────────────────────────────────────────────────
    let rafId: number;
    const animate = (now: number) => {
      const dt = Math.min((now - streamRef.current.lastT) / 1000, 0.05);
      streamRef.current.lastT = now;

      if (!isPausedRef.current && !streamRef.current.dragging) {
        streamRef.current.vel = streamRef.current.vel > streamRef.current.minVel
          ? streamRef.current.vel * friction
          : streamRef.current.minVel;
        streamRef.current.pos += streamRef.current.vel * streamRef.current.dir * dt;
      }

      const scrollPos = streamRef.current.pos;
      const { totalW } = streamRef.current;
      const cW = container.offsetWidth;
      if (scrollPos < -totalW) streamRef.current.pos = cW;
      else if (scrollPos > cW) streamRef.current.pos = -totalW;
      cardLine.style.transform = `translateX(${streamRef.current.pos}px)`;

      updateCards();

      // Ambient particles
      const t = now * 0.001;
      for (let i = 0; i < N; i++) {
        pos[i*3] += vel[i] * 0.016;
        if (pos[i*3] > W/2 + 80) pos[i*3] = -W/2 - 80;
        pos[i*3+1] += Math.sin(t + i * 0.08) * 0.25;
        alp[i] = Math.max(0.04, Math.min(0.7, alp[i] + (Math.random() - 0.5) * 0.025));
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.alpha.needsUpdate = true;
      renderer.render(scene, camera);

      // Scanner particles
      ctx.clearRect(0, 0, W, H);
      const tgt = isScanningRef.current ? scanN : baseN;
      curN += (tgt - curN) * 0.07;
      while (sparr.length < curN) sparr.push(mkSP());
      while (sparr.length > curN + 40) sparr.pop();
      sparr.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0 || p.x > W) Object.assign(p, mkSP());
        ctx.globalAlpha = p.a * p.life;
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      cardLine.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cardLine.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      cardLine.removeEventListener('wheel', onWheel);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      tex.dispose();
    };
  }, [cards, cardGap, cardWidth, CARD_H, containerHeight, friction, scanEffect]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: containerHeight }}
    >
      {/* Three.js ambient particles */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />
      {/* Scanner glow particles */}
      <canvas
        ref={scannerCanvasRef}
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      />

      {/* Vertical scanner line */}
      <div
        className={`absolute top-1/2 left-1/2 w-px -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none
          bg-gradient-to-b from-transparent via-violet-400 to-transparent rounded-full
          transition-opacity duration-500 animate-scan-pulse
          ${isScanning ? 'opacity-100' : 'opacity-25'}`}
        style={{
          height: containerHeight - 16,
          boxShadow: '0 0 8px #a78bfa, 0 0 20px #a78bfa, 0 0 40px #8b5cf6, 0 0 60px #6366f1',
        }}
      />

      {/* Card stream */}
      <div className="absolute inset-0 flex items-center" style={{ zIndex: 20 }}>
        <div
          ref={cardLineRef}
          className="flex items-center cursor-grab active:cursor-grabbing select-none will-change-transform"
          style={{ gap: cardGap }}
        >
          {cards.map(card => (
            <div
              key={card.id}
              className="sc-card relative shrink-0 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              style={{ width: cardWidth, height: CARD_H }}
            >
              {/* Real image — visible left of scanner */}
              <div
                className="sc-normal absolute inset-0 z-[2] overflow-hidden rounded-2xl"
                style={{ clipPath: 'inset(0 0 0 var(--cr, 0%))' }}
              >
                <img
                  src={card.image}
                  alt=""
                  className="w-full h-full object-cover brightness-90 contrast-105"
                  draggable={false}
                  loading="lazy"
                />
                {/* Subtle overlay so it reads as "unprocessed content" */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-blue-900/10" />
              </div>

              {/* ASCII token overlay — visible right of scanner */}
              <div
                className="sc-ascii absolute inset-0 z-[1] overflow-hidden rounded-2xl bg-[#07070F]"
                style={{ clipPath: 'inset(0 calc(100% - var(--cl, 0%)) 0 0)' }}
              >
                <pre
                  className="animate-glitch absolute inset-0 text-violet-300/65 font-mono text-[10px] leading-[13px] overflow-hidden whitespace-pre m-0 p-2"
                  style={{
                    maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%)',
                  }}
                >
                  {card.ascii}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge fades into page background */}
      <div className="absolute left-0 top-0 h-full w-28 z-40 pointer-events-none bg-gradient-to-r from-[var(--md-dark-2)] to-transparent" />
      <div className="absolute right-0 top-0 h-full w-28 z-40 pointer-events-none bg-gradient-to-l from-[var(--md-dark-2)] to-transparent" />
    </div>
  );
}
