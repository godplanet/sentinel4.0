import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { X, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

type ReaderTheme = 'paper' | 'dark' | 'light';
type ReaderFont = 'serif' | 'sans';

interface ZenReaderProps {
  content: any;
  title: string;
  onClose: () => void;
}

export function ZenReader({ content, title, onClose }: ZenReaderProps) {
  const [theme, setTheme] = useState<ReaderTheme>('paper');
  const [font, setFont] = useState<ReaderFont>('serif');
  const [warmth, setWarmth] = useState(20);
  const [showSettings, setShowSettings] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: { class: 'tiptap focus:outline-none' },
    },
  });

  const themeStyles: Record<ReaderTheme, string> = {
    paper: 'bg-[#fdf6e3] text-[#3b3228]',
    dark: 'bg-[#1a1a2e] text-[#d4d4d8]',
    light: 'bg-white text-slate-900',
  };

  const fontClass = font === 'serif' ? 'font-[Merriweather]' : 'font-sans';
  const warmthFilter = theme === 'paper' ? `sepia(${warmth}%)` : 'none';

  return (
    <div
      className={clsx('fixed inset-0 z-[100] transition-colors duration-500', themeStyles[theme])}
      style={{ filter: warmthFilter }}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={clsx(
            'p-2.5 rounded-xl transition-all',
            theme === 'dark' ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-black/5 text-slate-500 hover:bg-black/10'
          )}
        >
          <SlidersHorizontal size={18} />
        </button>
        <button
          onClick={onClose}
          className={clsx(
            'p-2.5 rounded-xl transition-all',
            theme === 'dark' ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-black/5 text-slate-500 hover:bg-black/10'
          )}
        >
          <X size={18} />
        </button>
      </div>

      {showSettings && (
        <div
          className={clsx(
            'absolute top-16 right-4 w-72 rounded-2xl shadow-2xl border p-5 z-10 space-y-5',
            theme === 'dark' ? 'bg-[#252547] border-white/10' : 'bg-white border-slate-200'
          )}
        >
          <div>
            <label className={clsx('text-[10px] font-bold uppercase tracking-wider mb-2 block', theme === 'dark' ? 'text-white/50' : 'text-slate-500')}>
              Tema
            </label>
            <div className="flex gap-2">
              {([
                { key: 'paper' as const, label: 'Kagit', icon: Sun, color: 'bg-[#fdf6e3] border-amber-300' },
                { key: 'light' as const, label: 'Acik', icon: Sun, color: 'bg-white border-slate-300' },
                { key: 'dark' as const, label: 'Koyu', icon: Moon, color: 'bg-[#1a1a2e] border-slate-600' },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={clsx(
                    'flex-1 py-2 rounded-lg border-2 text-[10px] font-bold transition-all',
                    theme === t.key ? t.color + ' ring-2 ring-blue-400' : 'border-transparent bg-slate-100/50',
                    theme === 'dark' && theme !== t.key ? 'text-white/60' : ''
                  )}
                >
                  <t.icon size={14} className="mx-auto mb-1" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={clsx('text-[10px] font-bold uppercase tracking-wider mb-2 block', theme === 'dark' ? 'text-white/50' : 'text-slate-500')}>
              Yazi Tipi
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFont('serif')}
                className={clsx(
                  'flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all font-[Merriweather]',
                  font === 'serif' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                )}
              >
                Serif
              </button>
              <button
                onClick={() => setFont('sans')}
                className={clsx(
                  'flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all font-sans',
                  font === 'sans' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                )}
              >
                Sans
              </button>
            </div>
          </div>

          {theme === 'paper' && (
            <div>
              <label className={clsx('text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between', 'text-slate-500')}>
                <span>Sicaklik</span>
                <span className="text-blue-600">{warmth}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={60}
                value={warmth}
                onChange={(e) => setWarmth(Number(e.target.value))}
                className="w-full h-1.5 bg-gradient-to-r from-blue-200 to-amber-300 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      <div className={clsx('h-full overflow-auto', fontClass)}>
        <div className="max-w-3xl mx-auto px-8 py-16">
          <h1
            className={clsx(
              'text-3xl font-bold mb-8 pb-6 border-b leading-tight',
              theme === 'dark' ? 'border-white/10' : 'border-slate-200',
              font === 'serif' ? 'font-[Merriweather]' : ''
            )}
          >
            {title}
          </h1>

          <div className={clsx('leading-[1.8] text-base', font === 'serif' ? 'font-[Merriweather]' : '')}>
            {editor && <EditorContent editor={editor} />}
          </div>
        </div>
      </div>
    </div>
  );
}
