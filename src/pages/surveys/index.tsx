import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { SurveyPortal } from '@/widgets/SurveyPortal';
import AssessmentCenterPage from './AssessmentCenterPage';
import { ClipboardList, BarChart3, Users, MessageSquare, Target } from 'lucide-react';

export default function SurveysPage() {
  const [activeTab, setActiveTab] = useState<'portal' | 'assessments'>('assessments');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anket ve Geri Bildirim"
        subtitle="Denetim süreçlerini değerlendirin ve geri bildirim verin"
      />

      <div className="space-y-6">
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Sentinel Survey - GIAS Std 11.1</h2>
              <p className="text-blue-100 mb-4">
                Denetim faaliyetlerinin kalitesini ve memnuniyetini ölçmek için anketler.
                Her denetim sonrası paydaşlardan geri bildirim alarak sürekli iyileşme sağlanır.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <Users className="w-4 h-4" />
                  <span>Çok Paydaşlı</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Otomatik Skorlama</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Açık Uçlu Sorular</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-1 inline-flex shadow-sm">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'assessments'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            Değerlendirme Merkezi
          </button>
          <button
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'portal'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Anket Portalı
          </button>
        </div>

        {activeTab === 'assessments' && <AssessmentCenterPage />}
        {activeTab === 'portal' && <SurveyPortal />}
      </div>
    </div>
  );
}
