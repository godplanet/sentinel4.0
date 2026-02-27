import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AlertTriangle, Clock, Eye, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { ComprehensiveFinding, FindingState, FindingSeverity } from '@/entities/finding/model/types';

interface FindingKanbanBoardProps {
  findings: ComprehensiveFinding[];
  onFindingUpdate?: (findingId: string, newState: FindingState) => void;
}

const COLUMNS: Array<{ id: FindingState; title: string; icon: typeof Clock; color: string }> = [
  { id: 'DRAFT', title: 'Taslak', icon: Clock, color: 'slate' },
  { id: 'NEGOTIATION', title: 'Muzakere', icon: AlertTriangle, color: 'amber' },
  { id: 'PENDING_APPROVAL', title: 'Onay Bekliyor', icon: Eye, color: 'purple' },
  { id: 'CLOSED', title: 'Kapandi', icon: CheckCircle2, color: 'emerald' },
  { id: 'FINAL', title: 'Sonuclandi', icon: CheckCircle2, color: 'green' },
];

const SEVERITY_CONFIG: Record<FindingSeverity, { label: string; color: string }> = {
  CRITICAL: { label: 'Kritik', color: 'bg-red-500' },
  HIGH: { label: 'Yuksek', color: 'bg-orange-500' },
  MEDIUM: { label: 'Orta', color: 'bg-yellow-500' },
  LOW: { label: 'Dusuk', color: 'bg-blue-500' },
  OBSERVATION: { label: 'Gozlem', color: 'bg-slate-400' },
};

export function FindingKanbanBoard({ findings, onFindingUpdate }: FindingKanbanBoardProps) {
  const [localFindings, setLocalFindings] = useState(findings);

  const groupedFindings = useMemo(() => {
    const groups: Record<FindingState, ComprehensiveFinding[]> = {
      DRAFT: [],
      PUBLISHED: [],
      NEGOTIATION: [],
      PENDING_APPROVAL: [],
      FOLLOW_UP: [],
      CLOSED: [],
      FINAL: [],
      REMEDIATED: [],
      DISPUTED: [],
      DISPUTING: [],
    };

    localFindings.forEach(finding => {
      if (groups[finding.state]) {
        groups[finding.state].push(finding);
      }
    });

    return groups;
  }, [localFindings]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newState = destination.droppableId as FindingState;
    const findingId = draggableId;

    setLocalFindings(prev =>
      prev.map(f =>
        f.id === findingId ? { ...f, state: newState } : f
      )
    );

    onFindingUpdate?.(findingId, newState);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map(column => {
            const Icon = column.icon;
            const columnFindings = groupedFindings[column.id] || [];

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className={clsx(
                  'rounded-lg border-2 border-dashed',
                  column.color === 'slate' && 'border-slate-200 bg-slate-50/50',
                  column.color === 'amber' && 'border-amber-200 bg-amber-50/50',
                  column.color === 'purple' && 'border-purple-200 bg-purple-50/50',
                  column.color === 'emerald' && 'border-emerald-200 bg-emerald-50/50',
                  column.color === 'green' && 'border-green-200 bg-green-50/50',
                )}>
                  <div className={clsx(
                    'px-4 py-3 flex items-center justify-between border-b-2',
                    column.color === 'slate' && 'border-slate-200',
                    column.color === 'amber' && 'border-amber-200',
                    column.color === 'purple' && 'border-purple-200',
                    column.color === 'emerald' && 'border-emerald-200',
                    column.color === 'green' && 'border-green-200',
                  )}>
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={clsx(
                        column.color === 'slate' && 'text-slate-600',
                        column.color === 'amber' && 'text-amber-600',
                        column.color === 'purple' && 'text-purple-600',
                        column.color === 'emerald' && 'text-emerald-600',
                        column.color === 'green' && 'text-green-600',
                      )} />
                      <h3 className="font-bold text-sm text-slate-800">{column.title}</h3>
                    </div>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-bold',
                      column.color === 'slate' && 'bg-slate-200 text-slate-700',
                      column.color === 'amber' && 'bg-amber-200 text-amber-700',
                      column.color === 'purple' && 'bg-purple-200 text-purple-700',
                      column.color === 'emerald' && 'bg-emerald-200 text-emerald-700',
                      column.color === 'green' && 'bg-green-200 text-green-700',
                    )}>
                      {columnFindings.length}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={clsx(
                          'p-2 min-h-[500px] space-y-2',
                          snapshot.isDraggingOver && 'bg-blue-50/50'
                        )}
                      >
                        {columnFindings.map((finding, index) => (
                          <Draggable
                            key={finding.id}
                            draggableId={finding.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={clsx(
                                  'bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all cursor-move',
                                  snapshot.isDragging && 'shadow-xl ring-2 ring-blue-500'
                                )}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <div
                                    className={clsx('w-1 h-full rounded-full flex-shrink-0', SEVERITY_CONFIG[finding.severity].color)}
                                    style={{ minHeight: '100%' }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {finding.finding_code || finding.code}
                                      </span>
                                      <span className={clsx(
                                        'text-[9px] font-bold px-1.5 py-0.5 rounded text-white',
                                        SEVERITY_CONFIG[finding.severity].color
                                      )}>
                                        {SEVERITY_CONFIG[finding.severity].label}
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">
                                      {finding.title}
                                    </h4>
                                    {finding.auditee_department && (
                                      <p className="text-[10px] text-slate-500 mb-2">
                                        {finding.auditee_department}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                      {finding.impact_score && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-[9px] text-slate-500">Risk:</span>
                                          <span className="text-[10px] font-bold text-red-600">
                                            {finding.impact_score}
                                          </span>
                                        </div>
                                      )}
                                      {finding.financial_impact && finding.financial_impact > 0 && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-[9px] text-slate-500">Mali:</span>
                                          <span className="text-[10px] font-bold text-orange-600">
                                            {(finding.financial_impact / 1000).toFixed(0)}K
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnFindings.length === 0 && (
                          <div className="flex items-center justify-center h-32 text-slate-400">
                            <p className="text-xs">Bulgu yok</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
