import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation — MDPilot',
  description:
    'MDPilot documentation: Task mode, MCP server, Generate, Explain, Convert, Image-to-Prompt, Interview Primer, and more.',
};

export default function DocsPage() {
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <img src="/mdpilot-logo.webp" alt="MDPilot" width={52} height={52} className="w-13 h-13 object-contain" />
          <p className="section-label w-fit">Field Manual</p>
        </div>
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-5 leading-tight">
          MDPilot docs
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[16px] leading-[1.75]">
          MDPilot turns messy task input — tickets, threads, specs — into precise, expert-grade prompts your AI coding agent can act on immediately. It also generates production-grade instruction files, explains code to any audience, converts documents to markdown, and more.
        </p>
      </div>

      {/* Three ways card */}
      <div className="mb-12">
        <p className="text-[12px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-5">Three ways to use it</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Browser */}
          <Link
            href="/task"
            className="group p-6 rounded-2xl border border-[var(--md-accent)]/[0.22] bg-[var(--md-accent)]/[0.04] hover:border-[var(--md-accent)]/45 hover:bg-[var(--md-accent)]/[0.07] transition-all duration-200 card-interactive"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--md-accent)]/15 border border-[var(--md-accent)]/20 flex items-center justify-center">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-[var(--md-accent)]/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-[var(--md-accent)]/85 group-hover:text-[var(--md-accent)] transition-colors">In your browser</span>
            </div>
            <p className="text-[14px] text-[var(--md-text-secondary)] leading-[1.7] mb-4">
              Go to <strong className="text-[var(--md-text)]">mdpilot.in/task</strong> — no account, no install, no API key. Paste a task and get a structured prompt in seconds.
            </p>
            <p className="text-[12px] font-mono text-[var(--md-accent)]/70 group-hover:text-[var(--md-accent)] transition-colors">
              Try Task mode →
            </p>
          </Link>

          {/* Editor — MCP */}
          <Link
            href="/docs/mcp"
            className="group p-6 rounded-2xl border border-[var(--md-go)]/[0.18] bg-[var(--md-go)]/[0.03] hover:border-[var(--md-go)]/38 hover:bg-[var(--md-go)]/[0.06] transition-all duration-200 card-interactive"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--md-go)]/12 border border-[var(--md-go)]/20 flex items-center justify-center">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-[var(--md-go)]/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-[var(--md-go)]/85 group-hover:text-[var(--md-go)] transition-colors">MCP server</span>
            </div>
            <p className="text-[14px] text-[var(--md-text-secondary)] leading-[1.7] mb-4">
              Install the <strong className="text-[var(--md-text)]">MCP server</strong> for Claude Code, Cursor, Windsurf, or Goose. Your AI agent can call MDPilot tools mid-conversation.
            </p>
            <p className="text-[12px] font-mono text-[var(--md-go)]/70 group-hover:text-[var(--md-go)] transition-colors">
              MCP setup →
            </p>
          </Link>

          {/* Editor — VS Code extension */}
          <Link
            href="/docs/vscode"
            className="group p-6 rounded-2xl border border-[var(--md-info)]/[0.18] bg-[var(--md-info)]/[0.03] hover:border-[var(--md-info)]/38 hover:bg-[var(--md-info)]/[0.06] transition-all duration-200 card-interactive sm:col-span-2"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--md-info)]/12 border border-[var(--md-info)]/20 flex items-center justify-center">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-[var(--md-info)]/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-[var(--md-info)]/85 group-hover:text-[var(--md-info)] transition-colors">VS Code extension</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] bg-[var(--md-go)]/12 text-[var(--md-go)]/75 border border-[var(--md-go)]/20">new</span>
            </div>
            <p className="text-[14px] text-[var(--md-text-secondary)] leading-[1.7] mb-4">
              Install the <strong className="text-[var(--md-text)]">MDPilot extension</strong> from the VS Code Marketplace. Works in VS Code, Cursor, and Windsurf. No JSON config — press <kbd className="text-[12px] font-mono bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1 py-0.5 rounded text-[var(--md-text-secondary)]">Ctrl+Shift+P</kbd> and start generating.
            </p>
            <p className="text-[12px] font-mono text-[var(--md-info)]/70 group-hover:text-[var(--md-info)] transition-colors">
              Extension setup →
            </p>
          </Link>

        </div>
      </div>

      {/* What MDPilot can do */}
      <div className="mb-12">
        <p className="text-[12px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-5">What MDPilot can do</p>
        <div className="space-y-2">
          {[
            {
              href: '/task',
              label: 'Task mode',
              tag: 'primary',
              desc: 'Paste a ticket, Slack thread, or half-formed idea — get a structured TASK.md your AI agent can act on immediately. No vague prompts, no guessing.',
              accent: 'var(--md-accent)',
            },
            {
              href: '/generate',
              label: 'Generate instruction files',
              tag: 'generate',
              desc: 'Generate AGENTS.md, CLAUDE.md, README, CONTRIBUTING, SECURITY, SKILL, DESIGN, and more — grounded in your real repo, not boilerplate.',
              accent: 'var(--md-accent)',
            },
            {
              href: '/explain',
              label: 'Explain code',
              tag: 'explain',
              desc: 'Turn any file or directory into a plain-language WALKTHROUGH.md tuned to your audience — AI agent, new team member, learner, or non-technical stakeholder.',
              accent: 'var(--md-info)',
            },
            {
              href: '/convert',
              label: 'Convert any file to markdown',
              tag: 'convert',
              desc: 'Drop a PDF, Word doc, spreadsheet, or image. Get clean, token-efficient markdown via Microsoft MarkItDown — ready to paste into any AI tool.',
              accent: 'var(--md-go)',
            },
            {
              href: '/image-to-prompt',
              label: 'Image → AI prompt',
              tag: 'labs',
              desc: 'Upload any image and get a precise recreation prompt for FLUX, Stable Diffusion, Midjourney, or DALL-E — plus a negative prompt and tag list.',
              accent: 'var(--md-accent)',
            },
            {
              href: '/interview-primer',
              label: 'Interview primer',
              tag: 'labs',
              desc: 'Enter a role, level, and job description — get a ready-to-paste AI coach prompt that runs mock interviews and gives real-time feedback.',
              accent: 'var(--md-accent)',
            },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start justify-between gap-4 p-5 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] hover:bg-[var(--md-surface-2)] hover:border-[var(--md-border-strong)] transition-all duration-150 group card-interactive"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[14px] font-semibold" style={{ color: item.accent }}>
                    {item.label}
                  </p>
                  <span className="text-[9px] font-mono uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-[5px] border border-[var(--md-border-strong)] bg-[var(--md-surface-2)] text-[var(--md-text-tertiary)] shrink-0">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--md-text-secondary)] leading-[1.7]">{item.desc}</p>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                className="text-[var(--md-text-tertiary)] group-hover:text-[var(--md-text-secondary)] transition-colors shrink-0 mt-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Start here — docs */}
      <div className="mb-12">
        <p className="text-[12px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-5">Documentation</p>
        <div className="space-y-2">
          {[
            {
              href: '/docs/getting-started',
              label: 'Getting started',
              desc: 'Two paths to get started in under 2 minutes — browser or MCP server.',
              accent: 'var(--md-accent)',
            },
            {
              href: '/docs/task',
              label: 'Task mode',
              desc: 'The wizard, execution modes (Guide / AI Exec / Context), options, and how to use the output.',
              accent: 'var(--md-accent)',
            },
            {
              href: '/docs/mcp',
              label: 'MCP server setup',
              desc: 'Install and configure for Claude Code, Cursor, Windsurf, or Goose. Works with any AI key.',
              accent: 'var(--md-go)',
            },
            {
              href: '/docs/vscode',
              label: 'VS Code extension',
              desc: 'Install from the VS Code Marketplace. Works in VS Code, Cursor, and Windsurf — no JSON config.',
              accent: 'var(--md-info)',
            },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start justify-between gap-4 p-5 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] hover:bg-[var(--md-surface-2)] hover:border-[var(--md-border-strong)] transition-all duration-150 group card-interactive"
            >
              <div>
                <p className="text-[14px] font-semibold mb-1" style={{ color: item.accent }}>
                  {item.label}
                </p>
                <p className="text-[13px] text-[var(--md-text-secondary)] leading-[1.7]">{item.desc}</p>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                className="text-[var(--md-text-tertiary)] group-hover:text-[var(--md-text-secondary)] transition-colors shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse all */}
      <div>
        <p className="text-[12px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-5">All reference docs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { href: '/docs/vscode', label: 'VS Code extension', desc: 'Install from the Marketplace — VS Code, Cursor, Windsurf' },
            { href: '/docs/files', label: 'Files reference', desc: 'Every file MDPilot generates and when to use each' },
            { href: '/docs/token-optimizer', label: 'Token optimizer', desc: 'How the 5-pass optimizer cuts 20–40% without losing meaning' },
            { href: '/docs/drift', label: 'Drift detection', desc: 'Keep docs in sync as your codebase evolves' },
            { href: '/docs/generate', label: 'Generate mode', desc: 'AGENTS.md, CLAUDE.md, README, DESIGN, and more' },
            { href: '/docs/explain', label: 'Explain mode', desc: 'Code → plain-language walkthrough for any audience' },
            { href: '/docs/convert', label: 'Convert mode', desc: 'PDF, Word, CSV, HTML → clean markdown' },
            { href: '/docs/image-to-prompt', label: 'Image → Prompt', desc: 'Recreation prompts for FLUX, SD, Midjourney, DALL-E' },
            { href: '/docs/interview-primer', label: 'Interview primer', desc: 'Role + JD → AI coach prompt' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] hover:bg-[var(--md-surface-2)] hover:border-[var(--md-border-strong)] transition-all duration-150 group card-interactive"
            >
              <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] group-hover:text-[var(--md-text)] transition-colors mb-1">{item.label}</p>
              <p className="text-[12px] text-[var(--md-text-secondary)] leading-[1.6]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
