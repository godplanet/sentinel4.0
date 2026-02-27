import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// --- Types ---

export interface LocalizedText {
  tr: string;
  en: string;
}

export interface FindingSectionConfig {
  id: string;
  key: string; // Veritabanı veya form datasında kullanılacak unique key (örn: 'criteria')
  label: LocalizedText;
  placeholder: LocalizedText;
  icon: string; // Lucide icon name (örn: 'Scale', 'Search', 'Zap')
  required: boolean;
  is_ai_supported: boolean;
  order: number; // Dinamik sıralama için
  is_active: boolean; // Soft-delete yerine pasife alma imkanı
}

interface MethodologyState {
  findingSections: FindingSectionConfig[];
  isLoading: boolean;
  error: string | null;
}

interface MethodologyActions {
  fetchConfig: () => Promise<void>;
  updateSection: (id: string, updates: Partial<FindingSectionConfig>) => void;
  resetToDefaults: () => void;
}

// --- Default Data (GIAS 2024 / 5C Methodology) ---

const DEFAULT_5C_CONFIG: FindingSectionConfig[] = [
  {
    id: 'sec_001',
    key: 'criteria',
    order: 1,
    is_active: true,
    label: {
      tr: 'Kriter (Criteria)',
      en: 'Criteria'
    },
    placeholder: {
      tr: 'Olması gereken standart, mevzuat veya prosedür nedir?',
      en: 'What is the standard, regulation, or procedure that should be applied?'
    },
    icon: 'Scale', // Lucide: Terazi (Denge/Standart)
    required: true,
    is_ai_supported: true
  },
  {
    id: 'sec_002',
    key: 'condition',
    order: 2,
    is_active: true,
    label: {
      tr: 'Tespit (Condition)',
      en: 'Condition'
    },
    placeholder: {
      tr: 'Mevcut durum nedir? Gözlemlenen fiili durum.',
      en: 'What is the current situation? The observed actual state.'
    },
    icon: 'Search', // Lucide: Büyüteç (Gözlem)
    required: true,
    is_ai_supported: true
  },
  {
    id: 'sec_003',
    key: 'cause',
    order: 3,
    is_active: true,
    label: {
      tr: 'Neden / Kök Neden (Cause)',
      en: 'Cause / Root Cause'
    },
    placeholder: {
      tr: 'Bu durum neden oluştu? (Kök neden analizi)',
      en: 'Why did this happen? (Root cause analysis)'
    },
    icon: 'GitPullRequestArrow', // Lucide: Kaynak/Kök (Veya 'Anchor')
    required: true,
    is_ai_supported: true
  },
  {
    id: 'sec_004',
    key: 'consequence',
    order: 4,
    is_active: true,
    label: {
      tr: 'Etki / Sonuç (Consequence)',
      en: 'Consequence'
    },
    placeholder: {
      tr: 'Bu durumun kuruma etkisi veya riski nedir?',
      en: 'What is the impact or risk of this condition to the organization?'
    },
    icon: 'AlertTriangle', // Lucide: Uyarı (Risk/Etki)
    required: true,
    is_ai_supported: true
  },
  {
    id: 'sec_005',
    key: 'corrective_action',
    order: 5,
    is_active: true,
    label: {
      tr: 'Aksiyon / Öneri (Corrective Action)',
      en: 'Corrective Action'
    },
    placeholder: {
      tr: 'Bu durumu düzeltmek için ne yapılmalı?',
      en: 'What should be done to correct this situation?'
    },
    icon: 'CheckCircle2', // Lucide: Tamamlama (Çözüm)
    required: true,
    is_ai_supported: true
  }
];

// --- Store Implementation ---

export const useMethodologyStore = create<MethodologyState & MethodologyActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        findingSections: [], // Başlangıçta boş, fetchConfig ile dolacak
        isLoading: false,
        error: null,

        // Actions
        fetchConfig: async () => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Burası Supabase entegrasyonu ile değişecek.
            // Örn: const { data, error } = await supabase.from('methodology_configs').select('*').order('order');
            
            // Mocking network delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Mock Data Response (Simulating DB fetch)
            // Normalde DB'den gelmezse DEFAULT_5C_CONFIG kullanılır.
            const data = DEFAULT_5C_CONFIG;

            set({ findingSections: data, isLoading: false });
          } catch (error) {
            console.error('Failed to fetch methodology config:', error);
            set({ 
              error: 'Metodoloji konfigürasyonu yüklenirken bir hata oluştu.', 
              isLoading: false 
            });
          }
        },

        updateSection: (id, updates) => {
          set((state) => ({
            findingSections: state.findingSections.map((section) =>
              section.id === id ? { ...section, ...updates } : section
            ),
          }));
        },

        resetToDefaults: () => {
          set({ findingSections: DEFAULT_5C_CONFIG, error: null });
        }
      }),
      {
        name: 'sentinel-methodology-storage', // LocalStorage key
        partialize: (state) => ({ findingSections: state.findingSections }), // Sadece config'i persist et
      }
    )
  )
);