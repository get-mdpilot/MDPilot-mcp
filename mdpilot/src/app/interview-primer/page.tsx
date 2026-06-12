'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { LabsBreadcrumb } from '@/components/ui/labs-breadcrumb';

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
      <div className="min-h-screen bg-[var(--md-bg)] px-4 sm:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-semibold text-xl">Interview Primer</h1>
              <p className="text-sm text-[var(--md-text-secondary)] mt-0.5">{role} · {LEVEL_OPTIONS.find(l => l.id === level)?.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOutput(null)}
                className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors px-3 py-1.5 cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={() => void handleCopy()}
                className="text-sm bg-[var(--md-accent)] text-[var(--md-accent-ink)] font-semibold rounded-[10px] px-4 py-1.5 hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-sm)] cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy prompt'}
              </button>
            </div>
          </div>

          <div className="rounded-[var(--md-radius)] border border-[var(--md-info)]/40 bg-[var(--md-info-dim)] px-4 py-3 mb-4 flex items-start gap-2">
            <Lightbulb size={14} className="text-[var(--md-info)] mt-0.5 shrink-0" aria-hidden />
            <p className="text-xs text-[var(--md-text-secondary)] leading-relaxed">
              Copy this prompt and paste it into Claude, ChatGPT, or any AI assistant before your interview. It sets the AI up as your personal interview coach.
            </p>
          </div>

          <div className="rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-surface)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--md-border)] flex items-center gap-2">
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
    <div className="min-h-screen bg-[var(--md-bg)] px-4 sm:px-8 py-12">
      <LabsBreadcrumb page="Interview Primer" />
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="section-label mb-3">Interview primer</p>
          <h1 className="font-display font-semibold text-2xl mb-1">Generate your AI interview coach</h1>
          <p className="text-sm text-[var(--md-text-secondary)]">
            Creates a ready-to-paste prompt that turns any AI model into a personalised interview coach for your specific role and level.
          </p>
        </div>

        {/* Role input */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-[var(--md-text-secondary)] mb-2">
            Role title <span className="text-[var(--md-caution)]">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer, Backend Engineer — Python, Staff SRE"
            className="w-full rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-surface)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--md-accent)] transition-colors text-[var(--md-text)] placeholder:text-[var(--md-text-tertiary)]"
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
                  className={`flex items-center gap-3 rounded-[var(--md-radius)] border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                    active
                      ? 'border-[var(--md-accent)] bg-[var(--md-accent-dim)]'
                      : 'border-[var(--md-border)] bg-[var(--md-surface)] hover:border-[var(--md-border-strong)] hover:bg-[var(--md-surface-2)]'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    active ? 'border-[var(--md-accent)] bg-[var(--md-accent)]' : 'border-[var(--md-border-strong)]'
                  }`}>
                    {active && <div className="w-1 h-1 rounded-full bg-[var(--md-accent-ink)]" />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${active ? 'text-[var(--md-text)]' : 'text-[var(--md-text-secondary)]'}`}>{opt.label}</p>
                    <p className="text-[11px] text-[var(--md-text-secondary)]">{opt.desc}</p>
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
            className="w-full rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-surface)] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[var(--md-accent)] transition-colors text-[var(--md-text)] placeholder:text-[var(--md-text-tertiary)] leading-relaxed"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={() => void handleGenerate()}
          disabled={!canGenerate || isGenerating}
          className={`w-full rounded-[10px] py-3 text-sm font-semibold transition-all duration-200 ${
            canGenerate && !isGenerating
              ? 'bg-[var(--md-accent)] text-[var(--md-accent-ink)] hover:bg-[var(--md-accent-strong)] hover:-translate-y-px shadow-[var(--shadow-sm)] cursor-pointer'
              : 'bg-[var(--md-surface-2)] text-[var(--md-text-tertiary)] cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              In flight… building your interview coach
            </span>
          ) : (
            'Generate interview primer'
          )}
        </button>

        {!canGenerate && role.trim().length > 0 && (
          <p className="mt-2 text-xs text-center text-[var(--md-text-tertiary)]">Enter a role title to continue.</p>
        )}

        {error && (
          <div className="mt-4 rounded-[var(--md-radius)] border border-[var(--md-caution)]/40 bg-[var(--md-caution-dim)] px-4 py-3">
            <p className="text-sm text-[var(--md-caution)] font-medium mb-0.5">Generation failed</p>
            <p className="text-xs text-[var(--md-text-secondary)]">{error}</p>
          </div>
        )}

        {/* What you get */}
        <div className="mt-8 rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-surface)] p-4">
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
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-[var(--md-go)] shrink-0 mt-0.5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-[11px] text-[var(--md-text-secondary)]">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
