import { countTokens } from './tokenizer';
import type { MDFileType, OptimizationPass } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CrossFileOptimizerResult {
  files: {
    type: MDFileType;
    filename: string;
    originalContent: string;
    optimizedContent: string;
    tokensBefore: number;
    tokensAfter: number;
  }[];
  totalTokensBefore: number;
  totalTokensAfter: number;
  passes: OptimizationPass[];
}

// ── Pass 1: Boilerplate strip ─────────────────────────────────────────────────

// Each entry is a [pattern, replacement] pair. We re-create from source strings
// each call so lastIndex is never stale across invocations.
const BOILERPLATE_SOURCES: [string, string, string][] = [
  // [pattern-source, flags, replacement]
  ['^(this|the) (project|repository|repo|tool|library|application|app) (is|was|has been) (a |an |the )?', 'gim', ''],
  ['in order to ', 'gi', ''],
  ['you (need to|have to|should|must) (first |then )?', 'gi', ''],
  ['please (note|be aware|make sure|ensure) that ', 'gi', ''],
  ['^(note|important|warning|disclaimer):?\\s*', 'gim', ''],
  ['as (mentioned|described|noted|stated) (above|below|previously|earlier)', 'gi', ''],
  ['for more (information|details|info),?\\s*(please )?(see|refer to|check|visit)', 'gi', ''],
  ['^(to |how to |steps to |guide to )', 'gim', ''],
  ['^(the )?following (is|are) (a |an |the )?(list|steps|instructions|guide)', 'gim', ''],
  ['\\b(very|really|quite|extremely|absolutely|basically|essentially|simply|just)\\b', 'gi', ''],
];

function stripBoilerplate(content: string): string {
  let result = content;
  for (const [src, flags, repl] of BOILERPLATE_SOURCES) {
    result = result.replace(new RegExp(src, flags), repl);
  }
  // Clean up artefacts: double spaces, 3+ blank lines
  result = result.replace(/  +/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return result;
}

// ── Pass 2: Cross-file deduplication ─────────────────────────────────────────

interface Section {
  heading: string; // e.g. "## Installation"
  body: string;
  full: string;    // heading + body
}

function chunkBySections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentHeading = '';
  let currentLines: string[] = [];

  const flush = () => {
    if (!currentHeading && currentLines.every(l => l.trim() === '')) return;
    const body = currentLines.join('\n').trimEnd();
    sections.push({
      heading: currentHeading,
      body,
      full: currentHeading ? `${currentHeading}\n${body}` : body,
    });
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush();
      currentHeading = line;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  flush();
  return sections;
}

function computeSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  const na = normalize(a);
  const nb = normalize(b);

  // Skip very short sections — not enough signal
  if (na.length < 40 || nb.length < 40) return 0;

  const bigrams = (s: string): Set<string> => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };

  const ba = bigrams(na);
  const bb = bigrams(nb);
  const intersection = [...ba].filter(x => bb.has(x)).length;
  const union = new Set([...ba, ...bb]).size;
  return union === 0 ? 0 : intersection / union;
}

// Lower index = higher priority (canonical file)
const FILE_PRIORITY: MDFileType[] = [
  'readme', 'agents', 'claude', 'contributing', 'security', 'design', 'context', 'task', 'spec', 'skill',
];

