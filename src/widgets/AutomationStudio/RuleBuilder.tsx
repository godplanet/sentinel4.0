import { useState } from 'react';
import {
  useCreateRule,
  TRIGGER_EVENTS,
  ACTION_TYPES,
  CONDITION_FIELDS,
} from '@/features/automation';
import {
  ArrowRight, ArrowLeft, Zap, Filter, Play, CheckCircle,
  Plus, Trash2, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

type Step = 'trigger' | 'conditions' | 'actions' | 'review';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'trigger', label: 'Tetikleyici', icon: Zap },
  { key: 'conditions', label: 'Kosullar', icon: Filter },
  { key: 'actions', label: 'Aksiyonlar', icon: Play },
  { key: 'review', label: 'Onay', icon: CheckCircle },
];

export const RuleBuilder = ({ onCreated, onCancel }: Props) => {
  const createRule = useCreateRule();
  const [step, setStep] = useState<Step>('trigger');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [conditions, setConditions] = useState<Record<string, string>>({});
  const [actions, setActions] = useState<Array<{ type: string; config: Record<string, string> }>>([]);
  const [priority, setPriority] = useState(50);

  const stepIdx = STEPS.findIndex((s) => s.key === step);
  const conditionFields = trigger ? (CONDITION_FIELDS[trigger] || []) : [];
  const triggerLabel = TRIGGER_EVENTS.find((t) => t.value === trigger)?.label;

  const canNext = () => {
    if (step === 'trigger') return !!trigger && !!title.trim();
    if (step === 'conditions') return true;
    if (step === 'actions') return actions.length > 0;
    return true;
  };

  const goNext = () => {
    const next = STEPS[stepIdx + 1];
    if (next) setStep(next.key);
  };

  const goPrev = () => {
    const prev = STEPS[stepIdx - 1];
    if (prev) setStep(prev.key);
  };

  const handleSubmit = async () => {
    const conditionsObj: Record<string, unknown> = { ...conditions };
    if (conditionFields.length > 0) conditionsObj.operator = 'equals';

    const actionsArr = actions.map((a) => ({ type: a.type, ...a.config }));

    await createRule.mutateAsync({
      title,
      description: description || null,
      trigger_event: trigger,
      conditions: conditionsObj,
      actions: actionsArr,
      is_active: true,
      priority,
      created_by: 'Denetim Baskani',
    });
    onCreated();
  };

  const addAction = () => {
    setActions([...actions, { type: ACTION_TYPES[0].value, config: {} }]);
  };

  const removeAction = (idx: number) => {
    setActions(actions.filter((_, i) => i !== idx));
  };

  const updateAction = (idx: number, field: string, value: string) => {
    setActions(actions.map((a, i) => {
      if (i !== idx) return a;
      if (field === 'type') return { type: value, config: {} };
      return { ...a, config: { ...a.config, [field]: value } };
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 text-white">
        <h3 className="text-lg font-bold mb-1">Yeni Otomasyon Kurali</h3>
        <p className="text-sm text-slate-300">Adim adim kural olusturucu</p>
      </div>

      <div className="flex border-b border-slate-100">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.key === step;
          const isDone = i < stepIdx;
          return (
            <button
              key={s.key}
              onClick={() => i <= stepIdx && setStep(s.key)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all border-b-2',
                isActive ? 'border-blue-500 text-blue-600 bg-blue-50/30' :
                isDone ? 'border-emerald-500 text-emerald-600' :
                'border-transparent text-slate-400',
              )}
            >
              <Icon size={14} />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="p-6 min-h-[340px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {step === 'trigger' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Kural Adi</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="orn: Kritik Bulgu Eskalasyonu"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Aciklama (Opsiyonel)</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bu kural ne yapar?"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Ne Zaman Tetiklensin?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TRIGGER_EVENTS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => { setTrigger(t.value); setConditions({}); }}
                        className={clsx(
                          'text-left p-3 rounded-lg border-2 transition-all text-sm font-medium',
                          trigger === t.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600',
                        )}
                      >
                        <Zap size={12} className={clsx('inline mr-2', trigger === t.value ? 'text-blue-500' : 'text-slate-400')} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'conditions' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-2">
                  <span className="font-bold text-blue-600">{triggerLabel}</span> tetiklendikten sonra hangi kosullar saglanmali?
                </p>
                {conditionFields.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400">
                    Bu tetikleyici icin ek kosul gerekmemektedir.
                  </div>
                ) : (
                  conditionFields.map((cf) => (
                    <div key={cf.field}>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">{cf.label}</label>
                      {cf.type === 'select' ? (
                        <select
                          value={conditions[cf.field] || ''}
                          onChange={(e) => setConditions({ ...conditions, [cf.field]: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                          <option value="">Seciniz...</option>
                          {cf.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={cf.type}
                          value={conditions[cf.field] || ''}
                          onChange={(e) => setConditions({ ...conditions, [cf.field]: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      )}
                    </div>
                  ))
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Oncelik (1-100)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            )}

            {step === 'actions' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-2">Kosullar saglandiginda hangi aksiyonlar calistirilsin?</p>
                {actions.map((action, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Aksiyon #{idx + 1}</span>
                      <button onClick={() => removeAction(idx)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <select
                      value={action.type}
                      onChange={(e) => updateAction(idx, 'type', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                    >
                      {ACTION_TYPES.map((at) => (
                        <option key={at.value} value={at.value}>{at.label}</option>
                      ))}
                    </select>
                    {action.type === 'SEND_NOTIFICATION' && (
                      <>
                        <input
                          placeholder="Hedef (orn: AUDIT_PRESIDENT)"
                          value={action.config.target || ''}
                          onChange={(e) => updateAction(idx, 'target', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                          placeholder="Bildirim metni"
                          value={action.config.message || ''}
                          onChange={(e) => updateAction(idx, 'message', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </>
                    )}
                    {action.type === 'SEND_EMAIL' && (
                      <>
                        <input
                          placeholder="Sablon (orn: reminder_urgent)"
                          value={action.config.template || ''}
                          onChange={(e) => updateAction(idx, 'template', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                          placeholder="Hedef Rol (orn: ACTION_OWNER)"
                          value={action.config.to_role || ''}
                          onChange={(e) => updateAction(idx, 'to_role', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </>
                    )}
                    {action.type === 'CREATE_TASK' && (
                      <>
                        <input
                          placeholder="Gorev basligi"
                          value={action.config.task_title || ''}
                          onChange={(e) => updateAction(idx, 'task_title', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                          placeholder="Atanan (orn: RISK_OFFICER)"
                          value={action.config.assignee || ''}
                          onChange={(e) => updateAction(idx, 'assignee', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </>
                    )}
                    {action.type === 'UPDATE_STATUS' && (
                      <>
                        <input
                          placeholder="Alan (orn: status)"
                          value={action.config.field || ''}
                          onChange={(e) => updateAction(idx, 'field', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                          placeholder="Yeni deger (orn: Overdue)"
                          value={action.config.value || ''}
                          onChange={(e) => updateAction(idx, 'value', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </>
                    )}
                    {action.type === 'ASSIGN_REVIEWER' && (
                      <input
                        placeholder="Rol (orn: CISO)"
                        value={action.config.role || ''}
                        onChange={(e) => updateAction(idx, 'role', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={addAction}
                  className="flex items-center gap-2 w-full justify-center py-3 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Plus size={14} />
                  Aksiyon Ekle
                </button>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700">Kural Ozeti</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                  <div><span className="font-bold text-slate-500">Baslik:</span> <span className="text-slate-800">{title}</span></div>
                  {description && <div><span className="font-bold text-slate-500">Aciklama:</span> <span className="text-slate-700">{description}</span></div>}
                  <div><span className="font-bold text-slate-500">Tetikleyici:</span> <span className="text-blue-600 font-semibold">{triggerLabel}</span></div>
                  <div>
                    <span className="font-bold text-slate-500">Kosullar:</span>
                    {Object.keys(conditions).length > 0 ? (
                      <ul className="mt-1 ml-4 list-disc text-xs text-slate-600">
                        {Object.entries(conditions).filter(([, v]) => v).map(([k, v]) => <li key={k}>{k} = {v}</li>)}
                      </ul>
                    ) : <span className="text-slate-400 ml-1">Yok</span>}
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Aksiyonlar:</span>
                    <ul className="mt-1 ml-4 list-disc text-xs text-slate-600">
                      {actions.map((a, i) => {
                        const label = ACTION_TYPES.find((t) => t.value === a.type)?.label || a.type;
                        return <li key={i}>{label} {Object.values(a.config).filter(Boolean).join(' / ')}</li>;
                      })}
                    </ul>
                  </div>
                  <div><span className="font-bold text-slate-500">Oncelik:</span> {priority}</div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50/30">
        <button onClick={stepIdx > 0 ? goPrev : onCancel} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={14} />
          {stepIdx > 0 ? 'Geri' : 'Iptal'}
        </button>

        {step === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={createRule.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200/50 transition-all disabled:opacity-50"
          >
            {createRule.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Kurali Olustur
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canNext()}
            className="flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ileri <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
