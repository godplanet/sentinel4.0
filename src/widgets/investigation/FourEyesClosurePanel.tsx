/**
 * Dört Göz İlkesi (Four-Eyes Principle) — Gizli Soruşturma Raporu Kapatma
 *
 * Akış:
 * 1. CAE onayı → status: PENDING_LEGAL
 * 2. Baş Hukuk Müşaviri (LEGAL) onayı → status: SEALED + WORM hash
 *
 * İki onay tamamlanmadan rapor mühürlenemez.
 */

import { usePersonaStore } from '@/entities/user/model/persona-store';
import {
 approveByCae,
 approveByLegal,
 fetchCaseApprovalStatus,
} from '@/features/investigation/api/four-eyes-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 CheckCircle2,
 Clock,
 Eye,
 Gavel,
 Hash,
 Loader2,
 Lock,
 Shield, ShieldCheck,
 UserCheck,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
 caseId: string;
 caseTitle: string;
 /** Rapor içeriği — WORM hash için JSON.stringify edilir */
 casePayload: string;
}

const STEP_CONFIG = [
 {
 key: 'cae',
 label: 'Baş Denetçi (CAE) Onayı',
 role: 'CAE',
 icon: Shield,
 color: 'blue',
 },
 {
 key: 'legal',
 label: 'Baş Hukuk Müşaviri Onayı',
 role: 'LEGAL',
 icon: Gavel,
 color: 'purple',
 },
] as const;

