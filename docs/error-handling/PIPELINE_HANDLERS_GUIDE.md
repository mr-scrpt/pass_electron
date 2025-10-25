# Pipeline Handlers - Практическое руководство

Полное руководство по созданию Query и Command Handlers с использованием Pipeline Pattern и системы обработки ошибок.

## 📖 Обзор

Этот документ показывает **как на практике** использовать Pipeline Pattern совместно с системой обработки ошибок.

**Предварительные требования:**
- Знание [Pipeline Pattern](../patterns/PIPELINE.md)
- Понимание [Validation API](./ERROR_ESCALATION.md)
- Базовое знание CQRS

---

## 🎯 Архитектура обработки ошибок в Pipeline

### Три уровня ошибок

| Уровень | Типы ошибок | Логируются? | Пример |
|---------|-------------|-------------|--------|
| **Domain** | ValidationError | ❌ Нет (expected) | Невалидный namespace |
| **Business** | DuplicateError, NotFoundError | ❌ Нет (expected) | Ресурс уже существует |
| **Infrastructure** | NetworkError, StorageError | ✅ Да (unexpected) | Недоступна БД |

### handleInfrastructureErrors - ключевой метод

```typescript
protected handleInfrastructureErrors<T>(
  result: Validation<IError[], T>,
  operation: string
): Validation<IError[], T> {
  return tapLeft<IError[], T>(this.logInfrastructureErrors(operation))(result)
    .mapLeft(errors => this.transformInfrastructureErrors(errors));
}
```

**Что делает:**
1. Логирует ошибки через `tapLeft` (side effect)
2. Фильтрует ошибки - логирует ТОЛЬКО `!error.isExpected()`
3. Трансформирует ошибки через `error.toUserError()`

**Когда использовать:**
- ✅ Repository вызовы (`repository.findAll()`)
- ✅ External services (`api.fetchData()`)
- ❌ Domain validation (`Resource.create()`)
- ❌ Business rules (`existingResources.length === 0`)

---

## 📊 Query Handler - Полный пример

### Простой Query (2 шага)

```typescript
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
      .step((ctx) => this.fetchResources(ctx))
      .step((ctx) => this.transformToDTOs(ctx))
      .execute({ query }))
      .map((ctx) => ctx.dtos!);
  }

  // ============================================
  // Pipeline шаги
  // ============================================

  /**
   * Шаг 1: Fetch resources from repository
   * 
   * ✅ async + await - Infrastructure call
   * ✅ handleInfrastructureErrors - логирует unexpected
   */
  private async fetchResources(
    ctx: ListResourcesContext
  ): Promise<Validation<IError[], ListResourcesContext>> {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch resources"
    ).map((resources) => ({ ...ctx, resources }));
  }

  /**
   * Шаг 2: Transform Domain entities to DTOs
   * 
   * ❌ БЕЗ async - нет await
   * ✅ Promise.resolve - для возврата Promise
   * ❌ НЕТ handleInfrastructureErrors - pure transformation
   */
  private transformToDTOs(
    ctx: ListResourcesContext
  ): Promise<Validation<IError[], ListResourcesContext>> {
    return Promise.resolve(
      valid({
        ...ctx,
        dtos: ctx.resources!.map((resource) => this.toDTO(resource)),
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

### Сложный Query (с фильтрацией)

```typescript
interface SearchResourcesContext {
  query: SearchResourcesQuery;
  allResources?: Resource[];
  filteredResources?: Resource[];
  dtos?: ResourceListItemDTO[];
}

export class SearchResourcesQueryHandler extends BaseQueryHandler {
  async handle(query: SearchResourcesQuery): Promise<Validation<IError[], ResourceListItemDTO[]>> {
    return (await new Pipeline<SearchResourcesContext>()
      .step((ctx) => this.fetchAllResources(ctx))
      .step((ctx) => this.filterBySearchTerm(ctx))
      .step((ctx) => this.transformToDTOs(ctx))
      .execute({ query }))
      .map((ctx) => ctx.dtos!);
  }

