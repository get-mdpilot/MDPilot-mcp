import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Labs — MDPilot',
  description: 'Additional and experimental MDPilot tools: Generate, Explain, Convert, Image-to-Prompt, and Interview Primer.',
};

const TOOLS = [
  {
    href: '/generate',
    label: 'Generate',
    desc: 'AGENTS.md, CLAUDE.md, README & more from your project',
    detail: '9 file types · 5-pass optimizer · multi-model',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/explain',
    label: 'Explain',
    desc: 'Turn any code or repo into a plain-language walkthrough',
    detail: 'Tuned to any audience — agent, team, learner, non-technical',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    href: '/convert',
    label: 'Convert',
    desc: 'Any file (PDF, DOCX, CSV…) → clean markdown',
    detail: 'Powered by MarkItDown · preserves structure',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    href: '/image-to-prompt',
    label: 'Image → Prompt',
    desc: 'Recreate any image as a generation prompt',
    detail: 'Outputs for FLUX, SD, Midjourney, DALL-E & Gemini',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    href: '/interview-primer',
    label: 'Interview Primer',
    desc: 'Role + JD → a ready-to-paste AI coach prompt',
    detail: 'Any level · custom JD · instant output',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
] as const;

export default function LabsPage() {
  return (
    <div className="min-h-screen bg-[var(--md-bg)]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <img src="/mdpilot-logo.webp" alt="MDPilot" width={52} height={52} className="w-13 h-13 object-contain" />
            <p className="section-label">Experimental</p>
          </div>
          <h1 className="font-display font-semibold text-[clamp(2.2rem,5vw,3.5rem)] text-[var(--md-text)] tracking-[-0.015em] mb-4">
            The Hangar
          </h1>
          <p className="text-[16px] text-[var(--md-text-secondary)] max-w-lg leading-relaxed">
            Labs — experimental tools. All fully working, just not the main act.
          </p>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative rounded-[var(--md-radius-lg)] border border-[var(--md-border)] bg-[var(--md-surface)] p-6 card-interactive cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Icon + label row */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="shrink-0 w-9 h-9 rounded-[10px] bg-[var(--md-surface-2)] border border-[var(--md-border)] flex items-center justify-center text-[var(--md-accent)]">
                      {tool.icon}
                    </div>
                    <span className="text-[12px] font-mono font-medium text-[var(--md-accent)] tracking-wide">
                      {tool.label}
                    </span>
                  </div>

                  <p className="text-[14px] font-semibold text-[var(--md-text)] leading-snug mb-1.5">
                    {tool.desc}
                  </p>
                  <p className="text-[12px] text-[var(--md-text-tertiary)] font-mono">
                    {tool.detail}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  width="16" height="16" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}
                  className="shrink-0 mt-1 text-[var(--md-text-tertiary)] group-hover:text-[var(--md-accent)] group-hover:translate-x-0.5 transition-all duration-200"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Back to hero */}
        <div className="mt-14 pt-8 border-t border-[var(--md-border)] flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[13px] text-[var(--md-text-tertiary)] mb-1">Looking for the main tool?</p>
            <Link
              href="/task"
              className="text-[13px] text-[var(--md-accent)] hover:text-[var(--md-accent-strong)] font-medium transition-colors"
            >
              Start with a task →
            </Link>
          </div>
          <Link
            href="/"
            className="text-[11px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors"
          >
            ← Home
          </Link>
        </div>

      </div>
    </div>
  );
}
