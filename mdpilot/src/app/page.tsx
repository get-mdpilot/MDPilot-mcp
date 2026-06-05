import Link from 'next/link';
import Image from 'next/image';

/* ─── Terminal code window (Magic MCP pattern: code-aesthetic decoration) ─── */
function TerminalWindow({ lines }: { lines: { indent?: number; tokens: { type: string; text: string }[] }[] }) {
  return (
    <div className="terminal-chrome shadow-[0_0_60px_rgba(0,0,0,0.6)] w-full">
      {/* Titlebar */}
      <div className="terminal-titlebar">
        <span className="terminal-dot bg-[#FF5F57]" />
        <span className="terminal-dot bg-[#FEBC2E]" />
        <span className="terminal-dot bg-[#28C840]" />
        <span className="ml-3 text-[11px] font-mono text-white/25">CLAUDE.md — MDPilot</span>
      </div>
      {/* Code body */}
      <div className="px-5 py-4 space-y-1 text-[12.5px] font-mono leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} style={{ paddingLeft: `${(line.indent ?? 0) * 16}px` }}>
            {line.tokens.map((t, j) => (
              <span key={j} className={`token-${t.type}`}>{t.text}</span>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-white/30">{'>'}</span>
          <span className="text-[#82aaff]">_</span>
          <span className="cursor w-2 h-4 bg-[#4FACFF] rounded-[2px] opacity-80" />
        </div>
      </div>
    </div>
  );
}

/* ─── Floating 3-D file card ───────────────────────────────────────────────── */
function FileCard({ filename, accent, glow, lines, className = '' }: {
  filename: string; accent: string; glow: string; lines: string[]; className?: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/[0.07] bg-[rgba(13,13,26,0.85)] backdrop-blur-xl p-4 w-[200px] select-none ${glow} ${className}`}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-2 h-2 rounded-full bg-red-400/50" />
        <span className="w-2 h-2 rounded-full bg-amber-400/50" />
        <span className="w-2 h-2 rounded-full bg-green-400/50" />
        <span className={`ml-auto text-[10px] font-mono font-bold ${accent}`}>{filename}</span>
      </div>
      <div className="space-y-1.5">
        {lines.map((w, i) => (
          <div key={i} className="h-[5px] rounded-full" style={{ width: w, background: i % 3 === 0 ? 'rgba(79,172,255,0.25)' : i % 3 === 1 ? 'rgba(168,85,247,0.20)' : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Feature card (Magic MCP: gradient-border + glow hover) ────────────────  */
function FeatureCard({ num, filename, accent, borderColor, glowColor, bgColor, icon, title, desc, tags }: {
  num: string; filename: string; accent: string; borderColor: string; glowColor: string; bgColor: string;
  icon: string; title: string; desc: string; tags: string[];
}) {
  return (
    <div className={`group relative rounded-2xl border ${borderColor} ${bgColor} p-6 cursor-default card-interactive gradient-border overflow-hidden`}>
      {/* Background glow blob */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center text-xl`}>
            {icon}
          </div>
          <span className="font-mono text-[10px] text-white/20 font-medium">{num}</span>
        </div>

        <p className={`text-[11px] font-mono font-bold ${accent} mb-1 tracking-wider`}>{filename}</p>
        <h3 className="text-[15px] font-semibold text-white mb-2 leading-snug" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {title}
        </h3>
        <p className="text-[13px] text-white/45 leading-relaxed mb-4">{desc}</p>

        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${borderColor} ${accent} opacity-70 group-hover:opacity-100 transition-opacity`}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Optimizer pass row ─────────────────────────────────────────────────── */
function PassRow({ n, label, desc, color }: { n: string; label: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-200 group">
      <span className={`text-[11px] font-mono font-bold ${color} shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity`}>
        PASS {n}
      </span>
      <div>
        <p className="text-[13px] font-semibold text-white mb-0.5">{label}</p>
        <p className="text-[12px] text-white/35">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const terminalLines = [
    { tokens: [{ type: 'comment', text: '# Claude Code Project Memory' }] },
    { tokens: [] },
    { tokens: [{ type: 'keyword', text: '## Stack' }] },
    { tokens: [{ type: 'string', text: 'Next.js 14 · TypeScript · Tailwind · Prisma' }] },
    { tokens: [] },
    { tokens: [{ type: 'keyword', text: '## Gotchas' }] },
    { tokens: [{ type: 'function', text: '- ' }, { type: 'string', text: 'Never call API from client components' }] },
    { indent: 1, tokens: [{ type: 'function', text: '- ' }, { type: 'string', text: "runtime = 'nodejs' on API routes" }] },
    { tokens: [] },
    { tokens: [{ type: 'keyword', text: '## Commands' }] },
    { tokens: [{ type: 'comment', text: '$ npm run dev  # start local server' }] },
  ];

  return (
    <div className="bg-[var(--md-dark)] overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Dark OLED + code aesthetic (Skill: Developer Tool #91)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[96vh] flex flex-col items-center justify-center px-5 sm:px-8 pt-4 pb-24 overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Atmospheric blobs */}
        <div className="blob w-[700px] h-[700px] bg-[#4FACFF]/[0.07] -top-40 -left-40" />
        <div className="blob w-[500px] h-[500px] bg-[#A855F7]/[0.06] -bottom-20 right-0" />
        <div className="blob w-[300px] h-[300px] bg-[#2DD4BF]/[0.04] top-1/3 left-1/2" />

        {/* Floating file cards — perspective 3D */}
        <div className="absolute inset-0 pointer-events-none z-10 hidden xl:block">
          <div className="float absolute top-[18%] left-[4%]"
            style={{ transform: 'perspective(900px) rotateY(20deg) rotateX(-8deg)' }}>
            <FileCard filename="README.md" accent="text-[#4FACFF]"
              glow="shadow-[0_0_40px_rgba(79,172,255,0.12)]"
              lines={['80%','60%','90%','45%','70%','55%']} />
          </div>
          <div className="float float-delay-1 absolute top-[22%] right-[4%]"
            style={{ transform: 'perspective(900px) rotateY(-20deg) rotateX(-6deg)' }}>
            <FileCard filename="AGENTS.md" accent="text-[#A855F7]"
              glow="shadow-[0_0_40px_rgba(168,85,247,0.12)]"
              lines={['65%','85%','50%','75%','40%','80%']} />
          </div>
          <div className="float float-delay-2 absolute bottom-[24%] left-[8%]"
            style={{ transform: 'perspective(900px) rotateY(16deg) rotateX(6deg)' }}>
            <FileCard filename="CLAUDE.md" accent="text-[#2DD4BF]"
              glow="shadow-[0_0_40px_rgba(45,212,191,0.12)]"
              lines={['70%','50%','85%','60%','45%']} />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-20 text-center max-w-4xl mx-auto fade-up">
          {/* Live badge — Magic MCP quality: pulse + glassmorphism */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-10 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl text-[12px] text-white/50">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
            </span>
            Generate mode live — no account needed
            <span className="hidden sm:inline text-white/20">·</span>
            <span className="hidden sm:inline font-mono text-[#34D399]/70">try it →</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.6rem,7.5vw,5.5rem)] font-black leading-[1.04] tracking-[-0.04em] mb-6">
            <span className="text-white block">Docs that AI agents</span>
            <span className="text-gradient-animated block">actually read.</span>
          </h1>

          <p className="text-[17px] sm:text-[18px] text-white/40 max-w-[540px] mx-auto leading-relaxed mb-10">
            3 questions → production-grade{' '}
            <span className="font-mono text-[15px] text-white/70 bg-white/[0.06] px-2 py-0.5 rounded-md">AGENTS.md</span>
            {' '}/{' '}
            <span className="font-mono text-[15px] text-white/70 bg-white/[0.06] px-2 py-0.5 rounded-md">CLAUDE.md</span>
            {' '}/{' '}
            <span className="font-mono text-[15px] text-white/70 bg-white/[0.06] px-2 py-0.5 rounded-md">README.md</span>
            {' '}— token-optimized.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/generate"
              className="btn-shine relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-[15px] font-black shadow-[0_0_30px_rgba(79,172,255,0.30)] hover:shadow-[0_0_50px_rgba(79,172,255,0.50)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Generate my files
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 text-[15px] font-medium hover:text-white hover:border-white/[0.14] hover:bg-white/[0.06] transition-all duration-200"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Stats strip */}
          <div className="inline-grid grid-cols-3 divide-x divide-white/[0.06] bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl rounded-2xl overflow-hidden">
            {[
              { v: '3',  l: 'file types'      },
              { v: '27', l: 'stack detectors' },
              { v: '0',  l: 'sign-ups'        },
            ].map(s => (
              <div key={s.l} className="px-6 sm:px-8 py-4 text-center group">
                <p className="text-[22px] sm:text-[26px] font-black text-gradient-animated" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {s.v}
                </p>
                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal code window — right side decoration on wide screens */}
        <div className="relative z-20 mt-16 w-full max-w-lg mx-auto fade-up fade-up-2 xl:absolute xl:right-[4%] xl:bottom-[12%] xl:w-80 xl:mt-0">
          <TerminalWindow lines={terminalLines} />
          {/* Glow under the terminal */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-[#4FACFF]/15 rounded-full blur-xl" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TOOLS TRUST BAR
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative border-y border-white/[0.05] bg-[var(--md-dark-2)] py-5 px-5 sm:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.12em] shrink-0">Works with</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {['Claude Code', 'Cursor', 'GitHub Copilot', 'Windsurf', 'ChatGPT / Codex', 'Zed AI'].map(tool => (
              <span key={tool}
                className="text-[12px] font-medium px-3.5 py-1.5 rounded-full border border-white/[0.07] text-white/35 hover:text-white/65 hover:border-white/[0.14] transition-all duration-200 cursor-default">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FILE FEATURES — numbered sections (readme.com/ai style)
          Skill: Glassmorphism + gradient-border + glow hover
      ══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-8 py-28">
        <div className="text-center mb-20 fade-up">
          <div className="section-label mb-5">FEA. [01–03]</div>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white tracking-[-0.04em] mb-4">
            Three files. All your AI tools.<br />
            <span className="text-gradient-animated">Zero guesswork.</span>
          </h2>
          <p className="text-white/40 text-[16px] max-w-xl mx-auto leading-relaxed">
            AI agents work best when they have context. MDPilot generates the exact instruction files each tool expects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            num="[01]" filename="README.md" icon="📄"
            accent="text-[#4FACFF]"
            borderColor="border-[#4FACFF]/[0.15]"
            glowColor="bg-[#4FACFF]/20"
            bgColor="bg-[#4FACFF]/[0.04]"
            title="Project homepage"
            desc="GitHub, npm, and PyPI render this first. The difference between adoption and being ignored."
            tags={['All platforms', 'Public repos', 'Indexed by GitHub']}
          />
          <FeatureCard
            num="[02]" filename="AGENTS.md" icon="🤖"
            accent="text-[#A855F7]"
            borderColor="border-[#A855F7]/[0.15]"
            glowColor="bg-[#A855F7]/20"
            bgColor="bg-[#A855F7]/[0.04]"
            title="Universal AI instructions"
            desc="Read by Copilot, Cursor, Claude, Windsurf, Zed. Tells every agent your conventions."
            tags={['6 AI tools', 'Universal format', 'AGENTS.md spec']}
          />
          <FeatureCard
            num="[03]" filename="CLAUDE.md" icon="🟠"
            accent="text-[#2DD4BF]"
            borderColor="border-[#2DD4BF]/[0.15]"
            glowColor="bg-[#2DD4BF]/20"
            bgColor="bg-[#2DD4BF]/[0.04]"
            title="Claude Code memory"
            desc="Loads every session. Prevents repeated mistakes. Saves ~200 tokens per message."
            tags={['Claude Code only', 'Auto-loads', 'Persistent context']}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MODES — three ways to generate markdown
      ══════════════════════════════════════════════════════════════════ */}
      <section id="modes" className="max-w-6xl mx-auto px-5 sm:px-8 pb-12">
        <div className="text-center mb-12">
          <div className="section-label mb-5">MODES</div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em]">
            Three modes. One platform.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              href: '/generate', live: true, badge: null,
              icon: '✨', label: 'Generate', accent: '#4FACFF',
              tag: '3 questions → .md',
              desc: 'Answer 3 questions, paste your stack. Get README, AGENTS.md, CLAUDE.md tuned for your AI tools.',
            },
            {
              href: '/task', live: true, badge: 'New',
              icon: '📋', label: 'Task', accent: '#E05E3A',
              tag: 'ticket → TASK.md',
              desc: 'Paste a Jira ticket or Slack thread. Get an agent-ready TASK.md with zero clarification needed.',
            },
            {
              href: '/convert', live: true, badge: 'New',
              icon: '🔄', label: 'Convert', accent: '#2DD4BF',
              tag: 'any file → .md',
              desc: 'Drop a PDF, Word doc, or PowerPoint. Get clean, token-efficient markdown via MarkItDown.',
            },
          ].map(mode => {
            const Tag = mode.live ? 'a' : 'div';
            return (
              <Tag
                key={mode.label}
                {...(mode.live ? { href: mode.href } : {})}
                className={`group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden transition-all duration-200 ${
                  mode.live ? 'card-interactive cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `${mode.accent}33` }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border"
                      style={{ background: `${mode.accent}14`, borderColor: `${mode.accent}26` }}>
                      {mode.icon}
                    </div>
                    {!mode.live ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">soon</span>
                    ) : mode.badge ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: `${mode.accent}26`, color: mode.accent }}>
                        ✦ {mode.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" /> Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-[16px] font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{mode.label}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/[0.08] text-white/35">{mode.tag}</span>
                  </div>
                  <p className="text-[13px] text-white/45 leading-relaxed mb-3">{mode.desc}</p>
                  {mode.live && (
                    <span className="inline-flex items-center gap-1 text-[13px] font-medium" style={{ color: mode.accent }}>
                      Try it
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </div>
              </Tag>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHAT'S NEW IN V2
      ══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-2xl border border-[#4FACFF]/20 bg-[#4FACFF]/[0.04] p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#4FACFF] text-[#07070f]">v2</span>
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What&apos;s new</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              'Task mode — paste any ticket, get TASK.md',
              'Convert mode — drop files, get markdown',
              'Multi-model — Claude, GPT-4o, or Gemini',
              '9 file types — SKILL.md, DESIGN.md, and more',
              'Badge generator + templates + auto-TOC',
              '5-pass token optimizer',
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5">
                <span className="text-[#34D399] shrink-0 mt-0.5">✅</span>
                <span className="text-sm text-white/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TOKEN OPTIMIZER — dark section
          Skill: Data-dense + heat-map + progress indicators
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[var(--md-dark-2)] border-y border-white/[0.05] py-28 px-5 sm:px-8">
        <div className="blob w-[450px] h-[450px] bg-[#FBBF24]/[0.06] -top-32 left-1/2 -translate-x-1/2" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <div className="section-label mb-5">FEA. [04]</div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-black text-white tracking-[-0.04em] mb-4">
              3-pass token optimizer.<br />
              <span className="text-[#FBBF24]">No one else has this.</span>
            </h2>
            <p className="text-white/40 leading-relaxed mb-8 text-[15px]">
              Every file runs through our optimizer before you see it. Filler stripped, duplicates merged, structure compressed.
            </p>

            <div className="space-y-2.5">
              <PassRow n="01" label="Boilerplate strip" color="text-[#FBBF24]"
                desc="10 regex patterns remove zero-meaning filler phrases" />
              <PassRow n="02" label="Cross-file dedup" color="text-[#FF6B6B]"
                desc="Bigram Jaccard similarity detects duplicate sections across files" />
              <PassRow n="03" label="Structure compression" color="text-[#A855F7]"
                desc="Cleans code blocks, collapses blank lines, strips trailing whitespace" />
            </div>
          </div>

          {/* Visual — token bar viz */}
          <div className="relative">
            <div className="terminal-chrome shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <div className="terminal-titlebar">
                <span className="terminal-dot bg-[#FF5F57]" />
                <span className="terminal-dot bg-[#FEBC2E]" />
                <span className="terminal-dot bg-[#28C840]" />
                <span className="ml-3 text-[11px] font-mono text-white/25">Token optimizer — results</span>
              </div>
              <div className="p-6 space-y-5">
                {/* Before/after bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-white/30">Before</span>
                    <span className="text-[11px] font-mono text-white/50">2,847 tokens</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full w-full bg-white/15 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-white/30">After</span>
                    <span className="text-[11px] font-mono text-[#4FACFF]">1,764 tokens</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] transition-all duration-700" style={{ width: '62%' }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                  <span className="text-[12px] text-white/30">Total saved</span>
                  <span className="text-[18px] font-black text-[#34D399]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>↓ 38%</span>
                </div>

                {/* Pass breakdown */}
                <div className="space-y-2">
                  {[
                    { label: 'Boilerplate strip',     saved: 642, color: 'bg-[#FBBF24]' },
                    { label: 'Cross-file dedup',      saved: 318, color: 'bg-[#FF6B6B]' },
                    { label: 'Structure compression', saved: 123, color: 'bg-[#A855F7]' },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
                      <span className="text-[11px] text-white/35 flex-1">{p.label}</span>
                      <span className="text-[11px] font-mono text-white/50">-{p.saved}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#FBBF24]/10 blur-2xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 steps with connector line
      ══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-5 sm:px-8 py-28">
        <div className="text-center mb-16">
          <div className="section-label mb-5">FEA. [05]</div>
          <h2 className="text-[clamp(2rem,4.5vw,3rem)] font-black text-white tracking-[-0.04em]">
            Under 30 seconds,<br />
            <span className="text-gradient-animated">start to download.</span>
          </h2>
        </div>

        <div className="relative space-y-4">
          {/* Connector line */}
          <div className="absolute left-[19px] top-12 bottom-12 w-px bg-gradient-to-b from-[#4FACFF]/50 via-[#A855F7]/40 to-[#2DD4BF]/30 hidden sm:block" />

          {[
            {
              n: '01', color: 'bg-[#4FACFF] shadow-[0_0_16px_rgba(79,172,255,0.5)]', textColor: 'text-[#4FACFF]',
              icon: '💬',
              title: 'Answer 3 questions',
              desc: 'Project type · Who it\'s for · Which AI tools. 30 seconds maximum.',
              mono: 'webapp · public · claude + cursor',
            },
            {
              n: '02', color: 'bg-[#A855F7] shadow-[0_0_16px_rgba(168,85,247,0.5)]', textColor: 'text-[#A855F7]',
              icon: '🔍',
              title: 'Paste your stack (optional)',
              desc: 'Drop in package.json or type "Next.js + Supabase". 27 frameworks detected automatically.',
              mono: 'detected: Next.js · TypeScript · Tailwind · Prisma',
            },
            {
              n: '03', color: 'bg-[#2DD4BF] shadow-[0_0_16px_rgba(45,212,191,0.5)]', textColor: 'text-[#2DD4BF]',
              icon: '📦',
              title: 'Edit & download optimized files',
              desc: 'Split-pane editor with live preview. Copy, download .md, or grab all as .zip.',
              mono: '$ download mdpilot.zip  # 3 files, 1,764 tokens',
            },
          ].map(step => (
            <div key={step.n} className="flex gap-5 sm:gap-8 items-start">
              <div className={`shrink-0 w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-[#07070f] font-black text-[12px] font-mono`}>
                {step.n}
              </div>
              <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-200 group">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xl shrink-0">{step.icon}</span>
                  <h3 className="text-[14px] font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {step.title}
                  </h3>
                </div>
                <p className="text-[13px] text-white/40 leading-relaxed mb-3 ml-9">{step.desc}</p>
                <code className={`text-[11px] font-mono ${step.textColor}/60 group-hover:${step.textColor}/80 ml-9 block transition-colors`}>
                  {step.mono}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STANDARDS — mini section
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--md-dark-2)] border-y border-white/[0.05] py-12 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.12em] mb-5 text-center">Standards supported</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { file: 'AGENTS.md', org: 'Linux Foundation draft', accent: 'text-[#4FACFF]', border: 'border-[#4FACFF]/[0.15]', bg: 'bg-[#4FACFF]/[0.04]' },
              { file: 'CLAUDE.md', org: 'Anthropic standard',     accent: 'text-[#A855F7]', border: 'border-[#A855F7]/[0.15]', bg: 'bg-[#A855F7]/[0.04]' },
              { file: 'DESIGN.md', org: 'Google Labs proposal',   accent: 'text-[#2DD4BF]', border: 'border-[#2DD4BF]/[0.15]', bg: 'bg-[#2DD4BF]/[0.04]' },
            ].map(s => (
              <div key={s.file} className={`rounded-xl border ${s.border} ${s.bg} px-5 py-4 card-interactive`}>
                <p className={`text-[13px] font-mono font-bold ${s.accent} mb-1`}>{s.file}</p>
                <p className="text-[11px] text-white/30">{s.org}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          QUOTE + IMAGE BREAK
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative h-52 sm:h-64 overflow-hidden mx-5 sm:mx-8 my-16 rounded-3xl max-w-5xl lg:mx-auto">
        <Image
          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&auto=format&fit=crop&q=60"
          alt="" fill className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070f]/90 via-[#07070f]/55 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.12em] mb-3">The insight</p>
          <blockquote className="text-white text-[20px] sm:text-[24px] font-black max-w-md leading-snug tracking-[-0.03em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            "AI agents are only as good as their context files."
          </blockquote>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA — Skill: Large CTA hover + glow (Micro SaaS #2)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[var(--md-dark-2)] border-t border-white/[0.05] py-28 px-5 sm:px-8 text-center">
        <div className="blob w-[500px] h-[500px] bg-[#4FACFF]/[0.08] -top-20 left-1/2 -translate-x-1/2" />
        <div className="blob w-[300px] h-[300px] bg-[#A855F7]/[0.07] bottom-0 right-1/4" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="section-label mb-6 mx-auto w-fit">FEA. [06]</div>
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-black text-white tracking-[-0.04em] mb-5">
            Ready to generate?
          </h2>
          <p className="text-white/40 text-[17px] mb-10 leading-relaxed">
            3 questions. 30 seconds. Files your AI agents will actually read and follow.
          </p>

          <Link
            href="/generate"
            className="btn-shine relative inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-[16px] font-black shadow-[0_0_40px_rgba(79,172,255,0.3)] hover:shadow-[0_0_60px_rgba(79,172,255,0.5)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-200"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Start generating — it's free
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="mt-5 text-[11px] font-mono text-white/20">No account. No credit card. No database. Open source.</p>
        </div>
      </section>
    </div>
  );
}
