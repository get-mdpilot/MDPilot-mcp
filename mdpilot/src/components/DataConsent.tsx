'use client';

import Link from 'next/link';

interface DataConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function DataConsent({ checked, onChange }: DataConsentProps) {
  return (
    <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] px-4 py-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <span
          onClick={() => onChange(!checked)}
          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
            checked ? 'bg-[#4FACFF] border-[#4FACFF]' : 'border-[var(--md-border)]'
          }`}
        >
          {checked && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l2.5 2.5L10 3" stroke="#07070f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <span className="text-xs text-[var(--md-text-secondary)] leading-relaxed">
          Help improve MDPilot — share this generation (anonymized, PII-scrubbed) to train better prompts.{' '}
          <Link href="/privacy" target="_blank" className="text-[#4FACFF] hover:underline">What we collect</Link>
        </span>
      </label>
    </div>
  );
}
