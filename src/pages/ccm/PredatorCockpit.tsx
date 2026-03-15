/**
 * CCM PREDATOR COCKPIT
 *
 * Gelişmiş Sürekli Kontrol İzleme (CCM) dashboard'u — SOC Karanlık Tema
 * Özellikler:
 * - Canlı işlem tarayıcı (Matrix terminali)
 * - Uyarıdan Bulgaya tek tıkla dönüştürme
 * - Anayasa bağlantılı risk eşikleri
 * - Gerçek zamanlı anomali tespiti
 */

import { useCCMAlerts } from '@/features/ccm/api/useCCMQueries';
import { LiveScanner } from '@/features/ccm/components/LiveScanner';
import { useAlertAction, useConstitutionRules } from '@/features/ccm/hooks';
import { AlertPanel } from '@/widgets/CCMDashboard/AlertPanel';
import { PageHeader } from '@/shared/ui';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 CheckCircle,
 Clock,
 ExternalLink,
 FileText,
 RefreshCw,
 Settings,
 Shield,
 TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PredatorCockpit() {
 const [scanResults, setScanResults] = useState<{ total: number; anomalies: number } | null>(
 null
 );
 const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('cards');

 const queryClient = useQueryClient();
 const { convertAlertToFinding, isConverting } = useAlertAction();
 const { getConstitutionSummary, getRiskThresholds } = useConstitutionRules();
 const navigate = useNavigate();

 const { data: alerts = [], isLoading } = useCCMAlerts();

 const handleConvertToFinding = async (alertId: string) => {
 setSelectedAlert(alertId);

 const result = await convertAlertToFinding(alertId);

 if (result.success && result.findingId) {
 navigate(`/execution/findings?id=${result.findingId}`);
 } else {
 alert(`Bulgu oluşturulamadı: ${result.error || 'Bilinmeyen hata'}`);
 }

 setSelectedAlert(null);
 queryClient.invalidateQueries({ queryKey: ['ccm-alerts'] });
 };

 const constitutionSummary = getConstitutionSummary();
 const thresholds = getRiskThresholds();

  const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'CRITICAL':
  case 'HIGH':
  return 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
  case 'MEDIUM':
  case 'WARNING':
  return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
  case 'LOW':
  case 'SUCCESS':
  case 'NORMAL':
  return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  default:
  return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
  };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'OPEN':
 return <AlertTriangle className="w-4 h-4 text-amber-400" />;
 case 'INVESTIGATING':
 return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
 case 'CONFIRMED':
 return <CheckCircle className="w-4 h-4 text-emerald-400" />;
 case 'DISMISSED':
 return <CheckCircle className="w-4 h-4 text-slate-600" />;
 default:
 return <AlertTriangle className="w-4 h-4 text-slate-500" />;
 }
 };

 const formatRuleName = (rule: string) => {
 return rule
 .split('_')
 .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
 .join(' ');
 };

 const rawAlerts = alerts || [];
 const stats = {
 totalAlerts: rawAlerts.length || 0,
 openAlerts: (rawAlerts || []).filter((a) => a?.status === 'OPEN').length || 0,
 criticalAlerts: (rawAlerts || []).filter((a) => a?.severity === 'CRITICAL').length || 0,
 avgRiskScore: Math.round(
 (rawAlerts || []).reduce((sum, a) => sum + (a?.risk_score || 0), 0) / (rawAlerts.length || 1)
 ),
 };

 return (
 <div className="min-h-screen ">
 <PageHeader
 title="Predator Cockpit"
 description="Continuous Control Monitoring with AI-Powered Anomaly Detection"
 />

 <div className="w-full px-4 sm:px-4 lg:px-4 p-4 space-y-4">
 {/* İstatistik Kartları */}
 <div className="grid grid-cols-4 gap-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-slate-900 border border-slate-800/60 rounded-lg p-4"
 >
 <div className="flex items-center justify-between mb-2">
 <Shield className="w-8 h-8 text-blue-400" />
 <span className="text-xs text-slate-500 font-mono tracking-widest">TOTAL</span>
 </div>
 <div className="text-3xl font-bold text-white tabular-nums">{stats.totalAlerts}</div>
 <div className="text-xs text-slate-400 mt-1">Toplam Uyarı</div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-slate-900 border border-amber-500/20 rounded-lg p-4"
 >
 <div className="flex items-center justify-between mb-2">
 <AlertTriangle className="w-8 h-8 text-amber-400" />
 <span className="text-xs text-amber-400 font-mono font-semibold tracking-widest">OPEN</span>
 </div>
 <div className="text-3xl font-bold text-amber-400 tabular-nums">{stats.openAlerts}</div>
 <div className="text-xs text-amber-500/70 mt-1">Açık Uyarı</div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="bg-slate-900 border border-red-500/20 rounded-lg p-4"
 >
 <div className="flex items-center justify-between mb-2">
 <AlertTriangle className="w-8 h-8 text-red-400" />
 <span className="text-xs text-red-400 font-mono font-semibold tracking-widest">CRITICAL</span>
 </div>
 <div className="text-3xl font-bold text-red-400 tabular-nums">{stats.criticalAlerts}</div>
 <div className="text-xs text-red-500/70 mt-1">Kritik Sorun</div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="bg-slate-900 border border-slate-800/60 rounded-lg p-4"
 >
 <div className="flex items-center justify-between mb-2">
 <TrendingUp className="w-8 h-8 text-purple-400" />
 <span className="text-xs text-slate-500 font-mono tracking-widest">AVG</span>
 </div>
 <div className="text-3xl font-bold text-purple-400 tabular-nums">{stats.avgRiskScore}</div>
 <div className="text-xs text-slate-400 mt-1">Ort. Risk Skoru</div>
 </motion.div>
 </div>

 {/* Canlı Tarayıcı */}
 <LiveScanner
 onAnomalyDetected={(log) => {
 console.log('Anomali tespit edildi:', log);
 }}
 onScanComplete={(results) => {
 setScanResults(results);
 queryClient.invalidateQueries({ queryKey: ['ccm-alerts'] });
 }}
 />

 {/* Tarama Sonucu Bildirimi */}
 {scanResults && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
 >
 <div className="flex items-center gap-3">
 <CheckCircle className="w-6 h-6 text-emerald-400" />
 <div>
 <h3 className="font-semibold text-white">Tarama Tamamlandı</h3>
 <p className="text-sm text-slate-400">
 {scanResults.total} işlem tarandı. {scanResults.anomalies} anomali tespit edildi.
 </p>
 </div>
 </div>
 </motion.div>
 )}

  {/* Aktif Uyarılar Tablosu */}
  <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-2xl">
  <div className="px-4 py-4 border-b border-slate-800/60 flex items-center justify-between">
  <div>
  <h2 className="text-lg font-bold text-white">Aktif Uyarılar</h2>
  <p className="text-sm text-slate-400 mt-0.5">
  Anayasa eşikleri: Yapılandırma Limiti = {constitutionSummary.structuringLimit}
  , Yüksek Değer = {constitutionSummary.highValueThreshold}
  </p>
 </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-slate-400 border border-transparent'
              }`}
            >
              KARTLAR
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                viewMode === 'matrix' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-slate-400 border border-transparent'
              }`}
            >
              MATRİS
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['ccm-alerts'] })}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-700 rounded-lg
              text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="p-4">
            <AlertPanel alerts={rawAlerts} />
          </div>
        ) : (
        <div className="overflow-x-auto">
  <table className="w-full">
  <thead>
  <tr className="bg-slate-950 border-b border-slate-800/60">
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
  Durum
  </th>
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
  Kural
  </th>
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
  Varlık
  </th>
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
  Önem
  </th>
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
  Risk Skoru
  </th>
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
  Oluşturulma
  </th>
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
  İşlemler
  </th>
  </tr>
 </thead>
 <tbody>
 {isLoading ? (
 <tr>
 <td colSpan={7} className="px-4 py-5 text-center text-slate-500">
 <Activity className="w-5 h-5 animate-pulse mx-auto mb-2 text-blue-400" />
 Uyarılar yükleniyor...
 </td>
 </tr>
 ) : rawAlerts.length === 0 ? (
 <tr>
 <td colSpan={7} className="px-4 py-5 text-center text-slate-500">
 Uyarı bulunamadı. Anomali tespit etmek için tarama başlatın.
 </td>
 </tr>
 ) : (
  (rawAlerts || []).map((alert) => (
  <tr
  key={alert?.id}
  className="border-b border-slate-800 hover:bg-slate-800/50 text-slate-200 transition-colors"
  >
  <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 {getStatusIcon(alert.status)}
 <span className="text-sm text-slate-300">{alert.status}</span>
 </div>
 </td>
 <td className="px-4 py-3">
 <span className="text-sm font-medium text-white">
 {formatRuleName(alert.rule_triggered)}
 </span>
 </td>
 <td className="px-4 py-3">
 <span className="text-sm text-slate-400 font-mono">
 {alert.related_entity_id}
 </span>
 </td>
  <td className="px-4 py-3">
  <span
  className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(
  alert.severity
  )}`}
  >
  {alert.severity}
  </span>
  </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <div className="flex-1 bg-slate-800 rounded-full h-2 w-20">
 <div
 className={`h-2 rounded-full ${
 alert.risk_score >= 70
 ? 'bg-red-500'
 : alert.risk_score >= 40
 ? 'bg-amber-500'
 : 'bg-emerald-500'
 }`}
 style={{ width: `${alert.risk_score}%` }}
 />
 </div>
 <span className="text-sm font-semibold text-white tabular-nums">
 {alert.risk_score}
 </span>
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-1 text-xs text-slate-500">
 <Clock className="w-3 h-3" />
 {new Date(alert.created_at).toLocaleDateString('tr-TR')}
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 {alert.status === 'OPEN' && (
 <button
 onClick={() => handleConvertToFinding(alert.id)}
 disabled={isConverting && selectedAlert === alert.id}
 className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white
 bg-blue-600/80 border border-blue-500/40 rounded hover:bg-blue-600
 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <FileText className="w-3 h-3" />
 {isConverting && selectedAlert === alert.id
 ? 'Oluşturuluyor...'
 : 'Bulgu Oluştur'}
 </button>
 )}
 {alert.status === 'CONFIRMED' && (
 <span className="flex items-center gap-1 text-xs text-emerald-400">
 <CheckCircle className="w-3 h-3" />
 Bulgya Dönüştürüldü
 </span>
 )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
        </div>
        )}
      </div>

 {/* Risk Anayasası Paneli */}
 <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-4">
 <div className="flex items-start gap-3">
 <Settings className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <h3 className="font-semibold text-white mb-2">Risk Anayasası Aktif</h3>
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div>
 <span className="text-slate-400">Yapılandırma Limiti:</span>
 <span className="ml-2 font-semibold text-white">
 {constitutionSummary.structuringLimit}
 </span>
 </div>
 <div>
 <span className="text-slate-400">Yüksek Değer Eşiği:</span>
 <span className="ml-2 font-semibold text-white">
 {constitutionSummary.highValueThreshold}
 </span>
 </div>
 <div>
 <span className="text-slate-400">Benford Ki-Kare:</span>
 <span className="ml-2 font-semibold text-white">
 {thresholds.benford.chiSquaredCritical}
 </span>
 </div>
 <div>
 <span className="text-slate-400">Yapılandırma Kaynağı:</span>
 <span className="ml-2 font-semibold text-white">
 {constitutionSummary.source}
 </span>
 </div>
 </div>
 <button
 onClick={() => navigate('/settings/risk-constitution')}
 className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
 >
 <ExternalLink className="w-4 h-4" />
 Risk Anayasasını Düzenle
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
