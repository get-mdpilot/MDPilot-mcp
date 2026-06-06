import type { GenerationRequest, MDFileType } from '@/types';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { FALLBACK_PROMPTS } from './fallback';

export interface ResolvedPrompt {
  content: string;
  version: number; // 0 = hardcoded fallback
}

// In-memory cache (per server instance) — 5 min TTL
const cache = new Map<string, { content: string; version: number; ts: number }>();
const goldCache = new Map<string, { content: string | null; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// Fetch one gold example from the DB; returns null if none exists or Supabase is down.
// Result is cached for 5 min (same TTL as prompt templates).
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
  const fewShotBlock = [
    '',
    '<few_shot_example>',
    'Below is a gold-rated example of a high-quality output for this file type.',
    'Use it as a quality bar — match its depth, specificity, and structure.',
    '',
    example,
    '</few_shot_example>',
  ].join('\n');

  return systemPrompt + fewShotBlock;
}

export async function getSystemPrompt(
  fileType: MDFileType,
  role: string = 'developer',
): Promise<ResolvedPrompt> {
  const key = `${fileType}:${role}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { content: cached.content, version: cached.version };
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

  // Inject few-shot example when available — improves output quality without changing the prompt version
  const goldExample = await fetchGoldExample(fileType, role);
  if (goldExample) {
    content = injectFewShot(content, goldExample);
  }

  cache.set(key, { content, version, ts: Date.now() });
  return { content, version };
}

export function buildUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  if (fileType === 'task' || fileType === 'spec' || req.mode === 'task') {
    return buildTaskUserMessage(fileType, req);
  }
  return buildGenerateUserMessage(fileType, req);
}

function buildTaskUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  const stack = req.detectedStack.length
    ? req.detectedStack.join(', ')
    : req.rawStackInput || 'not specified';

  return [
    '<raw_task_input>',
    req.taskInput ?? '',
    '</raw_task_input>',
    '',
    `<tech_stack>${stack}</tech_stack>`,
    '',
    `Generate a production-grade ${fileType.toUpperCase()}.md from this task input.`,
    'Output raw markdown only — no preamble.',
  ].join('\n');
}

function buildGenerateUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  const stack = req.detectedStack.length ? req.detectedStack.join(', ') : req.rawStackInput || 'not specified';
  const tools = req.aiTools?.filter(t => t !== 'none').join(', ') || 'none';
  const project = req.projectType === 'other' ? (req.projectDescription || 'custom project') : req.projectType;
  return `Project type: ${project}\nAudience: ${req.audience}\nTech stack: ${stack}\nAI tools: ${tools}\n\nGenerate a production-grade ${fileType.toUpperCase()}.md for this project. Output raw markdown only.`;
}
