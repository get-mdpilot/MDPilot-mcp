'use client';

import { useEffect, useState } from 'react';

/* Altimeter — reads scroll position as a descent from cruise altitude.
   Top of page = FL350; bottom = wheels down. Desktop only. */
const CRUISE_FT = 35000;

export default function Altimeter() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const altitude = Math.round(((1 - progress) * CRUISE_FT) / 100) * 100;
  const landed = progress > 0.985;

  return (
    <div className="altimeter hidden xl:flex" aria-hidden>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--md-text-tertiary)]">
          {landed ? 'Touchdown' : 'Altitude'}
        </span>
        <span className={`text-[13px] tabular-nums ${landed ? 'text-[var(--md-go)]' : 'text-[var(--md-accent)]'}`}>
          {landed ? 'WHEELS DOWN' : `${altitude.toLocaleString()} FT`}
        </span>
      </div>
      <div className="altimeter-tape">
        <span style={{ height: `${Math.max(2, progress * 100)}%` }} />
      </div>
    </div>
  );
}
