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
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#4FACFF]/15 text-[#4FACFF]">
              {currentStep + 1} / {steps.length}
            </span>
            <span className="text-[13px] font-medium text-white/60">{steps[currentStep]?.label}</span>
          </div>
          <span className="text-[11px] font-mono text-white/20">{Math.round(pct)}%</span>
        </div>

        {/* Progress bar */}
        <div className="relative h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #4FACFF 0%, #A855F7 60%, #2DD4BF 100%)',
              boxShadow: '0 0 8px rgba(79,172,255,0.4)',
            }}
          />
        </div>

        {/* Step circles (collapsed on mobile, shown on sm+) */}
        <div className="hidden sm:flex items-center justify-between mt-3 relative">
          <div className="absolute top-3 left-0 right-0 h-px bg-white/[0.05]" aria-hidden />
          {steps.map((s, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={i} className="flex flex-col items-center gap-1 relative z-10">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 border"
                  style={{
                    background: done ? '#4FACFF' : active ? 'rgba(79,172,255,0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: done ? '#4FACFF' : active ? 'rgba(79,172,255,0.5)' : 'rgba(255,255,255,0.08)',
                    color: done ? '#07070f' : active ? '#4FACFF' : 'rgba(255,255,255,0.25)',
                    boxShadow: active ? '0 0 12px rgba(79,172,255,0.25)' : 'none',
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
          className="flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70 disabled:opacity-0 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
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
              className="text-[13px] text-white/35 hover:text-white/55 px-4 py-2 rounded-xl border border-white/[0.07] hover:border-white/[0.12] transition-all duration-150 cursor-pointer"
            >
              Skip
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={canProceed ? {
              background: isLastStep
                ? 'linear-gradient(135deg, #4FACFF 0%, #38D9A9 100%)'
                : 'linear-gradient(135deg, #4FACFF 0%, #A855F7 100%)',
              color: '#07070f',
              boxShadow: '0 0 20px rgba(79,172,255,0.25)',
            } : {
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.3)',
            }}
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
