import { useMutation, type UseMutationResult, type UseMutationOptions } from '@tanstack/react-query'
import type { Validation } from '@/shared/validation'
import type { IError } from '@/shared/errors'

/**
 * useValidatedMutation - wrapper над useMutation для Validation<IError[], T>
 * 
 * Преобразует Validation монаду в стандартный Promise для TanStack Query:
 * - Right → return data (TanStack Query: isSuccess = true, data = T)
 * - Left → throw errors (TanStack Query: isError = true, error = IError[])
 * 
 * ✅ Компонент получает стандартные флаги TanStack Query
 * ✅ НЕ нужно проверять Validation в компоненте
 * ✅ Работает как обычный useMutation
 * 
 * @example Определение hook
 * export function useCreateResource() {
 *   return useValidatedMutation({
 *     mutationFn: (params: CreateResourceParams) => 
 *       commands.createResource(params),
 *   })
 * }
 * 
 * @example Использование в компоненте (Вариант 1: callbacks)
 * function CreateForm() {
 *   const create = useCreateResource()
 *   const { showSuccess, showError } = useNotification()
 *   const queryClient = useQueryClient()
 *   
 *   const handleSubmit = (formData) => {
 *     create.mutate(formData, {
 *       onSuccess: () => {
 *         showSuccess('Created!')
 *         queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
 *       },
 *       onError: (errors) => {
 *         showError(errors.map(e => e.getMessage()).join(', '))
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <button disabled={create.isPending}>
 *       {create.isPending ? 'Creating...' : 'Create'}
 *     </button>
 *   )
 * }
 * 
 * @example Использование в компоненте (Вариант 2: useEffect)
 * function CreateForm() {
 *   const create = useCreateResource()
 *   const { showSuccess, showError } = useNotification()
 *   
 *   useEffect(() => {
 *     if (create.isSuccess) {
 *       showSuccess('Created!')
 *       queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
 *     }
 *     
 *     if (create.isError) {
 *       showError(create.error.map(e => e.getMessage()).join(', '))
 *     }
 *   }, [create.isSuccess, create.isError])
 *   
 *   return (
 *     <button disabled={create.isPending}>
 *       {create.isPending ? 'Creating...' : 'Create'}
 *     </button>
 *   )
 * }
 * 
 * @layer Presentation (React Hooks)
 */
export function useValidatedMutation<TData, TVariables>(
  options: Omit<UseMutationOptions<TData, IError[], TVariables>, 'mutationFn'> & {
    mutationFn: (variables: TVariables) => Promise<Validation<IError[], TData>>
  }
): UseMutationResult<TData, IError[], TVariables> {
  const { mutationFn, ...restOptions } = options

  return useMutation<TData, IError[], TVariables>({
    ...restOptions,
    
    mutationFn: async (variables: TVariables) => {
      // 1. Выполняем команду (возвращает Validation монаду)
      const result = await mutationFn(variables)

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
