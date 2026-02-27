import { useEditor, EditorContent } from '@tiptap/react';
// DÜZELTME: Vite (ESM) uyumluluğu için tüm TipTap eklentileri Named Export { } olarak çağırıldı
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image as TiptapImage } from '@tiptap/extension-image';

import { 
  Bold, Italic, Underline as UnderlineIcon, Highlighter, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, 
  Table as TableIcon, Image as ImageIcon,
  Plus, Trash2 
} from 'lucide-react';
import clsx from 'clsx';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder = 'Metin girin...', minHeight = 'min-h-[150px]' }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TiptapImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Resim URL\'sini girin:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="w-full border border-slate-300 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all flex flex-col h-full shadow-sm">
      {/* TOOLBAR - WORD BENZERİ GELİŞMİŞ MENÜ */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 shrink-0">
        
        {/* Metin Formatı */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200 shadow-sm">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Kalın"><Bold size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="İtalik"><Italic size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Altı Çizili"><UnderlineIcon size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('highlight') ? 'bg-yellow-100 text-yellow-700' : 'text-slate-600 hover:bg-slate-100')} title="Vurgula"><Highlighter size={15} /></button>
        </div>

        {/* Başlıklar ve Listeler */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200 shadow-sm">
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Başlık 1"><Heading1 size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Başlık 2"><Heading2 size={15} /></button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Madde İşaretleri"><List size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Numaralandırma"><ListOrdered size={15} /></button>
        </div>

        {/* Hizalama */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200 shadow-sm">
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Sola Hizala"><AlignLeft size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Ortala"><AlignCenter size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="Sağa Hizala"><AlignRight size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={clsx('p-1.5 rounded transition-colors', editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100')} title="İki Yana Yasla"><AlignJustify size={15} /></button>
        </div>

        {/* Medya ve Tablo */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200 shadow-sm">
            <button type="button" onClick={addImage} className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors" title="Resim Ekle"><ImageIcon size={15} /></button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors" title="Tablo Ekle"><TableIcon size={15} /></button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1" title="Satır Ekle" disabled={!editor.can().addRowAfter()}><Plus size={15} /> <span className="text-[10px] font-bold">Satır</span></button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1" title="Sütun Ekle" disabled={!editor.can().addColumnAfter()}><Plus size={15} /> <span className="text-[10px] font-bold">Sütun</span></button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors" title="Tabloyu Sil" disabled={!editor.can().deleteTable()}><Trash2 size={15} /></button>
        </div>

      </div>

      {/* EDITOR CONTENT */}
      <EditorContent 
        editor={editor} 
        className={clsx(
          "p-5 prose prose-sm sm:prose-base max-w-none focus:outline-none flex-1 overflow-y-auto cursor-text bg-white prose-td:border prose-td:border-slate-300 prose-th:border prose-th:border-slate-300 prose-th:bg-slate-100 prose-table:w-full prose-table:border-collapse prose-img:rounded-lg",
          minHeight
        )} 
      />
    </div>
  );
};