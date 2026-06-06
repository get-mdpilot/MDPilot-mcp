import Anthropic from '@anthropic-ai/sdk';
import { generateFile } from './generate.js';
import { verifyClaimsOnContent } from './drift.js';
import { SYSTEM_PROMPTS } from './prompts.js';
const client = new Anthropic();
const MAX_ATTEMPTS = 2;
async function reviseContent(content, issues, ctx) {
    const issueBlock = issues
        .map(i => `[${i.severity.toUpperCase()}] ${i.type}: ${i.message}${i.detail ? ` — ${i.detail}` : ''}`)
        .join('\n');
    const scriptBlock = JSON.stringify(ctx.scripts, null, 2);
    const userMessage = [
        `<draft>`,
        content,
        `</draft>`,
        ``,
        `<verification_failures>`,
        issueBlock,
        `</verification_failures>`,
        ``,
        `<real_project_state>`,
        `Package manager: ${ctx.packageManager}`,
        `Scripts: ${scriptBlock}`,
        `Top-level structure: ${ctx.structure.join(', ')}`,
        `Stack: ${ctx.detectedStack.join(', ')}`,
        `</real_project_state>`,
        ``,
        `The draft above contains errors — commands or paths that don't exist in the real repo.`,
        `Fix ONLY the broken lines. Keep every other part of the doc identical.`,
        `Output the full corrected file, raw markdown only.`,
    ].join('\n');
    const res = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8096,
        system: SYSTEM_PROMPTS.agents, // grounding prompt — conservative, factual
        messages: [{ role: 'user', content: userMessage }],
    });
    const text = res.content.find(b => b.type === 'text');
    return text?.text ?? content;
}
export async function generateVerified(fileType, ctx, rootDir) {
    const allIssuesFound = [];
    let content = await generateFile(fileType, ctx);
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const issues = verifyClaimsOnContent(content, rootDir, ctx);
        const actionable = issues.filter(i => i.severity !== 'low');
        if (attempt === 1)
            allIssuesFound.push(...actionable);
        if (actionable.length === 0) {
            return {
                content,
                attemptCount: attempt,
                issuesFound: allIssuesFound,
                issuesRemaining: [],
            };
        }
        if (attempt < MAX_ATTEMPTS) {
            content = await reviseContent(content, actionable, ctx);
        }
        else {
            // Last attempt — return best effort, report remaining issues
            return {
                content,
                attemptCount: attempt,
                issuesFound: allIssuesFound,
                issuesRemaining: actionable,
            };
        }
    }
    return { content, attemptCount: MAX_ATTEMPTS, issuesFound: allIssuesFound, issuesRemaining: [] };
}
//# sourceMappingURL=verify-generate.js.map