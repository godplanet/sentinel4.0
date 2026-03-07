/**
 * DeepfakeScanner — Wave 78: Deepfake & Synthetic Identity Shield
 * %100 Light Mode | Apple Glassmorphism | Real Supabase
 */

import { useState } from 'react';
import {
  ScanFace, Mic, ShieldAlert, Fingerprint, Activity, UserX,
  CheckCircle2, AlertTriangle, PlayCircle, Eye, Settings, PauseCircle
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  useBiometricAudits,
  useDeepfakeAlerts,
  useKycSyntheticLogs,
  useUpdateAlertAction,
  type BiometricAudit,
  type DeepfakeAlert,
  type KycSyntheticLog,
  type ActionTaken,
} from '@/features/synthetic-fraud/api';

// ─── Config ───────────────────────────────────────────────────────────────────

const SEVERITY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Kritik Risk', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  high:     { label: 'Yüksek',      color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  medium:   { label: 'Orta',        color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

const ACTION_CFG: Record<ActionTaken, { label: string; color: string }> = {
  blocked:            { label: 'Engellendi', color: 'text-red-600 bg-red-50' },
  session_terminated: { label: 'Oturum Kesildi', color: 'text-orange-600 bg-orange-50' },
  flagged:            { label: 'İşaretlendi', color: 'text-blue-600 bg-blue-50' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function DeepfakeScanner() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'biometric' | 'synthetic'>('alerts');

  const { data: audits = [], isLoading: auditsLoading } = useBiometricAudits();
  const { data: alerts = [], isLoading: alertsLoading } = useDeepfakeAlerts();
  const { data: kycLogs = [], isLoading: kycLoading } = useKycSyntheticLogs();
  
  const updateAction = useUpdateAlertAction();

  const handleUpdateAction = async (id: string, action_taken: ActionTaken) => {
    try {
      await updateAction.mutateAsync({ id, action_taken });
      toast.success(`Aksiyon güncellendi: ${action_taken}`);
    } catch {
      toast.error('Aksiyon güncellenemedi.');
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const passedBioCount = audits.filter(a => a.status === 'passed').length;
  const badKycCount = kycLogs.filter(k => k.decision === 'reject').length;

  return (
    <div className="space-y-5">
      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ScanFace}
          label="Biyometrik Analiz"
          value={auditsLoading ? '…' : String(audits.length)}
          sub="Toplam canlılık tespit testi"
          color="blue"
        />
        <StatCard
          icon={ShieldAlert}
          label="Deepfake Alarmı (Kritik)"
          value={alertsLoading ? '…' : String(criticalCount)}
          sub="Yüz & Ses sentezi şüphesi"
          color="red"
        />
        <StatCard
          icon={Fingerprint}
          label="Sentetik Kimlik (KYC)"
          value={kycLoading ? '…' : String(badKycCount)}
          sub="Reddedilen Frankeştayn Kimlikler"
          color="orange"
        />
        <StatCard
          icon={CheckCircle2}
          label="Başarılı Doğrulama"
          value={auditsLoading ? '…' : String(passedBioCount)}
          sub="Maske / AI tespit edilmedi"
          color="emerald"
        />
      </div>

      {/* Main panel */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-100 to-red-50/50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center">
              <ScanFace size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Deepfake & Sentetik Kimlik Kalkanı</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Biyometrik Analiz ve Ses Frekans Taraması — Wave 78</p>
            </div>
          </div>

          <div className="flex bg-slate-200/50 rounded-lg p-0.5">
            {(['alerts', 'biometric', 'synthetic'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                  activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab === 'alerts' ? 'Deepfake Alarmları' : tab === 'biometric' ? 'Biyometrik İzler' : 'Sentetik Kimlikler'}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Deepfake Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {alertsLoading ? (
              <LoadingState label="Sentetik medya tarama motoru çalışıyor..." />
            ) : alerts.length === 0 ? (
              <EmptyState icon={ShieldAlert} label="Deepfake Tespit Edilmedi" sub="İzlenen oturumlarda ses veya görüntü manipülasyonuna rastlanmadı." />
            ) : (
              alerts.map(alert => (
                <DeepfakeAlertRow 
                  key={alert.id} 
                  alert={alert} 
                  onActionUpdate={(act) => handleUpdateAction(alert.id, act)} 
                  isUpdating={updateAction.isPending && (updateAction.variables as any)?.id === alert.id} 
                />
              ))
            )}
          </div>
        )}

        {/* 2. Biometric Audits Tab */}
        {activeTab === 'biometric' && (
          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto bg-slate-50/50">
             {auditsLoading ? <LoadingState label="Ses ve yüz modellemeleri okunuyor..." /> :
              audits.length === 0 ? <EmptyState icon={Activity} label="Biyometrik Log Yok" sub="Mevcut oturum doğrulaması bulunamadı." /> :
              audits.map(audit => <BiometricAuditRow key={audit.id} audit={audit} />)
             }
          </div>
        )}

        {/* 3. KYC Synthetic Tab */}
        {activeTab === 'synthetic' && (
          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
             {kycLoading ? <LoadingState label="KYC verileri ve karanlık ağ eşleşmeleri aranıyor..." /> :
              kycLogs.length === 0 ? <EmptyState icon={UserX} label="Kimlik Şüphesi Yok" sub="Sentetik kimlik logu bulunmuyor." /> :
              kycLogs.map(log => <KycSyntheticRow key={log.id} log={log} />)
             }
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function DeepfakeAlertRow({ alert: a, onActionUpdate, isUpdating }: { alert: DeepfakeAlert; onActionUpdate: (ac: ActionTaken) => void; isUpdating: boolean }) {
  const sevCfg = SEVERITY_CFG[a.severity] ?? SEVERITY_CFG.medium;
  const actCfg = ACTION_CFG[a.action_taken];
  const CustomerInfo = a.biometric_audits ? `${a.biometric_audits.customer_id} (${a.biometric_audits.channel})` : 'Bilinmeyen Kanal';

  return (
    <div className="px-5 py-4 flex flex-col hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', sevCfg.bg, sevCfg.color)}>
            <ScanFace size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={clsx('text-[10px] font-bold border px-1.5 py-0.5 rounded uppercase', sevCfg.bg, sevCfg.color)}>
                {sevCfg.label}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                %{a.deepfake_probability} SENTETİK İHTİMALİ
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">{a.alert_type.replace(/_/g, ' ')} Tespiti</h4>
          </div>
        </div>
        <div className="text-right">
           <span className={clsx('text-[10px] font-bold uppercase py-1 px-2 rounded-lg', actCfg.color)}>
             Durum: {actCfg.label}
           </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 bg-white border border-slate-100 rounded-lg p-3 mb-3 leading-relaxed shadow-sm">
        {a.description}
      </p>

      {/* Artifacts Mock Visualizer */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
         <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 relative overflow-hidden flex items-center justify-center min-h-[80px]">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            {/* Audio Waveform mock */}
            <div className="flex items-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1 bg-amber-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <p className="absolute bottom-1 left-2 text-[9px] text-amber-500 font-mono tracking-widest uppercase opacity-70">
              Audio Frequency Jump: Aktif
            </p>
         </div>
         <div className="w-full md:w-1/3 flex flex-col justify-center gap-1.5 text-[10px] font-mono">
            {Object.entries(a.detected_artifacts || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                <strong className={val ? 'text-red-500' : 'text-emerald-500'}>{String(val)}</strong>
              </div>
            ))}
         </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
        <span className="text-[11px] font-bold text-slate-400">{CustomerInfo}</span>
        <div className="flex gap-2">
          {a.action_taken !== 'blocked' && (
            <button onClick={() => onActionUpdate('blocked')} disabled={isUpdating} className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700 transition">
              Kalıcı Engelle
            </button>
          )}
          {a.action_taken !== 'session_terminated' && (
            <button onClick={() => onActionUpdate('session_terminated')} disabled={isUpdating} className="px-3 py-1 text-xs font-bold border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition">
              Oturumu Kes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BiometricAuditRow({ audit: a }: { audit: BiometricAudit }) {
  const isFailed = a.status === 'failed';
  return (
    <div className="px-5 py-3 hover:bg-white transition-colors flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {isFailed ? <AlertTriangle size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />}
        <div>
           <p className="text-xs font-bold text-slate-800">{a.session_id}</p>
           <p className="text-[10px] text-slate-500">{a.channel} · User: {a.customer_id}</p>
        </div>
      </div>
      <div className="flex gap-6 text-center">
         <div>
           <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Canlılık (Liveliness)</p>
           <p className={clsx("text-sm font-black", Number(a.liveliness_score) < 50 ? 'text-red-600' : 'text-emerald-600')}>%{a.liveliness_score}</p>
         </div>
         <div>
           <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Ses (Voice Match)</p>
           <p className={clsx("text-sm font-black", Number(a.voice_match_score) < 50 ? 'text-red-600' : 'text-emerald-600')}>%{a.voice_match_score}</p>
         </div>
         <div>
           <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Yüz (Face Match)</p>
           <p className={clsx("text-sm font-black", Number(a.face_match_score) < 50 ? 'text-red-600' : 'text-emerald-600')}>%{a.face_match_score}</p>
         </div>
      </div>
    </div>
  );
}

function KycSyntheticRow({ log: k }: { log: KycSyntheticLog }) {
  const isReject = k.decision === 'reject';
  return (
    <div className="px-5 py-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-start justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <UserX size={14} className={isReject ? 'text-red-500' : 'text-slate-400'} />
          <h4 className="text-sm font-bold text-slate-800">{k.applicant_name}</h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded font-mono">ID: {k.national_id}</span>
        </div>
        <p className="text-xs text-slate-500">Sentetik kimlik riski hesaplama algoritmasına göre bu başvuru değerlendirildi.</p>
        <div className="mt-2 flex gap-1 flex-wrap">
          {Object.entries(k.risk_factors || {}).map(([key, val]) => val && (
            <span key={key} className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded capitalize">
              {key.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 border-l border-slate-100 pl-4 h-full">
         <div className="text-center">
           <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Risk Skoru</p>
           <p className={clsx("text-lg font-black", Number(k.synthetic_risk_score) > 70 ? 'text-red-600' : 'text-emerald-600')}>
             {k.synthetic_risk_score}
           </p>
         </div>
         <div className={clsx(
           'px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest',
           isReject ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
         )}>
           {k.decision}
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  const map: Record<string, string> = {
    slate:   'bg-slate-50 border-slate-200 text-slate-600',
    red:     'bg-red-50 border-red-200 text-red-600',
    orange:  'bg-orange-50 border-orange-200 text-orange-600',
    blue:    'bg-blue-50 border-blue-200 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  };
  return (
    <div className={clsx('rounded-xl border p-4', map[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] opacity-70 mt-1 truncate">{sub}</p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-slate-400 h-full">
      <Activity size={24} className="animate-spin text-slate-400" />
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, label, sub }: { icon: any; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center h-full">
      <Icon size={48} className="text-slate-200 mb-4" />
      <p className="text-base font-bold text-slate-700">{label}</p>
      <p className="text-xs text-slate-400 mt-2 max-w-xs">{sub}</p>
    </div>
  );
}
