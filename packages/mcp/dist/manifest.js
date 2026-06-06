import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
const MANIFEST_DIR = '.mdpilot';
const MANIFEST_FILE = 'manifest.json';
function manifestPath(rootDir) {
    return join(rootDir, MANIFEST_DIR, MANIFEST_FILE);
}
export function readManifest(rootDir) {
    const path = manifestPath(rootDir);
    if (!existsSync(path))
        return null;
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    }
    catch {
        return null;
    }
}
export function recordDoc(rootDir, filename, content, ctx) {
    const dir = join(rootDir, MANIFEST_DIR);
    if (!existsSync(dir))
        mkdirSync(dir, { recursive: true });
    const manifest = readManifest(rootDir) ?? {
        version: 1,
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
        },
    };
    writeFileSync(join(dir, MANIFEST_FILE), JSON.stringify(manifest, null, 2), 'utf-8');
}
//# sourceMappingURL=manifest.js.map