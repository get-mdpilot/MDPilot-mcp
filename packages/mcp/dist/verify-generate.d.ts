import type { ProjectContext } from './analyze.js';
import type { DeepRepoContext } from './repo-context.js';
import { type DriftIssue } from './drift.js';
export interface VerifiedResult {
    content: string;
    attemptCount: number;
    issuesFound: DriftIssue[];
    issuesRemaining: DriftIssue[];
}
export declare function generateVerified(fileType: string, ctx: ProjectContext | DeepRepoContext, rootDir: string): Promise<VerifiedResult>;
//# sourceMappingURL=verify-generate.d.ts.map