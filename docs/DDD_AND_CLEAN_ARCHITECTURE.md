# DDD и Clean Architecture в проекте

Документ описывает, как в проекте сочетаются Domain-Driven Design (Eric Evans) и Clean Architecture (Robert C. Martin).

> **🆕 Обновлено (2025-01-25):** Примеры кода обновлены с учетом **Pipeline Pattern**, **Validation<IError[], T>**, и **функционального стиля**. См. раздел ["Что нового в 2025?"](#-что-нового-в-2025) в конце документа.

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

### Clean Architecture структура [#diagram:architecture]

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
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Shared Utilities (Framework-agnostic) 🔧      │ │
│  │ - Validation API (фасад над монадами)         │ │
│  │ - Specification Pattern (общие правила)       │ │
│  │ - Type re-exports                             │ │
│  └───────────────────────────────────────────────┘ │
│         ▲ используется всеми слоями выше            │
└─────────────────────────────────────────────────────┘

   ▲ Dependency Rule: Зависимости направлены К ЦЕНТРУ ▲
   ⚠️ Shared - исключение: используется всеми, но не зависит от слоев
```

---

## Domain Layer: DDD Tactical Patterns

Domain Layer полностью построен на тактических паттернах DDD и НЕ зависит от других слоев.

### Entity (DDD)

Объект с уникальным идентификатором, жизненным циклом и бизнес-правилами.

#### Resource Entity [#class:Resource|#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ResourceId } from '../value-objects/ResourceId'
import { ResourceName } from '../value-objects/ResourceName'
import { Namespace } from '../value-objects/Namespace'
import { ResourceLockedError } from '../errors/ResourceLockedError'

export class Resource {
  private constructor(
    private readonly _id: ResourceId,      // Value Object
    private _name: ResourceName,           // Value Object
    private _namespace: Namespace,         // Value Object
    private _isLocked: boolean
  ) {}

  // Бизнес-метод возвращает Either с aggregate-specific ошибкой
  rename(newName: ResourceName): Either<ResourceLockedError, void> {
    if (this._isLocked) {
      return left(new ResourceLockedError(this._id))
    }
    
    this._name = newName
    this.addDomainEvent(new ResourceRenamedEvent(this._id, newName))
    return right(undefined)
  }

  // Фабричный метод (DDD паттерн)
  static create(
    name: string,
    namespace: string
  ): Either<InvariantViolationError, Resource> {
    // Создание через Value Objects (они валидируют)
    return ResourceName.create(name)
      .chain(validName =>
        Namespace.create(namespace)
          .map(validNamespace => ({ validName, validNamespace }))
      )
      .map(({ validName, validNamespace }) => {
        const resource = new Resource(
          ResourceId.generate(),
          validName,
          validNamespace,
          false // не заблокирован
        )
        resource.addDomainEvent(new ResourceCreatedEvent(resource._id))
        return resource
      })
  }
}
```

### Value Object (DDD)

Неизменяемый объект без идентичности, определяется значением.

#### ResourceName Value Object [#class:ResourceName|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceName.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'
import { ResourceNameInvariant } from '../invariants'

export class ResourceName {
  private static readonly ENTITY_TYPE = 'ResourceName'
  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], ResourceName> {
    // ✅ Используем domain-специфичный инвариант (Resource Bounded Context)
    // Правила валидации инкапсулированы внутри инварианта
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .map((validValue: string) => new ResourceName(validValue))
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

> **💡 Важно**: Инварианты (правила валидации):
> - **Shared инварианты** (`domain/shared/invariants/`) - используются везде (например, `UuidInvariant`)
> - **Domain-специфичные** (`domain/{bounded-context}/invariants/`) - используются только в своем домене
> 
> См. [INVARIANTS.md](./error-handling/INVARIANTS.md) и [steps/step_1/DOMAIN_LAYER_SETUP.md](../steps/step_1/DOMAIN_LAYER_SETUP.md) для деталей.

### Aggregate (DDD)

Группа связанных объектов с единой границей консистентности. Aggregate Root контролирует доступ.

#### Resource Aggregate Root [#class:Resource|#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts

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

#### IResourceRepository [#interface:IResourceRepository|#code|#structure:path]

```typescript
// src/domain/resource/repositories/IResourceRepository.ts
import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { ResourceId } from '../value-objects/ResourceId'
import type { Namespace } from '../value-objects/Namespace'
import type { Resource } from '../aggregates/Resource'

export interface IResourceRepository {
  findAll(): Promise<Validation<IError[], Resource[]>>;
  findById(id: ResourceId): Promise<Validation<IError[], Resource | null>>;
  findByNamespace(namespace: Namespace): Promise<Validation<IError[], Resource[]>>;
  search(query: string): Promise<Validation<IError[], Resource[]>>;
  save(resource: Resource): Promise<Validation<IError[], Resource>>;
  update(resource: Resource): Promise<Validation<IError[], Resource>>;
  delete(id: ResourceId): Promise<Validation<IError[], void>>;
}
```

**Характеристики (2025):**
- Интерфейс в Domain Layer
- Работает с Aggregates (не с отдельными Entity)
- Возвращает `Validation<IError[], T>` (Either монада) - type-safe обработка ошибок
- Скрывает персистентность (DB, API, Mock)
- Реализация в Infrastructure Layer
- БЕЗ throws - ошибки как значения

### Domain Service (DDD)

Бизнес-операции между несколькими Entities/Aggregates.

#### ResourceDuplicationService [#class:ResourceDuplicationService|#code|#structure:path]

```typescript
// src/domain/resource/services/ResourceDuplicationService.ts

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

#### ResourceCreatedEvent [#class:ResourceCreatedEvent|#code|#structure:path]

```typescript
// src/domain/resource/events/ResourceEvents.ts

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

## Application Layer: CQRS Handlers с Pipeline Pattern

**В нашем проекте Application Layer реализован через CQRS + Pipeline Pattern** (2025).

**Концептуально:**
- Clean Architecture называет это "Use Cases"
- DDD называет это "Application Services"
- CQRS разделяет на "Query Handlers" (чтение) и "Command Handlers" (запись)
- **Pipeline Pattern** - декларативная композиция операций

**Мы используем CQRS + Pipeline** — современный функциональный подход.

### Query Handler (чтение данных) с Pipeline

#### ListResourcesQueryHandler [#class:ListResourcesQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
import { BaseQueryHandler } from "@/application/shared/BaseQueryHandler";
import { Pipeline } from "@/shared/pipeline";
import type { Validation } from "@/shared/validation";
import { valid } from "@/shared/validation";
import type { IError } from "@/shared/errors";

interface ListResourcesContext {
  query: ListResourcesQuery;
  resources?: Resource[];
  dtos?: ResourceListItemDTO[];
}

export class ListResourcesQueryHandler extends BaseQueryHandler {
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger
  ) {
    super(logger);
  }

  async handle(query: ListResourcesQuery): Promise<Validation<IError[], ResourceListItemDTO[]>> {
    return (await new Pipeline<ListResourcesContext>()
      .step(ctx => this.fetchResources(ctx))      // Шаг 1: Infrastructure
      .step(ctx => this.transformToDTOs(ctx))     // Шаг 2: Transformation
      .execute({ query }))
      .map(ctx => ctx.dtos!);
  }

  // Pipeline шаги
  private async fetchResources(ctx: ListResourcesContext) {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch resources"
    ).map(resources => ({ ...ctx, resources }));
  }

  private transformToDTOs(ctx: ListResourcesContext): Promise<Validation<IError[], ListResourcesContext>> {
    return Promise.resolve(
      valid({
        ...ctx,
        dtos: ctx.resources!.map(r => this.toDTO(r)),
      })
    );
  }

  private toDTO(resource: Resource): ResourceListItemDTO {
    return {
      id: resource.id.getValue(),
      namespace: resource.namespace.getValue(),
      name: resource.name.getValue(),
      secretPreview: "****",
      fieldsCount: 0,
      updatedAt: resource.updatedAt.toISOString(),
    };
  }
}
```

**Ключевые особенности (2025):**
- ✅ Pipeline Pattern - декларативные шаги
- ✅ BaseQueryHandler - переиспользуемые методы
- ✅ handleInfrastructureErrors - логирует ТОЛЬКО unexpected
- ✅ Функциональный стиль - БЕЗ try-catch
- ✅ Immutable контекст

### Command Handler (запись данных) с Pipeline

#### CreateResourceCommandHandler [#class:CreateResourceCommandHandler|#code|#structure:path]

```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
import { BaseCommandHandler } from "@/application/shared/BaseCommandHandler";
import { Pipeline } from "@/shared/pipeline";
import type { Validation } from "@/shared/validation";
import { fromCondition } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { DuplicateError } from "@/shared/errors";

