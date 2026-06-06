export interface ProjectContext {
    detectedStack: string[];
    dependencies: string[];
    packageManager: string;
    scripts: Record<string, string>;
    structure: string[];
    hasExistingDocs: {
        readme: boolean;
        agents: boolean;
        claude: boolean;
    };
    language: string;
    projectName: string;
}
export declare function analyzeProject(rootDir: string): ProjectContext;
//# sourceMappingURL=analyze.d.ts.map