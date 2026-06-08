'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { countTokens } from '@/lib/tokenizer';
import { List, Tag, Eye, Code2 } from 'lucide-react';

interface MarkdownEditorProps {
  content:          string;
  onChange:         (newContent: string) => void;
  filename:         string;
  viewMode:         'original' | 'optimized';
  onViewModeChange: (mode: 'original' | 'optimized') => void;
  hasOptimized:     boolean;
  onInsertTOC?:     () => void;
  onToggleBadges?:  () => void;
  showBadgeButton?: boolean;
}

const EDITOR_THEME = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', outline: 'none', background: 'transparent' },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--font-dm-mono, ui-monospace), "Cascadia Code", "Source Code Pro", Menlo, monospace',
  },
  '.cm-content': { padding: '1.25rem', minHeight: '100%' },
  '.cm-gutters': {
    backgroundColor: '#08081200',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    color: 'rgba(240,240,248,0.22)',
    fontSize: '11px',
    paddingRight: '8px',
  },
  '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '8px' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.025)' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(79,172,255,0.12)' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(79,172,255,0.18)' },
  '.cm-cursor': { borderLeftColor: '#4FACFF' },
});

export default function MarkdownEditor({
  content,
  onChange,
  filename,
  viewMode,
  onViewModeChange,
  hasOptimized,
  onInsertTOC,
  onToggleBadges,
  showBadgeButton = false,
}: MarkdownEditorProps) {
  const editorContainerRef  = useRef<HTMLDivElement>(null);
  const editorViewRef       = useRef<EditorView | null>(null);
  const externalContentRef  = useRef<string>(content);
  // Mobile: which pane to show
  const [mobilePane, setMobilePane] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

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
              const next = update.state.doc.toString();
              externalContentRef.current = next;
              onChange(next);
            }
          }),
        ],
      });
      editorViewRef.current = new EditorView({ state: startState, parent: container });
    }

    return () => { editorViewRef.current?.destroy(); editorViewRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const tokens = countTokens(content);
  const hasTools = onInsertTOC || (showBadgeButton && onToggleBadges);

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.08] overflow-hidden bg-[#080812]">

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0a0a16] shrink-0 min-h-[40px]">
        {/* Filename */}
        <span className="text-[12px] font-mono font-medium text-white/50 shrink-0">{filename}</span>

        {/* Tool buttons */}
        {hasTools && (
          <div className="flex items-center gap-1 border-l border-white/[0.07] pl-2 ml-1">
            {onInsertTOC && (
              <button
                onClick={onInsertTOC}
                title="Insert table of contents"
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <List size={12} />
                <span className="hidden sm:inline">TOC</span>
              </button>
            )}
            {showBadgeButton && onToggleBadges && (
              <button
                onClick={onToggleBadges}
                title="Add shields.io badges"
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <Tag size={12} />
                <span className="hidden sm:inline">Badges</span>
              </button>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mobile pane switcher */}
        <div className="flex items-center lg:hidden">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.06]">
            <button
              onClick={() => setMobilePane('edit')}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition-all ${
                mobilePane === 'edit'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Code2 size={11} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setMobilePane('preview')}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md transition-all ${
                mobilePane === 'preview'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Eye size={11} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* View mode toggle (desktop) */}
        {hasOptimized && (
          <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.05]">
            {(['original', 'optimized'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-all capitalize cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/35 hover:text-white/70'
                }`}
              >
                {mode === 'optimized' ? 'Optimized' : 'Original'}
              </button>
            ))}
          </div>
        )}

        {/* Live token count */}
        <span className="text-[11px] font-mono text-white/25 shrink-0 hidden sm:block border-l border-white/[0.06] pl-2">
          {tokens.toLocaleString()} tok
        </span>
      </div>

      {/* ── Split pane ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 'clamp(400px, 60vh, 700px)' }}>

        {/* Editor pane — hidden on mobile when preview is active */}
        <div className={`flex-1 min-w-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-[#080812] ${
          mobilePane === 'preview' ? 'hidden lg:flex' : 'flex flex-col'
        }`}>
          <div ref={editorContainerRef} className="h-full" />
        </div>

        {/* Preview pane — hidden on mobile when edit is active */}
        <div className={`flex-1 min-w-0 overflow-auto bg-white ${
          mobilePane === 'edit' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="md-preview text-[14px] p-6 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
