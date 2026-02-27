import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Zap,
  Info,
} from 'lucide-react';
import { fetchQuantScenarios, type QuantScenario } from '@/entities/quant';
import { runMonteCarloSimulation, formatCurrency, formatPercentage } from '@/features/quant/monteCarlo';

export function QuantDashboard() {
  const [scenarios, setScenarios] = useState<QuantScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await fetchQuantScenarios();
      setScenarios(data);
      if (data.length > 0) {
        setSelectedScenarioId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  const simulationResults = useMemo(() => {
    if (!selectedScenario) return null;

    setSimulating(true);
    const results = runMonteCarloSimulation(
      selectedScenario.min_loss,
      selectedScenario.likely_loss,
      selectedScenario.max_loss,
      selectedScenario.probability
    );
    setTimeout(() => setSimulating(false), 500);

    return results;
  }, [selectedScenario]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Senaryolar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          Senaryo Bulunamadı
        </h3>
        <p className="text-slate-500">Henüz risk senaryosu tanımlanmamış.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Risk Senaryosu Seçin
        </label>
        <select
          value={selectedScenarioId}
          onChange={(e) => setSelectedScenarioId(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 font-medium"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.title} ({formatPercentage(scenario.probability)} Olasılık)
            </option>
          ))}
        </select>
      </div>

      {selectedScenario && simulationResults && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-100">
                  Beklenen Kayıp (ALE)
                </span>
                <DollarSign className="w-5 h-5 text-blue-200" />
              </div>
              <p className="text-3xl font-bold mb-1">
                {formatCurrency(simulationResults.ale)}
              </p>
              <p className="text-xs text-blue-100">Yıllık Ortalama Zarar</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-amber-100">
                  VaR (95%)
                </span>
                <AlertTriangle className="w-5 h-5 text-amber-200" />
              </div>
              <p className="text-3xl font-bold mb-1">
                {formatCurrency(simulationResults.var_95)}
              </p>
              <p className="text-xs text-amber-100">%95 Güven Aralığı</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-red-100">
                  VaR (99%)
                </span>
                <AlertTriangle className="w-5 h-5 text-red-200" />
              </div>
              <p className="text-3xl font-bold mb-1">
                {formatCurrency(simulationResults.var_99)}
              </p>
              <p className="text-xs text-red-100">%99 Güven Aralığı</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-green-100">
                  Olasılık
                </span>
                <TrendingUp className="w-5 h-5 text-green-200" />
              </div>
              <p className="text-3xl font-bold mb-1">
                {formatPercentage(selectedScenario.probability)}
              </p>
              <p className="text-xs text-green-100">Gerçekleşme Olasılığı</p>
            </motion.div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Zarar Olasılık Dağılımı
                </h3>
                <p className="text-sm text-slate-600">
                  Monte Carlo Simülasyonu (10,000 iterasyon)
                </p>
              </div>
              {simulating && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-xs font-semibold text-blue-700">
                    Simüle ediliyor...
                  </span>
                </div>
              )}
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={simulationResults.histogram}
                  margin={{ top: 10, right: 30, left: 60, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="value"
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    label={{
                      value: 'Zarar Miktarı (TRY)',
                      position: 'insideBottom',
                      offset: -20,
                      style: { fontSize: '14px', fill: '#475569' },
                    }}
                  />
                  <YAxis
                    tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    label={{
                      value: 'Olasılık',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -10,
                      style: { fontSize: '14px', fill: '#475569' },
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${(value * 100).toFixed(2)}%`,
                      'Olasılık',
                    ]}
                    labelFormatter={(value: number) => `Zarar: ${formatCurrency(value)}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  />
                  <ReferenceLine
                    x={simulationResults.mean}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                      value: 'Ortalama',
                      position: 'top',
                      fill: '#10b981',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <ReferenceLine
                    x={simulationResults.var_95}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                      value: 'VaR 95%',
                      position: 'top',
                      fill: '#f59e0b',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="probability"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLoss)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Senaryo Detayları</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Girdiler</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Minimum Zarar:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(selectedScenario.min_loss)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Olası Zarar:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(selectedScenario.likely_loss)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Maksimum Zarar:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(selectedScenario.max_loss)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600">Gerçekleşme Olasılığı:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatPercentage(selectedScenario.probability)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Açıklama</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedScenario.description || selectedScenario.title}
                </p>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      Bu simülasyon PERT dağılımı kullanarak Monte Carlo metoduyla
                      hesaplanmıştır. VaR değerleri, belirtilen güven aralığında
                      maksimum zarar miktarını gösterir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
