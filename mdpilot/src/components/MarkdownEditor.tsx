'use client';

import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { countTokens } from '@/lib/tokenizer';

interface MarkdownEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  filename: string;
  viewMode: 'original' | 'optimized';
  onViewModeChange: (mode: 'original' | 'optimized') => void;
  hasOptimized: boolean;
}

const EDITOR_THEME = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', outline: 'none' },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace' },
  '.cm-content': { padding: '1rem', minHeight: '100%' },
  '.cm-gutters': {
    backgroundColor: '#0a0a14',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(240,240,248,0.28)',
    fontSize: '11px',
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.03)' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(37,99,235,0.12)' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(37,99,235,0.18)' },
  '.cm-cursor': { borderLeftColor: 'var(--md-blue)' },
});

export default function MarkdownEditor({
  content,
  onChange,
  filename,
  viewMode,
  onViewModeChange,
  hasOptimized,
}: MarkdownEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef      = useRef<EditorView | null>(null);
  // Track content that came from outside (prop) to avoid echo loops
  const externalContentRef = useRef<string>(content);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    // If the content changed externally (tab switch / toggle), rebuild the editor
    if (editorViewRef.current && content !== externalContentRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }

    if (!editorViewRef.current) {
      externalContentRef.current = content;

      const startState = EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          markdown(),
          EditorView.lineWrapping,
          EDITOR_THEME,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newContent = update.state.doc.toString();
              externalContentRef.current = newContent;
              onChange(newContent);
            }
          }),
        ],
      });

      editorViewRef.current = new EditorView({
        state: startState,
        parent: container,
      });
    }

    return () => {
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const tokens = countTokens(content);

  return (
    <div className="flex flex-col rounded-xl border border-[var(--md-border)] overflow-hidden bg-[var(--md-surface)]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--md-border)] bg-[var(--md-surface)] shrink-0">
        {/* Filename */}
        <span className="text-xs font-mono font-semibold text-[var(--md-text)]">{filename}</span>

        {/* Original / Optimized toggle */}
        {hasOptimized && (
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5">
            {(['original', 'optimized'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-white/10 text-[var(--md-text)] shadow-sm font-medium'
                    : 'text-[var(--md-text-secondary)] hover:text-[var(--md-text)]'
                }`}
              >
                {mode === 'optimized' ? 'Optimized ✓' : 'Original'}
              </button>
            ))}
          </div>
        )}

        {/* Live token count */}
        <span className="text-[11px] font-mono text-[var(--md-text-tertiary)] shrink-0">
          {tokens.toLocaleString()} tokens
        </span>
      </div>

      {/* Split pane */}
      <div className="flex flex-col lg:flex-row min-h-[400px] flex-1">
        {/* Left — CodeMirror editor */}
        <div className="flex-1 min-w-0 min-h-[300px] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--md-border)]">
          <div ref={editorContainerRef} className="h-full" />
        </div>

        {/* Right — Rendered preview (always white so prose is readable) */}
        <div className="flex-1 min-w-0 min-h-[300px] lg:min-h-0 overflow-auto p-6 bg-white">
          <div className="md-preview text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
