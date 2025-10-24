# Error Handling - Обработка ошибок

Этот раздел содержит полную документацию по обработке ошибок, валидации и инвариантам в проекте.

---

## 📚 Содержание

### 1. **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация

Документ описывает:
- Что такое инварианты в DDD
- Где они живут (Value Objects, Aggregates)
- Паттерн Shared Kernel для переиспользуемых правил валидации
- Примеры: `UuidInvariant` (shared), `NamespaceInvariant` (resource), `ResourceNameInvariant` (resource)
- Интеграция с `InvariantViolationError`

**Ключевые концепции:**
- Fail Fast — валидация при создании
- DRY — переиспользуемые инварианты
- Type Safety — компилятор проверяет

**Начни с этого документа**, если нужно понять как работает валидация в Domain Layer.

---

### 1.5 **[SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md)** — Specification Pattern для валидации ⭐

Документ описывает:
- **Specification Pattern** для валидации БЕЗ if-ов
- Библиотека переиспользуемых спецификаций (`NotEmptySpec`, `LengthRangeSpec`, `PatternSpec`)
- Композиция спецификаций (`CompositeSpecification.allOf`)
- Два режима: fail-fast и accumulate (все ошибки)
- Примеры для `Namespace`, `ResourceName`, `ResourceId`
- Кастомные бизнес-спецификации

**Ключевые преимущества:**
- ✅ Декларативно — читается как бизнес-правила
- ✅ Переиспользуемо — спецификации используются везде
- ✅ Тестируемо — каждая спецификация тестируется отдельно
- ✅ БЕЗ if-ов — чистый функциональный стиль

**Читай этот документ**, чтобы понять как избавиться от if-ов в валидации.

> 📖 **Теория:** См. [../patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md) для полного описания паттерна

---

### 2. **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Иерархия ошибок

Документ описывает:
- Разделение ошибок по архитектурным слоям
- **Domain Errors**: `InvariantViolationError`, `NotFoundError`, `DuplicateError`, `InvalidOperationError`
- **Application Errors**: `ValidationError`, `CommandError`, `QueryError`
- **Infrastructure Errors**: `NetworkError`, `ApiError`, `StorageError`
- Преобразование ошибок на границах слоев (Infrastructure → Domain)
- Обработка в Presentation Layer

**Ключевые принципы:**
- Ошибки следуют архитектурным границам
- Domain ошибки — часть Ubiquitous Language
- Infrastructure ошибки преобразуются в Domain на границе

**Читай этот документ**, чтобы понять какие ошибки в каком слое должны быть.

---

### 3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок через Either Pattern

Документ описывает:
- Проблемы традиционного `try-catch` подхода (Try-Catch Hell)
- **@sweet-monads/either** — Either монада (рекомендуется!) ⭐
- `mergeInMany` — накопление ВСЕХ ошибок валидации
- `mapLeft` — трансформация ошибок между слоями
- План миграции

**Ключевые концепции:**
- Type-safe обработка ошибок
- Railway-oriented programming
- Ошибки как часть сигнатуры типа
- Накопление всех ошибок (уникально!)

**Читай этот документ**, чтобы понять как избавиться от `try-catch` и сделать обработку ошибок type-safe.

---

### 4. **[ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md)** — Детальное сравнение библиотек

Расширенный документ с полным сравнением:
- Что такое монады и как они работают
- Result vs Either — в чем разница
- **@sweet-monads/either** (Either монада, Haskell-style) — РЕКОМЕНДУЕТСЯ ⭐
- **neverthrow** (Result монада, Rust-style)
- **fp-ts** (полная экосистема монад)
- Детальная таблица сравнения всех библиотек
- Когда какую библиотеку использовать

**Почему @sweet-monads/either:**
- `mergeInMany` — накопление ВСЕХ ошибок (идеально для форм!)
- `mapLeft` — трансформация ошибок между слоями
- `asyncChain`/`asyncMap` — встроены
- Right/Left терминология (Haskell)

**Читай этот документ**, если нужно глубоко понять различия между библиотеками для принятия решения.

---

### 4.5 **[VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md)** — Эволюция подхода к валидации ⭐

Документ показывает:
- **Полный путь развития** от try-catch к монадам и Specification Pattern
- **Этап 1:** Try-Catch Hell (проблемы instanceof, вложенность)
- **Этап 2:** Either Pattern (монады, mapLeft, type-safe)
- **Этап 3:** Specification Pattern (без if-ов, переиспользуемо)
- **Полные примеры** эскалации через все слои архитектуры
- Сравнительная таблица всех подходов

**Ключевые преимущества:**
- ✅ Показывает **почему** мы перешли на монады
- ✅ Показывает **почему** мы перешли на Specification Pattern
- ✅ Полные примеры кода на каждом этапе
- ✅ Показывает эскалацию через Infrastructure → Domain → Application → Presentation

**Читай этот документ**, чтобы понять полный путь эволюции подхода к валидации и обработке ошибок.

---

## 🎯 Рекомендуемый порядок изучения

### Для начинающих:
1. **[INVARIANTS.md](./INVARIANTS.md)** — понять валидацию в DDD
2. **[VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md)** — понять эволюцию подхода ⭐
3. **[SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md)** — Specification Pattern
4. **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — иерархия ошибок
5. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Either Pattern

### Для опытных:
1. **[VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md)** — полный путь от try-catch к Specification ⭐
2. **[SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md)** — детали Specification Pattern
3. **[ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md)** — сравнение монад
4. **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — архитектурные правила

---

## 💡 Ключевые правила проекта

### 1. Валидация через Specification Pattern (рекомендуется) ⭐
```typescript
// ✅ ОТЛИЧНО: Specification Pattern - БЕЗ if-ов!
class Namespace {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, Namespace> {
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec('Namespace'),
      new LengthRangeSpec(2, 50, 'Namespace'),
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
    )
    
    return spec.isSatisfiedBy(value).map(v => new Namespace(v))
  }
  
  getValue(): string {
    return this.value
  }
}
```

> 📖 См. [SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md) для деталей

### 2. Альтернатива: Инварианты (классический подход)
```typescript
// ✅ ХОРОШО: Self-validating Value Object через инварианты
class ResourceName {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<ValidationError[], ResourceName> {
    return ResourceNameInvariant.instance
      .validate(value, 'ResourceName')
      .map((validValue: string) => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

> 📖 См. [INVARIANTS.md](./INVARIANTS.md) для деталей

### 3. Ошибки по слоям
```typescript
// Domain Layer
class InvariantViolationError extends DomainError { }

// Application Layer  
class ValidationError extends Error { }

// Infrastructure Layer
class NetworkError extends Error { }
```

### 4. Either для type-safe обработки
```typescript
// ✅ ХОРОШО: Either делает ошибки явными
function findUser(id: string): Either<NotFoundError, User> {
  // Компилятор заставит обработать NotFoundError!
  // ⚠️ Порядок: Either<Error, Success>
}
```

---

## 🔗 Связанные документы

- **[../DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Value Objects и Entities
- **[../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** — Структура Domain Layer
- **[../contracts/domain-types.md](../contracts/domain-types.md)** — Контракты доменных типов
- **[../../steps/step_1/README.md](../../steps/step_1/README.md)** — Реализация Value Objects (Step 1)

---

**💡 Совет**: Начни с INVARIANTS.md, чтобы понять основы, затем переходи к ERROR_HANDLING.md и ERROR_ESCALATION.md!
