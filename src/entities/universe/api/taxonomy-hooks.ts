/**
 * React Query hooks for Taxonomy API
 * Constitutional integration for Audit Universe
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TaxonomyAPI from './taxonomy-api';
import type { TaxonomyEntity } from './taxonomy-api';

const QUERY_KEYS = {
  all: ['risk-taxonomy'] as const,
  roots: () => ['risk-taxonomy', 'roots'] as const,
  entity: (id: string) => ['risk-taxonomy', 'entity', id] as const,
  entityByPath: (path: string) => ['risk-taxonomy', 'path', path] as const,
  children: (parentPath: string) => ['risk-taxonomy', 'children', parentPath] as const,
  subtree: (rootPath: string) => ['risk-taxonomy', 'subtree', rootPath] as const,
  topRisks: (limit: number) => ['risk-taxonomy', 'top-risks', limit] as const,
  search: (query: string) => ['risk-taxonomy', 'search', query] as const,
  summary: () => ['risk-taxonomy', 'summary'] as const,
};

/**
 * Get all root domains
 */
export function useRootDomains() {
  return useQuery({
    queryKey: QUERY_KEYS.roots(),
    queryFn: TaxonomyAPI.getRootDomains,
  });
}

/**
 * Get direct children of a node
 */
export function useDirectChildren(parentPath: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.children(parentPath),
    queryFn: () => TaxonomyAPI.getDirectChildren(parentPath),
    enabled: enabled && !!parentPath,
  });
}

/**
 * Get entire subtree
 */
export function useSubtree(rootPath: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.subtree(rootPath),
    queryFn: () => TaxonomyAPI.getSubtree(rootPath),
    enabled: enabled && !!rootPath,
  });
}

/**
 * Get entity by ID
 */
export function useEntity(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.entity(id ?? ''),
    queryFn: () => TaxonomyAPI.getEntityById(id!),
    enabled: !!id,
  });
}

/**
 * Get entity by path
 */
export function useEntityByPath(path: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.entityByPath(path ?? ''),
    queryFn: () => TaxonomyAPI.getEntityByPath(path!),
    enabled: !!path,
  });
}

/**
 * Search taxonomy
 */
export function useSearchTaxonomy(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => TaxonomyAPI.searchTaxonomy(query),
    enabled: query.length >= 2,
  });
}

/**
 * Get risk summary
 */
export function useRiskSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.summary(),
    queryFn: () => TaxonomyAPI.getRiskSummaryByType(),
  });
}

/**
 * Get top risks
 */
export function useTopRisks(limit = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.topRisks(limit),
    queryFn: () => TaxonomyAPI.getTopRisks(limit),
  });
}

/**
 * Create entity mutation
 */
export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TaxonomyAPI.createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

/**
 * Update entity mutation
 */
export function useUpdateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TaxonomyEntity> }) =>
      TaxonomyAPI.updateEntity(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.entity(data.id) });
      }
    },
  });
}

/**
 * Delete entity mutation
 */
export function useDeleteEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TaxonomyAPI.deleteEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}
