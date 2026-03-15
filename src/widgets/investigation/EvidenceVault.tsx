/**
 * Evidence Vault — Adli Kanıt Kasası
 *
 * KVKK Kriptografik İmha kuralı:
 * - Hard delete YASAKTIR. İmha = is_shredded = true + shredded_at
 * - Tombstone: İmha edilen kanıtın içeriği ve indirme linki gizlenir,
 * yerine tarih ve açıklama içeren gri "mezar taşı" bloğu gösterilir.
 * - İmha butonu yalnızca CAE veya LEGAL rolüne görünür.
 */

import { usePersonaStore } from '@/entities/user/model/persona-store';
import type { DigitalEvidenceWithShred } from '@/features/investigation/api/evidence-api';
import { shredEvidence } from '@/features/investigation/api/evidence-api';
import type { EvidenceType } from '@/features/investigation/types';
import { EVIDENCE_TYPE_LABELS } from '@/features/investigation/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 ChevronDown, ChevronUp,
 FileText,
 Hash,
 Loader2,
 Lock, Mail, MessageSquare,
 Server,
 ShieldCheck,
 ShieldOff,
 Trash2,
 X,
} from 'lucide-react';
import { useState } from 'react';

interface EvidenceVaultProps {
 evidence: DigitalEvidenceWithShred[];
 /** React Query invalidation key — kasayı yenilemek için. */
 queryKey?: unknown[];
}

const TYPE_ICONS: Record<EvidenceType, typeof Mail> = {
 EMAIL: Mail,
 CHAT: MessageSquare,
 INVOICE: FileText,
 LOG: Server,
};

const TYPE_COLORS: Record<EvidenceType, string> = {
 EMAIL: 'bg-blue-50 text-blue-700 border-blue-200',
 CHAT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 INVOICE: 'bg-amber-50 text-amber-700 border-amber-200',
 LOG: 'bg-canvas text-slate-700 border-slate-200',
};

const AUTHORIZED_SHRED_ROLES = ['CAE', 'LEGAL'];

/** Tombstone — KVKK imhasından sonra gösterilecek mezar taşı bileşeni */
function ShredTombstone({ ev }: { ev: DigitalEvidenceWithShred }) {
 return (
 <div className="px-4 py-5 bg-slate-100 border-t border-slate-200">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-lg bg-slate-300 border border-slate-400 flex items-center justify-center shrink-0">
 <ShieldOff size={14} className="text-slate-500" />
 </div>
 <div className="space-y-1.5">
 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
 Kriptografik Olarak İmha Edildi
 </p>
 <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-lg">
 Bu veri{' '}
 <strong className="text-slate-600">
 {ev.shredded_at
 ? new Date(ev.shredded_at).toLocaleDateString('tr-TR', {
 day: 'numeric', month: 'long', year: 'numeric',
 hour: '2-digit', minute: '2-digit',
 })
 : 'bilinmeyen tarih'}
 </strong>{' '}
 tarihinde <em>yasal süre dolumu / KVKK talebi</em> nedeniyle kriptografik
 olarak imha edilmiştir. Adli log zinciri korunmaktadır.
 </p>
 {ev.shred_reason && (
 <p className="text-[10px] text-slate-400 italic">
 Gerekçe: {ev.shred_reason}
 </p>
 )}
 <div className="flex items-center gap-1.5 pt-0.5">
 <Hash size={10} className="text-slate-400" />
 <span className="text-[10px] font-mono text-slate-400">
 {ev.hash_sha256} (RFC-3161 korunuyor)
 </span>
 </div>
 </div>
 </div>
 </div>
 );
}

