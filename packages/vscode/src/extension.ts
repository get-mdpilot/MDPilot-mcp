import * as vscode from 'vscode';
import { createDriftStatusBar, setDriftStatus } from './statusBar';
import * as commands from './commands';
import { forgetStoredKey, getMaskedKey } from './keyManager';
import { MDPilotPanelProvider } from './panelProvider';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  commands.initContext(context);

  // Register webview panel provider
  const panelProvider = new MDPilotPanelProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(MDPilotPanelProvider.viewId, panelProvider),
  );

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
      vscode.commands.executeCommand(`${MDPilotPanelProvider.viewId}.focus`);
    }),
    vscode.commands.registerCommand('mdpilot.clearKey', () => forgetStoredKey(context)),
    vscode.commands.registerCommand('mdpilot.openSettings', () => panelProvider.revealSettings()),
    vscode.commands.registerCommand('mdpilot.updateApiKey', () => panelProvider.revealSettings()),
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

  // First-run: surface Settings when no key is configured
  const { keySource } = await getMaskedKey(context);
  if (keySource === 'none') {
    const action = await vscode.window.showInformationMessage(
      'MDPilot: No API key configured. A free Groq key is all you need.',
      'Open Settings',
      'Get free Groq key',
    );
    if (action === 'Open Settings') panelProvider.revealSettings();
    else if (action === 'Get free Groq key') {
      vscode.env.openExternal(vscode.Uri.parse('https://console.groq.com/keys'));
    }
  }
}

export async function deactivate(): Promise<void> {
  await commands.disconnectClient();
}
