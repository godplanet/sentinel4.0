import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, Upload, CalendarPlus, FileText, Loader2,
  Handshake,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';
import { AdvisoryRequestModal } from '@/widgets/AdvisoryWorkspace/AdvisoryRequestModal';

interface AuditeeTask {
  id: string;
  finding_code: string | null;
  title: string;
  severity: string;
  status: string;
  due_date: string | null;
  description: string | null;
}

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  CRITICAL: { bg: 'bg-red-100 border-red-300', text: 'text-red-700', label: 'Kritik' },
  HIGH: { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-700', label: 'Yuksek' },
  MEDIUM: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-700', label: 'Orta' },
  LOW: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-700', label: 'Dusuk' },
};

export function AuditeeDashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AuditeeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [extensionId, setExtensionId] = useState<string | null>(null);
  const [extensionReason, setExtensionReason] = useState('');
  const [extensionSubmitting, setExtensionSubmitting] = useState(false);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_findings')
        .select('id, finding_code, title, severity, status, due_date, description')
        .in('status', [
          'DRAFT', 'PENDING_REVIEW', 'SENT_TO_AUDITEE',
          'AUDITEE_REVIEWING', 'PENDING_APPROVAL', 'DISPUTING',
          'REMEDIATION_STARTED', 'AUDITEE_ACCEPTED',
        ])
        .order('severity', { ascending: true })
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleEvidenceUpload = useCallback(async (findingId: string, file: File) => {
    setUploading(true);
    try {
      const path = `evidence/${findingId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('evidence').upload(path, file);

      if (uploadErr) {
        await supabase.from('finding_comments').insert({
          finding_id: findingId,
          comment_text: `Kanit yuklendi: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          comment_type: 'EVIDENCE',
          author_role: 'AUDITEE',
        });
      }

      await loadTasks();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, [loadTasks]);

  const handleExtensionRequest = useCallback(async () => {
    if (!extensionId || !extensionReason.trim()) return;
    setExtensionSubmitting(true);
    try {
      const finding = tasks.find((t) => t.id === extensionId);
      const currentDue = finding?.due_date ? new Date(finding.due_date) : new Date();
      const newDue = new Date(currentDue);
      newDue.setDate(newDue.getDate() + 7);

      await supabase.from('finding_comments').insert({
        finding_id: extensionId,
        comment_text: `Sure uzatimi talebi (+7 gun): ${extensionReason}. Yeni tarih: ${newDue.toLocaleDateString('tr-TR')}`,
        comment_type: 'EXTENSION_REQUEST',
        author_role: 'AUDITEE',
      });

      setExtensionId(null);
      setExtensionReason('');
    } catch (err) {
      console.error('Extension request failed:', err);
    } finally {
      setExtensionSubmitting(false);
    }
  }, [extensionId, extensionReason, tasks]);

  const pending = tasks.filter((t) => ['SENT_TO_AUDITEE', 'AUDITEE_REVIEWING'].includes(t.status));
  const inProgress = tasks.filter((t) => ['REMEDIATION_STARTED', 'AUDITEE_ACCEPTED', 'PENDING_APPROVAL'].includes(t.status));
  const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hosgeldiniz</h1>
          <p className="text-sm text-slate-500 mt-1">Size atanmis denetim bulgulari ve aksiyonlar asagidadir.</p>
        </div>
        <button
          onClick={() => setShowAdvisoryModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm"
        >
          <Handshake size={16} />
          Danismanlik Talep Et
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Toplam Gorev" value={tasks.length} icon={ClipboardList} color="bg-slate-100 text-slate-600" />
        <StatCard label="Bekleyen Yanit" value={pending.length} icon={Clock} color="bg-amber-100 text-amber-600" />
        <StatCard label="Devam Eden" value={inProgress.length} icon={CheckCircle2} color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Suresi Gecen" value={overdue.length} icon={AlertTriangle} color="bg-red-100 text-red-600" />
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList size={18} />
            Yapilacaklar Listem
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-3" />
            <p className="text-slate-500 font-medium">Tum gorevler tamamlandi!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const sev = SEVERITY_CONFIG[task.severity] || SEVERITY_CONFIG.LOW;
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();

              return (
                <div
                  key={task.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className={clsx('mt-0.5 w-3 h-3 rounded-full shrink-0 border-2', sev.bg)} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {task.finding_code && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {task.finding_code}
                          </span>
                        )}
                        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border', sev.bg, sev.text)}>
                          {sev.label}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                            Suresi Gecti!
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 mb-1">{task.title}</h3>

                      {task.due_date && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          Son Tarih: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                        <Upload size={12} />
                        Kanit Yukle
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleEvidenceUpload(task.id, file);
                          }}
                        />
                      </label>

                      <button
                        onClick={() => setExtensionId(task.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <CalendarPlus size={12} />
                        +7 Gun
                      </button>

                      <button
                        onClick={() => navigate(`/auditee-portal/finding/${task.id}`)}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        Detay
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex items-center gap-4">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-sm font-bold text-slate-700">Kanit yukleniyor...</span>
          </div>
        </div>
      )}

      {showAdvisoryModal && (
        <AdvisoryRequestModal onClose={() => setShowAdvisoryModal(false)} />
      )}

      {extensionId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Sure Uzatimi Talebi</h3>
            <p className="text-sm text-slate-500 mb-4">Mevcut son tarihe +7 gun eklenecektir.</p>

            <textarea
              value={extensionReason}
              onChange={(e) => setExtensionReason(e.target.value)}
              placeholder="Uzatim gerekce aciklamasi..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none"
            />

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => { setExtensionId(null); setExtensionReason(''); }}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleExtensionRequest}
                disabled={extensionSubmitting || !extensionReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {extensionSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CalendarPlus size={14} />}
                Talep Gonder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
