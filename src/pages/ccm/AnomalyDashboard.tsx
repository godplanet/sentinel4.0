import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Radar, Ghost, Layers, BarChart3, ShieldAlert,
  RefreshCw, Clock, AlertTriangle, TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import { fetchAlerts } from '@/entities/ccm/api';
import type { CCMAlert } from '@/entities/ccm/types';
import { runAnomalyScan, persistScanAlerts } from '@/features/ccm/anomaly-api';
import type { AnomalyScanResult } from '@/features/ccm/types';
import { BenfordChart, RuleAlertFeed } from '@/widgets/AnomalyCockpit';

interface ScoreCardProps {
  icon: React.ElementType;
  label: string;
  score: number;
  detail: string;
  color: string;
  bgColor: string;
}

function ScoreCard({ icon: Icon, label, score, detail, color, bgColor }: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', bgColor)}>
          <Icon size={20} className={color} />
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className={clsx('text-3xl font-black tabular-nums', color)}>{score}</div>
        <div className="text-[11px] text-slate-500 text-right max-w-[120px]">{detail}</div>
      </div>
    </motion.div>
  );
}

function GhostEmployeeCards({ ghosts }: { ghosts: AnomalyScanResult['ghosts'] }) {
  if (ghosts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <Ghost size={24} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm text-slate-600">Hayalet calisan tespit edilmedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ghosts.map((g) => (
        <motion.div
          key={g.employeeId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-red-200 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Ghost size={20} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900">{g.fullName}</div>
            <div className="text-xs text-slate-500">{g.department} / {g.employeeId}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-black text-red-600 tabular-nums">
              {g.salary.toLocaleString('tr-TR')} TL
            </div>
            <div className="text-[10px] text-slate-400">Aylik bordro</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black shrink-0">
            {g.riskScore}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StructuringCards({ clusters }: { clusters: AnomalyScanResult['structuring'] }) {
  if (clusters.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <Layers size={24} className="text-emerald-500 mx-auto mb-2" />
        <p className="text-sm text-slate-600">Yapilandirma deseni tespit edilmedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clusters.map((c, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-orange-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Layers size={16} className="text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{c.userId}</div>
                <div className="text-[10px] text-slate-400">
                  {new Date(c.windowStart).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-black">
              {c.riskScore}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-orange-50 rounded-lg p-2 text-xs">
            <div>
              <div className="text-orange-500 text-[10px]">Islem</div>
              <div className="font-bold text-slate-900">{c.count} adet</div>
            </div>
            <div>
              <div className="text-orange-500 text-[10px]">Toplam</div>
              <div className="font-bold text-slate-900">{c.totalAmount.toLocaleString('tr-TR')} TL</div>
            </div>
            <div>
              <div className="text-orange-500 text-[10px]">Esik</div>
              <div className="font-bold text-red-600">50.000 TL</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function AnomalyDashboard() {
  const [scanResult, setScanResult] = useState<AnomalyScanResult | null>(null);
  const [alerts, setAlerts] = useState<CCMAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    const data = await fetchAlerts();
    setAlerts(data);
  }, []);

  const executeScan = useCallback(async () => {
    setScanning(true);
    try {
      const result = await runAnomalyScan();
      setScanResult(result);
      setLastScan(result.scanTimestamp);
      await loadAlerts();
    } catch (err) {
      console.error('Anomaly scan failed:', err);
    } finally {
      setScanning(false);
    }
  }, [loadAlerts]);

  const handlePersist = async () => {
    if (!scanResult) return;
    setPersisting(true);
    try {
      await persistScanAlerts(scanResult);
      await loadAlerts();
    } finally {
      setPersisting(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await executeScan();
      setLoading(false);
    };
    init();
  }, [executeScan]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Anomali motoru taramasi baslatiliyor...</p>
        </div>
      </div>
    );
  }

  const totalRiskScore = scanResult
    ? Math.round(
        (scanResult.benford.riskScore +
          (scanResult.structuring[0]?.riskScore || 0) +
          (scanResult.ghosts.length > 0 ? 100 : 0)) / 3,
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Anomali Kokpiti"
          subtitle="Golden Rule Library - Istatistiksel Anomali Tespit Motoru"
        />
        <div className="flex items-center gap-2">
          {lastScan && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock size={12} />
              Son tarama: {new Date(lastScan).toLocaleTimeString('tr-TR')}
            </div>
          )}
          <button
            onClick={handlePersist}
            disabled={persisting || !scanResult}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ShieldAlert size={13} />
            {persisting ? 'Kaydediliyor...' : 'Alarmlari Kaydet'}
          </button>
          <button
            onClick={executeScan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Taraniyor...' : 'Tarama Baslat'}
          </button>
        </div>
      </div>

      {scanResult && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ScoreCard
              icon={TrendingUp}
              label="Genel Risk"
              score={totalRiskScore}
              detail="3 kural ortalaması"
              color={totalRiskScore >= 70 ? 'text-red-600' : 'text-amber-600'}
              bgColor={totalRiskScore >= 70 ? 'bg-red-100' : 'bg-amber-100'}
            />
            <ScoreCard
              icon={BarChart3}
              label="Benford"
              score={scanResult.benford.riskScore}
              detail={`Chi-kare: ${scanResult.benford.chiSquared}`}
              color={scanResult.benford.isAnomaly ? 'text-red-600' : 'text-emerald-600'}
              bgColor={scanResult.benford.isAnomaly ? 'bg-red-100' : 'bg-emerald-100'}
            />
            <ScoreCard
              icon={Layers}
              label="Yapilandirma"
              score={scanResult.structuring[0]?.riskScore || 0}
              detail={`${scanResult.structuring.length} kume tespit`}
              color={scanResult.structuring.length > 0 ? 'text-orange-600' : 'text-emerald-600'}
              bgColor={scanResult.structuring.length > 0 ? 'bg-orange-100' : 'bg-emerald-100'}
            />
            <ScoreCard
              icon={Ghost}
              label="Hayalet Calisan"
              score={scanResult.ghosts.length > 0 ? 100 : 0}
              detail={`${scanResult.ghosts.length} kisi tespit`}
              color={scanResult.ghosts.length > 0 ? 'text-red-600' : 'text-emerald-600'}
              bgColor={scanResult.ghosts.length > 0 ? 'bg-red-100' : 'bg-emerald-100'}
            />
          </div>

          <BenfordChart
            digits={scanResult.benford.digits}
            chiSquared={scanResult.benford.chiSquared}
            isAnomaly={scanResult.benford.isAnomaly}
            totalInvoices={scanResult.benford.totalInvoices}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Ghost size={16} className="text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Hayalet Calisan Tespiti</h3>
                {scanResult.ghosts.length > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {scanResult.ghosts.length}
                  </span>
                )}
              </div>
              <GhostEmployeeCards ghosts={scanResult.ghosts} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-orange-600" />
                <h3 className="text-sm font-bold text-slate-900">Yapilandirma (Smurfing)</h3>
                {scanResult.structuring.length > 0 && (
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {scanResult.structuring.length}
                  </span>
                )}
              </div>
              <StructuringCards clusters={scanResult.structuring} />
            </div>
          </div>
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Alarm Akisi</h3>
            {alerts.length > 0 && (
              <span className="bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Radar size={12} className="text-teal-500" />
            <span className="text-[10px] text-slate-400">Golden Rule Engine v1.0</span>
          </div>
        </div>
        <RuleAlertFeed alerts={alerts} onStatusChange={loadAlerts} />
      </div>
    </div>
  );
}
