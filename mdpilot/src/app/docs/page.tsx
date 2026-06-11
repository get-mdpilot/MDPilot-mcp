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
          <img src="/mdpilot-logo.svg" alt="MDPilot" width={52} height={52} className="w-13 h-13 object-contain drop-shadow-[0_0_10px_rgba(79,172,255,0.28)]" />
          <div className="section-label w-fit">Documentation</div>
        </div>
        <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em] mb-5 leading-tight">
          MDPilot docs
        </h1>
        <p className="text-white/60 text-[16px] leading-[1.75]">
          MDPilot turns messy task input — tickets, threads, specs — into precise, expert-grade prompts your AI coding agent can act on immediately. It also generates production-grade instruction files, explains code to any audience, converts documents to markdown, and more.
        </p>
      </div>

      {/* Two ways card */}
      <div className="mb-12">
        <p className="text-[12px] font-mono text-white/35 uppercase tracking-wider mb-5">Two ways to use it</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Browser */}
          <Link
            href="/task"
            className="group p-6 rounded-2xl border border-[#CC785C]/[0.22] bg-[#CC785C]/[0.04] hover:border-[#CC785C]/45 hover:bg-[#CC785C]/[0.07] transition-all duration-200 card-interactive"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#CC785C]/15 border border-[#CC785C]/20 flex items-center justify-center">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-[#CC785C]/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-[#CC785C]/85 group-hover:text-[#CC785C] transition-colors">In your browser</span>
            </div>
            <p className="text-[14px] text-white/55 leading-[1.7] mb-4">
              Go to <strong className="text-white/75">mdpilot.in/task</strong> — no account, no install, no API key. Paste a task and get a structured prompt in seconds.
            </p>
            <p className="text-[12px] font-mono text-[#CC785C]/45 group-hover:text-[#CC785C]/70 transition-colors">
              Try Task mode →
            </p>
          </Link>

          {/* Editor */}
          <Link
            href="/docs/mcp"
            className="group p-6 rounded-2xl border border-[#34D399]/[0.18] bg-[#34D399]/[0.03] hover:border-[#34D399]/38 hover:bg-[#34D399]/[0.06] transition-all duration-200 card-interactive"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#34D399]/12 border border-[#34D399]/20 flex items-center justify-center">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-[#34D399]/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-[#34D399]/85 group-hover:text-[#34D399] transition-colors">In your editor</span>
            </div>
            <p className="text-[14px] text-white/55 leading-[1.7] mb-4">
              Install the <strong className="text-white/75">MCP server</strong> for Claude Code, Cursor, Windsurf, or Goose. MDPilot reads your actual repo — files reference real scripts and paths.
            </p>
            <p className="text-[12px] font-mono text-[#34D399]/45 group-hover:text-[#34D399]/70 transition-colors">
              MCP setup →
            </p>
          </Link>

        </div>
      </div>

      {/* What MDPilot can do */}
      <div className="mb-12">
        <p className="text-[12px] font-mono text-white/35 uppercase tracking-wider mb-5">What MDPilot can do</p>
        <div className="space-y-2">
          {[
            {
              href: '/task',
              label: 'Task mode',
              tag: 'primary',
              tagColor: '#CC785C',
              desc: 'Paste a ticket, Slack thread, or half-formed idea — get a structured TASK.md your AI agent can act on immediately. No vague prompts, no guessing.',
              accent: '#CC785C',
            },
            {
              href: '/generate',
              label: 'Generate instruction files',
              tag: 'generate',
              tagColor: '#4FACFF',
              desc: 'Generate AGENTS.md, CLAUDE.md, README, CONTRIBUTING, SECURITY, SKILL, DESIGN, and more — grounded in your real repo, not boilerplate.',
              accent: '#4FACFF',
            },
            {
              href: '/explain',
              label: 'Explain code',
              tag: 'explain',
              tagColor: '#A855F7',
              desc: 'Turn any file or directory into a plain-language WALKTHROUGH.md tuned to your audience — AI agent, new team member, learner, or non-technical stakeholder.',
              accent: '#A855F7',
            },
            {
              href: '/convert',
              label: 'Convert any file to markdown',
              tag: 'convert',
              tagColor: '#2DD4BF',
              desc: 'Drop a PDF, Word doc, spreadsheet, or image. Get clean, token-efficient markdown via Microsoft MarkItDown — ready to paste into any AI tool.',
              accent: '#2DD4BF',
            },
            {
              href: '/image-to-prompt',
              label: 'Image → AI prompt',
              tag: 'labs',
              tagColor: '#F59E0B',
              desc: 'Upload any image and get a precise recreation prompt for FLUX, Stable Diffusion, Midjourney, or DALL-E — plus a negative prompt and tag list.',
              accent: '#F59E0B',
            },
            {
              href: '/interview-primer',
              label: 'Interview primer',
              tag: 'labs',
              tagColor: '#F59E0B',
              desc: 'Enter a role, level, and job description — get a ready-to-paste AI coach prompt that runs mock interviews and gives real-time feedback.',
              accent: '#F59E0B',
            },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start justify-between gap-4 p-5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-150 group card-interactive"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[14px] font-semibold" style={{ color: item.accent }}>
                    {item.label}
                  </p>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border shrink-0"
                    style={{ color: `${item.tagColor}99`, borderColor: `${item.tagColor}30`, background: `${item.tagColor}12` }}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-[13px] text-white/50 leading-[1.7]">{item.desc}</p>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                className="text-white/20 group-hover:text-white/45 transition-colors shrink-0 mt-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Start here — docs */}
      <div className="mb-12">
        <p className="text-[12px] font-mono text-white/35 uppercase tracking-wider mb-5">Documentation</p>
        <div className="space-y-2">
          {[
            {
              href: '/docs/getting-started',
              label: 'Getting started',
              desc: 'Two paths to get started in under 2 minutes — browser or MCP server.',
              accent: '#4FACFF',
            },
            {
              href: '/docs/task',
              label: 'Task mode',
              desc: 'The wizard, execution modes (Guide / AI Exec / Context), options, and how to use the output.',
              accent: '#CC785C',
            },
            {
              href: '/docs/mcp',
              label: 'MCP server setup',
              desc: 'Install and configure for Claude Code, Cursor, Windsurf, or Goose. Works with any AI key.',
              accent: '#34D399',
            },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start justify-between gap-4 p-5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.11] transition-all duration-150 group card-interactive"
            >
              <div>
                <p className="text-[14px] font-semibold mb-1" style={{ color: item.accent }}>
                  {item.label}
                </p>
                <p className="text-[13px] text-white/50 leading-[1.7]">{item.desc}</p>
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
        <p className="text-[12px] font-mono text-white/35 uppercase tracking-wider mb-5">All reference docs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
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
              className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all duration-150 group card-interactive"
            >
              <p className="text-[13px] font-semibold text-white/70 group-hover:text-white/90 transition-colors mb-1">{item.label}</p>
              <p className="text-[12px] text-white/40 leading-[1.6]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
