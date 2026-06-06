'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── Product demo configs ───────────────────────────────────────────────── */
interface DemoConfig {
  id: string;
  label: string;
  accent: string;
  tag: string;
  inputLabel: string;
  isTyped: boolean;
  inputText: string;
  droppedFile?: string;
  droppedIcon?: 'pdf' | 'image' | 'doc';
  pipelineSteps: string[];
  outputFilename: string;
  outputAccent: string;
  output: string;
}

const DEMOS: DemoConfig[] = [
  {
    id: 'generate',
    label: 'Generate',
    accent: '#4FACFF',
    tag: '7 steps → .md',
    inputLabel: 'Stack description',
    isTyped: true,
    inputText: 'Next.js 14 + TypeScript + Tailwind + Anthropic API. SaaS for devs. Claude Code + Cursor users.',
    pipelineSteps: ['Parsing stack…', 'Detecting 27 frameworks…', 'Building prompt context…', 'Calling Claude claude-sonnet-4-6…'],
    outputFilename: 'CLAUDE.md',
    outputAccent: '#2DD4BF',
    output: `# CLAUDE.md

## Project
MDPilot — markdown intelligence SaaS.
Stack: Next.js 14 · TypeScript · Tailwind · Anthropic API.

## Architecture
Input → Mode engine (Generate | Task | Convert)
  → 5-pass token optimizer → Output

## Hard constraints
- No database, no auth — all state is client-side
- One API call per file (simpler parsing)
- All Anthropic calls via /api/* routes
- Never import ANTHROPIC_API_KEY client-side

## Gotchas
- After fast dev restarts: rm -rf .next
- Dark-only theme — never add dark: Tailwind variants
- api/generate: export const runtime = 'nodejs'

## Commands
$ npm run dev   # start dev server
$ npm run build # production build
$ npx tsc       # type check only`,
  },
  {
    id: 'task',
    label: 'Task',
    accent: '#E05E3A',
    tag: 'ticket → TASK.md',
    inputLabel: 'Jira ticket / Slack thread',
    isTyped: true,
    inputText: '[P1-BUG] Dashboard crashes on mobile Safari when cart > 50 items. iOS 17 only. Reproducible 100%. Assigned: @dev-team · Sprint: Q1-2026.',
    pipelineSteps: ['Parsing issue…', 'Detecting domain (e-commerce)…', 'Analyzing complexity (P1)…', 'Structuring TASK.md…'],
    outputFilename: 'TASK.md',
    outputAccent: '#E05E3A',
    output: `# TASK.md

## Summary
Fix iOS 17 Safari crash when cart exceeds 50 items.

## Acceptance Criteria
- [ ] Dashboard loads on iOS 17 Safari with 50+ items
- [ ] No unhandled exceptions in WebKit console
- [ ] Regression test added to suite
- [ ] Verified on iPhone 14 (iOS 17.4) and iPhone 15

## Root Cause Analysis
Likely: Array virtualization not applied. CartList
renders all items causing DOM overflow on WebKit.

## Implementation
1. Audit CartList component for missing virtualization
2. Add react-virtual or @tanstack/virtual for list
3. Verify scroll position preserved on item add
4. Add iOS-specific Playwright test

## Test Plan
- Unit: CartList renders correctly at 50+ items
- E2E: Playwright on webkit + real device
- Regression: Run full mobile safari suite`,
  },
  {
    id: 'convert',
    label: 'Convert',
    accent: '#2DD4BF',
    tag: 'any file → .md',
    inputLabel: 'Dropped file',
    isTyped: false,
    inputText: '',
    droppedFile: 'quarterly-report.pdf',
    droppedIcon: 'pdf',
    pipelineSteps: ['Extracting text (MarkItDown)…', 'Cleaning whitespace…', 'Formatting structure…', 'Optimizing tokens…'],
    outputFilename: 'quarterly-report.md',
    outputAccent: '#2DD4BF',
    output: `# Q4 2025 Quarterly Report

## Executive Summary
Revenue grew 34% YoY to $2.4M ARR.
Customer retention held at 94%. Product
velocity increased with 3 major features.

## Key Metrics

| Metric | Q3 2025 | Q4 2025 | Change |
|--------|---------|---------|--------|
| ARR    | $1.8M   | $2.4M   | +34%   |
| MAU    | 4,200   | 5,800   | +38%   |
| NPS    | 51      | 68      | +17    |

## Product Highlights
- Launched Convert mode (Oct 2025)
- 5-pass token optimizer shipped
- Multi-provider AI (Claude, GPT, Gemini)

## Q1 2026 Goals
- Reach $3.2M ARR
- Launch Generate v3 with 12 file types
- MCP server public release`,
  },
  {
    id: 'image',
    label: 'Image → Prompt',
    accent: '#7C3AED',
    tag: 'screenshot → prompt',
    inputLabel: 'Analyzed image',
    isTyped: false,
    inputText: '',
    droppedFile: 'dashboard-screenshot.png',
    droppedIcon: 'image',
    pipelineSteps: ['Analyzing layout…', 'Identifying components…', 'Mapping color palette…', 'Building recreation prompt…'],
    outputFilename: 'PROMPT.md',
    outputAccent: '#7C3AED',
    output: `# Image Recreation Prompt

## FLUX / Stable Diffusion

Dark SaaS analytics dashboard, glassmorphism
UI. Left sidebar with icon nav. Main area shows
line chart (top) + bar chart (bottom-right).
Deep navy #0A0E1A background, electric blue
#4FACFF accents, teal #2DD4BF highlights.
Grid texture overlay. Inter font. --ar 16:9

## Midjourney

/imagine a sleek dark web dashboard, glass
morphism panels, electric blue data charts,
deep space background, professional SaaS UI,
ultra detailed, 8k --ar 16:9 --style raw

## DALL-E 3

Professional analytics dashboard with dark
glassmorphism design. Left navigation sidebar,
central chart area with glowing blue line
graphs on navy background. Modern SaaS.

## Gemini Imagen

Dark theme analytics UI with glass-effect
panels, gradient charts, modern typography.`,
  },
];

