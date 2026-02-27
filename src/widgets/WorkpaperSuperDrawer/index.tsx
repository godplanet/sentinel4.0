import { useState, useEffect, useCallback } from 'react';
import {
  X, ClipboardList, FileCheck, AlertTriangle, ShieldAlert, Shield, ShieldCheck,
  FileSignature, MessageSquare, Clock, FolderOpen,
} from 'lucide-react';
import clsx from 'clsx';
import type { ControlRow } from '@/widgets/WorkpaperGrid/types';
import type {
  TestStep, EvidenceRequest, EvidenceRequestStatus,
  WorkpaperFindingRow, FindingSeverity, ReviewNote, ActivityLog,
  Questionnaire, QuestionnaireQuestion, SamplingResult,
} from '@/entities/workpaper/model/detail-types';
import type { Workpaper } from '@/entities/workpaper/model/types';
import {
  fetchTestSteps, toggleTestStep, updateStepComment, addTestStep,
  fetchEvidenceRequests, updateEvidenceStatus, addEvidenceRequest,
  fetchWorkpaperFindings, addWorkpaperFinding,
  signOffWorkpaperAsPrepared, signOffWorkpaperAsReviewed,
  fetchReviewNotes, addReviewNote, resolveReviewNote,
  fetchActivityLogs, addActivityLog,
  fetchQuestionnaires, createQuestionnaire, updateQuestionnaireAnswers, markQuestionnaireReviewed,
} from '@/entities/workpaper/api/detail-api';
import { supabase } from '@/shared/api/supabase';
import { TestStepsPanel } from './TestStepsPanel';
import { EvidencePanel } from './EvidencePanel';
import { FindingsPanel } from './FindingsPanel';
import { SignOffPanel } from './SignOffPanel';
import { SignOffRibbon } from './SignOffRibbon';
import { ReviewNotesPanel } from './ReviewNotesPanel';
import { ActivityTimeline } from './ActivityTimeline';
import { SamplingCalculatorModal } from './SamplingCalculatorModal';
import { ProcedureLibraryPanel } from './ProcedureLibraryPanel';
import { OfficeOrchestrator } from '@/widgets/SentinelOffice';

// YENİ: Sizin istediğiniz, siyah başlıklı Bulgu Formu Modalı
import { NewFindingModal } from '@/features/finding-form/NewFindingModal';

interface WorkpaperSuperDrawerProps {
  row: ControlRow | null;
  workpaperId: string | null;
  onClose?: () => void;
  onStatusChange?: (workpaperId: string, status: string) => void;
}

type TabKey = 'steps' | 'evidence' | 'findings' | 'notes' | 'signoff' | 'docs';

const TABS: { key: TabKey; label: string; icon: typeof ClipboardList }[] = [
  { key: 'steps', label: 'Test Adımları', icon: ClipboardList },
  { key: 'evidence', label: 'Kanıtlar', icon: FileCheck },
  { key: 'findings', label: 'Bulgular', icon: AlertTriangle },
  { key: 'notes', label: 'Notlar', icon: MessageSquare },
  { key: 'signoff', label: 'İmza', icon: FileSignature },
  { key: 'docs', label: 'Belgelerim', icon: FolderOpen },
];

