# Base Handlers Setup - Создание базовых классов для Handlers

Создание `BaseQueryHandler` и `BaseCommandHandler` с helper методами для Pipeline.

> **Назад:** [PIPELINE_SETUP.md](./PIPELINE_SETUP.md)  
> **Далее:** [DOMAIN_LAYER_PRACTICAL.md](./DOMAIN_LAYER_PRACTICAL.md)

---

## 🎯 Цель

Создать базовые классы с переиспользуемыми методами для обработки ошибок и создания Pipeline шагов.

**Ключевые методы:**
- `handleInfrastructureErrors` - логирует ТОЛЬКО unexpected ошибки
- `createInfrastructureStep` - helper для Infrastructure шагов
- `createDomainValidationStep` - helper для Domain валидации
- `createTransformStep` - helper для трансформаций

---

## 📦 Структура

```
src/application/shared/
├── BaseQueryHandler.ts
├── BaseCommandHandler.ts
├── ApplicationPipelineContext.ts  # (уже создан в PIPELINE_SETUP)
└── index.ts
```

---

## 1. BaseQueryHandler.ts

**Файл: `src/application/shared/BaseQueryHandler.ts`**

```typescript
import type { IError } from "@/shared/errors";
import type { Validation } from "@/shared/validation";
import { tapLeft, valid } from "@/shared/validation";
import type { ILogger } from "@/application/ports";

export abstract class BaseQueryHandler {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  // ============================================
  // Core методы (используются напрямую и в helpers)
  // ============================================

  protected transformInfrastructureErrors(errors: IError[]): IError[] {
    return errors.map(error => error.toUserError());
  }

  protected logInfrastructureErrors(
    operation: string,
  ): (errors: IError[]) => void {
    return (errors: IError[]) => {
      errors
        .filter(error => !error.isExpected())  // Только unexpected!
        .forEach(error => {
          const level = error.getLogLevel();
          this.logger[level](`${operation}: ${error.getMessage()}`, error.getContext());
        });
    };
  }

  /**
   * Обработка Infrastructure errors (repository, external services)
   * - Логирует ТОЛЬКО unexpected ошибки
   * - Трансформирует ошибки через toUserError()
   */
  protected handleInfrastructureErrors<T>(
    result: Validation<IError[], T>,
    operation: string,
  ): Validation<IError[], T> {
    return tapLeft<IError[], T>(this.logInfrastructureErrors(operation))(result)
      .mapLeft(errors => this.transformInfrastructureErrors(errors));
  }

  // ============================================
  // Pipeline helpers
  // ============================================

  /**
   * Helper для создания Pipeline шага с обработкой Infrastructure errors
   * Используется когда нужен многошаговый query с retry/условиями
   */
  protected createInfrastructureStep<TContext, T>(
    operation: string,
    fn: (ctx: TContext) => Promise<Validation<IError[], T>>
  ): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>> {
    return async (ctx: TContext) => {
      return this.handleInfrastructureErrors(
        await fn(ctx),
        operation
      )
        .map((result) => ({ ...ctx, result }));
    };
  }

  /**
   * Helper для создания простого Pipeline шага
   * Используется для трансформации данных без Infrastructure calls
   */
  protected createTransformStep<TContext, T>(
    fn: (ctx: TContext) => Validation<IError[], T>
  ): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>> {
    return async (ctx: TContext) => {
      return Promise.resolve(
        fn(ctx).map((result) => ({ ...ctx, result }))
      );
    };
  }
}
```

---

## 2. BaseCommandHandler.ts

**Файл: `src/application/shared/BaseCommandHandler.ts`**

