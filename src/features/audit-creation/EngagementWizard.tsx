import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, ChevronRight, ChevronLeft, Check,
  Calendar, Users, Target, Briefcase, Zap,
  AlertTriangle, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import type { AuditServiceTemplate, TalentProfileWithSkills } from '@/features/talent-os/types';
import { SKILL_LABELS } from '@/features/talent-os/types';
import { fetchServiceTemplates, fetchProfilesWithSkills } from '@/features/talent-os/api';
import { findBestFit } from '@/features/talent-os/matcher';
import { generateSprints, calculateEndDate } from './sprint-generator';
import { createAgileEngagement, createSprints } from './api';
import type { WizardState, GeneratedSprint, TeamMember } from './types';

const STEP_LABELS = ['Denetim Urunu', 'Sprint Plani', 'Ekip Secimi'];

export function EngagementWizard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<AuditServiceTemplate[]>([]);
  const [profiles, setProfiles] = useState<TalentProfileWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [wizard, setWizard] = useState<WizardState>({
    step: 1,
    selectedTemplate: null,
    engagementTitle: '',
    engagementDescription: '',
    startDate: new Date().toISOString().split('T')[0],
    sprintDurationWeeks: 2,
    generatedSprints: [],
    selectedTeam: [],
    fitResults: [],
  });

  useEffect(() => {
    Promise.all([fetchServiceTemplates(), fetchProfilesWithSkills()])
      .then(([t, p]) => { setTemplates(t); setProfiles(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fitResults = useMemo(() => {
    if (!wizard.selectedTemplate) return [];
    return findBestFit(profiles, { skills: wizard.selectedTemplate.required_skills });
  }, [profiles, wizard.selectedTemplate]);

  const selectTemplate = (t: AuditServiceTemplate) => {
    const sprints = generateSprints(t, wizard.startDate, wizard.sprintDurationWeeks);
    setWizard((prev) => ({
      ...prev,
      selectedTemplate: t,
      engagementTitle: t.service_name,
      engagementDescription: t.description,
      generatedSprints: sprints,
    }));
  };

  const regenerateSprints = () => {
    if (!wizard.selectedTemplate) return;
    const sprints = generateSprints(wizard.selectedTemplate, wizard.startDate, wizard.sprintDurationWeeks);
    setWizard((prev) => ({ ...prev, generatedSprints: sprints }));
  };

  const toggleTeamMember = (auditorId: string, name: string, score: number) => {
    setWizard((prev) => {
      const exists = prev.selectedTeam.find((m) => m.auditor_id === auditorId);
      if (exists) {
        return { ...prev, selectedTeam: prev.selectedTeam.filter((m) => m.auditor_id !== auditorId) };
      }
      return {
        ...prev,
        selectedTeam: [...prev.selectedTeam, { auditor_id: auditorId, name, role: 'Denetci', fitScore: score }],
      };
    });
  };

  const canProceed = () => {
    if (wizard.step === 1) return wizard.selectedTemplate !== null;
    if (wizard.step === 2) return wizard.generatedSprints.length > 0 && wizard.engagementTitle.trim() !== '';
    if (wizard.step === 3) return wizard.selectedTeam.length > 0;
    return false;
  };

  const handleCreate = async () => {
    if (!wizard.selectedTemplate) return;
    try {
      setCreating(true);
      const endDate = calculateEndDate(
        wizard.startDate,
        wizard.selectedTemplate.standard_duration_sprints,
        wizard.sprintDurationWeeks
      );

      const engagement = await createAgileEngagement({
        title: wizard.engagementTitle,
        description: wizard.engagementDescription,
        service_template_id: wizard.selectedTemplate.id,
        total_sprints: wizard.selectedTemplate.standard_duration_sprints,
        start_date: wizard.startDate,
        end_date: endDate,
        team_members: wizard.selectedTeam,
      });

      await createSprints(engagement.id, wizard.generatedSprints);
      navigate(`/execution/sprint-board/${engagement.id}`);
    } catch (err) {
      console.error('Failed to create engagement:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3;
          const isActive = wizard.step === stepNum;
          const isDone = wizard.step > stepNum;
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <div className={clsx('w-12 h-0.5', isDone ? 'bg-blue-500' : 'bg-slate-200')} />}
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                  isDone ? 'bg-blue-600 text-white' :
                  isActive ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' :
                  'bg-slate-100 text-slate-400'
                )}>
                  {isDone ? <Check size={14} /> : stepNum}
                </div>
                <span className={clsx('text-sm font-medium', isActive ? 'text-slate-900' : 'text-slate-400')}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={wizard.step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {wizard.step === 1 && (
            <Step1Templates
              templates={templates}
              selected={wizard.selectedTemplate}
              onSelect={selectTemplate}
            />
          )}
          {wizard.step === 2 && (
            <Step2Sprints
              wizard={wizard}
              onChange={(partial) => setWizard((prev) => ({ ...prev, ...partial }))}
              onRegenerate={regenerateSprints}
            />
          )}
          {wizard.step === 3 && (
            <Step3Team
              fitResults={fitResults}
              selectedTeam={wizard.selectedTeam}
              onToggle={toggleTeamMember}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={() => setWizard((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) as 1 | 2 | 3 }))}
          disabled={wizard.step === 1}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Geri
        </button>

        {wizard.step < 3 ? (
          <button
            onClick={() => setWizard((prev) => ({ ...prev, step: Math.min(3, prev.step + 1) as 1 | 2 | 3 }))}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Devam <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={!canProceed() || creating}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Olusturuluyor...</>
            ) : (
              <><Rocket size={16} /> Denetimi Olustur</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function Step1Templates({
  templates,
  selected,
  onSelect,
}: {
  templates: AuditServiceTemplate[];
  selected: AuditServiceTemplate | null;
  onSelect: (t: AuditServiceTemplate) => void;
}) {
  const complexityColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-red-100 text-red-700',
    CRITICAL: 'bg-red-200 text-red-800',
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Denetim Urunu Secin</h2>
      <p className="text-sm text-slate-500 mb-6">Hizmet katalogundan bir denetim tipi secin. Sprint yapisi otomatik olusturulacak.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(t)}
            className={clsx(
              'text-left p-5 rounded-xl border-2 transition-all',
              selected?.id === t.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase size={20} className="text-blue-600" />
              </div>
              <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded', complexityColors[t.complexity])}>
                {t.complexity}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{t.service_name}</h3>
            <p className="text-xs text-slate-500 mb-3">{t.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(t.required_skills).map(([skill, level]) => (
                <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                  {SKILL_LABELS[skill] || skill}: Svy{level}
                </span>
              ))}
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                {t.standard_duration_sprints} Sprint
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Step2Sprints({
  wizard,
  onChange,
  onRegenerate,
}: {
  wizard: WizardState;
  onChange: (partial: Partial<WizardState>) => void;
  onRegenerate: () => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Sprint Plani</h2>
      <p className="text-sm text-slate-500 mb-6">Denetim detaylarini ayarlayin. Sprintler otomatik olusturuldu.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Denetim Adi</label>
          <input
            type="text"
            value={wizard.engagementTitle}
            onChange={(e) => onChange({ engagementTitle: e.target.value })}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Baslangic Tarihi</label>
          <input
            type="date"
            value={wizard.startDate}
            onChange={(e) => { onChange({ startDate: e.target.value }); setTimeout(onRegenerate, 0); }}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Aciklama</label>
          <textarea
            value={wizard.engagementDescription}
            onChange={(e) => onChange({ engagementDescription: e.target.value })}
            rows={2}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sprint Suresi</label>
          <select
            value={wizard.sprintDurationWeeks}
            onChange={(e) => { onChange({ sprintDurationWeeks: Number(e.target.value) }); setTimeout(onRegenerate, 0); }}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1 Hafta</option>
            <option value={2}>2 Hafta</option>
            <option value={3}>3 Hafta</option>
          </select>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <Calendar size={14} /> Olusturulan Sprintler ({wizard.generatedSprints.length})
      </h3>
      <div className="space-y-3">
        {wizard.generatedSprints.map((sprint) => (
          <SprintPreviewCard key={sprint.sprint_number} sprint={sprint} />
        ))}
      </div>
    </div>
  );
}

function SprintPreviewCard({ sprint }: { sprint: GeneratedSprint }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
        {sprint.sprint_number}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900">{sprint.title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{sprint.goal}</p>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
          <Calendar size={11} />
          {sprint.start_date} - {sprint.end_date}
        </div>
      </div>
    </div>
  );
}

function Step3Team({
  fitResults,
  selectedTeam,
  onToggle,
}: {
  fitResults: import('@/features/talent-os/types').FitResult[];
  selectedTeam: TeamMember[];
  onToggle: (id: string, name: string, score: number) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Ekip Secimi</h2>
      <p className="text-sm text-slate-500 mb-6">
        Best-Fit motoru denetim gereksinimlerine gore en uygun denetcileri siraladi. Ekibinizi secin.
      </p>

      {selectedTeam.length > 0 && (
        <div className="mb-5 p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <p className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1">
            <Users size={13} /> Secilen Ekip ({selectedTeam.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTeam.map((m) => (
              <span key={m.auditor_id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-lg">
                {m.name}
                {m.fitScore !== undefined && <span className="text-teal-600">({m.fitScore})</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {fitResults.map((r) => {
          const isSelected = selectedTeam.some((m) => m.auditor_id === r.auditor.id);
          return (
            <button
              key={r.auditor.id}
              onClick={() => !r.blocked && onToggle(r.auditor.id, r.auditor.full_name, r.fitScore)}
              disabled={r.blocked}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                r.blocked ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' :
                isSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400' :
                'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              )}
            >
              <div className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                r.blocked ? 'bg-red-100 text-red-600' :
                isSelected ? 'bg-blue-200 text-blue-800' :
                'bg-slate-100 text-slate-600'
              )}>
                {r.auditor.full_name.split(' ').map((w) => w[0]).join('')}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{r.auditor.full_name}</span>
                  <span className="text-[10px] text-slate-400">{r.auditor.department}</span>
                  {r.blocked && <AlertTriangle size={12} className="text-red-500" />}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(r.matchedSkills).map(([skill, { required, actual }]) => (
                    <span
                      key={skill}
                      className={clsx(
                        'text-[10px] px-1.5 py-0.5 rounded font-medium',
                        actual >= required ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      )}
                    >
                      {SKILL_LABELS[skill]?.substring(0, 8) || skill}: {actual}/{required}
                    </span>
                  ))}
                </div>
                {r.blocked && r.blockReason && (
                  <p className="text-[10px] text-red-500 mt-1">{r.blockReason}</p>
                )}
              </div>

              <div className="flex-shrink-0">
                {r.blocked ? (
                  <AlertTriangle size={18} className="text-red-400" />
                ) : isSelected ? (
                  <CheckCircle2 size={18} className="text-blue-600" />
                ) : (
                  <span className={clsx(
                    'text-lg font-bold',
                    r.fitScore >= 70 ? 'text-emerald-600' : r.fitScore >= 40 ? 'text-amber-600' : 'text-slate-400'
                  )}>
                    {r.fitScore}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
