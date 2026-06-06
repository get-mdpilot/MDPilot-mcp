export interface SeoFileType {
  slug: string;
  name: string;
  intent: string;
  description: string;
  /** Key into the existing system prompts */
  promptKey: 'agents' | 'claude' | 'readme' | 'contributing' | 'skill' | 'design';
}

export interface SeoStack {
  slug: string;
  name: string;
  lang: string;
  /** Key stack-specific facts for grounding generation */
  facts: string;
  packageManager: string;
}

export interface SeoPage {
  fileTypeSlug: string;
  stackSlug: string;
  fileType: SeoFileType;
  stack: SeoStack;
}

// ── File types ────────────────────────────────────────────────────────────────

export const SEO_FILE_TYPES: SeoFileType[] = [
  {
    slug: 'agents-md',
    name: 'AGENTS.md',
    intent: 'AI coding agent instructions',
    promptKey: 'agents',
    description:
      'AGENTS.md is a machine-readable specification file that tells AI coding assistants (Claude Code, Cursor, GitHub Copilot, Windsurf) exactly how to work in your codebase — the real commands to run, the permission boundaries, and code style rules they must follow. Unlike documentation written for humans, AGENTS.md is optimised for agents: every line prevents a concrete mistake.',
  },
  {
    slug: 'claude-md',
    name: 'CLAUDE.md',
    intent: 'Claude Code session memory',
    promptKey: 'claude',
    description:
      'CLAUDE.md is Claude Code\'s persistent memory file — loaded at the start of every session. It captures what Claude would get wrong by reading the code alone: the non-obvious gotchas, the current focus, and the hard constraints not documented anywhere else. Every line must pass the test: "would removing this cause a mistake?" If not, it shouldn\'t be there.',
  },
  {
    slug: 'readme',
    name: 'README.md',
    intent: 'project readme',
    promptKey: 'readme',
    description:
      'README.md is the front door of your project. In the AI era it serves double duty: it orients human contributors AND gets parsed by AI agents trying to understand what they\'re working with. A well-structured README surfaces the right commands, the real installation steps, and a working quick-start in under 800 tokens — the limit at which agents start skimming.',
  },
  {
    slug: 'contributing',
    name: 'CONTRIBUTING.md',
    intent: 'contributor guide',
    promptKey: 'contributing',
    description:
      'CONTRIBUTING.md is your contributor onboarding guide. With AI-assisted contributions now standard practice, a good CONTRIBUTING.md must state your policy on AI-generated code, your review expectations, and the exact commands to run from a clean checkout — not descriptions, actual commands. Contributors (human or AI) should reach a passing test run without asking a single question.',
  },
  {
    slug: 'skill-md',
    name: 'SKILL.md',
    intent: 'reusable agent skill definition',
    promptKey: 'skill',
    description:
      'SKILL.md defines a reusable capability in the agentskills.io standard. It tells AI coding agents exactly when to trigger a skill (the description field is the trigger), how to use it (working Quick Start code), and what to do when it fails (Edge Cases with recovery steps). Skills make agent capabilities composable and shareable across projects and teams.',
  },
  {
    slug: 'design-md',
    name: 'DESIGN.md',
    intent: 'machine-readable design system spec',
    promptKey: 'design',
    description:
      'DESIGN.md is a machine-readable design system specification that lives in your repo. Unlike Figma files, it gets read by AI agents generating UI components — so every generated component is on-brand with exact hex values, rem scales, and spacing tokens rather than generic approximations. Every value in DESIGN.md must be exact: not "blue" but "#4FACFF", not "large" but "24px".',
  },
];

// ── Stacks ────────────────────────────────────────────────────────────────────

