/**
 * Wave 21: Incident & Whistleblower — TanStack React Query Hooks
 * ============================================================
 * QA Anayasası: Tüm listeler (data || []).map(...) ile korunur.
 * Null/undefined değerler her zaman ?? operatörü ile yönetilir.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIncidents,
  fetchIncident,
  createIncident,
  updateIncident,
  fetchIncidentStats,
  submitWhistleblowerTip,
  fetchWhistleblowerTips,
} from '../api';
import type { CreateIncidentInput, SubmitTipInput, IncidentStats, Incident } from './types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const INCIDENT_KEYS = {
  all: ['incidents'] as const,
  detail: (id: string) => ['incidents', id] as const,
  stats: ['incidents', 'stats'] as const,
  tips: ['whistleblower_tips'] as const,
};

// ─── useIncidents — İhbar listesi ────────────────────────────────────────────

export function useIncidents() {
  return useQuery({
    queryKey: INCIDENT_KEYS.all,
    queryFn: fetchIncidents,
    select: (data) => (data || []),
    staleTime: 1000 * 30, // 30 saniye
  });
}

// ─── useIncident — Tek ihbar detayı ──────────────────────────────────────────

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: INCIDENT_KEYS.detail(id ?? ''),
    queryFn: () => fetchIncident(id!),
    enabled: !!id,
  });
}

// ─── useIncidentStats — Canlı istatistikler ──────────────────────────────────

export function useIncidentStats() {
  return useQuery<IncidentStats>({
    queryKey: INCIDENT_KEYS.stats,
    queryFn: fetchIncidentStats,
    // Hata durumunda boş stats döndür — WSOD yok
    select: (data): IncidentStats => ({
      total: data?.total ?? 0,
      open: data?.open ?? 0,
      closed: data?.closed ?? 0,
      anonymous: data?.anonymous ?? 0,
    }),
    staleTime: 1000 * 60, // 1 dakika
  });
}

// ─── useSubmitIncident — İhbar gönderimi (form mutation) ──────────────────────

export function useSubmitIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIncidentInput) => createIncident(input),
    onSuccess: () => {
      // İhbar listesini ve istatistikleri invalidate et — otomatik yenilenir
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.stats });
    },
  });
}

// ─── useUpdateIncident — Durum güncelleme (triage) ────────────────────────────

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Incident> }) =>
      updateIncident(id, updates),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.stats });
    },
  });
}

// ─── useWhistleblowerTips — Gelen ihbar uçları ───────────────────────────────

export function useWhistleblowerTips() {
  return useQuery({
    queryKey: INCIDENT_KEYS.tips,
    queryFn: fetchWhistleblowerTips,
    select: (data) => (data || []),
    staleTime: 1000 * 60,
  });
}

// ─── useSubmitWhistleblowerTip — Anonim ihbar ucu gönderimi ──────────────────

export function useSubmitWhistleblowerTip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitTipInput) => submitWhistleblowerTip(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCIDENT_KEYS.tips });
    },
  });
}
