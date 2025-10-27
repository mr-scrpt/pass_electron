import { useQuery, type UseQueryResult, type UseQueryOptions } from '@tanstack/react-query'
import type { Validation } from '@/shared/validation'
import type { IError } from '@/shared/errors'

/**
 * useValidatedQuery - wrapper над useQuery для Validation<IError[], T>
 * 
 * Преобразует Validation монаду в стандартный Promise для TanStack Query:
 * - Right → return data (TanStack Query: isSuccess = true, data = T)
 * - Left → throw errors (TanStack Query: isError = true, error = IError[])
 * 
 * ✅ Компонент получает стандартные флаги TanStack Query
 * ✅ НЕ нужно проверять Validation в компоненте
 * ✅ Работает как обычный useQuery
 * 
 * @example Определение hook
 * export function useResources(filters?: { namespace?: string }) {
 *   return useValidatedQuery({
 *     queryKey: resourceKeys.list(filters),
 *     queryFn: () => queries.list(),
 *   })
 * }
 * 
 * @example Использование в компоненте
 * function ResourceList() {
 *   const { data, isLoading, error } = useResources()
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   if (error) {
 *     return <ErrorBanner errors={error} />
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
export function useValidatedQuery<TData>(
  options: Omit<UseQueryOptions<TData, IError[]>, 'queryFn'> & {
    queryFn: () => Promise<Validation<IError[], TData>>
  }
): UseQueryResult<TData, IError[]> {
  const { queryFn, ...restOptions } = options

  return useQuery<TData, IError[]>({
    ...restOptions,
    
    queryFn: async () => {
      // 1. Выполняем query (возвращает Validation монаду)
      const result = await queryFn()

      // 2. Validation → Promise (для TanStack Query)
      if (result.isLeft()) {
        // Left → throw (TanStack Query установит isError = true)
        throw result.value
      }

      // Right → return (TanStack Query установит isSuccess = true)
      return result.value
    },
  })
}
