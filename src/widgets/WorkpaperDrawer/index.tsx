import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertCircle, Sparkles, Shield, MessageSquare, BookOpen, Calculator, NotebookPen, Loader2, CheckCircle2, Clock, Table2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkpaperStore } from '@/entities/workpaper';
import { EvidenceUploader } from './components/EvidenceUploader';
import { FiveWhysInput } from './components/FiveWhysInput';
import { AIRewriteButton } from './components/AIRewriteButton';
import { TimeLogEntry } from './components/TimeLogEntry';
import { SentinelInsight } from '@/features/ai-audit';
import { ReviewNotesPanel } from '@/widgets/ReviewNotesPanel';
import { SignOffPanel } from '@/widgets/SignOffPanel';
import { ScratchpadPanel, SamplingConfigModal } from '@/features/supervision';
import { SamplingWizard } from '@/widgets/SamplingWizard';
import { generateDraftFromNotes, analyzeSentiment } from '@/features/ai-audit/utils/findingGenerator';
import { supabase } from '@/shared/api/supabase';
import type { ReviewNote, SamplingConfig } from '@/entities/workpaper/model/types';
import { TimeTracker } from '@/widgets/TimeTracker';
import { SentinelSheets } from '@/widgets/SentinelOffice';
import type { SpreadsheetState } from '@/widgets/SentinelOffice';

type TabType = 'evidence' | 'finding' | 'ai' | 'review' | 'scratchpad' | 'journal' | 'sampling' | 'time' | 'spreadsheet';

interface WorkpaperDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workpaperId: string | null;
  stepId: string | null;
}

