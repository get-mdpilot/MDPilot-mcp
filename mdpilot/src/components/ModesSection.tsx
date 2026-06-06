'use client';

import { useEffect, useRef, useState } from 'react';

/* ─── Mini live preview for Generate card ───────────────────────────────── */
function GeneratePreview() {
  const lines = [
    { w: '75%', c: 'bg-[#4FACFF]/50' },
    { w: '55%', c: 'bg-white/15' },
    { w: '90%', c: 'bg-white/10' },
    { w: '40%', c: 'bg-[#A855F7]/40' },
    { w: '70%', c: 'bg-white/10' },
    { w: '60%', c: 'bg-white/10' },
    { w: '45%', c: 'bg-[#2DD4BF]/35' },
    { w: '80%', c: 'bg-white/08' },
  ];
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    setVisible(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisible(i);
      if (i >= lines.length) { clearInterval(id); setTimeout(() => setVisible(0), 1600); }
    }, 200);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl bg-[#0a0a16] border border-white/[0.07] p-3 space-y-1.5">
      <div className="flex items-center gap-1 mb-2">
        <span className="w-2 h-2 rounded-full bg-[#FF5F57]/50" />
        <span className="w-2 h-2 rounded-full bg-[#FEBC2E]/50" />
        <span className="w-2 h-2 rounded-full bg-[#28C840]/50" />
        <span className="ml-2 text-[9px] font-mono text-[#4FACFF]/60">CLAUDE.md</span>
      </div>
      {lines.map((l, i) => (
        <div
          key={i}
          className={`h-[4px] rounded-full transition-all duration-300 ${l.c}`}
          style={{
            width: i < visible ? l.w : '0%',
            transitionDelay: `${i * 20}ms`,
          }}
        />
      ))}
      {visible > 0 && visible <= lines.length && (
        <div className="flex items-center gap-1 mt-1">
          <span className="w-[5px] h-[10px] rounded-[1px] bg-[#4FACFF] animate-pulse" />
        </div>
      )}
    </div>
  );
}

