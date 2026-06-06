import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { SYSTEM_PROMPTS } from './prompts.js';
const client = new Anthropic();
function buildGroundedUserMessage(fileType, ctx) {
    const scriptLines = Object.entries(ctx.scripts)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join('\n');
    const parts = [
        `<project>`,
        `Name: ${ctx.projectName}`,
        `Language: ${ctx.language}`,
        `Stack: ${ctx.detectedStack.join(', ') || 'not detected'}`,
        `Package manager: ${ctx.packageManager}`,
        `Scripts:\n${scriptLines || '  (none)'}`,
        `Top-level structure: ${ctx.structure.join(', ')}`,
        `Existing docs: README=${ctx.hasExistingDocs.readme}, AGENTS=${ctx.hasExistingDocs.agents}, CLAUDE=${ctx.hasExistingDocs.claude}`,
        `</project>`,
    ];
    // Inject full repo source when deep context is available
    const deep = ctx;
    if (deep.packedSummary) {
        parts.push('');
        parts.push('<repo_context>');
        parts.push(deep.packedSummary);
        parts.push('</repo_context>');
    }
    parts.push('');
    parts.push(`Generate ${fileType.toUpperCase()}.md for THIS project.`);
    parts.push(`Use ONLY the real scripts and paths above — never invent commands or file paths.`);
    parts.push(`Output raw markdown only, no preamble.`);
    return parts.join('\n');
}
export async function generateFile(fileType, ctx) {
    const system = SYSTEM_PROMPTS[fileType];
    if (!system)
        throw new Error(`Unknown file type: ${fileType}`);
    const res = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: buildGroundedUserMessage(fileType, ctx) }],
    });
    const text = res.content.find((b) => b.type === 'text');
    return text?.text ?? '';
}
export async function generateTaskFile(taskInput, stack) {
    const system = SYSTEM_PROMPTS.task;
    const userMessage = [
        `<raw_task_input>${taskInput}</raw_task_input>`,
        `<tech_stack>${stack || 'not specified'}</tech_stack>`,
        `Generate a production-grade TASK.md from this task input. Output raw markdown only.`,
    ].join('\n');
    const res = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: userMessage }],
    });
    const text = res.content.find((b) => b.type === 'text');
    return text?.text ?? '';
}
const IMAGE_ANALYSIS_PROMPT = `You are an expert at reverse-engineering images into precise AI image generation prompts.

Analyze the provided image and write a detailed recreation prompt. Cover:
- Subject: main subject(s), position, size, relationships
- Composition: framing, rule of thirds, symmetry, foreground/background
- Lighting: type (natural/studio/artificial), direction, shadows, quality
- Colors: dominant palette (3-5 specific colors with approximate hex), saturation, contrast
- Style: photography style OR artistic movement, era, aesthetic
- Camera: angle (eye-level/overhead/low-angle), lens feel (wide/normal/telephoto/macro), depth of field
- Mood: emotional tone, atmosphere

Then output a single refined prompt under 200 words.
Output ONLY the final prompt — no analysis, no explanation, no preamble.`;
export async function imageToPrompt(imagePath) {
    const data = readFileSync(imagePath);
    const base64 = data.toString('base64');
    const ext = imagePath.split('.').pop()?.toLowerCase();
    const mimeMap = {
        png: 'image/png',
        webp: 'image/webp',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
    };
    const mediaType = (mimeMap[ext ?? ''] ?? 'image/jpeg');
    const res = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: { type: 'base64', media_type: mediaType, data: base64 },
                    },
                    { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
                ],
            },
        ],
    });
    const text = res.content.find((b) => b.type === 'text');
    return text?.text ?? '';
}
//# sourceMappingURL=generate.js.map