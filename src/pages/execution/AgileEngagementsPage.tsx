import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Plus, Calendar, Target, Users, ArrowRight, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import type { AgileEngagement } from '@/features/audit-creation/types';
import { fetchAgileEngagements } from '@/features/audit-creation/api';

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-slate-100 text-slate-700 border-slate-300',
  ACTIVE: 'bg-blue-100 text-blue-700 border-blue-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

export function AgileEngagementsPage() {
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState<AgileEngagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagements();
  }, []);

  const loadEngagements = async () => {
    try {
      setLoading(true);
      const data = await fetchAgileEngagements();
      setEngagements(data);
    } catch (err) {
      console.error('Failed to load agile engagements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Agile Denetimler</h2>
          <p className="text-sm text-slate-500">Sprint tabanli denetim gorevleriniz</p>
        </div>
        <button
          onClick={() => navigate('/execution/new-engagement')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Yeni Denetim
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : engagements.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-600 font-medium mb-2">Henuz agile denetim yok</p>
          <p className="text-slate-500 text-sm mb-4">Hizmet katalogundan yeni bir denetim olusturun</p>
          <button
            onClick={() => navigate('/execution/new-engagement')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <Plus size={14} /> Denetim Olustur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {engagements.map((eng, i) => (
            <motion.button
              key={eng.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/execution/sprint-board/${eng.id}`)}
              className="text-left bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase size={20} className="text-blue-600" />
                  </div>
                  <span className={clsx(
                    'text-xs font-semibold px-2.5 py-1 rounded-lg border',
                    STATUS_COLORS[eng.status]
                  )}>
                    {eng.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                  {eng.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{eng.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Target size={12} /> {eng.total_sprints} Sprint
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {eng.start_date || '-'}
                  </span>
                  {Array.isArray(eng.team_members) && eng.team_members.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {eng.team_members.length}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  <Zap size={12} /> Sprint Board
                </span>
                <ArrowRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
