import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, CheckCircle2,
  Search, Users, Brain, Sparkles, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';

interface Auditor {
  id: string;
  name: string;
  title: string;
  department: string;
  skills: string[];
  currentLoad: number;
  maxCapacity: number;
  relations: string[];
  bio: string;
}

interface ConflictWarning {
  auditorId: string;
  type: 'DIRECT_RELATION' | 'DEPARTMENT_MATCH' | 'RECENT_ROLE' | 'FAMILY_TIE' | 'AI_DETECTED';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

interface AuditorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (auditorId: string) => void;
  engagementTitle: string;
  targetDepartment: string;
  targetEntities?: string[];
}

const DEMO_AUDITORS: Auditor[] = [
  { id: '1', name: 'Ahmet Yilmaz', title: 'Kidemli Denetci', department: 'Ic Denetim', skills: ['Kredi', 'Operasyon'], currentLoad: 3, maxCapacity: 5, relations: ['Kredi Operasyonlari'], bio: '2018-2021 yillari arasinda Kredi Tahsis Mudurlugunde Uzman olarak calismistir. Esi Ayse Yilmaz, Hazine Biriminde Portfoy Yoneticisi olarak gorev yapmaktadir. CIA ve CISA sertifikalarina sahiptir.' },
  { id: '2', name: 'Zeynep Kara', title: 'Bas Denetci', department: 'Ic Denetim', skills: ['BT', 'Siber Guvenlik'], currentLoad: 2, maxCapacity: 4, relations: [], bio: 'COBIT 5 ve ISO 27001 sertifikalarina sahiptir. 2020 oncesinde dis denetim firmasinda BT denetcisi olarak calismistir. Hicbir birimde operasyonel gorev almamistir.' },
  { id: '3', name: 'Mehmet Oz', title: 'Denetci', department: 'Ic Denetim', skills: ['Uyumluluk', 'MASAK'], currentLoad: 4, maxCapacity: 5, relations: ['Uyumluluk Birimi'], bio: '2019-2022 arasinda Uyumluluk Biriminde MASAK Raporlama Sorumlusu olarak gorev yapmistir. Kardesi Omer Oz, ayni bankada Operasyon Mudurlugunde Sef pozisyonunda calismaktadir.' },
  { id: '4', name: 'Fatma Celik', title: 'Kidemli Denetci', department: 'Ic Denetim', skills: ['Finans', 'Hazine'], currentLoad: 1, maxCapacity: 5, relations: [], bio: 'CFA ve FRM sertifikalarina sahiptir. Bankaya 2017 yilinda dis kaynaktan katilmistir. Daha once yatirim bankasinda risk analizcisi olarak calismistir. Bankanin hicbir biriminde operasyonel gorev almamistir.' },
  { id: '5', name: 'Ali Demir', title: 'Denetci', department: 'Ic Denetim', skills: ['Operasyon', 'Surec'], currentLoad: 3, maxCapacity: 4, relations: ['Insan Kaynaklari'], bio: 'Bankaya 2016 yilinda Insan Kaynaklari Biriminde Uzman olarak baslamistir. 2020 yilinda Ic Denetim Grubuna gecis yapmistir. Daha once IK sureclerinde aktif rol almistir.' },
  { id: '6', name: 'Can Yildirim', title: 'Uzman Denetci', department: 'Ic Denetim', skills: ['BT', 'Veri Analizi'], currentLoad: 2, maxCapacity: 5, relations: [], bio: 'Python ve SQL konusunda ileri seviye yetkinlige sahiptir. 2021 yilinda Data Analytics Biriminde 6 aylik rotasyon programina katilmistir. Hicbir aile baglantiSi bankada calismamaktadir.' },
];

function detectConflicts(auditor: Auditor, targetDepartment: string, targetEntities: string[]): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];

  for (const relation of auditor.relations) {
    if (targetEntities.some(e => e.toLowerCase().includes(relation.toLowerCase()) || relation.toLowerCase().includes(e.toLowerCase()))) {
      warnings.push({
        auditorId: auditor.id,
        type: 'DIRECT_RELATION',
        severity: 'HIGH',
        description: `${auditor.name} ile denetlenen birim "${relation}" arasinda ilgisel baglanti tespit edildi.`,
      });
    }
  }

  if (auditor.department.toLowerCase() === targetDepartment.toLowerCase()) {
    warnings.push({
      auditorId: auditor.id,
      type: 'DEPARTMENT_MATCH',
      severity: 'MEDIUM',
      description: `${auditor.name} denetlenen departmanda calisma gecmisine sahip.`,
    });
  }

  if (auditor.currentLoad >= auditor.maxCapacity) {
    warnings.push({
      auditorId: auditor.id,
      type: 'RECENT_ROLE',
      severity: 'LOW',
      description: `${auditor.name} mevcut kapasitesinin tamamini kullaniyor (${auditor.currentLoad}/${auditor.maxCapacity}).`,
    });
  }

  return warnings;
}

