import { useMemo, useState, useEffect } from 'react';
import { usePlanningStore } from '@/entities/planning/model/store';
import { useUniverseStore } from '@/entities/universe/model/store';
import { GanttBar } from './GanttBar';
import type { AuditEngagement } from '@/entities/planning/model/types';
import { supabase } from '@/shared/api/supabase';

const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

interface GanttTimelineProps {
  planId: string;
  year: number;
  onEngagementClick?: (engagement: AuditEngagement) => void;
}

export function GanttTimeline({ planId, year, onEngagementClick }: GanttTimelineProps) {
  const allEngagements = usePlanningStore((s) => s.engagements);
  const entities = useUniverseStore((s) => s.entities);
  const [auditors, setAuditors] = useState<any[]>([]);

  useEffect(() => {
    loadAuditors();
  }, []);

  const loadAuditors = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, full_name, title')
      .eq('role', 'auditor');
    setAuditors(data || []);
  };

  const engagements = useMemo(
    () => allEngagements.filter((eng) => eng.plan_id === planId),
    [allEngagements, planId]
  );

  const yearStart = useMemo(() => new Date(year, 0, 1), [year]);

  const engagementsByEntity = useMemo(() => {
    const grouped = new Map<string, typeof engagements>();

    engagements.forEach((engagement) => {
      const entityId = engagement.entity_id;
      if (!grouped.has(entityId)) {
        grouped.set(entityId, []);
      }
      grouped.get(entityId)!.push(engagement);
    });

    return grouped;
  }, [engagements]);

  const entityRows = useMemo(() => {
    return Array.from(engagementsByEntity.entries()).map(([entityId, entityEngagements]) => {
      const entity = entities.find((e) => e.id === entityId);
      return {
        entityId,
        entityName: entity?.name || 'Unknown Entity',
        engagements: entityEngagements,
      };
    });
  }, [engagementsByEntity, entities]);

  if (entityRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-white/5 rounded-lg bg-white/5 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <div className="text-slate-400 text-sm">Planlı denetim bulunmuyor</div>
          <div className="text-slate-500 text-xs">
            Bir denetim eklemek için "Denetim Ekle" butonuna tıklayın
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[1200px]">
        <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-900/30 backdrop-blur-sm">
          <div className="grid grid-cols-[200px_1fr]">
            <div className="bg-slate-900/50 border-r border-white/10 px-4 py-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Denetim Birimi
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-12 bg-slate-900/50">
                {MONTHS.map((month, index) => (
                  <div
                    key={month}
                    className={`
                      px-2 py-3 text-center text-xs font-medium text-slate-300
                      ${index < 11 ? 'border-r border-white/5' : ''}
                    `}
                  >
                    {month}
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 pointer-events-none grid grid-cols-12">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className={`
                      ${index < 11 ? 'border-r border-white/5' : ''}
                    `}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {entityRows.map((row) => (
              <div
                key={row.entityId}
                className="grid grid-cols-[200px_1fr] hover:bg-white/5 transition-colors"
              >
                <div className="border-r border-white/10 px-4 py-4">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {row.entityName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {row.engagements.length} denetim
                  </div>
                </div>

                <div className="relative h-16">
                  <div className="absolute inset-0 grid grid-cols-12">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className={`
                          ${index < 11 ? 'border-r border-white/5' : ''}
                        `}
                      />
                    ))}
                  </div>

                  {row.engagements.map((engagement) => {
                    const entity = entities.find((e) => e.id === engagement.entity_id);
                    const assignedAuditor = engagement.assigned_auditor_id
                      ? auditors.find((a) => a.id === engagement.assigned_auditor_id)
                      : undefined;

                    return (
                      <GanttBar
                        key={engagement.id}
                        start={new Date(engagement.start_date)}
                        end={new Date(engagement.end_date)}
                        title={engagement.title}
                        status={engagement.status}
                        riskScore={engagement.risk_snapshot_score || 0}
                        entityName={entity?.name || 'Unknown'}
                        yearStart={yearStart}
                        assignedAuditor={assignedAuditor}
                        onClick={() => onEngagementClick?.(engagement)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500/80 to-blue-600/80 border border-blue-400/30" />
              <span>Planlandı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-amber-500/80 to-amber-600/80 border border-amber-400/30" />
              <span>Devam Ediyor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 border border-emerald-400/30" />
              <span>Tamamlandı</span>
            </div>
          </div>
          <div>
            Toplam {engagements.length} denetim • {entityRows.length} birim
          </div>
        </div>
      </div>
    </div>
  );
}
