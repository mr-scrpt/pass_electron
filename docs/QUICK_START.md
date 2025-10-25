# Quick Start - Разработка с Pipeline Pattern

Практическое руководство по разработке Query и Command Handlers с использованием Pipeline Pattern.

## 🎯 Наш подход (2025)

### Ключевые принципы

1. **Pipeline Pattern** - декларативное описание шагов обработки
2. **Функциональный стиль** - БЕЗ if-ов (asyncChain, fromCondition)
3. **Base Handlers** - переиспользуемые helper методы
4. **Логирование только ошибок** - expected errors НЕ логируются
5. **ESLint-compliant** - async БЕЗ await = ошибка

---

## 📋 Создание Query Handler

### Структура

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
import { BaseQueryHandler } from "@/application/shared/BaseQueryHandler";
import { Pipeline } from "@/shared/pipeline";
import type { Validation } from "@/shared/validation";
import { valid } from "@/shared/validation";

interface ListResourcesContext {
  query: ListResourcesQuery;
  resources?: Resource[];
  dtos?: ResourceListItemDTO[];
}

export class ListResourcesQueryHandler extends BaseQueryHandler {
  async handle(query: ListResourcesQuery): Promise<Validation<IError[], ResourceListItemDTO[]>> {
    return (await new Pipeline<ListResourcesContext>()
      .step((ctx) => this.fetchResources(ctx))      // Шаг 1: Infrastructure call
      .step((ctx) => this.transformToDTOs(ctx))     // Шаг 2: Pure transformation
      .execute({ query }))
      .map((ctx) => ctx.dtos!);
  }

  // === Pipeline шаги ===

