'use client';

import React, { useState, useEffect } from 'react';
import Stepper from '@/components/Stepper';
import OutputView, { type OptimizerSummary } from '@/components/OutputView';
import ModelSelector from '@/components/ModelSelector';
import TemplateGallery, { type Template } from '@/components/TemplateGallery';
import { WizardOptionCard } from '@/components/ui/wizard-option-card';
import { countTokens } from '@/lib/tokenizer';
import { optimizeFiles } from '@/lib/optimizer';
import { trackGeneration } from '@/lib/telemetry';
import {
  Globe, Smartphone, Plug, Package, Palette, HelpCircle,
  User, Users, Earth,
  Bot, UserRound, Briefcase, GraduationCap,
} from 'lucide-react';
import { LabsBreadcrumb } from '@/components/ui/labs-breadcrumb';
import type { AIProvider } from '@/lib/ai-client';
import type {
  GenerationRequest, MDFileType, ProjectType, Audience, AITool, GeneratedFile,
  ReaderAudience, ReadingLevel, GenerateOptions, WritingStyle,
} from '@/types';
import type { FileRec, RecommendFilesResponse } from '@/lib/prompts/recommend-files';

// ── Stack detection ───────────────────────────────────────────────────────────

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

// ── How-to guides ─────────────────────────────────────────────────────────────

function getHowToUse(type: MDFileType): string {
  const guides: Partial<Record<MDFileType, string>> = {
    readme:       '📍 Place at your project root.\n\nGitHub, npm, and PyPI render this as your project homepage. This is the first thing developers see — it determines whether they use your project or move on.',
    agents:       '📍 Place at your project root as AGENTS.md.\n\n✅ Read by: GitHub Copilot, Cursor, OpenAI Codex, Claude Code, Windsurf, Zed\n\nThis file tells AI coding assistants how to work in your project — coding style, commands, permission boundaries. Without it, agents guess and often guess wrong.',
    claude:       '📍 Place at your project root as CLAUDE.md.\n\n✅ Read by: Claude Code only\n\nLoads automatically every session. Contains gotchas and constraints Claude would get wrong by reading code alone. Saves ~200 tokens per message by preventing repeated clarification questions.',
    skill:        '📍 Place in your project or a shared skills directory.\n\n✅ Read by: Claude Code, Cursor, Copilot (via agentskills.io standard)\n\nDefines a reusable capability your AI agent can invoke. The description field is critical — it determines whether the skill gets triggered.',
    design:       '📍 Place at your project root as DESIGN.md.\n\n✅ Read by: Gemini, Claude, Cursor\n\nContains your exact design tokens — colors, typography, spacing. AI agents use these values literally when generating UI.',
    contributing: '📍 Place at your project root.\n\nGitHub surfaces this to anyone opening an issue or PR. It answers "how do I contribute?" so you don\'t have to answer it repeatedly.',
    security:     '📍 Place at your project root.\n\nGitHub\'s Security tab links to this. Without it, vulnerability reporters may open public issues exposing the flaw.',
    context:      '📍 Place at your project root. Update each coding session.\n\n✅ Read by: Claude Code, Cursor\n\nUnlike CLAUDE.md (permanent), CONTEXT.md is your daily scratchpad — what you\'re working on today, known broken things, decisions in progress.',
  };
  return guides[type] ?? '📍 Place at your project root.';
}

const PLAIN_NAMES: Partial<Record<MDFileType, string>> = {
  readme: 'Project overview', agents: 'AI assistant instructions', claude: 'Claude setup',
  skill: 'Reusable AI capability', design: 'Design system', contributing: 'Contribution guide',
  security: 'Security policy', context: 'Session notes',
};

// ── Recommendations ───────────────────────────────────────────────────────────

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

// ── Step options ──────────────────────────────────────────────────────────────

const buildOptions: { id: ProjectType; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: 'webapp',  icon: <Globe size={17} />,      label: 'A website or web app',  desc: 'Something people use in a browser' },
  { id: 'mobile',  icon: <Smartphone size={17} />, label: 'A mobile app',          desc: 'iOS, Android, or both' },
  { id: 'api',     icon: <Plug size={17} />,       label: 'A backend or API',      desc: 'A service other apps talk to' },
  { id: 'library', icon: <Package size={17} />,    label: 'A tool or library',     desc: 'Code other developers will use' },
  { id: 'design',  icon: <Palette size={17} />,    label: 'A design system',       desc: 'UI components, colours, styles' },
  { id: 'other',   icon: <HelpCircle size={17} />, label: 'Something else',        desc: "I'll describe it myself" },
];

const audienceOptions: { id: Audience; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: 'me',     icon: <User size={17} />,  label: 'Just me',    desc: 'A personal project' },
  { id: 'team',   icon: <Users size={17} />, label: 'My team',    desc: 'People I work with' },
  { id: 'public', icon: <Earth size={17} />, label: 'The public', desc: 'Open source or anyone' },
];

