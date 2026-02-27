import { useState, useEffect } from 'react';
import { X, Search, BookOpen, CheckCircle, Scale, FileText, Shield, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

interface Regulation {
  id: string;
  code: string;
  title: string;
  category: 'BDDK' | 'TCMB' | 'MASAK' | 'SPK' | 'KVKK' | 'DIGER';
  article?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface RegulationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (regulation: Regulation) => void;
}

const CATEGORY_CONFIG = {
  BDDK: { label: 'BDDK', color: 'blue', icon: Shield },
  TCMB: { label: 'TCMB', color: 'green', icon: Scale },
  MASAK: { label: 'MASAK', color: 'red', icon: FileText },
  SPK: { label: 'SPK', color: 'purple', icon: BookOpen },
  KVKK: { label: 'KVKK', color: 'orange', icon: Shield },
  DIGER: { label: 'Diğer', color: 'slate', icon: FileText },
};

const SEVERITY_CONFIG = {
  critical: { label: 'Kritik', color: 'red' },
  high: { label: 'Yüksek', color: 'orange' },
  medium: { label: 'Orta', color: 'yellow' },
  low: { label: 'Düşük', color: 'blue' },
};

export function RegulationSelectorModal({ isOpen, onClose, onSelect }: RegulationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRegulations();
    }
  }, [isOpen]);

  const loadRegulations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_regulations')
        .select('id, code, title, category, article, description, severity')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;

      setRegulations(data || []);
    } catch (error) {
      console.error('Error loading regulations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRegulations = regulations.filter((reg) => {
    const matchesSearch =
      searchQuery === '' ||
      reg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.article?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || reg.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (regulation: Regulation) => {
    onSelect(regulation);
    onClose();
  };

  const categoryCounts = regulations.reduce((acc, reg) => {
    acc[reg.category] = (acc[reg.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" />
              Mevzuat Kütüphanesi
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Türk Bankacılık Sektörü Yasal Çerçevesi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mevzuat ara... (ör: 'Bilgi Sistemleri', 'KYC', 'MASAK')"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Tümü ({regulations.length})
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
              const count = categoryCounts[key] || 0;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedCategory === key
                      ? `bg-${cfg.color}-600 text-white`
                      : `bg-${cfg.color}-100 text-${cfg.color}-700 hover:bg-${cfg.color}-200`
                  )}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Regulations List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto text-slate-400 mb-3 animate-spin" size={48} />
              <p className="text-slate-500 font-medium">Mevzuatlar yükleniyor...</p>
            </div>
          ) : filteredRegulations.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 font-medium">Mevzuat bulunamadı</p>
              <p className="text-sm text-slate-400 mt-1">
                Farklı anahtar kelimeler deneyin
              </p>
            </div>
          ) : (
            filteredRegulations.map((reg) => {
              const catConfig = CATEGORY_CONFIG[reg.category];
              const sevConfig = SEVERITY_CONFIG[reg.severity];
              const Icon = catConfig.icon;

              return (
                <button
                  key={reg.id}
                  onClick={() => handleSelect(reg)}
                  className="w-full text-left border-2 border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${catConfig.color}-100 shrink-0`}>
                      <Icon className={`text-${catConfig.color}-600`} size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded bg-${catConfig.color}-100 text-${catConfig.color}-700`}
                        >
                          {catConfig.label}
                        </span>
                        {reg.article && (
                          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {reg.article}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded bg-${sevConfig.color}-100 text-${sevConfig.color}-700`}
                        >
                          {sevConfig.label}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                        {reg.title}
                      </h4>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {reg.description}
                      </p>
                    </div>

                    <CheckCircle className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" size={20} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-500 text-center">
            {loading ? 'Yükleniyor...' : `${filteredRegulations.length} mevzuat gösteriliyor`}
            {searchQuery && ` (Arama: "${searchQuery}")`}
          </p>
        </div>
      </div>
    </div>
  );
}
