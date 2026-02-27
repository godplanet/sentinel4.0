import { useState, useMemo } from 'react';
import {
  useAutomationRules,
  useCreateLog,
  TRIGGER_EVENTS,
  CONDITION_FIELDS,
  type AutomationRule,
} from '@/features/automation';
import {
  FlaskConical, Play, CheckCircle, XCircle, Loader2,
  AlertTriangle, Zap, ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface SimResult {
  fired: boolean;
  rule: AutomationRule;
  conditionResults: Record<string, { expected: unknown; actual: unknown; match: boolean }>;
  actionCount: number;
  message: string;
}

export const SimulationSandbox = () => {
  const { data: rules } = useAutomationRules();
  const createLog = useCreateLog();
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [payload, setPayload] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);

  const selectedRule = useMemo(
    () => rules?.find((r) => r.id === selectedRuleId) || null,
    [rules, selectedRuleId],
  );

  const payloadFields = useMemo(() => {
    if (!selectedRule) return [];
    const fields = CONDITION_FIELDS[selectedRule.trigger_event] || [];
    const base = [
      { field: 'entity_id', label: 'Varlik ID', type: 'text' as const },
      { field: 'title', label: 'Baslik', type: 'text' as const },
    ];
    return [...base, ...fields];
  }, [selectedRule]);

  const handleSelectRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setPayload({});
    setResult(null);
  };

  const handleRun = async () => {
    if (!selectedRule) return;
    setIsRunning(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const conditions = selectedRule.conditions as Record<string, unknown>;
    const conditionResults: Record<string, { expected: unknown; actual: unknown; match: boolean }> = {};
    let allMatch = true;

    for (const [key, expected] of Object.entries(conditions)) {
      if (key === 'operator') continue;
      const actual = payload[key] || null;
      let match = false;

      if (typeof expected === 'number') {
        const numActual = Number(actual);
        const op = (conditions.operator as string) || 'gte';
        if (op === 'gte') match = numActual >= expected;
        else if (op === 'lte') match = numActual <= expected;
        else match = numActual === expected;
      } else if (typeof expected === 'boolean') {
        match = String(actual).toLowerCase() === String(expected).toLowerCase();
      } else {
        match = String(actual).toLowerCase() === String(expected).toLowerCase();
      }

      conditionResults[key] = { expected, actual: actual ?? '(bos)', match };
      if (!match) allMatch = false;
    }

    const actionCount = Array.isArray(selectedRule.actions) ? selectedRule.actions.length : 0;

    const simResult: SimResult = {
      fired: allMatch,
      rule: selectedRule,
      conditionResults,
      actionCount,
      message: allMatch
        ? `Kural ateslenirdi! ${actionCount} aksiyon calistirilirdi.`
        : 'Kosul eslesmedi. Kural atlanirdi.',
    };

    setResult(simResult);

    await createLog.mutateAsync({
      rule_id: selectedRule.id,
      rule_title: selectedRule.title,
      trigger_event: selectedRule.trigger_event,
      trigger_context: payload as unknown as Record<string, unknown>,
      conditions_evaluated: conditionResults,
      actions_executed: allMatch
        ? (selectedRule.actions as Array<Record<string, unknown>>).map((a) => ({ ...a, result: 'simulated' }))
        : [],
      action_result: `SIMULASYON: ${simResult.message}`,
      status: 'Simulated',
      duration_ms: Math.round(800 + Math.random() * 600),
      is_simulation: true,
    });

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/60 p-5">
        <div className="flex items-start gap-3">
          <FlaskConical className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800 mb-1">Simulasyon Ortami (Test Lab)</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Bir kural secin, test verisi girin ve "Test Et" butonuna basin.
              Gercek veri olusturmadan kuralinizin calisip calismayacagini gorun.
              Tum test sonuclari log tablosuna "Simulated" olarak kaydedilir.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">1. Kural Secin</h4>
            <div className="relative">
              <select
                value={selectedRuleId}
                onChange={(e) => handleSelectRule(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 appearance-none bg-white"
              >
                <option value="">Bir kural seciniz...</option>
                {(rules || []).map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {selectedRule && (
              <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                <div className="font-bold text-slate-600 mb-1">
                  Tetikleyici: {TRIGGER_EVENTS.find((t) => t.value === selectedRule.trigger_event)?.label}
                </div>
                {selectedRule.description && <p>{selectedRule.description}</p>}
              </div>
            )}
          </div>

          {selectedRule && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
              <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">2. Test Verisi Girin</h4>
              <div className="space-y-3">
                {payloadFields.map((f) => (
                  <div key={f.field}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                    {f.type === 'select' ? (
                      <select
                        value={payload[f.field] || ''}
                        onChange={(e) => setPayload({ ...payload, [f.field]: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      >
                        <option value="">Seciniz...</option>
                        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={payload[f.field] || ''}
                        onChange={(e) => setPayload({ ...payload, [f.field]: e.target.value })}
                        placeholder={`Test degeri girin...`}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleRun}
                disabled={isRunning || !selectedRule}
                className={clsx(
                  'mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all',
                  isRunning
                    ? 'bg-amber-100 text-amber-600 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200/50',
                )}
              >
                {isRunning ? (
                  <><Loader2 size={16} className="animate-spin" /> Calistiriliyor...</>
                ) : (
                  <><Play size={16} /> Test Et</>
                )}
              </button>
            </div>
          )}
        </div>

        <div>
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  'rounded-xl border-2 shadow-sm overflow-hidden',
                  result.fired
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-red-200 bg-red-50',
                )}
              >
                <div className={clsx(
                  'p-5 flex items-center gap-3',
                  result.fired ? 'bg-emerald-100/50' : 'bg-red-100/50',
                )}>
                  {result.fired ? (
                    <CheckCircle size={28} className="text-emerald-600" />
                  ) : (
                    <XCircle size={28} className="text-red-500" />
                  )}
                  <div>
                    <h3 className={clsx('text-lg font-black', result.fired ? 'text-emerald-800' : 'text-red-700')}>
                      {result.fired ? 'Kural Ateslenirdi!' : 'Kosul Eslesmedi'}
                    </h3>
                    <p className={clsx('text-sm', result.fired ? 'text-emerald-700' : 'text-red-600')}>
                      {result.message}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4 bg-white/60">
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Kosul Analizi</h4>
                    {Object.keys(result.conditionResults).length === 0 ? (
                      <p className="text-xs text-slate-400">Kosul tanimli degil</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(result.conditionResults).map(([key, val]) => (
                          <div key={key} className={clsx(
                            'flex items-center justify-between p-3 rounded-lg border text-xs',
                            val.match ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
                          )}>
                            <div>
                              <span className="font-bold text-slate-700">{key}</span>
                              <span className="text-slate-400 mx-2">
                                beklenen: <span className="font-semibold text-slate-600">{String(val.expected)}</span>
                              </span>
                              <span className="text-slate-400">
                                gercek: <span className="font-semibold text-slate-600">{String(val.actual)}</span>
                              </span>
                            </div>
                            {val.match ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {result.fired && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Calistirilacak Aksiyonlar</h4>
                      <div className="space-y-1">
                        {(result.rule.actions as Array<Record<string, unknown>>).map((action, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                            <Zap size={12} />
                            <span className="font-semibold">{String(action.type)}</span>
                            {action.message && <span className="text-emerald-600">- {String(action.message)}</span>}
                            {action.task_title && <span className="text-emerald-600">- {String(action.task_title)}</span>}
                            {action.template && <span className="text-emerald-600">- {String(action.template)}</span>}
                            {action.role && <span className="text-emerald-600">- {String(action.role)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
                    <AlertTriangle size={10} />
                    Bu bir simulasyondur. Gercek bir veri degisikligi yapilmamistir.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && selectedRule && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FlaskConical className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-medium">Test verisi girin ve "Test Et" butonuna basin</p>
              <p className="text-xs mt-1">Sonuclar burada gorunecek</p>
            </div>
          )}

          {!selectedRule && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FlaskConical className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-medium">Soldan bir kural secerek baslayin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
