'use client';

import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────── *
 * GlowCursor — premium ambient cursor glow (Magic MCP quality)
 *
 * A ~500px radial gradient that:
 *   - Follows the cursor with a smooth spring (lerp)
 *   - Intensifies when hovering links/buttons (scale + opacity up)
 *   - Disappears on touch devices
 *   - Respects prefers-reduced-motion (static, no position tracking)
 * ─────────────────────────────────────────────────────────────────────────── */
export default function GlowCursor() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Hide on touch-primary devices
    if (window.matchMedia('(hover: none)').matches) {
      el.style.display = 'none';
      return;
    }

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    let isHovering = false;
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      // Spring interpolation — snappy but smooth
      cx = lerp(cx, tx, 0.1);
      cy = lerp(cy, ty, 0.1);

      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      rafId = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest('a, button, [role="button"], input, textarea, [data-glow="strong"]');
      if (interactive && !isHovering) {
        isHovering = true;
        el.style.opacity = '0.18';
        el.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    };

    const onLeave = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, [role="button"], input, textarea') && isHovering) {
        isHovering = false;
        el.style.opacity = '0.10';
        el.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    const onOut = () => {
      el.style.opacity = '0';
    };

    const onOver = () => {
      el.style.opacity = isHovering ? '0.18' : '0.10';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onEnter, { passive: true });
    document.addEventListener('mouseout', onLeave, { passive: true });
    document.documentElement.addEventListener('mouseleave', onOut);
    document.documentElement.addEventListener('mouseenter', onOver);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
      document.documentElement.removeEventListener('mouseleave', onOut);
      document.documentElement.removeEventListener('mouseenter', onOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        width: '520px',
        height: '520px',
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,172,255,0.12) 0%, rgba(168,85,247,0.06) 45%, transparent 70%)',
        transition: 'opacity 300ms ease, transform 400ms cubic-bezier(0.34,1.56,0.64,1)',
        mixBlendMode: 'screen',
        willChange: 'left, top',
      }}
    />
  );
}
