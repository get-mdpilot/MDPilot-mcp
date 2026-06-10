'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'seo' | 'docs';
  className?: string;
}

export function CopyButton({ text, label = 'Copy', variant = 'seo', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (variant === 'docs') {
    return (
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        className={`flex items-center gap-1 text-[10px] font-mono transition-all cursor-pointer ${
          copied ? 'text-[#34D399]/80' : 'text-white/25 hover:text-white/60'
        } ${className ?? ''}`}
      >
        {copied ? (
          <>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            copied
          </>
        ) : (
          <>
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            copy
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      className={`seo-copy-btn ${className ?? ''}`}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}
