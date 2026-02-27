import { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Target, Save, CalendarPlus, ArrowRight } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface UniverseNode {
  id: string;
  name: string;
  type: 'HOLDING' | 'BANK' | 'GROUP' | 'UNIT' | 'PROCESS';
  path: string;
  impact_score?: number;
  likelihood_score?: number;
  risk_score?: number;
  notes?: string;
}

interface RiskScoreData {
  entity_id: string;
  impact_score: number;
  likelihood_score: number;
  risk_score: number;
  assessment_year: number;
  notes?: string;
}

export function UniverseScoring() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: universeNodes = [], isLoading: loadingNodes } = useQuery({
    queryKey: ['universe-nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('*')
        .order('path');
      if (error) throw error;
      return data as UniverseNode[];
    },
  });

  const { data: existingScores = [], isLoading: loadingScores } = useQuery({
    queryKey: ['universe-risk-scores', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universe_risk_scores')
        .select('*')
        .eq('assessment_year', selectedYear);
      if (error && error.code !== 'PGRST116') throw error;
      return (data || []) as RiskScoreData[];
    },
  });

  const [scores, setScores] = useState<Record<string, { impact: number; likelihood: number; notes: string }>>({});

  const saveScores = useMutation({
    mutationFn: async (scoreData: RiskScoreData[]) => {
      const { error } = await supabase
        .from('universe_risk_scores')
        .upsert(scoreData, { onConflict: 'entity_id,assessment_year' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universe-risk-scores'] });
      toast.success('Risk puanları kaydedildi!');
    },
    onError: (err: any) => {
      toast.error(`Kayıt hatası: ${err?.message}`);
    },
  });

  const mergedNodes = useMemo(() => {
    const scoreMap = new Map(existingScores.map(s => [s.entity_id, s]));
    return universeNodes.map(node => {
      const existing = scoreMap.get(node.id);
      const localScore = scores[node.id];
      const impact = localScore?.impact ?? existing?.impact_score ?? 3;
      const likelihood = localScore?.likelihood ?? existing?.likelihood_score ?? 3;
      const risk_score = impact * likelihood;
      return {
        ...node,
        impact_score: impact,
        likelihood_score: likelihood,
        risk_score,
        notes: localScore?.notes ?? existing?.notes ?? '',
      };
    });
  }, [universeNodes, existingScores, scores]);

  const topRiskyNodes = useMemo(() =>
    [...mergedNodes].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)).slice(0, 10),
    [mergedNodes]
  );

  const handleScoreChange = (nodeId: string, field: 'impact' | 'likelihood' | 'notes', value: number | string) => {
    setScores(prev => ({
      ...prev,
      [nodeId]: {
        impact: prev[nodeId]?.impact ?? 3,
        likelihood: prev[nodeId]?.likelihood ?? 3,
        notes: prev[nodeId]?.notes ?? '',
        [field]: value,
      },
    }));
  };

  const handleSaveAll = () => {
    const scoreData: RiskScoreData[] = mergedNodes.map(node => ({
      entity_id: node.id,
      impact_score: node.impact_score || 3,
      likelihood_score: node.likelihood_score || 3,
      risk_score: node.risk_score || 9,
      assessment_year: selectedYear,
      notes: node.notes || '',
    }));
    saveScores.mutate(scoreData);
  };

  const getRiskColor = (score: number) => {
    if (score >= 20) return 'bg-red-500 text-white';
    if (score >= 12) return 'bg-orange-500 text-white';
    if (score >= 6) return 'bg-yellow-500 text-slate-900';
    return 'bg-emerald-500 text-white';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 20) return 'KRİTİK';
    if (score >= 12) return 'YÜKSEK';
    if (score >= 6) return 'ORTA';
    return 'DÜŞÜK';
  };

  if (loadingNodes || loadingScores) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Evren verisi yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Makro Risk Değerlendirmesi
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Denetim önceliklerini belirlemek için evren varlıklarına risk puanı atayın
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear + 1}>{currentYear + 1}</option>
          </select>
          <button
            onClick={() => navigate('/strategy/audit-universe')}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Target className="w-4 h-4" />
            Evrene Git
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saveScores.isPending}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            {saveScores.isPending ? 'Kaydediliyor...' : 'Tüm Puanları Kaydet'}
          </button>
        </div>
      </div>

      {/* TOP 10 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">İlk 10 Denetim Önceliği</h3>
          </div>
          <button
            onClick={() => navigate('/strategy/audit-universe')}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Denetim Planla
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {topRiskyNodes.map((node, idx) => (
            <div
              key={node.id}
              className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-100"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate text-sm">{node.name}</div>
                <div className="text-xs text-slate-500 font-mono">{node.path}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(node.risk_score || 0)}`}>
                {node.risk_score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALL ENTITIES TABLE */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-600" />
            Tüm Evren Varlıkları ({mergedNodes.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Varlık</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tip</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase w-32">
                  Etki<br/>(1-5)
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase w-32">
                  Olasılık<br/>(1-5)
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase w-24">
                  Risk Skoru
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Notlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mergedNodes.map((node) => (
                <tr key={node.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 text-sm">{node.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{node.path}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                      {node.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={node.impact_score}
                      onChange={(e) => handleScoreChange(node.id, 'impact', Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={node.likelihood_score}
                      onChange={(e) => handleScoreChange(node.id, 'likelihood', Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-3 py-1 rounded font-bold text-sm ${getRiskColor(node.risk_score || 0)}`}>
                        {node.risk_score}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {getRiskLabel(node.risk_score || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={node.notes}
                      onChange={(e) => handleScoreChange(node.id, 'notes', e.target.value)}
                      placeholder="Not ekleyin..."
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
