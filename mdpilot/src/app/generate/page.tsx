'use client';

import { useState, useEffect } from 'react';
import Stepper from '@/components/Stepper';
import OutputView, { type OptimizerSummary } from '@/components/OutputView';
import ModelSelector from '@/components/ModelSelector';
import TemplateGallery, { type Template } from '@/components/TemplateGallery';
import { countTokens } from '@/lib/tokenizer';
import { optimizeFiles } from '@/lib/optimizer';
import { trackGeneration } from '@/lib/telemetry';
import type { AIProvider } from '@/lib/ai-client';
import type { GenerationRequest, MDFileType, ProjectType, Audience, AITool, GeneratedFile } from '@/types';

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
    skill:
      '📍 Place in your project or a shared skills directory.\n\n✅ Read by: Claude Code, Cursor, Copilot (via agentskills.io standard)\n\nDefines a reusable capability your AI agent can invoke. The description field is critical — it determines whether the skill gets triggered. A well-written SKILL.md means your agent automatically knows how to handle specific tasks.',
    design:
      '📍 Place at your project root as DESIGN.md.\n\n✅ Read by: Gemini, Claude, Cursor (Google Labs spec, April 2026)\n\nContains your exact design tokens — colors, typography, spacing, component rules. AI agents use these values literally when generating UI. Without this, agents default to generic styling that doesn\'t match your brand.',
    contributing:
      '📍 Place at your project root.\n\nGitHub surfaces this to anyone opening an issue or PR. It answers "how do I contribute?" so you don\'t have to answer it repeatedly. The first-contribution path section is what converts visitors into contributors.',
    security:
      '📍 Place at your project root.\n\nGitHub\'s Security tab links to this. Without it, vulnerability reporters may open public issues exposing the flaw. This file gives them a private channel instead.',
    context:
      '📍 Place at your project root. Update each coding session.\n\n✅ Read by: Claude Code, Cursor\n\nUnlike CLAUDE.md (permanent), CONTEXT.md is your daily scratchpad — what you\'re working on today, known broken things, decisions in progress. It prevents your AI agent from re-discovering things you already know.',
  };
  return guides[type] ?? '📍 Place at your project root.';
}

// ── File recommendation ──────────────────────────────────────────────────────

