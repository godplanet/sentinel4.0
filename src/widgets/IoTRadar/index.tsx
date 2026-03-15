/**
 * IoTRadar — Siber Fiziksel Kasa ve Sensör İzleme Radarı
 * widgets/IoTRadar/index.tsx (Wave 77)
 *
 * C-Level Apple Glassmorphism tasarım, 100% Light Mode.
 */

import {
 usePhysicalBreaches,
 useResolveBreach,
 useSensorData,
 type IoTSensor, type PhysicalBreachAlert
} from '@/features/cyber-physical/api/iot-radar';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 Battery,
 CheckCircle2,
 ChevronRight,
 DoorClosed,
 DoorOpen,
 Droplets,
 ShieldAlert,
 Siren,
 ThermometerSun,
 Wifi, WifiOff,
 Zap
} from 'lucide-react';
import React, { useState } from 'react';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const SENSOR_ICONS: Record<string, React.ElementType> = {
 TEMP_HUMIDITY: ThermometerSun,
 DOOR_CONTACT: DoorClosed,
 MOTION: Zap,
 SMOKE: Siren,
 WATER_LEAK: Droplets
};

const SEVERITY_CFG = {
 CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ShieldAlert, label: 'Kritik Risk' },
 HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle, label: 'Yüksek Risk' },
 MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Siren, label: 'Orta Risk' },
 LOW: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: AlertTriangle, label: 'Düşük Risk' },
};

// ─── Sensör Durum Kartı ───────────────────────────────────────────────────────

