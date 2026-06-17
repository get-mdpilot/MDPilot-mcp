import * as vscode from 'vscode';
import { createDriftStatusBar, setDriftStatus } from './statusBar';
import * as commands from './commands';
import { forgetStoredKey } from './keyManager';

export function activate(context: vscode.ExtensionContext): void {
  // Share context with commands so keyManager can use secret storage
  commands.initContext(context);

  const statusBar = createDriftStatusBar();
  context.subscriptions.push(statusBar);

  const registrations = [
    vscode.commands.registerCommand('mdpilot.generateAgents', commands.generateAgents),
    vscode.commands.registerCommand('mdpilot.generateClaude',  commands.generateClaude),
    vscode.commands.registerCommand('mdpilot.generateReadme',  commands.generateReadme),
    vscode.commands.registerCommand('mdpilot.generateTask',    commands.generateTask),
    vscode.commands.registerCommand('mdpilot.saveContext',     commands.saveContext),
    vscode.commands.registerCommand('mdpilot.loadContext',     commands.loadContext),
    vscode.commands.registerCommand('mdpilot.checkDrift', async () => {
      setDriftStatus(statusBar, 'checking');
      try {
        await commands.checkDrift();
        setDriftStatus(statusBar, 'clean');
      } catch {
        setDriftStatus(statusBar, 'unknown');
      }
    }),
    vscode.commands.registerCommand('mdpilot.setup', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://mdpilot.in/docs/vscode'));
    }),
    vscode.commands.registerCommand('mdpilot.openPanel', () => {
      vscode.commands.executeCommand('mdpilot.panel.focus');
    }),
    vscode.commands.registerCommand('mdpilot.clearKey', () => forgetStoredKey(context)),
  ];

  registrations.forEach(r => context.subscriptions.push(r));

  // Auto drift check on workspace open
  const config = vscode.workspace.getConfiguration('mdpilot');
  if (config.get<boolean>('autoCheckDrift') && vscode.workspace.workspaceFolders?.length) {
    setDriftStatus(statusBar, 'checking');
    commands.checkDrift()
      .then(() => setDriftStatus(statusBar, 'clean'))
      .catch(() => setDriftStatus(statusBar, 'unknown'));
  }
}

export async function deactivate(): Promise<void> {
  await commands.disconnectClient();
}
