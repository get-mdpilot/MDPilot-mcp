'use client';

import { useEffect, useRef, useState } from 'react';

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.2) {
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

function useCountUp(target: number, active: boolean, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      const startTime = Date.now();
      const raf = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(raf);
        else setValue(target);
      };
      requestAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(t);
  }, [active, target, duration, delay]);
  return value;
}

/* ─── Animated bar ──────────────────────────────────────────────────────── */
function AnimBar({
  pct, color, active, delay = 0,
}: { pct: number; color: string; active: boolean; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [active, pct, delay]);
  return (
    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${w}%`, transition: 'width 900ms cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </div>
  );
}

/* ─── Stack coverage card ────────────────────────────────────────────────── */
function StackCoverageCard({ active }: { active: boolean }) {
  const stacks = [
    { name: 'Next.js',     pct: 94, color: 'bg-[#4FACFF]',  delay: 200 },
    { name: 'React',       pct: 91, color: 'bg-[#61DAFB]/80', delay: 300 },
    { name: 'Python',      pct: 87, color: 'bg-[#3776AB]/90', delay: 400 },
    { name: 'Rust',        pct: 82, color: 'bg-[#F74C00]/80', delay: 500 },
    { name: 'Go',          pct: 79, color: 'bg-[#00ACD7]/80', delay: 600 },
    { name: 'Svelte',      pct: 75, color: 'bg-[#FF3E00]/70', delay: 700 },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.12em]">Stack coverage</p>
        <span className="text-[10px] font-mono text-[#4FACFF]/70 bg-[#4FACFF]/[0.08] border border-[#4FACFF]/20 rounded-full px-2 py-0.5">
          27 detected
        </span>
      </div>
      <div className="space-y-3 flex-1">
        {stacks.map(s => (
          <div key={s.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-white/50">{s.name}</span>
              <span className="text-[10px] font-mono text-white/30 tabular-nums">{s.pct}%</span>
            </div>
            <AnimBar pct={s.pct} color={s.color} active={active} delay={s.delay} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── File type distribution card ────────────────────────────────────────── */
function FileDistCard({ active }: { active: boolean }) {
  const files = [
    { name: 'CLAUDE.md',      pct: 34, color: '#2DD4BF', accent: 'text-[#2DD4BF]' },
    { name: 'README.md',      pct: 26, color: '#4FACFF', accent: 'text-[#4FACFF]' },
    { name: 'AGENTS.md',      pct: 18, color: '#A855F7', accent: 'text-[#A855F7]' },
    { name: 'TASK.md',        pct: 12, color: '#FBBF24', accent: 'text-[#FBBF24]' },
    { name: 'CONTRIBUTING.md',pct: 10, color: '#FF6B6B', accent: 'text-[#FF6B6B]' },
  ];

  // Build SVG donut segments
  const size = 100;
  const r = 38;
  const cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, [active]);

  let offset = 0;
  const segments = files.map(f => {
    const len = (f.pct / 100) * circ;
    const seg = { ...f, dashOffset: circ - len, startOffset: -offset };
    offset += len;
    return seg;
  });

  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.12em] mb-4">Most generated</p>
      <div className="flex items-center gap-5 flex-1">
        {/* Donut SVG */}
        <div className="relative shrink-0 w-24 h-24">
          <svg viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg] w-full h-full">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
            {segments.map((seg, i) => (
              <circle
                key={seg.name}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeLinecap="butt"
                strokeDasharray={`${drawn ? (seg.pct / 100) * circ : 0} ${circ}`}
                strokeDashoffset={seg.startOffset}
                style={{ transition: `stroke-dasharray 800ms cubic-bezier(0.34,1.56,0.64,1) ${200 + i * 100}ms` }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>9</span>
            <span className="text-[8px] font-mono text-white/25">types</span>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-2 flex-1">
          {files.map(f => (
            <div key={f.name} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: f.color }} />
              <span className="text-[10px] font-mono text-white/40 flex-1 truncate">{f.name}</span>
              <span className="text-[10px] font-mono text-white/30 tabular-nums">{f.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Live token counter card ─────────────────────────────────────────────── */
function LiveTokenCard({ active }: { active: boolean }) {
  const total = useCountUp(2_847_309, active, 2000, 200);
  const [tick, setTick] = useState(0);

  // Simulate live token saves rolling in
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick(v => v + 1), 2200);
    return () => clearInterval(id);
  }, [active]);

  const [liveAdd, setLiveAdd] = useState(0);
  useEffect(() => {
    if (!active || tick === 0) return;
    const n = Math.floor(Math.random() * 300 + 800);
    setLiveAdd(n);
    const t = setTimeout(() => setLiveAdd(0), 1800);
    return () => clearTimeout(t);
  }, [tick, active]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
        </span>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.12em]">Tokens saved (simulated)</p>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <p
          className="text-[32px] sm:text-[38px] font-black text-white tabular-nums leading-none"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {(total + liveAdd).toLocaleString()}
        </p>
        <p className="text-[11px] text-white/30 mt-1.5">tokens saved across all generations</p>
        {liveAdd > 0 && (
          <span
            className="inline-flex mt-2 text-[11px] font-mono text-[#34D399] animate-pulse"
          >
            +{liveAdd.toLocaleString()} just now
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'avg / file', val: '38%' },
          { label: 'passes',     val: '5'   },
          { label: 'latency',    val: '<1s' },
        ].map(m => (
          <div key={m.label} className="bg-white/[0.03] rounded-xl p-2.5 text-center border border-white/[0.05]">
            <p className="text-[14px] font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{m.val}</p>
            <p className="text-[9px] font-mono text-white/25 uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Axis score row (extracted to avoid hooks-in-loop) ─────────────────── */
function AxisScoreRow({ label, score, active, delay }: { label: string; score: number; active: boolean; delay: number }) {
  const count = useCountUp(score, active, 700, delay);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-white/35 leading-tight">{label}</span>
      <span className="text-[11px] font-mono text-[#4FACFF] tabular-nums shrink-0">{count}</span>
    </div>
  );
}

/* ─── Quality radar card ──────────────────────────────────────────────────── */
function QualityRadarCard({ active }: { active: boolean }) {
  const axes = [
    { label: 'Token efficiency', score: 94 },
    { label: 'Agent readability', score: 91 },
    { label: 'Stack accuracy', score: 88 },
    { label: 'Structure', score: 96 },
    { label: 'Completeness', score: 89 },
  ];
  const n = axes.length;
  const cx = 80, cy = 80, r = 60;
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setDrawn(true), 400);
    return () => clearTimeout(t);
  }, [active]);

  // Polygon points for radar
  const points = (scores: number[]) =>
    scores.map((s, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      const frac = drawn ? s / 100 : 0;
      return [
        cx + r * frac * Math.cos(angle),
        cy + r * frac * Math.sin(angle),
      ] as [number, number];
    });

  const shapePoints = points(axes.map(a => a.score));
  const gridPoints = points(Array(n).fill(100));
  const toStr = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.12em] mb-3">Output quality</p>
      <div className="flex items-center gap-4 flex-1">
        <svg viewBox="0 0 160 160" className="w-[130px] h-[130px] shrink-0">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map(f => {
            const ring = Array.from({ length: n }, (_, i) => {
              const a = (i / n) * 2 * Math.PI - Math.PI / 2;
              return [cx + r * f * Math.cos(a), cy + r * f * Math.sin(a)] as [number, number];
            });
            return (
              <polygon
                key={f}
                points={toStr(ring)}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.8"
              />
            );
          })}
          {/* Spokes */}
          {gridPoints.map(([x, y], i) => (
            <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
          ))}
          {/* Filled shape */}
          <polygon
            points={toStr(shapePoints)}
            fill="url(#radar-fill)"
            stroke="url(#radar-stroke)"
            strokeWidth="1.5"
            style={{ transition: 'all 900ms cubic-bezier(0.34,1.56,0.64,1)' }}
          />
          <defs>
            <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FACFF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="radar-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FACFF" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          {/* Dots */}
          {shapePoints.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.5} fill="#4FACFF" opacity={drawn ? 1 : 0}
              style={{ transition: `opacity 300ms ${400 + i * 80}ms` }} />
          ))}
        </svg>
        {/* Axis scores */}
        <div className="space-y-2 flex-1">
          {axes.map((a, i) => (
            <AxisScoreRow key={a.label} label={a.label} score={a.score} active={active} delay={400 + i * 100} />
          ))}
        </div>
      </div>
    </div>
  );
}

const PIPELINE_STEPS = [
  { label: 'Parse stack',    ms: 120,  color: 'bg-[#4FACFF]'  },
  { label: 'Build prompt',   ms: 80,   color: 'bg-[#A855F7]'  },
  { label: 'Claude stream',  ms: 3200, color: 'bg-[#34D399]'  },
  { label: 'Optimize',       ms: 340,  color: 'bg-[#FBBF24]'  },
  { label: 'Deliver',        ms: 60,   color: 'bg-[#2DD4BF]'  },
];

/* ─── Generation speed card ──────────────────────────────────────────────── */
function SpeedCard({ active }: { active: boolean }) {
  const steps = PIPELINE_STEPS;
  const totalMs = steps.reduce((s, x) => s + x.ms, 0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      let accum = 0;
      steps.forEach((step, i) => {
        accum += step.ms;
        setTimeout(() => setProgress(accum / totalMs), 300 + (accum / totalMs) * 2000);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.12em]">Generation pipeline</p>
        <span className="text-[10px] font-mono text-[#34D399]/60">~4s end-to-end</span>
      </div>
      <div className="space-y-2.5 flex-1">
        {steps.map((s, i) => {
          const barMax = s.ms / totalMs;
          const reached = progress >= (steps.slice(0, i).reduce((a, x) => a + x.ms, 0) / totalMs);
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[10px] text-white/35 w-24 shrink-0">{s.label}</span>
              <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.color}`}
                  style={{
                    width: reached ? `${barMax * 100}%` : '0%',
                    transition: `width ${s.ms * 0.6}ms ease-out ${300 + (steps.slice(0, i).reduce((a, x) => a + x.ms, 0) / totalMs) * 2000}ms`,
                  }}
                />
              </div>
              <span className="text-[9px] font-mono text-white/20 tabular-nums w-12 text-right shrink-0">
                {s.ms >= 1000 ? `${(s.ms / 1000).toFixed(1)}s` : `${s.ms}ms`}
              </span>
            </div>
          );
        })}
      </div>
      {/* Overall progress bar */}
      <div className="mt-4 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-white/25">Total</span>
          <span className="text-[10px] font-mono text-white/25 tabular-nums">{Math.round(progress * totalMs)}ms</span>
        </div>
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4FACFF] via-[#A855F7] to-[#34D399]"
            style={{ width: `${progress * 100}%`, transition: 'width 200ms linear' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main bento section ─────────────────────────────────────────────────── */
export default function VizBentoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref);

  return (
    <section ref={ref} className="max-w-6xl mx-auto px-5 sm:px-8 pb-28">
      <div className="text-center mb-14">
        <div className="section-label mb-5">FEA. [VIZ]</div>
        <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em]">
          Under the hood.
          <span className="text-gradient-animated"> Live data.</span>
        </h2>
        <p className="text-white/35 text-[15px] mt-3 max-w-md mx-auto leading-relaxed">
          Every generation runs through a multi-pass optimizer, stack detector, and quality scorer.
        </p>
      </div>

      {/* Bento grid: 2-col on md+, 1-col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Row 1: live counter (wide) + file dist */}
        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden min-h-[200px]">
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#34D399]/[0.06] blur-3xl pointer-events-none" />
          <LiveTokenCard active={active} />
        </div>

        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#4FACFF]/[0.06] blur-3xl pointer-events-none" />
          <FileDistCard active={active} />
        </div>

        {/* Row 2: stack coverage + quality radar */}
        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden">
          <div className="absolute bottom-0 -right-10 w-40 h-40 rounded-full bg-[#A855F7]/[0.06] blur-3xl pointer-events-none" />
          <StackCoverageCard active={active} />
        </div>

        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden">
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#FBBF24]/[0.05] blur-3xl pointer-events-none" />
          <QualityRadarCard active={active} />
        </div>

        {/* Row 3: generation speed — full width */}
        <div className="md:col-span-2 relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-32 bg-[#2DD4BF]/[0.04] blur-3xl pointer-events-none" />
          <SpeedCard active={active} />
        </div>

      </div>
    </section>
  );
}
