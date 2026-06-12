'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { OptimizationPass } from '@/types';

interface TokenMeterProps {
  totalBefore: number;
  totalAfter:  number;
  passes:      OptimizationPass[];
}

const PASS_COLORS: Array<{ dot: string; text: string; bg: string }> = [
  { dot: 'bg-[var(--md-accent)]',        text: 'text-[var(--md-accent)]',         bg: 'bg-[var(--md-accent-dim)]' },
  { dot: 'bg-[var(--md-caution)]',       text: 'text-[var(--md-caution)]',        bg: 'bg-[var(--md-caution-dim)]' },
  { dot: 'bg-[var(--md-info)]',          text: 'text-[var(--md-info)]',           bg: 'bg-[var(--md-info-dim)]' },
  { dot: 'bg-[var(--md-go)]',            text: 'text-[var(--md-go)]',             bg: 'bg-[var(--md-go-dim)]' },
  { dot: 'bg-[var(--md-text-tertiary)]', text: 'text-[var(--md-text-secondary)]', bg: 'bg-[var(--md-surface-2)]' },
];

export default function TokenMeter({ totalBefore, totalAfter, passes }: TokenMeterProps) {
  const [open, setOpen] = useState(false);

  const saved   = Math.max(0, totalBefore - totalAfter);
  const pct     = totalBefore > 0 ? Math.round((saved / totalBefore) * 100) : 0;
  const fillPct = totalBefore > 0 ? Math.min(100, (totalAfter / totalBefore) * 100) : 100;

  return (
    <div className="rounded-[10px] border border-[var(--md-border)] bg-[var(--md-surface)] px-4 py-3 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
          <span className="text-[15px] font-mono font-semibold text-[var(--md-text)] tabular-nums">
            {totalAfter.toLocaleString()}
          </span>
          <span className="text-[12px] text-[var(--md-text-secondary)] truncate">tokens after optimization</span>
        </div>
        {saved > 0 && (
          <span className="shrink-0 text-[11px] font-semibold text-[var(--md-go)] bg-[var(--md-go-dim)] px-2.5 py-0.5 rounded-[6px]">
            ↓ {pct}% · {saved.toLocaleString()} saved
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="w-full h-1 bg-[var(--md-surface-2)] rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[var(--md-accent)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <button
        onClick={() => setOpen(s => !s)}
        className="flex items-center gap-1 text-[11px] text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors duration-150 cursor-pointer"
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {open ? 'Hide details' : 'Show details'}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-[var(--md-border)] space-y-2">
          {passes.map((pass, i) => {
            const c = PASS_COLORS[i % PASS_COLORS.length];
            return (
              <div key={pass.name} className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-[var(--md-text-secondary)]">{pass.name}</span>
                  {pass.description && (
                    <span className="text-[10px] text-[var(--md-text-tertiary)] ml-2">{pass.description}</span>
                  )}
                </div>
                <span className={`shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>
                  {pass.tokensSaved > 0 ? `−${pass.tokensSaved}` : '0'}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--md-border)]">
            <span className="text-[10px] text-[var(--md-text-tertiary)]">Before optimization</span>
            <span className="text-[10px] font-mono text-[var(--md-text-tertiary)]">{totalBefore.toLocaleString()} tokens</span>
          </div>
        </div>
      )}
    </div>
  );
}
