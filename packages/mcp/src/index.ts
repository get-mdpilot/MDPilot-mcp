#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { analyzeProject } from './analyze.js';
import { buildDeepContext } from './repo-context.js';
import { generateFile, generateTaskFile, generateWalkthrough, type McpExecutionMode, type McpExperienceLevel, type McpReaderAudience, imageToPrompt } from './generate.js';
import { generateVerified } from './verify-generate.js';
import { optimizeMarkdown } from './optimizer.js';
import { FILE_NAMES } from './prompts.js';
import { recordDoc } from './manifest.js';
import { detectDrift } from './drift.js';
import { patchDoc } from './patch.js';

const server = new McpServer({
  name: 'mdpilot',
  version: '1.0.0',
});

// ── Tool 1: analyze_project ───────────────────────────────────────────────────

server.registerTool(
  'analyze_project',
  {
    title: 'Analyze project',
    description:
      'Scan a repo and detect its tech stack, scripts, package manager, and structure. Run this before generate_md_file so output is grounded in real project data instead of guesses.',
    inputSchema: {
      rootDir: z
        .string()
        .optional()
        .describe('Absolute path to the project root. Defaults to cwd.'),
    },
  },
  async ({ rootDir }) => {
    try {
      const ctx = analyzeProject(rootDir ?? process.cwd());
      return { content: [{ type: 'text', text: JSON.stringify(ctx, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Tool 2: generate_md_file ──────────────────────────────────────────────────

server.registerTool(
  'generate_md_file',
  {
    title: 'Generate markdown file',
    description:
      'Generate a production-grade, repo-grounded markdown file (readme, agents, claude, contributing, security, skill, design, context). Reads real package.json scripts and file structure — never hallucinates commands. Optionally writes the file to disk.',
    inputSchema: {
      fileType: z
        .enum(['readme', 'agents', 'claude', 'contributing', 'security', 'skill', 'design', 'context'])
        .describe('Which file to generate'),
      rootDir: z
        .string()
        .optional()
        .describe('Absolute path to the project root. Defaults to cwd.'),
      writeToDisk: z
        .boolean()
        .default(false)
        .describe('If true, write the generated file to the project root.'),
      verified: z
        .boolean()
        .default(false)
        .describe('If true, run the self-verification loop — generate, verify commands/paths against the real repo, revise if needed (max 2 attempts). Recommended for AGENTS.md and CLAUDE.md.'),
    },
  },
  async ({ fileType, rootDir, writeToDisk, verified }) => {
    try {
      const dir = rootDir ?? process.cwd();

      // Attempt deep context (repomix + Secretlint); fall back to basic analysis
      let ctx: ReturnType<typeof analyzeProject>;
      let secretWarning = '';
      let deepTokens = '';
      try {
        const deep = await buildDeepContext(dir);
        ctx = deep;
        if (deep.suspiciousFiles.length > 0) {
          secretWarning = `\n⚠️  Secretlint flagged ${deep.suspiciousFiles.length} file(s) — excluded from context: ${deep.suspiciousFiles.slice(0, 5).join(', ')}`;
        }
        if (deep.packedTokens > 0) {
          deepTokens = ` · Repo context: ${deep.packedTokens} tokens`;
        }
      } catch {
        ctx = analyzeProject(dir);
      }

      let raw: string;
      let verifyNote = '';
      if (verified) {
        const result = await generateVerified(fileType, ctx, dir);
        raw = result.content;
        if (result.issuesFound.length > 0) {
          const fixed = result.issuesFound.length - result.issuesRemaining.length;
          verifyNote = `\n🔍 Self-verification: found ${result.issuesFound.length} issue(s), fixed ${fixed} in ${result.attemptCount} attempt(s)`;
          if (result.issuesRemaining.length > 0) {
            verifyNote += ` — ${result.issuesRemaining.length} could not be auto-fixed`;
          }
        } else {
          verifyNote = `\n✅ Self-verification: passed on first attempt`;
        }
      } else {
        raw = await generateFile(fileType, ctx);
      }

      const { optimized, tokensBefore, tokensAfter } = optimizeMarkdown(raw);

      if (writeToDisk) {
        const filename = FILE_NAMES[fileType];
        writeFileSync(resolve(dir, filename), optimized, 'utf-8');
        recordDoc(dir, filename, optimized, ctx);
      }

      const saved = tokensBefore - tokensAfter;
      const pct = tokensBefore > 0 ? Math.round((saved / tokensBefore) * 100) : 0;
      const footer = [
        '',
        '---',
        `Tokens: ${tokensBefore} → ${tokensAfter} (saved ${saved}, ${pct}% reduction)${deepTokens}${writeToDisk ? ` · Written to ${FILE_NAMES[fileType]}` : ''}${verifyNote}${secretWarning}`,
      ].join('\n');

      return { content: [{ type: 'text', text: optimized + footer }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Tool 3: generate_task_file ────────────────────────────────────────────────

server.registerTool(
  'generate_task_file',
  {
    title: 'Generate TASK.md from task description',
    description:
      'Turn a pasted ticket, Slack thread, GitHub issue, or task description into an AI-agent-ready TASK.md with structured requirements, acceptance criteria, and a ready-to-paste agent prompt block.',
    inputSchema: {
      taskInput: z.string().describe('Raw task text — ticket, Slack thread, GitHub issue, etc.'),
      stack: z
        .string()
        .optional()
        .describe('Tech stack hint, e.g. "Next.js, TypeScript, Supabase". Auto-detected if omitted and rootDir given.'),
      rootDir: z
        .string()
        .optional()
        .describe('Absolute path to the project root — used to auto-detect stack if stack not provided.'),
      executionMode: z
        .enum(['guide', 'ai_exec', 'context'])
        .default('guide')
        .describe('Output mode: "guide" = full TASK.md for a human; "ai_exec" = prescriptive output an AI agent executes directly; "context" = compact context-only drop for a chat window.'),
      experienceLevel: z
        .enum(['experienced', 'new'])
        .default('experienced')
        .describe('Developer experience level. "new" adds "why" explanations; "experienced" keeps output terse.'),
    },
  },
  async ({ taskInput, stack, rootDir, executionMode, experienceLevel }) => {
    try {
      let resolvedStack = stack ?? '';
      if (!resolvedStack && rootDir) {
        const ctx = analyzeProject(rootDir);
        resolvedStack = ctx.detectedStack.join(', ');
      }
      const content = await generateTaskFile(
        taskInput,
        resolvedStack,
        (executionMode ?? 'guide') as McpExecutionMode,
        (experienceLevel ?? 'experienced') as McpExperienceLevel,
      );
      return { content: [{ type: 'text', text: content }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Tool 4: explain_code ──────────────────────────────────────────────────────

server.registerTool(
  'explain_code',
  {
    title: 'Explain code as WALKTHROUGH.md',
    description:
      'Explain a file or directory of code to any audience — AI agent, new team member, non-technical stakeholder, or learner. Reads a single file or uses repo context for a directory, then generates a structured WALKTHROUGH.md.',
    inputSchema: {
      filePath: z
        .string()
        .optional()
        .describe('Absolute path to a single file to explain. Use this for a focused explanation of one module.'),
      rootDir: z
        .string()
        .optional()
        .describe('Absolute path to a directory — uses repomix to gather repo context. Prefer filePath for single files.'),
      audience: z
        .enum(['ai_agent', 'team', 'non_technical', 'learner'])
        .default('non_technical')
        .describe('Who will read the explanation. "ai_agent" = terse, machine-parseable; "team" = new engineer; "non_technical" = founder/PM; "learner" = teaching mode.'),
      writeToDisk: z
        .boolean()
        .default(false)
        .describe('If true, write WALKTHROUGH.md to the project root (rootDir or filePath directory).'),
    },
  },
  async ({ filePath, rootDir, audience, writeToDisk }) => {
    try {
      let code = '';
      let outputDir = rootDir ?? process.cwd();

      if (filePath) {
        code = readFileSync(filePath, 'utf-8');
        outputDir = filePath.substring(0, filePath.lastIndexOf('/')) || process.cwd();
      } else if (rootDir) {
        const deep = await buildDeepContext(rootDir);
        code = deep.packedSummary ?? JSON.stringify({ stack: deep.detectedStack, structure: deep.structure }, null, 2);
        outputDir = rootDir;
      } else {
        return { content: [{ type: 'text', text: 'Error: Provide filePath or rootDir.' }], isError: true };
      }

      const walkthrough = await generateWalkthrough(code, (audience ?? 'non_technical') as McpReaderAudience);

      if (writeToDisk) {
        writeFileSync(resolve(outputDir, 'WALKTHROUGH.md'), walkthrough, 'utf-8');
      }

      const suffix = writeToDisk ? '\n\n---\nWritten to WALKTHROUGH.md' : '';
      return { content: [{ type: 'text', text: walkthrough + suffix }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Tool 5: optimize_markdown ─────────────────────────────────────────────────


server.registerTool(
  'optimize_markdown',
  {
    title: 'Optimize markdown for tokens',
    description:
      'Run the MDPilot 4-pass token optimizer on existing markdown content. Strips boilerplate, removes redundant phrasing, compresses structure, and tightens prose. Returns the leaner version with token savings.',
    inputSchema: {
      content: z.string().describe('Markdown content to optimize'),
    },
  },
  async ({ content }) => {
    try {
      const { optimized, tokensBefore, tokensAfter } = optimizeMarkdown(content);
      const saved = tokensBefore - tokensAfter;
      const pct = tokensBefore > 0 ? Math.round((saved / tokensBefore) * 100) : 0;
      return {
        content: [
          {
            type: 'text',
            text: `${optimized}\n\n---\nSaved ${saved} tokens (${pct}% reduction): ${tokensBefore} → ${tokensAfter}`,
          },
        ],
      };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Tool 6: image_to_prompt ───────────────────────────────────────────────────

server.registerTool(
  'image_to_prompt',
  {
    title: 'Image to generation prompt',
    description:
      'Analyze a local image file (PNG, JPG, WEBP) and generate a detailed recreation prompt for image generation models (FLUX, Stable Diffusion, Midjourney, DALL-E, Gemini). Covers subject, composition, lighting, colors, style, camera angle, and mood.',
    inputSchema: {
      imagePath: z
        .string()
        .describe('Absolute path to a .png, .jpg, .jpeg, or .webp image file'),
    },
  },
  async ({ imagePath }) => {
    try {
      const prompt = await imageToPrompt(imagePath);
      return { content: [{ type: 'text', text: prompt }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Tool 7: check_drift ───────────────────────────────────────────────────────

server.registerTool(
  'check_drift',
  {
    title: 'Check docs for drift',
    description:
      'Scan the repo and detect where docs (README.md, AGENTS.md, CLAUDE.md, CONTRIBUTING.md) have gone stale — broken commands, missing paths, undocumented scripts or directories. Uses two detection methods: claim verification (parses the doc and checks every command/path against the real repo) and snapshot diff (compares against the state when docs were last generated).',
    inputSchema: {
      rootDir: z
        .string()
        .optional()
        .describe('Absolute path to the project root. Defaults to cwd.'),
      docs: z
        .array(z.string())
        .optional()
        .describe('Specific doc filenames to check, e.g. ["AGENTS.md"]. Defaults to README.md, AGENTS.md, CLAUDE.md, CONTRIBUTING.md.'),
    },
  },
  async ({ rootDir, docs }) => {
    try {
      const dir = rootDir ?? process.cwd();
      const issues = detectDrift(dir, docs);

      if (issues.length === 0) {
        return { content: [{ type: 'text', text: '✅ No drift detected. All docs are in sync with the repo.' }] };
      }

      const icon = (s: string) => s === 'high' ? '🔴' : s === 'medium' ? '🟡' : '⚪';
      const lines = issues.map(i =>
        `${icon(i.severity)} [${i.severity.toUpperCase()}] ${i.doc} — ${i.message}${i.detail ? `\n   Detail: ${i.detail}` : ''}`,
      );

      const highCount = issues.filter(i => i.severity === 'high').length;
      const medCount = issues.filter(i => i.severity === 'medium').length;
      const lowCount = issues.filter(i => i.severity === 'low').length;
      const summary = `Found ${issues.length} issue(s): ${highCount} high · ${medCount} medium · ${lowCount} low`;

      return {
        content: [{
          type: 'text',
          text: `${summary}\n\n${lines.join('\n')}\n\nRun update_docs to fix high/medium issues.`,
        }],
      };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Tool 8: update_docs ───────────────────────────────────────────────────────

server.registerTool(
  'update_docs',
  {
    title: 'Update stale docs',
    description:
      'Fix drift in a specific doc — patches ONLY the stale sections (broken commands, missing paths) and preserves everything else exactly. Uses Claude to apply the minimal fix. Optionally writes the corrected file to disk and updates the manifest.',
    inputSchema: {
      filename: z
        .enum(['README.md', 'AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md'])
        .describe('Which doc to fix'),
      rootDir: z
        .string()
        .optional()
        .describe('Absolute path to the project root. Defaults to cwd.'),
      writeToDisk: z
        .boolean()
        .default(false)
        .describe('If true, overwrite the file on disk and update the manifest snapshot.'),
    },
  },
  async ({ filename, rootDir, writeToDisk }) => {
    try {
      const dir = rootDir ?? process.cwd();

      // Only pass high/medium issues to the patcher — low are advisory only
      const allIssues = detectDrift(dir, [filename]);
      const patchableIssues = allIssues.filter(i => i.severity !== 'low');

      if (patchableIssues.length === 0) {
        const lowCount = allIssues.filter(i => i.severity === 'low').length;
        const advisory = lowCount > 0 ? ` (${lowCount} low-severity advisory note(s) not patched)` : '';
        return { content: [{ type: 'text', text: `✅ ${filename} has no high/medium drift to fix.${advisory}` }] };
      }

      const patched = await patchDoc(dir, filename, patchableIssues);

      if (writeToDisk) {
        writeFileSync(join(dir, filename), patched, 'utf-8');
        const ctx = analyzeProject(dir);
        recordDoc(dir, filename, patched, ctx);
      }

      const issueList = patchableIssues
        .map(i => `  • [${i.severity}] ${i.message}`)
        .join('\n');

      return {
        content: [{
          type: 'text',
          text: `${patched}\n\n---\nFixed ${patchableIssues.length} issue(s) in ${filename}:\n${issueList}${writeToDisk ? '\n\nFile written to disk and manifest updated.' : '\n\n(Pass writeToDisk: true to save changes.)'}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
  },
);

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  if (process.argv[2] === 'setup') {
    const { runSetup } = await import('./setup.js');
    await runSetup();
    return;
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MDPilot MCP server running (stdio)');
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
