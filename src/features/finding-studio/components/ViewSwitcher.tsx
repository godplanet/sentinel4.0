import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, BookOpen, Layers } from 'lucide-react';
import clsx from 'clsx';

export function ViewSwitcher({ findingId }: { findingId: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Aktif modu URL'den anla
  const isZen = location.pathname.includes('/zen/');
  const isStudio = location.pathname.includes('/studio');
  const isForm = !isZen && !isStudio; // Varsayılan

  return (
    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
      <button
        onClick={() => navigate(`/execution/findings/${findingId}`)}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
          isForm ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
        )}
        title="Form Görünümü (Varsayılan)"
      >
        <Layout size={14} /> Form
      </button>

      <button
        onClick={() => navigate(`/execution/findings/zen/${findingId}`)}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
          isZen ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
        )}
        title="Zen Okuma Modu"
      >
        <BookOpen size={14} /> Zen
      </button>

      <button
        onClick={() => navigate(`/execution/findings/${findingId}/studio`)}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
          isStudio ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
        )}
        title="Studio (Süreç Yönetimi)"
      >
        <Layers size={14} /> Studio
      </button>
    </div>
  );
}