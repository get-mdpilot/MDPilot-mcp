'use client';

interface Step { label: string }

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLastStep?: boolean;
  onSkip?: () => void;
  children: React.ReactNode;
}

export default function Stepper({
  steps, currentStep, onBack, onNext, canProceed,
  isLastStep = false, onSkip, children,
}: StepperProps) {
  const pct = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-0">

      {/* ── Progress header ───────────────────────────────────────────────── */}
      <div className="mb-8 sm:mb-10">

        {/* Step count + label */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[6px] bg-[var(--md-accent-dim)] text-[var(--md-accent)]">
              {currentStep + 1} / {steps.length}
            </span>
            <span className="text-[13px] font-medium text-[var(--md-text-secondary)]">{steps[currentStep]?.label}</span>
          </div>
          <span className="text-[11px] font-mono text-[var(--md-text-tertiary)]">{Math.round(pct)}%</span>
        </div>

        {/* Progress bar */}
        <div className="relative h-[3px] w-full rounded-full bg-[var(--md-surface-2)] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[var(--md-accent)] transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Step circles (collapsed on mobile, shown on sm+) */}
        <div className="hidden sm:flex items-center justify-between mt-3 relative">
          <div className="absolute top-3 left-0 right-0 h-px bg-[var(--md-border)]" aria-hidden />
          {steps.map((s, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={i} className="flex flex-col items-center gap-1 relative z-10">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-medium transition-all duration-300 border"
                  style={{
                    background: done ? 'var(--md-accent)' : active ? 'var(--md-accent-dim)' : 'var(--md-surface)',
                    borderColor: done || active ? 'var(--md-accent)' : 'var(--md-border)',
                    color: done ? 'var(--md-accent-ink)' : active ? 'var(--md-accent)' : 'var(--md-text-tertiary)',
                  }}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (i + 1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      <div className="mb-8 sm:mb-10">{children}</div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">

        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 text-[13px] text-[var(--md-text-secondary)] hover:text-[var(--md-text)] disabled:opacity-0 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-[13px] text-[var(--md-text-secondary)] hover:text-[var(--md-text)] px-4 py-2 rounded-[10px] border border-[var(--md-border)] hover:border-[var(--md-border-strong)] transition-all duration-150 cursor-pointer"
            >
              Skip
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[var(--md-accent)] text-[var(--md-accent-ink)] shadow-[var(--shadow-sm)] hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-[var(--md-accent)]"
          >
            {isLastStep ? 'Generate my files' : 'Continue'}
            {!isLastStep && (
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
            {isLastStep && (
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
