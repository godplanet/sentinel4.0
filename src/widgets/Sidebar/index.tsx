import { usePersonaStore, type PersonaRole } from '@/entities/user/model/persona-store';
import {
 sentinelBrainItem,
 standardNavItems,
 type NavigationItem,
} from '@/shared/config/navigation';
import { getContrastYIQ } from '@/shared/lib/utils';
import { useUIStore } from '@/shared/stores/ui-store';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Sidebar = () => {
 const { t } = useTranslation();
 const { isSidebarOpen, environment, sidebarColor } = useUIStore();
 const { chatOpen, setChatOpen } = useChatStore();
  const { isPathAllowed } = usePersonaStore();
 const location = useLocation();
 const navigate = useNavigate();
 const [expandedModule, setExpandedModule] = useState<string | null>(null);


  const isLightBg = getContrastYIQ(sidebarColor) === 'light';
  const textMain = isLightBg ? 'text-slate-800' : 'text-slate-100';
  const textMuted = isLightBg ? 'text-slate-600' : 'text-slate-300';
  const textActive = isLightBg ? 'text-slate-900' : 'text-white';
  const bgHover = isLightBg ? 'hover:bg-black/5' : 'hover:bg-surface/5';
  const bgActive = isLightBg ? 'bg-black/10 shadow-sm ring-1 ring-black/5' : 'bg-surface/15 shadow-sm ring-1 ring-white/10';
  const borderInner = isLightBg ? 'border-black/10' : 'border-white/10';
  const iconMuted = isLightBg ? 'text-slate-700' : 'text-slate-400';
  const textLogo = isLightBg ? 'text-slate-900' : 'text-white';

 const toggleModule = (moduleId: string) => {
 if (!isSidebarOpen) return;
 setExpandedModule(expandedModule === moduleId ? null : moduleId);
 };

 const isModuleActive = (module: NavigationItem): boolean => {
 if (module.path && location.pathname === module.path) return true;
 if (module.children) {
 return module.children.some(
 (child) =>
 child.path &&
 (location.pathname === child.path || location.pathname.startsWith(child.path + '/'))
 );
 }
 return false;
 };

 const isSubmenuActive = (path: string) =>
 location.pathname === path || location.pathname.startsWith(path + '/');

 // Sayfa değiştiğinde ilgili modülü otomatik aç
 useEffect(() => {
 const allItems = [...standardNavItems, ...(sentinelBrainItem ? [sentinelBrainItem] : [])];
 const active = allItems.find(
 (m) =>
 m.children &&
 m.children.some(
 (item) =>
 item.path &&
 (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))
 )
 );
 if (active) {
 setExpandedModule(active.id);
 } else {
 const directMatch = allItems.find((m) => m.path === location.pathname);
 if (directMatch) setExpandedModule(null);
 }
 }, [location.pathname]);

 const getBadgeColors = (color?: string) => {
 switch (color) {
 case 'red': return 'bg-red-500 text-white';
 case 'blue': return 'bg-blue-500 text-white';
 case 'green': return 'bg-green-500 text-white';
 case 'purple': return 'bg-purple-500 text-white';
 case 'emerald': return 'bg-emerald-500 text-white';
 default: return 'bg-amber-500 text-white';
 }
 };

 const getPersonaIcon = (role: PersonaRole) => {
 switch (role) {
 case 'CAE': return Shield;
 case 'AUDITOR': return UserCog;
 case 'EXECUTIVE': return Eye;
 case 'AUDITEE': return Building;
 case 'SUPPLIER': return Package;
 default: return User;
 }
 };

 const getPersonaColor = (role: PersonaRole) => {
 switch (role) {
 case 'CAE': return 'text-purple-400';
 case 'AUDITOR': return 'text-blue-400';
  case 'EXECUTIVE': return 'text-amber-400';
  case 'AUDITEE': return 'text-green-400';
  case 'SUPPLIER': return 'text-orange-400';
  default: return 'text-slate-400';
  }
  };
 // Standart menü öğelerini persona bazlı filtrele
 const filteredStandard = (standardNavItems || []).filter((module) => {
 if (!module.path && !module.children) return true;
 if (module.path && !isPathAllowed(module.path)) return false;
 if (module.children) {
 return module.children.some((child) => child.path && isPathAllowed(child.path));
 }
 return true;
 });

 // ─── Menü öğesi render yardımcısı ──────────────────────────────────────────
 const renderNavModule = (module: NavigationItem, isBrainSection = false) => {
 const isExpanded = expandedModule === module.id;
 const isActive = isModuleActive(module);
 const Icon = module.icon;

 // Direkt link (children yok)
 if (!module.children) {
 return (
 <Link
 key={module.id}
 to={module.path || '/'}
 title={module.label}
 className={clsx(
 'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg font-bold text-[9px] transition-all',
 isActive
 ? `${bgActive} ${textActive}`
 : `${textMuted} ${bgHover} hover:${textActive}`,
 isSidebarOpen ? 'justify-between' : 'justify-center'
 )}
 >
 <div className="flex items-center gap-3">
 {Icon && <Icon size={14} className="shrink-0" />}
 {isSidebarOpen && <span className="tracking-wide uppercase truncate max-w-[110px]">{module.label}</span>}
 </div>
 {isSidebarOpen && module.badge && (
 <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', getBadgeColors(module.badgeColor))}>
 {module.badge}
 </span>
 )}
 </Link>
 );
 }

 // Grup (children var)
 return (
 <div key={module.id} className="space-y-1">
 <button
 onClick={() => toggleModule(module.id)}
 title={module.label}
 className={clsx(
 'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg font-bold text-[9px] transition-all duration-200',
  isBrainSection
  ? isActive
  ? 'bg-indigo-500/25 text-indigo-700 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/40 backdrop-blur-sm'
  : 'text-indigo-600 hover:bg-indigo-500/15 hover:text-indigo-800 hover:shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:ring-1 hover:ring-indigo-500/20'
  : isActive
  ? `${bgActive} ${textActive}`
  : `${textMuted} ${bgHover} hover:${textActive}`,
 isSidebarOpen ? 'justify-between' : 'justify-center'
 )}
 >
 <div className="flex items-center gap-3">
 {Icon && (
 <Icon
 size={18}
 className={clsx(
 'shrink-0 transition-all duration-200',
 isBrainSection && 'drop-shadow-[0_0_8px_rgba(99,102,241,0.9)] group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,1)]'
 )}
 />
 )}
 {isSidebarOpen && (
 <div className="flex items-center gap-2">
 <span className="tracking-wide uppercase truncate max-w-[110px]">{module.label}</span>
 {module.badge && (
 <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', getBadgeColors(module.badgeColor))}>
 {module.badge}
 </span>
 )}
 </div>
 )}
 </div>
 {isSidebarOpen && (
 isExpanded
 ? <ChevronDown size={13} className="shrink-0 opacity-60" />
 : <ChevronRight size={13} className="shrink-0 opacity-60" />
 )}
 </button>

 {isSidebarOpen && isExpanded && module.children && (
  <div
  className={clsx(
  'ml-3 pl-3 space-y-1 animate-in slide-in-from-top-2 duration-200',
  isBrainSection
  ? 'border-l-2 border-indigo-500/30'
  : `border-l-2 ${borderInner}`
  )}
  >
 {module.children
 .filter((child) => !child.path || isPathAllowed(child.path))
 .map((subItem) => {
 if (!subItem.path) return null;
 const isSubActive = isSubmenuActive(subItem.path);
 const SubIcon = subItem.icon;

 return (
 <Link
 key={subItem.path}
 to={subItem.path}
 className={clsx(
 'flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-medium transition-all',
  isBrainSection
  ? isSubActive
  ? 'bg-indigo-500/20 text-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/25 backdrop-blur-sm'
  : 'text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-800 hover:shadow-[0_0_8px_rgba(99,102,241,0.2)]'
  : isSubActive
  ? `${isLightBg ? 'bg-black/10' : 'bg-surface/20'} ${textActive} shadow-sm`
  : `${iconMuted} ${bgHover} hover:${textActive}`
  )}
 >
 {SubIcon && <SubIcon size={12} className="shrink-0" />}
 <span className="flex-1 truncate">{subItem.label}</span>
 {subItem.badge && (
 <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0', getBadgeColors(subItem.badgeColor))}>
 {subItem.badge}
 </span>
 )}
 </Link>
 );
 })}
 </div>
 )}
 </div>
 );
 };

  return (
  <aside
  className={clsx(
  'fixed left-0 top-0 h-screen flex flex-col border-r transition-all duration-300 z-50 border-slate-700/30 shadow-xl print:hidden overflow-x-hidden',
  isSidebarOpen ? 'w-52' : 'w-16',
  textMain
  )}
  style={{ backgroundColor: sidebarColor }}
  >
  {/* ── Logo / Başlık + Ortam Rozeti ───────────────────────────────── */}
  <div className={clsx("h-12 flex items-center px-4 border-b shrink-0 bg-black/5 backdrop-blur-sm", borderInner)}>
  <img src={import.meta.env.BASE_URL + "logo.png"} alt="V-Sentinel" className="w-8 h-8 rounded object-contain shrink-0" />
  {isSidebarOpen && (
  <div className="ml-3 fade-in overflow-hidden flex flex-col gap-1">
  <h1 className={clsx("font-bold text-sm tracking-tight drop-shadow-md", textLogo)}>SENTINEL</h1>
  <div className="flex items-center gap-2">
  {environment !== 'PROD' && (
 <span className={clsx(
 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-black/20',
 environment === 'UAT' && 'bg-amber-500 text-slate-900',
 environment === 'DEV' && 'bg-rose-500 text-white'
 )}>
 <span className={clsx(
 'w-1.5 h-1.5 rounded-full mr-1.5',
 environment === 'UAT' && 'bg-slate-900',
 environment === 'DEV' && 'bg-white'
 )} />
  {environment === 'UAT' ? 'TEST' : environment}
  </span>
  )}
  <span className={clsx("text-[9px] font-mono opacity-80", textMuted)}>{t('common.version')}v 4.0</span>
  </div>
 </div>
 )}
 </div>

 {/* ── Ana Navigasyon (Standart 11 modül) ───────────────────────── */}
 <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
 {(filteredStandard || []).map((module) => renderNavModule(module, false))}
 </nav>

 {/* ── Sentinel Brain Bölümü (12. öğe — Sürekli Denetim & AI) ─── */}
 {sentinelBrainItem && (
 <div className="px-3 pt-1 pb-2 shrink-0">
 {/* Ambient glow backdrop */}



 <div className="relative">
 {renderNavModule(sentinelBrainItem as NavigationItem, false)}
 </div>
 </div>
 )}

  </aside>
  );
};
