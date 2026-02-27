import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Save,
  X,
  Code,
  Clock,
  AlertTriangle,
  Zap,
  Database,
  Globe,
  Webhook,
  CheckCircle2,
} from 'lucide-react';
import type { Probe, QueryType, ProbeLog } from '@/entities/probe';
import { simulateProbeExecution } from '@/entities/probe';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

interface ProbeEditorProps {
  probe?: Probe;
  onSave: (probe: Partial<Probe>) => Promise<void>;
  onClose: () => void;
}

export function ProbeEditor({ probe, onSave, onClose }: ProbeEditorProps) {
  const [title, setTitle] = useState(probe?.title || '');
  const [description, setDescription] = useState(probe?.description || '');
  const [queryType, setQueryType] = useState<QueryType>(probe?.query_type || 'SQL');
  const [queryPayload, setQueryPayload] = useState(probe?.query_payload || '');
  const [scheduleCron, setScheduleCron] = useState(probe?.schedule_cron || '0 0 * * *');
  const [riskThreshold, setRiskThreshold] = useState(probe?.risk_threshold || 0);
  const [isActive, setIsActive] = useState(probe?.is_active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ProbeLog | null>(null);

  const queryTypeIcons = {
    SQL: Database,
    API: Globe,
    WEBHOOK: Webhook,
  };

  const queryTypePlaceholders = {
    SQL: 'SELECT COUNT(*) as count FROM transactions WHERE created_at > NOW() - INTERVAL \'1 day\';',
    API: 'https://api.example.com/check-compliance',
    WEBHOOK: 'https://webhook.site/your-unique-url',
  };

  const handleTestRun = async () => {
    if (!title || !queryPayload) {
      alert('Lütfen başlık ve sorgu alanlarını doldurun');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const mockProbe: Probe = {
        id: probe?.id || 'test-probe',
        title,
        description,
        query_type: queryType,
        query_payload: queryPayload,
        schedule_cron: scheduleCron,
        risk_threshold: riskThreshold,
        is_active: isActive,
        tenant_id: ACTIVE_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await simulateProbeExecution(mockProbe);
      setTestResult(result);
    } catch (error) {
      console.error('Test execution failed:', error);
      alert('Test çalıştırması başarısız oldu');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!title || !queryPayload) {
      alert('Lütfen başlık ve sorgu alanlarını doldurun');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title,
        description,
        query_type: queryType,
        query_payload: queryPayload,
        schedule_cron: scheduleCron,
        risk_threshold: riskThreshold,
        is_active: isActive,
      });
    } catch (error) {
      console.error('Save failed:', error);
      alert('Kaydetme işlemi başarısız oldu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {probe ? 'Probe Düzenle' : 'Yeni Probe Oluştur'}
              </h2>
              <p className="text-sm text-slate-300">Sürekli denetim robotu yapılandırması</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Probe Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Haftasonu EFT Kontrolü"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu probe'un ne yaptığını açıklayın..."
                rows={2}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sorgu Tipi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SQL', 'API', 'WEBHOOK'] as QueryType[]).map((type) => {
                    const Icon = queryTypeIcons[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setQueryType(type)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                          queryType === type
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Risk Eşiği (Threshold)
                </label>
                <input
                  type="number"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">Sonuç {'>'} eşik ise anomali olarak işaretle</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                {queryType === 'SQL' ? 'SQL Sorgusu' : queryType === 'API' ? 'API Endpoint' : 'Webhook URL'}
              </label>
              <textarea
                value={queryPayload}
                onChange={(e) => setQueryPayload(e.target.value)}
                placeholder={queryTypePlaceholders[queryType]}
                rows={8}
                className="w-full px-4 py-3 bg-slate-900 text-green-400 font-mono text-sm rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Zamanlama (Cron)
                </label>
                <input
                  type="text"
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                  placeholder="0 0 * * *"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Her gün gece yarısı: 0 0 * * *</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Durum
                </label>
                <div className="flex items-center gap-3 h-[42px]">
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                      isActive
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                    {isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </div>
              </div>
            </div>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border-2 p-4 ${
                  testResult.is_anomaly
                    ? 'bg-red-50 border-red-300'
                    : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {testResult.is_anomaly ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className={`font-semibold ${testResult.is_anomaly ? 'text-red-900' : 'text-green-900'}`}>
                    Test Sonucu: {testResult.is_anomaly ? 'Anomali Tespit Edildi' : 'Normal'}
                  </h3>
                </div>
                <div className="bg-slate-900 text-green-400 font-mono text-sm p-3 rounded-lg overflow-x-auto">
                  <pre>{JSON.stringify(testResult.result_data, null, 2)}</pre>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-slate-700">
                    <strong>Anomali Sayısı:</strong> {testResult.anomaly_count}
                  </span>
                  <span className="text-slate-700">
                    <strong>Süre:</strong> {testResult.execution_duration_ms}ms
                  </span>
                  <span className="text-slate-700">
                    <strong>Eşik:</strong> {riskThreshold}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <button
            onClick={handleTestRun}
            disabled={isTesting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Play className="w-4 h-4" />
            {isTesting ? 'Test Çalışıyor...' : 'Test Çalıştır'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
