import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
function resolve() {
    if (process.env.GROQ_API_KEY) {
        return {
            kind: 'compat',
            client: new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' }),
            model: 'llama-3.3-70b-versatile',
            visionModel: 'llama-3.2-90b-vision-preview',
        };
    }
    if (process.env.NVIDIA_API_KEY) {
        return {
            kind: 'compat',
            client: new OpenAI({ apiKey: process.env.NVIDIA_API_KEY, baseURL: 'https://integrate.api.nvidia.com/v1' }),
            model: 'meta/llama-3.3-70b-instruct',
            visionModel: 'meta/llama-3.2-90b-vision-instruct',
        };
    }
    if (process.env.ANTHROPIC_API_KEY) {
        return { kind: 'anthropic', client: new Anthropic() };
    }
    if (process.env.OPENAI_API_KEY) {
        return {
            kind: 'compat',
            client: new OpenAI(),
            model: 'gpt-4o',
            visionModel: 'gpt-4o',
        };
    }
    throw new Error('MDPilot MCP: no AI provider key found.\n' +
        'Add ONE of these to your MCP server env config:\n' +
        '  GROQ_API_KEY    — free tier at console.groq.com\n' +
        '  NVIDIA_API_KEY  — free tier at build.nvidia.com\n' +
        '  ANTHROPIC_API_KEY\n' +
        '  OPENAI_API_KEY');
}
export async function generateText(system, user, maxTokens = 4096) {
    const p = resolve();
    if (p.kind === 'anthropic') {
        const res = await p.client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: maxTokens,
            system,
            messages: [{ role: 'user', content: user }],
        });
        const block = res.content.find(b => b.type === 'text');
        return block?.type === 'text' ? block.text : '';
    }
    const res = await p.client.chat.completions.create({
        model: p.model,
        max_tokens: maxTokens,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
    });
    return res.choices[0]?.message?.content ?? '';
}
export async function generateVision(base64, mediaType, prompt) {
    const p = resolve();
    if (p.kind === 'anthropic') {
        const mt = mediaType;
        const res = await p.client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            messages: [{
                    role: 'user',
                    content: [
                        { type: 'image', source: { type: 'base64', media_type: mt, data: base64 } },
                        { type: 'text', text: prompt },
                    ],
                }],
        });
        const block = res.content.find(b => b.type === 'text');
        return block?.type === 'text' ? block.text : '';
    }
    const res = await p.client.chat.completions.create({
        model: p.visionModel,
        max_tokens: 1024,
        messages: [{
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
                    { type: 'text', text: prompt },
                ],
            }],
    });
    return res.choices[0]?.message?.content ?? '';
}
//# sourceMappingURL=ai-provider.js.map