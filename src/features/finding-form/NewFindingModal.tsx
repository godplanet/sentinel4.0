import { useState, useMemo } from 'react';
import {
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2,
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock,
  ToggleRight, ToggleLeft, CheckSquare, Square, BookOpen, AlertCircle, ChevronDown, Wand2, Calculator,
  Activity
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

import type { FindingSeverity, GIASCategory } from '../../entities/finding/model/types';
import { comprehensiveFindingApi } from '../../entities/finding/api/module5-api';
import { RegulationSelectorModal } from '../finding-studio/components/RegulationSelectorModal';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

import { RichTextEditor } from '@/shared/ui/RichTextEditor';

// UNIVERSAL DRAWER (SINGLE SOURCE OF TRUTH)
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

// STORE BAĞLANTILARI
import { useParameterStore } from '@/entities/settings/model/parameter-store';
import { useUIStore } from '@/shared/stores/ui-store';

// PARAMETRİK RİSK MOTORU
import { calculateFindingRisk } from '@/features/risk-engine/calculator';
import { useRiskConfigStore } from '@/features/admin/risk-configuration/model/store';

interface NewFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: any) => void;
  workpaperId?: string | null;
  engagementId?: string | null;
}

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

// --- UI ÇEVİRİ SÖZLÜĞÜ ---
const SEVERITY_TR: Record<string, string> = {
    CRITICAL: 'Kritik',
    HIGH: 'Yüksek',
    MEDIUM: 'Orta',
    LOW: 'Düşük',
    OBSERVATION: 'Gözlem'
};