interface CreateResourceContext extends CreateContext<CreateResourceCommand, Resource> {
  existingResources?: Resource[];
}

export class CreateResourceCommandHandler extends BaseCommandHandler {
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger
  ) {
    super(logger);
  }

  async handle(command: CreateResourceCommand): Promise<Validation<IError[], void>> {
    return (await new Pipeline<CreateResourceContext>()
      .step(ctx => this.checkUniqueness(ctx))         // Шаг 1: Business rule
      .step(ctx => this.createEntity(ctx))            // Шаг 2: Domain validation
      .stepWithRetry(ctx => this.persistResource(ctx), 3)  // Шаг 3: Save with retry
      .execute({ command }))
      .map(() => undefined);
  }

  // Pipeline шаги
  private async checkUniqueness(ctx: CreateResourceContext) {
    const namespaceValidation = Namespace.create(ctx.command.namespace)
      .mapLeft((errors): IError[] => errors);

    return namespaceValidation.asyncChain(async (namespace) =>
      this.handleInfrastructureErrors(
        await this.repository.findByNamespace(namespace),
        "check uniqueness"
      ).chain((existingResources) =>
        fromCondition(  // ✅ Функциональный стиль БЕЗ if
          existingResources.length === 0,
          { ...ctx, existingResources },
          [new DuplicateError("Resource", ctx.command.namespace, { field: "namespace" })]
        )
      )
    );
  }

  private createEntity(ctx: CreateResourceContext): Promise<Validation<IError[], CreateResourceContext>> {
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret
      ).map(entity => ({ ...ctx, entity }))
    );
  }

  private async persistResource(ctx: CreateResourceContext) {
    return this.handleInfrastructureErrors(
      await this.repository.save(ctx.entity!),
      "save resource"
    ).map(() => ctx);
  }
}
```

**Ключевые особенности (2025):**
- ✅ Pipeline Pattern - 3 четких шага
- ✅ BaseCommandHandler - переиспользуемые методы
- ✅ Функциональный стиль - asyncChain вместо if
- ✅ fromCondition - валидация БЕЗ тернарников
- ✅ stepWithRetry - автоматические повторы для Infrastructure
- ✅ Commands возвращают void (побочные эффекты)

**Использование через Facade:**

#### Facade для commands [#code|#structure:path]

```typescript
// src/composition/commands/ResourceCommands.ts
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