export function AuditorAssignmentModal({
  isOpen,
  onClose,
  onAssign,
  engagementTitle,
  targetDepartment,
  targetEntities = [],
}: AuditorAssignmentModalProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acknowledgedConflicts, setAcknowledgedConflicts] = useState(false);
  const [aiConflicts, setAiConflicts] = useState<ConflictWarning[]>([]);
  const { loading: aiLoading, generate, configured: aiConfigured } = useSentinelAI();

  const auditorConflicts = useMemo(() => {
    const map = new Map<string, ConflictWarning[]>();
    for (const a of DEMO_AUDITORS) {
      map.set(a.id, detectConflicts(a, targetDepartment, targetEntities));
    }
    return map;
  }, [targetDepartment, targetEntities]);

  const filtered = useMemo(() => {
    if (!search) return DEMO_AUDITORS;
    const q = search.toLowerCase();
    return DEMO_AUDITORS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [search]);

  const selectedAuditor = DEMO_AUDITORS.find(a => a.id === selectedId);
  const allConflicts = [
    ...(selectedId ? (auditorConflicts.get(selectedId) || []) : []),
    ...aiConflicts.filter(c => c.auditorId === selectedId),
  ];
  const hasHighConflict = allConflicts.some(c => c.severity === 'HIGH');

  const handleDeepScan = async () => {
    if (!selectedAuditor) return;

    const prompt = `Bir ic denetim atama surecinde cikar catismasi analizi yapiyorsun.

DENETCI BILGILERI:
- Isim: ${selectedAuditor.name}
- Unvan: ${selectedAuditor.title}
- Ozgecmis: ${selectedAuditor.bio}
- Yetkinlikler: ${selectedAuditor.skills.join(', ')}

DENETIM GOREVI:
- Baslik: ${engagementTitle}
- Hedef Departman: ${targetDepartment}
- Hedef Birimler: ${targetEntities.join(', ') || 'Belirtilmemis'}

Ozgecmis bilgilerine dayanarak gizli cikar catismalarini tespit et. Ozellikle su konulara bak:
1. Daha once denetlenecek birimde calismis mi?
2. Aile baglantiSi denetlenecek birimle iliskili mi?
3. Yakin zamanda rotasyon veya gecici gorevlendirme var mi?
4. Dolaysiz cikarlari var mi?

Her tespit icin ciddiyet seviyesi (HIGH/MEDIUM/LOW) belirle.
Format: Her satira "[SEVERITY] Aciklama" yaz. Sadece tespitleri listele.
Tespit yoksa "TEMIZ: Gizli cikar catismasi tespit edilmedi." yaz.`;

    const result = await generate(prompt);
    if (!result) return;

    const newConflicts: ConflictWarning[] = [];
    const lines = result.split('\n').filter(Boolean);

    for (const line of lines) {
      const trimmed = line.trim().replace(/^[-*\d.)\]]+\s*/, '');
      if (trimmed.toLowerCase().includes('temiz') || trimmed.toLowerCase().includes('tespit edilmedi')) continue;

      let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      let desc = trimmed;

      if (trimmed.startsWith('[HIGH]') || trimmed.toLowerCase().startsWith('high')) {
        severity = 'HIGH';
        desc = trimmed.replace(/^\[?HIGH\]?\s*:?\s*/i, '');
      } else if (trimmed.startsWith('[LOW]') || trimmed.toLowerCase().startsWith('low')) {
        severity = 'LOW';
        desc = trimmed.replace(/^\[?LOW\]?\s*:?\s*/i, '');
      } else if (trimmed.startsWith('[MEDIUM]') || trimmed.toLowerCase().startsWith('medium')) {
        severity = 'MEDIUM';
        desc = trimmed.replace(/^\[?MEDIUM\]?\s*:?\s*/i, '');
      }

      if (desc.length > 5) {
        newConflicts.push({
          auditorId: selectedAuditor.id,
          type: 'AI_DETECTED',
          severity,
          description: desc,
        });
      }
    }

    setAiConflicts(prev => [
      ...prev.filter(c => c.auditorId !== selectedAuditor.id),
      ...newConflicts,
    ]);
  };

  const handleAssign = () => {
    if (!selectedId) return;
    if (hasHighConflict && !acknowledgedConflicts) return;
    onAssign(selectedId);
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} />
                Denetci Atama
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">{engagementTitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-auto space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Denetci ara (isim veya yetkinlik)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-2">
              {filtered.map(auditor => {
                const ruleConflicts = auditorConflicts.get(auditor.id) || [];
                const aiAuditorConflicts = aiConflicts.filter(c => c.auditorId === auditor.id);
                const totalConflicts = ruleConflicts.length + aiAuditorConflicts.length;
                const hasConflict = totalConflicts > 0;
                const isSelected = selectedId === auditor.id;
                const loadPct = (auditor.currentLoad / auditor.maxCapacity) * 100;

                return (
                  <button
                    key={auditor.id}
                    onClick={() => {
                      setSelectedId(isSelected ? null : auditor.id);
                      setAcknowledgedConflicts(false);
                    }}
                    className={clsx(
                      'w-full text-left p-4 rounded-lg border-2 transition-all',
                      isSelected
                        ? hasConflict ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                          hasConflict ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        )}>
                          {auditor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{auditor.name}</p>
                          <p className="text-xs text-slate-500">{auditor.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasConflict && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
                            <AlertTriangle size={12} />
                            {totalConflicts} uyari
                          </span>
                        )}
                        {aiAuditorConflicts.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                            <Brain size={10} />
                            AI
                          </span>
                        )}
                        <div className="text-right">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full',
                                loadPct >= 80 ? 'bg-red-500' : loadPct >= 60 ? 'bg-amber-500' : 'bg-green-500'
                              )}
                              style={{ width: `${loadPct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {auditor.currentLoad}/{auditor.maxCapacity} gorev
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {auditor.skills.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{s}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedId && selectedAuditor && (
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white">AI Derin Catisma Analizi</h4>
                  </div>
                  <button
                    onClick={handleDeepScan}
                    disabled={aiLoading || !aiConfigured}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
                  >
                    {aiLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {aiLoading ? 'Tarama...' : 'Derin Tarama'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Denetcinin ozgecmis, aile baglantilari ve gecmis gorevleri AI ile analiz edilerek gizli cikar catismalari tespit edilir.
                </p>
                {!aiConfigured && (
                  <p className="text-[10px] text-amber-400 mt-2">
                    AI motoru yapilandirilmamis. Ayarlar &gt; Cognitive Engine
                  </p>
                )}
              </div>
            )}

            {allConflicts.length > 0 && selectedId && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <h4 className="text-sm font-bold text-amber-800">Cikar Catismasi Uyarisi</h4>
                </div>
                {allConflicts.map((c, i) => (
                  <div key={i} className={clsx(
                    'flex items-start gap-2 p-2 rounded',
                    c.severity === 'HIGH' && 'bg-red-50',
                    c.severity === 'MEDIUM' && 'bg-amber-50',
                    c.severity === 'LOW' && 'bg-yellow-50',
                  )}>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={clsx(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded',
                        c.severity === 'HIGH' && 'bg-red-100 text-red-700',
                        c.severity === 'MEDIUM' && 'bg-amber-100 text-amber-700',
                        c.severity === 'LOW' && 'bg-yellow-100 text-yellow-700',
                      )}>
                        {c.severity}
                      </span>
                      {c.type === 'AI_DETECTED' && (
                        <span className="text-[9px] font-bold px-1 py-0.5 bg-blue-100 text-blue-700 rounded">AI</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700">{c.description}</p>
                  </div>
                ))}

                {hasHighConflict && (
                  <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-amber-200">
                    <input
                      type="checkbox"
                      checked={acknowledgedConflicts}
                      onChange={e => setAcknowledgedConflicts(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-amber-600 border-amber-300 rounded"
                    />
                    <span className="text-xs text-amber-800 font-medium">
                      Cikar catismasi riskini kabul ediyorum ve atama islemini onayliyorum.
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {selectedAuditor ? `Secilen: ${selectedAuditor.name}` : 'Denetci secin'}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm">
                Iptal
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedId || (hasHighConflict && !acknowledgedConflicts)}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
              >
                <CheckCircle2 size={14} />
                Atama Yap
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
