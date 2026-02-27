import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, X, Loader2, CheckCircle2, Database, Server, ShoppingCart } from 'lucide-react';
import { runFullSync, type SyncResult, type SyncedEntity } from '../lib/integration-hub';
import { useCreateEntity } from '@/entities/universe';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

interface IntegrationHubModalProps {
  onClose: () => void;
}

export function IntegrationHubModal({ onClose }: IntegrationHubModalProps) {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<SyncResult[]>([]);
  const [completed, setCompleted] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const createEntity = useCreateEntity();

  const handleSync = async () => {
    setSyncing(true);
    setResults([]);
    setCompleted(false);
    setImportedCount(0);

    try {
      const syncResults = await runFullSync();
      setResults(syncResults);

      // Auto-import discovered entities
      let count = 0;
      for (const result of syncResults) {
        for (const entity of result.entities) {
          try {
            await createEntity.mutateAsync({
              name: entity.name,
              type: entity.type,
              parent_id: null,
              path: generatePath(entity.name),
              risk_score: entity.risk_score,
              velocity_multiplier: 1.0,
              status: 'Active',
              metadata: {
                ...entity.metadata,
                is_synced: true,
                sync_source: entity.source,
              },
            });
            count++;
          } catch (error) {
            console.warn(`Failed to import ${entity.name}:`, error);
          }
        }
      }
      setImportedCount(count);
      setCompleted(true);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const generatePath = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('İK')) return <Database className="w-5 h-5" />;
    if (source.includes('CMDB')) return <Server className="w-5 h-5" />;
    if (source.includes('Satın')) return <ShoppingCart className="w-5 h-5" />;
    return <RefreshCw className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <RefreshCw size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Entegrasyon Hub'ı</h2>
              <p className="text-xs text-slate-500">Dış sistemlerden otomatik varlık keşfi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          {!syncing && results.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <RefreshCw size={48} className="mx-auto mb-3 text-blue-600" />
              <p className="text-sm text-blue-900 font-semibold mb-2">
                Dış Sistemlerle Senkronizasyon
              </p>
              <p className="text-xs text-blue-800 mb-4">
                İK Sistemi, CMDB ve Satınalma sistemlerinden yeni varlıklar otomatik keşfedilecek
              </p>
              <button
                onClick={handleSync}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Senkronize Et
              </button>
            </div>
          )}

          {syncing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-900">Senkronizasyon Devam Ediyor...</div>
                  <div className="text-xs text-blue-700">Dış sistemlerden veri çekiliyor</div>
                </div>
              </div>

              {results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-green-600">{getSourceIcon(result.source)}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-green-900">{result.source}</div>
                      <div className="text-xs text-green-700 mt-1">{result.message}</div>
                      <div className="mt-2 space-y-1">
                        {result.entities.map((entity, i) => (
                          <div key={i} className="text-xs text-green-800 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="font-medium">{entity.name}</span>
                            <span className="text-green-600">({entity.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-green-600" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-center"
            >
              <CheckCircle2 size={56} className="mx-auto mb-3 text-green-600" />
              <p className="text-lg font-bold text-green-900 mb-1">Senkronizasyon Tamamlandı!</p>
              <p className="text-sm text-green-800 mb-4">
                <span className="font-bold text-2xl text-green-600">{importedCount}</span> yeni varlık
                denetim evrenine eklendi
              </p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {results.map((result, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-green-200">
                    <div className="text-xs text-slate-600 mb-1">{result.source}</div>
                    <div className="text-xl font-bold text-green-600">{result.entities.length}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                Kapat ve Görüntüle
              </button>
            </motion.div>
          )}
        </div>

        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-xs text-slate-600">
            <p className="font-semibold mb-2">Desteklenen Sistemler:</p>
            <ul className="space-y-1">
              <li>• <strong>İK Sistemi:</strong> Şube ve personel verileri</li>
              <li>• <strong>CMDB:</strong> BT varlıkları ve envanter bilgisi</li>
              <li>• <strong>Satınalma Sistemi:</strong> Tedarikçi ve sözleşme verileri</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
