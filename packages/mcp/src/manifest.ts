import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import type { ProjectContext } from './analyze.js';

export interface DocManifest {
  version: 1;
  generatedAt: string;
  docs: Record<string, {
    contentHash: string;
    generatedAt: string;
    sourceSnapshot: {
      dependencies: string[];
      scripts: Record<string, string>;
      structure: string[];
      stack: string[];
      mcpServers?: { name: string; configFile: string }[];
    };
  }>;
}

const MANIFEST_DIR = '.mdpilot';
const MANIFEST_FILE = 'manifest.json';

function manifestPath(rootDir: string): string {
  return join(rootDir, MANIFEST_DIR, MANIFEST_FILE);
}

export function readManifest(rootDir: string): DocManifest | null {
  const path = manifestPath(rootDir);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as DocManifest;
  } catch {
    return null;
  }
}

export function recordDoc(
  rootDir: string,
  filename: string,
  content: string,
  ctx: ProjectContext,
): void {
  const dir = join(rootDir, MANIFEST_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const manifest = readManifest(rootDir) ?? {
    version: 1 as const,
    generatedAt: '',
    docs: {},
  };

  const now = new Date().toISOString();
  manifest.generatedAt = now;
  manifest.docs[filename] = {
    contentHash: createHash('sha256').update(content).digest('hex').slice(0, 16),
    generatedAt: now,
    sourceSnapshot: {
      dependencies: ctx.dependencies,
      scripts: ctx.scripts,
      structure: ctx.structure,
      stack: ctx.detectedStack,
      mcpServers: ctx.mcpServers.map((s) => ({ name: s.name, configFile: s.configFile })),
    },
  };

  writeFileSync(join(dir, MANIFEST_FILE), JSON.stringify(manifest, null, 2), 'utf-8');
}