export const SEO_STACKS: SeoStack[] = [
  {
    slug: 'nextjs',
    name: 'Next.js',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'App Router vs Pages Router distinction, server vs client components, next dev / next build / next start / next lint scripts, Vercel deployment, TypeScript strict mode, Tailwind CSS, absolute imports with @/ prefix',
  },
  {
    slug: 'react',
    name: 'React',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'Vite or CRA bundler, functional components only, hooks-based state, npm run dev / npm run build / npm test scripts, TypeScript strict, component co-location, testing with Vitest or Jest + React Testing Library',
  },
  {
    slug: 'python',
    name: 'Python',
    lang: 'Python',
    packageManager: 'pip',
    facts: 'Virtual environment setup (python -m venv .venv), requirements.txt or pyproject.toml, pytest for testing, black/ruff for formatting, PEP 8 conventions, type hints with mypy, pip install -e . for editable install',
  },
  {
    slug: 'fastapi',
    name: 'FastAPI',
    lang: 'Python',
    packageManager: 'pip/uv',
    facts: 'uvicorn for serving (uvicorn main:app --reload), pydantic models for validation, async/await patterns, /docs auto-generated Swagger UI, pytest with httpx for testing, alembic for migrations, SQLAlchemy or SQLModel',
  },
  {
    slug: 'django',
    name: 'Django',
    lang: 'Python',
    packageManager: 'pip',
    facts: 'python manage.py runserver / migrate / makemigrations / test / createsuperuser, settings module split (base/dev/prod), INSTALLED_APPS pattern, DRF for API, pytest-django, SECRET_KEY in env, collectstatic for deployment',
  },
  {
    slug: 'nodejs',
    name: 'Node.js',
    lang: 'JavaScript',
    packageManager: 'npm',
    facts: 'Express or Fastify framework, CommonJS vs ESM modules, npm scripts (dev/build/test/lint/start), dotenv for env vars, Jest or Vitest for tests, nodemon for dev, Docker-ready Dockerfile patterns',
  },
  {
    slug: 'go',
    name: 'Go',
    lang: 'Go',
    packageManager: 'go modules',
    facts: 'go run / go build / go test ./... / go mod tidy commands, package main entry, go.mod for dependencies, table-driven tests, context.Context pattern, gofmt enforced, no circular imports, interface-based design',
  },
  {
    slug: 'rust',
    name: 'Rust',
    lang: 'Rust',
    packageManager: 'cargo',
    facts: 'cargo run / cargo build --release / cargo test / cargo clippy / cargo fmt commands, Cargo.toml workspace, ownership rules, Result<T,E> error handling, no unwrap() in production, serde for serialization, tokio for async',
  },
  {
    slug: 'flutter',
    name: 'Flutter',
    lang: 'Dart',
    packageManager: 'pub',
    facts: 'flutter run / flutter build apk / flutter test / flutter pub get commands, pubspec.yaml dependencies, StatelessWidget vs StatefulWidget vs hooks_riverpod, BLoC or Riverpod state management, dart format, l10n for localization',
  },
  {
    slug: 'vue',
    name: 'Vue',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'Vite + Vue 3 + Composition API, <script setup lang="ts">, npm run dev / build / test:unit, Pinia for state management, Vue Router, Vitest + Vue Test Utils, defineProps/defineEmits for component API',
  },
  {
    slug: 'svelte',
    name: 'Svelte',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'SvelteKit framework, +page.svelte / +layout.svelte conventions, load functions for data fetching, npm run dev / build / preview, Vite-based, stores for state, no virtual DOM, .svelte file format',
  },
  {
    slug: 'laravel',
    name: 'Laravel',
    lang: 'PHP',
    packageManager: 'composer',
    facts: 'php artisan serve / migrate / make:controller / test commands, Eloquent ORM, Blade templates, composer install / update, .env for config, queue workers, PHPUnit + Pest for testing, Vite for assets',
  },
  {
    slug: 'rails',
    name: 'Ruby on Rails',
    lang: 'Ruby',
    packageManager: 'bundler',
    facts: 'rails server / rails db:migrate / rails generate / rails test commands, MVC convention, bundle install, ActiveRecord, ERB templates, RSpec or minitest, strong parameters, Hotwire/Turbo for interactivity',
  },
  {
    slug: 'spring-boot',
    name: 'Spring Boot',
    lang: 'Java',
    packageManager: 'maven/gradle',
    facts: './mvnw spring-boot:run / test / package or gradle bootRun / test, @SpringBootApplication, application.properties/yml, JPA + Hibernate, @RestController, Maven wrapper for CI, Docker Jib plugin',
  },
  {
    slug: 'dotnet',
    name: '.NET',
    lang: 'C#',
    packageManager: 'nuget',
    facts: 'dotnet run / build / test / publish commands, appsettings.json for config, minimal APIs or controllers, Entity Framework Core migrations (dotnet ef migrations add), xUnit or NUnit, nullable reference types enabled',
  },
  {
    slug: 'expo',
    name: 'Expo',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'npx expo start / build / install, Expo Router for navigation, EAS Build for CI/CD, app.json/app.config.ts, React Native under the hood, expo-dev-client for native modules, OTA updates via expo-updates',
  },
  {
    slug: 'astro',
    name: 'Astro',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'npm run dev / build / preview, .astro file format, islands architecture (client:load/idle/visible directives), content collections for MDX, zero JS by default, integrations for React/Vue/Svelte components',
  },
  {
    slug: 'nuxt',
    name: 'Nuxt',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'npx nuxi dev / build / generate, auto-imported composables and components, server/ directory for API routes, nuxt.config.ts, Nitro engine, useAsyncData/useFetch for data, Pinia via @pinia/nuxt',
  },
  {
    slug: 'remix',
    name: 'Remix',
    lang: 'TypeScript',
    packageManager: 'npm',
    facts: 'npm run dev / build / start, loader/action functions for data, form-based mutations (no client fetch), nested routes via file system, remix.config.js, Vite-based, progressive enhancement as core principle',
  },
  {
    slug: 'turborepo',
    name: 'Turborepo',
    lang: 'TypeScript',
    packageManager: 'pnpm',
    facts: 'pnpm install at root, turbo run build/test/lint from root, turbo.json pipeline, apps/ and packages/ workspace structure, shared packages via @repo/ prefix, remote caching with turbo login, workspace filtering with --filter',
  },
];

// ── Matrix ────────────────────────────────────────────────────────────────────

export function getAllSeoPages(): SeoPage[] {
  const pages: SeoPage[] = [];
  for (const fileType of SEO_FILE_TYPES) {
    for (const stack of SEO_STACKS) {
      pages.push({ fileTypeSlug: fileType.slug, stackSlug: stack.slug, fileType, stack });
    }
  }
  return pages;
}

export function getSeoPage(fileTypeSlug: string, stackSlug: string): SeoPage | null {
  const fileType = SEO_FILE_TYPES.find(f => f.slug === fileTypeSlug);
  const stack = SEO_STACKS.find(s => s.slug === stackSlug);
  if (!fileType || !stack) return null;
  return { fileTypeSlug, stackSlug, fileType, stack };
}

// ── Content type (stored in src/content/seo/) ─────────────────────────────────

export interface SeoContent {
  example: string;
  tokenCount: number;
  whySection: string;
  faqItems: { q: string; a: string }[];
  generatedAt: string;
}
