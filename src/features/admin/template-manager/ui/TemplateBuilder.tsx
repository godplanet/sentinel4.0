import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, LayoutTemplate, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { riskLibraryApi, RkmTemplate } from '@/entities/risk';
import clsx from 'clsx';

type ModuleType = 'RKM' | 'FINDING' | 'ACTION';

export const TemplateBuilder = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('RKM');
  const [templates, setTemplates] = useState<RkmTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [activeModule]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await riskLibraryApi.getTemplates(activeModule);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleColor = (module: ModuleType) => {
    switch (module) {
      case 'RKM':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'FINDING':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ACTION':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getModuleLabel = (module: ModuleType) => {
    switch (module) {
      case 'RKM':
        return 'Risk Kütüphanesi';
      case 'FINDING':
        return 'Bulgu Yönetimi';
      case 'ACTION':
        return 'Aksiyon Takip';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {(['RKM', 'FINDING', 'ACTION'] as ModuleType[]).map((module) => (
          <button
            key={module}
            onClick={() => setActiveModule(module)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeModule === module
                ? getModuleColor(module)
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            {getModuleLabel(module)}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <LayoutTemplate className="text-indigo-600" />
            {getModuleLabel(activeModule)} Şablonları
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeModule === 'RKM' && 'Risk değerlendirme formları için dinamik şablon yapıları.'}
            {activeModule === 'FINDING' && 'Bulgu kayıt ve takip formları için özelleştirilmiş şablonlar.'}
            {activeModule === 'ACTION' && 'Aksiyon planı ve takip formları için şablon tanımları.'}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 py-2 px-4 text-xs">
          <Plus size={14} />
          Yeni Şablon
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Şablonlar yükleniyor...</p>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Henüz şablon tanımlanmamış.</p>
          <p className="text-xs text-gray-500 mt-1">Yeni bir şablon eklemek için yukarıdaki butonu kullanın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="glass-panel p-5 rounded-xl group hover:border-indigo-300 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider',
                    getModuleColor(tpl.module_type)
                  )}>
                    {tpl.module_type}
                  </span>
                  {tpl.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600">
                    <Edit3 size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-rose-50 rounded text-slate-500 hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-slate-800 mb-1">{tpl.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Alan Sayısı</span>
                  <span className="font-semibold text-slate-700">
                    {Array.isArray(tpl.schema_definition) ? tpl.schema_definition.length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-500">Oluşturulma</span>
                  <span className="font-mono text-[10px] text-slate-600">
                    {new Date(tpl.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
