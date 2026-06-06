import { type ProjectContext } from './analyze.js';
export interface DeepRepoContext extends ProjectContext {
    packedSummary: string;
    packedTokens: number;
    suspiciousFiles: string[];
}
export declare function buildDeepContext(rootDir: string): Promise<DeepRepoContext>;
//# sourceMappingURL=repo-context.d.ts.map