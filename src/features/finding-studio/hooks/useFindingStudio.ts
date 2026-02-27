import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { differenceInDays, parseISO, isValid } from 'date-fns';

// --- Imports ---
import { useMethodologyStore } from '@/features/admin/methodology/model/store';
import { useRiskConfigStore } from '@/features/admin/risk-configuration/model/store';
import type { Finding } from '@/entities/finding/model/types';
import {
  fetchFinding,
  createFinding,
  updateFinding
} from '@/entities/finding/api/supabase-api';

// --- Types ---
export type FindingMode = 'zen' | 'edit' | 'negotiation';

export interface SLAStatus {
  daysRemaining: number | null;
  isOverdue: boolean;
  label: string;
  statusColor: 'green' | 'amber' | 'red';
}

// UI Tarafında kullanılan Genişletilmiş Tip (Mevcut tiplerle uyumlu olmalı)
export interface ComprehensiveFinding {
  id: string;
  title: string;
  status: 'draft' | 'review' | 'negotiation' | 'approved' | 'closed' | 'rejected' | string; // GÖREV 4: rejected eklendi
  impact: number;
  likelihood: number;
  target_date?: string;
  internal_notes?: string;
  secrets?: any; // Tip esnekliği için any yapıldı
  category?: string;
  department?: string;
  tags?: string[];
  severity?: string;
  audit_framework?: 'STANDARD' | 'BDDK';
  bddk_deficiency_type?: string | null;
  control_effectiveness?: number;

  // GÖREV 1: GIS 2024 Metadata Expansion
  risk_category?: string; // Risk Universe (credit, market, operational...)
  process_id?: string; // Process Map
  subprocess_id?: string; // Subprocess
  control_id?: string; // Control Library reference

  // GÖREV 3: Evidence Management
  evidence_files?: string[]; // Array of file names/paths

  // GÖREV 4: Workflow
  rejection_reason?: string; // Rejection reason from reviewer

  // GÖREV 2 (Best-in-Class): Cross-Linking
  related_items?: Array<{
    id: string;
    type: 'Finding' | 'Policy' | 'Action' | 'Risk';
    title: string;
  }>;

  // GÖREV 3 (Best-in-Class): Activity Log
  activity_log?: Array<{
    id: string;
    timestamp: Date;
    action_type: string;
    actor: { name: string; role: string };
    details?: any;
  }>;

  [key: string]: any; // Dinamik alanlar için
}

const CURRENT_ROLE: 'auditor' | 'auditee' | 'viewer' = 'auditor';

