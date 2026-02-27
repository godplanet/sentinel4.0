import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Eye, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { ActionSuperDrawer } from '@/widgets/action-super-drawer/ui/ActionSuperDrawer';
import { AgingTierBadge } from '@/entities/action/ui/AgingTierBadge';
import { ActionStatusBadge } from '@/entities/action/ui/ActionStatusBadge';
import type { ActionAgingMetrics, ActionEvidence } from '@/entities/action/model/types';

const MOCK_ACTION: ActionAgingMetrics = {
  id: 'mock-action-bddk-001',
  finding_id: 'mock-finding-001',
  original_due_date: '2024-06-15',
  current_due_date: '2024-09-30',
  status: 'evidence_submitted',
  finding_snapshot: {
    finding_id: 'mock-finding-001',
    title: 'Kredi Riski Değerlendirme Sürecinde Yönetim Kontrollerinin Yetersizliği',
    severity: 'CRITICAL',
    risk_rating: 'Yüksek',
    gias_category: 'Risk Management',
    description:
      'Banka kredi portföyünün %23\'ünü oluşturan kurumsal kredi segmentinde risk değerlendirme modellerinin güncelliğini yitirdiği tespit edilmiştir. Mevcut modeller makroekonomik değişkenleri içermemekte olup bu durum BDDK Yönetmeliği Madde 14 kapsamında önemli bir uyum ihlali teşkil etmektedir.',
    created_at: '2024-01-10T09:00:00.000Z',
  },
  regulatory_tags: ['BDDK', 'BRSA'],
  escalation_level: 2,
  created_at: '2024-01-10T09:00:00.000Z',
  updated_at: new Date().toISOString(),
  closed_at: undefined,
  performance_delay_days: 420,
  operational_delay_days: 305,
  aging_tier: 'TIER_4_BDDK_RED_ZONE',
  is_bddk_breach: true,
  evidence_count: 2,
  pending_requests: 1,
};

const MOCK_EVIDENCE: ActionEvidence[] = [
  {
    id: 'mock-ev-1',
    action_id: 'mock-action-bddk-001',
    storage_path: 'action-evidence/mock/kredi_risk_raporu_q3_2024.pdf',
    file_hash: 'a3f1d9e47bc82c9056d3e78f40acb1257f83e429dc56a071f2381b90c7e4d5a1',
    ai_confidence_score: 74,
    uploaded_by: 'birim_yoneticisi',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-ev-2',
    action_id: 'mock-action-bddk-001',
    storage_path: 'action-evidence/mock/model_guncelleme_protokolu.docx',
    file_hash: 'f7c2b8e14d930a76512fe8c3b4a19072e6d84f91cb230e57a4865bd329f10a2c',
    ai_confidence_score: 91,
    uploaded_by: 'birim_yoneticisi',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_NORMAL_ACTION: ActionAgingMetrics = {
  id: 'mock-action-normal-002',
  finding_id: 'mock-finding-002',
  original_due_date: '2025-09-01',
  current_due_date: '2025-11-15',
  status: 'evidence_submitted',
  finding_snapshot: {
    finding_id: 'mock-finding-002',
    title: 'Şube İçi Prosedür Belgelerinin Güncelliği',
    severity: 'MEDIUM',
    risk_rating: 'Orta',
    gias_category: 'Operational',
    description:
      'Şube operasyon prosedürlerinin son 18 ayda güncellenmediği tespit edilmiştir. Bu durum operasyonel risk düzeyini artırmaktadır.',
    created_at: '2025-07-01T10:00:00.000Z',
  },
  regulatory_tags: ['Internal'],
  escalation_level: 0,
  created_at: '2025-07-01T10:00:00.000Z',
  updated_at: new Date().toISOString(),
  closed_at: undefined,
  performance_delay_days: 45,
  operational_delay_days: 10,
  aging_tier: 'TIER_2_HIGH',
  is_bddk_breach: false,
  evidence_count: 1,
  pending_requests: 0,
};

export default function AuditorWorkbenchPage() {
  const [openAction, setOpenAction] = useState<ActionAgingMetrics | null>(null);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Denetçi Komuta Merkezi</h1>
              <p className="text-sm text-slate-500">Action Super Drawer — Faz 3 Test Görünümü</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <SectionLabel label="Test Aksiyonları" />

          <ActionTestCard
            action={MOCK_ACTION}
            onOpen={() => setOpenAction(MOCK_ACTION)}
            badge={
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#700000] text-white">
                <AlertTriangle size={11} className="animate-pulse" />
                BDDK İhlali Aktif
              </span>
            }
          />

          <ActionTestCard
            action={MOCK_NORMAL_ACTION}
            onOpen={() => setOpenAction(MOCK_NORMAL_ACTION)}
            badge={
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <CheckCircle2 size={11} />
                Normal Aksiyon
              </span>
            }
          />
        </div>

        <div className="mt-8 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            Bileşen Referans Rehberi
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600">
            {[
              { label: 'ForensicTimeline', path: 'shared/ui/ForensicTimeline' },
              { label: 'AuditorDecisionBar', path: 'features/action-review/ui/AuditorDecisionBar' },
              { label: 'AIEvidenceAnalyzer', path: 'features/action-review/ui/AIEvidenceAnalyzer' },
              { label: 'TraceabilityGoldenThread', path: 'features/action-review/ui/TraceabilityGoldenThread' },
              { label: 'ActionSuperDrawer', path: 'widgets/action-super-drawer/ui/ActionSuperDrawer' },
              { label: 'ActionStatusBadge', path: 'entities/action/ui/ActionStatusBadge' },
            ].map(({ label, path }) => (
              <div key={label} className="font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <p className="font-bold text-slate-700">{label}</p>
                <p className="text-slate-400 text-[10px] mt-0.5 truncate">src/{path}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {openAction && (
        <ActionSuperDrawer
          action={openAction}
          evidence={openAction.id === MOCK_ACTION.id ? MOCK_EVIDENCE : undefined}
          isOpen={!!openAction}
          onClose={() => setOpenAction(null)}
          onDecision={(v) => {
            console.log('Decision:', v);
            setOpenAction(null);
          }}
        />
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
      {label}
    </p>
  );
}

function ActionTestCard({
  action,
  onOpen,
  badge,
}: {
  action: ActionAgingMetrics;
  onOpen: () => void;
  badge: React.ReactNode;
}) {
  const snapshot = action.finding_snapshot;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {badge}
            <ActionStatusBadge status={action.status} />
            <AgingTierBadge
              tier={action.aging_tier}
              isBddbBreach={action.is_bddk_breach}
              overdayDays={action.operational_delay_days > 0 ? action.operational_delay_days : undefined}
            />
          </div>
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2">
            {snapshot?.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock3 size={11} />
          Son: {action.current_due_date}
        </span>
        <span>{action.evidence_count} kanıt dosyası</span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 size={11} />
          {action.regulatory_tags.join(', ')}
        </span>
      </div>

      <button
        onClick={onOpen}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
      >
        <Eye size={14} />
        Super Drawer'ı Aç
      </button>
    </motion.div>
  );
}
