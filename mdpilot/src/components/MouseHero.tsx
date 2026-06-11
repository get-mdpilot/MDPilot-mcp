'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import StatsCounterClient from './StatsCounterClient';
import HeroParticles from '@/components/ui/particles-bg';
import HeroCircuitBg from '@/components/ui/hero-circuit-bg';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface MousePos { x: number; y: number }
interface CardTilt { rotX: number; rotY: number; tx: number; ty: number }

/* ─── Magnetic tilt hook ──────────────────────────────────────────────────── */
function useCardTilt(
  containerRef: React.RefObject<HTMLDivElement | null>,
  mouse: MousePos,
  intensity = 18,
  magnetStrength = 30,
) {
  const [tilt, setTilt] = useState<CardTilt>({ rotX: 0, rotY: 0, tx: 0, ty: 0 });
  // Cache center point — updated by ResizeObserver, NOT on every mouse move.
  // This avoids forced reflow (reading layout after style invalidation).
  const centerRef = useRef<{ cx: number; cy: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Skip on touch-primary devices (no mouse = no tilt needed)
    if (window.matchMedia('(hover: none)').matches) return;

    const updateCenter = () => {
      const r = el.getBoundingClientRect();
      centerRef.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };
    updateCenter();

    const ro = new ResizeObserver(updateCenter);
    ro.observe(el);
    // Scroll shifts the card's position — re-cache on scroll
    window.addEventListener('scroll', updateCenter, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener('scroll', updateCenter); };
  }, [containerRef]);

  useEffect(() => {
    const c = centerRef.current;
    if (!c) return;

    const dx = (mouse.x - c.cx) / (window.innerWidth / 2);
    const dy = (mouse.y - c.cy) / (window.innerHeight / 2);
    const dist = Math.sqrt((mouse.x - c.cx) ** 2 + (mouse.y - c.cy) ** 2);
    const falloff = Math.max(0, 1 - dist / 420);

    setTilt({
      rotX: -dy * intensity * falloff,
      rotY: dx * intensity * falloff,
      tx: dx * magnetStrength * falloff,
      ty: dy * magnetStrength * falloff,
    });
  }, [mouse, intensity, magnetStrength]);

  return tilt;
}

