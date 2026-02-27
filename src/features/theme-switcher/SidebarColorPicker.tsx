import { useUIStore } from '@/shared/stores/ui-store';
import { Check, Pipette } from 'lucide-react';
import { useState } from 'react';

const PRESETS = [
  { name: 'Obsidian', value: '#0f172a' },
  { name: 'Navy Blue', value: '#1e3a8a' },
  { name: 'Royal Indigo', value: '#1e1b4b' },
  { name: 'Deep Purple', value: '#581c87' },
  { name: 'Emerald Trust', value: '#064e3b' },
  { name: 'Forest Green', value: '#14532d' },
  { name: 'Teal Bank', value: '#134e4a' },
  { name: 'Mustard Test', value: '#9a7d0a' },
  { name: 'Crimson Risk', value: '#7f1d1d' },
  { name: 'Burgundy', value: '#881337' },
  { name: 'Charcoal', value: '#18181b' },
  { name: 'Slate Gray', value: '#334155' },
];

export const SidebarColorPicker = () => {
  const { sidebarColor, setSidebarColor } = useUIStore();
  const [showCustom, setShowCustom] = useState(false);
  const [customColor, setCustomColor] = useState(sidebarColor);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setSidebarColor(newColor);
  };

  const isCustomColor = !PRESETS.some((preset) => preset.value === sidebarColor);

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Menü Teması</h3>

      <div className="grid grid-cols-6 gap-3 mb-4">
        {PRESETS.map((color) => (
          <button
            key={color.value}
            onClick={() => setSidebarColor(color.value)}
            className="flex flex-col items-center gap-1.5 group"
            title={color.name}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg ring-2 ring-slate-200 group-hover:ring-slate-300"
              style={{ backgroundColor: color.value }}
            >
              {sidebarColor === color.value && <Check size={16} className="text-white drop-shadow" />}
            </div>
            <span className="text-[9px] text-slate-500 font-medium text-center leading-tight max-w-[60px]">
              {color.name}
            </span>
          </button>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-200">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Pipette size={14} />
          <span>Özel Renk Seç</span>
        </button>

        {showCustom && (
          <div className="mt-3 flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="w-16 h-10 rounded-lg cursor-pointer border-2 border-slate-200"
            />
            <div className="flex-1">
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    setSidebarColor(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isCustomColor && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <Check size={14} className="text-green-600" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
