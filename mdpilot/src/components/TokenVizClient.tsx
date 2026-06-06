'use client';

import { useEffect, useRef, useState } from 'react';

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.35) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function useCountDown(from: number, to: number, active: boolean, duration = 1400, delay = 200) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      const startTime = Date.now();
      const diff = from - to;
      const raf = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(from - diff * eased));
        if (p < 1) requestAnimationFrame(raf);
        else setValue(to);
      };
      requestAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(t);
  }, [active, from, to, duration, delay]);
  return value;
}

/* ─── SVG Radial progress ring ──────────────────────────────────────────── */
function RadialRing({ pct, active }: { pct: number; active: boolean }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const [dash, setDash] = useState(circ);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setDash(circ * (1 - pct / 100)), 300);
    return () => clearTimeout(t);
  }, [active, pct, circ]);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="rotate-[-90deg]">
      {/* Track */}
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      {/* Progress */}
      <circle
        cx="70" cy="70" r={radius} fill="none"
        stroke="url(#ring-grad)" strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4FACFF" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Pass bar ───────────────────────────────────────────────────────────── */
function PassBar({ pct, color, active, delay }: { pct: number; color: string; active: boolean; delay: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [active, pct, delay]);
  return (
    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${w}%`, transition: 'width 900ms cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function TokenVizClient() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref);

  const before = 2847;
  const after = 1764;
  const tokenCount = useCountDown(before, after, active, 1400, 400);
  const pctCount = useCountDown(100, 62, active, 1400, 400);
  const savedCount = useCountDown(0, 38, active, 1400, 800);

  const [afterWidth, setAfterWidth] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setAfterWidth(62), 350);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div ref={ref} className="relative">
      <div className="terminal-chrome shadow-[0_0_80px_rgba(0,0,0,0.5)]">
        {/* Title bar */}
        <div className="terminal-titlebar">
          <span className="terminal-dot bg-[#FF5F57]" />
          <span className="terminal-dot bg-[#FEBC2E]" />
          <span className="terminal-dot bg-[#28C840]" />
          <span className="ml-3 text-[11px] font-mono text-white/25">Token optimizer — results</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Top row: bars left, ring right */}
          <div className="flex gap-6 items-center">
            <div className="flex-1 space-y-5">
              {/* Before bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-white/30">Before</span>
                  <span className="text-[11px] font-mono text-white/40">{before.toLocaleString()} tokens</span>
                </div>
                <div className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-full bg-white/10 rounded-full" />
                </div>
              </div>

              {/* After bar — animated */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-white/30">After</span>
                  <span className="text-[11px] font-mono text-[#4FACFF] tabular-nums">{tokenCount.toLocaleString()} tokens</span>
                </div>
                <div className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9]"
                    style={{ width: `${afterWidth}%`, transition: 'width 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
                  />
                </div>
              </div>

              {/* Saved callout */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span className="text-[12px] text-white/30">Total saved</span>
                <div className="flex items-center gap-1">
                  <span className="text-[22px] font-black text-[#34D399] tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ↓ {savedCount}%
                  </span>
                </div>
              </div>
            </div>

            {/* Radial ring */}
            <div className="shrink-0 relative w-[140px] h-[140px]">
              <RadialRing pct={38} active={active} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[26px] font-black text-white tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {savedCount}%
                </span>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">saved</span>
              </div>
            </div>
          </div>

          {/* Pass breakdown with animated bars */}
          <div className="space-y-3 pt-1">
            {[
              { label: 'Boilerplate strip',     saved: 642, pct: 59, color: 'bg-[#FBBF24]', delay: 500 },
              { label: 'Cross-file dedup',      saved: 318, pct: 29, color: 'bg-[#FF6B6B]', delay: 700 },
              { label: 'Structure compression', saved: 123, pct: 11, color: 'bg-[#A855F7]', delay: 900 },
            ].map(p => (
              <div key={p.label}>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
                  <span className="text-[11px] text-white/35 flex-1">{p.label}</span>
                  <span className="text-[11px] font-mono text-white/50 tabular-nums">−{p.saved} tok</span>
                </div>
                <PassBar pct={p.pct} color={p.color} active={active} delay={p.delay} />
              </div>
            ))}
          </div>

          {/* Footer tick */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
            </span>
            <span className="text-[10px] font-mono text-white/20">optimizer running on every generation</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#FBBF24]/10 blur-2xl rounded-full" />
    </div>
  );
}
