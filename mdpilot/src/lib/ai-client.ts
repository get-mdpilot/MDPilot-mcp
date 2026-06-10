import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export type AIProvider = 'claude' | 'gpt' | 'gemini' | 'groq' | 'nvidia';

export interface AIClientConfig {
  provider: AIProvider;
  model?: string; // override default model per provider
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  claude:  'claude-sonnet-4-6',
  gpt:     'gpt-4o',
  gemini:  'gemini-2.0-flash',
  groq:    'llama-3.3-70b-versatile',
  nvidia:  'meta/llama-3.3-70b-instruct',
};

export async function generateWithProvider(
  config: AIClientConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const { provider } = config;
  const modelId = config.model || DEFAULT_MODELS[provider];

  switch (provider) {
    case 'claude':  return generateClaude(systemPrompt, userMessage, modelId);
    case 'gpt':     return generateGPT(systemPrompt, userMessage, modelId);
    case 'gemini':  return generateGemini(systemPrompt, userMessage, modelId);
    case 'groq':    return generateGroq(systemPrompt, userMessage, modelId);
    case 'nvidia':  return generateNvidia(systemPrompt, userMessage, modelId);
    default:        throw new Error(`Unknown provider: ${provider}`);
  }
}

async function generateClaude(system: string, user: string, model: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model, max_tokens: 4096, system,
    messages: [{ role: 'user', content: user }],
  });
  const text = res.content.find(b => b.type === 'text');
  return text && 'text' in text ? text.text : '';
}

async function generateGPT(system: string, user: string, model: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model, max_tokens: 4096,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return res.choices[0]?.message?.content ?? '';
}

async function generateGemini(system: string, user: string, model: string): Promise<string> {
  const client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? '');
  const genModel = client.getGenerativeModel({ model, systemInstruction: system });
  const res = await genModel.generateContent(user);
  return res.response.text();
}

async function generateGroq(system: string, user: string, model: string): Promise<string> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const res = await client.chat.completions.create({
    model, max_tokens: 4096,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return res.choices[0]?.message?.content ?? '';
}

async function generateNvidia(system: string, user: string, model: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY ?? '',
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });
  const res = await client.chat.completions.create({
    model, max_tokens: 8192,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return res.choices[0]?.message?.content ?? '';
}

// ── Vision (image → text) ────────────────────────────────────────────────────

export type VisionProvider = 'gemini' | 'groq';

// Groq's current multimodal model (llama-3.2-vision-preview was retired).
const GROQ_VISION_MODEL   = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GEMINI_VISION_MODEL = 'gemini-2.0-flash';

async function analyzeWithGroq(
  systemPrompt: string, userMessage: string, imageBase64: string, mimeType: string,
): Promise<string> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await client.chat.completions.create({
    model: GROQ_VISION_MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          { type: 'text', text: `${systemPrompt}\n\n${userMessage}` },
        ],
      },
    ],
  });
  return response.choices[0]?.message?.content ?? '';
}

async function analyzeWithGemini(
  systemPrompt: string, userMessage: string, imageBase64: string, mimeType: string,
): Promise<string> {
  const client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? '');
  const model = client.getGenerativeModel({ model: GEMINI_VISION_MODEL, systemInstruction: systemPrompt });
  const result = await model.generateContent([
    { inlineData: { mimeType, data: imageBase64 } },
    { text: userMessage },
  ]);
  return result.response.text();
}

export async function analyzeImageWithProvider(
  provider: VisionProvider,
  systemPrompt: string,
  userMessage: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  if (provider === 'groq') return analyzeWithGroq(systemPrompt, userMessage, imageBase64, mimeType);
  return analyzeWithGemini(systemPrompt, userMessage, imageBase64, mimeType);
}

// Vision-capable providers that have a configured key
export function getAvailableVisionProviders(): VisionProvider[] {
  const out: VisionProvider[] = [];
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) out.push('gemini');
  if (process.env.GROQ_API_KEY) out.push('groq');
  return out;
}

// Which providers have a configured API key — Groq first so it is the default
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.GROQ_API_KEY)      providers.push('groq');
  if (process.env.NVIDIA_API_KEY)    providers.push('nvidia');
  if (process.env.ANTHROPIC_API_KEY) providers.push('claude');
  if (process.env.OPENAI_API_KEY)    providers.push('gpt');
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) providers.push('gemini');
  return providers;
}

export function getDefaultModel(provider: AIProvider): string {
  return DEFAULT_MODELS[provider];
}
