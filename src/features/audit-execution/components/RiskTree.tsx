import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Shield, AlertOctagon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RiskNode } from '@/features/risk-engine/types';

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
          "flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors border-l-2 border-transparent text-sm text-primary",
          isSelected ? "bg-indigo-50/50 border-l-indigo-500 text-indigo-700 font-medium" : "hover:bg-slate-200/50"
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
        <div className="border-l border-slate-200/50 ml-2">
           <RiskTree nodes={node.children} onSelect={onSelect} selectedId={selectedId} level={level + 1} />
        </div>
      )}
    </div>
  );
};