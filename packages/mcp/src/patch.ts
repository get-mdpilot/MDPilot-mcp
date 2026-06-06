import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { analyzeProject } from './analyze.js';
import type { DriftIssue } from './drift.js';

const client = new Anthropic();

const PATCH_SYSTEM = `You fix stale documentation.

You receive:
1. The current content of a markdown doc
2. A list of detected drift issues (broken commands, missing paths, undocumented changes)
3. The real current project state (actual scripts, paths, stack)

Your job:
- Fix ONLY the sections affected by the listed issues
- Preserve everything else exactly — same wording, same structure, same sections, same order
- Replace broken commands with the correct ones from the real project state
- Replace broken paths with paths that actually exist
- Never invent commands or paths not present in the real project state
- Output the complete corrected file, raw markdown only, no preamble`;

export async function patchDoc(
  rootDir: string,
  filename: string,
  issues: DriftIssue[],
): Promise<string> {
  const filePath = join(rootDir, filename);
  if (!existsSync(filePath)) {
    throw new Error(`${filename} not found in ${rootDir}`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const ctx = analyzeProject(rootDir);

  const issueBlock = issues
    .map(i => `[${i.severity.toUpperCase()}] ${i.type}: ${i.message}${i.detail ? ` — ${i.detail}` : ''}`)
    .join('\n');

  const userMessage = [
    `<current_doc filename="${filename}">`,
    content,
    `</current_doc>`,
    ``,
    `<drift_issues>`,
    issueBlock,
    `</drift_issues>`,
    ``,
    `<real_project_state>`,
    `Package manager: ${ctx.packageManager}`,
    `Scripts: ${JSON.stringify(ctx.scripts, null, 2)}`,
    `Top-level structure: ${ctx.structure.join(', ')}`,
    `Stack: ${ctx.detectedStack.join(', ')}`,
    `</real_project_state>`,
    ``,
    `Fix only the drift issues listed above. Keep every other part of the doc identical. Output the full corrected file.`,
  ].join('\n');

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system: PATCH_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = res.content.find(b => b.type === 'text');
  return text?.text ?? content;
}
