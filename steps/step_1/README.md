# Шаг 1: Вывод списка ресурсов с Pipeline Pattern

## 🎯 Цель

Создать полный end-to-end поток данных для отображения списка моковых ресурсов с использованием **Pipeline Pattern** и современных подходов к обработке ошибок.

> **📦 Менеджер пакетов**: В проекте используется **pnpm**.

---

## 🎨 Архитектурный подход (2025)

### Ключевые принципы

1. ✅ **Pipeline Pattern** - декларативное описание шагов
2. ✅ **Функциональный стиль** - БЕЗ if-ов (asyncChain, fromCondition)
3. ✅ **Base Handlers** - переиспользуемые helper методы
4. ✅ **Логирование только ошибок** - expected errors НЕ логируются
5. ✅ **ESLint-compliant** - async БЕЗ await = ошибка

### Структура Handler

```typescript
// Query Handler
async handle(query: ListResourcesQuery) {
  return (await new Pipeline<Context>()
    .step(ctx => this.fetchResources(ctx))     // Infrastructure call
    .step(ctx => this.transformToDTOs(ctx))    // Pure transformation
    .execute({ query }))
    .map(ctx => ctx.dtos!);
}

// Command Handler
async handle(cmd: CreateResourceCommand) {
  return (await new Pipeline<Context>()
    .step(ctx => this.checkUniqueness(ctx))    // Business rule
    .step(ctx => this.createEntity(ctx))       // Domain validation
    .stepWithRetry(ctx => this.persistResource(ctx), 3)  // Infrastructure с retry
    .execute({ command: cmd }))
    .map(() => undefined);
}
```

---

## 📊 Поток данных (CQRS)

```
Browser (GET /)
    ↓
React Router Loader
    ↓
Composition Layer (queries.resources.list)
    ↓
Pipeline Handler (ListResourcesQueryHandler)
    ├── Step 1: fetchResources (Infrastructure)
    └── Step 2: transformToDTOs (Pure transformation)
    ↓
MockRepository.findAll()
    ↓
Domain Entities (Resource[])
    ↓
DTOs (ResourceListItemDTO[])
    ↓
React Component (UI)
```

---

## 🔄 Порядок реализации

> **📘 Важно**: Перед началом ознакомьтесь с:
> - [../../docs/QUICK_START.md](../../docs/QUICK_START.md) - быстрый старт ⭐ **НАЧНИ ЗДЕСЬ**
> - [../../docs/patterns/PIPELINE.md](../../docs/patterns/PIPELINE.md) - Pipeline Pattern
> - [../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md](../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md) - практика

### Шаг 0: Подготовка структуры

```bash
# Создать структуру Domain Layer
mkdir -p src/domain/resource/{aggregates,value-objects,invariants,repositories}
mkdir -p src/domain/shared/{errors,invariants}
mkdir -p src/shared/{validation,errors,pipeline}
mkdir -p src/application/{queries,commands,shared}
mkdir -p src/infrastructure/repositories
```

---

### Шаг 1: Validation API → [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)

Создать фасад над `@sweet-monads/either`.

**Что создаем:**
- `src/shared/validation/Validation.ts` - тип Validation
- `src/shared/validation/helpers.ts` - valid, invalid, fromCondition, asyncChain
- `src/shared/validation/index.ts` - Public API

**Референс:**
```typescript
// src/shared/validation/Validation.ts
import type { Either } from "@sweet-monads/either";

export type Validation<L, R> = Either<L, R>;
```

---

### Шаг 2: Errors Setup → [ERROR_SETUP.md](./ERROR_SETUP.md)

Создать базовые ошибки для проекта.

**Что создаем:**
- `src/shared/errors/IError.ts` - интерфейс
- `src/shared/errors/BaseError.ts` - базовый класс
- `src/shared/errors/ValidationError.ts` - Domain ошибка
- `src/shared/errors/DuplicateError.ts` - Business ошибка
- `src/shared/errors/NotFoundError.ts` - Business ошибка

**Референс:**
```typescript
export interface IError {
  getMessage(): string;
  getLogLevel(): 'info' | 'warn' | 'error';
  isExpected(): boolean;
  toUserError(): IError;
  getContext(): Record<string, unknown>;
}
```

---

### Шаг 3: Pipeline Setup → [PIPELINE_SETUP.md](./PIPELINE_SETUP.md)

Создать Pipeline для композиции операций.

**Что создаем:**
- `src/shared/pipeline/Pipeline.ts` - Pipeline класс
- `src/shared/pipeline/PipelineContext.ts` - базовый контекст
- `src/application/shared/ApplicationPipelineContext.ts` - CQRS контексты

**Референс:**
```typescript
new Pipeline<Context>()
  .step(ctx => this.fetchData(ctx))
  .step(ctx => this.transform(ctx))
  .stepWithRetry(ctx => this.save(ctx), 3)
  .execute(initialContext)
```

---

### Шаг 4: Domain Layer → [DOMAIN_LAYER_PRACTICAL.md](./DOMAIN_LAYER_PRACTICAL.md)

Создать Value Objects и Aggregates.

