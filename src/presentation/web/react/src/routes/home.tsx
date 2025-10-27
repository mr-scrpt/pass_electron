//  src/presentation/web/react/src/routes/home.tsx
import { useState } from 'react'
import { useLoaderData } from 'react-router'
import type { ResourceListItemDTO } from '@/application/queries/dtos'
import { useRandomResourceAction } from '../hooks/useRandomResourceAction'

/**
 * Home Component - главная страница
 * 
 * ✅ Чистый презентационный компонент:
 * - Использует кастомные хуки
 * - Получает данные из loader
 * - Отображает UI
 * 
 * ❌ НЕ знает о:
 * - ServiceContainer
 * - Монадах
 * - DI
 * - Handler классах
 * 
 * @layer Presentation
 */

interface LoaderData {
  resources?: ResourceListItemDTO[]
  errors?: unknown
}

export default function Home() {
  const data = useLoaderData<LoaderData>()
  const resources = data.resources ?? []
  
  // State для случайно выбранного ресурса
  const [randomResource, setRandomResource] = useState<ResourceListItemDTO | null>(null)
  
  // ✅ Хук инкапсулирует всю логику DI, монад, Handler'ов
  useRandomResourceAction(resources, setRandomResource)
  
  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-ctp-mauve mb-2">
          Password Manager
        </h1>
        <p className="text-ctp-subtext0 mb-4">
          Press <kbd className="px-2 py-1 bg-ctp-surface0 rounded">Ctrl+I</kbd> to show random resource
        </p>
        
        {/* Test Notifications Link */}
        <div className="mb-8">
          <a
            href="/test-notifications"
            className="inline-block px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink transition-colors"
          >
            🧪 Test Notifications (Domain → UI Error Flow)
          </a>
        </div>
        
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
