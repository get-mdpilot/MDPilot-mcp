import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Reveal from '@/components/fx/Reveal';
import Altimeter from '@/components/fx/Altimeter';
import RadarScope from '@/components/fx/RadarScope';
import ApproachLights from '@/components/fx/ApproachLights';

/* ─── Metadata / OG ─────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'MDPilot — Give your AI agent the perfect starting point',
  description:
    'Turn any task into a precise, expert-grade prompt for your AI coding agent. Generate AGENTS.md & CLAUDE.md from your real repo, and keep them accurate as your code changes. Works in Claude Code, Cursor, Windsurf & Goose via MCP.',
  openGraph: {
    title: 'MDPilot — Give your AI agent the perfect starting point',
    description:
      'Turn any task into a precise, expert-grade prompt for your AI coding agent. Generate AGENTS.md & CLAUDE.md from your real repo, and keep them accurate as your code changes. Works in Claude Code, Cursor, Windsurf & Goose via MCP.',
    type: 'website',
    url: 'https://mdpilot.in',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDPilot — Give your AI agent the perfect starting point',
    description:
      'Turn any task into a precise, expert-grade prompt for your AI coding agent. Generate AGENTS.md & CLAUDE.md from your real repo.',
  },
};

/* ─── Works-with marquee — quiet mono chips, no colored glow ─────────────── */
const TOOLS_ROW1 = ['Claude Code', 'Cursor', 'GitHub Copilot', 'Windsurf', 'Goose', 'ChatGPT', 'Zed'];
const TOOLS_ROW2 = ['VS Code', 'JetBrains', 'Neovim', 'Gemini', 'Continue', 'Codeium', 'Aider'];

function ToolChip({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2.5 px-4 py-2 rounded-md border border-[var(--md-border)] bg-[var(--md-surface)] shrink-0 select-none">
      <span aria-hidden className="w-1 h-1 rounded-full bg-[var(--md-accent)] opacity-60" />
      <span className="font-mono text-[12px] text-[var(--md-text-secondary)] whitespace-nowrap">{name}</span>
    </span>
  );
}

