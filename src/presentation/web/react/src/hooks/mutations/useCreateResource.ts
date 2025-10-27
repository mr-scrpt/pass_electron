import { useValidatedMutation } from '../useValidatedMutation'
import { commands } from '@/composition'

/**
 * useCreateResource - Command mutation для создания ресурса
 * 
 * ✅ Возвращает стандартные флаги TanStack Query:
 * - isPending, isSuccess, isError, data, error
 * 
 * ✅ БЕЗ throw для Domain ошибок:
 * - Right → isSuccess: true
 * - Left → isError: true, error: IError[]
 * 
 * ✅ Компонент работает со стандартными флагами:
 * - НЕ нужно проверять Validation
 * - НЕ нужно callbacks в mutate()
 * - Просто useEffect на isSuccess/isError
 * 
 * @example Использование в компоненте
 * function CreateResourceForm() {
 *   const create = useCreateResource()
 *   const { showSuccess, showError } = useNotification()
 *   const queryClient = useQueryClient()
 *   
 *   // ✅ Стандартные флаги TanStack Query
 *   useEffect(() => {
 *     if (create.isSuccess) {
 *       showSuccess('Resource created!')
 *       queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
 *     }
 *     
 *     if (create.isError) {
 *       showError(create.error.map(e => e.getMessage()).join(', '))
 *     }
 *   }, [create.isSuccess, create.isError])
 *   
 *   return (
 *     <form onSubmit={(e) => {
 *       e.preventDefault()
 *       const formData = new FormData(e.currentTarget)
 *       create.mutate({
 *         namespace: formData.get('namespace') as string,
 *         name: formData.get('name') as string,
 *         secret: formData.get('secret') as string,
 *       })
 *     }}>
 *       <button disabled={create.isPending}>
 *         {create.isPending ? 'Creating...' : 'Create'}
 *       </button>
 *     </form>
 *   )
 * }
 * 
 * @layer Presentation (React Hooks)
 */
export type CreateResourceParams = {
  namespace: string
  name: string
  secret: string
}

export function useCreateResource() {
  return useValidatedMutation<void, CreateResourceParams>({
    mutationFn: (params) => commands.createResource(params),
    
    // Можно добавить optimistic updates
    // onMutate: async (newResource) => {
    //   await queryClient.cancelQueries({ queryKey: ['resources'] })
    //   
    //   const previousResources = queryClient.getQueryData(['resources'])
    //   
    //   queryClient.setQueryData(['resources'], (old) => [...old, newResource])
    //   
    //   return { previousResources }
    // },
    // 
    // onError: (err, newResource, context) => {
    //   queryClient.setQueryData(['resources'], context.previousResources)
    // }
  })
}
