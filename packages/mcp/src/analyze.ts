import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface ProjectContext {
  detectedStack: string[];
  dependencies: string[];
  packageManager: string;
  scripts: Record<string, string>;
  structure: string[];
  hasExistingDocs: { readme: boolean; agents: boolean; claude: boolean };
  language: string;
  projectName: string;
}

const IGNORE = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', '.venv',
  '__pycache__', '.turbo', '.vercel', 'coverage', '.nyc_output',
]);

const SECRET_FILES = new Set([
  '.env', '.env.local', '.env.production', '.env.development',
  '.envrc', 'secrets.json', 'credentials.json',
]);

export function analyzeProject(rootDir: string): ProjectContext {
  const stack: string[] = [];
  const allDeps: string[] = [];
  const scripts: Record<string, string> = {};
  let packageManager = 'unknown';
  let language = 'unknown';
  let projectName = rootDir.split('/').pop() ?? 'unknown';

  // ── Node / JS / TS ────────────────────────────────────────────────────────
  const pkgPath = join(rootDir, 'package.json');
  if (existsSync(pkgPath)) {
    const raw = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw) as {
      name?: string;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    language = 'JavaScript/TypeScript';
    if (pkg.name) projectName = pkg.name;
    allDeps.push(...Object.keys(deps));
    if (deps.typescript) stack.push('TypeScript');
    if (deps.next) stack.push('Next.js');
    if (deps.react) stack.push('React');
    if (deps.vue) stack.push('Vue');
    if (deps.svelte) stack.push('Svelte');
    if (deps.tailwindcss) stack.push('Tailwind CSS');
    if (deps['@supabase/supabase-js']) stack.push('Supabase');
    if (deps.express) stack.push('Express');
    if (deps.fastify) stack.push('Fastify');
    if (deps.prisma || deps['@prisma/client']) stack.push('Prisma');
    if (deps.drizzle || deps['drizzle-orm']) stack.push('Drizzle');
    if (deps.trpc || deps['@trpc/server']) stack.push('tRPC');
    if (deps['@anthropic-ai/sdk']) stack.push('Anthropic Claude');
    if (deps.openai) stack.push('OpenAI');
    if (deps['@google/generative-ai']) stack.push('Gemini');
    if (deps.vitest) stack.push('Vitest');
    if (deps.jest) stack.push('Jest');
    if (deps.playwright) stack.push('Playwright');
    Object.assign(scripts, pkg.scripts ?? {});

    if (existsSync(join(rootDir, 'pnpm-lock.yaml'))) packageManager = 'pnpm';
    else if (existsSync(join(rootDir, 'yarn.lock'))) packageManager = 'yarn';
    else if (existsSync(join(rootDir, 'bun.lockb'))) packageManager = 'bun';
    else packageManager = 'npm';
  }

  // ── Python ────────────────────────────────────────────────────────────────
  if (existsSync(join(rootDir, 'requirements.txt'))) {
    language = 'Python';
    const reqs = readFileSync(join(rootDir, 'requirements.txt'), 'utf-8');
    if (/fastapi/i.test(reqs)) stack.push('FastAPI');
    if (/django/i.test(reqs)) stack.push('Django');
    if (/flask/i.test(reqs)) stack.push('Flask');
    if (/sqlalchemy/i.test(reqs)) stack.push('SQLAlchemy');
    if (/anthropic/i.test(reqs)) stack.push('Anthropic Claude');
    if (/openai/i.test(reqs)) stack.push('OpenAI');
    packageManager = 'pip';
  }
  if (existsSync(join(rootDir, 'pyproject.toml'))) {
    language = 'Python';
    const toml = readFileSync(join(rootDir, 'pyproject.toml'), 'utf-8');
    packageManager = /\[tool\.poetry\]/.test(toml) ? 'poetry' : 'uv';
    const m = toml.match(/^name\s*=\s*"([^"]+)"/m);
    if (m) projectName = m[1];
  }

  // ── Go ────────────────────────────────────────────────────────────────────
  if (existsSync(join(rootDir, 'go.mod'))) {
    language = 'Go';
    stack.push('Go');
    packageManager = 'go modules';
    const mod = readFileSync(join(rootDir, 'go.mod'), 'utf-8');
    const m = mod.match(/^module\s+(\S+)/m);
    if (m) projectName = m[1].split('/').pop() ?? projectName;
  }

  // ── Rust ──────────────────────────────────────────────────────────────────
  if (existsSync(join(rootDir, 'Cargo.toml'))) {
    language = 'Rust';
    stack.push('Rust');
    packageManager = 'cargo';
    const cargo = readFileSync(join(rootDir, 'Cargo.toml'), 'utf-8');
    const m = cargo.match(/^name\s*=\s*"([^"]+)"/m);
    if (m) projectName = m[1];
  }

  // ── Dart / Flutter ────────────────────────────────────────────────────────
  if (existsSync(join(rootDir, 'pubspec.yaml'))) {
    language = 'Dart';
    stack.push('Flutter');
    packageManager = 'pub';
  }

  // ── Top-level structure (1 level) ─────────────────────────────────────────
  const structure: string[] = [];
  for (const entry of readdirSync(rootDir)) {
    if (IGNORE.has(entry) || SECRET_FILES.has(entry)) continue;
    const full = join(rootDir, entry);
    try {
      structure.push(statSync(full).isDirectory() ? `${entry}/` : entry);
    } catch {
      // skip unreadable entries
    }
  }

  return {
    detectedStack: stack,
    dependencies: allDeps,
    packageManager,
    scripts,
    structure,
    hasExistingDocs: {
      readme: existsSync(join(rootDir, 'README.md')),
      agents: existsSync(join(rootDir, 'AGENTS.md')),
      claude: existsSync(join(rootDir, 'CLAUDE.md')),
    },
    language,
    projectName,
  };
}
