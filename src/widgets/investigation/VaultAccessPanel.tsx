import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, ShieldCheck, ShieldAlert, Lock, Unlock,
  Loader2, CheckCircle2, Clock, User,
} from 'lucide-react';
import clsx from 'clsx';
import type { VaultAccessRequest, VaultRole, VaultApproval } from '@/features/investigation/types';
import { VAULT_ROLE_LABELS, VAULT_ROLE_NAMES } from '@/features/investigation/types';
import { fetchVaultAccess, requestAccess, grantApproval } from '@/features/investigation/VaultGuard';

interface VaultAccessPanelProps {
  caseId: string;
  onUnlocked?: () => void;
}

const KEY_SLOTS: VaultRole[] = ['CAE', 'DEPUTY', 'MANAGER'];

const ROLE_COLORS: Record<VaultRole, { bg: string; border: string; text: string; glow: string }> = {
  CAE: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', glow: 'shadow-amber-200/50' },
  DEPUTY: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700', glow: 'shadow-sky-200/50' },
  MANAGER: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', glow: 'shadow-emerald-200/50' },
};

export function VaultAccessPanel({ caseId, onUnlocked }: VaultAccessPanelProps) {
  const [vaultRequest, setVaultRequest] = useState<VaultAccessRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<VaultRole | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVaultAccess(caseId);
      setVaultRequest(data);
    } catch (err) {
      console.error('Failed to load vault access:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { load(); }, [load]);

  const handleRequestAccess = useCallback(async () => {
    try {
      const req = await requestAccess(caseId, 'Mevcut Kullanici');
      setVaultRequest(req);
    } catch (err) {
      console.error('Failed to request access:', err);
    }
  }, [caseId]);

  const handleApprove = useCallback(async (role: VaultRole) => {
    if (!vaultRequest) return;
    setApproving(role);
    try {
      const { request: updated, unlocked } = await grantApproval(vaultRequest.id, role);
      setVaultRequest(updated);
      if (unlocked) onUnlocked?.();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApproving(null);
    }
  }, [vaultRequest, onUnlocked]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const approvals = (vaultRequest?.approvals || []) as VaultApproval[];
  const isUnlocked = vaultRequest?.status === 'UNLOCKED';
  const isPending = vaultRequest?.status === 'PENDING';

  return (
    <div className="space-y-5">
      <div className={clsx(
        'rounded-xl border-2 p-5 transition-all',
        isUnlocked
          ? 'bg-emerald-50/50 border-emerald-300'
          : 'bg-slate-950 border-slate-800',
      )}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Unlock size={20} className="text-emerald-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Lock size={20} className="text-red-400" />
              </div>
            )}
            <div>
              <h3 className={clsx(
                'text-sm font-bold',
                isUnlocked ? 'text-emerald-800' : 'text-slate-200',
              )}>
                Adli Kasa - Coklu Anahtar Protokolu
              </h3>
              <p className={clsx(
                'text-[10px] mt-0.5',
                isUnlocked ? 'text-emerald-600' : 'text-slate-500',
              )}>
                {isUnlocked
                  ? `Kasa acildi: ${new Date(vaultRequest!.unlocked_at!).toLocaleString('tr-TR')}`
                  : 'Erisim icin 3 anahtardan 2 si gereklidir'
                }
              </p>
            </div>
          </div>

          {isUnlocked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 rounded-full"
            >
              <ShieldCheck size={12} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700">ERISIM ACIK</span>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {KEY_SLOTS.map((role) => {
            const colors = ROLE_COLORS[role];
            const approval = approvals.find((a) => a.role === role);
            const isApproved = !!approval;
            const isCurrentlyApproving = approving === role;

            return (
              <motion.div
                key={role}
                layout
                className={clsx(
                  'relative rounded-xl border-2 p-4 transition-all',
                  isApproved
                    ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                    : isUnlocked
                      ? 'bg-white/60 border-slate-200'
                      : 'bg-slate-900 border-slate-700',
                )}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={clsx(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                    isApproved
                      ? `${colors.bg} border-2 ${colors.border}`
                      : isUnlocked
                        ? 'bg-slate-100 border-2 border-slate-200'
                        : 'bg-slate-800 border-2 border-slate-600',
                  )}>
                    <AnimatePresence mode="wait">
                      {isApproved ? (
                        <motion.div
                          key="approved"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <KeyRound size={24} className={colors.text} />
                        </motion.div>
                      ) : isCurrentlyApproving ? (
                        <motion.div key="loading">
                          <Loader2 size={24} className="text-slate-400 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div key="locked">
                          <Lock size={24} className={isUnlocked ? 'text-slate-300' : 'text-slate-600'} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <span className={clsx(
                      'text-[10px] font-bold block',
                      isApproved ? colors.text : isUnlocked ? 'text-slate-500' : 'text-slate-400',
                    )}>
                      {VAULT_ROLE_LABELS[role]}
                    </span>
                    <span className={clsx(
                      'text-[9px] block mt-0.5',
                      isApproved ? colors.text + '/70' : 'text-slate-500',
                    )}>
                      {VAULT_ROLE_NAMES[role]}
                    </span>
                  </div>

                  {isApproved ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={10} className={colors.text} />
                      <span className={clsx('text-[9px] font-medium', colors.text)}>
                        {new Date(approval.approved_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : isPending ? (
                    <button
                      onClick={() => handleApprove(role)}
                      disabled={isCurrentlyApproving}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                    >
                      <KeyRound size={10} />
                      Onayla
                    </button>
                  ) : !vaultRequest ? (
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-slate-500" />
                      <span className="text-[9px] text-slate-500">Bekliyor</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400">-</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={clsx(
          'mt-4 flex items-center justify-between px-3 py-2 rounded-lg',
          isUnlocked ? 'bg-emerald-100/60' : 'bg-slate-900',
        )}>
          <div className="flex items-center gap-2">
            <ShieldAlert size={12} className={isUnlocked ? 'text-emerald-600' : 'text-amber-500'} />
            <span className={clsx(
              'text-[10px]',
              isUnlocked ? 'text-emerald-700' : 'text-slate-400',
            )}>
              {isUnlocked
                ? `${approvals.length}/${KEY_SLOTS.length} anahtar kullanildi - Kasa acik`
                : `${approvals.length}/${vaultRequest?.required_approvals || 2} onay gerekli`
              }
            </span>
          </div>

          {!vaultRequest && (
            <button
              onClick={handleRequestAccess}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-500 transition-colors"
            >
              <Lock size={10} />
              Erisim Talep Et
            </button>
          )}
        </div>

        {vaultRequest && (
          <div className={clsx(
            'mt-3 px-3 py-2 rounded-lg',
            isUnlocked ? 'bg-white/60' : 'bg-slate-900',
          )}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <User size={10} className={isUnlocked ? 'text-slate-500' : 'text-slate-500'} />
              <span className={clsx(
                'text-[9px] font-bold',
                isUnlocked ? 'text-slate-600' : 'text-slate-400',
              )}>
                Talep Eden: {vaultRequest.requested_by}
              </span>
            </div>
            <span className={clsx(
              'text-[9px]',
              isUnlocked ? 'text-slate-500' : 'text-slate-500',
            )}>
              Talep: {new Date(vaultRequest.created_at).toLocaleString('tr-TR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
