/**
 * Wave 61: CultureHeatmap — Risk Kültürü Isı Haritası
 * 
 * Apple Glassmorphism + Light Mode.
 * NaN / null korumalı (?, ??) ve sıfıra bölünme korumalı.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse, Shield, Users, Megaphone, Target,
  Loader2, AlertTriangle, Building2, Calendar, FileText
} from 'lucide-react';
import clsx from 'clsx';
import { useCultureDashboard, type CultureSurvey, type SentimentScore, type SentimentLabel, type CultureCategory } from '@/features/risk-culture/api';

/* ──────────────────────────────────────────────────────────
   Config & Mappings
   ────────────────────────────────────────────────────────── */

const SENTIMENT_COLORS: Record<SentimentLabel, string> = {
  POSITIVE: 'bg-emerald-500 text-emerald-950 border-emerald-400',
  NEUTRAL:  'bg-slate-300 text-slate-800 border-slate-300',
  NEGATIVE: 'bg-orange-500 text-white border-orange-400',
  CRITICAL: 'bg-red-600 text-white border-red-500',
};

const CATEGORY_ICONS: Record<CultureCategory, typeof Shield> = {
  ETHICS:          Shield,
  SPEAK_UP:        Megaphone,
  TONE_AT_THE_TOP: Target,
  ACCOUNTABILITY:  Users,
  RISK_AWARENESS:  HeartPulse,
};

const CATEGORY_NAMES: Record<CultureCategory, string> = {
  ETHICS:          'Etik ve Dürüstlük',
  SPEAK_UP:        'Speak-Up Kültürü',
  TONE_AT_THE_TOP: 'Tone at the Top',
  ACCOUNTABILITY:  'Hesap Verebilirlik',
  RISK_AWARENESS:  'Risk Farkındalığı',
};

/* ──────────────────────────────────────────────────────────
   Components
   ────────────────────────────────────────────────────────── */

function SurveyCard({ survey }: { survey: CultureSurvey }) {
  const isRiskZone = survey.overall_score < 70;

  return (
    <div className={clsx(
      'p-4 rounded-xl border shadow-sm transition-all',
      isRiskZone ? 'bg-orange-50/50 border-orange-200' : 'bg-surface border-slate-200'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-sm text-primary">{survey.title}</h4>
          <span className="text-[10px] font-mono text-slate-400">{survey.survey_code}</span>
        </div>
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2',
          isRiskZone ? 'border-orange-500 text-orange-700 bg-orange-100' : 'border-emerald-500 text-emerald-700 bg-emerald-100'
        )}>
          {survey.overall_score?.toFixed(0) ?? 0}
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{survey.description}</p>
      
      <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-100/50 rounded-lg p-2 border border-slate-100">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-slate-400" />
          <span className="font-semibold">{survey.total_responses?.toLocaleString('tr-TR')} Yanıt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-400" />
          <span>Katılım: <span className="font-bold">{survey.participation_rate?.toFixed(1)}%</span></span>
        </div>
      </div>
    </div>
  );
}

