'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Copy, Check, Download, FileArchive, ChevronLeft,
  ThumbsUp, ThumbsDown, ChevronDown, ChevronUp,
  Info, AlertCircle, RotateCcw, Sparkles,
} from 'lucide-react';
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
  title:              string;
  generatedFiles:     GeneratedFile[];
  setGeneratedFiles:  (updater: (prev: GeneratedFile[]) => GeneratedFile[]) => void;
  fileStatuses:       FileGenStatus[];
  optimizer:          OptimizerSummary | null;
  onBack:             () => void;
  onRetry:            (type: MDFileType) => void;
  showAgentPrompt?:   boolean;
  backLabel?:         string;
  footer?:            React.ReactNode;
  eventId?:           string | null;
  promptVersion?:     number;
  role?:              string;
  sampleInput?:       string;
}

function extractAgentPrompt(content: string): string | null {
  const m = content.match(/## Agent prompt\s*\n+```[a-z]*\n([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
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
  backLabel = 'Back',
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

  const transformActive = (fn: (c: string) => string) => {
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

  const handleInsertTOC  = () => transformActive(insertTOC);
  const handleInsertBadge = (md: string) => transformActive(content => {
    const lines = content.split('\n');
    const idx   = lines.findIndex(l => /^#{1,3}\s+/.test(l));
    if (idx === -1) return `${md}\n\n${content}`;
    lines.splice(idx + 1, 0, '', md);
    return lines.join('\n');
  });

  useEffect(() => {
    originalOutputRef.current = displayContent;
    setEdited(false);
    setThumbs(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fireKept = () => {
    if (!eventId) return;
    void trackFeedback(eventId, {
      keptUnedited: !edited,
      editDistanceBucket: editBucket(originalOutputRef.current, displayContent),
      promptVersion,
    });
  };

  const handleThumbs = (v: 'up' | 'down') => {
    const next = thumbs === v ? null : v;
    setThumbs(next);
    if (eventId && next) void trackFeedback(eventId, { thumbs: next, promptVersion });
  };

  const handleConsent = (checked: boolean) => {
    setConsent(checked);
    if (checked && sampleInput)
      void storeTrainingSample({ input: sampleInput, output: displayContent, role, fileType: activeFile.type });
  };

  const handleCopy = (c: string) => {
    void navigator.clipboard.writeText(c);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    fireKept();
  };

  const handleCopyAgent = (c: string) => {
    void navigator.clipboard.writeText(c);
    setAgentCopied(true);
    setTimeout(() => setAgentCopied(false), 2000);
  };

  const handleDownload = (filename: string, c: string) => {
    const blob = new Blob([c], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
    fireKept();
  };

  const handleZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip   = new JSZip();
    generatedFiles.forEach(f => {
      const c = viewMode === 'optimized' && f.optimizedContent ? f.optimizedContent : f.content;
      zip.file(f.filename, c);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'mdpilot-generated.zip' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--md-dark-2)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pt-24">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/80 transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft size={15} />
            {backLabel.replace(/←\s*/, '')}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold text-white truncate"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {title}
            </h1>
            <p className="text-[11px] text-white/30 mt-0.5">
              {generatedFiles.length} file{generatedFiles.length > 1 ? 's' : ''} generated
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCopy(displayContent)}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-white/[0.10] text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              {copied ? <Check size={13} className="text-[#34D399]" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => handleDownload(activeFile.filename, displayContent)}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-white/[0.10] text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <Download size={13} />
              .md
            </button>
            {generatedFiles.length > 1 && (
              <button
                onClick={() => void handleZip()}
                className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg bg-[#4FACFF] text-[#07070f] font-semibold hover:bg-[#6FBFFF] transition-colors cursor-pointer"
              >
                <FileArchive size={13} />
                Download .zip
              </button>
            )}
          </div>
        </div>

        {/* ── Token meter ──────────────────────────────────────────────── */}
        {optimizer && (
          <TokenMeter
            totalBefore={optimizer.totalTokensBefore}
            totalAfter={optimizer.totalTokensAfter}
            passes={optimizer.passes}
          />
        )}

        {/* ── Error states ─────────────────────────────────────────────── */}
        {fileStatuses.some(s => s.status === 'error') && (
          <div className="mb-4 rounded-xl border border-[#FF6B6B]/25 bg-[#FF6B6B]/[0.06] px-4 py-3 space-y-2">
            {fileStatuses.filter(s => s.status === 'error').map(s => (
              <div key={s.type} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[13px] text-[#FF6B6B] min-w-0">
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="truncate">{s.filename} — {s.error}</span>
                </div>
                <button
                  onClick={() => onRetry(s.type)}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-lg border border-[#FF6B6B]/40 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCcw size={11} />
                  Retry
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Agent prompt card (task mode) ────────────────────────────── */}
        {agentPrompt && (
          <div className="mb-4 rounded-xl border border-[#A855F7]/30 bg-[#A855F7]/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#A855F7]/15">
              <span className="text-[12px] font-semibold text-[#A855F7] flex items-center gap-1.5">
                <Sparkles size={13} />
                Agent prompt — paste into Claude Code, Cursor, or Copilot
              </span>
              <button
                onClick={() => handleCopyAgent(agentPrompt)}
                className="text-[11px] px-3 py-1 rounded-lg bg-[#A855F7] text-white hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
              >
                {agentCopied ? 'Copied' : 'Copy prompt'}
              </button>
            </div>
            <pre className="px-4 py-3 text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-[#A855F7]/80 max-h-36 overflow-auto">
              {agentPrompt}
            </pre>
          </div>
        )}

        {/* ── File tabs ────────────────────────────────────────────────── */}
        <div className="flex items-end gap-0 border-b border-white/[0.07] overflow-x-auto">
          {generatedFiles.map((f, i) => {
            const isActive   = activeTab === i;
            const optTok     = f.optimizedTokenCount ?? f.tokenCount;
            const hasOpt     = viewMode === 'optimized' && !!f.optimizedContent;
            const shownTok   = hasOpt ? optTok : f.tokenCount;
            const savedPct   = hasOpt && f.tokenCount > 0
              ? Math.round((1 - optTok / f.tokenCount) * 100)
              : 0;

            return (
              <button
                key={f.type}
                onClick={() => { setActiveTab(i); setExpandedHowTo(null); setShowBadges(false); }}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-mono border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#4FACFF] text-white bg-white/[0.02]'
                    : 'border-transparent text-white/35 hover:text-white/70 hover:bg-white/[0.02]'
                }`}
              >
                {f.filename}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans tabular-nums ${
                  isActive
                    ? 'bg-[#4FACFF]/15 text-[#4FACFF]'
                    : 'bg-white/[0.06] text-white/30'
                }`}>
                  {shownTok.toLocaleString()}t
                </span>
                {savedPct > 0 && (
                  <span className="text-[9px] font-sans text-[#2DD4BF]/70 hidden sm:inline">
                    −{savedPct}%
                  </span>
                )}
              </button>
            );
          })}

        </div>

        {/* ── Editor ───────────────────────────────────────────────────── */}
        <div className="mt-0">
          <MarkdownEditor
            key={`${activeFile.type}-${viewMode}`}
            content={displayContent}
            onChange={(next) => {
              if (next !== originalOutputRef.current) setEdited(true);
              setGeneratedFiles(prev => prev.map((f, i) =>
                i !== activeTab ? f :
                viewMode === 'optimized'
                  ? { ...f, optimizedContent: next, optimizedTokenCount: countTokens(next) }
                  : { ...f, content: next, tokenCount: countTokens(next) }
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
        </div>

        {/* ── Badge generator (README only) ────────────────────────────── */}
        {isReadme && showBadges && (
          <div className="mt-2">
            <BadgeGenerator onInsert={handleInsertBadge} />
          </div>
        )}

        {/* ── Bottom info strip ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-1 pt-2 pb-1 text-[11px] text-white/25">
          <span className="font-mono">{activeFile.filename} · {displayTokens.toLocaleString()} tokens</span>
          {viewMode === 'optimized' && activeFile.optimizedTokenCount != null && activeFile.tokenCount > 0 && (
            <span className="text-[#2DD4BF]/70">
              ↓ {((1 - activeFile.optimizedTokenCount / activeFile.tokenCount) * 100).toFixed(0)}% smaller
            </span>
          )}
        </div>

        {/* ── How to use ───────────────────────────────────────────────── */}
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <button
            onClick={() => setExpandedHowTo(p => p === activeFile.type ? null : activeFile.type)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 text-[13px] font-medium text-white/70">
              <Info size={14} className="text-[#4FACFF] shrink-0" />
              How to use this file
            </span>
            {expandedHowTo === activeFile.type
              ? <ChevronUp size={14} className="text-white/30" />
              : <ChevronDown size={14} className="text-white/30" />
            }
          </button>
          {expandedHowTo === activeFile.type && (
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.06]">
              <pre className="text-[12px] text-white/45 leading-relaxed whitespace-pre-wrap font-sans">
                {activeFile.howToUse}
              </pre>
            </div>
          )}
        </div>

        {/* ── Feedback ─────────────────────────────────────────────────── */}
        {eventId && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
              <span className="text-[12px] text-white/35">Was this useful?</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleThumbs('up')}
                  className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    thumbs === 'up'
                      ? 'border-[#2DD4BF]/40 bg-[#2DD4BF]/10 text-[#2DD4BF]'
                      : 'border-white/[0.08] text-white/35 hover:text-white/70 hover:bg-white/[0.05]'
                  }`}
                  aria-label="Thumbs up"
                >
                  <ThumbsUp size={13} />
                  <span className="hidden sm:inline">Helpful</span>
                </button>
                <button
                  onClick={() => handleThumbs('down')}
                  className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    thumbs === 'down'
                      ? 'border-[#FF6B6B]/40 bg-[#FF6B6B]/10 text-[#FF6B6B]'
                      : 'border-white/[0.08] text-white/35 hover:text-white/70 hover:bg-white/[0.05]'
                  }`}
                  aria-label="Thumbs down"
                >
                  <ThumbsDown size={13} />
                  <span className="hidden sm:inline">Not helpful</span>
                </button>
              </div>
              {thumbs && (
                <span className="text-[11px] text-white/25 ml-auto">Thanks for the feedback</span>
              )}
            </div>
            <DataConsent checked={consent} onChange={handleConsent} />
          </div>
        )}

        {footer && <div className="mt-4">{footer}</div>}

      </div>
    </div>
  );
}
