import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { RiskTree } from './components/RiskTree';
import { Workpaper } from './components/Workpaper';
import { RiskNode } from '@/features/risk-engine/types';
import { useExecutionTree } from '@/entities/execution/api/useExecutionTree';

export const ExecutionLayout = () => {
  const [selectedNode, setSelectedNode] = useState<RiskNode | null>(null);
  
  // API Hook'umuzu çağırıyoruz (Veri artık buradan akıyor)
  const { data: treeNodes, isLoading } = useExecutionTree();

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 bg-surface">
      <div className="h-14 border-b border-slate-200/50 flex items-center justify-between px-6 bg-surface">
        <span className="font-bold text-primary">Denetim Dosyası: 2024-Q1 Genel Merkez</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        
        {/* SOL PANEL: Risk Ağacı */}
        <div className="w-80 bg-canvas border-r border-slate-200/50 flex flex-col overflow-auto p-2">
           {isLoading ? (
             <div className="flex items-center justify-center h-32">
               <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
             </div>
           ) : (
             <RiskTree nodes={treeNodes || []} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
           )}
        </div>

        {/* SAĞ PANEL: Çalışma Kağıdı */}
        <div className="flex-1 bg-surface p-6 overflow-hidden">
           {selectedNode ? (
             <Workpaper control={selectedNode as any} />
           ) : (
             <div className="flex items-center justify-center h-full text-slate-400 font-medium">
               Lütfen sol panelden incelemek istediğiniz bir süreci veya kontrolü seçin.
             </div>
           )}
        </div>

      </div>
    </div>
  );
};