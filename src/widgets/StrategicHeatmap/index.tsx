import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3, Radar, TrendingDown, X, ChevronRight,
  AlertTriangle, ArrowUpRight, ArrowDownLeft, Minus, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { useHeatmapData, type AssessmentWithDetails } from '@/entities/risk/heatmap-api';
import { useCometData } from '@/entities/risk/velocity-api';
import { ClassicGrid } from './ClassicGrid';
import { CometChart } from './CometChart';
import { TimeTravelSlider } from './TimeTravelSlider';

type ViewMode = 'classic' | 'radar';
type MatrixMode = 'inherent' | 'residual';

export function StrategicHeatmap() {
  const { data: assessments = [], isLoading: loadingAssessments } = useHeatmapData();
  const { data: comets = [], isLoading: loadingComets } = useCometData();

  const [viewMode, setViewMode] = useState<ViewMode>('classic');
  const [matrixMode, setMatrixMode] = useState<MatrixMode>('inherent');
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<AssessmentWithDetails | null>(null);
  const [timeProgress, setTimeProgress] = useState(1.0);

  const handleCellClick = useCallback((key: string, risks: AssessmentWithDetails[]) => {
    if (risks.length === 0) return;
    setSelectedCell(prev => prev === key ? null : key);
    setSelectedRisk(null);
  }, []);

  const handleTimeChange = useCallback((p: number) => {
    setTimeProgress(p);
  }, []);

  const cellRisks = useMemo(() => {
    if (!selectedCell) return [];
    const [impStr, likStr] = selectedCell.split('-');
    return assessments.filter(a => {
      if (matrixMode === 'inherent') {
        return a.impact === +impStr && a.likelihood === +likStr;
      }
      const ri = Math.max(1, Math.round(a.impact * (1 - a.control_effectiveness)));
      const rl = Math.max(1, Math.round(a.likelihood * (1 - a.control_effectiveness)));
      return ri === +impStr && rl === +likStr;
    });
  }, [selectedCell, assessments, matrixMode]);

  const stats = useMemo(() => {
    let worsening = 0, improving = 0, stable = 0;
    for (const c of comets) {
      if (c.direction === 'worsening') worsening++;
      else if (c.direction === 'improving') improving++;
      else stable++;
    }
    return { worsening, improving, stable, total: comets.length };
  }, [comets]);

  if (loadingAssessments || loadingComets) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  // Empty state
  if (assessments.length === 0 && comets.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <AlertTriangle className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Henuz Risk Degerlendirmesi Yok</h3>
          <p className="text-sm text-slate-500 mb-6">
            Risk isi haritasini goruntulemek icin once varlik bazinda risk degerlendirmesi yapmaniz gerekiyor.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Risk Degerlendirmesi Baslat
            </button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
              Ornekleri Yukle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm">
          <button
            onClick={() => setViewMode('classic')}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-all',
              viewMode === 'classic' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Grid3x3 size={14} />
            Klasik Gorunum
          </button>
          <button
            onClick={() => setViewMode('radar')}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-all',
              viewMode === 'radar' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Radar size={14} />
            Stratejik Radar
          </button>
        </div>

        {viewMode === 'classic' && (
          <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm">
            <button
              onClick={() => setMatrixMode('inherent')}
              className={clsx(
                'px-4 py-2 text-sm font-bold rounded-md transition-all',
                matrixMode === 'inherent' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              Dogal Risk
            </button>
            <button
              onClick={() => setMatrixMode('residual')}
              className={clsx(
                'px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-1.5',
                matrixMode === 'residual' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <TrendingDown size={14} />
              Artik Risk
            </button>
          </div>
        )}

        {viewMode === 'radar' && (
          <div className="flex items-center gap-3 ml-auto">
            <VelocityBadge icon={ArrowUpRight} label="Kotulesme" count={stats.worsening} color="text-red-600 bg-red-50 border-red-200" />
            <VelocityBadge icon={ArrowDownLeft} label="Iyilesme" count={stats.improving} color="text-green-600 bg-green-50 border-green-200" />
            <VelocityBadge icon={Minus} label="Stabil" count={stats.stable} color="text-slate-600 bg-slate-50 border-slate-200" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          {viewMode === 'classic' ? (
            <ClassicGrid
              assessments={assessments}
              mode={matrixMode}
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
            />
          ) : (
            <CometChart data={comets} timeProgress={timeProgress} />
          )}
        </div>

        <div className="xl:col-span-1 space-y-4">
          {viewMode === 'radar' && (
            <TimeTravelSlider onProgressChange={handleTimeChange} />
          )}

          {viewMode === 'radar' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-slate-800 px-5 py-3">
                <h4 className="text-sm font-bold text-white">Hiz Tablosu</h4>
                <p className="text-[10px] text-slate-400">Varlik bazli risk hareketi</p>
              </div>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {comets
                  .sort((a, b) => b.velocity - a.velocity)
                  .map(c => (
                    <div key={c.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        c.direction === 'worsening' ? 'bg-red-500' : c.direction === 'improving' ? 'bg-green-500' : 'bg-slate-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-500">
                          ({c.px},{c.py}) &rarr; ({c.cx},{c.cy})
                        </p>
                      </div>
                      <span className={clsx(
                        'text-xs font-black tabular-nums',
                        c.direction === 'worsening' ? 'text-red-600' : c.direction === 'improving' ? 'text-green-600' : 'text-slate-500'
                      )}>
                        {c.direction === 'worsening' ? '+' : c.direction === 'improving' ? '-' : ''}{c.velocity.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {viewMode === 'classic' && (
            <AnimatePresence mode="wait">
              {selectedCell && cellRisks.length > 0 ? (
                <motion.div
                  key={selectedCell}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-800 px-5 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Hucre Detayi ({cellRisks.length} risk)
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Etki: {selectedCell.split('-')[0]} / Olasilik: {selectedCell.split('-')[1]}
                      </p>
                    </div>
                    <button
                      onClick={() => { setSelectedCell(null); setSelectedRisk(null); }}
                      className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {cellRisks.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedRisk(a)}
                        className={clsx(
                          'w-full text-left p-4 hover:bg-slate-50 transition-colors',
                          selectedRisk?.id === a.id && 'bg-blue-50 border-l-4 border-blue-500'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">{a.risk_title}</p>
                          <ChevronRight size={14} className="text-slate-400" />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {a.risk_category}
                          </span>
                          <span className="text-xs text-slate-500">{a.entity_name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-16"
                >
                  <AlertTriangle className="text-slate-300 mb-3" size={36} />
                  <p className="text-sm font-semibold text-slate-600">Hucre Secin</p>
                  <p className="text-xs text-slate-400 mt-1">Detay icin matris hucresine tiklayin</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function VelocityBadge({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: typeof ArrowUpRight;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold', color)}>
      <Icon size={13} />
      {label}: {count}
    </div>
  );
}