function crossFileDedup(
  files: { type: MDFileType; filename: string; content: string }[],
): { contents: string[]; dupCount: number; tokensSaved: number } {
  // Work on mutable copies
  const contents = files.map(f => f.content);
  // Pre-compute sections from the current working copies
  const getSections = (i: number) => chunkBySections(contents[i]);

  let dupCount = 0;
  let tokensSaved = 0;

  // Build priority order
  const byPriority = files
    .map((f, i) => ({ ...f, i, p: FILE_PRIORITY.indexOf(f.type) }))
    .sort((a, b) => (a.p === -1 ? 99 : a.p) - (b.p === -1 ? 99 : b.p));

  for (let ai = 0; ai < byPriority.length; ai++) {
    for (let bi = ai + 1; bi < byPriority.length; bi++) {
      const fileA = byPriority[ai]; // canonical
      const fileB = byPriority[bi]; // secondary — duplicate removed here

      const sectionsA = getSections(fileA.i);
      const sectionsB = getSections(fileB.i);

      for (const sA of sectionsA) {
        if (!sA.heading) continue;
        for (const sB of sectionsB) {
          if (!sB.heading) continue;

          if (computeSimilarity(sA.full, sB.full) > 0.6) {
            const headingText = sA.heading.replace(/^#+\s*/, '');
            const replacement = `> See [${fileA.filename} § ${headingText}](./${fileA.filename}) for details on ${headingText.toLowerCase()}.`;
            const savedHere = countTokens(sB.full) - countTokens(replacement);

            if (savedHere > 0) {
              // Safe string replacement using indexOf to avoid regex-escaping issues
              const idx = contents[fileB.i].indexOf(sB.full);
              if (idx !== -1) {
                contents[fileB.i] =
                  contents[fileB.i].slice(0, idx) +
                  replacement +
                  contents[fileB.i].slice(idx + sB.full.length);
                tokensSaved += savedHere;
                dupCount++;
              }
            }
          }
        }
      }
    }
  }

  return { contents, dupCount, tokensSaved };
}

// ── Pass 3: Structure compression ─────────────────────────────────────────────

function compressStructure(content: string): string {
  let result = content;

  // Strip obvious single-line comments inside fenced code blocks
  result = result.replace(/```[\w]*\n([\s\S]*?)```/g, (block) => {
    return block.replace(/\n[ \t]*(\/\/[^\n]*|#[^\n]*)/g, '');
  });

  // Remove blank lines immediately after opening fence
  result = result.replace(/(```\w*)\n\n+/g, '$1\n');
  // Remove blank lines immediately before closing fence
  result = result.replace(/\n\n+(```)/g, '\n$1');

  // Trailing whitespace per line
  result = result.split('\n').map(l => l.trimEnd()).join('\n');

  // Collapse 3+ consecutive blank lines to 2
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

// ── Pass 4: Verbose compression ───────────────────────────────────────────────

const VERBOSE_PATTERNS: [RegExp, string][] = [
  // Wordy → concise
  [/in order to/gi, 'to'],
  [/due to the fact that/gi, 'because'],
  [/at this point in time/gi, 'now'],
  [/in the event that/gi, 'if'],
  [/for the purpose of/gi, 'to'],
  [/with regard to/gi, 'about'],
  [/in regard to/gi, 'about'],
  [/on a daily basis/gi, 'daily'],
  [/a large number of/gi, 'many'],
  [/a small number of/gi, 'few'],
  [/the vast majority of/gi, 'most'],
  [/at the present time/gi, 'now'],
  [/prior to/gi, 'before'],
  [/subsequent to/gi, 'after'],
  [/in close proximity to/gi, 'near'],
  [/is able to/gi, 'can'],
  [/has the ability to/gi, 'can'],
  [/it is important to note that/gi, ''],
  [/it should be noted that/gi, ''],
  [/it is worth mentioning that/gi, ''],
  [/as a matter of fact/gi, ''],
  [/needless to say/gi, ''],
  // Redundant pairs
  [/each and every/gi, 'every'],
  [/first and foremost/gi, 'first'],
  [/any and all/gi, 'all'],
  [/one and only/gi, 'only'],
  [/null and void/gi, 'void'],
  [/various different/gi, 'various'],
  [/completely finished/gi, 'finished'],
  [/absolutely essential/gi, 'essential'],
  [/basic fundamentals/gi, 'fundamentals'],
  [/future plans/gi, 'plans'],
  [/past history/gi, 'history'],
  [/end result/gi, 'result'],
  [/free gift/gi, 'gift'],
  [/new innovation/gi, 'innovation'],
];

function applyVerboseCompression(content: string): string {
  let result = content;
  for (const [re, repl] of VERBOSE_PATTERNS) {
    result = result.replace(re, repl);
  }
  // Tidy artefacts: capital-leading orphan spaces, double spaces
  return result.replace(/  +/g, ' ').replace(/ +([.,;:])/g, '$1');
}

// ── Pass 5: Smart line compression ─────────────────────────────────────────────

// (continued below — aggressive pass is Pass 6)
function compressLines(content: string): string {
  let result = content;

  // Remove heading descriptions that just restate the heading
  result = result.replace(
    /^(#{2,3}\s+.+)\n\n(?:This section (?:describes|explains|covers|shows|details) (?:how to|the|about) .+\.?\n)/gm,
    '$1\n\n',
  );

  // Collapse multiple blank lines to single
  result = result.replace(/\n{3,}/g, '\n\n');

  // Remove trailing whitespace
  result = result.replace(/[ \t]+$/gm, '');

  // Compress prose admonition prefixes to blockquote markers
  result = result.replace(/^(?:Note|Important|Warning|Tip): /gm, '> ');

  return result.trim();
}

// ── Pass 6 (opt-in): Aggressive compression ───────────────────────────────────
// Collapses soft hedges and filler constructs. NEVER touches code blocks,
// commands (lines starting with $, npm, npx, git, etc.), paths, or numbers.

const AGGRESSIVE_PATTERNS: [RegExp, string][] = [
  [/\bmake sure that\b/gi, 'ensure'],
  [/\bmake sure\b/gi, 'ensure'],
  [/\bas well as\b/gi, 'and'],
  [/\ba number of\b/gi, 'several'],
  [/\btake into account\b/gi, 'consider'],
  [/\bwith respect to\b/gi, 'for'],
  [/\bin terms of\b/gi, 'for'],
  [/\bwhether or not\b/gi, 'whether'],
  [/\beach of the\b/gi, 'each'],
  [/\ball of the\b/gi, 'all'],
  [/\bsome of the\b/gi, 'some'],
  [/\bmost of the\b/gi, 'most'],
  [/\bthe fact that\b/gi, 'that'],
  [/\bat the same time\b/gi, 'simultaneously'],
  [/\bin addition to this\b/gi, 'additionally'],
  [/\bcan be used to\b/gi, 'can'],
  [/\bis designed to\b/gi, ''],
  [/\bin the process of\b/gi, 'while'],
];

const PROTECTED_LINE_RE = /^(\s*)(```|~{3}|\$\s|npm |npx |pnpm |yarn |git |curl |wget |docker |aws |cd |ls |mkdir |\d+\.|\/[\w/])/;

function aggressiveCompress(content: string): string {
  const lines = content.split('\n');
  let inFence = false;
  const result = lines.map((line) => {
    if (/^```|^~~~/.test(line)) { inFence = !inFence; return line; }
    if (inFence || PROTECTED_LINE_RE.test(line)) return line;
    let out = line;
    for (const [re, repl] of AGGRESSIVE_PATTERNS) {
      out = out.replace(re, repl);
    }
    return out.replace(/  +/g, ' ');
  });
  return result.join('\n');
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface OptimizeFilesOptions {
  aggressive?: boolean;
}

export function optimizeFiles(
  files: { type: MDFileType; filename: string; content: string }[],
  options?: OptimizeFilesOptions,
): CrossFileOptimizerResult {
  if (files.length === 0) {
    return { files: [], totalTokensBefore: 0, totalTokensAfter: 0, passes: [] };
  }

  const allPasses: OptimizationPass[] = [];
  let working = files.map(f => f.content);

  // ── Pass 1 ────────────────────────────────────────────────────────────────
  const p1Before = working.map(c => countTokens(c));
  working = working.map(c => stripBoilerplate(c));
  const p1After = working.map(c => countTokens(c));
  const p1Saved = p1Before.reduce((s, t, i) => s + t - p1After[i], 0);
  allPasses.push({
    name: 'Boilerplate strip',
    description: 'Removed generic filler phrases',
    tokensSaved: Math.max(0, p1Saved),
  });

  // ── Pass 2 ────────────────────────────────────────────────────────────────
  const dedupInput = files.map((f, i) => ({ type: f.type, filename: f.filename, content: working[i] }));
  const { contents: dedupedContents, dupCount, tokensSaved: p2Saved } = crossFileDedup(dedupInput);
  working = dedupedContents;
  allPasses.push({
    name: 'Cross-file dedup',
    description: `Merged ${dupCount} duplicate section${dupCount !== 1 ? 's' : ''} across files`,
    tokensSaved: Math.max(0, p2Saved),
  });

  // ── Pass 3 ────────────────────────────────────────────────────────────────
  const p3Before = working.map(c => countTokens(c));
  working = working.map(c => compressStructure(c));
  const p3After = working.map(c => countTokens(c));
  const p3Saved = p3Before.reduce((s, t, i) => s + t - p3After[i], 0);
  allPasses.push({
    name: 'Structure compression',
    description: 'Cleaned code blocks and collapsed blank lines',
    tokensSaved: Math.max(0, p3Saved),
  });

  // ── Pass 4: Verbose compression ─────────────────────────────────────────────
  const p4Before = working.map(c => countTokens(c));
  working = working.map(c => applyVerboseCompression(c));
  const p4After = working.map(c => countTokens(c));
  const p4Saved = p4Before.reduce((s, t, i) => s + t - p4After[i], 0);
  allPasses.push({
    name: 'Verbose compression',
    description: 'Simplified wordy phrases',
    tokensSaved: Math.max(0, p4Saved),
  });

  // ── Pass 5: Line compression ────────────────────────────────────────────────
  const p5Before = working.map(c => countTokens(c));
  working = working.map(c => compressLines(c));
  const p5After = working.map(c => countTokens(c));
  const p5Saved = p5Before.reduce((s, t, i) => s + t - p5After[i], 0);
  allPasses.push({
    name: 'Line compression',
    description: 'Cleaned markdown structure',
    tokensSaved: Math.max(0, p5Saved),
  });

  // ── Pass 6: Aggressive compression (opt-in) ──────────────────────────────
  if (options?.aggressive) {
    const p6Before = working.map(c => countTokens(c));
    working = working.map(c => aggressiveCompress(c));
    const p6After = working.map(c => countTokens(c));
    const p6Saved = p6Before.reduce((s, t, i) => s + t - p6After[i], 0);
    allPasses.push({
      name: 'Aggressive compression',
      description: 'Collapsed soft hedges and filler (code blocks/commands preserved)',
      tokensSaved: Math.max(0, p6Saved),
    });
  }

  // ── Assemble ──────────────────────────────────────────────────────────────
  const resultFiles = files.map((f, i) => ({
    type: f.type,
    filename: f.filename,
    originalContent: f.content,
    optimizedContent: working[i],
    tokensBefore: countTokens(f.content),
    tokensAfter: countTokens(working[i]),
  }));

  return {
    files: resultFiles,
    totalTokensBefore: resultFiles.reduce((s, f) => s + f.tokensBefore, 0),
    totalTokensAfter: resultFiles.reduce((s, f) => s + f.tokensAfter, 0),
    passes: allPasses,
  };
}
