# Шаг 1: Вывод списка моковых ресурсов

## 🎯 Цель

Создать минимальный end-to-end поток данных для отображения списка моковых ресурсов на главной странице `/`.

> **📦 Менеджер пакетов**: В проекте используется **pnpm**. Все команды используют `pnpm` вместо `npm`.

**Поток данных (CQRS)**:

#### Data Flow [#diagram:flow]

```
MockRepository → Query Handler → Query Bus → Facade → React Router Loader → React Component → UI
```

## 📊 Визуализация архитектуры

#### Architecture Diagram [#diagram:architecture]

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Request                       │
│                     GET /                                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│         React Router v7 Loader (Server)                 │
│  src/presentation/web/react/src/routes/_index.tsx::loader()                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│          Composition Layer (Facade)                      │
│  queries.resources.list(request)                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│          Application Layer (Query Handler)               │
│  ListResourcesQueryHandler.handle(query)                 │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│         Infrastructure Layer (Repository)                │
│  MockResourceRepository.findAll()                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│              Mock Data (in-memory)                       │
│  mockResources[] - статический массив                   │
└────────────────────┬────────────────────────────────────┘
                     ↓ (return data)
                     ↓
┌────────────────────┴────────────────────────────────────┐
│            React Component (Client)                      │
│  ResourceList → ResourceListItem                         │
│  отрисовка в браузере                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Порядок реализации

