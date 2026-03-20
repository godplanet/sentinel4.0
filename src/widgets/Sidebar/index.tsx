import { usePersonaStore, type PersonaRole } from '@/entities/user/model/persona-store';
import { useUserProfiles } from '@/features/auth/api';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import {
  sentinelBrainItem,
  standardNavItems,
  type NavigationItem,
} from '@/shared/config/navigation';
import { getContrastYIQ } from '@/shared/lib/utils';
import { useUIStore } from '@/shared/stores/ui-store';
import { LanguageSwitcher } from '@/shared/ui';
import clsx from 'clsx';
import {
  Bell,
  Brain,
  Building,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  LogOut,
  Package,
  Shield,
  Sparkles,
  User,
  UserCog,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

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

export const Sidebar = () => {
  const { t: _t } = useTranslation();
  const { isSidebarOpen, toggleSidebar, environment, sidebarColor } = useUIStore();
  const { chatOpen, setChatOpen } = useChatStore();
  const { currentPersona, setPersona, getCurrentPersonaConfig, activeProfile, isPathAllowed } = usePersonaStore();
  const { data: profiles = [], isLoading: isLoadingProfiles } = useUserProfiles();
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  void currentPersona;

  const persona = getCurrentPersonaConfig();
  const displayName = persona.name;
  const displayTitle = persona.title;
  const initials = getInitials(persona.name);

  const isLightBg = getContrastYIQ(sidebarColor) === 'light';
  const textMain = isLightBg ? 'text-slate-800' : 'text-slate-100';
  const textMuted = isLightBg ? 'text-slate-600' : 'text-slate-300';
  const textActive = isLightBg ? 'text-slate-900' : 'text-white';
  const bgHover = isLightBg ? 'hover:bg-black/5' : 'hover:bg-surface/5';
  const bgActive = isLightBg ? 'bg-black/10 shadow-sm ring-1 ring-black/5' : 'bg-surface/15 shadow-sm ring-1 ring-white/10';
  const borderInner = isLightBg ? 'border-black/10' : 'border-white/10';
  const iconMuted = isLightBg ? 'text-slate-700' : 'text-slate-400';

  const toggleModule = (moduleId: string) => {
    if (!isSidebarOpen) return;
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const isModuleActive = (module: NavigationItem): boolean => {
    if (module.path && location.pathname === module.path) return true;
    if (module.children) {
      return module.children.some(
        (child) => child.path &&
          (location.pathname === child.path || location.pathname.startsWith(child.path + '/'))
      );
    }
    return false;
  };

  const isSubmenuActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    const allItems = [...standardNavItems, ...(sentinelBrainItem ? [sentinelBrainItem] : [])];
    const active = allItems.find(
      (m) => m.children &&
        m.children.some((item) =>
          item.path && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))
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

  const filteredStandard = (standardNavItems || []).filter((module) => {
    if (!module.path && !module.children) return true;
    if (module.path && !isPathAllowed(module.path)) return false;
    if (module.children) {
      return module.children.some((child) => child.path && isPathAllowed(child.path));
    }
    return true;
  });

  const renderNavModule = (module: NavigationItem, isBrainSection = false) => {
    const isExpanded = expandedModule === module.id;
    const isActive = isModuleActive(module);
    const Icon = module.icon;

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
            {isSidebarOpen && <span className="tracking-wide uppercase leading-tight break-words">{module.label}</span>}
          </div>
          {isSidebarOpen && module.badge && (
            <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', getBadgeColors(module.badgeColor))}>
              {module.badge}
            </span>
          )}
        </Link>
      );
    }

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
                  isBrainSection && 'drop-shadow-[0_0_8px_rgba(99,102,241,0.9)]'
                )}
              />
            )}
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <span className="tracking-wide uppercase leading-tight break-words">{module.label}</span>
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
              isBrainSection ? 'border-l-2 border-indigo-500/30' : `border-l-2 ${borderInner}`
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
                          : 'text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-800'
                        : isSubActive
                          ? `${isLightBg ? 'bg-black/10' : 'bg-surface/20'} ${textActive} shadow-sm`
                          : `${iconMuted} ${bgHover} hover:${textActive}`
                    )}
                  >
                    {SubIcon && <SubIcon size={12} className="shrink-0" />}
                    <span className="flex-1 break-words leading-tight">{subItem.label}</span>
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
      {/* ── Dropdowns (always rendered, fixed positioned to sidebar's right) ── */}
      {showPersonaMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPersonaMenu(false)} />
          <div
            className="fixed top-14 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden max-h-96 overflow-y-auto w-64"
            style={{ left: isSidebarOpen ? 208 : 64 }}
          >
            <div className="px-4 py-2 bg-surface/5 border-b border-white/10">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Rol Simülasyonu</div>
            </div>
            {profiles.length === 0 && isLoadingProfiles ? (
              <div className="px-4 py-5 text-sm text-slate-400 text-center animate-pulse">Profiller yükleniyor...</div>
            ) : profiles.length === 0 ? (
              <div className="px-4 py-5 text-sm text-red-400 text-center font-semibold">Profil Bulunamadı</div>
            ) : (profiles || []).map((profile) => {
              let mappedRole: PersonaRole = 'AUDITOR';
              if (profile.role === 'admin' || profile.role === 'cae') mappedRole = 'CAE';
              else if (profile.role === 'auditor') mappedRole = 'AUDITOR';
              else if (profile.role === 'executive' || profile.role === 'gmy') mappedRole = 'EXECUTIVE';
              else if (profile.role === 'auditee') mappedRole = 'AUDITEE';
              else if (profile.role === 'guest' || profile.role === 'vendor' || profile.role === 'supplier') mappedRole = 'SUPPLIER';
              const RoleIcon = getPersonaIcon(mappedRole);
              const isActive = activeProfile ? activeProfile.id === profile.id : currentPersona === mappedRole;
              return (
                <button
                  key={profile.id}
                  onClick={() => {
                    const targetRoute = mappedRole === 'AUDITEE' ? '/auditee' : '/dashboard';
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
                    isActive ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-500' : 'text-white hover:bg-surface/10'
                  )}
                >
                  <RoleIcon size={18} className={getPersonaColor(mappedRole)} />
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
          <div
            className="fixed top-14 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden w-48"
            style={{ left: isSidebarOpen ? 208 : 64 }}
          >
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
              onClick={() => { localStorage.removeItem('sentinel_user'); navigate('/login'); setShowUserMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </>
      )}

      {/* ── Logo / User ───────────────────────────────────────────────────────── */}
      <div className={clsx('shrink-0 border-b bg-black/5 backdrop-blur-sm', borderInner)}>
        {isSidebarOpen ? (
          <div className="h-14 flex items-center px-2 gap-1.5">
            {/* Logo */}
            <button
              onClick={toggleSidebar}
              className="shrink-0 rounded-lg hover:opacity-80 transition-opacity"
              title="Menüyü Kapat"
            >
              <img
                src={import.meta.env.BASE_URL + 'logo.png'}
                alt="V-Sentinel"
                className="w-10 h-10 rounded-lg object-contain"
              />
            </button>

            {/* Env badge */}
            {environment !== 'PROD' && (
              <span className={clsx(
                'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-black/20',
                environment === 'UAT' ? 'bg-amber-500 text-slate-900' : 'bg-rose-500 text-white'
              )}>
                <span className={clsx('w-1 h-1 rounded-full mr-1', environment === 'UAT' ? 'bg-slate-900' : 'bg-white')} />
                {environment === 'UAT' ? 'TEST' : environment}
              </span>
            )}

            <div className="flex-1" />

            {/* User button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={clsx('flex items-center gap-1 p-1 rounded-lg transition-colors shrink-0', bgHover)}
              title={displayName}
            >
              <div className="flex flex-col items-end leading-tight">
                <span className={clsx('text-[10px] font-bold truncate max-w-[60px]', textActive)}>{displayName}</span>
                <span className={clsx('text-[8px] truncate max-w-[60px] opacity-70', textMuted)}>{displayTitle}</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm shrink-0">
                <span className="text-[9px] font-bold text-white">{initials}</span>
              </div>
            </button>
          </div>
        ) : (
          /* ── Collapsed: logo + user avatar ── */
          <div className="h-14 flex flex-col items-center justify-center gap-1">
            <button
              onClick={toggleSidebar}
              className="rounded-lg hover:opacity-80 transition-opacity"
              title="Menüyü Aç"
            >
              <img
                src={import.meta.env.BASE_URL + 'logo.png'}
                alt="V-Sentinel"
                className="w-9 h-9 rounded-lg object-contain"
              />
            </button>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={clsx('p-0.5 rounded-full transition-colors', bgHover)}
              title={displayName}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{initials}</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ── Navigasyon ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {(filteredStandard || []).map((module) => renderNavModule(module, false))}
        {sentinelBrainItem && renderNavModule(sentinelBrainItem as NavigationItem, false)}
      </nav>

      {/* ── Alt Araçlar: Asistan + Dil ───────────────────────────────── */}
      <div className={clsx('shrink-0 border-t px-2 py-2 space-y-1 bg-black/5', borderInner)}>
        {/* AI Asistan */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={clsx(
            'relative overflow-hidden flex items-center gap-1.5 w-full rounded-lg transition-all',
            isSidebarOpen ? 'px-2.5 py-2 justify-start' : 'px-0 py-2 justify-center',
            'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
            chatOpen
              ? 'shadow-[0_0_14px_rgba(124,58,237,0.6)]'
              : 'shadow-[0_0_8px_rgba(124,58,237,0.3)] hover:shadow-[0_0_16px_rgba(124,58,237,0.5)]'
          )}
          title="Sentinel Asistan"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 hover:opacity-100 transition-opacity" />
          <Brain className="relative text-white shrink-0" size={14} />
          {isSidebarOpen && (
            <>
              <span className="relative text-[10px] font-black text-white tracking-tight flex-1 text-left">Asistan</span>
              <Sparkles size={11} className="relative text-yellow-300 animate-pulse shrink-0" />
            </>
          )}
        </button>

        {/* Dil + Bildirim + Version */}
        <div className={clsx('flex items-center gap-1', isSidebarOpen ? 'justify-start' : 'flex-col justify-center')}>
          <LanguageSwitcher />
          <button
            className={clsx('relative p-1.5 rounded-lg transition-colors shrink-0', bgHover)}
            title="Bildirimler"
          >
            <Bell size={14} className={textMuted} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>
          {isSidebarOpen && (
            <span className={clsx('text-[8px] font-mono opacity-50 ml-auto', textMuted)}>version 4.0</span>
          )}
        </div>
      </div>
    </aside>
  );
};
