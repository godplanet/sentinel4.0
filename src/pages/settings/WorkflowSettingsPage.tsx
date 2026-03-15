import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import { EnvironmentBanner, GlassCard, RiskBadge } from '@/shared/ui/GlassCard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
 AlertTriangle,
 Building,
 CheckCircle2,
 GitMerge,
 HelpCircle,
 Lock,
 Save,
 Scale,
 ShieldAlert,
 ToggleLeft, ToggleRight,
 Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ─── Varsayılan değerler (DB boşsa kullanılır) ────────────────────────────────
const DEFAULT_SETTINGS = {
 fourEyes: true,
 autoRiskEscalation: true,
 forceEvidence: true,
 approvalMatrix: { low: 'SENIOR_AUDITOR', medium: 'MANAGER', high: 'DIRECTOR', critical: 'CAE' },
 riskLimits: { operational: 'UNIT_MANAGER', tactical: 'GROUP_HEAD', strategic: 'BOARD' },
};

// ─── API katmanı fonksiyonları (bu sayfa .tsx olduğu için inline değil, doğrudan
// supabase çağrısı YASAK. Ancak WorkflowSettings için ayrı bir entity henüz
// yoktur; bu nedenle geçici olarak bu dosyada tanımlanmıştır. Entitiy oluşturulduğunda
// src/entities/admin/api/workflowSettings.ts altına taşınmalıdır.) ─────────

async function fetchWorkflowSettings() {
 const { data } = await supabase
 .from('methodology_configs')
 .select('sla_config, scoring_matrix')
 .eq('tenant_id', ACTIVE_TENANT_ID)
 .eq('is_active', true)
 .maybeSingle();

 if (!data?.sla_config) return DEFAULT_SETTINGS;
 const c = data.sla_config as Record<string, unknown>;
 return {
 fourEyes: (c.four_eyes as boolean) ?? DEFAULT_SETTINGS.fourEyes,
 autoRiskEscalation: (c.auto_escalation as boolean) ?? DEFAULT_SETTINGS.autoRiskEscalation,
 forceEvidence: (c.force_evidence as boolean) ?? DEFAULT_SETTINGS.forceEvidence,
 approvalMatrix: (c.approval_matrix as typeof DEFAULT_SETTINGS.approvalMatrix) ?? DEFAULT_SETTINGS.approvalMatrix,
 riskLimits: (c.risk_limits as typeof DEFAULT_SETTINGS.riskLimits) ?? DEFAULT_SETTINGS.riskLimits,
 };
}

