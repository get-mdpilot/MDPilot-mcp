import * as vscode from 'vscode';
import * as path from 'path';
import { MDPilotClient } from './mcpClient';
import { resolveApiKey, setApiKey, clearApiKey, getProvider, setProvider, getMaskedKey } from './keyManager';

const MAX_REF_FILES = 5;
const MAX_REF_BYTES = 64 * 1024;   // skip files larger than this
const MAX_REF_CHARS = 12_000;      // trim included content to this

export class MDPilotPanelProvider implements vscode.WebviewViewProvider {
  static readonly viewId = 'mdpilot.panel';
  private view?: vscode.WebviewView;
  private client: MDPilotClient | null = null;
  private activeFolder?: string;
  private pendingTab?: string;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.ensureActiveFolder();
    context.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.ensureActiveFolder();
        this.sendWorkspace();
      }),
    );
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();
    webviewView.webview.onDidReceiveMessage(msg => this.handleMessage(msg as Record<string, unknown>));
  }

  revealSettings(): void {
    this.pendingTab = 'settings';
    vscode.commands.executeCommand(`${MDPilotPanelProvider.viewId}.focus`);
    // If the view is already resolved & visible, switch immediately too.
    this.post({ type: 'switchTab', tab: 'settings' });
  }

  // ── Workspace folder resolution ─────────────────────────────────────────────

  private ensureActiveFolder(): void {
    const paths = (vscode.workspace.workspaceFolders ?? []).map(f => f.uri.fsPath);
    if (!this.activeFolder || !paths.includes(this.activeFolder)) {
      this.activeFolder = paths[0];
    }
  }

  private activeFolderObj(): vscode.WorkspaceFolder | undefined {
    const folders = vscode.workspace.workspaceFolders ?? [];
    return folders.find(f => f.uri.fsPath === this.activeFolder) ?? folders[0];
  }

  private rootDir(): string {
    return this.activeFolder ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
  }

  private sendWorkspace(): void {
    const folders = (vscode.workspace.workspaceFolders ?? []).map(f => ({ name: f.name, path: f.uri.fsPath }));
    this.post({ type: 'workspace', folders, active: this.activeFolder ?? null, count: folders.length });
  }

  private async sendSettings(): Promise<void> {
    const { maskedKey, keySource } = await getMaskedKey(this.context);
    const provider = getProvider();
    this.post({ type: 'settings', provider, maskedKey, keySource, connected: this.client?.connected ?? false });
  }

  private post(msg: Record<string, unknown>): void {
    this.view?.webview.postMessage(msg);
  }

  private async getClient(): Promise<MDPilotClient | null> {
    if (this.client?.connected) return this.client;
    const resolved = await resolveApiKey(this.context);
    if (!resolved) return null;
    this.client = new MDPilotClient();
    await this.client.connect(resolved.key, resolved.provider);
    return this.client;
  }

  // ── @-mention file search / read (scoped to the active folder) ───────────────

  private async fileSearch(query: string): Promise<void> {
    const folder = this.activeFolderObj();
    if (!folder) { this.post({ type: 'fileResults', files: [] }); return; }

    const q = query.trim();
    const glob = q ? `**/*${q}*` : '**/*.md';
    const found = await vscode.workspace.findFiles(
      new vscode.RelativePattern(folder, glob), '**/node_modules/**', 60,
    );
    const rel = found.map(u => path.relative(folder.uri.fsPath, u.fsPath));
    rel.sort((a, b) => {
      const am = a.toLowerCase().endsWith('.md') ? 0 : 1;
      const bm = b.toLowerCase().endsWith('.md') ? 0 : 1;
      if (am !== bm) return am - bm;       // .md first (the typical intent)
      return a.length - b.length;          // then shallower/shorter paths
    });
    const files = rel.slice(0, 20).map(r => ({ label: path.basename(r), relativePath: r }));
    this.post({ type: 'fileResults', files });
  }

  private async readReferenced(relPaths: string[]): Promise<{ path: string; content: string }[]> {
    const folder = this.activeFolderObj();
    if (!folder) return [];
    const base = folder.uri.fsPath;
    const out: { path: string; content: string }[] = [];
    for (const rel of relPaths.slice(0, MAX_REF_FILES)) {
      try {
        const uri = vscode.Uri.joinPath(folder.uri, rel);
        // Scope guard — never read outside the active folder.
        if (!uri.fsPath.startsWith(base + path.sep) && uri.fsPath !== base) continue;
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.size > MAX_REF_BYTES) {
          out.push({ path: rel, content: `[skipped — ${Math.round(stat.size / 1024)} KB, too large to inline]` });
          continue;
        }
        const buf = await vscode.workspace.fs.readFile(uri);
        out.push({ path: rel, content: Buffer.from(buf).toString('utf8').slice(0, MAX_REF_CHARS) });
      } catch { /* unreadable — skip */ }
    }
    return out;
  }

  // ── Message handling ─────────────────────────────────────────────────────────

  private async handleMessage(msg: Record<string, unknown>): Promise<void> {
    switch (msg.type) {
      case 'ready':
        await this.sendSettings();
        this.sendWorkspace();
        if (this.pendingTab) { this.post({ type: 'switchTab', tab: this.pendingTab }); this.pendingTab = undefined; }
        break;

      case 'saveKey': {
        const key = (msg.key as string)?.trim();
        const provider = (msg.provider as string) ?? getProvider();
        if (key) { await setApiKey(this.context, key, provider); this.client = null; }
        await this.sendSettings();
        break;
      }

      case 'clearKey':
        await clearApiKey(this.context);
        this.client = null;
        await this.sendSettings();
        break;

      case 'saveProvider':
        await setProvider(msg.provider as string);
        this.client = null;
        await this.sendSettings();
        break;

      case 'openGroqLink':
        vscode.env.openExternal(vscode.Uri.parse('https://console.groq.com/keys'));
        break;

      case 'pickFolder': {
        const folders = vscode.workspace.workspaceFolders ?? [];
        if (folders.length < 2) break;
        const pick = await vscode.window.showQuickPick(
          folders.map(f => ({ label: f.name, description: f.uri.fsPath })),
          { title: 'MDPilot — target workspace folder', placeHolder: 'Generation runs against this folder' },
        );
        if (pick) { this.activeFolder = pick.description; this.sendWorkspace(); this.client = null; }
        break;
      }

      case 'fileSearch':
        await this.fileSearch((msg.query as string) ?? '');
        break;

      case 'sendChat':
        await this.handleChat(msg.text as string, msg.id as string, (msg.files as string[]) ?? []);
        break;

      case 'openFile': {
        const p = msg.path as string;
        if (p) vscode.window.showTextDocument(vscode.Uri.file(p));
        break;
      }

      case 'copy':
        await vscode.env.clipboard.writeText(msg.text as string);
        break;
    }
  }

  private async handleChat(text: string, id: string, files: string[]): Promise<void> {
    const lower = text.toLowerCase();
    const root = this.rootDir();

    let toolName = '';
    let toolArgs: Record<string, unknown> = { rootDir: root };
    let action = '';
    let filename: string | undefined;
    let isTask = false;

    if (lower.includes('agent')) {
      toolName = 'generate_md_file';
      toolArgs = { ...toolArgs, fileType: 'agents', writeToDisk: true, verified: true };
      action = 'AGENTS.md'; filename = 'AGENTS.md';
    } else if (lower.includes('claude')) {
      toolName = 'generate_md_file';
      toolArgs = { ...toolArgs, fileType: 'claude', writeToDisk: true, verified: true };
      action = 'CLAUDE.md'; filename = 'CLAUDE.md';
    } else if (lower.includes('readme')) {
      toolName = 'generate_md_file';
      toolArgs = { ...toolArgs, fileType: 'readme', writeToDisk: true, verified: true };
      action = 'README.md'; filename = 'README.md';
    } else if (lower.includes('task')) {
      toolName = 'generate_task_file'; action = 'TASK.md'; filename = 'TASK.md'; isTask = true;
    } else if (lower.includes('drift')) {
      toolName = 'check_drift'; action = 'Drift check';
    } else if (lower.includes('save') && lower.includes('context')) {
      toolName = 'save_context';
      toolArgs = { ...toolArgs, summary: text, writeToDisk: true };
      action = 'Context saved'; filename = 'CONTEXT.md';
    } else if (lower.includes('load') && lower.includes('context')) {
      toolName = 'load_context'; action = 'Session context';
    } else {
      this.post({
        type: 'chatResult', id, action: 'Commands', ok: true,
        body:
          'Try one of these:\n' +
          '• generate agents — AGENTS.md\n' +
          '• generate readme — README.md\n' +
          '• generate claude — CLAUDE.md\n' +
          '• task: <description> — TASK.md\n' +
          '• check drift — stale doc detection\n' +
          '• save context / load context — session memory\n\n' +
          'Type @ to reference a file as context.',
      });
      return;
    }

    this.post({ type: 'chatLoading', id, label: filename ? `Generating ${action}…` : `${action}…` });

    try {
      // Build the task input, folding in any @-referenced file content (task route only).
      if (isTask) {
        const match = text.match(/task[:\s]+(.+)/is);
        let taskInput = match?.[1]?.trim() ?? text;
        if (files.length) {
          const refs = await this.readReferenced(files);
          if (refs.length) {
            taskInput += '\n\n--- Referenced files ---\n' +
              refs.map(r => `### ${r.path}\n\`\`\`\n${r.content}\n\`\`\``).join('\n\n');
          }
        }
        toolArgs = { ...toolArgs, taskInput, writeToDisk: true, executionMode: 'ai_exec' };
      }

      const c = await this.getClient();
      if (!c) {
        this.post({ type: 'chatError', id, message: 'No API key found. Open the Settings tab to add one.', retry: text });
        return;
      }
      const result = await c.callTool(toolName, toolArgs);
      const tokenMatch = result.match(/([\d,]+)\s*tokens?/i);
      const tokens = tokenMatch ? Number(tokenMatch[1].replace(/,/g, '')) : undefined;
      const body = result.replace(/\n*✓[^\n]*$/, '').trim() || result.trim();
      this.post({
        type: 'chatResult', id, action, ok: true, tokens,
        filePath: filename ? `${root}/${filename}` : undefined,
        body,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const friendly = /413|too large|rate limit|tokens per minute|TPM/i.test(msg)
        ? "This repo is too large for the current provider's free-tier rate limit. Switch to Anthropic or OpenAI in Settings, or wait a minute and retry."
        : msg;
      this.post({ type: 'chatError', id, message: friendly, retry: text });
    }
  }

  private static nonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let s = '';
    for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  private getHtml(): string {
    const nonce = MDPilotPanelProvider.nonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>MDPilot</title>
<style>
  :root{
    --accent:#E6A23C;        /* MDPilot amber — the one brand accent (mdpilot.in) */
    --accent-ink:#16120A;
    --accent-soft:rgba(230,162,60,0.16);
    --accent-line:rgba(230,162,60,0.38);
    --radius:6px;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:var(--vscode-font-family);font-size:var(--vscode-font-size,13px);
    color:var(--vscode-foreground);background:var(--vscode-sideBar-background);
    height:100vh;display:flex;flex-direction:column;overflow:hidden
  }
  button{font-family:inherit}

  .brand{display:flex;align-items:center;gap:8px;padding:11px 14px 9px;flex-shrink:0;cursor:pointer}
  .brand .mark{width:19px;height:19px;color:var(--accent);flex-shrink:0}
  .brand-name{font-size:12px;font-weight:700;letter-spacing:.14em;color:var(--vscode-foreground)}

  .tabs{display:flex;gap:2px;padding:0 10px;border-bottom:1px solid var(--vscode-panel-border,#333);flex-shrink:0}
  .tab{
    padding:7px 12px 8px;cursor:pointer;font-size:12px;background:none;border:none;
    color:var(--vscode-descriptionForeground);border-bottom:2px solid transparent;margin-bottom:-1px;
    user-select:none;transition:color .13s
  }
  .tab:hover{color:var(--vscode-foreground)}
  .tab.active{color:var(--vscode-foreground);border-bottom-color:var(--accent);font-weight:600}
  .tab-pane{display:none;flex:1;overflow:hidden;flex-direction:column;position:relative}
  .tab-pane.active{display:flex}

  /* Workspace context bar */
  .ctxbar{
    display:flex;align-items:center;gap:5px;padding:6px 12px;flex-shrink:0;
    font-size:11px;color:var(--vscode-descriptionForeground);
    border-bottom:1px solid var(--vscode-panel-border,#333);user-select:none
  }
  .ctxbar .ws-name{color:var(--vscode-foreground);font-weight:600}
  .ctxbar.clickable{cursor:pointer}
  .ctxbar.clickable:hover .ws-name{color:var(--accent)}
  .ctxbar.disabled{color:var(--vscode-errorForeground,#f14c4c)}

  .chat-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}

  .empty{margin:auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;padding:18px 8px;max-width:300px}
  .empty .mark{width:34px;height:34px;color:var(--accent);opacity:.95}
  .empty h2{font-size:14px;font-weight:600;color:var(--vscode-foreground)}
  .chips{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
  .chip{
    background:var(--vscode-button-secondaryBackground,#34373c);color:var(--vscode-button-secondaryForeground,#ccc);
    border:1px solid var(--vscode-panel-border,#333);border-radius:999px;padding:6px 13px;font-size:12px;cursor:pointer;
    transition:border-color .13s,color .13s
  }
  .chip:hover{border-color:var(--accent);color:var(--vscode-foreground)}
  .chip:disabled{opacity:.4;cursor:not-allowed}
  .empty .hint{font-size:11px;color:var(--vscode-descriptionForeground)}

  .msg{font-size:12px;line-height:1.5;border-radius:var(--radius);word-break:break-word}
  .msg.user{align-self:flex-end;max-width:86%;padding:7px 11px;white-space:pre-wrap;background:var(--accent-soft);border:1px solid var(--accent-line);color:var(--vscode-foreground)}
  .msg.reply{align-self:stretch;padding:9px 11px;background:var(--vscode-editor-inactiveSelectionBackground);border:1px solid var(--vscode-panel-border,#333)}
  .msg.reply.loading{display:flex;align-items:center;gap:8px;color:var(--vscode-descriptionForeground)}
  .msg.reply.error{border-color:var(--vscode-inputValidation-errorBorder,#be1100);background:rgba(190,17,0,0.08)}
  .bub-head{display:flex;align-items:center;gap:8px;margin-bottom:7px}
  .bub-action{font-weight:600;font-size:12px;color:var(--vscode-foreground)}
  .bub-check{color:var(--accent);font-weight:700}
  .bub-tokens{margin-left:auto;font-size:10px;font-family:var(--vscode-editor-font-family,monospace);color:var(--vscode-descriptionForeground);background:var(--vscode-badge-background);padding:1px 6px;border-radius:999px}
  .bub-body{font-family:var(--vscode-editor-font-family,monospace);font-size:11.5px;line-height:1.45;white-space:pre-wrap;max-height:280px;overflow:auto;background:var(--vscode-textCodeBlock-background,var(--vscode-input-background));border:1px solid var(--vscode-panel-border,#333);border-radius:5px;padding:8px 9px;color:var(--vscode-foreground)}
  .bub-actions{display:flex;gap:8px;margin-top:8px;align-items:center}
  .err-text{color:var(--vscode-errorForeground,#f14c4c);font-size:12px;line-height:1.5}
  .mini-btn{font-size:11px;padding:3px 9px;border-radius:5px;cursor:pointer;background:var(--vscode-button-secondaryBackground,#34373c);color:var(--vscode-button-secondaryForeground,#ccc);border:1px solid var(--vscode-panel-border,#333);transition:border-color .13s,color .13s}
  .mini-btn:hover{border-color:var(--accent);color:var(--vscode-foreground)}
  .mini-btn.link{background:none;border-color:transparent;color:var(--accent)}
  .mini-btn.link:hover{text-decoration:underline}
  .spinner{width:12px;height:12px;border:2px solid var(--vscode-panel-border,#444);border-top-color:var(--accent);border-radius:50%;display:inline-block;animation:spin .7s linear infinite;flex-shrink:0}
  @keyframes spin{to{transform:rotate(360deg)}}

  /* Chat input */
  .chat-footer{display:flex;flex-direction:column;gap:6px;padding:10px;border-top:1px solid var(--vscode-panel-border,#333);flex-shrink:0;position:relative}
  .attached{display:flex;flex-wrap:wrap;gap:5px}
  .achip{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;padding:2px 7px;border-radius:999px;background:var(--accent-soft);border:1px solid var(--accent-line);color:var(--vscode-foreground);font-family:var(--vscode-editor-font-family,monospace)}
  .achip .x{cursor:pointer;opacity:.65;font-family:var(--vscode-font-family)}
  .achip .x:hover{opacity:1}
  .input-row{display:flex;gap:7px;align-items:flex-end}
  textarea#inp{flex:1;padding:8px 10px;resize:none;height:38px;max-height:120px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border,var(--vscode-panel-border,transparent));border-radius:var(--radius);font-family:inherit;font-size:12.5px;outline:none;line-height:1.4}
  textarea#inp:focus{border-color:var(--accent)}
  textarea#inp:disabled{opacity:.5}
  .send{width:34px;height:38px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--accent);color:var(--accent-ink);border:none;border-radius:var(--radius);cursor:pointer;transition:filter .13s}
  .send:hover{filter:brightness(1.08)}
  .send:disabled{opacity:.4;cursor:not-allowed}
  .send svg{width:16px;height:16px}

  /* @ file dropdown */
  .fdrop{position:absolute;left:10px;right:10px;bottom:100%;margin-bottom:6px;max-height:210px;overflow:auto;background:var(--vscode-dropdown-background,var(--vscode-editor-background));border:1px solid var(--vscode-panel-border,#333);border-radius:var(--radius);box-shadow:0 4px 16px rgba(0,0,0,0.35);z-index:30;display:none}
  .fdrop.open{display:block}
  .fitem{display:flex;align-items:baseline;gap:8px;padding:6px 10px;cursor:pointer}
  .fitem.active,.fitem:hover{background:var(--vscode-list-hoverBackground,var(--accent-soft))}
  .fitem .fname{font-size:12px;color:var(--vscode-foreground)}
  .fitem .fpath{font-size:10px;color:var(--vscode-descriptionForeground);font-family:var(--vscode-editor-font-family,monospace);margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%}

  /* Settings */
  #s-pane{padding:16px 14px;overflow-y:auto;gap:18px}
  .field{display:flex;flex-direction:column;gap:6px}
  .label{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--vscode-descriptionForeground)}
  .hint{font-size:11px;color:var(--vscode-descriptionForeground);line-height:1.45}
  select,.key-in,.masked{height:28px;padding:0 9px;width:100%;box-sizing:border-box;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border,var(--vscode-panel-border,transparent));border-radius:var(--radius);font-family:inherit;font-size:12.5px;outline:none}
  select{cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 9px center;padding-right:28px}
  select:focus,.key-in:focus{border-color:var(--accent)}
  .masked{display:flex;align-items:center;font-family:var(--vscode-editor-font-family,monospace);color:var(--vscode-descriptionForeground);letter-spacing:.04em}
  .card{border:1px solid var(--vscode-panel-border,#333);border-radius:var(--radius);padding:13px;display:flex;flex-direction:column;gap:13px}
  .key-row{display:flex;gap:7px}
  .key-row .key-in{flex:1}
  .btn{height:28px;padding:0 13px;border:1px solid transparent;border-radius:var(--radius);cursor:pointer;font-size:12px;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;transition:filter .13s,background .13s,border-color .13s}
  .btn.primary{background:var(--accent);color:var(--accent-ink)}
  .btn.primary:hover{filter:brightness(1.08)}
  .btn.danger{background:transparent;color:var(--vscode-errorForeground,#f14c4c);border-color:var(--vscode-panel-border,#333)}
  .btn.danger:hover{background:rgba(241,76,76,0.12);border-color:var(--vscode-errorForeground,#f14c4c)}
  .status{font-size:11.5px;color:var(--vscode-descriptionForeground);display:flex;align-items:center;gap:7px;line-height:1.4}
  .dot{width:7px;height:7px;border-radius:50%;background:var(--vscode-testing-iconFailed,#f14c4c);flex-shrink:0}
  .dot.ok{background:var(--vscode-testing-iconPassed,#73c991)}
  .footer-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--vscode-panel-border,#333);padding-top:14px}
  .link{color:var(--accent);cursor:pointer;text-decoration:none;font-size:12px;background:none;border:none;padding:0}
  .link:hover{text-decoration:underline}

  @media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}
</style>
</head>
<body>
<div class="brand" id="brand" title="MDPilot — back to Chat">
  <svg class="mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="11" y="2" width="2" height="4" rx="1" fill="currentColor" opacity="0.9"/>
    <rect x="7" y="5" width="2" height="3" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="15" y="5" width="2" height="3" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="3" y="9" width="2" height="2" rx="1" fill="currentColor" opacity="0.4"/>
    <rect x="19" y="9" width="2" height="2" rx="1" fill="currentColor" opacity="0.4"/>
    <rect x="5" y="13" width="14" height="9" rx="1.5" fill="currentColor" opacity="0.18"/>
    <rect x="7" y="15.5" width="10" height="1.2" rx="0.6" fill="currentColor" opacity="0.75"/>
    <rect x="7" y="17.5" width="7" height="1.2" rx="0.6" fill="currentColor" opacity="0.55"/>
    <rect x="7" y="19.5" width="5" height="1.2" rx="0.6" fill="currentColor" opacity="0.4"/>
  </svg>
  <span class="brand-name">MDPILOT</span>
</div>

<div class="tabs">
  <button class="tab active" id="tab-c" data-tab="c">Chat</button>
  <button class="tab" id="tab-s" data-tab="s">Settings</button>
</div>

<div id="c-pane" class="tab-pane active">
  <div class="ctxbar" id="ctxbar">📁 …</div>
  <div class="chat-messages" id="msgs">
    <div class="empty" id="empty">
      <svg class="mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="11" y="2" width="2" height="4" rx="1" fill="currentColor" opacity="0.9"/>
        <rect x="7" y="5" width="2" height="3" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="15" y="5" width="2" height="3" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="3" y="9" width="2" height="2" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="19" y="9" width="2" height="2" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="5" y="13" width="14" height="9" rx="1.5" fill="currentColor" opacity="0.18"/>
        <rect x="7" y="15.5" width="10" height="1.2" rx="0.6" fill="currentColor" opacity="0.75"/>
        <rect x="7" y="17.5" width="7" height="1.2" rx="0.6" fill="currentColor" opacity="0.55"/>
        <rect x="7" y="19.5" width="5" height="1.2" rx="0.6" fill="currentColor" opacity="0.4"/>
      </svg>
      <h2>What do you want to set up?</h2>
      <div class="chips">
        <button class="chip" data-cmd="generate agents">Generate AGENTS.md</button>
        <button class="chip" data-cmd="generate readme">Generate README</button>
        <button class="chip" data-cmd="check drift">Check drift</button>
        <button class="chip" data-cmd="__task">New task…</button>
      </div>
      <p class="hint">or type a command below. Type @ to add a file as context.</p>
    </div>
  </div>
  <div class="chat-footer">
    <div class="fdrop" id="fdrop"></div>
    <div class="attached" id="attached"></div>
    <div class="input-row">
      <textarea id="inp" rows="1" placeholder="Ask MDPilot or type a command…"></textarea>
      <button class="send" id="send" title="Send (Enter)" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      </button>
    </div>
  </div>
</div>

<div id="s-pane" class="tab-pane">
  <div class="field">
    <span class="label">Provider</span>
    <select id="prov" onchange="saveProvider()">
      <option value="groq">Groq — Llama 3.3 70B (free)</option>
      <option value="nvidia">NVIDIA NIM — Llama 3.3 70B (free)</option>
      <option value="anthropic">Anthropic — Claude</option>
      <option value="openai">OpenAI — GPT-4o</option>
    </select>
    <span class="hint">Free tiers have small rate limits — for large repos, Anthropic or OpenAI are more reliable.</span>
  </div>
  <div class="card">
    <div class="field">
      <span class="label">Current key</span>
      <div class="masked" id="mkey">loading…</div>
    </div>
    <div class="field">
      <span class="label">Change key</span>
      <div class="key-row">
        <input type="password" class="key-in" id="newk" placeholder="gsk_… · sk-ant-… · sk-…" />
        <button class="btn primary" onclick="saveKey()">Save</button>
      </div>
    </div>
    <div class="status">
      <div class="dot" id="dot"></div>
      <span id="stxt">Checking…</span>
    </div>
  </div>
  <div class="footer-actions">
    <button class="link" onclick="openGroq()">Get a free Groq key →</button>
    <button class="btn danger" onclick="clearKey()">Clear stored key</button>
  </div>
</div>

<script nonce="${nonce}">
  const vsc = acquireVsCodeApi();
  const results = {};
  let counter = 0;
  let attached = [];          // selected @file relative paths
  let fileResults = [];       // current dropdown items
  let dropIndex = -1;
  let searchTimer = null;
  let wsCount = 0;

  // ── Tabs: single source of truth ──
  const prev = vsc.getState() || {};
  let activeTab = prev.activeTab === 's' ? 's' : 'c';
  function setActiveTab(tab){
    activeTab = (tab === 's') ? 's' : 'c';
    document.getElementById('tab-c').classList.toggle('active', activeTab==='c');
    document.getElementById('tab-s').classList.toggle('active', activeTab==='s');
    document.getElementById('c-pane').classList.toggle('active', activeTab==='c');
    document.getElementById('s-pane').classList.toggle('active', activeTab==='s');
    vsc.setState({ activeTab: activeTab });
  }
  document.getElementById('tab-c').addEventListener('click', function(){ setActiveTab('c'); });
  document.getElementById('tab-s').addEventListener('click', function(){ setActiveTab('s'); });
  document.getElementById('brand').addEventListener('click', function(){ setActiveTab('c'); });

  // ── Helpers ──
  function el(tag, cls){ const e=document.createElement(tag); if(cls)e.className=cls; return e; }
  function msgs(){ return document.getElementById('msgs'); }
  function scrollBottom(){ const m=msgs(); m.scrollTop=m.scrollHeight; }
  function byId(id){ return document.querySelector('[data-id="'+id+'"]'); }
  function hideEmpty(){ const e=document.getElementById('empty'); if(e)e.remove(); }

  function addUser(text){ const d=el('div','msg user'); d.textContent=text; msgs().appendChild(d); scrollBottom(); }
  function addLoading(id){
    const d=el('div','msg reply loading'); d.setAttribute('data-id',id);
    const sp=el('span','spinner'); const tx=el('span','ldtxt'); tx.textContent='Working…';
    d.appendChild(sp); d.appendChild(tx); msgs().appendChild(d); scrollBottom();
  }
  function setLoadingLabel(id,label){ const t=document.querySelector('[data-id="'+id+'"] .ldtxt'); if(t)t.textContent=label; }

  function renderResult(m){
    let d=byId(m.id); if(!d){ d=el('div'); d.setAttribute('data-id',m.id); msgs().appendChild(d); }
    d.className='msg reply'; d.textContent='';
    const head=el('div','bub-head');
    const a=el('span','bub-action'); a.textContent=m.action; head.appendChild(a);
    if(m.ok){ const c=el('span','bub-check'); c.textContent='✓'; head.appendChild(c); }
    if(m.tokens){ const tk=el('span','bub-tokens'); tk.textContent=Number(m.tokens).toLocaleString()+' tokens'; head.appendChild(tk); }
    d.appendChild(head);
    const pre=el('pre','bub-body'); pre.textContent=m.body; d.appendChild(pre);
    results[m.id]=m.body;
    const act=el('div','bub-actions');
    const copy=el('button','mini-btn'); copy.textContent='Copy';
    copy.onclick=function(){ vsc.postMessage({type:'copy',text:results[m.id]}); copy.textContent='Copied'; setTimeout(function(){copy.textContent='Copy';},1200); };
    act.appendChild(copy);
    if(m.filePath){ const o=el('button','mini-btn link'); o.textContent='Open file'; o.onclick=function(){ vsc.postMessage({type:'openFile',path:m.filePath}); }; act.appendChild(o); }
    d.appendChild(act); scrollBottom();
  }
  function renderError(m){
    let d=byId(m.id); if(!d){ d=el('div'); d.setAttribute('data-id',m.id); msgs().appendChild(d); }
    d.className='msg reply error'; d.textContent='';
    const p=el('div','err-text'); p.textContent=m.message; d.appendChild(p);
    const act=el('div','bub-actions');
    const r=el('button','mini-btn'); r.textContent='Retry'; r.onclick=function(){ run(m.retry); };
    act.appendChild(r); d.appendChild(act); scrollBottom();
  }

  function run(text){
    if(!text || !text.trim()) return;
    hideEmpty(); addUser(text);
    const id='m'+(++counter); addLoading(id);
    vsc.postMessage({type:'sendChat', text:text, id:id, files: attached.slice()});
    attached = []; renderAttached();
  }

  // ── Workspace context bar ──
  function applyWorkspace(m){
    wsCount = m.count;
    const bar=document.getElementById('ctxbar');
    bar.textContent=''; bar.classList.remove('clickable','disabled'); bar.onclick=null;
    if(m.count===0){
      bar.classList.add('disabled'); bar.textContent='⚠ No folder open — open a folder to use MDPilot';
      setDisabled(true); return;
    }
    setDisabled(false);
    const active=(m.folders.filter(function(f){return f.path===m.active;})[0])||m.folders[0];
    bar.appendChild(document.createTextNode('📁 '));
    const nm=el('span','ws-name'); nm.textContent=active.name; bar.appendChild(nm);
    if(m.count>1){
      const c=el('span'); c.textContent=' ▾'; bar.appendChild(c);
      bar.title='Click to switch target folder ('+m.count+' in workspace)';
      bar.classList.add('clickable'); bar.onclick=function(){ vsc.postMessage({type:'pickFolder'}); };
    } else { bar.title=active.path; }
  }
  function setDisabled(d){
    document.getElementById('send').disabled=d;
    document.getElementById('inp').disabled=d;
    document.querySelectorAll('.chip').forEach(function(c){ c.disabled=d; });
  }

  // ── @ file mentions ──
  const inp=document.getElementById('inp');
  const fdrop=document.getElementById('fdrop');

  function mentionContext(){
    const caret=inp.selectionStart;
    const upto=inp.value.slice(0,caret);
    const at=upto.lastIndexOf('@');
    if(at<0) return null;
    const before = at===0 ? '' : upto.charAt(at-1);
    if(before && !/\\s/.test(before)) return null;       // @ must start a token
    const query=upto.slice(at+1);
    if(/\\s/.test(query)) return null;                    // token ended
    return { at: at, caret: caret, query: query };
  }
  function closeDrop(){ fdrop.classList.remove('open'); fdrop.textContent=''; fileResults=[]; dropIndex=-1; }
  function renderDrop(){
    fdrop.textContent='';
    if(!fileResults.length){ closeDrop(); return; }
    fileResults.forEach(function(f,i){
      const it=el('div','fitem'+(i===dropIndex?' active':''));
      const n=el('span','fname'); n.textContent=f.label;
      const p=el('span','fpath'); p.textContent=f.relativePath;
      it.appendChild(n); it.appendChild(p);
      it.onclick=function(){ pickFile(f); };
      fdrop.appendChild(it);
    });
    fdrop.classList.add('open');
  }
  function pickFile(f){
    const ctx=mentionContext();
    if(ctx){
      const v=inp.value;
      inp.value = v.slice(0,ctx.at) + '@' + f.relativePath + ' ' + v.slice(ctx.caret);
    }
    if(attached.indexOf(f.relativePath)<0){ attached.push(f.relativePath); renderAttached(); }
    closeDrop(); inp.focus();
  }
  function renderAttached(){
    const box=document.getElementById('attached'); box.textContent='';
    attached.forEach(function(p){
      const c=el('span','achip');
      const t=el('span'); t.textContent='@'+p; c.appendChild(t);
      const x=el('span','x'); x.textContent='✕'; x.title='Remove';
      x.onclick=function(){ attached=attached.filter(function(q){return q!==p;}); renderAttached(); };
      c.appendChild(x); box.appendChild(c);
    });
  }
  inp.addEventListener('input', function(){
    inp.style.height='38px'; inp.style.height=Math.min(inp.scrollHeight,120)+'px';
    const ctx=mentionContext();
    if(!ctx){ closeDrop(); return; }
    if(searchTimer) clearTimeout(searchTimer);
    searchTimer=setTimeout(function(){ vsc.postMessage({type:'fileSearch', query: ctx.query}); }, 150);
  });
  inp.addEventListener('keydown', function(e){
    if(fdrop.classList.contains('open') && fileResults.length){
      if(e.key==='ArrowDown'){ e.preventDefault(); dropIndex=(dropIndex+1)%fileResults.length; renderDrop(); return; }
      if(e.key==='ArrowUp'){ e.preventDefault(); dropIndex=(dropIndex-1+fileResults.length)%fileResults.length; renderDrop(); return; }
      if(e.key==='Enter'){ e.preventDefault(); pickFile(fileResults[dropIndex<0?0:dropIndex]); return; }
      if(e.key==='Escape'){ e.preventDefault(); closeDrop(); return; }
    }
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(); }
  });
  function submit(){ const v=inp.value; inp.value=''; inp.style.height='38px'; closeDrop(); run(v); }
  document.getElementById('send').addEventListener('click', submit);

  // Chips
  document.querySelectorAll('.chip').forEach(function(c){
    c.addEventListener('click', function(){
      const cmd=c.getAttribute('data-cmd');
      if(cmd==='__task'){ inp.value='task: '; inp.focus(); return; }
      run(cmd);
    });
  });

  // Settings
  function saveKey(){ const k=document.getElementById('newk').value.trim(); const p=document.getElementById('prov').value; if(!k)return; vsc.postMessage({type:'saveKey',key:k,provider:p}); document.getElementById('newk').value=''; }
  function clearKey(){ vsc.postMessage({type:'clearKey'}); }
  function saveProvider(){ vsc.postMessage({type:'saveProvider',provider:document.getElementById('prov').value}); }
  function openGroq(){ vsc.postMessage({type:'openGroqLink'}); }
  function applySettings(m){
    document.getElementById('prov').value=m.provider;
    document.getElementById('mkey').textContent=m.maskedKey||'No key stored';
    const dot=document.getElementById('dot'), txt=document.getElementById('stxt');
    if(m.keySource==='none'){ dot.className='dot'; txt.textContent='No key — add one above or set a shell env variable'; }
    else if(m.keySource==='env'){ dot.className='dot ok'; txt.textContent='Using key from environment variable'; }
    else { dot.className='dot ok'; txt.textContent='Key stored securely ('+(m.keySource==='secret'?'keychain':'settings.json')+')'; }
  }

  window.addEventListener('message', function(e){
    const m=e.data;
    if(m.type==='chatLoading') setLoadingLabel(m.id,m.label);
    else if(m.type==='chatResult') renderResult(m);
    else if(m.type==='chatError') renderError(m);
    else if(m.type==='settings') applySettings(m);
    else if(m.type==='workspace') applyWorkspace(m);
    else if(m.type==='fileResults'){ fileResults=m.files||[]; dropIndex = fileResults.length?0:-1; if(mentionContext()) renderDrop(); else closeDrop(); }
    else if(m.type==='switchTab') setActiveTab(m.tab==='settings'?'s':'c');
  });

  setActiveTab(activeTab);   // restore persisted tab on load
  vsc.postMessage({type:'ready'});
</script>
</body>
</html>`;
  }
}
