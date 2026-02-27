import { create } from 'zustand';

// --- TİP TANIMLARI ---

// Eski yapılar için (ID bazlı)
export interface ParameterItem {
  id: string;
  label: string;
}

// Yeni yapılar için (Value/Color bazlı - Zen Modu)
export interface ParameterOption {
  value: string;
  label: string;
  color?: string;      // Tailwind class (text/bg)
  border?: string;     // Border color
  description?: string; // Tooltip detay
}

interface ParameterState {
  // ----------------------------------------------------------------
  // 1. MEVCUT VERİLER (ESKİ SİSTEM - KORUNDU)
  // ----------------------------------------------------------------
  giasCategories: ParameterItem[];
  rcaCategories: ParameterItem[];
  riskTypes: ParameterItem[];

  // ----------------------------------------------------------------
  // 2. YENİ VERİLER (ZEN MODU & STUDIO - EKLENDİ)
  // ----------------------------------------------------------------
  severities: ParameterOption[];
  statuses: ParameterOption[];

  // ----------------------------------------------------------------
  // 3. MEVCUT AKSİYONLAR (KORUNDU)
  // ----------------------------------------------------------------
  addGiasCategory: (label: string) => void;
  removeGiasCategory: (id: string) => void;
  
  addRcaCategory: (label: string) => void;
  removeRcaCategory: (id: string) => void;
  
  addRiskType: (label: string) => void;
  removeRiskType: (id: string) => void;

  // ----------------------------------------------------------------
  // 4. YENİ YARDIMCI FONKSİYONLAR (ZEN & STUDIO İÇİN)
  // ----------------------------------------------------------------
  getSeverityColor: (value: string | undefined) => string;
  getStatusColor: (value: string | undefined) => string;
  getStatusLabel: (value: string | undefined) => string;
  initParameters: () => void; // Başlangıç yükleyicisi
}

export const useParameterStore = create<ParameterState>((set, get) => ({
  // ================================================================
  // VERİ SETLERİ
  // ================================================================

  // 1. MEVCUT LİSTELER
  giasCategories: [
    { id: 'gias-1', label: 'Operasyonel Risk' },
    { id: 'gias-2', label: 'Uyum Riski' },
    { id: 'gias-3', label: 'Finansal Risk' },
    { id: 'gias-4', label: 'Teknolojik Risk' },
    { id: 'gias-5', label: 'Stratejik Risk' },
  ],
  rcaCategories: [
    { id: 'rca-1', label: 'İnsan Hatası / Yetkinlik' },
    { id: 'rca-2', label: 'Süreç Tasarım Eksikliği' },
    { id: 'rca-3', label: 'Sistem / Altyapı Hatası' },
    { id: 'rca-4', label: 'Dış Faktörler' },
  ],
  riskTypes: [
    { id: 'operational', label: 'Operasyonel' },
    { id: 'credit', label: 'Kredi' },
    { id: 'market', label: 'Piyasa' },
    { id: 'reputation', label: 'İtibar' },
  ],

  // 2. YENİ LİSTELER (Bulgu Yönetimi İçin)
  severities: [
    { value: 'CRITICAL', label: 'Kritik', color: 'bg-red-600 text-white border-red-700', description: 'Acil müdahale gerektirir.' },
    { value: 'HIGH', label: 'Yüksek', color: 'bg-orange-500 text-white border-orange-600', description: 'Önemli risk.' },
    { value: 'MEDIUM', label: 'Orta', color: 'bg-amber-500 text-white border-amber-600', description: 'İzlenmeli.' },
    { value: 'LOW', label: 'Düşük', color: 'bg-blue-500 text-white border-blue-600', description: 'Düşük öncelikli.' },
    { value: 'OBSERVATION', label: 'Gözlem', color: 'bg-slate-500 text-white border-slate-600', description: 'Risk yok, öneri.' }
  ],
  statuses: [
    { value: 'DRAFT', label: 'Taslak', color: 'bg-slate-100 text-slate-700' },
    { value: 'IN_REVIEW', label: 'İncelemede', color: 'bg-purple-100 text-purple-700' },
    { value: 'NEGOTIATION', label: 'Müzakere', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'PENDING_APPROVAL', label: 'Onay Bekliyor', color: 'bg-amber-100 text-amber-700' },
    { value: 'PUBLISHED', label: 'Yayınlandı', color: 'bg-blue-100 text-blue-700' },
    { value: 'FINAL', label: 'Final', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'CLOSED', label: 'Kapatıldı', color: 'bg-gray-100 text-gray-600' }
  ],

  // ================================================================
  // AKSİYONLAR (STATE GÜNCELLEME)
  // ================================================================

  addGiasCategory: (label) => set((state) => ({
    giasCategories: [...state.giasCategories, { id: Math.random().toString(36).substring(7), label }]
  })),
  removeGiasCategory: (id) => set((state) => ({
    giasCategories: state.giasCategories.filter(i => i.id !== id)
  })),

  addRcaCategory: (label) => set((state) => ({
    rcaCategories: [...state.rcaCategories, { id: Math.random().toString(36).substring(7), label }]
  })),
  removeRcaCategory: (id) => set((state) => ({
    rcaCategories: state.rcaCategories.filter(i => i.id !== id)
  })),

  addRiskType: (label) => set((state) => ({
    riskTypes: [...state.riskTypes, { id: Math.random().toString(36).substring(7), label }]
  })),
  removeRiskType: (id) => set((state) => ({
    riskTypes: state.riskTypes.filter(i => i.id !== id)
  })),

  // ================================================================
  // UI HELPER FONKSİYONLARI (Zen Modu'nun Kullandığı)
  // ================================================================

  getSeverityColor: (value) => {
    if (!value) return 'bg-slate-500 text-white border-slate-600'; // Fallback
    const item = get().severities.find(s => s.value === value);
    return item?.color || 'bg-slate-500 text-white border-slate-600';
  },

  getStatusColor: (value) => {
    if (!value) return 'bg-slate-100 text-slate-700';
    const item = get().statuses.find(s => s.value === value);
    return item?.color || 'bg-slate-100 text-slate-700';
  },

  getStatusLabel: (value) => {
    if (!value) return '';
    const item = get().statuses.find(s => s.value === value);
    return item?.label || value;
  },

  initParameters: () => {
    console.log('Parametreler ve Yapılandırma Yüklendi.');
  }
}));