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
// Resource имеет публичные readonly поля (не геттеры!)
const dto: ResourceListItemDTO = {
  id: resource.id.getValue(),         // ResourceId → string
  namespace: resource.namespace.getValue(),  // Namespace → string
  name: resource.name.getValue(),     // ResourceName → string
  secretPreview: '****',              // Фиксированная маска для списка
  fieldsCount: 0,                     // Step 1: нет CustomField
  updatedAt: resource.updatedAt.toISOString()  // Date → string
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

### 2.3. Создать ListResourcesQueryHandler с монадами

> 📚 **Обработка ошибок:** См. [APPLICATION_ERROR_HANDLING.md](../../docs/error-handling/APPLICATION_ERROR_HANDLING.md)

> 💡 **BaseQueryHandler:** Используем базовый класс для переиспользования логики обработки ошибок

**Файл: `src/application/queries/handlers/ListResourcesQueryHandler.ts`**

#### ListResourcesQueryHandler [#class:ListResourcesQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
import { BaseQueryHandler } from '@/application/shared/BaseQueryHandler'
import type { ILogger } from '@/application/ports'
import type { IResourceRepository } from '@/domain'
import type { Resource } from '@/domain'
import type { Validation } from '@/shared/validation'
import type { IQueryHandler } from '../IQueryHandler'
import type { ListResourcesQuery } from '../ListResourcesQuery'
import type { ResourceListItemDTO } from '../dtos/ResourceListItemDTO'

/**
 * Query Handler: Получить список ресурсов
 * 
 * ✅ МОНАДИЧЕСКИЙ СТИЛЬ обработки:
 * - await repository.findAll() → Validation<Error[], Resource[]>
 * - .mapLeft() → обработка infrastructure/unknown ошибок
 * - .map() → трансформация Domain → DTO
 * - .map() → side-effect логирование
 * 
 * Консистентно с Value Objects и Invariants из Domain Layer
 * 
 * Наследование:
 * - extends BaseQueryHandler - получаем protected методы:
 *   - transformInfrastructureErrors() - для .mapLeft()
 *   - logQueryExecution() - логирование начала
 *   - logQuerySuccess() - логирование успеха
 * 
 * DI зависимости (инжектятся в Composition Layer):
 * - repository: IResourceRepository - доступ к данным
 * - logger: ILogger - логирование (передается в super())
 */
export class ListResourcesQueryHandler 
  extends BaseQueryHandler
  implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]> {
  
  constructor(
    private readonly repository: IResourceRepository,  // ✅ DI
    logger: ILogger  // ✅ DI
  ) {
    super(logger)  // Передаем logger в BaseQueryHandler
  }
  
  async handle(
    query: ListResourcesQuery
  ): Promise<Validation<Error[], ResourceListItemDTO[]>> {
    this.logQueryExecution('ListResourcesQuery')
    
    // ✅ Монадический pipeline без if-ов
    return (await this.repository.findAll())
      // 1. Обрабатываем infrastructure/unknown ошибки
      .mapLeft((errors) => 
        this.transformInfrastructureErrors(errors, 'find all resources')
      )
      // 2. Трансформируем Domain → DTO
      .map((resources) => 
        resources.map((resource) => this.toDTO(resource))
      )
      // 3. Side-effect: логируем успех
      .map((dtos) => {
        this.logQuerySuccess('ListResourcesQuery', { count: dtos.length })
        return dtos
      })
  }
  
  /**
   * Маппинг Domain → DTO
   * 
   * Resource (Domain класс с Value Objects) → ResourceListItemDTO (простой объект)
   * 
   * Извлекаем примитивы из Value Objects:
   * - resource.id (ResourceId) → resource.id.getValue() → string
   * - resource.namespace (Namespace) → resource.namespace.getValue() → string
   * - resource.name (ResourceName) → resource.name.getValue() → string
   * 
   * ⚠️ Resource имеет публичные readonly поля (не геттеры getId(), getNamespace() и т.д.)
   * 
   * Изолирован в отдельный метод для:
   * - Читаемости (не засоряем handle())
   * - Тестирования (можно тестировать отдельно)
   */
  private toDTO(resource: Resource): ResourceListItemDTO {
    return {
      id: resource.id.getValue(),
      namespace: resource.namespace.getValue(),
      name: resource.name.getValue(),
      secretPreview: '****',  // Фиксированная маска
      fieldsCount: 0,         // Step 1: нет CustomField
      updatedAt: resource.updatedAt.toISOString()
    }
  }
}
```

**Ключевые моменты:**

**Архитектура:**
- ✅ **Validation монады** вместо try-catch (type-safe)
- ✅ **BaseQueryHandler** для переиспользования (DRY)
- ✅ **Монадический стиль** - `.mapLeft()` + `.map()` без if-ов
- ✅ **Консистентно с Domain Layer** - как Value Objects и Invariants

**Наследование vs DI:**
- **BaseQueryHandler** - наследование (extends) - получаем protected методы
- **ILogger** - DI (через конструктор) - передается в super()
- **IResourceRepository** - DI (через конструктор) - используется в handle()

**Монадическая обработка ошибок:**
- `.mapLeft(errors => this.transformInfrastructureErrors(...))` - трансформация ошибок
- `transformInfrastructureErrors()` классифицирует БЕЗ instanceof
- Если infrastructure/unknown - логирует ERROR, возвращает [GenericApplicationError]
- Если только operational - пробрасывает без изменений
- **НЕТ if-ов** - чистая монадическая композиция

**Resource структура:**
- ✅ **Публичные readonly поля** - `resource.id`, `resource.namespace`, `resource.name`
- ❌ **НЕ геттеры** - нет `getId()`, `getNamespace()` и т.д.
- Это допустимый подход в DDD для простых Aggregate Roots

**Монадический pipeline:**
```
Repository.findAll() → Validation<Error[], Resource[]>
     ↓
