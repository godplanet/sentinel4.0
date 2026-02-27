/**
 * Sentinel GRC v3.0 — ThemeProvider
 *
 * Zustand theme-store'u dinleyerek <html> üzerindeki [data-theme] niteliğini
 * güncelleyen hafif bir React sağlayıcısıdır.
 * CSS değişkenleri (Design Tokens) bu nitelik değişiminde otomatik devreye girer.
 */

import { useEffect } from 'react';
import { useThemeStore } from '@/shared/stores/theme-store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { activeTheme } = useThemeStore();

  useEffect(() => {
    // <html data-theme="zen|cloud|enterprise|ice"> niteliğini güncelle
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  return <>{children}</>;
};
