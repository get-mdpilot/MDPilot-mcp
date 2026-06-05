'use client';

import { useState, useEffect } from 'react';
import Stepper from '@/components/Stepper';
import StackInput, { detectStack } from '@/components/StackInput';
import FileSelector, { type SelectableFile } from '@/components/FileSelector';
import TaskSuggestions from '@/components/TaskSuggestions';
import OutputView, { type OptimizerSummary } from '@/components/OutputView';
import ModelSelector from '@/components/ModelSelector';
import { countTokens } from '@/lib/tokenizer';
import { optimizeFiles } from '@/lib/optimizer';
import type { AIProvider } from '@/lib/ai-client';
import type { GenerationRequest, MDFileType, GeneratedFile, FileGenStatus } from '@/types';

// ── How-to guides ──────────────────────────────────────────────────────────
function getHowToUse(type: MDFileType): string {
  const guides: Partial<Record<MDFileType, string>> = {
    task:
      '📍 Save as TASK.md in your project, or paste the Agent Prompt block directly into your AI coding tool.\n\n✅ Read by: Claude Code, Cursor, Copilot, Windsurf\n\nThis file gives an AI agent everything it needs to start coding with zero clarifying questions — context, testable requirements, acceptance criteria, and explicit out-of-scope boundaries.',
    spec:
      '📍 Save as SPEC.md alongside your task, or attach to the ticket.\n\nThis is the engineering specification — user story, functional requirements, technical approach, and testing plan. Use it for planning, estimation, and review before implementation starts.',
  };
  return guides[type] ?? '📍 Place at your project root.';
}

const TASK_FILES: SelectableFile[] = [
  { type: 'task', name: 'TASK.md', why: 'Structured task context — paste this into your AI agent', recommended: true },
  { type: 'spec', name: 'SPEC.md', why: 'Feature specification with requirements and testing plan', recommended: false },
];

const FILENAMES: Record<string, string> = { task: 'TASK.md', spec: 'SPEC.md' };

const STEPS = [
  { label: 'Paste your task' },
  { label: 'Choose output files' },
  { label: 'Review & generate' },
];

