# Infrastructure Layer Setup

> **Назад:** [APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md)  
> **Далее:** [COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md)

---

## 🎯 Цель

Реализовать Infrastructure Layer с Mock данными и MockResourceRepository.

---

## Создать Mock данные

**Файл: `src/infrastructure/mocks/resources.mock.ts`**

```typescript
// src/infrastructure/mocks/resources.mock.ts
/**
 * Mock данные для разработки
 * Простые объекты (не Domain типы!)
 */
export const mockResources = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    namespace: 'social',
    name: 'facebook',
    secret: 'MyFacebookPassword123!',
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    namespace: 'social',
    name: 'twitter',
    secret: 'MyTwitterPassword456!',
    createdAt: '2024-10-14T10:00:00Z',
    updatedAt: '2024-10-14T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    namespace: 'work',
    name: 'github',
    secret: 'MyGithubPassword789!',
    createdAt: '2024-10-16T10:00:00Z',
    updatedAt: '2024-10-16T10:00:00Z'
  }
]
```

**Файл: `src/infrastructure/mocks/index.ts`**

```typescript
// src/infrastructure/mocks/index.ts
export { mockResources } from './resources.mock'
```

---

## Создать MockResourceRepository

**Файл: `src/infrastructure/repositories/MockResourceRepository.ts`**

```typescript
// src/infrastructure/repositories/MockResourceRepository.ts
import type { IResourceRepository } from '@/domain/resource/repositories'
import type { Resource, ResourceId, Namespace } from '@/domain/resource'
import { mockResources } from '../mocks'

/**
 * Mock реализация репозитория
 * Преобразует plain objects → Domain типы
 */
export class MockResourceRepository implements IResourceRepository {
  async findAll(): Promise<Resource[]> {
    // Преобразуем mock данные в Domain типы через reconstitute
    return mockResources.map(mock => 
      Resource.reconstitute(
        ResourceId.create(mock.id).unwrap(),
        Namespace.create(mock.namespace).unwrap(),
        ResourceName.create(mock.name).unwrap(),
        mock.secret,
        new Date(mock.createdAt),
        new Date(mock.updatedAt)
      )
    )
  }

  async findById(id: ResourceId): Promise<Resource | null> {
    const mock = mockResources.find(r => r.id === id.getValue())
    if (!mock) return null
    
    return Resource.reconstitute(
      id,
      Namespace.create(mock.namespace).unwrap(),
      ResourceName.create(mock.name).unwrap(),
      mock.secret,
      new Date(mock.createdAt),
      new Date(mock.updatedAt)
    )
  }

  async findByNamespace(namespace: Namespace): Promise<Resource[]> {
    return mockResources
      .filter(r => r.namespace === namespace.getValue())
      .map(mock => 
        Resource.reconstitute(
          ResourceId.create(mock.id).unwrap(),
          namespace,
          ResourceName.create(mock.name).unwrap(),
          mock.secret,
          new Date(mock.createdAt),
          new Date(mock.updatedAt)
        )
      )
  }

  async search(query: string): Promise<Resource[]> {
    const lowerQuery = query.toLowerCase()
    return mockResources
      .filter(r => 
        r.namespace.includes(lowerQuery) || 
        r.name.includes(lowerQuery)
      )
      .map(mock => 
        Resource.reconstitute(
          ResourceId.create(mock.id).unwrap(),
          Namespace.create(mock.namespace).unwrap(),
          ResourceName.create(mock.name).unwrap(),
          mock.secret,
          new Date(mock.createdAt),
          new Date(mock.updatedAt)
        )
      )
  }
}
```

**Файл: `src/infrastructure/repositories/index.ts`**

```typescript
// src/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
```

---

## ✅ Результат

```
src/infrastructure/
├── mocks/
│   ├── resources.mock.ts
│   └── index.ts
└── repositories/
    ├── MockResourceRepository.ts
    └── index.ts
```

**Что дальше?**

Composition Layer для DI! → [COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md)

---

> **Назад:** [APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md)  
> **Далее:** [COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md)
