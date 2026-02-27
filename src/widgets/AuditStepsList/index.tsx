import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { FileText, User, AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
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
  description?: string;
}

interface AuditStepsListProps {
  engagementId: string;
}

export function AuditStepsList({ engagementId }: AuditStepsListProps) {
  const [steps, setSteps] = useState<AuditStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

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
          description,
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
      .channel('audit_steps_list_changes')
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      NOT_STARTED: { label: 'Başlanmadı', color: 'bg-slate-100 text-slate-700', icon: Clock },
      PENDING: { label: 'Bekliyor', color: 'bg-slate-100 text-slate-700', icon: Clock },
      IN_PROGRESS: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700', icon: Clock },
      DRAFT: { label: 'Taslak', color: 'bg-blue-100 text-blue-700', icon: FileText },
      UNDER_REVIEW: { label: 'İncelemede', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
      REVIEW: { label: 'Gözden Geçirme', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
      COMPLETED: { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
      SIGNED: { label: 'İmzalandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
      CLOSED: { label: 'Kapalı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    };

    const config = statusConfig[status?.toUpperCase()] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getRiskBadge = (rating: string | null) => {
    if (!rating) return null;

    const riskConfig: Record<string, { label: string; color: string }> = {
      CRITICAL: { label: 'Kritik', color: 'bg-red-100 text-red-700 border-red-300' },
      HIGH: { label: 'Yüksek', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      MEDIUM: { label: 'Orta', color: 'bg-amber-100 text-amber-700 border-amber-300' },
      LOW: { label: 'Düşük', color: 'bg-green-100 text-green-700 border-green-300' },
    };

    const config = riskConfig[rating.toUpperCase()] || riskConfig.LOW;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Yükleniyor...</div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz Denetim Adımı Yok</h3>
          <p className="text-slate-500">Bu görev için denetim adımları tanımlanmamış.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            selectedStep === step.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
          onClick={() => setSelectedStep(step.id === selectedStep ? null : step.id)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded">
                    {step.step_code}
                  </span>
                  {getRiskBadge(step.risk_rating)}
                  {getStatusBadge(step.workpaper_status || step.status)}
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-2">{step.step_title}</h3>

                {step.description && selectedStep === step.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-sm text-slate-600 mb-3"
                  >
                    {step.description}
                  </motion.p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    {step.assigned_to ? (
                      <>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                          {step.assignee_name?.[0] || 'A'}
                        </div>
                        <span className="text-slate-700 font-medium">
                          {step.assignee_name || 'Atandı'}
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-400">Atanmadı</span>
                      </>
                    )}
                  </div>

                  {step.workpaper_status && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <FileText className="w-4 h-4" />
                      <span>Workpaper: {step.workpaper_status}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <ChevronRight
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    selectedStep === step.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
