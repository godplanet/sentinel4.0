import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { GovernanceVault } from '@/widgets/GovernanceVault';
import { DeclarationForm } from '@/widgets/DeclarationForm';
import { Shield, FileText, FileCheck, Clock, FileSignature } from 'lucide-react';

export default function GovernanceVaultPage() {
  const [activeTab, setActiveTab] = useState<'vault' | 'declarations'>('vault');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Governance Vault - Yönetişim Kasası"
        subtitle="Yönetmelik, politika ve bağımsızlık beyanları"
      />

      <div className="space-y-8">
        <div className="mb-8 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Governance Vault - GIAS Std 6.1</h2>
              <p className="text-slate-200 mb-4">
                İç denetim yönetmeliği, bağımsızlık beyanları, denetim komitesi tutanakları
                ve diğer yönetişim dokümanlarını tek bir merkezi kasada saklayın.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Audit Charter</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>Bağımsızlık Beyanları</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Komite Tutanakları</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg border border-slate-200 p-1 inline-flex shadow-sm">
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'vault'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Doküman Kasası
          </button>
          <button
            onClick={() => setActiveTab('declarations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'declarations'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            Beyan İmzala
          </button>
        </div>

        {activeTab === 'vault' && <GovernanceVault />}
        {activeTab === 'declarations' && <DeclarationForm />}
      </div>
    </div>
  );
}
