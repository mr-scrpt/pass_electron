# Pipeline Pattern

## 📖 Обзор

**Pipeline** - функциональный паттерн для композиции последовательных операций.

**Расположение:** `src/shared/pipeline/` - технический паттерн, доступен для всех слоев (Domain, Application, Infrastructure).

### Проблема

В процедурном стиле:
```typescript
async handle(cmd: CreateResourceCommand) {
  // ❌ Смешение валидации, бизнес-логики, персистентности
  const existing = await this.repository.findByNamespace(cmd.namespace);
  if (existing.isLeft()) return existing;
  if (existing.value !== null) return left([new DuplicateError(...)]);
  
  const resource = Resource.create(...);
  if (resource.isLeft()) return resource;
  
  const saved = await this.repository.save(resource.value);
  return saved;
}
```

**Проблемы:**
- Смешение ответственностей
- Сложно добавлять новые шаги (retry, логирование, события)
- Нарушение функционального стиля (if-ы)

### Решение: Pipeline

```typescript
import { Pipeline } from "@/shared/pipeline";
import type { CreateContext } from "@/application/shared";

async handle(cmd: CreateResourceCommand) {
  return new Pipeline<Context>()
    .step(ctx => this.checkUniqueness(ctx))
    .step(ctx => this.validateInput(ctx))
    .stepWithRetry(ctx => this.persistResource(ctx), 3)
    .step(ctx => this.publishEvents(ctx))
    .execute({ command: cmd })
    .map(() => undefined);
}
```

---

## 🎯 API Reference

### Методы

#### `.step(fn)` - Базовый шаг

Добавляет обычный шаг в пайплайн.

```typescript
.step(async (ctx) => {
  const result = await this.handleInfrastructureErrors(
    this.repository.save(ctx.resource),
    "save resource"
  );
  return result.map(() => ctx);
})
```

#### `.stepIf(condition, fn)` - Условный шаг

Выполняется только если условие `true`.

```typescript
.stepIf(
  (ctx) => ctx.resource.isPremium,
  async (ctx) => {
    await this.notificationService.sendPremiumWelcome(ctx.resource);
    return valid(ctx);
  }
)
```

#### `.stepWithRetry(fn, maxRetries, delayMs)` - Retry логика

Повторяет выполнение при **unexpected** ошибках (Infrastructure errors).

```typescript
.stepWithRetry(
  async (ctx) => this.handleInfrastructureErrors(
    this.repository.save(ctx.resource),
    "save resource"
  ),
  3,      // maxRetries
  1000    // delayMs (exponential backoff)
)
```

**Retry только для unexpected:**
- `NetworkError.isExpected() = false` → retry ✅
- `ValidationError.isExpected() = true` → НЕ retry ❌

#### `.parallel(...fns)` - Параллельное выполнение

Выполняет несколько шагов параллельно, аккумулирует ошибки.

```typescript
.parallel(
  async (ctx) => this.checkEmailUniqueness(ctx),
  async (ctx) => this.checkNamespaceUniqueness(ctx),
  async (ctx) => this.validatePermissions(ctx)
)
```

#### `.stepWithCompensation(fn, compensate)` - Saga Pattern

Добавляет шаг с функцией отката (rollback).

```typescript
.stepWithCompensation(
  async (ctx) => this.repository.save(ctx.resource),
  async (ctx) => this.repository.delete(ctx.resource.id)  // Rollback
)
.stepWithCompensation(
  async (ctx) => this.emailService.send(ctx.email),
  async (ctx) => this.emailService.sendCancellation(ctx.email)  // Rollback
)
```

При ошибке на любом последующем шаге - выполнятся все компенсации в обратном порядке (LIFO).

---

## 🌍 Применение в разных слоях

### Domain Layer

Pipeline полезен для композиции сложных Specifications и валидаций:

```typescript
// src/domain/resource/invariants/ComplexResourceInvariant.ts
import { Pipeline } from "@/shared/pipeline";
import type { Validation } from "@/shared/validation";

export class ComplexResourceInvariant {
  static validate(
    namespace: string,
    name: string
  ): Validation<ValidationError[], { namespace: string; name: string }> {
    return new Pipeline<{ namespace: string; name: string; errors: string[] }>()
      .step((ctx) => this.validateNamespace(ctx))
      .step((ctx) => this.validateName(ctx))
      .step((ctx) => this.validateCombination(ctx))
      .execute({ namespace, name, errors: [] })
      .map((ctx) => ({ namespace: ctx.namespace, name: ctx.name }));
  }

  private static validateNamespace(ctx: Context): Promise<Validation<ValidationError[], Context>> {
    return Promise.resolve(
      NamespaceInvariant.instance.validate(ctx.namespace, "Resource")
        .map(() => ctx)
    );
  }
}
```

