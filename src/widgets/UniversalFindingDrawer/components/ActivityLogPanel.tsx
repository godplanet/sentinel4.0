import React from 'react';
import {
  Clock,
  User,
  AlertCircle,
  FileText,
  Paperclip,
  GitBranch,
  TrendingUp,
  Shield
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ActivityLogPanelProps {
  findingId: string | null;
}

// Mock Activity Log Data (GÖREV 3)
const MOCK_ACTIVITY_LOG = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 dk önce
    action_type: 'risk_score_changed',
    actor: { name: 'Ahmet Yılmaz', role: 'Kıdemli Denetçi' },
    details: { field: 'impact', old_value: 3, new_value: 5 },
    icon: TrendingUp,
    color: 'amber'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 dk önce
    action_type: 'evidence_uploaded',
    actor: { name: 'Zeynep Demir', role: 'Denetçi' },
    details: { filename: 'kasa_kamera_kaydi_14022026.mp4' },
    icon: Paperclip,
    color: 'blue'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 saat önce
    action_type: 'status_changed',
    actor: { name: 'Sistem', role: 'Automation' },
    details: { old_status: 'draft', new_status: 'review' },
    icon: GitBranch,
    color: 'indigo'
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 saat önce
    action_type: 'finding_created',
    actor: { name: 'Ahmet Yılmaz', role: 'Kıdemli Denetçi' },
    details: { title: 'Kasa İşlemlerinde Çift Anahtar Prensibi İhlali' },
    icon: FileText,
    color: 'emerald'
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 480), // 8 saat önce
    action_type: 'risk_score_changed',
    actor: { name: 'Mehmet Kaya', role: 'Başmüfettiş' },
    details: { field: 'likelihood', old_value: 2, new_value: 3 },
    icon: TrendingUp,
    color: 'amber'
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 720), // 12 saat önce
    action_type: 'review_approved',
    actor: { name: 'Selim Özkan', role: 'Gözetim Müdürü' },
    details: { comment: 'Kök neden analizi yeterli, onaylandı.' },
    icon: Shield,
    color: 'emerald'
  }
];

const ACTION_LABELS: Record<string, string> = {
  risk_score_changed: 'Risk Skoru Değişti',
  evidence_uploaded: 'Kanıt Yüklendi',
  status_changed: 'Statü Değişti',
  finding_created: 'Bulgu Oluşturuldu',
  review_approved: 'Gözden Geçirme Onaylandı',
  review_rejected: 'Gözden Geçirme Reddedildi'
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
};

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ findingId }) => {
  if (!findingId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-sm">Bulgu seçilmedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 relative">
      {/* Timeline Line */}
      <div className="absolute left-[19px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />

      {MOCK_ACTIVITY_LOG.map((log, index) => {
        const colors = COLOR_MAP[log.color] || COLOR_MAP.slate;
        const Icon = log.icon;

        return (
          <div
            key={log.id}
            className="relative pl-12 pb-6 animate-in slide-in-from-left-2 fade-in duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon */}
            <div
              className={cn(
                'absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 border-white z-10',
                colors.bg,
                colors.border
              )}
            >
              <Icon size={18} className={colors.text} />
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800">
                    {ACTION_LABELS[log.action_type] || log.action_type}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">
                      {log.actor.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {log.actor.role}
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 ml-2">
                  <Clock size={12} />
                  <span>
                    {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: tr })}
                  </span>
                </div>
              </div>

              {/* Details */}
              {log.details && (
                <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-100">
                  <dl className="space-y-1 text-xs">
                    {Object.entries(log.details).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <dt className="text-slate-500 font-medium capitalize min-w-[80px]">
                          {key.replace(/_/g, ' ')}:
                        </dt>
                        <dd className="text-slate-700 font-semibold">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* End Marker */}
      <div className="relative pl-12 pb-2">
        <div className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white shadow-sm">
          <div className="w-2 h-2 bg-slate-400 rounded-full" />
        </div>
        <p className="text-xs text-slate-400 italic mt-3">Kayıt başlangıcı</p>
      </div>
    </div>
  );
};
