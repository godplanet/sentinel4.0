import { useState } from 'react';
import { FileText, Clock, Sparkles, MessageSquare, TrendingUp, Calendar, User } from 'lucide-react';
import clsx from 'clsx';
import { NegotiationChat } from '@/features/finding-studio/components/NegotiationChat';

interface FindingSidebarProps {
  finding: any;
  activeTab: 'detay' | 'tarihce' | 'ai' | 'muzakere';
  onTabChange: (tab: 'detay' | 'tarihce' | 'ai' | 'muzakere') => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: 'AUDITOR' | 'AUDITEE';
  tenantId?: string;
}

const TABS = [
  { key: 'detay' as const, label: 'Detay', icon: FileText },
  { key: 'tarihce' as const, label: 'Tarihçe', icon: Clock },
  { key: 'ai' as const, label: 'AI', icon: Sparkles },
  { key: 'muzakere' as const, label: 'Müzakere', icon: MessageSquare }
];

export function FindingSidebar({
  finding,
  activeTab,
  onTabChange,
  currentUserId = 'user-1',
  currentUserName = 'Ahmet Yılmaz',
  currentUserRole = 'AUDITOR',
  tenantId = 'default-tenant'
}: FindingSidebarProps) {
  return (
    <div className="sticky top-32">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-white/50">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-semibold uppercase tracking-wide transition-all relative',
                  activeTab === tab.key
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={clsx(
          'overflow-y-auto',
          activeTab === 'muzakere' ? 'p-0 h-[calc(100vh-250px)]' : 'p-6 max-h-[calc(100vh-250px)]'
        )}>
          {activeTab === 'detay' && <DetayTab finding={finding} />}
          {activeTab === 'tarihce' && <TarihceTab finding={finding} />}
          {activeTab === 'ai' && <AITab finding={finding} />}
          {activeTab === 'muzakere' && (
            <NegotiationChat
              findingId={finding.id}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserRole={currentUserRole}
              tenantId={tenantId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetayTab({ finding }: { finding: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-slate-900">AA</div>
        <div className="w-1 h-1 rounded-full bg-green-500"></div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{finding.auditor.name}</h3>
        <p className="text-sm text-slate-600 mb-3">{finding.auditor.role}</p>
        <p className="text-xs text-slate-500">📧 İç Denetim Bşk.</p>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Süreç Durumu
          </div>
          <div className="space-y-2">
            <StatusButton
              icon="📄"
              label="TASLAK"
              active
              color="blue"
            />
            <StatusButton
              icon="👁"
              label="DETAY"
              active={false}
              color="slate"
            />
            <StatusButton
              icon="🤝"
              label="MUTABAKAT"
              active={false}
              color="slate"
            />
            <StatusButton
              icon="📊"
              label="KAPANIŞ"
              active={false}
              color="slate"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Referans No
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="font-mono text-sm text-slate-900">{finding.id}</div>
          <button className="text-xs text-slate-500 hover:text-slate-700 mt-1">
            📋
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Oluşturulma
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Calendar size={14} className="text-slate-400" />
          <span>{finding.created_at}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">{finding.updated_at}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Denetim Kapsamı
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText size={14} className="text-blue-600" />
          <span className="text-slate-900">{finding.engagement.name}</span>
        </div>
      </div>
    </div>
  );
}

function TarihceTab({ finding }: { finding: any }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-4">
        Bulgu Tarihe Olaylarında
      </h3>

      <div className="space-y-4">
        {finding.timeline.map((event: any, index: number) => (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
              {index < finding.timeline.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-200 my-1"></div>
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-semibold text-slate-900">{event.event}</div>
                <div className="text-xs text-slate-500">{event.time}</div>
              </div>
              <div className="text-xs text-slate-600 mb-1">{event.date}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <User size={12} />
                <span>{event.author}</span>
              </div>
              {event.note && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                  "{event.note}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AITab({ finding }: { finding: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} />
          <h3 className="font-bold text-sm uppercase tracking-wide">Benzerlik Analizi</h3>
        </div>
        <div className="text-5xl font-bold mb-3">%{finding.ai_similarity.percentage}</div>
        <p className="text-sm text-white/90 leading-relaxed mb-4">
          {finding.ai_similarity.description}
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
            Benzerlik Harita
          </button>
          <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
            Öneryanır
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Tekrar Eden Bulgular 🔁
        </h4>
        <div className="space-y-2">
          {finding.ai_similarity.similar_findings.map((sf: any) => (
            <div key={sf.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-semibold text-slate-900">{sf.title}</div>
                <div className="text-xs font-mono text-slate-500">{Math.round(sf.similarity * 100)}%</div>
              </div>
              <div className="text-xs text-slate-600">{sf.id} • {sf.branch}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-lg">⚡</span>
          <div>
            <h4 className="text-sm font-bold text-amber-900 mb-1">Kalite Kontrol</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {finding.ai_similarity.quality_control}
            </p>
          </div>
        </div>
      </div>

      <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Sparkles size={16} />
        Sentinel AI'a Sor
      </button>
    </div>
  );
}

interface StatusButtonProps {
  icon: string;
  label: string;
  active: boolean;
  color: 'blue' | 'slate';
}

function StatusButton({ icon, label, active, color }: StatusButtonProps) {
  return (
    <button
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all',
        active && color === 'blue' && 'bg-blue-600 text-white shadow-md',
        !active && 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
