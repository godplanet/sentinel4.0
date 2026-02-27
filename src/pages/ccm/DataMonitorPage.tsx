import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Database, AlertTriangle, Shield, Radio,
  Server, FileText, Users, RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import type { DataSource, CCMTransaction, CCMAlert, CCMStats } from '@/entities/ccm/types';
import { fetchDataSources, fetchRecentTransactions, fetchAlerts, fetchCCMStats } from '@/entities/ccm/api';
import { SourceCards, AlertPanel, LiveFeed } from '@/widgets/CCMDashboard';

type Tab = 'overview' | 'feed' | 'alerts';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}

function KPICard({ label, value, icon: Icon, color, sub }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900 tabular-nums">{typeof value === 'number' ? value.toLocaleString('tr-TR') : value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function PulseIndicator() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  );
}

export default function DataMonitorPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [sources, setSources] = useState<DataSource[]>([]);
  const [transactions, setTransactions] = useState<CCMTransaction[]>([]);
  const [alerts, setAlerts] = useState<CCMAlert[]>([]);
  const [stats, setStats] = useState<CCMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    try {
      const [src, tx, al, st] = await Promise.all([
        fetchDataSources(),
        fetchRecentTransactions(100),
        fetchAlerts(),
        fetchCCMStats(),
      ]);
      setSources(src);
      setTransactions(tx);
      setAlerts(al);
      setStats(st);
    } catch (err) {
      console.error('CCM load failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Genel Bakis', icon: Activity },
    { key: 'feed', label: 'Canli Akim', icon: Radio },
    { key: 'alerts', label: 'Alarmlar', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Surekli Izleme Merkezi"
          subtitle="Neural Mesh - Veri Toplama & Anomali Tespit Motoru"
        />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <PulseIndicator />
            <span className="text-[11px] font-semibold text-emerald-700">Canli</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard label="Islenen Kayit" value={stats.processedRows} icon={Database} color="bg-teal-50 text-teal-600" />
          <KPICard label="Aktif Kaynak" value={`${stats.activeSources}/${stats.totalSources}`} icon={Server} color="bg-blue-50 text-blue-600" />
          <KPICard label="Islem Sayisi" value={stats.totalTransactions} icon={FileText} color="bg-slate-100 text-slate-600" />
          <KPICard label="Calisan Sayisi" value={stats.totalEmployees} icon={Users} color="bg-sky-50 text-sky-600" />
          <KPICard label="Acik Alarm" value={stats.openAlerts} icon={AlertTriangle} color="bg-orange-50 text-orange-600" sub={`${stats.criticalAlerts} kritik`} />
          <KPICard label="Toplam Fatura" value={stats.totalInvoices} icon={Shield} color="bg-rose-50 text-rose-600" />
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              tab === t.key
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <t.icon size={15} />
            {t.label}
            {t.key === 'alerts' && alerts.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Veri Kaynaklari</h3>
            <SourceCards sources={sources} />
          </div>

          {alerts.filter((a) => a.status === 'OPEN').length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Acik Alarmlar</h3>
              <AlertPanel alerts={alerts.filter((a) => a.status === 'OPEN')} />
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Son Islemler</h3>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <LiveFeed transactions={transactions.slice(0, 20)} />
            </div>
          </div>
        </div>
      )}

      {tab === 'feed' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Canli Islem Akisi</h3>
            </div>
            <span className="text-[11px] text-slate-400">{transactions.length} islem gosteriliyor</span>
          </div>
          <LiveFeed transactions={transactions} />
        </div>
      )}

      {tab === 'alerts' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Tum Alarmlar</h3>
            <span className="text-[11px] text-slate-400">{alerts.length} alarm</span>
          </div>
          <AlertPanel alerts={alerts} />
        </div>
      )}
    </div>
  );
}
