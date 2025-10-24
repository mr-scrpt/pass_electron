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

## 1. Создать DTO для списка ресурсов

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
  secretPreview: string   // Secret → замаскированная строка ('****')
  fieldsCount: number     // Количество CustomField (0 в Step 1, будет в Step 2)
  updatedAt: string      // Date → ISO string
}
```

**Почему строки, а не Value Objects?**
- DTO - это Data Transfer Object для Presentation Layer
- Не содержит бизнес-логики
- Удобно для JSON сериализации
- Query Handler преобразует Domain → DTO

**Пример создания DTO:** [#code]

```typescript
// Маппинг Domain → DTO (выполняется в QueryHandler)
const dto: ResourceListItemDTO = {
  id: resource.getId().getValue(),
  namespace: resource.getNamespace().getValue(),
  name: resource.getName().getValue(),
  secretPreview: '****',  // Фиксированная маска для списка
  fieldsCount: 0,        // Step 1: нет CustomField
  updatedAt: resource.getUpdatedAt().toISOString()
}
```

---

## 2. Создать Query и QueryHandler (CQRS)

> **📚 Детали**: [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - CQRS паттерн

> ⚠️ **Упрощенная версия для Step 1:**  
> В этом шаге мы используем упрощенную версию CQRS с `Validation<Error[], T>` вместо `QueryResult<T>`.  
> Полная версия с `IQueryBus` и `QueryResult` будет добавлена в следующих шагах.  
> См. [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) для production версии.

### 2.1. Создать базовые интерфейсы CQRS

**Файл: `src/application/queries/IQuery.ts`**

#### IQuery [#interface:IQuery|#code|#structure:path]

```typescript
// src/application/queries/IQuery.ts
/**
 * Базовый интерфейс для всех Query
 * Query - это запрос на чтение данных (без изменений)
 */
export interface IQuery {
  readonly type: string
}
```

**Файл: `src/application/queries/IQueryHandler.ts`**

#### IQueryHandler [#interface:IQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/IQueryHandler.ts
import { Validation } from '@/shared/validation'
import type { IQuery } from './IQuery'

/**
 * Базовый интерфейс для Query Handler
 * 
 * @template Q - тип Query
 * @template R - тип результата (обычно DTO)
 */
export interface IQueryHandler<Q extends IQuery = IQuery, R = unknown> {
  handle(query: Q): Promise<Validation<Error[], R>>
}
```

---

### 2.2. Создать ListResourcesQuery

**Файл: `src/application/queries/ListResourcesQuery.ts`**

#### ListResourcesQuery [#class:ListResourcesQuery|#code|#structure:path]

```typescript
// src/application/queries/ListResourcesQuery.ts
import type { IQuery } from './IQuery'

/**
 * Query: Получить список всех ресурсов
 * 
 * Пустой Query (без параметров) - возвращает все ресурсы
 */
export class ListResourcesQuery implements IQuery {
  readonly type = 'ListResourcesQuery'
}
```

---

### 2.3. Создать ListResourcesQueryHandler

**Файл: `src/application/queries/handlers/ListResourcesQueryHandler.ts`**

#### ListResourcesQueryHandler [#class:ListResourcesQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
import { valid, invalid, type Validation } from '@/shared/validation'
import type { IQueryHandler } from '../IQueryHandler'
import type { ListResourcesQuery } from '../ListResourcesQuery'
import type { ResourceListItemDTO } from '../dtos/ResourceListItemDTO'
import type { IResourceRepository } from '@/domain'

/**
 * Query Handler: Получить список ресурсов
 * 
 * Ответственность:
 * 1. Получить Domain объекты из Repository
 * 2. Преобразовать Domain → DTO
 * 3. Вернуть DTO для Presentation Layer
 */
export class ListResourcesQueryHandler 
  implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]> {
  
  constructor(private readonly repository: IResourceRepository) {}
  
  async handle(
    query: ListResourcesQuery
  ): Promise<Validation<Error[], ResourceListItemDTO[]>> {
    try {
      // 1. Получаем Domain объекты
      const resources = await this.repository.findAll()
      
      // 2. Преобразуем Domain → DTO
      const dtos: ResourceListItemDTO[] = resources.map(resource => ({
        id: resource.getId().getValue(),
        namespace: resource.getNamespace().getValue(),
        name: resource.getName().getValue(),
        secretPreview: '****',  // Фиксированная маска
        fieldsCount: 0,         // Step 1: нет CustomField
        updatedAt: resource.getUpdatedAt().toISOString()
      }))
      
      // 3. Возвращаем DTO
      return valid(dtos)
      
    } catch (error) {
      // Непредвиденные ошибки (например, сеть, DB)
      return invalid([
        new Error(
          `Failed to list resources: ${error instanceof Error ? error.message : String(error)}`
        )
      ])
    }
  }
}
```

**Ключевые моменты:**
- ✅ **Маппинг Domain → DTO** выполняется ЗДЕСЬ (в QueryHandler)
- ✅ **Repository возвращает Domain** типы (Resource[])
- ✅ **QueryHandler возвращает DTO** для Presentation
- ✅ **Validation** для type-safe обработки ошибок

---

### 2.4. Создать Public API для queries

**Файл: `src/application/queries/index.ts`**

```typescript
// src/application/queries/index.ts
export type { IQuery } from './IQuery'
export type { IQueryHandler } from './IQueryHandler'
export { ListResourcesQuery } from './ListResourcesQuery'
export { ListResourcesQueryHandler } from './handlers/ListResourcesQueryHandler'
export type { ResourceListItemDTO } from './dtos/ResourceListItemDTO'
```

---

## 3. Создать Repository Interface

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
export { Secret } from './Secret'
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
    ├── IQuery.ts                    # Базовый интерфейс Query
    ├── IQueryHandler.ts             # Базовый интерфейс QueryHandler
    ├── ListResourcesQuery.ts        # Query: список ресурсов
    ├── handlers/
    │   └── ListResourcesQueryHandler.ts  # Handler с маппингом Domain → DTO
    ├── dtos/
    │   └── ResourceListItemDTO.ts       # DTO для Presentation
    └── index.ts                     # Public API
```

**Что дальше?**

Infrastructure Layer с Mock данными! → [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)

---

> **Назад:** [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)  
> **Далее:** [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)
