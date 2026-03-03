import { useState, useEffect } from 'react';
import { useUIStore } from '@/shared/stores/ui-store';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import { usePersonaStore, PERSONAS, type PersonaRole } from '@/entities/user/model/persona-store';
import {
  standardNavItems,
  sentinelBrainItem,
  type NavigationItem,
} from '@/shared/config/navigation';
import {
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Brain,
  Sparkles,
  User,
  LogOut,
  UserCog,
  Shield,
  Eye,
  Building,
  Package,
  CheckCircle,
  BrainCircuit,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface UserData {
  name: string;
  role: string;
  title: string;
}

export const Sidebar = () => {
  const { t } = useTranslation();
  const { isSidebarOpen, environment, sidebarColor } = useUIStore();
  const { setChatOpen } = useChatStore();
  const { currentPersona, setPersona, isPathAllowed, getCurrentPersonaConfig } = usePersonaStore();
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
  }, [currentPersona, getCurrentPersonaConfig]);

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
      case 'red':     return 'bg-red-500 text-white';
      case 'blue':    return 'bg-blue-500 text-white';
      case 'green':   return 'bg-green-500 text-white';
      case 'purple':  return 'bg-purple-500 text-white';
      case 'emerald': return 'bg-emerald-500 text-white';
      default:        return 'bg-amber-500 text-white';
    }
  };

  const getPersonaIcon = (role: PersonaRole) => {
    switch (role) {
      case 'CAE':      return Shield;
      case 'AUDITOR':  return UserCog;
      case 'EXECUTIVE': return Eye;
      case 'AUDITEE':  return Building;
      case 'SUPPLIER': return Package;
      default:         return User;
    }
  };

  const getPersonaColor = (role: PersonaRole) => {
    switch (role) {
      case 'CAE':      return 'text-purple-400';
      case 'AUDITOR':  return 'text-blue-400';
      case 'EXECUTIVE': return 'text-amber-400';
      case 'AUDITEE':  return 'text-green-400';
      case 'SUPPLIER': return 'text-orange-400';
      default:         return 'text-slate-400';
    }
  };

  const handlePersonaSwitch = (role: PersonaRole) => {
    setPersona(role);
    setShowPersonaMenu(false);
    setShowUserMenu(false);
    navigate(role === 'AUDITEE' ? '/auditee' : '/dashboard');
  };

  // Standart menü öğelerini persona bazlı filtrele
  const filteredStandard = standardNavItems.filter((module) => {
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
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-bold text-xs transition-all',
            isActive
              ? 'bg-surface/15 text-white shadow-sm ring-1 ring-white/10'
              : 'text-slate-300 hover:bg-surface/5 hover:text-white',
            isSidebarOpen ? 'justify-between' : 'justify-center'
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon size={18} className="shrink-0" />}
            {isSidebarOpen && <span className="tracking-wide uppercase">{module.label}</span>}
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
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-bold text-xs transition-all duration-200',
            isBrainSection
              ? isActive
                ? 'bg-indigo-500/25 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/40 backdrop-blur-sm'
                : 'text-indigo-400/90 hover:bg-indigo-500/15 hover:text-indigo-100 hover:shadow-[0_0_18px_rgba(99,102,241,0.35)] hover:ring-1 hover:ring-indigo-500/20'
              : isActive
              ? 'bg-surface/15 text-white shadow-sm ring-1 ring-white/10'
              : 'text-slate-300 hover:bg-surface/5 hover:text-white',
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
                <span className="tracking-wide uppercase">{module.label}</span>
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
                : 'border-l-2 border-white/10'
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
                      'flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all',
                        isBrainSection
                        ? isSubActive
                          ? 'bg-indigo-500/20 text-indigo-100 shadow-[0_0_10px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/25 backdrop-blur-sm'
                          : 'text-indigo-400/70 hover:bg-indigo-500/10 hover:text-indigo-200 hover:shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                        : isSubActive
                        ? 'bg-surface/20 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-surface/5 hover:text-slate-200'
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
        'fixed left-0 top-0 h-screen flex flex-col border-r transition-all duration-300 z-50 text-slate-100 border-slate-700/30 shadow-xl print:hidden',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
      style={{ backgroundColor: sidebarColor }}
    >
      {/* ── Logo / Başlık + Ortam Rozeti ───────────────────────────────── */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 bg-black/10 backdrop-blur-sm">
        <div className="min-w-[32px] h-8 rounded-lg bg-surface/20 flex items-center justify-center backdrop-blur-md shadow-lg ring-1 ring-white/20">
          <ShieldCheck className="w-5 h-5 text-white drop-shadow-md" />
        </div>
        {isSidebarOpen && (
          <div className="ml-3 fade-in overflow-hidden flex flex-col gap-1">
            <h1 className="font-bold text-lg tracking-tight drop-shadow-md">SENTINEL</h1>
            <div className="flex items-center gap-2">
              <span className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-black/20',
                environment === 'PROD' && 'bg-emerald-500/90 text-white',
                environment === 'UAT'  && 'bg-amber-500 text-slate-900',
                environment === 'DEV'  && 'bg-rose-500 text-white'
              )}>
                <span className={clsx(
                  'w-1.5 h-1.5 rounded-full mr-1.5',
                  environment === 'PROD' && 'bg-white',
                  environment === 'UAT'  && 'bg-slate-900',
                  environment === 'DEV'  && 'bg-white'
                )} />
                {environment === 'UAT' ? 'TEST' : environment}
              </span>
              <span className="text-[9px] text-white/60 font-mono">{t('common.version')}3.0</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Ana Navigasyon (Standart 11 modül) ───────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {filteredStandard.map((module) => renderNavModule(module, false))}
      </nav>

      {/* ── Sentinel Brain Bölümü (12. öğe — Sürekli Denetim & AI) ─── */}
      {sentinelBrainItem && (
        <div className="border-t border-indigo-500/20 px-3 pt-3 pb-2 shrink-0 relative">
          {/* Ambient glow backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent pointer-events-none rounded-t-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {isSidebarOpen && (
            <div className="flex items-center gap-2 px-1 mb-2 relative">
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 via-violet-500/30 to-transparent" />
              <div className="flex items-center gap-1.5">
                <BrainCircuit
                  size={10}
                  className="text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,1)]"
                />
                <span className="text-[9px] font-bold text-indigo-300/80 uppercase tracking-[0.2em] whitespace-nowrap">
                  Sentinel AI
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-indigo-500/50 via-violet-500/30 to-transparent" />
            </div>
          )}
          {!isSidebarOpen && (
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 blur-md bg-indigo-500/40 rounded-full animate-pulse" />
                <BrainCircuit
                  size={16}
                  className="relative text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,1)]"
                />
              </div>
            </div>
          )}
          <div className="relative">
            {renderNavModule(sentinelBrainItem, true)}
          </div>
        </div>
      )}

      {/* ── Sentinel Asistan Butonu + Kullanıcı Menüsü ───────────────── */}
      <div className="border-t border-white/10 p-3 space-y-3 shrink-0">
        {/* Sentinel AI Chat butonu */}
        <button
          onClick={() => setChatOpen(true)}
          className={clsx(
            'w-full relative overflow-hidden rounded-xl p-4 transition-all hover:scale-105 group',
            'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
            'shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:shadow-[0_0_30px_rgba(124,58,237,0.8)]'
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-surface rounded-full blur-md opacity-50 animate-pulse" />
              <Brain className="relative text-white" size={24} />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-black text-white tracking-tight">Sentinel Asistan</span>
                  <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                </div>
                <div className="text-[10px] text-white/80 font-medium uppercase tracking-wider">The Oracle</div>
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
                {(Object.keys(PERSONAS) as PersonaRole[]).map((role) => {
                  const persona = PERSONAS[role];
                  const Icon = getPersonaIcon(role);
                  const isActive = currentPersona === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handlePersonaSwitch(role)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                        isActive
                          ? 'bg-blue-500/20 text-blue-300 border-l-4 border-blue-500'
                          : 'text-white hover:bg-surface/10'
                      )}
                    >
                      <Icon size={18} className={getPersonaColor(role)} />
                      <div className="flex-1">
                        <div className="font-semibold">{persona.name}</div>
                        <div className="text-xs opacity-70">{persona.title}</div>
                      </div>
                      {isActive && <CheckCircle className="text-blue-500" size={16} />}
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
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-surface/5 transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
              <User size={18} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 text-left overflow-hidden">
                <div className="font-semibold text-sm text-white truncate">
                  {userData?.name || 'Sentinel User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate uppercase tracking-wider">
                  {userData?.role || 'Senior Auditor'}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
