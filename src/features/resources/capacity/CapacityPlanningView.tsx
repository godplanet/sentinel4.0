import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { BarChart3, Calendar, TrendingUp, AlertCircle, Users } from 'lucide-react';
import clsx from 'clsx';

interface MonthlyCapacity {
  month: string;
  year: number;
  total_capacity: number;
  allocated: number;
  available: number;
  planned_engagements: number;
}

interface ForecastData {
  period: string;
  demand: number;
  capacity: number;
  gap: number;
}

export function CapacityPlanningView() {
  const [monthlyData, setMonthlyData] = useState<MonthlyCapacity[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadCapacityData();
  }, [selectedYear]);

  const loadCapacityData = async () => {
    try {
      setLoading(true);

      const { data: auditors } = await supabase
        .from('auditor_profiles')
        .select('id');

      const auditorCount = auditors?.length || 0;
      const monthlyCapacityPerAuditor = 160;

      const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];

      const capacityData: MonthlyCapacity[] = [];
      const forecast: ForecastData[] = [];

      for (let i = 0; i < 12; i++) {
        const startDate = new Date(selectedYear, i, 1);
        const endDate = new Date(selectedYear, i + 1, 0);

        const { data: engagements } = await supabase
          .from('audit_engagements')
          .select('estimated_hours')
          .gte('start_date', startDate.toISOString())
          .lte('end_date', endDate.toISOString());

        const allocated = (engagements || []).reduce((sum, e) => sum + (e.estimated_hours || 0), 0);
        const totalCapacity = auditorCount * monthlyCapacityPerAuditor;

        capacityData.push({
          month: months[i],
          year: selectedYear,
          total_capacity: totalCapacity,
          allocated: allocated,
          available: totalCapacity - allocated,
          planned_engagements: engagements?.length || 0
        });

        forecast.push({
          period: `${months[i]} ${selectedYear}`,
          demand: allocated,
          capacity: totalCapacity,
          gap: totalCapacity - allocated
        });
      }

      setMonthlyData(capacityData);
      setForecastData(forecast);
    } catch (error) {
      console.error('Failed to load capacity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationClass = (allocated: number, capacity: number) => {
    const percent = (allocated / capacity) * 100;
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 90) return 'bg-orange-500';
    if (percent >= 70) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getTotalStats = () => {
    const total = monthlyData.reduce((acc, month) => ({
      capacity: acc.capacity + month.total_capacity,
      allocated: acc.allocated + month.allocated,
      available: acc.available + month.available,
      engagements: acc.engagements + month.planned_engagements
    }), { capacity: 0, allocated: 0, available: 0, engagements: 0 });

    return total;
  };

  const totalStats = getTotalStats();
  const avgUtilization = totalStats.capacity > 0
    ? Math.round((totalStats.allocated / totalStats.capacity) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Kapasite Planlama</h2>
          <p className="text-slate-600 mt-1">
            Gelecek dönem kaynak planlaması ve tahmin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Toplam Kapasite</p>
              <p className="text-2xl font-bold text-slate-900">{totalStats.capacity}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Tahsis Edilen</p>
              <p className="text-2xl font-bold text-slate-900">{totalStats.allocated}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Müsait</p>
              <p className="text-2xl font-bold text-slate-900">{totalStats.available}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Ort. Kullanım</p>
              <p className="text-2xl font-bold text-slate-900">{avgUtilization}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Aylık Kapasite Dağılımı - {selectedYear}
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyData.map((month, index) => {
                const utilizationPercent = month.total_capacity > 0
                  ? Math.round((month.allocated / month.total_capacity) * 100)
                  : 0;

                const isOverCapacity = utilizationPercent >= 100;
                const isNearCapacity = utilizationPercent >= 90 && utilizationPercent < 100;

                return (
                  <div
                    key={index}
                    className={clsx(
                      'border rounded-lg p-4 transition-all',
                      isOverCapacity
                        ? 'border-red-300 bg-red-50'
                        : isNearCapacity
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-slate-200 hover:border-blue-300'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center text-white">
                          <span className="text-xs font-medium uppercase">{month.month.substring(0, 3)}</span>
                          <span className="text-xl font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{month.month} {month.year}</h4>
                          <p className="text-sm text-slate-600">
                            {month.planned_engagements} planlı denetim
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={clsx(
                          'text-2xl font-bold mb-1',
                          isOverCapacity ? 'text-red-600' :
                          isNearCapacity ? 'text-orange-600' : 'text-slate-900'
                        )}>
                          {utilizationPercent}%
                        </div>
                        <p className="text-xs text-slate-500">
                          {month.allocated}h / {month.total_capacity}h
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full transition-all',
                            getUtilizationClass(month.allocated, month.total_capacity)
                          )}
                          style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          Müsait: <span className="font-medium text-green-600">{month.available}h</span>
                        </span>
                        {(isOverCapacity || isNearCapacity) && (
                          <span className={clsx(
                            'flex items-center gap-1 font-medium',
                            isOverCapacity ? 'text-red-600' : 'text-orange-600'
                          )}>
                            <AlertCircle size={12} />
                            {isOverCapacity ? 'Kapasite Aşımı' : 'Kritik Seviye'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Kapasite Analizi</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>Yıllık Kullanım:</strong> {avgUtilization}% (Ortalama)
              </p>
              <p>
                <strong>Risk Ayları:</strong>{' '}
                {monthlyData.filter(m => (m.allocated / m.total_capacity) >= 0.9).length} ay kritik seviyede
              </p>
              <p>
                <strong>Öneri:</strong> Yoğun aylarda ek kaynak planlaması yapılması önerilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
