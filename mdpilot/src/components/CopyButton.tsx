'use client';
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      className="seo-copy-btn"
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}
