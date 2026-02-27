import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 hover:bg-white border border-slate-200 hover:border-indigo-300 transition-all backdrop-blur-xl shadow-sm hover:shadow-md"
        title="Change Language"
      >
        <Languages size={18} className="text-slate-600" />
        <span className="text-sm font-medium text-slate-700">{currentLanguage.flag}</span>
        <span className="text-xs font-semibold text-slate-600 uppercase">{currentLanguage.code}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl border-2 border-indigo-200 shadow-xl z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 transition-all",
                  i18n.language === lang.code
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{lang.label}</div>
                  <div className="text-xs text-slate-500 uppercase">{lang.code}</div>
                </div>
                {i18n.language === lang.code && (
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
