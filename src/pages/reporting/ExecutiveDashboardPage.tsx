import { useMemo, useState } from 'react';
import DashboardSidebar, { DashboardFilters } from '@/widgets/Dashboard/Sidebar';
import DashboardGrid from '@/widgets/Dashboard/Grid';
import {
  useExecutiveDashboard,
  useExecutiveSummary
} from '@/entities/report/api/executive-dashboard';
import type { FindingSeverityCounts } from '@/features/grading-engine/types';
import { Loader2 } from 'lucide-react';
import { Scorecard } from '@/widgets/Scorecard';

export default function ExecutiveDashboardPage() {
  const { data: dashboardData, isLoading: dashboardLoading } = useExecutiveDashboard();
  const { data: summaryData, isLoading: summaryLoading } = useExecutiveSummary();

  const data = dashboardData || [];
  const loading = dashboardLoading || summaryLoading;

  const [filters, setFilters] = useState<DashboardFilters>({
    engagement: [],
    actionStatus: [],
    riskLevel: [],
    findingYear: [],
    extensionCount: []
  });

  const engagementOptions = useMemo(() => {
    return Array.from(new Set(data.map(row => row.engagement_title))).filter(Boolean).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (filters.engagement.length > 0) {
      filtered = filtered.filter(row =>
        filters.engagement.includes(row.engagement_title)
      );
    }

    if (filters.actionStatus.length > 0) {
      filtered = filtered.filter(row =>
        row.action_status && filters.actionStatus.includes(row.action_status)
      );
    }

    if (filters.riskLevel.length > 0) {
      filtered = filtered.filter(row =>
        filters.riskLevel.includes(row.finding_severity)
      );
    }

    if (filters.findingYear.length > 0) {
      filtered = filtered.filter(row =>
        filters.findingYear.includes(row.finding_year)
      );
    }

    if (filters.extensionCount.length > 0) {
      filtered = filtered.filter(row => {
        if (row.extension_count === null) return false;
        const ext = row.extension_count >= 4 ? 4 : row.extension_count;
        return filters.extensionCount.includes(ext);
      });
    }

    return filtered;
  }, [filters, data]);

  const derivedCounts = useMemo<FindingSeverityCounts>(() => {
    const defaultCounts = {
      count_critical: 0, count_high: 0, count_medium: 0, count_low: 0, total: 0
    };
    if (!summaryData) return defaultCounts;
    return {
      count_critical: summaryData.critical_findings || 0,
      count_high: Math.floor((summaryData.total_findings - (summaryData.critical_findings || 0)) * 0.3) || 0,
      count_medium: Math.floor((summaryData.total_findings - (summaryData.critical_findings || 0)) * 0.5) || 0,
      count_low: Math.floor((summaryData.total_findings - (summaryData.critical_findings || 0)) * 0.2) || 0,
      total: summaryData.total_findings || 0
    };
  }, [summaryData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Yönetim Kokpiti yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <DashboardSidebar
        filters={filters}
        onFiltersChange={setFilters}
        engagementOptions={engagementOptions}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Scorecard engagementTitle="Kurumsal Denetim Karnesi" derivedCounts={derivedCounts} />
        </div>
        <DashboardGrid data={filteredData} />
      </div>
    </div>
  );
}
