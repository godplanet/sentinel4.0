import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/PageHeader';
import { GlassCard } from '@/shared/ui/GlassCard';
import { fetchProgramTemplates } from '@/entities/library/api';
import type { ProgramTemplateWithSteps } from '@/entities/library/types';
import {
  BookOpen,
  Clock,
  Shield,
  Sparkles,
  ChevronRight,
  FileText,
  Award,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';

export default function ProgramLibraryPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ProgramTemplateWithSteps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchProgramTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const getFrameworkBadge = (framework: string) => {
    const badges = {
      COBIT: { label: 'COBIT', color: 'bg-blue-500' },
      COSO: { label: 'COSO', color: 'bg-emerald-500' },
      GIAS2024: { label: 'GIAS 2024', color: 'bg-purple-500' },
      ISO31000: { label: 'ISO 31000', color: 'bg-orange-500' },
      SOX: { label: 'SOX', color: 'bg-red-500' },
      NIST: { label: 'NIST', color: 'bg-indigo-500' },
    };
    return badges[framework as keyof typeof badges] || { label: framework, color: 'bg-slate-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <PageHeader
        title="Program Library"
        subtitle="Pre-built audit programs ready to deploy"
        actions={
          <button
            onClick={() => navigate('/library/builder/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles size={16} />
            Create Custom Program
          </button>
        }
      />

      <div className="mb-6">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Filter by Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {cat === 'all' ? 'All Programs' : cat}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading programs...</p>
          </div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Programs Found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Create your first audit program to get started.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const badge = getFrameworkBadge(template.framework);
            return (
              <GlassCard
                key={template.id}
                className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/library/builder/${template.id}`)}
              >
                <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Layers className="w-16 h-16 text-white opacity-20" />
                  <div className="absolute top-3 right-3">
                    <span className={clsx('px-3 py-1 rounded-full text-xs font-bold text-white', badge.color)}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {template.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <FileText size={14} />
                      <span>{template.step_count} Steps</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Clock size={14} />
                      <span>{template.estimated_hours}h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Award size={14} className="text-amber-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {template.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/library/deploy/${template.id}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                      <Shield size={14} />
                      Deploy to Audit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/library/builder/${template.id}`);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <GlassCard className="p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white">Program Templates:</strong> These are pre-built audit programs that you can deploy directly to any engagement. Each program contains a complete set of test steps with procedures, evidence requirements, and GIAS 2024 risk linkage.
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
