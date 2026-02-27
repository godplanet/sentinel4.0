import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { RiskNetwork } from './index';
import { supabase } from '@/shared/api/supabase';
import type { GraphData, GraphNode, GraphLink } from '@/features/risk-graph';

export function RiskNetworkLoader() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: risks, error: riskError } = await supabase
        .from('rkm_risks')
        .select('id, risk_code, risk_name, risk_category, process_area, residual_rating, residual_score')
        .eq('is_active', true)
        .limit(100);

      if (riskError) throw riskError;

      if (!risks || risks.length === 0) {
        setGraphData({ nodes: [], links: [] });
        return;
      }

      const nodes: GraphNode[] = risks.map((risk, idx) => ({
        id: risk.id,
        label: risk.risk_name || risk.risk_code || `Risk ${idx + 1}`,
        type: 'risk',
        path: `${risk.process_area || 'Unknown'}.${risk.risk_category || 'General'}`,
        color: getRiskColor(risk.residual_rating || 'LOW'),
        size: 8 + (risk.residual_score || 0) / 10,
        data: {
          risk_rating: risk.residual_rating || 'LOW',
          inherent_score: risk.residual_score || 0,
        },
      }));

      const links: GraphLink[] = [];
      const categories = new Map<string, string[]>();

      risks.forEach((risk) => {
        const category = risk.risk_category || 'General';
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)?.push(risk.id);
      });

      categories.forEach((riskIds) => {
        if (riskIds.length > 1) {
          for (let i = 0; i < riskIds.length - 1; i++) {
            if (Math.random() > 0.7) {
              links.push({
                source: riskIds[i],
                target: riskIds[i + 1],
                value: 1,
              });
            }
          }
        }
      });

      setGraphData({ nodes, links });
    } catch (err) {
      console.error('Error loading graph data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load risk network');
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-600">Risk ağı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !graphData) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3 text-center max-w-md p-8">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900">Veri Yüklenemedi</h3>
          <p className="text-sm text-slate-600">
            {error || 'Risk ağı verisi yüklenirken bir hata oluştu.'}
          </p>
          <button
            onClick={loadGraphData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col items-center gap-3 text-center max-w-md p-8">
          <AlertTriangle className="w-12 h-12 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">Veri Bulunamadı</h3>
          <p className="text-sm text-slate-600">
            Risk ağını görüntülemek için önce risk tanımları eklemeniz gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  return <RiskNetwork graphData={graphData} />;
}

function getRiskColor(rating: string): string {
  switch (rating) {
    case 'KRITIK':
    case 'CRITICAL':
      return '#ef4444';
    case 'YUKSEK':
    case 'HIGH':
      return '#f97316';
    case 'ORTA':
    case 'MEDIUM':
      return '#eab308';
    case 'DUSUK':
    case 'LOW':
      return '#22c55e';
    default:
      return '#64748b';
  }
}
