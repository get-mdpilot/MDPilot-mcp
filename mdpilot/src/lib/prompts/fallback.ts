import type { MDFileType } from '@/types';
import { AGENTS_SYSTEM_PROMPT } from './agents';
import { CLAUDE_SYSTEM_PROMPT } from './claude';
import { README_SYSTEM_PROMPT } from './readme';
import { TASK_SYSTEM_PROMPT } from './task';
import { SPEC_SYSTEM_PROMPT } from './spec';
import { SKILL_SYSTEM_PROMPT } from './skill';
import { DESIGN_SYSTEM_PROMPT } from './design';
import { CONTRIBUTING_SYSTEM_PROMPT } from './contributing';
import { SECURITY_SYSTEM_PROMPT } from './security';
import { CONTEXT_SYSTEM_PROMPT } from './context';

// Hardcoded prompts — the source of truth for the seed script, and the
// fallback whenever Supabase is unavailable or has no matching row.
export const FALLBACK_PROMPTS: Partial<Record<MDFileType, string>> = {
  readme:       README_SYSTEM_PROMPT,
  agents:       AGENTS_SYSTEM_PROMPT,
  claude:       CLAUDE_SYSTEM_PROMPT,
  task:         TASK_SYSTEM_PROMPT,
  spec:         SPEC_SYSTEM_PROMPT,
  skill:        SKILL_SYSTEM_PROMPT,
  design:       DESIGN_SYSTEM_PROMPT,
  contributing: CONTRIBUTING_SYSTEM_PROMPT,
  security:     SECURITY_SYSTEM_PROMPT,
  context:      CONTEXT_SYSTEM_PROMPT,
};
