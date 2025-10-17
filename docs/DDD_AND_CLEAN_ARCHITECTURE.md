# DDD и Clean Architecture в проекте

Документ описывает, как в проекте сочетаются Domain-Driven Design (Eric Evans) и Clean Architecture (Robert C. Martin).

---

## Обзор подходов

### Domain-Driven Design (DDD)

**Автор:** Eric Evans, 2003  
**Книга:** "Domain-Driven Design: Tackling Complexity in the Heart of Software" (Синяя книга)

**Назначение:** Моделирование сложной бизнес-логики

**Что дает:**
- Тактические паттерны (Entity, Value Object, Aggregate, Repository, Domain Service)
- Стратегические паттерны (Ubiquitous Language, Bounded Context)
- Фокус на предметной области (Domain)

### Clean Architecture

**Автор:** Robert C. Martin (Uncle Bob), 2012  
**Книга:** "Clean Architecture: A Craftsman's Guide to Software Structure and Design"

**Назначение:** Структурирование кода и управление зависимостями

**Что дает:**
- Dependency Rule (зависимости направлены к центру)
- Концентрические круги слоев
- Независимость от фреймворков, UI, баз данных
- Ports & Adapters (Hexagonal Architecture)

---

## Как они дополняют друг друга

| Аспект | DDD | Clean Architecture | В проекте |
|--------|-----|-------------------|-----------|
| **Фокус** | ЧТО моделировать | КАК структурировать | Оба подхода |
| **Domain Layer** | Entity, Value Object, Aggregate | Enterprise Business Rules | DDD паттерны |
| **Application Layer** | Application Services (DDD) | Use Cases (Clean Arch) | Query/Command Handlers (CQRS) |
| **Repository** | Абстракция для Aggregate | Gateway/Port | DDD интерфейс |
| **Зависимости** | Общая идея | Dependency Rule (детально) | Clean Architecture |
| **Структура** | Layered Architecture | Концентрические круги | Clean Architecture |

**Вывод:** DDD определяет **содержание** слоев, Clean Architecture — **структуру** и **направление зависимостей**.

---

## Архитектура проекта

```
┌─────────────────────────────────────────────────────┐
│       Clean Architecture (структура слоев)          │
│                                                     │
│  Presentation Layer (Remix Routes)                  │
│           ↓ зависит от Composition Root             │
│  ┌───────────────────────────────────────────────┐ │
│  │ Composition Root (Bootstrap)                  │ │
│  │ - DI Container                                │ │
│  │ - Связывает все слои                          │ │
│  └───────────────────────────────────────────────┘ │
│           ↓ создает и инжектит                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ Application Layer                             │ │
│  │ - Query Handlers (чтение)                     │ │
│  │ - Command Handlers (запись)                   │ │
│  └─────────────────┬─────────────────────────────┘ │
│                    ↓ зависит от Domain              │
│  ┌─────────────────▼─────────────────────────────┐ │
│  │ Domain Layer (DDD Tactical Patterns)          │ │
│  │ - Entities (Resource, Entry)                  │ │
│  │ - Value Objects (ResourceId, ResourceName)    │ │
│  │ - Aggregates (Resource как Root)              │ │
│  │ - Repository Interfaces (IResourceRepository) │ │
│  │ - Domain Services                             │ │
│  │ - Domain Events                               │ │
│  └───────────────────────────────────────────────┘ │
│                    ▲ реализует интерфейсы           │
│  ┌─────────────────┴─────────────────────────────┐ │
│  │ Infrastructure Layer                          │ │
│  │ - Repository Implementations                  │ │
│  │ - Command/Query Bus Adapters                  │ │
│  │ - External API Adapters                       │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

   ▲ Dependency Rule: Зависимости направлены К ЦЕНТРУ ▲
```

---

## Domain Layer: DDD Tactical Patterns

Domain Layer полностью построен на тактических паттернах DDD и НЕ зависит от других слоев.

### Entity (DDD)

Объект с уникальным идентификатором, жизненным циклом и бизнес-правилами.

```typescript
// app/domain/entities/Resource.ts

export class Resource {
  private constructor(
    private readonly _id: ResourceId,      // Value Object
    private _name: ResourceName,           // Value Object
    private _namespace: Namespace,         // Value Object
    private _metadata: ResourceMetadata    // Entity (часть Aggregate)
  ) {}

  // Бизнес-метод с инвариантами
  rename(newName: ResourceName): void {
    this.ensureNotLocked()  // Инвариант
    this._name = newName
    this.addDomainEvent(new ResourceRenamedEvent(this._id, newName))
  }

  // Инвариант (бизнес-правило)
  private ensureNotLocked(): void {
    if (this._metadata.isLocked) {
      throw new ResourceLockedError(this._id)
    }
  }

  // Фабричный метод (DDD паттерн)
  static create(data: CreateResourceData): Resource {
    const resource = new Resource(...)
    resource.addDomainEvent(new ResourceCreatedEvent(...))
    return resource
  }
}
```

