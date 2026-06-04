'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Stepper from '@/components/Stepper';
import TokenMeter from '@/components/TokenMeter';
import { countTokens } from '@/lib/tokenizer';
import { optimizeFiles } from '@/lib/optimizer';
import type { CrossFileOptimizerResult } from '@/lib/optimizer';
import type { GenerationRequest, MDFileType, ProjectType, Audience, AITool, GeneratedFile } from '@/types';

// CodeMirror accesses DOM APIs — load only on client
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), { ssr: false });

// ── Stack detection ──────────────────────────────────────────────────────────

const STACK_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /next|nextjs|next\.js/i,        label: 'Next.js' },
  { re: /react/i,                        label: 'React' },
  { re: /vue/i,                          label: 'Vue' },
  { re: /svelte/i,                       label: 'Svelte' },
  { re: /angular/i,                      label: 'Angular' },
  { re: /tailwind/i,                     label: 'Tailwind' },
  { re: /typescript|"typescript"/i,      label: 'TypeScript' },
  { re: /fastapi/i,                      label: 'FastAPI' },
  { re: /django/i,                       label: 'Django' },
  { re: /flask/i,                        label: 'Flask' },
  { re: /python|django|flask|fastapi/i,  label: 'Python' },
  { re: /node|express/i,                 label: 'Node.js' },
  { re: /supabase/i,                     label: 'Supabase' },
  { re: /firebase/i,                     label: 'Firebase' },
  { re: /postgres/i,                     label: 'PostgreSQL' },
  { re: /mongo/i,                        label: 'MongoDB' },
  { re: /prisma/i,                       label: 'Prisma' },
  { re: /flutter|dart/i,                 label: 'Flutter' },
  { re: /swift/i,                        label: 'Swift' },
  { re: /kotlin/i,                       label: 'Kotlin' },
  { re: /rust|cargo/i,                   label: 'Rust' },
  { re: /go\b|golang/i,                  label: 'Go' },
  { re: /docker/i,                       label: 'Docker' },
  { re: /aws|lambda|s3\b/i,              label: 'AWS' },
  { re: /vercel/i,                       label: 'Vercel' },
  { re: /stripe/i,                       label: 'Stripe' },
  { re: /clerk/i,                        label: 'Clerk' },
];

function detectStack(raw: string): string[] {
  const seen = new Set<string>();
  const results: string[] = [];
  for (const { re, label } of STACK_PATTERNS) {
    if (re.test(raw) && !seen.has(label)) {
      seen.add(label);
      results.push(label);
    }
  }
  return results;
}

// ── How-to guides ────────────────────────────────────────────────────────────

function getHowToUse(type: MDFileType): string {
  const guides: Partial<Record<MDFileType, string>> = {
    readme:
      '📍 Place at your project root.\n\nGitHub, npm, and PyPI render this as your project homepage. This is the first thing developers see — it determines whether they use your project or move on.',
    agents:
      '📍 Place at your project root as AGENTS.md.\n\n✅ Read by: GitHub Copilot, Cursor, OpenAI Codex, Claude Code, Windsurf, Zed\n\nThis file tells AI coding assistants how to work in your project — coding style, commands, permission boundaries. Without it, agents guess and often guess wrong.',
    claude:
      '📍 Place at your project root as CLAUDE.md.\n\n✅ Read by: Claude Code only\n\nLoads automatically every session. Contains gotchas and constraints Claude would get wrong by reading code alone. Saves ~200 tokens per message by preventing repeated clarification questions.',
    contributing:
      '📍 Place at your project root as CONTRIBUTING.md.\n\nGitHub shows this to anyone opening an issue or PR. Reduces maintainer burden by answering setup and process questions upfront.',
    security:
      '📍 Place at your project root as SECURITY.md.\n\nGitHub Security tab links to this. Tells researchers how to report vulnerabilities responsibly instead of opening public issues.',
  };
  return guides[type] ?? '📍 Place at your project root.';
}

// ── File recommendation ──────────────────────────────────────────────────────

// V1: only files that have API prompts
const V1_SUPPORTED: MDFileType[] = ['readme', 'agents', 'claude'];

interface RecommendedFile {
  type: MDFileType;
  name: string;
  why: string;
  recommended: boolean;
  v2?: boolean;
}

