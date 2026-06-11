'use client';

import { useState, useEffect, useRef } from 'react';
import OutputView, { type OptimizerSummary } from '@/components/OutputView';
import { LabsBreadcrumb } from '@/components/ui/labs-breadcrumb';
import { countTokens } from '@/lib/tokenizer';
import { optimizeFiles } from '@/lib/optimizer';
import type { GeneratedFile, MDFileType } from '@/types';

// ── Helpers ─────────────────────────────────────────────────────────────────
function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    pdf: '📄', docx: '📝', doc: '📝',
    pptx: '📊', ppt: '📊',
    xlsx: '📈', xls: '📈', csv: '📈',
    html: '🌐', htm: '🌐',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', webp: '🖼️',
    json: '{ }', xml: '< >', zip: '📦', epub: '📖',
    txt: '📄', rtf: '📄', md: '📑',
  };
  return icons[ext ?? ''] || '📄';
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SUPPORTED_CHIPS = ['.pdf', '.docx', '.pptx', '.xlsx', '.html', '.png', '.jpg', '.csv'];
const ACCEPT = '.pdf,.docx,.pptx,.xlsx,.csv,.html,.htm,.txt,.rtf,.md,.jpg,.jpeg,.png,.gif,.webp,.json,.xml,.zip,.epub';

interface ConvertResult {
  filename: string;
  originalName: string;
  originalSize: number;
  content: string;
  tokenCount: number;
}

const HOW_TO =
  '📍 Save this markdown anywhere, or pipe it into Generate / Task mode below.\n\nConverted with Microsoft MarkItDown. Tables, headings, and lists are preserved; images and complex layout may be simplified. Scanned PDFs (no text layer) won\'t extract well.';

