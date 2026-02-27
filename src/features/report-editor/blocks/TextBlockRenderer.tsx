import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Collaboration from '@tiptap/extension-collaboration';
import { MessageSquare, Check, X, Zap } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import type { TextBlock } from '@/entities/report';
import type { CollabContext } from '../hooks/useCollaboration';

interface TextBlockRendererProps {
  block: TextBlock;
  sectionId?: string;
  readOnly?: boolean;
  collabCtx?: CollabContext;
}

interface CommentState {
  active: boolean;
  selectedText: string;
  from: number;
  to: number;
  draft: string;
}

const EMPTY_COMMENT: CommentState = {
  active: false,
  selectedText: '',
  from: 0,
  to: 0,
  draft: '',
};

const SAVE_DEBOUNCE_MS = 800;

export function TextBlockRenderer({ block, sectionId = '', readOnly = false, collabCtx }: TextBlockRendererProps) {
  const { addReviewNote, updateBlock } = useActiveReportStore();
  const [commentState, setCommentState] = useState<CommentState>(EMPTY_COMMENT);
  const [hasSelection, setHasSelection] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCollabParagraph = block.type === 'paragraph' && !!collabCtx && !readOnly;

  const buildExtensions = () => {
    const base = [
      StarterKit.configure({ history: isCollabParagraph ? false : undefined }),
      Highlight.configure({ multicolor: true }),
    ];

    if (isCollabParagraph && collabCtx) {
      base.push(
        Collaboration.configure({
          document: collabCtx.ydoc,
          field: block.id,
        }),
      );
    }

    return base;
  };

  const editor = useEditor({
    extensions: buildExtensions(),
    content: isCollabParagraph ? undefined : (block.content.html ?? ''),
    editable: isCollabParagraph,
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      setHasSelection(from !== to);
      if (collabCtx) collabCtx.broadcastActiveBlock(from !== to ? block.id : null);
    },
    onUpdate: ({ editor: ed }) => {
      if (!isCollabParagraph) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        updateBlock(
          sectionId,
          block.id,
          { content: { ...block.content, html: ed.getHTML() } },
        );
      }, SAVE_DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    if (!editor || !isCollabParagraph || !collabCtx) return;
    const fragment = collabCtx.ydoc.getXmlFragment(block.id);
    if (!fragment.length && block.content.html) {
      editor.commands.setContent(block.content.html ?? '');
    }
  }, [editor]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleOpenComment = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    setCommentState({ active: true, selectedText, from, to, draft: '' });
    setHasSelection(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [editor]);

  const handleSaveComment = useCallback(() => {
    if (!editor || !commentState.draft.trim()) return;

    const wasEditable = editor.isEditable;
    if (!wasEditable) editor.setEditable(true);
    editor.chain()
      .setTextSelection({ from: commentState.from, to: commentState.to })
      .setHighlight({ color: '#FEF08A' })
      .run();
    if (!wasEditable) editor.setEditable(false);

    addReviewNote({
      blockId: block.id,
      selectedText: commentState.selectedText,
      comment: commentState.draft.trim(),
      createdBy: collabCtx?.userMeta.name ?? 'Denetçi',
    });
    setCommentState(EMPTY_COMMENT);
  }, [editor, commentState, addReviewNote, block.id, collabCtx]);

  const handleCancelComment = useCallback(() => setCommentState(EMPTY_COMMENT), []);

  if (!editor) return null;

  if (block.type === 'heading') {
    const level = block.content.level ?? 2;
    const text = (block.content.html ?? '').replace(/<[^>]+>/g, '');
    if (level === 1) return <h1 className="font-serif text-3xl font-bold mb-6 text-slate-900">{text}</h1>;
    if (level === 2) return <h2 className="font-serif text-2xl font-bold mb-4 text-slate-800">{text}</h2>;
    return <h3 className="font-serif text-xl font-semibold mb-3 text-slate-700">{text}</h3>;
  }

  if (block.type === 'ai_summary') {
    return (
      <div className="border-l-4 border-blue-400 bg-blue-50/60 px-5 py-4 mb-4 rounded-r-xl">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={13} className="text-blue-500" />
          <span className="text-xs font-sans font-semibold uppercase tracking-wider text-blue-600">
            Sentinel Prime AI Özeti
          </span>
        </div>
        <div
          className="font-sans text-sm text-blue-900 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.content.html ?? '' }}
        />
      </div>
    );
  }

  const showCommentBar = !readOnly && (hasSelection || commentState.active);

  return (
    <div className="relative mb-4 group">
      <div
        className={
          'font-serif text-slate-700 leading-relaxed text-base ' +
          '[&_.highlight]:bg-amber-200 [&_.highlight]:rounded-sm ' +
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:cursor-text ' +
          (isCollabParagraph
            ? '[&_.ProseMirror]:min-h-[2rem] [&_.ProseMirror]:focus:ring-0 '
            : '')
        }
      >
        <EditorContent editor={editor} />
      </div>

      {showCommentBar && (
        <div className="mt-1.5 rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
          {!commentState.active ? (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenComment();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors w-full"
            >
              <MessageSquare size={13} className="text-amber-600" />
              Seçili Metne Yorum Ekle
            </button>
          ) : (
            <div className="p-2">
              <p className="text-xs text-slate-500 font-sans mb-1.5 italic truncate">
                &ldquo;{commentState.selectedText}&rdquo;
              </p>
              <textarea
                ref={inputRef}
                value={commentState.draft}
                onChange={(e) => setCommentState((s) => ({ ...s, draft: e.target.value }))}
                placeholder="Yorumunuzu yazın..."
                rows={2}
                className="w-full text-xs font-sans border border-slate-300 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-amber-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSaveComment();
                  if (e.key === 'Escape') handleCancelComment();
                }}
              />
              <div className="flex gap-1.5 mt-1.5 justify-end">
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleCancelComment(); }}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={13} />
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleSaveComment(); }}
                  disabled={!commentState.draft.trim()}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-sans font-semibold transition-colors"
                >
                  <Check size={11} />
                  Kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

