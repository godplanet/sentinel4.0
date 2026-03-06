import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { differenceInDays, parseISO, isValid } from 'date-fns';

// --- Imports ---
import { useMethodologyStore } from '@/features/admin/methodology/model/store';
import { useRiskConfigStore } from '@/features/admin/risk-configuration/model/store';
import {
  fetchFinding,
  createFinding,
  updateFinding,
} from '@/entities/finding/api/supabase-api';

// --- Types ---
export type FindingMode = 'zen' | 'edit' | 'negotiation';

export interface SLAStatus {
  daysRemaining: number | null;
  isOverdue: boolean;
  label: string;
  statusColor: 'green' | 'amber' | 'red';
}

// UI Tarafında kullanılan Genişletilmiş Tip
export interface ComprehensiveFinding {
  id: string;
  title: string;
  status: 'draft' | 'review' | 'negotiation' | 'approved' | 'closed' | 'rejected' | string;
  impact: number;
  likelihood: number;
  target_date?: string;
  internal_notes?: string;
  secrets?: any;
  category?: string;
  department?: string;
  tags?: string[];
  severity?: string;
  audit_framework?: 'STANDARD' | 'BDDK';
  bddk_deficiency_type?: string | null;
  control_effectiveness?: number;
  risk_category?: string;
  process_id?: string;
  subprocess_id?: string;
  control_id?: string;
  evidence_files?: string[];
  rejection_reason?: string;
  related_items?: Array<{
    id: string;
    type: 'Finding' | 'Policy' | 'Action' | 'Risk';
    title: string;
  }>;
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

// Helper: Rol bazlı data sanitization
function sanitizeData(data: ComprehensiveFinding): ComprehensiveFinding {
  if (CURRENT_ROLE !== 'auditor') {
    const sanitized = { ...data };
    delete sanitized.internal_notes;
    delete sanitized.secrets;
    return sanitized;
  }
  return data;
}

// Helper: Yeni bulgu template oluştur
function buildNewTemplate(dynamicFields: Record<string, any>): ComprehensiveFinding {
  return {
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
}

export const useFindingStudio = () => {
  // 1. Router Integration
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mode = (searchParams.get('mode') as FindingMode) || 'edit';

  // 2. Global Stores
  const { findingSections, fetchConfig } = useMethodologyStore();
  useRiskConfigStore((state: any) => state); // Consumed for side effects

  // 3. Local Editable State (override için yerel kopya)
  const [localFinding, setLocalFinding] = useState<ComprehensiveFinding | null>(null);

  // === QUERY: Mevcut bulgu yükleme (only when id !== 'new') ===
  const {
    data: dbFinding,
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
  } = useQuery({
    queryKey: ['finding', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;
      const result = await fetchFinding(id);
      if (!result) {
        toast.error('Bulgu bulunamadı. Ana sayfaya yönlendiriliyorsunuz...');
        setTimeout(() => navigate('/execution/findings'), 2000);
        return null;
      }
      return sanitizeData(result as unknown as ComprehensiveFinding);
    },
    enabled: !!id && id !== 'new',
    retry: 1,
  });

  // AŞIRI SAVUNMACI: Sorgu hatası — BDDK ciddiyetinde log + toast
  useEffect(() => {
    if (isQueryError && queryError) {
      console.error('[SENTINEL KRİTİK HATA] Bulgu veritabanından alınamadı:', queryError);
      toast.error(
        `Bulgu verisi yüklenemedi: ${(queryError as Error)?.message ?? 'Bilinmeyen veritabanı hatası. Lütfen sistem yöneticinizle iletişime geçin.'}`,
        { duration: 8000 }
      );
    }
  }, [isQueryError, queryError]);

  // Metodoloji yapılandırması yükleme
  useEffect(() => {
    if (findingSections.length === 0) {
      fetchConfig().catch((err) => {
        console.error('[SENTINEL] Metodoloji yapılandırması alınamadı:', err);
      });
    }
  }, [findingSections.length, fetchConfig]);

  // Yerel state senkronizasyonu (remote data değişince merge et)
  useEffect(() => {
    if (id === 'new') {
      const dynamicFields = (findingSections || []).reduce((acc, section) => {
        acc[section?.key ?? ''] = '';
        return acc;
      }, {} as Record<string, any>);
      setLocalFinding(buildNewTemplate(dynamicFields));
    } else if (dbFinding) {
      setLocalFinding(dbFinding);
    }
  }, [id, dbFinding, findingSections]);

  // === MUTATION: Yeni bulgu oluşturma ===
  const createMutation = useMutation({
    mutationFn: async ({ finding, engagementId }: { finding: Partial<ComprehensiveFinding>; engagementId: string }) => {
      return await createFinding(finding as any, engagementId);
    },
    onSuccess: (created) => {
      toast.success('Yeni bulgu başarıyla oluşturuldu!');
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      navigate(`/findings/${created.id}?mode=${mode}`, { replace: true });
      setLocalFinding(created as unknown as ComprehensiveFinding);
    },
    onError: (err: any) => {
      console.error('[SENTINEL KRİTİK HATA] Bulgu oluşturulamadı:', err);
      toast.error(`Bulgu oluşturma başarısız: ${err?.message ?? 'Bilinmeyen bir hata oluştu.'}`);
    },
  });

  // === MUTATION: Mevcut bulgu güncelleme ===
  const updateMutation = useMutation({
    mutationFn: async ({ id: findingId, updates }: { id: string; updates: Partial<ComprehensiveFinding> }) => {
      return await updateFinding(findingId, updates as any);
    },
    onSuccess: (updated) => {
      toast.success('Değişiklikler başarıyla kaydedildi.');
      queryClient.invalidateQueries({ queryKey: ['finding', id] });
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      setLocalFinding(updated as unknown as ComprehensiveFinding);
    },
    onError: (err: any) => {
      console.error('[SENTINEL KRİTİK HATA] Bulgu güncellenemedi:', err);
      toast.error(`Kaydetme başarısız: ${err?.message ?? 'Bilinmeyen bir hata oluştu.'}`);
    },
  });

  // === ACTIONS ===

  const updateField = useCallback((field: string, value: any) => {
    setLocalFinding((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  }, []);

  const setMode = useCallback(
    (newMode: FindingMode) => {
      setSearchParams({ mode: newMode });
    },
    [setSearchParams]
  );

  const saveFinding = useCallback(async () => {
    if (!localFinding) return;

    if (id === 'new') {
      const engagementId = searchParams.get('engagement_id');
      if (!engagementId) {
        toast.error(
          'Bulgu oluşturmak için bir Denetim Görevi seçilmelidir. Lütfen Denetim Yürütme sayfasından bu sayfaya gidin.'
        );
        return;
      }
      createMutation.mutate({ finding: localFinding, engagementId });
    } else {
      updateMutation.mutate({ id: id!, updates: localFinding });
    }
  }, [localFinding, id, searchParams, createMutation, updateMutation]);

  // === HESAPLAMALAR ===

  const riskCalculation = useMemo(() => {
    if (!localFinding) return { score: 0, level: 'Low', color: 'gray', isVetoed: false };
    const simpleScore = (localFinding?.impact ?? 1) * (localFinding?.likelihood ?? 1);
    const isVetoed = simpleScore > 20;
    return {
      score: simpleScore,
      level: simpleScore > 20 ? 'Critical' : simpleScore > 10 ? 'High' : 'Low',
      color: simpleScore > 20 ? 'red' : 'green',
      isVetoed,
    };
  }, [localFinding?.impact, localFinding?.likelihood]);

  const slaStatus = useMemo((): SLAStatus => {
    const targetDate = localFinding?.target_date;
    if (!targetDate || !isValid(parseISO(targetDate))) {
      return { daysRemaining: null, isOverdue: false, label: 'Termin Yok', statusColor: 'green' };
    }
    const today = new Date();
    const target = parseISO(targetDate);
    const diff = differenceInDays(target, today);
    const isOverdue = diff < 0;
    let color: SLAStatus['statusColor'] = 'green';
    if (isOverdue) color = 'red';
    else if (diff <= 3) color = 'amber';
    return {
      daysRemaining: diff,
      isOverdue,
      label: isOverdue ? `${Math.abs(diff)} Gün Gecikmeli` : `${diff} Gün Kaldı`,
      statusColor: color,
    };
  }, [localFinding?.target_date]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isLoading = isQueryLoading || (id === 'new' ? false : !localFinding);

  return {
    finding: localFinding,
    mode,
    riskScore: riskCalculation.score,
    riskLevel: riskCalculation.level,
    isVetoed: riskCalculation.isVetoed,
    slaStatus,
    isLoading,
    isSaving,
    hasUnsavedChanges: false, // React Query handles sync
    userRole: CURRENT_ROLE,
    updateField,
    setMode,
    saveFinding,
    isEditable: mode === 'edit' || id === 'new',
  };
};