  // Шаг 1: Infrastructure call
  private async fetchAllResources(ctx: SearchResourcesContext) {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch all resources"
    ).map((allResources) => ({ ...ctx, allResources }));
  }

  // Шаг 2: Pure business logic (БЕЗ async)
  private filterBySearchTerm(ctx: SearchResourcesContext): Promise<Validation<IError[], SearchResourcesContext>> {
    const filteredResources = ctx.allResources!.filter((resource) =>
      resource.name.getValue().toLowerCase().includes(ctx.query.searchTerm.toLowerCase()) ||
      resource.namespace.getValue().toLowerCase().includes(ctx.query.searchTerm.toLowerCase())
    );

    return Promise.resolve(valid({ ...ctx, filteredResources }));
  }

  // Шаг 3: Pure transformation (БЕЗ async)
  private transformToDTOs(ctx: SearchResourcesContext): Promise<Validation<IError[], SearchResourcesContext>> {
    return Promise.resolve(
      valid({
        ...ctx,
        dtos: ctx.filteredResources!.map((resource) => this.toDTO(resource)),
      })
    );
  }
}
```

---

## 📝 Command Handler - Полный пример

### Простой Command (Create)

```typescript
import { BaseCommandHandler } from "@/application/shared/BaseCommandHandler";
import { Pipeline } from "@/shared/pipeline";
import type { CreateContext } from "@/application/shared";
import { fromCondition } from "@/shared/validation";
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
      .step((ctx) => this.checkUniqueness(ctx))
      .step((ctx) => this.createEntity(ctx))
      .stepWithRetry((ctx) => this.persistResource(ctx), 3)
      .execute({ command }))
      .map(() => undefined);
  }

  // ============================================
  // Pipeline шаги
  // ============================================

  /**
   * Шаг 1: Check uniqueness (Business rule)
   * 
   * ✅ asyncChain - функциональный стиль БЕЗ if
   * ✅ handleInfrastructureErrors - для repository call
   * ✅ fromCondition - вместо if для проверки
   * ❌ НЕТ логирования DuplicateError - это expected
   */
  private async checkUniqueness(
    ctx: CreateResourceContext
  ): Promise<Validation<IError[], CreateResourceContext>> {
    const namespaceValidation = Namespace.create(ctx.command.namespace)
      .mapLeft((errors): IError[] => errors);

    return namespaceValidation.asyncChain(async (namespace) =>
      this.handleInfrastructureErrors(
        await this.repository.findByNamespace(namespace),
        "check uniqueness"
      ).chain((existingResources) =>
        fromCondition(
          existingResources.length === 0,
          { ...ctx, existingResources },
          [
            new DuplicateError("Resource", ctx.command.namespace, {
              field: "namespace",
            }),
          ]
        )
      )
    );
  }

  /**
   * Шаг 2: Create Domain Entity (Domain validation)
   * 
   * ❌ БЕЗ async - нет await
   * ✅ Promise.resolve - для возврата Promise
   * ❌ НЕТ handleInfrastructureErrors - это Domain validation
   * ❌ НЕТ логирования ValidationError - это expected
   */
  private createEntity(
    ctx: CreateResourceContext
  ): Promise<Validation<IError[], CreateResourceContext>> {
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret
      ).map((entity) => ({ ...ctx, entity }))
    );
  }

  /**
   * Шаг 3: Persist to repository (Infrastructure call)
   * 
   * ✅ async + await - Infrastructure call
   * ✅ handleInfrastructureErrors - логирует unexpected
   * ✅ stepWithRetry - повторяет при unexpected errors
   */
  private async persistResource(
    ctx: CreateResourceContext
  ): Promise<Validation<IError[], CreateResourceContext>> {
    return this.handleInfrastructureErrors(
      await this.repository.save(ctx.entity!),
      "save resource"
    ).map(() => ctx);
  }
}
```

### Сложный Command (Update с событиями)

```typescript
interface UpdateResourceContext extends UpdateContext<UpdateResourceCommand, Resource> {
  shouldNotify?: boolean;
  previousState?: Resource;
}

export class UpdateResourceCommandHandler extends BaseCommandHandler {
  async handle(command: UpdateResourceCommand): Promise<Validation<IError[], void>> {
    return (await new Pipeline<UpdateResourceContext>()
      .step((ctx) => this.loadExistingResource(ctx))
      .step((ctx) => this.validateUpdate(ctx))
      .stepWithRetry((ctx) => this.persistUpdate(ctx), 3)
      .stepIf(
        (ctx) => ctx.shouldNotify === true,
        (ctx) => this.sendNotifications(ctx)
      )
      .step((ctx) => this.publishEvents(ctx))
      .execute({ command }))
      .map(() => undefined);
  }

