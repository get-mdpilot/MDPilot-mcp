import type { Metadata } from 'next';
import Link from 'next/link';
import { CopyButton } from '@/components/CopyButton';

export const metadata: Metadata = {
  title: 'MDPilot MCP server — setup',
  description:
    'Install and configure the MDPilot MCP server for Claude Code, Cursor, Windsurf, and Goose. Generate AGENTS.md, CLAUDE.md, TASK.md and more directly from your IDE — grounded in your real repo.',
};

/* ─── Code block ─────────────────────────────────────────────────────────── */
function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a18] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4FACFF]/40" />
          {label && <span className="text-[10px] font-mono text-white/30 tracking-wide">{label}</span>}
        </div>
        <CopyButton text={children} variant="docs" />
      </div>
      <pre className="p-4 text-[12.5px] font-mono leading-relaxed overflow-x-auto text-white/70 whitespace-pre">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */
function DocSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-10 first:pt-0">
      {children}
      <div className="mt-8 border-b border-white/[0.05]" />
    </section>
  );
}

/* ─── Tools table ────────────────────────────────────────────────────────── */
const TOOLS = [
  {
    name: 'analyze_project',
    desc: 'Scan a repo and detect its tech stack, scripts, package manager, and structure. Run this before generate_md_file so output is grounded in real project data.',
  },
  {
    name: 'generate_md_file',
    desc: 'Generate a production-grade markdown file (readme, agents, claude, contributing, security, skill, design, context). Reads real package.json scripts — never hallucinates commands. Optionally writes to disk.',
  },
  {
    name: 'generate_task_file',
    desc: 'Turn a ticket, Slack thread, or GitHub issue into a structured TASK.md or SPEC.md. Supports execution mode (Guide / AI Exec / Context) and experience level.',
  },
  {
    name: 'explain_code',
    desc: 'Generate WALKTHROUGH.md for a file or directory, tuned to any audience: AI agent, team, learner, or non-technical stakeholder.',
  },
  {
    name: 'optimize_markdown',
    desc: 'Run the 5-pass token optimizer on any markdown string or file. Strips boilerplate, deduplicates sections, compresses verbose phrasing — typically cuts 20–40% without losing meaning.',
  },
  {
    name: 'image_to_prompt',
    desc: 'Analyze an image and generate a precise recreation prompt for FLUX, Stable Diffusion, Midjourney, DALL-E, and Gemini, plus a negative prompt and tag list.',
  },
  {
    name: 'check_drift',
    desc: 'Detect where your docs have gone stale relative to the current codebase. Returns a list of sections that reference commands, files, or configs that no longer exist.',
  },
  {
    name: 'update_docs',
    desc: 'Patch stale sections in a doc file. Takes the drift report from check_drift and rewrites only the outdated parts, leaving everything else untouched.',
  },
];

const NPN_CONFIG = `{
  "mcpServers": {
    "mdpilot": {
      "command": "npx",
      "args": ["-y", "mdpilot-mcp"],
      "env": {
        "GROQ_API_KEY": "gsk_..."
      }
    }
  }
}`;

const SOURCE_CONFIG = `{
  "mcpServers": {
    "mdpilot": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp/dist/index.js"],
      "env": {
        "GROQ_API_KEY": "gsk_..."
      }
    }
  }
}`;

const BUILD_COMMANDS = `cd packages/mcp
npm install
npm run build
# produces: packages/mcp/dist/index.js`;

const CLAUDE_CODE_CLI = `claude mcp add mdpilot \\
  -e GROQ_API_KEY=gsk_... \\
  -- npx -y mdpilot-mcp`;

