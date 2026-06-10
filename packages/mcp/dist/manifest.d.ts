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
            mcpServers?: {
                name: string;
                configFile: string;
            }[];
        };
    }>;
}
export declare function readManifest(rootDir: string): DocManifest | null;
export declare function recordDoc(rootDir: string, filename: string, content: string, ctx: ProjectContext): void;
//# sourceMappingURL=manifest.d.ts.map