### Value Object (DDD)

Неизменяемый объект без идентичности, определяется значением.

```typescript
// app/domain/value-objects/ResourceName.ts
import { StringInvariant, InvariantViolationError } from '~/domain/shared'

export class ResourceName {
  private static readonly PATTERN = /^[a-zA-Z0-9-_]+$/
  
  private constructor(private readonly value: string) {}

  static create(value: string): ResourceName {
    // ✅ Используем переиспользуемые инварианты
    StringInvariant.ensureLength(value, 1, 100, 'ResourceName')
    StringInvariant.ensurePattern(
      value,
      this.PATTERN,
      'ResourceName',
      'value',
      'alphanumeric characters, dash and underscore'
    )
    return new ResourceName(value)
  }

  getValue(): string {
    return this.value
  }

  // Сравнение по значению
  equals(other: ResourceName): boolean {
    return this.value === other.value
  }
}
```

> **💡 Важно**: Инварианты (правила валидации) вынесены в переиспользуемые классы в `domain/shared/invariants/`.  
> См. [INVARIANTS.md](./error-handling/INVARIANTS.md) для деталей.

### Aggregate (DDD)

Группа связанных объектов с единой границей консистентности. Aggregate Root контролирует доступ.

```typescript
// app/domain/aggregates/Resource.ts

export class Resource {  // Aggregate Root
  private _entries: Entry[] = []  // Часть Aggregate

  // Доступ к дочерним Entity только через Root
  addEntry(data: CreateEntryData): Entry {
    this.ensureNotLocked()
    
    const entry = Entry.create({ resourceId: this._id, ...data })
    this._entries.push(entry)
    this.addDomainEvent(new EntryAddedEvent(this._id, entry.id))
    
    return entry
  }

  removeEntry(entryId: EntryId): void {
    this.ensureNotLocked()
    const index = this._entries.findIndex(e => e.id.equals(entryId))
    if (index === -1) throw new EntryNotFoundError(entryId)
    
    this._entries.splice(index, 1)
    this.addDomainEvent(new EntryRemovedEvent(this._id, entryId))
  }

  // Aggregate обеспечивает инварианты для всех дочерних объектов
  getEntries(): readonly Entry[] {
    return Object.freeze([...this._entries])
  }
}
```

**Правила Aggregate:**
- Только Root имеет глобальный ID
- Внешние ссылки только на Root
- Изменения только через Root
- Root обеспечивает консистентность

### Repository Interface (DDD)

Абстракция для получения и сохранения Aggregates.

```typescript
// app/domain/repositories/IResourceRepository.ts

export interface IResourceRepository {
  findById(id: ResourceId): Promise<Resource | null>
  findByNamespace(namespace: Namespace): Promise<Resource[]>
  findAll(): Promise<Resource[]>
  save(resource: Resource): Promise<void>
  remove(id: ResourceId): Promise<void>
}
```

**Характеристики:**
- Интерфейс в Domain Layer
- Работает с Aggregates (не с отдельными Entity)
- Скрывает персистентность (DB, API, Mock)
- Реализация в Infrastructure Layer

### Domain Service (DDD)

Бизнес-операции между несколькими Entities/Aggregates.

```typescript
// app/domain/services/ResourceDuplicationService.ts

export class ResourceDuplicationService {
  canDuplicate(source: Resource, targetNamespace: Namespace): boolean {
    if (source.namespace.equals(targetNamespace)) return false
    if (source.isLocked) return false
    return true
  }

  duplicate(
    source: Resource,
    targetNamespace: Namespace,
    newName: ResourceName
  ): Resource {
    if (!this.canDuplicate(source, targetNamespace)) {
      throw new DomainError('Cannot duplicate')
    }
    return Resource.createFrom(source, { namespace: targetNamespace, name: newName })
  }
}
```

### Domain Events (DDD)

События, произошедшие в домене.

```typescript
// app/domain/events/ResourceEvents.ts

export class ResourceCreatedEvent extends DomainEvent {
  readonly eventType = 'ResourceCreated'
  constructor(
    readonly resourceId: ResourceId,
    readonly name: ResourceName
  ) { super() }
}

export class ResourceRenamedEvent extends DomainEvent {
  readonly eventType = 'ResourceRenamed'
  constructor(
    readonly resourceId: ResourceId,
    readonly newName: ResourceName
  ) { super() }
}
```

---

## Application Layer: CQRS Handlers

**В нашем проекте Application Layer реализован через CQRS** (Command Query Responsibility Segregation).