export default function McpSetupPage() {
  return (
    <div className="max-w-2xl">

      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="section-label w-fit">MCP server</div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#34D399]/12 text-[#34D399]/75 border border-[#34D399]/20">
            live
          </span>
        </div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black text-white tracking-[-0.04em] mb-3 leading-tight">
          MDPilot MCP server — setup
        </h1>
        <p className="text-white/45 text-[15px] leading-relaxed">
          Run MDPilot as an MCP server so your AI agent can generate files, check drift, and optimize
          markdown directly from inside your IDE — without leaving the conversation.
        </p>
      </div>

      {/* On-page nav */}
      <nav aria-label="Page sections" className="mb-10 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-3">On this page</p>
        <ol className="space-y-1.5">
          {[
            ['what-it-is', 'What it is'],
            ['prerequisites', 'Prerequisites'],
            ['install', 'Install & configure'],
            ['tools', 'The 8 tools'],
            ['quick-start', 'Quick start'],
            ['feedback', 'Feedback'],
          ].map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="text-[13px] text-white/40 hover:text-[#4FACFF]/80 transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1. What it is */}
      <DocSection id="what-it-is">
        <h2 className="text-[16px] font-bold text-white mb-3">What it is</h2>
        <p className="text-white/50 text-[14px] leading-relaxed">
          MDPilot runs as an MCP (Model Context Protocol) server, which means your AI agent can call it as
          a tool directly from Claude Code, Cursor, Windsurf, or Goose — without opening a browser. The key
          advantage: the server reads your actual repo on disk, so generated AGENTS.md, CLAUDE.md, and TASK.md
          files reference real scripts, real file paths, and real dependencies — never guesses.
        </p>
      </DocSection>

      {/* 2. Prerequisites */}
      <DocSection id="prerequisites">
        <h2 className="text-[16px] font-bold text-white mb-3">Prerequisites</h2>
        <ul className="space-y-2.5 mb-5">
          <li className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[#4FACFF]/12 border border-[#4FACFF]/25 flex items-center justify-center text-[9px] font-mono font-bold text-[#4FACFF]/70">
              1
            </span>
            <div>
              <p className="text-[13px] font-semibold text-white/80 mb-0.5">Node.js 20+</p>
              <p className="text-[12px] text-white/40 leading-relaxed">
                Check with <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">node --version</code>.
                The MCP server is ESM and requires Node 20 or later.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[#4FACFF]/12 border border-[#4FACFF]/25 flex items-center justify-center text-[9px] font-mono font-bold text-[#4FACFF]/70">
              2
            </span>
            <div>
              <p className="text-[13px] font-semibold text-white/80 mb-1">An AI API key — any one of these</p>
              <div className="space-y-2 mb-2">
                {[
                  {
                    key: 'GROQ_API_KEY',
                    label: 'Groq',
                    badge: 'free tier',
                    badgeColor: '#34D399',
                    url: 'https://console.groq.com',
                    urlLabel: 'console.groq.com',
                    note: 'Llama 3.3 70B — fast, generous free tier, recommended.',
                  },
                  {
                    key: 'NVIDIA_API_KEY',
                    label: 'NVIDIA NIM',
                    badge: 'free tier',
                    badgeColor: '#34D399',
                    url: 'https://build.nvidia.com',
                    urlLabel: 'build.nvidia.com',
                    note: 'Llama 3.3 70B via NVIDIA API catalog.',
                  },
                  {
                    key: 'ANTHROPIC_API_KEY',
                    label: 'Anthropic',
                    badge: 'paid',
                    badgeColor: '#CC785C',
                    url: 'https://console.anthropic.com',
                    urlLabel: 'console.anthropic.com',
                    note: 'Claude 3.5 Haiku.',
                  },
                  {
                    key: 'OPENAI_API_KEY',
                    label: 'OpenAI',
                    badge: 'paid',
                    badgeColor: '#CC785C',
                    url: 'https://platform.openai.com',
                    urlLabel: 'platform.openai.com',
                    note: 'GPT-4o.',
                  },
                ].map(({ key, label, badge, badgeColor, url, urlLabel, note }) => (
                  <div key={key} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.025] border border-white/[0.05]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <code className="text-[11px] font-mono text-[#4FACFF]/70">{key}</code>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border"
                          style={{
                            color: `${badgeColor}cc`,
                            backgroundColor: `${badgeColor}15`,
                            borderColor: `${badgeColor}30`,
                          }}
                        >
                          {badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        {note}{' '}
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#4FACFF]/50 hover:text-[#4FACFF] transition-colors">
                          {urlLabel} →
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed">
                The server tries keys in this order: Groq → NVIDIA → Anthropic → OpenAI. Set exactly one.
                Calls are billed to your key — MDPilot does not proxy them.
              </p>
            </div>
          </li>
        </ul>

        {/* No-key note */}
        <div className="p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-[12px] text-white/50 leading-relaxed">
            <span className="text-white/70 font-semibold">No key?</span>{' '}
            The three non-AI tools —{' '}
            <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">analyze_project</code>,{' '}
            <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">optimize_markdown</code>, and{' '}
            <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">check_drift</code>{' '}
            — work without any key. Only the generation tools need one.
          </p>
        </div>
      </DocSection>

      {/* 3. Install + configure */}
      <DocSection id="install">
        <h2 className="text-[16px] font-bold text-white mb-1">Install &amp; configure</h2>
        <p className="text-[13px] text-white/40 mb-5 leading-relaxed">
          Two methods — npx is the recommended one-liner. From source is for contributors or local dev.
        </p>

        {/* ── Fastest setup callout ─────────────────────────────────────────── */}
        <div className="mb-8 p-5 rounded-2xl border border-[#34D399]/[0.22] bg-[#34D399]/[0.04] relative overflow-hidden">
          {/* Soft glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#34D399]/[0.06] to-transparent pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399]/80 border border-[#34D399]/25">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 2L4.09 12.97 11 13l-1 9 8.91-10.97H12L13 2z" />
                </svg>
                Fastest setup
              </span>
            </div>

            <p className="text-[14px] font-medium text-white/80 leading-snug mb-1">
              One command — detects your editor, gets you a free key, writes the config.
            </p>
            <p className="text-[12px] text-white/40 leading-relaxed mb-4">
              No account on MDPilot. No billing. Your key stays on your machine.
            </p>

            {/* Command */}
            <div className="rounded-xl border border-white/[0.08] bg-[#060612] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]/40" />
                  <span className="text-[10px] font-mono text-white/25 tracking-wide">terminal</span>
                </div>
                <CopyButton text="npx -y mdpilot-mcp setup" variant="docs" />
              </div>
              <pre className="px-4 py-3 text-[13px] font-mono leading-relaxed text-[#34D399]/80 whitespace-pre">
                <code><span className="text-white/25">$</span> npx -y mdpilot-mcp setup</code>
              </pre>
            </div>

            <p className="mt-3 text-[11px] text-white/30 leading-relaxed">
              Runs interactively — walks you through getting a free{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                className="text-[#34D399]/50 hover:text-[#34D399] transition-colors">Groq key</a>
              {' '}and registers the server for your editor.
              Or pass flags to skip prompts:{' '}
              <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/45">
                --key gsk_… --client claude
              </code>
            </p>
          </div>
        </div>

        <p className="text-[11px] font-mono text-white/20 uppercase tracking-widest mb-5">
          Manual setup
        </p>

        {/* Method A */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold text-white/50 bg-white/[0.05] border border-white/[0.09] px-2 py-0.5 rounded">
              Method A
            </span>
            <span className="text-[12px] text-white/50 font-medium">npx</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#34D399]/12 text-[#34D399]/70 border border-[#34D399]/20">
              recommended
            </span>
          </div>
          <p className="text-[12px] text-white/35 mb-3 leading-relaxed">
            Add this block to your client&apos;s MCP config file. Replace{' '}
            <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-[#4FACFF]/70">gsk_...</code>
            {' '}with your actual Groq key (or swap the env key for whichever provider you use). No install step — npx pulls the package automatically.
          </p>
          <CodeBlock label="mcp config (Method A — npx)">{NPN_CONFIG}</CodeBlock>
        </div>

        {/* Method B */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold text-white/50 bg-white/[0.05] border border-white/[0.09] px-2 py-0.5 rounded">
              Method B
            </span>
            <span className="text-[12px] text-white/50 font-medium">From source</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.07] text-white/30 border border-white/[0.09]">
              contributors / local dev
            </span>
          </div>
          <p className="text-[12px] text-white/35 mb-3 leading-relaxed">
            Build the package first, then point the config at the compiled output.
          </p>
          <CodeBlock label="1. Build from source">{BUILD_COMMANDS}</CodeBlock>
          <div className="mt-3">
            <CodeBlock label="2. mcp config (Method B — from source)">{SOURCE_CONFIG}</CodeBlock>
          </div>
          <p className="text-[12px] text-white/35 mt-2">
            Replace <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/50">/absolute/path/to/packages/mcp/dist/index.js</code> with
            the actual absolute path on your machine.
          </p>
        </div>

        {/* Per-client steps */}
        <h3 className="text-[14px] font-bold text-white mb-4">Per-client setup</h3>
        <div className="space-y-4">

          {/* Claude Code */}
          <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#CC785C]/70" />
              <span className="text-[13px] font-semibold text-white/75">Claude Code</span>
            </div>
            <p className="text-[12px] text-white/40 mb-3">
              Use the CLI shortcut or add the JSON config to{' '}
              <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">~/.claude/mcp.json</code>.
            </p>
            <CodeBlock label="Claude Code CLI">{CLAUDE_CODE_CLI}</CodeBlock>
            <div className="mt-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <p className="text-[11px] text-white/40 leading-relaxed">
                <span className="text-white/60 font-semibold">Switching from local path to npx?</span>{' '}
                Run the CLI command above — it re-registers the connector under the same name{' '}
                <code className="text-[10px] font-mono bg-white/[0.06] px-1 rounded text-white/55">mdpilot</code>.
                Claude reconnects automatically; no need to rename it in the Connectors panel.
              </p>
            </div>
            <a
              href="https://docs.anthropic.com/en/docs/claude-code/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#4FACFF]/50 hover:text-[#4FACFF]/80 transition-colors"
            >
              Claude Code MCP docs →
            </a>
          </div>

          {/* Cursor */}
          <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#CDD6F4]/50" />
              <span className="text-[13px] font-semibold text-white/75">Cursor</span>
            </div>
            <p className="text-[12px] text-white/40 mb-1">
              Open Cursor Settings → MCP → Add new server. Paste the JSON config block from Method A above.
            </p>
            <a
              href="https://docs.cursor.com/context/model-context-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#4FACFF]/50 hover:text-[#4FACFF]/80 transition-colors"
            >
              Cursor MCP docs →
            </a>
          </div>

          {/* Windsurf */}
          <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]/70" />
              <span className="text-[13px] font-semibold text-white/75">Windsurf</span>
            </div>
            <p className="text-[12px] text-white/40 mb-1">
              Open Windsurf Settings → Cascade → MCP Servers. Add a new entry using the JSON config block from Method A above.
            </p>
            <a
              href="https://docs.windsurf.com/windsurf/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#4FACFF]/50 hover:text-[#4FACFF]/80 transition-colors"
            >
              Windsurf MCP docs →
            </a>
          </div>

          {/* Goose */}
          <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]/70" />
              <span className="text-[13px] font-semibold text-white/75">Goose</span>
            </div>
            <p className="text-[12px] text-white/40 mb-1">
              Add MDPilot as a stdio extension: set type to{' '}
              <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">stdio</code>,
              command to{' '}
              <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">npx</code>,
              args to{' '}
              <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">["-y", "mdpilot-mcp"]</code>,
              and env to your AI provider key (e.g.{' '}
              <code className="text-[11px] font-mono bg-white/[0.06] px-1 rounded text-white/55">GROQ_API_KEY</code>).
            </p>
            <a
              href="https://block.github.io/goose/docs/tutorials/custom-extensions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#4FACFF]/50 hover:text-[#4FACFF]/80 transition-colors"
            >
              Goose MCP extensions docs →
            </a>
          </div>

        </div>
      </DocSection>

      {/* 4. Tools */}
      <DocSection id="tools">
        <h2 className="text-[16px] font-bold text-white mb-4">The 8 tools</h2>
        <div className="space-y-2">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.name}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.09] transition-all duration-150"
            >
              <span className="shrink-0 text-[9px] font-mono font-bold text-white/20 mt-0.5 w-4 text-right">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <code className="text-[12px] font-mono font-semibold text-[#4FACFF]/75 break-all">
                  {tool.name}
                </code>
                <p className="text-[12px] text-white/40 leading-relaxed mt-0.5">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* 5. Quick start */}
      <DocSection id="quick-start">
        <h2 className="text-[16px] font-bold text-white mb-3">Quick start — try it in 60 seconds</h2>
        <p className="text-[13px] text-white/45 mb-4 leading-relaxed">
          Once the server is configured, open any repo in your IDE and try these two prompts:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-[#4FACFF]/[0.15] bg-[#4FACFF]/[0.04]">
            <p className="text-[10px] font-mono text-[#4FACFF]/50 uppercase tracking-wider mb-2">Prompt 1</p>
            <p className="text-[13px] text-white/75 leading-relaxed font-mono">
              &quot;Use mdpilot to generate an AGENTS.md for this project and write it to disk.&quot;
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[#2DD4BF]/[0.15] bg-[#2DD4BF]/[0.04]">
            <p className="text-[10px] font-mono text-[#2DD4BF]/50 uppercase tracking-wider mb-2">Prompt 2</p>
            <p className="text-[13px] text-white/75 leading-relaxed font-mono">
              &quot;Use mdpilot to check my docs for drift.&quot;
            </p>
          </div>
        </div>
        <p className="text-[12px] text-white/30 mt-4 leading-relaxed">
          The first prompt calls <code className="font-mono text-white/45 text-[11px]">analyze_project</code> then{' '}
          <code className="font-mono text-white/45 text-[11px]">generate_md_file</code> with verified mode.
          The second calls <code className="font-mono text-white/45 text-[11px]">check_drift</code> and surfaces
          any stale sections — follow up with{' '}
          <code className="font-mono text-white/45 text-[11px]">update_docs</code> to patch them.
        </p>
      </DocSection>

      {/* 6. Feedback */}
      <section id="feedback" className="scroll-mt-24 pt-10">
        <div className="p-5 rounded-xl border border-[#A855F7]/[0.18] bg-[#A855F7]/[0.04]">
          <h2 className="text-[14px] font-bold text-white/80 mb-2">Found a bug or have feedback?</h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-3">
            This is a pre-launch tester build. If something breaks or you have suggestions, we want to know.
          </p>
          <a
            href="https://github.com/adgenie1434-glitch/md-pilot/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#A855F7]/70 hover:text-[#A855F7] transition-colors font-medium"
          >
            Report an issue or share feedback →
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>

        {/* Back to docs */}
        <div className="mt-8 pt-6 border-t border-white/[0.05]">
          <Link
            href="/docs"
            className="text-[12px] font-mono text-white/25 hover:text-white/50 transition-colors"
          >
            ← Back to docs
          </Link>
        </div>
      </section>

    </div>
  );
}
