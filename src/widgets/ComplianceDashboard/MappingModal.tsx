import { useState } from 'react';
import { X, Link2, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { useCreateMapping, type FrameworkRequirement } from '@/features/compliance';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface Props {
  requirement: FrameworkRequirement;
  onClose: () => void;
}

interface AISuggestion {
  control_ref: string;
  control_title: string;
  coverage: 'FULL' | 'PARTIAL' | 'WEAK';
  score: number;
  reason: string;
}

const PRESET_CONTROLS = [
  { ref: 'CTR-IAM-001', title: 'Cok Faktorlu Kimlik Dogrulama (MFA)' },
  { ref: 'CTR-IAM-002', title: 'Merkezi Kimlik Yonetim Sistemi' },
  { ref: 'CTR-SEC-001', title: 'Yillik Sizdi Testi Programi' },
  { ref: 'CTR-SEC-002', title: 'Zafiyet Tarama Otomasyonu' },
  { ref: 'CTR-LOG-001', title: 'SIEM Merkezi Log Toplama' },
  { ref: 'CTR-NET-001', title: 'Ag Segmentasyonu ve Firewall' },
  { ref: 'CTR-BCP-001', title: 'DR Testi Yillik Plan' },
  { ref: 'CTR-POL-001', title: 'BG Politika Seti' },
  { ref: 'CTR-DLP-001', title: 'Veri Sizintisi Onleme Sistemi' },
  { ref: 'CTR-MON-001', title: 'SIEM Anomali Tespiti' },
  { ref: 'CTR-CHG-001', title: 'Degisiklik Yonetimi Sureci' },
  { ref: 'CTR-PRI-001', title: 'Aydinlatma Metni Yonetimi' },
  { ref: 'CTR-PRI-002', title: 'Veri Envanteri ve VERBIS Kaydi' },
  { ref: 'CTR-PRI-003', title: 'Veri Silme/Anonim Hale Getirme' },
  { ref: 'CTR-ENC-001', title: 'Veri Sifreleme Politikasi' },
  { ref: 'CTR-INC-001', title: 'Olay Mudahale Proseduru' },
];

export const MappingModal = ({ requirement, onClose }: Props) => {
  const createMutation = useCreateMapping();
  const [controlRef, setControlRef] = useState('');
  const [controlTitle, setControlTitle] = useState('');
  const [coverage, setCoverage] = useState<'FULL' | 'PARTIAL' | 'WEAK'>('FULL');
  const [score, setScore] = useState(80);
  const [notes, setNotes] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showPresets, setShowPresets] = useState(false);

  const handleAISuggest = async () => {
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    const keywords = requirement.title.toLowerCase();
    const suggestions: AISuggestion[] = [];

    if (keywords.includes('kimlik') || keywords.includes('erisim') || keywords.includes('access')) {
      suggestions.push(
        { control_ref: 'CTR-IAM-001', control_title: 'Cok Faktorlu Kimlik Dogrulama (MFA)', coverage: 'FULL', score: 95, reason: 'Kimlik dogrulama gereksinimi ile dogrudan eslesme' },
        { control_ref: 'CTR-IAM-002', control_title: 'Merkezi Kimlik Yonetim Sistemi', coverage: 'PARTIAL', score: 75, reason: 'Yetkilendirme bilesenini kismen kapsar' },
      );
    } else if (keywords.includes('sizdi') || keywords.includes('zafiyet') || keywords.includes('guvenlik')) {
      suggestions.push(
        { control_ref: 'CTR-SEC-001', control_title: 'Yillik Sizdi Testi Programi', coverage: 'FULL', score: 90, reason: 'Sizdi testi gereksinimini tam kapsar' },
        { control_ref: 'CTR-SEC-002', control_title: 'Zafiyet Tarama Otomasyonu', coverage: 'PARTIAL', score: 70, reason: 'Otomatik tarama ile destekleyici kapsam' },
      );
    } else if (keywords.includes('log') || keywords.includes('izleme') || keywords.includes('monitor')) {
      suggestions.push(
        { control_ref: 'CTR-LOG-001', control_title: 'SIEM Merkezi Log Toplama', coverage: 'FULL', score: 88, reason: 'Log yonetimi ve izleme gereksinimini kapsar' },
        { control_ref: 'CTR-MON-001', control_title: 'SIEM Anomali Tespiti', coverage: 'PARTIAL', score: 72, reason: 'Izleme faaliyetlerini destekler' },
      );
    } else if (keywords.includes('veri') || keywords.includes('kisisel') || keywords.includes('data')) {
      suggestions.push(
        { control_ref: 'CTR-PRI-002', control_title: 'Veri Envanteri ve VERBIS Kaydi', coverage: 'FULL', score: 85, reason: 'Veri yonetimi gereksinimini kapsar' },
        { control_ref: 'CTR-ENC-001', control_title: 'Veri Sifreleme Politikasi', coverage: 'PARTIAL', score: 70, reason: 'Veri guvenligi yonuyle destekler' },
      );
    } else if (keywords.includes('sureklilik') || keywords.includes('felaket') || keywords.includes('continuity')) {
      suggestions.push(
        { control_ref: 'CTR-BCP-001', control_title: 'DR Testi Yillik Plan', coverage: 'FULL', score: 90, reason: 'Is surekliligi gereksinimini tam kapsar' },
      );
    } else {
      suggestions.push(
        { control_ref: 'CTR-POL-001', control_title: 'BG Politika Seti', coverage: 'PARTIAL', score: 65, reason: 'Genel politika cercevesinde kismen kapsar' },
        { control_ref: 'CTR-CHG-001', control_title: 'Degisiklik Yonetimi Sureci', coverage: 'WEAK', score: 40, reason: 'Dolayli olarak iliskili kontrol' },
      );
    }

    setAiSuggestions(suggestions);
    setAiLoading(false);
  };

  const applySuggestion = (s: AISuggestion) => {
    setControlRef(s.control_ref);
    setControlTitle(s.control_title);
    setCoverage(s.coverage);
    setScore(s.score);
    setNotes(s.reason);
  };

  const selectPreset = (p: { ref: string; title: string }) => {
    setControlRef(p.ref);
    setControlTitle(p.title);
    setShowPresets(false);
  };

  const handleSubmit = async () => {
    if (!controlRef || !controlTitle) return;
    await createMutation.mutateAsync({
      control_ref: controlRef,
      control_title: controlTitle,
      requirement_id: requirement.id,
      coverage_strength: coverage,
      match_score: score,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Kontrol Esleme</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {requirement.code} - {requirement.title}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <button
            onClick={handleAISuggest}
            disabled={aiLoading}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all',
              'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-200/50',
              aiLoading && 'opacity-70 cursor-wait',
            )}
          >
            {aiLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {aiLoading ? 'Sentinel AI Analiz Ediyor...' : 'Sentinel AI Oneri'}
          </button>

          {aiSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">AI Onerileri</p>
              {aiSuggestions.map((s) => (
                <button
                  key={s.control_ref}
                  onClick={() => applySuggestion(s)}
                  className="w-full text-left p-3 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-blue-700">{s.control_ref}</span>
                    <span className={clsx(
                      'text-[10px] font-bold px-2 py-0.5 rounded',
                      s.coverage === 'FULL' ? 'bg-emerald-100 text-emerald-700'
                        : s.coverage === 'PARTIAL' ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700',
                    )}>
                      %{s.score}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{s.control_title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.reason}</p>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Kontrol Referansi
              </label>
              <input
                value={controlRef}
                onChange={(e) => setControlRef(e.target.value)}
                onFocus={() => setShowPresets(true)}
                placeholder="CTR-XXX-001"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none bg-white"
              />
              {showPresets && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPresets(false)} />
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {PRESET_CONTROLS.filter((p) =>
                      !controlRef || p.ref.toLowerCase().includes(controlRef.toLowerCase()) || p.title.toLowerCase().includes(controlRef.toLowerCase())
                    ).map((p) => (
                      <button
                        key={p.ref}
                        onClick={() => selectPreset(p)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <span className="text-xs font-mono font-bold text-slate-600">{p.ref}</span>
                        <span className="text-xs text-slate-500">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Kontrol Adi
              </label>
              <input
                value={controlTitle}
                onChange={(e) => setControlTitle(e.target.value)}
                placeholder="Kontrol aciklamasi"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Kapsam Gucu
                </label>
                <select
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value as 'FULL' | 'PARTIAL' | 'WEAK')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none bg-white"
                >
                  <option value="FULL">Tam (FULL)</option>
                  <option value="PARTIAL">Kismi (PARTIAL)</option>
                  <option value="WEAK">Zayif (WEAK)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Esleme Skoru: %{score}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-blue-600 mt-2"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Notlar
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Esleme gereksesi..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none bg-white resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Iptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!controlRef || !controlTitle || createMutation.isPending}
            className={clsx(
              'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all',
              controlRef && controlTitle
                ? 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                : 'bg-slate-300 cursor-not-allowed',
            )}
          >
            {createMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Link2 size={14} />
            )}
            Esle
          </button>
        </div>
      </motion.div>
    </div>
  );
};
