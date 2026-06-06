import type { GenerationRequest, MDFileType } from '@/types';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { FALLBACK_PROMPTS } from './fallback';
import { buildTaskSystemPrompt } from './task';
import { buildAudienceDirective } from './audience';

export interface ResolvedPrompt {
  content: string;
  version: number; // 0 = hardcoded fallback
}

// In-memory cache (per server instance) — 5 min TTL
const cache = new Map<string, { content: string; version: number; ts: number }>();
const goldCache = new Map<string, { content: string | null; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchGoldExample(fileType: MDFileType, role: string): Promise<string | null> {
  if (!supabaseEnabled) return null;

  const key = `gold:${fileType}:${role}`;
  const cached = goldCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.content;

  try {
    const { data } = await supabase
      .from('gold_examples')
      .select('content')
      .eq('file_type', fileType)
      .eq('role', role)
      .limit(1)
      .single();

    const content = data?.content ?? null;
    goldCache.set(key, { content, ts: Date.now() });
    return content;
  } catch {
    return null;
  }
}

function injectFewShot(systemPrompt: string, example: string): string {
  return (
    systemPrompt +
    '\n\n<few_shot_example>\nBelow is a gold-rated example of a high-quality output for this file type.\nUse it as a quality bar — match its depth, specificity, and structure.\n\n' +
    example +
    '\n</few_shot_example>'
  );
}

export async function getSystemPrompt(
  fileType: MDFileType,
  role: string = 'developer',
  req?: GenerationRequest,
): Promise<ResolvedPrompt> {
  // Task/spec mode: build dynamically with domain + language expertise
  if ((fileType === 'task' || fileType === 'spec') && req) {
    return { content: buildTaskSystemPrompt(req), version: 0 };
  }

  // Walkthrough/explain mode: fetch base prompt, always append audience directive
  // (audience directive is the core value here — skip cache for explain mode)
  if (fileType === 'walkthrough' && req) {
    const base = FALLBACK_PROMPTS.walkthrough ?? '';
    const directive = buildAudienceDirective(req);
    return { content: directive ? `${base}\n\n${directive}` : base, version: 0 };
  }

  // Generate mode: fetch from Supabase/fallback (cached), then append audience directive
  const cacheKey = `${fileType}:${role}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    // Still append audience directive — it's request-specific, not cached
    const directive = req ? buildAudienceDirective(req) : '';
    const content = directive ? `${cached.content}\n\n${directive}` : cached.content;
    return { content, version: cached.version };
  }

  let content: string;
  let version: number;

  if (supabaseEnabled) {
    try {
      const { data } = await supabase
        .from('prompt_templates')
        .select('content, version')
        .eq('file_type', fileType)
        .eq('role', role)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (data?.content) {
        content = data.content;
        version = data.version;
      } else {
        content = FALLBACK_PROMPTS[fileType] ?? '';
        version = 0;
      }
    } catch {
      content = FALLBACK_PROMPTS[fileType] ?? '';
      version = 0;
    }
  } else {
    content = FALLBACK_PROMPTS[fileType] ?? '';
    version = 0;
  }

  if (!content) throw new Error(`No prompt for: ${fileType}`);

  const goldExample = await fetchGoldExample(fileType, role);
  if (goldExample) {
    content = injectFewShot(content, goldExample);
  }

  cache.set(cacheKey, { content, version, ts: Date.now() });

  // Append audience directive (not cached — request-specific)
  const directive = req ? buildAudienceDirective(req) : '';
  const finalContent = directive ? `${content}\n\n${directive}` : content;
  return { content: finalContent, version };
}

export function buildUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  if (fileType === 'walkthrough') {
    return buildExplainUserMessage(req);
  }
  if (fileType === 'task' || fileType === 'spec' || req.mode === 'task') {
    return buildTaskUserMessage(fileType, req);
  }
  return buildGenerateUserMessage(fileType, req);
}

function buildExplainUserMessage(req: GenerationRequest): string {
  const code = req.rawStackInput ?? req.projectDescription ?? '';
  const audience = req.generateOptions?.audience ?? 'non_technical';
  return [
    '<code_to_explain>',
    code,
    '</code_to_explain>',
    '',
    `<reader_audience>${audience}</reader_audience>`,
    '',
    'Produce a WALKTHROUGH.md that explains this code to the reader described in the audience_directive.',
    'Output raw markdown only — no preamble.',
  ].join('\n');
}

function buildTaskUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  const stack = req.detectedStack.length
    ? req.detectedStack.join(', ')
    : req.rawStackInput || 'not specified';

  const lines = [
    '<raw_task_input>',
    req.taskInput ?? '',
    '</raw_task_input>',
    '',
    `<tech_stack>${stack}</tech_stack>`,
  ];

  if (req.taskOptions) {
    lines.push('', `<output_config execution_mode="${req.taskOptions.executionMode}" experience="${req.taskOptions.experienceLevel}" />`);
  }

  lines.push(
    '',
    `Generate a production-grade ${fileType.toUpperCase()}.md from this task input.`,
    'Output raw markdown only — no preamble.',
  );
  return lines.join('\n');
}

function buildGenerateUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  const stack = req.detectedStack.length ? req.detectedStack.join(', ') : req.rawStackInput || 'not specified';
  const tools = req.aiTools?.filter(t => t !== 'none').join(', ') || 'none';
  const project = req.projectType === 'other' ? (req.projectDescription || 'custom project') : req.projectType;
  return `Project type: ${project}\nAudience: ${req.audience}\nTech stack: ${stack}\nAI tools: ${tools}\n\nGenerate a production-grade ${fileType.toUpperCase()}.md for this project. Output raw markdown only.`;
}