```typescript
import type { IError } from "@/shared/errors";
import type { Validation } from "@/shared/validation";
import { tapLeft, valid, invalid, fromCondition } from "@/shared/validation";
import type { ILogger } from "@/application/ports";

export abstract class BaseCommandHandler {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  // ============================================
  // Core методы (используются напрямую и в helpers)
  // ============================================

  protected transformInfrastructureErrors(errors: IError[]): IError[] {
    return errors.map(error => error.toUserError());
  }

  protected logInfrastructureErrors(
    operation: string,
  ): (errors: IError[]) => void {
    return (errors: IError[]) => {
      errors
        .filter(error => !error.isExpected())  // Только unexpected!
        .forEach(error => {
          const level = error.getLogLevel();
          this.logger[level](`${operation}: ${error.getMessage()}`, error.getContext());
        });
    };
  }

  /**
   * Обработка Infrastructure errors (repository, external services)
   * - Логирует ТОЛЬКО unexpected ошибки
   * - Трансформирует ошибки через toUserError()
   */
  protected handleInfrastructureErrors<T>(
    result: Validation<IError[], T>,
    operation: string,
  ): Validation<IError[], T> {
    return tapLeft<IError[], T>(this.logInfrastructureErrors(operation))(result)
      .mapLeft(errors => this.transformInfrastructureErrors(errors));
  }

  // ============================================
  // Pipeline helpers
  // ============================================

  /**
   * Helper для создания Pipeline шага с обработкой Infrastructure errors
   * Используется для repository/external service вызовов
   */
  protected createInfrastructureStep<TContext, T>(
    operation: string,
    fn: (ctx: TContext) => Promise<Validation<IError[], T>>
  ): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>> {
    return async (ctx: TContext) => {
      return this.handleInfrastructureErrors(
        await fn(ctx),
        operation
      )
        .map((result) => ({ ...ctx, result }));
    };
  }

  /**
   * Helper для создания Pipeline шага с Domain валидацией
   * Domain ошибки НЕ логируются (это expected flow)
   */
  protected createDomainValidationStep<TContext, T>(
    fn: (ctx: TContext) => Validation<IError[], T>
  ): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>> {
    return async (ctx: TContext) => {
      return Promise.resolve(
        fn(ctx).map((result) => ({ ...ctx, result }))
      );
    };
  }

  /**
   * Helper для проверки уникальности (found/not found)
   * Используется в Pipeline для проверки существования ресурса
   */
  protected createUniquenessCheck<TContext, TEntity>(
    shouldExist: boolean,
    errorIfFailed: (ctx: TContext) => IError
  ): (ctx: TContext & { result: TEntity | null }) => Promise<Validation<IError[], TContext & { result: TEntity | null }>> {
    return async (ctx) => {
      return Promise.resolve(
        fromCondition(
          (ctx.result !== null) === shouldExist,
          ctx,
          [errorIfFailed(ctx)]
        )
      );
    };
  }
}
```

---

## 3. Обновить index.ts

**Файл: `src/application/shared/index.ts`**

```typescript
// Public API для shared utilities Application Layer
export { BaseCommandHandler } from './BaseCommandHandler'
export { BaseQueryHandler } from './BaseQueryHandler'

// Application-specific Pipeline Context Types (CQRS)
export type {
  CreateContext,
  UpdateContext,
  DeleteContext,
} from './ApplicationPipelineContext'
```

---

## 4. Создать интерфейс ILogger

**Файл: `src/application/ports/ILogger.ts`**

```typescript
export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
```

**Файл: `src/application/ports/index.ts`**

```typescript
export type { ILogger } from './ILogger';
```

---

## ✅ Проверка

```bash
# Компиляция
pnpm tsc --noEmit

# Должно успешно скомпилироваться
```

---

## 🎯 Примеры использования

### В Query Handler

```typescript
import { BaseQueryHandler } from "@/application/shared/BaseQueryHandler";

export class ListResourcesQueryHandler extends BaseQueryHandler {
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger
  ) {
    super(logger);
  }

  async handle(query: ListResourcesQuery) {
    return (await new Pipeline<Context>()
      .step(ctx => this.fetchResources(ctx))
      .execute({ query }))
      .map(ctx => ctx.resources);
  }

  // ✅ handleInfrastructureErrors логирует ТОЛЬКО unexpected
  private async fetchResources(ctx: Context) {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch resources"
    ).map(resources => ({ ...ctx, resources }));
  }
}
```

### В Command Handler

```typescript
import { BaseCommandHandler } from "@/application/shared/BaseCommandHandler";

export class CreateResourceCommandHandler extends BaseCommandHandler {
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger
  ) {
    super(logger);
  }

  async handle(cmd: CreateResourceCommand) {
    return (await new Pipeline<Context>()
      .step(ctx => this.checkUniqueness(ctx))
      .step(ctx => this.createEntity(ctx))
      .step(ctx => this.persistResource(ctx))
      .execute({ command: cmd }))
      .map(() => undefined);
  }

  // ✅ asyncChain + fromCondition - функциональный стиль БЕЗ if
  private async checkUniqueness(ctx: Context) {
    return Namespace.create(ctx.command.namespace)
      .mapLeft((errors): IError[] => errors)
      .asyncChain(async (namespace) =>
        this.handleInfrastructureErrors(
          await this.repository.findByNamespace(namespace),
          "check uniqueness"
        ).chain((existing) =>
          fromCondition(
            existing.length === 0,
            { ...ctx, existing },
            [new DuplicateError(...)]
          )
        )
      );
  }

  // ✅ БЕЗ async - Domain validation
  private createEntity(ctx: Context): Promise<Validation<IError[], Context>> {
    return Promise.resolve(
      Resource.create(...).map(entity => ({ ...ctx, entity }))
    );
  }

  // ✅ async + await - Infrastructure call
  private async persistResource(ctx: Context) {
    return this.handleInfrastructureErrors(
      await this.repository.save(ctx.entity!),
      "save resource"
    ).map(() => ctx);
  }
}
```

---

## 📚 См. также

- [../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md](../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md) - практика
- [../../docs/QUICK_START.md](../../docs/QUICK_START.md) - примеры

---

**Следующий шаг:** [DOMAIN_LAYER_PRACTICAL.md](./DOMAIN_LAYER_PRACTICAL.md) - создание Domain Layer
