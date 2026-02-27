import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, FileSignature, CheckCircle2, Clock, AlertCircle,
  Calendar, Filter, ChevronDown, User
} from 'lucide-react';
import { fetchAuditorDeclarations } from '@/entities/governance';
import type { AuditorDeclaration } from '@/entities/governance/model/types';
import { DeclarationForm } from '@/widgets/DeclarationForm';

type ViewMode = 'form' | 'history';

const DECLARATION_LABELS: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  INDEPENDENCE: { label: 'Bagimsizlik Beyani', color: 'blue', icon: Shield },
  CONFLICT_OF_INTEREST: { label: 'Cikar Catismasi Beyani', color: 'orange', icon: AlertCircle },
  CODE_OF_CONDUCT: { label: 'Etik Kurallar Beyani', color: 'green', icon: FileSignature },
};

export function DeclarationsPanel() {
  const [view, setView] = useState<ViewMode>('form');
  const [declarations, setDeclarations] = useState<AuditorDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadDeclarations = useCallback(async () => {
    try {
      setLoading(true);
      const filters: { period_year?: number; declaration_type?: string } = {
        period_year: filterYear,
      };
      if (filterType !== 'ALL') {
        filters.declaration_type = filterType;
      }
      const data = await fetchAuditorDeclarations(filters);
      setDeclarations(data);
    } catch (err) {
      console.error('Failed to load declarations:', err);
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterType]);

  useEffect(() => {
    loadDeclarations();
  }, [loadDeclarations]);

  const handleDeclarationSuccess = () => {
    loadDeclarations();
    setView('history');
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const stats = {
    total: declarations.length,
    independence: declarations.filter(d => d.declaration_type === 'INDEPENDENCE').length,
    conflict: declarations.filter(d => d.declaration_type === 'CONFLICT_OF_INTEREST').length,
    conduct: declarations.filter(d => d.declaration_type === 'CODE_OF_CONDUCT').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600">Toplam Beyan</span>
            <FileSignature className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">{filterYear} donemi</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600">Bagimsizlik</span>
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.independence}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600">Cikar Catismasi</span>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.conflict}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600">Etik Kurallar</span>
            <FileSignature className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.conduct}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex shadow-sm">
        <button
          onClick={() => setView('form')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'form'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSignature size={16} />
          Yeni Beyan Imzala
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock size={16} />
          Imzalanan Beyanlar
        </button>
      </div>

      {view === 'form' && (
        <DeclarationForm onSuccess={handleDeclarationSuccess} />
      )}

      {view === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">Imzalanan Beyanlar</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-500" />
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium"
                >
                  <option value="ALL">Tumu</option>
                  <option value="INDEPENDENCE">Bagimsizlik</option>
                  <option value="CONFLICT_OF_INTEREST">Cikar Catismasi</option>
                  <option value="CODE_OF_CONDUCT">Etik Kurallar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : declarations.length === 0 ? (
              <div className="text-center py-12">
                <FileSignature className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-slate-600 font-medium">Bu donem icin beyan bulunamadi</p>
                <p className="text-sm text-slate-500 mt-1">Yeni beyan imzalamak icin "Yeni Beyan Imzala" sekmesine gecin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {declarations.map((dec, idx) => {
                  const config = DECLARATION_LABELS[dec.declaration_type] || DECLARATION_LABELS.INDEPENDENCE;
                  const Icon = config.icon;
                  const colorMap: Record<string, string> = {
                    blue: 'bg-blue-100 text-blue-700',
                    orange: 'bg-orange-100 text-orange-700',
                    green: 'bg-green-100 text-green-700',
                  };
                  const colorCls = colorMap[config.color] || colorMap.blue;

                  return (
                    <motion.div
                      key={dec.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorCls.split(' ')[0]}`}>
                            <Icon size={18} className={colorCls.split(' ')[1]} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{config.label}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {dec.period_year}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(dec.signed_at).toLocaleDateString('tr-TR')}
                              </span>
                              {dec.signature_hash && (
                                <span className="font-mono text-slate-400">
                                  #{dec.signature_hash.slice(0, 8)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                          <CheckCircle2 size={14} />
                          Imzalandi
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
