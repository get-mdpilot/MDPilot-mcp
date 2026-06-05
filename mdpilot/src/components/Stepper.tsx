'use client';

interface Step {
  label: string;
}

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
  steps,
  currentStep,
  onBack,
  onNext,
  canProceed,
  isLastStep = false,
  onSkip,
  children,
}: StepperProps) {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-0">
      {/* Progress dots + step count */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < currentStep
                  ? 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--md-blue)] opacity-60'
                  : i === currentStep
                  ? 'w-4 h-1.5 sm:w-6 sm:h-2 bg-[var(--md-blue)]'
                  : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/10'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-[var(--md-text-tertiary)]">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Step content */}
      <div className="mb-8 sm:mb-10">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] disabled:opacity-0 disabled:pointer-events-none transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[var(--md-blue)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isLastStep ? 'Generate my files' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
