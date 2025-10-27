import { useValidatedQuery } from '../useValidatedQuery'
import { queries } from '@/composition'
import { resourceKeys } from '../../lib/query-keys'
import type { ResourceListItemDTO } from '@/application/queries/dtos'

/**
 * useResources - Query hook для списка ресурсов
 * 
 * ✅ Возвращает стандартный UseQueryResult из TanStack Query
 * ✅ Компонент работает со стандартными флагами
 * 
 * @example Использование в компоненте
 * function ResourceList() {
 *   const { data, isLoading, error, refetch } = useResources()
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   if (error) {
 *     return <ErrorBanner errors={error} onRetry={refetch} />
 *   }
 *   
 *   return (
 *     <ul>
 *       {data.map(resource => (
 *         <li key={resource.id}>{resource.name}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * 
 * @layer Presentation (React Hooks)
 */
export function useResources(filters?: { namespace?: string; search?: string }) {
  return useValidatedQuery<ResourceListItemDTO[]>({
    queryKey: resourceKeys.list(filters),
    queryFn: () => queries.list(),
    staleTime: 5 * 60 * 1000,  // 5 минут
    gcTime: 10 * 60 * 1000,    // 10 минут
  })
}
