import type { GenerationRequest, MDFileType } from '@/types';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import { FALLBACK_PROMPTS } from './fallback';

export interface ResolvedPrompt {
  content: string;
  version: number; // 0 = hardcoded fallback
}

// In-memory cache (per server instance) — 5 min TTL
const cache = new Map<string, { content: string; version: number; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function getSystemPrompt(
  fileType: MDFileType,
  role: string = 'developer',
): Promise<ResolvedPrompt> {
  const key = `${fileType}:${role}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { content: cached.content, version: cached.version };
  }

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
        cache.set(key, { content: data.content, version: data.version, ts: Date.now() });
        return { content: data.content, version: data.version };
      }
    } catch {
      // Supabase down / no row / RLS — fall through to hardcoded fallback
    }
  }

  const fallback = FALLBACK_PROMPTS[fileType];
  if (!fallback) throw new Error(`No prompt for: ${fileType}`);
  return { content: fallback, version: 0 };
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