export default function TaskPage() {
  // Wizard state
  const [step, setStep]                   = useState(0);
  const [taskInput, setTaskInput]         = useState('');
  const [showStack, setShowStack]         = useState(false);
  const [rawStackInput, setRawStackInput] = useState('');
  const [detectedStack, setDetectedStack] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<MDFileType[]>(['task']);

  // Generation state
  const [isGenerating, setIsGenerating]     = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [fileStatuses, setFileStatuses]     = useState<FileGenStatus[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [optimizer, setOptimizer]           = useState<OptimizerSummary | null>(null);
  const [error, setError]                   = useState<string | null>(null);

  // Model provider
  const [providers, setProviders]               = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('claude');

  // Pre-fill from Convert mode handoff
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'convert') {
      const content = sessionStorage.getItem('mdpilot_task_input');
      if (content) {
        setTaskInput(content);
        sessionStorage.removeItem('mdpilot_task_input');
      }
    }
  }, []);

  // Fetch available model providers
  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then((d: { providers: AIProvider[] }) => {
        setProviders(d.providers);
        if (d.providers.length > 0) setSelectedProvider(d.providers[0]);
      })
      .catch(() => {});
  }, []);

  // Auto-detect stack from the task input itself
  const autoStack = detectStack(taskInput);
  const effectiveStack = detectedStack.length ? detectedStack : autoStack;

  const canProceed =
    step === 0 ? taskInput.trim().length > 20 :
    step === 1 ? selectedFiles.length > 0 :
    true;

  const toggleFile = (type: MDFileType) => {
    setSelectedFiles(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const buildRequest = (): GenerationRequest => ({
    projectType:   'webapp',          // unused in task mode but required by type
    audience:      'team',
    aiTools:       [],
    detectedStack: effectiveStack,
    rawStackInput,
    selectedFiles,
    taskInput,
    mode:          'task',
  });

  const handleNext = () => {
    if (step === 2) { void handleGenerate(); return; }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  // ── Generation ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    const filesToGen = selectedFiles.slice();
    setIsGenerating(true);
    setError(null);
    setGeneratedFiles([]);
    setFileStatuses(filesToGen.map(type => ({ type, filename: FILENAMES[type] ?? `${type}.md`, status: 'pending' })));

    const request = buildRequest();
    const results: GeneratedFile[] = [];

    for (let i = 0; i < filesToGen.length; i++) {
      const fileType = filesToGen[i];
      setCurrentFileIndex(i);
      setFileStatuses(prev => prev.map(s => s.type === fileType ? { ...s, status: 'generating' } : s));

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileType, request, provider: selectedProvider }),
        });
        const data = await res.json() as { type: MDFileType; filename: string; content: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Generation failed');

        const tokens = countTokens(data.content);
        results.push({
          type: data.type,
          filename: data.filename,
          content: data.content,
          tokenCount: tokens,
          howToUse: getHowToUse(data.type),
        });
        setFileStatuses(prev => prev.map(s => s.type === fileType ? { ...s, status: 'done', tokenCount: tokens } : s));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setFileStatuses(prev => prev.map(s => s.type === fileType ? { ...s, status: 'error', error: msg } : s));
        setError(`Failed to generate ${fileType}: ${msg}`);
        break;
      }
    }

    if (results.length > 0) {
      const opt = optimizeFiles(results.map(f => ({ type: f.type, filename: f.filename, content: f.content })));
      setOptimizer({ totalTokensBefore: opt.totalTokensBefore, totalTokensAfter: opt.totalTokensAfter, passes: opt.passes });
      setGeneratedFiles(results.map((f, i) => ({
        ...f,
        optimizedContent:    opt.files[i]?.optimizedContent ?? f.content,
        optimizedTokenCount: opt.files[i]?.tokensAfter ?? f.tokenCount,
      })));
    }
    setIsGenerating(false);
  };

  const handleRetry = async (type: MDFileType) => {
    setFileStatuses(prev => prev.map(s => s.type === type ? { ...s, status: 'generating', error: undefined } : s));
    setError(null);
    const request = buildRequest();
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: type, request, provider: selectedProvider }),
      });
      const data = await res.json() as { type: MDFileType; filename: string; content: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      const tokens = countTokens(data.content);
      const newFile: GeneratedFile = {
        type: data.type, filename: FILENAMES[type] ?? `${type}.md`, content: data.content,
        tokenCount: tokens, howToUse: getHowToUse(data.type),
      };
      const updated = [...generatedFiles.filter(f => f.type !== type), newFile];
      const opt = optimizeFiles(updated.map(f => ({ type: f.type, filename: f.filename, content: f.content })));
      setOptimizer({ totalTokensBefore: opt.totalTokensBefore, totalTokensAfter: opt.totalTokensAfter, passes: opt.passes });
      setGeneratedFiles(updated.map((f, i) => ({
        ...f,
        optimizedContent:    opt.files[i]?.optimizedContent ?? f.content,
        optimizedTokenCount: opt.files[i]?.tokensAfter ?? f.tokenCount,
      })));
      setFileStatuses(prev => prev.map(s => s.type === type ? { ...s, status: 'done', tokenCount: tokens } : s));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFileStatuses(prev => prev.map(s => s.type === type ? { ...s, status: 'error', error: msg } : s));
      setError(`Failed to generate ${type}: ${msg}`);
    }
  };

  // ── Loading view ─────────────────────────────────────────────────────────
  if (isGenerating || (fileStatuses.length > 0 && !isGenerating && generatedFiles.length === 0)) {
    return (
      <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-1">Structuring your task…</h2>
          <p className="text-sm text-[var(--md-text-secondary)] mb-6">
            {isGenerating ? `Generating file ${currentFileIndex + 1} of ${fileStatuses.length}…` : 'Done.'}
          </p>
          <div className="flex flex-col gap-2 mb-6">
            {fileStatuses.map(f => (
              <div key={f.type} className="flex items-center justify-between rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] px-4 py-3">
                <span className="text-sm font-mono font-medium">{f.filename}</span>
                <span className="flex items-center gap-2 text-sm">
                  {f.status === 'pending'    && <span className="text-[var(--md-text-tertiary)]">⏳ Waiting</span>}
                  {f.status === 'generating' && (
                    <span className="text-[var(--md-coral)] flex items-center gap-1.5">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating…
                    </span>
                  )}
                  {f.status === 'done'  && <span className="text-[var(--md-teal)]">✅ Done{f.tokenCount != null ? ` · ${f.tokenCount} tokens` : ''}</span>}
                  {f.status === 'error' && <span className="text-[var(--md-coral)]">❌ Failed</span>}
                </span>
              </div>
            ))}
          </div>
          {isGenerating && (
            <div className="rounded-xl border border-[var(--md-border)] overflow-hidden" aria-hidden>
              <div className="px-4 py-2.5 bg-[var(--md-surface)] border-b border-[var(--md-border)] flex gap-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-3 w-16 ml-auto" />
              </div>
              <div className="p-5 space-y-2.5">
                {[90, 70, 80, 50, 65, 75, 45, 60].map((w, i) => (
                  <div key={i} className="skeleton h-2.5" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          )}
          {error && !isGenerating && (
            <div className="rounded-xl border border-[var(--md-coral)]/30 bg-[var(--md-coral-light)] px-4 py-3">
              <p className="text-sm text-[var(--md-coral)] font-medium mb-1">Generation failed</p>
              <p className="text-xs text-[var(--md-coral)]">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Output view ────────────────────────────────────────────────────────────
  if (generatedFiles.length > 0) {
    return (
      <OutputView
        title="Your task is ready"
        generatedFiles={generatedFiles}
        setGeneratedFiles={setGeneratedFiles}
        fileStatuses={fileStatuses}
        optimizer={optimizer}
        onBack={() => { setGeneratedFiles([]); setFileStatuses([]); setOptimizer(null); setStep(2); }}
        onRetry={(t) => void handleRetry(t)}
        showAgentPrompt
      />
    );
  }

  // ── Wizard ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
      <Stepper
        steps={STEPS}
        currentStep={step}
        onBack={handleBack}
        onNext={handleNext}
        canProceed={canProceed}
        isLastStep={step === 2}
      >
        {/* ── Step 0: Paste task ─────────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Paste your task</h2>
            <p className="text-sm text-[var(--md-text-secondary)] mb-6">
              Drop in a Jira ticket, Slack thread, task description, PR comments — anything. We&apos;ll make sense of it.
            </p>

            <div className="relative">
              <textarea
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                placeholder={'Paste your task here…\n\nExamples of what works:\n• Jira ticket description + comments\n• Slack thread about a feature\n• A verbal task description\n• PR review feedback\n• Bug report with reproduction steps'}
                rows={9}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[var(--md-coral)]/50 transition-colors text-[var(--md-text)] placeholder:text-white/20 leading-relaxed"
                autoFocus
              />
              <span className="absolute bottom-3 right-3 text-[11px] text-[var(--md-text-tertiary)] pointer-events-none">
                {taskInput.length.toLocaleString()} chars
              </span>
            </div>

            {/* Smart suggestions */}
            {taskInput.trim().length > 20 && <TaskSuggestions input={taskInput} />}

            {/* Optional stack section */}
            <div className="mt-4">
              <button
                onClick={() => setShowStack(s => !s)}
                className="flex items-center gap-1.5 text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  className={`transition-transform ${showStack ? 'rotate-90' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                Add tech stack context (optional)
              </button>

              {!showStack && autoStack.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-[var(--md-text-tertiary)]">Auto-detected:</span>
                  {autoStack.map(s => (
                    <span key={s} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#2DD4BF]/[0.10] text-[#2DD4BF]">{s}</span>
                  ))}
                </div>
              )}

              {showStack && (
                <div className="mt-3">
                  <StackInput
                    value={rawStackInput}
                    onChange={setRawStackInput}
                    detectedStack={detectedStack}
                    onDetect={setDetectedStack}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1: Choose files ───────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">What do you need?</h2>
            <p className="text-sm text-[var(--md-text-secondary)] mb-6">
              We&apos;ll generate these from your task input.
            </p>
            <FileSelector files={TASK_FILES} selected={selectedFiles} onToggle={toggleFile} accent="coral" />
            {selectedFiles.length === 0 && (
              <p className="mt-3 text-xs text-[var(--md-coral)] bg-[var(--md-coral-light)] rounded-lg px-3 py-2 text-center">
                Select at least one file to continue.
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: Review ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Ready to generate</h2>
            <p className="text-sm text-[var(--md-text-secondary)] mb-6">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} queued from your task input.
            </p>
            <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] divide-y divide-white/8 mb-6">
              <div className="flex items-start gap-4 px-4 py-3">
                <span className="text-xs text-[var(--md-text-tertiary)] w-20 shrink-0 pt-0.5">Task input</span>
                <span className="text-sm text-[var(--md-text-secondary)] font-mono leading-relaxed">
                  {taskInput.trim().slice(0, 100)}{taskInput.trim().length > 100 ? '…' : ''}
                </span>
              </div>
              <div className="flex items-start gap-4 px-4 py-3">
                <span className="text-xs text-[var(--md-text-tertiary)] w-20 shrink-0 pt-0.5">Tech stack</span>
                <span className="text-sm">
                  {effectiveStack.length ? effectiveStack.join(', ') : 'Not specified'}
                </span>
              </div>
              <div className="flex items-start gap-4 px-4 py-3">
                <span className="text-xs text-[var(--md-text-tertiary)] w-20 shrink-0 pt-0.5">Files</span>
                <span className="text-sm">{selectedFiles.map(t => FILENAMES[t]).join(', ')}</span>
              </div>
            </div>

            {/* Model selector */}
            {providers.length > 0 && (
              <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] p-4 mb-6">
                <ModelSelector selected={selectedProvider} onChange={setSelectedProvider} available={providers} />
              </div>
            )}

            <p className="text-xs text-center text-[var(--md-text-tertiary)]">
              One API call per file — takes about 5–15 seconds total.
            </p>
          </div>
        )}
      </Stepper>
    </div>
  );
}
