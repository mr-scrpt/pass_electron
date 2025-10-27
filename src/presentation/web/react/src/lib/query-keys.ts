/**
 * Centralized Query Keys
 * 
 * Все query keys в одном месте для:
 * - Консистентность
 * - Type safety
 * - Легкая invalidation
 * - Prefix matching
 * 
 * @pattern Query Key Factory
 * @layer Presentation (React)
 */

/**
 * Query Keys для Resources
 * 
 * Иерархия:
 * - ['resources'] - все ресурсы
 * - ['resources', 'list'] - список (используется для invalidation списка)
 * - ['resources', 'list', filters] - фильтрованный список
 * - ['resources', 'detail', id] - один ресурс по ID
 */
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (filters?: { namespace?: string; search?: string }) =>
    [...resourceKeys.lists(), filters] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
} as const

/**
 * Query Keys для Namespaces
 */
export const namespaceKeys = {
  all: ['namespaces'] as const,
  lists: () => [...namespaceKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) =>
    [...namespaceKeys.lists(), filters] as const,
} as const

/**
 * Примеры использования:
 * 
 * @example Query
 * useQuery({
 *   queryKey: resourceKeys.lists(),
 *   queryFn: () => queries.list()
 * })
 * 
 * @example Invalidation - все списки
 * queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
 * 
 * @example Invalidation - конкретный ресурс
 * queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) })
 * 
 * @example Invalidation - все ресурсы (списки + детали)
 * queryClient.invalidateQueries({ queryKey: resourceKeys.all })
 */
