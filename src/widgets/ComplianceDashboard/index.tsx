import { useState } from 'react';
import { useFrameworkCoverage } from '@/features/compliance';
import { OverallDonut } from './OverallDonut';
import { FrameworkCard } from './FrameworkCard';
import { RequirementsPanel } from './RequirementsPanel';
import { Shield, Loader2, AlertCircle, TrendingUp, Target, BarChart3 } from 'lucide-react';

export const ComplianceDashboard = () => {
  const { data: stats, isLoading, error } = useFrameworkCoverage();
  const [selectedFwId, setSelectedFwId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-3 text-sm text-slate-500">Yukleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">Veri yuklenirken hata olustu</span>
      </div>
    );
  }

  const frameworks = stats || [];
  const totalReqs = frameworks.reduce((s, f) => s + f.total_requirements, 0);
  const totalGaps = frameworks.reduce((s, f) => s + f.gap_count, 0);
  const avgScore = frameworks.length > 0
    ? Math.round(frameworks.reduce((s, f) => s + f.avg_match_score, 0) / frameworks.length)
    : 0;

  const selectedFw = frameworks.find((f) => f.framework_id === selectedFwId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Shield}
          label="Aktif Cerceve"
          value={frameworks.length}
          color="bg-blue-600"
        />
        <MetricCard
          icon={Target}
          label="Toplam Gereksinim"
          value={totalReqs}
          color="bg-emerald-600"
        />
        <MetricCard
          icon={AlertCircle}
          label="Acik Gap"
          value={totalGaps}
          color="bg-red-600"
        />
        <MetricCard
          icon={BarChart3}
          label="Ort. Esleme Skoru"
          value={`%${avgScore}`}
          color="bg-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <OverallDonut stats={frameworks} />
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {frameworks.map((fw) => (
              <FrameworkCard
                key={fw.framework_id}
                stat={fw}
                onClick={() =>
                  setSelectedFwId(selectedFwId === fw.framework_id ? null : fw.framework_id)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {selectedFw && (
        <RequirementsPanel
          frameworkId={selectedFw.framework_id}
          frameworkName={selectedFw.name}
          shortCode={selectedFw.short_code}
          onClose={() => setSelectedFwId(null)}
        />
      )}
    </div>
  );
};

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-lg font-black text-slate-800">{value}</div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}
