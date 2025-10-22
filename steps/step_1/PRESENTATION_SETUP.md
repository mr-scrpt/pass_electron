# Presentation Layer Setup

> **Назад:** [COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md)  
> **Далее:** [VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md)

---

## 🎯 Цель

Создать React компоненты и React Router loader для отображения списка ресурсов.

> **📚 Детали**: [DATA_FLOW.md](../../docs/DATA_FLOW.md) - Поток данных в React Router

---

## Создать ResourceList компонент

**Файл: `src/presentation/web/react/src/components/ResourceList.tsx`**

```typescript
// src/presentation/web/react/src/components/ResourceList.tsx
import type { ResourceListItemDTO } from '@/application/queries/dtos'

interface Props {
  resources: ResourceListItemDTO[]
}

export function ResourceList({ resources }: Props) {
  return (
    <div className="space-y-2">
      {resources.map(resource => (
        <div key={resource.id} className="p-4 border rounded">
          <div className="flex justify-between">
            <div>
              <span className="text-sm text-gray-500">[{resource.namespace}]</span>
              <span className="ml-2 font-medium">{resource.name}</span>
            </div>
            <div className="text-sm text-gray-400">
              {new Date(resource.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Создать Route с Loader

**Файл: `src/presentation/web/react/src/routes/_index.tsx`**

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import type { Route } from './+types/_index'
import { ResourceList } from '@/components/ResourceList'
import { resourceRepository } from '@/composition'

/**
 * Loader - выполняется на сервере (SSR)
 * Получает данные для страницы
 */
export async function loader() {
  // 1. Получаем Domain типы из Repository
  const resources = await resourceRepository.findAll()
  
  // 2. Преобразуем Domain → DTO для UI
  const dtos = resources.map(resource => ({
    id: resource.getId().getValue(),
    namespace: resource.getNamespace().getValue(),
    name: resource.getName().getValue(),
    secretPreview: resource.getSecret().substring(0, 3) + '***',
    fieldsCount: 0,
    updatedAt: resource.getUpdatedAt().toISOString()
  }))
  
  return { resources: dtos }
}

/**
 * Component - рендерится с данными из loader
 */
export default function Index({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      <ResourceList resources={loaderData.resources} />
    </div>
  )
}
```

**Ключевые моменты:**
- Loader получает Domain типы
- Преобразование Domain → DTO в loader
- Component работает только с DTO
- SSR из коробки (React Router v7)

---

## ✅ Результат

```
src/presentation/web/react/src/
├── components/
│   └── ResourceList.tsx
└── routes/
    └── _index.tsx
```

**Что дальше?**

Примеры валидации! → [VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md)

---

> **Назад:** [COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md)  
> **Далее:** [VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md)