export default function ConvertPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult]           = useState<ConvertResult | null>(null);
  const [error, setError]             = useState<string | null>(null);

  // Output state (fed to shared OutputView)
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [optimizer, setOptimizer]           = useState<OptimizerSummary | null>(null);

  // Setup check
  const [markitdownReady, setMarkitdownReady] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Health check on mount
  useEffect(() => {
    fetch('/api/convert')
      .then(r => r.json())
      .then(d => setMarkitdownReady(!!d.available))
      .catch(() => setMarkitdownReady(false));
  }, []);

  // ── Drop zone handlers ─────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setError(null); }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setError(null); }
  };

  // ── Convert ────────────────────────────────────────────────────────────────
  async function handleConvert() {
    if (!file) return;
    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res  = await fetch('/api/convert', { method: 'POST', body: formData });
      const data = await res.json() as { content: string; filename: string; originalName: string; originalSize: number; error?: string; code?: string };
      if (!res.ok) {
        if (data.code === 'NOT_INSTALLED') setMarkitdownReady(false);
        throw new Error(data.error ?? 'Conversion failed');
      }

      const tokenCount = countTokens(data.content);
      setResult({ filename: data.filename, originalName: data.originalName, originalSize: data.originalSize, content: data.content, tokenCount });

      // Run optimizer
      const opt = optimizeFiles([{ type: 'context' as MDFileType, filename: data.filename, content: data.content }]);
      setOptimizer({ totalTokensBefore: opt.totalTokensBefore, totalTokensAfter: opt.totalTokensAfter, passes: opt.passes });
      setGeneratedFiles([{
        type: 'context' as MDFileType,
        filename: data.filename,
        content: data.content,
        tokenCount,
        optimizedContent: opt.files[0]?.optimizedContent ?? data.content,
        optimizedTokenCount: opt.files[0]?.tokensAfter ?? tokenCount,
        howToUse: HOW_TO,
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setGeneratedFiles([]);
    setOptimizer(null);
  }

  // ── Cross-mode handoff ───────────────────────────────────────────────────
  function handleUseInGenerate() {
    if (!result) return;
    sessionStorage.setItem('mdpilot_convert_context', result.content);
    window.location.href = '/generate?from=convert';
  }
  function handleUseInTask() {
    if (!result) return;
    sessionStorage.setItem('mdpilot_task_input', result.content);
    window.location.href = '/task?from=convert';
  }

  // ════════════════════════════════════════════════════════════════════════
  // STATE B — Conversion complete: shared OutputView + cross-mode CTAs
  // ════════════════════════════════════════════════════════════════════════
  if (result && generatedFiles.length > 0) {
    return (
      <OutputView
        title="Converted to Markdown"
        generatedFiles={generatedFiles}
        setGeneratedFiles={setGeneratedFiles}
        fileStatuses={[]}
        optimizer={optimizer}
        onBack={reset}
        onRetry={() => void handleConvert()}
        backLabel="↻ Convert another"
        footer={
          <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] p-4">
            <p className="text-xs text-[var(--md-text-tertiary)] mb-3">
              {getFileIcon(result.originalName)} {result.originalName} ({humanSize(result.originalSize)}) → {result.filename} · {result.tokenCount.toLocaleString()} tokens
            </p>
            <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-2">Send this content to</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleUseInGenerate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#4FACFF]/30 bg-[#4FACFF]/[0.06] text-[#4FACFF] text-sm font-medium hover:bg-[#4FACFF]/[0.12] transition-colors"
              >
                ✨ Use in Generate mode →
              </button>
              <button
                onClick={handleUseInTask}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--md-coral)]/30 bg-[var(--md-coral-light)] text-[var(--md-coral)] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                📋 Use as task input →
              </button>
            </div>
          </div>
        }
      />
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // STATE A — Drop zone / file selected / converting
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
      <LabsBreadcrumb page="Convert" />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/mdpilot-logo.svg" alt="MDPilot" width={52} height={52} className="w-13 h-13 object-contain drop-shadow-[0_0_12px_rgba(45,212,191,0.30)]" />
          </div>
          <div className="section-label mb-4 mx-auto w-fit" style={{ color: 'var(--md-teal)', borderColor: 'rgba(45,212,191,0.25)', background: 'rgba(45,212,191,0.06)' }}>
            CONVERT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Any file → clean markdown</h1>
          <p className="text-sm text-[var(--md-text-secondary)]">
            Drop a PDF, Word doc, spreadsheet, or image. Get token-efficient markdown via Microsoft MarkItDown.
          </p>
        </div>

        {/* Setup banner */}
        {markitdownReady === false && !bannerDismissed && (
          <div className="mb-6 rounded-xl border border-[var(--md-amber)]/30 bg-[var(--md-amber-light)] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--md-amber)] mb-1.5">⚠️ Convert mode requires MarkItDown</p>
                <p className="text-xs text-[var(--md-amber)] mb-2">Install it, then refresh this page:</p>
                <code className="block text-xs font-mono bg-black/20 text-[var(--md-amber)] rounded-md px-3 py-2">
                  pip install markitdown[all]
                </code>
              </div>
              <button onClick={() => setBannerDismissed(true)} className="text-[var(--md-amber)] hover:opacity-70 text-lg leading-none shrink-0">×</button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-[var(--md-coral)]/30 bg-[var(--md-coral-light)] px-4 py-3">
            <p className="text-sm text-[var(--md-coral)] font-medium mb-1">Conversion failed</p>
            <p className="text-xs text-[var(--md-coral)] whitespace-pre-line">{error}</p>
            <p className="text-xs text-[var(--md-coral)]/70 mt-2">
              Scanned PDFs or complex formatting can fail. Try a different file, or paste the content directly into Task mode.
            </p>
          </div>
        )}

        {/* Converting state */}
        {isConverting && file && (
          <div className="rounded-2xl border border-[var(--md-teal)]/30 bg-[var(--md-teal-light)] p-8 text-center">
            <div className="text-4xl mb-3">{getFileIcon(file.name)}</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="animate-spin w-4 h-4 text-[var(--md-teal)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium text-[var(--md-teal)]">Converting {file.name}…</span>
            </div>
            <p className="text-xs text-[var(--md-teal)]/70">
              {file.size > 5 * 1024 * 1024 ? 'Large files may take up to 30 seconds.' : 'This usually takes a few seconds.'}
            </p>
          </div>
        )}

        {/* File selected (pre-conversion) */}
        {file && !isConverting && (
          <div className="rounded-2xl border border-[var(--md-border)] bg-[var(--md-surface)] p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-4xl">{getFileIcon(file.name)}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-[var(--md-text-tertiary)]">{humanSize(file.size)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => void handleConvert()}
                className="flex-1 px-5 py-2.5 rounded-lg bg-[var(--md-teal)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Convert to Markdown
              </button>
              <button
                onClick={() => { setFile(null); setError(null); }}
                className="px-5 py-2.5 rounded-lg border border-[var(--md-border)] text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors"
              >
                Choose different file
              </button>
            </div>
          </div>
        )}

        {/* Drop zone (no file) */}
        {!file && !isConverting && (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150 px-6 ${
                isDragging
                  ? 'border-[var(--md-teal)] bg-[var(--md-teal-light)] scale-[1.01]'
                  : 'border-white/[0.12] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]'
              }`}
              style={{ minHeight: 320 }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                isDragging ? 'bg-[var(--md-teal)] text-white' : 'bg-white/5 text-[var(--md-teal)]'
              }`}>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 7.5 7.5 12M12 7.5v12" />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-1">{isDragging ? 'Drop to convert' : 'Drop a file here'}</p>
              <p className="text-sm text-[var(--md-text-secondary)] mb-5">or click to browse</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
                {SUPPORTED_CHIPS.map(c => (
                  <span key={c} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[var(--md-text-tertiary)]">{c}</span>
                ))}
              </div>
              <p className="text-[11px] text-[var(--md-text-tertiary)] mt-4">Up to 10MB</p>
            </div>
            <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFileInput} className="hidden" />
          </>
        )}
      </div>
    </div>
  );
}
