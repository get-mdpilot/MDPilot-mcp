export interface McpServerInfo {
    name: string;
    command: string;
    configFile: string;
    envKeys: string[];
}
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
    mcpServers: McpServerInfo[];
}
export declare function analyzeProject(rootDir: string): ProjectContext;
//# sourceMappingURL=analyze.d.ts.map