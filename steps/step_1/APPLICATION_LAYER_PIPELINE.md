# Application Layer with Pipeline - Handlers с Pipeline Pattern

Создание Query и Command Handlers с использованием Pipeline Pattern.

> **Назад:** [DOMAIN_LAYER_PRACTICAL.md](./DOMAIN_LAYER_PRACTICAL.md)  
> **Далее:** [INFRASTRUCTURE_PRACTICAL.md](./INFRASTRUCTURE_PRACTICAL.md)

---

## 🎯 Цель

Создать Query и Command Handlers с Pipeline Pattern на основе реального кода проекта.

---

## 📦 Структура

```
src/application/
├── queries/
│   ├── IQuery.ts
│   ├── IQueryHandler.ts
│   ├── ListResourcesQuery.ts
│   ├── dtos/
│   │   └── ResourceListItemDTO.ts
│   ├── handlers/
│   │   └── ListResourcesQueryHandler.ts  # Pipeline!
│   └── index.ts
│
└── commands/
    ├── ICommand.ts
    ├── ICommandHandler.ts
    ├── CreateResourceCommand.ts
    ├── handlers/
    │   └── CreateResourceCommandHandler.ts  # Pipeline!
    └── index.ts
```

---

## Part 1: Query (Read)

### 1. Базовые интерфейсы

**Файл: `src/application/queries/IQuery.ts`**

```typescript
export interface IQuery {
  readonly type: string;
}
```

**Файл: `src/application/queries/IQueryHandler.ts`**

```typescript
import { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { IQuery } from "./IQuery";

export interface IQueryHandler<Q extends IQuery = IQuery, R = unknown> {
  handle(query: Q): Promise<Validation<IError[], R>>;
}
```

---

### 2. ListResourcesQuery

**Файл: `src/application/queries/ListResourcesQuery.ts`**

```typescript
import type { IQuery } from "./IQuery";

export class ListResourcesQuery implements IQuery {
  readonly type = "ListResourcesQuery";
}
```

---

### 3. ResourceListItemDTO

**Файл: `src/application/queries/dtos/ResourceListItemDTO.ts`**

```typescript
export interface ResourceListItemDTO {
  id: string;
  namespace: string;
  name: string;
  secretPreview: string;
  fieldsCount: number;
  updatedAt: string;
}
```

---

### 4. ListResourcesQueryHandler с Pipeline

**Файл: `src/application/queries/handlers/ListResourcesQueryHandler.ts`**

```typescript
import { BaseQueryHandler } from "@/application/shared/BaseQueryHandler";
import type { ILogger } from "@/application/ports";
import type { IResourceRepository } from "@/domain";
import type { Resource } from "@/domain";
import type { Validation } from "@/shared/validation";
import { valid } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { Pipeline } from "@/shared/pipeline";
import type { IQueryHandler } from "../IQueryHandler";
import type { ListResourcesQuery } from "../ListResourcesQuery";
import type { ResourceListItemDTO } from "../dtos/ResourceListItemDTO";

interface ListResourcesContext {
  query: ListResourcesQuery;
  resources?: Resource[];
  dtos?: ResourceListItemDTO[];
}

export class ListResourcesQueryHandler
  extends BaseQueryHandler
  implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]>
{
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  async handle(
    query: ListResourcesQuery,
  ): Promise<Validation<IError[], ResourceListItemDTO[]>> {
    return (await new Pipeline<ListResourcesContext>()
      .step((ctx) => this.fetchResources(ctx))
      .step((ctx) => this.transformToDTOs(ctx))
      .execute({ query }))
      .map((ctx) => ctx.dtos!);
  }

  // ============================================
  // Pipeline шаги
  // ============================================

  // Шаг 1: Infrastructure call (async + await)
  private async fetchResources(
    ctx: ListResourcesContext,
  ): Promise<Validation<IError[], ListResourcesContext>> {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch resources"
    )
      .map((resources) => ({ ...ctx, resources }));
  }

  // Шаг 2: Pure transformation (БЕЗ async - ESLint правило!)
  private transformToDTOs(
    ctx: ListResourcesContext,
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

---

### 5. Public API для Queries

**Файл: `src/application/queries/index.ts`**

```typescript
export type { IQuery } from "./IQuery";
export type { IQueryHandler } from "./IQueryHandler";

export { ListResourcesQuery } from "./ListResourcesQuery";
export type { ResourceListItemDTO } from "./dtos/ResourceListItemDTO";
export { ListResourcesQueryHandler } from "./handlers/ListResourcesQueryHandler";
```

---

## Part 2: Command (Write)

### 1. Базовые интерфейсы

**Файл: `src/application/commands/ICommand.ts`**

```typescript
export interface ICommand {
  readonly type: string;
}
```

**Файл: `src/application/commands/ICommandHandler.ts`**

```typescript
import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { ICommand } from "./ICommand";

export interface ICommandHandler<C extends ICommand = ICommand> {
  handle(command: C): Promise<Validation<IError[], void>>;
}
```

---

### 2. CreateResourceCommand

**Файл: `src/application/commands/CreateResourceCommand.ts`**

```typescript
import type { ICommand } from "./ICommand";