### Repository Implementation (Mock для разработки)

#### MockResourceRepository [#class:MockResourceRepository|#code|#structure:path]

```typescript
// src/infrastructure/repositories/MockResourceRepository.ts
import type { IResourceRepository } from "@/domain";
import { Resource, Namespace, ResourceName, ResourceId } from "@/domain";
import type { Validation } from "@/shared/validation";
import { valid, invalid } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { NotFoundError } from "@/shared/errors";

// Mock данные (in-memory)
const mockResources: Resource[] = [
  Resource.create(
    Namespace.create('social'),
    ResourceName.create('Facebook'),
    'facebook-password-123'
  ).value as Resource,
  
  Resource.create(
    Namespace.create('work'),
    ResourceName.create('Jira'),
    'jira-password-789'
  ).value as Resource,
];

export class MockResourceRepository implements IResourceRepository {
  private resources: Resource[] = [...mockResources];

  async findAll(): Promise<Validation<IError[], Resource[]>> {
    await this.delay(100);  // Симуляция задержки сети
    return valid([...this.resources]);
  }

  async findById(id: ResourceId): Promise<Validation<IError[], Resource | null>> {
    await this.delay(50);
    const resource = this.resources.find((r) => r.id.equals(id));
    return valid(resource || null);
  }

  async findByNamespace(namespace: Namespace): Promise<Validation<IError[], Resource[]>> {
    await this.delay(50);
    const filtered = this.resources.filter((r) =>
      r.namespace.equals(namespace)
    );
    return valid(filtered);
  }

  async save(resource: Resource): Promise<Validation<IError[], Resource>> {
    await this.delay(150);
    this.resources.push(resource);
    return valid(resource);
  }

  async delete(id: ResourceId): Promise<Validation<IError[], void>> {
    await this.delay(100);
    const index = this.resources.findIndex((r) => r.id.equals(id));
    
    if (index === -1) {
      return invalid([new NotFoundError('Resource', id.getValue())]);
    }
    
    this.resources.splice(index, 1);
    return valid(undefined);
  }

  // Helper для симуляции задержки
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Utility для тестирования
  reset(): void {
    this.resources = [...mockResources];
  }
}
```

**Характеристики (2025):**
- ✅ Реализует `IResourceRepository` из Domain Layer (Dependency Inversion)
- ✅ Возвращает `Validation<IError[], T>` - type-safe
- ✅ In-memory хранилище - для разработки и тестирования
- ✅ Симуляция задержки сети - для тестирования async поведения
- ✅ БЕЗ throws - ошибки как значения
- ✅ Готов к замене на `ApiResourceRepository` в production

### Query Bus Adapter

#### InMemoryQueryBus [#class:InMemoryQueryBus|#code|#structure:path]

