import { useQueryClient } from "@tanstack/react-query";
import { resourceKeys } from "../entity/query/query-keysuery-keys";

/**
 * useInvalidateResources - хук для инвалидации кеша ресурсов
 *
 * Предоставляет методы для инвалидации разных частей кеша:
 * - invalidateAll() - все ресурсы (списки + детали)
 * - invalidateLists() - только списки
 * - invalidateDetail(id) - конкретный ресурс по ID
 *
 * ⚠️ После invalidation TanStack Query автоматически рефетчит queries.
 *
 * @example Использование в мутации
 * const invalidate = useInvalidateResources()
 *
 * const createResource = useMutation({
 *   mutationFn: (data) => commands.createResource(data),
 *   onSuccess: () => {
 *     invalidate.invalidateLists()  // ← Рефетчит только списки
 *   }
 * })
 *
 * @example Использование в компоненте
 * const invalidate = useInvalidateResources()
 *
 * const handleRefresh = () => {
 *   invalidate.invalidateAll()  // ← Рефетчит всё
 * }
 *
 * @layer Presentation (React Hooks)
 */
export function useInvalidateResources() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate все ресурсы (списки + детали)
     *
     * Используется когда изменения могут повлиять на любые данные.
     */
    invalidateAll: () => {
      void queryClient.invalidateQueries({
        queryKey: resourceKeys.all, // ← Prefix match: все что начинается с ['resources']
      });
    },

    /**
     * Invalidate только списки ресурсов
     *
     * Используется после создания/удаления ресурса.
     * Детали конкретных ресурсов НЕ инвалидируются.
     */
    invalidateLists: () => {
      void queryClient.invalidateQueries({
        queryKey: resourceKeys.lists(), // ← Prefix match: ['resources', 'list']
      });
    },

    /**
     * Invalidate конкретный ресурс по ID
     *
     * Используется после обновления конкретного ресурса.
     * Списки НЕ инвалидируются.
     */
    invalidateDetail: (id: string) => {
      void queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(id), // ← Exact match: ['resources', 'detail', id]
      });
    },

    /**
     * Invalidate конкретный ресурс + все списки
     *
     * Используется когда изменение ресурса может повлиять на списки
     * (например, изменение namespace).
     */
    invalidateDetailAndLists: (id: string) => {
      void queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(id),
      });
      void queryClient.invalidateQueries({
        queryKey: resourceKeys.lists(),
      });
    },
  };
}
