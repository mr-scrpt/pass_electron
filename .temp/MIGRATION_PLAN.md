# План миграции документации

## 🎯 Текущее состояние (2025-01-25)

### Реализованный подход

#### 1. Pipeline Pattern для Handlers

**Query Handler:**
```typescript
async handle(query: ListResourcesQuery) {
  return (await new Pipeline<Context>()
    .step(ctx => this.fetchResources(ctx))
    .step(ctx => this.transformToDTOs(ctx))
    .execute({ query }))
    .map(ctx => ctx.dtos!);
}
```

**Command Handler:**
```typescript
async handle(cmd: CreateResourceCommand) {
  return (await new Pipeline<Context>()
    .step(ctx => this.checkUniqueness(ctx))
    .step(ctx => this.createEntity(ctx))
    .stepWithRetry(ctx => this.persistResource(ctx), 3)
    .execute({ command: cmd }))
    .map(() => undefined);
}
```

#### 2. Base Handlers с helper методами

**BaseQueryHandler:**
- `handleInfrastructureErrors` - log + transform (только unexpected)
- `createInfrastructureStep` - для Repository calls
- `createTransformStep` - для pure transformations

**BaseCommandHandler:**
- `handleInfrastructureErrors` - log + transform (только unexpected)
- `createInfrastructureStep` - для Repository calls
- `createDomainValidationStep` - для Domain validation
- `createUniquenessCheck` - для business rules

#### 3. Функциональный стиль БЕЗ if-ов

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

// ✅ async vs Promise.resolve
private async fetchResources(ctx) {  // async - есть await
  return this.handleInfrastructureErrors(await ...);
}

private createEntity(ctx) {  // БЕЗ async - нет await
  return Promise.resolve(Resource.create(...));
}
```

#### 4. Validation через @sweet-monads/either

```typescript
import type { Validation } from "@/shared/validation";
import { valid, invalid, fromCondition } from "@/shared/validation";

type Validation<L, R> = Either<L, R>;
```

#### 5. Shared Errors

```typescript
// src/shared/errors/
export { DuplicateError } from './DuplicateError';
export { NotFoundError } from './NotFoundError';
export { ValidationError } from './ValidationError';
```

#### 6. CQRS типы

```typescript
// Commands возвращают void
async handle(command: ICommand): Promise<Validation<IError[], void>>

