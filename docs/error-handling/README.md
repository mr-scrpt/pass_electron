# Error Handling - Обработка ошибок

Полная документация по обработке ошибок, валидации и Pipeline Pattern в проекте.

---

## 📚 Актуальная документация (2025)

### ⭐ [PIPELINE_HANDLERS_GUIDE.md](./PIPELINE_HANDLERS_GUIDE.md) - Практическое руководство

**НАЧНИ ЗДЕСЬ** если пишешь новый Handler!

Полное практическое руководство:
- Query Handler с Pipeline - примеры и best practices
- Command Handler с Pipeline - примеры и best practices
- Обработка ошибок в Pipeline шагах
- Когда логировать, а когда нет
- async vs Promise.resolve (ESLint правила)
- Функциональный стиль БЕЗ if-ов

**Для кого:** Разработчики, создающие новые Handlers

---

### 📖 [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) - Either Pattern и монады

Документ описывает:
- Проблемы традиционного `try-catch` подхода
- **@sweet-monads/either** - Either монада (используется!)
- `mergeInMany` - накопление ВСЕХ ошибок валидации
- `mapLeft` - трансформация ошибок между слоями
- **tapLeft** - side effects (логирование)
- Функциональная композиция

**Ключевые концепции:**
- Type-safe обработка ошибок
- Railway-oriented programming
- Ошибки как часть сигнатуры типа `Validation<IError[], T>`
- Накопление всех ошибок
- Функциональная композиция

**Для кого:** Все разработчики

---

### 📘 [INVARIANTS.md](./INVARIANTS.md) - Инварианты и валидация в DDD

Документ описывает:
- Что такое инварианты в DDD
- Где они живут (Value Objects, Aggregates)
- Паттерн Shared Kernel для переиспользуемых правил валидации
- Примеры: `UuidInvariant` (shared), `NamespaceInvariant` (resource)
- Интеграция с системой ошибок

**Ключевые концепции:**
- Fail Fast — валидация при создании
- DRY — переиспользуемые инварианты
- Type Safety — компилятор проверяет

**Для кого:** Разработчики Domain Layer

---

### 📚 [ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md) - Детальное сравнение библиотек

Расширенный документ с полным сравнением:
- Что такое монады и как они работают
- Result vs Either — в чем разница
- **@sweet-monads/either** (Either монада, Haskell-style) - ИСПОЛЬЗУЕТСЯ
- **neverthrow** (Result монада, Rust-style)
- **fp-ts** (полная экосистема монад)
- Детальная таблица сравнения всех библиотек

**Для кого:** Архитекторы, принимающие решения о библиотеках

---

### 🔧 [BASE_HANDLERS_REFERENCE.md](./BASE_HANDLERS_REFERENCE.md) - Справка по Base Handlers

**TODO:** Обновить этот документ с учетом Pipeline подхода.

Текущий статус: Частично устарел, нужно переписать.

---

## 🎯 Рекомендуемый порядок изучения

### Для новых разработчиков:
1. **[../QUICK_START.md](../QUICK_START.md)** - быстрый старт с Pipeline ⭐ **НАЧНИ ЗДЕСЬ**
2. **[PIPELINE_HANDLERS_GUIDE.md](./PIPELINE_HANDLERS_GUIDE.md)** - практические примеры
3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** - Either Pattern и монады
4. **[INVARIANTS.md](./INVARIANTS.md)** - Domain валидация

### Для опытных разработчиков:
1. **[../QUICK_START.md](../QUICK_START.md)** - текущий подход ⭐
2. **[PIPELINE_HANDLERS_GUIDE.md](./PIPELINE_HANDLERS_GUIDE.md)** - best practices
3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** - монадные операторы

---

## 💡 Ключевые принципы проекта (2025)

### 1. Pipeline Pattern для Handlers

```typescript
// Query Handler
async handle(query: ListResourcesQuery) {
  return (await new Pipeline<Context>()
    .step(ctx => this.fetchResources(ctx))
    .step(ctx => this.transformToDTOs(ctx))
    .execute({ query }))
    .map(ctx => ctx.dtos!);
}

// Command Handler
async handle(cmd: CreateResourceCommand) {
  return (await new Pipeline<Context>()
    .step(ctx => this.checkUniqueness(ctx))
    .step(ctx => this.createEntity(ctx))
    .stepWithRetry(ctx => this.persistResource(ctx), 3)
    .execute({ command: cmd }))
    .map(() => undefined);
}
```

