#!/usr/bin/env node
/**
 * Build-time script — generates static SEO content for every file-type × stack combo.
 * Run ONCE before deploy (or when adding new combos):
 *   npx tsx scripts/generate-seo-content.ts
 *   npx tsx scripts/generate-seo-content.ts --only agents-md/nextjs,claude-md/python
 *   npx tsx scripts/generate-seo-content.ts --force   (regenerate even if file exists)
 *
 * Output: src/content/seo/{fileType}-{stack}.json
 * Never called at request time — pages are fully static.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { getAllSeoPages, type SeoPage, type SeoContent } from '../src/lib/seo-matrix.js';
import { FALLBACK_PROMPTS } from '../src/lib/prompts/fallback.js';

// ── Load .env.local ───────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

// ── AI client — Anthropic preferred, Groq fallback ───────────────────────────

const USE_GROQ = !process.env.ANTHROPIC_API_KEY && !!process.env.GROQ_API_KEY;
const anthropic = USE_GROQ ? null : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const groq = USE_GROQ ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

async function callLLM(system: string, user: string): Promise<string> {
  if (groq) {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    return res.choices[0]?.message?.content ?? '{}';
  }
  const res = await anthropic!.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return res.content.find(b => b.type === 'text')?.text ?? '{}';
}

const OUT_DIR = join(process.cwd(), 'src/content/seo');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ── Token counter (rough: 1 token ≈ 4 chars) ─────────────────────────────────

function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── Generation prompt ─────────────────────────────────────────────────────────

function buildPrompt(page: SeoPage): { system: string; user: string } {
  const { fileType: ft, stack: st } = page;

  const existingSystemPrompt = FALLBACK_PROMPTS[ft.promptKey] ?? '';

  const system = `You are generating static content for MDPilot's SEO pages.
Each page must have genuinely unique, non-thin content that provides real value to developers.

You will return a JSON object (no markdown wrapper, no explanation) with this exact structure:
{
  "example": "...(complete ${ft.name} file content)...",
  "whySection": "...(2-4 sentences specific to ${st.name})...",
  "faqItems": [
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." },
    { "q": "...", "a": "..." }
  ]
}

RULES:
- example: A complete, real ${ft.name} using ONLY ${st.name}-specific commands and patterns. No generic placeholders.
- whySection: Must mention at least one ${st.name}-specific pain point, command, or convention. Not generic.
- faqItems: 3-4 items. First Q must be "What is ${ft.name}?". At least one Q must be ${st.name}-specific (e.g., naming conventions, where to place the file, how it interacts with ${st.name} tooling).
- Return pure JSON only. The "example" value must be a single string with \\n for newlines.`;

  const user = `Generate content for: ${ft.name} for ${st.name} projects.

Stack context:
- Language: ${st.lang}
- Package manager: ${st.packageManager}
- Key facts: ${st.facts}

File type context (use this system prompt as quality bar for the example):
${existingSystemPrompt}

Return the JSON object now.`;

  return { system, user };
}

// ── Generate one page ─────────────────────────────────────────────────────────

async function generatePage(page: SeoPage): Promise<SeoContent> {
  const { system, user } = buildPrompt(page);

  const text = await callLLM(system, user);

  // Strip any accidental markdown wrapper
  const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(cleaned) as { example: string; whySection: string; faqItems: { q: string; a: string }[] };

  return {
    example: parsed.example,
    tokenCount: countTokens(parsed.example),
    whySection: parsed.whySection,
    faqItems: parsed.faqItems,
    generatedAt: new Date().toISOString(),
  };
}

// ── CLI ───────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const onlyArg = args.find(a => a.startsWith('--only='))?.slice(7);
  const onlySet = onlyArg ? new Set(onlyArg.split(',').map(s => s.trim())) : null;

  const allPages = getAllSeoPages();
  const pages = onlySet
    ? allPages.filter(p => onlySet.has(`${p.fileTypeSlug}/${p.stackSlug}`))
    : allPages;

  console.log(`Generating ${pages.length} page(s)${force ? ' (force)' : ''} …\n`);

  let done = 0;
  let skipped = 0;
  let failed = 0;

  // Process in batches of 5 to avoid rate limits
  const BATCH = 5;
  for (let i = 0; i < pages.length; i += BATCH) {
    const batch = pages.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async page => {
        const outFile = join(OUT_DIR, `${page.fileTypeSlug}-${page.stackSlug}.json`);
        if (!force && existsSync(outFile)) {
          process.stdout.write(`  SKIP  ${page.fileTypeSlug}/${page.stackSlug}\n`);
          skipped++;
          return;
        }
        try {
          const content = await generatePage(page);
          writeFileSync(outFile, JSON.stringify(content, null, 2), 'utf-8');
          process.stdout.write(`  ✓     ${page.fileTypeSlug}/${page.stackSlug} (${content.tokenCount} tokens)\n`);
          done++;
        } catch (err) {
          process.stdout.write(`  ✗     ${page.fileTypeSlug}/${page.stackSlug} — ${String(err)}\n`);
          failed++;
        }
      }),
    );
    // Small pause between batches
    if (i + BATCH < pages.length) await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nDone: ${done} generated · ${skipped} skipped · ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
