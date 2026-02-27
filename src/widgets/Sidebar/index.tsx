import { useState, useEffect } from 'react';
import { useUIStore } from '@/shared/stores/ui-store';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import { usePersonaStore, PERSONAS, type PersonaRole } from '@/entities/user/model/persona-store';
import { getEnvClasses } from '@/shared/lib/theme';
import { navigationConfig, type NavigationItem } from '@/shared/config/navigation';
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
  const { isSidebarOpen, environment, sidebarColor, setAuditeeMode } = useUIStore();
  const { setChatOpen } = useChatStore();
  const { currentPersona, setPersona, isPathAllowed, getCurrentPersonaConfig } = usePersonaStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<string | null>('dashboard');
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
    if (module.path && location.pathname === module.path) {
      return true;
    }
    if (module.children) {
      return module.children.some((child) =>
        child.path && (
          location.pathname === child.path ||
          location.pathname.startsWith(child.path + '/')
        )
      );
    }
    return false;
  };

  const isSubmenuActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  useEffect(() => {
    const active = navigationConfig.find((m) =>
      m.children && m.children.some((item) =>
        item.path && (
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/')
        )
      )
    );
    if (active) {
      setExpandedModule(active.id);
    } else {
      const directMatch = navigationConfig.find((m) => m.path === location.pathname);
      if (directMatch) {
        setExpandedModule(null);
      }
    }
  }, [location.pathname]);

  const getBadgeColors = (color?: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'emerald':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-amber-500 text-white';
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

  // YENİ EKLENDİ: Rol değiştiğinde doğru adrese yönlendirme (Routing)
  const handlePersonaSwitch = (role: PersonaRole) => {
    setPersona(role);
    setShowPersonaMenu(false);
    setShowUserMenu(false);
    
    if (role === 'AUDITEE') {
        navigate('/auditee');
    } else {
        navigate('/dashboard');
    }
  };

  // Filter navigation based on persona
  const filteredNavigation = navigationConfig.filter(module => {
    if (!module.path && !module.children) return true;
    if (module.path && !isPathAllowed(module.path)) return false;
    if (module.children) {
      const hasAllowedChildren = module.children.some(child =>
        child.path && isPathAllowed(child.path)
      );
      return hasAllowedChildren;
    }
    return true;
  });

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen flex flex-col border-r transition-all duration-300 z-50 text-slate-100 border-slate-700/30 shadow-xl print:hidden',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
      style={{ backgroundColor: sidebarColor }}
    >
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 bg-black/10 backdrop-blur-sm">
        <div className="min-w-[32px] h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md shadow-lg ring-1 ring-white/20">
          <ShieldCheck className="w-5 h-5 text-white drop-shadow-md" />
        </div>
        {isSidebarOpen && (
          <div className="ml-3 fade-in overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-lg tracking-tight drop-shadow-md">SENTINEL</h1>
            <div className="text-[9px] uppercase tracking-widest opacity-80 font-mono drop-shadow-sm">
              {t('common.version')}3.0 {environment}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {filteredNavigation.map((module) => {
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
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-bold text-xs transition-all',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  isSidebarOpen ? 'justify-between' : 'justify-center'
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon size={18} className="shrink-0" />}
                  {isSidebarOpen && <span className="tracking-wide uppercase">{module.label}</span>}
                </div>
                {isSidebarOpen && module.badge && (
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded text-[9px] font-bold',
                    getBadgeColors(module.badgeColor)
                  )}>
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
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-bold text-xs transition-all',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  isSidebarOpen ? 'justify-between' : 'justify-center'
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon size={18} className="shrink-0" />}
                  {isSidebarOpen && (
                    <div className="flex items-center gap-2">
                      <span className="tracking-wide uppercase">{module.label}</span>
                      {module.badge && (
                        <span className={clsx(
                          'px-1.5 py-0.5 rounded text-[9px] font-bold',
                          getBadgeColors(module.badgeColor)
                        )}>
                          {module.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isSidebarOpen &&
                  (isExpanded ? (
                    <ChevronDown size={16} className="shrink-0 opacity-60" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 opacity-60" />
                  ))}
              </button>

              {isSidebarOpen && isExpanded && module.children && (
                <div className="ml-3 pl-3 border-l-2 border-white/10 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {module.children.filter(child => !child.path || isPathAllowed(child.path)).map((subItem) => {
                    if (!subItem.path) return null;
                    const isSubActive = isSubmenuActive(subItem.path);
                    const SubIcon = subItem.icon;

                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all',
                          isSubActive
                            ? 'bg-white/20 text-white shadow-sm'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        )}
                      >
                        {SubIcon && <SubIcon size={14} className="shrink-0" />}
                        <span className="flex-1 truncate">{subItem.label}</span>
                        {subItem.badge && (
                          <span className={clsx(
                            'px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0',
                            getBadgeColors(subItem.badgeColor)
                          )}>
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
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-3">
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
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 animate-pulse" />
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

        <div className="relative">
          {showPersonaMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowPersonaMenu(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10">
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
                          : 'text-white hover:bg-white/10'
                      )}
                    >
                      <Icon size={18} className={getPersonaColor(role)} />
                      <div className="flex-1">
                        <div className="font-semibold">{persona.name}</div>
                        <div className="text-xs opacity-70">{persona.title}</div>
                      </div>
                      {isActive && (
                        <CheckCircle className="text-blue-500" size={16} />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden">
                <button
                  onClick={() => {
                    navigate('/resources/profiles');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <User size={16} />
                  <span>Profilim</span>
                </button>
                <div className="border-t border-white/10" />
                <button
                  onClick={() => {
                    setShowPersonaMenu(true);
                    setShowUserMenu(false);
                  }}
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
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors group"
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