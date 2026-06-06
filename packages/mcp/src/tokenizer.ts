import { getEncoding } from 'js-tiktoken';

// cl100k_base matches Claude's tokenizer closely enough for estimation
const enc = getEncoding('cl100k_base');

export function countTokens(text: string): number {
  try {
    return enc.encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}
