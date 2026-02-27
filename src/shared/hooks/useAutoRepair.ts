/**
 * AUTO-REPAIR HOOK
 *
 * PURPOSE: Detect empty database on app launch and auto-seed with demo data
 * LOGIC:
 * 1. On mount, check if users table has data
 * 2. If empty/error -> Run forceReseed()
 * 3. Show full-screen loading overlay during repair
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { forceReseedViaEdge } from '@/shared/lib/universal-seeder';

interface AutoRepairState {
  isChecking: boolean;
  isRepairing: boolean;
  needsRepair: boolean;
  error: string | null;
}

export function useAutoRepair() {
  const [state, setState] = useState<AutoRepairState>({
    isChecking: true,
    isRepairing: false,
    needsRepair: false,
    error: null,
  });

  useEffect(() => {
    checkSystemHealth();
  }, []);

  async function checkSystemHealth() {
    try {
      console.log('🔍 Auto-Repair: Checking system health...');

      // Check if users exist
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Database connection error:', error);
        setState({
          isChecking: false,
          isRepairing: false,
          needsRepair: true,
          error: error.message,
        });
        await performAutoRepair();
        return;
      }

      if (count === 0) {
        console.warn('⚠️ Database is empty. Triggering auto-repair...');
        setState({
          isChecking: false,
          isRepairing: true,
          needsRepair: true,
          error: null,
        });
        await performAutoRepair();
      } else {
        console.log('✅ System health OK. Found', count, 'users.');
        setState({
          isChecking: false,
          isRepairing: false,
          needsRepair: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('❌ Auto-repair check failed:', err);
      setState({
        isChecking: false,
        isRepairing: false,
        needsRepair: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  async function performAutoRepair() {
    try {
      setState((prev) => ({ ...prev, isRepairing: true }));
      console.log('🔧 Performing auto-repair...');

      await forceReseedViaEdge();

      console.log('✅ Auto-repair complete!');
      setState({
        isChecking: false,
        isRepairing: false,
        needsRepair: false,
        error: null,
      });

      // Reload to refresh all hooks with new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('❌ Auto-repair failed:', err);
      setState((prev) => ({
        ...prev,
        isRepairing: false,
        error: err instanceof Error ? err.message : 'Repair failed',
      }));
    }
  }

  return state;
}
