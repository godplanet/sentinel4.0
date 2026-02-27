/**
 * Field Agent Page - Voice-to-Action Mobile Interface
 * Turkish UI with English code
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, Trash2, Clock, MapPin } from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import {
  processVoiceTranscript,
  simulateVoiceInput,
  saveFindingDraft,
  getRecentDrafts,
  clearDrafts,
  getSeverityColor,
  getSeverityLabelTR,
  isSpeechRecognitionSupported,
  getSpeechRecognition,
  type VoiceFindingDraft,
  type VoiceStatus,
} from '@/features/field-agent';

export default function FieldAgentPage() {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [currentDraft, setCurrentDraft] = useState<VoiceFindingDraft | null>(null);
  const [recentDrafts, setRecentDrafts] = useState<VoiceFindingDraft[]>([]);
  const [error, setError] = useState<string>('');
  const [useSimulation, setUseSimulation] = useState(!isSpeechRecognitionSupported());

  const recognitionRef = useRef<any>(null);

  // Load recent drafts on mount
  useEffect(() => {
    setRecentDrafts(getRecentDrafts());
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!useSimulation && isSpeechRecognitionSupported()) {
      const SpeechRecognition = getSpeechRecognition();
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'tr-TR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleTranscriptReceived(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus('error');
        setError('Ses tanıma hatası. Simülasyon moduna geçiliyor...');
        setUseSimulation(true);
      };

      recognitionRef.current.onend = () => {
        if (status === 'listening') {
          setStatus('idle');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [useSimulation]);

  // Handle transcript received
  const handleTranscriptReceived = async (text: string) => {
    setTranscript(text);
    setStatus('processing');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = processVoiceTranscript(text);

    if (result.success && result.draft) {
      setCurrentDraft(result.draft);
      const saved = await saveFindingDraft(result.draft);

      if (saved) {
        setStatus('success');
        setRecentDrafts(getRecentDrafts());

        // Auto-reset after 3 seconds
        setTimeout(() => {
          setStatus('idle');
          setTranscript('');
          setCurrentDraft(null);
        }, 3000);
      } else {
        setStatus('error');
        setError('Kaydetme hatası oluştu.');
      }
    } else {
      setStatus('error');
      setError(result.error || 'İşlem başarısız.');
    }
  };

  // Start recording (real or simulated)
  const startRecording = async () => {
    setError('');
    setTranscript('');
    setCurrentDraft(null);

    if (useSimulation) {
      // Simulation mode
      setStatus('listening');
      const simulatedText = await simulateVoiceInput();
      handleTranscriptReceived(simulatedText);
    } else {
      // Real speech recognition
      if (recognitionRef.current) {
        setStatus('listening');
        recognitionRef.current.start();
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current && !useSimulation) {
      recognitionRef.current.stop();
    }
    setStatus('idle');
  };

  // Clear all drafts
  const handleClearDrafts = () => {
    if (confirm('Tüm taslakları silmek istediğinizden emin misiniz?')) {
      clearDrafts();
      setRecentDrafts([]);
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <PageHeader
        title="Saha Ajanı"
        description="Mobil Sesli Bulgu Kayıt Sistemi - Konuş, Kaydet, İlerle"
        icon={Mic}
      />

      <div className="flex-1 flex flex-col items-center justify-start p-4 pb-8 max-w-2xl mx-auto w-full">
        {/* Mode Indicator */}
        <div className="mb-4">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            useSimulation
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
          }`}>
            {useSimulation ? '🎭 Demo Modu' : '🎤 Canlı Mikrofon'}
          </div>
        </div>

        {/* Microphone Button Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full mb-8">
          {/* Status Text */}
          <div className="mb-6 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {status === 'idle' && 'Hazır'}
              {status === 'listening' && 'Dinliyorum...'}
              {status === 'processing' && 'İşleniyor...'}
              {status === 'success' && 'Kaydedildi!'}
              {status === 'error' && 'Hata!'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {status === 'idle' && 'Bulgu kaydetmek için mikrofona basın'}
              {status === 'listening' && 'Bulgunuzu detaylı bir şekilde anlatın'}
              {status === 'processing' && 'Ses kaydınız yapılandırılıyor'}
              {status === 'success' && 'Bulgu başarıyla taslak olarak kaydedildi'}
              {status === 'error' && error}
            </p>
          </div>

          {/* Giant Mic Button */}
          <button
            onClick={status === 'listening' ? stopRecording : startRecording}
            disabled={status === 'processing'}
            className={`
              relative w-48 h-48 rounded-full flex items-center justify-center
              transition-all duration-300 transform
              ${status === 'idle' ? 'hover:scale-105 active:scale-95' : ''}
              ${status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}
              ${status === 'success' ? 'scale-105' : ''}
              ${status === 'error' ? 'scale-95' : ''}
            `}
            style={{
              background: status === 'listening'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : status === 'success'
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : status === 'error'
                ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              boxShadow: status === 'listening'
                ? '0 0 0 0 rgba(239, 68, 68, 0.7), 0 20px 40px rgba(239, 68, 68, 0.4)'
                : '0 20px 40px rgba(168, 85, 247, 0.4)',
              animation: status === 'listening' ? 'pulse-ring 1.5s ease-out infinite' : 'none',
            }}
          >
            {status === 'success' ? (
              <CheckCircle2 className="w-24 h-24 text-white" strokeWidth={2} />
            ) : status === 'error' ? (
              <AlertCircle className="w-24 h-24 text-white" strokeWidth={2} />
            ) : status === 'listening' ? (
              <MicOff className="w-24 h-24 text-white" strokeWidth={2} />
            ) : (
              <Mic className="w-24 h-24 text-white" strokeWidth={2} />
            )}
          </button>

          {/* Transcript Display */}
          {transcript && (
            <div className="mt-8 w-full max-w-lg">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Transkript:</p>
                <p className="text-gray-900 dark:text-white italic">"{transcript}"</p>

                {currentDraft && status === 'processing' || status === 'success' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Kategori:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{currentDraft.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Önem:</span>
                      <span
                        className="text-sm font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${getSeverityColor(currentDraft.severity)}20`,
                          color: getSeverityColor(currentDraft.severity),
                        }}
                      >
                        {getSeverityLabelTR(currentDraft.severity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Lokasyon:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{currentDraft.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Drafts */}
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Son Taslaklar ({recentDrafts.length})
            </h3>
            {recentDrafts.length > 0 && (
              <button
                onClick={handleClearDrafts}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Temizle
              </button>
            )}
          </div>

          <div className="space-y-3">
            {recentDrafts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Mic className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Henüz taslak bulgu yok</p>
                <p className="text-xs mt-1">Mikrofon butonuna basarak başlayın</p>
              </div>
            ) : (
              recentDrafts.map(draft => (
                <div
                  key={draft.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex-1 pr-4">
                      {draft.title}
                    </h4>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded whitespace-nowrap"
                      style={{
                        backgroundColor: `${getSeverityColor(draft.severity)}20`,
                        color: getSeverityColor(draft.severity),
                      }}
                    >
                      {getSeverityLabelTR(draft.severity)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {draft.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(draft.timestamp)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {draft.location}
                    </div>
                    <div className="flex items-center gap-1">
                      🎤 Sesli Kayıt
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pulse Animation CSS */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7),
                        0 20px 40px rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0),
                        0 20px 60px rgba(239, 68, 68, 0.6);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0),
                        0 20px 40px rgba(239, 68, 68, 0.4);
          }
        }
      `}</style>
    </div>
  );
}
