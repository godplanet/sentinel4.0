import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllFindings } from '@/entities/finding/api/crud';
import type { FindingWithAssignment } from '@/entities/finding';
import {
  Filter, Plus, Search,
  Layout, ArrowRight, BookOpen
} from 'lucide-react';
import { useRiskConstitution } from '@/features/risk-constitution';
import { useState } from 'react';

interface FindingListProps {
  onSelectFinding?: (finding: FindingWithAssignment) => void;
  onCreateNew?: () => void;
}

const LEGACY_SCORE_MAP: Record<string, number> = {
  'CRITICAL': 95, 'HIGH': 75, 'MEDIUM': 50, 'LOW': 25,
};

export function FindingList({ onSelectFinding, onCreateNew }: FindingListProps) {
  const navigate = useNavigate();
  const { constitution } = useRiskConstitution();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { data: findings = [], isLoading } = useQuery({
    queryKey: ['findings'],
    queryFn: () => getAllFindings(),
  });

  const filteredFindings = (findings as FindingWithAssignment[]).filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || f.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || f.main_status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityDisplay = useMemo(() => {
    if (!constitution) return (sev: string) => ({ color: '#64748b', label: sev, bgClass: 'bg-slate-100 text-slate-800' });
    return (severity: string) => {
      const score = LEGACY_SCORE_MAP[severity] ?? 50;
      const sorted = [...constitution.risk_ranges].sort((a, b) => b.min - a.min);
      const zone = sorted.find(r => score >= r.min && score <= r.max) || constitution.risk_ranges[0];
      return {
        color: zone?.color || '#64748b',
        label: zone?.label || severity,
        bgClass: `text-white`,
      };
    };
  }, [constitution]);

  return (
    <div className="space-y-4">
      {/* ARAÇ ÇUBUĞU */}
      <div className="flex items-center justify-between gap-4 bg-surface p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm font-medium"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <button
          onClick={() => navigate('/execution/findings/zen/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-bold shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          Zen Modu (Demo)
        </button>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yeni Bulgu
          </button>
        )}
      </div>

      {/* LİSTE */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Yükleniyor...</div>
      ) : filteredFindings.length === 0 ? (
        <div className="text-center py-20 bg-canvas rounded-2xl border border-slate-200 border-dashed">
          <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Kayıt bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => navigate(`/execution/findings/zen/${finding.id}`)}
              className="bg-surface border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: getSeverityDisplay(finding.severity).color }}
              />
              <div className="flex items-start justify-between gap-4 pl-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {finding.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${getSeverityDisplay(finding.severity).bgClass}`}
                      style={{ backgroundColor: getSeverityDisplay(finding.severity).color }}
                    >
                      {getSeverityDisplay(finding.severity).label}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {finding.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span>
                      {finding.financial_impact > 0
                        ? `${finding.financial_impact.toLocaleString()} TL`
                        : 'Finansal Etki Yok'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Layout className="w-3 h-3" />
                      <span>{finding.gias_category || 'Genel'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center h-full">
                  <button className="p-2 bg-canvas text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
