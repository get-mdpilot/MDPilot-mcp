import type { McpServerInfo } from './analyze.js';
export type WritingStyle = 'default' | 'human';
export interface PromptOptions {
    tokenDiscipline?: boolean;
    mcpServers?: McpServerInfo[];
    writingStyle?: WritingStyle;
}
export declare const HUMAN_FACING_FILE_TYPES: Set<string>;
export declare const HUMAN_VOICE_DIRECTIVE = "<writing_style>\nWrite in a natural human voice:\n- No em dashes. Use commas, periods, or parentheses instead.\n- Use contractions (it's, you'll, don't).\n- Vary sentence length. Short ones are fine.\n- Plain words over formal ones (use, not utilize; help, not facilitate).\n- No AI-isms: never \"delve\", \"leverage\", \"robust\", \"seamless\", \"comprehensive\",\n  \"it's important to note\", \"in conclusion\".\n- Write like a person explaining to a colleague, not a report.\n</writing_style>";
export declare function buildAgentsPrompt(opts?: PromptOptions): string;
export declare function buildClaudePrompt(opts?: PromptOptions): string;
export declare const SYSTEM_PROMPTS: Record<string, string>;
export declare const FILE_NAMES: Record<string, string>;
//# sourceMappingURL=prompts.d.ts.map