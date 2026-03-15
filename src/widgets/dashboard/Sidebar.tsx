import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export interface DashboardFilters {
 engagement: string[];
 actionStatus: string[];
 riskLevel: string[];
 findingYear: number[];
 extensionCount: number[];
}

interface DashboardSidebarProps {
 filters: DashboardFilters;
 onFiltersChange: (filters: DashboardFilters) => void;
 engagementOptions?: string[];
}

export default function DashboardSidebar({ filters, onFiltersChange, engagementOptions = [] }: DashboardSidebarProps) {
 const [isCollapsed, setIsCollapsed] = useState(false);

 const actionStatusOptions = [
 'IN_PROGRESS',
 'APPROVED',
 'COMPLETED',
 'PENDING_APPROVAL',
 'REJECTED'
 ];

 const riskLevelOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

 const findingYearOptions = [2023, 2024, 2025, 2026];

 const extensionCountOptions = [0, 1, 2, 3, 4];

 const toggleFilter = <K extends keyof DashboardFilters>(
 key: K,
 value: DashboardFilters[K][number]
 ) => {
 const currentValues = filters[key] as any[];
 const newValues = currentValues.includes(value)
 ? (currentValues || []).filter(v => v !== value)
 : [...currentValues, value];

 onFiltersChange({
 ...filters,
 [key]: newValues
 });
 };

 const clearAllFilters = () => {
 onFiltersChange({
 engagement: [],
 actionStatus: [],
 riskLevel: [],
 findingYear: [],
 extensionCount: []
 });
 };

 const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

 if (isCollapsed) {
 return (
 <div className="w-16 h-screen flex flex-col items-center py-6 rounded-tr-3xl" style={{ backgroundColor: '#1e3a8a' }}>
 <button
 onClick={() => setIsCollapsed(false)}
 className="text-white hover:opacity-80 p-2 rounded-lg transition-opacity"
 >
 <Filter className="w-6 h-6" />
 </button>
 </div>
 );
 }

 return (
 <div className="w-80 h-screen overflow-y-auto rounded-tr-3xl" style={{ backgroundColor: '#1e3a8a' }}>
 <div className="p-6 space-y-6">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
 <span className="font-bold text-xl" style={{ color: '#1e3a8a' }}>S</span>
 </div>
 <span className="text-white font-bold text-xl">SENTINEL</span>
 </div>
 <button
 onClick={() => setIsCollapsed(true)}
 className="text-white hover:opacity-80 p-1 rounded transition-opacity"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <h2 className="text-white font-semibold text-lg flex items-center gap-2">
 <Filter className="w-5 h-5" />
 Filtreler
 </h2>
 {hasActiveFilters && (
 <button
 onClick={clearAllFilters}
 className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
 >
 Temizle
 </button>
 )}
 </div>

 <div className="space-y-4">
 {engagementOptions.length > 0 && (
 <FilterSection title="Denetim">
 {engagementOptions.slice(0, 8).map(engagement => (
 <FilterCheckbox
 key={engagement}
 label={engagement}
 checked={filters.engagement.includes(engagement)}
 onChange={() => toggleFilter('engagement', engagement)}
 />
 ))}
 </FilterSection>
 )}

 <FilterSection title="Aksiyon Durumu">
 {(actionStatusOptions || []).map(status => (
 <FilterCheckbox
 key={status}
 label={formatStatus(status)}
 checked={filters.actionStatus.includes(status)}
 onChange={() => toggleFilter('actionStatus', status)}
 />
 ))}
 </FilterSection>

 <FilterSection title="Risk Seviyesi">
 {(riskLevelOptions || []).map(level => (
 <FilterCheckbox
 key={level}
 label={level}
 checked={filters.riskLevel.includes(level)}
 onChange={() => toggleFilter('riskLevel', level)}
 color={getRiskColor(level)}
 />
 ))}
 </FilterSection>

 <FilterSection title="Bulgu Yılı">
 {(findingYearOptions || []).map(year => (
 <FilterCheckbox
 key={year}
 label={year.toString()}
 checked={filters.findingYear.includes(year)}
 onChange={() => toggleFilter('findingYear', year)}
 />
 ))}
 </FilterSection>

 <FilterSection title="Erteleme Adedi">
 {(extensionCountOptions || []).map(count => (
 <FilterCheckbox
 key={count}
 label={count === 4 ? '4+' : count.toString()}
 checked={filters.extensionCount.includes(count)}
 onChange={() => toggleFilter('extensionCount', count)}
 />
 ))}
 </FilterSection>
 </div>

 <div className="pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
 <div className="text-white text-sm opacity-75">
 <p className="font-semibold mb-2">Aktif Filtreler:</p>
 <p>{countActiveFilters(filters)} filtre uygulandı</p>
 </div>
 </div>
 </div>
 </div>
 );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
 return (
 <div className="space-y-2">
 <h3 className="text-white font-medium text-sm opacity-90">{title}</h3>
 <div className="space-y-1.5">{children}</div>
 </div>
 );
}

interface FilterCheckboxProps {
 label: string;
 checked: boolean;
 onChange: () => void;
 color?: string;
}

function FilterCheckbox({ label, checked, onChange, color }: FilterCheckboxProps) {
 return (
 <label className="flex items-center gap-2 cursor-pointer group">
 <input
 type="checkbox"
 checked={checked}
 onChange={onChange}
 className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 focus:ring-offset-0"
 style={{
 backgroundColor: checked ? '#ec4899' : 'rgba(255, 255, 255, 0.1)',
 borderColor: 'rgba(255, 255, 255, 0.3)'
 }}
 />
 <span className={`text-sm ${checked ? 'text-white font-medium' : 'text-blue-200'} group-hover:text-white transition-colors`}>
 {color && (
 <span className={`inline-block w-2 h-2 rounded-full mr-1 ${color}`} />
 )}
 {label}
 </span>
 </label>
 );
}

function formatStatus(status: string): string {
 const map: Record<string, string> = {
 'IN_PROGRESS': 'Devam Ediyor',
 'APPROVED': 'Onaylandı',
 'COMPLETED': 'Tamamlandı',
 'PENDING_APPROVAL': 'Onay Bekliyor',
 'REJECTED': 'Reddedildi'
 };
 return map[status] || status;
}

function getRiskColor(level: string): string {
 const colors: Record<string, string> = {
 'CRITICAL': 'bg-red-500',
 'HIGH': 'bg-orange-500',
 'MEDIUM': 'bg-yellow-500',
 'LOW': 'bg-green-500'
 };
 return colors[level] || '';
}

function countActiveFilters(filters: DashboardFilters): number {
 return Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
}