.mapLeft() → transformInfrastructureErrors (обработка инфраструктурных)
     ↓
.map() → Domain → DTO (трансформация данных)
     ↓
.map() → logging (side-effect)
     ↓
Return → Validation<Error[], ResourceListItemDTO[]>
```

**Консистентность с Domain Layer:**
```typescript
// Value Object (Domain)
ResourceId.create(value)
  .map(validValue => new ResourceId(validValue))

// Invariant (Domain)
specResult
  .mapLeft(errors => errors.map(...))

// Query Handler (Application) - АНАЛОГИЧНО! ⭐
repository.findAll()
  .mapLeft(errors => this.transformInfrastructureErrors(...))
  .map(resources => resources.map(this.toDTO))
```

---

## 3. Создать Repository Interface с Validation

> ⚠️ **Важно:** Repository должен возвращать `Validation<Error[], T>` для type-safe обработки ошибок

**Файл: `src/domain/resource/repositories/IResourceRepository.ts`**

#### IResourceRepository [#interface:IResourceRepository|#code|#structure:path]

```typescript
// src/domain/resource/repositories/IResourceRepository.ts
import type { Validation } from '@/shared/validation'
import type { ResourceId } from '../value-objects/ResourceId'
import type { Namespace } from '../value-objects/Namespace'
import type { Resource } from '../aggregates/Resource'

/**
 * Интерфейс репозитория ресурсов
 * Определен в Domain Layer, реализован в Infrastructure Layer
 * 
 * ⚠️ Возвращает Validation<Error[], T> для type-safe обработки
 * ⚠️ Возвращает Domain типы (Resource), НЕ DTO!
 */
export interface IResourceRepository {
  findAll(): Promise<Validation<Error[], Resource[]>>
  findById(id: ResourceId): Promise<Validation<Error[], Resource | null>>
  findByNamespace(namespace: Namespace): Promise<Validation<Error[], Resource[]>>
  search(query: string): Promise<Validation<Error[], Resource[]>>
}
```

**Почему Validation:**
- ✅ Type-safe обработка ошибок (ошибки в типе!)
- ✅ Накопление всех ошибок (через mergeInMany)
- ✅ Нет try-catch Hell
- ✅ Railway-oriented programming

**Почему интерфейс в Domain?**
- Domain определяет контракт
- Infrastructure реализует детали
- Dependency Inversion Principle (DIP)

---

## 4. Создать Public API

### 4.1. Public API для Application Queries

**Файл: `src/application/queries/index.ts`**

```typescript
// src/application/queries/index.ts
export type { IQuery } from './IQuery'
export type { IQueryHandler } from './IQueryHandler'
export { ListResourcesQuery } from './ListResourcesQuery'
export { ListResourcesQueryHandler } from './handlers/ListResourcesQueryHandler'
export type { ResourceListItemDTO } from './dtos/ResourceListItemDTO'
```

### 4.2. Public API для Domain

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