> **📘 Важно**: Перед началом ознакомьтесь с документацией:
> - [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - типизация в DDD: Value Objects, Entities, DTO ⭐
> - [DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - как DDD и Clean Architecture сочетаются
> - [COMPOSITION_LAYER.md](../../docs/COMPOSITION_LAYER.md) - декомпозиция и Multi-UI поддержка
> - [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers и CQRS паттерн
> - [DATA_FLOW.md](../../docs/DATA_FLOW.md) - поток данных в React Router

### Этап 0: Создание структуры папок

Перед началом создадим структуру Domain Layer согласно DDD Best Practices:

#### Create Domain Structure [#command]

```bash
# Создать структуру Domain Layer
mkdir -p src/domain/resource/aggregates
mkdir -p src/domain/resource/entities
mkdir -p src/domain/resource/value-objects
mkdir -p src/domain/resource/repositories
mkdir -p src/domain/resource/events
mkdir -p src/domain/shared/errors
mkdir -p src/domain/shared/invariants
mkdir -p src/domain/shared/base
```

**Структура:**
- `resource/` - Bounded Context для управления ресурсами
  - `aggregates/` - Aggregate Roots (главные сущности)
  - `entities/` - Entities (сущности внутри Aggregate)
  - `value-objects/` - Value Objects (неизменяемые значения)
  - `repositories/` - Repository Interfaces
  - `events/` - Domain Events
- `shared/` - Shared Kernel (переиспользуемое)
  - `errors/` - Базовые ошибки
  - `invariants/` - Переиспользуемые правила валидации
  - `base/` - Базовые классы/интерфейсы

> **📚 Детали**: [PROJECT_STRUCTURE.md#domain-layer](../../docs/PROJECT_STRUCTURE.md#1-domain-layer-srcdomain-) — Структура Domain Layer

### Step 1: Domain Layer - Создание доменного слоя

Создание ядра приложения - Domain Layer. - это основа архитектуры. Здесь определяются типы и контракты, независимые от фреймворков.

#### 1.1 Создать переиспользуемые инварианты (Shared Kernel)

> **📚 Детали**: [docs/error-handling/INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) — Полное описание паттерна Invariants

**Файл: `src/domain/shared/errors/InvariantViolationError.ts`**

#### InvariantViolationError [#class:InvariantViolationError|#code|#structure:path]

```typescript
// src/domain/shared/errors/InvariantViolationError.ts
export class InvariantViolationError extends Error {
  readonly code = 'INVARIANT_VIOLATION'
  
  constructor(
    readonly entityType: string,
    readonly invariant: string
  ) {
    super(`${entityType}: ${invariant}`)
    this.name = 'InvariantViolationError'
  }
}
```

**Файл: `src/domain/shared/invariants/UuidInvariant.ts`**

#### UuidInvariant [#class:UuidInvariant|#code|#structure:path]

```typescript
// src/domain/shared/invariants/UuidInvariant.ts
import { Result, ok, err } from 'neverthrow'
import { InvariantViolationError } from '../errors/InvariantViolationError'

/**
 * Инварианты для UUID
 */
export class UuidInvariant {
  private static readonly UUID_V4_REGEX = 
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  /**
   * Валидация UUID v4 через Result
   */
  static validate(
    value: string,
    entityType: string
  ): Result<string, InvariantViolationError> {
    if (!value) {
      return err(new InvariantViolationError(
        entityType,
        'UUID cannot be empty'
      ))
    }
    
    if (!this.UUID_V4_REGEX.test(value)) {
      return err(new InvariantViolationError(
        entityType,
        `Invalid UUID format: ${value}`
      ))
    }
    
    return ok(value)
  }
  
  /**
   * Type guard (не бросает)
   */
  static isValidUuid(value: string): boolean {
    return !!value && this.UUID_V4_REGEX.test(value)
  }
}
```

**Файл: `src/domain/shared/index.ts`**

#### Shared Public API [#code|#structure:path]

```typescript
// src/domain/shared/index.ts
export { InvariantViolationError } from './errors/InvariantViolationError'
export { UuidInvariant } from './invariants/UuidInvariant'
```

**Зачем Shared Kernel?**
- ✅ DRY — регулярное выражение в одном месте
- ✅ Переиспользование — можно использовать для `FieldId`, `EntryId`, etc.
- ✅ Тестируемость — один тест для всех UUID
- ✅ Изменяемость — изменить regex в одном месте

#### 1.2 Создать Value Object: ResourceId

> **📚 Детали**: [TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы](../../docs/TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы) — Почему класс, а не type alias

**Файл: `src/domain/resource/value-objects/ResourceId.ts`**

#### ResourceId [#class:ResourceId|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceId.ts
import { Result } from 'neverthrow'
import { InvariantViolationError } from '@/domain/shared/errors'
import { UuidInvariant } from '@/domain/shared/invariants'

/**
 * Value Object для ID ресурса
 * Инвариант: должен быть валидным UUID v4
 */
export class ResourceId {
  private constructor(private readonly _value: string) {}
  
  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID())
  }
  
  static create(value: string): Result<ResourceId, InvariantViolationError> {
    // ✅ Используем переиспользуемый инвариант с Result
    return UuidInvariant.validate(value, 'ResourceId')
      .map(validValue => new ResourceId(validValue))
  }
  
  getValue(): string {
    return this._value
  }
  
  equals(other: ResourceId): boolean {
    return this._value === other._value
  }
}
```

#### 1.3 Создать Value Object: Namespace

**Файл: `src/domain/resource/value-objects/Namespace.ts`**

#### Namespace [#class:Namespace|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/Namespace.ts
export class Namespace {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Namespace {
    // Валидация: 2-50 символов, lowercase
    if (!value || value.length < 2 || value.length > 50) {
      throw new Error('Namespace must be 2-50 characters')
    }
    if (!/^[a-z0-9-_]+$/.test(value)) {
      throw new Error('Namespace must contain only lowercase letters, numbers, - and _')
    }
    return new Namespace(value)
  }
  
  get value(): string {
    return this._value
  }
  
  equals(other: Namespace): boolean {
    return this._value === other._value
  }
}
```

**Зачем класс, а не просто строка?**
- Инкапсуляция валидации
- Гарантия корректности данных
- Невозможность создать невалидный Namespace
- Бизнес-логика в одном месте

#### 1.4 Создать Value Object: ResourceName

**Файл: `src/domain/resource/value-objects/ResourceName.ts`**

#### ResourceName [#class:ResourceName|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceName.ts
export class ResourceName {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): ResourceName {
    if (!value || value.length < 1 || value.length > 100) {
      throw new Error('ResourceName must be 1-100 characters')
    }
    return new ResourceName(value)
  }
  
  get value(): string {
    return this._value
  }
  
  equals(other: ResourceName): boolean {
    return this._value === other._value
  }
}
```

#### 1.5 Создать DTO для списка ресурсов

> **📚 Детали**: [TYPES_AND_ENTITIES.md#dto-для-presentation-layer](../../docs/TYPES_AND_ENTITIES.md#dto-для-presentation-layer) — Зачем нужны DTO

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

**Почему здесь строки, а не Value Objects?**
- ResourceListItemDTO - это Data Transfer Object для Presentation Layer
- Не содержит бизнес-логики
- Удобно для JSON сериализации в React Router loaders
- Query Handler преобразует Domain модель в DTO

#### 1.6 Создать Public API для resource модуля

> **📚 Детали**: [PROJECT_STRUCTURE.md#public-api-модулей](../../docs/PROJECT_STRUCTURE.md#public-api-модулей) — Правила Public API

**Файл: `src/domain/resource/value-objects/index.ts`**

#### Value Objects Public API [#code|#structure:path]

```typescript
// src/domain/resource/value-objects/index.ts
// Public API для Value Objects
export { ResourceId } from './ResourceId'
export { Namespace } from './Namespace'
export { ResourceName } from './ResourceName'
```

**Файл: `src/domain/resource/index.ts`**

#### Resource Module Public API [#code|#structure:path]

```typescript
// src/domain/resource/index.ts
// Public API модуля resource
export * from './value-objects'

// В будущем здесь появятся:
// export * from './aggregates'  // Resource
// export * from './entities'    // CustomField
// export * from './repositories'
// export * from './events'
```

#### 1.7 Создать интерфейс репозитория

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
 * Преобразование Domain → DTO происходит в Query Handler (Application Layer)
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

#### 1.7 Создать Public API для repositories

**Файл: `src/domain/repositories/index.ts`**

#### Domain Repositories Public API [#code|#structure:path]

```typescript
// src/domain/repositories/index.ts
export type { IResourceRepository } from './IResourceRepository'
```

---

### Этап 2: Infrastructure Layer (Mock данные)

Infrastructure Layer реализует интерфейсы из Domain Layer.

#### 2.1 Создать моковые данные

**Файл: `src/infrastructure/mocks/resources.mock.ts`**

#### Mock Resources Data [#code|#structure:path]

```typescript
// src/infrastructure/mocks/resources.mock.ts
import { Resource, ResourceId, Namespace, ResourceName } from '@/domain/resource'

/**
 * Mock данные для разработки
 * ⚠️ Используем Domain типы (Resource), НЕ DTO!
 * Infrastructure НЕ должен зависеть от Application Layer
 */
export const mockResources: Resource[] = [
  {
    id: '1',
    namespace: 'social',
    name: 'facebook',
    secretPreview: 'Fb***',
    fieldsCount: 3,
    updatedAt: new Date('2024-10-15').toISOString()
  },
  {
    id: '2',
    namespace: 'social',
    name: 'twitter',
    secretPreview: 'Tw***',
    fieldsCount: 2,
    updatedAt: new Date('2024-10-14').toISOString()
  },
  {
    id: '3',
    namespace: 'work',
    name: 'github',
    secretPreview: 'Gh***',
    fieldsCount: 4,
    updatedAt: new Date('2024-10-16').toISOString()
  },
  {
    id: '4',
    namespace: 'banking',
    name: 'revolut',
    secretPreview: 'Re***',
    fieldsCount: 2,
    updatedAt: new Date('2024-10-13').toISOString()
  },
  {
    id: '5',
    namespace: 'social',
    name: 'instagram',
    secretPreview: 'In***',
    fieldsCount: 3,
    updatedAt: new Date('2024-10-12').toISOString()
  }
]
```

#### 2.2 Создать Public API для mocks

**Файл: `src/infrastructure/mocks/index.ts`**

#### Mocks Public API [#code|#structure:path]

```typescript
// src/infrastructure/mocks/index.ts
export { mockResources } from './resources.mock'
```

#### 2.3 Реализовать Mock Repository

**Файл: `src/infrastructure/repositories/MockResourceRepository.ts`**

#### MockResourceRepository [#class:MockResourceRepository|#code|#structure:path]

```typescript
// src/infrastructure/repositories/MockResourceRepository.ts
import type { IResourceRepository } from '@/domain/repositories'
import type { Resource, ResourceId, Namespace } from '@/domain/resource'
import { mockResources } from '../mocks'

/**
 * Mock реализация репозитория ресурсов
 * Использует in-memory данные для разработки
 * 
 * ⚠️ Возвращает Domain типы (Resource), НЕ DTO!
 * Infrastructure НЕ должен зависеть от Application Layer
 */
export class MockResourceRepository implements IResourceRepository {
  async findAll(): Promise<Resource[]> {
    // В реальном проекте здесь будет преобразование из БД в Domain модель
    // Для упрощения возвращаем mock данные как есть
    return Promise.resolve([...mockResources])
  }
  
  async findById(id: ResourceId): Promise<Resource | null> {
    const resource = mockResources.find(r => r.id.equals(id))
    return Promise.resolve(resource ?? null)
  }
  
  async findByNamespace(namespace: Namespace): Promise<Resource[]> {
    const filtered = mockResources.filter(r => r.namespace.equals(namespace))
    return Promise.resolve(filtered)
  }
  
  async search(query: string): Promise<Resource[]> {
    const lowerQuery = query.toLowerCase()
    const filtered = mockResources.filter(r => 
      r.namespace.getValue().includes(lowerQuery) ||
      r.name.getValue().includes(lowerQuery)
    )
    return Promise.resolve(filtered)
  }
}
```

**Ключевые моменты**:
- Реализует интерфейс `IResourceRepository`
- Возвращает копию данных (иммутабельность)
- Асинхронные методы (как у реального API)

#### 2.4 Создать Public API для repositories

**Файл: `src/infrastructure/repositories/index.ts`**

#### Infrastructure Repositories Public API [#code|#structure:path]

```typescript
// src/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
```

---

### Этап 3: Application Layer (CQRS - Query Handler)

Application Layer реализует CQRS паттерн для разделения чтения (Queries) и записи (Commands).

#### 3.1 Создать Query Types константы

**Файл: `src/application/queries/QueryTypes.ts`**

#### QueryTypes [#code|#structure:path]

```typescript
// src/application/queries/QueryTypes.ts
/**
 * Константы типов Query (нет magic strings!)
 */
export const QueryTypes = {
  RESOURCE: {
    LIST: 'ListResourcesQuery',
    GET_BY_ID: 'GetResourceByIdQuery'
  }
} as const
```

#### 3.2 Создать интерфейсы Query и QueryHandler

**Файл: `src/application/queries/IQuery.ts`**

#### IQuery [#interface:IQuery|#code|#structure:path]

```typescript
// src/application/queries/IQuery.ts
export interface IQuery {
  readonly type: string
}
```

**Файл: `src/application/queries/IQueryHandler.ts`**

#### IQueryHandler [#interface:IQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/IQueryHandler.ts
import type { IQuery } from './IQuery'

export interface QueryResult<T = any> {
  data: T
  error?: string
}

export interface IQueryHandler<Q extends IQuery = IQuery, R = any> {
  handle(query: Q): Promise<QueryResult<R>>
}
```

**Файл: `src/application/queries/IQueryBus.ts`**

#### IQueryBus [#interface:IQueryBus|#code|#structure:path]

```typescript
// src/application/queries/IQueryBus.ts
import type { IQuery, IQueryHandler, QueryResult } from './'

export interface IQueryBus {
  register<Q extends IQuery>(type: string, handler: IQueryHandler<Q>): void
  execute<Q extends IQuery, R = any>(query: Q): Promise<QueryResult<R>>
}
```

#### 3.3 Создать Query класс

**Файл: `src/application/queries/ListResourcesQuery.ts`**

#### ListResourcesQuery [#class:ListResourcesQuery|#code|#structure:path]

```typescript
// src/application/queries/ListResourcesQuery.ts
import { QueryTypes } from './QueryTypes'
import type { IQuery } from './IQuery'

export class ListResourcesQuery implements IQuery {
  readonly type = QueryTypes.RESOURCE.LIST
  
  constructor(
    readonly namespace?: string,
    readonly search?: string
  ) {}
}
```

#### 3.4 Создать Query Handler

**Файл: `src/application/queries/handlers/ListResourcesQueryHandler.ts`**

#### ListResourcesQueryHandler [#class:ListResourcesQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
import type { IQueryHandler, QueryResult } from '../IQueryHandler'
import type { ListResourcesQuery } from '../ListResourcesQuery'
import type { IResourceRepository } from '@/domain/repositories'
import type { ResourceListItemDTO } from '../dtos/ResourceListItemDTO'

/**
 * Query Handler для получения списка ресурсов
 * Реализует CQRS паттерн для чтения данных
 * 
 * ⚠️ ВАЖНО: Преобразование Domain → DTO происходит ЗДЕСЬ!
 * Repository возвращает Domain типы (Resource)
 * Query Handler преобразует их в DTO для Presentation Layer
 */
export class ListResourcesQueryHandler implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]> {
  constructor(private repository: IResourceRepository) {}
  
