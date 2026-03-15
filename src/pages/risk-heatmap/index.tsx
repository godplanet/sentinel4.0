import {
 useCreateAssessment,
 useHeatmapData,
 useRiskDefinitions
} from '@/entities/risk/heatmap-api';
import type { CreateAssessmentInput } from '@/entities/risk/heatmap-types';
import { useAuditEntities } from '@/entities/universe';
import { PageHeader } from '@/shared/ui';
import { StrategicHeatmap } from '@/widgets/StrategicHeatmap';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Grid3x3,
  Loader2,
  Plus,
  Shield,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type RiskCat = 'org' | 'proc' | 'prod' | 'sub' | 'tp';
type SortCol = 'name' | 'inherent' | 'residual' | 'control';

function pathToImpact(path: string): number {
  if (/^org\.(vk|hq)\.(kredi|hazine|it)/.test(path)) return 5;
  if (/^org\.(vk|hq)\./.test(path)) return 4;
  if (/^proc\.kredi/.test(path)) return 5;
  if (/^proc\./.test(path)) return 4;
  if (/^prod\./.test(path)) return 3;
  if (/^sub\./.test(path)) return 3;
  if (/^tp\./.test(path)) return 4;
  return 3;
}

function scoreToLikelihood(score: number): number {
  if (score >= 81) return 1;
  if (score >= 61) return 2;
  if (score >= 41) return 3;
  if (score >= 21) return 4;
  return 5;
}

function pathToCategory(path: string): RiskCat {
  if (path.startsWith('proc.')) return 'proc';
  if (path.startsWith('prod.')) return 'prod';
  if (path.startsWith('sub.')) return 'sub';
  if (path.startsWith('tp.')) return 'tp';
  return 'org';
}

const CAT_META: Record<RiskCat, { label: string; cls: string }> = {
  org:  { label: 'Organizasyon', cls: 'bg-sky-100 text-sky-700' },
  proc: { label: 'Süreç',        cls: 'bg-amber-100 text-amber-700' },
  prod: { label: 'Ürün',         cls: 'bg-emerald-100 text-emerald-700' },
  sub:  { label: 'Şube',         cls: 'bg-rose-100 text-rose-700' },
  tp:   { label: 'Üçüncü Taraf', cls: 'bg-violet-100 text-violet-700' },
};