export const useFindingStudio = () => {
  // 1. Router Integration
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const mode = (searchParams.get('mode') as FindingMode) || 'edit';

  // 2. Global Stores
  const { findingSections, fetchConfig } = useMethodologyStore();
  const riskConfig = useRiskConfigStore((state: any) => state);

  // 3. Local State
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // --- Helper: Data Sanitization ---
  const sanitizeData = useCallback((data: ComprehensiveFinding): ComprehensiveFinding => {
    if (CURRENT_ROLE !== 'auditor') {
      const sanitized = { ...data };
      delete sanitized.internal_notes;
      delete sanitized.secrets;
      return sanitized;
    }
    return data;
  }, []);

  // --- Effect: Initialize & Fetch Data ---
  useEffect(() => {
    let isMounted = true;

    const initStudio = async () => {
      setIsLoading(true);

      try {
        // 1. Metodolojiyi yükle (Eğer boşsa)
        if (findingSections.length === 0) {
           await fetchConfig();
        }

        if (!isMounted) return;

        if (id === 'new') {
          // --- YENİ KAYIT ---
          const dynamicFields = findingSections.reduce((acc, section) => {
            acc[section.key] = '';
            return acc;
          }, {} as Record<string, any>);

          const newTemplate: ComprehensiveFinding = {
            id: 'new',
            title: '',
            status: 'draft',
            impact: 1,
            likelihood: 1,
            control_effectiveness: 1,
            audit_framework: 'STANDARD',
            evidence_files: [],
            related_items: [],
            activity_log: [],
            ...dynamicFields,
          };

          setFinding(newTemplate);

        } else {
          // --- MEVCUT KAYIT: SUPABASE'DEN ÇEK ---
          try {
            const foundInDB = await fetchFinding(id);
            if (foundInDB) {
              setFinding(sanitizeData(foundInDB));
            } else {
              toast.error('Bulgu bulunamadı. Ana sayfaya yönlendiriliyorsunuz...');
              setTimeout(() => navigate('/execution/findings'), 2000);
              return;
            }
          } catch (dbError: any) {
            console.error('Database Fetch Error:', dbError);
            toast.error(`Veritabanı hatası: ${dbError.message || 'Bilinmeyen hata'}`);
          }
        }

      } catch (error) {
        console.error("Finding Studio Init Error:", error);
        toast.error('Veri yüklenirken bir hata oluştu.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initStudio();

    return () => { isMounted = false; };
  }, [id, navigate, sanitizeData, fetchConfig]);


  // --- Logic: Risk Engine Calculation ---
  const riskCalculation = useMemo(() => {
    if (!finding) return { score: 0, level: 'Low', color: 'gray', isVetoed: false };

    const simpleScore = (finding.impact || 1) * (finding.likelihood || 1);
    const isVetoed = simpleScore > 20;
    
    return {
      score: simpleScore,
      level: simpleScore > 20 ? 'Critical' : simpleScore > 10 ? 'High' : 'Low',
      color: simpleScore > 20 ? 'red' : 'green',
      isVetoed
    };
  }, [finding?.impact, finding?.likelihood]);


  // --- Logic: SLA Calculator ---
  const slaStatus = useMemo((): SLAStatus => {
    if (!finding?.target_date || !isValid(parseISO(finding.target_date))) {
      return { daysRemaining: null, isOverdue: false, label: 'Termin Yok', statusColor: 'gray' };
    }

    const today = new Date();
    const target = parseISO(finding.target_date);
    const diff = differenceInDays(target, today);
    const isOverdue = diff < 0;

    let color: SLAStatus['statusColor'] = 'green';
    if (isOverdue) color = 'red';
    else if (diff <= 3) color = 'amber';

    return {
      daysRemaining: diff,
      isOverdue,
      label: isOverdue ? `${Math.abs(diff)} Gün Gecikmeli` : `${diff} Gün Kaldı`,
      statusColor: color
    };
  }, [finding?.target_date]);


  // --- Actions ---

  const updateField = useCallback((field: string, value: any) => {
    setFinding((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  const setMode = useCallback((newMode: FindingMode) => {
    setSearchParams({ mode: newMode });
  }, [setSearchParams]);

  const saveFinding = useCallback(async () => {
    if (!finding) return;
    setIsSaving(true);

    try {
      if (id === 'new') {
        const engagementId = searchParams.get('engagement_id');

        if (!engagementId) {
          toast.error('Bulgu oluşturmak için bir Denetim Görevi seçilmelidir. Lütfen Denetim Yürütme sayfasından bu sayfaya gidin.');
          setIsSaving(false);
          return;
        }

        const createdFinding = await createFinding(finding, engagementId);

        setHasUnsavedChanges(false);
        toast.success('Yeni bulgu başarıyla oluşturuldu!');

        navigate(`/findings/${createdFinding.id}?mode=${mode}`, { replace: true });
        setFinding(createdFinding);

      } else {
        // --- MEVCUT KAYIT GÜNCELLE ---
        const updatedFinding = await updateFinding(id, finding);

        setHasUnsavedChanges(false);
        setFinding(updatedFinding);
        toast.success('Değişiklikler başarıyla kaydedildi.');
      }

    } catch (err: any) {
      console.error('Save Finding Error:', err);
      toast.error(err.message || 'Kaydetme başarısız oldu.');
    } finally {
      setIsSaving(false);
    }
  }, [finding, id, mode, navigate, searchParams]);

  return {
    finding,
    mode,
    riskScore: riskCalculation.score,
    riskLevel: riskCalculation.level,
    isVetoed: riskCalculation.isVetoed,
    slaStatus,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    userRole: CURRENT_ROLE,
    updateField,
    setMode,
    saveFinding,
    isEditable: mode === 'edit' || id === 'new',
  };
};