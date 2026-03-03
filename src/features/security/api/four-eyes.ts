import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

export type FourEyesStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface FourEyesApproval {
  id: string;
  tenant_id: string;
  resource_type: string;
  resource_id: string;
  action_name: string;
  maker_id: string;
  checker_id: string | null;
  status: FourEyesStatus;
  payload: unknown;
  created_at: string;
  decided_at: string | null;
}

export interface CreateFourEyesApprovalInput {
  resourceType: string;
  resourceId: string;
  actionName: string;
  payload?: unknown;
}

export async function createFourEyesApproval(
  input: CreateFourEyesApprovalInput,
): Promise<FourEyesApproval> {
  const { data, error } = await supabase
    .from('sys_four_eyes_approvals')
    .insert({
      tenant_id: ACTIVE_TENANT_ID,
      resource_type: input.resourceType,
      resource_id: input.resourceId,
      action_name: input.actionName,
      maker_id: (await supabase.auth.getUser()).data.user?.id ?? ACTIVE_TENANT_ID,
      status: 'PENDING',
      payload: input.payload ?? {},
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as FourEyesApproval;
}