### 2. Функциональный стиль БЕЗ if-ов

```typescript
// ✅ asyncChain вместо if
return namespaceValidation.asyncChain(async (namespace) =>
  this.handleInfrastructureErrors(...)
);

// ✅ fromCondition вместо if
return fromCondition(
  existingResources.length === 0,
  ctx,
  [new DuplicateError(...)]
);
```

### 3. Логируем ТОЛЬКО unexpected ошибки

```typescript
// handleInfrastructureErrors логирует только !error.isExpected()
return this.handleInfrastructureErrors(
  await this.repository.findAll(),
  "fetch resources"
).map((resources) => ({ ...ctx, resources }));
```

### 4. ESLint правило: async БЕЗ await = ошибка

```typescript
// ✅ ПРАВИЛЬНО - async с await
private async fetchResources(ctx) {
  return this.handleInfrastructureErrors(await ...);
}

// ✅ ПРАВИЛЬНО - БЕЗ async, Promise.resolve
private transformToDTOs(ctx): Promise<Validation<...>> {
  return Promise.resolve(valid({...}));
}

// ❌ НЕПРАВИЛЬНО - async БЕЗ await
private async transformToDTOs(ctx) {  // ❌ ESLint ошибка!
  return valid({...});
}
```

### 5. Shared Errors

```typescript
// src/shared/errors/
import { DuplicateError } from "@/shared/errors";
import { NotFoundError } from "@/shared/errors";
import { ValidationError } from "@/shared/errors";
import { InfrastructureError } from "@/shared/errors";
```

**Важно:** ВСЕ ошибки наследуются от `BaseError`:
- Domain errors (InvariantViolationError, InvalidOperationError)
- Shared errors (NotFoundError, DuplicateError, ValidationError)
- Application errors (GenericApplicationError, CommandValidationError)
- Infrastructure errors (InfrastructureError)

---

## 🔗 Связанные документы

### Паттерны
- **[../patterns/PIPELINE.md](../patterns/PIPELINE.md)** - Pipeline Pattern детально
- **[../patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md)** - Specification Pattern

### Архитектура
- **[../DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** - Value Objects и Entities
- **[../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** - Структура проекта
- **[../DATA_FLOW.md](../DATA_FLOW.md)** - CQRS поток данных

### Quick Start
- **[../QUICK_START.md](../QUICK_START.md)** - быстрый старт ⭐

---

## 📦 Legacy документация

Устаревшие документы перемещены в `.temp/docs-old/error-handling/`:
- `POLYMORPHIC_ERROR_SYSTEM.md` - старая система IError
- `ERROR_HANDLING.md` - старая иерархия ошибок  
- `APPLICATION_ERROR_HANDLING.md` - устаревший API
- `ERROR_CLASSIFIER_REFERENCE.md` - полностью устарел
- `VALIDATION_EVOLUTION.md` - исторический обзор
- `SPECIFICATION_VALIDATION.md` - не используем активно
- `VALIDATION_COMBINATORS.md` - устарело

Эти файлы сохранены для истории, но **не используйте их** для нового кода.

---

## 📝 История версий

### v2.0 (2025-01-25) - Pipeline Pattern approach
- ✅ Pipeline Pattern для всех Handlers
- ✅ Функциональный стиль БЕЗ if-ов (asyncChain, fromCondition)
- ✅ Base Handlers с helper методами
- ✅ Логирование ТОЛЬКО unexpected ошибок
- ✅ ESLint-compliant (async без await = ошибка)
- ✅ Shared errors (DuplicateError, NotFoundError)
- ✅ QUICK_START.md и PIPELINE_HANDLERS_GUIDE.md

### v1.0 - Legacy approach
- `try-catch` подход
- Полиморфная система IError
- ErrorClassifier для классификации
- BaseError и иерархия ошибок

---

**💡 Совет:** Начни с [../QUICK_START.md](../QUICK_START.md) для быстрого старта, затем [PIPELINE_HANDLERS_GUIDE.md](./PIPELINE_HANDLERS_GUIDE.md) для практики!

---

**Дата обновления:** 2025-01-25  
**Версия:** 2.0 (Pipeline approach)