// All file types that have a backing system prompt
const V1_SUPPORTED: MDFileType[] = [
  'readme', 'agents', 'claude', 'skill', 'design', 'contributing', 'security', 'context',
];

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
    files.push({ type: 'skill', name: 'SKILL.md', why: 'Custom reusable agent capability', recommended: false });
    files.push({ type: 'context', name: 'CONTEXT.md', why: 'Session-level notes for your AI agent', recommended: false });
  }
  if (aiTools.includes('claude')) {
    files.push({ type: 'claude', name: 'CLAUDE.md', why: 'Tuned for Claude Code specifically', recommended: true });
  }
  if (projectType === 'design') {
    files.push({ type: 'design', name: 'DESIGN.md', why: 'Design tokens AI agents will respect', recommended: true });
  }
  if (audience === 'public') {
    files.push({ type: 'contributing', name: 'CONTRIBUTING.md', why: 'How others contribute to your project', recommended: true });
    files.push({ type: 'security', name: 'SECURITY.md', why: 'How to report vulnerabilities', recommended: false });
  }
  if (audience === 'team') {
    files.push({ type: 'contributing', name: 'CONTRIBUTING.md', why: 'How your team contributes', recommended: false });
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

  // Output state
  const [optimizer, setOptimizer]                 = useState<OptimizerSummary | null>(null);
  const [eventId, setEventId]                     = useState<string | null>(null);
  const [promptVersion, setPromptVersion]         = useState<number | undefined>(undefined);

  // Model provider
  const [providers, setProviders]                 = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider]   = useState<AIProvider>('claude');

  // Template gallery
  const [showTemplates, setShowTemplates]         = useState(false);
  const [templateName, setTemplateName]           = useState<string | null>(null);

  // Pre-fill stack context from Convert mode handoff
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'convert') {
      const content = sessionStorage.getItem('mdpilot_convert_context');
      if (content) {
        setRawStackInput(content);
        sessionStorage.removeItem('mdpilot_convert_context');
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

  const handleSelectTemplate = (t: Template) => {
    setProjectType(t.projectType);
    setProjectDescription('');
    setAudience(t.audience);
    setAiTools(t.aiTools);
    setDetectedStack(t.stack);
    setRawStackInput(t.stack.join(', '));
    setSelectedFiles(t.files.filter(f => V1_SUPPORTED.includes(f)));
    setTemplateName(t.name);
    setShowTemplates(false);
    setStep(5); // jump to review
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
          body: JSON.stringify({ fileType, request, provider: selectedProvider }),
        });
        const data = await res.json() as { type: MDFileType; filename: string; content: string; promptVersion?: number; error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Generation failed');

        if (i === 0 && data.promptVersion != null) setPromptVersion(data.promptVersion);
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
      setOptimizer({ totalTokensBefore: optimized.totalTokensBefore, totalTokensAfter: optimized.totalTokensAfter, passes: optimized.passes });
      const finalFiles = results.map((f, i) => ({
        ...f,
        optimizedContent: optimized.files[i]?.optimizedContent ?? f.content,
        optimizedTokenCount: optimized.files[i]?.tokensAfter ?? f.tokenCount,
      }));
      setGeneratedFiles(finalFiles);

      // Metadata-only telemetry (fire-and-forget; never blocks)
      trackGeneration({
        role: request.role ?? 'developer',
        fileType: filesToGen.join(','),
        provider: selectedProvider,
        tokensBefore: optimized.totalTokensBefore,
        tokensAfter: optimized.totalTokensAfter,
      }).then(setEventId);
    } else {
      setGeneratedFiles(results);
    }
    setIsGenerating(false);
  };

  const handleRetry = async (type: MDFileType) => {
    const filenameMap: Record<string, string> = {
      readme: 'README.md', agents: 'AGENTS.md', claude: 'CLAUDE.md',
      skill: 'SKILL.md', design: 'DESIGN.md', contributing: 'CONTRIBUTING.md',
      security: 'SECURITY.md', context: 'CONTEXT.md', task: 'TASK.md', spec: 'SPEC.md',
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
        body: JSON.stringify({ fileType: type, request, provider: selectedProvider }),
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
      setOptimizer({ totalTokensBefore: optimized.totalTokensBefore, totalTokensAfter: optimized.totalTokensAfter, passes: optimized.passes });
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

  // ── Loading view ─────────────────────────────────────────────────────────────

  if (isGenerating || (fileStatuses.length > 0 && !isGenerating && generatedFiles.length === 0)) {
    return (
      <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
      <div className="max-w-xl mx-auto">
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
              className="flex items-center justify-between rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] px-4 py-3"
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
      </div>
    );
  }

  // ── Output view (shared component) ───────────────────────────────────────────

  if (generatedFiles.length > 0) {
    return (
      <OutputView
        title="Your files are ready"
        generatedFiles={generatedFiles}
        setGeneratedFiles={setGeneratedFiles}
        fileStatuses={fileStatuses}
        optimizer={optimizer}
        onBack={() => { setGeneratedFiles([]); setFileStatuses([]); setOptimizer(null); setEventId(null); setStep(5); }}
        onRetry={(t) => void handleRetry(t)}
        eventId={eventId}
        promptVersion={promptVersion}
        role="developer"
        sampleInput={`Project: ${projectType ?? ''} | Audience: ${audience ?? ''} | Stack: ${detectedStack.join(', ') || rawStackInput}`}
      />
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
    <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-12">
    {showTemplates && (
      <TemplateGallery onSelect={handleSelectTemplate} onClose={() => setShowTemplates(false)} />
    )}

    {/* Start from template link — only on first step */}
    {step === 0 && (
      <div className="max-w-xl mx-auto mb-4 text-center">
        <button
          onClick={() => setShowTemplates(true)}
          className="text-sm text-[#4FACFF] hover:text-[#73C0FF] transition-colors"
        >
          Or start from a template →
        </button>
      </div>
    )}

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
                    ? 'border-[#4FACFF]/50 bg-[#4FACFF]/[0.07] card-selected-blue'
                    : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-[1px]'
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
              className="mt-4 w-full rounded-xl border border-[var(--md-blue)] bg-[var(--md-surface)] p-4 text-sm resize-none focus:outline-none transition-colors"
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
                    ? 'border-[#4FACFF]/50 bg-[#4FACFF]/[0.07] card-selected-blue'
                    : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-[1px]'
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
                      ? 'border-[#2DD4BF]/50 bg-[#2DD4BF]/[0.07] card-selected-teal'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-[1px]'
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
            <code className="font-mono text-xs bg-white/6 px-1.5 py-0.5 rounded">package.json</code>
            ,{' '}
            <code className="font-mono text-xs bg-white/6 px-1.5 py-0.5 rounded">requirements.txt</code>
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
            className="w-full rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[var(--md-blue)] transition-colors"
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
                      : 'border-l-transparent bg-[var(--md-surface)] hover:border-l-[var(--md-teal)]/50'
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/6 text-[var(--md-text-tertiary)]">
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
          <p className="text-sm text-[var(--md-text-secondary)] mb-4">
            3 questions answered.{' '}
            <span className="font-medium text-[var(--md-text)]">
              {selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length} file
              {selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length !== 1 ? 's' : ''} queued.
            </span>
          </p>
          {templateName && (
            <p className="text-xs text-[#4FACFF] bg-[#4FACFF]/[0.08] rounded-lg px-3 py-2 mb-6">
              ✦ Pre-filled from template: <span className="font-medium">{templateName}</span>. Edit anything before generating.
            </p>
          )}
          <div className="rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] divide-y divide-white/8 mb-6">
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
