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
    let result = content;
    for (const [re, repl] of VERBOSE_PATTERNS) {
        result = result.replace(re, repl);
    }
    return result.replace(/  +/g, ' ').replace(/ +([.,;:])/g, '$1');
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
// ── Public API ────────────────────────────────────────────────────────────────
export function optimizeMarkdown(content) {
    const tokensBefore = countTokens(content);
    let working = content;
    working = stripBoilerplate(working);
    working = compressStructure(working);
    working = applyVerboseCompression(working);
    working = compressLines(working);
    const tokensAfter = countTokens(working);
    return { optimized: working, tokensBefore, tokensAfter };
}
//# sourceMappingURL=optimizer.js.map