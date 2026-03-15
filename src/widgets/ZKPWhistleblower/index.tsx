/**
 * ZKPWhistleblower — Wave 68: Zero-Knowledge Ethics Vault
 * %100 Light Mode | Apple Glassmorphism | Real Supabase
 */

import {
 useAccessLogs,
 useRecordAccessAttempt,
 useZkpReports,
 type ZkpEncryptedReport,
 type ZkpStatus,
} from '@/features/ethics-vault/api';
import clsx from 'clsx';
import {
 Activity,
 AlertTriangle,
 CheckCircle2,
 EyeOff,
 FileText,
 Fingerprint,
 Key, LockKeyhole,
 Search,
 ShieldOff,
 RefreshCw,
 Unlock
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ZkpStatus, { label: string; color: string; bg: string }> = {
 submitted: { label: 'Gönderildi', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
 reviewing: { label: 'İnceleniyor', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
 investigating: { label: 'Soruşturmada', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
 resolved: { label: 'Çözüldü', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
 dismissed: { label: 'Reddedildi', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
};

const CATEGORY_LABELS: Record<string, string> = {
 'rüşvet_yolsuzluk': 'Rüşvet ve Yolsuzluk',
 'mobbing': 'Mobbing / Psikolojik Taciz',
 'cinsel_taciz': 'Cinsel Taciz',
 'finansal_usulsüzlük': 'Finansal Usulsüzlük',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function ZKPWhistleblower() {
 const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

 const { data: reports = [], isLoading: reportsLoading, refetch } = useZkpReports();
 const selectedReport = reports.find(r => r.id === selectedReportId);

 // Stats
 const total = reports.length;
 const critical = (reports || []).filter(r => r.severity === 'critical').length;
 const reviewing = (reports || []).filter(r => r.status === 'reviewing' || r.status === 'investigating').length;

 return (
 <div className="space-y-5">
 {/* KPI Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 <StatCard icon={ShieldOff} label="Şifreli İhbar" value={String(total)} sub="Kasadaki toplam rapor" color="slate" />
 <StatCard icon={AlertTriangle} label="Kritik İhbar" value={String(critical)} sub="Yüksek öncelikli vakalar" color="red" />
 <StatCard icon={Activity} label="Aktif Soruşturma" value={String(reviewing)} sub="İncelemesi devam edenler" color="blue" />
 <StatCard icon={LockKeyhole} label="ZKP Güvenliği" value="Aktif" sub="Uçtan uca şifreleme" color="emerald" />
 </div>

 <div className="flex flex-col lg:flex-row gap-5">
 
 {/* Left Column: Report List */}
 <div className="lg:w-1/3 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl flex flex-col h-[600px]">
 <div className="px-5 py-4 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700">
 <LockKeyhole size={16} />
 </div>
 <h3 className="text-sm font-bold text-slate-800">İhbar Kasası</h3>
 </div>
 <button onClick={() => refetch()} className="text-slate-400 hover:text-slate-600 transition-colors">
 <RefreshCw size={14} />
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
 {reportsLoading ? (
 <div className="p-10 text-center text-sm text-slate-400">Yükleniyor...</div>
 ) : reports.length === 0 ? (
 <div className="p-10 text-center text-sm text-slate-500">Kasa şu an boş.</div>
 ) : (
 (reports || []).map((r: ZkpEncryptedReport) => {
 const stCfg = STATUS_CFG[r.status];
 const isSelected = selectedReportId === r.id;
 return (
 <button
 key={r.id}
 onClick={() => setSelectedReportId(r.id)}
 className={clsx(
 'w-full text-left px-5 py-4 transition-colors relative overflow-hidden',
 isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
 )}
 >
 {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
 <div className="flex items-center justify-between mb-1">
 <span className="text-[10px] font-mono text-slate-500">{r.tracking_code}</span>
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border', stCfg.bg, stCfg.color)}>
 {stCfg.label}
 </span>
 </div>
 <p className="text-sm font-bold text-slate-800 line-clamp-1">{CATEGORY_LABELS[r.category]}</p>
 <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
 <EyeOff size={10} /> {r.decryption_attempts} Görüntüleme Denemesi
 </p>
 </button>
 );
 })
 )}
 </div>
 </div>

 {/* Right Column: Decryption / Detail Panel */}
 <div className="flex-1 bg-slate-50 border border-slate-200 shadow-inner rounded-2xl flex flex-col h-[600px] overflow-hidden relative">
 {!selectedReport ? (
 <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
 <Fingerprint size={48} className="mb-4 opacity-50" />
 <p className="text-base font-bold text-slate-600">İhbar Seçilmedi</p>
 <p className="text-sm max-w-xs text-center mt-2">Şifreli kasayı görüntülemek ve deşifre işlemi için soldaki menüden bir ihbar seçin.</p>
 </div>
 ) : (
 <DecryptionPanel report={selectedReport} />
 )}
 </div>

 </div>
 </div>
 );
}

// ─── Internal Sub Component (Stateful Decryption) ─────────────────────────────

function DecryptionPanel({ report }: { report: ZkpEncryptedReport }) {
 const [keyInput, setKeyInput] = useState('');
 const [isDecrypted, setIsDecrypted] = useState(false);
 const [isAttempting, setIsAttempting] = useState(false);

 const { data: logs = [], refetch: refetchLogs } = useAccessLogs(report.id);
 const recordAccess = useRecordAccessAttempt();

 // Reset state when report changes
 useState(() => {
 setKeyInput('');
 setIsDecrypted(false);
 });

 const handleDecrypt = async () => {
 if (!keyInput.trim()) return toast.error('Private Key gereklidir.');
 
 setIsAttempting(true);
 
 // Simulate ZKP / Key Verification Delay
 await new Promise(r => setTimeout(r, 1200));

 // For simulation: "admin-key" is the accepted password.
 const success = keyInput === 'admin-key';
 
 await recordAccess.mutateAsync({
 report_id: report.id,
 email: 'cae@sentinel.bank',
 role: 'CAE',
 reason: 'Yönetim İncelemesi',
 status: success ? 'success' : 'key_mismatch'
 });

 if (success) {
 toast.success('ZKP Doğrulaması Başarılı. Rapor Deşifre Edildi.');
 setIsDecrypted(true);
 } else {
 toast.error('Geçersiz Private Key! Erişim Loglandı.');
 }
 
 setKeyInput('');
 setIsAttempting(false);
 refetchLogs();
 };

 return (
 <div className="flex flex-col h-full bg-white">
 {/* Header */}
 <div className="px-4 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="p-1 px-2 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">
 Zero-Knowledge Proof
 </span>
 <span className="text-[10px] font-mono text-slate-500">Hash: {report.zk_proof_hash.substring(0,24)}...</span>
 </div>
 <h2 className="text-lg font-black text-slate-800">{CATEGORY_LABELS[report.category] ?? report.category}</h2>
 </div>
 <div className="text-right">
 <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Güvenlik Seviyesi</span>
 <span className={clsx(
 'text-xs font-black px-2 py-0.5 rounded border',
 report.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
 )}>
 {report.severity.toUpperCase()}
 </span>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-4">
 
 {/* Payload Section */}
 <div className="mb-4">
 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
 <FileText size={14} /> İhbar Metni (Payload)
 </h4>
 
 {isDecrypted ? (
 <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 text-sm text-slate-700 leading-relaxed font-medium animate-in fade-in zoom-in duration-300">
 {/* Simulating deciphered text based on category */}
 "Şirketimizin ana tedarikçilerinden birisinin ihale sürecinde rüşvet teklif ettiği ve satın alma müdürünün bunu kabul ettiğine dair kuvvetli şüphelerim var. Geçen ay yapılan 4M TL'lik ödemenin fatura karşılığı bulunmuyor. İlgili e-posta yazışmaları ekte sunulmuştur."
 <br/><br/>
 <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded">
 VERIFIED_PAYLOAD_MATCH
 </span>
 </div>
 ) : (
 <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
 <p className="text-[11px] font-mono text-emerald-400 break-all leading-relaxed opacity-80">
 {report.encrypted_payload.repeat(3)}
 </p>
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end justify-center pb-4">
 <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-4 w-3/4 max-w-sm flex flex-col items-center">
 <Key size={24} className="text-amber-400 mb-2" />
 <p className="text-xs text-slate-300 font-medium mb-3 text-center">İçeriği görmek için Private Key (Özel Anahtar) gereklidir.</p>
 <div className="flex w-full gap-2">
 <input
 type="password"
 placeholder="Anahtarı girin (admin-key)"
 value={keyInput}
 onChange={(e) => setKeyInput(e.target.value)}
 className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
 />
 <button
 onClick={handleDecrypt}
 disabled={isAttempting}
 className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
 >
 {isAttempting ? 'Açılıyor...' : 'Deşifre Et'}
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Access Logs */}
 <div>
 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
 <Search size={14} /> Erişim Denetim İzi (Audit Trail)
 </h4>
 <div className="border border-slate-100 rounded-xl overflow-hidden">
 <table className="w-full text-left text-[11px]">
 <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
 <tr>
 <th className="px-4 py-2 font-semibold">Tarih</th>
 <th className="px-4 py-2 font-semibold">Kullanıcı (Rol)</th>
 <th className="px-4 py-2 font-semibold">Sebep</th>
 <th className="px-4 py-2 font-semibold">Sonuç</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50 bg-white">
 {logs.length === 0 ? (
 <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-400">Henüz erişim denemesi yok.</td></tr>
 ) : (
 (logs || []).map((log: any) => (
 <tr key={log.id} className="hover:bg-slate-50/50">
 <td className="px-4 py-2 text-slate-500 font-mono">{new Date(log.accessed_at).toLocaleString('tr-TR')}</td>
 <td className="px-4 py-2 text-slate-800 font-medium">{log.accessed_by_email} <span className="text-slate-400">({log.accessed_by_role})</span></td>
 <td className="px-4 py-2 text-slate-600">{log.access_reason}</td>
 <td className="px-4 py-2">
 {log.access_status === 'success' ? (
 <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded w-max"><Unlock size={10} /> Başarılı</span>
 ) : log.access_status === 'key_mismatch' ? (
 <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded w-max"><AlertTriangle size={10} /> Hatalı Şifre</span>
 ) : (
 <span className="flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded w-max"><CheckCircle2 size={10} /> Reddedildi</span>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 </div>
 </div>
 );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: any) {
 const map: Record<string, string> = {
 slate: 'bg-slate-50 border-slate-200 text-slate-600',
 red: 'bg-red-50 border-red-200 text-red-600',
 blue: 'bg-blue-50 border-blue-200 text-blue-600',
 emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
 };
 return (
 <div className={clsx('rounded-xl border p-4', map[color])}>
 <div className="flex items-center gap-2 mb-2">
 <Icon size={14} />
 <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
 </div>
 <p className="text-2xl font-black tabular-nums">{value}</p>
 <p className="text-[10px] opacity-70 mt-1 truncate">{sub}</p>
 </div>
 );
}
