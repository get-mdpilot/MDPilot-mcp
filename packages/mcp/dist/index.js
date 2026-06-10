#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { analyzeProject } from './analyze.js';
import { buildDeepContext } from './repo-context.js';
import { generateFile, generateTaskFile, generateWalkthrough, imageToPrompt } from './generate.js';
import { generateVerified } from './verify-generate.js';
import { optimizeMarkdown } from './optimizer.js';
import { FILE_NAMES } from './prompts.js';
import { recordDoc } from './manifest.js';
import { detectDrift } from './drift.js';
import { patchDoc } from './patch.js';
import { saveContext, loadContext } from './context.js';
const server = new McpServer({
    name: 'mdpilot',
    version: '1.0.0',
});
// ── Compact formatting helpers ────────────────────────────────────────────────
function compactFooter(file, tokensBefore, tokensAfter, extra = '') {
    const saved = tokensBefore - tokensAfter;
    const pct = tokensBefore > 0 ? Math.round((saved / tokensBefore) * 100) : 0;
    return `✓ ${file} | ${tokensAfter} tokens (saved ${saved}, ${pct}%) ${extra}`.trimEnd();
}
// ── Tool 1: analyze_project ───────────────────────────────────────────────────
server.registerTool('analyze_project', {
    title: 'Analyze project',
    description: 'Scan a repo and detect its tech stack, scripts, package manager, structure, and MCP servers. Run this before generate_md_file so output is grounded in real project data instead of guesses.',
    inputSchema: {
        rootDir: z
            .string()
            .optional()
            .describe('Absolute path to the project root. Defaults to cwd.'),
        verbose: z
            .boolean()
            .default(false)
            .describe('Return full JSON instead of compact summary.'),
    },
}, async ({ rootDir, verbose }) => {
    try {
        const ctx = analyzeProject(rootDir ?? process.cwd());
        if (verbose) {
            return { content: [{ type: 'text', text: JSON.stringify(ctx, null, 2) }] };
        }
        // Compact format: dense structured block, no narrative sentences
        const scriptLines = Object.entries(ctx.scripts)
            .map(([k, v]) => `  ${k} → ${v}`)
            .join('\n') || '  (none)';
        const mcpLine = ctx.mcpServers.length > 0
            ? `mcp: ${ctx.mcpServers.map((s) => `${s.name} (${s.configFile})`).join(', ')}`
            : 'mcp: none';
        const docsLine = [
            ctx.hasExistingDocs.readme ? 'README ✓' : 'README ✗',
            ctx.hasExistingDocs.agents ? 'AGENTS ✓' : 'AGENTS ✗',
            ctx.hasExistingDocs.claude ? 'CLAUDE ✓' : 'CLAUDE ✗',
        ].join(' · ');
        const text = [
            `${ctx.projectName} | ${ctx.detectedStack.join(' · ') || 'stack: unknown'}`,
            `manager: ${ctx.packageManager} | language: ${ctx.language}`,
            `scripts:\n${scriptLines}`,
            `structure: ${ctx.structure.join(', ')}`,
            `deps: ${ctx.dependencies.length} total`,
            `docs: ${docsLine}`,
            mcpLine,
        ].join('\n');
        return { content: [{ type: 'text', text }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 2: generate_md_file ──────────────────────────────────────────────────
server.registerTool('generate_md_file', {
    title: 'Generate markdown file',
    description: 'Generate a production-grade, repo-grounded markdown file (readme, agents, claude, contributing, security, skill, design, context). Reads real package.json scripts and file structure — never hallucinates commands. Optionally writes the file to disk.',
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
        tokenDiscipline: z
            .boolean()
            .default(false)
            .describe('If true, append a "Response style" section to AGENTS.md/CLAUDE.md instructing the AI to be terse. Cuts agent chat tokens by ~20%.'),
        writingStyle: z
            .enum(['default', 'human'])
            .default('default')
            .describe('When "human", appends a natural writing style directive for human-facing file types (readme, contributing, design). No effect on agent-facing files (agents, claude, skill, context).'),
        verbose: z
            .boolean()
            .default(false)
            .describe('Return verbose output with full commentary instead of the compact single-line footer.'),
    },
}, async ({ fileType, rootDir, writeToDisk, verified, tokenDiscipline, writingStyle, verbose }) => {
    try {
        const dir = rootDir ?? process.cwd();
        let ctx;
        let secretWarning = '';
        let deepTokens = '';
        try {
            const deep = await buildDeepContext(dir);
            ctx = deep;
            if (deep.suspiciousFiles.length > 0) {
                secretWarning = ` · ⚠️ ${deep.suspiciousFiles.length} secret file(s) excluded`;
            }
            if (deep.packedTokens > 0) {
                deepTokens = ` · repo: ${deep.packedTokens} tokens`;
            }
        }
        catch {
            ctx = analyzeProject(dir);
        }
        let raw;
        let verifyNote = '';
        const opts = { tokenDiscipline: tokenDiscipline ?? false, mcpServers: ctx.mcpServers, writingStyle: (writingStyle ?? 'default') };
        if (verified) {
            const result = await generateVerified(fileType, ctx, dir);
            raw = result.content;
            const fixed = result.issuesFound.length - result.issuesRemaining.length;
            if (result.issuesFound.length > 0) {
                verifyNote = verified
                    ? ` · verified: ${result.attemptCount} pass(es), ${fixed} fixed${result.issuesRemaining.length > 0 ? `, ${result.issuesRemaining.length} unfixed` : ''}`
                    : '';
            }
            else {
                verifyNote = ' · verified: ✓';
            }
        }
        else {
            raw = await generateFile(fileType, ctx, opts);
        }
        const { optimized, tokensBefore, tokensAfter } = optimizeMarkdown(raw);
        if (writeToDisk) {
            const filename = FILE_NAMES[fileType];
            writeFileSync(resolve(dir, filename), optimized, 'utf-8');
            recordDoc(dir, filename, optimized, ctx);
        }
        const filename = FILE_NAMES[fileType];
        const footer = verbose
            ? [
                '',
                '---',
                `Tokens: ${tokensBefore} → ${tokensAfter} (saved ${tokensBefore - tokensAfter})${deepTokens}${writeToDisk ? ` · Written to ${filename}` : ''}${verifyNote}${secretWarning}`,
            ].join('\n')
            : '\n\n' + compactFooter(filename, tokensBefore, tokensAfter, `${writeToDisk ? `· written` : ''}${verifyNote}${secretWarning}${deepTokens}`);
        return { content: [{ type: 'text', text: optimized + footer }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 3: generate_task_file ────────────────────────────────────────────────
server.registerTool('generate_task_file', {
    title: 'Generate TASK.md from task description',
    description: 'Turn a pasted ticket, Slack thread, GitHub issue, or task description into an AI-agent-ready TASK.md with structured requirements, acceptance criteria, and a ready-to-paste agent prompt block.',
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
        riskCheck: z
            .boolean()
            .default(false)
            .describe('When true (ai_exec mode only): if the TASK.md has a Watch-outs section, appends "check your plan against the Watch-outs" to the agent prompt block before execution.'),
        verbose: z
            .boolean()
            .default(false)
            .describe('Return verbose output with token stats. Default: compact (content only).'),
    },
}, async ({ taskInput, stack, rootDir, executionMode, experienceLevel, riskCheck, verbose }) => {
    try {
        let resolvedStack = stack ?? '';
        if (!resolvedStack && rootDir) {
            const ctx = analyzeProject(rootDir);
            resolvedStack = ctx.detectedStack.join(', ');
        }
        const content = await generateTaskFile(taskInput, resolvedStack, (executionMode ?? 'guide'), (experienceLevel ?? 'experienced'), riskCheck ?? false);
        if (verbose) {
            return { content: [{ type: 'text', text: content + `\n\n---\nGenerated TASK.md (${content.split(' ').length} words)` }] };
        }
        return { content: [{ type: 'text', text: content }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 4: explain_code ──────────────────────────────────────────────────────
server.registerTool('explain_code', {
    title: 'Explain code as WALKTHROUGH.md',
    description: 'Explain a file or directory of code to any audience — AI agent, new team member, non-technical stakeholder, or learner. Reads a single file or uses repo context for a directory, then generates a structured WALKTHROUGH.md.',
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
        writingStyle: z
            .enum(['default', 'human'])
            .default('default')
            .describe('When "human", appends a natural writing style directive for a more conversational walkthrough. Auto-enabled for non_technical and learner audiences regardless of this setting.'),
        verbose: z
            .boolean()
            .default(false)
            .describe('Return verbose output with write confirmation. Default: compact (content + single-line footer).'),
    },
}, async ({ filePath, rootDir, audience, writeToDisk, writingStyle, verbose }) => {
    try {
        let code = '';
        let outputDir = rootDir ?? process.cwd();
        if (filePath) {
            code = readFileSync(filePath, 'utf-8');
            outputDir = filePath.substring(0, filePath.lastIndexOf('/')) || process.cwd();
        }
        else if (rootDir) {
            const deep = await buildDeepContext(rootDir);
            code = deep.packedSummary ?? JSON.stringify({ stack: deep.detectedStack, structure: deep.structure }, null, 2);
            outputDir = rootDir;
        }
        else {
            return { content: [{ type: 'text', text: 'Error: Provide filePath or rootDir.' }], isError: true };
        }
        const walkthrough = await generateWalkthrough(code, (audience ?? 'non_technical'), (writingStyle ?? 'default'));
        if (writeToDisk) {
            writeFileSync(resolve(outputDir, 'WALKTHROUGH.md'), walkthrough, 'utf-8');
        }
        const footer = writeToDisk
            ? verbose
                ? '\n\n---\nWritten to WALKTHROUGH.md'
                : '\n\n✓ WALKTHROUGH.md · written'
            : '';
        return { content: [{ type: 'text', text: walkthrough + footer }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 5: optimize_markdown ─────────────────────────────────────────────────
server.registerTool('optimize_markdown', {
    title: 'Optimize markdown for tokens',
    description: 'Run the MDPilot 4-pass token optimizer on existing markdown content. Strips boilerplate, removes redundant phrasing, compresses structure, and tightens prose. Returns the leaner version with token savings.',
    inputSchema: {
        content: z.string().describe('Markdown content to optimize'),
        aggressive: z
            .boolean()
            .default(false)
            .describe('Enable the aggressive 5th pass — collapses soft hedges and filler phrases. Never alters code blocks, commands, paths, or numbers. Default: off.'),
        verbose: z
            .boolean()
            .default(false)
            .describe('Return verbose output with per-pass breakdown. Default: compact single-line footer.'),
    },
}, async ({ content, aggressive, verbose }) => {
    try {
        const { optimized, tokensBefore, tokensAfter } = optimizeMarkdown(content, { aggressive });
        const saved = tokensBefore - tokensAfter;
        const pct = tokensBefore > 0 ? Math.round((saved / tokensBefore) * 100) : 0;
        const footer = verbose
            ? `\n\n---\nSaved ${saved} tokens (${pct}% reduction): ${tokensBefore} → ${tokensAfter}${aggressive ? ' (aggressive mode)' : ''}`
            : `\n\n✓ ${tokensAfter} tokens (saved ${saved}, ${pct}%)${aggressive ? ' [aggressive]' : ''}`;
        return { content: [{ type: 'text', text: optimized + footer }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 6: image_to_prompt ───────────────────────────────────────────────────
server.registerTool('image_to_prompt', {
    title: 'Image to generation prompt',
    description: 'Analyze a local image file (PNG, JPG, WEBP) and generate a detailed recreation prompt for image generation models (FLUX, Stable Diffusion, Midjourney, DALL-E, Gemini). Covers subject, composition, lighting, colors, style, camera angle, and mood.',
    inputSchema: {
        imagePath: z
            .string()
            .describe('Absolute path to a .png, .jpg, .jpeg, or .webp image file'),
    },
}, async ({ imagePath }) => {
    try {
        const prompt = await imageToPrompt(imagePath);
        return { content: [{ type: 'text', text: prompt }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 7: check_drift ───────────────────────────────────────────────────────
server.registerTool('check_drift', {
    title: 'Check docs for drift',
    description: 'Scan the repo and detect where docs (README.md, AGENTS.md, CLAUDE.md, CONTRIBUTING.md) have gone stale — broken commands, missing paths, undocumented scripts or directories, removed MCP servers. Uses two detection methods: claim verification and snapshot diff.',
    inputSchema: {
        rootDir: z
            .string()
            .optional()
            .describe('Absolute path to the project root. Defaults to cwd.'),
        docs: z
            .array(z.string())
            .optional()
            .describe('Specific doc filenames to check, e.g. ["AGENTS.md"]. Defaults to README.md, AGENTS.md, CLAUDE.md, CONTRIBUTING.md.'),
        verbose: z
            .boolean()
            .default(false)
            .describe('Return verbose output with full issue details. Default: compact one-line-per-issue format.'),
    },
}, async ({ rootDir, docs, verbose }) => {
    try {
        const dir = rootDir ?? process.cwd();
        const issues = detectDrift(dir, docs);
        if (issues.length === 0) {
            return { content: [{ type: 'text', text: '✓ No drift — all docs in sync.' }] };
        }
        const sev = (s) => s === 'high' ? 'HIGH' : s === 'medium' ? 'MED' : 'LOW';
        if (verbose) {
            const icon = (s) => s === 'high' ? '🔴' : s === 'medium' ? '🟡' : '⚪';
            const lines = issues.map(i => `${icon(i.severity)} [${i.severity.toUpperCase()}] ${i.doc} — ${i.message}${i.detail ? `\n   Detail: ${i.detail}` : ''}`);
            const hi = issues.filter(i => i.severity === 'high').length;
            const med = issues.filter(i => i.severity === 'medium').length;
            const lo = issues.filter(i => i.severity === 'low').length;
            return {
                content: [{
                        type: 'text',
                        text: `${issues.length} issue(s): ${hi} high · ${med} medium · ${lo} low\n\n${lines.join('\n')}\n\nRun update_docs to fix high/medium issues.`,
                    }],
            };
        }
        // Compact: one line per issue + totals footer
        const lines = issues.map(i => `[${sev(i.severity)}] ${i.doc} — ${i.message}`);
        const hi = issues.filter(i => i.severity === 'high').length;
        const med = issues.filter(i => i.severity === 'medium').length;
        const lo = issues.filter(i => i.severity === 'low').length;
        lines.push(`---\n${issues.length} issue(s): ${hi} high · ${med} medium · ${lo} low`);
        return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 8: update_docs ───────────────────────────────────────────────────────
server.registerTool('update_docs', {
    title: 'Update stale docs',
    description: 'Fix drift in a specific doc — patches ONLY the stale sections (broken commands, missing paths) and preserves everything else exactly. Uses Claude to apply the minimal fix. Optionally writes the corrected file to disk and updates the manifest.',
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
        verbose: z
            .boolean()
            .default(false)
            .describe('Return verbose output with full issue list. Default: compact single-line footer.'),
    },
}, async ({ filename, rootDir, writeToDisk, verbose }) => {
    try {
        const dir = rootDir ?? process.cwd();
        const allIssues = detectDrift(dir, [filename]);
        const patchableIssues = allIssues.filter(i => i.severity !== 'low');
        if (patchableIssues.length === 0) {
            const lowCount = allIssues.filter(i => i.severity === 'low').length;
            const advisory = lowCount > 0 ? ` (${lowCount} low advisory)` : '';
            return { content: [{ type: 'text', text: `✓ ${filename} — no high/medium drift.${advisory}` }] };
        }
        const patched = await patchDoc(dir, filename, patchableIssues);
        if (writeToDisk) {
            writeFileSync(join(dir, filename), patched, 'utf-8');
            const ctx = analyzeProject(dir);
            recordDoc(dir, filename, patched, ctx);
        }
        const footer = verbose
            ? `\n\n---\nFixed ${patchableIssues.length} issue(s) in ${filename}:\n${patchableIssues.map(i => `  • [${i.severity}] ${i.message}`).join('\n')}${writeToDisk ? '\n\nFile written to disk and manifest updated.' : '\n\n(Pass writeToDisk: true to save changes.)'}`
            : `\n\n✓ ${filename} | fixed ${patchableIssues.length} issue(s)${writeToDisk ? ' · written' : ' · (pass writeToDisk: true to save)'}`;
        return { content: [{ type: 'text', text: patched + footer }] };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 9: save_context ──────────────────────────────────────────────────────
server.registerTool('save_context', {
    title: 'Save session context to CONTEXT.md',
    description: 'Persist session state to CONTEXT.md at the project root — decisions made, current state, next steps, open questions. Appends a new dated entry and keeps the last 5 sessions. Secret-shaped strings (API keys) are automatically redacted before writing. Everything stays on your machine.',
    inputSchema: {
        rootDir: z
            .string()
            .optional()
            .describe('Absolute path to the project root. Defaults to cwd.'),
        summary: z
            .string()
            .describe('What happened this session: decisions made, current state, next steps, open questions. Free text — the tool will structure and date-stamp it.'),
        writeToDisk: z
            .boolean()
            .default(true)
            .describe('Write CONTEXT.md to disk. Set to false to preview the content without saving.'),
    },
}, async ({ rootDir, summary, writeToDisk }) => {
    try {
        const dir = rootDir ?? process.cwd();
        const result = saveContext(dir, summary, writeToDisk ?? true);
        const redactNote = result.redactedCount > 0
            ? ` · ⚠️ ${result.redactedCount} secret(s) redacted`
            : '';
        const writeNote = result.written ? ` · written to ${result.filePath}` : ' · (preview, not written)';
        return {
            content: [{
                    type: 'text',
                    text: `✓ Context saved | ${result.sessionCount} session(s) stored | ${result.tokenCount} tokens${redactNote}${writeNote}`,
                }],
        };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
// ── Tool 10: load_context ─────────────────────────────────────────────────────
server.registerTool('load_context', {
    title: 'Load session context from CONTEXT.md',
    description: 'Read the project\'s CONTEXT.md and inject prior session state into your working context. Runs a drift check on every command and path inside the file — stale references are annotated inline. Everything stays on your machine.',
    inputSchema: {
        rootDir: z
            .string()
            .optional()
            .describe('Absolute path to the project root. Defaults to cwd.'),
    },
}, async ({ rootDir }) => {
    try {
        const dir = rootDir ?? process.cwd();
        const result = loadContext(dir);
        if (!result.found) {
            return {
                content: [{
                        type: 'text',
                        text: 'No CONTEXT.md found. End your session with: use mdpilot save_context to persist state for next time.',
                    }],
            };
        }
        const staleNote = result.staleAnnotations.length > 0
            ? `\n⚠️  ${result.staleAnnotations.length} stale reference(s) annotated inline.`
            : '';
        return {
            content: [{ type: 'text', text: result.content + staleNote }],
        };
    }
    catch (err) {
        return { content: [{ type: 'text', text: `Error: ${String(err)}` }], isError: true };
    }
});
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
//# sourceMappingURL=index.js.map