export function WorkpaperSuperDrawer({ row, workpaperId, onClose, onStatusChange }: WorkpaperSuperDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('steps');
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [evidenceRequests, setEvidenceRequests] = useState<EvidenceRequest[]>([]);
  const [findings, setFindings] = useState<WorkpaperFindingRow[]>([]);
  const [reviewNotes, setReviewNotes] = useState<ReviewNote[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [workpaper, setWorkpaper] = useState<Workpaper | null>(null);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [questionnairesLoading, setQuestionnairesLoading] = useState(false);
  
  // MODAL STATES
  const [activityOpen, setActivityOpen] = useState(false);
  const [samplingOpen, setSamplingOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [officeOpen, setOfficeOpen] = useState(false);
  
  // YENİ: Bulgu Modalı State'i (Sizin istediğiniz isimle)
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false); 

  const [sampleSize, setSampleSize] = useState<number | null>(null);
  const [currentUserId] = useState('11111111-1111-1111-1111-111111111111');

  const loadSteps = useCallback(async () => {
    if (!workpaperId) return;
    try {
      setStepsLoading(true);
      const data = await fetchTestSteps(workpaperId);
      setTestSteps(data);
    } catch {
      setTestSteps([]);
    } finally {
      setStepsLoading(false);
    }
  }, [workpaperId]);

  const loadEvidence = useCallback(async () => {
    if (!workpaperId) return;
    try {
      setEvidenceLoading(true);
      const data = await fetchEvidenceRequests(workpaperId);
      setEvidenceRequests(data);
    } catch {
      setEvidenceRequests([]);
    } finally {
      setEvidenceLoading(false);
    }
  }, [workpaperId]);

  const loadFindings = useCallback(async () => {
    if (!workpaperId) return;
    try {
      setFindingsLoading(true);
      const data = await fetchWorkpaperFindings(workpaperId);
      setFindings(data);
    } catch {
      setFindings([]);
    } finally {
      setFindingsLoading(false);
    }
  }, [workpaperId]);

  const loadWorkpaper = useCallback(async () => {
    if (!workpaperId) return;
    try {
      const { data, error } = await supabase
        .from('workpapers')
        .select('*')
        .eq('id', workpaperId)
        .maybeSingle();
      if (error) throw error;
      setWorkpaper(data as Workpaper);
    } catch {
      setWorkpaper(null);
    }
  }, [workpaperId]);

  const loadNotes = useCallback(async () => {
    if (!workpaperId) return;
    try {
      setNotesLoading(true);
      const data = await fetchReviewNotes(workpaperId);
      setReviewNotes(data);
    } catch {
      setReviewNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [workpaperId]);

  const loadActivity = useCallback(async () => {
    if (!workpaperId) return;
    try {
      setActivityLoading(true);
      const data = await fetchActivityLogs(workpaperId);
      setActivityLogs(data);
    } catch {
      setActivityLogs([]);
    } finally {
      setActivityLoading(false);
    }
  }, [workpaperId]);

  const loadQuestionnaires = useCallback(async () => {
    if (!workpaperId) return;
    try {
      setQuestionnairesLoading(true);
      const data = await fetchQuestionnaires(workpaperId);
      setQuestionnaires(data);
    } catch {
      setQuestionnaires([]);
    } finally {
      setQuestionnairesLoading(false);
    }
  }, [workpaperId]);

  useEffect(() => {
    if (row && workpaperId) {
      setActiveTab('steps');
      setActivityOpen(false);
      setSampleSize(null);
      loadSteps();
      loadEvidence();
      loadFindings();
      loadWorkpaper();
      loadNotes();
      loadActivity();
      loadQuestionnaires();
    }
  }, [row, workpaperId, loadSteps, loadEvidence, loadFindings, loadWorkpaper, loadNotes, loadActivity, loadQuestionnaires]);

  const logActivity = useCallback(async (
    actionType: Parameters<typeof addActivityLog>[1],
    details: string,
    userName?: string,
  ) => {
    if (!workpaperId) return;
    try {
      await addActivityLog(workpaperId, actionType, details, userName);
      loadActivity();
    } catch { /* silent */ }
  }, [workpaperId, loadActivity]);

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    setTestSteps(prev => prev.map(s => s.id === stepId ? { ...s, is_completed: completed } : s));
    try {
      await toggleTestStep(stepId, completed);
      const step = testSteps.find(s => s.id === stepId);
      if (completed && step) {
        logActivity('STEP_COMPLETED', `"${step.description}" adımı tamamlandı`, 'Denetçi');
      }
    } catch {
      setTestSteps(prev => prev.map(s => s.id === stepId ? { ...s, is_completed: !completed } : s));
    }
  };

  const handleUpdateComment = async (stepId: string, comment: string) => {
    setTestSteps(prev => prev.map(s => s.id === stepId ? { ...s, auditor_comment: comment } : s));
    try {
      await updateStepComment(stepId, comment);
    } catch { /* optimistic */ }
  };

  const handleAddStep = async (description: string) => {
    if (!workpaperId) return;
    const order = testSteps.length + 1;
    try {
      const newStep = await addTestStep(workpaperId, description, order);
      if (newStep) setTestSteps(prev => [...prev, newStep]);
    } catch { /* silent */ }
  };

  const handleEvidenceStatusChange = async (requestId: string, status: EvidenceRequestStatus) => {
    setEvidenceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    try {
      await updateEvidenceStatus(requestId, status);
      logActivity('EVIDENCE_UPDATE', `Kanıt durumu "${status}" olarak güncellendi`, 'Denetçi');
    } catch {
      loadEvidence();
    }
  };

  const handleAddEvidence = async (title: string, description: string, dueDate: string | null) => {
    if (!workpaperId) return;
    try {
      const req = await addEvidenceRequest(workpaperId, title, description, dueDate);
      if (req) setEvidenceRequests(prev => [...prev, req]);
    } catch { /* silent */ }
  };

  // Bu eski fonksiyon. Modal'ı tetiklemek için kullanacağız.
  // const handleAddFinding = async ... (ESKİ KOD)
  // YENİ: Sadece Modal'ı açar.
  const handleOpenFindingModal = () => {
      setIsFindingModalOpen(true);
  };

  const handleSignOffPrepared = async () => {
    if (!workpaperId) return;
    try {
      await signOffWorkpaperAsPrepared(workpaperId, currentUserId, row?.auditor?.name || 'Denetçi');
      await loadWorkpaper();
      onStatusChange?.(workpaperId, 'prepared');
      logActivity('SIGN_OFF', 'Hazırlayan olarak imzalandı', row?.auditor?.name || 'Denetçi');
    } catch (err) {
      console.error('Failed to sign off as prepared:', err);
      throw err;
    }
  };

  const handleSignOffReviewed = async () => {
    if (!workpaperId) return;
    try {
      await signOffWorkpaperAsReviewed(workpaperId, currentUserId, 'Süpervizör Çelik');
      await loadWorkpaper();
      onStatusChange?.(workpaperId, 'reviewed');
      logActivity('SIGN_OFF', 'Gözden geçiren olarak onaylandı', 'Süpervizör Çelik');
    } catch (err) {
      console.error('Failed to sign off as reviewed:', err);
      throw err;
    }
  };

  const handleUnsignPrepared = async () => {
    if (!workpaperId) return;
    try {
      const { error } = await supabase
        .from('workpapers')
        .update({ prepared_by_user_id: null, prepared_at: null, prepared_by_name: '', approval_status: 'in_progress' })
        .eq('id', workpaperId);
      if (error) throw error;
      await loadWorkpaper();
      onStatusChange?.(workpaperId, 'in_progress');
      logActivity('UNSIGN', 'Hazırlayan imzası geri alındı', 'Denetçi');
    } catch (err) {
      console.error('Failed to unsign:', err);
      throw err;
    }
  };

  const handleAddNote = async (text: string) => {
    if (!workpaperId) return;
    try {
      const note = await addReviewNote(workpaperId, text, 'Süpervizör');
      if (note) {
        setReviewNotes(prev => [...prev, note]);
        logActivity('NOTE_ADDED', `Gözden geçirme notu eklendi: "${text.slice(0, 60)}..."`, 'Süpervizör');
      }
    } catch { /* silent */ }
  };

  const handleResolveNote = async (noteId: string) => {
    try {
      await resolveReviewNote(noteId);
      setReviewNotes(prev => prev.map(n =>
        n.id === noteId ? { ...n, status: 'Resolved' as const, resolved_at: new Date().toISOString() } : n
      ));
      logActivity('NOTE_RESOLVED', 'Gözden geçirme notu çözüldü olarak işaretlendi', 'Denetçi');
    } catch { /* silent */ }
  };

  const handleSamplingApply = (result: SamplingResult) => {
    setSampleSize(result.sampleSize);
    logActivity('SAMPLE_CALCULATED', `Örneklem hesaplandı: ${result.sampleSize} (${result.riskLevel} risk, %${result.confidenceLevel})`, 'Denetçi');
  };

  const handleCreateQuestionnaire = async (title: string, questions: QuestionnaireQuestion[], sentTo: string) => {
    if (!workpaperId) return;
    try {
      const q = await createQuestionnaire(workpaperId, title, questions, sentTo);
      if (q) {
        setQuestionnaires(prev => [q, ...prev]);
        logActivity('QUESTIONNAIRE_SENT', `"${title}" anketi "${sentTo}" birimine gönderildi`, 'Denetçi');
      }
    } catch { /* silent */ }
  };

  const handleSimulateResponse = async (questionnaireId: string, questions: QuestionnaireQuestion[]) => {
    try {
      await updateQuestionnaireAnswers(questionnaireId, questions);
      setQuestionnaires(prev => prev.map(q =>
        q.id === questionnaireId
          ? { ...q, questions_json: questions, status: 'Responded' as const, responded_at: new Date().toISOString() }
          : q
      ));
    } catch { /* silent */ }
  };

  const handleMarkReviewed = async (questionnaireId: string) => {
    try {
      await markQuestionnaireReviewed(questionnaireId);
      setQuestionnaires(prev => prev.map(q =>
        q.id === questionnaireId ? { ...q, status: 'Reviewed' as const } : q
      ));
    } catch { /* silent */ }
  };

  // Yeni Bulgu Kaydedilince (Modal'dan gelen)
  const handleFindingCreated = async (newFinding: any) => {
    // Burada API'ye kayıt yapılır.
    // Not: newFinding verisi Modal'dan {title, description, severity...} formatında gelir.
    if (!workpaperId) return;
    
    try {
       // Gerçek API Çağrısı (Existing addWorkpaperFinding fonksiyonunu kullanıyoruz)
       const finding = await addWorkpaperFinding(
           workpaperId, 
           newFinding.title, 
           newFinding.description || newFinding.detection_html, // Modal yapısına göre
           newFinding.severity, 
           'Manuel'
       );
       
       if (finding) {
           setFindings(prev => [finding, ...prev]);
           logActivity('FINDING_ADDED', `"${newFinding.title}" bulgusu eklendi (${newFinding.severity})`, 'Denetçi');
       }
    } catch (err) {
       console.error("Bulgu eklenirken hata:", err);
    }
    
    setIsFindingModalOpen(false); // Modalı kapat
  };

  if (!row) return null;

  const riskConfig = {
    HIGH: { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300', label: 'Yüksek Risk' },
    MEDIUM: { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300', label: 'Orta Risk' },
    LOW: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-300', label: 'Düşük Risk' },
  };
  const risk = riskConfig[row.risk_level];
  const RiskIcon = risk.icon;

  const stepsCompleted = testSteps.filter(s => s.is_completed).length;
  const stepsTotal = testSteps.length;
  const evidencePending = evidenceRequests.filter(r => r.status === 'pending').length;
  const findingsCount = findings.length;
  const signOffStatus = workpaper?.approval_status;
  const failedSteps = testSteps.filter(s => !s.is_completed);
  const allStepsCompleted = stepsTotal > 0 && stepsCompleted === stepsTotal;
  const openNotesCount = reviewNotes.filter(n => n.status === 'Open').length;

  return (
    <>
          <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
            <div className="shrink-0 bg-white border-b border-slate-200">
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                        {row.control_id}
                      </code>
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg border',
                        risk.bg, risk.color, risk.border
                      )}>
                        <RiskIcon size={11} />
                        {risk.label}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{row.title}</h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{row.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="relative">
                      <button
                        onClick={() => { setActivityOpen(!activityOpen); if (!activityOpen) loadActivity(); }}
                        className={clsx(
                          'p-2 rounded-lg transition-colors',
                          activityOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-400'
                        )}
                        title="Aktivite Geçmişi"
                      >
                        <Clock size={18} />
                      </button>
                      <ActivityTimeline
                        logs={activityLogs}
                        loading={activityLoading}
                        open={activityOpen}
                        onClose={() => setActivityOpen(false)}
                      />
                    </div>
                    <button
                      onClick={() => onClose?.()}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white', row.auditor.color)}>
                      {row.auditor.initials}
                    </div>
                    <span className="font-medium text-slate-600">{row.auditor.name}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="font-medium">{row.category}</span>
                </div>
              </div>

              <SignOffRibbon
                workpaper={workpaper}
                allStepsCompleted={allStepsCompleted}
                onSignPrepared={handleSignOffPrepared}
                onSignReviewed={handleSignOffReviewed}
                onUnsignPrepared={handleUnsignPrepared}
              />

              <div className="px-6 pb-0">
                <div className="bg-slate-100 rounded-xl p-1 flex gap-1">
                  {TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.key;

                    let badge: string | null = null;
                    if (tab.key === 'steps' && stepsTotal > 0) badge = `${stepsCompleted}/${stepsTotal}`;
                    if (tab.key === 'evidence' && evidencePending > 0) badge = `${evidencePending}`;
                    if (tab.key === 'findings' && findingsCount > 0) badge = `${findingsCount}`;
                    if (tab.key === 'notes' && openNotesCount > 0) badge = `${openNotesCount}`;
                    if (tab.key === 'signoff') {
                      if (signOffStatus === 'reviewed') badge = 'OK';
                      else if (signOffStatus === 'prepared') badge = '1/2';
                    }

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-semibold rounded-lg transition-all',
                          isActive
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        )}
                      >
                        <TabIcon size={14} />
                        <span className="hidden sm:inline truncate">{tab.label}</span>
                        {badge && (
                          <span className={clsx(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                            isActive
                              ? tab.key === 'findings' ? 'bg-red-100 text-red-700' :
                                tab.key === 'evidence' ? 'bg-amber-100 text-amber-700' :
                                tab.key === 'notes' ? 'bg-blue-100 text-blue-700' :
                                tab.key === 'signoff' && signOffStatus === 'reviewed' ? 'bg-emerald-100 text-emerald-700' :
                                tab.key === 'signoff' ? 'bg-blue-100 text-blue-700' :
                                'bg-blue-100 text-blue-700'
                              : 'bg-slate-200 text-slate-600'
                          )}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-3" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeTab === 'steps' && (
                <TestStepsPanel
                  steps={testSteps}
                  loading={stepsLoading}
                  onToggleStep={handleToggleStep}
                  onUpdateComment={handleUpdateComment}
                  onAddStep={handleAddStep}
                  onOpenSampling={() => setSamplingOpen(true)}
                  onOpenLibrary={() => setLibraryOpen(true)}
                  sampleSize={sampleSize}
                />
              )}
              {activeTab === 'evidence' && (
                <EvidencePanel
                  requests={evidenceRequests}
                  loading={evidenceLoading}
                  onStatusChange={handleEvidenceStatusChange}
                  onAddRequest={handleAddEvidence}
                  questionnaires={questionnaires}
                  questionnairesLoading={questionnairesLoading}
                  onCreateQuestionnaire={handleCreateQuestionnaire}
                  onSimulateResponse={handleSimulateResponse}
                  onMarkReviewed={handleMarkReviewed}
                />
              )}
              {activeTab === 'findings' && (
                <FindingsPanel
                  findings={findings}
                  loading={findingsLoading}
                  workpaperId={workpaperId || ''}
                  controlId={row?.control_id}
                  failedSteps={failedSteps}
                  // DEĞİŞİKLİK: Burada eski handleAddFinding yerine Modalı tetikliyoruz
                  onAddFinding={handleOpenFindingModal}
                />
              )}
              {activeTab === 'notes' && (
                <ReviewNotesPanel
                  notes={reviewNotes}
                  loading={notesLoading}
                  onAddNote={handleAddNote}
                  onResolveNote={handleResolveNote}
                />
              )}
              {activeTab === 'signoff' && (
                <SignOffPanel
                  workpaper={workpaper}
                  currentUserId={currentUserId}
                  onSignOffPrepared={handleSignOffPrepared}
                  onSignOffReviewed={handleSignOffReviewed}
                />
              )}
              {activeTab === 'docs' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-blue-800 mb-1">Sentinel Office</h3>
                    <p className="text-xs text-blue-600">
                      Tablo ve belgelerinizi Cryo-Chamber ile korumalı olarak düzenleyin.
                    </p>
                  </div>
                  <button
                    onClick={() => setOfficeOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-bold"
                  >
                    <FolderOpen size={16} />
                    Belgelerimi Aç (Focus Mode)
                  </button>
                </div>
              )}
            </div>
          </div>

          <OfficeOrchestrator
            workpaperId={workpaperId}
            isOpen={officeOpen}
            onClose={() => setOfficeOpen(false)}
          />

          <SamplingCalculatorModal
            open={samplingOpen}
            onClose={() => setSamplingOpen(false)}
            onApply={handleSamplingApply}
          />

          <ProcedureLibraryPanel
            open={libraryOpen}
            onClose={() => setLibraryOpen(false)}
            onAddStep={handleAddStep}
          />

          <NewFindingModal
            isOpen={isFindingModalOpen}
            onClose={() => setIsFindingModalOpen(false)}
            onSave={handleFindingCreated}
          />
    </>
  );
}