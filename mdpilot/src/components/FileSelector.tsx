'use client';

import type { MDFileType } from '@/types';

export interface SelectableFile {
  type: MDFileType;
  name: string;
  why: string;
  recommended: boolean;
  v2?: boolean;
  locked?: boolean; // always-on (e.g. README in Generate mode)
}

interface FileSelectorProps {
  files: SelectableFile[];
  selected: MDFileType[];
  onToggle: (type: MDFileType) => void;
  accent?: 'blue' | 'coral';
}

export default function FileSelector({ files, selected, onToggle, accent = 'blue' }: FileSelectorProps) {
  const accentColor   = accent === 'coral' ? '#E05E3A' : '#4FACFF';
  const selectedGlow  = accent === 'coral' ? 'card-selected-coral' : 'card-selected-blue';

  return (
    <div className="flex flex-col gap-2.5">
      {files.map(f => {
        const isSelected = selected.includes(f.type);
        const disabled   = !!f.v2;
        const locked     = !!f.locked;

        return (
          <button
            key={f.type}
            onClick={() => !disabled && !locked && onToggle(f.type)}
            disabled={disabled}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left w-full transition-all duration-200 ${
              disabled
                ? 'opacity-40 cursor-not-allowed border-white/[0.06] bg-white/[0.02]'
                : isSelected
                ? `border-[${accentColor}]/50 bg-[${accentColor}]/[0.07] ${selectedGlow}`
                : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-[1px]'
            } ${locked ? 'cursor-default' : ''}`}
            style={isSelected && !disabled ? { borderColor: `${accentColor}80` } : undefined}
          >
            {/* Checkbox */}
            <span
              className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: isSelected && !disabled ? accentColor : 'rgba(255,255,255,0.18)',
                background:   isSelected && !disabled ? accentColor : 'transparent',
              }}
            >
              {isSelected && !disabled && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="#07070f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-sm font-mono font-semibold text-[var(--md-text)]">{f.name}</span>
                {f.recommended && !f.v2 && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${accentColor}1A`, color: accentColor }}
                  >
                    Recommended
                  </span>
                )}
                {locked && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[var(--md-text-tertiary)]">
                    always on
                  </span>
                )}
                {f.v2 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[var(--md-text-tertiary)]">
                    v2
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--md-text-secondary)]">{f.why}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
