import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ResolvedKey {
  key: string;
  provider: string;
}

const SECRET_KEY = 'mdpilot.apiKey';

// Ordered list of env var names → provider
const ENV_PROVIDERS: Array<[string, string]> = [
  ['GROQ_API_KEY',      'groq'],
  ['NVIDIA_API_KEY',    'nvidia'],
  ['ANTHROPIC_API_KEY', 'anthropic'],
  ['OPENAI_API_KEY',    'openai'],
];

// MCP config files where users already have keys stored
const MCP_CONFIG_PATHS = [
  path.join(os.homedir(), '.cursor', 'mcp.json'),
  path.join(os.homedir(), '.claude', 'mcp.json'),
  path.join(os.homedir(), '.config', 'windsurf', 'mcp.json'),
];

function extractFromMcpConfigs(): ResolvedKey | null {
  for (const configPath of MCP_CONFIG_PATHS) {
    try {
      if (!fs.existsSync(configPath)) continue;
      const raw = fs.readFileSync(configPath, 'utf8');
      const json = JSON.parse(raw) as {
        mcpServers?: Record<string, { env?: Record<string, string> }>;
      };
      const servers = json.mcpServers ?? {};
      for (const server of Object.values(servers)) {
        const env = server.env ?? {};
        for (const [envVar, provider] of ENV_PROVIDERS) {
          if (env[envVar]) return { key: env[envVar], provider };
        }
      }
    } catch {
      // malformed config — skip
    }
  }
  return null;
}

function extractFromWorkspaceEnv(): ResolvedKey | null {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return null;

  for (const envFile of ['.env.local', '.env']) {
    const envPath = path.join(workspaceRoot, envFile);
    try {
      if (!fs.existsSync(envPath)) continue;
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [rawKey, ...rest] = trimmed.split('=');
        const val = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
        for (const [envVar, provider] of ENV_PROVIDERS) {
          if (rawKey.trim() === envVar && val) return { key: val, provider };
        }
      }
    } catch {
      // unreadable — skip
    }
  }
  return null;
}

export async function resolveApiKey(
  context: vscode.ExtensionContext,
): Promise<ResolvedKey | null> {
  const config = vscode.workspace.getConfiguration('mdpilot');
  const provider = config.get<string>('provider') ?? 'groq';

  // 1. Secret storage (set by us on first entry — system keychain)
  const storedSecret = await context.secrets.get(SECRET_KEY);
  if (storedSecret) return { key: storedSecret, provider };

  // 2. Plain settings (manual entry via Cmd+,)
  const settingsKey = config.get<string>('apiKey') ?? '';
  if (settingsKey) return { key: settingsKey, provider };

  // 3. Shell environment variables
  for (const [envVar, p] of ENV_PROVIDERS) {
    if (process.env[envVar]) return { key: process.env[envVar]!, provider: p };
  }

  // 4. Existing MCP config files (~/.cursor/mcp.json, ~/.claude/mcp.json, …)
  const fromMcp = extractFromMcpConfigs();
  if (fromMcp) return fromMcp;

  // 5. Workspace .env / .env.local
  const fromEnvFile = extractFromWorkspaceEnv();
  if (fromEnvFile) return fromEnvFile;

  // 6. Nothing found — prompt once, store in secret storage
  const action = await vscode.window.showWarningMessage(
    'MDPilot: no API key found. Add a Groq key (free) to get started.',
    'Enter key',
    'Get free Groq key',
  );

  if (action === 'Get free Groq key') {
    vscode.env.openExternal(vscode.Uri.parse('https://console.groq.com/keys'));
    return null;
  }

  if (action === 'Enter key') {
    const input = await vscode.window.showInputBox({
      prompt: 'Paste your API key (Groq: gsk_… · Anthropic: sk-ant-… · OpenAI: sk-…)',
      password: true,
      ignoreFocusOut: true,
    });
    if (input?.trim()) {
      // Store in secret storage — not in plain settings.json
      await context.secrets.store(SECRET_KEY, input.trim());
      return { key: input.trim(), provider: 'groq' };
    }
  }

  return null;
}

export async function forgetStoredKey(context: vscode.ExtensionContext): Promise<void> {
  await context.secrets.delete(SECRET_KEY);
  vscode.window.showInformationMessage('MDPilot: stored key cleared.');
}

// ── Named exports for panel provider ─────────────────────────────────────────

export async function getMaskedKey(context: vscode.ExtensionContext): Promise<{
  maskedKey: string;
  keySource: 'secret' | 'settings' | 'env' | 'none';
}> {
  const stored = await context.secrets.get(SECRET_KEY);
  if (stored) return { maskedKey: '•••' + stored.slice(-4), keySource: 'secret' };

  const config = vscode.workspace.getConfiguration('mdpilot');
  const settingsKey = config.get<string>('apiKey') ?? '';
  if (settingsKey) return { maskedKey: '•••' + settingsKey.slice(-4), keySource: 'settings' };

  const hasEnv = ENV_PROVIDERS.some(([k]) => !!process.env[k]);
  if (hasEnv) return { maskedKey: '(from environment)', keySource: 'env' };

  return { maskedKey: '', keySource: 'none' };
}

export function getProvider(): string {
  return vscode.workspace.getConfiguration('mdpilot').get<string>('provider') ?? 'groq';
}

export async function setProvider(provider: string): Promise<void> {
  await vscode.workspace.getConfiguration('mdpilot').update(
    'provider', provider, vscode.ConfigurationTarget.Global,
  );
}

export async function setApiKey(
  context: vscode.ExtensionContext,
  key: string,
  provider: string,
): Promise<void> {
  await context.secrets.store(SECRET_KEY, key);
  await setProvider(provider);
}

export async function clearApiKey(context: vscode.ExtensionContext): Promise<void> {
  await context.secrets.delete(SECRET_KEY);
}
