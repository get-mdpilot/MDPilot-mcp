import { pack, mergeConfigs } from 'repomix';
import { readFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { analyzeProject, type ProjectContext } from './analyze.js';
import { countTokens } from './tokenizer.js';

export interface DeepRepoContext extends ProjectContext {
  packedSummary: string;
  packedTokens: number;
  suspiciousFiles: string[];
}

const TOKEN_BUDGET = 30_000;

const IGNORE_PATTERNS = [
  '.env*', '*.pem', '*.key', '*.p12', '*.pfx', '*.cer', '*.crt',
  'secrets/**', 'credentials/**', '.secrets/**',
  'node_modules/**', '.git/**', '.next/**', 'dist/**', 'build/**',
  '*.lock', 'package-lock.json',
  '*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', '*.ico', '*.svg',
  '*.woff', '*.woff2', '*.ttf', '*.eot',
  '*.mp4', '*.mov', '*.avi', '*.mp3', '*.wav',
  '*.zip', '*.tar', '*.gz', '*.tgz',
  'coverage/**', '.nyc_output/**',
];

export async function buildDeepContext(rootDir: string): Promise<DeepRepoContext> {
  const ctx = analyzeProject(rootDir);

  const tmpOut = join(tmpdir(), `mdpilot-repomix-${Date.now()}.txt`);

  let packedSummary = '';
  let suspiciousFiles: string[] = [];

  try {
    const config = mergeConfigs(rootDir, {}, {
      output: {
        style: 'plain',
        filePath: tmpOut,
        compress: true,
        directoryStructure: true,
        fileSummary: true,
        removeComments: false,
        showLineNumbers: false,
      },
      ignore: { customPatterns: IGNORE_PATTERNS, useGitignore: true, useDefaultPatterns: true },
      security: { enableSecurityCheck: true },
    });

    const result = await pack([rootDir], config);

    // Collect files flagged by Secretlint so we can surface them to the user
    if (result.suspiciousFilesResults) {
      suspiciousFiles = result.suspiciousFilesResults
        .filter((f: { hasSecrets?: boolean; filePath?: string }) => f.hasSecrets)
        .map((f: { filePath?: string }) => f.filePath ?? '')
        .filter(Boolean);
    }

    if (existsSync(tmpOut)) {
      packedSummary = readFileSync(tmpOut, 'utf-8');
    }
  } catch {
    // repomix unavailable — degrade gracefully to basic ProjectContext
    packedSummary = '';
  } finally {
    try { unlinkSync(tmpOut); } catch { /* tmp cleanup — ignore */ }
  }

  // Apply token budget — trim from the bottom (directory structure stays at top)
  if (packedSummary && countTokens(packedSummary) > TOKEN_BUDGET) {
    const lines = packedSummary.split('\n');
    let lo = 100, hi = lines.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (countTokens(lines.slice(0, mid).join('\n')) <= TOKEN_BUDGET) lo = mid;
      else hi = mid - 1;
    }
    packedSummary =
      lines.slice(0, lo).join('\n') +
      '\n\n[... truncated — 30k token budget reached ...]';
  }

  return {
    ...ctx,
    packedSummary,
    packedTokens: countTokens(packedSummary),
    suspiciousFiles,
  };
}
