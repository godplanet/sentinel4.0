import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Shield, AlertOctagon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RiskNode } from '@/features/risk-engine/types';

export const MOCK_RISK_UNIVERSE: RiskNode[] = [
  {
    id: '1', path: 'Kredi', name: 'Kredi Tahsis Yönetimi', type: 'PROCESS', baseImpact: 5, volume: 10000000, controlEffectiveness: 0,
    children: [
      {
        id: '1-1', path: 'Kredi.Kurumsal', name: 'Kurumsal Krediler', type: 'PROCESS', baseImpact: 5, volume: 5000000, controlEffectiveness: 0,
        children: [
          {
            id: 'R-1', path: 'Kredi.Kurumsal.R1', name: 'Teminatsız Kredi Riski', type: 'RISK', baseImpact: 5, volume: 0, controlEffectiveness: 0,
            children: [
              { id: 'C-1', path: 'Kredi.Kurumsal.C1', name: 'Sistem Limiti Kontrolü', type: 'CONTROL', baseImpact: 0, volume: 0, controlEffectiveness: 0.9 },
              { id: 'C-2', path: 'Kredi.Kurumsal.C2', name: '2. Yönetici Onayı', type: 'CONTROL', baseImpact: 0, volume: 0, controlEffectiveness: 0.6 }
            ]
          }
        ]
      },
      {
        id: '1-2', path: 'Kredi.Bireysel', name: 'Bireysel Krediler', type: 'PROCESS', baseImpact: 3, volume: 2000000, controlEffectiveness: 0,
        children: []
      }
    ]
  },
  {
    id: '2', path: 'IT', name: 'Bilgi Teknolojileri', type: 'PROCESS', baseImpact: 4, volume: 0, controlEffectiveness: 0,
    children: [
      {
        id: 'R-2', path: 'IT.Sec', name: 'Yetkisiz Erişim Riski', type: 'RISK', baseImpact: 5, volume: 0, controlEffectiveness: 0,
        children: [
           { id: 'C-3', path: 'IT.Sec.C1', name: 'MFA Zorunluluğu', type: 'CONTROL', baseImpact: 0, volume: 0, controlEffectiveness: 0.95 }
        ]
      }
    ]
  }
];

export const RiskTree = ({ nodes, onSelect, selectedId, level = 0 }: { nodes: RiskNode[], onSelect: any, selectedId?: string, level?: number }) => {
  return (
    <div className="select-none">
      {nodes.map(node => (
        <TreeNode key={node.id} node={node} onSelect={onSelect} selectedId={selectedId} level={level} />
      ))}
    </div>
  );
};

const TreeNode = ({ node, onSelect, selectedId, level }: any) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const Icon = node.type === 'PROCESS' ? Folder : node.type === 'RISK' ? AlertOctagon : Shield;
  const colorClass = node.type === 'PROCESS' ? 'text-slate-400' : node.type === 'RISK' ? 'text-orange-500' : 'text-emerald-500';

  return (
    <div>
      <div
        onClick={() => { if(hasChildren) setIsOpen(!isOpen); onSelect(node); }}
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-slate-50 transition-colors border-l-2 border-transparent text-sm",
          isSelected && "bg-indigo-50 border-l-indigo-500 text-indigo-700 font-medium"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <div className="w-4 h-4 flex items-center justify-center text-slate-400">
           {hasChildren && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </div>
        <Icon size={16} className={colorClass} />
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div className="border-l border-slate-200 ml-2">
           <RiskTree nodes={node.children} onSelect={onSelect} selectedId={selectedId} level={level + 1} />
        </div>
      )}
    </div>
  );
};
