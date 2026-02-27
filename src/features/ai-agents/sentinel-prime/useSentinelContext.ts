/**
 * Sentinel Prime Context Injection Hook
 *
 * This hook gathers real-time system data to feed into the AI's context window.
 * It implements RAG (Retrieval Augmented Generation) Lite by fetching:
 * - Risk Constitution (The Rules)
 * - Audit Universe Summary (The Map)
 * - Recent Findings Statistics (The Situation)
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import type { SystemContext, RiskConstitution, UniverseStats, RecentFindingsStats } from './types';

export interface UseSentinelContextOptions {
  includeConstitution?: boolean;
  includeUniverse?: boolean;
  includeFindings?: boolean;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export interface UseSentinelContextResult {
  context: SystemContext | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadingSteps: Array<{
    step: string;
    status: 'loading' | 'complete' | 'error';
  }>;
}

const DEFAULT_OPTIONS: UseSentinelContextOptions = {
  includeConstitution: true,
  includeUniverse: true,
  includeFindings: true,
  autoRefresh: false,
  refreshIntervalMs: 60000,
};

export function useSentinelContext(
  options: UseSentinelContextOptions = DEFAULT_OPTIONS
): UseSentinelContextResult {
  const [context, setContext] = useState<SystemContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<
    Array<{ step: string; status: 'loading' | 'complete' | 'error' }>
  >([]);

  const opts = { ...DEFAULT_OPTIONS, ...options };

  const updateStep = (step: string, status: 'loading' | 'complete' | 'error') => {
    setLoadingSteps((prev) => {
      const existing = prev.find((s) => s.step === step);
      if (existing) {
        return prev.map((s) => (s.step === step ? { step, status } : s));
      }
      return [...prev, { step, status }];
    });
  };

  const fetchConstitution = async (): Promise<RiskConstitution | undefined> => {
    if (!opts.includeConstitution) return undefined;

    updateStep('Reading Risk Constitution', 'loading');

    try {
      const { data, error: err } = await supabase
        .from('methodology_configs')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (err) throw err;

      updateStep('Reading Risk Constitution', 'complete');

      if (!data) return undefined;

      return {
        id: data.id,
        methodology_name: data.methodology_name,
        version: data.version,
        dimension_weights: data.dimension_weights as Record<string, number>,
        grading_scale: data.grading_scale as any,
        veto_rules: data.veto_rules as Record<string, any>,
        base_score: data.base_score,
        updated_at: data.updated_at,
        is_active: data.is_active,
      };
    } catch (err) {
      updateStep('Reading Risk Constitution', 'error');
      console.error('Failed to fetch constitution:', err);
      return undefined;
    }
  };

  const fetchUniverseStats = async (): Promise<UniverseStats | undefined> => {
    if (!opts.includeUniverse) return undefined;

    updateStep('Analyzing Audit Universe', 'loading');

    try {
      const { data: entities, error: err } = await supabase
        .from('audit_universe')
        .select('entity_name, path, risk_score')
        .order('risk_score', { ascending: false });

      if (err) throw err;

      const totalEntities = entities?.length || 0;
      const highRiskCount = entities?.filter((e) => e.risk_score >= 70 && e.risk_score < 90).length || 0;
      const criticalRiskCount = entities?.filter((e) => e.risk_score >= 90).length || 0;
      const avgRiskScore =
        totalEntities > 0
          ? entities.reduce((sum, e) => sum + (e.risk_score || 0), 0) / totalEntities
          : 0;

      updateStep('Analyzing Audit Universe', 'complete');

      return {
        totalEntities,
        highRiskCount,
        criticalRiskCount,
        highRiskPercentage: totalEntities > 0 ? (highRiskCount / totalEntities) * 100 : 0,
        avgRiskScore: Math.round(avgRiskScore * 10) / 10,
        topRiskyEntities: entities?.slice(0, 5).map((e) => ({
          name: e.entity_name,
          path: e.path,
          risk_score: e.risk_score || 0,
        })) || [],
      };
    } catch (err) {
      updateStep('Analyzing Audit Universe', 'error');
      console.error('Failed to fetch universe stats:', err);
      return undefined;
    }
  };

  const fetchFindingsStats = async (): Promise<RecentFindingsStats | undefined> => {
    if (!opts.includeFindings) return undefined;

    updateStep('Checking Recent Findings', 'loading');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: findings, error: err } = await supabase
        .from('audit_findings')
        .select('severity, status, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (err) throw err;

      const total = findings?.length || 0;
      const critical = findings?.filter((f) => f.severity === 'Critical').length || 0;
      const high = findings?.filter((f) => f.severity === 'High').length || 0;
      const medium = findings?.filter((f) => f.severity === 'Medium').length || 0;
      const low = findings?.filter((f) => f.severity === 'Low').length || 0;

      const { count: openActionsCount } = await supabase
        .from('action_steps')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open');

      updateStep('Checking Recent Findings', 'complete');

      return {
        total,
        critical,
        high,
        medium,
        low,
        openActions: openActionsCount || 0,
        avgRemediationDays: 0,
        pendingResponses: 0,
      };
    } catch (err) {
      updateStep('Checking Recent Findings', 'error');
      console.error('Failed to fetch findings stats:', err);
      return undefined;
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return undefined;

      return {
        id: user.id,
        email: user.email || 'unknown@bank.com',
        role: user.user_metadata?.role || 'Auditor',
        department: user.user_metadata?.department,
        name: user.user_metadata?.name,
      };
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      return undefined;
    }
  };

  const loadContext = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingSteps([]);

    try {
      const [constitution, universeStats, recentFindings, currentUser] = await Promise.all([
        fetchConstitution(),
        fetchUniverseStats(),
        fetchFindingsStats(),
        fetchCurrentUser(),
      ]);

      const systemContext: SystemContext = {
        constitution,
        universeStats,
        recentFindings,
        currentUser,
        timestamp: new Date().toISOString(),
      };

      setContext(systemContext);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load context'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContext();

    if (opts.autoRefresh && opts.refreshIntervalMs) {
      const interval = setInterval(loadContext, opts.refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [opts.autoRefresh, opts.refreshIntervalMs]);

  return {
    context,
    isLoading,
    error,
    refresh: loadContext,
    loadingSteps,
  };
}

/**
 * Formats the system context into a compact string for AI consumption
 */
export function formatContextForAI(context: SystemContext): string {
  const parts: string[] = [];

  if (context.constitution) {
    parts.push(`[CONSTITUTION: ${context.constitution.methodology_name} v${context.constitution.version}]`);
  }

  if (context.universeStats) {
    parts.push(
      `[UNIVERSE: ${context.universeStats.totalEntities} entities, ${context.universeStats.criticalRiskCount} critical]`
    );
  }

  if (context.recentFindings) {
    parts.push(
      `[FINDINGS: ${context.recentFindings.total} (30d), ${context.recentFindings.critical} critical]`
    );
  }

  if (context.currentUser) {
    parts.push(`[USER: ${context.currentUser.role}]`);
  }

  return parts.join(' ');
}
