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
    <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-bg)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--md-border)] bg-[var(--md-surface)]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-accent)]/40" />
          {label && <span className="text-[10px] font-mono text-[var(--md-text-tertiary)] tracking-wide">{label}</span>}
        </div>
        <CopyButton text={children} variant="docs" />
      </div>
      <pre className="p-4 text-[12.5px] font-mono leading-relaxed overflow-x-auto text-[var(--md-text-secondary)] whitespace-pre">
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
      <div className="mt-8 border-b border-[var(--md-border)]" />
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
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] bg-[var(--md-go)]/12 text-[var(--md-go)]/75 border border-[var(--md-go)]/20">
            live
          </span>
        </div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          MDPilot MCP server — setup
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          Run MDPilot as an MCP server so your AI agent can generate files, check drift, and optimize
          markdown directly from inside your IDE — without leaving the conversation.
        </p>
      </div>

      {/* On-page nav */}
      <nav aria-label="Page sections" className="mb-10 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <p className="text-[10px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-3">On this page</p>
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
                className="text-[13px] text-[var(--md-text-secondary)] hover:text-[var(--md-accent)] transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1. What it is */}
      <DocSection id="what-it-is">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-3">What it is</h2>
        <p className="text-[var(--md-text-secondary)] text-[14px] leading-relaxed">
          MDPilot runs as an MCP (Model Context Protocol) server, which means your AI agent can call it as
          a tool directly from Claude Code, Cursor, Windsurf, or Goose — without opening a browser. The key
          advantage: the server reads your actual repo on disk, so generated AGENTS.md, CLAUDE.md, and TASK.md
          files reference real scripts, real file paths, and real dependencies — never guesses.
        </p>
      </DocSection>

      {/* 2. Prerequisites */}
      <DocSection id="prerequisites">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-3">Prerequisites</h2>
        <ul className="space-y-2.5 mb-5">
          <li className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--md-surface)] border border-[var(--md-border)]">
            <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[var(--md-accent)]/12 border border-[var(--md-accent)]/25 flex items-center justify-center text-[9px] font-mono font-bold text-[var(--md-accent)]/70">
              1
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-0.5">Node.js 20+</p>
              <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed">
                Check with <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">node --version</code>.
                The MCP server is ESM and requires Node 20 or later.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--md-surface)] border border-[var(--md-border)]">
            <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[var(--md-accent)]/12 border border-[var(--md-accent)]/25 flex items-center justify-center text-[9px] font-mono font-bold text-[var(--md-accent)]/70">
              2
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-1">An AI API key — any one of these</p>
              <div className="space-y-2 mb-2">
                {[
                  {
                    key: 'GROQ_API_KEY',
                    label: 'Groq',
                    badge: 'free tier',
                    badgeColor: 'var(--md-go)',
                    url: 'https://console.groq.com',
                    urlLabel: 'console.groq.com',
                    note: 'Llama 3.3 70B — fast, generous free tier, recommended.',
                  },
                  {
                    key: 'NVIDIA_API_KEY',
                    label: 'NVIDIA NIM',
                    badge: 'free tier',
                    badgeColor: 'var(--md-go)',
                    url: 'https://build.nvidia.com',
                    urlLabel: 'build.nvidia.com',
                    note: 'Llama 3.3 70B via NVIDIA API catalog.',
                  },
                  {
                    key: 'ANTHROPIC_API_KEY',
                    label: 'Anthropic',
                    badge: 'paid',
                    badgeColor: 'var(--md-accent)',
                    url: 'https://console.anthropic.com',
                    urlLabel: 'console.anthropic.com',
                    note: 'Claude 3.5 Haiku.',
                  },
                  {
                    key: 'OPENAI_API_KEY',
                    label: 'OpenAI',
                    badge: 'paid',
                    badgeColor: 'var(--md-accent)',
                    url: 'https://platform.openai.com',
                    urlLabel: 'platform.openai.com',
                    note: 'GPT-4o.',
                  },
                ].map(({ key, label, badge, badgeColor, url, urlLabel, note }) => (
                  <div key={key} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--md-surface)] border border-[var(--md-border)]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <code className="text-[11px] font-mono text-[var(--md-accent)]/70">{key}</code>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] border"
                          style={{
                            color: badgeColor,
                            backgroundColor: `color-mix(in srgb, ${badgeColor} 8%, transparent)`,
                            borderColor: `color-mix(in srgb, ${badgeColor} 25%, transparent)`,
                          }}
                        >
                          {badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--md-text-tertiary)] leading-relaxed">
                        {note}{' '}
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--md-accent)]/80 hover:text-[var(--md-accent)] transition-colors">
                          {urlLabel} →
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--md-text-tertiary)] leading-relaxed">
                The server tries keys in this order: Groq → NVIDIA → Anthropic → OpenAI. Set exactly one.
                Calls are billed to your key — MDPilot does not proxy them.
              </p>
            </div>
          </li>
        </ul>

        {/* No-key note */}
        <div className="p-3.5 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
          <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
            <span className="text-[var(--md-text-secondary)] font-semibold">No key?</span>{' '}
            The three non-AI tools —{' '}
            <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">analyze_project</code>,{' '}
            <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">optimize_markdown</code>, and{' '}
            <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">check_drift</code>{' '}
            — work without any key. Only the generation tools need one.
          </p>
        </div>
      </DocSection>

      {/* 3. Install + configure */}
      <DocSection id="install">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-1">Install &amp; configure</h2>
        <p className="text-[13px] text-[var(--md-text-secondary)] mb-5 leading-relaxed">
          Two methods — npx is the recommended one-liner. From source is for contributors or local dev.
        </p>

        {/* ── Fastest setup callout ─────────────────────────────────────────── */}
        <div className="mb-8 p-5 rounded-2xl border border-[var(--md-go)]/[0.22] bg-[var(--md-go)]/[0.04] relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-[5px] bg-[var(--md-go)]/15 text-[var(--md-go)]/80 border border-[var(--md-go)]/25">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 2L4.09 12.97 11 13l-1 9 8.91-10.97H12L13 2z" />
                </svg>
                Fastest setup
              </span>
            </div>

            <p className="text-[14px] font-medium text-[var(--md-text-secondary)] leading-snug mb-1">
              One command — detects your editor, gets you a free API key, writes the config.
            </p>
            <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mb-1">
              Bring your own key or get a free one: works with <strong className="text-[var(--md-text-secondary)]">Groq</strong> (free), <strong className="text-[var(--md-text-secondary)]">NVIDIA NIM</strong> (free), <strong className="text-[var(--md-text-secondary)]">Anthropic (Claude)</strong>, or <strong className="text-[var(--md-text-secondary)]">OpenAI</strong>.
            </p>
            <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mb-4">
              No account on MDPilot. No billing. Your key stays on your machine.
            </p>

            {/* Command */}
            <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-bg)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--md-border)] bg-[var(--md-surface)]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-go)]/40" />
                  <span className="text-[10px] font-mono text-[var(--md-text-tertiary)] tracking-wide">terminal</span>
                </div>
                <CopyButton text="npx -y mdpilot-mcp setup" variant="docs" />
              </div>
              <pre className="px-4 py-3 text-[13px] font-mono leading-relaxed text-[var(--md-go)]/80 whitespace-pre">
                <code><span className="text-[var(--md-text-tertiary)]">$</span> npx -y mdpilot-mcp setup</code>
              </pre>
            </div>

            <p className="mt-3 text-[11px] text-[var(--md-text-tertiary)] leading-relaxed">
              Runs interactively — walks you through getting a free{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                className="text-[var(--md-go)]/80 hover:text-[var(--md-go)] transition-colors">Groq key</a>
              {' '}and registers the server for your editor.
              Or pass flags to skip prompts:{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-tertiary)]">
                --key gsk_… --client claude
              </code>
            </p>
          </div>
        </div>

        <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-widest mb-5">
          Manual setup
        </p>

        {/* Method A */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold text-[var(--md-text-tertiary)] bg-[var(--md-surface-2)] border border-[var(--md-border)] px-2 py-0.5 rounded">
              Method A
            </span>
            <span className="text-[12px] text-[var(--md-text-tertiary)] font-medium">npx</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] bg-[var(--md-go)]/12 text-[var(--md-go)]/70 border border-[var(--md-go)]/20">
              recommended
            </span>
          </div>
          <p className="text-[13px] text-[var(--md-text-secondary)] mb-3 leading-relaxed">
            Add this block to your client&apos;s MCP config file. Replace{' '}
            <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-accent)]/70">gsk_...</code>
            {' '}with your actual Groq key (or swap the env key for whichever provider you use). No install step — npx pulls the package automatically.
          </p>
          <CodeBlock label="mcp config (Method A — npx)">{NPN_CONFIG}</CodeBlock>
        </div>

        {/* Method B */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold text-[var(--md-text-tertiary)] bg-[var(--md-surface-2)] border border-[var(--md-border)] px-2 py-0.5 rounded">
              Method B
            </span>
            <span className="text-[12px] text-[var(--md-text-tertiary)] font-medium">From source</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] bg-[var(--md-surface-2)] text-[var(--md-text-tertiary)] border border-[var(--md-border)]">
              contributors / local dev
            </span>
          </div>
          <p className="text-[13px] text-[var(--md-text-secondary)] mb-3 leading-relaxed">
            Build the package first, then point the config at the compiled output.
          </p>
          <CodeBlock label="1. Build from source">{BUILD_COMMANDS}</CodeBlock>
          <div className="mt-3">
            <CodeBlock label="2. mcp config (Method B — from source)">{SOURCE_CONFIG}</CodeBlock>
          </div>
          <p className="text-[13px] text-[var(--md-text-secondary)] mt-2">
            Replace <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-tertiary)]">/absolute/path/to/packages/mcp/dist/index.js</code> with
            the actual absolute path on your machine.
          </p>
        </div>

        {/* Per-client steps */}
        <h3 className="text-[14px] font-semibold text-[var(--md-text)] mb-4">Per-client setup</h3>
        <div className="space-y-4">

          {/* Claude Code */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--md-accent)]/70" />
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Claude Code</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] mb-3">
              Use the CLI shortcut or add the JSON config to{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">~/.claude/mcp.json</code>.
            </p>
            <CodeBlock label="Claude Code CLI">{CLAUDE_CODE_CLI}</CodeBlock>
            <div className="mt-3 p-3 rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)]">
              <p className="text-[11px] text-[var(--md-text-tertiary)] leading-relaxed">
                <span className="text-[var(--md-text-secondary)] font-semibold">Switching from local path to npx?</span>{' '}
                Run the CLI command above — it re-registers the connector under the same name{' '}
                <code className="text-[10px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">mdpilot</code>.
                Claude reconnects automatically; no need to rename it in the Connectors panel.
              </p>
            </div>
            <a
              href="https://docs.anthropic.com/en/docs/claude-code/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[11px] text-[var(--md-accent)]/80 hover:text-[var(--md-accent)] transition-colors"
            >
              Claude Code MCP docs →
            </a>
          </div>

          {/* Cursor */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--md-text)]/50" />
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Cursor</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] mb-1">
              Open Cursor Settings → MCP → Add new server. Paste the JSON config block from Method A above.
            </p>
            <a
              href="https://docs.cursor.com/context/model-context-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[var(--md-accent)]/80 hover:text-[var(--md-accent)] transition-colors"
            >
              Cursor MCP docs →
            </a>
          </div>

          {/* Windsurf */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--md-go)]/70" />
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Windsurf</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] mb-1">
              Open Windsurf Settings → Cascade → MCP Servers. Add a new entry using the JSON config block from Method A above.
            </p>
            <a
              href="https://docs.windsurf.com/windsurf/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[var(--md-accent)]/80 hover:text-[var(--md-accent)] transition-colors"
            >
              Windsurf MCP docs →
            </a>
          </div>

          {/* Goose */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--md-accent)]/70" />
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Goose</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] mb-1">
              Add MDPilot as a stdio extension: set type to{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">stdio</code>,
              command to{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">npx</code>,
              args to{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">["-y", "mdpilot-mcp"]</code>,
              and env to your AI provider key (e.g.{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">GROQ_API_KEY</code>).
            </p>
            <a
              href="https://block.github.io/goose/docs/tutorials/custom-extensions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[var(--md-accent)]/80 hover:text-[var(--md-accent)] transition-colors"
            >
              Goose MCP extensions docs →
            </a>
          </div>

        </div>
      </DocSection>

      {/* 4. Tools */}
      <DocSection id="tools">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-4">The 8 tools</h2>
        <div className="space-y-2">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.name}
              className="flex items-start gap-4 p-4 rounded-xl bg-[var(--md-surface)] border border-[var(--md-border)] hover:bg-[var(--md-surface-2)] hover:border-[var(--md-border)] transition-all duration-150"
            >
              <span className="shrink-0 text-[9px] font-mono font-bold text-[var(--md-text-tertiary)] mt-0.5 w-4 text-right">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <code className="text-[12px] font-mono font-semibold text-[var(--md-accent)]/75 break-all">
                  {tool.name}
                </code>
                <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mt-0.5">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* 5. Quick start */}
      <DocSection id="quick-start">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-3">Quick start — try it in 60 seconds</h2>
        <p className="text-[14px] text-[var(--md-text-secondary)] mb-5 leading-relaxed">
          Once the server is configured, open any repo in your IDE and try these prompts. Copy and paste them directly into Claude Code, Cursor, or Windsurf.
        </p>
        <div className="space-y-3">
          {[
            {
              label: 'Generate instruction files',
              accent: 'var(--md-accent)',
              prompt: '"Use mdpilot to analyze this project and generate an AGENTS.md. Write it to disk."',
              note: 'Calls analyze_project → generate_md_file. References your real scripts and paths.',
            },
            {
              label: 'Turn a task into a prompt',
              accent: 'var(--md-accent)',
              prompt: '"Use mdpilot to turn this ticket into a TASK.md: [paste your ticket here]"',
              note: 'Calls generate_task_file. Pick execution mode: Guide, AI Exec, or Context.',
            },
            {
              label: 'Explain this codebase',
              accent: 'var(--md-info)',
              prompt: '"Use mdpilot to generate a WALKTHROUGH.md for src/lib/auth.ts tuned for a new team member."',
              note: 'Calls explain_code. Audience options: ai_agent, team, learner, non_technical.',
            },
            {
              label: 'Check for stale docs',
              accent: 'var(--md-go)',
              prompt: '"Use mdpilot to check my docs for drift, then patch any stale sections."',
              note: 'Calls check_drift → update_docs. Only rewrites outdated parts.',
            },
          ].map(({ label, accent, prompt, note }) => (
            <div
              key={label}
              className="p-4 rounded-xl border"
              style={{
                borderColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
                background: `color-mix(in srgb, ${accent} 3%, transparent)`,
              }}
            >
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: `${accent}80` }}>
                {label}
              </p>
              <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed font-mono mb-2">
                {prompt}
              </p>
              <p className="text-[11px] text-[var(--md-text-tertiary)] leading-relaxed">{note}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* 6. Feedback */}
      <section id="feedback" className="scroll-mt-24 pt-10">
        <div className="p-5 rounded-xl border border-[var(--md-info)]/[0.18] bg-[var(--md-info)]/[0.04]">
          <h2 className="text-[14px] font-semibold text-[var(--md-text-secondary)] mb-2">Found a bug or have feedback?</h2>
          <p className="text-[14px] text-[var(--md-text-secondary)] leading-relaxed mb-3">
            This is a pre-launch tester build. If something breaks or you have suggestions, we want to know.
          </p>
          <a
            href="https://github.com/get-mdpilot/Feedback/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--md-info)]/70 hover:text-[var(--md-info)] transition-colors font-medium"
          >
            Report an issue or share feedback →
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>

        {/* Back to docs */}
        <div className="mt-8 pt-6 border-t border-[var(--md-border)]">
          <Link
            href="/docs"
            className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors"
          >
            ← Back to docs
          </Link>
        </div>
      </section>

    </div>
  );
}
