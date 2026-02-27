import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, AlertTriangle, CheckCircle2, XCircle, Zap } from 'lucide-react';
import clsx from 'clsx';
import type { TalentProfileWithSkills, AuditServiceTemplate, FitResult } from '@/features/talent-os/types';
import { SKILL_LABELS } from '@/features/talent-os/types';
import { findBestFit } from '@/features/talent-os/matcher';

interface BestFitPanelProps {
  profiles: TalentProfileWithSkills[];
  templates: AuditServiceTemplate[];
}

export function BestFitPanel({ profiles, templates }: BestFitPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [expanded, setExpanded] = useState(true);

  const template = templates.find((t) => t.id === selectedTemplate);

  const results: FitResult[] = useMemo(() => {
    if (!template) return [];
    return findBestFit(profiles, { skills: template.required_skills });
  }, [profiles, template]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
            <Target size={18} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">En Uygun Eslestirme</h3>
            <p className="text-xs text-slate-500">Denetim tipi secin, en uygun denetcileri gorun</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={clsx('text-slate-400 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              >
                <option value="">Denetim tipi secin...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.service_name}</option>
                ))}
              </select>

              {template && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {Object.entries(template.required_skills).map(([skill, level]) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg border border-teal-200"
                    >
                      {SKILL_LABELS[skill] || skill}: Svy {level}+
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                    {template.standard_duration_sprints} Sprint
                  </span>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <FitResultRow key={r.auditor.id} result={r} rank={i + 1} />
                  ))}
                </div>
              )}

              {selectedTemplate && results.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Eslesen denetci bulunamadi
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FitResultRow({ result, rank }: { result: FitResult; rank: number }) {
  const { auditor, fitScore, blocked, blockReason, matchedSkills } = result;

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
        blocked
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : fitScore >= 70
          ? 'bg-emerald-50 border-emerald-200'
          : fitScore >= 40
          ? 'bg-amber-50 border-amber-200'
          : 'bg-slate-50 border-slate-200'
      )}
    >
      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 truncate">{auditor.full_name}</span>
          {blocked && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(matchedSkills).map(([skill, { required, actual }]) => (
            <span
              key={skill}
              className={clsx(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                actual >= required
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {SKILL_LABELS[skill]?.substring(0, 6) || skill}: {actual}/{required}
            </span>
          ))}
        </div>
        {blocked && blockReason && (
          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
            <XCircle size={10} /> {blockReason}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 text-right">
        {blocked ? (
          <XCircle size={20} className="text-red-400" />
        ) : (
          <div className="flex items-center gap-1.5">
            {fitScore >= 70 ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : (
              <Zap size={14} className="text-amber-500" />
            )}
            <span className={clsx(
              'text-lg font-bold',
              fitScore >= 70 ? 'text-emerald-600' : fitScore >= 40 ? 'text-amber-600' : 'text-slate-500'
            )}>
              {fitScore}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
