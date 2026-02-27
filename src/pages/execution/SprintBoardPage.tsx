import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, Calendar, Users, Target, Timer, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import { fetchAgileEngagement } from '@/features/audit-creation/api';
import type { AgileEngagement } from '@/features/audit-creation/types';
import { SprintBoard } from '@/widgets/SprintBoard';
import { BudgetTrackerCard } from '@/features/execution/ui/BudgetTrackerCard';

const SQUAD = [
  { initials: 'AK', bg: 'bg-blue-100', text: 'text-blue-700',   name: 'Ahmet Kaya' },
  { initials: 'SY', bg: 'bg-emerald-100', text: 'text-emerald-700', name: 'Selin Yıldız' },
  { initials: 'MÖ', bg: 'bg-amber-100', text: 'text-amber-700',  name: 'Murat Öztürk' },
];

function SprintMissionHeader() {
  return (
    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <ShieldAlert size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">Sprint Görevi</p>
          <h2 className="text-sm font-bold text-blue-900 leading-snug">
            Sprint 1: Dijital Teverruk API ve Şer'i Süreç Doğrulaması
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-5 sm:ml-auto">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1.5">Ekip</p>
          <div className="flex -space-x-2">
            {SQUAD.map((m) => (
              <div
                key={m.initials}
                title={m.name}
                className={`w-7 h-7 rounded-full border-2 border-white ${m.bg} ${m.text} flex items-center justify-center text-[10px] font-bold`}
              >
                {m.initials}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-200 shadow-sm">
          <Timer size={14} className="text-blue-500" />
          <span className="text-xs font-bold text-blue-800">Kalan Süre: 12 Gün</span>
        </div>
      </div>
    </div>
  );
}

export default function SprintBoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<AgileEngagement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadEngagement(id);
  }, [id]);

  const loadEngagement = async (engId: string) => {
    try {
      setLoading(true);
      const data = await fetchAgileEngagement(engId);
      setEngagement(data);
    } catch (err) {
      console.error('Failed to load engagement:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <PageHeader title="Sprint Board" icon={Target} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <PageHeader title="Sprint Board" icon={Target} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">Denetim bulunamadi</p>
            <button
              onClick={() => navigate('/execution/my-engagements')}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Denetimlere Don
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title={engagement.title}
        description={`${engagement.total_sprints} Sprint - ${engagement.status}`}
        icon={Target}
        action={
          <button
            onClick={() => navigate('/execution/my-engagements')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft size={14} /> Geri
          </button>
        }
      />

      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            {engagement.start_date} - {engagement.end_date}
          </span>
          <span className="flex items-center gap-1.5">
            <Target size={14} className="text-slate-400" />
            {engagement.total_sprints} Sprint
          </span>
          {Array.isArray(engagement.team_members) && engagement.team_members.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              {engagement.team_members.length} Denetci
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex gap-0">
        <div className="flex-1 overflow-auto p-6">
          <SprintMissionHeader />
          <SprintBoard engagementId={engagement.id} />
        </div>
        <div className="w-72 flex-shrink-0 border-l border-slate-200 bg-slate-50 overflow-y-auto p-4">
          <BudgetTrackerCard />
        </div>
      </div>
    </div>
  );
}
