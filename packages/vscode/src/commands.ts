import * as vscode from 'vscode';
import { MDPilotClient } from './mcpClient';
import { resolveApiKey } from './keyManager';

let client: MDPilotClient | null = null;
let _context: vscode.ExtensionContext | null = null;

export function initContext(context: vscode.ExtensionContext): void {
  _context = context;
}

async function getClient(): Promise<MDPilotClient | null> {
  if (client?.connected) return client;
  if (!_context) return null;

  const resolved = await resolveApiKey(_context);
  if (!resolved) return null;

  client = new MDPilotClient();
  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'MDPilot: Connecting...' },
    () => client!.connect(resolved.key, resolved.provider),
  );
  return client;
}

function rootDir(): string {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}

function outputChannel(name: string): vscode.OutputChannel {
  return vscode.window.createOutputChannel(name);
}

// ── Generate AGENTS.md ────────────────────────────────────────────────────────

export async function generateAgents(): Promise<void> {
  const c = await getClient();
  if (!c) return;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'MDPilot: Generating AGENTS.md...' },
    async () => {
      await c.callTool('generate_md_file', {
        fileType: 'agents',
        rootDir: rootDir(),
        writeToDisk: true,
        verified: true,
      });
    },
  );

  vscode.window.showInformationMessage('MDPilot: AGENTS.md generated ✓');
  const uri = vscode.Uri.file(`${rootDir()}/AGENTS.md`);
  vscode.window.showTextDocument(uri);
}

// ── Generate CLAUDE.md ────────────────────────────────────────────────────────

export async function generateClaude(): Promise<void> {
  const c = await getClient();
  if (!c) return;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'MDPilot: Generating CLAUDE.md...' },
    async () => {
      await c.callTool('generate_md_file', {
        fileType: 'claude',
        rootDir: rootDir(),
        writeToDisk: true,
        verified: true,
      });
    },
  );

  vscode.window.showInformationMessage('MDPilot: CLAUDE.md generated ✓');
  const uri = vscode.Uri.file(`${rootDir()}/CLAUDE.md`);
  vscode.window.showTextDocument(uri);
}

// ── Generate README.md ────────────────────────────────────────────────────────

export async function generateReadme(): Promise<void> {
  const c = await getClient();
  if (!c) return;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'MDPilot: Generating README.md...' },
    async () => {
      await c.callTool('generate_md_file', {
        fileType: 'readme',
        rootDir: rootDir(),
        writeToDisk: true,
        verified: true,
      });
    },
  );

  vscode.window.showInformationMessage('MDPilot: README.md generated ✓');
  const uri = vscode.Uri.file(`${rootDir()}/README.md`);
  vscode.window.showTextDocument(uri);
}

// ── Generate Task Prompt ──────────────────────────────────────────────────────

export async function generateTask(): Promise<void> {
  const c = await getClient();
  if (!c) return;

  const taskInput = await vscode.window.showInputBox({
    prompt: 'Paste your ticket, Slack thread, or task description',
    placeHolder: 'e.g. Add rate limiting to the /api/search endpoint — users reported 429s',
    ignoreFocusOut: true,
  });
  if (!taskInput?.trim()) return;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'MDPilot: Generating task prompt...' },
    async () => {
      await c.callTool('generate_task_file', {
        taskInput: taskInput.trim(),
        rootDir: rootDir(),
        writeToDisk: true,
        executionMode: 'ai_exec',
      });
    },
  );

  vscode.window.showInformationMessage('MDPilot: TASK.md generated ✓');
  const uri = vscode.Uri.file(`${rootDir()}/TASK.md`);
  vscode.window.showTextDocument(uri);
}

// ── Check Drift ───────────────────────────────────────────────────────────────

export async function checkDrift(): Promise<void> {
  const c = await getClient();
  if (!c) return;

  let result = '';
  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'MDPilot: Checking for doc drift...' },
    async () => {
      result = await c.callTool('check_drift', { rootDir: rootDir() });
    },
  );

  const ch = outputChannel('MDPilot Drift Report');
  ch.clear();
  ch.appendLine(result);
  ch.show();
}

// ── Save Session Context ──────────────────────────────────────────────────────

export async function saveContext(): Promise<void> {
  const c = await getClient();
  if (!c) return;

  const summary = await vscode.window.showInputBox({
    prompt: 'Summarize this session — decisions made, current state, next steps',
    placeHolder: 'e.g. Implemented rate limiting, wired middleware, needs tests for edge cases',
    ignoreFocusOut: true,
  });
  if (!summary?.trim()) return;

  await c.callTool('save_context', {
    rootDir: rootDir(),
    summary: summary.trim(),
    writeToDisk: true,
  });
  vscode.window.showInformationMessage('MDPilot: Session context saved ✓');
}

// ── Load Session Context ──────────────────────────────────────────────────────

export async function loadContext(): Promise<void> {
  const c = await getClient();
  if (!c) return;

  const result = await c.callTool('load_context', { rootDir: rootDir() });
  const ch = outputChannel('MDPilot Session Context');
  ch.clear();
  ch.appendLine(result);
  ch.show();
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function disconnectClient(): Promise<void> {
  await client?.disconnect();
  client = null;
}