export const WorkpaperDrawer = ({ isOpen, onClose, workpaperId, stepId }: WorkpaperDrawerProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('evidence');
  const [findingDescription, setFindingDescription] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSamplingModalOpen, setIsSamplingModalOpen] = useState(false);
  const [journalNotes, setJournalNotes] = useState('');
  const [isConvertingToFinding, setIsConvertingToFinding] = useState(false);
  const [isSavingFinding, setIsSavingFinding] = useState(false);
  const [findingSaved, setFindingSaved] = useState(false);
  const [fiveWhys, setFiveWhys] = useState<string[]>(['', '', '', '', '']);
  const [generatedFinding, setGeneratedFinding] = useState<{
    title: string;
    description: string;
    risk_level: string;
    criteria: string;
  } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetState | null>(null);
  const [sheetFullScreen, setSheetFullScreen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<ReviewNote[]>([
    {
      id: 'note-001',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      workpaper_id: workpaperId || '',
      field_key: 'test_results',
      note_text: 'Test sonuçlarının dokümantasyonu eksik. Lütfen tüm test örneklerini detaylı şekilde belgeleyin.',
      author_id: 'reviewer-001',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  const [isReviewer] = useState(false);

  const { getWorkpaperById, getStepById } = useWorkpaperStore();

  const workpaper = workpaperId ? getWorkpaperById(workpaperId) : null;
  const step = stepId ? getStepById(stepId) : null;

  const testResult = workpaper?.data?.test_results?.['main'] || 'pass';
  const isFailed = testResult === 'fail';

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setAiMessages([
      ...aiMessages,
      { role: 'user', content: inputMessage },
      {
        role: 'ai',
        content: `Bu test adımı "${step?.title || 'Bilinmeyen'}" için kontrol prosedürü gözden geçirildi. Önerilen yaklaşım: Dokümantasyon kanıtlarını detaylıca inceleyin ve ilgili yöneticilerle görüşme kayıtları alın.`,
      },
    ]);
    setInputMessage('');
  };

  const handleAddReviewNote = (fieldKey: string, noteText: string) => {
    if (!workpaper) return;

    const newNote: ReviewNote = {
      id: `note-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      workpaper_id: workpaper.id,
      field_key: fieldKey,
      note_text: noteText,
      author_id: 'reviewer-001',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReviewNotes([...reviewNotes, newNote]);
  };

  const handleResolveNote = (noteId: string) => {
    setReviewNotes(
      reviewNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              status: 'RESOLVED' as const,
              resolved_at: new Date().toISOString(),
              resolved_by: 'auditor-001',
            }
          : note
      )
    );
  };

  const handleSaveScratchpad = async (content: string) => {
    if (!workpaperId) return;

    try {
      const { error } = await supabase
        .from('workpapers')
        .update({
          auditor_scratchpad: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workpaperId);

      if (error) throw error;

      console.log('Scratchpad saved successfully');
    } catch (error) {
      console.error('Error saving scratchpad:', error);
    }
  };

  const handleSaveSamplingConfig = async (config: SamplingConfig) => {
    console.log('Saving sampling config:', config);
    alert('Örneklem metodolojisi kaydedildi');
  };

  const handleJournalChange = (value: string) => {
    setJournalNotes(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!workpaperId) return;

      try {
        const { error } = await supabase
          .from('workpapers')
          .update({
            auditor_notes: value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workpaperId);

        if (error) throw error;

        console.log('Journal notes auto-saved successfully');
      } catch (error) {
        console.error('Error auto-saving journal notes:', error);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!workpaperId) return;
    (async () => {
      const { data } = await supabase
        .from('workpapers')
        .select('spreadsheet_data')
        .eq('id', workpaperId)
        .maybeSingle();
      if (data?.spreadsheet_data) {
        setSpreadsheetData(data.spreadsheet_data as SpreadsheetState);
      }
    })();
  }, [workpaperId]);

  const handleConvertToFinding = async () => {
    if (!journalNotes.trim()) {
      alert('Lütfen önce not defterine bir şeyler yazın.');
      return;
    }

    setIsConvertingToFinding(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const generatedData = generateDraftFromNotes(journalNotes);
    const sentiment = analyzeSentiment(journalNotes);

    setGeneratedFinding({
      title: generatedData.title,
      description: generatedData.description,
      risk_level: generatedData.risk_level,
      criteria: generatedData.criteria_suggestion,
    });

    setFindingDescription(generatedData.description);

    setIsConvertingToFinding(false);
    setActiveTab('finding');
  };

  const handleSaveFinding = async () => {
    if (!generatedFinding || !workpaperId) {
      alert('Bulgu bilgileri eksik.');
      return;
    }

    if (!generatedFinding.title.trim() || !findingDescription.trim()) {
      alert('Lütfen başlık ve açıklama alanlarını doldurun.');
      return;
    }

    setIsSavingFinding(true);

    try {
      const severityMap: Record<string, string> = {
        'Critical': 'CRITICAL',
        'High': 'HIGH',
        'Medium': 'MEDIUM',
        'Low': 'LOW',
      };

      const severity = severityMap[generatedFinding.risk_level] || 'MEDIUM';

      const newFinding = {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        engagement_id: workpaper?.engagement_id || '11111111-1111-1111-1111-111111111111',
        workpaper_id: workpaperId,
        code: `FND-${Date.now().toString().slice(-6)}`,
        title: generatedFinding.title,
        severity: severity,
        state: 'DRAFT',
        description: findingDescription,
        detection_html: findingDescription,
        impact_html: 'Risk etkisi değerlendiriliyor...',
        recommendation_html: 'Aksiy on önerileri hazırlanıyor...',
        gias_category: 'İç Kontrol' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('findings')
        .insert([newFinding])
        .select()
        .single();

      if (error) {
        console.error('Finding save error:', error);
        throw error;
      }

      if (data && fiveWhys.some(w => w.trim())) {
        const findingSecret = {
          tenant_id: '11111111-1111-1111-1111-111111111111',
          finding_id: data.id,
          why_1: fiveWhys[0] || null,
          why_2: fiveWhys[1] || null,
          why_3: fiveWhys[2] || null,
          why_4: fiveWhys[3] || null,
          why_5: fiveWhys[4] || null,
          root_cause_summary: fiveWhys.filter(w => w.trim()).join(' → '),
          internal_notes: `Journal kaynak: ${journalNotes.substring(0, 200)}...`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('finding_secrets').insert([findingSecret]);
      }

      setFindingSaved(true);

      setTimeout(() => {
        onClose();
        navigate('/execution/findings');
      }, 2000);
    } catch (error) {
      console.error('Failed to save finding:', error);
      alert('Bulgu kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSavingFinding(false);
    }
  };

  const tabs = [
    {
      id: 'evidence' as TabType,
      label: 'Test & Kanıt',
      icon: FileText,
      color: 'emerald',
      visible: true,
    },
    {
      id: 'time' as TabType,
      label: 'Efor Takibi',
      icon: Clock,
      color: 'cyan',
      visible: true,
    },
    {
      id: 'journal' as TabType,
      label: 'Not Defteri',
      icon: NotebookPen,
      color: 'yellow',
      visible: true,
    },
    {
      id: 'finding' as TabType,
      label: 'Bulgu & RCA',
      icon: AlertCircle,
      color: 'rose',
      visible: isFailed,
    },
    {
      id: 'sampling' as TabType,
      label: 'Örneklem',
      icon: Calculator,
      color: 'blue',
      visible: true,
    },
    {
      id: 'review' as TabType,
      label: 'Coaching Notes',
      icon: MessageSquare,
      color: 'amber',
      visible: true,
    },
    {
      id: 'scratchpad' as TabType,
      label: 'Scratchpad',
      icon: BookOpen,
      color: 'slate',
      visible: true,
    },
    {
      id: 'spreadsheet' as TabType,
      label: 'Calisma Tablosu',
      icon: Table2,
      color: 'emerald',
      visible: true,
    },
    {
      id: 'ai' as TabType,
      label: 'Sentinel AI',
      icon: Sparkles,
      color: 'indigo',
      visible: true,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-[600px] bg-white/90 backdrop-blur-xl border-l border-gray-200 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {step?.title || 'Çalışma Kağıdı'}
                  </h2>
                  <p className="text-xs text-gray-600 font-mono">
                    {step?.step_code || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex border-b border-gray-200 bg-white/30 backdrop-blur-sm px-6">
              {tabs.filter(tab => tab.visible).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
                    ${activeTab === tab.id
                      ? `border-${tab.color}-600 text-${tab.color}-700 bg-${tab.color}-50/50`
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'evidence' && (
                <div className="space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Kontrol Prosedürü
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {step?.description || 'Açıklama mevcut değil'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Güvenli Kanıt Yükleme
                    </h3>
                    <EvidenceUploader workpaperId={workpaperId} />
                  </div>

                  <SentinelInsight contextText={step?.description || ''} />

                  {workpaperId && <TimeLogEntry workpaperId={workpaperId} />}

                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-900 mb-1">
                          Blockchain Güvenlik Garantisi
                        </p>
                        <p className="text-xs text-emerald-700 leading-relaxed">
                          Her kanıt SHA-256 hash ile mühürlenir ve değiştirilemez kanıt zincirine kaydedilir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'finding' && isFailed && (
                <div className="space-y-6">
                  {findingSaved ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Bulgu Başarıyla Kaydedildi!</h3>
                      <p className="text-sm text-gray-600 text-center max-w-md">
                        Bulgu Yönetimi sayfasına yönlendiriliyorsunuz...
                      </p>
                      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {generatedFinding ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-semibold text-blue-900">
                              AI Tarafından Oluşturuldu
                            </h3>
                          </div>
                          <p className="text-xs text-blue-700 mb-3">
                            Sentinel Prime notlarınızı analiz etti ve yapılandırılmış bulgu oluşturdu.
                            İstediğiniz gibi düzenleyebilirsiniz.
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white/50 rounded px-2 py-1">
                              <span className="text-gray-600">Risk Level:</span>
                              <span className="ml-2 font-semibold text-gray-900">{generatedFinding.risk_level}</span>
                            </div>
                            <div className="bg-white/50 rounded px-2 py-1">
                              <span className="text-gray-600">Criteria:</span>
                              <span className="ml-2 font-semibold text-gray-900 truncate block">
                                {generatedFinding.criteria.substring(0, 20)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-rose-900 mb-2">
                            Test Sonucu: BAŞARISIZ
                          </h3>
                          <p className="text-xs text-rose-700">
                            Bu test adımı başarısız olduğu için bulgu formu doldurulmalıdır.
                          </p>
                        </div>
                      )}

                      {generatedFinding && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Bulgu Başlığı
                          </label>
                          <input
                            type="text"
                            value={generatedFinding.title}
                            onChange={(e) => setGeneratedFinding({ ...generatedFinding, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            Bulgu Açıklaması
                          </label>
                          <AIRewriteButton
                            originalText={findingDescription}
                            onRewrite={setFindingDescription}
                          />
                        </div>
                        <textarea
                          value={findingDescription}
                          onChange={(e) => setFindingDescription(e.target.value)}
                          placeholder="Bulguyu detaylı şekilde açıklayın..."
                          rows={generatedFinding ? 12 : 4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                        />
                      </div>

                      <div>
                        <FiveWhysInput whys={fiveWhys} setWhys={setFiveWhys} />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveFinding}
                          disabled={isSavingFinding || !generatedFinding}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingFinding ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Kaydediliyor...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Bulguyu Kaydet</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedFinding(null);
                            setFindingDescription('');
                            setFiveWhys(['', '', '', '', '']);
                            setActiveTab('journal');
                          }}
                          disabled={isSavingFinding}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          İptal
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'review' && workpaper && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-amber-600" />
                      <h3 className="text-sm font-semibold text-amber-900">Coaching Notes</h3>
                    </div>
                    <p className="text-xs text-amber-700">
                      Yöneticinizin bıraktığı inceleme notları. Her notu inceleyip çözün.
                    </p>
                  </div>

                  <ReviewNotesPanel
                    workpaper={workpaper}
                    notes={reviewNotes}
                    onAddNote={handleAddReviewNote}
                    onResolveNote={handleResolveNote}
                    isReviewer={isReviewer}
                  />
                </div>
              )}

              {activeTab === 'journal' && (
                <div className="flex flex-col h-full relative">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-lg shrink-0">
                        <NotebookPen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                          Sentinel Journal - Messy Notes Welcome
                        </h3>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                          Düşüncelerinizi özgürce yazın. AI, notlarınızı yapılandırılmış bulguya dönüştürecek.
                          Otomatik kayıt aktif.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <textarea
                      value={journalNotes}
                      onChange={(e) => handleJournalChange(e.target.value)}
                      placeholder="🖊️ Burada özgürsünüz. Gözlemlerinizi, şüphelerinizi, soru işaretlerinizi yazın...

Örnek:
- Kredi dosyalarında imza eksiklikleri var, 15 tanesini inceledim
- Approval matrisi güncel değil, yönetici onayları atlanmış
- Sistemde erişim logları tutulmuyor, kim ne zaman giriş yapmış belli değil

Sentinel Prime bu notları analiz edip profesyonel bulguya dönüştürecek."
                      className="w-full h-full px-4 py-3 bg-yellow-50/80 border-2 border-yellow-300/50 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all font-mono leading-relaxed"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #fef3c7 31px, #fef3c7 32px)',
                        lineHeight: '32px',
                      }}
                    />

                    {journalNotes.length > 0 && (
                      <div className="absolute bottom-3 left-3 text-xs text-yellow-600 bg-yellow-100/80 px-2 py-1 rounded">
                        {journalNotes.length} karakter • Auto-save aktif
                      </div>
                    )}
                  </div>

                  {isConvertingToFinding && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 animate-pulse">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Sentinel Prime Analyzing...
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Notlarınız yapılandırılıyor ve risk analizi yapılıyor
                        </p>
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                      </div>
                    </div>
                  )}

                  {journalNotes.trim().length > 20 && !isConvertingToFinding && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleConvertToFinding}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl group"
                    >
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                      <span>AI ile Bulguya Dönüştür</span>
                    </motion.button>
                  )}
                </div>
              )}

              {activeTab === 'time' && workpaperId && (
                <div className="space-y-4">
                  <TimeTracker workpaperId={workpaperId} />
                </div>
              )}

              {activeTab === 'sampling' && (
                <SamplingWizard
                  workpaperId={workpaperId}
                  onSave={async (config) => {
                    console.log('Sampling configuration saved:', config);
                  }}
                />
              )}

              {activeTab === 'scratchpad' && workpaper && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-slate-600" />
                      <h3 className="text-sm font-semibold text-slate-900">Akıllı Not Defteri</h3>
                    </div>
                    <p className="text-xs text-slate-600">
                      Özel notlarınız şifreli olarak saklanır. Hassas bilgiler için kullanın.
                    </p>
                  </div>

                  <ScratchpadPanel
                    workpaper={workpaper}
                    onSave={handleSaveScratchpad}
                  />
                </div>
              )}

              {activeTab === 'spreadsheet' && (
                <div className={clsx('relative', sheetFullScreen ? '' : 'h-[500px]')}>
                  <SentinelSheets
                    workpaperId={workpaperId}
                    initialData={spreadsheetData}
                    isFullScreen={sheetFullScreen}
                    onFullScreen={() => setSheetFullScreen(!sheetFullScreen)}
                  />
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="flex flex-col h-full">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-indigo-900 mb-1">
                          Sentinel AI Asistanı
                        </p>
                        <p className="text-xs text-indigo-700">
                          Bu test adımı için context-aware öneriler alın
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
                    {aiMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-3">
                          <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Soru sorun veya önerilere göz atın
                        </p>
                      </div>
                    ) : (
                      aiMessages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`
                            p-3 rounded-lg text-sm
                            ${msg.role === 'user'
                              ? 'bg-gray-100 text-gray-900 ml-8'
                              : 'bg-indigo-50 text-indigo-900 mr-8'
                            }
                          `}
                        >
                          {msg.content}
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Sentinel'e sorun..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      <SamplingConfigModal
        isOpen={isSamplingModalOpen}
        onClose={() => setIsSamplingModalOpen(false)}
        currentConfig={workpaper?.sampling_config}
        onSave={handleSaveSamplingConfig}
      />
    </AnimatePresence>
  );
};
