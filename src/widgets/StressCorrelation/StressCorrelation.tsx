/**
 * Wave 85: Employee Stress & Fraud Correlation Engine (StressCorrelation)
 * Apple Glassmorphism stili, %100 Light Mode, Null (?. || []) guard'lı suiistimal üçgeni radarı.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, AlertTriangle, UserMinus, ShieldQuestion,
  TrendingDown, FileWarning, Search, Eye, Filter, Loader2, Info
} from 'lucide-react';
import clsx from 'clsx';
import {
  useFraudCorrelationRadar,
  type FinancialStress,
  type FraudTriangle,
  type HRCorrelationAlert,
  type AlertSeverity
} from '@/features/hr-fraud-radar/api';

/* ──────────────────────────────────────────────────────────
   Config & Metrics Mappings
   ────────────────────────────────────────────────────────── */

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  LOW: 'text-blue-500 bg-blue-50 border-blue-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
  CRITICAL: 'text-red-700 bg-red-50 border-red-300',
};

function getIndicatorColor(score: number): string {
  if (score >= 80) return 'text-red-600 bg-red-50';
  if (score >= 60) return 'text-orange-600 bg-orange-50';
  return 'text-emerald-600 bg-emerald-50';
}

/* ──────────────────────────────────────────────────────────
   Components
   ────────────────────────────────────────────────────────── */