/* ─── Single floating file card ─────────────────────────────────────────── */
function FloatingCard({
  filename, accent, glow, lines, className = '',
  baseTransform, mouse,
}: {
  filename: string; accent: string; glow: string; lines: string[];
  className?: string; baseTransform: string; mouse: MousePos;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tilt = useCardTilt(ref, mouse, 14, 24);

  return (
    <div
      ref={ref}
      className={`float absolute select-none ${className}`}
      style={{
        transform: `${baseTransform} perspective(900px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) translate(${tilt.tx}px, ${tilt.ty}px)`,
        transition: 'transform 120ms linear',
        willChange: 'transform',
      }}
    >
      <div className={`relative rounded-2xl border border-white/[0.07] bg-[rgba(13,13,26,0.88)] backdrop-blur-xl p-4 w-[196px] ${glow}`}>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/[0.04] to-transparent rotate-12" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-400/50" />
            <span className="w-2 h-2 rounded-full bg-amber-400/50" />
            <span className="w-2 h-2 rounded-full bg-green-400/50" />
            <span className={`ml-auto text-[10px] font-mono font-bold ${accent}`}>{filename}</span>
          </div>
          <div className="space-y-1.5">
            {lines.map((w, i) => (
              <div
                key={i}
                className="h-[5px] rounded-full"
                style={{
                  width: w,
                  background: i % 3 === 0
                    ? 'rgba(79,172,255,0.25)'
                    : i % 3 === 1
                    ? 'rgba(168,85,247,0.20)'
                    : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Terminal window ─────────────────────────────────────────────────────── */
function TerminalWindow() {
  const lines = [
    { tokens: [{ type: 'comment', text: '# TASK.md — Fix auth redirect loop' }] },
    { tokens: [] },
    { tokens: [{ type: 'keyword', text: '## Goal' }] },
    { tokens: [{ type: 'string', text: 'After OAuth callback, redirect to /dashboard' }] },
    { indent: 1, tokens: [{ type: 'string', text: 'not back to /login. Regression in v3.1.' }] },
    { tokens: [] },
    { tokens: [{ type: 'keyword', text: '## Constraints' }] },
    { tokens: [{ type: 'function', text: '- ' }, { type: 'string', text: 'No changes to auth provider config' }] },
    { indent: 1, tokens: [{ type: 'function', text: '- ' }, { type: 'string', text: 'Preserve existing session TTL' }] },
    { tokens: [] },
    { tokens: [{ type: 'keyword', text: '## Done when' }] },
    { tokens: [{ type: 'comment', text: '- [ ] /auth/callback → /dashboard' }] },
  ];
  return (
    <div className="terminal-chrome shadow-[0_0_60px_rgba(0,0,0,0.6)] w-full">
      <div className="terminal-titlebar">
        <span className="terminal-dot bg-[#FF5F57]" />
        <span className="terminal-dot bg-[#FEBC2E]" />
        <span className="terminal-dot bg-[#28C840]" />
        <span className="ml-3 text-[11px] font-mono text-white/25">TASK.md — MDPilot</span>
      </div>
      <div className="px-5 py-4 space-y-1 text-[12.5px] font-mono leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} style={{ paddingLeft: `${(line.indent ?? 0) * 16}px` }}>
            {line.tokens.map((t, j) => (
              <span key={j} className={`token-${t.type}`}>{t.text}</span>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-white/30">{'>'}</span>
          <span className="text-[#82aaff]">_</span>
          <span className="cursor w-2 h-4 bg-[#4FACFF] rounded-[2px] opacity-80" />
        </div>
      </div>
    </div>
  );
}

/* ─── Hero section ───────────────────────────────────────────────────────── */
export default function MouseHero() {
  const [mouse, setMouse] = useState<MousePos>({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    // Skip on touch-primary devices — no mouse means no tilt, no need to track
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [onMouseMove]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[96vh] flex flex-col items-center justify-center px-5 sm:px-8 pt-4 pb-24 overflow-hidden"
    >
      {/* Deepest background layers: particles + circuit (behind grid-bg) */}
      <HeroParticles />
      <HeroCircuitBg />

      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Animated gradient mesh — more premium than blobs */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="g1" cx="20%" cy="20%" r="55%">
            <stop offset="0%" stopColor="#4FACFF" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#4FACFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g2" cx="80%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g3" cx="55%" cy="40%" r="40%">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-heavy">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" filter="url(#blur-heavy)" />
        <rect width="100%" height="100%" fill="url(#g2)" filter="url(#blur-heavy)" />
        <rect width="100%" height="100%" fill="url(#g3)" filter="url(#blur-heavy)" />
      </svg>

      {/* Cursor-reactive file cards */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden xl:block">
        <FloatingCard
          filename="README.md" accent="text-[#4FACFF]"
          glow="shadow-[0_0_40px_rgba(79,172,255,0.14)]"
          lines={['80%','60%','90%','45%','70%','55%']}
          baseTransform="perspective(900px) rotateY(20deg) rotateX(-8deg)"
          className="top-[18%] left-[4%] float-delay-0"
          mouse={mouse}
        />
        <FloatingCard
          filename="AGENTS.md" accent="text-[#A855F7]"
          glow="shadow-[0_0_40px_rgba(168,85,247,0.14)]"
          lines={['65%','85%','50%','75%','40%','80%']}
          baseTransform="perspective(900px) rotateY(-20deg) rotateX(-6deg)"
          className="top-[22%] right-[4%] float-delay-1"
          mouse={mouse}
        />
        <FloatingCard
          filename="TASK.md" accent="text-[#2DD4BF]"
          glow="shadow-[0_0_40px_rgba(45,212,191,0.14)]"
          lines={['70%','50%','85%','60%','45%']}
          baseTransform="perspective(900px) rotateY(16deg) rotateX(6deg)"
          className="bottom-[6%] left-[5%] float-delay-2"
          mouse={mouse}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto fade-up mt-10 sm:mt-16">

        {/* Live badge — sits at the very top */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl text-[12px] text-white/50">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
          </span>
          Task mode · no account needed
          <span className="hidden sm:inline text-white/20">·</span>
          <span className="hidden sm:inline font-mono text-[#34D399]/70">try it →</span>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-black leading-[1.04] tracking-[-0.04em] mb-8">
          <span className="text-white block">Give your AI agent</span>
          <span className="text-gradient-animated block">the perfect starting point.</span>
        </h1>

        <p className="text-[17px] sm:text-[18px] text-white/40 max-w-[560px] mx-auto leading-relaxed mb-10">
          Paste a ticket, thread, or half-formed idea — MDPilot turns it into a precise, expert-grade prompt: structured, gap-checked, and tuned to how you work, so the whole AI conversation starts right.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/task"
            className="btn-shine relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-[15px] font-black shadow-[0_0_30px_rgba(79,172,255,0.30)] hover:shadow-[0_0_50px_rgba(79,172,255,0.50)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Start with a task →
          </Link>
        </div>

        {/* MCP teaser */}
        <p className="text-[12px] text-white/25 mb-16">
          Prefer to work in your editor?{' '}
          <Link href="/labs" className="text-white/40 hover:text-[#4FACFF]/70 transition-colors underline underline-offset-2 decoration-white/15 hover:decoration-[#4FACFF]/30">
            MDPilot runs as an MCP server
          </Link>
          {' '}inside Claude Code, Cursor &amp; Windsurf.
        </p>

        {/* Stats */}
        <StatsCounterClient />
      </div>

      {/* Terminal — right side on wide screens */}
      <div className="relative z-20 mt-16 w-full max-w-lg mx-auto fade-up fade-up-2 xl:absolute xl:right-[4%] xl:bottom-[12%] xl:w-80 xl:mt-0">
        <TerminalWindow />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-[#4FACFF]/15 rounded-full blur-xl" />
      </div>
    </section>
  );
}
