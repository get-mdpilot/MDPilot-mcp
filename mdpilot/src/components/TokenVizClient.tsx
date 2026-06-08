'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Intersection observer — fires once ────────────────────────────────── */
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

/* ── Animated counter — resets + replays whenever `trigger` changes ────── */
function useAnimated(from: number, to: number, trigger: number, duration = 1700, delay = 0) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (trigger < 0) return;
    setValue(from);
    const tid = setTimeout(() => {
      const t0 = Date.now();
      const diff = from - to;
      const raf = () => {
        const p = Math.min((Date.now() - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(from - diff * eased));
        if (p < 1) requestAnimationFrame(raf);
        else setValue(to);
      };
      requestAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(tid);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
  return value;
}

/* ── Radial progress ring ───────────────────────────────────────────────── */
function RadialRing({ pct, trigger }: { pct: number; trigger: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const [dash, setDash] = useState(circ);

  useEffect(() => {
    setDash(circ);
    if (trigger < 0) return;
    const tid = setTimeout(() => setDash(circ * (1 - pct / 100)), 400);
    return () => clearTimeout(tid);
  }, [trigger, circ, pct]);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={radius} fill="none"
        stroke="url(#ring-grad-5p)" strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset 1.7s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <defs>
        <linearGradient id="ring-grad-5p" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FBBF24" />
          <stop offset="50%"  stopColor="#A855F7" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Pass bar ───────────────────────────────────────────────────────────── */
function PassBar({ pct, color, trigger, delay }: { pct: number; color: string; trigger: number; delay: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    if (trigger < 0) return;
    const tid = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(tid);
  }, [trigger, pct, delay]);
  return (
    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${w}%`, transition: 'width 950ms cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </div>
  );
}

/* ── Pass definitions — 5 passes, savings sum to 1,083 (38 % of 2,847) ── */
const PASSES = [
  { n: '01', label: 'Boilerplate strip',   saved: 547, barPct: 100, color: 'bg-[#FBBF24]', delay:  450 },
  { n: '02', label: 'Cross-file dedup',    saved: 264, barPct:  48, color: 'bg-[#FF6B6B]', delay:  680 },
  { n: '03', label: 'Structure compress',  saved: 136, barPct:  25, color: 'bg-[#A855F7]', delay:  900 },
  { n: '04', label: 'Verbose compress',    saved:  94, barPct:  17, color: 'bg-[#2DD4BF]', delay: 1110 },
  { n: '05', label: 'Line compression',    saved:  42, barPct:   8, color: 'bg-[#4FACFF]', delay: 1300 },
];
const BEFORE    = 2847;
const AFTER     = 1764;
const SAVED_PCT = 38;

/* ── Main component ─────────────────────────────────────────────────────── */
export default function TokenVizClient() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const [trigger, setTrigger] = useState(-1);

  // Enter view → start; then auto-replay every 8 s
  useEffect(() => {
    if (!visible) return;
    setTrigger(0);
    const id = setInterval(() => setTrigger(t => t + 1), 8000);
    return () => clearInterval(id);
  }, [visible]);

  const tokenCount = useAnimated(BEFORE, AFTER, trigger, 1800, 280);
  const savedCount = useAnimated(0, SAVED_PCT, trigger, 1800, 560);

  const [afterWidth, setAfterWidth] = useState(0);
  useEffect(() => {
    setAfterWidth(0);
    if (trigger < 0) return;
    const tid = setTimeout(() => setAfterWidth(62), 320);
    return () => clearTimeout(tid);
  }, [trigger]);

  return (
    <div ref={ref} className="relative">
      <div className="terminal-chrome shadow-[0_0_80px_rgba(0,0,0,0.5)]">

        {/* Title bar */}
        <div className="terminal-titlebar">
          <span className="terminal-dot bg-[#FF5F57]" />
          <span className="terminal-dot bg-[#FEBC2E]" />
          <span className="terminal-dot bg-[#28C840]" />
          <span className="ml-3 text-[11px] font-mono text-white/25 flex-1">
            Token optimizer — results
          </span>
          {/* Live badge */}
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#34D399]/25 bg-[#34D399]/[0.07]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
            </span>
            <span className="text-[9px] font-mono text-[#34D399]/70 uppercase tracking-widest">live</span>
          </span>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Before / After bars + ring ─────────────────────────────── */}
          <div className="flex gap-6 items-center">
            <div className="flex-1 space-y-4">

              {/* Before */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-white/30">Before</span>
                  <span className="text-[11px] font-mono text-white/40">{BEFORE.toLocaleString()} tokens</span>
                </div>
                <div className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-full bg-white/10 rounded-full" />
                </div>
              </div>

              {/* After — animated */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-white/30">After</span>
                  <span className="text-[11px] font-mono text-[#4FACFF] tabular-nums">
                    {tokenCount.toLocaleString()} tokens
                  </span>
                </div>
                <div className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] via-[#A855F7] to-[#38D9A9]"
                    style={{ width: `${afterWidth}%`, transition: 'width 1.8s cubic-bezier(0.34,1.56,0.64,1)' }}
                  />
                </div>
              </div>

              {/* Total saved */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <span className="text-[12px] text-white/30">Total saved</span>
                <span
                  className="text-[22px] font-black text-[#34D399] tabular-nums"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  ↓ {savedCount}%
                </span>
              </div>
            </div>

            {/* Radial ring */}
            <div className="shrink-0 relative w-[140px] h-[140px]">
              <RadialRing pct={SAVED_PCT} trigger={trigger} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[26px] font-black text-white tabular-nums"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {savedCount}%
                </span>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">saved</span>
              </div>
            </div>
          </div>

          {/* ── 5-pass breakdown ───────────────────────────────────────── */}
          <div className="space-y-2.5 pt-1">
            {PASSES.map(p => (
              <div key={p.label}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-[9px] font-mono text-white/20 w-4 shrink-0">{p.n}</span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.color}`} />
                  <span className="text-[11px] text-white/35 flex-1">{p.label}</span>
                  <span className="text-[11px] font-mono text-white/50 tabular-nums">−{p.saved} tok</span>
                </div>
                <PassBar pct={p.barPct} color={p.color} trigger={trigger} delay={p.delay} />
              </div>
            ))}
          </div>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
              </span>
              <span className="text-[10px] font-mono text-white/20">optimizer running on every generation</span>
            </div>
            {trigger >= 0 && (
              <span className="text-[9px] font-mono text-white/15">run #{trigger + 1}</span>
            )}
          </div>

        </div>
      </div>

      {/* Glow under the card */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#FBBF24]/10 blur-2xl rounded-full pointer-events-none" />
    </div>
  );
}