export function FourEyesClosurePanel({ caseId, caseTitle, casePayload }: Props) {
 const qc = useQueryClient();
 const { role, name: personaName } = usePersonaStore();

 const [approverNote, setApproverNote] = useState('');
 const [confirmChecked, setConfirmChecked] = useState(false);

 const { data: approvalStatus, isLoading } = useQuery({
 queryKey: ['case-approval', caseId],
 queryFn: () => fetchCaseApprovalStatus(caseId),
 refetchInterval: 10_000,
 });

 const caeApproved = !!approvalStatus?.cae_approved_at;
 const legalApproved = !!approvalStatus?.legal_approved_at;
 const isSealed = approvalStatus?.status === 'SEALED';

 const caeMutation = useMutation({
 mutationFn: () => approveByCae(caseId, personaName || role || 'CAE'),
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ['case-approval', caseId] });
 setApproverNote('');
 setConfirmChecked(false);
 },
 });

 const legalMutation = useMutation({
 mutationFn: () =>
 approveByLegal(caseId, personaName || role || 'LEGAL', casePayload),
 onSuccess: () => {
 qc.invalidateQueries({ queryKey: ['case-approval', caseId] });
 },
 });

 const canCaeApprove = role === 'CAE' && !caeApproved && !isSealed;
 const canLegalApprove = (role === 'LEGAL' || role === 'CAE') && caeApproved && !legalApproved && !isSealed;

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-16">
 <Loader2 size={20} className="animate-spin text-slate-400" />
 </div>
 );
 }

 return (
 <div className="space-y-6 max-w-2xl mx-auto">

 {/* Başlık */}
 <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
 <Eye size={18} className="text-purple-400" />
 </div>
 <div>
 <h2 className="text-sm font-bold text-white">Dört Göz İlkesi — Kapanış Onayı</h2>
 <p className="text-[10px] text-slate-500 mt-0.5">{caseTitle}</p>
 </div>
 </div>
 <p className="text-xs text-slate-400 leading-relaxed">
 Gizli soruşturma raporları yalnızca{' '}
 <span className="text-purple-300 font-semibold">CAE</span> ve{' '}
 <span className="text-purple-300 font-semibold">Baş Hukuk Müşaviri</span>'nin
 ardışık onayıyla WORM mühürlenebilir. Tek imza yeterli değildir.
 </p>
 </div>

 {/* WORM Mühür Ekranı */}
 <AnimatePresence>
 {isSealed && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-slate-900 border border-emerald-700/50 rounded-2xl p-4 text-center space-y-4"
 >
 <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
 <Lock size={28} className="text-emerald-400" />
 </div>
 <h3 className="text-base font-bold text-white">Rapor WORM Mühürü ile Kapatıldı</h3>
 <p className="text-xs text-slate-500">
 {approvalStatus?.worm_sealed_at &&
 new Date(approvalStatus.worm_sealed_at).toLocaleString('tr-TR')} tarihinde mühürlendi.
 </p>
 {approvalStatus?.worm_hash && (
 <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
 <div className="flex items-center gap-2 mb-2 justify-center">
 <Hash size={12} className="text-emerald-500" />
 <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
 SHA-256 WORM Hash
 </span>
 </div>
 <code className="text-[11px] font-mono text-emerald-400 break-all leading-relaxed block">
 {approvalStatus.worm_hash}
 </code>
 </div>
 )}
 <div className="text-[10px] text-slate-600">
 Adli log zinciri korunmaktadır. Bu rapor artık değiştirilemez.
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Onay Adımları */}
 {!isSealed && (
 <div className="space-y-4">
 {(STEP_CONFIG || []).map((step, idx) => {
 const stepApproved = idx === 0 ? caeApproved : legalApproved;
 const approvedAt = idx === 0
 ? approvalStatus?.cae_approved_at
 : approvalStatus?.legal_approved_at;
 const approvedBy = idx === 0
 ? approvalStatus?.cae_approved_by
 : approvalStatus?.legal_approved_by;

 const isLocked = idx === 1 && !caeApproved;
 const isActiveStep =
 (idx === 0 && canCaeApprove) || (idx === 1 && canLegalApprove);
 const Icon = step.icon;

 const colorMap = {
 blue: {
 border: stepApproved ? 'border-blue-700/50' : isActiveStep ? 'border-blue-600/40' : 'border-slate-700',
 bg: stepApproved ? 'bg-blue-900/20' : 'bg-slate-900',
 badge: stepApproved ? 'bg-blue-900/40 text-blue-400' : isActiveStep ? 'bg-blue-900/20 text-blue-400' : 'bg-slate-800 text-slate-500',
 icon: stepApproved ? 'text-blue-400' : isActiveStep ? 'text-blue-400' : 'text-slate-600',
 },
 purple: {
 border: stepApproved ? 'border-purple-700/50' : isActiveStep ? 'border-purple-600/40' : 'border-slate-700',
 bg: stepApproved ? 'bg-purple-900/20' : 'bg-slate-900',
 badge: stepApproved ? 'bg-purple-900/40 text-purple-400' : isActiveStep ? 'bg-purple-900/20 text-purple-400' : 'bg-slate-800 text-slate-500',
 icon: stepApproved ? 'text-purple-400' : isActiveStep ? 'text-purple-400' : 'text-slate-600',
 },
 };
 const colors = colorMap[step.color];

 return (
 <div
 key={step.key}
 className={clsx(
 'rounded-2xl border p-5 transition-all',
 colors.border,
 colors.bg,
 )}
 >
 <div className="flex items-center gap-3 mb-3">
 <div className={clsx('p-2 rounded-lg border', colors.badge)}>
 {stepApproved
 ? <CheckCircle2 size={16} className={colors.icon} />
 : <Icon size={16} className={colors.icon} />
 }
 </div>
 <div className="flex-1">
 <p className="text-sm font-bold text-white">{step.label}</p>
 <p className="text-[10px] text-slate-500 mt-0.5">
 Gerekli rol: <span className="font-mono">{step.role}</span>
 </p>
 </div>
 <span className={clsx(
 'px-2.5 py-1 rounded-full text-[10px] font-bold',
 stepApproved
 ? 'bg-emerald-900/40 text-emerald-400'
 : isLocked
 ? 'bg-slate-800 text-slate-500'
 : isActiveStep
 ? 'bg-amber-900/40 text-amber-400 animate-pulse'
 : 'bg-slate-800 text-slate-500',
 )}>
 {stepApproved ? 'ONAYLANDI' : isLocked ? 'KİLİTLİ' : isActiveStep ? 'BEKLİYOR' : 'BEKLEMEDE'}
 </span>
 </div>

 {stepApproved && approvedBy && (
 <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
 <UserCheck size={11} />
 <span>
 <span className="text-slate-300 font-medium">{approvedBy}</span>
 {approvedAt && ` — ${new Date(approvedAt).toLocaleString('tr-TR')}`}
 </span>
 </div>
 )}

 {isLocked && (
 <div className="flex items-center gap-2 mt-2">
 <Lock size={12} className="text-slate-600" />
 <span className="text-[11px] text-slate-600">
 CAE onayı tamamlanmadan bu adım kilidi açılmaz.
 </span>
 </div>
 )}

 {isActiveStep && (
 <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
 <p className="text-[11px] text-slate-400">
 {idx === 1
 ? 'Onay verdiğinizde rapor SHA-256 WORM hash ile kalıcı olarak mühürlenecektir.'
 : 'Onay verdiğinizde dava PENDING_LEGAL statüsüne geçecek ve Hukuk biriminden ikinci imza beklenecektir.'
 }
 </p>

 <label className="flex items-start gap-3 cursor-pointer group">
 <div className={clsx(
 'mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all',
 confirmChecked
 ? (step.color === 'blue' ? 'bg-blue-500 border-blue-500' : 'bg-purple-500 border-purple-500')
 : 'border-slate-600 group-hover:border-slate-400',
 )}>
 {confirmChecked && <CheckCircle2 size={10} className="text-white" />}
 </div>
 <input
 type="checkbox"
 className="sr-only"
 checked={confirmChecked}
 onChange={(e) => setConfirmChecked(e.target.checked)}
 />
 <span className="text-[11px] text-slate-400 leading-relaxed">
 Soruşturma dosyasını inceledim, bu onayın hukuki ve idari sonuçlarını
 kabul ediyorum.
 </span>
 </label>

 <button
 disabled={
 !confirmChecked ||
 caeMutation.isPending ||
 legalMutation.isPending
 }
 onClick={() => idx === 0 ? caeMutation.mutate() : legalMutation.mutate()}
 className={clsx(
 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all',
 confirmChecked
 ? step.color === 'blue'
 ? 'bg-blue-600 hover:bg-blue-500 text-white'
 : 'bg-purple-600 hover:bg-purple-500 text-white'
 : 'bg-slate-800 text-slate-500 cursor-not-allowed',
 )}
 >
 {(caeMutation.isPending || legalMutation.isPending)
 ? <Loader2 size={13} className="animate-spin" />
 : <ShieldCheck size={13} />
 }
 {idx === 0 ? 'CAE Onayı Ver' : 'Hukuki Onay Ver — WORM Mühürle'}
 </button>

 {(caeMutation.isError || legalMutation.isError) && (
 <div className="flex items-center gap-2 text-[11px] text-red-400">
 <AlertTriangle size={12} />
 Onay kaydedilemedi. Lütfen tekrar deneyin.
 </div>
 )}
 </div>
 )}

 {!isActiveStep && !stepApproved && !isLocked && (
 <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
 <Clock size={11} />
 Bu onayı vermek için gerekli role sahip değilsiniz.
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
