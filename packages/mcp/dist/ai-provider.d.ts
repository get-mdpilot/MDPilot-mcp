/**
 * Token budget for the packed repo context, sized to the active provider's
 * per-minute limits. Free tiers (Groq 12k TPM, NVIDIA) must stay small so the
 * full request (context + system prompt + output) fits in one window; paid
 * providers have large context windows and can take much more.
 */
export declare function getContextBudget(): number;
export declare function generateText(system: string, user: string, maxTokens?: number): Promise<string>;
export declare function generateVision(base64: string, mediaType: string, prompt: string): Promise<string>;
//# sourceMappingURL=ai-provider.d.ts.map