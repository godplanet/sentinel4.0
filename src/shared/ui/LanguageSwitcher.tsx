import clsx from 'clsx';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
 className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
 title="Change Language"
 >
 <Languages size={14} className="text-slate-500" />
 <span className="text-sm">{currentLanguage.flag}</span>
 
 </button>

 {isOpen && (
 <>
 <div
 className="fixed inset-0 z-40"
 onClick={() => setIsOpen(false)}
 />
 <div className="absolute right-0 mt-2 w-36 bg-surface/95 backdrop-blur-xl rounded-xl border-2 border-indigo-200 shadow-xl z-50 overflow-hidden">
 {languages.map((lang) => (
 <button
 key={lang.code}
 onClick={() => changeLanguage(lang.code)}
 className={clsx(
 "w-full flex items-center gap-2 px-3 py-2 transition-all",
 i18n.language === lang.code
 ? "bg-indigo-50 text-indigo-700 font-semibold"
 : "text-slate-700 hover:bg-canvas"
 )}
 >
 <span className="text-base">{lang.flag}</span>
 <div className="flex-1 text-left">
 <div className="text-xs font-medium">{lang.label}</div>
 <div className="text-[10px] text-slate-500 uppercase">{lang.code}</div>
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