### Application Layer (основное применение)

Pipeline идеален для CQRS Handlers с множественными шагами (см. примеры ниже).

### Infrastructure Layer

Pipeline может использоваться для retry логики API calls:

```typescript
// src/infrastructure/api/ResourceApiClient.ts
import { Pipeline } from "@/shared/pipeline";

export class ResourceApiClient {
  async fetchWithRetry(id: string): Promise<Validation<IError[], Resource>> {
    return new Pipeline<{ id: string; result?: Resource }>()
      .stepWithRetry(
        async (ctx) => this.makeRequest(ctx.id),
        3,
        2000
      )
      .execute({ id })
      .map((ctx) => ctx.result!);
  }
}
```

---

## 📋 Примеры использования в Application Layer

### Пример 1: Простой Command с валидацией

```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
import { Pipeline } from "@/shared/pipeline";
import type { CreateContext } from "@/application/shared";

interface Context extends CreateContext<CreateResourceCommand, Resource> {
  existingResource?: Resource | null;
}

export class CreateResourceCommandHandler extends BaseCommandHandler {
  async handle(cmd: CreateResourceCommand): Promise<Validation<IError[], void>> {
    return new Pipeline<Context>()
      .step((ctx) => this.checkUniqueness(ctx))
      .step((ctx) => this.validateAndCreate(ctx))
      .stepWithRetry((ctx) => this.persistResource(ctx), 3)
      .execute({ command: cmd })
      .map(() => undefined);
  }

  // ============================================
  // Пайплайн - каждый метод одна ответственность
  // ============================================

  private async checkUniqueness(ctx: Context): Promise<Validation<IError[], Context>> {
    return (await this.handleInfrastructureErrors(
      this.repository.findByNamespace(Namespace.create(ctx.command.namespace)),
      "check uniqueness"
    ))
      .chain((existing) =>
        fromCondition(
          existing === null,
          { ...ctx, existingResource: existing },
          [new DuplicateError('Resource', ctx.command.namespace, { field: 'namespace' })]
        )
      );
  }

  private validateAndCreate(ctx: Context): Promise<Validation<IError[], Context>> {
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret
      )
        .map((resource) => ({ ...ctx, entity: resource }))
    );
  }

  private async persistResource(ctx: Context): Promise<Validation<IError[], Context>> {
    return (await this.handleInfrastructureErrors(
      this.repository.save(ctx.entity!),
      "save resource"
    ))
      .map(() => ctx);
  }
}
```

### Пример 2: Сложный Command с условиями и событиями

```typescript
interface UpdateContext extends UpdateContext<UpdateResourceCommand, Resource> {
  shouldNotify?: boolean;
  previousState?: Resource;
}

export class UpdateResourceCommandHandler extends BaseCommandHandler {
  async handle(cmd: UpdateResourceCommand): Promise<Validation<IError[], void>> {
    return new Pipeline<UpdateContext>()
      .step((ctx) => this.loadExistingResource(ctx))
      .step((ctx) => this.validateUpdate(ctx))
      .stepWithRetry((ctx) => this.persistUpdate(ctx), 3)
      .stepIf(
        (ctx) => ctx.shouldNotify === true,
        (ctx) => this.sendNotifications(ctx)
      )
      .step((ctx) => this.publishEvents(ctx))
      .execute({ command: cmd })
      .map(() => undefined);
  }

  private async loadExistingResource(ctx: UpdateContext): Promise<Validation<IError[], UpdateContext>> {
    return (await this.handleInfrastructureErrors(
      this.repository.findById(ResourceId.create(ctx.command.id)),
      "load resource"
    ))
      .chain((resource) =>
        fromNullable(resource, [new NotFoundError('Resource', ctx.command.id)])
      )
      .map((resource) => ({
        ...ctx,
        existingEntity: resource,
        previousState: resource,
        shouldNotify: resource.namespace.getValue() !== ctx.command.namespace
      }));
  }

  private validateUpdate(ctx: UpdateContext): Promise<Validation<IError[], UpdateContext>> {
    // Валидация новых значений
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret
      )
        .map((updated) => ({ ...ctx, updatedEntity: updated }))
    );
  }

  private async persistUpdate(ctx: UpdateContext): Promise<Validation<IError[], UpdateContext>> {
    return (await this.handleInfrastructureErrors(
      this.repository.update(ctx.updatedEntity!),
      "update resource"
    ))
      .map(() => ctx);
  }

  private async sendNotifications(ctx: UpdateContext): Promise<Validation<IError[], UpdateContext>> {
    await this.notificationService.notifyResourceUpdated(ctx.updatedEntity!);
    return valid(ctx);
  }

  private async publishEvents(ctx: UpdateContext): Promise<Validation<IError[], UpdateContext>> {
    await this.eventBus.publish(new ResourceUpdatedEvent(
      ctx.previousState!,
      ctx.updatedEntity!
    ));
    return valid(ctx);
  }
}
```

