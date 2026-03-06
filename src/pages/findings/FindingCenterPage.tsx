import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  FileSearch, Plus, Filter, Shield, AlertTriangle, Eye, 
  TrendingUp, LayoutGrid, List, Sparkles, Layers, ChevronRight,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';

// MİMARİ BAĞLANTILAR (FSD Kurallarına Uygun)
import { PageHeader } from '@/shared/ui/PageHeader';
import { FindingKanbanBoard } from '@/features/finding-hub';
import { NewFindingModal } from '@/features/finding-form'; 
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { useParameterStore } from '@/entities/settings/model/parameter-store';

type RiskLevel = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type ViewMode = 'list' | 'kanban';

export default function FindingCenterPage() {
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // === UI State ===
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterRisk, setFilterRisk] = useState<RiskLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFindingModal, setShowNewFindingModal] = useState(false);

  // === SUPER DRAWER STATE (FSD Anayasası: Sayfa yenileme yasak) ===
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // === VERİ YÜKLEME: TanStack React Query (FSD Anayasası: sadece entity API) ===
  const {
    data: findings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['findings', 'all'],
    queryFn: () => comprehensiveFindingApi.getAll(),
  });

  // AŞIRI SAVUNMACI: Hata sessizce yutulmaz — BDDK ciddiyetinde gösterilir
  useEffect(() => {
    if (isError && error) {
      console.error('[SENTINEL HATA] Bulgu verileri veritabanından alınamadı:', error);
      toast.error(
        `Bulgu verileri yüklenemedi: ${(error as Error)?.message ?? 'Bilinmeyen bir veritabanı hatası meydana geldi. Lütfen sistem yöneticisiyle iletişime geçin.'}`,
        { duration: 6000 }
      );
    }
  }, [isError, error]);

  // === FİLTRELEME MANTIĞI (Defensive: || [] fallback) ===
  const filteredFindings = useMemo(() => {
    let filtered = [...(findings || [])];
    
    if (filterRisk !== 'ALL') {
      filtered = filtered.filter(f => f?.severity === filterRisk);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f?.title?.toLowerCase().includes(query) || 
        f?.code?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [findings, filterRisk, searchQuery]);

  // === İSTATİSTİKLER (Defensive: || [] + ?. chaining) ===
  const stats = useMemo(() => {
    const raw = findings || [];
    return {
      total: raw.length,
      critical: raw.filter(f => f?.severity === 'CRITICAL').length,
      inNegotiation: raw.filter(f => f?.state === 'NEGOTIATION').length,
      closed: raw.filter(f => f?.state === 'CLOSED' || f?.state === 'FINAL').length,
      avgRiskScore: raw.length > 0
        ? Math.round(raw.reduce((sum, f) => sum + (f?.impact_score ?? 0), 0) / raw.length)
        : 0,
    };
  }, [findings]);

  // === HANDLERS ===
  const handleRowClick = (finding: ComprehensiveFinding) => {
    // FSD Anayasası: Sayfa yenileme yok — Super Drawer açılır
    setSelectedFindingId(finding?.id ?? null);
  };

  const handleOpenInStudio = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/findings/${id}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-canvas">
      {/* ANA İÇERİK ALANI */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* HEADER */}
          <PageHeader
            title="Bulgu Merkezi & Müzakere"
            description="Denetim bulguları, aksiyon takibi ve müzakere süreç yönetimi."
            icon={FileSearch}
            action={
              <div className="flex items-center gap-3">
                <div className="flex bg-surface border border-slate-200 rounded-lg shadow-sm overflow-hidden p-0.5">
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={clsx('px-3 py-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-slate-100 text-primary font-medium' : 'text-slate-500 hover:bg-canvas')}
                    title="Liste Görünümü"
                  >
                    <List size={16}/>
                  </button>
                  <button 
                    onClick={() => setViewMode('kanban')} 
                    className={clsx('px-3 py-2 rounded-md transition-colors', viewMode === 'kanban' ? 'bg-slate-100 text-primary font-medium' : 'text-slate-500 hover:bg-canvas')}
                    title="Kanban Görünümü"
                  >
                    <LayoutGrid size={16}/>
                  </button>
                </div>

                <button
                  onClick={() => navigate('/findings/new?mode=zen')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-sm font-bold text-xs transition-all"
                >
                  <Sparkles size={16} /> Zen Modu
                </button>

                <button
                  onClick={() => setShowNewFindingModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all font-bold text-xs active:scale-95"
                >
                  <Plus size={16} /> Hızlı Ekle
                </button>
              </div>
            }
          />

          {/* İSTATİSTİK KARTLARI */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Toplam Bulgu" value={stats.total} icon={FileSearch} color="blue" />
            <StatCard label="Kritik Risk" value={stats.critical} icon={AlertTriangle} color="red" />
            <StatCard label="Müzakerede" value={stats.inNegotiation} icon={Eye} color="amber" />
            <StatCard label="Kapatıldı" value={stats.closed} icon={Shield} color="emerald" />
            <StatCard label="Ort. Risk Skoru" value={stats.avgRiskScore} icon={TrendingUp} color="slate" />
          </div>

          {/* FİLTRE VE ARAMA */}
          <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Bulgu başlığı veya referans kodu ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-canvas border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={filterRisk} 
                onChange={(e) => setFilterRisk(e.target.value as RiskLevel)}
                className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tüm Riskler</option>
                <option value="CRITICAL">Kritik</option>
                <option value="HIGH">Yüksek</option>
                <option value="MEDIUM">Orta</option>
                <option value="LOW">Düşük</option>
              </select>
            </div>
          </div>

          {/* İÇERİK ALANI */}
          {isLoading ? (
            <div className="bg-surface rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <Loader2 className="animate-spin w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <span className="text-sm text-slate-500 font-medium">Bulgular yükleniyor...</span>
            </div>
          ) : isError ? (
            <div className="bg-red-50 rounded-xl border border-red-200 p-12 text-center shadow-sm">
              <AlertTriangle size={32} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-bold text-red-800 mb-1">Veritabanı Bağlantı Hatası</h3>
              <p className="text-sm text-red-600 mb-4">Bulgu verileri yüklenirken kritik bir hata oluştu.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
              >
                Yeniden Dene
              </button>
            </div>
          ) : filteredFindings.length === 0 ? (
            <div className="bg-surface rounded-xl border border-slate-200 p-16 text-center shadow-sm">
              <FileSearch size={32} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">Eşleşen kayıt bulunamadı</h3>
              <p className="text-sm text-slate-500">Arama kriterlerinizi değiştirin veya yeni bir bulgu ekleyin.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {(filteredFindings || []).map((finding) => (
                <div 
                  key={finding?.id}
                  onClick={() => handleRowClick(finding)}
                  className={clsx(
                    "bg-surface border rounded-xl p-4 transition-all cursor-pointer group relative overflow-hidden",
                    selectedFindingId === finding?.id
                      ? "border-indigo-400 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200"
                      : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
                  )}
                >
                  <div className={clsx("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl", getSeverityColor(finding?.severity ?? '').split(' ')[0])} />
                  <div className="flex items-center justify-between pl-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-canvas rounded-lg border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Skor</span>
                        <span className={clsx("text-sm font-black", finding?.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-700')}>
                          {finding?.impact_score ?? 0}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-slate-400">{finding?.code ?? '—'}</span>
                          <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getSeverityColor(finding?.severity ?? ''))}>
                            {finding?.severity ?? 'N/A'}
                          </span>
                          {finding?.state === 'NEGOTIATION' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded border border-amber-200">
                              Müzakerede
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm">
                          {finding?.title ?? 'İsimsiz Bulgu'}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={(e) => handleOpenInStudio(e, finding?.id ?? '')}
                        className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                      >
                        <Layers size={13} /> Studio
                      </button>
                      <ChevronRight
                        className={clsx("transition-colors", selectedFindingId === finding?.id ? "text-indigo-500" : "text-slate-300 group-hover:text-indigo-500")}
                        size={18}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FindingKanbanBoard findings={filteredFindings} onFindingUpdate={() => refetch()} />
          )}
        </div>
      </div>

      {/* SUPER DRAWER — Sağdan kayan, sayfa bağlamı kırılmaz */}
      {selectedFindingId && (
        <div className="w-[420px] shrink-0 border-l border-slate-200 bg-surface overflow-hidden animate-in slide-in-from-right duration-300">
          <UniversalFindingDrawer
            findingId={selectedFindingId}
            isOpen={true}
            onClose={() => setSelectedFindingId(null)}
            defaultTab="ai"
          />
        </div>
      )}

      <NewFindingModal
        isOpen={showNewFindingModal}
        onClose={() => setShowNewFindingModal(false)}
        onSave={() => refetch()}
      />
    </div>
  );
}

// İSTATİSTİK KART BİLEŞENİ
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colors: Record<string, string> = { 
    blue: 'text-blue-600 bg-blue-50 border-blue-100', 
    red: 'text-red-600 bg-red-50 border-red-100', 
    amber: 'text-amber-600 bg-amber-50 border-amber-100', 
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100', 
    slate: 'text-slate-600 bg-canvas border-slate-200' 
  };
  
  return (
    <div className={clsx("rounded-xl border p-4 flex items-center gap-3 transition-all hover:shadow-sm bg-surface", colors[color])}>
      <div className="p-2.5 bg-surface/80 backdrop-blur-sm rounded-lg shadow-sm shrink-0">
        <Icon size={18} className="opacity-90" />
      </div>
      <div>
        <div className="text-2xl font-black text-primary">{value ?? 0}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</div>
      </div>
    </div>
  );
}