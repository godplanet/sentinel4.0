import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useActiveReportStore } from '@/entities/report';

const VARIABLE_LABELS: Record<string, string> = {
  npl_ratio: 'NPL Oranı',
  critical_findings_count: 'Kritik Bulgu',
  total_risk_exposure: 'Toplam Risk',
};

export function SmartVariableNodeView({ node }: NodeViewProps) {
  const { smartVariables, activeReport } = useActiveReportStore();
  const id: string = node.attrs.id ?? '';
  const isPublished = activeReport?.status === 'published';
  const value = id in smartVariables ? smartVariables[id] : id;
  const label = VARIABLE_LABELS[id] ?? id;

  return (
    <NodeViewWrapper as="span" contentEditable={false} style={{ display: 'inline' }}>
      <span
        className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 mx-0.5 font-sans text-xs font-medium cursor-default select-none"
        data-variable-id={id}
        title={isPublished ? `${label} — dondurulmuş değer` : label}
      >
        {isPublished && (
          <span className="mr-0.5 opacity-60 text-[10px]">&#128274;</span>
        )}
        {String(value)}
      </span>
    </NodeViewWrapper>
  );
}
