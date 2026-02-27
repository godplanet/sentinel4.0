import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import { BoardBriefingCard } from '@/features/report-editor/ui/BoardBriefingCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { Report } from '@/entities/report/model/types';

const TENANT = '11111111-1111-1111-1111-111111111111';

function useLatestPublishedReport() {
  return useQuery<Report | null>({
    queryKey: ['board-briefing-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('tenant_id', TENANT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        description: data.description ?? '',
        theme_config: data.theme_config ?? { mode: 'minimal', accent: 'blue', layout: 'standard' },
        layout_type: data.layout_type ?? 'executive',
      } as Report;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function BoardBriefingPage() {
  const navigate = useNavigate();
  const { activeReport, setActiveReport } = useActiveReportStore();
  const { data: liveReport, isLoading } = useLatestPublishedReport();

  useEffect(() => {
    if (liveReport) {
      setActiveReport(liveReport);
    }
    return () => {
      setActiveReport(null);
    };
  }, [liveReport, setActiveReport]);

  if (isLoading || !activeReport) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-sans font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Geri
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-sans font-semibold text-slate-700">YK Sunumu</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-sans text-slate-500">Salt Okunur Görünüm</span>
          </div>
          <button
            onClick={() => navigate(`/reporting/zen-editor/${activeReport.id}`)}
            className="flex items-center gap-1.5 text-sm font-sans font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
          >
            <ExternalLink size={14} />
            Editörde Aç
          </button>
        </div>
      </header>

      <BoardBriefingCard report={activeReport} />
    </div>
  );
}
