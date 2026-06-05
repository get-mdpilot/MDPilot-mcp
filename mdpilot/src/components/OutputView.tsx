'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TokenMeter from '@/components/TokenMeter';
import BadgeGenerator from '@/components/BadgeGenerator';
import DataConsent from '@/components/DataConsent';
import { countTokens } from '@/lib/tokenizer';
import { insertTOC } from '@/lib/toc-generator';
import { trackFeedback, storeTrainingSample, editBucket } from '@/lib/telemetry';
import type { GeneratedFile, FileGenStatus, MDFileType, OptimizationPass } from '@/types';

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), { ssr: false });

export interface OptimizerSummary {
  totalTokensBefore: number;
  totalTokensAfter:  number;
  passes:            OptimizationPass[];
}

interface OutputViewProps {
  title:            string;
  generatedFiles:   GeneratedFile[];
  setGeneratedFiles: (updater: (prev: GeneratedFile[]) => GeneratedFile[]) => void;
  fileStatuses:     FileGenStatus[];
  optimizer:        OptimizerSummary | null;
  onBack:           () => void;
  onRetry:          (type: MDFileType) => void;
  /** Task mode shows the agent-prompt copy card */
  showAgentPrompt?: boolean;
  /** Override the back-button label (default "← Back") */
  backLabel?:       string;
  /** Optional content rendered below the how-to panel (e.g. cross-mode CTAs) */
  footer?:          React.ReactNode;
  /** Telemetry context (all optional — feedback UI hidden if no eventId) */
  eventId?:         string | null;
  promptVersion?:   number;
  role?:            string;
  /** The user input that produced this output (for consent-gated samples) */
  sampleInput?:     string;
}

