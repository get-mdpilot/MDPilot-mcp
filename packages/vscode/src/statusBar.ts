import * as vscode from 'vscode';

export type DriftState = 'clean' | 'drift' | 'checking' | 'unknown';

const STATE_MAP: Record<DriftState, { text: string; bg?: vscode.ThemeColor }> = {
  clean:    { text: '$(check) MDPilot' },
  drift:    { text: '$(warning) MDPilot: drift detected', bg: new vscode.ThemeColor('statusBarItem.warningBackground') },
  checking: { text: '$(sync~spin) MDPilot: checking...' },
  unknown:  { text: '$(sync) MDPilot' },
};

export function createDriftStatusBar(): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = 'mdpilot.checkDrift';
  item.tooltip = 'MDPilot — click to check docs for drift';
  setDriftStatus(item, 'unknown');
  item.show();
  return item;
}

export function setDriftStatus(item: vscode.StatusBarItem, state: DriftState): void {
  const s = STATE_MAP[state];
  item.text = s.text;
  item.backgroundColor = s.bg;
}
