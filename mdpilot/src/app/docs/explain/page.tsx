import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Explain mode — MDPilot docs',
  description:
    'How to use MDPilot Explain mode: paste any code, file, or directory listing and get a plain-language WALKTHROUGH.md tuned to your audience — AI agent, team member, learner, or non-technical reader.',
};

const AUDIENCES = [
  {
    id: 'non_technical',
    label: 'Non-technical reader',
    desc: 'Founder, PM, investor, or client. Every term is defined. Plain language throughout. No assumed programming knowledge.',
  },
  {
    id: 'learner',
    label: "I'm learning this code",
    desc: "Explains the why behind each decision, not just the what. Assumes you can read code but want to understand the design choices.",
  },
  {
    id: 'team',
    label: 'New team member',
    desc: 'Assumes engineering skills. Explains project-specific choices and conventions that aren\'t obvious from reading the code alone.',
  },
  {
    id: 'ai_agent',
    label: 'AI agent',
    desc: 'Terse, machine-parseable walkthrough. Facts and structure over prose. Optimised for an agent working in the codebase.',
  },
];

export default function ExplainDocsPage() {
  return (
    <div className="max-w-2xl">

      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Labs</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          Explain mode
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          Paste any code and choose who will read it — Explain mode generates a{' '}
          <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1.5 py-0.5 rounded text-[var(--md-text-secondary)]">WALKTHROUGH.md</code>{' '}
          tuned to that specific audience.
        </p>
      </div>

      {/* When to use */}
      <div className="mb-8 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <h2 className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-2">When to use it</h2>
        <ul className="space-y-1.5">
          {[
            'Onboarding a new developer — explain a complex module without a 1:1 session',
            'Writing context for a code review — explain the design to a reviewer unfamiliar with the area',
            'Explaining your work to a non-technical stakeholder without dumbing it down yourself',
            'Creating a WALKTHROUGH.md for an agent to orient itself in an unfamiliar codebase',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--md-accent)]/60 mt-2 shrink-0" />
              <span className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How to */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-4">How to use it</h2>
        <div className="space-y-3">
          {[
            { n: '1', title: 'Paste your code', desc: 'Paste a file, a function, a component, a directory listing, or any block of code. Minimum 30 characters. There\'s no maximum — paste as much as you need explained.' },
            { n: '2', title: 'Choose your audience', desc: 'Select from the four audience options below. Your choice changes the vocabulary, depth, and structure of the walkthrough significantly.' },
            { n: '3', title: 'Generate and copy', desc: 'The walkthrough is rendered in the output — copy it or download as a .md file. Save it as WALKTHROUGH.md in the relevant directory.' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--md-accent)]/10 border border-[var(--md-accent)]/18 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-accent)]/80 mt-0.5">
                {step.n}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-0.5">{step.title}</p>
                <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audiences */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-4">The four audiences</h2>
        <div className="space-y-2.5">
          {AUDIENCES.map(a => (
            <div key={a.id} className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
              <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-1">{a.label}</p>
              <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MCP note */}
      <div className="p-4 rounded-xl border border-[var(--md-go)]/[0.15] bg-[var(--md-go)]/[0.03] mb-6">
        <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
          <span className="text-[var(--md-go)]/70 font-semibold">Via MCP:</span> Use the{' '}
          <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">explain_code</code> tool
          and pass a file path or directory path — the server reads the actual files from your repo.{' '}
          <Link href="/docs/mcp" className="text-[var(--md-accent)]/60 hover:text-[var(--md-accent)] transition-colors">MCP setup →</Link>
        </p>
      </div>

      <div className="pt-6 border-t border-[var(--md-border)] flex items-center gap-4">
        <Link href="/docs/generate" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          ← Generate mode
        </Link>
        <Link href="/docs/convert" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          Convert mode →
        </Link>
      </div>

    </div>
  );
}
