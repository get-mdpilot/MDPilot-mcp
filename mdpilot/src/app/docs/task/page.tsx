import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Task mode — MDPilot docs',
  description:
    'How to use MDPilot Task mode: paste any ticket, Slack thread, or idea and get a structured, expert-grade prompt your AI coding agent can act on immediately.',
};

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-[16px] font-semibold text-[var(--md-text)] mt-10 mb-3 first:mt-0">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[14px] font-semibold text-[var(--md-text-secondary)] mt-5 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] text-[var(--md-text-secondary)] leading-relaxed mb-3">{children}</p>;
}

function OptionCard({
  badge, label, desc, highlight = false,
}: { badge: string; label: string; desc: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
      highlight
        ? 'border-[var(--md-accent)]/30 bg-[var(--md-accent)]/[0.05]'
        : 'border-[var(--md-border)] bg-[var(--md-surface)]'
    }`}>
      <span className={`shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mt-0.5 ${
        highlight
          ? 'bg-[var(--md-accent)]/20 text-[var(--md-accent)]/80'
          : 'bg-[var(--md-surface-2)] text-[var(--md-text-tertiary)]'
      }`}>
        {badge}
      </span>
      <div>
        <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-0.5">{label}</p>
        <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function TaskModeDocs() {
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Core</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          Task mode
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          Paste any task — a Jira ticket, Slack thread, PR feedback, or half-formed idea — and get a
          structured, expert-grade prompt your AI coding agent can act on without clarifying questions.
        </p>
      </div>

      {/* On-page nav */}
      <nav className="mb-8 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <p className="text-[10px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-3">On this page</p>
        <ol className="space-y-1.5">
          {[
            ['what-it-does', 'What it does'],
            ['wizard', 'The 3-step wizard'],
            ['execution-modes', 'Execution modes'],
            ['options', 'Other options'],
            ['output-files', 'Output files'],
            ['using-the-output', 'Using the output'],
            ['example', 'Worked example'],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="text-[13px] text-[var(--md-text-secondary)] hover:text-[var(--md-accent)] transition-colors">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* What it does */}
      <section id="what-it-does" className="scroll-mt-24 mb-8 pb-8 border-b border-[var(--md-border)]">
        <H2 id="what-it-does">What it does</H2>
        <P>
          AI agents do their best work when the starting context is precise. Task mode bridges the gap
          between "raw ticket" and "agent-ready prompt" — it reads your task input, detects the domain
          and tech stack automatically, and restructures it into a format that gives an AI coding agent
          everything it needs: context, acceptance criteria, constraints, and explicit out-of-scope
          boundaries.
        </P>
        <P>
          The result is a <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1.5 py-0.5 rounded text-[var(--md-text-secondary)]">TASK.md</code> you
          paste directly into Claude Code, Cursor, or any other agent — or a{' '}
          <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1.5 py-0.5 rounded text-[var(--md-text-secondary)]">SPEC.md</code> if
          you need a full engineering specification for planning and estimation.
        </P>
      </section>

      {/* The wizard */}
      <section id="wizard" className="scroll-mt-24 mb-8 pb-8 border-b border-[var(--md-border)]">
        <H2 id="wizard">The 3-step wizard</H2>

        {/* Step 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-full bg-[var(--md-accent)]/15 border border-[var(--md-accent)]/25 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-accent)]/70 shrink-0">
              1
            </span>
            <h3 className="text-[14px] font-semibold text-[var(--md-text-secondary)]">Paste your task</h3>
          </div>
          <div className="pl-8">
            <P>
              Drop in anything: a Jira ticket description and its comments, a Slack thread, a PR review,
              a bug report with reproduction steps, or a plain verbal description. The minimum is 20
              characters — there is no maximum.
            </P>
            <P>
              You can optionally expand "Add tech stack context" to paste a{' '}
              <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">package.json</code>,{' '}
              <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">requirements.txt</code>,
              or a typed list of technologies. If you skip it, MDPilot auto-detects the stack from
              keywords in your task text (React, FastAPI, AWS, etc.) and shows the detected tags below
              the input field.
            </P>
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-full bg-[var(--md-accent)]/15 border border-[var(--md-accent)]/25 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-accent)]/70 shrink-0">
              2
            </span>
            <h3 className="text-[14px] font-semibold text-[var(--md-text-secondary)]">Configure output</h3>
          </div>
          <div className="pl-8">
            <P>
              Tell MDPilot how you will use the output. This step controls the execution mode,
              experience level, and two optional toggles. MDPilot also shows the detected domain
              (Frontend, Backend, AWS, DevOps, etc.) so you can confirm it read your input correctly.
            </P>
            <P>
              See <a href="#execution-modes" className="text-[var(--md-accent)]/70 hover:text-[var(--md-accent)] transition-colors">Execution modes</a> and{' '}
              <a href="#options" className="text-[var(--md-accent)]/70 hover:text-[var(--md-accent)] transition-colors">Other options</a> below.
            </P>
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-full bg-[var(--md-accent)]/15 border border-[var(--md-accent)]/25 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-accent)]/70 shrink-0">
              3
            </span>
            <h3 className="text-[14px] font-semibold text-[var(--md-text-secondary)]">Review & generate</h3>
          </div>
          <div className="pl-8">
            <P>
              A summary shows your task input preview, detected domain, output mode, experience level,
              tech stack, and which files will be generated. Choose your AI model provider if more than
              one is configured. Click Generate — each file takes about 5–15 seconds.
            </P>
          </div>
        </div>
      </section>

      {/* Execution modes */}
      <section id="execution-modes" className="scroll-mt-24 mb-8 pb-8 border-b border-[var(--md-border)]">
        <H2 id="execution-modes">Execution modes</H2>
        <P>
          The execution mode is the most important choice — it controls the depth and structure of the
          output. Pick the one that matches who (or what) will use it.
        </P>
        <div className="space-y-3 mt-4">
          <OptionCard
            badge="Guide"
            label="Developer guide"
            desc="Full TASK.md with all sections — context, rationale, watch-outs, acceptance criteria. Best when a human developer will read and act on this."
          />
          <OptionCard
            badge="AI Exec"
            label="AI execution"
            highlight
            desc="Prescriptive TASK.md written for an AI agent to execute directly — exact file paths, function signatures, command sequences. Use this when you're pasting directly into Claude Code, Cursor, or Copilot."
          />
          <OptionCard
            badge="Context"
            label="Context drop"
            desc="Compact output: task + requirements + acceptance criteria only. Use this to paste into any chat window to ground a conversation without generating a full file."
          />
        </div>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-3 leading-relaxed">
          AI Exec is the mode that benefits most from the other options — it unlocks the verification
          pass toggle and produces the tightest agent-ready output.
        </p>
      </section>

      {/* Other options */}
      <section id="options" className="scroll-mt-24 mb-8 pb-8 border-b border-[var(--md-border)]">
        <H2 id="options">Other options</H2>

        <H3>Experience level</H3>
        <div className="space-y-2 mb-5">
          <OptionCard
            badge="Experienced"
            label="Experienced — terse"
            desc="Assumes the developer knows the language and framework. Focuses on the task specifics, not the basics."
          />
          <OptionCard
            badge="New"
            label="New to stack — explain why"
            desc="Adds explanations of non-obvious decisions and patterns specific to the detected stack."
          />
        </div>

        <H3>Verification pass</H3>
        <P>
          Only available in AI Exec mode. When enabled, MDPilot adds a self-check section to the output
          so the agent validates its own work before finishing — checking that every acceptance criterion
          is met, every referenced file exists, and every command runs. Useful for longer tasks where
          subtle errors are easy to miss.
        </P>

        <H3>Show alternative approaches</H3>
        <P>
          When enabled, the output includes 2–3 domain-appropriate implementation alternatives with
          trade-offs and a recommendation. Useful when you want the agent to reason about options rather
          than execute a single prescribed approach.
        </P>
      </section>

      {/* Output files */}
      <section id="output-files" className="scroll-mt-24 mb-8 pb-8 border-b border-[var(--md-border)]">
        <H2 id="output-files">Output files</H2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-[var(--md-accent)]/25 bg-[var(--md-accent)]/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <code className="text-[12px] font-mono font-bold text-[var(--md-accent)]/80">TASK.md</code>
              <span className="text-[9px] font-mono text-[var(--md-accent)]/80 bg-[var(--md-accent)]/10 px-1.5 py-0.5 rounded-[5px] border border-[var(--md-accent)]/15">recommended</span>
            </div>
            <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
              The primary output. Contains structured task context, acceptance criteria, constraints, and
              an agent prompt block ready to paste into your AI tool. Save it at the project root or paste
              the Agent Prompt block directly into your coding agent.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
            <div className="flex items-center gap-2 mb-1.5">
              <code className="text-[12px] font-mono font-bold text-[var(--md-text-secondary)]">SPEC.md</code>
            </div>
            <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
              Engineering specification — user story, functional requirements, technical approach, and a
              testing plan. Use alongside TASK.md for planning, estimation, and review before
              implementation starts.
            </p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-3">
          You can generate both at once — MDPilot makes one API call per file.
        </p>
      </section>

      {/* Using the output */}
      <section id="using-the-output" className="scroll-mt-24 mb-8 pb-8 border-b border-[var(--md-border)]">
        <H2 id="using-the-output">Using the output</H2>
        <P>
          The output view has three actions: copy the markdown, download the{' '}
          <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">.md</code> file, or
          download a <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">.zip</code> if
          you generated multiple files.
        </P>
        <P>
          The fastest workflow: copy the <strong className="text-[var(--md-text-secondary)]">Agent Prompt block</strong> from
          the output (it appears at the bottom of the TASK.md, clearly labelled) and paste it directly
          into Claude Code, Cursor, Copilot, or Windsurf as your first message. It gives the agent the
          task context, the acceptance criteria, and explicit boundaries in one paste — no back-and-forth.
        </P>
        <P>
          Alternatively, save TASK.md at the project root and reference it in your agent: "Read TASK.md
          and implement it."
        </P>

        <div className="mt-4 p-4 rounded-xl border border-[var(--md-go)]/[0.18] bg-[var(--md-go)]/[0.04]">
          <p className="text-[12px] text-[var(--md-go)]/80 font-semibold mb-1">Using via MCP</p>
          <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
            With the <Link href="/docs/mcp" className="text-[var(--md-accent)]/70 hover:text-[var(--md-accent)] transition-colors">MDPilot MCP server</Link> configured,
            you can generate TASK.md without leaving your IDE: "Use mdpilot to generate a task file for
            this ticket: [paste ticket]." The MCP tool also detects the stack from your real repo.
          </p>
        </div>
      </section>

      {/* Worked example */}
      <section id="example" className="scroll-mt-24 mb-8">
        <H2 id="example">Worked example</H2>
        <P>Input — a rough Slack message:</P>
        <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-bg)] p-4 mb-4 font-mono text-[12.5px] text-[var(--md-text-secondary)] leading-relaxed">
          {`hey can someone add rate limiting to the /api/export endpoint
it's getting hammered, causing timeouts for other users
probably 10 req/min per user should be fine
we're on Next.js + Upstash Redis already`}
        </div>
        <P>Settings: AI Exec · Experienced · Verification pass on</P>
        <P>
          Output: a TASK.md with the goal ("implement rate limiting on /api/export"), the detected domain
          (Backend), constraints (10 req/min per authenticated user, use existing Upstash Redis), acceptance
          criteria (429 response when exceeded, existing users unaffected, latency &lt;5ms overhead), an
          implementation plan referencing the actual Next.js middleware pattern, and a verification pass
          checklist the agent runs before marking done.
        </P>
        <P>
          The Agent Prompt block at the bottom is a single paste into Claude Code that starts the
          implementation with zero clarifying questions.
        </P>
      </section>

      {/* Nav */}
      <div className="pt-6 border-t border-[var(--md-border)] flex items-center justify-between">
        <Link href="/docs/getting-started" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          ← Getting started
        </Link>
        <Link href="/docs/mcp" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          MCP server →
        </Link>
      </div>

    </div>
  );
}
