import { useState } from 'react';
import { useAllOfficeDocuments, useCreateDocument } from '@/entities/office';
import type { OfficeDocument } from '@/entities/office';
import {
  Table2, FileText, Plus, Loader2, Search, FolderOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  workpaperId?: string | null;
  onOpen: (doc: OfficeDocument) => void;
}

const defaultSheetContent = {
  cells: {},
  config: { columns: 8, rows: 20, columnWidths: {}, columnHeaders: {} },
  version: 1,
};

const defaultDocContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export function DocumentList({ workpaperId, onOpen }: Props) {
  const { data: docs, isLoading } = useAllOfficeDocuments();
  const createDoc = useCreateDocument();
  const [filter, setFilter] = useState('');
  const [creating, setCreating] = useState<'SPREADSHEET' | 'DOCUMENT' | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const filtered = (docs || []).filter((d) =>
    !filter || d.title.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCreate = async () => {
    if (!creating || !newTitle.trim()) return;
    await createDoc.mutateAsync({
      title: newTitle.trim(),
      docType: creating,
      workpaperId: workpaperId || null,
      createdByName: 'Denetci',
      initialContent: creating === 'SPREADSHEET' ? defaultSheetContent : defaultDocContent,
    });
    setCreating(null);
    setNewTitle('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Belge ara..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={() => setCreating('SPREADSHEET')}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Table2 size={12} />
          Tablo
        </button>
        <button
          onClick={() => setCreating('DOCUMENT')}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText size={12} />
          Belge
        </button>
      </div>

      {creating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            {creating === 'SPREADSHEET' ? (
              <Table2 size={16} className="text-emerald-600" />
            ) : (
              <FileText size={16} className="text-blue-600" />
            )}
            <span className="text-sm font-bold text-slate-700">
              Yeni {creating === 'SPREADSHEET' ? 'Tablo' : 'Belge'}
            </span>
          </div>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Belge adi..."
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setCreating(null); setNewTitle(''); }}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Iptal
            </button>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createDoc.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-40"
            >
              {createDoc.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Olustur
            </button>
          </div>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <FolderOpen size={32} className="mb-2" />
          <span className="text-sm">Henuz belge yok</span>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onOpen(doc)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all group text-left"
            >
              <div className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                doc.doc_type === 'SPREADSHEET' ? 'bg-emerald-100' : 'bg-blue-100',
              )}>
                {doc.doc_type === 'SPREADSHEET'
                  ? <Table2 size={16} className="text-emerald-600" />
                  : <FileText size={16} className="text-blue-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                  {doc.title}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>{doc.doc_type === 'SPREADSHEET' ? 'Tablo' : 'Belge'}</span>
                  <span>-</span>
                  <span>{doc.created_by_name || 'Bilinmiyor'}</span>
                  <span>-</span>
                  <span>{new Date(doc.updated_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