function inherent(impact: number, lh: number) { return impact * lh; }
function residual(impact: number, lh: number, ctrl: number) {
  return Math.round(impact * lh * (1 - ctrl / 100) * 10) / 10;
}
function riskLevel(score: number) {
  if (score >= 15) return { label: 'Kritik', cls: 'bg-red-100 text-red-800 border-red-300' };
  if (score >= 10) return { label: 'Yüksek', cls: 'bg-orange-100 text-orange-800 border-orange-300' };
  if (score >= 5)  return { label: 'Orta',   cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  return               { label: 'Düşük',  cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}

function EntityRiskTable() {
  const { data: entities = [], isLoading: entLoading } = useAuditEntities();
  const [sortCol, setSortCol] = useState<SortCol>('inherent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterCat, setFilterCat] = useState<RiskCat | 'all'>('all');

  const allRows = useMemo(() => entities.map(e => ({
    id: e.id,
    name: e.name,
    category: pathToCategory(e.path || ''),
    impact: pathToImpact(e.path || ''),
    likelihood: scoreToLikelihood(e.risk_score ?? 50),
    control: Math.round(Math.max(10, Math.min(90, 100 - (e.risk_score ?? 50)))),
    trend: 'stable' as const,
  })), [entities]);

  const rows = useMemo(() => {
    const filtered = filterCat === 'all'
      ? [...allRows]
      : allRows.filter(r => r.category === filterCat);
    return filtered.sort((a, b) => {
      let va = 0, vb = 0;
      if (sortCol === 'name') return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortCol === 'inherent') { va = inherent(a.impact, a.likelihood); vb = inherent(b.impact, b.likelihood); }
      if (sortCol === 'residual') { va = residual(a.impact, a.likelihood, a.control); vb = residual(b.impact, b.likelihood, b.control); }
      if (sortCol === 'control')  { va = a.control; vb = b.control; }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [sortCol, sortDir, filterCat, allRows]);

  const toggle = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };
  const SortIco = ({ col }: { col: SortCol }) =>
    sortCol === col ? (sortDir === 'desc' ? <ChevronDown size={11} className="inline ml-0.5" /> : <ChevronUp size={11} className="inline ml-0.5" />) : null;

  if (entLoading) return (
    <div className="bg-surface border border-slate-200 rounded-xl shadow-sm flex items-center justify-center py-8">
      <Loader2 className="animate-spin text-slate-400" size={20} />
    </div>
  );

  return (
    <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Varlık Risk Skorları</span>
          <span className="text-xs text-slate-400">({rows.length} varlık)</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'org', 'proc', 'prod', 'sub', 'tp'] as const).map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={clsx('px-2 py-0.5 rounded text-[10px] font-bold border transition-all',
                filterCat === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
              )}>
              {cat === 'all' ? 'Tümü' : CAT_META[cat].label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500">
              <th className="text-left px-3 py-2 font-semibold cursor-pointer hover:text-slate-700" onClick={() => toggle('name')}>Varlık <SortIco col="name" /></th>
              <th className="text-left px-3 py-2 font-semibold">Kategori</th>
              <th className="text-center px-3 py-2 font-semibold">Etki</th>
              <th className="text-center px-3 py-2 font-semibold">Olasılık</th>
              <th className="text-center px-3 py-2 font-semibold cursor-pointer hover:text-slate-700" onClick={() => toggle('inherent')}>Ham Risk <SortIco col="inherent" /></th>
              <th className="text-center px-3 py-2 font-semibold cursor-pointer hover:text-slate-700" onClick={() => toggle('control')}>Kontrol % <SortIco col="control" /></th>
              <th className="text-center px-3 py-2 font-semibold cursor-pointer hover:text-slate-700" onClick={() => toggle('residual')}>Kalıntı <SortIco col="residual" /></th>
              <th className="text-center px-3 py-2 font-semibold">Seviye</th>
              <th className="text-center px-3 py-2 font-semibold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const inh = inherent(row.impact, row.likelihood);
              const res = residual(row.impact, row.likelihood, row.control);
              const lvl = riskLevel(inh);
              const cat = CAT_META[row.category as RiskCat];
              return (
                <tr key={row.id} className={clsx('border-b border-slate-50 hover:bg-blue-50/30 transition-colors', i % 2 !== 0 && 'bg-slate-50/30')}>
                  <td className="px-3 py-2 font-medium text-slate-700">{row.name}</td>
                  <td className="px-3 py-2"><span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-bold', cat.cls)}>{cat.label}</span></td>
                  <td className="px-3 py-2 text-center font-bold text-slate-700">{row.impact}<span className="text-slate-300">/5</span></td>
                  <td className="px-3 py-2 text-center font-bold text-slate-700">{row.likelihood}<span className="text-slate-300">/5</span></td>
                  <td className="px-3 py-2 text-center">
                    <span className={clsx('font-black text-sm', inh >= 15 ? 'text-red-600' : inh >= 10 ? 'text-orange-600' : inh >= 5 ? 'text-amber-600' : 'text-emerald-600')}>{inh}</span>
                    <span className="text-slate-300">/25</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 justify-center">
                      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: row.control + '%' }} />
                      </div>
                      <span className="font-medium text-slate-600">%{row.control}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={clsx('font-bold text-sm', res >= 7 ? 'text-red-600' : res >= 4 ? 'text-amber-600' : 'text-emerald-600')}>{res.toFixed(1)}</span>
                  </td>
                  <td className="px-3 py-2 text-center"><span className={clsx('px-1.5 py-0.5 rounded border text-[10px] font-bold', lvl.cls)}>{lvl.label}</span></td>
                  <td className="px-3 py-2 text-center text-base leading-none">
                    {row.trend === 'up' ? <span className="text-red-500">↑</span> : row.trend === 'down' ? <span className="text-emerald-500">↓</span> : <span className="text-slate-400">→</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RiskHeatmapPage() {
 const { data: assessments = [], isLoading } = useHeatmapData();
 const { data: riskDefs = [] } = useRiskDefinitions();
 const { data: entities = [] } = useAuditEntities();

 const [selectedCategory, setSelectedCategory] = useState('Tumu');
 const [showNewModal, setShowNewModal] = useState(false);

 const categories = useMemo(() => {
 const cats = new Set((assessments || []).map(a => a.risk_category));
 return ['Tumu', ...Array.from(cats).sort()];
 }, [assessments]);

 if (isLoading) {
 return (
 <div className="h-screen flex items-center justify-center bg-canvas">
 <Loader2 className="animate-spin text-slate-400" size={32} />
 </div>
 );
 }

 return (
 <div className="h-screen flex flex-col bg-canvas">
 <PageHeader
 title="Risk Isi Haritasi"
 subtitle={`Stratejik Radar & 5x5 Matris - ${assessments.length} canli degerlendirme`}
 icon={Grid3x3}
 />

 <div className="flex-1 overflow-auto p-4">
 <div className="flex flex-wrap items-center gap-4 mb-4">
 <div className="flex items-center gap-2">
 <Filter size={14} className="text-slate-500" />
 <div className="flex bg-surface border border-slate-200 p-0.5 rounded-lg shadow-sm flex-wrap">
 {(categories || []).map(cat => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={clsx(
 'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
 selectedCategory === cat
 ? 'bg-blue-600 text-white'
 : 'text-slate-600 hover:bg-canvas'
 )}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 <button
 onClick={() => setShowNewModal(true)}
 className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
 >
 <Plus size={14} />
 Yeni Degerlendirme
 </button>
 </div>

 <StrategicHeatmap />

 <div className="mt-4">
  <EntityRiskTable />
 </div>
 </div>

 {showNewModal && (
 <NewAssessmentModal
 riskDefs={riskDefs}
 entities={entities}
 onClose={() => setShowNewModal(false)}
 />
 )}
 </div>
 );
}

function NewAssessmentModal({
 riskDefs,
 entities,
 onClose,
}: {
 riskDefs: { id: string; title: string; category: string }[];
 entities: { id: string; name: string; type: string }[];
 onClose: () => void;
}) {
 const createAssessment = useCreateAssessment();
 const [form, setForm] = useState<CreateAssessmentInput>({
 entity_id: '',
 risk_id: '',
 impact: 3,
 likelihood: 3,
 control_effectiveness: 0.5,
 justification: '',
 });

 const handleSubmit = async () => {
 if (!form.entity_id || !form.risk_id) return;
 await createAssessment.mutateAsync(form);
 onClose();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-4"
 >
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
 <Shield size={18} className="text-blue-600" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-primary">Yeni Risk Degerlendirmesi</h2>
 <p className="text-xs text-slate-500">Varliga risk atayarak heatmap'i guncelleyin</p>
 </div>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
 <X size={18} className="text-slate-500" />
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Varlik</label>
 <select
 value={form.entity_id}
 onChange={e => setForm(f => ({ ...f, entity_id: e.target.value }))}
 className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 >
 <option value="">Varlik secin...</option>
 {(entities || []).map(e => (
 <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Risk</label>
 <select
 value={form.risk_id}
 onChange={e => setForm(f => ({ ...f, risk_id: e.target.value }))}
 className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 >
 <option value="">Risk secin...</option>
 {(riskDefs || []).map(r => (
 <option key={r.id} value={r.id}>{r.title} ({r.category})</option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Etki (1-5)</label>
 <input
 type="number"
 min={1}
 max={5}
 value={form.impact}
 onChange={e => setForm(f => ({ ...f, impact: Math.min(5, Math.max(1, +e.target.value)) }))}
 className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Olasilik (1-5)</label>
 <input
 type="number"
 min={1}
 max={5}
 value={form.likelihood}
 onChange={e => setForm(f => ({ ...f, likelihood: Math.min(5, Math.max(1, +e.target.value)) }))}
 className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Kontrol %</label>
 <input
 type="number"
 min={0}
 max={100}
 value={Math.round(form.control_effectiveness * 100)}
 onChange={e => setForm(f => ({ ...f, control_effectiveness: Math.min(1, Math.max(0, +e.target.value / 100)) }))}
 className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>

 <div className="bg-canvas rounded-lg p-3 flex items-center justify-between">
 <span className="text-xs font-medium text-slate-600">Dogal Risk Skoru</span>
 <span className={clsx(
 'text-lg font-black',
 form.impact * form.likelihood >= 15 ? 'text-red-600' :
 form.impact * form.likelihood >= 10 ? 'text-orange-600' :
 form.impact * form.likelihood >= 5 ? 'text-yellow-600' : 'text-emerald-600'
 )}>
 {form.impact * form.likelihood}
 </span>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">Gerekce</label>
 <textarea
 value={form.justification ?? ''}
 onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
 rows={2}
 className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Bu risk degerlendirmesinin gerekceleri..."
 />
 </div>
 </div>

 <div className="flex gap-3 mt-3">
 <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
 Iptal
 </button>
 <button
 onClick={handleSubmit}
 disabled={!form.entity_id || !form.risk_id || createAssessment.isPending}
 className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
 >
 {createAssessment.isPending && <Loader2 size={14} className="animate-spin" />}
 Kaydet
 </button>
 </div>
 </motion.div>
 </div>
 );
}
