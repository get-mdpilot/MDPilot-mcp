import type { Metadata } from 'next';
import Link from 'next/link';
import { CopyButton } from '@/components/CopyButton';

export const metadata: Metadata = {
  title: 'MDPilot VS Code Extension — setup',
  description:
    'Install the MDPilot extension for VS Code, Cursor, and Windsurf. Generate AGENTS.md, CLAUDE.md, and task prompts directly from the command palette — no JSON config required.',
};

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

function DocSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-10 first:pt-0">
      {children}
      <div className="mt-8 border-b border-[var(--md-border)]" />
    </section>
  );
}

const COMMANDS = [
  { cmd: 'MDPilot: Generate AGENTS.md', desc: 'Reads your repo, generates a verified AGENTS.md, opens it in the editor.' },
  { cmd: 'MDPilot: Generate CLAUDE.md', desc: 'Generates CLAUDE.md for Claude Code / Cursor — with real build commands.' },
  { cmd: 'MDPilot: Generate README.md', desc: 'Professional README grounded in your actual stack and scripts.' },
  { cmd: 'MDPilot: Generate Task Prompt', desc: 'Paste a ticket or Slack thread → writes TASK.md with repo context pre-filled.' },
  { cmd: 'MDPilot: Check Docs for Drift', desc: 'Scans AGENTS.md and CLAUDE.md for stale commands, missing files, and outdated sections.' },
  { cmd: 'MDPilot: Save Session Context', desc: 'Summarise your current session and save to .mdpilot-context.json.' },
  { cmd: 'MDPilot: Load Session Context', desc: 'Shows the last saved context in an output channel — paste into your next AI session.' },
  { cmd: 'MDPilot: Setup', desc: 'Opens the setup docs and API key configuration.' },
];

