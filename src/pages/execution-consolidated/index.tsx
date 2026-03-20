import { usePersonaStore } from '@/entities/user/model/persona-store';
import { AgileEngagementsPage } from '@/pages/execution/AgileEngagementsPage';
import { PageHeader } from '@/shared/ui';
import clsx from 'clsx';
import {
  ArrowRight, Briefcase, Building2, Calendar, CheckCircle2,
  Clock, FileText, Shield, Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TabKey = 'audits' | 'agile' | 'investigations';
type TaskStatus = 'PLANNED' | 'IN_PROGRESS' | 'REPORTING' | 'COMPLETED';

const TABS = [
  { key: 'audits' as TabKey, label: 'Denetimlerim', icon: Briefcase },
  { key: 'agile' as TabKey, label: 'Çevik Denetimler', icon: Zap },
  { key: 'investigations' as TabKey, label: 'Soruşturmalar', icon: Shield },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  PLANNED: 'Planlandı',
  IN_PROGRESS: 'Devam Ediyor',
  REPORTING: 'Raporlama',
  COMPLETED: 'Tamamlandı',
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  PLANNED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200',
  REPORTING: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

interface MyTask {
  id: string;
  title: string;
  category: string;
  categoryIcon: React.ElementType;
  categoryColor: string;
  audit_type: string;
  entity_name: string;
  start_date: string;
  end_date: string;
  status: TaskStatus;
  risk_score: number;
}

export const MY_TASKS: MyTask[] = [
  {
    id: 'task-org1',
    title: 'Kadıköy Şubesi',
    category: 'Organizasyonel Yapı',
    categoryIcon: Building2,
    categoryColor: 'blue',
    audit_type: 'İç Kontrol Denetimi',
    entity_name: 'Kadıköy Şubesi',
    start_date: '2026-02-01',
    end_date: '2026-04-30',
    status: 'IN_PROGRESS',
    risk_score: 74,
  },
  {
    id: 'task-org2',
    title: 'Çankaya Şubesi',
    category: 'Organizasyonel Yapı',
    categoryIcon: Building2,
    categoryColor: 'blue',
    audit_type: 'Operasyonel Risk Denetimi',
    entity_name: 'Çankaya Şubesi',
    start_date: '2026-01-15',
    end_date: '2026-03-31',
    status: 'REPORTING',
    risk_score: 82,
  },
  {
    id: 'task-org3',
    title: 'Karşıyaka Şubesi',
    category: 'Organizasyonel Yapı',
    categoryIcon: Building2,
    categoryColor: 'blue',
    audit_type: 'Uyum Denetimi',
    entity_name: 'Karşıyaka Şubesi',
    start_date: '2026-03-01',
    end_date: '2026-05-31',
    status: 'PLANNED',
    risk_score: 68,
  },
];

export default function ExecutionConsolidatedPage() {
  const navigate = useNavigate();
  const { getCurrentPersonaConfig } = usePersonaStore();
  const config = getCurrentPersonaConfig();
  const userName = config.name;

  const [activeTab, setActiveTab] = useState<TabKey>('audits');

  const stats = [
    { label: 'Toplam Görev', value: MY_TASKS.length, icon: Briefcase, color: 'blue' },
    { label: 'Devam Ediyor', value: MY_TASKS.filter(t => t.status === 'IN_PROGRESS').length, icon: Clock, color: 'amber' },
    { label: 'Planlandı', value: MY_TASKS.filter(t => t.status === 'PLANNED').length, icon: Calendar, color: 'purple' },
    { label: 'Tamamlandı', value: MY_TASKS.filter(t => t.status === 'COMPLETED').length, icon: CheckCircle2, color: 'emerald' },
  ];

  return (
    <div className="flex flex-col bg-canvas min-h-screen">
      <PageHeader title="Görevlerim" subtitle="Denetim Görevleri ve Soruşturmalar" icon={FileText} />

      {/* Tab Bar */}
      <div className="border-b border-slate-200 bg-surface px-4">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-primary hover:bg-canvas'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {/* ── Denetimlerim ── */}
        {activeTab === 'audits' && (
          <div className="p-4 space-y-4">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-surface rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`text-${color}-600`} size={22} />
                    <span className="text-2xl font-bold text-primary">{value}</span>
                  </div>
                  <p className="text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>

            {/* Tasks Table */}
            <div className="bg-surface rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Denetim Görevleri</span>
                <span className="text-xs text-slate-400">{MY_TASKS.length} görev · Atanan: <span className="font-semibold text-slate-600">{userName}</span></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/40">
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Denetim Adı</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Kategori</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Denetlenen Varlık</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Atanan Müfettiş</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tarih Aralığı</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Risk</th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Durum</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MY_TASKS.map((task) => {
                      const CategoryIcon = task.categoryIcon;
                      const initials = userName.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <tr
                          key={task.id}
                          onClick={() => navigate(`/execution/my-engagements/${task.id}`)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                        >
                          {/* Title */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Briefcase size={15} className="text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm leading-snug">{task.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{task.audit_type}</p>
                              </div>
                            </div>
                          </td>
                          {/* Category */}
                          <td className="px-4 py-3.5">
                            <div className={clsx(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border whitespace-nowrap',
                              `bg-${task.categoryColor}-50 border-${task.categoryColor}-200`
                            )}>
                              <CategoryIcon size={11} className={`text-${task.categoryColor}-600`} />
                              <span className={`text-[11px] font-bold text-${task.categoryColor}-700`}>{task.category}</span>
                            </div>
                          </td>
                          {/* Entity */}
                          <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[160px] truncate">{task.entity_name}</td>
                          {/* Inspector */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 flex-shrink-0">
                                {initials}
                              </div>
                              <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{userName}</span>
                            </div>
                          </td>
                          {/* Dates */}
                          <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                              {new Date(task.start_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                              {' — '}
                              {new Date(task.end_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </div>
                          </td>
                          {/* Risk */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={clsx('text-sm font-bold',
                                task.risk_score >= 75 ? 'text-red-600' : task.risk_score >= 50 ? 'text-amber-600' : 'text-emerald-600'
                              )}>{task.risk_score}</span>
                              <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={clsx('h-full rounded-full',
                                    task.risk_score >= 75 ? 'bg-red-500' : task.risk_score >= 50 ? 'bg-amber-400' : 'bg-emerald-500'
                                  )}
                                  style={{ width: `${task.risk_score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          {/* Status */}
                          <td className="px-4 py-3.5 text-center">
                            <span className={clsx('px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap', STATUS_STYLES[task.status])}>
                              {STATUS_LABELS[task.status]}
                            </span>
                          </td>
                          {/* Arrow */}
                          <td className="px-4 py-3.5">
                            <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Çevik Denetimler ── */}
        {activeTab === 'agile' && (
          <div className="p-4">
            <AgileEngagementsPage />
          </div>
        )}

        {/* ── Soruşturmalar ── */}
        {activeTab === 'investigations' && (
          <div className="p-4">
            <div className="bg-surface rounded-lg border border-slate-200 p-16 text-center">
              <Shield size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Henüz soruşturma kaydı yok</p>
              <p className="text-xs text-slate-400 mt-1">Gizlilik dereceli soruşturma vakaları burada listelenir</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
