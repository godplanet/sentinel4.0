import { useState } from 'react';
import {
  Handshake, Plus, Clock, CheckCircle2, XCircle,
  ArrowRight, Loader2, Briefcase, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  useAdvisoryRequests, useAdvisoryEngagements,
  useUpdateAdvisoryRequestStatus, useCreateAdvisoryEngagement,
} from '@/entities/advisory';
import type { AdvisoryRequest, AdvisoryEngagement } from '@/entities/advisory';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  PENDING: { icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-300', label: 'Beklemede' },
  APPROVED: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', label: 'Onaylandi' },
  REJECTED: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-300', label: 'Reddedildi' },
  PLANNING: { icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Planlama' },
  FIELDWORK: { icon: Briefcase, color: 'bg-cyan-100 text-cyan-700 border-cyan-300', label: 'Saha Calismasi' },
  DRAFTING: { icon: Briefcase, color: 'bg-teal-100 text-teal-700 border-teal-300', label: 'Taslak' },
  COMPLETED: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', label: 'Tamamlandi' },
};

export default function AdvisoryHubPage() {
  const navigate = useNavigate();
  const { data: requests, isLoading: loadingReqs } = useAdvisoryRequests();
  const { data: engagements, isLoading: loadingEngs } = useAdvisoryEngagements();
  const updateStatus = useUpdateAdvisoryRequestStatus();
  const createEngagement = useCreateAdvisoryEngagement();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (req: AdvisoryRequest) => {
    setProcessingId(req.id);
    try {
      await updateStatus.mutateAsync({ id: req.id, status: 'APPROVED' });
      await createEngagement.mutateAsync({
        request_id: req.id,
        title: req.title,
        scope_limitations: '',
        management_responsibility_confirmed: false,
        start_date: null,
        target_date: null,
        status: 'PLANNING',
        methodology: null,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const isLoading = loadingReqs || loadingEngs;

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        title="Rehberlik Hizmetleri"
        subtitle="Danismanlik talepleri ve gorev yonetimi - GIAS 2024 Uyumlu"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Toplam Talep"
          value={requests?.length ?? 0}
          icon={Handshake}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Bekleyen"
          value={requests?.filter((r) => r.status === 'PENDING').length ?? 0}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Aktif Gorevler"
          value={engagements?.filter((e) => e.status !== 'COMPLETED').length ?? 0}
          icon={Briefcase}
          color="bg-cyan-50 text-cyan-600"
        />
        <StatCard
          label="Tamamlanan"
          value={engagements?.filter((e) => e.status === 'COMPLETED').length ?? 0}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Handshake size={16} className="text-blue-600" />
                Danismanlik Talepleri
              </h2>
            </div>

            {(!requests || requests.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Henuz talep yok
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {requests.map((req) => {
                  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <div key={req.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 truncate">{req.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.problem_statement}</p>
                          {req.department_name && (
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              Departman: {req.department_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={clsx('text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1', cfg.color)}>
                            <Icon size={10} />
                            {cfg.label}
                          </span>
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={processingId === req.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {processingId === req.id ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={10} />
                              )}
                              Onayla
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-teal-50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={16} className="text-cyan-600" />
                Aktif Rehberlik Gorevleri
              </h2>
            </div>

            {(!engagements || engagements.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Henuz gorev olusturulmadi
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {engagements.map((eng) => {
                  const cfg = STATUS_CONFIG[eng.status] || STATUS_CONFIG.PLANNING;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={eng.id}
                      onClick={() => navigate(`/advisory/${eng.id}`)}
                      className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 truncate">{eng.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1', cfg.color)}>
                              <Icon size={10} />
                              {cfg.label}
                            </span>
                            {eng.methodology && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {eng.methodology.replace('_', ' ')}
                              </span>
                            )}
                            {!eng.management_responsibility_confirmed && (
                              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Yonetim Onayi Bekliyor
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
