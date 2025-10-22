# Application Layer Setup

> **Назад:** [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)  
> **Далее:** [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)

---

## 🎯 Цель

Создать Application Layer с CQRS паттерном (Query Handlers) и DTO для Presentation Layer.

> **📚 Детали**: 
> - [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers и CQRS
> - [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - DTO vs Domain типы

---

## Создать DTO для списка ресурсов

> **📚 Детали**: [TYPES_AND_ENTITIES.md#dto-для-presentation-layer](../../docs/TYPES_AND_ENTITIES.md#dto-для-presentation-layer)

**Файл: `src/application/queries/dtos/ResourceListItemDTO.ts`**

#### ResourceListItemDTO [#interface:ResourceListItemDTO|#code|#structure:path]

```typescript
// src/application/queries/dtos/ResourceListItemDTO.ts
/**
 * DTO для списка ресурсов
 * Простые примитивы для UI (не Value Objects!)
 */
export interface ResourceListItemDTO {
  id: string              // ResourceId → string
  namespace: string       // Namespace → string
  name: string           // ResourceName → string
  secretPreview?: string  // Первые символы + ***
  fieldsCount: number
  updatedAt: string      // Date → ISO string
}
```

**Почему строки, а не Value Objects?**
- DTO - это Data Transfer Object для Presentation Layer
- Не содержит бизнес-логики
- Удобно для JSON сериализации
- Query Handler преобразует Domain → DTO

---

## Создать Repository Interface

**Файл: `src/domain/resource/repositories/IResourceRepository.ts`**

#### IResourceRepository [#interface:IResourceRepository|#code|#structure:path]

```typescript
// src/domain/resource/repositories/IResourceRepository.ts
import type { ResourceId } from '../value-objects/ResourceId'
import type { Namespace } from '../value-objects/Namespace'
import type { Resource } from '../aggregates/Resource'

/**
 * Интерфейс репозитория ресурсов
 * Определен в Domain Layer, реализован в Infrastructure Layer
 * 
 * ⚠️ Возвращает Domain типы (Resource), НЕ DTO!
 */
export interface IResourceRepository {
  findAll(): Promise<Resource[]>
  findById(id: ResourceId): Promise<Resource | null>
  findByNamespace(namespace: Namespace): Promise<Resource[]>
  search(query: string): Promise<Resource[]>
}
```

**Почему интерфейс в Domain?**
- Domain определяет контракт
- Infrastructure реализует детали
- Dependency Inversion Principle (DIP)

---

## Создать Public API

**Файл: `src/domain/resource/repositories/index.ts`**

```typescript
// src/domain/resource/repositories/index.ts
export { IResourceRepository } from './IResourceRepository'
```

**Файл: `src/domain/resource/value-objects/index.ts`**

```typescript
// src/domain/resource/value-objects/index.ts
export { ResourceId } from './ResourceId'
export { Namespace } from './Namespace'
export { ResourceName } from './ResourceName'
```

**Файл: `src/domain/resource/index.ts`**

```typescript
// src/domain/resource/index.ts
export * from './value-objects'
export * from './aggregates'
export * from './repositories'
export * from './specifications'
```

---

## ✅ Результат

```
src/
├── domain/resource/
│   ├── repositories/
│   │   ├── IResourceRepository.ts
│   │   └── index.ts
│   └── index.ts (Public API)
│
└── application/queries/
    └── dtos/
        └── ResourceListItemDTO.ts
```

**Что дальше?**

Infrastructure Layer с Mock данными! → [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)

---

> **Назад:** [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)  
> **Далее:** [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)
