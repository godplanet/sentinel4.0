import { Droppable, Draggable } from '@hello-pangea/dnd';
import clsx from 'clsx';
import type { AuditTask, TaskStatus } from '@/features/audit-creation/types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  columnId: TaskStatus;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  tasks: AuditTask[];
}

export function KanbanColumn({ columnId, title, icon: Icon, color, tasks }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      <div className={clsx('border rounded-t-lg p-3 flex items-center justify-between', color)}>
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-700" />
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-white/60 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={clsx(
              'flex-1 p-2 space-y-2 border-x border-b rounded-b-lg overflow-y-auto min-h-[200px]',
              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-200' : 'bg-slate-50/50 border-slate-200'
            )}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard task={task} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-24 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg">
                Gorev yok
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