/** KVKK İmha Onay Modalı */
function ShredConfirmModal({
 evidenceId,
 onCancel,
 onConfirm,
 isPending,
}: {
 evidenceId: string;
 onCancel: () => void;
 onConfirm: (reason: string) => void;
 isPending: boolean;
}) {
 const [reason, setReason] = useState('');
 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4"
 style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
 onClick={onCancel}
 >
 <motion.div
 initial={{ scale: 0.95, y: 10 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.95, y: 10 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-surface rounded-2xl border border-red-300 shadow-2xl w-full max-w-md overflow-hidden"
 >
 <div className="flex items-start gap-3 px-5 py-4 border-b border-red-100 bg-red-50">
 <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
 <div>
 <h3 className="text-sm font-bold text-red-900 font-sans">
 KVKK Kriptografik İmha — Geri Alınamaz İşlem
 </h3>
 <p className="text-xs text-red-700 mt-0.5 font-sans">
 Bu işlem adli log zincirini bozmaz; yalnızca içerik erişimi kalıcı olarak kapatılır.
 </p>
 </div>
 <button onClick={onCancel} className="ml-auto text-red-400 hover:text-red-600">
 <X size={16} />
 </button>
 </div>

 <div className="p-5 space-y-4">
 <div>
 <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">
 İmha Gerekçesi <span className="text-red-500">*</span>
 </label>
 <textarea
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 rows={3}
 className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 font-sans
 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-canvas"
 placeholder="Örn: KVKK 7/1 gereği saklama süresinin dolması nedeniyle..."
 />
 </div>

 <p className="text-[10px] text-slate-400 font-mono italic">
 Kanıt ID: {evidenceId}
 </p>

 <div className="flex items-center gap-3 pt-1">
 <button
 onClick={onCancel}
 className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-canvas transition-colors font-sans"
 >
 İptal
 </button>
 <button
 onClick={() => reason.trim() && onConfirm(reason.trim())}
 disabled={!reason.trim() || isPending}
 className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700
 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
 >
 {isPending ? (
 <><Loader2 size={14} className="animate-spin" /> İmha ediliyor...</>
 ) : (
 <><Trash2 size={14} /> Kalıcı Olarak İmha Et</>
 )}
 </button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 );
}

export function EvidenceVault({ evidence, queryKey }: EvidenceVaultProps) {
 const queryClient = useQueryClient();
 const currentPersona = usePersonaStore((s) => s.currentPersona);
 const canShred = AUTHORIZED_SHRED_ROLES.includes(currentPersona ?? '');

 const [expandedId, setExpandedId] = useState<string | null>(null);
 const [shredTargetId, setShredTargetId] = useState<string | null>(null);

 const shredMutation = useMutation({
 mutationFn: ({ evidenceId, reason }: { evidenceId: string; reason: string }) =>
 shredEvidence({
 evidenceId,
 shredReason: reason,
 shredBy: currentPersona ?? 'CAE',
 }),
 onSuccess: () => {
 setShredTargetId(null);
 if (queryKey) queryClient.invalidateQueries({ queryKey });
 },
 });

 if (evidence.length === 0) {
 return (
 <div className="text-center py-5 text-sm text-slate-400">
 Henuz dijital kanit bulunmuyor. Dondurma protokolunu baslatın.
 </div>
 );
 }

 return (
 <>
 <div className="space-y-2">
 {(evidence || []).map((ev) => {
 const Icon = TYPE_ICONS[ev.type as EvidenceType] || Server;
 const isExpanded = expandedId === ev.id;
 const isShredded = ev.is_shredded === true;

 return (
 <div
 key={ev.id}
 className={clsx(
 'border rounded-xl overflow-hidden transition-all',
 isShredded
 ? 'bg-slate-50 border-slate-200 opacity-80'
 : ev.locked
 ? 'bg-surface border-slate-200'
 : 'bg-surface border-amber-300',
 )}
 >
 <button
 onClick={() => !isShredded && setExpandedId(isExpanded ? null : ev.id)}
 className={clsx(
 'w-full flex items-center gap-3 p-3 text-left transition-colors',
 isShredded
 ? 'cursor-default'
 : 'hover:bg-canvas/50',
 )}
 >
 <div
 className={clsx(
 'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
 isShredded
 ? 'bg-slate-100 text-slate-400 border-slate-200'
 : TYPE_COLORS[ev.type as EvidenceType],
 )}
 >
 {isShredded ? <ShieldOff size={14} /> : <Icon size={14} />}
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className={clsx(
 'text-xs font-bold',
 isShredded ? 'text-slate-400 line-through' : 'text-slate-800',
 )}>
 {EVIDENCE_TYPE_LABELS[ev.type as EvidenceType]}
 </span>
 <span className="text-[10px] text-slate-500">- {ev.source_system}</span>
 {ev.locked && !isShredded && (
 <Lock size={10} className="text-emerald-500" />
 )}
 {isShredded && (
 <span className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
 KVKK İmha
 </span>
 )}
 </div>
 <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
 SHA-256: {ev.hash_sha256.slice(0, 24)}...
 </span>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {/* KVKK İmha Butonu — yalnızca CAE/LEGAL, imha edilmemişse */}
 {canShred && !isShredded && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 setShredTargetId(ev.id);
 }}
 title="KVKK Kriptografik İmha"
 className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-200
 text-red-600 text-[10px] font-semibold hover:bg-red-100 transition-colors font-sans"
 >
 <Trash2 size={10} />
 KVKK İmha
 </button>
 )}
 <span className="text-[10px] text-slate-400">
 {new Date(ev.timestamp_rfc3161).toLocaleString('tr-TR')}
 </span>
 {!isShredded && (
 isExpanded
 ? <ChevronUp size={12} className="text-slate-400" />
 : <ChevronDown size={12} className="text-slate-400" />
 )}
 </div>
 </button>

 {/* Tombstone — imha edilmiş kanıt */}
 {isShredded && <ShredTombstone ev={ev} />}

 {/* Kanıt Detayı — yalnızca imha edilmemişse */}
 <AnimatePresence>
 {isExpanded && !isShredded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="px-3 pb-3 space-y-3 border-t border-slate-100 pt-3">
 <div className="flex items-center gap-4 text-[10px]">
 <div className="flex items-center gap-1 text-emerald-600">
 <ShieldCheck size={10} />
 <span>Butunluk Dogrulanmis</span>
 </div>
 <div className="flex items-center gap-1 text-slate-500">
 <Hash size={10} />
 <span className="font-mono">{ev.hash_sha256}</span>
 </div>
 </div>

 <div className="bg-slate-900 rounded-lg p-3 overflow-auto max-h-64">
 <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap">
 {JSON.stringify(ev.content_snapshot, null, 2)}
 </pre>
 </div>

 <div className="flex items-center justify-between text-[10px] text-slate-400">
 <span>Donduran: {ev.frozen_by}</span>
 <span>RFC 3161: {new Date(ev.timestamp_rfc3161).toISOString()}</span>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
 })}
 </div>

 {/* İmha Onay Modalı */}
 <AnimatePresence>
 {shredTargetId && (
 <ShredConfirmModal
 evidenceId={shredTargetId}
 onCancel={() => setShredTargetId(null)}
 onConfirm={(reason) =>
 shredMutation.mutate({ evidenceId: shredTargetId, reason })
 }
 isPending={shredMutation.isPending}
 />
 )}
 </AnimatePresence>
 </>
 );
}