function SensorCard({ sensor }: { sensor: IoTSensor }) {
 const Icon = SENSOR_ICONS[sensor.sensor_type] ?? Zap;
 
 // Sıcaklık 28'i geçerse kırmızı, nem 60'ı geçerse sarı
 const isTempHigh = sensor.temperature_c !== null && sensor.temperature_c > 28;
 const isHumidHigh = sensor.humidity_pct !== null && sensor.humidity_pct > 60;
 const isDoorOpen = sensor.door_status === 'OPEN' || sensor.door_status === 'FORCED_OPEN';

 return (
 <div className={`p-3 rounded-xl border transition-all shadow-sm ${
 !sensor.is_online ? 'bg-slate-50/50 border-slate-200 opacity-60' : 
 isTempHigh ? 'bg-red-50/50 border-red-200 shadow-red-500/10' :
 isDoorOpen ? 'bg-orange-50/50 border-orange-200 shadow-orange-500/10' :
 'bg-white border-slate-200 hover:shadow-md'
 }`}>
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-center gap-2">
 <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
 !sensor.is_online ? 'bg-slate-100 border-slate-200 text-slate-400' :
 isTempHigh ? 'bg-red-100 border-red-200 text-red-600' :
 isDoorOpen ? 'bg-orange-100 border-orange-200 text-orange-600' :
 'bg-emerald-50 border-emerald-100 text-emerald-600'
 }`}>
 {sensor.sensor_type === 'DOOR_CONTACT' ? (isDoorOpen ? <DoorOpen size={14}/> : <DoorClosed size={14}/>) : <Icon size={14} />}
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-700 leading-tight">{sensor.location_name}</p>
 <div className="flex items-center gap-1 mt-0.5">
 {sensor.is_online ? <Wifi size={8} className="text-emerald-500"/> : <WifiOff size={8} className="text-red-500"/>}
 <span className="text-[8px] text-slate-400 font-mono">{sensor.sensor_uuid}</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-0.5" title={`Pil: %${sensor.battery_pct}`}>
 <Battery size={10} className={sensor.battery_pct < 20 ? 'text-red-500' : 'text-slate-400'} />
 <span className="text-[8px] font-bold text-slate-400">{sensor.battery_pct}</span>
 </div>
 </div>

 {sensor.is_online ? (
 <div className="grid grid-cols-2 gap-2 mt-3">
 {sensor.temperature_c !== null && (
 <div className={`p-1.5 rounded flex justify-between items-center bg-white border ${isTempHigh ? 'border-red-200' : 'border-slate-100'}`}>
 <span className="text-[8px] font-bold text-slate-400 uppercase">Isı</span>
 <span className={`text-xs font-black ${isTempHigh ? 'text-red-600' : 'text-slate-700'}`}>{sensor.temperature_c.toFixed(1)}°</span>
 </div>
 )}
 {sensor.humidity_pct !== null && (
 <div className={`p-1.5 rounded flex justify-between items-center bg-white border ${isHumidHigh ? 'border-amber-200' : 'border-slate-100'}`}>
 <span className="text-[8px] font-bold text-slate-400 uppercase">Nem</span>
 <span className={`text-xs font-black ${isHumidHigh ? 'text-amber-600' : 'text-slate-700'}`}>%{sensor.humidity_pct}</span>
 </div>
 )}
 {sensor.door_status !== null && (
 <div className={`col-span-2 p-1.5 rounded flex justify-between items-center bg-white border ${isDoorOpen ? 'border-orange-200' : 'border-slate-100'}`}>
 <span className="text-[8px] font-bold text-slate-400 uppercase">Kapı</span>
 <span className={`text-[10px] font-black ${isDoorOpen ? 'text-orange-600' : 'text-emerald-600'}`}>{sensor.door_status}</span>
 </div>
 )}
 </div>
 ) : (
 <p className="text-[10px] font-semibold text-slate-400 text-center mt-3 py-1">Bağlantı Yok</p>
 )}
 </div>
 );
}

// ─── İhlal Alarm Satırı ────────────────────────────────────────────────────────

function BreachRow({ alert }: { alert: PhysicalBreachAlert }) {
 const [expanded, setExpanded] = useState(false);
 const resolveBreach = useResolveBreach();
 
 const cfg = SEVERITY_CFG[alert.severity] ?? SEVERITY_CFG.LOW;
 const Icon = cfg.icon;

 return (
 <div className={`rounded-xl border mb-2 transition-all hover:shadow-sm ${cfg.bg} ${cfg.border}`}>
 <div
 className="px-4 py-3 cursor-pointer flex items-start gap-3"
 onClick={() => setExpanded(!expanded)}
 >
 <div className={`mt-0.5 p-1.5 rounded-lg bg-white/50 border ${cfg.border} shrink-0`}>
 <Icon size={14} className={cfg.text} />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border} bg-white`}>
 {cfg.label}
 </span>
 <span className={`text-[9px] font-bold text-slate-500`}>
 ID: {alert.breach_code}
 </span>
 </div>
 <span className="text-[9px] font-mono text-slate-400">
 {new Date(alert.event_time).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>

 <p className="text-xs font-bold text-slate-800 leading-snug">{alert.location_name}</p>
 <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">{alert.description}</p>
 </div>

 <ChevronRight size={14} className={`text-slate-400 mt-2 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
 </div>

 <AnimatePresence>
 {expanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="border-t overflow-hidden"
 style={{ borderColor: 'var(--tw-border-opacity) ' + cfg.border }}
 >
 <div className="p-4 bg-white/60 space-y-3">
 <div className="bg-white rounded-lg p-3 border border-slate-200 text-[11px] shadow-sm leading-relaxed text-slate-700 font-medium">
 {alert.description}
 {alert.trigger_sensor && (
 <p className="text-[9px] font-mono text-slate-400 mt-2 flex items-center gap-1">
 <Zap size={10}/> Tetikleyici Sensör: {alert.trigger_sensor}
 </p>
 )}
 </div>

 <div className="pt-1 flex items-center justify-end gap-2">
 <button
 onClick={() => resolveBreach.mutate({ id: alert.id, status: 'RESOLVED', user: 'Güvenlik Opr. Merkezi (SOC)' })}
 disabled={resolveBreach.isPending || alert.status === 'RESOLVED'}
 className="text-[9px] font-bold px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded shadow-sm transition-all flex items-center gap-1"
 >
 <CheckCircle2 size={12}/> Alarmı Kapat
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

// ─── IoTRadar Ana Widget ──────────────────────────────────────────────────────

export function IoTRadar() {
 const { data: sensors = [], isLoading: isLoadingSensors } = useSensorData();
 const { data: breaches = [], isLoading: isLoadingBreaches } = usePhysicalBreaches();

 const activeBreaches = (breaches || []).filter(b => b.status === 'OPEN' || b.status === 'INVESTIGATING');
 const pastBreaches = (breaches || []).filter(b => b.status === 'RESOLVED' || b.status === 'FALSE_ALARM');

 return (
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
 {/* Header */}
 <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-teal-900 flex items-center justify-between shadow-inner">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
 <Wifi size={16} className="text-teal-300" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-white">IoT Radar & Vault</h3>
 <p className="text-[10px] text-teal-200/70 mt-0.5">Siber-Fiziksel Güvenlik Alarmları</p>
 </div>
 </div>
 <div className="text-right">
 <div className="flex items-baseline gap-1.5 pb-0.5 justify-end">
 {activeBreaches.length > 0 && (
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
 </span>
 )}
 <p className={`text-xl font-black tabular-nums ${activeBreaches.length > 0 ? 'text-rose-400' : 'text-teal-400'}`}>
 {activeBreaches.length}
 </p>
 </div>
 <p className="text-[8px] text-teal-200/50 font-bold tracking-widest leading-none bg-black/20 px-1 py-0.5 rounded">FİZİKSEL İHLAL</p>
 </div>
 </div>

 {/* Body */}
 <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col gap-4">
 
 {/* Canlı Sensör Ağı Mapi (Mini Temsil) */}
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
 <Activity size={12} className="text-teal-500" /> Canlı Sensör Ağı
 </p>
 {isLoadingSensors ? (
 <div className="h-20 bg-white/50 animate-pulse rounded-xl border border-slate-200" />
 ) : (
 <div className="grid grid-cols-2 gap-3">
 {(sensors || []).slice(0, 4).map(s => <SensorCard key={s.id} sensor={s} />)}
 </div>
 )}
 </div>

 <div className="h-px bg-slate-200/60 w-full" />

 {/* İhlaller ve Alarmlar */}
 <div>
 {isLoadingBreaches ? (
 <div className="flex justify-center py-4">
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
 </div>
 ) : activeBreaches.length === 0 ? (
 <div className="text-center py-4">
 <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
 <p className="text-xs font-semibold text-slate-500">Sistem odaları ve kasalar güvende.</p>
 </div>
 ) : (
 <div>
 <p className="text-[10px] font-black text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <Siren size={12} className="animate-pulse" /> Aktif Güvenlik İhlalleri
 </p>
 {(activeBreaches || []).map(alert => <BreachRow key={alert.id} alert={alert} />)}
 </div>
 )}

 {pastBreaches.length > 0 && (
 <div className="mt-4">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <CheckCircle2 size={12} /> Çözülmüş Vakalar
 </p>
 {pastBreaches.slice(0,3).map(alert => <BreachRow key={alert.id} alert={alert} />)}
 </div>
 )}
 </div>

 </div>
 </div>
 );
}
