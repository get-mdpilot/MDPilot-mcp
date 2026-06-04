export type ProjectType = 'webapp' | 'mobile' | 'api' | 'library' | 'design' | 'other';
export type Audience = 'me' | 'team' | 'public';
export type AITool = 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'chatgpt' | 'none';
export type MDFileType = 'readme' | 'agents' | 'claude' | 'skill' | 'design' | 'contributing' | 'security' | 'context' | 'task' | 'spec';

export interface GenerationRequest {
  projectType: ProjectType;
  projectDescription?: string;
  audience: Audience;
  aiTools: AITool[];
  rawStackInput?: string;
  detectedStack: string[];
  selectedFiles: MDFileType[];
}

export interface GeneratedFile {
  type: MDFileType;
  filename: string;
  content: string;
  tokenCount: number;
  optimizedContent?: string;
  optimizedTokenCount?: number;
  howToUse: string;
}

export interface OptimizationPass {
  name: string;
  description: string;
  tokensSaved: number;
}