function getRecommendedFiles(
  projectType: ProjectType | null,
  audience: Audience | null,
  aiTools: AITool[],
): RecommendedFile[] {
  const files: RecommendedFile[] = [];

  files.push({ type: 'readme', name: 'README.md', why: 'Project homepage — everyone needs this', recommended: true });

  const usesAI = aiTools.length > 0 && !aiTools.includes('none');
  if (usesAI) {
    files.push({ type: 'agents', name: 'AGENTS.md', why: 'Universal AI instructions — read by all your tools', recommended: true });
  }
  if (aiTools.includes('claude')) {
    files.push({ type: 'claude', name: 'CLAUDE.md', why: 'Tuned for Claude Code specifically', recommended: true });
  }
  if (projectType === 'design') {
    files.push({ type: 'design', name: 'DESIGN.md', why: 'Design tokens AI agents will respect', recommended: true, v2: true });
  }
  if (audience === 'public') {
    files.push({ type: 'contributing', name: 'CONTRIBUTING.md', why: 'How others contribute to your project', recommended: true, v2: true });
    files.push({ type: 'security', name: 'SECURITY.md', why: 'How to report vulnerabilities', recommended: false, v2: true });
  }
  if (audience === 'team') {
    files.push({ type: 'contributing', name: 'CONTRIBUTING.md', why: 'How your team contributes', recommended: false, v2: true });
  }

  return files;
}

// ── Step options ─────────────────────────────────────────────────────────────

const buildOptions: { id: ProjectType; icon: string; label: string; desc: string }[] = [
  { id: 'webapp',  icon: '🌐', label: 'A website or web app',  desc: 'Something people use in a browser' },
  { id: 'mobile',  icon: '📱', label: 'A mobile app',          desc: 'iOS, Android, or both' },
  { id: 'api',     icon: '🔌', label: 'A backend or API',      desc: 'A service other apps talk to' },
  { id: 'library', icon: '📦', label: 'A tool or library',     desc: 'Code other developers will use' },
  { id: 'design',  icon: '🎨', label: 'A design system',       desc: 'UI components, colours, styles' },
  { id: 'other',   icon: '⋯',  label: 'Something else',        desc: "I'll describe it myself" },
];

const audienceOptions: { id: Audience; icon: string; label: string; desc: string }[] = [
  { id: 'me',     icon: '👤', label: 'Just me',    desc: 'A personal project' },
  { id: 'team',   icon: '👥', label: 'My team',    desc: 'People I work with' },
  { id: 'public', icon: '🌍', label: 'The public', desc: 'Open source or anyone' },
];

const aiToolOptions: { id: AITool; icon: string; label: string; desc: string }[] = [
  { id: 'claude',   icon: '✦', label: 'Claude Code',      desc: "Anthropic's coding agent" },
  { id: 'cursor',   icon: '▸', label: 'Cursor',           desc: 'AI-first code editor' },
  { id: 'copilot',  icon: '⊙', label: 'GitHub Copilot',   desc: 'In VS Code or JetBrains' },
  { id: 'windsurf', icon: '≈', label: 'Windsurf',         desc: "Codeium's agent IDE" },
  { id: 'chatgpt',  icon: '◉', label: 'ChatGPT / Codex',  desc: 'OpenAI tools' },
  { id: 'none',     icon: '○', label: 'Not sure yet',     desc: "I'll set this up later" },
];

const STEPS = [
  { label: 'What are you building?' },
  { label: 'Who is it for?' },
  { label: 'Which AI tools?' },
  { label: 'Tech stack' },
  { label: 'Files to generate' },
  { label: 'Review & generate' },
];

// ── File status during generation ─────────────────────────────────────────────

type GenStatus = 'pending' | 'generating' | 'done' | 'error';

interface FileGenStatus {
  type: MDFileType;
  filename: string;
  status: GenStatus;
  tokenCount?: number;
  error?: string;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GeneratePage() {
  // Wizard state
  const [step, setStep]                           = useState(0);
  const [projectType, setProjectType]             = useState<ProjectType | null>(null);
  const [projectDescription, setProjectDescription] = useState('');
  const [audience, setAudience]                   = useState<Audience | null>(null);
  const [aiTools, setAiTools]                     = useState<AITool[]>([]);
  const [rawStackInput, setRawStackInput]         = useState('');
  const [detectedStack, setDetectedStack]         = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles]         = useState<MDFileType[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating]           = useState(false);
  const [generatedFiles, setGeneratedFiles]       = useState<GeneratedFile[]>([]);
  const [fileStatuses, setFileStatuses]           = useState<FileGenStatus[]>([]);
  const [currentFileIndex, setCurrentFileIndex]   = useState(0);
  const [error, setError]                         = useState<string | null>(null);

