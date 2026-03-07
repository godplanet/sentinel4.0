/**
 * Wave 53: Cyber Threat Intelligence & Dark Web Monitor — API Kancaları
 *
 * Tablolar: cyber_threat_feeds, darkweb_alerts
 *
 * ZORUNLU KURALLAR:
 * - Tehdit skoru hesaplarında (total_vulnerabilities || 1) — sıfıra bölünme yasak
 * - Tüm nullable alanlarda  ?.  ve  ??
 * - Array map'lerinde  (data || []).map(...)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const CTF_KEY  = ['cyber-threat-feeds'] as const;
const DWA_KEY  = ['darkweb-alerts'] as const;

/* ────────────────────────────────────────────────────────── */
/* Types                                                       */
/* ────────────────────────────────────────────────────────── */

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type ThreatStatus   = 'ACTIVE' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type DarkwebCategory =
  | 'DATA_LEAK' | 'CREDENTIAL_DUMP' | 'RANSOMWARE_LISTING'
  | 'FORUM_MENTION' | 'MARKET_LISTING' | 'BRAND_ABUSE' | 'EXEC_MENTION';
export type DarkwebStatus  = 'NEW' | 'VALIDATED' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface CyberThreatFeed {
  id: string;
  feed_source: string;
  threat_type: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  ioc_type: string | null;
  ioc_value: string | null;
  mitre_tactic: string | null;
  mitre_technique: string | null;
  total_vulnerabilities: number;
  affected_systems: string[];
  confidence_score: number;
  threat_actor: string | null;
  detected_at: string;
}

export interface DarkwebAlert {
  id: string;
  alert_code: string;
  title: string;
  description: string;
  category: DarkwebCategory;
  severity: ThreatSeverity;
  status: DarkwebStatus;
  source_forum: string | null;
  threat_actor_alias: string | null;
  affected_data_types: string[];
  estimated_records: number | null;
  evidence_snippet: string | null;
  confidence_score: number;
  feed_id: string | null;
  detected_at: string;
}

/** Tehdit risk skoru — (total_vulnerabilities || 1) sıfıra bölünme korumalı */
export interface ThreatWithScore extends CyberThreatFeed {
  risk_score: number;      // 0-100, ağırlıklı hesap
  vuln_density: number;    // vulnerabilities / (affected_systems.length || 1)
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                     */
/* ────────────────────────────────────────────────────────── */

const SEVERITY_WEIGHT: Record<ThreatSeverity, number> = {
  CRITICAL: 1.0,
  HIGH:     0.8,
  MEDIUM:   0.5,
  LOW:      0.2,
  INFORMATIONAL: 0.05,
};

function computeThreatScore(feed: CyberThreatFeed): ThreatWithScore {
  const sWeight = SEVERITY_WEIGHT[feed.severity] ?? 0.5;
  const confidence = (feed.confidence_score ?? 0) / 100;
  const vulns = feed.total_vulnerabilities ?? 0;
  const systems = (feed.affected_systems ?? []).length;

  // SIFIRA BÖLÜNME: (total_vulnerabilities || 1) ve (systems || 1)
  const vuln_density = vulns / (systems || 1);
  const risk_score   = Math.round(
    sWeight * 0.5 * 100 +
    confidence * 0.3 * 100 +
    Math.min(vulns / (vulns || 1), 1) * 0.2 * 100
  );

  return { ...feed, risk_score: Math.min(risk_score, 100), vuln_density };
}

/* ────────────────────────────────────────────────────────── */
/* Queries                                                     */
/* ────────────────────────────────────────────────────────── */

/** Tüm siber tehdit beslemelerini çeker — risk skoru ile zenginleştirilir */
export function useThreatFeeds() {
  return useQuery<ThreatWithScore[]>({
    queryKey: CTF_KEY,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cyber_threat_feeds')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('detected_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[CTI] useThreatFeeds error:', error.message);
        throw error;
      }
      return ((data ?? []) as CyberThreatFeed[]).map(computeThreatScore);
    },
  });
}

/** Dark web uyarılarını çeker */
export function useDarkwebAlerts() {
  return useQuery<DarkwebAlert[]>({
    queryKey: DWA_KEY,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('darkweb_alerts')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('detected_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[CTI] useDarkwebAlerts error:', error.message);
        throw error;
      }
      return (data ?? []) as DarkwebAlert[];
    },
  });
}

/** Kombine dashboard verisi — tek hook */
export function useCTIDashboard() {
  const { data: feeds = [], isLoading: fLoad, isError: fErr } = useThreatFeeds();
  const { data: alerts = [], isLoading: aLoad, isError: aErr } = useDarkwebAlerts();

  const criticals = (feeds || []).filter(f => f?.severity === 'CRITICAL').length
    + (alerts || []).filter(a => a?.severity === 'CRITICAL').length;
  const activethreats = (feeds || []).filter(f => f?.status === 'ACTIVE').length;
  const newAlerts = (alerts || []).filter(a => a?.status === 'NEW').length;

  return {
    feeds,
    alerts,
    criticals,
    activethreats,
    newAlerts,
    isLoading: fLoad || aLoad,
    isError:   fErr  || aErr,
  };
}
