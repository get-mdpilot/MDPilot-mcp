export type ProjectType     = 'webapp' | 'mobile' | 'api' | 'library' | 'design' | 'other';
export type Audience       = 'me' | 'team' | 'public';
export type AITool         = 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'chatgpt' | 'none';
export type MDFileType     = 'readme' | 'agents' | 'claude' | 'skill' | 'design' | 'contributing' | 'security' | 'context' | 'task' | 'spec' | 'walkthrough';
export type AppMode        = 'generate' | 'task';
export type ExecutionMode  = 'guide' | 'ai_exec' | 'context';
export type ExperienceLevel = 'new' | 'experienced';

// Reader audience — who will READ the generated output (distinct from Audience = project scope)
export type ReaderAudience  = 'ai_agent' | 'team' | 'non_technical' | 'learner';
export type ReadingLevel    = 'plain' | 'standard' | 'expert';

export interface GenerateOptions {
  audience:         ReaderAudience;
  readingLevel:     ReadingLevel;
  includeReasoning: boolean;
}

export interface TaskOptions {
  executionMode:       ExecutionMode;
  experienceLevel:     ExperienceLevel;
  includeVerification?: boolean;
  showAlternatives?:   boolean;
}

export interface GenerationRequest {
  // Generate mode fields
  projectType:        ProjectType;
  projectDescription?: string;
  audience:           Audience;
  aiTools:            AITool[];
  rawStackInput?:     string;
  detectedStack:      string[];
  selectedFiles:      MDFileType[];

  // Task mode fields
  taskInput?:      string;
  mode?:           AppMode;
  taskOptions?:    TaskOptions;

  // Generate mode reader options
  generateOptions?: GenerateOptions;

  // Model provider selection
  provider?:  'claude' | 'gpt' | 'gemini' | 'groq';

  // Role for role-specific prompt selection (Supabase prompt library)
  role?:      string;
}

export interface GeneratedFile {
  type:                MDFileType;
  filename:            string;
  content:             string;
  tokenCount:          number;
  optimizedContent?:   string;
  optimizedTokenCount?: number;
  howToUse:            string;
}

export interface OptimizationPass {
  name:        string;
  description: string;
  tokensSaved: number;
}

// Shared file generation status (used by both Generate and Task modes)
export type GenStatus = 'pending' | 'generating' | 'done' | 'error';

export interface FileGenStatus {
  type:        MDFileType;
  filename:    string;
  status:      GenStatus;
  tokenCount?: number;
  error?:      string;
}