  async handle(query: ListResourcesQuery): Promise<QueryResult<ResourceListItemDTO[]>> {
    try {
      // Получаем Domain типы из репозитория
      const resources = await this.repository.findAll()
      
      // Преобразуем Domain → DTO
      const dtos: ResourceListItemDTO[] = resources.map(resource => ({
        id: resource.id.getValue(),
        namespace: resource.namespace.getValue(),
        name: resource.name.getValue(),
        secretPreview: resource.getSecretPreview(),
        fieldsCount: resource.getFieldsCount(),
        updatedAt: resource.updatedAt.toISOString()
      }))
      
      // В будущем: фильтрация по namespace и search
      // const filtered = query.namespace 
      //   ? dtos.filter(dto => dto.namespace === query.namespace)
      //   : dtos
      
      return { data: dtos }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
```

**Зачем Query Handler?**
- CQRS: разделение чтения (Query) и записи (Command)
- Инкапсулирует логику получения данных
- Легко тестировать
- Легко кешировать результаты
- Изолирован от UI

#### 3.5 Создать Public API для queries

**Файл: `src/application/queries/index.ts`**

#### Queries Public API [#code|#structure:path]

```typescript
// src/application/queries/index.ts
export { QueryTypes } from './QueryTypes'
export type { IQuery } from './IQuery'
export type { IQueryHandler, QueryResult } from './IQueryHandler'
export type { IQueryBus } from './IQueryBus'
export { ListResourcesQuery } from './ListResourcesQuery'
export { ListResourcesQueryHandler } from './handlers/ListResourcesQueryHandler'

// DTO для Presentation (через Composition)
export type { ResourceListItemDTO } from './dtos/ResourceListItemDTO'
```

**Почему DTO экспортируются в Public API?**
- DTO нужны Presentation Layer для типизации компонентов
- Presentation НЕ может импортировать из внутренностей (`/dtos/`)
- DTO экспортируются в Public API Application, затем реэкспортируются в Composition
- Это позволяет Presentation импортировать DTO через `@/composition`

---

### Этап 4: Infrastructure Layer (Query Bus)

Сначала создадим реализацию Query Bus в Infrastructure Layer.

#### 4.1 Создать Query Bus Implementation

**Файл: `src/infrastructure/queries/InMemoryQueryBus.ts`**

#### InMemoryQueryBus [#class:InMemoryQueryBus|#code|#structure:path]

```typescript
// src/infrastructure/queries/InMemoryQueryBus.ts
import type { IQueryBus, IQuery, IQueryHandler, QueryResult } from '@/application/queries'

/**
 * In-Memory реализация Query Bus
 * Хранит handlers в Map и диспетчеризует queries
 */
export class InMemoryQueryBus implements IQueryBus {
  private handlers = new Map<string, IQueryHandler>()
  
  register<Q extends IQuery>(type: string, handler: IQueryHandler<Q>): void {
    this.handlers.set(type, handler)
  }
  
  async execute<Q extends IQuery, R = any>(query: Q): Promise<QueryResult<R>> {
    const handler = this.handlers.get(query.type)
    
    if (!handler) {
      return {
        data: null as R,
        error: `No handler registered for query type: ${query.type}`
      }
    }
    
    return handler.handle(query)
  }
}
```

**Файл: `src/infrastructure/queries/index.ts`**

#### Query Bus Public API [#code|#structure:path]

```typescript
// src/infrastructure/queries/index.ts
export { InMemoryQueryBus } from './InMemoryQueryBus'
```

---

### Этап 5: Composition Root (Modules + Facades)

Composition Root связывает все слои через декомпозированную структуру.

#### 5.1 Создать ResourceModule

**Файл: `src/composition/modules/ResourceModule.ts`**

#### ResourceModule [#class:ResourceModule|#code|#structure:path]

```typescript
// src/composition/modules/ResourceModule.ts
import type { IResourceRepository } from '@/domain/repositories'
import type { IQueryBus } from '@/application/queries'
import { QueryTypes, ListResourcesQueryHandler } from '@/application/queries'
import { MockResourceRepository } from '@/infrastructure/repositories'

/**
 * DI Module для Resource сущности
 * Управляет зависимостями и регистрацией handlers
 */
export class ResourceModule {
  private static repository: IResourceRepository | null = null
  
  static getRepository(): IResourceRepository {
    if (!this.repository) {
      this.repository = new MockResourceRepository()
    }
    return this.repository
  }
  
  static registerQueryHandlers(bus: IQueryBus): void {
    const repository = this.getRepository()
    
    bus.register(
      QueryTypes.RESOURCE.LIST,
      new ListResourcesQueryHandler(repository)
    )
  }
  
  static reset(): void {
    this.repository = null
  }
}
```

#### 5.2 Создать ServiceContainer (упрощенная версия для Шага 1)

**Файл: `src/composition/ServiceContainer.ts`**

#### ServiceContainer [#class:ServiceContainer|#code|#structure:path]

```typescript
// src/composition/ServiceContainer.ts
import { InMemoryQueryBus } from '@/infrastructure/queries'
import { ResourceModule } from './modules/ResourceModule'
import type { IQueryBus } from '@/application/queries'

/**
 * Root DI Container - координирует все модули
 * 
 * Примечание: В будущем (когда добавим Request Parser для Multi-UI)
 * будет принимать адаптеры через initialize(adapters).
 * Пока упрощенная версия для Шага 1.
 */
export class ServiceContainer {
  private static queryBus: IQueryBus | null = null
  private static initialized = false
  
  /**
   * Инициализация контейнера
   * В Шаге 1 - без параметров (только Query Bus)
   * В будущих шагах - будет принимать адаптеры (requestParser, clipboard и т.д.)
   */
  static initialize(): void {
    if (this.initialized) return
    
    const bus = new InMemoryQueryBus()
    
    // Регистрируем handlers из модулей
    ResourceModule.registerQueryHandlers(bus)
    
    this.queryBus = bus
    this.initialized = true
  }
  
  static getQueryBus(): IQueryBus {
    if (!this.initialized) {
      // Auto-initialize для удобства в Шаге 1
      // В production коде лучше бросать ошибку
      this.initialize()
    }
    return this.queryBus!
  }
  
  static reset(): void {
    this.queryBus = null
    this.initialized = false
    ResourceModule.reset()
  }
}
```

#### 5.3 Создать Query Facade

**Файл: `src/composition/queries/ResourceQueries.ts`**

#### ResourceQueries Facade [#code|#structure:path]

```typescript
// src/composition/queries/ResourceQueries.ts
import { ListResourcesQuery } from '@/application/queries'
import { ServiceContainer } from '../ServiceContainer'

/**
 * Facade для Resource Queries
 * Упрощает работу с queries в Loaders (одна строка!)
 */
export const resourceQueries = {
  /**
   * Получить список ресурсов
   * Facade инкапсулирует создание Query и вызов Query Bus
   * 
   * Примечание: В будущем (Шаг 5) будет использовать Request Parser
   * для парсинга параметров. Пока парсим напрямую из Request.
   */
  async list(request: Request) {
    // Парсинг request напрямую (в будущем через Request Parser)
    const url = new URL(request.url)
    const namespace = url.searchParams.get('namespace') || undefined
    const search = url.searchParams.get('search') || undefined
    
    // Создаем Query
    const query = new ListResourcesQuery(namespace, search)
    
    // Выполняем через Query Bus
    const queryBus = ServiceContainer.getQueryBus()
    return queryBus.execute(query)
  }
}
```

**Файл: `src/composition/queries/index.ts`**

#### Queries Facade Public API [#code|#structure:path]

```typescript
// src/composition/queries/index.ts
export { resourceQueries } from './ResourceQueries'

// Единый объект для всех queries
export const queries = {
  resources: resourceQueries
}
```

#### 5.4 Создать Public API для Composition

**Файл: `src/composition/index.ts`**

#### Composition Public API [#code|#structure:path]

```typescript
// src/composition/index.ts
export { queries } from './queries'
export { ServiceContainer } from './ServiceContainer'

// DTO для Presentation (реэкспорт из Application)
export type { ResourceListItemDTO } from '@/application/queries'

// В будущих шагах здесь появятся commands и другие exports
```

**Почему реэкспорт DTO через Composition?**
- Presentation НЕ должен импортировать из Application напрямую (нарушение Dependency Rule)
- Composition - единственный посредник между Presentation и Application
- DTO экспортируются в Application Public API, затем реэкспортируются в Composition
- Presentation импортирует DTO из `@/composition`, а не из `@/application/queries/dtos`

**Зачем такая декомпозиция?**
- **Масштабируемость**: каждая сущность в своем Module
- **Facade Pattern**: loader в одну строку
- **Multi-UI**: легко добавить CLI/Desktop через Request Parser
- **Нет Magic Strings**: все константы в QueryTypes
- **Тестируемость**: каждый Module независим

---

### Этап 6: Presentation Layer (UI)

Presentation Layer отвечает за отображение данных пользователю.

#### 6.1 Создать компонент ResourceListItem

**Файл: `src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx`**

#### ResourceListItem Component [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx
import type { ResourceListItemDTO } from '@/composition'

interface Props {
  resource: ResourceListItemDTO
}

/**
 * Компонент для отображения одного ресурса в списке
 */
export function ResourceListItem({ resource }: Props) {
  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex justify-between items-center">
        {/* Левая часть: namespace и name */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            [{resource.namespace}]
          </span>
          <span className="font-semibold text-gray-900">
            {resource.name}
          </span>
        </div>
        
        {/* Правая часть: метаданные */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            {resource.fieldsCount} {resource.fieldsCount === 1 ? 'field' : 'fields'}
          </span>
          {resource.secretPreview && (
            <span className="font-mono text-xs text-gray-400">
              {resource.secretPreview}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### 6.2 Создать компонент ResourceList

**Файл: `src/presentation/web/react/src/components/ResourceList/ResourceList.tsx`**

#### ResourceList Component [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceList.tsx
import type { ResourceListItemDTO } from '@/composition'
import { ResourceListItem } from './ResourceListItem'

interface Props {
  resources: ResourceListItemDTO[]
}

/**
 * Компонент для отображения списка ресурсов
 */
export function ResourceList({ resources }: Props) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No resources found</p>
        <p className="text-sm mt-2">Create your first resource to get started</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {resources.map(resource => (
        <ResourceListItem key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
```

#### 6.3 Создать Public API для компонентов

**Файл: `src/presentation/web/react/src/components/ResourceList/index.ts`**

#### ResourceList Public API [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList/index.ts
export { ResourceList } from './ResourceList'
export { ResourceListItem } from './ResourceListItem'
```

#### 6.4 Создать React Router Route

**Файл: `src/presentation/web/react/src/routes/_index.tsx`**

#### Index Route [#code|#structure:path]

> **💡 React Router v7 Type Safety**: Импорт `import type { Route } from './+types/_index'` - это специальная фича React Router v7 для типобезопасности.
>
> **Как это работает:**
> - React Router **автоматически генерирует** типы для каждого route файла
> - Виртуальный путь `./+types/_index` создается на лету (не существует физически)
> - Содержит типы `Route.LoaderArgs`, `Route.ComponentProps`, `Route.ActionArgs`
> - Обеспечивает type safety между loader/action и компонентом
>
> **Подробнее**: [React Router v7 Type Safety](https://reactrouter.com/start/framework/type-safety)

#### Route Implementation [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { useLoaderData } from 'react-router'
import type { Route } from './+types/_index'  // ← Автогенерируемые типы React Router v7
import { queries } from '@/composition'
import { ResourceList } from '@/components/ResourceList'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ (НОВЫЙ ПОДХОД - CQRS)
 * 
 * Loader выполняется ТОЛЬКО на сервере (Node.js)
 * НЕ выполняется на клиенте
 * 
 * Используем Facade Pattern:
 * - queries.resources.list(request) - инкапсулирует ВСЮ логику
 * - Loader не знает о Query Bus, Query Handlers, Repository
 * - Вся сложность скрыта в Composition Layer
 */
export async function loader({ request }: Route.LoaderArgs) {
  // ✅ ОДНА СТРОКА! Facade инкапсулирует всё
  return queries.resources.list(request)
}

/**
 * ✅ КЛИЕНТСКИЙ КОМПОНЕНТ (+ SSR)
 * 
 * Выполняется:
 * - На сервере при SSR (первый рендер)
 * - На клиенте после hydration
 */
export default function Index() {
  // Получаем данные из loader (типизированные)
  // useLoaderData - это hook для получения данных,
  // НЕ для фетчинга (данные уже загружены в loader)
  const { resources } = useLoaderData<typeof loader>()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Заголовок */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Password Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your passwords securely
          </p>
        </header>
        
        {/* Список ресурсов */}
        <main>
          <ResourceList resources={resources} />
        </main>
      </div>
    </div>
  )
}
```

**Ключевые моменты React Router + CQRS:**

1. **`loader()` - это СЕРВЕР**, не клиент
   - Выполняется на Node.js
   - Имеет доступ к файловой системе, БД, env переменным
   - Вызывается перед каждым рендерингом страницы

2. **Facade Pattern** - loader в одну строку
   - `queries.resources.list(request)` - вся логика инкапсулирована
   - Loader не знает о Query Bus, Handlers, Repository
   - Легко добавить кеширование, логирование, валидацию

3. **CQRS** - разделение чтения и записи
   - `queries.*` - для чтения данных (GET requests, loaders)
   - `commands.*` - для записи данных (POST/PUT/DELETE, actions)
   - Разные оптимизации для чтения и записи

4. **Type Safety**
   - `useLoaderData<typeof loader>()` - полная типизация
   - TypeScript знает структуру QueryResult<ResourceListItem[]>

**Детали см. в:**
- [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers и Facade
- [COMPOSITION_LAYER.md](../../docs/COMPOSITION_LAYER.md) - декомпозиция
- [DATA_FLOW.md](../../docs/DATA_FLOW.md) - поток данных

---

## 📁 Структура файлов

После выполнения шага у вас будет:

```
app/
├── domain/
│   ├── shared/                       # ← Shared Kernel (переиспользуемые инварианты)
│   │   ├── errors/
│   │   │   └── InvariantViolationError.ts
│   │   ├── invariants/
│   │   │   └── UuidInvariant.ts
│   │   └── index.ts
│   ├── value-objects/               # ← Value Objects
│   │   ├── ResourceId.ts
│   │   ├── Namespace.ts
│   │   ├── ResourceName.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IResourceRepository.ts
│       └── index.ts
│
├── application/
│   └── queries/                      # ← CQRS: Queries
│       ├── QueryTypes.ts             # ← Константы (нет magic strings)
│       ├── IQuery.ts
│       ├── IQueryHandler.ts
│       ├── IQueryBus.ts
│       ├── ListResourcesQuery.ts
│       ├── handlers/
│       │   └── ListResourcesQueryHandler.ts
│       ├── dtos/
│       │   └── ResourceListItemDTO.ts
│       └── index.ts
│
├── infrastructure/
│   ├── mocks/
│   │   ├── resources.mock.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── MockResourceRepository.ts
│   │   └── index.ts
│   └── queries/                      # ← Query Bus реализация
│       ├── InMemoryQueryBus.ts
│       └── index.ts
│
├── composition/                      # ← Composition Root (DI)
│   ├── modules/
│   │   └── ResourceModule.ts         # ← DI Module для Resource
│   ├── queries/
│   │   ├── ResourceQueries.ts        # ← Query Facade
│   │   └── index.ts
│   ├── ServiceContainer.ts           # ← Root Container (упрощенный для Шага 1)
│   └── index.ts
│
├── components/
│   └── ResourceList/
│       ├── ResourceList.tsx
│       ├── ResourceListItem.tsx
│       └── index.ts
│
└── routes/
    └── _index.tsx                    # ← Loader в 1 строку!
```

---

## ✅ Чек-лист выполнения

### Domain Layer
- [ ] Создать `src/domain/value-objects/ResourceId.ts`
- [ ] Создать `src/domain/value-objects/Namespace.ts`
- [ ] Создать `src/domain/value-objects/ResourceName.ts`
- [ ] Создать `src/domain/value-objects/index.ts`
- [ ] Создать `src/domain/repositories/IResourceRepository.ts`
- [ ] Создать `src/domain/repositories/index.ts`

### Application Layer (CQRS - Queries)
- [ ] Создать `src/application/queries/QueryTypes.ts`
- [ ] Создать `src/application/queries/IQuery.ts`
- [ ] Создать `src/application/queries/IQueryHandler.ts`
- [ ] Создать `src/application/queries/IQueryBus.ts`
- [ ] Создать `src/application/queries/ListResourcesQuery.ts`
- [ ] Создать `src/application/queries/handlers/ListResourcesQueryHandler.ts`
- [ ] Создать `src/application/queries/dtos/ResourceListItemDTO.ts`
- [ ] Создать `src/application/queries/index.ts`

### Infrastructure Layer
- [ ] Создать `src/infrastructure/mocks/resources.mock.ts`
- [ ] Создать `src/infrastructure/mocks/index.ts`
- [ ] Создать `src/infrastructure/repositories/MockResourceRepository.ts`
- [ ] Создать `src/infrastructure/repositories/index.ts`
- [ ] Создать `src/infrastructure/queries/InMemoryQueryBus.ts`
- [ ] Создать `src/infrastructure/queries/index.ts`

### Composition Root (DI + Facades)
- [ ] Создать `src/composition/modules/ResourceModule.ts`
- [ ] Создать `src/composition/ServiceContainer.ts` (с initialize(), без setEnvironment)
- [ ] Создать `src/composition/queries/ResourceQueries.ts`
- [ ] Создать `src/composition/queries/index.ts`
- [ ] Создать `src/composition/index.ts`

### Presentation Layer
- [ ] Создать `src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx`
- [ ] Создать `src/presentation/web/react/src/components/ResourceList/ResourceList.tsx`
- [ ] Создать `src/presentation/web/react/src/components/ResourceList/index.ts`
- [ ] Создать `src/presentation/web/react/src/routes/_index.tsx` (loader в 1 строку!)

### Запуск и проверка
- [ ] Запустить `pnpm dev`
- [ ] Открыть `http://localhost:5173` (или другой порт)
- [ ] Проверить что список ресурсов отображается
- [ ] Проверить стили и адаптивность
- [ ] Убедиться что loader содержит только: `return queries.resources.list(request)`

---

## 🎓 Что вы изучите

1. **Domain-Driven Design (DDD)**:
   - Value Objects (ResourceId, Namespace, ResourceName)
   - Repository Interfaces (IResourceRepository)
   - Dependency Inversion Principle

2. **Clean Architecture**:
   - Разделение на слои (Domain, Application, Infrastructure, Composition, Presentation)
   - Dependency Rule (зависимости к центру)
   - Public API модулей (index.ts)

3. **CQRS Pattern**:
   - Queries для чтения данных
   - Query Handlers для обработки
   - Query Bus для диспетчеризации
   - Разделение чтения и записи

4. **Composition Root**:
   - DI Modules по сущностям
   - Service Container координация
   - Facade Pattern для упрощения

5. **React Router v7 Framework**:
   - Server Loaders (SSR)
   - Facade упрощает loader до 1 строки
   - Type-safe data flow с автоматическими типами

6. **Паттерны**:
   - Facade Pattern
   - Module Pattern
   - Strategy Pattern (Request Parsers)
   - Dependency Injection

---

## 🚀 Запуск

```bash
# Установка зависимостей (если еще не установлены)
pnpm install

# Запуск dev сервера
pnpm dev

# Откройте браузер
# http://localhost:5173
```

---

## 🔍 Проверка результата

Вы должны увидеть:
- Заголовок "Password Manager"
- Список из 5 ресурсов
- Каждый ресурс показывает: namespace, name, количество полей
- При наведении - изменение фона

---

## 📝 Следующие шаги

После успешного завершения Шага 1:
- **Шаг 2**: Добавить поиск и фильтрацию (расширить Query Handler)
- **Шаг 3**: Создать страницу детального просмотра ресурса (новый Query Handler)
- **Шаг 4**: Добавить создание ресурса (Command Bus + Command Handlers)
- **Шаг 5**: Добавить Request Parser для Multi-UI поддержки (Web/CLI/Desktop)

---

## 💡 Советы

1. **Создавайте файлы по порядку** - снизу вверх (Domain → Infrastructure → Application → Presentation)
2. **Проверяйте типы** - TypeScript должен подсказывать автокомплит
3. **Используйте Public API** - импортируйте через `index.ts`
4. **Тестируйте постепенно** - после каждого этапа можно запустить и проверить

---

## ❓ FAQ

**Q: Зачем так много файлов для простого списка?**  
A: Мы строим масштабируемую архитектуру с CQRS и Clean Architecture. Когда добавятся новые фичи, структура уже будет готова. Каждый файл имеет одну ответственность.

**Q: Можно ли пропустить Value Objects?**  
A: Нет, они важны для валидации и инкапсуляции бизнес-правил. ResourceId.generate() гарантирует уникальность, Namespace.create() валидирует формат.

**Q: Зачем Query Handler если есть Repository?**  
A: Repository - это Infrastructure (работа с данными). Query Handler - это Application Layer (бизнес-логика чтения). Разделение позволяет добавить кеширование, логирование, трансформацию данных.

**Q: Зачем Facade если есть Query Bus?**  
A: Facade упрощает работу в Presentation Layer. Loader не знает о Query Bus, Query классах, парсинге параметров. Loader = 1 строка кода!

**Q: Почему Mock Repository асинхронный?**  
A: Чтобы код был готов к замене на реальный API без изменений. Все async/await остаются.

**Q: Что такое Entry сущность?**  
A: Entry - это Key-Value пара внутри Resource. Например, Resource "Gmail Account" содержит Entry: username, password, recovery_email.
