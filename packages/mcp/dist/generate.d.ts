import type { ProjectContext } from './analyze.js';
import type { DeepRepoContext } from './repo-context.js';
export declare function generateFile(fileType: string, ctx: ProjectContext | DeepRepoContext): Promise<string>;
export declare function generateTaskFile(taskInput: string, stack: string): Promise<string>;
export declare function imageToPrompt(imagePath: string): Promise<string>;
//# sourceMappingURL=generate.d.ts.map