'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileText, FileSpreadsheet, Presentation, Globe, Braces, Code2,
  Archive, BookOpen, Image as ImageIcon, File as FileIcon,
  AlertTriangle, Sparkles, ClipboardList, Upload,
} from 'lucide-react';
import OutputView, { type OptimizerSummary } from '@/components/OutputView';
import { LabsBreadcrumb } from '@/components/ui/labs-breadcrumb';
import { countTokens } from '@/lib/tokenizer';
import { optimizeFiles } from '@/lib/optimizer';
import type { GeneratedFile, MDFileType } from '@/types';

// ── Helpers ─────────────────────────────────────────────────────────────────
function getFileIcon(filename: string, size = 16): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const props = { size, 'aria-hidden': true as const };
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return <FileText {...props} />;
  if (['pptx', 'ppt'].includes(ext)) return <Presentation {...props} />;
  if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet {...props} />;
  if (['html', 'htm'].includes(ext)) return <Globe {...props} />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return <ImageIcon {...props} />;
  if (ext === 'json') return <Braces {...props} />;
  if (ext === 'xml') return <Code2 {...props} />;
  if (ext === 'zip') return <Archive {...props} />;
  if (ext === 'epub') return <BookOpen {...props} />;
  return <FileIcon {...props} />;
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
  'Save this markdown anywhere, or pipe it into Generate / Task mode below.\n\nConverted with Microsoft MarkItDown. Tables, headings, and lists are preserved; images and complex layout may be simplified. Scanned PDFs (no text layer) won\'t extract well.';

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
        title="Cleared for takeoff — converted to Markdown"
        generatedFiles={generatedFiles}
        setGeneratedFiles={setGeneratedFiles}
        fileStatuses={[]}
        optimizer={optimizer}
        onBack={reset}
        onRetry={() => void handleConvert()}
        backLabel="↻ Convert another"
        footer={
          <div className="rounded-[var(--md-radius-lg)] border border-[var(--md-border)] bg-[var(--md-surface)] p-4">
            <p className="flex items-center gap-1.5 text-xs text-[var(--md-text-secondary)] mb-3">
              <span className="text-[var(--md-text-tertiary)]">{getFileIcon(result.originalName, 13)}</span>
              {result.originalName} ({humanSize(result.originalSize)}) → {result.filename} · {result.tokenCount.toLocaleString()} tokens
            </p>
            <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-2">Send this content to</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleUseInGenerate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-[var(--md-accent)]/40 bg-[var(--md-accent-dim)] text-[var(--md-accent)] text-sm font-medium hover:border-[var(--md-accent)] transition-colors duration-200 cursor-pointer"
              >
                <Sparkles size={14} aria-hidden /> Use in Generate mode →
              </button>
              <button
                onClick={handleUseInTask}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-[var(--md-info)]/40 bg-[var(--md-info-dim)] text-[var(--md-info)] text-sm font-medium hover:border-[var(--md-info)] transition-colors duration-200 cursor-pointer"
              >
                <ClipboardList size={14} aria-hidden /> Use as task input →
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
    <div className="min-h-screen bg-[var(--md-bg)] px-4 sm:px-8 py-12">
      <LabsBreadcrumb page="Convert" />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/mdpilot-logo.webp" alt="MDPilot" width={52} height={52} className="w-13 h-13 object-contain" />
          </div>
          <p className="section-label mb-4 mx-auto w-fit">Convert</p>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl tracking-[-0.015em] mb-2">Any file → clean markdown</h1>
          <p className="text-sm text-[var(--md-text-secondary)]">
            Drop a PDF, Word doc, spreadsheet, or image. Get token-efficient markdown via Microsoft MarkItDown.
          </p>
        </div>

        {/* Setup banner */}
        {markitdownReady === false && !bannerDismissed && (
          <div className="mb-6 rounded-[var(--md-radius)] border border-[var(--md-caution)]/40 bg-[var(--md-caution-dim)] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--md-caution)] mb-1.5">
                  <AlertTriangle size={14} aria-hidden /> Convert mode requires MarkItDown
                </p>
                <p className="text-xs text-[var(--md-text-secondary)] mb-2">Install it, then refresh this page:</p>
                <code className="block text-xs font-mono bg-[var(--md-bg)] text-[var(--md-text-secondary)] rounded-md px-3 py-2 border border-[var(--md-border)]">
                  pip install markitdown[all]
                </code>
              </div>
              <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss" className="text-[var(--md-caution)] hover:opacity-70 text-lg leading-none shrink-0 cursor-pointer">×</button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-[var(--md-radius)] border border-[var(--md-caution)]/40 bg-[var(--md-caution-dim)] px-4 py-3">
            <p className="text-sm text-[var(--md-caution)] font-medium mb-1">Conversion failed</p>
            <p className="text-xs text-[var(--md-text-secondary)] whitespace-pre-line">{error}</p>
            <p className="text-xs text-[var(--md-text-tertiary)] mt-2">
              Scanned PDFs or complex formatting can fail. Try a different file, or paste the content directly into Task mode.
            </p>
          </div>
        )}

        {/* Converting state */}
        {isConverting && file && (
          <div className="rounded-[var(--md-radius-lg)] border border-[var(--md-border-strong)] bg-[var(--md-surface)] p-8 text-center">
            <div className="flex justify-center text-[var(--md-text-tertiary)] mb-3">{getFileIcon(file.name, 32)}</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="animate-spin w-4 h-4 text-[var(--md-accent)]" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium text-[var(--md-accent)]">In flight… converting {file.name}</span>
            </div>
            <p className="text-xs text-[var(--md-text-secondary)]">
              {file.size > 5 * 1024 * 1024 ? 'Large files may take up to 30 seconds.' : 'This usually takes a few seconds.'}
            </p>
          </div>
        )}

        {/* File selected (pre-conversion) */}
        {file && !isConverting && (
          <div className="rounded-[var(--md-radius-lg)] border border-[var(--md-border)] bg-[var(--md-surface)] p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-[var(--md-accent)]">{getFileIcon(file.name, 32)}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-[var(--md-text-tertiary)]">{humanSize(file.size)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => void handleConvert()}
                className="flex-1 px-5 py-2.5 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] text-sm font-semibold hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-sm)] cursor-pointer"
              >
                Convert to Markdown
              </button>
              <button
                onClick={() => { setFile(null); setError(null); }}
                className="px-5 py-2.5 rounded-[10px] border border-[var(--md-border-strong)] text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors duration-200 cursor-pointer"
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
              className={`flex flex-col items-center justify-center text-center rounded-[var(--md-radius-lg)] border-2 border-dashed cursor-pointer transition-all duration-150 px-6 ${
                isDragging
                  ? 'border-[var(--md-accent)] bg-[var(--md-accent-dim)]'
                  : 'border-[var(--md-border-strong)] bg-[var(--md-surface)] hover:border-[var(--md-accent)]/60 hover:bg-[var(--md-surface-2)]'
              }`}
              style={{ minHeight: 320 }}
            >
              <div className={`w-14 h-14 rounded-[var(--md-radius)] flex items-center justify-center mb-4 transition-colors ${
                isDragging ? 'bg-[var(--md-accent)] text-[var(--md-accent-ink)]' : 'bg-[var(--md-surface-2)] text-[var(--md-accent)]'
              }`}>
                <Upload size={26} strokeWidth={1.5} aria-hidden />
              </div>
              <p className="text-lg font-semibold mb-1">{isDragging ? 'Drop to convert' : 'Drop a file here'}</p>
              <p className="text-sm text-[var(--md-text-secondary)] mb-5">or click to browse</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
                {SUPPORTED_CHIPS.map(c => (
                  <span key={c} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--md-surface-2)] border border-[var(--md-border)] text-[var(--md-text-tertiary)]">{c}</span>
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
