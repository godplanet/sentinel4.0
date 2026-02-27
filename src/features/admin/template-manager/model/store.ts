import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditTemplate } from '../types';

interface TemplateState {
  templates: AuditTemplate[];
  addTemplate: (template: AuditTemplate) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<AuditTemplate>) => void;
}

const DEFAULT_TEMPLATES: AuditTemplate[] = [
  {
    id: 'tpl-branch-01',
    name: 'Standart Şube Denetimi v2',
    description: 'Şubeler için nakit, kredi ve operasyonel risk kontrolleri.',
    module: 'BRANCH',
    createdAt: new Date().toISOString(),
    fields: [
      { id: 'f1', type: 'boolean', label: 'Ana Kasa Mutabakatı Tam mı?', required: true },
      { id: 'f2', type: 'rating', label: 'Fiziki Güvenlik Durumu', required: true },
      { id: 'f3', type: 'textarea', label: 'Müşteri Şikayetleri Özeti', required: false },
    ]
  },
  {
    id: 'tpl-it-01',
    name: 'COBIT IT Denetimi',
    description: 'BT süreçleri için COBIT tabanlı kontrol listesi.',
    module: 'IT',
    createdAt: new Date().toISOString(),
    fields: [
      { id: 'it1', type: 'select', label: 'Kontrol Çerçevesi', required: true, options: ['COBIT 2019', 'ISO 27001'] },
      { id: 'it2', type: 'text', label: 'İlgili Sistem Varlığı', required: true },
    ]
  }
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      templates: DEFAULT_TEMPLATES,
      addTemplate: (tpl) => set((state) => ({ templates: [...state.templates, tpl] })),
      removeTemplate: (id) => set((state) => ({ templates: state.templates.filter(t => t.id !== id) })),
      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map(t => t.id === id ? { ...t, ...updates } : t)
        })),
    }),
    { name: 'sentinel-templates' }
  )
);