function extractAgentPrompt(content: string): string | null {
  const match = content.match(/## Agent prompt\s*\n+```[a-z]*\n([\s\S]*?)```/i);
  return match ? match[1].trim() : null;
}

export default function OutputView({
  title,
  generatedFiles,
  setGeneratedFiles,
  fileStatuses,
  optimizer,
  onBack,
  onRetry,
  showAgentPrompt = false,
  backLabel = '← Back',
  footer,
  eventId = null,
  promptVersion,
  role,
  sampleInput = '',
}: OutputViewProps) {
  const [activeTab, setActiveTab]         = useState(0);
  const [viewMode, setViewMode]           = useState<'original' | 'optimized'>('optimized');
  const [copied, setCopied]               = useState(false);
  const [agentCopied, setAgentCopied]     = useState(false);
  const [expandedHowTo, setExpandedHowTo] = useState<MDFileType | null>(null);
  const [showBadges, setShowBadges]       = useState(false);
  // Telemetry state
  const [edited, setEdited]               = useState(false);
  const [thumbs, setThumbs]               = useState<'up' | 'down' | null>(null);
  const [consent, setConsent]             = useState(false);
  const originalOutputRef                 = useRef<string>('');

  const activeFile = generatedFiles[activeTab] ?? generatedFiles[0];
  if (!activeFile) return null;

  const displayContent =
    viewMode === 'optimized' && activeFile.optimizedContent
      ? activeFile.optimizedContent
      : activeFile.content;
  const displayTokens =
    viewMode === 'optimized' && activeFile.optimizedTokenCount != null
      ? activeFile.optimizedTokenCount
      : activeFile.tokenCount;

  const agentPrompt = showAgentPrompt ? extractAgentPrompt(displayContent) : null;
  const isReadme    = activeFile.type === 'readme';

  // Apply a transform to the active file's currently-displayed content
  const transformActive = (fn: (content: string) => string) => {
    setGeneratedFiles(prev => prev.map((f, i) => {
      if (i !== activeTab) return f;
      if (viewMode === 'optimized' && f.optimizedContent != null) {
        const next = fn(f.optimizedContent);
        return { ...f, optimizedContent: next, optimizedTokenCount: countTokens(next) };
      }
      const next = fn(f.content);
      return { ...f, content: next, tokenCount: countTokens(next) };
    }));
  };

  const handleInsertTOC = () => transformActive(insertTOC);

  const handleInsertBadge = (markdown: string) => transformActive(content => {
    // Insert badge markdown right after the first heading line
    const lines = content.split('\n');
    const idx = lines.findIndex(l => /^#{1,3}\s+/.test(l));
    if (idx === -1) return `${markdown}\n\n${content}`;
    lines.splice(idx + 1, 0, '', markdown);
    return lines.join('\n');
  });

  // Capture the original (unedited) output once per generation, for edit detection.
  useEffect(() => {
    originalOutputRef.current = displayContent;
    setEdited(false);
    setThumbs(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // ── Feedback (fire-and-forget) ───────────────────────────────────────────
  const fireKeptFeedback = () => {
    if (!eventId) return;
    const bucket = editBucket(originalOutputRef.current, displayContent);
    void trackFeedback(eventId, {
      keptUnedited: !edited,
      editDistanceBucket: bucket,
      promptVersion,
    });
  };

  const handleThumbs = (value: 'up' | 'down') => {
    const next = thumbs === value ? null : value;
    setThumbs(next);
    if (eventId && next) void trackFeedback(eventId, { thumbs: next, promptVersion });
  };

  const handleConsent = (checked: boolean) => {
    setConsent(checked);
    if (checked && sampleInput) {
      void storeTrainingSample({
        input: sampleInput,
        output: displayContent,
        role,
        fileType: activeFile.type,
      });
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleCopy = (content: string) => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    fireKeptFeedback();
  };

  const handleCopyAgent = (content: string) => {
    void navigator.clipboard.writeText(content);
    setAgentCopied(true);
    setTimeout(() => setAgentCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    fireKeptFeedback();
  };

  const handleDownloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    generatedFiles.forEach(f => {
      const content = viewMode === 'optimized' && f.optimizedContent ? f.optimizedContent : f.content;
      zip.file(f.filename, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mdpilot-generated.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-xs text-[var(--md-text-tertiary)] mt-0.5">
              {generatedFiles.length} file{generatedFiles.length > 1 ? 's' : ''} generated
            </p>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors shrink-0"
          >
            {backLabel}
          </button>
        </div>

        {/* Token meter */}
        {optimizer && (
          <TokenMeter
            totalBefore={optimizer.totalTokensBefore}
            totalAfter={optimizer.totalTokensAfter}
            passes={optimizer.passes}
          />
        )}

        {/* Failed files */}
        {fileStatuses.some(s => s.status === 'error') && (
          <div className="mb-4 rounded-xl border border-[var(--md-coral)]/30 bg-[var(--md-coral-light)] px-4 py-3 space-y-2">
            {fileStatuses.filter(s => s.status === 'error').map(s => (
              <div key={s.type} className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--md-coral)]">❌ {s.filename} failed: {s.error}</span>
                <button
                  onClick={() => onRetry(s.type)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--md-coral)] text-[var(--md-coral)] hover:bg-white/10 transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Agent prompt card — task mode only */}
        {agentPrompt && (
          <div className="mb-4 rounded-xl border border-[var(--md-purple)]/40 bg-[var(--md-purple-light)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--md-purple)]/20">
              <span className="text-xs font-semibold text-[var(--md-purple)] flex items-center gap-1.5">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                Agent prompt — paste into Claude Code, Cursor, or Copilot
              </span>
              <button
                onClick={() => handleCopyAgent(agentPrompt)}
                className="text-xs px-3 py-1 rounded-lg bg-[var(--md-purple)] text-white hover:opacity-90 transition-opacity shrink-0"
              >
                {agentCopied ? '✓ Copied' : 'Copy agent prompt'}
              </button>
            </div>
            <pre className="px-4 py-3 text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-[var(--md-purple)] max-h-40 overflow-auto">
              {agentPrompt}
            </pre>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-[var(--md-border)]">
          {generatedFiles.map((f, i) => {
            const isActive      = activeTab === i;
            const optTokens     = f.optimizedTokenCount ?? f.tokenCount;
            const showOptimized = viewMode === 'optimized' && f.optimizedContent;
            return (
              <button
                key={f.type}
                onClick={() => { setActiveTab(i); setExpandedHowTo(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#4FACFF] text-[#4FACFF]'
                    : 'border-transparent text-[var(--md-text-secondary)] hover:text-[var(--md-text)]'
                }`}
              >
                {f.filename}
                {showOptimized ? (
                  <span className="flex items-center gap-1 font-sans">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--md-teal-light)] text-[var(--md-teal)]">{optTokens}t</span>
                    <span className="text-[10px] text-[var(--md-text-tertiary)] line-through">{f.tokenCount}</span>
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans ${
                    isActive ? 'bg-[#4FACFF]/[0.12] text-[#4FACFF]' : 'bg-white/6 text-[var(--md-text-tertiary)]'
                  }`}>
                    {f.tokenCount}t
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Export bar */}
        <div className="flex flex-wrap items-center gap-2 px-1 py-3 border-b border-[var(--md-border)]">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5">
            {(['original', 'optimized'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`text-xs px-3 py-1 rounded-md transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-white/10 text-[var(--md-text)] shadow-sm font-medium'
                    : 'text-[var(--md-text-secondary)] hover:text-[var(--md-text)]'
                }`}
              >
                {mode === 'optimized' ? 'Optimized ✓' : 'Original'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleCopy(displayContent)}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.10] hover:bg-white/[0.05] transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button
              onClick={() => handleDownload(activeFile.filename, displayContent)}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.10] hover:bg-white/[0.05] transition-colors"
            >
              Download .md
            </button>
            {generatedFiles.length > 1 && (
              <button
                onClick={() => void handleDownloadZip()}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#4FACFF] text-[#07070f] font-medium hover:opacity-90 transition-opacity"
              >
                Download .zip
              </button>
            )}
          </div>
        </div>

        {/* Token row */}
        <div className="flex items-center justify-between px-1 py-1.5 text-[11px] text-[var(--md-text-tertiary)]">
          <span>{activeFile.filename} · {displayTokens.toLocaleString()} tokens shown</span>
          {viewMode === 'optimized' && activeFile.optimizedTokenCount != null && activeFile.tokenCount > 0 && (
            <span className="text-[var(--md-teal)]">
              ↓ {((1 - activeFile.optimizedTokenCount / activeFile.tokenCount) * 100).toFixed(0)}% smaller
            </span>
          )}
        </div>

        {/* Editor */}
        <MarkdownEditor
          key={`${activeFile.type}-${viewMode}`}
          content={displayContent}
          onChange={(newContent) => {
            if (newContent !== originalOutputRef.current) setEdited(true);
            setGeneratedFiles(prev => prev.map((f, i) =>
              i === activeTab
                ? viewMode === 'optimized'
                  ? { ...f, optimizedContent: newContent, optimizedTokenCount: countTokens(newContent) }
                  : { ...f, content: newContent, tokenCount: countTokens(newContent) }
                : f
            ));
          }}
          filename={activeFile.filename}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasOptimized={!!activeFile.optimizedContent}
          onInsertTOC={handleInsertTOC}
          onToggleBadges={() => setShowBadges(s => !s)}
          showBadgeButton={isReadme}
        />

        {/* Badge generator (README only) */}
        {isReadme && showBadges && <BadgeGenerator onInsert={handleInsertBadge} />}

        {/* How to use */}
        <div className="mt-3 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] overflow-hidden">
          <button
            onClick={() => setExpandedHowTo(prev => prev === activeFile.type ? null : activeFile.type)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#4FACFF] shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              How to use this file
            </span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              className={`text-[var(--md-text-tertiary)] transition-transform ${expandedHowTo === activeFile.type ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {expandedHowTo === activeFile.type && (
            <div className="px-4 pb-4 pt-1 border-t border-[var(--md-border)]">
              <pre className="text-xs text-[var(--md-text-secondary)] leading-relaxed whitespace-pre-wrap font-sans">
                {activeFile.howToUse}
              </pre>
            </div>
          )}
        </div>

        {/* Feedback + consent (only when telemetry context is present) */}
        {eventId && (
          <div className="mt-3 space-y-3">
            {/* Thumbs */}
            <div className="flex items-center gap-3 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] px-4 py-3">
              <span className="text-xs text-[var(--md-text-secondary)]">Was this useful?</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleThumbs('up')}
                  className={`px-2.5 py-1 rounded-lg border text-sm transition-colors ${
                    thumbs === 'up' ? 'border-[var(--md-teal)] bg-[var(--md-teal-light)] text-[var(--md-teal)]' : 'border-[var(--md-border)] hover:bg-white/[0.05]'
                  }`}
                  aria-label="Thumbs up"
                >👍</button>
                <button
                  onClick={() => handleThumbs('down')}
                  className={`px-2.5 py-1 rounded-lg border text-sm transition-colors ${
                    thumbs === 'down' ? 'border-[var(--md-coral)] bg-[var(--md-coral-light)] text-[var(--md-coral)]' : 'border-[var(--md-border)] hover:bg-white/[0.05]'
                  }`}
                  aria-label="Thumbs down"
                >👎</button>
              </div>
              {thumbs && <span className="text-[11px] text-[var(--md-text-tertiary)] ml-auto">Thanks for the signal</span>}
            </div>
            {/* Consent (opt-in, default off) */}
            <DataConsent checked={consent} onChange={handleConsent} />
          </div>
        )}

        {/* Optional footer (e.g. cross-mode CTAs) */}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  );
}
