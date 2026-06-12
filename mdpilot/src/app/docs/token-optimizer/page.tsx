import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How the token optimizer works — MDPilot docs',
  description:
    'MDPilot runs a 5-pass token optimizer on every generated file, cutting tokens by 20–40% without losing meaning. Learn how each pass works and why it matters for AI agent context and API cost.',
};

const PASSES = [
  {
    n: '1',
    name: 'Boilerplate strip',
    desc: 'Removes generic filler phrases that appear in AI-generated text but carry no information: phrases like "This project is a…", "In order to…", "Please note that…", "As mentioned above", and hedge words like "very", "basically", "essentially". These phrases are common in first-draft AI output and consume tokens without helping the reader.',
    example: {
      before: 'In order to install the dependencies, you need to first run `npm install`.',
      after: 'Run `npm install` to install dependencies.',
    },
  },
  {
    n: '2',
    name: 'Cross-file deduplication',
    desc: 'When you generate multiple files at once (e.g. AGENTS.md + CLAUDE.md + README), sections that appear in more than one file are replaced in lower-priority files with a short cross-reference. Similarity is measured with bigram matching — two sections with >60% overlap are considered duplicates. README is canonical; AGENTS, CLAUDE, CONTRIBUTING, SECURITY follow in priority order.',
    example: {
      before: 'CLAUDE.md has a full "Local setup" section identical to README.md.',
      after: '> See [README.md § Local setup](./README.md) for details on local setup.',
    },
  },
  {
    n: '3',
    name: 'Structure compression',
    desc: 'Cleans code block formatting: removes inline comments from fenced code blocks, strips blank lines immediately after opening fences and before closing fences. Also collapses 3+ consecutive blank lines to 2 and removes trailing whitespace per line. This pass does not change prose — only formatting.',
    example: null,
  },
  {
    n: '4',
    name: 'Verbose compression',
    desc: 'Replaces wordy multi-word phrases with their concise equivalents. Examples: "in order to" → "to", "due to the fact that" → "because", "prior to" → "before", "has the ability to" → "can", "it is important to note that" → (removed). Also collapses redundant pairs like "each and every" → "every", "first and foremost" → "first".',
    example: {
      before: 'Prior to running the tests, you need to ensure that the database has the ability to accept connections.',
      after: 'Before running the tests, ensure the database can accept connections.',
    },
  },
  {
    n: '5',
    name: 'Line compression',
    desc: 'Removes heading descriptions that just restate the heading (e.g. a paragraph immediately after "## Installation" that says "This section describes how to install the package"). Converts prose admonition prefixes ("Note: ", "Warning: ") to blockquote markers. Collapses multiple blank lines and removes trailing whitespace.',
    example: null,
  },
];

export default function TokenOptimizerPage() {
  return (
    <div className="max-w-2xl">

      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Concepts</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          Token optimizer
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          MDPilot runs a 5-pass optimizer on every generated file, typically cutting token counts by
          20–40% without losing meaning or information density.
        </p>
      </div>

      {/* Why it matters */}
      <div className="mb-8 p-5 rounded-xl border border-[var(--md-accent)]/[0.15] bg-[var(--md-accent)]/[0.03]">
        <h2 className="text-[14px] font-semibold text-[var(--md-text-secondary)] mb-2">Why it matters</h2>
        <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mb-2">
          AI agents read your generated files at the start of every conversation. A CLAUDE.md that is
          300 tokens shorter means roughly 300 fewer tokens consumed per session — across hundreds of
          sessions, that is significant API cost and context budget saved.
        </p>
        <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed">
          More importantly, models perform better with denser, more precise context. Boilerplate and
          filler phrases dilute the signal — stripping them improves comprehension, not just efficiency.
        </p>
      </div>

      {/* The passes */}
      <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-5">The 5 passes</h2>
      <div className="space-y-4">
        {PASSES.map(pass => (
          <div key={pass.n} className="p-5 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-[var(--md-surface-2)] border border-[var(--md-border-strong)] flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-text-tertiary)] shrink-0">
                {pass.n}
              </span>
              <h3 className="text-[13px] font-semibold text-[var(--md-text-secondary)]">{pass.name}</h3>
            </div>
            <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed mb-3">{pass.desc}</p>
            {pass.example && (
              <div className="space-y-1.5">
                <div className="rounded-lg bg-[var(--md-caution)]/[0.08] border border-[var(--md-caution)]/[0.15] px-3 py-2">
                  <p className="text-[9px] font-mono text-[var(--md-caution)]/80 uppercase tracking-wider mb-1">Before</p>
                  <p className="text-[11.5px] font-mono text-[var(--md-text-tertiary)] leading-relaxed">{pass.example.before}</p>
                </div>
                <div className="rounded-lg bg-[var(--md-go)]/[0.08] border border-[var(--md-go)]/[0.15] px-3 py-2">
                  <p className="text-[9px] font-mono text-[var(--md-go)]/80 uppercase tracking-wider mb-1">After</p>
                  <p className="text-[11.5px] font-mono text-[var(--md-text-tertiary)] leading-relaxed">{pass.example.after}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* When it runs */}
      <div className="mt-8 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <h3 className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-2">When it runs</h3>
        <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
          The optimizer runs automatically on every file MDPilot generates — Task mode, Generate mode,
          and all Labs tools. The output view shows the before/after token count and a per-pass breakdown
          of tokens saved. You can switch between the original and optimized versions in the editor.
        </p>
        <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed mt-2">
          Via the MCP server, the{' '}
          <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">optimize_markdown</code>{' '}
          tool runs the same 5-pass pipeline on any existing markdown file or string.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--md-border)] flex items-center gap-4">
        <Link href="/docs/drift" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          Drift detection →
        </Link>
        <Link href="/docs/mcp" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          MCP server →
        </Link>
      </div>

    </div>
  );
}