const aiToolOptions: { id: AITool; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: 'claude',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2C10 7 7 10 2 12C7 14 10 17 12 22C14 17 17 14 22 12C17 10 14 7 12 2Z"/></svg>, label: 'Claude Code',      desc: "Anthropic's coding agent" },
  { id: 'cursor',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 3.21V20.8l4.3-4.3 2.6 6.03 2.22-.96-2.6-6.04H18L5.5 3.21z" /></svg>, label: 'Cursor',           desc: 'AI-first code editor' },
  { id: 'copilot',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>, label: 'GitHub Copilot',   desc: 'In VS Code or JetBrains' },
  { id: 'windsurf', icon: <svg width="20" height="18" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M2 10c3-5 8-8 12-5s8 8 12 5"/><path d="M2 16c3-4 8-6 12-4s8 5 12 4"/></svg>, label: 'Windsurf',         desc: "Codeium's agent IDE" },
  { id: 'chatgpt',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.872zm16.597 3.855l-5.843-3.37 2.019-1.168a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.4-.68zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" /></svg>, label: 'ChatGPT / Codex',  desc: 'OpenAI tools' },
  { id: 'none',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, label: 'Not sure yet',     desc: "I'll set this up later" },
];

// ── Reader audience cards ─────────────────────────────────────────────────────

const readerAudienceOptions: {
  id: ReaderAudience; icon: React.ReactNode; label: string; desc: string;
  defaultLevel: ReadingLevel; defaultReasoning: boolean;
}[] = [
  {
    id: 'ai_agent', icon: <Bot size={17} />, label: 'AI coding agent',
    desc: "Terse, machine-parseable output — today's default. Lean on commands and facts.",
    defaultLevel: 'expert', defaultReasoning: false,
  },
  {
    id: 'team', icon: <UserRound size={17} />, label: 'Developer joining the team',
    desc: "Assume engineering skills, explain project-specific choices and conventions.",
    defaultLevel: 'standard', defaultReasoning: false,
  },
  {
    id: 'non_technical', icon: <Briefcase size={17} />, label: 'Non-technical reader',
    desc: "Founder, PM, investor, or client. Every term defined. Plain language throughout.",
    defaultLevel: 'plain', defaultReasoning: true,
  },
  {
    id: 'learner', icon: <GraduationCap size={17} />, label: "I'm learning",
    desc: "Explain reasoning behind each step, not just the step. Teach the why.",
    defaultLevel: 'plain', defaultReasoning: true,
  },
];

const readingLevels: { id: ReadingLevel; label: string }[] = [
  { id: 'plain',    label: 'Plain — define all terms' },
  { id: 'standard', label: 'Standard — developer prose' },
  { id: 'expert',   label: 'Expert — terse, skip basics' },
];

// ── Steps ─────────────────────────────────────────────────────────────────────
// Step 4 = Output style (reader audience) — must come before file picker
// so step 5 can key off the audience to show goal-first vs normal flow.
const STEPS = [
  { label: 'What are you building?' },  // 0
  { label: "Who's it for?" },           // 1
  { label: 'Which AI tools?' },         // 2
  { label: 'Tech stack' },              // 3
  { label: 'Output style' },            // 4
  { label: 'Files to generate' },       // 5
  { label: 'Review & generate' },       // 6
];

type GenStatus = 'pending' | 'generating' | 'done' | 'error';
interface FileGenStatus { type: MDFileType; filename: string; status: GenStatus; tokenCount?: number; error?: string; }

// suppress unused-import warning — FileRec is referenced by RecommendFilesResponse
void (0 as unknown as FileRec);

// ── Main component ────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const [step, setStep]                             = useState(0);
  const [projectType, setProjectType]               = useState<ProjectType | null>(null);
  const [projectDescription, setProjectDescription] = useState('');
  const [audience, setAudience]                     = useState<Audience | null>(null);
  const [aiTools, setAiTools]                       = useState<AITool[]>([]);
  const [rawStackInput, setRawStackInput]           = useState('');
  const [detectedStack, setDetectedStack]           = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles]           = useState<MDFileType[]>([]);

  // Step 4 — reader audience (before file picker so step 5 can branch on it)
  const [readerAudience, setReaderAudience]         = useState<ReaderAudience>('ai_agent');
  const [readingLevel, setReadingLevel]             = useState<ReadingLevel>('expert');
  const [includeReasoning, setIncludeReasoning]     = useState(false);
  const [humanVoice, setHumanVoice]                 = useState(false);

  // Step 5 — goal-first recommendation state (non_technical path)
  const [goal, setGoal]                             = useState('');
  const [recommendations, setRecommendations]       = useState<RecommendFilesResponse | null>(null);
  const [isRecommending, setIsRecommending]         = useState(false);
  const [recommendError, setRecommendError]         = useState<string | null>(null);
  const [userRequestedGoalFirst, setUserRequestedGoalFirst] = useState(false);
  const [skippedExpanded, setSkippedExpanded]       = useState(false);

  // true when audience=non_technical OR user clicked "Not sure"
  const showGoalFirst = readerAudience === 'non_technical' || userRequestedGoalFirst;

  // Generation
  const [isGenerating, setIsGenerating]             = useState(false);
  const [generatedFiles, setGeneratedFiles]         = useState<GeneratedFile[]>([]);
  const [fileStatuses, setFileStatuses]             = useState<FileGenStatus[]>([]);
  const [currentFileIndex, setCurrentFileIndex]     = useState(0);
  const [error, setError]                           = useState<string | null>(null);
  const [optimizer, setOptimizer]                   = useState<OptimizerSummary | null>(null);
  const [eventId, setEventId]                       = useState<string | null>(null);
  const [promptVersion, setPromptVersion]           = useState<number | undefined>(undefined);

  const [providers, setProviders]                   = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider]     = useState<AIProvider>('claude');

  const [showTemplates, setShowTemplates]           = useState(false);
  const [templateName, setTemplateName]             = useState<string | null>(null);

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

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then((d: { providers: AIProvider[] }) => {
        setProviders(d.providers);
        if (d.providers.length > 0) setSelectedProvider(d.providers[0]);
      })
      .catch(() => {});
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────────

  const step5CanProceed = showGoalFirst
    ? recommendations !== null && selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length > 0
    : selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length > 0;

  const canProceed =
    step === 0 ? projectType !== null && (projectType !== 'other' || projectDescription.trim() !== '') :
    step === 1 ? audience !== null :
    step === 2 ? aiTools.length > 0 :
    step === 4 ? true :
    step === 5 ? step5CanProceed :
    true;

  // ── Reader audience ───────────────────────────────────────────────────────────

  const handleSelectReaderAudience = (id: ReaderAudience) => {
    const opt = readerAudienceOptions.find(o => o.id === id);
    if (!opt) return;
    setReaderAudience(id);
    setReadingLevel(opt.defaultLevel);
    setIncludeReasoning(opt.defaultReasoning);
    if (id !== 'non_technical') setUserRequestedGoalFirst(false);
    // Auto-enable human voice for non-technical and learner audiences
    setHumanVoice(id === 'non_technical' || id === 'learner');
  };

  // ── Goal-first ────────────────────────────────────────────────────────────────

  const handleGetRecommendations = async () => {
    if (goal.trim().length < 5) return;
    setIsRecommending(true);
    setRecommendError(null);
    try {
      const res = await fetch('/api/recommend-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim(), projectType: projectType ?? 'other', detectedStack }),
      });
      const data = await res.json() as RecommendFilesResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to get recommendations');
      setRecommendations(data);
      setSelectedFiles(data.recommended.map(r => r.fileType as MDFileType).filter(t => V1_SUPPORTED.includes(t)));
    } catch (err) {
      setRecommendError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRecommending(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 6) { void handleGenerate(); return; }
    // Step 4 → 5: auto-select recommended files for the normal (non-goal-first) path
    if (step === 4 && !showGoalFirst && selectedFiles.length === 0) {
      const rec = getRecommendedFiles(projectType, audience, aiTools);
      setSelectedFiles(rec.filter(f => f.recommended && !f.v2).map(f => f.type));
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));
  const handleSkip = () => { if (step === 3) setStep(4); };

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
    setStep(6);
  };

  const toggleAiTool = (tool: AITool) => {
    setAiTools(prev => {
      if (tool === 'none') return prev.includes('none') ? [] : ['none'];
      const without = prev.filter(t => t !== 'none');
      return without.includes(tool) ? without.filter(t => t !== tool) : [...without, tool];
    });
  };

  const toggleFile = (type: MDFileType) => {
    setSelectedFiles(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  // ── Generation ────────────────────────────────────────────────────────────────

  const buildRequest = (): GenerationRequest => {
    const generateOptions: GenerateOptions = { audience: readerAudience, readingLevel, includeReasoning };
    const writingStyle: WritingStyle = humanVoice ? 'human' : 'default';
    return {
      projectType: projectType!,
      projectDescription: showGoalFirst && goal.trim() ? goal.trim() : projectDescription,
      audience: audience!,
      aiTools,
      rawStackInput,
      detectedStack,
      selectedFiles,
      generateOptions,
      writingStyle,
    };
  };

  const handleGenerate = async () => {
    const filesToGen = selectedFiles.filter(t => V1_SUPPORTED.includes(t));
    const filenameMap: Record<string, string> = {
      readme: 'README.md', agents: 'AGENTS.md', claude: 'CLAUDE.md', skill: 'SKILL.md',
      design: 'DESIGN.md', contributing: 'CONTRIBUTING.md', security: 'SECURITY.md', context: 'CONTEXT.md',
      task: 'TASK.md', spec: 'SPEC.md',
    };

    setIsGenerating(true);
    setError(null);
    setGeneratedFiles([]);
    setFileStatuses(filesToGen.map(type => ({ type, filename: filenameMap[type] ?? `${type}.md`, status: 'pending' })));

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
        const data = await res.json() as { type: MDFileType; filename: string; content: string; promptVersion?: number; error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Generation failed');
        if (i === 0 && data.promptVersion != null) setPromptVersion(data.promptVersion);
        const tokens = countTokens(data.content);
        results.push({ type: data.type, filename: data.filename, content: data.content, tokenCount: tokens, howToUse: getHowToUse(data.type) });
        setFileStatuses(prev => prev.map(s => s.type === fileType ? { ...s, status: 'done', tokenCount: tokens } : s));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setFileStatuses(prev => prev.map(s => s.type === fileType ? { ...s, status: 'error', error: msg } : s));
        setError(`Failed to generate ${fileType}: ${msg}`);
        break;
      }
    }

    if (results.length > 0) {
      const optimized = optimizeFiles(results.map(f => ({ type: f.type, filename: f.filename, content: f.content })));
      setOptimizer({ totalTokensBefore: optimized.totalTokensBefore, totalTokensAfter: optimized.totalTokensAfter, passes: optimized.passes });
      setGeneratedFiles(results.map((f, i) => ({
        ...f,
        optimizedContent: optimized.files[i]?.optimizedContent ?? f.content,
        optimizedTokenCount: optimized.files[i]?.tokensAfter ?? f.tokenCount,
      })));
      trackGeneration({
        role: 'developer', fileType: filesToGen.join(','), provider: selectedProvider,
        tokensBefore: optimized.totalTokensBefore, tokensAfter: optimized.totalTokensAfter,
      }).then(setEventId);
    } else { setGeneratedFiles(results); }
    setIsGenerating(false);
  };

  const handleRetry = async (type: MDFileType) => {
    const filenameMap: Record<string, string> = {
      readme: 'README.md', agents: 'AGENTS.md', claude: 'CLAUDE.md', skill: 'SKILL.md',
      design: 'DESIGN.md', contributing: 'CONTRIBUTING.md', security: 'SECURITY.md', context: 'CONTEXT.md',
    };
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
        type: data.type, filename: filenameMap[type] ?? `${type}.md`, content: data.content,
        tokenCount: tokens, howToUse: getHowToUse(data.type),
      };
      const updatedFiles = [...generatedFiles.filter(f => f.type !== type), newFile];
      const optimized = optimizeFiles(updatedFiles.map(f => ({ type: f.type, filename: f.filename, content: f.content })));
      setOptimizer({ totalTokensBefore: optimized.totalTokensBefore, totalTokensAfter: optimized.totalTokensAfter, passes: optimized.passes });
      setGeneratedFiles(updatedFiles.map((f, i) => ({
        ...f,
        optimizedContent: optimized.files[i]?.optimizedContent ?? f.content,
        optimizedTokenCount: optimized.files[i]?.tokensAfter ?? f.tokenCount,
      })));
      setFileStatuses(prev => prev.map(s => s.type === type ? { ...s, status: 'done', tokenCount: tokens } : s));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFileStatuses(prev => prev.map(s => s.type === type ? { ...s, status: 'error', error: msg } : s));
      setError(`Failed to generate ${type}: ${msg}`);
    }
  };

  // ── Loading view ──────────────────────────────────────────────────────────────

  if (isGenerating || (fileStatuses.length > 0 && !isGenerating && generatedFiles.length === 0)) {
    return (
      <div className="min-h-screen bg-[var(--md-dark-2)] flex items-center justify-center px-4 sm:px-8 py-12">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#4FACFF]/[0.06] blur-3xl rounded-full" />
          <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[200px] bg-[#A855F7]/[0.05] blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4FACFF]/10 border border-[#4FACFF]/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FACFF] animate-pulse" />
              <span className="text-[11px] font-mono text-[#4FACFF]">
                {isGenerating ? `File ${currentFileIndex + 1} of ${fileStatuses.length}` : 'Processing…'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {isGenerating ? 'Generating your files…' : 'Finalizing…'}
            </h2>
            <p className="text-[13px] text-white/40">Calling Claude claude-sonnet-4-6 · Token optimizer running</p>
          </div>

          {/* File status cards */}
          <div className="flex flex-col gap-2.5 mb-6">
            {fileStatuses.map(f => (
              <div
                key={f.type}
                className="flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all duration-300"
                style={{
                  borderColor: f.status === 'generating' ? 'rgba(79,172,255,0.3)'
                    : f.status === 'done' ? 'rgba(45,212,191,0.25)'
                    : f.status === 'error' ? 'rgba(239,68,68,0.25)'
                    : 'rgba(255,255,255,0.07)',
                  background: f.status === 'generating' ? 'rgba(79,172,255,0.06)'
                    : f.status === 'done' ? 'rgba(45,212,191,0.05)'
                    : f.status === 'error' ? 'rgba(239,68,68,0.05)'
                    : 'rgba(255,255,255,0.03)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: f.status === 'generating' ? 'rgba(79,172,255,0.15)'
                        : f.status === 'done' ? 'rgba(45,212,191,0.15)'
                        : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    {f.status === 'pending' && (
                      <span className="w-2 h-2 rounded-full bg-white/20" />
                    )}
                    {f.status === 'generating' && (
                      <svg className="animate-spin w-3.5 h-3.5 text-[#4FACFF]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {f.status === 'done' && (
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#2DD4BF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                    {f.status === 'error' && (
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] font-mono font-medium text-white/70">{f.filename}</span>
                </div>
                <span className="text-[11px] font-mono">
                  {f.status === 'pending' && <span className="text-white/20">waiting</span>}
                  {f.status === 'generating' && <span className="text-[#4FACFF]">streaming…</span>}
                  {f.status === 'done' && (
                    <span className="text-[#2DD4BF]">{f.tokenCount !== undefined ? `${f.tokenCount} tok` : 'done'}</span>
                  )}
                  {f.status === 'error' && <span className="text-red-400">failed</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Streaming skeleton */}
          {isGenerating && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden" aria-hidden>
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5F57]/40" />
                <span className="w-2 h-2 rounded-full bg-[#FEBC2E]/40" />
                <span className="w-2 h-2 rounded-full bg-[#28C840]/40" />
                <span className="ml-2 text-[10px] font-mono text-white/20">{fileStatuses[currentFileIndex]?.filename ?? '…'}</span>
              </div>
              <div className="p-4 space-y-2">
                {[80, 55, 70, 40, 65, 75, 45, 60].map((w, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full"
                    style={{
                      width: `${w}%`,
                      background: 'rgba(255,255,255,0.06)',
                      animation: `pulse 1.5s ease-in-out ${i * 100}ms infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && !isGenerating && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
              <p className="text-sm text-red-400 font-medium mb-1">Generation failed</p>
              <p className="text-xs text-red-400/70">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Output view ───────────────────────────────────────────────────────────────

  if (generatedFiles.length > 0) {
    return (
      <OutputView
        title="Your files are ready"
        generatedFiles={generatedFiles}
        setGeneratedFiles={setGeneratedFiles}
        fileStatuses={fileStatuses}
        optimizer={optimizer}
        onBack={() => { setGeneratedFiles([]); setFileStatuses([]); setOptimizer(null); setEventId(null); setStep(6); }}
        onRetry={(t) => void handleRetry(t)}
        eventId={eventId}
        promptVersion={promptVersion}
        role="developer"
        sampleInput={`Project: ${projectType ?? ''} | Audience: ${audience ?? ''} | Stack: ${detectedStack.join(', ') || rawStackInput}`}
      />
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────────────

  const recommendedFiles = getRecommendedFiles(projectType, audience, aiTools);
  const reviewAiLabel = aiTools.length === 0 ? 'None' : aiTools.map(t => aiToolOptions.find(o => o.id === t)?.label ?? t).join(', ');
  const reviewStackLabel = detectedStack.length > 0 ? detectedStack.join(', ') : rawStackInput.trim() || 'Not provided';
  const reviewBuildingLabel = projectType === 'other' ? projectDescription : buildOptions.find(o => o.id === projectType)?.label ?? '—';
  const reviewReaderLabel = readerAudienceOptions.find(o => o.id === readerAudience)?.label ?? readerAudience;

  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] relative overflow-hidden">
      <LabsBreadcrumb page="Generate" />
      {/* Background ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#4FACFF]/[0.04] blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-[#A855F7]/[0.04] blur-3xl rounded-full" />
      </div>

      {/* Page header */}
      <div className="relative border-b border-white/[0.05] bg-[var(--md-dark-2)] px-4 sm:px-8 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/mdpilot-logo.svg" alt="MDPilot" width={40} height={40} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(79,172,255,0.3)]" />
            <span className="text-[14px] font-semibold text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Generate</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-[12px] text-white/30 hover:text-white/55 transition-colors">← Home</a>
          </div>
        </div>
      </div>

      <div className="relative px-4 sm:px-8 py-10">
        {showTemplates && <TemplateGallery onSelect={handleSelectTemplate} onClose={() => setShowTemplates(false)} />}

        {step === 0 && (
          <div className="max-w-xl mx-auto mb-5 text-center">
            <button onClick={() => setShowTemplates(true)} className="text-[12px] text-white/35 hover:text-[#4FACFF] transition-colors cursor-pointer">
              Or start from a template →
            </button>
          </div>
        )}

      <Stepper steps={STEPS} currentStep={step} onBack={handleBack} onNext={handleNext}
        canProceed={canProceed} isLastStep={step === 6} onSkip={step === 3 ? handleSkip : undefined}
      >

        {/* ── Step 0: What are you building? ───────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What are you building?</h2>
            <p className="text-[13px] text-white/40 mb-6">Pick the closest one. Don&apos;t worry about being exact.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {buildOptions.map(opt => (
                <WizardOptionCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  desc={opt.desc}
                  selected={projectType === opt.id}
                  onClick={() => setProjectType(opt.id)}
                  indicatorType="multi"
                  accentColor="#4FACFF"
                />
              ))}
            </div>
            {projectType === 'other' && (
              <textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)}
                placeholder="Describe your project in a sentence or two…" rows={3}
                className="mt-4 w-full rounded-xl border border-[#4FACFF]/30 bg-[#4FACFF]/[0.04] p-4 text-sm resize-none focus:outline-none text-white/80 placeholder:text-white/25 transition-colors"
                autoFocus
              />
            )}
          </div>
        )}

        {/* ── Step 1: Who is it for? ───────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Who is it for?</h2>
            <p className="text-[13px] text-white/40 mb-6">This decides which files matter.</p>
            <div className="flex flex-col gap-2.5">
              {audienceOptions.map(opt => (
                <WizardOptionCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  desc={opt.desc}
                  selected={audience === opt.id}
                  onClick={() => setAudience(opt.id)}
                  indicatorType="single"
                  accentColor="#4FACFF"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Which AI tools? ──────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Which AI tools do you use?</h2>
            <p className="text-[13px] text-white/40 mb-6">Pick any that apply. We&apos;ll generate files tuned for exactly these tools.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {aiToolOptions.map(opt => (
                <WizardOptionCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  desc={opt.desc}
                  selected={aiTools.includes(opt.id)}
                  onClick={() => toggleAiTool(opt.id)}
                  indicatorType="multi"
                  accentColor="#2DD4BF"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Tech stack ───────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Paste your tech stack</h2>
            <p className="text-[13px] text-white/40 mb-6">
              Paste your{' '}
              <code className="font-mono text-[11px] bg-white/[0.07] px-1.5 py-0.5 rounded text-white/60">package.json</code>,{' '}
              <code className="font-mono text-[11px] bg-white/[0.07] px-1.5 py-0.5 rounded text-white/60">requirements.txt</code>, or just type what you use.
            </p>
            <textarea value={rawStackInput}
              onChange={e => { setRawStackInput(e.target.value); setDetectedStack(detectStack(e.target.value)); }}
              placeholder={"e.g. Next.js + Supabase + Tailwind\nor paste your package.json here…"}
              rows={9}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[#4FACFF]/40 transition-colors text-white/70 placeholder:text-white/20"
            />
            {detectedStack.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] text-white/30 mb-2">Detected:</p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedStack.map(label => (
                    <span key={label} className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {rawStackInput.trim().length > 10 && detectedStack.length === 0 && (
              <p className="mt-3 text-[11px] text-white/40 bg-[#FBBF24]/[0.08] border border-[#FBBF24]/20 rounded-lg px-3 py-2">
                We couldn&apos;t detect your stack automatically — we&apos;ll generate based on your other answers.
              </p>
            )}
            <p className="mt-4 text-[11px] text-white/25 italic">Tip: even &ldquo;I use React and a Python backend&rdquo; works fine.</p>
          </div>
        )}

        {/* ── Step 4: Output style (reader audience) ───────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Who will read the output?</h2>
            <p className="text-[13px] text-white/40 mb-6">
              We&apos;ll tune the language and depth for this reader. Default stays lean for AI agents.
            </p>

            <div className="grid grid-cols-1 gap-2.5 mb-5">
              {readerAudienceOptions.map(opt => (
                <WizardOptionCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  desc={opt.desc}
                  selected={readerAudience === opt.id}
                  onClick={() => handleSelectReaderAudience(opt.id)}
                  indicatorType="single"
                  accentColor="#4FACFF"
                  badge={
                    opt.id === 'ai_agent' ? 'default' :
                    opt.id === 'non_technical' ? 'goal-guided →' :
                    undefined
                  }
                  badgeVariant={opt.id === 'non_technical' ? 'blue' : 'mono'}
                />
              ))}
            </div>

            {readerAudience !== 'ai_agent' && (
              <>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 mb-3">
                  <p className="text-xs font-medium text-[var(--md-text-secondary)] mb-2.5">Language level</p>
                  <div className="flex gap-2">
                    {readingLevels.map(lvl => (
                      <button key={lvl.id} onClick={() => setReadingLevel(lvl.id)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                          readingLevel === lvl.id
                            ? 'border-[#4FACFF]/50 bg-[#4FACFF]/8 text-[#4FACFF]'
                            : 'border-white/8 bg-white/[0.02] text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)]'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
                {(readerAudience === 'non_technical' || readerAudience === 'learner') && (
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#4FACFF]/10 text-[#4FACFF] font-medium">Auto-on</span>
                      <p className="text-xs text-[var(--md-text-secondary)]">Glossary + &ldquo;why this matters&rdquo; callouts included</p>
                    </div>
                  </div>
                )}
                {readerAudience === 'team' && (
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 mb-3">
                    <label className="flex items-center justify-between cursor-pointer gap-4">
                      <div>
                        <p className="text-xs font-medium text-[var(--md-text-secondary)]">Include reasoning notes</p>
                        <p className="text-[11px] text-[var(--md-text-tertiary)] mt-0.5">Adds &ldquo;why this matters&rdquo; callouts for onboarding clarity</p>
                      </div>
                      <button role="switch" aria-checked={includeReasoning} onClick={() => setIncludeReasoning(v => !v)}
                        className={`relative w-10 h-5.5 rounded-full border transition-all shrink-0 ${
                          includeReasoning ? 'bg-[#4FACFF]/80 border-[#4FACFF]/50' : 'bg-white/5 border-white/15'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${includeReasoning ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </label>
                  </div>
                )}
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <label className="flex items-center justify-between cursor-pointer gap-4">
                    <div>
                      <p className="text-xs font-medium text-[var(--md-text-secondary)]">Human voice</p>
                      <p className="text-[11px] text-[var(--md-text-tertiary)] mt-0.5">
                        Natural prose for README, CONTRIBUTING, DESIGN — no em dashes or AI-isms.
                        {(readerAudience === 'non_technical' || readerAudience === 'learner') && (
                          <span className="ml-1 text-[#4FACFF]">Auto-on for this audience.</span>
                        )}
                      </p>
                    </div>
                    <button role="switch" aria-checked={humanVoice} onClick={() => setHumanVoice(v => !v)}
                      className={`relative w-10 h-5.5 rounded-full border transition-all shrink-0 ${
                        humanVoice ? 'bg-[#4FACFF]/80 border-[#4FACFF]/50' : 'bg-white/5 border-white/15'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${humanVoice ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </label>
                </div>
              </>
            )}
            {readerAudience === 'ai_agent' && (
              <p className="text-xs text-center text-[var(--md-text-tertiary)] mt-2">
                AI agent output stays lean — no definitions or callouts. This is today&apos;s behavior.
              </p>
            )}
          </div>
        )}

        {/* ── Step 5: Files to generate (goal-first or normal picker) ─────── */}
        {step === 5 && (
          <div>
            {showGoalFirst ? (
              /* ── Goal-first path ─────────────────────────────────────── */
              <div>
                <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What are you trying to do?</h2>
                <p className="text-[13px] text-white/40 mb-5">
                  Describe your goal in plain language — we&apos;ll figure out which files actually help.
                </p>

                {!recommendations && (
                  <>
                    <textarea
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      placeholder={"e.g. \"I want to share my side project so a developer can pick it up\"\n     \"I want an AI assistant to help me code this\"\n     \"I need to explain this project to my investors\""}
                      rows={5}
                      className="w-full rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm resize-none focus:outline-none focus:border-[#4FACFF]/50 transition-colors text-[var(--md-text)] placeholder:text-white/20 leading-relaxed"
                      autoFocus
                    />
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => void handleGetRecommendations()}
                        disabled={goal.trim().length < 10 || isRecommending}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                          goal.trim().length >= 10 && !isRecommending
                            ? 'bg-[#4FACFF]/80 text-white hover:bg-[#4FACFF]'
                            : 'bg-white/5 text-[var(--md-text-tertiary)] cursor-not-allowed'
                        }`}
                      >
                        {isRecommending ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Finding the right files…
                          </span>
                        ) : 'Find the right files →'}
                      </button>
                      <button
                        onClick={() => { setUserRequestedGoalFirst(false); if (readerAudience === 'non_technical') handleSelectReaderAudience('ai_agent'); }}
                        className="text-xs text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors whitespace-nowrap"
                      >
                        I know what I need
                      </button>
                    </div>
                    {recommendError && (
                      <div className="mt-3 rounded-xl border border-[var(--md-coral)]/30 bg-[var(--md-coral-light)] px-4 py-3">
                        <p className="text-xs text-[var(--md-coral)]">{recommendError}</p>
                        <button onClick={() => void handleGetRecommendations()} className="text-xs text-[var(--md-coral)] underline mt-1">Try again</button>
                      </div>
                    )}
                  </>
                )}

                {recommendations && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-[var(--md-text-secondary)]">Based on your goal, here&apos;s what we&apos;d generate:</p>
                      <button
                        onClick={() => { setRecommendations(null); setSelectedFiles([]); }}
                        className="text-xs text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors"
                      >
                        ← Change goal
                      </button>
                    </div>

                    <div className="rounded-xl bg-[#4FACFF]/[0.06] border border-[#4FACFF]/15 px-3 py-2 mb-4 flex items-start gap-2">
                      <span className="text-[11px] text-[#4FACFF]/60 mt-0.5 shrink-0">Your goal</span>
                      <p className="text-xs text-[var(--md-text-secondary)] italic">&ldquo;{goal}&rdquo;</p>
                    </div>

                    {/* Recommended */}
                    <div className="flex flex-col gap-2 mb-4">
                      {recommendations.recommended.map(rec => {
                        const fileType = rec.fileType as MDFileType;
                        const supported = V1_SUPPORTED.includes(fileType);
                        const selected = selectedFiles.includes(fileType);
                        return (
                          <button key={rec.fileType} onClick={() => supported && toggleFile(fileType)} disabled={!supported}
                            className={`flex items-start gap-3 rounded-xl border-l-[3px] border p-4 text-left w-full transition-all ${
                              !supported
                                ? 'opacity-40 cursor-not-allowed border-l-transparent border-white/8 bg-white/[0.01]'
                                : selected
                                  ? 'border-l-[#4FACFF] border-[#4FACFF]/20 bg-[#4FACFF]/[0.06]'
                                  : 'border-l-transparent border-white/8 bg-white/[0.02] hover:border-l-[#4FACFF]/40 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              selected && supported ? 'bg-[#4FACFF] border-[#4FACFF]' : 'border-white/20'
                            }`}>
                              {selected && supported && (
                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                  <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-sm font-semibold ${selected ? 'text-[var(--md-text)]' : 'text-[var(--md-text-secondary)]'}`}>
                                  {rec.plainName}
                                </span>
                                <span className="text-[10px] text-[var(--md-text-tertiary)] font-mono">
                                  this is {rec.fileType.toUpperCase()}.md
                                </span>
                              </div>
                              <p className="text-xs text-[var(--md-text-tertiary)] leading-relaxed">{rec.whyPlain}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Skipped — collapsed */}
                    {recommendations.skipped.length > 0 && (
                      <div className="border-t border-white/6 pt-3">
                        <button
                          onClick={() => setSkippedExpanded(s => !s)}
                          className="flex items-center gap-1.5 text-xs text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors w-full text-left"
                        >
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            className={`transition-transform ${skippedExpanded ? 'rotate-90' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                          {skippedExpanded ? 'Hide' : `Other files you could add later (${recommendations.skipped.length})`}
                        </button>
                        {skippedExpanded && (
                          <div className="mt-3 flex flex-col gap-1.5">
                            {recommendations.skipped.map(rec => {
                              const fileType = rec.fileType as MDFileType;
                              const supported = V1_SUPPORTED.includes(fileType);
                              const selected = selectedFiles.includes(fileType);
                              return (
                                <button key={rec.fileType} onClick={() => supported && toggleFile(fileType)} disabled={!supported}
                                  className={`flex items-start gap-3 rounded-lg border p-3 text-left w-full transition-all opacity-60 hover:opacity-90 ${
                                    selected ? 'border-[#4FACFF]/20 bg-[#4FACFF]/[0.04]' : 'border-white/6 bg-white/[0.01]'
                                  }`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                    selected ? 'bg-[#4FACFF] border-[#4FACFF]' : 'border-white/20'
                                  }`}>
                                    {selected && (
                                      <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                                        <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-xs font-medium text-[var(--md-text-secondary)]">
                                        {PLAIN_NAMES[fileType] ?? rec.plainName}
                                      </span>
                                      <span className="text-[10px] text-[var(--md-text-tertiary)] font-mono">{rec.fileType.toUpperCase()}.md</span>
                                    </div>
                                    <p className="text-[11px] text-[var(--md-text-tertiary)]">{rec.whyPlain}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length === 0 && (
                      <p className="mt-3 text-xs text-[var(--md-coral)] bg-[var(--md-coral-light)] rounded-lg px-3 py-2 text-center">
                        Select at least one file to continue.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ── Normal file picker ──────────────────────────────────── */
              <div>
                <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Here&apos;s what we&apos;ll generate</h2>
                <p className="text-[13px] text-white/40 mb-6">We picked these based on your answers. Toggle anything on or off.</p>
                <div className="flex flex-col gap-2.5">
                  {recommendedFiles.map(f => {
                    const selected = selectedFiles.includes(f.type);
                    const disabled = !!f.v2;
                    return (
                      <button key={f.type} onClick={() => !disabled && toggleFile(f.type)} disabled={disabled}
                        className={`flex items-center gap-4 rounded-xl border-l-[3px] border border-[var(--md-border)] p-4 text-left w-full transition-all ${
                          disabled ? 'opacity-50 cursor-not-allowed'
                            : selected ? 'border-l-[var(--md-teal)] bg-[var(--md-teal-light)] border-[var(--md-teal)]/30'
                            : 'border-l-transparent bg-[var(--md-surface)] hover:border-l-[var(--md-teal)]/50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                          disabled ? 'border-[var(--md-border)] bg-black/5'
                            : selected ? 'bg-[var(--md-teal)] border-[var(--md-teal)]'
                            : 'border-[var(--md-border)]'
                        }`}>
                          {selected && !disabled && (
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                              <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-mono font-semibold">{f.name}</span>
                            {f.recommended && !f.v2 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--md-blue-light)] text-[var(--md-blue)]">Recommended</span>}
                            {f.v2 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/6 text-[var(--md-text-tertiary)]">v2</span>}
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
                <div className="mt-5 text-center">
                  <button
                    onClick={() => setUserRequestedGoalFirst(true)}
                    className="text-xs text-[var(--md-text-tertiary)] hover:text-[#4FACFF] transition-colors"
                  >
                    Not sure what you need? Describe your goal instead →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 6: Review & generate ────────────────────────────────────── */}
        {step === 6 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Ready to generate</h2>
            <p className="text-[13px] text-white/40 mb-4">
              {selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length} file{selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length !== 1 ? 's' : ''} queued.
            </p>
            {templateName && (
              <p className="text-xs text-[#4FACFF] bg-[#4FACFF]/[0.08] rounded-lg px-3 py-2 mb-6">
                ✦ Pre-filled from template: <span className="font-medium">{templateName}</span>.
              </p>
            )}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.05] mb-6 overflow-hidden">
              {[
                { label: 'Building',   value: reviewBuildingLabel },
                { label: "It's for",   value: audienceOptions.find(o => o.id === audience)?.label ?? '—' },
                { label: 'AI tools',   value: reviewAiLabel },
                { label: 'Tech stack', value: reviewStackLabel },
                { label: 'Reader',     value: reviewReaderLabel },
                ...(humanVoice && readerAudience !== 'ai_agent' ? [{ label: 'Voice', value: 'Human (no AI-isms)' }] : []),
                ...(showGoalFirst && goal ? [{ label: 'Your goal', value: `"${goal}"` }] : []),
                { label: 'Files',      value: `${selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length} file${selectedFiles.filter(t => V1_SUPPORTED.includes(t)).length !== 1 ? 's' : ''} queued` },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-4 px-4 py-3">
                  <span className="text-[11px] font-mono text-white/25 w-20 shrink-0 pt-0.5">{row.label}</span>
                  <span className="text-[13px] text-white/70">{row.value}</span>
                </div>
              ))}
            </div>
            {providers.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-6">
                <ModelSelector selected={selectedProvider} onChange={setSelectedProvider} available={providers} />
              </div>
            )}
            <p className="text-[11px] text-center text-white/25">One API call per file — takes about 5–15 seconds total.</p>
          </div>
        )}
      </Stepper>
      </div>
    </div>
  );
}
