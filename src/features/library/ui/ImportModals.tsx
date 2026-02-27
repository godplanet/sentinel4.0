import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, CheckCircle2, Database, Clock, FileText,
  ChevronRight, Plus, Library, History
} from 'lucide-react';
import clsx from 'clsx';

interface LibraryItem {
  id: string;
  title: string;
  category: string;
  score: number;
  lastUsed: string;
  source: 'rkm' | 'template' | 'history';
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: string[]) => void;
  mode: 'rkm' | 'template' | 'history';
  title?: string;
}

const DEMO_ITEMS: LibraryItem[] = [
  { id: '1', title: 'Kredi Surecleri Risk Degerlendirmesi', category: 'Kredi', score: 85, lastUsed: '2025-12-15', source: 'rkm' },
  { id: '2', title: 'BT Altyapi Guvenlik Kontrolleri', category: 'BT', score: 72, lastUsed: '2025-11-20', source: 'rkm' },
  { id: '3', title: 'MASAK Uyumluluk Kontrol Listesi', category: 'Uyumluluk', score: 90, lastUsed: '2025-10-05', source: 'rkm' },
  { id: '4', title: 'Hazine Islemleri Denetim Sablonu', category: 'Finans', score: 68, lastUsed: '2025-09-18', source: 'template' },
  { id: '5', title: 'Sube Denetimi Standart Program', category: 'Operasyon', score: 75, lastUsed: '2025-08-22', source: 'template' },
  { id: '6', title: 'KVKK Degerlendirme Matrisi', category: 'Uyumluluk', score: 82, lastUsed: '2025-07-10', source: 'template' },
  { id: '7', title: '2025 Kredi Denetimi Bulgulari', category: 'Kredi', score: 78, lastUsed: '2025-12-01', source: 'history' },
  { id: '8', title: '2025-Q3 BT Denetim Sonuclari', category: 'BT', score: 65, lastUsed: '2025-09-30', source: 'history' },
  { id: '9', title: 'Operasyonel Risk Gecmis Verileri', category: 'Operasyon', score: 70, lastUsed: '2025-06-15', source: 'history' },
  { id: '10', title: 'Faiz Riski Backtesting Sonuclari', category: 'Finans', score: 88, lastUsed: '2025-11-01', source: 'history' },
];

const MODE_CONFIG = {
  rkm: { title: 'RKM Kutuphane Aktarimi', icon: Database, color: 'from-blue-600 to-blue-700', filterSource: 'rkm' as const },
  template: { title: 'Sablon Aktarimi', icon: FileText, color: 'from-teal-600 to-teal-700', filterSource: 'template' as const },
  history: { title: 'Gecmis Denetim Aktarimi', icon: History, color: 'from-slate-600 to-slate-700', filterSource: 'history' as const },
};

export function ImportModal({ isOpen, onClose, onImport, mode, title }: ImportModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const config = MODE_CONFIG[mode];

  const items = useMemo(() => {
    let filtered = DEMO_ITEMS.filter(i => i.source === config.filterSource);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [search, config.filterSource]);

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const handleImport = () => {
    onImport(Array.from(selected));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className={clsx('bg-gradient-to-r px-6 py-4 rounded-t-2xl flex items-center justify-between', config.color)}>
            <div className="flex items-center gap-3">
              <config.icon size={22} className="text-white" />
              <div>
                <h2 className="text-lg font-bold text-white">{title || config.title}</h2>
                <p className="text-xs text-white/70">{items.length} kayit mevcut</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Kayit ara..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={toggleAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              {selected.size === items.length ? 'Tumunu Kaldir' : 'Tumunu Sec'}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <Library className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm text-slate-500">Kayit bulunamadi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => {
                  const isSelected = selected.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={clsx(
                        'w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3',
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className={clsx(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2',
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                      )}>
                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{item.category}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(item.lastUsed).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>

                      <div className={clsx(
                        'text-xs font-bold px-2 py-1 rounded',
                        item.score >= 80 ? 'bg-red-100 text-red-700' :
                        item.score >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      )}>
                        {item.score}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {selected.size} kayit secildi
            </p>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm">
                Iptal
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-400"
              >
                <Plus size={14} />
                {selected.size} Kaydi Aktar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