  // async - есть await
  private async fetchResources(ctx: ListResourcesContext) {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch resources"
    ).map((resources) => ({ ...ctx, resources }));
  }

  // БЕЗ async - нет await (ESLint правило!)
  private transformToDTOs(ctx: ListResourcesContext): Promise<Validation<IError[], ListResourcesContext>> {
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

### Правила для Query Handlers

| Операция | async? | Что использовать |
|----------|--------|------------------|
| **Repository call** | ✅ async + await | `handleInfrastructureErrors` |
| **Pure transformation** | ❌ без async | `Promise.resolve(valid(...))` |
| **DTO mapping** | ❌ без async | Простая функция |

---

## 📝 Создание Command Handler

### Структура

```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
import { BaseCommandHandler } from "@/application/shared/BaseCommandHandler";
import { Pipeline } from "@/shared/pipeline";
import { fromCondition } from "@/shared/validation";
import { DuplicateError } from "@/shared/errors";

interface CreateResourceContext extends CreateContext<CreateResourceCommand, Resource> {
  existingResources?: Resource[];
}

export class CreateResourceCommandHandler extends BaseCommandHandler {
  async handle(command: CreateResourceCommand): Promise<Validation<IError[], void>> {
    return (await new Pipeline<CreateResourceContext>()
      .step((ctx) => this.checkUniqueness(ctx))         // Шаг 1: Business rule
      .step((ctx) => this.createEntity(ctx))            // Шаг 2: Domain validation
      .stepWithRetry((ctx) => this.persistResource(ctx), 3)  // Шаг 3: Save with retry
      .execute({ command }))
      .map(() => undefined);
  }

  // === Pipeline шаги ===

  // Шаг 1: Проверка уникальности (asyncChain БЕЗ if-ов!)
  private async checkUniqueness(ctx: CreateResourceContext) {
    const namespaceValidation = Namespace.create(ctx.command.namespace)
      .mapLeft((errors): IError[] => errors);

    return namespaceValidation.asyncChain(async (namespace) =>
      this.handleInfrastructureErrors(
        await this.repository.findByNamespace(namespace),
        "check uniqueness"
      ).chain((existingResources) =>
        fromCondition(  // ✅ fromCondition вместо if!
          existingResources.length === 0,
          { ...ctx, existingResources },
          [new DuplicateError("Resource", ctx.command.namespace, { field: "namespace" })]
        )
      )
    );
  }

  // Шаг 2: Создание Entity (БЕЗ async - нет await)
  private createEntity(ctx: CreateResourceContext): Promise<Validation<IError[], CreateResourceContext>> {
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret
      ).map((entity) => ({ ...ctx, entity }))
    );
  }

  // Шаг 3: Сохранение (async - есть await)
  private async persistResource(ctx: CreateResourceContext) {
    return this.handleInfrastructureErrors(
      await this.repository.save(ctx.entity!),
      "save resource"
    ).map(() => ctx);
  }
}
```

### Правила для Command Handlers

| Операция | async? | Что использовать |
|----------|--------|------------------|
| **Repository call** | ✅ async + await | `handleInfrastructureErrors` |
| **Domain validation** | ❌ без async | `Promise.resolve(...)` |
| **Business rule check** | зависит | asyncChain + fromCondition |

---

## 🔧 Base Handler методы

### BaseQueryHandler

```typescript
// Обработка Infrastructure errors (логирует ТОЛЬКО unexpected)
protected handleInfrastructureErrors<T>(
  result: Validation<IError[], T>,
  operation: string
): Validation<IError[], T>

// Helper для Pipeline шагов (Infrastructure)
protected createInfrastructureStep<TContext, T>(
  operation: string,
  fn: (ctx: TContext) => Promise<Validation<IError[], T>>
): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>>

// Helper для Pipeline шагов (Transform)
protected createTransformStep<TContext, T>(
  fn: (ctx: TContext) => Validation<IError[], T>
): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>>
```

### BaseCommandHandler

```typescript
// Обработка Infrastructure errors (логирует ТОЛЬКО unexpected)
protected handleInfrastructureErrors<T>(
  result: Validation<IError[], T>,
  operation: string
): Validation<IError[], T>

// Helper для Pipeline шагов (Infrastructure)
protected createInfrastructureStep<TContext, T>(...)

// Helper для Pipeline шагов (Domain validation)
protected createDomainValidationStep<TContext, T>(...)

// Helper для Pipeline шагов (Uniqueness check)
protected createUniquenessCheck<TContext, TEntity>(
  shouldExist: boolean,
  errorIfFailed: (ctx: TContext) => IError
): (ctx) => Promise<Validation<IError[], TContext>>
```

---

## 💡 Функциональный стиль - БЕЗ if-ов

### ❌ Процедурный стиль (НЕ используем)

```typescript
private async checkUniqueness(ctx) {
  const namespace = Namespace.create(ctx.command.namespace);
  
  if (namespace.isLeft()) {  // ❌ if!
    return namespace;
  }
  
  const existing = await this.repository.findByNamespace(namespace.value);
  
  if (existing.length > 0) {  // ❌ if!
    return invalid([new DuplicateError(...)]);
  }
  
  return valid(ctx);
}
```

### ✅ Функциональный стиль (используем)

```typescript
private async checkUniqueness(ctx) {
  return Namespace.create(ctx.command.namespace)
    .mapLeft((errors): IError[] => errors)
    .asyncChain(async (namespace) =>  // ✅ asyncChain вместо if
      this.handleInfrastructureErrors(
        await this.repository.findByNamespace(namespace),
        "check uniqueness"
      ).chain((existingResources) =>
        fromCondition(  // ✅ fromCondition вместо if
          existingResources.length === 0,
          { ...ctx, existingResources },
          [new DuplicateError(...)]
        )
      )
    );
}
```

---

## 🎯 ESLint правило: async БЕЗ await

### ❌ Ошибка ESLint

```typescript
// ESLint: Async method 'createEntity' has no 'await' expression
private async createEntity(ctx) {  // ❌ async БЕЗ await!
  return Resource.create(...).map(...);
}
```

### ✅ Правильно

```typescript
// БЕЗ async - используем Promise.resolve
private createEntity(ctx): Promise<Validation<...>> {  // ✅ без async
  return Promise.resolve(
    Resource.create(...).map(...)
  );
}
```

### Правило

| Есть await? | Что писать |
|-------------|------------|
| ✅ Да | `async function` |
| ❌ Нет | обычная `function` + `Promise.resolve()` |

---

## 🔗 Связанные документы

- [Pipeline Pattern](./patterns/PIPELINE.md) - детальное описание Pipeline
- [Error Handling](./error-handling/README.md) - обработка ошибок
- [Base Handlers Reference](./error-handling/BASE_HANDLERS_REFERENCE.md) - справка по методам

---

## 📚 Примеры

Полные примеры реализации:
- `src/application/queries/handlers/ListResourcesQueryHandler.ts`
- `src/application/commands/handlers/CreateResourceCommandHandler.ts`

---

**Дата создания:** 2025-01-25  
**Версия:** 1.0 (Pipeline approach)
