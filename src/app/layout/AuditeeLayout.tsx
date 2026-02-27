import { Link, useNavigate, Outlet } from 'react-router-dom';
import {
  Shield, ClipboardList, Upload, Clock,
  LogOut, User, ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/shared/stores/ui-store';

export function AuditeeLayout() {
  const navigate = useNavigate();
  const { setAuditeeMode } = useUIStore();

  const handleExit = () => {
    setAuditeeMode(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b-2 border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800">Sentinel GRC</span>
              <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                Denetlenen Portali
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink to="/auditee" icon={ClipboardList} label="Yapilacaklarim" />
            <NavLink to="/auditee/upload" icon={Upload} label="Kanit Yukle" />
            <NavLink to="/auditee/extensions" icon={Clock} label="Sure Uzatimi" />
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <p className="text-xs font-bold text-slate-700">Sube Muduru</p>
              <p className="text-[10px] text-slate-500">Denetlenen Gorunumu</p>
            </div>
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Denetci Moduna Don
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
