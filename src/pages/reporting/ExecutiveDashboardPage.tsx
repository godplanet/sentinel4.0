import { useEffect, useState } from 'react';
import DashboardSidebar, { DashboardFilters } from '@/widgets/Dashboard/Sidebar';
import DashboardGrid from '@/widgets/Dashboard/Grid';
import {
  getExecutiveDashboardData,
  type ExecutiveDashboardRow
} from '@/entities/report/api/executive-dashboard';
import { Loader2 } from 'lucide-react';
import { Scorecard } from '@/widgets/Scorecard';

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<ExecutiveDashboardRow[]>([]);
  const [filteredData, setFilteredData] = useState<ExecutiveDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagementOptions, setEngagementOptions] = useState<string[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    engagement: [],
    actionStatus: [],
    riskLevel: [],
    findingYear: [],
    extensionCount: []
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardData = await getExecutiveDashboardData();
      setData(dashboardData);
      setFilteredData(dashboardData);

      const uniqueEngagements = Array.from(
        new Set(dashboardData.map(row => row.engagement_title))
      ).filter(Boolean).sort();
      setEngagementOptions(uniqueEngagements);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
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

    setFilteredData(filtered);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Yönetim Kokpiti yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <DashboardSidebar
        filters={filters}
        onFiltersChange={setFilters}
        engagementOptions={engagementOptions}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Scorecard demoMode engagementTitle="Kurumsal Denetim Karnesi" />
        </div>
        <DashboardGrid data={filteredData} />
      </div>
    </div>
  );
}
