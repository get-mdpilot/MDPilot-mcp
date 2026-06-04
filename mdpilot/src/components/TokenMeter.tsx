'use client';

import { useState } from 'react';
import type { OptimizationPass } from '@/types';

interface TokenMeterProps {
  totalBefore: number;
  totalAfter: number;
  passes: OptimizationPass[];
}

const PASS_COLORS = [
  { text: 'text-[var(--md-amber)]',  bg: 'bg-[var(--md-amber-light)]'  }, // boilerplate
  { text: 'text-[var(--md-coral)]',  bg: 'bg-[var(--md-coral-light)]'  }, // dedup
  { text: 'text-[var(--md-purple)]', bg: 'bg-[var(--md-purple-light)]' }, // compression
];

export default function TokenMeter({ totalBefore, totalAfter, passes }: TokenMeterProps) {
  const [showDetails, setShowDetails] = useState(false);

  const saved   = Math.max(0, totalBefore - totalAfter);
  const pct     = totalBefore > 0 ? Math.round((saved / totalBefore) * 100) : 0;
  const fillPct = totalBefore > 0 ? Math.min(100, (totalAfter / totalBefore) * 100) : 100;

  return (
    <div className="rounded-xl border border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] px-4 py-3 mb-4">
      {/* Top row: after count + reduction badge */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-semibold">{totalAfter.toLocaleString()}</span>
          <span className="text-xs text-[var(--md-text-secondary)]">tokens after optimization</span>
        </div>
        {saved > 0 && (
          <span className="text-xs font-semibold text-[var(--md-teal)] bg-[var(--md-teal-light)] px-2.5 py-1 rounded-full">
            ↓ {pct}% · {saved.toLocaleString()} saved
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[var(--md-border)] rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full bg-[var(--md-blue)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {/* Toggle */}
      <button
        onClick={() => setShowDetails(s => !s)}
        className="text-[11px] text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors"
      >
        {showDetails ? '↑ Hide details' : '↓ Show details'}
      </button>

      {/* Pass breakdown */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[var(--md-border)] space-y-2">
          {passes.map((pass, i) => {
            const color = PASS_COLORS[i % PASS_COLORS.length];
            return (
              <div key={pass.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-[var(--md-text-secondary)]">
                    {pass.name}
                  </span>
                  <span className="text-[11px] text-[var(--md-text-tertiary)] ml-2">
                    {pass.description}
                  </span>
                </div>
                <span className={`shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                  {pass.tokensSaved > 0 ? `-${pass.tokensSaved}` : '0'}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-1 border-t border-[var(--md-border)]">
            <span className="text-[11px] text-[var(--md-text-tertiary)]">Before optimization</span>
            <span className="text-[11px] font-mono text-[var(--md-text-tertiary)]">
              {totalBefore.toLocaleString()} tokens
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
