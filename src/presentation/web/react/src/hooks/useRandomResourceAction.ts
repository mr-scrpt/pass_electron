import type { ResourceListItemDTO } from "@/application/queries/dtos";
import { useKeymap } from "./useKeymap";
import { useNotification } from "../shared/provider/NotificationContext";
// import { tapLeft, tapRight } from "@/shared/validation"; // ✅ Можем использовать для side effects

/**
 * Hook для обработки Ctrl+I - показать случайный ресурс
 * 
 * ✅ Использует нашу Keymap систему
 * ✅ Использует NotificationManager
 * ✅ Простой и декларативный
 * 
 * @layer Presentation
 */
export function useRandomResourceAction(
  resources: ResourceListItemDTO[],
  setRandomResource: (resource: ResourceListItemDTO | null) => void,
): void {
  const { notificationManager } = useNotification();

  // ✅ Регистрируем горячую клавишу через нашу систему
  useKeymap({
    key: "Ctrl+I",
    context: {
      route: "/",
      mode: "navigation",
    },
    description: "Show random resource",
    action: () => {
      // Логика из ShowRandomResourceHandler
      if (resources.length === 0) {
        console.warn("[RandomResource] No resources available");
        
        notificationManager.notify({
          level: "warning",
          message: "No resources available",
          duration: 5000,
        });
        
        return;
      }

      // Выбираем случайный ресурс
      const randomIndex = Math.floor(Math.random() * resources.length);
      const randomResource = resources[randomIndex];

      // Обновляем UI (React state)
      setRandomResource(randomResource);

      // Показываем success уведомление
      const notificationId = notificationManager.notify({
        level: "success",
        message: `🎲 Random: ${randomResource.namespace}/${randomResource.name}`,
        duration: 4000,
      });

      console.log("🎲 Random Resource Selected:", {
        id: randomResource.id,
        namespace: randomResource.namespace,
        name: randomResource.name,
        notificationId,
      });
    },
  });
}
