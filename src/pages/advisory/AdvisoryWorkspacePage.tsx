import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Lightbulb, ArrowLeft, Loader2,
  CheckCircle2, AlertTriangle, Workflow,
} from 'lucide-react';
import clsx from 'clsx';
import { useAdvisoryEngagement, useUpdateAdvisoryEngagement } from '@/entities/advisory';
import { TermsOfReferenceTab } from '@/widgets/AdvisoryWorkspace/TermsOfReferenceTab';
import { AdvisoryCanvasTab } from '@/widgets/AdvisoryWorkspace/AdvisoryCanvasTab';
import { InsightsKanbanTab } from '@/widgets/AdvisoryWorkspace/InsightsKanbanTab';

type TabId = 'tor' | 'canvas' | 'insights';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'tor', label: 'Gorev Tanimi (ToR)', icon: FileText },
  { id: 'canvas', label: 'Calisma Alanı', icon: Workflow },
  { id: 'insights', label: 'Gozlem & Tavsiye', icon: Lightbulb },
];

export default function AdvisoryWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: engagement, isLoading } = useAdvisoryEngagement(id);
  const updateEngagement = useUpdateAdvisoryEngagement();
  const [activeTab, setActiveTab] = useState<TabId>('tor');

  const isLocked = !engagement?.management_responsibility_confirmed;

  const handleConfirmResponsibility = async () => {
    if (!id) return;
    await updateEngagement.mutateAsync({
      id,
      management_responsibility_confirmed: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle size={36} className="text-amber-400" />
        <p className="text-sm font-bold text-slate-600">Gorev bulunamadi</p>
        <button
          onClick={() => navigate('/advisory')}
          className="text-sm text-blue-600 hover:underline"
        >
          Hub'a Don
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/advisory')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-200 bg-white/10 px-2 py-0.5 rounded">
                REHBERLIK
              </span>
              {engagement.methodology && (
                <span className="text-[10px] font-medium text-blue-200">
                  {engagement.methodology.replace('_', ' ')}
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-white truncate mt-0.5">
              {engagement.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {engagement.management_responsibility_confirmed ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-400/30">
                <CheckCircle2 size={12} />
                Yonetim Sorumlulugu Onaylandi
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-400/30">
                <AlertTriangle size={12} />
                Onay Gerekli
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 mt-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.id !== 'tor' && isLocked;
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all',
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm'
                    : isDisabled
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon size={14} />
                {tab.label}
                {isDisabled && <AlertTriangle size={10} className="text-amber-400/60" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-auto">
        {activeTab === 'tor' && (
          <TermsOfReferenceTab
            engagement={engagement}
            onConfirmResponsibility={handleConfirmResponsibility}
            isUpdating={updateEngagement.isPending}
          />
        )}
        {activeTab === 'canvas' && <AdvisoryCanvasTab engagementId={engagement.id} />}
        {activeTab === 'insights' && <InsightsKanbanTab engagementId={engagement.id} />}
      </div>
    </div>
  );
}
