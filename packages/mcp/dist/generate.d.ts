import { type PromptOptions, type WritingStyle } from './prompts.js';
import type { ProjectContext } from './analyze.js';
import type { DeepRepoContext } from './repo-context.js';
export declare function generateFile(fileType: string, ctx: ProjectContext | DeepRepoContext, opts?: PromptOptions): Promise<string>;
export type McpExecutionMode = 'guide' | 'ai_exec' | 'context';
export type McpExperienceLevel = 'new' | 'experienced';
export declare function generateTaskFile(taskInput: string, stack: string, executionMode?: McpExecutionMode, experienceLevel?: McpExperienceLevel, riskCheck?: boolean): Promise<string>;
export type McpReaderAudience = 'ai_agent' | 'team' | 'non_technical' | 'learner';
export declare function generateWalkthrough(code: string, audience?: McpReaderAudience, writingStyle?: WritingStyle): Promise<string>;
export declare function imageToPrompt(imagePath: string): Promise<string>;
//# sourceMappingURL=generate.d.ts.map