```typescript
// src/infrastructure/queries/InMemoryQueryBus.ts

export class InMemoryQueryBus implements IQueryBus {
  private handlers = new Map<string, IQueryHandler<any, any>>()

  register(type: string, handler: IQueryHandler<any, any>): void {
    this.handlers.set(type, handler)
  }

  async execute<T>(query: IQuery): Promise<Validation<Error[], T>> {
    const handler = this.handlers.get(query.type)
    if (!handler) throw new Error(`No handler for ${query.type}`)
    return handler.handle(query)
  }
}
```

---

## Composition Root: Bootstrap

Composition Root связывает все слои. Единственное место, знающее о всех зависимостях.

### ServiceContainer [#class:ServiceContainer|#code|#structure:path]

```typescript
// src/composition/ServiceContainer.ts

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

#### Queries facade [#code|#structure:path]

```typescript
// src/composition/queries/index.ts

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

#### Loader с queries [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '@/composition'

export async function loader({ request }: LoaderFunctionArgs) {
  return queries.listResources(request)  // Одна строка!
}
```

#### Action с commands [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/resources.new.tsx
import { commands } from '@/composition'

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

### Поток зависимостей [#diagram:flow]

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

#### Примеры тестов [#code]

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

### Быстрый старт (2025)
- **[QUICK_START.md](./QUICK_START.md)** ⭐ - Быстрый старт с Pipeline Pattern (НАЧНИ ЗДЕСЬ!)
- **[error-handling/PIPELINE_HANDLERS_GUIDE.md](./error-handling/PIPELINE_HANDLERS_GUIDE.md)** - Практическое руководство по Pipeline Handlers
- **[patterns/PIPELINE.md](./patterns/PIPELINE.md)** - Pipeline Pattern детально

### Архитектура и паттерны
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Структура проекта
- **[concepts/ARCHITECTURE_DESIGN.md](./concepts/ARCHITECTURE_DESIGN.md)** - Дизайн архитектуры
- **[concepts/THEORETICAL_CONCEPT.md](./concepts/THEORETICAL_CONCEPT.md)** - Теоретические концепции DDD
- **[ADAPTER_PATTERN_DI.md](./ADAPTER_PATTERN_DI.md)** - Adapter Pattern + DI

### CQRS и обработка данных
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Поток данных
- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - Command Bus (CQRS Commands)
- **[QUERY_HANDLERS.md](./QUERY_HANDLERS.md)** - Query Handlers (CQRS Queries)

### Обработка ошибок
- **[error-handling/README.md](./error-handling/README.md)** - Обработка ошибок
- **[error-handling/INVARIANTS.md](./error-handling/INVARIANTS.md)** - Инварианты и валидация
- **[error-handling/ERROR_ESCALATION.md](./error-handling/ERROR_ESCALATION.md)** - Either Pattern и монады

### Контракты и типы
- **[contracts/domain-types.md](./contracts/domain-types.md)** - Типы домена
- **[contracts/system-interfaces.md](./contracts/system-interfaces.md)** - Системные интерфейсы

---

## 🆕 Что нового в 2025?

### Pipeline Pattern для Handlers
```typescript
new Pipeline<Context>()
  .step(ctx => this.fetchData(ctx))
  .step(ctx => this.transform(ctx))
  .stepWithRetry(ctx => this.save(ctx), 3)
  .execute(initialContext)
```

### Validation<IError[], T> вместо throws
```typescript
// Repository интерфейсы
findAll(): Promise<Validation<IError[], Resource[]>>

// Handlers
handle(query): Promise<Validation<IError[], DTO[]>>
```

### Функциональный стиль БЕЗ if-ов
```typescript
// asyncChain вместо if (isLeft())
return validation.asyncChain(async (value) => ...)

// fromCondition вместо if (condition)
return fromCondition(isValid, success, [error])
```

### BaseHandlers с helper методами
```typescript
class ListResourcesQueryHandler extends BaseQueryHandler {
  // handleInfrastructureErrors - логирует ТОЛЬКО unexpected
  // createInfrastructureStep - helper для Repository calls
}
```

### Логирование ТОЛЬКО unexpected ошибок
```typescript
// Domain ошибки (ValidationError, DuplicateError) - НЕ логируются
// Infrastructure ошибки (NetworkError) - логируются
this.handleInfrastructureErrors(result, "operation")
```

**См. подробнее:** [QUICK_START.md](./QUICK_START.md) и [PIPELINE_HANDLERS_GUIDE.md](./error-handling/PIPELINE_HANDLERS_GUIDE.md)

---

**Дата последнего обновления:** 2025-01-25  
**Версия документа:** 2.0 (Pipeline approach)
