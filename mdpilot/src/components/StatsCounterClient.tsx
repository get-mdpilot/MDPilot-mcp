'use client';

import { useEffect, useRef, useState } from 'react';

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.4) {
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

function useCountUp(target: number, active: boolean, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      const startTime = Date.now();
      const raf = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(raf);
        else setValue(target);
      };
      requestAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(t);
  }, [active, target, duration, delay]);
  return value;
}

type Stat = {
  value: number;
  suffix: string;
  label: string;
  delay: number;
  color: string;
};

const STATS: Stat[] = [
  { value: 9,  suffix: '',  label: 'file types',      delay: 0,   color: 'text-[#4FACFF]' },
  { value: 27, suffix: '',  label: 'stack detectors', delay: 150, color: 'text-[#A855F7]' },
  { value: 38, suffix: '%', label: 'avg token saving', delay: 300, color: 'text-[#34D399]' },
  { value: 0,  suffix: '',  label: 'sign-ups needed', delay: 450, color: 'text-[#FBBF24]' },
];

function StatCell({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, active, 900, stat.delay);
  return (
    <div className="px-5 sm:px-7 py-4 text-center group">
      <p
        className={`text-[22px] sm:text-[26px] font-black tabular-nums ${stat.color}`}
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {count}{stat.suffix}
      </p>
      <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mt-0.5">{stat.label}</p>
    </div>
  );
}

export default function StatsCounterClient() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref);

  return (
    <div
      ref={ref}
      className="inline-grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06] bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl rounded-2xl overflow-hidden"
    >
      {STATS.map(stat => (
        <StatCell key={stat.label} stat={stat} active={active} />
      ))}
    </div>
  );
}