function FraudTriangleCard({
  triangle,
  stressLogger
}: {
  triangle: FraudTriangle;
  stressLogger?: FinancialStress;
}) {
  const isCritical = triangle.total_fraud_risk >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'p-5 rounded-2xl border bg-surface relative overflow-hidden transition-all',
        isCritical ? 'border-red-200 shadow-sm shadow-red-100/50' : 'border-slate-200 shadow-sm'
      )}
    >
      {isCritical && (
        <div className="absolute -top-12 -right-12 opacity-[0.03] text-red-900 pointer-events-none">
          <AlertTriangle size={200} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
            <UserMinus size={18} />
          </div>
          <div>
            <div className="font-bold text-sm text-primary flex items-center gap-2">
              {triangle.anon_employee_id}
            </div>
            {stressLogger && (
              <div className="text-[11px] text-slate-500">{stressLogger.department} • {stressLogger.job_title}</div>
            )}
          </div>
        </div>
        <div className={clsx('px-3 py-1.5 rounded-lg border text-lg font-black flex items-baseline gap-1', getIndicatorColor(triangle.total_fraud_risk))}>
          {triangle.total_fraud_risk.toFixed(1)}<span className="text-[10px] font-bold opacity-60">%</span>
        </div>
      </div>

      {/* Fraud Triangle Legs */}
      <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
        <div className="border border-slate-100 bg-slate-50/50 rounded-lg p-2 text-center">
          <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Baskı</div>
          <div className={clsx('font-black text-sm', triangle.pressure_score >= 80 ? 'text-red-500' : 'text-slate-700')}>{triangle.pressure_score}%</div>
        </div>
        <div className="border border-slate-100 bg-slate-50/50 rounded-lg p-2 text-center">
          <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Fırsat</div>
          <div className={clsx('font-black text-sm', triangle.opportunity_score >= 80 ? 'text-red-500' : 'text-slate-700')}>{triangle.opportunity_score}%</div>
        </div>
        <div className="border border-slate-100 bg-slate-50/50 rounded-lg p-2 text-center">
          <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Rasyonalizasyon</div>
          <div className={clsx('font-black text-sm', triangle.rationalization_score >= 80 ? 'text-orange-500' : 'text-slate-700')}>{triangle.rationalization_score}%</div>
        </div>
      </div>

      {/* Stress Triggers (if linked) */}
      {stressLogger && (
        <div className="flex flex-wrap gap-2 relative z-10">
          {stressLogger.salary_garnishment && <span className="px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold">Maaş Haczi / İcra</span>}
          {stressLogger.credit_score_drop && <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold">Ani Kredi Skoru Düşüşü</span>}
          {stressLogger.lifestyle_mismatch && <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold">Yaşam Tarzı Sapması</span>}
        </div>
      )}
    </motion.div>
  );
}

function AlertRow({ alert }: { alert: HRCorrelationAlert }) {
  const isCritical = alert.alert_severity === 'CRITICAL';
  return (
    <div className={clsx(
      'p-4 rounded-xl border mb-3 flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden transition-colors',
      isCritical ? 'bg-red-50/40 border-red-200' : 'bg-surface border-slate-200'
    )}>
      {isCritical && <div className="absolute left-0 top-0 w-1.5 h-full bg-red-500"></div>}
      
      <div className="flex-1 pd-l-3 lg:pl-0">
        <div className="flex items-center gap-2 mb-1">
          {isCritical ? <ShieldAlert size={16} className="text-red-600 animate-pulse" /> : <ShieldQuestion size={16} className="text-orange-500" />}
          <div className="font-bold text-sm text-primary uppercase">{alert.fraud_vector.replace(/_/g, ' ')}</div>
          <span className={clsx('px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ml-2', SEVERITY_COLORS[alert.alert_severity])}>
            {alert.alert_severity}
          </span>
          <span className="text-xs font-mono font-bold text-slate-400 border border-slate-200 bg-white px-2 rounded-md">{alert.anon_employee_id}</span>
        </div>
        <p className="text-sm text-slate-600 font-medium leading-relaxed leading-6 mt-2">
          {alert.description}
        </p>
      </div>

      <div className="md:w-32 flex shrink-0 mt-2 md:mt-0 justify-end">
         <span className={clsx(
           'px-3 py-1 rounded-md text-xs font-bold uppercase',
           alert.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600 border border-blue-100'
         )}>
           {alert.status}
         </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Widget Export
   ────────────────────────────────────────────────────────── */

export function StressCorrelation() {
  const { data, isLoading, isError } = useFraudCorrelationRadar();
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PROFILES'>('ALERTS');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3">
        <AlertTriangle className="text-red-500 w-6 h-6" />
        <p className="text-red-800 text-sm">Finansal stres veya Fraud motoruna erişilirken ağ hatası oluştu.</p>
      </div>
    );
  }

  const { stressLogs, triangleScores, alerts, averageFraudRisk, totalCriticalAlerts } = data;

  return (
    <div className="space-y-6">
      
      {/* Overview Banner (Apple Glass) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute left-0 bottom-0 opacity-[0.05] pointer-events-none transform -translate-x-1/4 translate-y-1/4">
          <Eye size={280} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="text-blue-400" />
              <h2 className="text-xl font-bold tracking-tight">Personel Stres & Suiistimal Motoru</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Anonimleştirilmiş finansal stres indikatörleri ile bölüm/işlem yetkilerini birleştirerek potansiyel Fraud (Suiistimal) üçgenlerini tespit eden gözetim motoru.
            </p>
          </div>

          <div className="flex gap-4 md:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">Ort. Risk Faktörü</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{averageFraudRisk.toFixed(1)}</span>
                <span className="text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>
            
            <div className="w-px h-12 bg-slate-700/50 hidden md:block self-center"></div>

            <div className="flex flex-col">
              <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">Açık Alarmlar</span>
              <div className="flex items-baseline gap-2">
                <span className={clsx('text-3xl font-black', totalCriticalAlerts > 0 ? 'text-red-400 animate-pulse' : 'text-slate-200')}>
                  {totalCriticalAlerts}
                </span>
                <span className="text-xs font-medium text-slate-500">Adet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-2 pt-2">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={clsx(
              'px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
              activeTab === 'ALERTS' ? 'border-red-500 text-red-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            )}
          >
            <FileWarning size={16} /> Aktif Alarmlar ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILES')}
            className={clsx(
              'px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
              activeTab === 'PROFILES' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            )}
          >
            <Filter size={16} /> Riskli Profiller (Fraud Triangle)
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5">
          {activeTab === 'ALERTS' && (
            <div>
               {alerts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-sm">
                   <ShieldAlert size={48} className="text-emerald-100 mb-2" />
                   Suiistimal korelasyonu algılanmadı.
                 </div>
               ) : (
                 <div className="max-h-[600px] overflow-y-auto pr-2">
                   {(alerts || []).map(alert => <AlertRow key={alert.id} alert={alert} />)}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'PROFILES' && (
            <div>
              <div className="flex items-center justify-between mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                 <div className="flex items-center gap-2 font-medium">
                   <Info size={16} /> Fraud Üçgeni (Baskı-Fırsat-Haklı Çıkarma) algoritmik skorlarının anonimleştirilmiş görünümleridir.
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(triangleScores || []).map(triangle => {
                  const stressLogger = stressLogs.find(s => s.anon_employee_id === triangle.anon_employee_id);
                  return <FraudTriangleCard key={triangle.id} triangle={triangle} stressLogger={stressLogger} />;
                })}
              </div>
              {triangleScores.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Analiz edilmiş riskli profil bulunmuyor.</div>}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
