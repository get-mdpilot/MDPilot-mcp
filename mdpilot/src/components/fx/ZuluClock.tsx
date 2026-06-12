'use client';

import { useEffect, useState } from 'react';

/* Live UTC clock — aviation runs on Zulu time. */
export default function ZuluClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setTime(`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className="font-mono text-[11px] tracking-[0.12em] text-[var(--md-text-tertiary)] tabular-nums select-none"
      title="Zulu time (UTC) — aviation standard"
      suppressHydrationWarning
    >
      {time ? `${time}Z` : '--:--:--Z'}
    </span>
  );
}
