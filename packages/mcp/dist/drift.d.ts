import { type ProjectContext } from './analyze.js';
export interface DriftIssue {
    doc: string;
    severity: 'high' | 'medium' | 'low';
    type: 'broken_command' | 'broken_path' | 'new_dependency' | 'removed_script' | 'new_structure' | 'stale';
    message: string;
    detail?: string;
}
export declare function verifyClaimsOnContent(content: string, rootDir: string, ctx: ProjectContext): DriftIssue[];
export declare function verifyClaims(rootDir: string, filename: string, ctx: ProjectContext): DriftIssue[];
export declare function diffSnapshot(rootDir: string, filename: string, ctx: ProjectContext): DriftIssue[];
export declare function detectDrift(rootDir: string, docs?: string[]): DriftIssue[];
//# sourceMappingURL=drift.d.ts.map