/* ─── Token meter ─────────────────────────────────────────────────────────── */
function TokenMini({ tokens }: { tokens: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4FACFF] to-[#34D399] transition-all duration-300"
          style={{ width: `${Math.min(tokens / 600, 1) * 100}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/30 tabular-nums w-14 text-right">{tokens} tok</span>
    </div>
  );
}

/* ─── File drop display ──────────────────────────────────────────────────── */
function DroppedFileDisplay({ demo, visible }: { demo: DemoConfig; visible: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    pdf: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
      </svg>
    ),
    image: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  };

  return (
    <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div
        className="flex items-center gap-3 p-3 rounded-xl border"
        style={{ borderColor: `${demo.accent}30`, background: `${demo.accent}08` }}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${demo.accent}15`, color: demo.accent }}>
          {icons[demo.droppedIcon ?? 'pdf']}
        </div>
        <div>
          <p className="text-[12px] font-mono text-white/70">{demo.droppedFile}</p>
          <p className="text-[10px] text-white/30 mt-0.5">dropped — ready to convert</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ background: `${demo.accent}15`, color: demo.accent }}>
            ✓
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Markdown syntax highlighter ────────────────────────────────────────── */
function MarkdownHighlight({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const lines = text.split('\n');
  let inCode = false;
  lines.forEach((line, li) => {
    if (line.startsWith('```')) { inCode = !inCode; parts.push(<span key={`f-${li}`} className="text-white/25">{line}</span>); }
    else if (inCode)             parts.push(<span key={`c-${li}`} className="text-[#82aaff]">{line}</span>);
    else if (line.startsWith('# '))  parts.push(<span key={`h1-${li}`} className="text-[#4FACFF] font-bold">{line}</span>);
    else if (line.startsWith('## ')) parts.push(<span key={`h2-${li}`} className="text-[#A855F7] font-semibold">{line}</span>);
    else if (line.startsWith('- [')) parts.push(<span key={`li-${li}`} className="text-white/55">{line}</span>);
    else if (line.startsWith('| '))  parts.push(<span key={`tb-${li}`} className="text-[#2DD4BF]/70">{line}</span>);
    else if (line.startsWith('$'))   parts.push(<span key={`cm-${li}`} className="text-[#34D399]">{line}</span>);
    else if (line.startsWith('/imagine') || line.startsWith('**')) parts.push(<span key={`kw-${li}`} className="text-[#FBBF24]/80">{line}</span>);
    else parts.push(<span key={`t-${li}`}>{line}</span>);
    if (li < lines.length - 1) parts.push('\n');
  });
  return <>{parts}</>;
}

type Phase = 'idle' | 'typing' | 'revealing' | 'analyzing' | 'streaming' | 'done';

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function StreamingDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [fileRevealed, setFileRevealed] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const demo = DEMOS[activeTab];

  const resetDemo = useCallback(() => {
    setPhase('idle');
    setInputText('');
    setOutputText('');
    setTokenCount(0);
    setAnalyzeStep(0);
    setFileRevealed(false);
  }, []);

  const switchTab = (i: number) => { setActiveTab(i); resetDemo(); };

  const startDemo = useCallback(() => {
    resetDemo();
    if (DEMOS[activeTab].isTyped) {
      setPhase('typing');
    } else {
      setPhase('revealing');
    }
  }, [activeTab, resetDemo]);

  // Typing phase
  useEffect(() => {
    if (phase !== 'typing') return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setInputText(demo.inputText.slice(0, i));
      if (i >= demo.inputText.length) { clearInterval(id); setTimeout(() => setPhase('analyzing'), 400); }
    }, 26);
    return () => clearInterval(id);
  }, [phase, demo]);

  // Reveal phase (for file-drop products)
  useEffect(() => {
    if (phase !== 'revealing') return;
    setFileRevealed(false);
    const t1 = setTimeout(() => setFileRevealed(true), 200);
    const t2 = setTimeout(() => setPhase('analyzing'), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  // Analyzing phase
  useEffect(() => {
    if (phase !== 'analyzing') return;
    let step = 0;
    setAnalyzeStep(0);
    const id = setInterval(() => {
      step++;
      setAnalyzeStep(step);
      if (step >= demo.pipelineSteps.length) { clearInterval(id); setTimeout(() => setPhase('streaming'), 300); }
    }, 420);
    return () => clearInterval(id);
  }, [phase, demo]);

  // Streaming phase
  useEffect(() => {
    if (phase !== 'streaming') return;
    let i = 0;
    const tick = () => {
      if (phaseRef.current !== 'streaming') return;
      const batch = demo.output[i] === '\n' ? 1 : Math.floor(Math.random() * 4) + 2;
      i = Math.min(i + batch, demo.output.length);
      setOutputText(demo.output.slice(0, i));
      setTokenCount(Math.floor(i * 0.38));
      if (i < demo.output.length) setTimeout(tick, Math.random() * 14 + 8);
      else setPhase('done');
    };
    setTimeout(tick, 100);
  }, [phase, demo]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [outputText]);

  return (
    <section className="relative overflow-hidden bg-[var(--md-dark-2)] border-y border-white/[0.05] py-24 px-5 sm:px-8">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-48 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${demo.accent}08 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-32 bg-[#A855F7]/[0.04] blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label mb-5">LIVE DEMO</div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white tracking-[-0.04em] mb-3">
            Watch it work.
            <span className="text-gradient-animated"> All four modes.</span>
          </h2>
          <p className="text-white/35 text-[15px] max-w-sm mx-auto leading-relaxed">
            Click a tab, hit Run — watch MDPilot generate in real time.
          </p>
        </div>

        {/* Tab strip */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {DEMOS.map((d, i) => (
            <button
              key={d.id}
              onClick={() => switchTab(i)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: activeTab === i ? `${d.accent}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeTab === i ? `${d.accent}40` : 'rgba(255,255,255,0.08)'}`,
                color: activeTab === i ? d.accent : 'rgba(255,255,255,0.45)',
                boxShadow: activeTab === i ? `0 0 16px ${d.accent}18` : 'none',
              }}
            >
              {activeTab === i && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.accent }} />
              )}
              {d.label}
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: activeTab === i ? `${d.accent}20` : 'rgba(255,255,255,0.05)',
                  color: activeTab === i ? d.accent : 'rgba(255,255,255,0.25)',
                }}
              >
                {d.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Terminal window */}
        <div className="relative max-w-3xl mx-auto">
          {/* Gradient border glow */}
          <div
            className="absolute -inset-px rounded-2xl pointer-events-none transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${demo.accent}25 0%, transparent 50%, ${demo.accent}10 100%)` }}
          />

          <div className="relative rounded-2xl border border-white/[0.10] bg-[#0a0a16] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">

            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.025] border-b border-white/[0.06]">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[11px] font-mono text-white/25">MDPilot — {demo.label} Mode</span>
              </div>
              {/* Phase status */}
              <div className="flex items-center gap-1.5">
                {phase === 'idle' && <span className="text-[10px] font-mono text-white/20">ready</span>}
                {(phase === 'typing' || phase === 'revealing') && (
                  <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: demo.accent }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: demo.accent }} />
                    {phase === 'revealing' ? 'reading file…' : 'typing…'}
                  </span>
                )}
                {phase === 'analyzing' && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#A855F7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse" />analyzing…
                  </span>
                )}
                {phase === 'streaming' && (
                  <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: demo.accent }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: demo.accent }} />streaming…
                  </span>
                )}
                {phase === 'done' && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#34D399]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />done
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">

              {/* ── Left pane ── */}
              <div className="p-5 space-y-5">

                {/* Input area */}
                <div>
                  <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.1em] mb-2">{demo.inputLabel}</p>
                  {demo.isTyped ? (
                    <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 min-h-[80px]">
                      <p className="text-[12px] font-mono text-white/65 leading-relaxed whitespace-pre-wrap break-words">
                        {inputText}
                        {phase === 'typing' && (
                          <span className="inline-block w-[7px] h-[14px] rounded-[2px] ml-0.5 animate-pulse align-middle" style={{ background: demo.accent }} />
                        )}
                      </p>
                      {phase === 'idle' && (
                        <p className="text-[11px] font-mono text-white/15 absolute inset-3 pointer-events-none">
                          {demo.inputText.slice(0, 35)}…
                        </p>
                      )}
                    </div>
                  ) : (
                    <DroppedFileDisplay demo={demo} visible={fileRevealed || phase === 'analyzing' || phase === 'streaming' || phase === 'done'} />
                  )}
                </div>

                {/* Pipeline */}
                <div>
                  <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.1em] mb-3">Pipeline</p>
                  <div className="space-y-2">
                    {demo.pipelineSteps.map((step, i) => {
                      const done = analyzeStep > i || phase === 'streaming' || phase === 'done';
                      const active = analyzeStep === i && phase === 'analyzing';
                      return (
                        <div key={step} className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            done ? 'bg-[#34D399]/20 border border-[#34D399]/40' : active ? 'border' : 'bg-white/[0.04] border border-white/[0.08]'
                          }`}
                            style={active ? { borderColor: `${demo.accent}60`, background: `${demo.accent}15` } : undefined}
                          >
                            {done ? (
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            ) : active ? (
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: demo.accent }} />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            )}
                          </div>
                          <span className={`text-[11px] font-mono transition-colors duration-200 ${done ? 'text-[#34D399]/70' : active ? 'text-white/70' : 'text-white/20'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Token meter */}
                {(phase === 'streaming' || phase === 'done') && (
                  <div>
                    <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.1em] mb-2">Output size</p>
                    <TokenMini tokens={tokenCount} />
                  </div>
                )}

                {/* CTA */}
                <div className="pt-1">
                  {phase === 'idle' || phase === 'done' ? (
                    <button
                      onClick={startDemo}
                      className="w-full py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer"
                      style={phase === 'idle' ? {
                        background: `linear-gradient(135deg, ${demo.accent}, ${demo.accent}bb)`,
                        color: '#07070f',
                        boxShadow: `0 0 20px ${demo.accent}30`,
                      } : {
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {phase === 'done' ? '↺ Replay' : '▶ Run demo'}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl text-[12px] font-bold text-center text-white/20 bg-white/[0.03] border border-white/[0.05]">
                      Generating…
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right pane: output ── */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: demo.outputAccent, background: `${demo.outputAccent}10`, borderColor: `${demo.outputAccent}25` }}
                    >
                      {demo.outputFilename}
                    </span>
                    {phase === 'done' && <span className="text-[10px] font-mono text-[#34D399]">✓ optimized</span>}
                  </div>
                  {phase === 'done' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/25">↓ 38% saved</span>
                      <button className="text-[10px] font-mono text-[#4FACFF]/60 hover:text-[#4FACFF] transition-colors cursor-pointer">copy</button>
                    </div>
                  )}
                </div>

                <div
                  ref={outputRef}
                  className="flex-1 p-5 font-mono text-[12px] leading-relaxed overflow-y-auto min-h-[280px] max-h-[400px] text-white/60"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {phase === 'idle' && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${demo.accent}10`, border: `1px solid ${demo.accent}20` }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={demo.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </div>
                      <p className="text-[11px] text-white/25">Press ▶ to see {demo.outputFilename} generate live</p>
                    </div>
                  )}
                  {(phase === 'typing' || phase === 'revealing' || phase === 'analyzing') && (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div className="flex gap-1.5">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full"
                            style={{ background: demo.accent, opacity: 0.5, animation: `pulse 1s ease-in-out ${i*200}ms infinite` }} />
                        ))}
                      </div>
                      <p className="text-[11px] font-mono text-white/25">
                        {phase === 'analyzing' && analyzeStep < demo.pipelineSteps.length
                          ? demo.pipelineSteps[analyzeStep] : 'Preparing…'}
                      </p>
                    </div>
                  )}
                  {(phase === 'streaming' || phase === 'done') && (
                    <pre className="whitespace-pre-wrap break-words text-white/60">
                      <MarkdownHighlight text={outputText} />
                      {phase === 'streaming' && (
                        <span className="inline-block w-[7px] h-[14px] rounded-[2px] ml-0.5 animate-pulse align-middle" style={{ background: demo.accent }} />
                      )}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-12 blur-2xl rounded-full pointer-events-none"
            style={{ background: `${demo.accent}12` }} />
        </div>

        {/* Below demo */}
        <div className="text-center mt-10">
          <p className="text-[13px] text-white/30 mb-4">Want the real thing? It's free and instant.</p>
          <a href="/generate" className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
            style={{ color: demo.accent }}>
            Try {demo.label} mode for real
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
