'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { MountainScene } from '@/lib/webgl/mountainScene';

// Each scroll band carries an emotion via two hex colors (+ fog).
export interface MoodStop {
  at: number;       // scroll progress 0..1 where this mood is centered
  colorA: string;   // near / low terrain
  colorB: string;   // high / atmospheric light
  fog: string;      // horizon / background
}

interface MountainBackgroundProps {
  moods: MoodStop[];
}

function lerpHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

// Pick the two surrounding mood stops and blend between them
function moodAt(moods: MoodStop[], p: number): { colorA: string; colorB: string; fog: string } {
  if (moods.length === 1) return moods[0];
  let lo = moods[0], hi = moods[moods.length - 1];
  for (let i = 0; i < moods.length - 1; i++) {
    if (p >= moods[i].at && p <= moods[i + 1].at) { lo = moods[i]; hi = moods[i + 1]; break; }
  }
  const span = hi.at - lo.at || 1;
  const t = Math.min(1, Math.max(0, (p - lo.at) / span));
  return {
    colorA: lerpHex(lo.colorA, hi.colorA, t),
    colorB: lerpHex(lo.colorB, hi.colorB, t),
    fog:    lerpHex(lo.fog, hi.fog, t),
  };
}

export default function MountainBackground({ moods }: MountainBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGL availability guard
    const probe = document.createElement('canvas');
    const hasWebGL = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
    if (!hasWebGL) {
      canvas.style.background = `linear-gradient(180deg, ${moods[0].fog}, ${moods[0].colorA})`;
      return;
    }

    let scene: MountainScene;
    try {
      scene = new MountainScene({ canvas, colorA: moods[0].colorA, colorB: moods[0].colorB, fog: moods[0].fog });
    } catch {
      canvas.style.background = `linear-gradient(180deg, ${moods[0].fog}, ${moods[0].colorA})`;
      return;
    }

    // Lenis smooth scroll — drives camera velocity physically
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, smoothWheel: true });
    let progress = 0;
    let velocity = 0;

    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      progress = e.progress;
      velocity = e.velocity;
    });

    let raf = 0;
    let lastColorUpdate = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      if (!reduced) {
        scene.setScroll(progress, velocity);
        // Throttle color lerp to ~20fps; it's cheap but no need every frame
        if (time - lastColorUpdate > 50) {
          const m = moodAt(moods, progress);
          scene.setColors(m.colorA, m.colorB, m.fog);
          lastColorUpdate = time;
        }
      }
      scene.render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => scene.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      lenis.destroy();
      scene.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      aria-hidden
    />
  );
}
