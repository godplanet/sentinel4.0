import { useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTimeLogsRecent,
  fetchWorkpaperTotalHours,
  logTimeEntry,
  deleteTimeLog,
} from '@/entities/workpaper/api/timeLogApi';

interface TimeLogEntryProps {
  workpaperId: string;
}

export function TimeLogEntry({ workpaperId }: TimeLogEntryProps) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState('');

  const { data: timeLogs = [], isLoading } = useQuery({
    queryKey: ['time-logs', workpaperId],
    queryFn: () => fetchTimeLogsRecent(workpaperId),
  });

  const { data: totalHours } = useQuery({
    queryKey: ['workpaper-total-hours', workpaperId],
    queryFn: () => fetchWorkpaperTotalHours(workpaperId),
  });

  const logMutation = useMutation({
    mutationFn: (hoursSpent: number) => logTimeEntry({ workpaperId, hours_spent: hoursSpent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs', workpaperId] });
      queryClient.invalidateQueries({ queryKey: ['workpaper-total-hours', workpaperId] });
      setHours('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (logId: string) => deleteTimeLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs', workpaperId] });
      queryClient.invalidateQueries({ queryKey: ['workpaper-total-hours', workpaperId] });
    },
  });

  const handleLogTime = () => {
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      alert('Lütfen 0 ile 24 arasında geçerli bir saat değeri girin');
      return;
    }
    logMutation.mutate(hoursNum);
  };

  return (
    <div className="bg-cyan-50/50 border border-cyan-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-cyan-600" />
        <h4 className="text-sm font-semibold text-cyan-900">Efor Girişi</h4>
        {totalHours !== undefined && (
          <span className="ml-auto text-xs bg-cyan-600 text-white px-2 py-0.5 rounded-full font-semibold">
            Toplam: {totalHours.toFixed(1)}h
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          step="0.5"
          min="0.5"
          max="24"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Saat (ör: 1.5)"
          className="flex-1 px-3 py-2 text-sm border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-surface"
          onKeyPress={(e) => e.key === 'Enter' && handleLogTime()}
        />
        <button
          onClick={handleLogTime}
          disabled={logMutation.isPending || !hours}
          className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {logMutation.isPending ? 'Kaydediliyor...' : 'Log Time'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-xs text-cyan-600">Yükleniyor...</div>
      ) : timeLogs.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-cyan-800 mb-1.5">Son Kayıtlar:</div>
          {timeLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between text-xs bg-surface/80 rounded px-2.5 py-1.5 border border-cyan-100"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-cyan-700">{log.hours_spent}h</span>
                <span className="text-cyan-600">•</span>
                <span className="text-slate-600">
                  {new Date(log.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Bu kayıt silinsin mi?')) {
                    deleteMutation.mutate(log.id);
                  }
                }}
                className="p-1 text-cyan-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Sil"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {timeLogs.length > 5 && (
            <div className="text-xs text-cyan-600 text-center pt-1">
              +{timeLogs.length - 5} kayıt daha
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-cyan-600 text-center py-2">
          Henüz zaman kaydı yok
        </div>
      )}
    </div>
  );
}
