import { useState } from 'react';
import { Lock, Save, Eye, EyeOff, Lightbulb } from 'lucide-react';
import type { Workpaper } from '@/entities/workpaper/model/types';

interface ScratchpadPanelProps {
  workpaper: Workpaper;
  onSave: (scratchpadContent: string) => void;
}

export const ScratchpadPanel = ({ workpaper, onSave }: ScratchpadPanelProps) => {
  const [content, setContent] = useState(workpaper.auditor_scratchpad || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = content !== (workpaper.auditor_scratchpad || '');

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-300 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 bg-slate-600 rounded-lg shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Akıllı Not Defteri (Scratchpad)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bu alan yalnızca size özeldir. Denetlenen göremez (Blind Mode).
              Risk düşünceleri, brainstorming notları ve çalışma notları için kullanın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBlindMode(!isBlindMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isBlindMode
                ? 'bg-slate-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isBlindMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Blind Mode Aktif
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Görünür Mod
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>GIAS 15.2 uyumlu</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Risk düşüncelerinizi, soru işaretlerinizi, hipotezlerinizi buraya yazın..."
          rows={12}
          className={`w-full px-4 py-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 transition-all ${
            isBlindMode
              ? 'bg-slate-900 text-slate-100 border-slate-700 focus:ring-slate-500 placeholder-slate-500'
              : 'bg-white text-slate-900 border-slate-300 focus:ring-blue-500 placeholder-slate-400'
          }`}
        />
        {isBlindMode && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
              <Lock className="w-3 h-3" />
              <span>Şifreli</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-600">
          {content.length} karakter
          {hasUnsavedChanges && (
            <span className="ml-2 text-amber-600 font-medium">• Kaydedilmemiş değişiklikler</span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>💡 Kullanım İpucu:</strong> Bu alanı serbest düşünmek için kullanın. Şüpheli
          durumlar, test fikirleri, follow-up sorular veya ilginç bulgular. Daha sonra
          resmi çalışma kağıdına dönüştürebilirsiniz.
        </p>
      </div>
    </div>
  );
};
