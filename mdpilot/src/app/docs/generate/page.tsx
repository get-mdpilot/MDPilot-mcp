import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Generate mode — MDPilot docs',
  description:
    'How to use MDPilot Generate mode: a 7-step wizard that generates AGENTS.md, CLAUDE.md, README, SKILL.md, DESIGN.md, CONTRIBUTING.md, SECURITY.md, and CONTEXT.md grounded in your actual tech stack.',
};

const STEPS = [
  { n: '1', label: 'What are you building?', desc: 'Choose from: website or web app, mobile app, backend or API, tool or library, design system, or something else (you describe it).' },
  { n: '2', label: "Who's it for?", desc: 'Just me (personal project), My team, or The public (open source / anyone). Controls which files are recommended — public projects get CONTRIBUTING.md and SECURITY.md; team projects get a team-focused CONTRIBUTING.md.' },
  { n: '3', label: 'Which AI tools?', desc: 'Select the AI coding tools you use: Claude Code, Cursor, GitHub Copilot, Windsurf, ChatGPT/Codex, or "Not sure yet". Selecting Claude Code adds CLAUDE.md to recommendations; any AI tool selection adds AGENTS.md.' },
  { n: '4', label: 'Tech stack', desc: 'Paste your package.json, requirements.txt, or any text that describes your stack. MDPilot auto-detects technologies — Next.js, React, FastAPI, Go, Docker, Stripe, Supabase, and many others. Or type it manually.' },
  { n: '5', label: 'Output style', desc: 'Choose who will read the output: AI coding agent (terse, machine-parseable), Developer joining the team (engineering-level, project-specific), Non-technical reader (plain language, all terms defined), or I\'m learning (explains the why behind each decision). This controls depth and vocabulary throughout all generated files.' },
  { n: '6', label: 'Files to generate', desc: 'MDPilot recommends files based on your earlier answers. Tick or untick any combination. Non-technical audience sees a "goal-first" view with plain names and jargon-free reasons; others see technical file names with recommended pre-selected.' },
  { n: '7', label: 'Review & generate', desc: 'See a summary of your choices and select an AI model provider. MDPilot generates one file at a time — each takes 5–15 seconds. All generated files pass through the 5-pass token optimizer automatically.' },
];

const FILES = ['README.md', 'AGENTS.md', 'CLAUDE.md', 'SKILL.md', 'DESIGN.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CONTEXT.md'];

export default function GenerateDocsPage() {
  return (
    <div className="max-w-2xl">

      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Labs</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          Generate mode
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          A 7-step wizard that generates production-grade AI instruction files and project docs grounded
          in your actual tech stack — not generic boilerplate.
        </p>
      </div>

      {/* When to use */}
      <div className="mb-8 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <h2 className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-2">When to use Generate mode</h2>
        <ul className="space-y-1.5">
          {[
            'Starting a new project and want AGENTS.md + CLAUDE.md set up correctly from day one',
            'Onboarding a new team member — generate CONTRIBUTING.md from your real repo conventions',
            'Open-sourcing a project — generate README + SECURITY + CONTRIBUTING in one pass',
            'Retrofitting AI context files onto an existing codebase',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--md-go)]/60 mt-2 shrink-0" />
              <span className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Files */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Files it generates</h2>
        <div className="flex flex-wrap gap-2">
          {FILES.map(f => (
            <code key={f} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--md-surface-2)] border border-[var(--md-border)] text-[var(--md-text-tertiary)]">
              {f}
            </code>
          ))}
        </div>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-2">
          See <Link href="/docs/files" className="text-[var(--md-accent)]/60 hover:text-[var(--md-accent)] transition-colors">Files reference</Link> for what each file is and where it goes.
        </p>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-4">The 7 wizard steps</h2>
        <div className="space-y-3">
          {STEPS.map(step => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--md-go)]/10 border border-[var(--md-go)]/18 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-go)]/80 mt-0.5">
                {step.n}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-0.5">{step.label}</p>
                <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MCP note */}
      <div className="p-4 rounded-xl border border-[var(--md-go)]/[0.15] bg-[var(--md-go)]/[0.03] mb-6">
        <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
          <span className="text-[var(--md-go)]/70 font-semibold">Via MCP:</span> Use the{' '}
          <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">generate_md_file</code> tool
          to generate any supported file type from inside your IDE. The MCP version reads your actual
          repo files, so output references real scripts and paths.{' '}
          <Link href="/docs/mcp" className="text-[var(--md-accent)]/60 hover:text-[var(--md-accent)] transition-colors">MCP setup →</Link>
        </p>
      </div>

      <div className="pt-6 border-t border-[var(--md-border)] flex items-center gap-4">
        <Link href="/labs" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          ← Labs
        </Link>
        <Link href="/docs/explain" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          Explain mode →
        </Link>
      </div>

    </div>
  );
}
