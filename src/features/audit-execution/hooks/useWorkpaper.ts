import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import type { Workpaper, AuditStep, EvidenceItem, WorkpaperFinding } from '@/entities/workpaper';

interface UseWorkpaperResult {
  workpapers: Workpaper[];
  auditSteps: AuditStep[];
  evidence: EvidenceItem[];
  findings: WorkpaperFinding[];
  loading: boolean;
  error: string | null;
  fetchWorkpapersByEngagement: (engagementId: string) => Promise<void>;
  updateTestResult: (workpaperId: string, testKey: string, result: 'pass' | 'fail' | 'n/a') => Promise<void>;
  updateWorkpaperNotes: (workpaperId: string, notes: string) => Promise<void>;
  updateWorkpaperStatus: (workpaperId: string, status: 'draft' | 'review' | 'finalized') => Promise<void>;
  createWorkpaper: (stepId: string, assignedAuditorId?: string) => Promise<Workpaper | null>;
}

export function useWorkpaper(): UseWorkpaperResult {
  const [workpapers, setWorkpapers] = useState<Workpaper[]>([]);
  const [auditSteps, setAuditSteps] = useState<AuditStep[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [findings, setFindings] = useState<WorkpaperFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkpapersByEngagement = async (engagementId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: stepsData, error: stepsError } = await supabase
        .from('audit_steps')
        .select('*')
        .eq('engagement_id', engagementId)
        .order('step_code');

      if (stepsError) throw stepsError;

      setAuditSteps(stepsData || []);

      const stepIds = (stepsData || []).map((step) => step.id);

      if (stepIds.length > 0) {
        const { data: workpapersData, error: workpapersError } = await supabase
          .from('workpapers')
          .select('*')
          .in('step_id', stepIds);

        if (workpapersError) throw workpapersError;

        setWorkpapers(workpapersData || []);

        const workpaperIds = (workpapersData || []).map((wp) => wp.id);

        if (workpaperIds.length > 0) {
          const [evidenceResult, findingsResult] = await Promise.all([
            supabase.from('evidence_chain').select('*').in('workpaper_id', workpaperIds),
            supabase.from('workpaper_findings').select('*').in('workpaper_id', workpaperIds),
          ]);

          if (evidenceResult.error) throw evidenceResult.error;
          if (findingsResult.error) throw findingsResult.error;

          setEvidence(evidenceResult.data || []);
          setFindings(findingsResult.data || []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workpapers');
      console.error('Error fetching workpapers:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTestResult = async (
    workpaperId: string,
    testKey: string,
    result: 'pass' | 'fail' | 'n/a'
  ) => {
    try {
      const workpaper = workpapers.find((wp) => wp.id === workpaperId);
      if (!workpaper) {
        throw new Error('Workpaper not found');
      }

      const updatedData = {
        ...workpaper.data,
        test_results: {
          ...(workpaper.data?.test_results || {}),
          [testKey]: result,
        },
      };

      const { data, error } = await supabase
        .from('workpapers')
        .update({
          data: updatedData,
          version: workpaper.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workpaperId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWorkpapers((prev) =>
          prev.map((wp) => (wp.id === workpaperId ? data : wp))
        );

        if (result === 'fail') {
          const { data: newFindings } = await supabase
            .from('workpaper_findings')
            .select('*')
            .eq('workpaper_id', workpaperId)
            .eq('source_ref', testKey);

          if (newFindings && newFindings.length > 0) {
            setFindings((prev) => [...prev, ...newFindings]);
          }
        }
      }
    } catch (err) {
      console.error('Error updating test result:', err);
      throw err;
    }
  };

  const updateWorkpaperNotes = async (workpaperId: string, notes: string) => {
    try {
      const workpaper = workpapers.find((wp) => wp.id === workpaperId);
      if (!workpaper) {
        throw new Error('Workpaper not found');
      }

      const updatedData = {
        ...workpaper.data,
        notes,
      };

      const { data, error } = await supabase
        .from('workpapers')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workpaperId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWorkpapers((prev) =>
          prev.map((wp) => (wp.id === workpaperId ? data : wp))
        );
      }
    } catch (err) {
      console.error('Error updating workpaper notes:', err);
      throw err;
    }
  };

  const updateWorkpaperStatus = async (
    workpaperId: string,
    status: 'draft' | 'review' | 'finalized'
  ) => {
    try {
      const { data, error } = await supabase
        .from('workpapers')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workpaperId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWorkpapers((prev) =>
          prev.map((wp) => (wp.id === workpaperId ? data : wp))
        );
      }
    } catch (err) {
      console.error('Error updating workpaper status:', err);
      throw err;
    }
  };

  const createWorkpaper = async (
    stepId: string,
    assignedAuditorId?: string
  ): Promise<Workpaper | null> => {
    try {
      const { data, error } = await supabase
        .from('workpapers')
        .insert({
          step_id: stepId,
          assigned_auditor_id: assignedAuditorId,
          status: 'draft',
          data: {
            test_results: {},
            notes: '',
          },
          version: 1,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWorkpapers((prev) => [...prev, data]);
        return data;
      }

      return null;
    } catch (err) {
      console.error('Error creating workpaper:', err);
      throw err;
    }
  };

  return {
    workpapers,
    auditSteps,
    evidence,
    findings,
    loading,
    error,
    fetchWorkpapersByEngagement,
    updateTestResult,
    updateWorkpaperNotes,
    updateWorkpaperStatus,
    createWorkpaper,
  };
}