export class CreateResourceCommand implements ICommand {
  readonly type = "CreateResourceCommand";

  constructor(
    public readonly namespace: string,
    public readonly name: string,
    public readonly secret: string,
  ) {}
}
```

---

### 3. CreateResourceCommandHandler с Pipeline

**Файл: `src/application/commands/handlers/CreateResourceCommandHandler.ts`**

```typescript
import { BaseCommandHandler } from "@/application/shared/BaseCommandHandler";
import type { ILogger } from "@/application/ports";
import type { IResourceRepository } from "@/domain";
import { Resource, Namespace, ResourceName } from "@/domain";
import type { Validation } from "@/shared/validation";
import { fromCondition } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { DuplicateError } from "@/shared/errors";
import { Pipeline } from "@/shared/pipeline";
import type { CreateContext } from "@/application/shared";
import type { ICommandHandler } from "../ICommandHandler";
import type { CreateResourceCommand } from "../CreateResourceCommand";

interface CreateResourceContext
  extends CreateContext<CreateResourceCommand, Resource> {
  existingResources?: Resource[];
}

export class CreateResourceCommandHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateResourceCommand>
{
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  async handle(
    command: CreateResourceCommand,
  ): Promise<Validation<IError[], void>> {
    return (
      await new Pipeline<CreateResourceContext>()
        .step((ctx) => this.checkUniqueness(ctx))
        .step((ctx) => this.createEntity(ctx))
        .stepWithRetry((ctx) => this.persistResource(ctx), 3)
        .execute({ command })
    ).map(() => undefined);
  }

  // ============================================
  // Pipeline шаги
  // ============================================

  // Шаг 1: Check uniqueness (asyncChain БЕЗ if-ов!)
  private async checkUniqueness(
    ctx: CreateResourceContext,
  ): Promise<Validation<IError[], CreateResourceContext>> {
    const namespaceValidation = Namespace.create(ctx.command.namespace)
      .mapLeft((errors): IError[] => errors);

    return namespaceValidation.asyncChain(async (namespace) =>
      this.handleInfrastructureErrors(
        await this.repository.findByNamespace(namespace),
        "check uniqueness",
      ).chain((existingResources) =>
        fromCondition(
          existingResources.length === 0,
          { ...ctx, existingResources },
          [
            new DuplicateError("Resource", ctx.command.namespace, {
              field: "namespace",
            }),
          ],
        ),
      ),
    );
  }

  // Шаг 2: Create Entity (БЕЗ async - Domain validation)
  private createEntity(
    ctx: CreateResourceContext,
  ): Promise<Validation<IError[], CreateResourceContext>> {
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret,
      ).map((entity) => ({ ...ctx, entity }))
    );
  }

  // Шаг 3: Persist (async + await + retry)
  private async persistResource(
    ctx: CreateResourceContext,
  ): Promise<Validation<IError[], CreateResourceContext>> {
    return this.handleInfrastructureErrors(
      await this.repository.save(ctx.entity!),
      "save resource",
    ).map(() => ctx);
  }
}
```

---

### 4. Public API для Commands

**Файл: `src/application/commands/index.ts`**

```typescript
export type { ICommand } from "./ICommand";
export type { ICommandHandler } from "./ICommandHandler";

export { CreateResourceCommand } from "./CreateResourceCommand";
export { CreateResourceCommandHandler } from "./handlers/CreateResourceCommandHandler";
```

---

## ✅ Проверка

```bash
# Компиляция
pnpm tsc --noEmit

# ESLint проверка
pnpm eslint src/application/
```

---

## 🎯 Ключевые моменты

### 1. async БЕЗ await = ESLint ошибка

```typescript
// ❌ НЕПРАВИЛЬНО
private async transformToDTOs(ctx) {  // ESLint error!
  return valid({...ctx, dtos: ...});
}

// ✅ ПРАВИЛЬНО
private transformToDTOs(ctx): Promise<Validation<...>> {
  return Promise.resolve(valid({...ctx, dtos: ...}));
}
```

### 2. Функциональный стиль БЕЗ if-ов

```typescript
// ✅ asyncChain вместо if (isLeft())
return namespaceValidation.asyncChain(async (namespace) => ...)

// ✅ fromCondition вместо if (condition)
return fromCondition(
  existingResources.length === 0,
  ctx,
  [new DuplicateError(...)]
);
```

### 3. Логирование ТОЛЬКО unexpected

```typescript
// ✅ handleInfrastructureErrors логирует только !error.isExpected()
return this.handleInfrastructureErrors(
  await this.repository.findAll(),
  "fetch resources"
);

// ❌ НЕ используем для Domain validation
// Resource.create() возвращает ValidationError (expected) - НЕ логируем!
```

---

## 📚 См. также

- [../../docs/QUICK_START.md](../../docs/QUICK_START.md) - быстрый старт
- [../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md](../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md) - практика

---

**Следующий шаг:** [INFRASTRUCTURE_PRACTICAL.md](./INFRASTRUCTURE_PRACTICAL.md) - создание Repository