/* ─── Mini live preview for Task card ───────────────────────────────────── */
function TaskPreview() {
  const items = [
    'Fix iOS 17 Safari crash',
    'Add list virtualization',
    'Write Playwright tests',
    'Verify on real device',
  ];
  const [checked, setChecked] = useState<number[]>([]);
  useEffect(() => {
    setChecked([]);
    const timers = items.map((_, i) => setTimeout(() => setChecked(p => [...p, i]), 500 + i * 500));
    const reset = setTimeout(() => setChecked([]), 500 + items.length * 500 + 800);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl bg-[#0a0a16] border border-white/[0.07] p-3">
      <div className="text-[9px] font-mono text-[#E05E3A]/60 mb-2">TASK.md — Acceptance Criteria</div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={item} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center shrink-0 transition-all duration-300 border ${
              checked.includes(i) ? 'bg-[#34D399]/20 border-[#34D399]/50' : 'border-white/15'
            }`}>
              {checked.includes(i) && (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-[9px] font-mono transition-colors duration-300 ${checked.includes(i) ? 'text-white/35 line-through' : 'text-white/55'}`}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Mini live preview for Convert card ────────────────────────────────── */
function ConvertPreview() {
  const [phase, setPhase] = useState<'waiting' | 'dropping' | 'processing' | 'done'>('waiting');
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('dropping'), 400);
    const t2 = setTimeout(() => setPhase('processing'), 1000);
    const t3 = setTimeout(() => setPhase('done'), 2200);
    const t4 = setTimeout(() => setPhase('waiting'), 3400);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, [phase === 'waiting' ? phase : undefined]);

  return (
    <div className="rounded-xl bg-[#0a0a16] border border-white/[0.07] p-3">
      <div className="border border-dashed border-[#2DD4BF]/25 rounded-lg p-3 flex flex-col items-center gap-1.5 transition-all duration-300"
        style={{ background: phase !== 'waiting' ? 'rgba(45,212,191,0.04)' : undefined }}>
        {phase === 'waiting' && (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(45,212,191,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="text-[8px] font-mono text-white/25">drop file here</span>
          </>
        )}
        {phase === 'dropping' && (
          <div className="flex items-center gap-2 animate-bounce">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="text-[9px] font-mono text-[#2DD4BF]">report.pdf</span>
          </div>
        )}
        {phase === 'processing' && (
          <div className="flex items-center gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"
                style={{ animation: `pulse 0.8s ease-in-out ${i * 150}ms infinite` }} />
            ))}
            <span className="text-[8px] font-mono text-white/40 ml-1">converting…</span>
          </div>
        )}
        {phase === 'done' && (
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span className="text-[9px] font-mono text-[#34D399]">report.md — done</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Mini live preview for Image→Prompt card ───────────────────────────── */
function ImagePromptPreview() {
  const [step, setStep] = useState(0);
  const labels = ['Analyzing layout…', 'Mapping colors…', 'Building prompt…'];
  useEffect(() => {
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1300);
    const t3 = setTimeout(() => setStep(3), 2000);
    const t4 = setTimeout(() => setStep(0), 3200);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, [step === 0 ? step : undefined]);

  return (
    <div className="rounded-xl bg-[#0a0a16] border border-white/[0.07] overflow-hidden">
      {/* Faux image with color grid */}
      <div className="flex h-10">
        {['bg-[#1a0a2e]','bg-[#0d1a3a]','bg-[#0a1f2e]','bg-[#1a0a1a]'].map((c,i) => (
          <div key={i} className={`flex-1 ${c} relative overflow-hidden`}>
            {step >= 1 && i < step && (
              <div className="absolute inset-0 border border-[#7C3AED]/50" />
            )}
          </div>
        ))}
      </div>
      <div className="p-2.5">
        {step < 3 ? (
          <div className="flex items-center gap-1.5">
            {step > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />}
            <span className="text-[8px] font-mono text-white/35">{labels[step - 1] ?? 'Drop image to analyze…'}</span>
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="h-[3px] rounded-full bg-[#7C3AED]/50 w-full" />
            <div className="h-[3px] rounded-full bg-[#7C3AED]/30 w-4/5" />
            <div className="h-[3px] rounded-full bg-[#7C3AED]/20 w-3/4" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Mode card ──────────────────────────────────────────────────────────── */
function ModeCard({
  href, live, badge, icon, label, accent, tag, desc, Preview,
}: {
  href: string; live: boolean; badge: string | null;
  icon: React.ReactNode; label: string; accent: string;
  tag: string; desc: string;
  Preview: React.ComponentType;
}) {
  const Tag = live ? 'a' : 'div';
  return (
    <Tag
      {...(live ? { href } : {})}
      className={`group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 overflow-hidden transition-all duration-200 ${
        live ? 'card-interactive cursor-pointer' : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Hover glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `${accent}33` }} />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border"
            style={{ background: `${accent}14`, borderColor: `${accent}26`, color: accent }}>
            {icon}
          </div>
          {!live ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">soon</span>
          ) : badge ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: `${accent}26`, color: accent }}>
              ✦ {badge}
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" /> Live
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-[16px] font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{label}</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/[0.08] text-white/35">{tag}</span>
        </div>
        <p className="text-[13px] text-white/45 leading-relaxed mb-4">{desc}</p>

        {/* Mini live preview */}
        <Preview />

        {live && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 text-[13px] font-medium" style={{ color: accent }}>
              Try it
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </Tag>
  );
}

/* ─── Modes section ──────────────────────────────────────────────────────── */
export default function ModesSection() {
  return (
    <section id="modes" className="max-w-6xl mx-auto px-5 sm:px-8 pb-12">
      <div className="text-center mb-12">
        <div className="section-label mb-5">MODES</div>
        <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em]">
          Four modes. One platform.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ModeCard
          href="/generate" live={true} badge={null}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
          label="Generate" accent="#4FACFF" tag="3 questions → .md"
          desc="Answer 3 questions, paste your stack. Get README, AGENTS.md, CLAUDE.md tuned for your AI tools."
          Preview={GeneratePreview}
        />
        <ModeCard
          href="/task" live={true} badge="New"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
          label="Task" accent="#E05E3A" tag="ticket → TASK.md"
          desc="Paste a Jira ticket or Slack thread. Get an agent-ready TASK.md with zero clarification needed."
          Preview={TaskPreview}
        />
        <ModeCard
          href="/convert" live={true} badge="New"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
          label="Convert" accent="#2DD4BF" tag="any file → .md"
          desc="Drop a PDF, Word doc, or PowerPoint. Get clean, token-efficient markdown via MarkItDown."
          Preview={ConvertPreview}
        />
        <ModeCard
          href="/image-to-prompt" live={true} badge="New"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
          label="Image → Prompt" accent="#7C3AED" tag="screenshot → prompt"
          desc="Upload a screenshot or photo. Get a detailed recreation prompt formatted for FLUX, SD, Midjourney, DALL-E, and Gemini."
          Preview={ImagePromptPreview}
        />
      </div>
    </section>
  );
}
