# Mock Data Migration (Sıfır-Mock Hedefi)

Bu klasör ve proje genelinde **sahte veri (mock)** kullanımı FSD ve .cursorrules gereği kısıtlıdır. Aşağıdaki yerlerde hâlâ mock kullanılıyor; bunların Supabase `useQuery` + ilgili API ile değiştirilmesi önerilir.

## Features (Mock kullanan)

| Dosya | Kullanım | Öneri |
|-------|----------|--------|
| ~~`features/ai-anomaly/ui/AIAnomalyPanel.tsx`~~ | ~~MOCK_SUGGESTIONS~~ | **Tamamlandı:** useCCMAlerts + ccm_alerts, resolveAnomaly |
| `features/investigation/FreezeProtocol.ts` | MOCK_EVIDENCE_TEMPLATES | evidence_templates tablosu + seed |
| ~~`features/process-canvas/`~~ | ~~MOCK_INITIAL_*~~ | **Tamamlandı:** useProcessGraph + useSaveProcessGraph (process_maps.nodes_json/edges_json) |
| `features/finding-studio/.../NegotiationBoardWidget.tsx` | MOCK_USERS, MOCK_MESSAGES | user_profiles + negotiation_messages |
| `features/auditee-portal/.../FindingRightSidebar.tsx` | MOCK_MESSAGES | messages tablosu |
| ~~`features/action-review/ui/AIEvidenceAnalyzer.tsx`~~ | ~~MOCK_EVIDENCE~~ | **Tamamlandı:** useEvidence + action_evidence API |
| ~~`features/report-editor/.../ExecutiveSummaryStudio.tsx`~~ | ~~AI_MOCK_*~~ | **Tamamlandı:** useReportSummary + m6_reports.executive_summary |
| `features/reporting/ExecSummaryGenerator.tsx` | MOCK_FINDINGS | audit_findings useQuery (ayrı bileşen) |
| `features/execution/ui/BudgetTrackerCard.tsx` | MOCK_BUDGET | engagements/financial API |
| ~~`features/autonomous-remediation/.../CampaignManager.tsx`~~ | ~~MOCK_CAMPAIGNS~~ | **Tamamlandı:** useCampaigns (master_action_campaigns + actions) |
| ~~`features/regulatory-export/.../RemediationDossier.tsx`~~ | ~~MOCK_DATA~~ | **Tamamlandı:** useDossierData (actions + action_evidence, closed) |
| ~~`features/report-editor/.../ExecutiveSummaryStudio.tsx`~~ | ~~AI_MOCK_*~~ | **Tamamlandı:** useReportSummary + m6_reports.executive_summary |
| ~~`features/delphi-engine/store.ts`~~ | ~~MOCK_RISKS~~ | **Tamamlandı:** useDelphiRisks (rkm_risks) + useSaveDelphiConsensus, Konsensüsü Mühürle |
| ~~`features/neural-map/`~~ | ~~MOCK_NEURAL_*~~ | **Tamamlandı:** useNeuralUniverse + audit_entities, buildGraphFromEntities (path/ltree) |
| `features/universe/api/mock-data.ts` | MOCK_UNIVERSE_DATA | audit_entities zaten var; useQuery kullan |

## Pages (Mock kullanan)

| Dosya | Kullanım | Öneri |
|-------|----------|--------|
| `pages/reporting/ActivityReportsPage.tsx` | MOCK_REPORTS | activity_reports tablosu + useQuery |
| ~~`pages/strategy/NeuralMapPage.tsx`~~ | ~~MOCK_NEURAL_*~~ | **Tamamlandı:** useNeuralUniverse (audit_entities) |
| ~~`pages/reporting/EntityScorecardPage.tsx`~~ | ~~MOCK_ENTITIES~~ | **Tamamlandı:** useAuditEntities + useEntityFindingCounts (audit_entities + audit_findings/engagement) |
| `pages/action-workbench/AuditorWorkbenchPage.tsx` | MOCK_ACTION, MOCK_EVIDENCE | actions / action_evidence API |
| `pages/auth/LoginPage.tsx` | MOCK_CREDENTIALS, MOCK_USER | Demo için bırakılabilir; prod’da Supabase Auth |

## Tamamlanan

- **Kaynak Tahsisi (Resource Allocations):** `auditor_profiles` + `user_profiles` join ile gerçek veri; seed 0.3b ile 5 denetçi.
- **Gantt Commit:** Taslak commit doğrudan `audit_engagements` UPDATE + invalidate + discard.
- **Aksiyon Kanıtları (AI Evidence Analyzer):** `action_evidence` useEvidence + analyzeEvidence mutation; ai_confidence_score ve ai_analysis_summary Supabase UPDATE.
- **Yönetici Özeti (Executive Summary Studio):** m6_reports useReportSummary + generateSummary mutation; audit_findings (HIGH/CRITICAL) ile sentez, executive_summary JSONB UPDATE.
- **CCM Anomali Paneli:** useCCMAlerts (ccm_alerts OPEN/INVESTIGATING), resolveAnomaly (status DISMISSED + resolved_at); toast "Anomali Kapatıldı".
- **Neural Map (Sinir Haritası):** useNeuralUniverse (audit_entities), buildGraphFromEntities (path/ltree hiyerarşi); mock data kaldırıldı, hata/boş ekran eklendi.
- **Process Canvas (Süreç Haritası):** useProcessGraph(entityId), useSaveProcessGraph; process_maps (nodes_json, edges_json) ile DB bağlantısı; mock kaldırıldı, kaydet toast "Süreç haritası mühürlendi".
- **Delphi Engine (Oracle Board):** useDelphiRisks (rkm_risks ACTIVE, inherent_*), useSaveDelphiConsensus (UPDATE inherent_impact/likelihood/volume); mock kaldırıldı, "Konsensüsü Mühürle" + toast "Risk konsensüsü mühürlendi".
- **Birim Karnesi (Entity Scorecard):** useAuditEntities + useEntityFindingCounts (audit_entities, audit_findings → engagement → entity_id); MOCK_ENTITIES kaldırıldı, boş evren durumu eklendi.
- **Master Action Campaigns (Campaign Manager):** useCampaigns (master_action_campaigns + actions sayıları); MOCK_CAMPAIGNS kaldırıldı, tablo yoksa sessizce [].
- **Mevzuat İyileştirme Dosyası (Remediation Dossier):** useDossierData (actions status=closed + action_evidence); MOCK_DATA kaldırıldı, dosya yoksa boş durum mesajı.
