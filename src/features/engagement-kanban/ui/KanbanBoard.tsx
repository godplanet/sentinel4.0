/**
 * Kanban Board for Engagements
 *
 * Drag-and-drop kanban board for managing audit engagements.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KanbanEngagement {
  id: string;
  title: string;
  client: string;
  period: string;
  status: 'planning' | 'execution' | 'review' | 'completed';
  assigned_to: string[];
  risk_level: 'low' | 'medium' | 'high';
  progress: number;
  workpaper_count: number;
  finding_count: number;
}
import {
  Briefcase,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface KanbanColumn {
  id: string;
  title: string;
  status: KanbanEngagement['status'];
  color: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'planning', title: 'Planlama', status: 'planning', color: 'bg-blue-100 border-blue-300' },
  { id: 'execution', title: 'İcra', status: 'execution', color: 'bg-orange-100 border-orange-300' },
  { id: 'review', title: 'İnceleme', status: 'review', color: 'bg-purple-100 border-purple-300' },
  { id: 'completed', title: 'Tamamlandı', status: 'completed', color: 'bg-green-100 border-green-300' },
];

interface KanbanBoardProps {
  engagements: KanbanEngagement[];
}

export function KanbanBoard({ engagements }: KanbanBoardProps) {
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<KanbanEngagement | null>(null);

  const getEngagementsByStatus = (status: KanbanEngagement['status']) => {
    return engagements.filter((eng) => eng.status === status);
  };

  const getRiskBadge = (risk: string) => {
    const styles = {
      low: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-red-100 text-red-700 border-red-300',
    };

    const labels = {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
    };

    return (
      <span className={`px-2 py-1 rounded border text-xs font-medium ${styles[risk as keyof typeof styles]}`}>
        {labels[risk as keyof typeof labels]}
      </span>
    );
  };

  const handleDragStart = (engagement: KanbanEngagement) => {
    setDraggedItem(engagement);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: KanbanEngagement['status']) => {
    if (draggedItem && draggedItem.status !== status) {
      console.log(`Moving ${draggedItem.title} to ${status}`);
      // TODO: Update engagement status
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-[calc(100vh-300px)]">
      {KANBAN_COLUMNS.map((column) => {
        const columnEngagements = getEngagementsByStatus(column.status);

        return (
          <div
            key={column.id}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.status)}
          >
            {/* Column Header */}
            <div className={`glass-card p-3 mb-3 border-2 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{column.title}</h3>
                <span className="px-2 py-1 bg-white/60 rounded-full text-xs font-medium text-slate-700">
                  {columnEngagements.length}
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {columnEngagements.map((engagement) => (
                <div
                  key={engagement.id}
                  draggable
                  onDragStart={() => handleDragStart(engagement)}
                  onDragEnd={handleDragEnd}
                  className="glass-card p-4 cursor-grab active:cursor-grabbing hover:shadow-xl transition-all group border-l-4 border-blue-500"
                  onClick={() => navigate(`/execution/workpapers?engagement=${engagement.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="text-white" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {engagement.title}
                        </h4>
                        <p className="text-xs text-slate-600 truncate">{engagement.client}</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Badge */}
                  <div className="mb-3">
                    {getRiskBadge(engagement.risk_level)}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <FileText size={12} className="text-slate-400" />
                      <span>{engagement.workpaper_count} ÇK</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <AlertCircle size={12} className="text-slate-400" />
                      <span>{engagement.finding_count} Bulgu</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{engagement.period}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Users size={12} className="text-slate-400" />
                      <span>{engagement.assigned_to.length} Kişi</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">İlerleme</span>
                      <span className="text-xs font-medium text-slate-900">{engagement.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                        style={{ width: `${engagement.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="flex -space-x-2">
                      {engagement.assigned_to.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center"
                        >
                          <span className="text-xs text-white font-medium">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <ArrowRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}

              {columnEngagements.length === 0 && (
                <div className="glass-card p-8 text-center">
                  <Briefcase className="mx-auto mb-2 text-slate-300" size={32} />
                  <p className="text-sm text-slate-500">Görev yok</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