  // Output UI state
  const [activeTab, setActiveTab]                 = useState(0);
  const [expandedHowTo, setExpandedHowTo]         = useState<MDFileType | null>(null);
  const [copied, setCopied]                       = useState(false);
  const [optimizerResult, setOptimizerResult]     = useState<CrossFileOptimizerResult | null>(null);
  const [viewMode, setViewMode]                   = useState<'original' | 'optimized'>('optimized');

  // ── canProceed ──────────────────────────────────────────────────────────────

  const canProceed =
    step === 0 ? projectType !== null && (projectType !== 'other' || projectDescription.trim() !== '') :
    step === 1 ? audience !== null :
    step === 2 ? aiTools.length > 0 :
    step === 4 ? selectedFiles.length > 0 :
    true;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 4) {
      // entering files step: set initial selection from recommendations
    }
    if (step === 5) {
      void handleGenerate();
      return;
    }
    // When entering file step, pre-select recommended files
    if (step === 3) {
      const rec = getRecommendedFiles(projectType, audience, aiTools);
      setSelectedFiles(
        rec.filter(f => f.recommended && !f.v2).map(f => f.type)
      );
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const handleSkip = () => {
    // Only offered on step 3 (stack paste)
    if (step === 3) {
      const rec = getRecommendedFiles(projectType, audience, aiTools);
      setSelectedFiles(rec.filter(f => f.recommended && !f.v2).map(f => f.type));
      setStep(4);
    }
  };

  const toggleAiTool = (tool: AITool) => {
    setAiTools(prev => {
      if (tool === 'none') {
        return prev.includes('none') ? [] : ['none'];
      }
      const without = prev.filter(t => t !== 'none');
      return without.includes(tool) ? without.filter(t => t !== tool) : [...without, tool];
    });
  };

  const toggleFile = (type: MDFileType) => {
    setSelectedFiles(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // ── Generation ──────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    const filesToGen = selectedFiles.filter(t => V1_SUPPORTED.includes(t));
    const filenameMap: Record<string, string> = {
      readme: 'README.md', agents: 'AGENTS.md', claude: 'CLAUDE.md',
      skill: 'SKILL.md', design: 'DESIGN.md', contributing: 'CONTRIBUTING.md',
      security: 'SECURITY.md', context: 'CONTEXT.md', task: 'TASK.md', spec: 'SPEC.md',
    };

    setIsGenerating(true);
    setError(null);
    setGeneratedFiles([]);
    setActiveTab(0);
    setFileStatuses(filesToGen.map(type => ({
      type,
      filename: filenameMap[type] ?? `${type}.md`,
      status: 'pending',
    })));

    const request: GenerationRequest = {
      projectType: projectType!,
      projectDescription,
      audience: audience!,
      aiTools,
      rawStackInput,
      detectedStack,
      selectedFiles,
    };

    const results: GeneratedFile[] = [];

    for (let i = 0; i < filesToGen.length; i++) {
      const fileType = filesToGen[i];
      setCurrentFileIndex(i);
      setFileStatuses(prev => prev.map(s => s.type === fileType ? { ...s, status: 'generating' } : s));

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileType, request }),
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
        setFileStatuses(prev => prev.map(s =>
          s.type === fileType ? { ...s, status: 'done', tokenCount: tokens } : s
        ));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setFileStatuses(prev => prev.map(s =>
          s.type === fileType ? { ...s, status: 'error', error: msg } : s
        ));
        setError(`Failed to generate ${fileType}: ${msg}`);
        break;
      }
    }

    // Run optimizer on all successfully generated files
    if (results.length > 0) {
      const optimized = optimizeFiles(
        results.map(f => ({ type: f.type, filename: f.filename, content: f.content }))
      );
      setOptimizerResult(optimized);
      setViewMode('optimized');
      const finalFiles = results.map((f, i) => ({
        ...f,
        optimizedContent: optimized.files[i]?.optimizedContent ?? f.content,
        optimizedTokenCount: optimized.files[i]?.tokensAfter ?? f.tokenCount,
      }));
      setGeneratedFiles(finalFiles);
    } else {
      setGeneratedFiles(results);
    }
    setIsGenerating(false);
  };

  const handleRetry = async (type: MDFileType) => {
    const filenameMap: Record<string, string> = {
      readme: 'README.md', agents: 'AGENTS.md', claude: 'CLAUDE.md',
    };
    setFileStatuses(prev => prev.map(s => s.type === type ? { ...s, status: 'generating', error: undefined } : s));
    setError(null);

    const request: GenerationRequest = {
      projectType: projectType!,
      projectDescription,
      audience: audience!,
      aiTools,
      rawStackInput,
      detectedStack,
      selectedFiles,
    };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: type, request }),
      });
      const data = await res.json() as { type: MDFileType; filename: string; content: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      const tokens = countTokens(data.content);
      const newFile: GeneratedFile = {
        type: data.type,
        filename: filenameMap[type] ?? `${type}.md`,
        content: data.content,
        tokenCount: tokens,
        howToUse: getHowToUse(data.type),
      };
      const updatedFiles = [...generatedFiles.filter(f => f.type !== type), newFile];
      const optimized = optimizeFiles(
        updatedFiles.map(f => ({ type: f.type, filename: f.filename, content: f.content }))
      );
      setOptimizerResult(optimized);
      const finalFiles = updatedFiles.map((f, i) => ({
        ...f,
        optimizedContent: optimized.files[i]?.optimizedContent ?? f.content,
        optimizedTokenCount: optimized.files[i]?.tokensAfter ?? f.tokenCount,
      }));
      setGeneratedFiles(finalFiles);
      setFileStatuses(prev => prev.map(s =>
        s.type === type ? { ...s, status: 'done', tokenCount: tokens } : s
      ));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFileStatuses(prev => prev.map(s => s.type === type ? { ...s, status: 'error', error: msg } : s));
      setError(`Failed to generate ${type}: ${msg}`);
    }
  };

  // ── Copy / download ──────────────────────────────────────────────────────────

  const handleCopy = (content: string) => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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

  // ── Loading view ─────────────────────────────────────────────────────────────

  if (isGenerating || (fileStatuses.length > 0 && !isGenerating && generatedFiles.length === 0)) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-0">
        <h2 className="text-xl font-semibold mb-1">Generating your files…</h2>
        <p className="text-sm text-[var(--md-text-secondary)] mb-6">
          {isGenerating
            ? `Generating file ${currentFileIndex + 1} of ${fileStatuses.length}…`
            : 'Generation complete.'}
        </p>

        {/* File status list */}
        <div className="flex flex-col gap-2 mb-6">
          {fileStatuses.map(f => (
            <div
              key={f.type}
              className="flex items-center justify-between rounded-xl border border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] px-4 py-3"
            >
              <span className="text-sm font-mono font-medium">{f.filename}</span>
              <span className="flex items-center gap-2 text-sm">
                {f.status === 'pending' && (
                  <span className="text-[var(--md-text-tertiary)]">⏳ Waiting</span>
                )}
                {f.status === 'generating' && (
                  <span className="text-[var(--md-blue)] flex items-center gap-1.5 animate-pulse">
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating…
                  </span>
                )}
                {f.status === 'done' && (
                  <span className="text-[var(--md-teal)]">
                    ✅ Done{f.tokenCount !== undefined ? ` · ${f.tokenCount} tokens` : ''}
                  </span>
                )}
                {f.status === 'error' && (
                  <span className="text-[var(--md-coral)]">❌ Failed</span>
                )}
              </span>
            </div>
          ))}
        </div>
        {/* Skeleton preview while generating */}
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
          <div className="rounded-xl border border-[var(--md-coral-light)] bg-[var(--md-coral-light)] px-4 py-3">
            <p className="text-sm text-[var(--md-coral)] font-medium mb-1">Generation failed</p>
            <p className="text-xs text-[var(--md-coral)]">{error}</p>
            {error.toLowerCase().includes('api key') || error.toLowerCase().includes('auth') ? (
              <p className="text-xs text-[var(--md-coral)] mt-2">
                Check your API key in <code className="font-mono">.env.local</code> and restart the dev server.
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // ── Output view ──────────────────────────────────────────────────────────────

  if (generatedFiles.length > 0) {
    const activeFile    = generatedFiles[activeTab] ?? generatedFiles[0];
    const displayContent =
      viewMode === 'optimized' && activeFile.optimizedContent
        ? activeFile.optimizedContent
        : activeFile.content;
    const displayTokens =
      viewMode === 'optimized' && activeFile.optimizedTokenCount != null
        ? activeFile.optimizedTokenCount
        : activeFile.tokenCount;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your files are ready</h2>
            <p className="text-xs text-[var(--md-text-tertiary)] mt-0.5">
              {generatedFiles.length} file{generatedFiles.length > 1 ? 's' : ''} generated
            </p>
          </div>
          <button
            onClick={() => { setGeneratedFiles([]); setFileStatuses([]); setOptimizerResult(null); setStep(5); }}
            className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Token meter */}
        {optimizerResult && (
          <TokenMeter
            totalBefore={optimizerResult.totalTokensBefore}
            totalAfter={optimizerResult.totalTokensAfter}
            passes={optimizerResult.passes}
          />
        )}

        {/* Failed files */}
        {fileStatuses.some(s => s.status === 'error') && (
          <div className="mb-4 rounded-xl border border-[var(--md-coral-light)] bg-[var(--md-coral-light)] px-4 py-3">
            {fileStatuses.filter(s => s.status === 'error').map(s => (
              <div key={s.type} className="flex items-center justify-between">
                <span className="text-sm text-[var(--md-coral)]">❌ {s.filename} failed: {s.error}</span>
                <button
                  onClick={() => void handleRetry(s.type)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--md-coral)] text-[var(--md-coral)] hover:bg-white/50 transition-colors ml-3 shrink-0"
                >
                  Retry
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar — scrollable on mobile */}
        <div className="flex overflow-x-auto border-b border-[var(--md-border)] scrollbar-none">
          {generatedFiles.map((f, i) => {
            const isActive   = activeTab === i;
            const optTokens  = f.optimizedTokenCount ?? f.tokenCount;
            const origTokens = f.tokenCount;
            const showOptimized = viewMode === 'optimized' && f.optimizedContent;
            return (
              <button
                key={f.type}
                onClick={() => { setActiveTab(i); setExpandedHowTo(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-[var(--md-blue)] text-[var(--md-blue)]'
                    : 'border-transparent text-[var(--md-text-secondary)] hover:text-[var(--md-text)]'
                }`}
              >
                {f.filename}
                {showOptimized ? (
                  <span className="flex items-center gap-1 font-sans">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--md-teal-light)] text-[var(--md-teal)]">
                      {optTokens}t
                    </span>
                    <span className="text-[10px] text-[var(--md-text-tertiary)] line-through">
                      {origTokens}
                    </span>
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans ${
                    isActive
                      ? 'bg-[var(--md-blue-light)] text-[var(--md-blue)]'
                      : 'bg-black/5 dark:bg-white/10 text-[var(--md-text-tertiary)]'
                  }`}>
                    {origTokens}t
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Export bar */}
        <div className="flex flex-wrap items-center gap-2 px-1 py-3 border-b border-[var(--md-border)]">
          <button
            onClick={() => handleCopy(displayContent)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--md-border)] hover:bg-[var(--md-blue-light)] transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={() => handleDownload(activeFile.filename, displayContent)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--md-border)] hover:bg-[var(--md-blue-light)] transition-colors"
          >
            Download .md
          </button>
          {generatedFiles.length > 1 && (
            <button
              onClick={() => void handleDownloadZip()}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--md-blue)] text-white hover:opacity-90 transition-opacity"
            >
              Download .zip
            </button>
          )}
          {viewMode === 'optimized' && activeFile.optimizedTokenCount != null && (
            <span className="ml-auto text-[11px] font-semibold text-[var(--md-teal)] bg-[var(--md-teal-light)] px-2.5 py-1 rounded-full">
              ↓ {((1 - activeFile.optimizedTokenCount / activeFile.tokenCount) * 100).toFixed(0)}% optimized
            </span>
          )}
        </div>

        {/* CodeMirror split-pane editor */}
        <MarkdownEditor
          key={`${activeFile.type}-${viewMode}`}
          content={displayContent}
          onChange={(newContent) => {
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
        />

        {/* How to use — collapsible */}
        <div className="mt-3 rounded-xl border border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] overflow-hidden">
          <button
            onClick={() => setExpandedHowTo(prev => prev === activeFile.type ? null : activeFile.type)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[var(--md-blue)] shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              How to use this file
            </span>
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className={`text-[var(--md-text-tertiary)] transition-transform ${expandedHowTo === activeFile.type ? 'rotate-180' : ''}`}
            >
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
      </div>
    );
  }

  // ── Wizard (steps 0–5) ───────────────────────────────────────────────────────

  const recommendedFiles = getRecommendedFiles(projectType, audience, aiTools);

  const reviewAiLabel = aiTools.length === 0
    ? 'None'
    : aiTools.map(t => aiToolOptions.find(o => o.id === t)?.label ?? t).join(', ');

  const reviewStackLabel = detectedStack.length > 0
    ? detectedStack.join(', ')
    : rawStackInput.trim() || 'Not provided';

  const reviewBuildingLabel = projectType === 'other'
    ? projectDescription
    : buildOptions.find(o => o.id === projectType)?.label ?? '—';

  return (
    <Stepper
      steps={STEPS}
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      canProceed={canProceed}
      isLastStep={step === 5}
      onSkip={step === 3 ? handleSkip : undefined}
    >
      {/* ── Step 0: What are you building? ─────────────────────────────────── */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-1">What are you building?</h2>
          <p className="text-sm text-[var(--md-text-secondary)] mb-6">
            Pick the closest one. Don't worry about being exact.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {buildOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setProjectType(opt.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left w-full transition-all ${
                  projectType === opt.id
                    ? 'border-[var(--md-blue)] bg-[var(--md-blue-light)]'
                    : 'border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] hover:border-[var(--md-blue)]/50'
                }`}
              >
                <span className="text-xl mt-0.5">{opt.icon}</span>
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-[var(--md-text-secondary)]">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {projectType === 'other' && (
            <textarea
              value={projectDescription}
              onChange={e => setProjectDescription(e.target.value)}
              placeholder="Describe your project in a sentence or two…"
              rows={3}
              className="mt-4 w-full rounded-xl border border-[var(--md-blue)] bg-white dark:bg-[#1a1a1a] p-4 text-sm resize-none focus:outline-none transition-colors"
              autoFocus
            />
          )}
        </div>
      )}

      {/* ── Step 1: Who is it for? ──────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Who is it for?</h2>
          <p className="text-sm text-[var(--md-text-secondary)] mb-6">
            This decides which files matter. A public project needs more than a personal one.
          </p>
          <div className="flex flex-col gap-2.5">
            {audienceOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setAudience(opt.id)}
                className={`flex items-center gap-4 rounded-xl border p-4 text-left w-full transition-all ${
                  audience === opt.id
                    ? 'border-[var(--md-blue)] bg-[var(--md-blue-light)]'
                    : 'border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] hover:border-[var(--md-blue)]/50'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-[var(--md-text-secondary)]">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Which AI tools? ─────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Which AI tools do you use to code?</h2>
          <p className="text-sm text-[var(--md-text-secondary)] mb-6">
            Pick any that apply. We'll generate files tuned for exactly these tools.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {aiToolOptions.map(opt => {
              const selected = aiTools.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleAiTool(opt.id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left w-full transition-all ${
                    selected
                      ? 'border-[var(--md-teal)] bg-[var(--md-teal-light)]'
                      : 'border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] hover:border-[var(--md-teal)]/50'
                  }`}
                >
                  <span className={`text-lg mt-0.5 font-mono ${selected ? 'text-[var(--md-teal)]' : 'text-[var(--md-text-tertiary)]'}`}>
                    {opt.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-[var(--md-text-secondary)]">{opt.desc}</p>
                  </div>
                  {selected && (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-[var(--md-teal)] shrink-0 mt-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 3: Tech stack ──────────────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Paste your tech stack</h2>
          <p className="text-sm text-[var(--md-text-secondary)] mb-6">
            Paste your{' '}
            <code className="font-mono text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">package.json</code>
            ,{' '}
            <code className="font-mono text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">requirements.txt</code>
            , or just type what you use. We'll detect it automatically.
          </p>
          <textarea
            value={rawStackInput}
            onChange={e => {
              setRawStackInput(e.target.value);
              setDetectedStack(detectStack(e.target.value));
            }}
            placeholder={"e.g. Next.js + Supabase + Tailwind\nor paste your package.json here…"}
            rows={9}
            className="w-full rounded-xl border border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[var(--md-blue)] transition-colors"
          />
          {detectedStack.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-[var(--md-text-tertiary)] mb-2">Detected:</p>
              <div className="flex flex-wrap gap-1.5">
                {detectedStack.map(label => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--md-teal-light)] text-[var(--md-teal)]"
                  >
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Empty stack detection notice */}
          {rawStackInput.trim().length > 10 && detectedStack.length === 0 && (
            <p className="mt-3 text-xs text-[var(--md-text-secondary)] bg-[var(--md-amber-light)] rounded-lg px-3 py-2">
              We couldn't detect your stack automatically. That's fine — we'll generate based on your other answers.
            </p>
          )}
          <p className="mt-4 text-[11px] text-[var(--md-text-tertiary)] italic">
            Tip: even "I use React and a Python backend" works fine.
          </p>
        </div>
      )}

      {/* ── Step 4: File recommendation ─────────────────────────────────────── */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Here's what we'll generate</h2>
          <p className="text-sm text-[var(--md-text-secondary)] mb-6">
            We picked these based on your answers. Toggle anything on or off.
          </p>
          <div className="flex flex-col gap-2.5">
            {recommendedFiles.map(f => {
              const selected = selectedFiles.includes(f.type);
              const disabled = !!f.v2;
              return (
                <button
                  key={f.type}
                  onClick={() => !disabled && toggleFile(f.type)}
                  disabled={disabled}
                  className={`flex items-center gap-4 rounded-xl border-l-[3px] border border-[var(--md-border)] p-4 text-left w-full transition-all ${
                    disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : selected
                      ? 'border-l-[var(--md-teal)] bg-[var(--md-teal-light)] border-[var(--md-teal)]/30'
                      : 'border-l-transparent bg-white dark:bg-[#1a1a1a] hover:border-l-[var(--md-teal)]/50'
                  }`}
                >
                  {/* Checkbox */}
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                    disabled
                      ? 'border-[var(--md-border)] bg-black/5'
                      : selected
                      ? 'bg-[var(--md-teal)] border-[var(--md-teal)]'
                      : 'border-[var(--md-border)]'
                  }`}>
                    {selected && !disabled && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-mono font-semibold">{f.name}</span>
                      {f.recommended && !f.v2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--md-blue-light)] text-[var(--md-blue)]">
                          Recommended
                        </span>
                      )}
                      {f.v2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--md-text-tertiary)]">
                          v2
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--md-text-secondary)]">{f.why}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length === 0 && (
            <p className="mt-3 text-xs text-[var(--md-coral)] bg-[var(--md-coral-light)] rounded-lg px-3 py-2 text-center">
              Select at least one file to continue.
            </p>
          )}
          {recommendedFiles.some(f => f.v2) && (
            <p className="mt-4 text-[11px] text-[var(--md-text-tertiary)] text-center">
              v2 files are coming soon — README, AGENTS.md, and CLAUDE.md generate today.
            </p>
          )}
        </div>
      )}

      {/* ── Step 5: Review + Generate ───────────────────────────────────────── */}
      {step === 5 && (
        <div>
          <h2 className="text-xl font-semibold mb-1">Ready to generate</h2>
          <p className="text-sm text-[var(--md-text-secondary)] mb-6">
            3 questions answered.{' '}
            <span className="font-medium text-[var(--md-text)]">
              {selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length} file
              {selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length !== 1 ? 's' : ''} queued.
            </span>
          </p>
          <div className="rounded-xl border border-[var(--md-border)] bg-white dark:bg-[#1a1a1a] divide-y divide-[var(--md-border)] mb-6">
            {[
              { label: 'Building',  value: reviewBuildingLabel },
              { label: 'Audience',  value: audienceOptions.find(o => o.id === audience)?.label ?? '—' },
              { label: 'AI tools',  value: reviewAiLabel },
              { label: 'Tech stack', value: reviewStackLabel },
              { label: 'Files',     value: `${selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length} file${selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length !== 1 ? 's' : ''}` },
            ].map(row => (
              <div key={row.label} className="flex items-start gap-4 px-4 py-3">
                <span className="text-xs text-[var(--md-text-tertiary)] w-20 shrink-0 pt-0.5">{row.label}</span>
                <span className="text-sm">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-[var(--md-text-tertiary)]">
            One API call per file — takes about 5–15 seconds total.
          </p>
        </div>
      )}
    </Stepper>
  );
}