**Концептуально:**
- Clean Architecture называет это "Use Cases"
- DDD называет это "Application Services"
- CQRS разделяет на "Query Handlers" (чтение) и "Command Handlers" (запись)

**Мы используем CQRS** — более современный и явный подход.

### Query Handler (чтение данных)

```typescript
// app/application/queries/handlers/ListResourcesQueryHandler.ts

export class ListResourcesQueryHandler {
  constructor(private readonly repository: IResourceRepository) {}

  async handle(query: ListResourcesQuery): Promise<QueryResult<ResourceListItemDTO[]>> {
    try {
      // Получаем данные из репозитория
      const resources = query.namespace
        ? await this.repository.findByNamespace(query.namespace)
        : await this.repository.findAll()
      
      // Преобразуем Domain Model → DTO
      const data = resources.map(r => ({
        id: r.id,
        namespace: r.namespace,
        name: r.name,
        fieldsCount: r.customFields.length,
        updatedAt: r.updatedAt
      }))
      
      return { data }
    } catch (error) {
      return { data: [], error: error.message }
    }
  }
}
```

### Command Handler (запись данных)

```typescript
// app/application/commands/handlers/CreateResourceCommandHandler.ts

export class CreateResourceCommandHandler {
  constructor(
    private readonly repository: IResourceRepository,
    private readonly eventBus: IEventBus
  ) {}

  async handle(command: CreateResourceCommand): Promise<CommandResult<{ id: string }>> {
    try {
      // Создаем агрегат через Domain Factory
      const resource = Resource.create({
        name: ResourceName.create(command.name),
        namespace: Namespace.create(command.namespace),
        secret: SecretField.create(command.secretValue)
      })
      
      // Сохраняем через Repository
      await this.repository.save(resource)
      
      // Публикуем Domain Event
      this.eventBus.publish(new ResourceCreated(resource.id))
      
      return { 
        success: true, 
        data: { id: resource.id.getValue() } 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }
  }
}
```

**Использование через Facade:**

```typescript
// app/composition/commands/ResourceCommands.ts
export const resourceCommands = {
  async create(input: unknown) {
    // 1. Парсим input
    const parser = ServiceContainer.getRequestParser()
    const params = parser.parseCreateResourceParams(input)
    
    // 2. Создаем Command
    const command = new CreateResourceCommand(
      params.namespace,
      params.name,
      params.secretValue
    )
    
    // 3. Выполняем через Command Bus
    const commandBus = ServiceContainer.getCommandBus()
    return commandBus.execute(command)
  }
}

// В Route (Presentation Layer)
export async function action({ request }) {
  return commands.resources.create(request)  // ✅ Одна строка!
}
```

---

## Infrastructure Layer: Adapters

Infrastructure реализует интерфейсы из Domain и Application.

### Repository Implementation

```typescript
// app/infrastructure/repositories/MockResourceRepository.ts

export class MockResourceRepository implements IResourceRepository {
  private resources = new Map<string, Resource>()

  async findById(id: ResourceId): Promise<Resource | null> {
    return this.resources.get(id.getValue()) || null
  }

  async save(resource: Resource): Promise<void> {
    this.resources.set(resource.id.getValue(), resource)
  }
}
```

### Query Bus Adapter

```typescript
// app/infrastructure/queries/InMemoryQueryBus.ts

export class InMemoryQueryBus implements IQueryBus {
  private handlers = new Map<string, IQueryHandler<any, any>>()

  register(type: string, handler: IQueryHandler<any, any>): void {
    this.handlers.set(type, handler)
  }

  async execute<T>(query: IQuery): Promise<QueryResult<T>> {
    const handler = this.handlers.get(query.type)
    if (!handler) throw new Error(`No handler for ${query.type}`)
    return handler.handle(query)
  }
}
```

---

## Composition Root: Bootstrap

Composition Root связывает все слои. Единственное место, знающее о всех зависимостях.

```typescript
// app/composition/ServiceContainer.ts

class ServiceContainer {
  private static services = {
    resourceService: null as ResourceService | null,
    queryBus: null as IQueryBus | null
  }

  static getResourceService(): ResourceService {
    if (!this.services.resourceService) {
      const repo = new MockResourceRepository()           // Infrastructure
      const domainService = new ResourceDuplicationService()  // Domain
      this.services.resourceService = new ResourceService(repo, domainService)  // Application
    }
    return this.services.resourceService
  }

  static getQueryBus(): IQueryBus {
    if (!this.services.queryBus) {
      const bus = new InMemoryQueryBus()  // Infrastructure
      const service = this.getResourceService()
      
      // Регистрация handlers
      bus.register('ListResourcesQuery', new ListResourcesQueryHandler(service))
      bus.register('GetResourceByIdQuery', new GetResourceByIdQueryHandler(service))
      
      this.services.queryBus = bus
    }
    return this.services.queryBus
  }
}
```

