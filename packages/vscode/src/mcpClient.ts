import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class MDPilotClient {
  private client: Client | null = null;

  async connect(apiKey: string, provider: string): Promise<void> {
    const envKey =
      provider === 'groq'      ? 'GROQ_API_KEY'      :
      provider === 'nvidia'    ? 'NVIDIA_API_KEY'    :
      provider === 'anthropic' ? 'ANTHROPIC_API_KEY' :
                                 'OPENAI_API_KEY';

    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', 'mdpilot-mcp'],
      env: { ...process.env, [envKey]: apiKey } as Record<string, string>,
    });

    this.client = new Client({ name: 'mdpilot-vscode', version: '0.1.0' });
    await this.client.connect(transport);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (!this.client) {
      throw new Error('MDPilot not connected. Run "MDPilot: Setup" first.');
    }
    const result = await this.client.callTool({ name, arguments: args });
    const content = result.content as Array<{ type: string; text?: string }>;
    const text = content.find(c => c.type === 'text');
    return text?.text ?? '';
  }

  async disconnect(): Promise<void> {
    await this.client?.close();
    this.client = null;
  }

  get connected(): boolean {
    return this.client !== null;
  }
}
