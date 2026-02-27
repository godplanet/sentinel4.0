/**
 * Realtime Presence Hook (Mock)
 */

import { useEffect } from 'react';
import { useWorkpaperStore } from '@/entities/execution';
import type { UserPresence } from '@/entities/execution';

const generateMockPresences = (workpaperId: string): UserPresence[] => {
  const userCount = Math.floor(Math.random() * 3);
  const presences: UserPresence[] = [];

  for (let i = 0; i < userCount; i++) {
    presences.push({
      user_id: `mock-user-${i}`,
      user_name: `Denetçi ${i + 1}`,
      workpaper_id: workpaperId,
      last_seen: new Date().toISOString(),
      cursor_position: {
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
    });
  }

  return presences;
};

export function useRealtimePresence(workpaperId: string | null) {
  const { setPresences } = useWorkpaperStore();

  useEffect(() => {
    if (!workpaperId) {
      setPresences([]);
      return;
    }

    const initialPresences = generateMockPresences(workpaperId);
    setPresences(initialPresences);

    const interval = setInterval(() => {
      const randomPresences = generateMockPresences(workpaperId);
      setPresences(randomPresences);
    }, 10000);

    return () => {
      clearInterval(interval);
      setPresences([]);
    };
  }, [workpaperId, setPresences]);

  return {
    broadcastCursor: (x: number, y: number) => {
      console.log('Mock broadcast cursor:', { x, y });
    },
    joinPresence: () => {
      console.log('Mock join presence');
    },
    leavePresence: () => {
      console.log('Mock leave presence');
    },
  };
}
