import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/api/supabase';

export interface FindingSignoff {
  id: string;
  finding_id: string;
  role: 'PREPARER' | 'REVIEWER' | 'APPROVER';
  user_id: string;
  user_name: string;
  user_title?: string;
  signed_at: string;
  signature_hash?: string;
  comments?: string;
}

export interface SignoffInput {
  finding_id: string;
  role: 'PREPARER' | 'REVIEWER' | 'APPROVER';
  user_id: string;
  user_name: string;
  user_title?: string;
  tenant_id: string;
  comments?: string;
}

export function useSignoffs(findingId: string | undefined) {
  const [signoffs, setSignoffs] = useState<FindingSignoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  // Fetch signoffs
  const fetchSignoffs = useCallback(async () => {
    if (!findingId) {
      setSignoffs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('finding_signoffs')
        .select('*')
        .eq('finding_id', findingId)
        .order('signed_at', { ascending: true });

      if (error) throw error;
      setSignoffs(data || []);
    } catch (error) {
      console.error('Error fetching signoffs:', error);
      setSignoffs([]);
    } finally {
      setLoading(false);
    }
  }, [findingId]);

  // Sign a finding
  const signFinding = useCallback(async (input: SignoffInput) => {
    setSigning(true);
    try {
      // Generate a simple signature hash (in production, use proper cryptographic signing)
      const signatureHash = btoa(`${input.user_id}:${input.role}:${Date.now()}`);

      const { data, error } = await supabase
        .from('finding_signoffs')
        .insert({
          finding_id: input.finding_id,
          role: input.role,
          user_id: input.user_id,
          user_name: input.user_name,
          user_title: input.user_title,
          tenant_id: input.tenant_id,
          signature_hash: signatureHash,
          comments: input.comments,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setSignoffs((prev) => [...prev, data]);
      return { success: true, signoff: data };
    } catch (error) {
      console.error('Error signing finding:', error);
      return { success: false, error };
    } finally {
      setSigning(false);
    }
  }, []);

  // Check if a specific role has signed
  const hasSigned = useCallback(
    (role: 'PREPARER' | 'REVIEWER' | 'APPROVER') => {
      return signoffs.some((s) => s.role === role);
    },
    [signoffs]
  );

  // Get signoff for a specific role
  const getSignoff = useCallback(
    (role: 'PREPARER' | 'REVIEWER' | 'APPROVER') => {
      return signoffs.find((s) => s.role === role);
    },
    [signoffs]
  );

  // Real-time subscription
  useEffect(() => {
    if (!findingId) return;

    fetchSignoffs();

    // Subscribe to new signoffs
    const channel = supabase
      .channel(`signoffs:${findingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'finding_signoffs',
          filter: `finding_id=eq.${findingId}`,
        },
        (payload) => {
          const newSignoff = payload.new as FindingSignoff;
          setSignoffs((prev) => {
            // Avoid duplicates
            if (prev.some((s) => s.id === newSignoff.id)) return prev;
            return [...prev, newSignoff];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [findingId, fetchSignoffs]);

  return {
    signoffs,
    loading,
    signing,
    signFinding,
    hasSigned,
    getSignoff,
    refetch: fetchSignoffs,
  };
}
