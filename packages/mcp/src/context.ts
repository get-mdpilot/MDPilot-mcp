import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { optimizeMarkdown } from './optimizer.js';
import { countTokens } from './tokenizer.js';
import { recordDoc, readManifest } from './manifest.js';
import { verifyClaimsOnContent } from './drift.js';
import { analyzeProject } from './analyze.js';

// ── Secret redaction ──────────────────────────────────────────────────────────
// Matches common API key shapes. NEVER write these to disk.

const SECRET_RE =
  /(sk-[A-Za-z0-9_-]{20,}|gsk_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|nvapi-[A-Za-z0-9_-]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|-----BEGIN[^-\n]*-----)/g;

export function redactSecrets(text: string): { redacted: string; count: number } {
  let count = 0;
  const redacted = text.replace(SECRET_RE, () => {
    count++;
    return '[secret redacted]';
  });
  return { redacted, count };
}

// ── CONTEXT.md structure ──────────────────────────────────────────────────────
// Each session block starts with "## Session YYYY-MM-DD" and ends at the next
// "## Session" header or EOF.

function parseSessionBlocks(content: string): string[] {
  const blocks: string[] = [];
  const lines = content.split('\n');
  let current: string[] = [];
  let inSession = false;

  for (const line of lines) {
    if (/^## Session \d{4}-\d{2}-\d{2}/.test(line)) {
      if (inSession && current.length > 0) {
        blocks.push(current.join('\n').trimEnd());
      }
      current = [line];
      inSession = true;
    } else if (inSession) {
      current.push(line);
    }
  }
  if (inSession && current.length > 0) {
    blocks.push(current.join('\n').trimEnd());
  }
  return blocks;
}

// ── save_context ──────────────────────────────────────────────────────────────

export interface SaveContextResult {
  written: boolean;
  redactedCount: number;
  tokenCount: number;
  sessionCount: number;
  filePath: string;
}

export function saveContext(
  rootDir: string,
  summary: string,
  writeToDisk = true,
): SaveContextResult {
  const { redacted, count: redactedCount } = redactSecrets(summary);

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const newBlock = `## Session ${today}

${redacted}`;

  const contextPath = join(rootDir, 'CONTEXT.md');
  let existingBlocks: string[] = [];

  if (existsSync(contextPath)) {
    try {
      existingBlocks = parseSessionBlocks(readFileSync(contextPath, 'utf-8'));
    } catch {
      // Unreadable — start fresh
    }
  }

  // Prepend new session, keep at most 5
  const allBlocks = [newBlock, ...existingBlocks].slice(0, 5);

  const header =
    `# CONTEXT.md\n\n` +
    `Session state for this project. Managed by \`mdpilot save_context\`. ` +
    `Stores the last 5 sessions. Your data never leaves your machine.\n`;

  const body = allBlocks.join('\n\n---\n\n');
  const raw = `${header}\n${body}`;

  // Token budget ~2 k — run through optimizer
  const { optimized } = optimizeMarkdown(raw);
  const tokenCount = countTokens(optimized);

  if (writeToDisk) {
    writeFileSync(contextPath, optimized, 'utf-8');
    const ctx = analyzeProject(rootDir);
    recordDoc(rootDir, 'CONTEXT.md', optimized, ctx);
  }

  return {
    written: writeToDisk,
    redactedCount,
    tokenCount,
    sessionCount: allBlocks.length,
    filePath: contextPath,
  };
}

// ── load_context ──────────────────────────────────────────────────────────────

export interface LoadContextResult {
  found: boolean;
  content: string;
  lastUpdated: string | null;
  staleAnnotations: string[];
}

export function loadContext(rootDir: string): LoadContextResult {
  const contextPath = join(rootDir, 'CONTEXT.md');

  if (!existsSync(contextPath)) {
    return { found: false, content: '', lastUpdated: null, staleAnnotations: [] };
  }

  const content = readFileSync(contextPath, 'utf-8');

  // Most-recent session date
  const dateMatch = content.match(/## Session (\d{4}-\d{2}-\d{2})/);
  const lastUpdated = dateMatch ? dateMatch[1] : null;

  // Drift check: verify every command and path in CONTEXT.md against real repo
  const ctx = analyzeProject(rootDir);
  const issues = verifyClaimsOnContent(content, rootDir, ctx);
  const staleAnnotations = issues.map(
    (i) => `[stale: ${i.message}]`,
  );

  // Check manifest for context entry
  const manifest = readManifest(rootDir);
  const recorded = manifest?.docs?.['CONTEXT.md'];
  const manifestNote = recorded
    ? `Manifest: last recorded ${recorded.generatedAt.slice(0, 10)}`
    : '';

  const annotatedContent = staleAnnotations.length > 0
    ? content + `\n\n<!-- Drift check: ${staleAnnotations.join(' | ')} -->`
    : content;

  const fullContent = [
    `Session context found (last updated ${lastUpdated ?? 'unknown'}). Inject into your working context.`,
    manifestNote,
    '',
    annotatedContent,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    found: true,
    content: fullContent,
    lastUpdated,
    staleAnnotations,
  };
}
