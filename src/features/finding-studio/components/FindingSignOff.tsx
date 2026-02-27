import { useState } from 'react';
import { CheckCircle, PenTool, Shield, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useSignoffs, type SignoffInput } from '../api/useSignoffs';

interface FindingSignOffProps {
  findingId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'AUDITOR' | 'MANAGER' | 'HEAD_OF_AUDIT';
  tenantId: string;
  riskLevel?: 'critical' | 'high' | 'medium' | 'low';
}

export function FindingSignOff({
  findingId,
  currentUserId,
  currentUserName,
  currentUserRole,
  tenantId,
  riskLevel = 'medium',
}: FindingSignOffProps) {
  const { signoffs, signing, signFinding, hasSigned, getSignoff } = useSignoffs(findingId);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comments, setComments] = useState('');
  const [pendingRole, setPendingRole] = useState<'REVIEWER' | 'APPROVER' | null>(null);

  // Check if critical/high risk (requires approver)
  const requiresApprover = riskLevel === 'critical' || riskLevel === 'high';

  // Get signoff data
  const preparerSignoff = getSignoff('PREPARER');
  const reviewerSignoff = getSignoff('REVIEWER');
  const approverSignoff = getSignoff('APPROVER');

  // Can current user sign?
  const canSignReviewer = currentUserRole === 'MANAGER' && !hasSigned('REVIEWER');
  const canSignApprover = currentUserRole === 'HEAD_OF_AUDIT' && !hasSigned('APPROVER') && requiresApprover;

  const handleSignClick = (role: 'REVIEWER' | 'APPROVER') => {
    setPendingRole(role);
    setShowCommentModal(true);
  };

  const handleConfirmSign = async () => {
    if (!pendingRole) return;

    const input: SignoffInput = {
      finding_id: findingId,
      role: pendingRole,
      user_id: currentUserId,
      user_name: currentUserName,
      user_title: pendingRole === 'REVIEWER' ? 'Denetim Müdürü' : 'İç Denetim Başkanı',
      tenant_id: tenantId,
      comments: comments.trim() || undefined,
    };

    const result = await signFinding(input);
    if (result.success) {
      setShowCommentModal(false);
      setComments('');
      setPendingRole(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Onay Zinciri</h2>
          <p className="text-sm text-slate-600">GIAS 2024 - Resmi İmza Kaydı</p>
        </div>
      </div>

      {/* Warning if not signed */}
      {!hasSigned('REVIEWER') && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <strong>Onay Bekliyor:</strong> Bu bulgu henüz yönetici tarafından gözden geçirilmemiştir.
            Mutabakat aşamasına geçiş için yönetici onayı zorunludur.
          </div>
        </div>
      )}

      {/* Signature Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* PREPARER */}
        <SignatureSlot
          title="Hazırlayan"
          subtitle="(Denetçi)"
          signoff={preparerSignoff}
          icon={PenTool}
          iconColor="text-blue-600"
          canSign={false}
          onSign={() => {}}
        />

        {/* REVIEWER */}
        <SignatureSlot
          title="Gözden Geçiren"
          subtitle="(Denetim Müdürü)"
          signoff={reviewerSignoff}
          icon={CheckCircle}
          iconColor="text-green-600"
          canSign={canSignReviewer}
          onSign={() => handleSignClick('REVIEWER')}
          signing={signing && pendingRole === 'REVIEWER'}
        />

        {/* APPROVER (conditional) */}
        {requiresApprover && (
          <SignatureSlot
            title="Onaylayan"
            subtitle="(İç Denetim Başkanı)"
            signoff={approverSignoff}
            icon={Shield}
            iconColor="text-purple-600"
            canSign={canSignApprover}
            onSign={() => handleSignClick('APPROVER')}
            signing={signing && pendingRole === 'APPROVER'}
          />
        )}

        {/* Empty slot if no approver needed */}
        {!requiresApprover && (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-xs font-semibold">Onay Gerekmez</div>
              <div className="text-xs">(Orta/Düşük Risk)</div>
            </div>
          </div>
        )}
      </div>

      {/* Legal Notice */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 text-center">
          Bu imzalar dijital olarak kaydedilmiştir ve değiştirilemez. İmza zamanı sunucu saatine göredir.
          GIAS 2024 Standardı Madde 8.3 uyarınca düzenlenmiştir.
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">İmza Onayı</h3>

            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Gözden Geçirme Yorumu (Opsiyonel)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="İnceleme notlarınızı ekleyin..."
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-900">
              <strong>Dikkat:</strong> İmzaladıktan sonra bu işlem geri alınamaz.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setPendingRole(null);
                  setComments('');
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmSign}
                disabled={signing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signing ? 'İmzalanıyor...' : 'E-İmzala'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SignatureSlotProps {
  title: string;
  subtitle: string;
  signoff?: {
    user_name: string;
    user_title?: string;
    signed_at: string;
    comments?: string;
  };
  icon: React.ElementType;
  iconColor: string;
  canSign: boolean;
  onSign: () => void;
  signing?: boolean;
}

function SignatureSlot({
  title,
  subtitle,
  signoff,
  icon: Icon,
  iconColor,
  canSign,
  onSign,
  signing = false,
}: SignatureSlotProps) {
  return (
    <div
      className={clsx(
        'border-2 rounded-lg p-6 transition-all',
        signoff
          ? 'border-green-500 bg-green-50/50'
          : canSign
          ? 'border-blue-300 bg-blue-50/30 hover:border-blue-500 cursor-pointer'
          : 'border-slate-200 bg-slate-50'
      )}
      onClick={canSign ? onSign : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Icon className={clsx('w-5 h-5', signoff ? 'text-green-600' : iconColor)} />
        <div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {title}
          </div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>

      {/* Signature or Button */}
      {signoff ? (
        <div>
          {/* Wet signature style */}
          <div
            className="text-2xl mb-2 text-blue-900"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {signoff.user_name}
          </div>
          <div className="text-xs text-slate-600 mb-1">{signoff.user_title}</div>
          <div className="text-xs text-slate-500 font-mono">
            {new Date(signoff.signed_at).toLocaleString('tr-TR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {signoff.comments && (
            <div className="mt-3 pt-3 border-t border-green-200 text-xs text-slate-700 italic">
              "{signoff.comments}"
            </div>
          )}
          <div className="mt-3 flex items-center gap-1 text-xs text-green-700 font-semibold">
            <CheckCircle className="w-3 h-3" />
            E-İmzalandı
          </div>
        </div>
      ) : canSign ? (
        <button
          onClick={onSign}
          disabled={signing}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
        >
          {signing ? 'İmzalanıyor...' : 'Gözden Geçir & İmzala'}
        </button>
      ) : (
        <div className="text-center text-slate-400 py-4">
          <div className="text-xs font-semibold">İmza Bekliyor</div>
          <div className="text-xs mt-1">Henüz imzalanmadı</div>
        </div>
      )}
    </div>
  );
}

// Add Google Font for wet signature effect
const styleElement = document.createElement('style');
styleElement.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
`;
if (!document.querySelector('style[data-signature-font]')) {
  styleElement.setAttribute('data-signature-font', 'true');
  document.head.appendChild(styleElement);
}
