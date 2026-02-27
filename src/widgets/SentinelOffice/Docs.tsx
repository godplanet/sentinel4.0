import { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Quote, Highlighter,
  Minus, Maximize2, Minimize2, Save, Cloud, CloudOff, Check, Loader2,
  FileText, Variable, ChevronDown, ChevronRight, GripVertical,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { SMART_VARIABLES, VARIABLE_CATEGORIES, resolveVariablesInText } from './smart-variables';
import { useSheetAutoSave, useCryoSave } from './useSheetAutoSave';
import type { SmartVariable } from './types';

interface SentinelDocsProps {
  reportId: string | null;
  documentId?: string | null;
  initialContent?: any;
  onContentChange?: (json: any) => void;
  onFullScreen?: () => void;
  isFullScreen?: boolean;
  editable?: boolean;
}

export function SentinelDocs({
  reportId,
  documentId,
  initialContent,
  onContentChange,
  onFullScreen,
  isFullScreen,
  editable = true,
}: SentinelDocsProps) {
  const [showVariables, setShowVariables] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['audit', 'finding']));
  const [manualSaved, setManualSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedVar, setDraggedVar] = useState<SmartVariable | null>(null);

  const legacySave = useSheetAutoSave(reportId && !documentId ? reportId : null, {
    table: 'reports',
    column: 'smart_content',
    delay: 30000,
  });

  const cryoSave = useCryoSave({
    documentId: documentId || null,
    createdByName: 'Denetci',
    delay: 30000,
  });

  const autoSave = documentId ? cryoSave.save : legacySave.save;
  const saveNow = documentId
    ? (data: any) => cryoSave.saveNow(data as Record<string, unknown>)
    : legacySave.saveNow;
  const saving = documentId ? cryoSave.saving : legacySave.saving;
  const lastSaved = documentId ? cryoSave.lastSaved : legacySave.lastSaved;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Rapor icerigini yazmaya baslayin...' }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent || { type: 'doc', content: [{ type: 'paragraph' }] },
    editable,
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      onContentChange?.(json);
      autoSave(json);
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[400px] px-10 py-8',
      },
      handleDrop: (view, event) => {
        const varData = event.dataTransfer?.getData('application/smart-variable');
        if (varData) {
          event.preventDefault();
          try {
            const variable = JSON.parse(varData) as SmartVariable;
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (pos) {
              const { schema } = view.state;
              const chipText = `[${variable.label}]`;
              const mark = schema.marks.highlight?.create({ color: '#dbeafe' });
              const textNode = mark
                ? schema.text(chipText, [mark])
                : schema.text(chipText);
              const tr = view.state.tr.insert(pos.pos, textNode);
              view.dispatch(tr);
            }
          } catch {
            /* ignore */
          }
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(initialContent);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(editable && !previewMode);
  }, [editable, previewMode, editor]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/smart-variable')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const insertVariable = (variable: SmartVariable) => {
    if (!editor) return;
    const chipText = `[${variable.label}]`;
    editor.chain().focus().insertContent(chipText).run();
  };

  const handleManualSave = async () => {
    if (!editor) return;
    await saveNow(editor.getJSON());
    setManualSaved(true);
    setTimeout(() => setManualSaved(false), 2000);
  };

  const handlePreviewToggle = () => {
    if (!editor) return;
    if (!previewMode) {
      setPreviewMode(true);
    } else {
      setPreviewMode(false);
    }
  };

  if (!editor) return null;

  return (
    <div className={clsx('flex flex-col bg-white', isFullScreen ? 'fixed inset-0 z-[200]' : 'h-full')}>
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Sentinel Docs</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">SMART</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mr-1">
            {saving ? (
              <>
                <Cloud size={12} className="animate-pulse text-blue-500" />
                <span>Kaydediliyor...</span>
              </>
            ) : lastSaved ? (
              <>
                <Cloud size={12} className="text-green-500" />
                <span>{lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : (
              <>
                <CloudOff size={12} />
                <span>Kaydedilmedi</span>
              </>
            )}
          </div>

          <button
            onClick={handlePreviewToggle}
            className={clsx(
              'px-2 py-1 rounded-lg text-[10px] font-bold transition-colors border',
              previewMode ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            )}
          >
            {previewMode ? 'Duzenle' : 'Onizleme'}
          </button>

          <button
            onClick={() => setShowVariables(!showVariables)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors border',
              showVariables ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            )}
          >
            <Variable size={12} />
            Degiskenler
          </button>

          <button
            onClick={handleManualSave}
            disabled={saving}
            className={clsx(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              manualSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : manualSaved ? <Check size={12} /> : <Save size={12} />}
            {manualSaved ? 'Kaydedildi' : 'Kaydet'}
          </button>

          {onFullScreen && (
            <button
              onClick={onFullScreen}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      {editable && !previewMode && (
        <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-1.5 flex items-center gap-1 flex-wrap">
          <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
            <Highlighter size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight size={15} />
          </ToolBtn>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={15} />
          </ToolBtn>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto bg-slate-50" onDragOver={handleDragOver}>
          <div className={clsx(
            'mx-auto bg-white shadow-sm border border-slate-200 min-h-[600px]',
            isFullScreen ? 'max-w-[900px] my-8 rounded-xl' : 'my-4 rounded-lg max-w-full'
          )}>
            {editable && !previewMode && (
              <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                <div className="bg-slate-900 rounded-xl shadow-2xl flex items-center gap-0.5 px-1.5 py-1">
                  <BubbleBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold size={14} />
                  </BubbleBtn>
                  <BubbleBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic size={14} />
                  </BubbleBtn>
                  <BubbleBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <UnderlineIcon size={14} />
                  </BubbleBtn>
                  <BubbleBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
                    <Highlighter size={14} />
                  </BubbleBtn>
                </div>
              </BubbleMenu>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>

        <AnimatePresence>
          {showVariables && editable && !previewMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 border-l border-slate-200 bg-white overflow-hidden"
            >
              <div className="w-[240px] h-full flex flex-col">
                <div className="px-3 py-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Variable size={14} className="text-blue-600" />
                    Akilli Degiskenler
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Surekle-birak veya tikla
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {VARIABLE_CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategories.has(cat.key);
                    const vars = SMART_VARIABLES.filter(v => v.category === cat.key);

                    return (
                      <div key={cat.key}>
                        <button
                          onClick={() => toggleCategory(cat.key)}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <span>{cat.label}</span>
                          <span className="ml-auto text-[10px] text-slate-400">{vars.length}</span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-2 space-y-0.5 pb-1">
                                {vars.map((variable) => (
                                  <div
                                    key={variable.key}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('application/smart-variable', JSON.stringify(variable));
                                      setDraggedVar(variable);
                                    }}
                                    onDragEnd={() => setDraggedVar(null)}
                                    onClick={() => insertVariable(variable)}
                                    className={clsx(
                                      'flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all text-[11px] group',
                                      `hover:bg-${cat.color}-50 border border-transparent hover:border-${cat.color}-200`,
                                      draggedVar?.key === variable.key && 'opacity-50'
                                    )}
                                  >
                                    <GripVertical size={10} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
                                    <span className={clsx(
                                      'font-mono text-[10px] px-1.5 py-0.5 rounded',
                                      `bg-${cat.color}-100 text-${cat.color}-700`
                                    )}>
                                      [{variable.label}]
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BubbleBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx('p-1.5 rounded-lg transition-colors', active ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10')}
    >
      {children}
    </button>
  );
}

function ToolBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx('p-1.5 rounded-lg transition-colors', active ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')}
    >
      {children}
    </button>
  );
}
