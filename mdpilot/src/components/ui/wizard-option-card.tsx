'use client';
import { Check } from 'lucide-react';

interface WizardOptionCardProps {
  icon:            React.ReactNode;
  label:           string;
  desc:            string;
  selected:        boolean;
  onClick:         () => void;
  accentColor?:    string;
  indicatorType?:  'single' | 'multi';
  badge?:          string;
  badgeVariant?:   'blue' | 'teal' | 'mono';
  disabled?:       boolean;
}

const BADGE_STYLES: Record<string, string> = {
  blue:  'bg-[var(--md-accent-dim)] text-[var(--md-accent)]',
  teal:  'bg-[var(--md-go-dim)] text-[var(--md-go)]',
  mono:  'bg-[var(--md-surface-2)] text-[var(--md-text-tertiary)]',
};

export function WizardOptionCard({
  icon, label, desc, selected, onClick,
  accentColor = 'var(--md-accent)',
  indicatorType = 'single',
  badge,
  badgeVariant = 'mono',
  disabled = false,
}: WizardOptionCardProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className={`relative rounded-[10px] border bg-[var(--md-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-accent)] ${
        disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'
      } ${selected ? 'border-transparent' : 'border-[var(--md-border)] card-interactive'}`}
      style={selected ? {
        boxShadow: `0 0 0 1.5px ${accentColor}`,
        background: `color-mix(in oklab, ${accentColor} 8%, var(--md-surface))`,
      } : undefined}
    >
      {/* Content */}
      <div className="flex items-start gap-3.5 p-4">
        {/* Indicator (radio/check on left) — single select only */}
        {indicatorType === 'single' && (
          <div
            className="mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200"
            style={{
              borderColor: selected ? accentColor : 'var(--md-border-strong)',
              background:  selected ? accentColor : 'transparent',
            }}
          >
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--md-accent-ink)]" />}
          </div>
        )}

        {/* Icon */}
        <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: selected ? `color-mix(in oklab, ${accentColor} 14%, transparent)` : 'var(--md-surface-2)',
            color: selected ? accentColor : 'var(--md-text-tertiary)',
            border: `1px solid ${selected ? `color-mix(in oklab, ${accentColor} 35%, transparent)` : 'var(--md-border)'}`,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`text-[13px] font-semibold transition-colors duration-200 ${selected ? 'text-[var(--md-text)]' : 'text-[var(--md-text-secondary)]'}`}>
              {label}
            </span>
            {badge && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${BADGE_STYLES[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--md-text-secondary)] leading-snug">{desc}</p>
        </div>

        {/* Multi-select checkbox */}
        {indicatorType === 'multi' && (
          <div
            className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200"
            style={{
              background: selected ? accentColor : 'transparent',
              border: selected ? 'none' : '1px solid var(--md-border-strong)',
              color: 'var(--md-accent-ink)',
            }}
          >
            {selected && <Check size={11} strokeWidth={3} />}
          </div>
        )}
      </div>
    </div>
  );
}
