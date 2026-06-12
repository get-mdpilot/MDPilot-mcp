'use client';

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { countTokens } from '@/lib/tokenizer';
import { LabsBreadcrumb } from '@/components/ui/labs-breadcrumb';

interface AnalysisResult {
  provider: string;
  analysis: Record<string, unknown>;
  refined_prompt: string;
  formatted: {
    flux: string;
    stable_diffusion: string;
    midjourney: string;
    dalle: string;
    gemini: string;
    negative_prompt: string;
    tags: string[];
  };
}

type VisionProvider = 'gemini' | 'groq';

const FORMAT_TABS: { id: keyof AnalysisResult['formatted']; label: string }[] = [
  { id: 'flux',             label: 'FLUX' },
  { id: 'stable_diffusion', label: 'Stable Diffusion' },
  { id: 'midjourney',       label: 'Midjourney' },
  { id: 'dalle',            label: 'DALL-E' },
  { id: 'gemini',           label: 'Gemini' },
];

const ANALYSIS_LABELS: Record<string, string> = {
  subject: 'Subject', composition: 'Composition', lighting: 'Lighting',
  colors: 'Colors', style: 'Style', camera: 'Camera', medium: 'Medium',
  mood: 'Mood', technical: 'Technical', text_elements: 'Text', saturation: 'Saturation', contrast: 'Contrast',
};

