import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Drift detection — MDPilot docs',
  description:
    'What doc drift is, how MDPilot detects it with two methods (claim verification and snapshot diff), and how check_drift and update_docs keep your AGENTS.md and CLAUDE.md accurate as your codebase evolves.',
};

export default function DriftPage() {
  return (
    <div className="max-w-2xl">

      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Concepts</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          Drift detection
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          Generated docs drift from the codebase over time — scripts get renamed, files move, packages
          change. MDPilot detects this drift and patches only the stale parts.
        </p>
      </div>

      {/* What is drift */}
      <section className="mb-8 pb-8 border-b border-[var(--md-border)]">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">What drift is</h2>
        <p className="text-[14px] text-[var(--md-text-secondary)] leading-relaxed mb-3">
          Drift is the gap between what your docs say and what your codebase actually does. It happens
          gradually — you rename a script, move a file, install a new package, refactor a directory — and
          the docs quietly become wrong.
        </p>
        <p className="text-[14px] text-[var(--md-text-secondary)] leading-relaxed">
          For human readers, stale docs are annoying. For AI agents, they are actively harmful: an agent
          that reads a CLAUDE.md referencing a{' '}
          <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">npm run seed</code>{' '}
          script that no longer exists will confidently run a command that fails.
        </p>
      </section>

      {/* Two detection methods */}
      <section className="mb-8 pb-8 border-b border-[var(--md-border)]">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-5">Two detection methods</h2>

        <div className="space-y-4">
          {/* Method A */}
          <div className="p-5 rounded-xl border border-[var(--md-accent)]/[0.18] bg-[var(--md-accent)]/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold text-[var(--md-accent)]/60 bg-[var(--md-accent)]/10 border border-[var(--md-accent)]/20 px-2 py-0.5 rounded">
                Method A
              </span>
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Claim verification</span>
              <span className="text-[9px] font-mono text-[var(--md-text-tertiary)] ml-auto">no snapshot needed</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mb-3">
              MDPilot parses the doc and extracts every command and file path it references — patterns
              like <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">npm run foo</code>,{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">yarn run foo</code>,
              and backtick-wrapped paths like{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">`src/lib/foo.ts`</code>.
              Then it checks each one against the current repo state.
            </p>
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-2">Issues it catches</p>
              {[
                { severity: 'High', color: 'var(--md-caution)', issue: 'Script referenced in docs no longer exists in package.json' },
                { severity: 'Medium', color: 'var(--md-accent)', issue: 'File path referenced in docs no longer exists on disk' },
              ].map(item => (
                <div key={item.issue} className="flex items-start gap-2">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                    style={{ color: item.color, backgroundColor: `${item.color}18`, border: `1px solid ${item.color}30` }}
                  >
                    {item.severity}
                  </span>
                  <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{item.issue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Method B */}
          <div className="p-5 rounded-xl border border-[var(--md-info)]/[0.18] bg-[var(--md-info)]/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold text-[var(--md-info)]/60 bg-[var(--md-info)]/10 border border-[var(--md-info)]/20 px-2 py-0.5 rounded">
                Method B
              </span>
              <span className="text-[13px] font-semibold text-[var(--md-text-secondary)]">Snapshot diff</span>
              <span className="text-[9px] font-mono text-[var(--md-text-tertiary)] ml-auto">requires a prior generate</span>
            </div>
            <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed mb-3">
              When MDPilot generates a file, it saves a snapshot of the project state to{' '}
              <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">.mdpilot/manifest.json</code>.
              On a subsequent drift check, it compares the current state to that snapshot and surfaces
              things that changed but may not be reflected in the docs.
            </p>
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-2">Issues it catches</p>
              {[
                'New npm scripts added since the last generate — possibly worth documenting',
                'Scripts that existed at generate time but have since been removed',
                'New top-level directories that didn\'t exist when docs were generated',
                'New packages installed since the last generate',
                'Docs older than 90 days — a soft staleness signal',
              ].map((issue, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 text-[var(--md-text-tertiary)] bg-[var(--md-surface-2)] border border-[var(--md-border)]">
                    Low
                  </span>
                  <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-3 leading-relaxed">
          Both methods run together — Method A always runs; Method B adds additional signals if a
          manifest exists. Results are sorted by severity: High → Medium → Low.
        </p>
      </section>

      {/* The manifest */}
      <section className="mb-8 pb-8 border-b border-[var(--md-border)]">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">The manifest file</h2>
        <p className="text-[14px] text-[var(--md-text-secondary)] leading-relaxed mb-3">
          When the MCP server generates a file with <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">writeToDisk: true</code>,
          it writes a snapshot to <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">.mdpilot/manifest.json</code>{' '}
          at the project root. The snapshot records:
        </p>
        <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-bg)] p-4 font-mono text-[12px] text-[var(--md-text-secondary)] leading-relaxed">
{`{
  "version": 1,
  "generatedAt": "2026-06-08T...",
  "docs": {
    "AGENTS.md": {
      "contentHash": "abc123...",
      "generatedAt": "2026-06-08T...",
      "sourceSnapshot": {
        "dependencies": ["next", "react", ...],
        "scripts": { "dev": "next dev", "build": "next build" },
        "structure": ["src/", "packages/", "docs/"],
        "stack": ["Next.js", "TypeScript"]
      }
    }
  }
}`}
        </div>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-3">
          Add <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-tertiary)]">.mdpilot/</code>{' '}
          to <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-tertiary)]">.gitignore</code> if
          you don&apos;t want to commit the manifest, or commit it to share drift history across the team.
        </p>
      </section>

      {/* Using it */}
      <section className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Using drift detection</h2>
        <p className="text-[14px] text-[var(--md-text-secondary)] leading-relaxed mb-4">
          Via the MCP server — open any repo in your IDE and run:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-bg)]">
            <p className="text-[10px] font-mono text-[var(--md-text-tertiary)] mb-2">Step 1 — detect drift</p>
            <p className="text-[13px] font-mono text-[var(--md-text-secondary)]">
              &quot;Use mdpilot to check my docs for drift.&quot;
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-bg)]">
            <p className="text-[10px] font-mono text-[var(--md-text-tertiary)] mb-2">Step 2 — patch stale sections</p>
            <p className="text-[13px] font-mono text-[var(--md-text-secondary)]">
              &quot;Use mdpilot to update the stale sections.&quot;
            </p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-3 leading-relaxed">
          The <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-tertiary)]">check_drift</code> tool
          returns a list of issues. The{' '}
          <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-tertiary)]">update_docs</code> tool
          patches ONLY the stale sections — it leaves everything else untouched.
        </p>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-2 leading-relaxed">
          By default, <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-tertiary)]">check_drift</code> scans
          README.md, AGENTS.md, CLAUDE.md, and CONTRIBUTING.md. You can specify different files by name.
        </p>
      </section>

      <div className="pt-6 border-t border-[var(--md-border)] flex items-center gap-4">
        <Link href="/docs/token-optimizer" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          ← Token optimizer
        </Link>
        <Link href="/docs/mcp" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          MCP server →
        </Link>
      </div>

    </div>
  );
}
