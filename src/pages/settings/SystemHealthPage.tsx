import { useSystemDiagnostics } from '@/features/diagnostics/diagnostics-api';
import { supabase } from '@/shared/api/supabase';
import { PageHeader } from '@/shared/ui/PageHeader';
import PersonaSwitcher from '@/widgets/PersonaSwitcher';
import clsx from 'clsx';
import {
 AlertCircle,
 AlertTriangle,
 Briefcase,
 CheckCircle,
 Database,
 FileText,
 Loader2,
 Package,
 RefreshCw,
 Target,
 Users,
 XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TableStat {
 name: string;
 label: string;
 icon: React.ComponentType<{ className?: string }>;
 count: number;
 status: 'healthy' | 'warning' | 'error';
}

export default function SystemHealthPage() {
 const [loading, setLoading] = useState(true);
 const [tableCounts, setTableCounts] = useState<Record<string, number>>({});

 const { data: diagnostics, isLoading: diagnosticsLoading, isError: diagnosticsError } = useSystemDiagnostics(15000);

 useEffect(() => {
 loadTableCounts();
 }, []);

 const loadTableCounts = async () => {
 setLoading(true);
 try {
 // Kalıcı DB mimarisi: doğrudan Supabase count sorgusu
 const tables = [
 'audit_entities', 'risk_library', 'user_profiles',
 'audit_engagements', 'audit_findings', 'workpapers',
 'action_plans', 'board_members', 'stakeholders',
 'risk_assessments', 'governance_docs', 'rkm_processes', 'rkm_risks',
 ];
 const counts: Record<string, number> = {};
 await Promise.all(
 (tables || []).map(async (table) => {
 const { count } = await supabase
 .from(table)
 .select('*', { count: 'exact', head: true });
 counts[table] = count ?? 0;
 }),
 );
 setTableCounts(counts);
 } catch (error) {
 console.error('Failed to load table counts:', error);
 } finally {
 setLoading(false);
 }
 };

 const tableStats: TableStat[] = [
 {
 name: 'audit_entities',
 label: 'Denetim Evreni',
 icon: Target,
 count: tableCounts.audit_entities || 0,
 status: (tableCounts.audit_entities || 0) > 0 ? 'healthy' : 'error',
 },
 {
 name: 'risk_library',
 label: 'Risk Kutuphanesi',
 icon: AlertTriangle,
 count: tableCounts.risk_library || 0,
 status: (tableCounts.risk_library || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'user_profiles',
 label: 'Kullanicilar',
 icon: Users,
 count: tableCounts.user_profiles || 0,
 status: (tableCounts.user_profiles || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'audit_engagements',
 label: 'Denetimler',
 icon: Briefcase,
 count: tableCounts.audit_engagements || 0,
 status: (tableCounts.audit_engagements || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'audit_findings',
 label: 'Bulgular',
 icon: AlertCircle,
 count: tableCounts.audit_findings || 0,
 status: (tableCounts.audit_findings || 0) > 0 ? 'healthy' : 'error',
 },
 {
 name: 'workpapers',
 label: 'Calisma Kagitlari',
 icon: FileText,
 count: tableCounts.workpapers || 0,
 status: (tableCounts.workpapers || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'action_plans',
 label: 'Aksiyon Planlari',
 icon: Package,
 count: tableCounts.action_plans || 0,
 status: (tableCounts.action_plans || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'board_members',
 label: 'Yonetim Kurulu',
 icon: Users,
 count: tableCounts.board_members || 0,
 status: (tableCounts.board_members || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'stakeholders',
 label: 'Paydaslar',
 icon: Users,
 count: tableCounts.stakeholders || 0,
 status: (tableCounts.stakeholders || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'risk_assessments',
 label: 'Risk Degerlendirme',
 icon: AlertTriangle,
 count: tableCounts.risk_assessments || 0,
 status: (tableCounts.risk_assessments || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'governance_docs',
 label: 'Yonetisim Dokumanlari',
 icon: FileText,
 count: tableCounts.governance_docs || 0,
 status: (tableCounts.governance_docs || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'rkm_processes',
 label: 'RKM Surecleri',
 icon: Target,
 count: tableCounts.rkm_processes || 0,
 status: (tableCounts.rkm_processes || 0) > 0 ? 'healthy' : 'warning',
 },
 {
 name: 'rkm_risks',
 label: 'RKM Riskleri',
 icon: AlertTriangle,
 count: tableCounts.rkm_risks || 0,
 status: (tableCounts.rkm_risks || 0) > 0 ? 'healthy' : 'warning',
 },
 ];

 const healthyCount = (tableStats || []).filter(t => t.status === 'healthy').length;
 const warningCount = (tableStats || []).filter(t => t.status === 'warning').length;
 const errorCount = (tableStats || []).filter(t => t.status === 'error').length;

 const overallHealth =
 errorCount > 2 ? 'critical' : warningCount > 3 ? 'warning' : 'healthy';

 return (
 <div className="space-y-4">
 <PageHeader
 title="Sistem Sagligi & Veri Yonetimi"
 description="Veritabani durumu ve demo veri yukleme"
 icon={Database}
 action={
 <button
 onClick={loadTableCounts}
 disabled={loading}
 className="flex items-center gap-2 px-4 py-2 bg-surface border border-slate-300 rounded-lg hover:bg-canvas transition-colors disabled:opacity-50"
 >
 <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
 Yenile
 </button>
 }
 />

 {/* Canlı Teşhis — Gerçek zamanlı Supabase metrikleri */}
 <div
 className={clsx(
 'rounded-xl p-4 border-2',
 diagnosticsError || diagnostics?.status === 'Down'
 ? 'bg-red-50 border-red-300'
 : diagnostics?.status === 'Degraded'
 ? 'bg-amber-50 border-amber-300'
 : 'bg-slate-50 border-slate-200'
 )}
 >
 <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
 <Database className="w-5 h-5" />
 Canlı Teşhis (Supabase)
 </h2>
 {diagnosticsLoading && !diagnostics ? (
 <div className="flex items-center gap-2 text-slate-600">
 <Loader2 className="w-5 h-5 animate-spin" />
 Ölçüm alınıyor...
 </div>
 ) : diagnosticsError || diagnostics?.error ? (
 <div className="flex items-center gap-2 text-red-700 font-medium">
 <XCircle className="w-5 h-5 shrink-0" />
 Veritabanı Bağlantı Hatası
 {diagnostics?.error && (
 <span className="text-sm font-normal text-red-600"> — {diagnostics.error}</span>
 )}
 </div>
 ) : diagnostics ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <div className="text-sm font-medium text-slate-600 mb-1">Veritabanı Durumu</div>
 <div
 className={clsx(
 'text-xl font-bold',
 diagnostics.status === 'Operational' && 'text-green-700',
 diagnostics.status === 'Degraded' && 'text-amber-700',
 diagnostics.status === 'Down' && 'text-red-700'
 )}
 >
 {diagnostics.status === 'Operational' && 'Operational'}
 {diagnostics.status === 'Degraded' && 'Degraded'}
 {diagnostics.status === 'Down' && 'Down'}
 </div>
 </div>
 <div>
 <div className="text-sm font-medium text-slate-600 mb-1">API Gecikmesi (Latency)</div>
 <div
 className={clsx(
 'text-xl font-bold',
 diagnostics.latencyMs >= 0 && diagnostics.latencyMs < 500 && 'text-green-700',
 diagnostics.latencyMs >= 500 && diagnostics.latencyMs < 1000 && 'text-amber-700',
 (diagnostics.latencyMs >= 1000 || diagnostics.latencyMs < 0) && 'text-red-700'
 )}
 >
 {diagnostics.latencyMs >= 0 ? `${diagnostics.latencyMs} ms` : '—'}
 </div>
 <div className="text-xs text-slate-500 mt-0.5">
 &lt;500ms Yeşil · 500ms–1s Sarı · &gt;1s Kırmızı
 </div>
 </div>
 <div>
 <div className="text-sm font-medium text-slate-600 mb-1">Aktif Veri (Bulgu Sayısı)</div>
 <div className="text-xl font-bold text-primary">{diagnostics.findingCount}</div>
 <div className="text-xs text-slate-500 mt-0.5">audit_findings</div>
 </div>
 </div>
 ) : null}
 {diagnostics?.timestamp && (
 <div className="mt-3 text-xs text-slate-500">
 Son güncelleme: {new Date(diagnostics.timestamp).toLocaleString('tr-TR')}
 </div>
 )}
 </div>

 {/* Overall Health Card */}
 <div
 className={clsx(
 'rounded-xl p-4 border-2',
 overallHealth === 'healthy' && 'bg-green-50 border-green-200',
 overallHealth === 'warning' && 'bg-yellow-50 border-yellow-200',
 overallHealth === 'critical' && 'bg-red-50 border-red-200'
 )}
 >
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-2xl font-bold text-primary mb-2">
 Sistem Durumu: {overallHealth === 'healthy' && '✅ Saglikli'}
 {overallHealth === 'warning' && '⚠️ Dikkat'}
 {overallHealth === 'critical' && '🔴 Kritik'}
 </h2>
 <div className="flex items-center gap-4 text-sm">
 <span className="flex items-center gap-1 text-green-700">
 <CheckCircle className="w-4 h-4" />
 {healthyCount} Saglikli
 </span>
 <span className="flex items-center gap-1 text-yellow-700">
 <AlertTriangle className="w-4 h-4" />
 {warningCount} Uyari
 </span>
 <span className="flex items-center gap-1 text-red-700">
 <XCircle className="w-4 h-4" />
 {errorCount} Hata
 </span>
 </div>
 </div>

 {/* Kalıcı DB: Factory Reset yerine CLI komutu */}
 <div className="bg-slate-900 text-slate-100 rounded-lg px-4 py-3 text-xs font-mono max-w-xs text-right">
 <div className="text-slate-400 text-[10px] mb-1 uppercase tracking-widest">Seed Yenileme (CLI)</div>
 <div className="text-emerald-400">npx supabase db reset --linked</div>
 </div>
 </div>
 </div>

 {/* Persona Switcher */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-1">
 <PersonaSwitcher />
 </div>
 <div className="lg:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
 <div className="flex items-start gap-4">
 <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
 <div>
 <h3 className="text-lg font-bold text-primary mb-2">
 Rol Simülasyonu Aktif
 </h3>
 <p className="text-sm text-slate-700 mb-3">
 Sentinel v3.0 artık 5 farklı kullanıcı rolü simülasyonu yapabilir. Her rol için farklı erişim izinleri ve demo verileri otomatik olarak yüklenir.
 </p>
 <div className="flex flex-wrap gap-2">
 <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-bold">CAE (Admin)</span>
 <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">Auditor</span>
 <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">Executive (GMY)</span>
 <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">Auditee</span>
 <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">Supplier</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Table Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {(tableStats || []).map((stat) => {
 const Icon = stat.icon;
 return (
 <div
 key={stat.name}
 className={clsx(
 'bg-surface rounded-lg border-2 p-4 transition-all',
 stat.status === 'healthy' && 'border-green-200 hover:shadow-lg',
 stat.status === 'warning' && 'border-yellow-200 hover:shadow-lg',
 stat.status === 'error' && 'border-red-200 hover:shadow-lg'
 )}
 >
 <div className="flex items-center justify-between mb-4">
 <Icon
 className={clsx(
 'w-8 h-8',
 stat.status === 'healthy' && 'text-green-600',
 stat.status === 'warning' && 'text-yellow-600',
 stat.status === 'error' && 'text-red-600'
 )}
 />
 {stat.status === 'healthy' && (
 <CheckCircle className="w-5 h-5 text-green-600" />
 )}
 {stat.status === 'warning' && (
 <AlertTriangle className="w-5 h-5 text-yellow-600" />
 )}
 {stat.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
 </div>

 <div className="text-3xl font-bold text-primary mb-2">
 {loading ? (
 <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
 ) : (
 stat.count
 )}
 </div>

 <div className="text-sm font-medium text-slate-600">{stat.label}</div>

 {stat.count === 0 && !loading && (
 <div className="mt-3 text-xs text-red-600 font-medium">Veri yok!</div>
 )}
 </div>
 );
 })}
 </div>

 </div>
 );
}
