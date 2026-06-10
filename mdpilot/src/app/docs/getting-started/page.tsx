import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Getting started — MDPilot docs',
  description:
    'Get started with MDPilot in under 2 minutes. Use Task mode in your browser with no setup, or install the MCP server to use MDPilot from inside Claude Code, Cursor, or Windsurf.',
};

export default function GettingStartedPage() {
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Getting started</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black text-white tracking-[-0.04em] mb-3 leading-tight">
          Getting started
        </h1>
        <p className="text-white/45 text-[15px] leading-relaxed">
          The quality of how you start an AI conversation determines the quality of the whole
          conversation. MDPilot turns messy raw input — tickets, threads, specs — into a precise,
          expert-grade prompt so your AI agent has everything it needs before writing a single line of
          code.
        </p>
      </div>

      {/* What you'll need */}
      <div className="mb-8 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-3">What you'll need</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <svg width="14" height="14" className="text-[#34D399]/70 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <p className="text-[13px] text-white/55">
              <strong className="text-white/70">Nothing</strong> — to use Task mode, Generate, Explain, Convert, and Image → Prompt in your browser. No account, no API key.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <svg width="14" height="14" className="text-[#FBBF24]/70 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-[13px] text-white/55">
              <strong className="text-white/70">An Anthropic API key</strong> — to use the MCP server. The server calls Claude using your key; calls are billed to you.
            </p>
          </div>
        </div>
      </div>

      {/* Path A */}
      <div className="mb-8 pb-8 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-mono font-bold text-[#CC785C]/70 bg-[#CC785C]/10 border border-[#CC785C]/20 px-2 py-0.5 rounded">
            Path A
          </span>
          <span className="text-[14px] font-semibold text-white/70">Web — no setup required</span>
        </div>
        <div className="space-y-3">
          {[
            {
              n: '1',
              title: 'Go to Task mode',
              body: <>Navigate to <Link href="/task" className="text-[#4FACFF]/70 hover:text-[#4FACFF] transition-colors">mdpilot.in/task</Link>. No account or login needed.</>,
            },
            {
              n: '2',
              title: 'Paste your task',
              body: 'Drop in a Jira ticket, Slack thread, bug report, or anything that describes what needs to be built. At least 20 characters.',
            },
            {
              n: '3',
              title: 'Choose your output mode and generate',
              body: 'Select Developer guide, AI Exec, or Context drop depending on who will use the output. Click Generate — done in 5–15 seconds.',
            },
            {
              n: '4',
              title: 'Paste the Agent Prompt block into your AI tool',
              body: 'Copy the Agent Prompt block from the bottom of TASK.md and paste it into Claude Code, Cursor, Copilot, or Windsurf as your first message.',
            },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#CC785C]/12 border border-[#CC785C]/20 flex items-center justify-center text-[10px] font-mono font-bold text-[#CC785C]/60 mt-0.5">
                {step.n}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-white/70 mb-0.5">{step.title}</p>
                <p className="text-[12px] text-white/40 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Link
            href="/docs/task"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#CC785C]/60 hover:text-[#CC785C] transition-colors"
          >
            Task mode docs (wizard, execution modes, options) →
          </Link>
        </div>
      </div>

      {/* Path B */}
      <div className="mb-8 pb-8 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-mono font-bold text-[#34D399]/70 bg-[#34D399]/10 border border-[#34D399]/20 px-2 py-0.5 rounded">
            Path B
          </span>
          <span className="text-[14px] font-semibold text-white/70">Editor — via MCP server</span>
        </div>
        <p className="text-[13px] text-white/45 leading-relaxed mb-4">
          The MCP server runs MDPilot inside Claude Code, Cursor, Windsurf, or Goose. The key advantage:
          it reads your actual repo files, so generated AGENTS.md, CLAUDE.md, and TASK.md reference real
          scripts and paths — not guesses.
        </p>
        <div className="space-y-2 mb-5">
          {[
            { n: '1', body: 'Get an Anthropic API key at console.anthropic.com.' },
            { n: '2', body: 'Install Node.js 20+ if you don\'t have it.' },
            { n: '3', body: 'Add the MCP server config to your IDE using the JSON config or the Claude Code CLI shortcut.' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#34D399]/10 border border-[#34D399]/18 flex items-center justify-center text-[10px] font-mono font-bold text-[#34D399]/55 mt-0.5">
                {step.n}
              </span>
              <p className="text-[12px] text-white/40 leading-relaxed mt-0.5">{step.body}</p>
            </div>
          ))}
        </div>
        <Link
          href="/docs/mcp"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#34D399]/60 hover:text-[#34D399] transition-colors"
        >
          Full MCP setup guide (all clients, config snippets, all 8 tools) →
        </Link>
      </div>

      {/* Next links */}
      <div>
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-4">Next</p>
        <div className="space-y-2">
          {[
            { href: '/docs/task', label: 'Task mode', desc: 'Deep dive: wizard steps, execution modes, options, and output.' },
            { href: '/docs/mcp', label: 'MCP server setup', desc: 'Per-client config, the 8 tools, and a quick-start prompt.' },
            { href: '/docs/files', label: 'Files reference', desc: 'Every file MDPilot generates and where it goes.' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-150 group"
            >
              <div>
                <p className="text-[13px] font-semibold text-white/65 group-hover:text-white/80 transition-colors mb-0.5">{item.label}</p>
                <p className="text-[11px] text-white/30">{item.desc}</p>
              </div>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                className="text-white/20 group-hover:text-white/40 transition-colors shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.05]">
        <p className="text-[12px] text-white/30">
          Found a bug?{' '}
          <a
            href="https://github.com/get-mdpilot/md-pilot/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4FACFF]/60 hover:text-[#4FACFF] transition-colors"
          >
            Tell us on GitHub →
          </a>
        </p>
      </div>

    </div>
  );
}
