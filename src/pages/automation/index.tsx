import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { RuleList, RuleBuilder, SimulationSandbox, ExecutionLog } from '@/widgets/AutomationStudio';
import type { AutomationRule } from '@/features/automation';
import { Cpu, List, Plus, FlaskConical, ScrollText } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'rules' | 'builder' | 'sandbox' | 'logs';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'rules', label: 'Kurallar', icon: List },
  { key: 'builder', label: 'Yeni Kural', icon: Plus },
  { key: 'sandbox', label: 'Test Lab', icon: FlaskConical },
  { key: 'logs', label: 'Calistirma Kayitlari', icon: ScrollText },
];

export default function AutomationPage() {
  const [tab, setTab] = useState<Tab>('rules');
  const [, setSelectedRule] = useState<AutomationRule | null>(null);

  const handleSelectRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setTab('sandbox');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Otomasyon Motoru (Cortex)"
        description="Kural tabanli is akisi otomasyonu ve simulasyon ortami"
        icon={Cpu}
      />

      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Sentinel Cortex</h2>
            <p className="text-slate-300 mb-4">
              "Eger Bu Olursa, Sunu Yap" mantigiyla calistirilan otomasyon kurallari.
              Kritik bulgular icin eskalasyon, gecikmis aksiyonlar icin hatirlatma,
              BT denetimleri icin otomatik CISO onayi ve daha fazlasi.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <List className="w-4 h-4" />
                <span>IFTTT Kurallar</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <FlaskConical className="w-4 h-4" />
                <span>Simulasyon Sandbox</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <ScrollText className="w-4 h-4" />
                <span>Denetim Izi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition-all flex-1 justify-center',
                tab === t.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'rules' && <RuleList onSelectRule={handleSelectRule} />}
      {tab === 'builder' && <RuleBuilder onCreated={() => setTab('rules')} onCancel={() => setTab('rules')} />}
      {tab === 'sandbox' && <SimulationSandbox />}
      {tab === 'logs' && <ExecutionLog />}
    </div>
  );
}