**Что создаем:**
- `src/domain/resource/value-objects/ResourceId.ts`
- `src/domain/resource/value-objects/Namespace.ts`
- `src/domain/resource/value-objects/ResourceName.ts`
- `src/domain/resource/aggregates/Resource.ts`
- `src/domain/resource/repositories/IResourceRepository.ts`

**Референс:**
```typescript
export class Resource {
  static create(
    namespace: Validation<ValidationError[], Namespace>,
    name: Validation<ValidationError[], ResourceName>,
    secret: string
  ): Validation<ValidationError[], Resource> {
    return mergeInMany([namespace, name])
      .mapLeft(errorsArray => errorsArray.flat())
      .map(([ns, nm]) => new Resource({
        id: ResourceId.generate(),
        namespace: ns,
        name: nm,
        secret,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
  }
}
```

---

### Шаг 5: Base Handlers → [BASE_HANDLERS_SETUP.md](./BASE_HANDLERS_SETUP.md)

Создать базовые классы для Query и Command Handlers.

**Что создаем:**
- `src/application/shared/BaseQueryHandler.ts`
- `src/application/shared/BaseCommandHandler.ts`

**Ключевые методы:**
```typescript
// BaseQueryHandler
protected handleInfrastructureErrors<T>(...)
protected createInfrastructureStep<TContext, T>(...)
protected createTransformStep<TContext, T>(...)

// BaseCommandHandler
protected handleInfrastructureErrors<T>(...)
protected createInfrastructureStep<TContext, T>(...)
protected createDomainValidationStep<TContext, T>(...)
protected createUniquenessCheck<TContext, TEntity>(...)
```

---

### Шаг 6: Application Layer → [APPLICATION_LAYER_PIPELINE.md](./APPLICATION_LAYER_PIPELINE.md)

Создать Query и Command Handlers с Pipeline.

**Что создаем:**
- `src/application/queries/IQuery.ts`
- `src/application/queries/IQueryHandler.ts`
- `src/application/queries/ListResourcesQuery.ts`
- `src/application/queries/dtos/ResourceListItemDTO.ts`
- `src/application/queries/handlers/ListResourcesQueryHandler.ts` ⭐
- `src/application/commands/ICommand.ts`
- `src/application/commands/ICommandHandler.ts`
- `src/application/commands/CreateResourceCommand.ts`
- `src/application/commands/handlers/CreateResourceCommandHandler.ts` ⭐

**Референс Query Handler:**
```typescript
export class ListResourcesQueryHandler extends BaseQueryHandler {
  async handle(query: ListResourcesQuery) {
    return (await new Pipeline<Context>()
      .step(ctx => this.fetchResources(ctx))
      .step(ctx => this.transformToDTOs(ctx))
      .execute({ query }))
      .map(ctx => ctx.dtos!);
  }
}
```

**Референс Command Handler:**
```typescript
export class CreateResourceCommandHandler extends BaseCommandHandler {
  async handle(cmd: CreateResourceCommand) {
    return (await new Pipeline<Context>()
      .step(ctx => this.checkUniqueness(ctx))
      .step(ctx => this.createEntity(ctx))
      .stepWithRetry(ctx => this.persistResource(ctx), 3)
      .execute({ command: cmd }))
      .map(() => undefined);
  }
}
```

---

### Шаг 7: Infrastructure Layer → [INFRASTRUCTURE_PRACTICAL.md](./INFRASTRUCTURE_PRACTICAL.md)

Создать Mock Repository.

**Что создаем:**
- `src/infrastructure/repositories/MockResourceRepository.ts`
- Mock data

**Референс:**
```typescript
export class MockResourceRepository implements IResourceRepository {
  async findAll(): Promise<Validation<IError[], Resource[]>> {
    try {
      return valid(mockResources);
    } catch (error) {
      return invalid([new NetworkError("Failed to fetch resources")]);
    }
  }
}
```

---

## 📚 Актуальные документы

### Основные
- [../../docs/QUICK_START.md](../../docs/QUICK_START.md) - быстрый старт ⭐ **НАЧНИ ЗДЕСЬ**
- [../../docs/patterns/PIPELINE.md](../../docs/patterns/PIPELINE.md) - Pipeline Pattern
- [../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md](../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md) - практика

### Детальные
- [../../docs/error-handling/ERROR_ESCALATION.md](../../docs/error-handling/ERROR_ESCALATION.md) - монады
- [../../docs/error-handling/INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) - валидация
- [../../docs/DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - DDD

---

## 📦 Legacy документация

Устаревшие файлы находятся в `.temp/steps-old/step_1/`:
- `APPLICATION_LAYER_SETUP.md` - без Pipeline
- `DOMAIN_LAYER_SETUP.md` - старые примеры
- `INFRASTRUCTURE_SETUP.md` - устарел
- `COMPOSITION_SETUP.md` - устарел
- `PRESENTATION_SETUP.md` - устарел

**Не используйте их для нового кода!**

---

## ✅ Проверка

После завершения всех шагов проверьте:

```bash
# TypeScript компиляция
pnpm tsc --noEmit

# ESLint проверка
pnpm eslint src/

# Запуск dev сервера
pnpm dev
```

---

**Дата обновления:** 2025-01-25  
**Версия:** 2.0 (Pipeline approach)
