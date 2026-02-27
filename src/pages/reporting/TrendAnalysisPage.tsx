import { PageHeader } from '@/shared/ui';
import { TrendingUp, BarChart3, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TREND_DATA = [
  { month: 'Oca', findings: 12, critical: 2, resolved: 8 },
  { month: 'Şub', findings: 15, critical: 3, resolved: 10 },
  { month: 'Mar', findings: 18, critical: 4, resolved: 12 },
  { month: 'Nis', findings: 14, critical: 2, resolved: 11 },
  { month: 'May', findings: 16, critical: 3, resolved: 13 },
  { month: 'Haz', findings: 13, critical: 1, resolved: 12 },
];

const SEVERITY_TREND = [
  { quarter: 'Q1 2023', critical: 8, high: 15, medium: 25, low: 12 },
  { quarter: 'Q2 2023', critical: 6, high: 18, medium: 22, low: 14 },
  { quarter: 'Q3 2023', critical: 5, high: 16, medium: 28, low: 16 },
  { quarter: 'Q4 2023', critical: 7, high: 14, medium: 24, low: 18 },
  { quarter: 'Q1 2024', critical: 4, high: 12, medium: 26, low: 20 },
];

export default function TrendAnalysisPage() {
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Trend Analizi"
        description="Zaman serisi analizi ve öngörücü trend raporları"
        badge="MODÜL 6: RAPORLAMA"
      />

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Time-Series Analysis & Forecasting</h3>
            <p className="text-slate-600 text-sm">
              Sentinel, geçmiş bulgu verilerini analiz ederek gelecekteki riskleri tahmin eder.
              Monte Carlo simülasyonları ve makine öğrenimi ile öngörücü analizler sunar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Ortalama Bulgu/Ay', value: '14.8', change: '-8%', icon: BarChart3, color: 'blue' },
          { label: 'Kritik Bulgu Trendi', value: '2.5', change: '-35%', icon: AlertTriangle, color: 'green' },
          { label: 'Çözüm Oranı', value: '82%', change: '+12%', icon: TrendingUp, color: 'purple' },
          { label: 'Aksiyon Süresi', value: '18gün', change: '-5 gün', icon: Activity, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon size={20} className={`text-${stat.color}-600`} />
              </div>
              <span className="text-sm font-semibold text-green-600">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Aylık Bulgu Trendi
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="findings" stroke="#3b82f6" strokeWidth={2} name="Toplam Bulgu" />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Kritik" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Çözülen" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            Çeyreklik Şiddet Dağılımı
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={SEVERITY_TREND}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="critical" fill="#ef4444" name="Kritik" />
              <Bar dataKey="high" fill="#f97316" name="Yüksek" />
              <Bar dataKey="medium" fill="#eab308" name="Orta" />
              <Bar dataKey="low" fill="#22c55e" name="Düşük" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Monte Carlo Simülasyon Sonuçları</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-2">%15</div>
            <div className="text-sm text-slate-700 font-semibold">Kötümser Senaryo</div>
            <div className="text-xs text-slate-600 mt-2">Önümüzdeki 3 ayda 20+ kritik bulgu</div>
          </div>
          <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-3xl font-bold text-amber-600 mb-2">%65</div>
            <div className="text-sm text-slate-700 font-semibold">Normal Senaryo</div>
            <div className="text-xs text-slate-600 mt-2">10-15 kritik bulgu bekleniyor</div>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">%20</div>
            <div className="text-sm text-slate-700 font-semibold">İyimser Senaryo</div>
            <div className="text-xs text-slate-600 mt-2">5'ten az kritik bulgu</div>
          </div>
        </div>
      </div>
    </div>
  );
}
