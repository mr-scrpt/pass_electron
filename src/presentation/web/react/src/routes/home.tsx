//  src/presentation/web/react/src/routes/home.tsx
import { useState, useEffect } from 'react'
import { useLoaderData } from 'react-router'
import type { IActionHandler } from '@/application/actions'
import { ShowRandomResourceAction } from '@/application/actions'
import type { ResourceListItemDTO } from '@/application/queries/dtos'
import { ServiceContainer } from '@/composition'

/**
 * ShowRandomResourceHandler - обработчик действия "показать случайный ресурс"
 * 
 * Реализован в Presentation Layer (знает о React state)
 * Регистрируется динамически в useEffect
 */
class ShowRandomResourceHandler implements IActionHandler<ShowRandomResourceAction> {
  constructor(
    private resources: ResourceListItemDTO[],
    private setRandomResource: (resource: ResourceListItemDTO | null) => void
  ) {}
  
  handle(_action: ShowRandomResourceAction): void {
    if (this.resources.length === 0) {
      console.warn('[ShowRandomResourceHandler] No resources available')
      return
    }
    
    // Выбираем случайный ресурс
    const randomIndex = Math.floor(Math.random() * this.resources.length)
    const randomResource = this.resources[randomIndex]
    
    // Обновляем UI (React state)
    this.setRandomResource(randomResource)
    
    // Логируем на сервере (server-side console.log)
    console.log('🎲 Random Resource Selected:', {
      id: randomResource.id,
      namespace: randomResource.namespace,
      name: randomResource.name
    })
  }
}

interface LoaderData {
  resources?: ResourceListItemDTO[]
  errors?: unknown
}

export default function Home() {
  const data = useLoaderData<LoaderData>()
  const resources = data.resources ?? []
  
  // State для случайно выбранного ресурса
  const [randomResource, setRandomResource] = useState<ResourceListItemDTO | null>(null)
  
  // Регистрация Action Handler для Ctrl+I
  useEffect(() => {
    // Получаем Action Bus из ServiceContainer
    const actionBusResult = ServiceContainer.getActionBus()
    
    // Монадический подход - обрабатываем успех и ошибку
    return actionBusResult
      .map(actionBus => {
        // Создаем handler с доступом к resources и setState
        const handler = new ShowRandomResourceHandler(resources, setRandomResource)
        
        // Регистрируем handler
        actionBus.register('ShowRandomResourceAction', handler)
        console.log('[Home] ShowRandomResourceAction handler registered')
        
        // ВРЕМЕННО: Прямой перехват Ctrl+I (до реализации KeymapExecutor)
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.key === 'i') {
            e.preventDefault()
            console.log('[Home] Ctrl+I pressed, dispatching action...')
            actionBus.dispatch(new ShowRandomResourceAction()).catch(console.error)
          }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        
        // Cleanup функция - отменяем регистрацию при unmount
        return () => {
          window.removeEventListener('keydown', handleKeyDown)
          actionBus.unregister('ShowRandomResourceAction')
          console.log('[Home] ShowRandomResourceAction handler unregistered')
        }
      })
      .mapLeft(errors => {
        console.error('[Home] Failed to get ActionBus:', errors)
        return () => {} // Пустой cleanup если ошибка
      })
      .value // Извлекаем cleanup функцию из монады
  }, [resources]) // Re-register when resources change
  
  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-ctp-mauve mb-2">
          Password Manager
        </h1>
        <p className="text-ctp-subtext0 mb-8">
          Press <kbd className="px-2 py-1 bg-ctp-surface0 rounded">Ctrl+I</kbd> to show random resource
        </p>
        
        {/* Random Resource Highlight */}
        {randomResource && (
          <div className="mb-8 p-4 bg-ctp-yellow/10 border-2 border-ctp-yellow rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎲</span>
              <h2 className="text-xl font-semibold text-ctp-yellow">
                Random Resource
              </h2>
            </div>
            <div className="text-ctp-text">
              <span className="text-ctp-subtext0">[{randomResource.namespace}]</span>
              {' '}
              <span className="font-medium">{randomResource.name}</span>
            </div>
            <button
              onClick={() => setRandomResource(null)}
              className="mt-2 text-sm text-ctp-subtext0 hover:text-ctp-text"
            >
              Clear
            </button>
          </div>
        )}
        
        {/* Resources List */}
        <div>
          <h2 className="text-2xl font-semibold text-ctp-text mb-4">
            Resources ({resources.length})
          </h2>
          {resources.length === 0 ? (
            <p className="text-ctp-subtext0">No resources yet. Create one to get started!</p>
          ) : (
            <ul className="space-y-2">
              {resources.map(resource => (
                <li
                  key={resource.id}
                  className={
                    randomResource?.id === resource.id
                      ? "p-4 bg-ctp-yellow/20 border-2 border-ctp-yellow rounded-lg"
                      : "p-4 bg-ctp-surface0 rounded-lg hover:bg-ctp-surface1"
                  }
                >
                  <div className="text-ctp-text">
                    <span className="text-ctp-subtext0">[{resource.namespace}]</span>
                    {' '}
                    <span className="font-medium">{resource.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
