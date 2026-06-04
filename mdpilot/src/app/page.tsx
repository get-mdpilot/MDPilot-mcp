import Link from "next/link";
import Image from "next/image";

// ── Floating 3-D file card (hero decoration) ──────────────────────────────

function FileCard({
  filename,
  lines,
  color,
  className = "",
}: {
  filename: string;
  lines: string[];
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-2xl glass border border-white/10 p-4 w-52 shadow-2xl select-none ${className}`}
    >
      {/* Titlebar dots */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <span className={`ml-auto text-[10px] font-mono font-semibold ${color}`}>{filename}</span>
      </div>
      {/* Fake code lines */}
      <div className="space-y-1.5">
        {lines.map((l, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full bg-white/10"
            style={{ width: l }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl sm:text-3xl font-bold gradient-text-blue">{value}</span>
      <span className="text-xs text-white/40 tracking-wide uppercase">{label}</span>
    </div>
  );
}

// ── Mode card ─────────────────────────────────────────────────────────────

interface Mode {
  href: string;
  label: string;
  tag: string;
  icon: React.ReactNode;
  gradient: string;
  borderGlow: string;
  description: string;
  fileTypes: string[];
  badge?: string;
}

const modes: Mode[] = [
  {
    href: "/generate",
    label: "Generate",
    tag: ".md files",
    gradient: "from-blue-600/20 via-violet-600/10 to-transparent",
    borderGlow: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    badge: "Live",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    description:
      "Answer 3 questions, paste your stack — get production-grade README, AGENTS.md, and CLAUDE.md tuned for your AI tools.",
    fileTypes: ["README.md", "AGENTS.md", "CLAUDE.md", "SKILL.md"],
  },
  {
    href: "/task",
    label: "Task mode",
    tag: "ticket → .md",
    gradient: "from-rose-600/20 via-orange-600/10 to-transparent",
    borderGlow: "hover:border-rose-500/50 hover:shadow-rose-500/10",
    badge: "v2",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
      </svg>
    ),
    description:
      "Paste a Jira ticket, Slack thread, or task description. Get an AI-agent-ready TASK.md with zero back-and-forth.",
    fileTypes: ["TASK.md", "SPEC.md", "PR_DESCRIPTION.md"],
  },
  {
    href: "/convert",
    label: "Convert",
    tag: "any file → .md",
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    borderGlow: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    badge: "v2",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
      </svg>
    ),
    description:
      "Drop a PDF, Word doc, PowerPoint, or image. Get clean, token-efficient markdown via Microsoft MarkItDown.",
    fileTypes: [".pdf", ".docx", ".pptx", ".xlsx", ".html"],
  },
];

// ── Feature list ──────────────────────────────────────────────────────────

const features = [
  {
    icon: "⚡",
    title: "5-second generation",
    desc: "One LLM call per file. No round-trips, no polling.",
  },
  {
    icon: "🎯",
    title: "Tool-aware output",
    desc: "Files tuned for Claude Code, Cursor, Copilot — not generic boilerplate.",
  },
  {
    icon: "🔢",
    title: "Built-in token optimizer",
    desc: "3-pass optimizer strips filler, dedupes across files, compresses.",
  },
  {
    icon: "📦",
    title: "Download as .zip",
    desc: "All files in one click. Drop them into your repo root.",
  },
  {
    icon: "🌐",
    title: "Zero setup",
    desc: "No auth, no account, no database. Paste and generate.",
  },
  {
    icon: "🔓",
    title: "Open model layer",
    desc: "Swap to any LLM — Claude, Groq, Gemini, OpenAI — in one file.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-[#07070f] px-6 pt-24 pb-20">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=60"
            alt=""
            fill
            className="object-cover opacity-[0.07]"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07070f]/60 via-[#07070f]/80 to-[#07070f]" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay z-0 opacity-40" />

        {/* Mesh blobs */}
        <div className="mesh-blob w-[500px] h-[500px] bg-blue-600/20 top-[-100px] left-[-100px] z-0" />
        <div className="mesh-blob w-[400px] h-[400px] bg-violet-600/15 bottom-[-50px] right-[-50px] z-0" />
        <div className="mesh-blob w-[300px] h-[300px] bg-blue-400/10 top-[40%] left-[60%] z-0" />

        {/* Floating 3-D file cards */}
        <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
          <div
            className="float absolute top-[18%] left-[8%]"
            style={{ transform: "perspective(900px) rotateY(18deg) rotateX(-8deg)" }}
          >
            <FileCard
              filename="README.md"
              color="text-blue-400"
              lines={["80%", "60%", "90%", "45%", "70%", "55%"]}
            />
          </div>
          <div
            className="float float-delay-1 absolute top-[22%] right-[7%]"
            style={{ transform: "perspective(900px) rotateY(-16deg) rotateX(-6deg)" }}
          >
            <FileCard
              filename="AGENTS.md"
              color="text-violet-400"
              lines={["65%", "85%", "50%", "75%", "40%", "80%"]}
            />
          </div>
          <div
            className="float float-delay-2 absolute bottom-[22%] left-[12%]"
            style={{ transform: "perspective(900px) rotateY(14deg) rotateX(6deg)" }}
          >
            <FileCard
              filename="CLAUDE.md"
              color="text-emerald-400"
              lines={["70%", "50%", "85%", "60%", "45%"]}
            />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Generate mode is live — try it now
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="gradient-text">Ship better</span>
            <br />
            <span className="text-white">.md files,</span>
            <br />
            <span className="gradient-text-blue">faster.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
            Answer 3 questions. Paste your stack. Get production-grade AI instruction
            files — README, AGENTS.md, CLAUDE.md — optimized for every token.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/generate"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              Generate my files
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="https://mdpilot.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full glass border border-white/10 text-white/70 text-sm font-medium hover:text-white hover:border-white/20 transition-all duration-200"
            >
              See examples ↗
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 mt-20 w-full max-w-lg mx-auto glass rounded-2xl border border-white/10 px-8 py-5 grid grid-cols-3 gap-6 text-center">
          <Stat value="3" label="File types" />
          <div className="w-px bg-white/10" />
          <Stat value="5s" label="Per file" />
          <div className="hidden" />
          {/* spacer col */}
        </div>
        {/* Second row stats */}
        <div className="relative z-10 mt-3 w-full max-w-lg mx-auto glass rounded-2xl border border-white/10 px-8 py-5 grid grid-cols-3 gap-6 text-center">
          <Stat value="27" label="Stack patterns" />
          <div className="w-px bg-white/10" />
          <Stat value="0" label="Sign-ups needed" />
          <div className="hidden" />
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-12 flex flex-col items-center gap-2 text-white/25">
          <span className="text-[11px] tracking-widest uppercase">Explore</span>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>

      {/* ── Mode cards ──────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Three modes. One platform.
          </h2>
          <p className="text-sm text-[var(--md-text-secondary)] max-w-md mx-auto">
            Generate from scratch, convert from any format, or turn a ticket into a spec — all markdown-first.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {modes.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className={`group relative block rounded-2xl border border-[var(--md-border)] bg-white dark:bg-[#0e0e18] overflow-hidden card-3d transition-all hover:shadow-xl ${mode.borderGlow}`}
            >
              {/* Gradient wash */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative p-5 flex items-start gap-4">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] dark:bg-white/5 flex items-center justify-center text-[var(--md-text-secondary)] group-hover:border-current shrink-0 transition-colors">
                  {mode.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold">{mode.label}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-[var(--md-border)] text-[var(--md-text-tertiary)]">
                      {mode.tag}
                    </span>
                    {mode.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        mode.badge === 'Live'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-[var(--md-surface)] dark:bg-white/5 text-[var(--md-text-tertiary)]'
                      }`}>
                        {mode.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--md-text-secondary)] leading-relaxed mb-3">
                    {mode.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mode.fileTypes.map((ft) => (
                      <span
                        key={ft}
                        className="text-[11px] font-mono px-2 py-0.5 rounded border border-[var(--md-border)] text-[var(--md-text-tertiary)]"
                      >
                        {ft}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <svg
                  width="18" height="18" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={1.5}
                  className="text-[var(--md-text-tertiary)] group-hover:text-current group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">How it works</h2>
          <p className="text-sm text-[var(--md-text-secondary)]">Three steps. Under a minute.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { n: '01', icon: '💬', title: 'Answer 3 questions', desc: 'Project type, audience, and which AI tools you use.' },
            { n: '02', icon: '✨', title: 'AI generates your files', desc: 'One LLM call per file. README, AGENTS.md, CLAUDE.md — all at once.' },
            { n: '03', icon: '🔢', title: 'Token-optimized, ready to ship', desc: '3-pass optimizer strips filler, dedupes across files, compresses structure.' },
          ].map(step => (
            <div key={step.n} className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-[var(--md-border)] bg-white dark:bg-[#0e0e18] flex items-center justify-center text-xl shadow-sm">
                {step.icon}
              </div>
              <div>
                <p className="text-[10px] font-mono text-[var(--md-text-tertiary)] mb-0.5">{step.n}</p>
                <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-[var(--md-text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof / trust ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-[var(--md-border)] bg-white dark:bg-[#0e0e18] px-6 py-5">
          <p className="text-[11px] text-[var(--md-text-tertiary)] uppercase tracking-widest mb-4">
            Generates files for
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {['GitHub Copilot', 'Cursor', 'Claude Code', 'Windsurf', 'ChatGPT / Codex', 'Zed AI'].map(tool => (
              <span
                key={tool}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--md-border)] text-[var(--md-text-secondary)]"
              >
                {tool}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-[var(--md-text-tertiary)] uppercase tracking-widest mb-3">
            Standards supported
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'AGENTS.md', note: 'Linux Foundation draft' },
              { label: 'CLAUDE.md', note: 'Anthropic standard' },
              { label: 'DESIGN.md', note: 'Google Labs proposal' },
            ].map(s => (
              <span
                key={s.label}
                className="text-xs px-3 py-1.5 rounded-full bg-[var(--md-blue-light)] text-[var(--md-blue)] font-mono"
              >
                {s.label} <span className="opacity-60 font-sans">· {s.note}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unsplash image break ─────────────────────────────────────────── */}
      <section className="relative h-64 sm:h-80 overflow-hidden mx-6 rounded-3xl mb-20 max-w-3xl lg:mx-auto">
        <Image
          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&auto=format&fit=crop&q=70"
          alt="Developer working"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070f]/80 via-[#07070f]/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2">The insight</p>
          <blockquote className="text-white text-xl sm:text-2xl font-semibold max-w-sm leading-snug">
            "AI agents are only as good as their context files."
          </blockquote>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Why MDPilot</h2>
          <p className="text-sm text-[var(--md-text-secondary)]">
            Built for teams who run AI coding agents all day.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--md-border)] bg-white dark:bg-[#0e0e18] p-5 card-3d"
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-[var(--md-text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Token optimizer callout ──────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-[var(--md-border)]">
          <Image
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=60"
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="relative z-10 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1 text-amber-600 dark:text-amber-400">
                  Built-in token optimizer — the moat
                </h3>
                <p className="text-sm text-[var(--md-text-secondary)] leading-relaxed max-w-md">
                  Every file runs through a 3-pass optimizer: boilerplate stripping,
                  cross-file deduplication, and compression. Your agents get leaner
                  context, fewer wasted tokens, sharper results.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Pass 1 — Tokenize", "Pass 2 — Strip boilerplate", "Pass 3 — Dedup"].map(p => (
                    <span key={p} className="text-[11px] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#07070f] py-24 px-6">
        <div className="mesh-blob w-96 h-96 bg-blue-600/20 top-[-50px] left-[10%]" />
        <div className="mesh-blob w-64 h-64 bg-violet-600/15 bottom-[-30px] right-[15%]" />
        <div className="relative z-10 text-center max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to generate?
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            3 questions. 15 seconds. Production-grade markdown files your AI agents will actually use.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            Start generating — it's free
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="mt-4 text-xs text-white/25">No account. No credit card. Just markdown.</p>
        </div>
      </section>
    </div>
  );
}