  // Шаг 1: Load existing (Infrastructure + Business rule)
  private async loadExistingResource(ctx: UpdateResourceContext) {
    return this.handleInfrastructureErrors(
      await this.repository.findById(ResourceId.create(ctx.command.id)),
      "load resource"
    ).chain((resource) =>
      fromNullable(resource, [new NotFoundError("Resource", ctx.command.id)])
    ).map((resource) => ({
      ...ctx,
      existingEntity: resource,
      previousState: resource,
      shouldNotify: resource.namespace.getValue() !== ctx.command.namespace,
    }));
  }

  // Шаг 2: Domain validation (БЕЗ async)
  private validateUpdate(ctx: UpdateResourceContext): Promise<Validation<IError[], UpdateResourceContext>> {
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret
      ).map((updatedEntity) => ({ ...ctx, updatedEntity }))
    );
  }

  // Шаг 3: Infrastructure call (async)
  private async persistUpdate(ctx: UpdateResourceContext) {
    return this.handleInfrastructureErrors(
      await this.repository.update(ctx.updatedEntity!),
      "update resource"
    ).map(() => ctx);
  }

  // Шаг 4: Side effect (async)
  private async sendNotifications(ctx: UpdateResourceContext) {
    await this.notificationService.notifyResourceUpdated(ctx.updatedEntity!);
    return Promise.resolve(valid(ctx));
  }

  // Шаг 5: Domain events (БЕЗ async)
  private publishEvents(ctx: UpdateResourceContext): Promise<Validation<IError[], UpdateResourceContext>> {
    this.eventBus.publish(
      new ResourceUpdatedEvent(ctx.previousState!, ctx.updatedEntity!)
    );
    return Promise.resolve(valid(ctx));
  }
}
```

---

## 🎓 Best Practices

### 1. Логируем ТОЛЬКО unexpected ошибки

```typescript
// ✅ ПРАВИЛЬНО
private async fetchResources(ctx) {
  return this.handleInfrastructureErrors(  // Логирует только NetworkError
    await this.repository.findAll(),
    "fetch resources"
  ).map((resources) => ({ ...ctx, resources }));
}

// ❌ НЕПРАВИЛЬНО
private createEntity(ctx) {
  return Promise.resolve(
    this.handleInfrastructureErrors(  // ❌ ValidationError - НЕ логируем!
      Resource.create(...),
      "create entity"
    ).map((entity) => ({ ...ctx, entity }))
  );
}
```

### 2. async БЕЗ await = ESLint ошибка

```typescript
// ❌ НЕПРАВИЛЬНО - ESLint ошибка
private async transformToDTOs(ctx) {
  return valid({...ctx, dtos: ...});  // ❌ Нет await!
}

// ✅ ПРАВИЛЬНО
private transformToDTOs(ctx): Promise<Validation<...>> {
  return Promise.resolve(
    valid({...ctx, dtos: ...})
  );
}
```

### 3. Immutable контекст

```typescript
// ✅ ПРАВИЛЬНО - новый объект
.map((resources) => ({ ...ctx, resources }))

// ❌ НЕПРАВИЛЬНО - мутация
.map((resources) => {
  ctx.resources = resources;  // ❌ Mutation!
  return ctx;
})
```

### 4. Каждый шаг - одна ответственность

```typescript
// ✅ ПРАВИЛЬНО
.step((ctx) => this.checkUniqueness(ctx))   // Business rule
.step((ctx) => this.createEntity(ctx))      // Domain validation
.step((ctx) => this.persistResource(ctx))   // Infrastructure

// ❌ НЕПРАВИЛЬНО
.step(async (ctx) => {
  const unique = await this.checkUniqueness(ctx);  // ❌ Всё в одном!
  const entity = this.createEntity(unique);
  return this.persistResource(entity);
})
```

---

## 🔗 См. также

- [Pipeline Pattern](../patterns/PIPELINE.md) - детальное описание
- [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) - монады и Either
- [INVARIANTS.md](./INVARIANTS.md) - Domain валидация
- [Quick Start](../QUICK_START.md) - быстрый старт

---

**Дата создания:** 2025-01-25  
**Версия:** 1.0 (Pipeline approach)
