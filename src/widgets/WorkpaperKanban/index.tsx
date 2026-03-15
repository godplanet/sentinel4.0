import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, GripVertical, Lock, Shield, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';
import type { ApprovalStatus, ControlRow } from '../WorkpaperGrid/types';

interface WorkpaperKanbanProps {
  data: ControlRow[];
  onUpdateStatus: (id: string, status: ApprovalStatus) => void;
  onOpenDrawer: (row: ControlRow) => void;
}

const COLUMNS = [
  { id: 'in_progress', title: 'To Do / In Progress', color: 'border-slate-300', bg: 'bg-slate-100', text: 'text-slate-700' },
  { id: 'prepared', title: 'Prepared', color: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
  { id: 'reviewed', title: 'Reviewed', color: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
];

export function WorkpaperKanban({ data, onUpdateStatus, onOpenDrawer }: WorkpaperKanbanProps) {
  
  const columnsData = useMemo(() => {
    const cols: Record<string, ControlRow[]> = {
      in_progress: [],
      prepared: [],
      reviewed: [],
    };
    
    data.forEach(row => {
      const status = row.approval_status || 'in_progress';
      if (cols[status]) {
        cols[status].push(row);
      } else {
        cols['in_progress'].push(row);
      }
    });
    
    return cols;
  }, [data]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    onUpdateStatus(draggableId, destination.droppableId as ApprovalStatus);
  };

  if (!data || data.length === 0) {
    return (
      <div className="py-16 text-center bg-surface border border-slate-200 rounded-xl shadow-sm">
        <p className="text-slate-500 font-medium">No controls match your search</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex items-start gap-4 min-w-[900px]">
          {COLUMNS.map((col) => {
            const items = columnsData[col.id];
            
            return (
              <div key={col.id} className="flex flex-col w-1/3 min-w-[300px] shrink-0">
                <div className={clsx('px-4 py-3 border-t-4 bg-surface rounded-t-xl border-x', col.color)}>
                  <div className="flex items-center justify-between">
                    <h3 className={clsx('font-bold text-sm uppercase tracking-wider', col.text)}>
                      {col.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                      {items.length}
                    </span>
                  </div>
                </div>
                
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={clsx(
                        'flex-1 flex flex-col gap-3 min-h-[500px] p-3 rounded-b-xl border-x border-b border-slate-200 transition-colors',
                        snapshot.isDraggingOver ? col.bg : 'bg-slate-50/50'
                      )}
                    >
                      {items.map((row, index) => {
                        const RiskIcon = row.risk_level === 'HIGH' ? ShieldAlert : Shield;
                        const riskColor = row.risk_level === 'HIGH' ? 'text-red-600' : 'text-amber-500';
                        const hasIssue = row.tod === 'INEFFECTIVE' || row.toe === 'INEFFECTIVE';

                        return (
                          <Draggable key={row.id} draggableId={row.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                onClick={() => onOpenDrawer(row)}
                                className={clsx(
                                  'bg-surface border p-3 rounded-lg shadow-sm group hover:shadow-md transition-shadow cursor-pointer',
                                  snapshot.isDragging ? 'border-blue-400 shadow-xl opacity-90' : 'border-slate-200',
                                  hasIssue && 'border-l-4 border-l-red-500'
                                )}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing mt-0.5" onClick={e => e.stopPropagation()}>
                                    <GripVertical size={14} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <code className="text-[10px] font-mono font-bold text-slate-500">{row.control_id}</code>
                                      <RiskIcon size={12} className={riskColor} title={`${row.risk_level} Risk`} />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                                      {row.title}
                                    </h4>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                  <div className="flex items-center gap-1.5">
                                    <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white', row.auditor.color)} title={row.auditor.name}>
                                      {row.auditor.initials}
                                    </div>
                                    {hasIssue && <AlertCircle size={12} className="text-red-500" title="Control Effectiveness Issue" />}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {col.id === 'prepared' && <Lock size={12} className="text-blue-500" title="Prepared" />}
                                    {col.id === 'reviewed' && <CheckCircle2 size={12} className="text-emerald-500" title="Reviewed" />}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