export default function VsCodeDocsPage() {
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="section-label w-fit">VS Code extension</div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] bg-[var(--md-go)]/12 text-[var(--md-go)]/75 border border-[var(--md-go)]/20">
            live
          </span>
        </div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          MDPilot for VS Code, Cursor &amp; Windsurf
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          A native editor extension that surfaces MDPilot in your command palette, activity bar, and status bar.
          No JSON config. No MCP setup. Install and press <kbd className="text-[12px] font-mono bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1.5 py-0.5 rounded text-[var(--md-text-secondary)]">Ctrl+Shift+P</kbd>.
        </p>
      </div>

      {/* On-page nav */}
      <nav aria-label="Page sections" className="mb-10 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <p className="text-[10px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-3">On this page</p>
        <ol className="space-y-1.5">
          {[
            ['install', 'Install'],
            ['api-key', 'API key'],
            ['commands', 'Commands'],
            ['settings', 'Settings'],
            ['vs-mcp', 'Extension vs MCP server'],
            ['feedback', 'Feedback'],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="text-[13px] text-[var(--md-text-secondary)] hover:text-[var(--md-accent)] transition-colors">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Install */}
      <DocSection id="install">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-3">Install</h2>

        <div className="space-y-4">
          {/* Marketplace */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--md-accent)]/70" />
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">VS Code Marketplace</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] bg-[var(--md-go)]/12 text-[var(--md-go)]/70 border border-[var(--md-go)]/20">recommended</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] mb-3 leading-relaxed">
              Search <strong className="text-[var(--md-text)]">MDPilot</strong> in the Extensions panel (<kbd className="text-[12px] font-mono bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1 py-0.5 rounded">Ctrl+Shift+X</kbd>) and click Install.
              Works in VS Code, Cursor, and Windsurf — all three read from the VS Code Marketplace.
            </p>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=get-mdpilot.mdpilot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[var(--md-accent)]/80 hover:text-[var(--md-accent)] transition-colors"
            >
              marketplace.visualstudio.com/items?itemName=get-mdpilot.mdpilot →
            </a>
          </div>

          {/* CLI */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--md-text)]/40" />
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Command line</span>
            </div>
            <div className="space-y-2">
              <CodeBlock label="VS Code">{`code --install-extension get-mdpilot.mdpilot`}</CodeBlock>
              <CodeBlock label="Cursor">{`cursor --install-extension get-mdpilot.mdpilot`}</CodeBlock>
            </div>
            <p className="text-[11px] text-[var(--md-text-tertiary)] mt-2 leading-relaxed">
              If <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded">cursor</code> isn&apos;t in PATH: open Cursor →{' '}
              <kbd className="text-[11px] font-mono bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1 py-0.5 rounded">Cmd+Shift+P</kbd> →{' '}
              <em>Shell Command: Install &apos;cursor&apos; command in PATH</em>.
            </p>
          </div>

          {/* VSIX */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--md-text)]/40" />
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Install from .vsix (offline)</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed">
              Extensions panel → <strong className="text-[var(--md-text)]">•••</strong> menu → <em>Install from VSIX…</em> → select the file.
            </p>
          </div>
        </div>
      </DocSection>

      {/* API key */}
      <DocSection id="api-key">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-3">API key</h2>
        <p className="text-[14px] text-[var(--md-text-secondary)] mb-5 leading-relaxed">
          The extension calls the same AI provider as the MCP server. Groq is free — takes 60 seconds to get a key.
        </p>

        <div className="space-y-3">
          {/* Option 1 — Settings */}
          <div className="p-4 rounded-xl border border-[var(--md-go)]/[0.22] bg-[var(--md-go)]/[0.04]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-go)]/70 mb-2">Option 1 — VS Code settings (persists across projects)</p>
            <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mb-2">
              <kbd className="text-[12px] font-mono bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1 py-0.5 rounded">Cmd+,</kbd> → search <strong className="text-[var(--md-text)]">MDPilot</strong> → paste your key in <strong className="text-[var(--md-text)]">mdpilot.apiKey</strong>.
            </p>
            <p className="text-[11px] text-[var(--md-text-tertiary)] leading-relaxed">
              Key is stored in VS Code&apos;s settings file — encrypted on most platforms. Never logged or transmitted to MDPilot servers.
            </p>
          </div>

          {/* Option 2 — env var */}
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-text-tertiary)] mb-2">Option 2 — environment variable (works automatically)</p>
            <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mb-3">
              If <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-accent)]/70">GROQ_API_KEY</code> (or <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-accent)]/70">ANTHROPIC_API_KEY</code> / <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-accent)]/70">OPENAI_API_KEY</code>) is already in your shell environment, the extension picks it up automatically — no settings change needed.
            </p>
            <CodeBlock label="~/.zshrc or ~/.bashrc">{`export GROQ_API_KEY="gsk_..."`}</CodeBlock>
          </div>

          {/* No key */}
          <div className="p-3.5 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
              <span className="text-[var(--md-text-secondary)] font-semibold">No key?</span>{' '}
              The first time you run a generation command, the extension prompts you — with a link to{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-[var(--md-accent)]/80 hover:text-[var(--md-accent)] transition-colors">console.groq.com/keys</a>{' '}
              to get a free Groq key in 60 seconds.
            </p>
          </div>
        </div>
      </DocSection>

      {/* Commands */}
      <DocSection id="commands">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-1">Commands</h2>
        <p className="text-[13px] text-[var(--md-text-secondary)] mb-5 leading-relaxed">
          All commands are available in the Command Palette (<kbd className="text-[12px] font-mono bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1 py-0.5 rounded">Ctrl+Shift+P</kbd> / <kbd className="text-[12px] font-mono bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1 py-0.5 rounded">Cmd+Shift+P</kbd>) and in the right-click context menu on any folder in the Explorer.
        </p>
        <div className="space-y-2">
          {COMMANDS.map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--md-surface)] border border-[var(--md-border)]">
              <span className="shrink-0 text-[9px] font-mono font-bold text-[var(--md-text-tertiary)] mt-0.5 w-4 text-right">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <code className="text-[12px] font-mono font-semibold text-[var(--md-accent)]/75">{c.cmd}</code>
                <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3.5 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
          <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
            <span className="text-[var(--md-text-secondary)] font-semibold">Status bar:</span>{' '}
            An MDPilot item appears in the bottom-right status bar. Click it to run a drift check. It shows a warning indicator when drift is detected.
          </p>
        </div>
      </DocSection>

      {/* Settings */}
      <DocSection id="settings">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-4">Settings</h2>
        <div className="space-y-2">
          {[
            {
              key: 'mdpilot.apiKey',
              type: 'string',
              default: '""',
              desc: 'Your AI provider key. Also read from GROQ_API_KEY / NVIDIA_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY environment variables.',
            },
            {
              key: 'mdpilot.provider',
              type: 'enum',
              default: '"groq"',
              desc: 'Provider to use: groq (default), nvidia, anthropic, openai. Groq and NVIDIA have free tiers.',
            },
            {
              key: 'mdpilot.autoCheckDrift',
              type: 'boolean',
              default: 'true',
              desc: 'Run a drift check automatically when a workspace folder is opened.',
            },
          ].map(s => (
            <div key={s.key} className="p-4 rounded-xl bg-[var(--md-surface)] border border-[var(--md-border)]">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[12px] font-mono text-[var(--md-accent)]/75">{s.key}</code>
                <span className="text-[9px] font-mono text-[var(--md-text-tertiary)] bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1.5 py-0.5 rounded">{s.type}</span>
                <span className="text-[10px] font-mono text-[var(--md-text-tertiary)]">default: {s.default}</span>
              </div>
              <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* Extension vs MCP */}
      <DocSection id="vs-mcp">
        <h2 className="text-[16px] font-semibold text-[var(--md-text)] mb-3">Extension vs MCP server — which should I use?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--md-border)]">
                <th className="text-left py-2 pr-4 text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider">Use case</th>
                <th className="text-left py-2 pr-4 text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider">Extension</th>
                <th className="text-left py-2 text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider">MCP server</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-border)]">
              {[
                ['No config — just install and go', '✓', '✗'],
                ['Works in VS Code, Cursor, Windsurf', '✓', '✓'],
                ['AI agent calls tools autonomously', '✗', '✓'],
                ['Command palette integration', '✓', '✗'],
                ['Status bar drift indicator', '✓', '✗'],
                ['Use inside Claude Code chat', '✗', '✓'],
                ['Requires JSON MCP config', '✗', '✓'],
              ].map(([label, ext, mcp]) => (
                <tr key={label}>
                  <td className="py-2.5 pr-4 text-[var(--md-text-secondary)]">{label}</td>
                  <td className="py-2.5 pr-4">
                    <span className={ext === '✓' ? 'text-[var(--md-go)]' : 'text-[var(--md-text-tertiary)]'}>{ext}</span>
                  </td>
                  <td className="py-2.5">
                    <span className={mcp === '✓' ? 'text-[var(--md-go)]' : 'text-[var(--md-text-tertiary)]'}>{mcp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-4 leading-relaxed">
          You can use both together. The extension is great for on-demand file generation; the MCP server lets your AI agent call MDPilot tools mid-conversation.
        </p>
      </DocSection>

      {/* Feedback */}
      <section id="feedback" className="scroll-mt-24 pt-10">
        <div className="p-5 rounded-xl border border-[var(--md-info)]/[0.18] bg-[var(--md-info)]/[0.04]">
          <h2 className="text-[14px] font-semibold text-[var(--md-text-secondary)] mb-2">Found a bug or have feedback?</h2>
          <p className="text-[14px] text-[var(--md-text-secondary)] leading-relaxed mb-3">
            File an issue on GitHub or leave a review on the Marketplace.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/get-mdpilot/MDPilot-mcp/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--md-info)]/70 hover:text-[var(--md-info)] transition-colors font-medium"
            >
              Report an issue →
            </a>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=get-mdpilot.mdpilot&ssr=false#review-details"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--md-accent)]/70 hover:text-[var(--md-accent)] transition-colors font-medium"
            >
              Leave a Marketplace review →
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--md-border)]">
          <Link href="/docs" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
            ← Back to docs
          </Link>
        </div>
      </section>

    </div>
  );
}