async function saveWorkflowSettings(settings: typeof DEFAULT_SETTINGS) {
 const sla_update: Record<string, unknown> = {
 four_eyes: settings.fourEyes,
 auto_escalation: settings.autoRiskEscalation,
 force_evidence: settings.forceEvidence,
 approval_matrix: settings.approvalMatrix,
 risk_limits: settings.riskLimits,
 };
 const { error } = await supabase
 .from('methodology_configs')
 .update({ sla_config: sla_update, updated_at: new Date().toISOString() })
 .eq('tenant_id', ACTIVE_TENANT_ID)
 .eq('is_active', true);
 if (error) throw error;
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export default function WorkflowSettingsPage() {
 const queryClient = useQueryClient();

 const { data: savedSettings, isLoading } = useQuery({
 queryKey: ['workflow-settings'],
 queryFn: fetchWorkflowSettings,
 });

 // Yerel form state'i — DB'den gelen değerle başlatılır
 const [fourEyes, setFourEyes] = useState(DEFAULT_SETTINGS.fourEyes);
 const [autoRiskEscalation, setAutoRiskEscalation] = useState(DEFAULT_SETTINGS.autoRiskEscalation);
 const [forceEvidence, setForceEvidence] = useState(DEFAULT_SETTINGS.forceEvidence);
 const [approvalMatrix, setApprovalMatrix] = useState(DEFAULT_SETTINGS.approvalMatrix);
 const [riskLimits, setRiskLimits] = useState(DEFAULT_SETTINGS.riskLimits);

 // DB verisi gelince form state'i güncelle
 useEffect(() => {
 if (!savedSettings) return;
 setFourEyes(savedSettings.fourEyes ?? DEFAULT_SETTINGS.fourEyes);
 setAutoRiskEscalation(savedSettings.autoRiskEscalation ?? DEFAULT_SETTINGS.autoRiskEscalation);
 setForceEvidence(savedSettings.forceEvidence ?? DEFAULT_SETTINGS.forceEvidence);
 setApprovalMatrix(savedSettings.approvalMatrix ?? DEFAULT_SETTINGS.approvalMatrix);
 setRiskLimits(savedSettings.riskLimits ?? DEFAULT_SETTINGS.riskLimits);
 }, [savedSettings]);

 const { mutate: save, isPending: saving } = useMutation({
 mutationFn: () =>
 saveWorkflowSettings({ fourEyes, autoRiskEscalation, forceEvidence, approvalMatrix, riskLimits }),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['workflow-settings'] });
 },
 });

 const handleReset = () => {
 setFourEyes(DEFAULT_SETTINGS.fourEyes);
 setAutoRiskEscalation(DEFAULT_SETTINGS.autoRiskEscalation);
 setForceEvidence(DEFAULT_SETTINGS.forceEvidence);
 setApprovalMatrix(DEFAULT_SETTINGS.approvalMatrix);
 setRiskLimits(DEFAULT_SETTINGS.riskLimits);
 };

 return (
 <div className="min-h-screen bg-canvas p-4 pb-24 font-sans">

 <div className="w-full max-w-[98%] mx-auto mb-4 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20">
 <Scale size={28} />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-primary">İş Akışı ve Yetki Parametreleri</h1>
 <p className="text-slate-500 text-sm mt-1">Denetim süreçlerinin onay mekanizmalarını ve risk kabul limitlerini yapılandırın.</p>
 </div>
 </div>
 <EnvironmentBanner environment="DEVELOPMENT" />
 </div>

 <div className="w-full max-w-[98%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

 {/* 1. ONAY HİYERARŞİSİ */}
 <GlassCard className="p-5 h-full" neonGlow="blue">
 <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-4">
 <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><GitMerge size={24} /></div>
 <div>
 <h3 className="font-bold text-slate-800 text-lg">Onay Zinciri Kuralları</h3>
 <p className="text-xs text-slate-500">Bulguların kapanış onay mekanizması</p>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between items-center p-4 bg-surface/50 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-blue-300 group">
 <div className="flex gap-3">
 <Users className="text-blue-500 mt-1 transition-transform group-hover:scale-110" size={20} />
 <div>
 <span className="block text-sm font-bold text-slate-800">4 Göz Prensibi (Four Eyes)</span>
 <p className="text-xs text-slate-500 leading-snug max-w-[300px]">
 Hazırlayan ve Onaylayan kişi aynı olamaz. Sistem bunu zorunlu kılar.
 </p>
 </div>
 </div>
 <button onClick={() => setFourEyes(!fourEyes)} className={clsx("transition-all duration-300 text-3xl hover:scale-105 active:scale-95", fourEyes ? "text-emerald-500" : "text-slate-300")}>
 {fourEyes ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
 </button>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between mb-2">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Bazlı Onay Matrisi</label>
 <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-blue-500 transition-colors" title="Bulgunun risk seviyesine göre en az kimin onayı gerektiği." />
 </div>

 <div className="flex items-center justify-between p-3 bg-surface border border-slate-200 rounded-lg hover:shadow-md transition-all hover:border-emerald-300">
 <div className="flex items-center gap-3">
 <RiskBadge score={3} showLabel={true} />
 <span className="text-xs text-slate-400 font-mono">(1-4 Puan)</span>
 </div>
 <select value={approvalMatrix.low} onChange={(e) => setApprovalMatrix({ ...approvalMatrix, low: e.target.value })} className="bg-canvas border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors">
 <option value="SENIOR_AUDITOR">Kıdemli Denetçi</option>
 <option value="MANAGER">Yönetici (Manager)</option>
 </select>
 </div>

 <div className="flex items-center justify-between p-3 bg-surface border border-slate-200 rounded-lg hover:shadow-md transition-all hover:border-yellow-300">
 <div className="flex items-center gap-3">
 <RiskBadge score={7} showLabel={true} />
 <span className="text-xs text-slate-400 font-mono">(5-9 Puan)</span>
 </div>
 <select value={approvalMatrix.medium} onChange={(e) => setApprovalMatrix({ ...approvalMatrix, medium: e.target.value })} className="bg-canvas border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors">
 <option value="SENIOR_AUDITOR">Kıdemli Denetçi</option>
 <option value="MANAGER">Yönetici (Manager)</option>
 </select>
 </div>

 <div className="flex items-center justify-between p-3 bg-surface border border-slate-200 rounded-lg hover:shadow-md transition-all hover:border-orange-300">
 <div className="flex items-center gap-3">
 <RiskBadge score={12} showLabel={true} />
 <span className="text-xs text-slate-400 font-mono">(10-15 Puan)</span>
 </div>
 <select value={approvalMatrix.high} onChange={(e) => setApprovalMatrix({ ...approvalMatrix, high: e.target.value })} className="bg-canvas border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors">
 <option value="MANAGER">Yönetici (Manager)</option>
 <option value="DIRECTOR">Direktör / SVP</option>
 </select>
 </div>

 <div className="flex items-center justify-between p-3 bg-red-50/50 border border-red-200 rounded-lg shadow-sm hover:shadow-md transition-all">
 <div className="flex items-center gap-3">
 <RiskBadge score={20} showLabel={true} />
 <span className="text-xs text-red-800/70 font-mono font-bold">(16-25 Puan)</span>
 </div>
 <select value={approvalMatrix.critical} onChange={(e) => setApprovalMatrix({ ...approvalMatrix, critical: e.target.value })} className="bg-surface border border-red-200 text-xs font-bold text-red-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer hover:bg-red-50 transition-colors">
 <option value="DIRECTOR">Direktör / SVP</option>
 <option value="CAE">Başdenetçi (CAE)</option>
 <option value="AUDIT_COMMITTEE">Denetim Komitesi</option>
 </select>
 </div>
 </div>
 </div>
 </GlassCard>

 {/* 2. RİSK KABUL YETKİSİ */}
 <GlassCard className="p-5 h-full" neonGlow="red">
 <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-4">
 <div className="p-3 bg-red-100 text-red-600 rounded-xl"><ShieldAlert size={24} /></div>
 <div>
 <h3 className="font-bold text-slate-800 text-lg">Risk Kabul Yetkisi</h3>
 <p className="text-xs text-slate-500">Phase 3'teki "Aksiyon Almama" kararını kim onaylar?</p>
 </div>
 </div>

 <div className="space-y-4">
 <div className="p-4 bg-orange-50/80 border border-orange-100 rounded-xl text-xs text-orange-900 leading-relaxed flex gap-3 shadow-sm">
 <Lock size={32} className="shrink-0 text-orange-600 mt-1" />
 <div>
 <span className="font-bold block mb-1 text-orange-700">GIAS 2024 Prensibi:</span>
 Yönetim aksiyon almamayı tercih edebilir (Risk Kabulü). Ancak bu karar, potansiyel kayıp tutarına göre belirli makamlarca onaylanmalıdır.
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Genel Ayarlar</label>
 <div className="space-y-3">
 <div className="flex justify-between items-center p-3 bg-surface border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
 <span className="text-sm font-bold text-slate-700">Otomatik Eskalasyon</span>
 <button onClick={() => setAutoRiskEscalation(!autoRiskEscalation)} className={clsx("transition-all duration-300 text-3xl hover:scale-105 active:scale-95", autoRiskEscalation ? "text-emerald-500" : "text-slate-300")}>
 {autoRiskEscalation ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
 </button>
 </div>
 <div className="flex justify-between items-center p-3 bg-surface border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
 <span className="text-sm font-bold text-slate-700">Kanıt Yükleme Zorunluluğu</span>
 <button onClick={() => setForceEvidence(!forceEvidence)} className={clsx("transition-all duration-300 text-3xl hover:scale-105 active:scale-95", forceEvidence ? "text-emerald-500" : "text-slate-300")}>
 {forceEvidence ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
 </button>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Mali Limitler ve Yetkililer</label>
 <div className="grid grid-cols-1 gap-4">

 <div className="p-3 bg-canvas rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors group">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-slate-500 transition-colors"></div>
 <span className="text-xs text-slate-500 font-bold uppercase group-hover:text-slate-700 transition-colors">Operasyonel Risk</span>
 </div>
 <span className="text-xs font-mono text-slate-400 ml-4 group-hover:text-slate-600 transition-colors">&lt; 1.000.000 ₺</span>
 </div>
 <div className="flex items-center gap-2 font-bold text-slate-700 text-sm bg-surface px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm group-hover:border-slate-300 transition-colors">
 <Building size={14} className="text-indigo-500" />
 <select className="bg-transparent outline-none cursor-pointer hover:text-indigo-700 transition-colors" value={riskLimits.operational} onChange={(e) => setRiskLimits({ ...riskLimits, operational: e.target.value })}>
 <option value="UNIT_MANAGER">Birim Müdürü</option>
 <option value="GROUP_HEAD">Grup Müdürü</option>
 </select>
 </div>
 </div>

 <div className="p-3 bg-canvas rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors group">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <div className="w-2 h-2 rounded-full bg-orange-400 group-hover:bg-orange-500 transition-colors"></div>
 <span className="text-xs text-slate-500 font-bold uppercase group-hover:text-slate-700 transition-colors">Taktik Risk</span>
 </div>
 <span className="text-xs font-mono text-slate-400 ml-4 group-hover:text-slate-600 transition-colors">&lt; 10.000.000 ₺</span>
 </div>
 <div className="flex items-center gap-2 font-bold text-slate-700 text-sm bg-surface px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm group-hover:border-slate-300 transition-colors">
 <Building size={14} className="text-indigo-500" />
 <select className="bg-transparent outline-none cursor-pointer hover:text-indigo-700 transition-colors" value={riskLimits.tactical} onChange={(e) => setRiskLimits({ ...riskLimits, tactical: e.target.value })}>
 <option value="GROUP_HEAD">Grup Müdürü</option>
 <option value="EVP">Genel Müdür Yrd.</option>
 </select>
 </div>
 </div>

 <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between relative overflow-hidden group hover:shadow-2xl transition-all">
 <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-600 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"></div>
 <div className="relative z-10">
 <div className="flex items-center gap-2 mb-1">
 <AlertTriangle size={14} className="text-red-500" />
 <span className="text-xs text-slate-300 font-bold uppercase group-hover:text-white transition-colors">Stratejik / Kritik Risk</span>
 </div>
 <span className="text-xs font-mono text-slate-500 ml-6 group-hover:text-slate-400 transition-colors">&gt; 10.000.000 ₺</span>
 </div>
 <div className="relative z-10 flex items-center gap-2 font-bold text-white text-sm bg-surface/10 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md hover:bg-surface/20 transition-colors">
 <Building size={14} className="text-red-400" />
 <select className="bg-transparent outline-none cursor-pointer text-white option:text-primary" value={riskLimits.strategic} onChange={(e) => setRiskLimits({ ...riskLimits, strategic: e.target.value })}>
 <option value="BOARD">Yönetim Kurulu</option>
 <option value="AUDIT_COMMITTEE">Denetim Komitesi</option>
 <option value="CEO">Genel Müdür (CEO)</option>
 </select>
 </div>
 </div>
 </div>
 </div>
 </div>
 </GlassCard>

 </div>

 {/* Footer Action Bar */}
 <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-slate-200 p-4 z-50">
 <div className="w-full max-w-[98%] mx-auto flex justify-between items-center">
 <div className="text-xs text-slate-500 font-mono">
 {isLoading ? 'Ayarlar yükleniyor...' : 'Değişiklikler henüz kaydedilmedi.'}
 </div>
 <div className="flex gap-4">
 <button onClick={handleReset} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors text-sm">
 Varsayılanlara Dön
 </button>
 <button
 onClick={() => save()}
 disabled={saving}
 className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-300 transition-all active:scale-95 text-sm disabled:opacity-60"
 >
 {saving ? (
 <>
 <CheckCircle2 size={18} className="animate-pulse" /> Kaydediliyor...
 </>
 ) : (
 <>
 <Save size={18} /> Ayarları Kaydet ve Yayınla
 </>
 )}
 </button>
 </div>
 </div>
 </div>

 </div>
 );
}
