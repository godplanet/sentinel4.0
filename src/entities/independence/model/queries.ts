import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { declarationsApi } from '../api/declarations-api';
import { supabase } from '@/shared/api/supabase';

export const independenceKeys = {
  all: ['independence'] as const,
  declaration: (engagementId: string, auditorId: string) => [...independenceKeys.all, 'declaration', engagementId, auditorId] as const,
};

export function useDeclarationStatus(engagementId: string) {
  return useQuery({
    queryKey: independenceKeys.declaration(engagementId, 'current-user'),
    queryFn: async () => {
      let userId: string | undefined;
      const userStr = localStorage.getItem('sentinel_user');
      if (userStr) {
        try { userId = JSON.parse(userStr).id; } catch (e) {}
      }
      if (!userId) {
        const session = await supabase.auth.getUser();
        userId = session.data.user?.id;
      }
      if (!userId) throw new Error('Kullanıcı bulunamadı');
      return declarationsApi.getDeclaration(engagementId, userId);
    },
    enabled: !!engagementId,
  });
}

export function useSignDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ engagementId, declarationText }: { engagementId: string; declarationText: string }) => {
      let userId: string | undefined;
      const userStr = localStorage.getItem('sentinel_user');
      if (userStr) {
        try { userId = JSON.parse(userStr).id; } catch (e) {}
      }
      if (!userId) {
        const session = await supabase.auth.getUser();
        userId = session.data.user?.id;
      }
      if (!userId) throw new Error('Kullanıcı bulunamadı');
      
      let ipAddress = 'unknown';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipAddress = data.ip;
      } catch (e) {
        console.warn('IP alınamadı', e);
      }

      return declarationsApi.signDeclaration(engagementId, userId, declarationText, ipAddress);
    },
    onSuccess: async (_, variables) => {
      let userId: string | undefined;
      const userStr = localStorage.getItem('sentinel_user');
      if (userStr) {
        try { userId = JSON.parse(userStr).id; } catch (e) {}
      }
      if (!userId) {
        const session = await supabase.auth.getUser();
        userId = session.data.user?.id;
      }
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: independenceKeys.declaration(variables.engagementId, 'current-user')
        });
      }
    },
  });
}
