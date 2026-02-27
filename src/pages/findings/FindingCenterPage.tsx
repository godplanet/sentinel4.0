import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSearch, Plus, Filter, Shield, AlertTriangle, Eye, 
  TrendingUp, LayoutGrid, List, Sparkles, Layers, ArrowRight 
} from 'lucide-react';
import clsx from 'clsx';

// MİMARİ BAĞLANTILAR
import { PageHeader } from '@/shared/ui/PageHeader';
import { FindingDataGrid } from '@/widgets/tables/FindingDataGrid';
import { FindingKanbanBoard } from '@/features/finding-hub';
import { NewFindingModal } from '@/features/finding-form'; 
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';
import type { ComprehensiveFinding, FindingState } from '@/entities/finding/model/types';
import { useParameterStore } from '@/entities/settings/model/parameter-store';

type RiskLevel = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'ALL' | FindingState;
type ViewMode = 'list' | 'kanban';

export default function FindingCenterPage() {
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(true);

  // Görünüm ve Filtre State'leri
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterRisk, setFilterRisk] = useState<RiskLevel>('ALL');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Kontrolleri
  const [showNewFindingModal, setShowNewFindingModal] = useState(false);

  // 1. VERİ YÜKLEME (Tek Gerçek Kaynak)
  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      console.log('FindingCenterPage: Loading findings...');
      const data = await comprehensiveFindingApi.getAll();
      console.log('FindingCenterPage: Loaded', data?.length || 0, 'findings');
      setFindings(data || []);
    } catch (error) {
      console.error('FindingCenterPage: Failed to load findings:', error);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. FİLTRELEME MANTIĞI
  const filteredFindings = useMemo(() => {
    let filtered = [...findings];
    
    if (filterRisk !== 'ALL') {
        filtered = filtered.filter(f => f.severity === filterRisk);
    }
    
    if (filterStatus !== 'ALL') {
        filtered = filtered.filter(f => f.state === filterStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.title?.toLowerCase().includes(query) || 
        f.code?.toLowerCase().includes(query) ||
        (f.details as any)?.code?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [findings, filterRisk, filterStatus, searchQuery]);

  // 3. İSTATİSTİKLER
  const stats = useMemo(() => {
    return {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      inNegotiation: findings.filter(f => f.state === 'NEGOTIATION').length,
      closed: findings.filter(f => f.state === 'CLOSED' || f.state === 'FINAL').length,
      avgRiskScore: findings.length > 0 ? Math.round(findings.reduce((sum, f) => sum + (f.impact_score || 0), 0) / findings.length) : 0,
    };
  }, [findings]);

  // 4. NAVİGASYON (Detail Page'e Git)
  const handleRowClick = (finding: ComprehensiveFinding) => {
    // Yeni Finding Studio Page'e git
    navigate(`/execution/findings/${finding.id}`);
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50">
      
      {/* HEADER */}
      <PageHeader
        title="Bulgu Merkezi & Müzakere"
        description="Denetim bulguları, aksiyon takibi ve müzakere süreç yönetimi."
        icon={FileSearch}
        action={
          <div className="flex items-center gap-3">
            {/* Görünüm Değiştirici */}
            <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden p-0.5">
              <button 
                  onClick={() => setViewMode('list')} 
                  className={clsx('px-3 py-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50')}
                  title="Liste Görünümü"
              >
                  <List size={16}/>
              </button>
              <button 
                  onClick={() => setViewMode('kanban')} 
                  className={clsx('px-3 py-2 rounded-md transition-colors', viewMode === 'kanban' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50')}
                  title="Kanban Görünümü"
              >
                  <LayoutGrid size={16}/>
              </button>
            </div>

            {/* Zen Modu - Opens in Zen view */}
            <button
              onClick={() => navigate('/execution/findings/new?mode=zen')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-sm font-bold text-xs transition-all"
            >
              <Sparkles size={16} /> Zen Modu
            </button>

            {/* Yeni Ekle */}
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Toplam Bulgu" value={stats.total} icon={FileSearch} color="blue" />
        <StatCard label="Kritik Risk" value={stats.critical} icon={AlertTriangle} color="red" />
        <StatCard label="Müzakerede" value={stats.inNegotiation} icon={Eye} color="amber" />
        <StatCard label="Kapatıldı" value={stats.closed} icon={Shield} color="emerald" />
        <StatCard label="Ort. Risk Skoru" value={stats.avgRiskScore} icon={TrendingUp} color="slate" />
      </div>

      {/* FİLTRE VE ARAMA */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
              <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                  type="text" 
                  placeholder="Bulgu başlığı veya referans kodu ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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

      {/* LİSTE GÖRÜNÜMÜ */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <span className="text-sm text-slate-500 font-medium">Veriler yükleniyor...</span>
        </div>
      ) : filteredFindings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
          <FileSearch size={32} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Eşleşen kayıt bulunamadı</h3>
          <p className="text-sm text-slate-500">Arama kriterlerinizi değiştirin veya yeni bir bulgu ekleyin.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
             {filteredFindings.map((finding) => (
                <div 
                    key={finding.id} 
                    onClick={() => handleRowClick(finding)} 
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className={clsx("absolute left-0 top-0 bottom-0 w-1.5", getSeverityColor(finding.severity).split(' ')[0].replace('bg-', 'bg-'))} />
                    <div className="flex items-center justify-between pl-4">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400">SKOR</span>
                                <span className={clsx("text-xs font-bold", finding.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-600')}>{finding.impact_score || 0}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono font-bold text-slate-500">{finding.code}</span>
                                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getSeverityColor(finding.severity))}>
                                        {finding.severity}
                                    </span>
                                    {finding.state === 'NEGOTIATION' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded border border-amber-200">Müzakerede</span>}
                                </div>
                                <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{finding.title}</h3>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleNavigateToDetail(finding.id, 'studio'); }}
                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                             >
                                <Layers size={14} /> Studio
                             </button>
                             <ArrowRight className="text-slate-300 group-hover:text-indigo-600" size={20} />
                        </div>
                    </div>
                </div>
             ))}
        </div>
      ) : (
        <FindingKanbanBoard findings={filteredFindings} onFindingUpdate={() => {}} />
      )}

      <NewFindingModal isOpen={showNewFindingModal} onClose={() => setShowNewFindingModal(false)} onSave={() => loadFindings()} />
    </div>
  );
}

// İSTATİSTİK KART BİLEŞENİ
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colors: any = { 
      blue: 'text-blue-600 bg-blue-50 border-blue-100', 
      red: 'text-red-600 bg-red-50 border-red-100', 
      amber: 'text-amber-600 bg-amber-50 border-amber-100', 
      emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100', 
      slate: 'text-slate-600 bg-slate-50 border-slate-200' 
  };
  
  return (
    <div className={clsx("rounded-xl border p-4 flex items-center gap-4 transition-all hover:shadow-sm", colors[color])}>
      <div className="p-3 bg-white/80 rounded-lg shadow-sm">
        <Icon size={20} className="opacity-90" />
      </div>
      <div>
        <div className="text-2xl font-black">{value}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      </div>
    </div>
  );
}