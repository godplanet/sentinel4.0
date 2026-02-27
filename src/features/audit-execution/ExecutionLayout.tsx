import { useState } from 'react';
import { RiskTree, MOCK_RISK_UNIVERSE } from './components/RiskTree';
import { Workpaper } from './components/Workpaper';
import { RiskNode } from '@/features/risk-engine/types';

export const ExecutionLayout = () => {
  const [selectedNode, setSelectedNode] = useState<RiskNode | null>(null);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 bg-white">
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
        <span className="font-bold text-slate-700">Denetim Dosyası: 2024-Q1 Genel Merkez</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col overflow-auto p-2">
           <RiskTree nodes={MOCK_RISK_UNIVERSE} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
        </div>
        <div className="flex-1 bg-slate-100/50 p-6 overflow-hidden">
           <Workpaper control={selectedNode as any} />
        </div>
      </div>
    </div>
  );
};
