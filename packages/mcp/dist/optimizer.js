import { countTokens } from './tokenizer.js';
// ── Pass 1: Boilerplate strip ─────────────────────────────────────────────────
const BOILERPLATE_SOURCES = [
    ['^(this|the) (project|repository|repo|tool|library|application|app) (is|was|has been) (a |an |the )?', 'gim', ''],
    ['in order to ', 'gi', ''],
    ['you (need to|have to|should|must) (first |then )?', 'gi', ''],
    ['please (note|be aware|make sure|ensure) that ', 'gi', ''],
    ['^(note|important|warning|disclaimer):?\\s*', 'gim', ''],
    ['as (mentioned|described|noted|stated) (above|below|previously|earlier)', 'gi', ''],
    ['for more (information|details|info),?\\s*(please )?(see|refer to|check|visit)', 'gi', ''],
    ['^(to |how to |steps to |guide to )', 'gim', ''],
    ['^(the )?following (is|are) (a |an |the )?(list|steps|instructions|guide)', 'gim', ''],
    ['\\b(very|really|quite|extremely|absolutely|basically|essentially|simply|just)\\b', 'gi', ''],
];
function stripBoilerplate(content) {
    let result = content;
    for (const [src, flags, repl] of BOILERPLATE_SOURCES) {
        result = result.replace(new RegExp(src, flags), repl);
    }
    return result.replace(/  +/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
// ── Pass 2: Structure compression ─────────────────────────────────────────────
function compressStructure(content) {
    let result = content;
    result = result.replace(/```[\w]*\n([\s\S]*?)```/g, (block) => block.replace(/\n[ \t]*(\/\/[^\n]*|#[^\n]*)/g, ''));
    result = result.replace(/(```\w*)\n\n+/g, '$1\n');
    result = result.replace(/\n\n+(```)/g, '\n$1');
    result = result.split('\n').map((l) => l.trimEnd()).join('\n');
    result = result.replace(/\n{3,}/g, '\n\n');
    return result.trim();
}
// ── Insight protection ────────────────────────────────────────────────────────
// A line is "insight-bearing" if it carries a specific technical noun — a CLI flag,
// a dotted/scoped identifier, an ALL_CAPS constant, a region/zone code, a version,
// a metric name, or an inline-code span. The prose-rewriting passes (verbose,
// aggressive) must NEVER touch such a line: collapsing "us-east-1 only for CloudFront
// certs" into "configure certs correctly" is exactly the expertise-flattening that
// makes output read as "plain". Whitespace/structure passes are safe and still run.
const TECHNICAL_TERM_RE = /`[^`]+`|--?[a-z][\w-]+|\b[A-Z][A-Za-z]+(?:[A-Z][A-Za-z]+)+\b|\b[A-Z][A-Z0-9_]{2,}\b|\b[a-z]+-[a-z]+-\d\b|\bv?\d+\.\d+(?:\.\d+)?\b|[\w@/.]+\.[a-z]{2,}\b/;
function hasTechnicalTerm(line) {
    return TECHNICAL_TERM_RE.test(line);
}
// ── Pass 3: Verbose compression ───────────────────────────────────────────────
const VERBOSE_PATTERNS = [
    [/in order to/gi, 'to'],
    [/due to the fact that/gi, 'because'],
    [/at this point in time/gi, 'now'],
    [/in the event that/gi, 'if'],
    [/for the purpose of/gi, 'to'],
    [/with regard to/gi, 'about'],
    [/in regard to/gi, 'about'],
    [/on a daily basis/gi, 'daily'],
    [/a large number of/gi, 'many'],
    [/a small number of/gi, 'few'],
    [/the vast majority of/gi, 'most'],
    [/at the present time/gi, 'now'],
    [/prior to/gi, 'before'],
    [/subsequent to/gi, 'after'],
    [/in close proximity to/gi, 'near'],
    [/is able to/gi, 'can'],
    [/has the ability to/gi, 'can'],
    [/it is important to note that/gi, ''],
    [/it should be noted that/gi, ''],
    [/it is worth mentioning that/gi, ''],
    [/as a matter of fact/gi, ''],
    [/needless to say/gi, ''],
    [/each and every/gi, 'every'],
    [/first and foremost/gi, 'first'],
    [/any and all/gi, 'all'],
    [/various different/gi, 'various'],
    [/completely finished/gi, 'finished'],
    [/absolutely essential/gi, 'essential'],
    [/basic fundamentals/gi, 'fundamentals'],
    [/end result/gi, 'result'],
    [/past history/gi, 'history'],
];
function applyVerboseCompression(content) {
    // Rewrite line-by-line so insight-bearing lines are skipped entirely.
    let inFence = false;
    return content.split('\n').map((line) => {
        if (/^```|^~~~/.test(line)) {
            inFence = !inFence;
            return line;
        }
        if (inFence || hasTechnicalTerm(line))
            return line;
        let out = line;
        for (const [re, repl] of VERBOSE_PATTERNS)
            out = out.replace(re, repl);
        return out.replace(/  +/g, ' ').replace(/ +([.,;:])/g, '$1');
    }).join('\n');
}
// ── Pass 4: Line compression ──────────────────────────────────────────────────
function compressLines(content) {
    let result = content;
    result = result.replace(/^(#{2,3}\s+.+)\n\n(?:This section (?:describes|explains|covers|shows|details) (?:how to|the|about) .+\.?\n)/gm, '$1\n\n');
    result = result.replace(/\n{3,}/g, '\n\n');
    result = result.replace(/[ \t]+$/gm, '');
    result = result.replace(/^(?:Note|Important|Warning|Tip): /gm, '> ');
    return result.trim();
}
// ── Pass 5 (opt-in): Aggressive compression ───────────────────────────────────
// Collapses soft hedges and filler constructs. NEVER touches code blocks,
// commands (lines starting with $, npm, npx, git, curl, etc.), paths, or numbers.
const AGGRESSIVE_PATTERNS = [
    [/\bmake sure that\b/gi, 'ensure'],
    [/\bmake sure\b/gi, 'ensure'],
    [/\bas well as\b/gi, 'and'],
    [/\ba number of\b/gi, 'several'],
    [/\btake into account\b/gi, 'consider'],
    [/\bwith respect to\b/gi, 'for'],
    [/\bin terms of\b/gi, 'for'],
    [/\bwhether or not\b/gi, 'whether'],
    [/\beach of the\b/gi, 'each'],
    [/\ball of the\b/gi, 'all'],
    [/\bsome of the\b/gi, 'some'],
    [/\bmost of the\b/gi, 'most'],
    [/\bthe fact that\b/gi, 'that'],
    [/\bat the same time\b/gi, 'simultaneously'],
    [/\bin addition to this\b/gi, 'additionally'],
    [/\bcan be used to\b/gi, 'can'],
    [/\bis designed to\b/gi, ''],
    [/\bin the process of\b/gi, 'while'],
];
const PROTECTED_LINE_RE = /^(\s*)(```|~{3}|\$\s|npm |npx |pnpm |yarn |git |curl |wget |docker |aws |cd |ls |mkdir |\d+\.|\/[\w/])/;
function aggressiveCompress(content) {
    const lines = content.split('\n');
    let inFence = false;
    const result = lines.map((line) => {
        // Track code fence state
        if (/^```|^~~~/.test(line)) {
            inFence = !inFence;
            return line;
        }
        // Never touch lines inside code fences, command-like lines, or insight-bearing
        // lines that carry a specific technical noun (flag, constant, version, metric…).
        if (inFence || PROTECTED_LINE_RE.test(line) || hasTechnicalTerm(line))
            return line;
        let out = line;
        for (const [re, repl] of AGGRESSIVE_PATTERNS) {
            out = out.replace(re, repl);
        }
        return out.replace(/  +/g, ' ');
    });
    return result.join('\n');
}
export function optimizeMarkdown(content, opts) {
    const tokensBefore = countTokens(content);
    let working = content;
    working = stripBoilerplate(working);
    working = compressStructure(working);
    working = applyVerboseCompression(working);
    working = compressLines(working);
    if (opts?.aggressive) {
        working = aggressiveCompress(working);
    }
    const tokensAfter = countTokens(working);
    return { optimized: working, tokensBefore, tokensAfter };
}
//# sourceMappingURL=optimizer.js.map