### Пример 3: Saga Pattern с транзакциями

```typescript
export class ComplexTransactionCommandHandler extends BaseCommandHandler {
  async handle(cmd: ProcessPaymentCommand): Promise<Validation<IError[], void>> {
    return new Pipeline<PaymentContext>()
      .stepWithCompensation(
        (ctx) => this.chargeCard(ctx),
        (ctx) => this.refundCard(ctx)  // Rollback
      )
      .stepWithCompensation(
        (ctx) => this.createOrder(ctx),
        (ctx) => this.cancelOrder(ctx)  // Rollback
      )
      .stepWithCompensation(
        (ctx) => this.sendConfirmationEmail(ctx),
        (ctx) => this.sendCancellationEmail(ctx)  // Rollback
      )
      .execute({ command: cmd })
      .map(() => undefined);
  }

  // Если createOrder упадет - выполнится refundCard
  // Если sendConfirmationEmail упадет - выполнится cancelOrder и refundCard
}
```

---

## 🔍 Интеграция с существующей системой ошибок

### handleInfrastructureErrors - обработка Repository/External Service

```typescript
private async persistResource(ctx: Context): Promise<Validation<IError[], Context>> {
  return (await this.handleInfrastructureErrors(
    this.repository.save(ctx.resource),
    "save resource"
  ))
    .map(() => ctx);
}
```

**Что делает `handleInfrastructureErrors`:**
1. Логирует **ТОЛЬКО unexpected ошибки** через `logInfrastructureErrors`
2. Трансформирует через `toUserError()`:
   - `NetworkError` → `GenericApplicationError("Service temporarily unavailable")`
   - `ApiError` → `GenericApplicationError("External service error")`
   - `ValidationError` → остается как есть (expected)

### Domain валидация - БЕЗ логирования

```typescript
private validateInput(ctx: Context): Promise<Validation<IError[], Context>> {
  // Domain errors (ValidationError) НЕ логируются - это нормальный flow
  return Promise.resolve(
    Resource.create(
      Namespace.create(ctx.command.namespace),
      ResourceName.create(ctx.command.name),
      ctx.command.secret
    )
      .map((resource) => ({ ...ctx, resource }))
  );
}
```

**ValidationError:**
- `isExpected() = true` → НЕ логируется ✅
- Показывается пользователю как есть ✅

---

## 🛠️ Helper методы из BaseQueryHandler / BaseCommandHandler

Базовые классы предоставляют helper методы для упрощения создания Pipeline шагов.

### BaseCommandHandler helpers

#### `createInfrastructureStep` - Repository/External Service вызовы

```typescript
import { Pipeline } from "@/shared/pipeline";
import type { CreateContext } from "@/application/shared";

async handle(cmd: CreateResourceCommand): Promise<Validation<IError[], void>> {
  return new Pipeline<CreateContext<CreateResourceCommand, Resource>>()
    // ✅ Helper автоматически обрабатывает Infrastructure errors
    .step(
      this.createInfrastructureStep(
        "check uniqueness",
        (ctx) => this.repository.findByNamespace(Namespace.create(ctx.command.namespace))
      )
    )
    // Теперь в ctx.result - Resource | null
    .step(this.createUniquenessCheck(
      false,  // Должен НЕ существовать
      (ctx) => new DuplicateError('Resource', ctx.command.namespace)
    ))
    .step(this.createDomainValidationStep(
      (ctx) => Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret
      )
    ))
    .stepWithRetry(
      this.createInfrastructureStep(
        "save resource",
        (ctx) => this.repository.save(ctx.result)
      ),
      3
    )
    .execute({ command: cmd })
    .map(() => undefined);
}
```

#### `createDomainValidationStep` - Domain валидация

```typescript
// Domain ошибки НЕ логируются (expected flow)
.step(this.createDomainValidationStep(
  (ctx) => Resource.create(
    Namespace.create(ctx.command.namespace),
    ResourceName.create(ctx.command.name),
    ctx.command.secret
  )
))
```

