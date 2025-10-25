# Pipeline Setup - Настройка Pipeline Pattern

Создание Pipeline для композиции монадических операций в Handlers.

> **Назад:** [ERROR_SETUP.md](./ERROR_SETUP.md)  
> **Далее:** [BASE_HANDLERS_SETUP.md](./BASE_HANDLERS_SETUP.md)

---

## 🎯 Цель

Создать `Pipeline` класс для декларативного описания последовательности операций в Query и Command Handlers.

**Где используется:**
- Application Layer (Query/Command Handlers)
- Domain Layer (композиция Specifications - опционально)
- Infrastructure Layer (retry логика - опционально)

---

## 📦 Структура

```
src/shared/pipeline/
├── Pipeline.ts              # Pipeline класс
├── PipelineContext.ts       # Базовый контекст
└── index.ts                 # Public API

src/application/shared/
└── ApplicationPipelineContext.ts  # CQRS контексты
```

---

## 1. Pipeline.ts - Основной класс

**Файл: `src/shared/pipeline/Pipeline.ts`**

```typescript
import type { Validation } from "@/shared/validation";
import { valid } from "@/shared/validation";
import type { IError } from "@/shared/errors";

type PipelineStep<TContext> = (
  ctx: TContext,
) => Promise<Validation<IError[], TContext>>;

type CompensationFn<TContext> = (ctx: TContext) => Promise<void>;

export class Pipeline<TContext> {
  private steps: PipelineStep<TContext>[] = [];
  private compensations: CompensationFn<TContext>[] = [];
  private executedContexts: TContext[] = [];

  step(fn: PipelineStep<TContext>): this {
    this.steps.push(fn);
    return this;
  }

  stepIf(
    condition: (ctx: TContext) => boolean,
    fn: PipelineStep<TContext>,
  ): this {
    this.steps.push(async (ctx) =>
      condition(ctx) ? await fn(ctx) : valid(ctx),
    );
    return this;
  }

  stepWithRetry(
    fn: PipelineStep<TContext>,
    maxRetries = 3,
    delayMs = 1000,
  ): this {
    this.steps.push(async (ctx) => {
      let result = await fn(ctx);
      let attempts = 0;

      while (result.isLeft() && attempts < maxRetries) {
        const hasUnexpectedError = result.value.some(
          (error) => !error.isExpected(),
        );

        if (!hasUnexpectedError) break;

        attempts++;
        await this.delay(delayMs * attempts);
        result = await fn(ctx);
      }

      return result;
    });
    return this;
  }

  parallel(...fns: PipelineStep<TContext>[]): this {
    this.steps.push(async (ctx) => {
      const results = await Promise.all(fns.map((fn) => fn(ctx)));

      const allErrors = results
        .filter((r) => r.isLeft())
        .flatMap((r) => r.value);

      if (allErrors.length > 0) {
        return { isLeft: () => true, value: allErrors } as Validation<
          IError[],
          TContext
        >;
      }

      return valid(ctx);
    });
    return this;
  }

  stepWithCompensation(
    fn: PipelineStep<TContext>,
    compensate: CompensationFn<TContext>,
  ): this {
    this.steps.push(fn);
    this.compensations.unshift(compensate);
    return this;
  }

  async execute(
    initialContext: TContext,
  ): Promise<Validation<IError[], TContext>> {
    let result: Validation<IError[], TContext> = valid(initialContext);
    this.executedContexts = [];

    for (const step of this.steps) {
      if (result.isLeft()) {
        await this.rollback();
        break;
      }

      const currentContext = result.value;
      result = await step(currentContext);

      if (result.isRight()) {
        this.executedContexts.push(result.value);
      }
    }

    if (result.isLeft()) {
      await this.rollback();
    }

    return result;
  }

  private async rollback(): Promise<void> {
    for (let i = 0; i < this.executedContexts.length; i++) {
      const compensation = this.compensations[i];
      if (compensation) {
        try {
          await compensation(this.executedContexts[i]);
        } catch (error) {
          console.error("Compensation failed:", error);
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 2. PipelineContext.ts - Базовый контекст

**Файл: `src/shared/pipeline/PipelineContext.ts`**

```typescript
export interface PipelineContext {
  [key: string]: unknown;
}
```

---

## 3. index.ts - Public API

**Файл: `src/shared/pipeline/index.ts`**

```typescript
export { Pipeline } from "./Pipeline";
export type { PipelineContext } from "./PipelineContext";
```

---

## 4. ApplicationPipelineContext.ts - CQRS контексты

**Файл: `src/application/shared/ApplicationPipelineContext.ts`**

```typescript
import type { PipelineContext } from "@/shared/pipeline";

export interface CreateContext<TCommand, TEntity> extends PipelineContext {
  command: TCommand;
  entity?: TEntity;
}

export interface UpdateContext<TCommand, TEntity> extends PipelineContext {
  command: TCommand;
  existingEntity?: TEntity;
  updatedEntity?: TEntity;
}

export interface DeleteContext<TCommand, TEntity> extends PipelineContext {
  command: TCommand;
  entityToDelete?: TEntity;
}
```

---

## 5. Обновить src/shared/index.ts

**Файл: `src/shared/index.ts`**

```typescript
// Validation API
export type { Validation } from './validation'
export { valid, invalid, fromCondition, isTrue, ValidationCombinators } from './validation'

// Specification Pattern
export type { ISpecification } from './specification'

// BaseError
export { BaseError } from './errors'

// Pipeline Pattern
export { Pipeline } from './pipeline'
export type { PipelineContext } from './pipeline'
```

---

## 6. Обновить src/application/shared/index.ts

**Файл: `src/application/shared/index.ts`**

```typescript
// Base Handlers
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

## ✅ Проверка

```bash
# Компиляция
pnpm tsc --noEmit

# Должно успешно скомпилироваться
```

---

## 🎯 Примеры использования

### Query Handler

```typescript
import { Pipeline } from "@/shared/pipeline";

interface ListResourcesContext {
  query: ListResourcesQuery;
  resources?: Resource[];
  dtos?: ResourceListItemDTO[];
}

async handle(query: ListResourcesQuery) {
  return (await new Pipeline<ListResourcesContext>()
    .step(ctx => this.fetchResources(ctx))
    .step(ctx => this.transformToDTOs(ctx))
    .execute({ query }))
    .map(ctx => ctx.dtos!);
}
```

### Command Handler

```typescript
import { Pipeline } from "@/shared/pipeline";
import type { CreateContext } from "@/application/shared";

async handle(cmd: CreateResourceCommand) {
  return (await new Pipeline<CreateContext<CreateResourceCommand, Resource>>()
    .step(ctx => this.checkUniqueness(ctx))
    .step(ctx => this.createEntity(ctx))
    .stepWithRetry(ctx => this.persistResource(ctx), 3)
    .execute({ command: cmd }))
    .map(() => undefined);
}
```

---

## 📚 См. также

- [../../docs/patterns/PIPELINE.md](../../docs/patterns/PIPELINE.md) - детальное описание
- [../../docs/QUICK_START.md](../../docs/QUICK_START.md) - примеры использования

---

**Следующий шаг:** [BASE_HANDLERS_SETUP.md](./BASE_HANDLERS_SETUP.md) - создание Base Handlers
