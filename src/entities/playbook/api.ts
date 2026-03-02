import { supabase } from '@/shared/api/supabase';

export type PlaybookCategory = 'BEST_PRACTICE' | 'LESSON_LEARNED' | 'RISK_INSIGHT' | 'METHODOLOGY' | 'OBSERVATION';

export interface PlaybookEntry {
  id: string;
  author_id: string;
  title: string;
  content: string;
  domain: string | null;
  category: PlaybookCategory;
  tags: string[];
  is_approved: boolean;
  created_at: string;
}

export interface CreatePlaybookEntryInput {
  title: string;
  content: string;
  category: PlaybookCategory;
  tags: string[];
  domain: string | null;
}

export async function fetchPlaybookEntries(): Promise<PlaybookEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? localStorage.getItem('sentinel_user_id');

  let query = supabase
    .from('playbook_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('author_id', userId);
  } else {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PlaybookEntry[];
}

export async function createPlaybookEntry(input: CreatePlaybookEntryInput): Promise<PlaybookEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? localStorage.getItem('sentinel_user_id') ?? 'demo-user';

  const { data, error } = await supabase
    .from('playbook_entries')
    .insert({
      author_id: userId,
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category,
      tags: input.tags,
      domain: input.domain || null,
      is_approved: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PlaybookEntry;
}

export async function deletePlaybookEntry(id: string): Promise<void> {
  const { error } = await supabase.from('playbook_entries').delete().eq('id', id);
  if (error) throw error;
}