function HeatmapCell({ score }: { score?: SentimentScore }) {
  if (!score) {
    return (
      <div className="h-20 bg-slate-50/50 border border-slate-100/50 rounded-lg flex items-center justify-center">
        <span className="text-slate-300 text-xs">—</span>
      </div>
    );
  }

  const colorClass = SENTIMENT_COLORS[score.sentiment_label] || SENTIMENT_COLORS.NEUTRAL;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={clsx(
        'h-20 rounded-lg border p-2 flex flex-col justify-between shadow-sm cursor-help relative group overflow-hidden',
        colorClass
      )}
    >
      <div className="flex justify-between items-start z-10">
        <span className="text-lg font-black tracking-tight">{score.score?.toFixed(1) ?? '0.0'}</span>
        {score.sentiment_label === 'CRITICAL' && (
          <AlertTriangle size={14} className="animate-pulse opacity-80" />
        )}
      </div>
      <div className="text-[9px] font-semibold leading-tight opacity-90 truncate z-10 w-full">
        {score.response_count} Yanıt
      </div>

      {/* Hover Tooltip (Glass) */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/95 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 overflow-y-auto">
        <div className="font-bold mb-1 opacity-80">Ana Temalar:</div>
        <ul className="list-disc pl-3 text-[10px] space-y-0.5">
          {(score.key_themes || []).map((t, idx) => (
            <li key={idx} className="line-clamp-1">{t}</li>
          ))}
          {(score.key_themes || []).length === 0 && <li>Veri yok</li>}
        </ul>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Widget Export
   ────────────────────────────────────────────────────────── */

export function CultureHeatmap() {
  const { data, isLoading, isError } = useCultureDashboard();
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl border border-amber-200 bg-amber-50 flex items-center gap-3">
        <AlertTriangle className="text-amber-500 w-6 h-6" />
        <p className="text-amber-800 text-sm">Risk kültürü anket verileri yüklenirken bir sorun oluştu.</p>
      </div>
    );
  }

  const { surveys, scores, globalAvgScore, totalParticipants, criticalAreas } = data;

  // Departman Listesi (Tekil)
  const departments = Array.from(new Set(scores.map(s => s.department_name))).sort();
  // Kategori Listesi
  const categories: CultureCategory[] = ['ETHICS', 'SPEAK_UP', 'TONE_AT_THE_TOP', 'ACCOUNTABILITY', 'RISK_AWARENESS'];

  return (
    <div className="space-y-6">
      {/* 1. Özet Şeridi */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <HeartPulse size={120} />
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Kurumsal Nabız Skoru</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black">{globalAvgScore?.toFixed(1) ?? '0.0'}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <Users size={12} className="text-blue-300" />
            <span className="font-medium text-slate-200">{totalParticipants?.toLocaleString('tr-TR')} Geri Bildirim</span>
          </div>
        </div>

        <div className="col-span-1 border border-slate-200 bg-surface rounded-2xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-2">Aktif Anketler</p>
          <div className="text-3xl font-black text-primary">{surveys.length}</div>
        </div>

        <div className={clsx(
          'col-span-1 border rounded-2xl p-5 shadow-sm flex flex-col justify-center transition-colors',
          criticalAreas.length > 0 ? 'bg-red-50 border-red-200' : 'bg-surface border-slate-200'
        )}>
          <p className={clsx('text-[10px] font-bold tracking-widest uppercase mb-2', criticalAreas.length > 0 ? 'text-red-600' : 'text-slate-500')}>Kritik Alanlar</p>
          <div className="flex items-center gap-2">
            <span className={clsx('text-3xl font-black', criticalAreas.length > 0 ? 'text-red-700' : 'text-primary')}>{criticalAreas.length}</span>
            {criticalAreas.length > 0 && <AlertTriangle size={18} className="text-red-500 animate-pulse" />}
          </div>
        </div>
      </div>

      {/* 2. Heatmap Matrisi */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" /> Departman ve Kategori Matrisi
          </h3>
          <div className="flex gap-2 text-[10px] font-medium text-slate-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Pozitif (80+)</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Nötr (65-79)</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Negatif (50-64)</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600"></div>Kritik (<50)</div>
          </div>
        </div>

        <div className="min-w-[800px]">
          {/* Header Row (Kategoriler) */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            <div className="col-span-1"></div>
            {categories.map(cat => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <div key={cat} className="col-span-1 text-center flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <Icon size={14} className="text-blue-600 mb-1" />
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">{CATEGORY_NAMES[cat]}</span>
                </div>
              );
            })}
          </div>

          {/* Data Rows (Departmanlar) */}
          <div className="space-y-2">
            {departments.map(dept => (
              <div 
                key={dept} 
                className={clsx(
                  'grid grid-cols-6 gap-2 items-center p-1 rounded-xl transition-all',
                  activeDepartment === dept ? 'bg-blue-50/50 outline outline-1 outline-blue-200' : 'hover:bg-slate-50'
                )}
                onMouseEnter={() => setActiveDepartment(dept)}
                onMouseLeave={() => setActiveDepartment(null)}
              >
                <div className="col-span-1 text-xs font-bold text-slate-700 truncate pr-2" title={dept}>
                  {dept}
                </div>
                {categories.map(cat => {
                  const score = scores.find(s => s.department_name === dept && s.category === cat);
                  return (
                    <div key={`${dept}-${cat}`} className="col-span-1">
                      <HeatmapCell score={score} />
                    </div>
                  );
                })}
              </div>
            ))}
            {departments.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-400">Haritalanacak kültür verisi bulunmuyor.</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Aktif Anketler Kartları */}
      <div>
        <h3 className="font-bold text-sm text-primary flex items-center gap-2 mb-4">
          <FileText size={16} className="text-slate-400" /> Aktif Kültür Anketleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(surveys || []).map(survey => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      </div>

    </div>
  );
}
