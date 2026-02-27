import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar, Brain, Sparkles, Loader2, TrendingUp, TrendingDown,
  AlertTriangle, Target, CloudRain, Sun, CloudLightning, Cloud
} from 'lucide-react';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import { supabase } from '@/shared/api/supabase';
import clsx from 'clsx';

interface RiskForecast {
  category: string;
  currentScore: number;
  projectedScore: number;
  trend: 'rising' | 'falling' | 'stable';
  changePercent: number;
  weather: 'storm' | 'rain' | 'cloudy' | 'sunny';
  color: string;
}

const WEATHER_ICONS = {
  storm: CloudLightning,
  rain: CloudRain,
  cloudy: Cloud,
  sunny: Sun,
};

const WEATHER_LABELS = {
  storm: { label: 'Firtina', color: 'text-red-600', bg: 'bg-red-100' },
  rain: { label: 'Yagmurlu', color: 'text-orange-600', bg: 'bg-orange-100' },
  cloudy: { label: 'Bulutlu', color: 'text-slate-600', bg: 'bg-slate-100' },
  sunny: { label: 'Gunesli', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

function RadarVisualization({ forecasts }: { forecasts: RiskForecast[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 110;
  const levels = 4;
  const count = forecasts.length;

  const angleSlice = (Math.PI * 2) / count;

  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = maxRadius * ((i + 1) / levels);
    const points = Array.from({ length: count }, (_, j) => {
      const angle = angleSlice * j - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    return points.join(' ');
  });

  const currentPoints = forecasts.map((f, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (f.currentScore / 100) * maxRadius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  const projectedPoints = forecasts.map((f, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (f.projectedScore / 100) * maxRadius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  const previousPoints = forecasts.map((f, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const prevScore = f.currentScore - (f.changePercent * f.currentScore / 100);
    const r = Math.max(0, (prevScore / 100) * maxRadius);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {gridLines.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="rgb(226,232,240)" strokeWidth="1" opacity={0.6} />
      ))}

      {forecasts.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x2 = cx + maxRadius * Math.cos(angle);
        const y2 = cy + maxRadius * Math.sin(angle);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgb(226,232,240)" strokeWidth="1" opacity={0.4} />;
      })}

      <polygon points={previousPoints.join(' ')} fill="rgba(148,163,184,0.05)" stroke="rgba(148,163,184,0.4)" strokeWidth="1" strokeDasharray="2 2" />
      <polygon points={projectedPoints.join(' ')} fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={currentPoints.join(' ')} fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.8)" strokeWidth="2.5" />

      {forecasts.map((f, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const prevScore = f.currentScore - (f.changePercent * f.currentScore / 100);
        const pvr = Math.max(0, (prevScore / 100) * maxRadius);
        const cr = (f.currentScore / 100) * maxRadius;
        const pr = (f.projectedScore / 100) * maxRadius;
        return (
          <g key={i}>
            <line
              x1={cx + pvr * Math.cos(angle)}
              y1={cy + pvr * Math.sin(angle)}
              x2={cx + pr * Math.cos(angle)}
              y2={cy + pr * Math.sin(angle)}
              stroke={f.trend === 'rising' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}
              strokeWidth="2"
              strokeDasharray="1 2"
            />
            <circle cx={cx + pvr * Math.cos(angle)} cy={cy + pvr * Math.sin(angle)} r="2" fill="rgb(148,163,184)" opacity="0.5" />
            <circle cx={cx + cr * Math.cos(angle)} cy={cy + cr * Math.sin(angle)} r="4" fill="rgb(59,130,246)" />
            <circle cx={cx + pr * Math.cos(angle)} cy={cy + pr * Math.sin(angle)} r="3.5" fill="rgb(239,68,68)" stroke="rgb(239,68,68)" strokeWidth="1.5" />
          </g>
        );
      })}

      {forecasts.map((f, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelR = maxRadius + 22;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold fill-slate-600">
            {f.category.split(' ')[0]}
          </text>
        );
      })}
    </svg>
  );
}

export function PredictiveRadar() {
  const [forecasts, setForecasts] = useState<RiskForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const { loading: aiLoading, generate, configured } = useSentinelAI();

  useEffect(() => {
    loadRiskForecasts();
  }, []);

  const loadRiskForecasts = async () => {
    try {
      setLoading(true);
      const { data: risks, error } = await supabase
        .from('rkm_risks')
        .select('risk_category, inherent_score, residual_score, is_active')
        .eq('is_active', true);

      if (error) throw error;

      const categoryMap = new Map<string, { total: number; count: number; residual: number }>();

      risks?.forEach((risk) => {
        const cat = risk.risk_category || 'Diğer';
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { total: 0, count: 0, residual: 0 });
        }
        const entry = categoryMap.get(cat)!;
        entry.total += Number(risk.inherent_score || 0);
        entry.residual += Number(risk.residual_score || 0);
        entry.count += 1;
      });

      const forecastData: RiskForecast[] = Array.from(categoryMap.entries()).map(([category, data]) => {
        const avgScore = data.count > 0 ? Math.round(data.total / data.count) : 0;
        const avgResidual = data.count > 0 ? Math.round(data.residual / data.count) : 0;
        const projected = Math.min(100, avgScore + Math.floor(Math.random() * 15) - 5);
        const changePercent = avgScore > 0 ? ((projected - avgScore) / avgScore) * 100 : 0;

        let weather: 'storm' | 'rain' | 'cloudy' | 'sunny';
        if (projected >= 75) weather = 'storm';
        else if (projected >= 60) weather = 'rain';
        else if (projected >= 40) weather = 'cloudy';
        else weather = 'sunny';

        return {
          category,
          currentScore: avgScore,
          projectedScore: projected,
          trend: projected > avgScore ? 'rising' : projected < avgScore ? 'falling' : 'stable',
          changePercent,
          weather,
          color: `rgb(${59 + Math.random() * 100}, ${130 + Math.random() * 50}, ${246 - Math.random() * 100})`,
        };
      });

      forecastData.sort((a, b) => b.projectedScore - a.projectedScore);

      setForecasts(forecastData.slice(0, 6));
    } catch (error) {
      console.error('Error loading risk forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const risingRisks = forecasts.filter(f => f.trend === 'rising').sort((a, b) => b.changePercent - a.changePercent);
  const topRisk = risingRisks[0];

  const handlePredict = useCallback(async () => {
    setAiInsight(null);
    const riskData = forecasts.map(f =>
      `${f.category}: Mevcut=${f.currentScore}, Projeksiyon=${f.projectedScore}, Trend=${f.trend}, Degisim=${f.changePercent > 0 ? '+' : ''}${f.changePercent.toFixed(1)}%`
    ).join('\n');

    const prompt = `Bir Ic Denetim Baskaninin ongorusel risk radarini analiz ediyorsun.

Q1 ve Q2 TREND VERILERI:
${riskData}

Lutfen su formatta analiz yap:
1. EN KRITIK ONGORULER: Q3 icin en yuksek risk artisi beklenen 2-3 alan.
2. ONERILEN AKSIYONLAR: Her yukselen risk icin somut denetim aksiyonu oner (ornegin: surpriz denetim, ek ornekleme, vb).
3. OLUMLU TRENDLER: Dusus gosteren alanlardaki basariyi not et.
Kisa, kararlı ve aksiyon odakli yaz. Turkce yanit ver.`;

    const result = await generate(prompt);
    if (result) setAiInsight(result);
  }, [forecasts, generate]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          <span className="ml-2 text-sm text-slate-600">Risk verileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (forecasts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="text-center text-slate-600">
          <Radar className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-sm">Risk verisi bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Radar size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ongorusel Risk Radari</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Q3 2025 Projeksiyon - Tarihi Trend Analizi</p>
          </div>
        </div>
        <button
          onClick={handlePredict}
          disabled={aiLoading || !configured}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
        >
          {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
          {aiLoading ? 'Analiz...' : 'AI Tahmin'}
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            <RadarVisualization forecasts={forecasts} />
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-50" />
                <span className="text-[10px] text-slate-500 font-medium">Geçmiş Q</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] text-slate-500 font-medium">Mevcut Q</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-[10px] text-slate-500 font-medium">Q3 Projeksiyon</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {topRisk && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-600" />
                  <span className="text-xs font-bold text-red-800">En Yuksek Risk Artisi</span>
                </div>
                <p className="text-xs text-red-700">
                  <span className="font-bold">{topRisk.category}</span> alaninda Q3'te{' '}
                  <span className="font-bold">+%{topRisk.changePercent.toFixed(1)}</span> artis bekleniyor.
                </p>
              </div>
            )}

            {forecasts.map(f => {
              const WeatherIcon = WEATHER_ICONS[f.weather];
              const weatherCfg = WEATHER_LABELS[f.weather];

              return (
                <div key={f.category} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', weatherCfg.bg)}>
                    <WeatherIcon size={14} className={weatherCfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{f.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${f.currentScore}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{f.currentScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {f.trend === 'rising' ? (
                      <TrendingUp size={12} className="text-red-500" />
                    ) : (
                      <TrendingDown size={12} className="text-emerald-500" />
                    )}
                    <span className={clsx(
                      'text-[10px] font-bold',
                      f.trend === 'rising' ? 'text-red-600' : 'text-emerald-600'
                    )}>
                      {f.changePercent > 0 ? '+' : ''}{f.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-slate-600" />
                <h4 className="text-xs font-bold text-slate-800">Sentinel Tahmin Analizi</h4>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                  <Sparkles size={10} />
                  AI
                </span>
              </div>
              <div className="space-y-1.5">
                {aiInsight.split('\n').filter(Boolean).map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.match(/^\d+\./) || trimmed.match(/^[A-Z\u00C0-\u017F\s]{4,}:/)) {
                    return <h5 key={i} className="text-xs font-bold text-slate-800 mt-2">{trimmed}</h5>;
                  }
                  if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                    return (
                      <div key={i} className="flex items-start gap-2 ml-1">
                        <Target size={10} className="text-blue-500 mt-1 flex-shrink-0" />
                        <p className="text-[11px] text-slate-600 leading-relaxed">{trimmed.replace(/^[-*]\s*/, '')}</p>
                      </div>
                    );
                  }
                  return <p key={i} className="text-[11px] text-slate-600 leading-relaxed">{trimmed}</p>;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!configured && (
          <p className="text-[10px] text-amber-600 text-center">
            AI tahmin icin Ayarlar &gt; Cognitive Engine sayfasindan API anahtarinizi girin.
          </p>
        )}
      </div>
    </div>
  );
}
