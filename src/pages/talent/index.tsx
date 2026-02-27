import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { TalentDashboard } from '@/widgets/TalentDashboard';
import { SkillMatrix } from '@/widgets/SkillMatrix';
import TalentDashboardPage from './TalentDashboardPage';
import { Users, Award, GraduationCap, TrendingUp, Grid3x3, Gamepad2 } from 'lucide-react';

export default function TalentPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'rpg'>('rpg');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent OS - Yetenek Yönetimi"
        subtitle="Denetçi profilleri, sertifikalar ve eğitim takibi"
      />

      <div className="space-y-8">
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Talent OS - GIAS Std 3.1</h2>
              <p className="text-blue-100 mb-4">
                İç denetim ekibinin yetkinliklerini, sertifikalarını ve eğitimlerini takip edin.
                CPE (Sürekli Mesleki Eğitim) kredilerini yönetin ve ekip gelişimini izleyin.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <Award className="w-4 h-4" />
                  <span>Sertifika Takibi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>CPE Yönetimi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Yetenek Matrisi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg border border-slate-200 p-1 inline-flex shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'skills'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Yetenek Matrisi
          </button>
          <button
            onClick={() => setActiveTab('rpg')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'rpg'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            RPG Dashboard
          </button>
        </div>

        {activeTab === 'overview' && <TalentDashboard />}
        {activeTab === 'skills' && <SkillMatrix />}
        {activeTab === 'rpg' && (
          <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800">
            <TalentDashboardPage />
          </div>
        )}
      </div>
    </div>
  );
}
