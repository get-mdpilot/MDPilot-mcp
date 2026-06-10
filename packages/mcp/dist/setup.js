import { createInterface } from 'node:readline/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { execSync, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
// ── ANSI ──────────────────────────────────────────────────────────────────────
const A = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};
const bold = (s) => `${A.bold}${s}${A.reset}`;
const dim = (s) => `${A.dim}${s}${A.reset}`;
const green = (s) => `${A.green}${s}${A.reset}`;
const cyan = (s) => `${A.cyan}${s}${A.reset}`;
const yellow = (s) => `${A.yellow}${s}${A.reset}`;
const PROVIDERS = [
    { envVar: 'GROQ_API_KEY', name: 'Groq', prefix: 'gsk_', free: true, url: 'https://console.groq.com/keys' },
    { envVar: 'NVIDIA_API_KEY', name: 'NVIDIA NIM', prefix: 'nvapi-', free: true, url: 'https://build.nvidia.com' },
    { envVar: 'ANTHROPIC_API_KEY', name: 'Anthropic', prefix: 'sk-ant-', free: false, url: 'https://console.anthropic.com' },
    { envVar: 'OPENAI_API_KEY', name: 'OpenAI', prefix: 'sk-', free: false, url: 'https://platform.openai.com' },
];
function providerFromKey(key) {
    for (const p of PROVIDERS) {
        if (key.startsWith(p.prefix))
            return p;
    }
    return null;
}
function envKey() {
    for (const p of PROVIDERS) {
        const val = process.env[p.envVar];
        if (val)
            return { provider: p, key: val };
    }
    return null;
}
function mask(key) {
    return key.length <= 4 ? '****' : `...${key.slice(-4)}`;
}
const CLIENT_NAMES = {
    claude: 'Claude Code', cursor: 'Cursor',
    windsurf: 'Windsurf', goose: 'Goose', print: 'your editor',
};
const CLIENT_CONFIG_PATHS = {
    claude: join(homedir(), '.claude', 'mcp.json'),
    cursor: join(homedir(), '.cursor', 'mcp.json'),
    windsurf: join(homedir(), '.codeium', 'windsurf', 'mcp_config.json'),
};
const CLIENT_DOCS = {
    claude: 'https://docs.anthropic.com/en/docs/claude-code/mcp',
    cursor: 'https://docs.cursor.com/context/model-context-protocol',
    windsurf: 'https://docs.windsurf.com/windsurf/mcp',
    goose: 'https://block.github.io/goose/docs/tutorials/custom-extensions',
};
// ── Config helpers ────────────────────────────────────────────────────────────
function mcpEntry(envVar, key) {
    return { command: 'npx', args: ['-y', 'mdpilot-mcp'], env: { [envVar]: key } };
}
function configJson(envVar, key) {
    return JSON.stringify({ mcpServers: { mdpilot: mcpEntry(envVar, key) } }, null, 2);
}
function mergeFile(filePath, envVar, key) {
    let existing = {};
    let hadOriginal = false;
    if (existsSync(filePath)) {
        const raw = readFileSync(filePath, 'utf-8');
        hadOriginal = true;
        try {
            existing = JSON.parse(raw);
        }
        catch {
            existing = {};
        }
        try {
            writeFileSync(filePath + '.bak', raw, 'utf-8');
        }
        catch { /* ignore */ }
    }
    else {
        try {
            mkdirSync(dirname(filePath), { recursive: true });
        }
        catch { /* ignore */ }
    }
    const servers = existing.mcpServers ?? {};
    servers['mdpilot'] = mcpEntry(envVar, key);
    existing['mcpServers'] = servers;
    try {
        writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
        return hadOriginal ? 'backed-up' : 'written';
    }
    catch {
        return 'failed';
    }
}
// ── Claude CLI ────────────────────────────────────────────────────────────────
function claudeOnPath() {
    try {
        execSync('claude --version', { stdio: 'pipe' });
        return true;
    }
    catch {
        return false;
    }
}
function claudeMcpAdd(envVar, key) {
    const r = spawnSync('claude', ['mcp', 'add', 'mdpilot', '-e', `${envVar}=${key}`, '--', 'npx', '-y', 'mdpilot-mcp'], { stdio: 'inherit' });
    return r.status === 0;
}
// ── Arg parsing ───────────────────────────────────────────────────────────────
function parseFlags() {
    const args = process.argv.slice(3);
    const out = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--key' && args[i + 1]) {
            out.key = args[++i];
            continue;
        }
        if (args[i] === '--client' && args[i + 1]) {
            out.client = args[++i];
        }
    }
    return out;
}
// ── Wizard ────────────────────────────────────────────────────────────────────
export async function runSetup() {
    const { key: flagKey, client: flagClient } = parseFlags();
    const isTTY = process.stdin.isTTY === true;
    // Non-interactive with no flags → print help only
    if (!isTTY && !flagKey && !flagClient) {
        console.log(bold('MDPilot MCP — setup'));
        console.log('');
        console.log('Run interactively:');
        console.log('  npx -y mdpilot-mcp setup');
        console.log('');
        console.log('Or non-interactively:');
        console.log('  npx -y mdpilot-mcp setup --key gsk_... --client claude');
        console.log('');
        console.log('Manual guide: https://mdpilot.in/docs/mcp');
        return;
    }
    const rl = isTTY
        ? createInterface({ input: process.stdin, output: process.stdout, terminal: true })
        : null;
    const ask = async (q) => rl ? (await rl.question(q)).trim() : '';
    try {
        if (isTTY) {
            console.log('');
            console.log(bold(cyan('  MDPilot MCP setup')) + dim(' — ~1 minute'));
            console.log(dim('  ─────────────────────────────────────────────'));
            console.log('');
        }
        // ── Resolve key ──────────────────────────────────────────────────────────
        let resolvedKey = flagKey ?? null;
        let resolvedProvider = null;
        if (resolvedKey) {
            resolvedProvider = providerFromKey(resolvedKey);
            if (!resolvedProvider) {
                console.log(yellow('  ⚠  Unrecognized key prefix — defaulting to GROQ_API_KEY'));
                resolvedProvider = PROVIDERS[0];
            }
        }
        else {
            const existing = envKey();
            if (existing) {
                console.log(green(`  ✓  Found existing key: ${existing.provider.name} (${mask(existing.key)})`));
                let reuse = 'y';
                if (isTTY)
                    reuse = await ask(`  Use this key? ${dim('[Y/n]: ')}`);
                if (!reuse || reuse.toLowerCase() === 'y') {
                    resolvedKey = existing.key;
                    resolvedProvider = existing.provider;
                }
            }
        }
        // ── Prompt for key if still missing ──────────────────────────────────────
        if (!resolvedKey) {
            if (!isTTY) {
                console.log('No key set. Run: npx -y mdpilot-mcp setup --key <your-key> --client claude');
                console.log('Manual guide: https://mdpilot.in/docs/mcp');
                return;
            }
            console.log(bold('  Step 1 — get a free API key'));
            console.log('');
            console.log('  MDPilot needs one AI key to generate files. The free option:');
            console.log('');
            console.log(bold('  Groq') + cyan(' (recommended — free, no credit card)'));
            console.log('    1) Open  ' + bold('https://console.groq.com/keys'));
            console.log('    2) Sign in (GitHub or Google)');
            console.log('    3) Click "Create API Key"');
            console.log('    4) Copy the key  ' + dim('(starts with gsk_)'));
            console.log('');
            console.log(dim('  Also free: NVIDIA NIM → https://build.nvidia.com  (key starts with nvapi-)'));
            console.log('');
            const input = await ask('  Paste your key (Enter to skip and configure later): ');
            if (!input) {
                console.log('');
                console.log(dim('  No key entered. Re-run any time:'));
                console.log('    ' + cyan('npx -y mdpilot-mcp setup'));
                console.log('');
                console.log('  Manual guide: https://mdpilot.in/docs/mcp');
                return;
            }
            resolvedKey = input;
            resolvedProvider = providerFromKey(input);
            if (!resolvedProvider) {
                console.log(yellow('\n  ⚠  Unrecognized key format — defaulting to GROQ_API_KEY.'));
                console.log(dim('  Correct this in the config if needed.'));
                resolvedProvider = PROVIDERS[0];
            }
            else {
                console.log(green(`\n  ✓  ${resolvedProvider.name} key detected`));
            }
        }
        const envVar = resolvedProvider.envVar;
        const key = resolvedKey;
        // ── Resolve client ────────────────────────────────────────────────────────
        let client = flagClient ?? 'print';
        if (!flagClient && isTTY) {
            console.log('');
            console.log(bold('  Step 2 — which editor are you using?'));
            console.log('');
            console.log(`    ${cyan('1)')} Claude Code`);
            console.log(`    ${cyan('2)')} Cursor`);
            console.log(`    ${cyan('3)')} Windsurf`);
            console.log(`    ${cyan('4)')} Goose`);
            console.log(`    ${cyan('5)')} Just show me the config`);
            console.log('');
            const choice = await ask('  Enter 1–5: ');
            const map = {
                '1': 'claude', '2': 'cursor', '3': 'windsurf', '4': 'goose', '5': 'print',
            };
            client = map[choice] ?? 'print';
        }
        console.log('');
        // ── Apply config ──────────────────────────────────────────────────────────
        if (client === 'print') {
            console.log(bold('  Config block — paste into your editor\'s MCP config file:'));
            console.log('');
            console.log(cyan('  ┌──────────────────────────────────────────────────────────┐'));
            configJson(envVar, key).split('\n').forEach(l => console.log(`  │ ${l}`));
            console.log(cyan('  └──────────────────────────────────────────────────────────┘'));
            console.log('');
            console.log(dim('  Full guide → https://mdpilot.in/docs/mcp'));
            printNextSteps(client, key, resolvedProvider);
            return;
        }
        if (client === 'goose') {
            console.log(bold('  Goose — add a stdio extension in Settings → Extensions:'));
            console.log('');
            console.log(`    type:    stdio`);
            console.log(`    command: npx`);
            console.log(`    args:    ["-y", "mdpilot-mcp"]`);
            console.log(`    env:     { "${envVar}": "${mask(key)}" }`);
            console.log('');
            console.log(`  Goose docs: ${cyan(CLIENT_DOCS.goose ?? '')}`);
            console.log(`  Full guide: https://mdpilot.in/docs/mcp`);
            console.log(green(`\n  ✓  ${resolvedProvider.name} key ready  (${mask(key)})`));
            printNextSteps(client, key, resolvedProvider);
            return;
        }
        if (client === 'claude') {
            if (claudeOnPath()) {
                console.log(dim('  Running: claude mcp add mdpilot ...\n'));
                const ok = claudeMcpAdd(envVar, key);
                if (ok) {
                    console.log('');
                    console.log(green(`  ✓  Configured mdpilot for Claude Code  (key ${mask(key)})`));
                    printNextSteps(client, key, resolvedProvider);
                    return;
                }
                console.log(yellow('\n  ⚠  CLI returned non-zero — falling back to writing mcp.json directly'));
            }
            // Fallthrough: write JSON
        }
        // cursor / windsurf / claude-fallback — JSON merge
        const configPath = CLIENT_PATHS_resolved(client);
        if (!configPath) {
            printFallbackSnippet(client, envVar, key, resolvedProvider);
            return;
        }
        const result = mergeFile(configPath, envVar, key);
        if (result === 'failed') {
            console.log(yellow(`  ⚠  Could not write to ${configPath}. Showing config instead:\n`));
            printFallbackSnippet(client, envVar, key, resolvedProvider);
            return;
        }
        if (result === 'backed-up') {
            console.log(dim(`  Backed up original → ${configPath}.bak`));
        }
        console.log(green(`  ✓  Written to ${configPath}`));
        console.log(green(`  ✓  Configured mdpilot for ${CLIENT_NAMES[client]}  (key ${mask(key)})`));
        if (client === 'claude' && !claudeOnPath()) {
            console.log('');
            console.log(dim(`  Or add via CLI once claude is installed:`));
            console.log(`    claude mcp add mdpilot -e ${envVar}=<key> -- npx -y mdpilot-mcp`);
        }
        printNextSteps(client, key, resolvedProvider);
    }
    finally {
        rl?.close();
    }
}
// ── Helpers ───────────────────────────────────────────────────────────────────
function CLIENT_PATHS_resolved(client) {
    return CLIENT_CONFIG_PATHS[client] ?? null;
}
function printFallbackSnippet(client, envVar, key, provider) {
    console.log(bold('  Paste this into your editor\'s MCP config file:'));
    console.log('');
    console.log(cyan('  ┌──────────────────────────────────────────────────────────┐'));
    configJson(envVar, key).split('\n').forEach(l => console.log(`  │ ${l}`));
    console.log(cyan('  └──────────────────────────────────────────────────────────┘'));
    const docsUrl = CLIENT_DOCS[client];
    if (docsUrl)
        console.log(`\n  ${CLIENT_NAMES[client]} docs: ${cyan(docsUrl)}`);
    console.log(`  Full guide: https://mdpilot.in/docs/mcp`);
    printNextSteps(client, key, provider);
}
function printNextSteps(client, key, provider) {
    const name = CLIENT_NAMES[client];
    console.log('');
    console.log(bold('  Next steps:'));
    if (client !== 'print') {
        console.log(`    1) Restart ${name}`);
        console.log(`    2) Open any repo and ask your agent:`);
        console.log(cyan('       "Use mdpilot to generate an AGENTS.md for this project."'));
    }
    else {
        console.log('    1) Add the config block above to your editor\'s MCP settings');
        console.log(`    2) Restart your editor, then ask your agent:`);
        console.log(cyan('       "Use mdpilot to generate an AGENTS.md for this project."'));
    }
    console.log('');
    console.log(dim('  Docs & troubleshooting → https://mdpilot.in/docs/mcp'));
    console.log('');
}
//# sourceMappingURL=setup.js.map