import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export type AIProvider = 'claude' | 'gpt' | 'gemini' | 'groq';

export interface AIClientConfig {
  provider: AIProvider;
  model?: string; // override default model per provider
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  claude: 'claude-sonnet-4-6',
  gpt:    'gpt-4o',
  gemini: 'gemini-2.0-flash',
  groq:   'llama-3.3-70b-versatile',
};

export async function generateWithProvider(
  config: AIClientConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const { provider } = config;
  const modelId = config.model || DEFAULT_MODELS[provider];

  switch (provider) {
    case 'claude': return generateClaude(systemPrompt, userMessage, modelId);
    case 'gpt':    return generateGPT(systemPrompt, userMessage, modelId);
    case 'gemini': return generateGemini(systemPrompt, userMessage, modelId);
    case 'groq':   return generateGroq(systemPrompt, userMessage, modelId);
    default:       throw new Error(`Unknown provider: ${provider}`);
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

// Which providers have a configured API key
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY) providers.push('claude');
  if (process.env.OPENAI_API_KEY)    providers.push('gpt');
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) providers.push('gemini');
  if (process.env.GROQ_API_KEY)      providers.push('groq');
  return providers;
}

export function getDefaultModel(provider: AIProvider): string {
  return DEFAULT_MODELS[provider];
}