// Queries возвращают DTO[]
async handle(query: IQuery): Promise<Validation<IError[], DTO[]>>
```

---

## 📂 Структура документации

### docs/error-handling/ (12 файлов)

**Актуальные:**
- ERROR_ESCALATION.md ✅ - монады и Either
- ERROR_ESCALATION_EXTENDED.md ✅ - сравнение библиотек
- INVARIANTS.md ✅ - инварианты в DDD

**Legacy (v1.0):**
- ERROR_HANDLING.md ❌ - старая иерархия ошибок
- APPLICATION_ERROR_HANDLING.md ⚠️ - концепции актуальны, API устарел
- POLYMORPHIC_ERROR_SYSTEM.md ⚠️ - IError interface (частично актуален)
- BASE_HANDLERS_REFERENCE.md ⚠️ - устарел, нужно переписать
- ERROR_CLASSIFIER_REFERENCE.md ❌ - полностью устарел

**Избыточные:**
- VALIDATION_EVOLUTION.md ⚠️ - исторический обзор
- SPECIFICATION_VALIDATION.md ⚠️ - не используем Specification активно
- VALIDATION_EXAMPLES.md ⚠️ - примеры устарели
- VALIDATION_COMBINATORS.md ⚠️ - устарело

### steps/step_1/ (13 файлов)

**Актуальные:**
- README.md ✅ - оглавление
- ERROR_SETUP.md ✅ - базовые ошибки
- VALIDATION_SETUP.md ✅ - Validation API

**Устаревшие:**
- APPLICATION_LAYER_SETUP.md ❌ - нет Pipeline
- DOMAIN_LAYER_SETUP.md ❌ - старые примеры
- INFRASTRUCTURE_SETUP.md ❌ - устарел
- COMPOSITION_SETUP.md ❌ - устарел
- PRESENTATION_SETUP.md ❌ - устарел
- SPECIFICATION_SETUP.md ❌ - не используем активно
- INFRASTRUCTURE_ERRORS.md ❌ - устарел
- VALIDATION_EXAMPLES.md ❌ - устарел

**Дубликаты:**
- README_OLD.md ❌ - удалить
- README_NEW.md ❌ - пустой, удалить

---

## 🎯 План миграции

### Этап 1: Перенос legacy файлов

**Перенести в .temp/docs-old/error-handling/:**
- ERROR_HANDLING.md
- ERROR_CLASSIFIER_REFERENCE.md
- VALIDATION_EVOLUTION.md (оставить как историю)

**Перенести в .temp/steps-old/step_1/:**
- APPLICATION_LAYER_SETUP.md
- DOMAIN_LAYER_SETUP.md
- INFRASTRUCTURE_SETUP.md
- COMPOSITION_SETUP.md
- PRESENTATION_SETUP.md
- SPECIFICATION_SETUP.md
- INFRASTRUCTURE_ERRORS.md
- VALIDATION_EXAMPLES.md
- README_OLD.md
- README_NEW.md (пустой)

### Этап 2: Создать актуальную документацию

**docs/patterns/**
- PIPELINE.md ✅ (уже создан)

**docs/error-handling/**
- README.md - обновить (убрать ссылки на legacy)
- BASE_HANDLERS_REFERENCE.md - переписать с Pipeline подходом
- PIPELINE_HANDLERS_GUIDE.md - новый документ

**steps/step_1/**
- README.md - обновить (Pipeline подход)
- PIPELINE_SETUP.md - новый документ
- APPLICATION_LAYER_WITH_PIPELINE.md - новый документ
- DOMAIN_LAYER_PRACTICAL.md - практическое руководство
- INFRASTRUCTURE_PRACTICAL.md - практическое руководство

### Этап 3: Создать Quick Start

**docs/QUICK_START.md** - пошаговое руководство:
1. Validation API setup
2. Errors setup
3. Domain Layer (Value Objects + Aggregates)
4. Application Layer (Pipeline Handlers)
5. Infrastructure Layer (Repository)
6. Presentation Layer (React Router)

---

## 📝 Структура новой документации

```
docs/
├── QUICK_START.md                    # Новое - quick start
├── PROJECT_STRUCTURE.md              # Актуально
├── DDD_AND_CLEAN_ARCHITECTURE.md     # Актуально
├── DATA_FLOW.md                      # Актуально
├── QUERY_HANDLERS.md                 # Обновить (Pipeline)
├── COMMAND_BUS.md                    # Обновить (Pipeline)
│
├── patterns/
│   ├── README.md                     # Актуально
│   ├── PIPELINE.md                   # ✅ Создан
│   └── SPECIFICATION_PATTERN.md      # Актуально
│
└── error-handling/
    ├── README.md                     # Обновить (убрать legacy)
    ├── ERROR_ESCALATION.md           # Актуально ✅
    ├── ERROR_ESCALATION_EXTENDED.md  # Актуально ✅
    ├── INVARIANTS.md                 # Актуально ✅
    ├── BASE_HANDLERS_REFERENCE.md    # Переписать с Pipeline
    └── PIPELINE_HANDLERS_GUIDE.md    # Новое - практика

steps/
└── step_1/
    ├── README.md                     # Обновить (Pipeline)
    ├── VALIDATION_SETUP.md           # Актуально ✅
    ├── ERROR_SETUP.md                # Актуально ✅
    ├── PIPELINE_SETUP.md             # Новое
    ├── DOMAIN_LAYER_PRACTICAL.md     # Новое
    ├── APPLICATION_LAYER_PIPELINE.md # Новое
    └── INFRASTRUCTURE_PRACTICAL.md   # Новое
```

---

## ⏱️ Оценка времени

1. Перенос legacy: 15 мин
2. Обновление README.md: 30 мин
3. BASE_HANDLERS_REFERENCE.md: 1 час
4. PIPELINE_HANDLERS_GUIDE.md: 1.5 часа
5. QUICK_START.md: 2 часа
6. steps/step_1 переработка: 3 часа

**Итого:** ~8 часов полной работы

---

## 🚀 Следующие шаги

1. ✅ Создать структуру .temp/
2. Перенести legacy файлы
3. Обновить docs/error-handling/README.md
4. Создать docs/QUICK_START.md
5. Переписать BASE_HANDLERS_REFERENCE.md
6. Создать PIPELINE_HANDLERS_GUIDE.md
7. Переработать steps/step_1/

---

**Дата создания:** 2025-01-25  
**Статус:** В разработке
