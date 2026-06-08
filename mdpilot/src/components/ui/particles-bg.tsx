'use client';
import { useEffect, useCallback } from 'react';

export default function HeroParticles() {
  const init = useCallback(() => {
    const container = document.getElementById('hc-particles');
    if (!container) return;
    const old = container.querySelector('canvas');
    if (old) old.remove();
    // @ts-expect-error particles.js is CDN-loaded
    if (window.pJSDom?.length) {
      // @ts-expect-error
      window.pJSDom.forEach((p: { pJS: { fn: { vendors: { destroypJS: () => void } } } }) => {
        try { p.pJS.fn.vendors.destroypJS(); } catch { /* ignore */ }
      });
      // @ts-expect-error
      window.pJSDom = [];
    }
    // @ts-expect-error
    window.particlesJS('hc-particles', {
      particles: {
        number: { value: 55, density: { enable: true, value_area: 1100 } },
        color: { value: '#4FACFF' },
        shape: { type: 'circle' },
        opacity: {
          value: 0.22,
          random: true,
          anim: { enable: true, speed: 0.5, opacity_min: 0.04, sync: false },
        },
        size: { value: 2, random: true, anim: { enable: false } },
        line_linked: {
          enable: true,
          distance: 115,
          color: '#4FACFF',
          opacity: 0.06,
          width: 0.5,
        },
        move: { enable: true, speed: 0.75, random: true, out_mode: 'bounce', straight: false },
      },
      interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: false }, onclick: { enable: false }, resize: true },
      },
      retina_detect: true,
    });
  }, []);

  useEffect(() => {
    // @ts-expect-error
    if (typeof window.particlesJS === 'function') { init(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    s.async = true;
    s.onload = init;
    document.head.appendChild(s);
    return () => { if (document.head.contains(s)) document.head.removeChild(s); };
  }, [init]);

  return (
    <div
      id="hc-particles"
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
