import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  FileText,
  Loader2,
  ChevronRight,
  BookOpen,
  Building2,
  AlertTriangle,
  Info,
  Plus,
  Scale,
  BarChart2,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

interface DBTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  layout_type: string;
  default_sections: { title: string; orderIndex: number }[];
  tags: string[];
  estimated_pages: string;
  is_active: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, AlertTriangle, Info, Plus, Scale, BarChart2, FileText,
};

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? FileText;
}

interface TemplateSelectorModalProps {
  open: boolean;
  onClose: () => void;
}

async function createReportFromTemplate(template: DBTemplate): Promise<string | null> {
  const { data: reportData, error: reportError } = await supabase
    .from('m6_reports')
    .insert({
      title:
        template.layout_type === 'blank'
          ? 'Yeni Denetim Raporu'
          : `${template.name} — ${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`,
      status: 'draft',
      layout_type: template.layout_type,
      report_type: template.layout_type,
      risk_level: 'medium',
      auditor_name: 'Denetçi',
      finding_count: 0,
      theme_config: { paperStyle: 'zen_paper', typography: 'merriweather_inter' },
      executive_summary: {
        score: 0,
        grade: 'N/A',
        assuranceLevel: '',
        trend: 0,
        previousGrade: '',
        layoutType: template.layout_type,
        findingCounts: { critical: 0, high: 0, medium: 0, low: 0, observation: 0 },
        briefingNote: '',
        sections: {
          auditOpinion: '',
          criticalRisks: '',
          strategicRecommendations: '',
          managementAction: '',
        },
        dynamicSections: template.default_sections.map((s, idx) => ({
          id: `ds-${idx}`,
          title: s.title,
          content: '',
        })),
        dynamicMetrics:
          template.layout_type === 'investigation'
            ? { maliBoyu: '', olayTarihi: '', ilgiliBirim: '' }
            : undefined,
      },
      workflow: {},
    })
    .select('id')
    .maybeSingle();

  if (reportError) throw reportError;
  const reportId = reportData?.id;
  if (!reportId) return null;

  for (const section of template.default_sections) {
    await supabase.from('m6_report_sections').insert({
      report_id: reportId,
      title: section.title,
      order_index: section.orderIndex,
    });
  }

  return reportId;
}

export function TemplateSelectorModal({ open, onClose }: TemplateSelectorModalProps) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DBTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingTemplates(true);
    supabase
      .from('m6_report_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (!err && data) setTemplates(data as DBTemplate[]);
        setLoadingTemplates(false);
      });
  }, [open]);

  if (!open) return null;

  const BLANK_TEMPLATE: DBTemplate = {
    id: 'blank',
    name: 'Boş Rapor',
    description: 'Sıfırdan başlayın, istediğiniz gibi özelleştirin',
    icon: 'Plus',
    layout_type: 'blank',
    default_sections: [],
    tags: [],
    estimated_pages: 'Sınırsız',
    is_active: true,
  };

  const allTemplates = [BLANK_TEMPLATE, ...templates];

  const handleSelect = async (template: DBTemplate) => {
    setSelectedId(template.id);
    setCreating(true);
    setError(null);
    try {
      const id = await createReportFromTemplate(template);
      if (id) {
        onClose();
        navigate(`/reporting/zen-editor/${id}`);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Rapor oluşturulamadı.');
      setSelectedId(null);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-sans font-semibold text-slate-900 text-base">Rapor Şablonu Seçin</h2>
              <p className="text-xs font-sans text-slate-500 mt-0.5">
                Standart şablonlardan biri ile başlayın veya boş sayfa ile devam edin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-sans text-red-700">
              {error}
            </div>
          )}

          {loadingTemplates ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-sans">Şablonlar yükleniyor...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allTemplates.map((template) => {
                const Icon = getIcon(template.icon);
                const isLoading = creating && selectedId === template.id;
                const isDisabled = creating && selectedId !== template.id;

                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    disabled={creating}
                    className={clsx(
                      'w-full text-left rounded-xl border p-4 transition-all duration-150 group',
                      'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed border-slate-200 bg-white'
                        : selectedId === template.id && creating
                          ? 'border-blue-500 shadow-md bg-blue-50/30'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md cursor-pointer',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={clsx(
                          'flex-shrink-0 p-3 rounded-lg transition-colors',
                          template.layout_type === 'investigation'
                            ? 'bg-red-50 group-hover:bg-red-100'
                            : template.layout_type === 'info_note'
                              ? 'bg-blue-50 group-hover:bg-blue-100'
                              : 'bg-slate-50 group-hover:bg-slate-100',
                        )}
                      >
                        {isLoading ? (
                          <Loader2
                            size={20}
                            className={clsx(
                              'animate-spin',
                              template.layout_type === 'investigation'
                                ? 'text-red-600'
                                : 'text-blue-600',
                            )}
                          />
                        ) : (
                          <Icon
                            size={20}
                            className={
                              template.layout_type === 'investigation'
                                ? 'text-red-600'
                                : template.layout_type === 'info_note'
                                  ? 'text-blue-600'
                                  : 'text-slate-600'
                            }
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-sans font-semibold text-slate-900 text-sm">
                            {template.name}
                          </span>
                          {template.estimated_pages !== 'Sınırsız' && (
                            <span className="flex-shrink-0 text-xs font-sans text-slate-400">
                              {template.estimated_pages} sayfa
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-sans text-slate-500 mt-1 leading-relaxed">
                          {template.description}
                        </p>

                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {template.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-sans font-medium border border-blue-100"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {template.default_sections.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {template.default_sections.slice(0, 4).map((s, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-sans text-slate-500"
                              >
                                <FileText size={9} />
                                {s.title}
                              </span>
                            ))}
                            {template.default_sections.length > 4 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-sans text-slate-400">
                                +{template.default_sections.length - 4} daha
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 self-center text-slate-300 group-hover:text-blue-400 transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] font-sans text-slate-400 text-center">
            Şablon seçildikten sonra tüm bölümler düzenlenebilir durumda açılacaktır.
          </p>
        </div>
      </div>
    </div>
  );
}
