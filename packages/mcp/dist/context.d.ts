export declare function redactSecrets(text: string): {
    redacted: string;
    count: number;
};
export interface SaveContextResult {
    written: boolean;
    redactedCount: number;
    tokenCount: number;
    sessionCount: number;
    filePath: string;
}
export declare function saveContext(rootDir: string, summary: string, writeToDisk?: boolean): SaveContextResult;
export interface LoadContextResult {
    found: boolean;
    content: string;
    lastUpdated: string | null;
    staleAnnotations: string[];
}
export declare function loadContext(rootDir: string): LoadContextResult;
//# sourceMappingURL=context.d.ts.map