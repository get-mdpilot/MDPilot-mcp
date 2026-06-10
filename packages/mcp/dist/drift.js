import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { analyzeProject } from './analyze.js';
import { readManifest } from './manifest.js';
// Docs checked by default
const DEFAULT_DOCS = ['README.md', 'AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md'];
// ── Method A: Claim verification ──────────────────────────────────────────────
// Parse an existing doc, extract every command and file path it references,
// then verify each one against the current repo. No snapshot needed.
function extractCommands(content) {
    const results = [];
    // Match: npm run foo, yarn run foo, pnpm run foo, pnpm foo (bare), npx foo
    // Also handles yarn foo (bare yarn scripts)
    const patterns = [
        /(?:npm|yarn|pnpm)\s+run\s+([\w:.-]+)/g,
        /pnpm\s+([\w:.-]+)(?=\s|`|$)/g,
    ];
    for (const re of patterns) {
        for (const m of content.matchAll(re)) {
            // Avoid double-capturing "run" itself or common non-script words
            const script = m[1];
            if (['run', 'install', 'add', 'remove', 'update', 'init', 'create'].includes(script))
                continue;
            results.push({ raw: m[0].trim(), script });
        }
    }
    // Deduplicate by script name
    const seen = new Set();
    return results.filter(r => { if (seen.has(r.script))
        return false; seen.add(r.script); return true; });
}
function extractPaths(content) {
    const results = [];
    // Backtick-wrapped paths: `src/foo/bar.ts`, `./scripts/seed.ts`, `packages/mcp/`
    const re = /`((?:src|packages|scripts|lib|app|pages|components|public|docs|supabase|dist)\/[\w./-]+)`/g;
    for (const m of content.matchAll(re)) {
        const ref = m[1].replace(/^\.\//, '');
        // Skip glob-style references
        if (ref.includes('*'))
            continue;
        results.push(ref);
    }
    return [...new Set(results)];
}
// Core logic operating on in-memory content — used by both disk and in-memory callers
export function verifyClaimsOnContent(content, rootDir, ctx) {
    const issues = [];
    const realScripts = new Set(Object.keys(ctx.scripts));
    for (const { raw, script } of extractCommands(content)) {
        if (!realScripts.has(script)) {
            issues.push({
                doc: '(in-memory)',
                severity: 'high',
                type: 'broken_command',
                message: `References "${raw}" but script "${script}" no longer exists in package.json`,
                detail: `Available: ${[...realScripts].join(', ')}`,
            });
        }
    }
    for (const ref of extractPaths(content)) {
        if (!existsSync(join(rootDir, ref))) {
            issues.push({
                doc: '(in-memory)',
                severity: 'medium',
                type: 'broken_path',
                message: `References path "${ref}" which no longer exists`,
            });
        }
    }
    return issues;
}
export function verifyClaims(rootDir, filename, ctx) {
    const filePath = join(rootDir, filename);
    if (!existsSync(filePath))
        return [];
    const content = readFileSync(filePath, 'utf-8');
    return verifyClaimsOnContent(content, rootDir, ctx).map(issue => ({ ...issue, doc: filename }));
}
// ── Method B: Snapshot diff ───────────────────────────────────────────────────
// Compare the stored manifest snapshot to the current project state.
// Catches additions / removals that should probably be reflected in the docs.
export function diffSnapshot(rootDir, filename, ctx) {
    const manifest = readManifest(rootDir);
    const recorded = manifest?.docs[filename];
    if (!recorded)
        return [];
    const issues = [];
    const snap = recorded.sourceSnapshot;
    // Scripts added since the snapshot — may need documenting
    const snapshotScripts = new Set(Object.keys(snap.scripts));
    const currentScripts = new Set(Object.keys(ctx.scripts));
    for (const s of currentScripts) {
        if (!snapshotScripts.has(s)) {
            issues.push({
                doc: filename,
                severity: 'low',
                type: 'new_dependency',
                message: `New script "${s}: ${ctx.scripts[s]}" added since docs were generated — consider documenting it`,
            });
        }
    }
    // Scripts removed since the snapshot — already caught by verifyClaims if the doc
    // references them, but emit a softer signal when no reference exists either
    for (const s of snapshotScripts) {
        if (!currentScripts.has(s) && !Object.keys(ctx.scripts).includes(s)) {
            issues.push({
                doc: filename,
                severity: 'low',
                type: 'removed_script',
                message: `Script "${s}" existed when docs were generated but has been removed`,
            });
        }
    }
    // New top-level directories since the snapshot
    const snapshotStructure = new Set(snap.structure);
    for (const item of ctx.structure) {
        if (item.endsWith('/') && !snapshotStructure.has(item)) {
            issues.push({
                doc: filename,
                severity: 'low',
                type: 'new_structure',
                message: `New directory "${item}" added since docs were generated — docs may not reflect it`,
            });
        }
    }
    // New dependencies since the snapshot (packages not in the snapshot)
    const snapshotDeps = new Set(snap.dependencies);
    const newDeps = ctx.dependencies.filter(d => !snapshotDeps.has(d));
    if (newDeps.length > 0) {
        issues.push({
            doc: filename,
            severity: 'low',
            type: 'new_dependency',
            message: `${newDeps.length} new package(s) installed since docs were generated: ${newDeps.slice(0, 5).join(', ')}${newDeps.length > 5 ? ` +${newDeps.length - 5} more` : ''}`,
        });
    }
    // Staleness — soft signal after 90 days
    if (recorded.generatedAt) {
        const days = (Date.now() - new Date(recorded.generatedAt).getTime()) / 86_400_000;
        if (days > 90) {
            issues.push({
                doc: filename,
                severity: 'low',
                type: 'stale',
                message: `Docs for ${filename} were generated ${Math.round(days)} days ago — worth a refresh`,
            });
        }
    }
    // MCP server drift — compare snapshot servers vs current config
    if (snap.mcpServers) {
        const snapshotNames = new Set(snap.mcpServers.map((s) => s.name));
        const currentNames = new Set(ctx.mcpServers.map((s) => s.name));
        for (const { name, configFile } of snap.mcpServers) {
            if (!currentNames.has(name)) {
                issues.push({
                    doc: filename,
                    severity: 'medium',
                    type: 'stale',
                    message: `MCP server "${name}" was in ${configFile} when docs were generated but is no longer configured`,
                });
            }
        }
        for (const { name, configFile } of ctx.mcpServers) {
            if (!snapshotNames.has(name)) {
                issues.push({
                    doc: filename,
                    severity: 'low',
                    type: 'new_dependency',
                    message: `New MCP server "${name}" added in ${configFile} since docs were generated — consider documenting it in AGENTS.md`,
                });
            }
        }
    }
    return issues;
}
// ── Public API ────────────────────────────────────────────────────────────────
const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };
export function detectDrift(rootDir, docs = DEFAULT_DOCS) {
    const ctx = analyzeProject(rootDir);
    const issues = [];
    for (const doc of docs) {
        if (!existsSync(join(rootDir, doc)))
            continue;
        issues.push(...verifyClaims(rootDir, doc, ctx));
        issues.push(...diffSnapshot(rootDir, doc, ctx));
    }
    return issues.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
//# sourceMappingURL=drift.js.map