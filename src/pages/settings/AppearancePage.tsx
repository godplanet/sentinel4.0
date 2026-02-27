import { PageHeader } from '@/shared/ui';
import { SidebarColorPicker, ThemeSelector } from '@/features/theme-switcher';
import { Palette, Paintbrush, Monitor, Moon, Sun, Server, Layers } from 'lucide-react';
import { useUIStore } from '@/shared/stores/ui-store';
import { THEME_CONFIG } from '@/shared/lib/theme';
import clsx from 'clsx';

const ENV_META = {
  PROD: {
    label: 'PROD',
    desc: 'Canlı Ortam',
    ringColor: 'ring-slate-700',
    activeClass: 'border-slate-700 bg-slate-50',
    dot: 'bg-emerald-500',
    textColor: 'text-slate-800',
  },
  UAT: {
    label: 'TEST / UAT',
    desc: 'Kullanıcı Kabul Testi',
    ringColor: 'ring-emerald-600',
    activeClass: 'border-emerald-600 bg-emerald-50',
    dot: 'bg-yellow-500',
    textColor: 'text-emerald-800',
  },
  DEV: {
    label: 'DEV',
    desc: 'Geliştirme Ortamı',
    ringColor: 'ring-rose-600',
    activeClass: 'border-rose-600 bg-rose-50',
    dot: 'bg-blue-500',
    textColor: 'text-rose-800',
  },
} as const;

export default function AppearancePage() {
  const { environment, setEnvironment } = useUIStore();
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Görünüm"
        description="Sidebar renkleri, tema ve görsel özelleştirme ayarları"
        badge="MODÜL 8: AYARLAR"
      />

      {/* ── TEMA MOTORU: Dinamik Arka Plan Seçimi ──────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Sayfa Arka Plan Teması</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              4 profesyonel açık tema — seçim anında tüm sayfaya uygulanır
            </p>
          </div>
        </div>
        <div className="p-6">
          <ThemeSelector />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Chameleon Engine - Dinamik Renk Sistemi</h3>
            <p className="text-slate-600 text-sm">
              Sentinel, ortam bazlı otomatik renk değişimi (PROD=Navy, TEST=Green) ve manuel renk seçimi destekler.
              Ayrıca Light/Dark mode ve VDI optimizasyonu ile tüm kullanım senaryolarını destekler.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Paintbrush size={20} className="text-purple-600" />
              Sidebar Renk Özelleştirme
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Sidebar rengini kurum kimliğinize göre özelleştirin
            </p>
          </div>
          <div className="p-8">
            <SidebarColorPicker />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Server size={20} className="text-slate-600" />
                Ortam Seçimi
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Aktif ortam sidebar rengini ve sistem davranışını belirler.
              </p>
            </div>
            <div className="p-6 space-y-3">
              {(Object.keys(ENV_META) as (keyof typeof ENV_META)[]).map((env) => {
                const meta = ENV_META[env];
                const theme = THEME_CONFIG.environments[env];
                const isActive = environment === env;
                return (
                  <button
                    key={env}
                    onClick={() => setEnvironment(env)}
                    className={clsx(
                      'w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all',
                      isActive ? meta.activeClass : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        theme.sidebar
                      )}>
                        <span className={clsx('w-2 h-2 rounded-full', meta.dot)} />
                      </div>
                      <div className="text-left">
                        <div className={clsx('font-semibold text-sm', isActive ? meta.textColor : 'text-slate-700')}>
                          {meta.label}
                        </div>
                        <div className="text-xs text-slate-500">{meta.desc}</div>
                      </div>
                    </div>
                    <div className={clsx(
                      'w-5 h-5 rounded-full border-2 transition-all',
                      isActive ? `border-4 border-white shadow-sm ring-2 ${meta.ringColor}` : 'border-slate-300'
                    )} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Monitor size={20} className="text-blue-600" />
                Tema Modu
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full flex items-center justify-between p-4 border-2 border-blue-500 bg-blue-50 rounded-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Açık Mod</div>
                    <div className="text-xs text-slate-600">Digital Paper</div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
              </button>

              <button className="w-full flex items-center justify-between p-4 border-2 border-slate-200 hover:border-slate-300 rounded-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Koyu Mod</div>
                    <div className="text-xs text-slate-600">Yakında</div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              </button>

              <div className="pt-3 border-t border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800 text-sm">VDI Modu</div>
                      <div className="text-xs text-slate-600">Citrix/RDP için optimize</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Palette size={20} className="text-green-600" />
                Renk Profilleri
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Hazır Renkler
              </div>
              <button className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800"></div>
                <span className="text-sm font-medium text-slate-800">Corporate Navy</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800"></div>
                <span className="text-sm font-medium text-slate-800">Test Green</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800"></div>
                <span className="text-sm font-medium text-slate-800">Innovation Purple</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900"></div>
                <span className="text-sm font-medium text-slate-800">Professional Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Monitor className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Dual-Physics Rendering</h4>
            <p className="text-sm text-blue-800">
              Sentinel otomatik olarak performansı algılar. Yüksek performanslı sistemlerde <strong>backdrop-blur</strong> (Glass) efekti,
              VDI/Citrix ortamlarında ise <strong>solid white</strong> (No Blur) kullanır. Bu sayede tüm platformlarda optimum performans sağlanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
