import type { Workpaper, ReviewNote } from '@/entities/workpaper/model/types';
import {
  CheckCircle,
  FileCheck,
  User,
  Calendar,
  AlertCircle,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';

interface SignOffPanelProps {
  workpaper: Workpaper;
  openNotesCount: number;
  onPrepare?: () => void;
  onSignOff?: () => void;
  currentUserId?: string;
  isReviewer?: boolean;
}

export const SignOffPanel = ({
  workpaper,
  openNotesCount,
  onPrepare,
  onSignOff,
  currentUserId,
  isReviewer = false,
}: SignOffPanelProps) => {
  const isPrepared = workpaper.prepared_by && workpaper.prepared_at;
  const isReviewed = workpaper.reviewed_by && workpaper.reviewed_at;
  const canSignOff = isPrepared && !isReviewed && openNotesCount === 0 && isReviewer;
  const canPrepare = !isPrepared && !isReviewer;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-lg shadow-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">İmza Katmanı</h3>
        <span className="text-xs text-gray-500">(Four Eyes Principle)</span>
      </div>

      <div className="space-y-4">
        {/* Prepared Status */}
        <div
          className={clsx(
            'p-4 rounded-lg border-2',
            isPrepared
              ? 'bg-green-50 border-green-300'
              : 'bg-gray-50 border-gray-300 border-dashed'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={clsx(
                'p-2 rounded-full',
                isPrepared ? 'bg-green-200' : 'bg-gray-200'
              )}
            >
              <User
                className={clsx('w-5 h-5', isPrepared ? 'text-green-700' : 'text-gray-500')}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                Hazırlayan Denetçi
                {isPrepared && <CheckCircle className="w-4 h-4 text-green-600" />}
              </h4>
              {isPrepared ? (
                <>
                  <p className="text-sm text-gray-700 mb-1">Denetçi tarafından hazırlandı</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {new Date(workpaper.prepared_at!).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Çalışma kağıdı hazırlanmayı bekliyor
                  </p>
                  {canPrepare && onPrepare && (
                    <button
                      onClick={onPrepare}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <FileCheck className="w-4 h-4" />
                      Hazırladım, İncelemeye Gönder
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviewed Status */}
        <div
          className={clsx(
            'p-4 rounded-lg border-2',
            isReviewed
              ? 'bg-blue-50 border-blue-300'
              : 'bg-gray-50 border-gray-300 border-dashed'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={clsx(
                'p-2 rounded-full',
                isReviewed ? 'bg-blue-200' : 'bg-gray-200'
              )}
            >
              <Shield
                className={clsx('w-5 h-5', isReviewed ? 'text-blue-700' : 'text-gray-500')}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                İnceleyen Yönetici
                {isReviewed && <CheckCircle className="w-4 h-4 text-blue-600" />}
              </h4>
              {isReviewed ? (
                <>
                  <p className="text-sm text-gray-700 mb-1">Yönetici tarafından onaylandı</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {new Date(workpaper.reviewed_at!).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </>
              ) : isPrepared ? (
                <>
                  {openNotesCount > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-2 bg-orange-100 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-orange-800">
                          <strong>{openNotesCount}</strong> açık inceleme notu var. Onaylamak için
                          tüm notların çözülmesi gerekiyor.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-3">İnceleme ve onay bekliyor</p>
                      {canSignOff && onSignOff && (
                        <button
                          onClick={onSignOff}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Onaylıyorum (Sign-off)
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600">Önce denetçi tarafından hazırlanmalı</p>
              )}
            </div>
          </div>
        </div>

        {/* Completion Status */}
        {isReviewed && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Tamamlandı</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">
              Çalışma kağıdı denetçi ve yönetici tarafından imzalandı (Four Eyes ✓)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
