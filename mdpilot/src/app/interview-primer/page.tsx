'use client';

import { useState } from 'react';

type Level = 'junior' | 'mid' | 'senior' | 'staff';

const LEVEL_OPTIONS: { id: Level; label: string; desc: string }[] = [
  { id: 'junior',  label: 'Junior (0–2 yrs)',    desc: 'Fundamentals, learning velocity, mentorship fit' },
  { id: 'mid',     label: 'Mid (2–5 yrs)',        desc: 'Ownership, system design basics, debugging depth' },
  { id: 'senior',  label: 'Senior (5–10 yrs)',    desc: 'Architecture, cross-team influence, trade-offs' },
  { id: 'staff',   label: 'Staff / Principal',    desc: 'Org-level impact, ambiguity, technical strategy' },
];

export default function InterviewPrimerPage() {
  const [role, setRole]         = useState('');
  const [level, setLevel]       = useState<Level>('mid');
  const [jd, setJd]             = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);

  const canGenerate = role.trim().length > 2;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch('/api/interview-primer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role.trim(), level, jd: jd.trim() }),
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

  // ── Output view ───────────────────────────────────────────────────────────────

  if (output) {
    return (
      <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">Interview Primer</h1>
              <p className="text-sm text-[var(--md-text-secondary)] mt-0.5">{role} · {LEVEL_OPTIONS.find(l => l.id === level)?.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOutput(null)}
                className="text-sm text-[var(--md-text-tertiary)] hover:text-[var(--md-text)] transition-colors px-3 py-1.5"
              >
                ← Back
              </button>
              <button
                onClick={void handleCopy}
                className="text-sm bg-[#4FACFF]/80 text-white rounded-lg px-4 py-1.5 hover:bg-[#4FACFF] transition-colors"
              >
                {copied ? 'Copied!' : 'Copy prompt'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--md-blue)]/20 bg-[var(--md-blue)]/5 px-4 py-3 mb-4 flex items-start gap-2">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-xs text-[var(--md-text-secondary)] leading-relaxed">
              Copy this prompt and paste it into Claude, ChatGPT, or any AI assistant before your interview. It sets the AI up as your personal interview coach.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--md-text-tertiary)]">Interview coach prompt</span>
              <span className="ml-auto text-xs text-[var(--md-text-tertiary)]">{output.split(' ').length} words</span>
            </div>
            <pre className="p-5 text-sm font-mono leading-relaxed overflow-auto whitespace-pre-wrap text-[var(--md-text-secondary)] max-h-[65vh]">
              {output}
            </pre>
          </div>

          <p className="mt-4 text-xs text-center text-[var(--md-text-tertiary)]">
            Paste this into any AI model to get a practice session tailored to your role and experience level.
          </p>
        </div>
      </div>
    );
  }

  // ── Input form ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full bg-[#4FACFF]/10 text-[#4FACFF] border border-[#4FACFF]/20 mb-3">
            Interview primer
          </div>
          <h1 className="text-2xl font-semibold mb-1">Generate your AI interview coach</h1>
          <p className="text-sm text-[var(--md-text-secondary)]">
            Creates a ready-to-paste prompt that turns any AI model into a personalised interview coach for your specific role and level.
          </p>
        </div>

        {/* Role input */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-[var(--md-text-secondary)] mb-2">
            Role title <span className="text-[var(--md-coral)]">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer, Backend Engineer — Python, Staff SRE"
            className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm focus:outline-none focus:border-[#4FACFF]/50 transition-colors text-[var(--md-text)] placeholder:text-white/20"
            autoFocus
          />
        </div>

        {/* Experience level */}
        <div className="mb-5">
          <p className="text-xs font-medium text-[var(--md-text-secondary)] mb-2.5">Experience level</p>
          <div className="flex flex-col gap-2">
            {LEVEL_OPTIONS.map(opt => {
              const active = level === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setLevel(opt.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    active
                      ? 'border-[#4FACFF]/50 bg-[#4FACFF]/[0.07]'
                      : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    active ? 'border-[#4FACFF] bg-[#4FACFF]' : 'border-white/20'
                  }`}>
                    {active && <div className="w-1 h-1 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${active ? 'text-[var(--md-text)]' : 'text-[var(--md-text-secondary)]'}`}>{opt.label}</p>
                    <p className={`text-[11px] ${active ? 'text-[var(--md-text-secondary)]' : 'text-[var(--md-text-tertiary)]'}`}>{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* JD paste (optional) */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-[var(--md-text-secondary)] mb-2">
            Job description <span className="text-[var(--md-text-tertiary)] font-normal">(optional — makes the coach much more targeted)</span>
          </label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder={"Paste the job description here.\n\nThe AI coach will tailor questions to the specific technologies, responsibilities, and scope mentioned."}
            rows={7}
            className="w-full rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[#4FACFF]/50 transition-colors text-[var(--md-text)] placeholder:text-white/20 leading-relaxed"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={void handleGenerate}
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
              Building your interview coach…
            </span>
          ) : (
            'Generate interview primer'
          )}
        </button>

        {!canGenerate && role.trim().length > 0 && (
          <p className="mt-2 text-xs text-center text-[var(--md-text-tertiary)]">Enter a role title to continue.</p>
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
              'Role-specific warm-up questions based on your level',
              'System design scope calibrated to your seniority',
              'Behavioral question prompts using your actual experience',
              'Company-research deep-dive instructions',
              'Red-flag signals to probe for (culture, tech debt, churn)',
              'A structured practice session you can run with any AI',
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-[#4FACFF]/60 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-[11px] text-[var(--md-text-tertiary)]">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