function humanSize(b: number) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// Flatten any value (string / number / array / nested object) into readable text.
// Vision models sometimes return objects or arrays instead of plain strings.
function toDisplay(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(toDisplay).filter(Boolean).join(', ');
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k}: ${toDisplay(val)}`)
      .filter(Boolean)
      .join(' · ');
  }
  return String(v);
}

// Pull hex codes out of any value shape (string, array of {hex}, etc.) for swatches
function extractHexes(v: unknown): string[] {
  const hay = typeof v === 'string' ? v : JSON.stringify(v);
  return (hay.match(/#[0-9a-fA-F]{6}/g) ?? []).slice(0, 6);
}

export default function ImageToPromptPage() {
  const [image, setImage]         = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [provider, setProvider]   = useState<VisionProvider>('groq');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage]         = useState('');
  const [result, setResult]       = useState<AnalysisResult | null>(null);
  const [activeFormat, setActiveFormat] = useState<keyof AnalysisResult['formatted']>('flux');
  const [error, setError]         = useState<string | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build/revoke object URL for preview
  useEffect(() => {
    if (!image) { setPreview(null); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const pickFile = (f: File | undefined) => { if (f) { setImage(f); setError(null); setResult(null); } };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  async function handleAnalyze() {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    const stages = ['Encoding image…', 'Analyzing with vision model…', 'Refining prompt…', 'Formatting for all models…'];
    let idx = 0;
    setStage(stages[0]);
    const interval = setInterval(() => { idx = Math.min(idx + 1, stages.length - 1); setStage(stages[idx]); }, 2500);

    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('provider', provider);
      const res = await fetch('/api/image-to-prompt', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setActiveFormat('flux');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  }

  const copy = (key: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  function downloadAll() {
    if (!result) return;
    const f = result.formatted;
    const bar = '='.repeat(50);
    const content = [
      'MDPilot Image-to-Prompt Analysis',
      `Source: ${image?.name ?? 'image'}`,
      `\n${bar}\nREFINED BASE PROMPT\n${result.refined_prompt}`,
      `\n${bar}\nFLUX\n${f.flux}`,
      `\n${bar}\nSTABLE DIFFUSION\n${f.stable_diffusion}\n\nNEGATIVE: ${f.negative_prompt}`,
      `\n${bar}\nMIDJOURNEY\n${f.midjourney}`,
      `\n${bar}\nDALL-E\n${f.dalle}`,
      `\n${bar}\nGEMINI IMAGE\n${f.gemini}`,
      `\n${bar}\nTAGS\n${(f.tags ?? []).join(', ')}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = `image-prompt-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  // ════════════════════════════════════════════════════════════════════════
  // RESULTS VIEW
  // ════════════════════════════════════════════════════════════════════════
  if (result) {
    const activePrompt = String(result.formatted[activeFormat] ?? '');
    return (
      <div className="min-h-screen bg-[var(--md-bg)] px-4 sm:px-8 py-12">
        <LabsBreadcrumb page="Image → Prompt" />
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-xl">Cleared for takeoff — recreation prompts</h2>
              <p className="text-xs text-[var(--md-text-tertiary)] mt-0.5">Analyzed with {result.provider}</p>
            </div>
            <button onClick={() => { setResult(null); setImage(null); }}
              className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors cursor-pointer">
              ↻ New image
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT — analysis breakdown */}
            <div className="lg:w-[40%] shrink-0">
              {preview && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={preview} alt="source" className="w-full rounded-[var(--md-radius)] border border-[var(--md-border)] mb-4 max-h-56 object-cover" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {Object.entries(result.analysis).map(([k, v]) => {
                  const hexes = k === 'colors' ? extractHexes(v) : [];
                  return (
                    <div key={k} className="rounded-[var(--md-radius-sm)] border border-[var(--md-border)] bg-[var(--md-surface)] px-3 py-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-accent)] mb-0.5">
                        {ANALYSIS_LABELS[k] ?? k}
                      </p>
                      <p className="text-xs text-[var(--md-text-secondary)] leading-relaxed">{toDisplay(v)}</p>
                      {hexes.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {hexes.map(h => (
                            <span key={h} className="w-3 h-3 rounded-full border border-[var(--md-border-strong)]" style={{ background: h }} title={h} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — formatted prompts */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-[var(--md-border)] mb-3">
                {FORMAT_TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveFormat(t.id)}
                    className={`px-3.5 py-2 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors cursor-pointer ${
                      activeFormat === t.id
                        ? 'border-[var(--md-accent)] text-[var(--md-accent)]'
                        : 'border-transparent text-[var(--md-text-secondary)] hover:text-[var(--md-text)]'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active prompt */}
              <div className="relative">
                <textarea
                  readOnly value={activePrompt} rows={6}
                  className="w-full rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-surface)] p-4 pr-4 text-xs font-mono leading-relaxed resize-none focus:outline-none"
                />
                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-[var(--md-text-tertiary)] pointer-events-none">
                  {countTokens(activePrompt)} tokens
                </span>
              </div>

              {/* Negative prompt for SD */}
              {activeFormat === 'stable_diffusion' && result.formatted.negative_prompt && (
                <div className="mt-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-caution)] mb-1">Negative prompt</p>
                  <textarea readOnly value={result.formatted.negative_prompt} rows={2}
                    className="w-full rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-surface)] p-3 text-xs font-mono resize-none focus:outline-none" />
                </div>
              )}

              {/* Tags */}
              {result.formatted.tags?.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--md-text-tertiary)]">Tags</p>
                    <button onClick={() => copy('tags', result.formatted.tags.join(', '))}
                      className="text-[11px] text-[var(--md-accent)] hover:underline cursor-pointer">
                      {copied === 'tags' ? '✓ Copied' : 'Copy all'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.formatted.tags.map(t => (
                      <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--md-surface-2)] border border-[var(--md-border)] text-[var(--md-text-secondary)]">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-5">
                <button onClick={() => copy('prompt', activePrompt)}
                  className="text-sm px-4 py-2 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] font-semibold hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-sm)] cursor-pointer">
                  {copied === 'prompt' ? '✓ Copied' : 'Copy prompt'}
                </button>
                <button onClick={downloadAll}
                  className="text-sm px-4 py-2 rounded-[10px] border border-[var(--md-border-strong)] text-[var(--md-text-secondary)] hover:text-[var(--md-text)] hover:border-[var(--md-accent)] transition-colors duration-200 cursor-pointer">
                  Download all prompts (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // UPLOAD / ANALYZE VIEW
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[var(--md-bg)] px-4 sm:px-8 py-12">
      <LabsBreadcrumb page="Image → Prompt" />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="section-label mb-4 mx-auto w-fit">Image → Prompt</p>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-[-0.015em] mb-2">Recreate any image with AI</h1>
          <p className="text-sm text-[var(--md-text-secondary)]">
            Upload a screenshot or photo. Get a precise prompt formatted for FLUX, Stable Diffusion, Midjourney, DALL-E, and Gemini.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-[var(--md-radius)] border border-[var(--md-caution)]/40 bg-[var(--md-caution-dim)] px-4 py-3">
            <p className="text-sm text-[var(--md-caution)] whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Analyzing */}
        {isAnalyzing && (
          <div className="rounded-[var(--md-radius-lg)] border border-[var(--md-border-strong)] bg-[var(--md-surface)] p-8 text-center">
            {preview && /* eslint-disable-next-line @next/next/no-img-element */ (
              <img src={preview} alt="" className="mx-auto rounded-[var(--md-radius)] max-h-40 object-cover mb-4 opacity-80" />
            )}
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="animate-spin w-4 h-4 text-[var(--md-accent)]" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium text-[var(--md-accent)]">In flight… {stage}</span>
            </div>
            <p className="text-xs text-[var(--md-text-secondary)]">3-stage pipeline — usually 10–20 seconds</p>
          </div>
        )}

        {/* Image selected */}
        {image && !isAnalyzing && (
          <div className="rounded-[var(--md-radius-lg)] border border-[var(--md-border)] bg-[var(--md-surface)] p-6">
            {preview && /* eslint-disable-next-line @next/next/no-img-element */ (
              <img src={preview} alt="preview" className="w-full rounded-[var(--md-radius)] max-h-52 object-cover mb-4" />
            )}
            <p className="text-sm font-medium truncate">{image.name}</p>
            <p className="text-xs text-[var(--md-text-tertiary)] mb-4">{humanSize(image.size)}</p>

            {/* Provider selector */}
            <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--md-text-tertiary)] mb-2">Analyze with</p>
            <div className="flex gap-2 mb-2">
              {([['groq', 'Groq Llama Vision'], ['gemini', 'Gemini Flash']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setProvider(id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[10px] border transition-all duration-200 cursor-pointer ${
                    provider === id
                      ? 'border-[var(--md-accent)] bg-[var(--md-accent-dim)] text-[var(--md-accent)]'
                      : 'border-[var(--md-border)] text-[var(--md-text-secondary)] hover:text-[var(--md-text)]'
                  }`}>
                  {label} <span className="text-[var(--md-go)]">✓ Free</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--md-text-tertiary)] mb-5">
              Gemini: better at artistic styles · Groq: faster for product photos
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => void handleAnalyze()}
                className="flex-1 px-5 py-2.5 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] text-sm font-semibold hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-sm)] cursor-pointer">
                Analyze image
              </button>
              <button onClick={() => setImage(null)}
                className="px-5 py-2.5 rounded-[10px] border border-[var(--md-border-strong)] text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors duration-200 cursor-pointer">
                Choose different image
              </button>
            </div>
          </div>
        )}

        {/* Drop zone */}
        {!image && !isAnalyzing && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center text-center rounded-[var(--md-radius-lg)] border-2 border-dashed cursor-pointer transition-all duration-150 px-6 ${
                isDragging
                  ? 'border-[var(--md-accent)] bg-[var(--md-accent-dim)]'
                  : 'border-[var(--md-border-strong)] bg-[var(--md-surface)] hover:border-[var(--md-accent)]/60 hover:bg-[var(--md-surface-2)]'
              }`}
              style={{ minHeight: 280 }}
            >
              <div className={`w-14 h-14 rounded-[var(--md-radius)] flex items-center justify-center mb-4 transition-colors ${
                isDragging ? 'bg-[var(--md-accent)] text-[var(--md-accent-ink)]' : 'bg-[var(--md-surface-2)] text-[var(--md-accent)]'
              }`}>
                <ImageIcon size={26} strokeWidth={1.5} aria-hidden />
              </div>
              <p className="text-lg font-semibold mb-1">{isDragging ? 'Drop to analyze' : 'Drop an image here'}</p>
              <p className="text-sm text-[var(--md-text-secondary)] mb-5">or click to browse</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {['.jpg', '.jpeg', '.png', '.webp'].map(c => (
                  <span key={c} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--md-surface-2)] border border-[var(--md-border)] text-[var(--md-text-tertiary)]">{c}</span>
                ))}
              </div>
              <p className="text-[11px] text-[var(--md-text-tertiary)] mt-4">Up to 4MB</p>
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => pickFile(e.target.files?.[0])} className="hidden" />
          </>
        )}
      </div>
    </div>
  );
}
