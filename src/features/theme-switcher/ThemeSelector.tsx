/**
 * Sentinel GRC v3.0 — ThemeSelector
 *
 * Kullanıcının 4 açık tema arasında anında geçiş yapmasını sağlayan
 * "Apple Glass" tasarım diline uygun kart tabanlı tema seçici.
 *
 * Mock data kuralı: Tema listesi bileşen dışında THEME_OPTIONS sabitinden gelir.
 */

import { CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useThemeStore, THEME_OPTIONS } from '@/shared/stores/theme-store';
import type { ThemeId } from '@/shared/stores/theme-store';

/**
 * Her tema için renk halkası görseli — tasarım önizlemesi
 */
function ThemePreviewSwatch({
  canvas,
  surface,
  accent,
}: {
  canvas: string;
  surface: string;
  accent: string;
}) {
  return (
    <div
      className="w-full h-16 rounded-xl overflow-hidden relative flex items-end p-2 mb-3 shadow-inner"
      style={{ backgroundColor: canvas }}
    >
      {/* Yüzey şeridi */}
      <div
        className="absolute inset-x-0 bottom-0 h-7 rounded-b-xl opacity-80"
        style={{ backgroundColor: surface }}
      />
      {/* Vurgu nokta */}
      <div
        className="relative z-10 w-5 h-5 rounded-full shadow-md ml-auto"
        style={{ backgroundColor: accent }}
      />
      {/* Cam çizgileri — dekoratif */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${canvas}00 60%, ${accent}18 100%)`,
        }}
      />
    </div>
  );
}

export function ThemeSelector() {
  const { activeTheme, setTheme } = useThemeStore();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEME_OPTIONS.map((theme) => {
          const isActive = activeTheme === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
              className={clsx(
                'group relative flex flex-col p-3 rounded-2xl border-2 text-left transition-all duration-200',
                'backdrop-blur-sm hover:-translate-y-0.5',
                isActive
                  ? 'border-blue-500 bg-blue-50/60 shadow-md shadow-blue-500/10'
                  : 'border-slate-200/80 bg-white/60 hover:border-slate-300 hover:shadow-md'
              )}
            >
              {/* Aktif işaret */}
              {isActive && (
                <CheckCircle2
                  size={16}
                  className="absolute top-2.5 right-2.5 text-blue-500"
                />
              )}

              {/* Renk önizleme */}
              <ThemePreviewSwatch
                canvas={theme.previewCanvas}
                surface={theme.previewSurface}
                accent={theme.previewAccent}
              />

              {/* Başlık */}
              <span
                className={clsx(
                  'block text-sm font-bold mb-0.5 transition-colors',
                  isActive ? 'text-blue-700' : 'text-slate-800 group-hover:text-slate-900'
                )}
              >
                {theme.label}
              </span>

              {/* Açıklama */}
              <span className="block text-[11px] text-slate-500 leading-snug line-clamp-2">
                {theme.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aktif tema bilgi bandı */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Aktif: <span className="font-bold">
          {THEME_OPTIONS.find((t) => t.id === activeTheme)?.label}
        </span>
        — Seçim tarayıcıya otomatik kaydedilir.
      </div>
    </div>
  );
}
