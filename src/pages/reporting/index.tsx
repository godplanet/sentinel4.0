import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { BarChart3, FileText, ListChecks, Shield } from 'lucide-react';
import { ExecSummaryGenerator } from '@/features/reporting/ExecSummaryGenerator';
import { QualityAssuranceWidget } from '@/widgets/QualityAssurance';
import clsx from 'clsx';

type TabKey = 'reports' | 'qa' | 'actions';

const TABS = [
  { key: 'reports' as TabKey, label: 'Rapor Merkezi', icon: FileText },
  { key: 'qa' as TabKey, label: 'Kalite Guvence', icon: Shield },
  { key: 'actions' as TabKey, label: 'Aksiyon Takip', icon: ListChecks },
];

export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('reports');

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Raporlama"
        subtitle="Denetim Raporlari ve Aksiyon Planlari"
        icon={BarChart3}
      />

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    Yonetici Ozeti
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Yonetim Kuruluna sunulmak uzere AI destekli ozet olusturun
                  </p>
                </div>
                <ExecSummaryGenerator />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <ReportCard title="Q1 2025 Denetim Raporu" status="Taslak" date="15 Ocak 2025" findings={8} />
                <ReportCard title="Kredi Surecleri Ozel Rapor" status="Incelemede" date="22 Subat 2025" findings={5} />
                <ReportCard title="BT Denetim Raporu" status="Yayinlandi" date="10 Mart 2025" findings={12} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qa' && <QualityAssuranceWidget />}

        {activeTab === 'actions' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ListChecks size={20} className="text-green-600" />
              Aksiyon Plani Takibi
            </h3>
            <p className="text-slate-600 mb-4">
              Bulgu aksiyon planlarinin izlenmesi ve tamamlanma durumu.
            </p>
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <ListChecks className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 font-medium">Aksiyon Takip Modulu Hazirlaniyor</p>
              <p className="text-slate-500 text-sm mt-2">Yakinda kullanima acilacak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ title, status, date, findings }: { title: string; status: string; date: string; findings: number }) {
  const statusConfig = {
    Taslak: { bg: 'bg-slate-100', text: 'text-slate-600' },
    Incelemede: { bg: 'bg-amber-100', text: 'text-amber-700' },
    Yayinlandi: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  }[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <FileText size={16} className="text-slate-400" />
        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded', statusConfig.bg, statusConfig.text)}>
          {status}
        </span>
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500">{date}</p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <span className="text-[10px] text-slate-500">{findings} bulgu</span>
      </div>
    </div>
  );
}
