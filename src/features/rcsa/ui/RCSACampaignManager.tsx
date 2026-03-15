import { SurveyBuilder } from '@/features/rcsa/ui/SurveyBuilder';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Activity, Flag, Plus, Rocket, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
 createRCSACampaign,
 fetchRCSACampaigns,
 RCSACampaign,
} from '../api/rcsa-campaigns';

interface LaunchFormState {
 title: string;
 startDate: string;
 endDate: string;
}

const initialForm: LaunchFormState = {
 title: '',
 startDate: '',
 endDate: '',
};

function formatDate(value: string | null): string {
 if (!value) return 'Tarih yok';
 const d = new Date(value);
 if (Number.isNaN(d.getTime())) return value;
 return d.toLocaleDateString('tr-TR');
}

function getRiskDriftLabel(campaign: RCSACampaign): string {
 const rate = campaign.completion_rate ?? 0;
 if (rate >= 80) return 'Düşük Sapma';
 if (rate >= 40) return 'Kontrollü Sapma';
 return 'Yüksek Sapma';
}

export const RCSACampaignManager = () => {
 const [isLaunchOpen, setIsLaunchOpen] = useState(false);
 const [activeSurveyCampaignId, setActiveSurveyCampaignId] = useState<string | null>(null);
 const [form, setForm] = useState<LaunchFormState>(initialForm);
 const queryClient = useQueryClient();

 const { data: campaigns, isLoading } = useQuery({
 queryKey: ['rcsa-campaigns'],
 queryFn: fetchRCSACampaigns,
 });

 const launchMutation = useMutation({
 mutationFn: () =>
 createRCSACampaign({
 title: form.title,
 startDate: form.startDate || undefined,
 endDate: form.endDate || undefined,
 }),
 onSuccess: () => {
 void queryClient.invalidateQueries({ queryKey: ['rcsa-campaigns'] });
 toast.success('Yeni RCSA kampanyası fırlatıldı.');
 setIsLaunchOpen(false);
 setForm(initialForm);
 },
 onError: (err: Error & { message?: string }) => {
 const msg = err?.message ?? 'Kampanya oluşturulurken bir hata oluştu.';
 toast.error(msg);
 },
 });

 const totalCampaigns = campaigns?.length ?? 0;
 const activeCount = campaigns?.filter((c) => c.status === 'ACTIVE').length ?? 0;
 const avgCompletion =
 totalCampaigns === 0
 ? 0
 : Math.round(
 (campaigns?.reduce((sum, c) => sum + (c.completion_rate ?? 0), 0) ?? 0) /
 totalCampaigns,
 );

 const handleFieldChange = (field: keyof LaunchFormState, value: string) => {
 setForm((prev) => ({ ...prev, [field]: value }));
 };

 const handleLaunch = (event: React.FormEvent) => {
 event.preventDefault();
 if (!form.title.trim()) {
 toast.error('Kampanya başlığı zorunludur.');
 return;
 }
 launchMutation.mutate();
 };

 return (
 <div className="space-y-4">
 {/* Özet Metrikler */}
 <div className="grid gap-4 md:grid-cols-3">
 <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
 Aktif Kampanya
 </p>
 <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
 <Rocket className="h-5 w-5" />
 </div>
 </div>
 <p className="mt-3 text-xs text-slate-500">
 Canlı olarak devam eden RCSA dalga sayısı.
 </p>
 </div>

 <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
 Ortalama Tamamlanma
 </p>
 <p className="mt-1 text-2xl font-bold text-slate-900">%{avgCompletion}</p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
 <Activity className="h-5 w-5" />
 </div>
 </div>
 <p className="mt-3 text-xs text-slate-500">
 Tüm kampanyalar bazında ortalama self-assessment tamamlama oranı.
 </p>
 </div>

 <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
 Toplam Kampanya
 </p>
 <p className="mt-1 text-2xl font-bold text-slate-900">{totalCampaigns}</p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
 <Flag className="h-5 w-5" />
 </div>
 </div>
 <p className="mt-3 text-xs text-slate-500">
 Tarihçe boyunca başlatılmış RCSA kampanya sayısı.
 </p>
 </div>
 </div>

 {/* Launch CTA */}
 <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-canvas px-4 py-3">
 <div>
 <p className="text-sm font-semibold text-slate-800">
 Yeni RCSA Kampanyası Fırlat
 </p>
 <p className="text-xs text-slate-500">
 İş birimlerinden risk & kontrol self-assessment verisini dalga bazlı toplayın.
 </p>
 </div>
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 setIsLaunchOpen(true);
 }}
 className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
 aria-label="Yeni RCSA kampanyası fırlat"
 >
 <Plus className="h-4 w-4" />
 Launch Campaign
 </button>
 </div>

 {/* Kampanya Listesi */}
 <div className="rounded-2xl border border-slate-200 bg-surface shadow-sm">
 <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
 <h2 className="text-sm font-semibold text-slate-800">
 RCSA Kampanyaları
 </h2>
 <span className="text-xs text-slate-500">
 {totalCampaigns === 0
 ? 'Henüz kampanya başlatılmadı.'
 : `${totalCampaigns} kampanya listeleniyor`}
 </span>
 </div>

 {isLoading ? (
 <div className="flex items-center justify-center py-10 text-sm text-slate-500">
 Kampanyalar yükleniyor...
 </div>
 ) : totalCampaigns === 0 ? (
 <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-slate-500">
 <ShieldAlert className="h-6 w-6 text-slate-400" />
 <p>Henüz tanımlı bir RCSA kampanyası bulunmuyor.</p>
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 setIsLaunchOpen(true);
 }}
 className="inline-flex items-center gap-2 rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
 >
 <Plus className="h-4 w-4" />
 İlk Kampanyayı Oluştur
 </button>
 </div>
 ) : (
 <div className="divide-y divide-slate-100">
 {campaigns?.map((campaign) => {
 const driftLabel = getRiskDriftLabel(campaign);
 return (
 <div
 key={campaign.id}
 className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
 >
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-slate-900">
 {campaign.title}
 </span>
 <span
 className={clsx(
 'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
 campaign.status === 'ACTIVE' &&
 'bg-emerald-100 text-emerald-800 border border-emerald-200',
 campaign.status === 'DRAFT' &&
 'bg-slate-100 text-slate-700 border border-slate-200',
 campaign.status === 'COMPLETED' &&
 'bg-blue-100 text-blue-800 border border-blue-200',
 )}
 >
 {campaign.status}
 </span>
 </div>
 <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
 <span>Başlangıç: {formatDate(campaign.start_date)}</span>
 <span>Bitiş: {formatDate(campaign.end_date)}</span>
 </div>
 </div>

 <div className="flex flex-1 flex-col gap-2 md:max-w-md">
 <div>
 <div className="flex items-center justify-between text-xs text-slate-500">
 <span>Tamamlanma Oranı</span>
 <span className="font-semibold text-slate-800">
 %{Math.round(campaign.completion_rate ?? 0)}
 </span>
 </div>
 <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
 <div
 className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all"
 style={{ width: `${Math.min(campaign.completion_rate ?? 0, 100)}%` }}
 />
 </div>
 </div>
 <div className="flex items-center justify-between text-xs text-slate-500">
 <span>Risk Sapması (AI Algılandı)</span>
 <span
 className={clsx(
 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
 driftLabel === 'Yüksek Sapma' &&
 'bg-rose-100 text-rose-800 border border-rose-200',
 driftLabel === 'Kontrollü Sapma' &&
 'bg-amber-100 text-amber-800 border border-amber-200',
 driftLabel === 'Düşük Sapma' &&
 'bg-emerald-100 text-emerald-800 border border-emerald-200',
 )}
 >
 <Activity className="h-3 w-3" />
 {driftLabel}
 </span>
 </div>
 </div>

 <div className="flex flex-col gap-2 md:items-end">
 <button
 type="button"
 onClick={() => setActiveSurveyCampaignId(campaign.id)}
 className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-canvas px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:bg-blue-50 transition-colors"
 >
 <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
 Anketi Tasarla (Survey Builder)
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Launch Modal - z-[100] ile her zaman üstte */}
 {isLaunchOpen && (
 <div
 className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
 role="dialog"
 aria-modal="true"
 aria-labelledby="rcsa-launch-title"
 >
 <div
 className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl border border-slate-200"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="mb-4 flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
 <Rocket className="h-5 w-5" />
 </div>
 <div>
 <h2 id="rcsa-launch-title" className="text-base font-semibold text-slate-900">
 Yeni RCSA Kampanyası Fırlat
 </h2>
 <p className="text-xs text-slate-500">
 Hangi iş birimlerinden self-assessment toplanacağını tanımlayın.
 </p>
 </div>
 </div>
 <form onSubmit={handleLaunch} className="space-y-4">
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-700">
 Kampanya Başlığı
 </label>
 <input
 type="text"
 value={form.title}
 onChange={(e) => handleFieldChange('title', e.target.value)}
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 placeholder="2026 RCSA - Perakende Bankacılık"
 />
 </div>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-700">
 Başlangıç Tarihi
 </label>
 <input
 type="date"
 value={form.startDate}
 onChange={(e) => handleFieldChange('startDate', e.target.value)}
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-700">
 Bitiş Tarihi
 </label>
 <input
 type="date"
 value={form.endDate}
 onChange={(e) => handleFieldChange('endDate', e.target.value)}
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 />
 </div>
 </div>
 <div className="mt-4 flex items-center justify-end gap-2">
 <button
 type="button"
 onClick={() => setIsLaunchOpen(false)}
 className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
 disabled={launchMutation.isLoading}
 >
 Vazgeç
 </button>
 <button
 type="submit"
 className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
 disabled={launchMutation.isLoading}
 >
 {launchMutation.isLoading ? 'Fırlatılıyor...' : 'Kampanyayı Fırlat'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {activeSurveyCampaignId && (
 <div className="fixed inset-0 z-40 flex">
 <button
 type="button"
 className="flex-1 bg-slate-900/50"
 onClick={() => setActiveSurveyCampaignId(null)}
 />
 <div className="relative h-full w-full max-w-3xl bg-canvas border-l border-slate-200 shadow-2xl">
 <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 bg-surface/80 backdrop-blur-md">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
 RCSA Kampanyası
 </p>
 <p className="text-sm font-bold text-slate-900">
 Anketi Tasarla
 </p>
 </div>
 <button
 type="button"
 onClick={() => setActiveSurveyCampaignId(null)}
 className="rounded-lg border border-slate-300 bg-canvas px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
 >
 Kapat
 </button>
 </div>
 <div className="h-[calc(100%-3rem)] overflow-auto p-5">
 <SurveyBuilder campaignId={activeSurveyCampaignId} />
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

