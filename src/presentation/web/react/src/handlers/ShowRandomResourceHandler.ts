/**
 * ShowRandomResourceHandler - обработчик действия "показать случайный ресурс"
 * 
 * Реализован в Presentation Layer (знает о React state).
 * Получает NotificationManager через Constructor DI.
 * 
 * @pattern Adapter
 * @pattern Dependency Injection
 * @layer Presentation
 */
import type { IActionHandler } from '@/application/actions'
import type { ShowRandomResourceAction } from '@/application/actions'
import type { INotificationManager } from '@/application/ports'
import type { ResourceListItemDTO } from '@/application/queries/dtos'

export class ShowRandomResourceHandler implements IActionHandler<ShowRandomResourceAction> {
  constructor(
    private resources: ResourceListItemDTO[],
    private setRandomResource: (resource: ResourceListItemDTO | null) => void,
    private notificationManager: INotificationManager  // DI через constructor
  ) {}
  
  handle(_action: ShowRandomResourceAction): void {
    if (this.resources.length === 0) {
      console.warn('[ShowRandomResourceHandler] No resources available')
      
      // Показываем warning уведомление
      this.notificationManager.notify({
        level: 'warning',
        message: 'No resources available',
        duration: 5000
      })
      
      return
    }
    
    // Выбираем случайный ресурс
    const randomIndex = Math.floor(Math.random() * this.resources.length)
    const randomResource = this.resources[randomIndex]
    
    // Обновляем UI (React state)
    this.setRandomResource(randomResource)
    
    // Показываем success уведомление с ID
    const notificationId = this.notificationManager.notify({
      level: 'success',
      message: `🎲 Random: ${randomResource.namespace}/${randomResource.name}`,
      duration: 4000
    })
    
    // Логируем на сервере (server-side console.log)
    console.log('🎲 Random Resource Selected:', {
      id: randomResource.id,
      namespace: randomResource.namespace,
      name: randomResource.name,
      notificationId  // ID уведомления
    })
  }
}
