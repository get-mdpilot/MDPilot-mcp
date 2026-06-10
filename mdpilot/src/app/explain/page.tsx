'use client';

import { useState } from 'react';
import type { ReaderAudience } from '@/types';
import { LabsBreadcrumb } from '@/components/ui/labs-breadcrumb';

// ── Audience card data ────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS: { id: ReaderAudience; icon: string; label: string; desc: string }[] = [
  {
    id: 'non_technical', icon: '💼', label: 'Non-technical reader',
    desc: 'Founder, PM, investor, or client. Every term defined. Plain language.',
  },
  {
    id: 'learner', icon: '🎓', label: "I'm learning this code",
    desc: 'Explain the why behind each decision, not just the what.',
  },
  {
    id: 'team', icon: '👥', label: 'New team member',
    desc: 'Assume engineering skills, explain project-specific choices.',
  },
  {
    id: 'ai_agent', icon: '🤖', label: 'AI agent',
    desc: 'Terse, machine-parseable walkthrough for an agent working in this codebase.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExplainPage() {
  const [code, setCode]                 = useState('');
  const [audience, setAudience]         = useState<ReaderAudience>('non_technical');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput]             = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);

  const canGenerate = code.trim().length > 30;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: 'walkthrough',
          request: {
            projectType: 'other',
            audience: 'team',
            aiTools: [],
            detectedStack: [],
            rawStackInput: code,
            selectedFiles: ['walkthrough'],
            generateOptions: { audience, readingLevel: 'plain', includeReasoning: true },
          },
        }),
      });
      const data = await res.json() as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setOutput(data.content ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WALKTHROUGH.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Output view ───────────────────────────────────────────────────────────────

  if (output) {
    return (
      <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">WALKTHROUGH.md</h1>
              <p className="text-sm text-[var(--md-text-secondary)] mt-0.5">Ready for {AUDIENCE_OPTIONS.find(o => o.id === audience)?.label ?? audience}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setOutput(null); }}
                className="text-sm text-[var(--md-text-tertiary)] hover:text-[var(--md-text)] transition-colors px-3 py-1.5"
              >
                ← Back
              </button>
              <button
                onClick={handleDownload}
                className="text-sm border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => void handleCopy()}
                className="text-sm bg-[#4FACFF]/80 text-white rounded-lg px-4 py-1.5 hover:bg-[#4FACFF] transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--md-text-tertiary)]">WALKTHROUGH.md</span>
              <span className="ml-auto text-xs text-[var(--md-text-tertiary)]">{output.split('\n').length} lines</span>
            </div>
            <pre className="p-5 text-sm font-mono leading-relaxed overflow-auto whitespace-pre-wrap text-[var(--md-text-secondary)] max-h-[70vh]">
              {output}
            </pre>
          </div>

          <p className="mt-4 text-xs text-center text-[var(--md-text-tertiary)]">
            Place WALKTHROUGH.md at your project root — Claude Code and Cursor will surface it in context.
          </p>
        </div>
      </div>
    );
  }

  // ── Input form ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
      <LabsBreadcrumb page="Explain" />
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full bg-[#4FACFF]/10 text-[#4FACFF] border border-[#4FACFF]/20 mb-3">
            Explain mode
          </div>
          <h1 className="text-2xl font-semibold mb-1">Explain code to anyone</h1>
          <p className="text-sm text-[var(--md-text-secondary)]">
            Paste code or a file. We&apos;ll generate a WALKTHROUGH.md that explains it to your chosen audience.
          </p>
        </div>

        {/* Code input */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-[var(--md-text-secondary)] mb-2">
            Paste code or file content
          </label>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={"// Paste any code here — a file, a function, a module, an API route…\n// The more context you give, the better the explanation."}
            rows={12}
            className="w-full rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[#4FACFF]/50 transition-colors text-[var(--md-text)] placeholder:text-white/15 leading-relaxed"
            autoFocus
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-[var(--md-text-tertiary)]">Works with any language — JS, Python, Go, Rust, SQL, configs…</p>
            <span className="text-[11px] text-[var(--md-text-tertiary)] font-mono">{code.length.toLocaleString()} chars</span>
          </div>
        </div>

        {/* Audience selector */}
        <div className="mb-6">
          <p className="text-xs font-medium text-[var(--md-text-secondary)] mb-2.5">Who will read the explanation?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AUDIENCE_OPTIONS.map(opt => {
              const active = audience === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAudience(opt.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    active
                      ? 'border-[#4FACFF]/50 bg-[#4FACFF]/[0.07]'
                      : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    active ? 'border-[#4FACFF] bg-[#4FACFF]' : 'border-white/20'
                  }`}>
                    {active && <div className="w-1 h-1 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold mb-0.5 ${active ? 'text-[var(--md-text)]' : 'text-[var(--md-text-secondary)]'}`}>
                      <span className="mr-1.5">{opt.icon}</span>{opt.label}
                    </p>
                    <p className={`text-[11px] leading-snug ${active ? 'text-[var(--md-text-secondary)]' : 'text-[var(--md-text-tertiary)]'}`}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={() => void handleGenerate()}
          disabled={!canGenerate || isGenerating}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
            canGenerate && !isGenerating
              ? 'bg-[#4FACFF]/80 text-white hover:bg-[#4FACFF]'
              : 'bg-white/5 text-[var(--md-text-tertiary)] cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating WALKTHROUGH.md…
            </span>
          ) : (
            'Generate WALKTHROUGH.md'
          )}
        </button>

        {!canGenerate && code.trim().length > 0 && (
          <p className="mt-2 text-xs text-center text-[var(--md-text-tertiary)]">Paste at least a few lines of code to continue.</p>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-[var(--md-coral)]/30 bg-[var(--md-coral-light)] px-4 py-3">
            <p className="text-sm text-[var(--md-coral)] font-medium mb-0.5">Generation failed</p>
            <p className="text-xs text-[var(--md-coral)]">{error}</p>
          </div>
        )}

        {/* What you get */}
        <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <p className="text-xs font-medium text-[var(--md-text-secondary)] mb-3">What you get</p>
          <div className="space-y-2">
            {[
              ['## What this is', 'One-paragraph plain-English summary'],
              ['## The big picture', 'Architecture and flow — how pieces connect'],
              ['## Walkthrough', 'Step-by-step through the important code paths'],
              ['## Where things live', 'File map — where to look for what'],
              ['## If you want to change X', 'Common edits and where to make them'],
              ['## Glossary', 'Every technical term defined (non-technical + learner audiences)'],
            ].map(([heading, desc]) => (
              <div key={heading} className="flex items-start gap-3">
                <span className="text-[11px] font-mono text-[#4FACFF]/70 shrink-0 pt-0.5 w-40">{heading}</span>
                <span className="text-[11px] text-[var(--md-text-tertiary)]">{desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
