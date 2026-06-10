export interface OptimizeResult {
    optimized: string;
    tokensBefore: number;
    tokensAfter: number;
}
export interface OptimizeOptions {
    aggressive?: boolean;
}
export declare function optimizeMarkdown(content: string, opts?: OptimizeOptions): OptimizeResult;
//# sourceMappingURL=optimizer.d.ts.map