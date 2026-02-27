import { X, FileText, Building2, Search, Monitor, Shield, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { ReportTemplate } from '@/entities/report/model/types';

interface TemplatePickerProps {
  templates: ReportTemplate[];
  onSelect: (template: ReportTemplate) => void;
  onBlank: () => void;
  onClose: () => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; gradient: string; label: string }> = {
  BRANCH: { icon: Building2, gradient: 'from-blue-500 to-blue-600', label: 'Sube Denetimi' },
  INVESTIGATION: { icon: Search, gradient: 'from-red-500 to-red-600', label: 'Sorusturma' },
  IT: { icon: Monitor, gradient: 'from-cyan-500 to-cyan-600', label: 'BT Denetimi' },
  PROCESS: { icon: FileText, gradient: 'from-teal-500 to-teal-600', label: 'Surec Denetimi' },
  CUSTOM: { icon: Shield, gradient: 'from-slate-500 to-slate-600', label: 'Ozel' },
};

export function TemplatePicker({ templates, onSelect, onBlank, onClose }: TemplatePickerProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sablon Galerisi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Rapor sablonu secin veya sifirdan baslayin</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
            <button
              onClick={onBlank}
              className="w-full mb-5 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Plus size={22} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                  Bos Rapor
                </div>
                <div className="text-xs text-slate-400">Sifirdan baslayarak raporunuzu olusturun</div>
              </div>
            </button>

            {templates.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                Henuz sablon bulunmuyor
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {templates.map((tmpl) => {
                  const cfg = TYPE_CONFIG[tmpl.type] || TYPE_CONFIG.CUSTOM;
                  const Icon = cfg.icon;
                  const blockCount = Array.isArray(tmpl.structure_json) ? tmpl.structure_json.length : 0;

                  return (
                    <motion.button
                      key={tmpl.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(tmpl)}
                      className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm',
                          cfg.gradient
                        )}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                            {tmpl.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{cfg.label}</div>
                          {tmpl.description && (
                            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                              {tmpl.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-medium">
                              {blockCount} blok
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
