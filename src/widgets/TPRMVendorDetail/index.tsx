import { useVendor, useVendorAssessments } from '@/features/tprm';
import { AssessmentPanel } from './AssessmentPanel';
import {
  ArrowLeft, Building2, Shield, Globe, Calendar, Database,
  User, Mail, FileText, Loader2, AlertCircle, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

interface Props {
  vendorId: string;
  onBack: () => void;
}

const TIER_CFG: Record<string, { bg: string; text: string }> = {
  'Tier 1': { bg: 'bg-red-100', text: 'text-red-700' },
  'Tier 2': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Tier 3': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export const TPRMVendorDetail = ({ vendorId, onBack }: Props) => {
  const { data: vendor, isLoading } = useVendor(vendorId);
  const { data: assessments } = useVendorAssessments(vendorId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-sm">Tedarikcier bulunamadi</p>
        <button onClick={onBack} className="mt-3 text-blue-600 text-sm font-medium hover:underline">Geri Don</button>
      </div>
    );
  }

  const tierCfg = TIER_CFG[vendor.risk_tier] || TIER_CFG['Tier 3'];
  const scoreColor = vendor.criticality_score >= 80 ? 'text-red-600' : vendor.criticality_score >= 50 ? 'text-amber-600' : 'text-emerald-600';

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Tedarikcier Listesine Don
      </button>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Building2 size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{vendor.name}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  {vendor.category && <span>{vendor.category}</span>}
                  {vendor.country && (
                    <span className="flex items-center gap-1"><Globe size={12} /> {vendor.country}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={clsx('text-xs font-bold px-3 py-1.5 rounded-lg', tierCfg.bg, tierCfg.text)}>
                {vendor.risk_tier}
              </span>
              <div className="text-center">
                <div className={clsx('text-2xl font-black', scoreColor)}>{vendor.criticality_score}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400">Kritiklik</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
          <InfoItem icon={User} label="Ilgili Kisi" value={vendor.contact_person} />
          <InfoItem icon={Mail} label="E-posta" value={vendor.email} />
          <InfoItem icon={Calendar} label="Sozlesme Bitis" value={vendor.contract_end ? new Date(vendor.contract_end).toLocaleDateString('tr-TR') : null} />
          <InfoItem icon={Database} label="Veri Erisimi" value={vendor.data_access_level} />
        </div>

        {vendor.notes && (
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText size={13} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notlar</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{vendor.notes}</p>
          </div>
        )}

        {vendor.status === 'Under Review' && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold">
              <AlertTriangle size={14} />
              Bu tedarikcier suanda gozden gecirme surecindedir
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Shield size={16} className="text-slate-400" />
          Degerlendirmeler ({assessments?.length || 0})
        </h3>

        {!assessments?.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-400">Henuz degerlendirme olusturulmamis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((a) => (
              <AssessmentPanel key={a.id} assessment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} className="text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-medium text-slate-700">{value || '-'}</p>
    </div>
  );
}
