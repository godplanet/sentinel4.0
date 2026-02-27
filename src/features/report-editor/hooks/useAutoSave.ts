import { useCallback, useRef, useState } from 'react';
import { reportApi } from '@/entities/report/api';

export function useAutoSave(reportId: string | undefined, delay = 1000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const save = useCallback(
    (content: any) => {
      if (!reportId) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await reportApi.saveTiptapContent(reportId, content);
          setLastSaved(new Date());
        } catch {
          /* silent */
        } finally {
          setSaving(false);
        }
      }, delay);
    },
    [reportId, delay]
  );

  return { save, saving, lastSaved };
}
