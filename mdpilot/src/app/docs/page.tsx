import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation — MDPilot',
  description:
    'MDPilot documentation: how to use Task mode, the MCP server, Generate, Explain, Convert, and more.',
};

export default function DocsPage() {
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-10">
        <div className="section-label mb-4 w-fit">Documentation</div>
        <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-black text-white tracking-[-0.04em] mb-4 leading-tight">
          MDPilot docs
        </h1>
        <p className="text-white/45 text-[15px] leading-relaxed">
          MDPilot turns messy task input — tickets, threads, specs — into precise, expert-grade prompts
          your AI coding agent can act on immediately. It also generates production-grade instruction
          files (AGENTS.md, CLAUDE.md, README) and keeps them accurate as your codebase evolves.
        </p>
      </div>

      {/* Two ways card */}
      <div className="mb-10">
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-4">Two ways to use it</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Browser */}
          <Link
            href="/task"
            className="group p-5 rounded-xl border border-[#CC785C]/[0.20] bg-[#CC785C]/[0.04] hover:border-[#CC785C]/40 hover:bg-[#CC785C]/[0.07] transition-all duration-150 card-interactive"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#CC785C]/15 border border-[#CC785C]/20 flex items-center justify-center">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-[#CC785C]/70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-[#CC785C]/80 group-hover:text-[#CC785C] transition-colors">In your browser</span>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed">
              Go to <strong className="text-white/55">mdpilot.in/task</strong> — no account, no install.
              Paste a task, configure output, get your file. No API key required.
            </p>
            <p className="text-[11px] font-mono text-[#CC785C]/40 mt-3 group-hover:text-[#CC785C]/60 transition-colors">
              Try Task mode →
            </p>
          </Link>

          {/* Editor */}
          <Link
            href="/docs/mcp"
            className="group p-5 rounded-xl border border-[#34D399]/[0.18] bg-[#34D399]/[0.03] hover:border-[#34D399]/35 hover:bg-[#34D399]/[0.06] transition-all duration-150 card-interactive"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#34D399]/12 border border-[#34D399]/20 flex items-center justify-center">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-[#34D399]/70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-[#34D399]/80 group-hover:text-[#34D399] transition-colors">In your editor</span>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed">
              Install the <strong className="text-white/55">MCP server</strong> for Claude Code, Cursor,
              Windsurf, or Goose. MDPilot reads your actual repo — generated files reference real scripts
              and paths. Requires your own Anthropic API key.
            </p>
            <p className="text-[11px] font-mono text-[#34D399]/40 mt-3 group-hover:text-[#34D399]/60 transition-colors">
              MCP setup →
            </p>
          </Link>

        </div>
      </div>

      {/* Start here */}
      <div className="mb-10">
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-4">Start here</p>
        <div className="space-y-2">
          {[
            {
              href: '/docs/getting-started',
              label: 'Getting started',
              desc: 'What MDPilot solves and the two paths to get started in under 2 minutes.',
              accent: '#4FACFF',
            },
            {
              href: '/docs/task',
              label: 'Task mode',
              desc: 'The wizard, execution modes, options, and how to use the output.',
              accent: '#CC785C',
            },
            {
              href: '/docs/mcp',
              label: 'MCP server setup',
              desc: 'Install and configure for Claude Code, Cursor, Windsurf, or Goose.',
              accent: '#34D399',
            },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.11] transition-all duration-150 group card-interactive"
            >
              <div>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: item.accent }}>
                  {item.label}
                </p>
                <p className="text-[12px] text-white/40 leading-relaxed">{item.desc}</p>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                className="text-white/20 group-hover:text-white/40 transition-colors shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse all */}
      <div>
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-4">Browse all</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { href: '/docs/files', label: 'Files reference', desc: 'Every file MDPilot generates' },
            { href: '/docs/token-optimizer', label: 'Token optimizer', desc: 'How the 5-pass optimizer works' },
            { href: '/docs/drift', label: 'Drift detection', desc: 'Keep docs in sync with code' },
            { href: '/docs/generate', label: 'Generate mode', desc: 'AGENTS.md, CLAUDE.md, README, and more' },
            { href: '/docs/explain', label: 'Explain mode', desc: 'Code → plain-language walkthrough' },
            { href: '/docs/convert', label: 'Convert mode', desc: 'Any file → clean markdown' },
            { href: '/docs/image-to-prompt', label: 'Image → Prompt', desc: 'Recreation prompts for any image' },
            { href: '/docs/interview-primer', label: 'Interview primer', desc: 'Role + level → AI coach prompt' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.09] transition-all duration-150 group"
            >
              <p className="text-[12px] font-semibold text-white/65 group-hover:text-white/80 transition-colors mb-0.5">{item.label}</p>
              <p className="text-[11px] text-white/30">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
