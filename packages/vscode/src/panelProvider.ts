import * as vscode from 'vscode';
import { MDPilotClient } from './mcpClient';
import { resolveApiKey, setApiKey, clearApiKey, getProvider, setProvider, getMaskedKey } from './keyManager';

export class MDPilotPanelProvider implements vscode.WebviewViewProvider {
  static readonly viewId = 'mdpilot.panel';
  private view?: vscode.WebviewView;
  private client: MDPilotClient | null = null;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();
    webviewView.webview.onDidReceiveMessage(msg => this.handleMessage(msg as Record<string, unknown>));
  }

  revealSettings(): void {
    vscode.commands.executeCommand(`${MDPilotPanelProvider.viewId}.focus`);
    this.view?.webview.postMessage({ type: 'showTab', tab: 'settings' });
  }

  private async getClient(): Promise<MDPilotClient | null> {
    if (this.client?.connected) return this.client;
    const resolved = await resolveApiKey(this.context);
    if (!resolved) return null;
    this.client = new MDPilotClient();
    await this.client.connect(resolved.key, resolved.provider);
    return this.client;
  }

  private rootDir(): string {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
  }

  private async sendSettings(): Promise<void> {
    const { maskedKey, keySource } = await getMaskedKey(this.context);
    const provider = getProvider();
    this.view?.webview.postMessage({
      type: 'settings',
      provider,
      maskedKey,
      keySource,
      connected: this.client?.connected ?? false,
    });
  }

  private async handleMessage(msg: Record<string, unknown>): Promise<void> {
    switch (msg.type) {
      case 'ready':
        await this.sendSettings();
        break;

      case 'saveKey': {
        const key = (msg.key as string)?.trim();
        const provider = (msg.provider as string) ?? getProvider();
        if (key) {
          await setApiKey(this.context, key, provider);
          this.client = null;
        }
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

      case 'sendChat':
        await this.handleChat(msg.text as string);
        break;
    }
  }

  private async handleChat(text: string): Promise<void> {
    const lower = text.toLowerCase();
    const reply = (content: string) =>
      this.view?.webview.postMessage({ type: 'chatReply', text: content });

    let toolName = '';
    let toolArgs: Record<string, unknown> = { rootDir: this.rootDir() };
    let successMsg = '';

    if (lower.includes('agent')) {
      toolName = 'generate_md_file';
      toolArgs = { ...toolArgs, fileType: 'agents', writeToDisk: true, verified: true };
      successMsg = 'AGENTS.md generated ✓';
    } else if (lower.includes('claude')) {
      toolName = 'generate_md_file';
      toolArgs = { ...toolArgs, fileType: 'claude', writeToDisk: true, verified: true };
      successMsg = 'CLAUDE.md generated ✓';
    } else if (lower.includes('readme')) {
      toolName = 'generate_md_file';
      toolArgs = { ...toolArgs, fileType: 'readme', writeToDisk: true, verified: true };
      successMsg = 'README.md generated ✓';
    } else if (lower.includes('task')) {
      const match = text.match(/task[:\s]+(.+)/is);
      const taskInput = match?.[1]?.trim() ?? text;
      toolName = 'generate_task_file';
      toolArgs = { ...toolArgs, taskInput, writeToDisk: true, executionMode: 'ai_exec' };
      successMsg = 'TASK.md generated ✓';
    } else if (lower.includes('drift')) {
      toolName = 'check_drift';
    } else if (lower.includes('save') && lower.includes('context')) {
      toolName = 'save_context';
      toolArgs = { ...toolArgs, summary: text, writeToDisk: true };
      successMsg = 'Context saved ✓';
    } else if (lower.includes('load') && lower.includes('context')) {
      toolName = 'load_context';
    } else {
      reply(
        'I can help with:\n' +
        '• "generate agents" — AGENTS.md\n' +
        '• "generate readme" — README.md\n' +
        '• "generate claude" — CLAUDE.md\n' +
        '• "task: [description]" — TASK.md\n' +
        '• "check drift" — stale doc detection\n' +
        '• "save context" / "load context" — session memory',
      );
      return;
    }

    reply('Working…');

    try {
      const c = await this.getClient();
      if (!c) {
        reply('No API key found. Open the Settings tab to add one.');
        return;
      }
      const result = await c.callTool(toolName, toolArgs);
      reply(successMsg ? `${successMsg}\n\n${result}` : result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/413|too large|rate limit|tokens per minute|TPM/i.test(msg)) {
        reply(
          'This repo is too large for the current provider\'s free-tier rate limit.\n\n' +
          'Fixes:\n' +
          '• Switch to Anthropic or OpenAI in the Settings tab (higher limits), or\n' +
          '• Wait a minute and retry — free tiers reset per minute.',
        );
      } else {
        reply(`Error: ${msg}`);
      }
    }
  }

  private getHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>MDPilot</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:var(--vscode-font-family);
    font-size:var(--vscode-font-size,13px);
    color:var(--vscode-foreground);
    background:var(--vscode-sideBar-background);
    height:100vh;display:flex;flex-direction:column;overflow:hidden
  }
  .tabs{
    display:flex;
    border-bottom:1px solid var(--vscode-panel-border,#333);
    background:var(--vscode-editorGroupHeader-tabsBackground);
    flex-shrink:0
  }
  .tab{
    padding:7px 16px;cursor:pointer;font-size:12px;
    color:var(--vscode-panelTitle-inactiveForeground);
    border-bottom:2px solid transparent;user-select:none
  }
  .tab.active{
    color:var(--vscode-panelTitle-activeForeground);
    border-bottom-color:var(--vscode-panelTitle-activeBorder)
  }
  .tab-pane{display:none;flex:1;overflow:hidden;flex-direction:column}
  .tab-pane.active{display:flex}

  /* Chat */
  .chat-messages{
    flex:1;overflow-y:auto;padding:8px;
    display:flex;flex-direction:column;gap:6px
  }
  .msg{
    padding:6px 10px;border-radius:4px;font-size:12px;
    line-height:1.5;white-space:pre-wrap;word-break:break-word
  }
  .msg.user{
    background:var(--vscode-button-background);
    color:var(--vscode-button-foreground);
    align-self:flex-end;max-width:85%
  }
  .msg.bot{
    background:var(--vscode-editor-inactiveSelectionBackground);
    color:var(--vscode-foreground);
    align-self:flex-start;max-width:90%
  }
  .chat-footer{
    display:flex;gap:4px;padding:8px;
    border-top:1px solid var(--vscode-panel-border,#333);flex-shrink:0
  }
  textarea{
    flex:1;padding:5px 8px;
    background:var(--vscode-input-background);
    color:var(--vscode-input-foreground);
    border:1px solid var(--vscode-input-border,transparent);
    border-radius:3px;resize:none;height:52px;
    font-family:var(--vscode-font-family);font-size:12px;outline:none
  }
  textarea:focus{border-color:var(--vscode-focusBorder)}
  .send{
    padding:0 10px;
    background:var(--vscode-button-background);
    color:var(--vscode-button-foreground);
    border:none;border-radius:3px;cursor:pointer;font-size:15px;flex-shrink:0
  }
  .send:hover{background:var(--vscode-button-hoverBackground)}

  /* Settings */
  #s-pane{padding:16px 14px;overflow-y:auto;gap:18px}
  .field{display:flex;flex-direction:column;gap:6px}
  .label{
    font-size:10.5px;color:var(--vscode-descriptionForeground);
    font-weight:600;text-transform:uppercase;letter-spacing:.06em
  }
  .hint{
    font-size:11px;color:var(--vscode-descriptionForeground);
    line-height:1.45;margin-top:-1px
  }
  /* Native-height controls — match VS Code's 26px form controls */
  select,.key-in,.masked{
    height:26px;padding:0 8px;
    background:var(--vscode-input-background);
    color:var(--vscode-input-foreground);
    border:1px solid var(--vscode-input-border,var(--vscode-settings-textInputBorder,transparent));
    border-radius:4px;font-family:var(--vscode-font-family);
    font-size:12.5px;outline:none;width:100%;box-sizing:border-box
  }
  select{cursor:pointer;appearance:none;-webkit-appearance:none;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center;padding-right:26px}
  select:focus,.key-in:focus{border-color:var(--vscode-focusBorder)}
  .masked{
    display:flex;align-items:center;
    font-family:var(--vscode-editor-font-family,monospace);
    color:var(--vscode-descriptionForeground);
    letter-spacing:.04em
  }
  .key-row{display:flex;gap:6px}
  .key-row .key-in{flex:1}
  .btn{
    height:26px;padding:0 12px;
    background:var(--vscode-button-background);
    color:var(--vscode-button-foreground);
    border:1px solid transparent;border-radius:4px;cursor:pointer;
    font-size:12px;font-family:var(--vscode-font-family);
    white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;
    transition:background-color 120ms ease
  }
  .btn:hover{background:var(--vscode-button-hoverBackground)}
  .btn.sec{
    background:var(--vscode-button-secondaryBackground,#3a3d41);
    color:var(--vscode-button-secondaryForeground,#ccc)
  }
  .btn.sec:hover{background:var(--vscode-button-secondaryHoverBackground,#45494e)}
  .status{
    font-size:11.5px;color:var(--vscode-descriptionForeground);
    display:flex;align-items:center;gap:7px;line-height:1.4
  }
  .dot{width:7px;height:7px;border-radius:50%;background:var(--vscode-testing-iconFailed,#f14c4c);flex-shrink:0}
  .dot.ok{background:var(--vscode-testing-iconPassed,#73c991)}
  .link{
    color:var(--vscode-textLink-foreground);cursor:pointer;
    text-decoration:none;font-size:12px;
    background:none;border:none;padding:0;align-self:flex-start
  }
  .link:hover{color:var(--vscode-textLink-activeForeground);text-decoration:underline}
  .hr{height:1px;background:var(--vscode-panel-border,#333);border:0;margin:2px 0}
  .footer-actions{display:flex;flex-direction:column;gap:12px}
</style>
</head>
<body>
<div class="tabs">
  <div class="tab active" onclick="showTab('c')">Chat</div>
  <div class="tab" onclick="showTab('s')">Settings</div>
</div>

<div id="c-pane" class="tab-pane active">
  <div class="chat-messages" id="msgs">
    <div class="msg bot">Hi! I can generate AGENTS.md, CLAUDE.md, README.md, and TASK.md for your project — or check your docs for drift.

Type "generate agents", "generate readme", "check drift", or "task: [description]" to get started.</div>
  </div>
  <div class="chat-footer">
    <textarea id="inp" placeholder="generate agents.md…"></textarea>
    <button class="send" onclick="send()" title="Send (Enter)">↑</button>
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

  <div class="field">
    <span class="label">Current key</span>
    <div class="masked" id="mkey">loading…</div>
    <div class="status">
      <div class="dot" id="dot"></div>
      <span id="stxt">Checking…</span>
    </div>
  </div>

  <div class="field">
    <span class="label">Change key</span>
    <div class="key-row">
      <input type="password" class="key-in" id="newk" placeholder="gsk_… · sk-ant-… · sk-…" />
      <button class="btn" onclick="saveKey()">Save</button>
    </div>
  </div>

  <hr class="hr" />

  <div class="footer-actions">
    <button class="link" onclick="openGroq()">Get a free Groq key →</button>
    <button class="btn sec" onclick="clearKey()">Clear stored key</button>
  </div>
</div>

<script>
  const vsc = acquireVsCodeApi();

  function showTab(t) {
    document.querySelectorAll('.tab').forEach((el,i)=>el.classList.toggle('active',['c','s'][i]===t));
    document.querySelectorAll('.tab-pane').forEach(el=>el.classList.remove('active'));
    document.getElementById(t+'-pane').classList.add('active');
  }

  /* Chat */
  function addMsg(txt,role){
    const c=document.getElementById('msgs');
    const d=document.createElement('div');
    d.className='msg '+role;d.textContent=txt;
    c.appendChild(d);c.scrollTop=c.scrollHeight;
    return d;
  }
  let lastBot=null;
  function send(){
    const inp=document.getElementById('inp');
    const t=inp.value.trim();if(!t)return;
    addMsg(t,'user');inp.value='';
    lastBot=addMsg('Working…','bot');
    vsc.postMessage({type:'sendChat',text:t});
  }
  document.getElementById('inp').addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
  });

  /* Settings */
  function saveKey(){
    const k=document.getElementById('newk').value.trim();
    const p=document.getElementById('prov').value;
    if(!k)return;
    vsc.postMessage({type:'saveKey',key:k,provider:p});
    document.getElementById('newk').value='';
  }
  function clearKey(){vsc.postMessage({type:'clearKey'});}
  function saveProvider(){vsc.postMessage({type:'saveProvider',provider:document.getElementById('prov').value});}
  function openGroq(){vsc.postMessage({type:'openGroqLink'});}

  /* Incoming messages */
  window.addEventListener('message',e=>{
    const m=e.data;
    if(m.type==='chatReply'){
      if(lastBot){lastBot.textContent=m.text;lastBot=null;}
      else addMsg(m.text,'bot');
    }
    if(m.type==='settings'){
      document.getElementById('prov').value=m.provider;
      document.getElementById('mkey').textContent=m.maskedKey||'No key stored';
      const dot=document.getElementById('dot'),txt=document.getElementById('stxt');
      if(m.keySource==='none'){
        dot.className='dot';txt.textContent='No key — add one above or set a shell env variable';
      } else if(m.keySource==='env'){
        dot.className='dot ok';txt.textContent='Using key from environment variable';
      } else {
        dot.className='dot ok';
        txt.textContent='Key stored securely ('+(m.keySource==='secret'?'keychain':'settings.json')+')';
      }
    }
    if(m.type==='showTab') showTab(m.tab==='settings'?'s':'c');
  });

  vsc.postMessage({type:'ready'});
</script>
</body>
</html>`;
  }
}