### Facade для Presentation Layer

```typescript
// app/composition/queries.ts

export const queries = {
  async listResources(request: Request) {
    const url = new URL(request.url)
    const query = new ListResourcesQuery(
      url.searchParams.get('namespace') || undefined,
      url.searchParams.get('search') || undefined
    )
    return getQueryBus().execute(query)
  },

  async getResourceById(id: string) {
    const query = new GetResourceByIdQuery(id)
    return getQueryBus().execute(query)
  }
}
```

---

## Presentation Layer: Remix Routes

Presentation Layer зависит только от Composition Root (facade).

```typescript
// app/routes/_index.tsx
import { queries } from '~/composition'

export async function loader({ request }: LoaderFunctionArgs) {
  return queries.listResources(request)  // Одна строка!
}
```

```typescript
// app/routes/resources.new.tsx
import { commands } from '~/composition'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  return commands.createResource({
    name: formData.get('name') as string,
    namespace: formData.get('namespace') as string
  })
}
```

---

## Dependency Rule (Clean Architecture)

Все зависимости направлены К ЦЕНТРУ (к Domain Layer).

```
Presentation  →  Composition Root
                       ↓
              Application Layer
                       ↓
                 Domain Layer  ← Центр, не зависит ни от чего
                       ↑
              Infrastructure Layer
```

**Кто что импортирует:**

| Слой | Может импортировать | НЕ может |
|------|---------------------|----------|
| Domain | НИЧЕГО | Все остальные |
| Application | Domain (интерфейсы) | Infrastructure, Presentation |
| Infrastructure | Domain (интерфейсы) | Application, Presentation |
| Presentation | Composition (facade) | Infrastructure напрямую |
| Composition Root | ВСЕ СЛОИ (исключение) | - |

---

## Ключевые принципы

### 1. DDD определяет модель Domain Layer

- **Entity** — объекты с ID и жизненным циклом
- **Value Object** — неизменяемые объекты-значения
- **Aggregate** — границы консистентности
- **Repository** — абстракция персистентности
- **Domain Service** — бизнес-логика между Entities

### 2. Clean Architecture определяет структуру

- **Dependency Rule** — зависимости к центру
- **Слои** — Domain, Application, Infrastructure, Presentation
- **Ports & Adapters** — интерфейсы в Domain, реализации в Infrastructure

### 3. CQRS разделяет чтение и запись

- **Commands** — изменение состояния (CREATE, UPDATE, DELETE)
- **Queries** — чтение состояния (GET, LIST)
- Разные модели данных для Commands и Queries

### 4. Composition Root связывает все

- DI Container для создания зависимостей
- Service Locator для доступа из Presentation
- Facade для упрощения API

---

## Преимущества подхода

### Тестируемость

```typescript
// Легко тестировать Domain (без зависимостей)
test('Resource rename', () => {
  const resource = Resource.create({ name: 'test', namespace: 'default' })
  resource.rename(ResourceName.create('new-name'))
  expect(resource.name.getValue()).toBe('new-name')
})

// Легко тестировать Application (мок Repository)
test('ResourceService', async () => {
  const mockRepo = new MockResourceRepository()
  const service = new ResourceService(mockRepo, new ResourceDuplicationService())
  
  const resource = await service.createResource({ name: 'test', namespace: 'default' })
  expect(resource.id).toBeDefined()
})
```

### Независимость от фреймворков

Domain, Application, Infrastructure — не зависят от Remix. Можно заменить на Next.js, Express, CLI без изменения бизнес-логики.

### Масштабируемость

- Добавление новых операций — новый Query/Command Handler
- Изменение персистентности — новый Repository Implementation
- Добавление UI — новый Presentation Layer (без изменения Application Layer)

### Понятность

- Четкое разделение ответственности
- Ubiquitous Language в коде
- Явные границы между слоями

---

## Связанные документы

- **[concepts/THEORETICAL_CONCEPT.md](./concepts/THEORETICAL_CONCEPT.md)** - Теоретические концепции DDD
- **[concepts/ARCHITECTURE_DESIGN.md](./concepts/ARCHITECTURE_DESIGN.md)** - Дизайн архитектуры
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Структура проекта
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Поток данных
- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - Command Bus (CQRS Commands)
- **[QUERY_HANDLERS.md](./QUERY_HANDLERS.md)** - Query Handlers (CQRS Queries)
- **[ADAPTER_PATTERN_DI.md](./ADAPTER_PATTERN_DI.md)** - Adapter Pattern + DI (Hexagonal Architecture - Ports & Adapters)
- **[contracts/domain-types.md](./contracts/domain-types.md)** - Типы домена
- **[contracts/system-interfaces.md](./contracts/system-interfaces.md)** - Системные интерфейсы
