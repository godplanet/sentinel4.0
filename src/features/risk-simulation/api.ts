/**
 * Risk Simulation API - React Hooks
 *
 * Provides hooks for managing risk simulations and analyzing results
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { createSimulationEngine } from './engine';
import type {
  SimulationRun,
  SimulationResult,
  SimulationImpactSummary,
  SimulationParams,
  SimulationProgress,
} from './types';

/**
 * Hook for running risk simulations
 */
export function useRiskSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (params: SimulationParams): Promise<SimulationRun | null> => {
    setIsRunning(true);
    setError(null);
    setProgress(null);

    try {
      const engine = createSimulationEngine((prog) => {
        setProgress(prog);
      });

      const run = await engine.runSimulation(params);
      return run;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Simulation failed';
      setError(errorMsg);
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    runSimulation,
    isRunning,
    progress,
    error,
  };
}

/**
 * Hook for fetching simulation results
 */
export function useSimulationResults(simulationId: string | null) {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!simulationId) {
      setResults([]);
      return;
    }

    fetchResults();
  }, [simulationId]);

  const fetchResults = async () => {
    if (!simulationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('risk_simulation_results')
        .select('*')
        .eq('simulation_run_id', simulationId)
        .order('delta', { ascending: false });

      if (fetchError) throw fetchError;

      setResults(Array.isArray(data) ? (data as SimulationResult[]) : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch results';
      setError(errorMsg);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    refetch: fetchResults,
  };
}

/**
 * Hook for fetching simulation impact summary
 * Calculates summary statistics from simulation results
 */
export function useSimulationImpact(simulationId: string | null) {
  const [impact, setImpact] = useState<SimulationImpactSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!simulationId) {
      setImpact(null);
      return;
    }

    fetchImpact();
  }, [simulationId]);

  const fetchImpact = async () => {
    if (!simulationId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all results for this simulation
      const { data: results, error: fetchError } = await supabase
        .from('risk_simulation_results')
        .select('*')
        .eq('simulation_run_id', simulationId);

      if (fetchError) throw fetchError;

      if (!results || !Array.isArray(results) || results.length === 0) {
        setImpact(null);
        return;
      }

      // Calculate summary statistics
      const totalEntities = results.length;
      const entitiesChanged = results.filter((r: any) => r?.zone_changed).length;
      const avgScoreChange = results.reduce((sum: number, r: any) => sum + (r?.delta || 0), 0) / totalEntities;
      const avgPercentageChange = avgScoreChange; // Simplified

      // Count by zone
      const criticalCount = results.filter((r: any) => r?.risk_zone_new === 'CRITICAL').length;
      const highCount = results.filter((r: any) => r?.risk_zone_new === 'HIGH').length;
      const mediumCount = results.filter((r: any) => r?.risk_zone_new === 'MEDIUM').length;
      const lowCount = results.filter((r: any) => r?.risk_zone_new === 'LOW').length;

      setImpact({
        simulation_run_id: simulationId,
        total_entities: totalEntities,
        entities_changed: entitiesChanged,
        avg_score_change: Number(avgScoreChange.toFixed(2)),
        avg_percentage_change: Number(avgPercentageChange.toFixed(2)),
        critical_count: criticalCount,
        high_count: highCount,
        medium_count: mediumCount,
        low_count: lowCount,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch impact summary';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    impact,
    isLoading,
    error,
    refetch: fetchImpact,
  };
}

/**
 * Hook for managing simulation history
 */
export function useSimulationHistory() {
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('risk_simulation_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      setRuns(Array.isArray(data) ? (data as SimulationRun[]) : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMsg);
      setRuns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRun = async (runId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('risk_simulation_runs')
        .delete()
        .eq('id', runId);

      if (deleteError) throw deleteError;

      setRuns((prev) => prev.filter((run) => run.id !== runId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete simulation';
      setError(errorMsg);
    }
  };

  return {
    runs,
    isLoading,
    error,
    refetch: fetchHistory,
    deleteRun,
  };
}

/**
 * Hook for filtering results by criteria
 */
export function useFilteredResults(results: SimulationResult[]) {
  const [filter, setFilter] = useState<'all' | 'zone_changes' | 'increased' | 'decreased'>('all');

  const safeResults = Array.isArray(results) ? results : [];

  const filteredResults = safeResults.filter((result) => {
    if (!result) return false;
    switch (filter) {
      case 'zone_changes':
        return result.zone_changed;
      case 'increased':
        return result.delta > 0;
      case 'decreased':
        return result.delta < 0;
      default:
        return true;
    }
  });

  return {
    filteredResults,
    filter,
    setFilter,
    totalCount: safeResults.length,
    filteredCount: filteredResults.length,
  };
}