// --- ÖZEL ÇOKLU SEÇİM (MULTI-SELECT) BİLEŞENİ ---
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }: { options: any[], selected: string[], onChange: (val: string[]) => void, placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const safeOptions = options || [];

    return (
      <div className="relative">
        <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          <span className={clsx("truncate text-sm font-medium", selected.length === 0 ? "text-slate-400" : "text-slate-800")}>
            {selected.length === 0 ? placeholder : `${selected.length} Risk Kategorisi Seçildi`}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
              {safeOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer" checked={selected.includes(opt.id)}
                    onChange={() => {
                      if (selected.includes(opt.id)) { onChange(selected.filter(s => s !== opt.id)); }
                      else { onChange([...selected, opt.id]); }
                    }}
                  />
                  <span className="text-sm text-slate-700 font-bold">{opt.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    );
};

// --- RİSK SLIDER BİLEŞENİ ---
const RiskSlider = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
    <div className="group mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
            <Icon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500" />{label}
        </label>
        <div className="flex items-center gap-4">
            <input
                type="range"
                min="1" max="5" step="0.1"
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="font-bold text-sm text-blue-700 w-12 text-center bg-blue-50 rounded-md py-1 border border-blue-100">{(value ?? 0).toFixed(1)}</span>
        </div>
    </div>
);


export const NewFindingModal = ({ isOpen, onClose, onSave, workpaperId, engagementId }: NewFindingModalProps) => {
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<any>(null);

  // UNIVERSAL DRAWER STATE
  const [isUniversalDrawerOpen, setIsUniversalDrawerOpen] = useState(false);

  // STORE BAĞLANTILARI
  const { giasCategories, rcaCategories, riskTypes } = useParameterStore();
  const { sidebarColor } = useUIStore();

  // Risk Konfigürasyonu
  const riskConfigStore = useRiskConfigStore();
  const riskConfig = {
      weights: {
        financial: 0.30,
        legal: 0.25,
        reputation: 0.25,
        operational: 0.20
      },
      thresholds: riskConfigStore.thresholds
  };

  const [formData, setFormData] = useState({
    title: '', code: '', auditee_department: '', gias_category: '' as GIASCategory | '',

    criteria_html: '',
    detection_html: '',
    impact_html: '',
    root_cause_html: '',
    recommendation_html: '',

    selected_risk_categories: [] as string[],
    rca_category: '',

    financial_impact: 0, likelihood_score: 3,
    impact_financial: 1, impact_legal: 1, impact_reputation: 1, impact_operational: 1, control_weakness: 1,
    sla_type: 'FIXED_DATE', isItRisk: false, cvss_score: 0, asset_criticality: 'Minor',
    isShariahRisk: false, shariah_impact: 1, requires_income_purification: false,
  });

  const sections = [
    { id: 'tespit' as const, label: 'Kriter & Tespit', icon: FileSearch, color: 'blue' },
    { id: 'risk' as const, label: 'Risk & Etki', icon: TrendingUp, color: 'orange' },
    { id: 'koken' as const, label: 'Kök Neden', icon: AlertTriangle, color: 'red' },
    { id: 'oneri' as const, label: 'Öneri', icon: Lightbulb, color: 'green' },
  ];

  // PARAMETRİK RİSK HESAPLAMA
  const liveRisk = useMemo(() => calculateFindingRisk(formData, riskConfig), [formData, riskConfig]);

  // Finansal Değer Formatlayıcı
  const handleFinancialImpactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\./g, '');
      if (rawValue === '') {
          setFormData({ ...formData, financial_impact: 0 });
          return;
      }
      const numericValue = parseInt(rawValue, 10);
      if (!isNaN(numericValue)) {
          setFormData({ ...formData, financial_impact: numericValue });
      }
  };

  const formatCurrency = (val: number) => {
      if (val === 0) return '';
      return new Intl.NumberFormat('tr-TR').format(val);
  };

  const resolveEngagementId = async (): Promise<string | null> => {
    if (engagementId) return engagementId;

    if (workpaperId) {
      const { data } = await supabase
        .from('workpapers')
        .select('engagement_id')
        .eq('id', workpaperId)
        .maybeSingle();
      if (data?.engagement_id) return data.engagement_id;
    }

    const { data } = await supabase
      .from('audit_engagements')
      .select('id')
      .eq('tenant_id', ACTIVE_TENANT_ID)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data?.id || null;
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (!formData.title.trim()) { toast.error('Lütfen bulgu başlığı giriniz.'); return; }

    setIsSubmitting(true);

    try {
      const resolvedEngagementId = await resolveEngagementId();

      if (!resolvedEngagementId) {
        toast.error('Bulgu oluşturmak için aktif bir Denetim Görevi bulunamadı.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: formData.title,
        severity: liveRisk.severity,
        status: status,
        category: 'Audit',
        tenant_id: ACTIVE_TENANT_ID,
        engagement_id: resolvedEngagementId,

        description: formData.detection_html,
        criteria: formData.code || "N/A",

        details: {
          auditee_department: formData.auditee_department,
          gias_category: formData.gias_category,
          criteria_html: formData.criteria_html,
          impact_text: formData.impact_html,
          recommendation_text: formData.recommendation_html,
          financial_impact: formData.financial_impact,

          risk_categories: formData.selected_risk_categories,

          regulation_details: selectedRegulation ? { id: selectedRegulation.id, title: selectedRegulation.title, category: selectedRegulation.category } : null,
          risk_engine: {
              calculated_score: liveRisk.calculated_score,
              is_veto_triggered: liveRisk.is_veto_triggered,
              veto_reason: liveRisk.veto_reason,
              sla_target: formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`,
              inputs: {
                  financial: formData.impact_financial,
                  legal: formData.impact_legal,
                  reputation: formData.impact_reputation,
                  operational: formData.impact_operational,
                  likelihood: formData.likelihood_score,
                  control: formData.control_weakness
              }
          },
          root_cause_analysis: {
              category: formData.rca_category,
              summary_html: formData.root_cause_html,
              has_advanced_analysis: false
          }
        }
      };

      await comprehensiveFindingApi.create(payload);
      toast.success(status === 'DRAFT' ? 'Bulgu taslak olarak kaydedildi!' : 'Bulgu başarıyla yayınlandı!');
      onSave(payload);
      onClose();
    } catch (error: any) {
      console.error('Kayıt Hatası Detayı:', error);
      toast.error(`Kayıt Başarısız: ${error?.message || error?.details || 'Bilinmeyen veritabanı hatası'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">

          {/* HEADER - APPLE GLASS DOKUNUŞU VE SİDEBAR RENGİ */}
          <div
              className="z-10 shrink-0 border-b border-white/10 rounded-t-2xl shadow-sm"
              style={{
                  backgroundColor: sidebarColor ? `${sidebarColor}F2` : 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)'
              }}
          >
              <div className="flex items-center justify-between p-6 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-sm">Yeni Bulgu Oluştur</h2>
                  <p className="text-sm text-white/70 mt-1 font-medium">Sentinel V3.0 WIF ve Veto Motoru Devrede</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg shadow-inner">
                        <Clock className="w-4 h-4 text-white/70" />
                        <span className="text-xs font-bold text-white/70">SLA:</span>
                        <span className="text-sm font-black text-white">{formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`}</span>
                    </div>
                    {liveRisk.is_veto_triggered && (
                        <div className="px-3 py-1.5 rounded-lg bg-red-500/30 text-red-100 text-xs font-bold border border-red-500/50 flex items-center gap-1.5 animate-pulse shadow-sm backdrop-blur-sm">
                            <AlertTriangle className="w-4 h-4" /> VETO
                        </div>
                    )}
                    
                    {/* RISK SKORU VE ETİKETİ (BURASI GÜNCELLENDİ) */}
                    <div style={{ backgroundColor: liveRisk.color_code }} className="px-4 py-1.5 rounded-lg text-white font-black text-sm tracking-wider shadow-md transition-colors duration-300 border border-white/20 flex items-center gap-2">
                        {/* 1. Risk Sınıfı (Örn: Kritik, Yüksek) */}
                        <span>{SEVERITY_TR[liveRisk.severity] || liveRisk.severity}</span>
                        {/* 2. Puan */}
                        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs">{(liveRisk.calculated_score ?? 0).toFixed(1)}</span>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2 group">
                        <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                    </button>
                </div>
              </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="max-w-6xl mx-auto space-y-6">

              {/* TEMEL BİLGİLER */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-blue-600"/> Temel Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Bulgu Başlığı *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Örn: Kasa İşlemlerinde Çift Anahtar Kuralı İhlali"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Referans No *</label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                        placeholder="AUD-2025-SR-XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sistem Tarafından Atanan Seviye</label>
                    <div className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-700 font-bold cursor-not-allowed flex items-center shadow-inner">
                        <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: liveRisk.color_code}}></span>
                        {SEVERITY_TR[liveRisk.severity]} (Otomatik)
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">GIAS Kategorisi</label>
                    <select
                        value={formData.gias_category}
                        onChange={(e) => setFormData({ ...formData, gias_category: e.target.value as any })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {giasCategories.map(cat => (
                          <option key={cat.id} value={cat.label}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sorumlu Birim</label>
                    <input
                        type="text"
                        value={formData.auditee_department}
                        onChange={(e) => setFormData({ ...formData, auditee_department: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Örn: Şube Müdürlüğü"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION TABS */}
              <div className="flex gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={clsx(
                            'flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all',
                            isActive ? `bg-${section.color}-600 text-white shadow-md shadow-${section.color}-600/20` : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                    >
                      <Icon className="w-4 h-4" />{section.label}
                    </button>
                  );
                })}
              </div>

              {/* TABS CONTENT */}
              <div className="space-y-6">

                {/* KRİTER & TESPİT */}
                {activeSection === 'tespit' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm flex flex-col min-h-[500px] ring-1 ring-inset ring-indigo-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Kriter (Criteria)</h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsRegulationModalOpen(true)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-1.5"
                        >
                            <BookOpen size={14} /> Kütüphaneden Seç
                        </button>
                      </div>

                      {selectedRegulation && (
                          <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-3">
                              <Scale className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                              <div>
                                  <p className="text-xs font-bold text-indigo-900">{selectedRegulation.category} Mevzuatı</p>
                                  <p className="text-xs text-indigo-700 mt-0.5 line-clamp-2">{selectedRegulation.title}</p>
                              </div>
                          </div>
                      )}

                      <div className="flex-1">
                          <RichTextEditor
                              value={formData.criteria_html}
                              onChange={(val) => setFormData({...formData, criteria_html: val})}
                              placeholder="İlgili mevzuat maddesi veya prosedür referansı..."
                              minHeight="min-h-full"
                          />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm flex flex-col min-h-[500px] ring-1 ring-inset ring-blue-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FileSearch className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Tespit (Condition)</h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold flex items-center gap-1.5"
                        >
                            <Sparkles size={14} /> AI Destek
                        </button>
                      </div>
                      <div className="flex-1">
                          <RichTextEditor
                              value={formData.detection_html}
                              onChange={(val) => setFormData({...formData, detection_html: val})}
                              placeholder="Saha çalışmasında tespit edilen bulguyu detaylı olarak açıklayın..."
                              minHeight="min-h-full"
                          />
                      </div>
                    </div>
                  </div>
                )}

                {/* RİSK & ETKİ */}
                {activeSection === 'risk' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="xl:col-span-2 flex flex-col gap-6">

                          {/* RİSK SEÇİMİ */}
                          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                               <div className="flex items-center gap-3 mb-5">
                                  <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                                      <AlertCircle className="w-5 h-5 text-violet-600" />
                                  </div>
                                  <div>
                                      <h3 className="text-lg font-bold text-slate-900">Risk Kategorizasyonu</h3>
                                      <p className="text-xs text-slate-500">Bu bulgu hangi risk türlerini barındırıyor?</p>
                                  </div>
                               </div>

                               <MultiSelectDropdown
                                  options={riskTypes}
                                  selected={formData.selected_risk_categories}
                                  onChange={(val) => setFormData({...formData, selected_risk_categories: val})}
                                  placeholder="Listeden Risk Türlerini Seçiniz..."
                               />

                               {formData.selected_risk_categories.length > 0 && (
                                   <div className="mt-4 flex flex-wrap gap-2">
                                       {formData.selected_risk_categories.map(id => {
                                           const category = riskTypes.find(c => c.id === id);
                                           return <span key={id} className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-md border border-violet-100">{category?.label}</span>
                                       })}
                                   </div>
                               )}
                          </div>

                          {/* ETKİ AÇIKLAMASI */}
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[400px]">
                              <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                      <TrendingUp className="w-5 h-5 text-orange-600" />
                                  </div>
                                  <div>
                                      <h3 className="text-lg font-bold text-slate-900">Risk ve Etki Açıklaması (Effect)</h3>
                                      <p className="text-xs text-slate-500">Seçilen risklerin kurum üzerindeki etkileri</p>
                                  </div>
                              </div>
                              <div className="flex-1">
                                <RichTextEditor
                                    value={formData.impact_html}
                                    onChange={(val) => setFormData({...formData, impact_html: val})}
                                    placeholder="Bu bulgunun kuruma maliyeti, operasyonel zorlukları veya yasal sonuçları neler olabilir?"
                                    minHeight="min-h-[250px]"
                                />
                              </div>
                          </div>
                      </div>

                      {/* MOTOR VE VETOLAR */}
                      <div className="flex flex-col gap-6">
                          <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm ring-1 ring-inset ring-orange-50">
                              <h3 className="text-base font-black text-slate-800 mb-5 pb-3 border-b border-slate-100">Etki Motoru (WIF)</h3>

                              <RiskSlider label="Finansal Etki" value={formData.impact_financial} onChange={v => setFormData({...formData, impact_financial: v})} icon={Banknote} />
                              <RiskSlider label="Yasal Etki" value={formData.impact_legal} onChange={v => setFormData({...formData, impact_legal: v})} icon={Scale} />
                              <RiskSlider label="İtibar Etkisi" value={formData.impact_reputation} onChange={v => setFormData({...formData, impact_reputation: v})} icon={Building} />
                              <RiskSlider label="Operasyonel Etki" value={formData.impact_operational} onChange={v => setFormData({...formData, impact_operational: v})} icon={HeartPulse} />

                              <div className="my-5 border-t border-slate-100"></div>

                              <RiskSlider label="Gerçekleşme Olasılığı" value={formData.likelihood_score} onChange={v => setFormData({...formData, likelihood_score: v})} icon={ChevronsRight} />
                              <RiskSlider label="Kontrol Zafiyeti" value={formData.control_weakness} onChange={v => setFormData({...formData, control_weakness: v})} icon={ShieldCheck} />

                              <div className="mt-6 pt-5 border-t border-slate-100">
                                  <label className="block text-sm font-bold text-slate-700 mb-2">Ölçülebilir Finansal Etki (TL)</label>
                                  <input
                                      type="text"
                                      value={formatCurrency(formData.financial_impact)}
                                      onChange={handleFinancialImpactChange}
                                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-base font-bold text-slate-800"
                                      placeholder="0"
                                  />
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div className="bg-emerald-50/50 rounded-xl border-2 border-emerald-100 overflow-hidden shadow-sm">
                                  <div className="flex items-center justify-between p-4 bg-emerald-100/50">
                                      <div className="flex items-center gap-2">
                                          <Scale className="w-5 h-5 text-emerald-700"/>
                                          <p className="font-bold text-sm text-emerald-900">Şer'i Uyum İhlali</p>
                                      </div>
                                      <button type="button" onClick={() => setFormData({...formData, isShariahRisk: !formData.isShariahRisk})}>
                                          {formData.isShariahRisk ? <ToggleRight className="w-10 h-10 text-emerald-600" /> : <ToggleLeft className="w-10 h-10 text-emerald-200" />}
                                      </button>
                                  </div>
                                  {formData.isShariahRisk && (
                                      <div className="p-5 border-t border-emerald-100 bg-white">
                                          <RiskSlider label="Şer'i İhlal Etkisi" value={formData.shariah_impact} onChange={v => setFormData({...formData, shariah_impact: v})} icon={Scale} />
                                          <button
                                              type="button"
                                              onClick={() => setFormData({...formData, requires_income_purification: !formData.requires_income_purification})}
                                              className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-800 p-3 border border-emerald-200 rounded-lg w-full bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                          >
                                              {formData.requires_income_purification ? <CheckSquare className="w-5 h-5 text-emerald-600"/> : <Square className="w-5 h-5 text-emerald-400"/>}
                                              Gelir Arındırması Gerektirir
                                          </button>
                                      </div>
                                  )}
                              </div>

                              <div className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                  <div className="flex items-center justify-between p-4 bg-slate-100/50">
                                      <div><p className="font-bold text-sm text-slate-800">IT / Siber Risk Veto Kapısı</p></div>
                                      <button type="button" onClick={() => setFormData({...formData, isItRisk: !formData.isItRisk})}>
                                          {formData.isItRisk ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                                      </button>
                                  </div>
                                  {formData.isItRisk && (
                                      <div className="p-5 grid grid-cols-2 gap-4 border-t border-slate-200 bg-white">
                                          <div>
                                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">CVSS Skoru</label>
                                              <input
                                                  type="number"
                                                  step="0.1"
                                                  value={formData.cvss_score}
                                                  onChange={e=>setFormData({...formData, cvss_score: parseFloat(e.target.value)})}
                                                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-bold"
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Varlık Kritiği</label>
                                              <select
                                                  value={formData.asset_criticality}
                                                  onChange={e=>setFormData({...formData, asset_criticality: e.target.value})}
                                                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-bold"
                                              >
                                                  <option value="Minor">Düşük</option>
                                                  <option value="Major">Orta</option>
                                                  <option value="Critical">Kritik</option>
                                              </select>
                                          </div>
                                      </div>
                                  )}
                              </div>

                              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                                  <div><p className="font-bold text-sm text-slate-800">Aksiyon Tipi (SLA)</p></div>
                                  <select
                                      value={formData.sla_type}
                                      onChange={e => setFormData({...formData, sla_type: e.target.value})}
                                      className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm font-bold"
                                  >
                                      <option value="FIXED_DATE">Takvim Günü</option>
                                      <option value="AGILE_SPRINT">Agile Sprint</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                  </div>
                )}

                {/* KÖK NEDEN */}
                {activeSection === 'koken' && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 h-[500px] flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4 shrink-0">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div><h3 className="text-lg font-bold text-slate-900">Kök Neden Özeti (Cause)</h3></div>
                      </div>

                      {/* UNIVERSAL DRAWER BUTON */}
                      <button
                          type="button"
                          onClick={() => setIsUniversalDrawerOpen(true)}
                          className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm ring-1 ring-inset ring-red-100"
                      >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                          Gelişmiş RCA Aracı
                      </button>
                    </div>

                    <div className="mb-6 shrink-0">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kök Neden Kategorisi</label>
                        <select
                            value={formData.rca_category}
                            onChange={(e) => setFormData({ ...formData, rca_category: e.target.value })}
                            className="w-full md:w-1/2 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
                        >
                          <option value="">Kategori Seçiniz...</option>
                          {rcaCategories.map(cat => (
                              <option key={cat.id} value={cat.label}>{cat.label}</option>
                          ))}
                        </select>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kök Neden Açıklaması</label>
                        <RichTextEditor
                            value={formData.root_cause_html}
                            onChange={(val) => setFormData({...formData, root_cause_html: val})}
                            placeholder="Kök neden analizinizin sonucunu detaylı olarak açıklayın..."
                            minHeight="min-h-full"
                        />
                    </div>
                  </div>
                )}

                {/* ÖNERİ */}
                {activeSection === 'oneri' && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 h-[500px] flex flex-col">
                    <div className="flex items-center justify-between mb-5 shrink-0 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                              <Lightbulb className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div><h3 className="text-lg font-bold text-slate-900">Öneri (Recommendation)</h3></div>
                      </div>
                      <button
                          type="button"
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold flex items-center gap-2 shadow-sm"
                      >
                          <Sparkles className="w-4 h-4" /> AI Taslak Oluştur
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      <RichTextEditor
                          value={formData.recommendation_html}
                          onChange={(val) => setFormData({...formData, recommendation_html: val})}
                          placeholder="Bulgunun düzeltilmesi için önerilerinizi zengin metin olarak yazın..."
                          minHeight="min-h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between p-5 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
            <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold border border-transparent hover:border-slate-200"
            >
                İptal Et
            </button>
            <div className="flex gap-3">
              <button
                  onClick={() => handleSave('DRAFT')}
                  className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 shadow-sm rounded-lg hover:bg-slate-50 transition-colors font-bold"
                  disabled={isSubmitting}
              >
                  Taslak Olarak Kaydet
              </button>
              <button
                  onClick={() => handleSave('PUBLISHED')}
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-black flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Kaydediliyor...</> : <><Save className="w-5 h-5" /> Bulguyu Sisteme İşle</>}
              </button>
            </div>
          </div>
        </div>

      </div>

      <RegulationSelectorModal
          isOpen={isRegulationModalOpen}
          onClose={() => setIsRegulationModalOpen(false)}
          onSelect={(reg) => {
              const regHtml = `<p><strong>Kategori:</strong> ${reg.category}</p><p><strong>Mevzuat:</strong> ${reg.title}</p><p><strong>Detay:</strong> ${reg.description}</p>`;
              setFormData(prev => ({ ...prev, code: reg.code, criteria_html: regHtml }));
              setSelectedRegulation(reg);
          }}
      />

      {/* UNIVERSAL DRAWER (SINGLE SOURCE OF TRUTH) */}
      <UniversalFindingDrawer
        findingId={null} // Yeni bulgu için ID yok
        isOpen={isUniversalDrawerOpen}
        defaultTab="rca" // RCA sekmesinde başlat
        onClose={() => setIsUniversalDrawerOpen(false)}
        onApplyRCA={(html, rawData) => {
            // Çekmeceden gelen RCA verisini forma aktar
            console.log('RCA Applied from Universal Drawer:', { html, rawData });
            setFormData(prev => ({
                ...prev,
                root_cause_html: html,
                rca_category: rawData?.category || prev.rca_category
            }));
            setIsUniversalDrawerOpen(false);
        }}
      />
    </div>
  );
};