#### `createUniquenessCheck` - Проверка существования

```typescript
// Проверка что ресурс НЕ существует (для создания)
.step(this.createUniquenessCheck(
  false,  // shouldExist = false
  (ctx) => new DuplicateError('Resource', ctx.command.namespace)
))

// Проверка что ресурс существует (для обновления)
.step(this.createUniquenessCheck(
  true,  // shouldExist = true
  (ctx) => new NotFoundError('Resource', ctx.command.id)
))
```

### BaseQueryHandler helpers

#### `createInfrastructureStep` - Fetch операции

```typescript
import { Pipeline } from "@/shared/pipeline";

async handle(query: GetResourceDetailsQuery): Promise<Validation<IError[], ResourceDetailsDTO>> {
  return new Pipeline<{ query: GetResourceDetailsQuery }>()
    .step(
      this.createInfrastructureStep(
        "fetch resource",
        (ctx) => this.repository.findById(ResourceId.create(ctx.query.id))
      )
    )
    .step(this.createTransformStep(
      (ctx) => valid(this.toDTO(ctx.result))
    ))
    .execute({ query })
    .map((ctx) => ctx.result);
}
```

#### `createTransformStep` - Трансформация данных

```typescript
// БЕЗ Infrastructure вызовов, только трансформация
.step(this.createTransformStep(
  (ctx) => valid(ctx.resources.map(r => this.toDTO(r)))
))
```

### Преимущества helper методов

| Helper | Логирование | Трансформация ошибок | Тип операции |
|--------|-------------|---------------------|--------------|
| `createInfrastructureStep` | ✅ Только unexpected | ✅ toUserError() | Repository/API |
| `createDomainValidationStep` | ❌ НЕ логирует | ❌ Без трансформации | Domain logic |
| `createUniquenessCheck` | ❌ НЕ логирует | ❌ Без трансформации | Business rule |
| `createTransformStep` | ❌ НЕ логирует | ❌ Без трансформации | Data mapping |

---

## 🎨 Best Practices

### 1. Контекст должен быть immutable

```typescript
// ✅ Правильно - создаем новый объект
.step((ctx) => 
  valid({ ...ctx, newField: value })
)

// ❌ Неправильно - мутируем контекст
.step((ctx) => {
  ctx.newField = value;  // ❌ Mutation!
  return valid(ctx);
})
```

### 2. Каждый шаг - одна ответственность

```typescript
// ✅ Правильно - изолированные шаги
.step((ctx) => this.checkUniqueness(ctx))
.step((ctx) => this.validateInput(ctx))
.step((ctx) => this.persistResource(ctx))

// ❌ Неправильно - все в одном шаге
.step(async (ctx) => {
  const unique = await this.checkUniqueness(ctx);
  const validated = await this.validateInput(ctx);
  return this.persistResource(ctx);
})
```

### 3. Используйте типизированные контексты

```typescript
// ✅ Правильно - строгая типизация
interface CreateResourceContext extends CreateContext<CreateResourceCommand, Resource> {
  existingResource?: Resource | null;
  validationResult?: Validation<IError[], Resource>;
}

new Pipeline<CreateResourceContext>()  // ✅ Type-safe!
```

### 4. Retry только для Infrastructure

```typescript
// ✅ Правильно - retry для repository/external services
.stepWithRetry((ctx) => this.handleInfrastructureErrors(
  this.repository.save(ctx.resource),
  "save"
), 3)

// ❌ Неправильно - retry для domain валидации
.stepWithRetry((ctx) => 
  Resource.create(...),  // Не имеет смысла retry валидацию
3)
```

---

## 📊 Сравнение с альтернативами

| Подход | Читаемость | Расширяемость | Тестируемость | DDD |
|--------|------------|---------------|---------------|-----|
| **Процедурный (if-ы)** | ❌ Низкая | ❌ Сложно | ⚠️ Средняя | ❌ Нарушает |
| **chain + map** | ⚠️ Средняя | ⚠️ Ограничена | ✅ Хорошая | ✅ Соблюдает |
| **Pipeline** | ✅ Высокая | ✅ Отличная | ✅ Отличная | ✅ Соблюдает |

---

## 🔗 См. также

- [Error Handling](../error-handling/README.md)
- [Base Handlers Reference](../error-handling/BASE_HANDLERS_REFERENCE.md)
- [DDD Patterns](./DDD_PATTERNS.md)
