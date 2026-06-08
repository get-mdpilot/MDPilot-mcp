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
  { dot: 'bg-[#FBBF24]', text: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10' },
  { dot: 'bg-[#FF6B6B]', text: 'text-[#FF6B6B]', bg: 'bg-[#FF6B6B]/10' },
  { dot: 'bg-[#A855F7]', text: 'text-[#A855F7]', bg: 'bg-[#A855F7]/10' },
  { dot: 'bg-[#2DD4BF]', text: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/10' },
  { dot: 'bg-[#4FACFF]', text: 'text-[#4FACFF]', bg: 'bg-[#4FACFF]/10' },
];

export default function TokenMeter({ totalBefore, totalAfter, passes }: TokenMeterProps) {
  const [open, setOpen] = useState(false);

  const saved   = Math.max(0, totalBefore - totalAfter);
  const pct     = totalBefore > 0 ? Math.round((saved / totalBefore) * 100) : 0;
  const fillPct = totalBefore > 0 ? Math.min(100, (totalAfter / totalBefore) * 100) : 100;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
          <span className="text-[15px] font-semibold text-white tabular-nums"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {totalAfter.toLocaleString()}
          </span>
          <span className="text-[12px] text-white/40 truncate">tokens after optimization</span>
        </div>
        {saved > 0 && (
          <span className="shrink-0 text-[11px] font-semibold text-[#2DD4BF] bg-[#2DD4BF]/10 px-2.5 py-0.5 rounded-full border border-[#2DD4BF]/20">
            ↓ {pct}% · {saved.toLocaleString()} saved
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-[#4FACFF] to-[#2DD4BF] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <button
        onClick={() => setOpen(s => !s)}
        className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors cursor-pointer"
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {open ? 'Hide details' : 'Show details'}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
          {passes.map((pass, i) => {
            const c = PASS_COLORS[i % PASS_COLORS.length];
            return (
              <div key={pass.name} className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-white/55">{pass.name}</span>
                  {pass.description && (
                    <span className="text-[10px] text-white/25 ml-2">{pass.description}</span>
                  )}
                </div>
                <span className={`shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                  {pass.tokensSaved > 0 ? `−${pass.tokensSaved}` : '0'}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
            <span className="text-[10px] text-white/20">Before optimization</span>
            <span className="text-[10px] font-mono text-white/30">{totalBefore.toLocaleString()} tokens</span>
          </div>
        </div>
      )}
    </div>
  );
}
