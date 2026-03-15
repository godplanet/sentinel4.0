import { usePersonaStore, type PersonaRole } from '@/entities/user/model/persona-store';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import { useUserProfiles } from '@/features/auth/api';
import toast from 'react-hot-toast';
import {
 sentinelBrainItem,
 standardNavItems,
 type NavigationItem,
} from '@/shared/config/navigation';
import { getContrastYIQ } from '@/shared/lib/utils';
import { useUIStore } from '@/shared/stores/ui-store';
import clsx from 'clsx';
import {
 Brain,
 Building,
 CheckCircle,
 ChevronDown,
 ChevronRight,
 Eye,
 LogOut,
 Package,
 Shield,
 ShieldCheck,
 Sparkles,
 User,
 UserCog,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface UserData {
 name: string;
 role: string;
 title: string;
}

export const Sidebar = () => {
 const { t } = useTranslation();
 const { isSidebarOpen, environment, sidebarColor } = useUIStore();
 const { chatOpen, setChatOpen } = useChatStore();
  const { currentPersona, setPersona, isPathAllowed, getCurrentPersonaConfig, activeProfile } = usePersonaStore();
  const { data: profiles = [], isLoading: isLoadingProfiles } = useUserProfiles();
 const location = useLocation();
 const navigate = useNavigate();
 const [expandedModule, setExpandedModule] = useState<string | null>(null);
 const [showUserMenu, setShowUserMenu] = useState(false);
 const [showPersonaMenu, setShowPersonaMenu] = useState(false);
 const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const config = getCurrentPersonaConfig();
    setUserData({
      name: config.name,
      role: config.title,
      title: config.title,
    });
  }, [currentPersona, getCurrentPersonaConfig, activeProfile]);

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
 'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all',
 isActive
 ? `${bgActive} ${textActive}`
 : `${textMuted} ${bgHover} hover:${textActive}`,
 isSidebarOpen ? 'justify-between' : 'justify-center'
 )}
 >
 <div className="flex items-center gap-3">
 {Icon && <Icon size={18} className="shrink-0" />}
 {isSidebarOpen && <span className="tracking-wide uppercase truncate max-w-[120px]">{module.label}</span>}
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
 'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all duration-200',
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
 <span className="tracking-wide uppercase truncate max-w-[120px]">{module.label}</span>
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
 ? <ChevronDown size={16} className="shrink-0 opacity-60" />
 : <ChevronRight size={16} className="shrink-0 opacity-60" />
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
 'flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-medium transition-all',
  isBrainSection
  ? isSubActive
  ? 'bg-indigo-500/20 text-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/25 backdrop-blur-sm'
  : 'text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-800 hover:shadow-[0_0_8px_rgba(99,102,241,0.2)]'
  : isSubActive
  ? `${isLightBg ? 'bg-black/10' : 'bg-surface/20'} ${textActive} shadow-sm`
  : `${iconMuted} ${bgHover} hover:${textActive}`
  )}
 >
 {SubIcon && <SubIcon size={14} className="shrink-0" />}
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
  'fixed left-0 top-0 h-screen flex flex-col border-r transition-all duration-300 z-50 border-slate-700/30 shadow-xl print:hidden',
  isSidebarOpen ? 'w-52' : 'w-16',
  textMain
  )}
  style={{ backgroundColor: sidebarColor }}
  >
  {/* ── Logo / Başlık + Ortam Rozeti ───────────────────────────────── */}
  <div className={clsx("h-12 flex items-center px-4 border-b shrink-0 bg-black/5 backdrop-blur-sm", borderInner)}>
  <div className="min-w-[32px] h-8 rounded-lg bg-surface/20 flex items-center justify-center backdrop-blur-md shadow-lg ring-1 ring-black/10">
  <ShieldCheck className={clsx("w-4 h-4 drop-shadow-md", textLogo)} />
  </div>
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
 <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
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

  {/* ── Sentinel Asistan Butonu + Kullanıcı Menüsü ───────────────── */}
  <div className={clsx("border-t p-2 space-y-2 shrink-0", borderInner)}>
  {/* Sentinel AI Chat butonu */}
 <button
 onClick={() => setChatOpen(!chatOpen)}
 className={clsx(
 'w-full relative overflow-hidden rounded-xl p-2 transition-all hover:scale-105 group',
 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
 'shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:shadow-[0_0_30px_rgba(124,58,237,0.8)]'
 )}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
 <div className="relative flex items-center justify-center gap-3">
 <div className="relative">
 <div className="absolute inset-0 bg-surface rounded-full blur-md opacity-50 animate-pulse" />
 <Brain className="relative text-white" size={14} />
 </div>
 {isSidebarOpen && (
 <div className="flex-1 text-left">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-[10px] font-black text-white tracking-tight">Sentinel Asistan</span>
 <Sparkles size={14} className="text-yellow-300 animate-pulse" />
 </div>
 <div className="text-[9px] text-white/80 font-medium uppercase tracking-wider">Zeka Çekirdeği</div>
 </div>
 )}
 </div>
 <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none" />
 </button>

 {/* Kullanıcı & Persona Menüsü */}
 <div className="relative">
 {showPersonaMenu && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setShowPersonaMenu(false)} />
 <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
 <div className="px-4 py-2 bg-surface/5 border-b border-white/10">
 <div className="text-xs font-bold text-white uppercase tracking-wider">Rol Simülasyonu</div>
 </div>
                  {profiles.length === 0 && isLoadingProfiles ? (
                    <div className="px-4 py-8 text-sm text-slate-400 text-center animate-pulse">Profiller yükleniyor...</div>
                  ) : profiles.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-red-400 text-center">
                      <div className="font-semibold mb-1">Profil Bulunamadı</div>
                      <div className="text-xs opacity-80">Veritabanına bağlanılamadı veya RLS hatası. Sadece aktif kullanıcı görüntüleniyor.</div>
                      <button
                        onClick={() => {
                          const me = { id: 'me', full_name: userData?.name || 'Mevcut Kullanıcı', title: userData?.role || 'Kullanıcı', role: 'auditor' };
                          setPersona('AUDITOR', me as any);
                          setShowPersonaMenu(false);
                          setShowUserMenu(false);
                        }}
                        className="mt-3 px-3 py-1.5 bg-surface/20 hover:bg-surface/30 rounded text-xs text-white transition-colors"
                      >
                        Mevcut Kullanıcıyla Devam Et
                      </button>
                    </div>
                  ) : (profiles || []).map((profile) => {
                    let mappedRole: PersonaRole = 'AUDITOR';
                    if (profile.role === 'admin' || profile.role === 'cae') mappedRole = 'CAE';
                    else if (profile.role === 'auditor') mappedRole = 'AUDITOR';
                    else if (profile.role === 'executive' || profile.role === 'gmy') mappedRole = 'EXECUTIVE';
                    else if (profile.role === 'auditee') mappedRole = 'AUDITEE';
                    else if (profile.role === 'guest' || profile.role === 'vendor' || profile.role === 'supplier') mappedRole = 'SUPPLIER';

                    const Icon = getPersonaIcon(mappedRole);
                    const isActive = activeProfile ? activeProfile.id === profile.id : currentPersona === mappedRole;

                    return (
                      <button
                        key={profile.id}
                        onClick={() => {
                          const targetRoute = mappedRole === 'AUDITEE' ? '/auditee' : '/dashboard';
                          // Önce güvenli bir rotaya git, sonra rolü değiştir (Race condition/403 önlemi)
                          navigate(targetRoute, { replace: true });
                          
                          setTimeout(() => {
                            setPersona(mappedRole, profile);
                            toast.success(`Aktif Rol Değiştirildi: ${profile.full_name} - ${profile.title}`);
                          }, 50);

                          setShowPersonaMenu(false);
                          setShowUserMenu(false);
                        }}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-500'
                            : 'text-white hover:bg-surface/10'
                        )}
                      >
                        <Icon size={18} className={getPersonaColor(mappedRole)} />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-semibold truncate">{profile.full_name}</div>
                          <div className="text-xs opacity-70 truncate">{profile.title}</div>
                        </div>
                        {isActive && <CheckCircle className="text-blue-500 shrink-0" size={16} />}
                      </button>
                    );
                  })}
 </div>
 </>
 )}

 {showUserMenu && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
 <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden">
 <button
 onClick={() => { navigate('/resources/profiles'); setShowUserMenu(false); }}
 className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-surface/10 transition-colors"
 >
 <User size={16} />
 <span>Profilim</span>
 </button>
 <div className="border-t border-white/10" />
 <button
 onClick={() => { setShowPersonaMenu(true); setShowUserMenu(false); }}
 className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-purple-300 hover:bg-purple-500/10 transition-colors"
 >
 <UserCog size={16} />
 <span>Rol Değiştir</span>
 </button>
 <div className="border-t border-white/10" />
 <button
 onClick={() => {
 localStorage.removeItem('sentinel_user');
 navigate('/login');
 setShowUserMenu(false);
 }}
 className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
 >
 <LogOut size={16} />
 <span>Çıkış Yap</span>
 </button>
 </div>
 </>
 )}

  <button
  onClick={() => setShowUserMenu(!showUserMenu)}
  className={clsx("flex items-center gap-2 w-full p-2 rounded-lg transition-colors group", bgHover)}
  >
 <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
 <User size={14} className="text-white" />
 </div>
  {isSidebarOpen && (
  <div className="flex-1 text-left overflow-hidden">
  <div className={clsx("font-semibold text-[11px] truncate", textMain)}>
  {userData?.name || 'Sentinel Kullanıcısı'}
  </div>
  <div className={clsx("text-[9px] truncate uppercase tracking-wider", textMuted)}>
  {userData?.role || 'Kıdemli Müfettiş'}
  </div>
 </div>
 )}
 </button>
 </div>
 </div>
 </aside>
 );
};
