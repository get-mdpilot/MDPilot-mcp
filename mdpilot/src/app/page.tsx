import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import MouseHero from '@/components/MouseHero';

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

/* ─── Open-with pill ─────────────────────────────────────────────────────── */
function OpenWithPill({ name, bg, fg, glow, icon }: {
  name: string; bg: string; fg: string; glow: string; icon: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-full shrink-0 select-none"
      style={{ backgroundColor: bg, color: fg, boxShadow: `0 0 18px ${glow}, 0 2px 10px rgba(0,0,0,0.35)` }}
    >
      <span className="shrink-0 flex items-center">{icon}</span>
      <span
        className="text-[13px] font-semibold whitespace-nowrap tracking-tight"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {name}
      </span>
    </div>
  );
}

/* ─── Open-with two-row scrolling marquee ────────────────────────────────── */
function OpenWithMarquee() {
  type Tool = { name: string; bg: string; fg: string; glow: string; icon: ReactNode };

  const ROW1: Tool[] = [
    {
      name: 'Claude Code',
      bg: '#CC785C', fg: '#fff', glow: 'rgba(204,120,92,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13.827 3.45L21.5 19.5h-3.895l-1.65-3.8H8.03l-1.648 3.8H2.5l7.674-16.05h3.653zm-1.824 4.282-2.48 5.718h4.959l-2.48-5.718z" />
        </svg>
      ),
    },
    {
      name: 'Cursor',
      bg: '#1E1E2E', fg: '#CDD6F4', glow: 'rgba(205,214,244,0.2)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 2.5v18.4l5.1-5.1 3.1 7.2 2.6-1.1-3.1-7.2H18L4 2.5z" />
        </svg>
      ),
    },
    {
      name: 'GitHub Copilot',
      bg: '#8B5CF6', fg: '#fff', glow: 'rgba(139,92,246,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      ),
    },
    {
      name: 'Windsurf',
      bg: '#06B6D4', fg: '#fff', glow: 'rgba(6,182,212,0.5)',
      icon: (
        <svg width="18" height="15" viewBox="0 0 26 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M1 9c3-6 8-9 13-6s9 9 11 6" /><path d="M3 15c2-4 7-7 10-5s8 6 10 5" />
        </svg>
      ),
    },
    {
      name: 'Goose',
      bg: '#F59E0B', fg: '#fff', glow: 'rgba(245,158,11,0.5)',
      icon: (
        <svg width="18" height="16" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 14c0 0 2-5 8-5s8 4 8 4" />
          <path d="M20 13c1-3 2-6 4-8" />
          <circle cx="23.5" cy="4.5" r="1.8" fill="currentColor" stroke="none" />
          <path d="M25 4l2-1" /><path d="M4 14c-1 1-2 3-1 4" />
        </svg>
      ),
    },
    {
      name: 'ChatGPT',
      bg: '#10A37F', fg: '#fff', glow: 'rgba(16,163,127,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M22.28 9.82a6 6 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.5-2.9 6.07 6.07 0 0 0-10.26 2.27 6 6 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 6 6 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 6 6 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.4a4.5 4.5 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zM3.6 18.3a4.47 4.47 0 0 1-.54-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06l-4.83 2.79A4.5 4.5 0 0 1 3.6 18.3zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.67a.77.77 0 0 0 .39.68l5.82 3.36-2.02 1.17a.08.08 0 0 1-.07 0L3.99 14A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.84-3.37 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1V12.44a.79.79 0 0 0-.4-.68zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.24V6.9a.07.07 0 0 1 .03-.06L14.27 4.1a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.14-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.8.8 0 0 0-.4.68zm1.1-2.37 2.6-1.5 2.61 1.5v3l-2.6 1.5-2.61-1.5z" />
        </svg>
      ),
    },
    {
      name: 'Zed',
      bg: '#9D7CD8', fg: '#fff', glow: 'rgba(157,124,216,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 5h14L6 19h13" />
        </svg>
      ),
    },
  ];

  const ROW2: Tool[] = [
    {
      name: 'VS Code',
      bg: '#007ACC', fg: '#fff', glow: 'rgba(0,122,204,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      name: 'JetBrains',
      bg: '#FE315D', fg: '#fff', glow: 'rgba(254,49,93,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="2" y="2" width="9" height="9" rx="1.5" /><rect x="13" y="2" width="9" height="9" rx="1.5" />
          <rect x="2" y="13" width="9" height="9" rx="1.5" /><rect x="13" y="13" width="9" height="9" rx="1.5" />
        </svg>
      ),
    },
    {
      name: 'Neovim',
      bg: '#57A143', fg: '#fff', glow: 'rgba(87,161,67,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      ),
    },
    {
      name: 'Gemini',
      bg: '#4285F4', fg: '#fff', glow: 'rgba(66,133,244,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ),
    },
    {
      name: 'Continue',
      bg: '#A855F7', fg: '#fff', glow: 'rgba(168,85,247,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
    {
      name: 'Codeium',
      bg: '#09B6A3', fg: '#fff', glow: 'rgba(9,182,163,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
          <path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
        </svg>
      ),
    },
    {
      name: 'Aider',
      bg: '#E44332', fg: '#fff', glow: 'rgba(228,67,50,0.5)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" />
          <circle cx="8" cy="16" r="1" fill="currentColor" /><circle cx="16" cy="16" r="1" fill="currentColor" />
        </svg>
      ),
    },
  ];

  const row1 = [...ROW1, ...ROW1, ...ROW1, ...ROW1];
  const row2 = [...ROW2, ...ROW2, ...ROW2, ...ROW2];

  return (
    <section className="relative border-y border-white/[0.05] bg-[var(--md-dark-2)] py-10 overflow-hidden">
      <p className="text-center text-[10px] font-mono text-white/20 uppercase tracking-[0.14em] mb-6">
        Works with
      </p>
      <div className="marquee-container mb-3">
        <div className="marquee-track gap-3 px-2">
          {row1.map((tool, i) => <OpenWithPill key={i} {...tool} />)}
        </div>
      </div>
      <div className="marquee-container">
        <div className="marquee-track-right gap-3 px-2">
          {row2.map((tool, i) => <OpenWithPill key={i} {...tool} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="bg-[var(--md-dark)] overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — cursor-reactive, Task-focused (MouseHero client component)
      ══════════════════════════════════════════════════════════════════ */}
      <MouseHero />

      {/* Works-with marquee */}
      <OpenWithMarquee />

      {/* ═══════════════════════════════════════════════════════════════
          2. THE INSIGHT — why starting right matters
      ══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
        <div className="section-label mb-5 mx-auto w-fit">The insight</div>
        <h2 className="text-[clamp(1.7rem,4vw,2.6rem)] font-black text-white tracking-[-0.04em] mb-5 leading-tight">
          Your AI is only as good as<br className="hidden sm:block" /> how you start the conversation.
        </h2>
        <p className="text-white/45 text-[16px] leading-relaxed max-w-2xl mx-auto">
          Most developers open their AI tool and type a vague first message — no context,
          no structure, no acceptance criteria — and get generic help back. MDPilot fixes
          the one moment that sets the trajectory: the entry point. Get the prompt right,
          and the whole conversation follows.
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. BEFORE / AFTER — the persuasive core
      ══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-[var(--md-dark-2)] border-y border-white/[0.05] py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="section-label mb-4 mx-auto w-fit">How Task works</div>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em] mb-3 leading-tight">
              Same task. One is a shrug;<br className="hidden sm:block" />
              <span className="text-gradient-animated">one is a spec.</span>
            </h2>
            <p className="text-white/40 text-[15px] max-w-md mx-auto">
              Paste anything raw. Get a structured prompt an expert would hand an AI agent.
            </p>
          </div>

          {/* Two panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">

            {/* Before */}
            <div className="rounded-2xl border border-[#FF6B6B]/[0.18] bg-[#FF6B6B]/[0.03] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#FF6B6B]/[0.12] bg-[#FF6B6B]/[0.04]">
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B]/50 shrink-0" />
                <span className="text-[11px] font-mono text-[#FF6B6B]/55 tracking-wide">raw input</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed space-y-3">
                <div>
                  <span className="text-[10px] tracking-[0.1em] text-white/20 uppercase">TASK-2847 · High · Unassigned</span>
                  <p className="text-white/65 font-semibold text-[13px] mt-1">&quot;fix auth redirect&quot;</p>
                </div>
                <div className="border-l-2 border-white/[0.08] pl-3 space-y-0.5 text-white/35">
                  <p><span className="text-[#4FACFF]/40">slack › </span>engineering-bugs</p>
                  <p className="text-white/45">hey so after oauth the user keeps going</p>
                  <p className="text-white/45">back to login instead of dashboard, been</p>
                  <p className="text-white/45">happening since the v3.1 deploy. can someone</p>
                  <p className="text-white/45">look at it? we got a complaint</p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-[#34D399]/[0.20] bg-[#34D399]/[0.03] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#34D399]/[0.14] bg-[#34D399]/[0.04]">
                <span className="w-2 h-2 rounded-full bg-[#34D399]/70 shrink-0" />
                <span className="text-[11px] font-mono text-[#34D399]/70 tracking-wide">TASK.md — MDPilot output</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-relaxed space-y-2">
                <p className="text-[#4FACFF]/80 font-bold text-[13px]"># Fix OAuth post-auth redirect loop</p>
                <p className="text-[#A855F7]/65 font-semibold mt-2">## Goal</p>
                <p className="text-white/50 text-[11px] leading-relaxed">Authenticated users land on /login after OAuth instead of /dashboard. Regression from v3.1.0.</p>
                <p className="text-[#A855F7]/65 font-semibold mt-1">## Acceptance criteria</p>
                <p className="text-[#34D399]/55 text-[11px]">- [ ] /auth/callback → /dashboard (first-time OAuth)</p>
                <p className="text-[#34D399]/55 text-[11px]">- [ ] /auth/callback → /dashboard (returning user)</p>
                <p className="text-[#34D399]/55 text-[11px]">- [ ] /login does not render for authenticated users</p>
                <p className="text-[#A855F7]/65 font-semibold mt-1">## Watch-outs</p>
                <p className="text-white/40 text-[11px]">- middleware.ts may contain a redirect loop</p>
                <p className="text-white/40 text-[11px]">- Verify session cookie is set before redirect fires</p>
                <p className="text-[#A855F7]/65 font-semibold mt-1">## Constraints</p>
                <p className="text-white/40 text-[11px]">- Do not modify OAuth provider config</p>
                <p className="text-white/40 text-[11px]">- Preserve existing session TTL</p>
              </div>
            </div>
          </div>

          {/* 3-step strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:divide-x sm:divide-white/[0.07] mb-10 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {[
              { n: '1', title: 'Paste your task', sub: 'Ticket · Slack thread · GitHub issue' },
              { n: '2', title: 'Choose how you want to work', sub: 'Guide · AI Exec · Context mode' },
              { n: '3', title: 'Get a prompt your agent nails', sub: 'Structured · gap-checked · ready to paste' },
            ].map(step => (
              <div key={step.n} className="flex-1 flex items-start gap-3 px-5 py-4 sm:py-5">
                <span className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-[#4FACFF]/12 border border-[#4FACFF]/25 flex items-center justify-center text-[10px] font-mono font-bold text-[#4FACFF]/70">
                  {step.n}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white/80 leading-snug">{step.title}</p>
                  <p className="text-[11px] text-white/30 font-mono mt-0.5">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/task"
              className="btn-shine inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-[14px] font-bold shadow-[0_0_24px_rgba(79,172,255,0.25)] hover:shadow-[0_0_40px_rgba(79,172,255,0.42)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Start with a task →
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. MCP — use it right inside your editor
      ══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div>
            <div className="section-label mb-5 w-fit">MCP server</div>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em] leading-tight mb-4">
              Use it right inside your editor.
            </h2>
            <p className="text-white/45 text-[15px] leading-relaxed mb-8">
              MDPilot runs as an MCP server — call it from Claude Code, Cursor, Windsurf,
              and Goose without leaving your IDE. It reads your real repo, so prompts and
              docs reference actual files and commands, never guesses.
            </p>
            <Link
              href="/docs/mcp"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] text-[13px] font-medium text-white/65 hover:text-white hover:border-white/[0.20] hover:bg-white/[0.07] transition-all duration-200"
            >
              MCP setup
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Works-with grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                name: 'Claude Code', color: '#CC785C',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.827 3.45L21.5 19.5h-3.895l-1.65-3.8H8.03l-1.648 3.8H2.5l7.674-16.05h3.653zm-1.824 4.282-2.48 5.718h4.959l-2.48-5.718z" /></svg>,
              },
              {
                name: 'Cursor', color: '#CDD6F4',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4 2.5v18.4l5.1-5.1 3.1 7.2 2.6-1.1-3.1-7.2H18L4 2.5z" /></svg>,
              },
              {
                name: 'Windsurf', color: '#06B6D4',
                icon: <svg width="18" height="15" viewBox="0 0 26 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M1 9c3-6 8-9 13-6s9 9 11 6" /><path d="M3 15c2-4 7-7 10-5s8 6 10 5" /></svg>,
              },
              {
                name: 'Goose', color: '#F59E0B',
                icon: <svg width="18" height="16" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 14c0 0 2-5 8-5s8 4 8 4" /><path d="M20 13c1-3 2-6 4-8" /><circle cx="23.5" cy="4.5" r="1.8" fill="currentColor" stroke="none" /></svg>,
              },
            ].map(tool => (
              <div
                key={tool.name}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group cursor-default"
              >
                <span className="shrink-0 flex items-center" style={{ color: tool.color }}>
                  {tool.icon}
                </span>
                <span className="text-[13px] font-medium text-white/60 group-hover:text-white/85 transition-colors">
                  {tool.name}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. DRIFT DIFFERENTIATOR — context that stays accurate
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--md-dark-2)] border-y border-white/[0.05] py-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Visual: drift indicator */}
          <div className="order-2 lg:order-1 space-y-3">
            {[
              { file: 'AGENTS.md', status: 'current', label: 'Up to date', color: '#34D399', border: 'border-[#34D399]/[0.18]', bg: 'bg-[#34D399]/[0.04]' },
              { file: 'CLAUDE.md', status: 'drift', label: '3 sections drifted', color: '#FBBF24', border: 'border-[#FBBF24]/[0.20]', bg: 'bg-[#FBBF24]/[0.04]' },
              { file: 'README.md', status: 'current', label: 'Up to date', color: '#34D399', border: 'border-[#34D399]/[0.18]', bg: 'bg-[#34D399]/[0.04]' },
            ].map(row => (
              <div
                key={row.file}
                className={`flex items-center justify-between gap-4 px-5 py-3.5 rounded-xl border ${row.border} ${row.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color, opacity: row.status === 'drift' ? 1 : 0.6 }} />
                  <span className="text-[13px] font-mono font-semibold text-white/70">{row.file}</span>
                </div>
                <span className="text-[11px] font-mono" style={{ color: row.color, opacity: 0.75 }}>
                  {row.label}
                </span>
              </div>
            ))}
            <p className="text-[11px] font-mono text-white/20 pl-1 pt-1">
              mdpilot check-drift · 2 files checked · 1 drift detected
            </p>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <div className="section-label mb-5 w-fit">Drift detection</div>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em] leading-tight mb-4">
              Context that stays accurate.
            </h2>
            <p className="text-white/45 text-[15px] leading-relaxed">
              Code changes, docs go stale, and your agent starts running commands that no longer
              exist. MDPilot generates AGENTS.md and CLAUDE.md from your real repo and flags them
              the moment they drift — so your agent&apos;s context keeps matching reality, not a
              snapshot from last month.
            </p>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. TRUST / ECOSYSTEM SIGNAL + LABS (secondary)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16">

        {/* Trust line */}
        <div className="text-center mb-12 pb-12 border-b border-white/[0.05]">
          <p className="text-[12px] font-mono text-white/25 leading-relaxed max-w-xl mx-auto">
            Built on open standards — generates{' '}
            <span className="text-white/40 font-semibold">AGENTS.md</span>, now a{' '}
            <span className="text-white/40">Linux Foundation (AAIF)</span> standard alongside MCP.
          </p>
        </div>

        {/* Labs — visually secondary, lower weight */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap mb-5">
            <div>
              <div className="section-label mb-2 w-fit" style={{ fontSize: '9px' }}>Labs</div>
              <p className="text-[14px] font-medium text-white/50">
                More tools: generate docs, explain code, convert files, and more.
              </p>
            </div>
            <Link
              href="/labs"
              className="text-[12px] font-mono text-white/30 hover:text-[#4FACFF]/70 transition-colors shrink-0"
            >
              See all in Labs →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Generate', accent: '#4FACFF', href: '/generate' },
              { label: 'Convert', accent: '#2DD4BF', href: '/convert' },
              { label: 'Explain', accent: '#A855F7', href: '/explain' },
              { label: 'Image → Prompt', accent: '#F97316', href: '/image-to-prompt' },
              { label: 'Interview Primer', accent: '#FBBF24', href: '/interview-primer' },
            ].map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] hover:bg-white/[0.05] transition-all duration-200 group"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tool.accent, opacity: 0.55 }} />
                <span className="text-[12px] text-white/35 group-hover:text-white/65 transition-colors">{tool.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. FINAL CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[var(--md-dark-2)] border-t border-white/[0.05] py-24 px-5 sm:px-8 text-center">
        <div className="blob w-[500px] h-[500px] bg-[#4FACFF]/[0.07] -top-20 left-1/2 -translate-x-1/2" />
        <div className="blob w-[300px] h-[300px] bg-[#A855F7]/[0.06] bottom-0 right-1/4" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="section-label mb-6 mx-auto w-fit">Get started</div>
          <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-black text-white tracking-[-0.04em] mb-5 leading-tight">
            Start with a task.<br />The rest follows.
          </h2>
          <p className="text-white/40 text-[16px] mb-10 leading-relaxed">
            Paste anything. Get a prompt your AI agent nails. No account, no credit card.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/task"
              className="btn-shine relative inline-flex items-center gap-2 px-9 py-4 rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-[15px] font-black shadow-[0_0_36px_rgba(79,172,255,0.28)] hover:shadow-[0_0_56px_rgba(79,172,255,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Start with a task →
            </Link>
            <Link
              href="/docs/mcp"
              className="text-[14px] text-white/30 hover:text-white/55 transition-colors"
            >
              or use it in your editor →
            </Link>
          </div>
          <p className="text-[11px] font-mono text-white/20">No account. No credit card. No database.</p>
        </div>
      </section>

    </div>
  );
}