function WorksWithMarquee() {
  const row1 = [...TOOLS_ROW1, ...TOOLS_ROW1, ...TOOLS_ROW1, ...TOOLS_ROW1];
  const row2 = [...TOOLS_ROW2, ...TOOLS_ROW2, ...TOOLS_ROW2, ...TOOLS_ROW2];

  return (
    <section className="border-b border-[var(--md-border)] bg-[var(--md-surface)] py-9 overflow-hidden">
      <p className="text-center font-mono text-[10px] text-[var(--md-text-tertiary)] uppercase tracking-[0.2em] mb-6">
        Flies with every cockpit
      </p>
      <div className="marquee-container mb-3">
        <div className="marquee-track gap-3 px-2">
          {row1.map((name, i) => <ToolChip key={i} name={name} />)}
        </div>
      </div>
      <div className="marquee-container">
        <div className="marquee-track-right gap-3 px-2">
          {row2.map((name, i) => <ToolChip key={i} name={name} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="bg-[var(--md-bg)] overflow-x-hidden">

      {/* Scroll altimeter — descends as you read, wheels down at the footer */}
      <Altimeter />

      {/* 1 · Hero */}
      <Hero />

      {/* 2 · Works-with marquee */}
      <WorksWithMarquee />

      {/* 3 · The insight */}
      <section className="relative max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
        <span className="ghost-num" aria-hidden>01</span>
        <Reveal className="relative">
          <p className="section-label mb-6 mx-auto w-fit">Why the first message matters</p>
          <h2 className="font-display text-[clamp(1.7rem,4vw,2.5rem)] font-semibold text-[var(--md-text)] mb-5 leading-[1.15]">
            Your AI is only as good as
            <br className="hidden sm:block" />
            {' '}how you <em className="em-wonk text-[var(--md-accent)] font-medium">start</em> the conversation.
          </h2>
          <p className="text-[var(--md-text-secondary)] text-[16px] leading-relaxed max-w-2xl mx-auto">
            Most developers open their AI tool and type a vague first message — no context,
            no structure, no acceptance criteria — and get generic help back. MDPilot fixes
            the one moment that sets the trajectory: the entry point. Get the briefing right,
            and the whole flight follows.
          </p>
        </Reveal>
      </section>

      {/* 4 · Before / After */}
      <section id="features" className="relative bg-[var(--md-surface)] border-y border-[var(--md-border)] py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <span className="ghost-num" aria-hidden>02</span>

          <Reveal className="relative text-center mb-14">
            <p className="section-label mb-5 mx-auto w-fit">How the flight deck works</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-[var(--md-text)] mb-4 leading-[1.15]">
              Same task. One is a shrug;
              <br className="hidden sm:block" />
              {' '}<em className="em-wonk text-[var(--md-accent)] font-medium">one is a spec.</em>
            </h2>
            <p className="text-[var(--md-text-secondary)] text-[15px] max-w-md mx-auto">
              Paste anything raw. Get a structured prompt an expert would hand an AI agent.
            </p>
          </Reveal>

          {/* Two panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">

            {/* Before — clay caution */}
            <div className="rounded-[14px] border border-[var(--md-border)] bg-[var(--md-bg)] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[var(--md-border)] bg-[var(--md-caution-dim)]">
                <span className="w-2 h-2 rounded-full bg-[var(--md-caution)] opacity-70 shrink-0" />
                <span className="font-mono text-[11px] text-[var(--md-caution)] tracking-wide">raw input — what the agent usually gets</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed space-y-3">
                <div>
                  <span className="text-[10px] tracking-[0.1em] text-[var(--md-text-tertiary)] uppercase">TASK-2847 · High · Unassigned</span>
                  <p className="text-[var(--md-text)] font-semibold text-[13px] mt-1">&quot;fix auth redirect&quot;</p>
                </div>
                <div className="border-l-2 border-[var(--md-border-strong)] pl-3 space-y-0.5 text-[var(--md-text-secondary)]">
                  <p className="text-[var(--md-text-tertiary)]">slack › engineering-bugs</p>
                  <p>hey so after oauth the user keeps going</p>
                  <p>back to login instead of dashboard, been</p>
                  <p>happening since the v3.1 deploy. can someone</p>
                  <p>look at it? we got a complaint</p>
                </div>
              </div>
            </div>

            {/* After — filed flight plan */}
            <div className="rounded-[14px] border border-[var(--md-border-strong)] bg-[var(--md-bg)] overflow-hidden shadow-[var(--shadow-md)]">
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[var(--md-border)] bg-[var(--md-go-dim)]">
                <span className="w-2 h-2 rounded-full bg-[var(--md-go)] shrink-0" />
                <span className="font-mono text-[11px] text-[var(--md-go)] tracking-wide">TASK.md — the filed flight plan</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed space-y-2">
                <p className="text-[var(--md-accent)] font-semibold text-[13px]"># Fix OAuth post-auth redirect loop</p>
                <p className="text-[var(--md-text-tertiary)] mt-2">## Goal</p>
                <p className="text-[var(--md-text-secondary)] text-[11px] leading-relaxed">Authenticated users land on /login after OAuth instead of /dashboard. Regression from v3.1.0.</p>
                <p className="text-[var(--md-text-tertiary)] mt-1">## Acceptance criteria</p>
                <p className="text-[var(--md-go)] text-[11px]">- [ ] /auth/callback → /dashboard (first-time OAuth)</p>
                <p className="text-[var(--md-go)] text-[11px]">- [ ] /auth/callback → /dashboard (returning user)</p>
                <p className="text-[var(--md-go)] text-[11px]">- [ ] /login does not render for authenticated users</p>
                <p className="text-[var(--md-text-tertiary)] mt-1">## Watch-outs</p>
                <p className="text-[var(--md-text-secondary)] text-[11px]">- middleware.ts may contain a redirect loop</p>
                <p className="text-[var(--md-text-secondary)] text-[11px]">- Verify session cookie is set before redirect fires</p>
                <p className="text-[var(--md-text-tertiary)] mt-1">## Constraints</p>
                <p className="text-[var(--md-text-secondary)] text-[11px]">- Do not modify OAuth provider config</p>
                <p className="text-[var(--md-text-secondary)] text-[11px]">- Preserve existing session TTL</p>
              </div>
            </div>
          </div>

          {/* 3-step strip — pre-flight checklist */}
          <div className="flex flex-col sm:flex-row items-stretch sm:divide-x sm:divide-[var(--md-border)] divide-y sm:divide-y-0 mb-12 rounded-[14px] border border-[var(--md-border)] bg-[var(--md-bg)] overflow-hidden">
            {[
              { n: '01', title: 'Paste your task', sub: 'Ticket · Slack thread · GitHub issue' },
              { n: '02', title: 'Choose how you want to work', sub: 'Guide · AI Exec · Context mode' },
              { n: '03', title: 'Get a prompt your agent nails', sub: 'Structured · gap-checked · ready to paste' },
            ].map(step => (
              <div key={step.n} className="flex-1 flex items-start gap-4 px-5 py-5">
                <span className="shrink-0 font-mono text-[11px] font-medium text-[var(--md-accent)] mt-1 tracking-wide">
                  {step.n}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-[var(--md-text)] leading-snug">{step.title}</p>
                  <p className="font-mono text-[11px] text-[var(--md-text-tertiary)] mt-1">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/task"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] text-[14px] font-semibold hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-sm)]"
            >
              Start with a task
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

        </div>
      </section>

      {/* 5 · MCP — inside your editor */}
      <section className="relative max-w-5xl mx-auto px-5 sm:px-8 py-24">
        <span className="ghost-num" aria-hidden>03</span>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <Reveal>
            <p className="section-label mb-6 w-fit">MCP server</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-[var(--md-text)] leading-[1.15] mb-5">
              Use it right <em className="em-wonk text-[var(--md-accent)] font-medium">inside</em> your editor.
            </h2>
            <p className="text-[var(--md-text-secondary)] text-[15.5px] leading-relaxed mb-8">
              MDPilot runs as an MCP server — call it from Claude Code, Cursor, Windsurf,
              and Goose without leaving your IDE. It reads your real repo, so prompts and
              docs reference actual files and commands, never guesses.
            </p>
            <Link href="/docs/mcp" className="btn-ghost">
              MCP setup
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </Reveal>

          {/* One-command setup — terminal */}
          <div className="terminal-chrome">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-[var(--md-caution)]" />
              <span className="terminal-dot bg-[var(--md-accent)]" />
              <span className="terminal-dot bg-[var(--md-go)]" />
              <span className="ml-2 font-mono text-[10px] text-[var(--md-text-tertiary)] uppercase tracking-[0.14em]">one-command setup</span>
            </div>
            <div className="p-5 font-mono text-[12.5px] leading-loose">
              <p>
                <span className="text-[var(--md-text-tertiary)]">$ </span>
                <span className="text-[var(--md-text)]">npx -y mdpilot-mcp setup</span>
              </p>
              <p className="text-[var(--md-text-tertiary)]">→ free key issued · config written</p>
              <p className="text-[var(--md-go)]">✓ mdpilot connected — 10 tools available</p>
              <p className="mt-3 text-[var(--md-text-tertiary)]">
                works in{' '}
                <span className="text-[var(--md-text-secondary)]">claude code · cursor · windsurf · goose</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6 · Drift detection */}
      <section className="relative bg-[var(--md-surface)] border-y border-[var(--md-border)] py-24 px-5 sm:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <span className="ghost-num" aria-hidden>04</span>

          {/* Visual: radar + instrument readout */}
          <div className="relative order-2 lg:order-1 flex flex-col sm:flex-row items-center gap-7">
            <RadarScope />
            <div className="w-full space-y-2.5">
            {[
              { file: 'AGENTS.md', label: 'On course', tone: 'go' },
              { file: 'CLAUDE.md', label: '3 sections drifted', tone: 'caution' },
              { file: 'README.md', label: 'On course', tone: 'go' },
            ].map(row => (
              <div
                key={row.file}
                className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-[10px] border border-[var(--md-border)] bg-[var(--md-bg)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: row.tone === 'go' ? 'var(--md-go)' : 'var(--md-accent)' }}
                  />
                  <span className="font-mono text-[13px] font-medium text-[var(--md-text-secondary)]">{row.file}</span>
                </div>
                <span
                  className="font-mono text-[11px]"
                  style={{ color: row.tone === 'go' ? 'var(--md-go)' : 'var(--md-accent)' }}
                >
                  {row.label}
                </span>
              </div>
            ))}
            <p className="font-mono text-[11px] text-[var(--md-text-tertiary)] pl-1 pt-2">
              mdpilot check-drift · 3 files checked · 1 drift detected
            </p>
            </div>
          </div>

          <Reveal className="relative order-1 lg:order-2">
            <p className="section-label mb-6 w-fit">Drift detection</p>
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-[var(--md-text)] leading-[1.15] mb-5">
              Context that stays <em className="em-wonk text-[var(--md-accent)] font-medium">on course</em>.
            </h2>
            <p className="text-[var(--md-text-secondary)] text-[15.5px] leading-relaxed">
              Code changes, docs go stale, and your agent starts running commands that no longer
              exist. MDPilot generates AGENTS.md and CLAUDE.md from your real repo and flags them
              the moment they drift — so your agent&apos;s context keeps matching reality, not a
              snapshot from last month.
            </p>
          </Reveal>

        </div>
      </section>

      {/* 7 · Standards + the Hangar */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">

        <div className="text-center mb-14 pb-14 border-b border-[var(--md-border)]">
          <p className="font-mono text-[12px] text-[var(--md-text-tertiary)] leading-relaxed max-w-xl mx-auto">
            Built on open standards — generates{' '}
            <span className="text-[var(--md-text-secondary)] font-semibold">AGENTS.md</span>, now a{' '}
            <span className="text-[var(--md-text-secondary)]">Linux Foundation (AAIF)</span> standard alongside MCP.
          </p>
        </div>

        {/* The Hangar — secondary tools */}
        <div className="rounded-[14px] border border-[var(--md-border)] bg-[var(--md-surface)] p-6 sm:p-7">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap mb-6">
            <div>
              <p className="section-label mb-3 w-fit">The hangar</p>
              <p className="text-[14.5px] text-[var(--md-text-secondary)]">
                More aircraft: generate docs, explain code, convert files, and more.
              </p>
            </div>
            <Link
              href="/labs"
              className="font-mono text-[12px] text-[var(--md-text-tertiary)] hover:text-[var(--md-accent)] transition-colors shrink-0"
            >
              See everything in the hangar →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Generate', href: '/generate' },
              { label: 'Convert', href: '/convert' },
              { label: 'Explain', href: '/explain' },
              { label: 'Image → Prompt', href: '/image-to-prompt' },
              { label: 'Interview Primer', href: '/interview-primer' },
            ].map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="px-3.5 py-2 rounded-md border border-[var(--md-border)] bg-[var(--md-bg)] hover:border-[var(--md-accent)] hover:text-[var(--md-accent)] text-[13px] text-[var(--md-text-secondary)] transition-colors duration-200"
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* 8 · Final CTA — approach lights guide you in */}
      <section className="bg-[var(--md-surface)] border-t border-[var(--md-border)] grid-bg py-24 px-5 sm:px-8 text-center">
        <div className="max-w-xl mx-auto">
          <div className="mb-12">
            <ApproachLights />
          </div>
          <p className="section-label mb-7 mx-auto w-fit">Ready for departure</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold text-[var(--md-text)] mb-5 leading-[1.1]">
            Start with a task.
            <br />
            <em className="em-wonk text-[var(--md-accent)] font-medium">The rest follows.</em>
          </h2>
          <p className="text-[var(--md-text-secondary)] text-[16px] mb-10 leading-relaxed">
            Paste anything. Get a prompt your AI agent nails.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-7">
            <Link
              href="/task"
              className="takeoff-group inline-flex items-center gap-2 px-8 py-4 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] text-[15px] font-semibold hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-md)]"
            >
              File a flight plan
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/docs/mcp"
              className="text-[14px] text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors"
            >
              or use it in your editor →
            </Link>
          </div>
          <p className="font-mono text-[11px] text-[var(--md-text-tertiary)]">No account. No credit card. No database.</p>
        </div>
      </section>

    </div>
  );
}
