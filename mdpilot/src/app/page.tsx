import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TokenVizClient from '@/components/TokenVizClient';
import VizBentoSection from '@/components/VizBentoSection';
import MouseHero from '@/components/MouseHero';
import StreamingDemo from '@/components/StreamingDemo';
import ModesSection from '@/components/ModesSection';


/* ─── Feature card (Magic MCP: gradient-border + glow hover) ────────────────  */
function FeatureCard({ num, filename, accent, borderColor, glowColor, bgColor, icon, title, desc, tags }: {
  num: string; filename: string; accent: string; borderColor: string; glowColor: string; bgColor: string;
  icon: ReactNode; title: string; desc: string; tags: string[];
}) {
  return (
    <div className={`group relative rounded-2xl border ${borderColor} ${bgColor} p-6 cursor-default card-interactive gradient-border overflow-hidden`}>
      {/* Background glow blob */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center ${accent}`}>
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

/* ─── Works-with brand pill ─────────────────────────────────────────────── */
function BrandPill({
  name, color, weight = 600, icon,
}: {
  name: string; color: string; weight?: number;
  icon: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 rounded-full border shrink-0"
      style={{
        borderColor: `${color}22`,
        background: `${color}0a`,
      }}
    >
      <span className="shrink-0" style={{ color, opacity: 0.85 }}>{icon}</span>
      <span
        className="text-[13px] tracking-tight whitespace-nowrap"
        style={{ fontWeight: weight, color }}
      >
        {name}
      </span>
    </div>
  );
}

/* ─── Works-with scrolling marquee ──────────────────────────────────────── */
function WorksWithMarquee() {
  // All fonts use only what next/font loads: Space Grotesk, DM Sans, DM Mono
  const brands: Array<{ name: string; color: string; weight?: number; icon: ReactNode }> = [
    {
      name: 'Claude Code',
      // Anthropic's brand color — warm orange-clay
      color: '#CC785C',
      weight: 600,
      icon: (
        // Anthropic "A" — isosceles triangle, interior negative-space triangle
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13.827 3.45L21.5 19.5h-3.895l-1.65-3.8H8.03l-1.648 3.8H2.5l7.674-16.05h3.653zm-1.824 4.282-2.48 5.718h4.959l-2.48-5.718z" />
        </svg>
      ),
    },
    {
      name: 'Cursor',
      // Cursor's minimal identity — near-white on dark
      color: '#CDD6F4',
      weight: 600,
      icon: (
        // Mouse-cursor arrow — the actual Cursor product icon shape
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 2.5v18.4l5.1-5.1 3.1 7.2 2.6-1.1-3.1-7.2H18L4 2.5z" />
        </svg>
      ),
    },
    {
      name: 'GitHub Copilot',
      // GitHub Copilot uses a vivid purple/violet brand color
      color: '#8B5CF6',
      weight: 600,
      icon: (
        // GitHub Octocat silhouette — official simplified mark
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      ),
    },
    {
      name: 'Windsurf',
      // Codeium / Windsurf uses a bright teal-cyan identity
      color: '#06B6D4',
      weight: 600,
      icon: (
        // Stylised sail / wind wave — Windsurf's wave motif
        <svg width="18" height="15" viewBox="0 0 26 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M1 9c3-6 8-9 13-6s9 9 11 6" />
          <path d="M3 15c2-4 7-7 10-5s8 6 10 5" />
        </svg>
      ),
    },
    {
      name: 'Goose',
      // Block (formerly Square) open-source AI agent — Block's brand amber/gold
      color: '#F59E0B',
      weight: 600,
      icon: (
        // Goose — stylised bird silhouette in profile (long neck, body, beak)
        <svg width="18" height="16" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {/* Body */}
          <path d="M4 14c0 0 2-5 8-5s8 4 8 4" />
          {/* Neck sweeping up */}
          <path d="M20 13c1-3 2-6 4-8" />
          {/* Head */}
          <circle cx="23.5" cy="4.5" r="1.8" fill="currentColor" stroke="none" />
          {/* Beak */}
          <path d="M25 4l2-1" />
          {/* Tail */}
          <path d="M4 14c-1 1-2 3-1 4" />
        </svg>
      ),
    },
    {
      name: 'ChatGPT',
      // OpenAI brand green
      color: '#10A37F',
      weight: 600,
      icon: (
        // OpenAI bloom / rotary-petals logo — accurate simplified form
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M22.28 9.82a6 6 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.5-2.9 6.07 6.07 0 0 0-10.26 2.27 6 6 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 6 6 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 6 6 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.4a4.5 4.5 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zM3.6 18.3a4.47 4.47 0 0 1-.54-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06l-4.83 2.79A4.5 4.5 0 0 1 3.6 18.3zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.67a.77.77 0 0 0 .39.68l5.82 3.36-2.02 1.17a.08.08 0 0 1-.07 0L3.99 14A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.84-3.37 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1V12.44a.79.79 0 0 0-.4-.68zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.24V6.9a.07.07 0 0 1 .03-.06L14.27 4.1a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.14-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.8.8 0 0 0-.4.68zm1.1-2.37 2.6-1.5 2.61 1.5v3l-2.6 1.5-2.61-1.5z" />
        </svg>
      ),
    },
    {
      name: 'Zed',
      // Zed editor — electric violet, their actual brand hue
      color: '#9D7CD8',
      weight: 700,
      icon: (
        // Zed "Z" letterform — their actual logo is a bold Z slash
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 5h14L6 19h13" />
        </svg>
      ),
    },
  ];

  // Duplicate for seamless infinite loop (CSS transforms -50%)
  const doubled = [...brands, ...brands];

  return (
    <section className="relative border-y border-white/[0.05] bg-[var(--md-dark-2)] py-5 overflow-hidden">
      <p className="text-center text-[10px] font-mono text-white/20 uppercase tracking-[0.14em] mb-4">
        Works with
      </p>
      <div className="marquee-container">
        <div className="marquee-track gap-3 px-4">
          {doubled.map((brand, i) => (
            <BrandPill key={i} name={brand.name} color={brand.color} weight={brand.weight} icon={brand.icon} />
          ))}
        </div>
      </div>
    </section>
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
  return (
    <div className="bg-[var(--md-dark)] overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — cursor-reactive 3D cards (MouseHero client component)
      ══════════════════════════════════════════════════════════════════ */}
      <MouseHero />

      <WorksWithMarquee />

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
            num="[01]" filename="README.md"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>}
            accent="text-[#4FACFF]"
            borderColor="border-[#4FACFF]/[0.15]"
            glowColor="bg-[#4FACFF]/20"
            bgColor="bg-[#4FACFF]/[0.04]"
            title="Project homepage"
            desc="GitHub, npm, and PyPI render this first. The difference between adoption and being ignored."
            tags={['All platforms', 'Public repos', 'Indexed by GitHub']}
          />
          <FeatureCard
            num="[02]" filename="AGENTS.md"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>}
            accent="text-[#A855F7]"
            borderColor="border-[#A855F7]/[0.15]"
            glowColor="bg-[#A855F7]/20"
            bgColor="bg-[#A855F7]/[0.04]"
            title="Universal AI instructions"
            desc="Read by Copilot, Cursor, Claude, Windsurf, Zed. Tells every agent your conventions."
            tags={['6 AI tools', 'Universal format', 'AGENTS.md spec']}
          />
          <FeatureCard
            num="[03]" filename="CLAUDE.md"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.17 8H12V2.05"/></svg>}
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
          MODES — four ways to generate markdown (live animated previews)
      ══════════════════════════════════════════════════════════════════ */}
      <ModesSection />

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

          {/* Visual — animated token viz */}
          <TokenVizClient />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STREAMING GENERATION DEMO
      ══════════════════════════════════════════════════════════════════ */}
      <StreamingDemo />

      {/* ═══════════════════════════════════════════════════════════════
          BENTO DATA VISUALIZATION
      ══════════════════════════════════════════════════════════════════ */}
      <VizBentoSection />

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
