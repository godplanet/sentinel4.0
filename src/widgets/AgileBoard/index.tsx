import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from '@/shared/api/supabase';
import { FileText, Clock, AlertTriangle, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditStep {
  id: string;
  step_code: string;
  step_title: string;
  risk_rating: string | null;
  status: string;
  assigned_to: string | null;
  workpaper_status: string | null;
  assignee_name?: string;
}

interface Column {
  id: string;
  title: string;
  icon: any;
  color: string;
  status: string[];
}

const COLUMNS: Column[] = [
  {
    id: 'planned',
    title: 'Planlanan',
    icon: FileText,
    color: 'bg-slate-100 border-slate-300',
    status: ['NOT_STARTED', 'PENDING'],
  },
  {
    id: 'in_progress',
    title: 'Sürüyor',
    icon: Clock,
    color: 'bg-blue-50 border-blue-300',
    status: ['IN_PROGRESS', 'DRAFT'],
  },
  {
    id: 'review',
    title: 'Gözden Geçirme',
    icon: AlertTriangle,
    color: 'bg-amber-50 border-amber-300',
    status: ['UNDER_REVIEW', 'REVIEW'],
  },
  {
    id: 'completed',
    title: 'Tamamlandı',
    icon: CheckCircle2,
    color: 'bg-emerald-50 border-emerald-300',
    status: ['COMPLETED', 'SIGNED', 'CLOSED'],
  },
];

interface AgileBoardProps {
  engagementId: string;
}

export function AgileBoard({ engagementId }: AgileBoardProps) {
  const [steps, setSteps] = useState<AuditStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSteps();
    const subscription = subscribeToChanges();
    return () => {
      subscription?.unsubscribe();
    };
  }, [engagementId]);

  const loadSteps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_steps')
        .select(`
          id,
          step_code,
          step_title,
          risk_rating,
          status,
          assigned_to,
          workpapers (
            status
          )
        `)
        .eq('engagement_id', engagementId)
        .order('step_code');

      if (error) throw error;

      const stepsWithWorkpaperStatus = data?.map((step: any) => ({
        ...step,
        workpaper_status: step.workpapers?.[0]?.status || null,
      })) || [];

      setSteps(stepsWithWorkpaperStatus);
    } catch (error) {
      console.error('Error loading audit steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    return supabase
      .channel('audit_steps_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_steps',
          filter: `engagement_id=eq.${engagementId}`,
        },
        () => {
          loadSteps();
        }
      )
      .subscribe();
  };

  const getColumnForStep = (step: AuditStep): string => {
    const status = step.workpaper_status || step.status || 'NOT_STARTED';

    for (const column of COLUMNS) {
      if (column.status.some(s => status.toUpperCase().includes(s))) {
        return column.id;
      }
    }

    return 'planned';
  };

  const getStepsByColumn = (columnId: string): AuditStep[] => {
    return steps.filter(step => getColumnForStep(step) === columnId);
  };

  const updateStepStatus = async (stepId: string, newColumnId: string) => {
    const column = COLUMNS.find(c => c.id === newColumnId);
    if (!column) return;

    const newStatus = column.status[0];

    try {
      const { error } = await supabase
        .from('audit_steps')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stepId);

      if (error) throw error;

      const { error: wpError } = await supabase
        .from('workpapers')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('step_id', stepId);

      if (wpError) console.warn('Workpaper update warning:', wpError);
    } catch (error) {
      console.error('Error updating step status:', error);
      loadSteps();
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === result.source.droppableId) return;

    updateStepStatus(draggableId, destination.droppableId);
  };

  const getRiskColor = (rating: string | null): string => {
    switch (rating?.toUpperCase()) {
      case 'CRITICAL':
        return 'border-l-4 border-l-red-500';
      case 'HIGH':
        return 'border-l-4 border-l-orange-500';
      case 'MEDIUM':
        return 'border-l-4 border-l-amber-500';
      case 'LOW':
        return 'border-l-4 border-l-green-500';
      default:
        return 'border-l-4 border-l-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Kanban yükleniyor...</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map((column) => {
          const columnSteps = getStepsByColumn(column.id);
          const Icon = column.icon;

          return (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
              <div className={`${column.color} border rounded-t-lg p-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-slate-700" />
                  <h3 className="font-semibold text-slate-900">{column.title}</h3>
                </div>
                <span className="text-sm font-bold text-slate-600 bg-white px-2 py-1 rounded">
                  {columnSteps.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 bg-slate-50 border-x border-b rounded-b-lg overflow-y-auto ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {columnSteps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-white rounded-lg shadow-sm border border-slate-200 p-3 ${getRiskColor(
                              step.risk_rating
                            )} ${
                              snapshot.isDragging ? 'shadow-xl rotate-2' : 'hover:shadow-md'
                            } transition-all cursor-grab active:cursor-grabbing`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {step.step_code}
                              </span>
                              {step.risk_rating && (
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded ${
                                    step.risk_rating === 'CRITICAL'
                                      ? 'bg-red-100 text-red-700'
                                      : step.risk_rating === 'HIGH'
                                      ? 'bg-orange-100 text-orange-700'
                                      : step.risk_rating === 'MEDIUM'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {step.risk_rating}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900 mb-3 line-clamp-2">
                              {step.step_title}
                            </h4>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {step.assigned_to ? (
                                  <>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                                      {step.assignee_name?.[0] || 'A'}
                                    </div>
                                    <span className="text-xs text-slate-600">
                                      {step.assignee_name || 'Assigned'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs text-slate-400">Unassigned</span>
                                  </>
                                )}
                              </div>

                              {step.workpaper_status && (
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  WP: {step.workpaper_status}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {columnSteps.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                        Hiç adım yok
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
