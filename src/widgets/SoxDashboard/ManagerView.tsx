import { useState, useCallback } from 'react';
import {
  useSoxCampaigns, useControlsWithAttestations, useSoxIncidents,
  useSignAttestation, computeSHA256, buildSnapshotPayload,
  type ControlWithAttestation, type SkepticChallenge,
} from '@/entities/sox';
import { evaluateSkepticChallenge, SkepticChallengeModal } from '@/features/sox';
import {
  ShieldCheck, CheckCircle, XCircle, Clock, Lock,
  AlertTriangle, Loader2, FileText,
} from 'lucide-react';
import clsx from 'clsx';

export const ManagerView = () => {
  const { data: campaigns, isLoading } = useSoxCampaigns();
  const activeCampaign = campaigns?.find((c) => c.status === 'Active');
  const { data: controls } = useControlsWithAttestations(activeCampaign?.id);
  const { data: allIncidents } = useSoxIncidents();
  const signMutation = useSignAttestation();

  const [signingControl, setSigningControl] = useState<ControlWithAttestation | null>(null);
  const [status, setStatus] = useState<'Effective' | 'Ineffective' | 'Not_Tested'>('Effective');
  const [comment, setComment] = useState('');
  const [challenge, setChallenge] = useState<SkepticChallenge | null>(null);
  const [justification, setJustification] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const openSignForm = (ctrl: ControlWithAttestation) => {
    setSigningControl(ctrl);
    setStatus('Effective');
    setComment('');
    setChallenge(null);
    setJustification('');
  };

  const closeSignForm = () => {
    setSigningControl(null);
    setChallenge(null);
  };

  const handleSign = useCallback(async (overrideChallenge = false) => {
    if (!signingControl || !activeCampaign) return;

    if (!overrideChallenge && status === 'Effective' && allIncidents) {
      const result = evaluateSkepticChallenge(
        signingControl.code,
        signingControl.department,
        status,
        allIncidents,
      );
      if (result.triggered) {
        setChallenge(result);
        return;
      }
    }

    setIsSigning(true);
    try {
      const finalComment = challenge
        ? `${comment}\n\n[AI ITIRAZ YANITI]: ${justification}`
        : comment;

      const snapshot = buildSnapshotPayload(signingControl, {
        status,
        attester_name: signingControl.assigned_to || 'Bilinmeyen',
        campaign_period: activeCampaign.period,
        manager_comment: finalComment,
      });

      const hash = await computeSHA256(snapshot);

      await signMutation.mutateAsync({
        campaign_id: activeCampaign.id,
        control_id: signingControl.id,
        attester_name: signingControl.assigned_to || 'Bilinmeyen',
        status,
        manager_comment: finalComment,
        ai_challenge: challenge?.message || null,
        ai_challenge_resolved: !!challenge,
        snapshot_json: snapshot,
        record_hash: hash,
      });

      closeSignForm();
    } finally {
      setIsSigning(false);
    }
  }, [signingControl, activeCampaign, status, comment, challenge, justification, allIncidents, signMutation]);

  const handleOverride = async () => {
    await handleSign(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!activeCampaign) {
    return <div className="p-8 text-center text-sm text-slate-500">Aktif kampanya yok</div>;
  }

  const pending = (controls || []).filter((c) => !c.attestation);
  const completed = (controls || []).filter((c) => c.attestation);

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} />
            <div>
              <h3 className="font-bold text-sm">{activeCampaign.title}</h3>
              <span className="text-xs text-slate-400">{activeCampaign.period}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black">{completed.length}/{(controls || []).length}</div>
            <div className="text-[10px] text-slate-400">Tamamlanan</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock size={12} />
          Bekleyen Beyanlar ({pending.length})
        </h4>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Kod</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Kontrol</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Kategori</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Agirlik</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Sorumlu</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Olaylar</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Islem</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((ctrl) => (
                <tr key={ctrl.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-bold text-slate-700">{ctrl.code}</span>
                    {ctrl.is_key_control && (
                      <span className="ml-1 text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">K</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 max-w-xs truncate">{ctrl.description}</td>
                  <td className="px-3 py-2.5">
                    <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', categoryColor(ctrl.category))}>
                      {ctrl.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-bold text-slate-700">{ctrl.risk_weight}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600">{ctrl.assigned_to}</td>
                  <td className="px-3 py-2.5">
                    {ctrl.incidents.length > 0 ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {ctrl.incidents.length}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300">0</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => openSignForm(ctrl)}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                    >
                      Imzala
                    </button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-xs text-slate-400">Tum beyanlar tamamlanmis</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Lock size={12} />
          Imzalanmis Beyanlar ({completed.length})
        </h4>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Kod</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Durum</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Imzalayan</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">AI</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Hash</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((ctrl) => {
                const att = ctrl.attestation!;
                return (
                  <tr key={ctrl.id} className="border-b border-slate-100">
                    <td className="px-3 py-2.5 text-xs font-bold text-slate-700">{ctrl.code}</td>
                    <td className="px-3 py-2.5">
                      <span className={clsx(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1',
                        att.status === 'Effective' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                      )}>
                        {att.status === 'Effective' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {att.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">{att.attester_name}</td>
                    <td className="px-3 py-2.5">
                      {att.ai_challenge ? (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Itiraz</span>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Lock size={9} className="text-slate-300" />
                      {att.record_hash?.slice(0, 12)}...
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-400">
                      {new Date(att.signed_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {signingControl && !challenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeSignForm} />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-slate-800 text-white p-4 flex items-center gap-3">
              <FileText size={18} />
              <div>
                <h3 className="font-bold text-sm">Beyan Imzala: {signingControl.code}</h3>
                <p className="text-[10px] text-slate-400">Cryo-Chamber ile dondurulan kayit</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700">{signingControl.description}</div>

              {signingControl.incidents.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-[10px] font-bold text-amber-700 mb-1 flex items-center gap-1">
                    <AlertTriangle size={11} />
                    Iliskili Olaylar ({signingControl.incidents.length})
                  </div>
                  {signingControl.incidents.map((inc) => (
                    <div key={inc.id} className="text-[10px] text-amber-600 mt-1">
                      [{inc.severity}] {inc.title}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Beyan Durumu</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Effective', 'Ineffective', 'Not_Tested'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={clsx(
                        'py-2 rounded-lg text-xs font-bold border-2 transition-all',
                        status === s
                          ? s === 'Effective' ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : s === 'Ineffective' ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-slate-500 bg-slate-50 text-slate-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300',
                      )}
                    >
                      {s === 'Effective' ? 'Etkin' : s === 'Ineffective' ? 'Etkin Degil' : 'Test Edilmedi'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Yonetici Aciklamasi</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Beyaniniz icin gerekce giriniz..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-[10px] text-slate-500 flex items-center gap-2">
                <Lock size={12} className="text-slate-400" />
                Bu kayit SHA-256 ile hash'lenecek ve degistirilemez olarak saklanacaktir.
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
              <button onClick={closeSignForm} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                Vazgec
              </button>
              <button
                onClick={() => handleSign(false)}
                disabled={isSigning || !comment.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                {isSigning ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Imzala ve Dondur
              </button>
            </div>
          </div>
        </div>
      )}

      {challenge && (
        <SkepticChallengeModal
          challenge={challenge}
          justification={justification}
          onJustificationChange={setJustification}
          onOverride={handleOverride}
          onCancel={() => setChallenge(null)}
        />
      )}
    </div>
  );
};

function categoryColor(cat: string): string {
  switch (cat) {
    case 'IT': return 'bg-blue-50 text-blue-700';
    case 'Financial': return 'bg-emerald-50 text-emerald-700';
    case 'Compliance': return 'bg-teal-50 text-teal-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}
