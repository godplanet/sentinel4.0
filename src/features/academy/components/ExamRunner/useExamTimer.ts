import { useEffect, useRef } from 'react';
import { useExamStore } from '../../store/examStore';

export function useExamTimer(userId: string) {
  const phase = useExamStore((s) => s.phase);
  const tick = useExamStore((s) => s.tick);
  const secondsRemaining = useExamStore((s) => s.secondsRemaining);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, tick, userId]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = secondsRemaining <= 60;
  const isWarning = secondsRemaining <= 300 && !isCritical;

  return { formatted, isCritical, isWarning, secondsRemaining };
}
