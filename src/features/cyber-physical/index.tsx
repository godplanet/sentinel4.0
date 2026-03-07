/**
 * CyberPhysicalPage — Ana Sayfa (Wave 77)
 * features/cyber-physical/index.tsx
 *
 * IoT Radar (Sağ), Kasa ve Sistem Odası Erişim Günlüğü (Sol)
 * C-Level · Apple Glassmorphism · %100 Light Mode
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Activity, Fingerprint, Lock, Unlock, AlertTriangle,
  Clock, CheckCircle2, Server, ThermometerSun, MapPin
} from 'lucide-react';
import {
  useSensorData, useVaultLogs, usePhysicalBreaches, useIoTKPI,
  type VaultAccessLog
} from './api/iot-radar';
import { IoTRadar } from '@/widgets/IoTRadar';

// ─── Kasa Erişim Günlüğü Satırı ───────────────────────────────────────────────

function AccessLogRow({ log, index }: { log: VaultAccessLog; index: number }) {
  const isDenied = log.access_status === 'DENIED';
  
  return (
    <motion.tr
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${isDenied ? 'bg-red-50/20' : ''}`}
    >
      <td className="px-4 py-3">
        <p className="text-[10px] font-black text-slate-600 font-mono tracking-tight">
           {new Date(log.access_time).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-[9px] text-slate-400 mt-0.5">{new Date(log.access_time).toLocaleDateString('tr-TR')}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
           <MapPin size={12} className="text-indigo-400" />
           <span className="text-[11px] font-bold text-slate-700">{log.location_name}</span>
        </div>
        <p className="text-[9px] text-slate-500 mt-0.5 ml-4">{log.access_point}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-[11px] font-bold text-slate-700">{log.personnel_name}</p>
        <p className="text-[9px] text-slate-400 mt-0.5 font-mono">ID: {log.personnel_id}</p>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded flex items-center justify-center gap-1 w-[90px] mx-auto border border-slate-200">
           {log.auth_method === 'BIOMETRIC' ? <Fingerprint size={10} className="text-indigo-500" /> : <Lock size={10} className="text-slate-400" />}
           {log.auth_method}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {isDenied ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 shadow-sm">
             <AlertTriangle size={12} /> REDDEDİLDİ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
             <Unlock size={12} /> ONAY
          </span>
        )}
      </td>
    </motion.tr>
  );
}

// ─── Ana Dashboard ────────────────────────────────────────────────────────────

export function CyberPhysicalPage() {
  const { data: sensors = [] } = useSensorData();
  const { data: logs = [], isLoading: logsLoading } = useVaultLogs();
  const { data: breaches = [] } = usePhysicalBreaches();
  
  const kpi = useIoTKPI(sensors, breaches, logs);

  return (
    <div className="h-full flex flex-col bg-slate-50/50 overflow-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10 flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-800 to-teal-900 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Server size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cyber-Physical & IoT Vault</h1>
            <p className="text-xs text-slate-500 mt-0.5">Sistem Odası İklimlendirme ve Kasa Biyometrik Erişim Günlüğü · Wave 77</p>
          </div>
        </div>
      </div>

      {/* C-Level KPI Bant */}
      <div className="grid grid-cols-6 gap-3 p-6 pb-2">
          {[
            { label: 'Aktif Sensör',  value: kpi.totalSensors,                icon: Activity,    color: 'text-teal-700', bg: 'bg-teal-50' },
            { label: 'Çevrimdışı',    value: kpi.offlineSensors,              icon: AlertTriangle,color: kpi.offlineSensors > 0 ? 'text-amber-600' : 'text-slate-400', bg: kpi.offlineSensors > 0 ? 'bg-amber-50' : 'bg-slate-50' },
            { label: 'Sistem Isı',    value: `${kpi.avgTemperatureC}°C`,      icon: ThermometerSun,color: kpi.avgTemperatureC > 28 ? 'text-rose-600' : 'text-indigo-700', bg: kpi.avgTemperatureC > 28 ? 'bg-rose-50' : 'bg-indigo-50' },
            { label: 'Ort. Nem',      value: `%${kpi.avgHumidityPct}`,        icon: Clock,       color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Erişim Reddi',  value: kpi.deniedAccessCount,           icon: Lock,        color: kpi.deniedAccessCount > 5 ? 'text-rose-600' : 'text-slate-700', bg: 'bg-slate-100' },
            { label: 'Kritik Alarm',  value: kpi.criticalBreaches,            icon: ShieldCheck, color: kpi.criticalBreaches > 0 ? 'text-red-700' : 'text-emerald-700', bg: kpi.criticalBreaches > 0 ? 'bg-red-50' : 'bg-emerald-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center flex flex-col items-center justify-center shadow-sm">
              <div className={`p-1.5 rounded-lg ${bg} mb-1.5`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-lg font-black text-slate-800 tabular-nums leading-none">{value}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-1">{label}</p>
            </div>
          ))}
      </div>

      <div className="flex-1 overflow-hidden flex gap-0 px-6 pb-6">
        
        {/* Left: Vault & DC Access Logs */}
        <div className="flex-1 flex flex-col mr-6">
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 mt-2">
              <Fingerprint size={16} className="text-indigo-500" />
              Erişim Kontrol Günlüğü (Access Control Layer)
           </h2>
           
           <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1 h-[400px]">
                 <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                       <tr>
                         {['Zaman', 'Lokasyon & Geçiş Noktası', 'Personel', 'Doğrulama', 'Durum'].map((h, i) => (
                           <th key={h} className={`px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider ${i === 3 ? 'text-center' : i === 4 ? 'text-right' : ''}`}>
                             {h}
                           </th>
                         ))}
                       </tr>
                    </thead>
                    <tbody>
                       {logsLoading ? (
                         <tr><td colSpan={5} className="text-center py-20 text-slate-400">Günlük Çekiliyor...</td></tr>
                       ) : (logs || []).length === 0 ? (
                         <tr><td colSpan={5} className="text-center py-20 text-slate-400">Son 24 saatte giriş tespit edilmedi.</td></tr>
                       ) : (
                         (logs || []).map((log, i) => <AccessLogRow key={log.id} log={log} index={i} />)
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right: IoT Radar Panel */}
        <div className="w-[420px] shrink-0">
           <IoTRadar />
        </div>
        
      </div>
    </div>
  );
}
