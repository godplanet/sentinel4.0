import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { useScribbleStore } from './store';
import type { FindingSeverity, GIASCategory } from '@/entities/finding/model/types';
import { supabase } from '@/shared/api/supabase';

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

const SECTIONS = [
  { id: 'tespit' as const, label: 'Tespit', icon: FileSearch, color: 'blue' },
  { id: 'risk' as const, label: 'Risk & Etki', icon: TrendingUp, color: 'orange' },
  { id: 'koken' as const, label: 'Kok Neden', icon: AlertTriangle, color: 'red' },
  { id: 'oneri' as const, label: 'Oneri', icon: Lightbulb, color: 'green' },
];

const SECTION_COLORS: Record<FormSection, string> = {
  tespit: 'bg-blue-600',
  risk: 'bg-orange-600',
  koken: 'bg-red-600',
  oneri: 'bg-emerald-600',
};

export function ScribbleFindingModal() {
  const { showFindingModal, prefillFinding, closeFindingModal } = useScribbleStore();
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState(() => getInitialData());

  function getInitialData() {
    return {
      title: prefillFinding?.title || '',
      code: `AUD-${new Date().getFullYear()}-SC-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`,
      severity: (prefillFinding?.severity || 'MEDIUM') as FindingSeverity,
      gias_category: (prefillFinding?.gias_category || '') as GIASCategory | '',
      auditee_department: '',
      detection: prefillFinding?.description || '',
      impact: '',
      root_cause: prefillFinding?.root_cause || '',
      recommendation: prefillFinding?.recommendation || '',
      impact_score: prefillFinding?.severity === 'CRITICAL' ? 5 : prefillFinding?.severity === 'HIGH' ? 4 : 3,
      likelihood_score: 3,
      financial_impact: 0,
    };
  }

  const update = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('findings_v2').insert({
        code: formData.code,
        title: formData.title,
        severity: formData.severity,
        gias_category: formData.gias_category || null,
        state: 'DRAFT',
        detection_html: formData.detection,
        impact_html: formData.impact,
        recommendation_html: formData.recommendation,
        root_cause_analysis: { summary: formData.root_cause },
        impact_score: formData.impact_score,
        likelihood_score: formData.likelihood_score,
        financial_impact: formData.financial_impact,
        auditee_department: formData.auditee_department || null,
      });

      if (error) {
        console.error('Finding save error:', error);
      }

      setSaved(true);
      setTimeout(() => {
        closeFindingModal();
        setSaved(false);
        setFormData(getInitialData());
      }, 1500);
    } finally {
      setSaving(false);
    }
  };

  if (!showFindingModal) return null;

  if (saved) {
    return (
      <div className="fixed inset-0 z-[200] overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles size={32} className="text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bulgu Olusturuldu</h3>
            <p className="text-sm text-slate-500">
              Sentinel Scribble notu basariyla yapilandirilmis bir bulgua donusturuldu.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeFindingModal} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Scribble -&gt; Bulgu</h2>
                <p className="text-xs text-slate-500">Sentinel Magic ile on-doldurulmus bulgu formu</p>
              </div>
            </div>
            <button onClick={closeFindingModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bulgu Basligi *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => update('title', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Referans No</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => update('code', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Onem Seviyesi *</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => update('severity', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="CRITICAL">Kritik</option>
                    <option value="HIGH">Yuksek</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="LOW">Dusuk</option>
                    <option value="OBSERVATION">Gozlem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">GIAS Kategorisi</label>
                  <select
                    value={formData.gias_category}
                    onChange={(e) => update('gias_category', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Seciniz</option>
                    <option value="Operasyonel Risk">Operasyonel Risk</option>
                    <option value="Uyum Riski">Uyum Riski</option>
                    <option value="Finansal Risk">Finansal Risk</option>
                    <option value="Teknolojik Risk">Teknolojik Risk</option>
                    <option value="BT Guvenligi">BT Guvenligi</option>
                    <option value="Ic Kontrol">Ic Kontrol</option>
                    <option value="Yonetisim">Yonetisim</option>
                    <option value="Risk Yonetimi">Risk Yonetimi</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                      activeSection === s.id
                        ? `${SECTION_COLORS[s.id]} text-white shadow-md`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <Icon size={13} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeSection === 'tespit' && (
                  <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                    <textarea
                      value={formData.detection}
                      onChange={(e) => update('detection', e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                      rows={10}
                      placeholder="Yapilan inceleme sonucunda tespit edilen bulguyu detayli olarak aciklayin..."
                    />
                  </div>
                )}

                {activeSection === 'risk' && (
                  <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-orange-800 mb-1">Etki Skoru (1-5)</label>
                        <input
                          type="number" min={1} max={5}
                          value={formData.impact_score}
                          onChange={(e) => update('impact_score', parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-orange-800 mb-1">Olasilik Skoru (1-5)</label>
                        <input
                          type="number" min={1} max={5}
                          value={formData.likelihood_score}
                          onChange={(e) => update('likelihood_score', parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-orange-800 mb-1">Finansal Etki (TL)</label>
                        <input
                          type="number"
                          value={formData.financial_impact}
                          onChange={(e) => update('financial_impact', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                      </div>
                    </div>
                    <textarea
                      value={formData.impact}
                      onChange={(e) => update('impact', e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none bg-white"
                      rows={6}
                      placeholder="Bulgunun organizasyon uzerindeki risk ve etkisini aciklayin..."
                    />
                  </div>
                )}

                {activeSection === 'koken' && (
                  <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                    <label className="block text-[11px] font-bold text-red-800 mb-2">Kok Neden Ozeti</label>
                    <textarea
                      value={formData.root_cause}
                      onChange={(e) => update('root_cause', e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 resize-none bg-white"
                      rows={8}
                      placeholder="Bulgunun kok nedenini aciklayin..."
                    />
                  </div>
                )}

                {activeSection === 'oneri' && (
                  <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
                    <textarea
                      value={formData.recommendation}
                      onChange={(e) => update('recommendation', e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
                      rows={8}
                      placeholder="Iyilestirme ve duzeltici aksiyon onerilerinizi yazin..."
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0">
            <button
              onClick={closeFindingModal}
              className="px-5 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
              Iptal
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title.trim() || saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-bold rounded-xl hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 transition-all shadow-md"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Bulguyu Kaydet
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
