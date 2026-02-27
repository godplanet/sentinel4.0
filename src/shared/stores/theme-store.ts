/**
 * Sentinel GRC v3.0 — Dinamik Tema Motoru: Zustand Store
 *
 * Kullanıcının seçtiği tema kimliğini tutar ve localStorage'a kalıcı olarak yazar.
 * ThemeProvider bu store'u dinleyerek <html data-theme="..."> niteliğini günceller.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Mevcut 4 açık tema tanımlayıcısı */
export type ThemeId = 'zen' | 'cloud' | 'enterprise' | 'ice';

export interface ThemeOption {
  id: ThemeId;
  /** Kullanıcıya gösterilen başlık */
  label: string;
  /** Açıklama metni */
  description: string;
  /** Arka plan rengi önizlemesi */
  previewCanvas: string;
  /** Yüzey rengi önizlemesi */
  previewSurface: string;
  /** Vurgu rengi */
  previewAccent: string;
}

/** Tema kataloğu — bileşen dışında sabit olarak tanımlanır (Mock Data Kuralı) */
export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'zen',
    label: 'Zen Paper',
    description: 'Sıcak kırık beyaz — odaklı denetim çalışması için sakin zemin',
    previewCanvas: '#FDFBF7',
    previewSurface: '#FFFFFF',
    previewAccent: '#3B82F6',
  },
  {
    id: 'cloud',
    label: 'Cloud Slate',
    description: 'Teknolojik serin mat gri — BT ve CCM modülleri için',
    previewCanvas: '#F8FAFC',
    previewSurface: '#F1F5F9',
    previewAccent: '#0EA5E9',
  },
  {
    id: 'enterprise',
    label: 'Enterprise Clean',
    description: 'Saf ve keskin kurumsal beyaz — sunum ve raporlama için',
    previewCanvas: '#FFFFFF',
    previewSurface: '#F9FAFB',
    previewAccent: '#1D4ED8',
  },
  {
    id: 'ice',
    label: 'Ice Glass',
    description: 'Buz mavisi cam efekti — risk ve uyum panolarında odak',
    previewCanvas: '#F0F9FF',
    previewSurface: '#E0F2FE',
    previewAccent: '#0284C7',
  },
];

interface ThemeStore {
  /** Aktif tema kimliği */
  activeTheme: ThemeId;
  /** Tema değiştir */
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      activeTheme: 'zen',
      setTheme: (theme) => set({ activeTheme: theme }),
    }),
    {
      name: 'sentinel-theme',
    }
  )
);
