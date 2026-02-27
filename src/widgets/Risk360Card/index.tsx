import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, TrendingDown, Activity,
  Target, BarChart3, Clock, CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

interface Risk360Data {
  id: string;
  title: string;
  category: string;
  owner: string;
  inherentScore: number;
  residualScore: number;
  controlEffectiveness: number;
  velocity: 'FAST' | 'MODERATE' | 'SLOW';
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  findingCount: number;
  openActions: number;
  lastAssessment: string;
  appetite: 'WITHIN' | 'NEAR' | 'EXCEEDED';
}

interface Risk360CardProps {
  risk: Risk360Data;
  onClick?: () => void;
  compact?: boolean;
}

const VELOCITY_CFG = {
  FAST: { label: 'Hizli', color: 'text-red-600 bg-red-100' },
  MODERATE: { label: 'Orta', color: 'text-amber-600 bg-amber-100' },
  SLOW: { label: 'Yavas', color: 'text-green-600 bg-green-100' },
};

const TREND_CFG = {
  INCREASING: { label: 'Artis', icon: '↗', color: 'text-red-600' },
  STABLE: { label: 'Stabil', icon: '→', color: 'text-slate-600' },
  DECREASING: { label: 'Azalis', icon: '↘', color: 'text-green-600' },
};

const APPETITE_CFG = {
  WITHIN: { label: 'Sinir Ici', color: 'bg-green-500' },
  NEAR: { label: 'Sinira Yakin', color: 'bg-amber-500' },
  EXCEEDED: { label: 'Sinir Disi', color: 'bg-red-500' },
};

function getRiskColor(score: number) {
  if (score >= 15) return { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-100' };
  if (score >= 10) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100' };
  if (score >= 5) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' };
  return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' };
}

export function Risk360Card({ risk, onClick, compact = false }: Risk360CardProps) {
  const inherentColor = getRiskColor(risk.inherentScore);
  const residualColor = getRiskColor(risk.residualScore);
  const velocity = VELOCITY_CFG[risk.velocity];
  const trend = TREND_CFG[risk.trend];
  const appetite = APPETITE_CFG[risk.appetite];
  const reduction = risk.inherentScore > 0
    ? Math.round(((risk.inherentScore - risk.residualScore) / risk.inherentScore) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:border-blue-300 hover:shadow-md'
      )}
    >
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', inherentColor.light)}>
              <Shield size={18} className={inherentColor.text} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{risk.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{risk.category}</span>
                <span className="text-[10px] text-slate-400">{risk.owner}</span>
              </div>
            </div>
          </div>
          <div className={clsx('w-3 h-3 rounded-full flex-shrink-0', appetite.color)} title={appetite.label} />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-medium">Dogal</p>
            <p className={clsx('text-xl font-black', inherentColor.text)}>{risk.inherentScore}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-medium">Artik</p>
            <p className={clsx('text-xl font-black', residualColor.text)}>{risk.residualScore}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-medium">Azaltim</p>
            <p className="text-xl font-black text-blue-600">%{reduction}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-medium">Kontrol Etkinligi</span>
            <span className="text-[10px] font-bold text-slate-700">{Math.round(risk.controlEffectiveness * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${risk.controlEffectiveness * 100}%` }} />
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-2 flex items-center gap-2">
              <Activity size={12} className="text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-slate-500">Hiz</p>
                <span className={clsx('text-[10px] font-bold', velocity.color.split(' ')[0])}>{velocity.label}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 flex items-center gap-2">
              <TrendingDown size={12} className="text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-slate-500">Trend</p>
                <span className={clsx('text-[10px] font-bold', trend.color)}>{trend.icon} {trend.label}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 flex items-center gap-2">
              <AlertTriangle size={12} className="text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-slate-500">Bulgular</p>
                <span className="text-[10px] font-bold text-slate-700">{risk.findingCount}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 flex items-center gap-2">
              <Target size={12} className="text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-slate-500">Acik Aksiyon</p>
                <span className="text-[10px] font-bold text-slate-700">{risk.openActions}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={clsx('w-2 h-2 rounded-full', appetite.color)} />
          <span className="text-[10px] font-semibold text-slate-500">{appetite.label}</span>
        </div>
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Clock size={10} />
          {new Date(risk.lastAssessment).toLocaleDateString('tr-TR')}
        </span>
      </div>
    </motion.div>
  );
}
