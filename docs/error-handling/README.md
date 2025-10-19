# Обработка ошибок (Error Handling)

Этот раздел содержит полную документацию по обработке ошибок, валидации и инвариантам в проекте.

---

## 📚 Содержание

### 1. **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация

Документ описывает:
- Что такое инварианты в DDD
- Где они живут (Value Objects, Aggregates)
- Паттерн Shared Kernel для переиспользуемых правил валидации
- Примеры: `UuidInvariant`, `StringInvariant`, `EmailInvariant`
- Интеграция с `InvariantViolationError`

**Ключевые концепции:**
- Fail Fast — валидация при создании
- DRY — переиспользуемые инварианты
- Type Safety — компилятор проверяет

**Начни с этого документа**, если нужно понять как работает валидация в Domain Layer.

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

### 3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок через Result Pattern

Документ описывает:
- Проблемы традиционного `try-catch` подхода (Try-Catch Hell)
- **Result Pattern** (нативный TypeScript) — без библиотек
- **neverthrow** — Result монада (рекомендуется!)
- **fp-ts** — академическое функциональное программирование
- Гибридный подход для нашего проекта
- План миграции

**Ключевые концепции:**
- Type-safe обработка ошибок
- Railway-oriented programming
- Ошибки как часть сигнатуры типа

**Читай этот документ**, чтобы понять как избавиться от `try-catch` и сделать обработку ошибок type-safe.

---

### 4. **[ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md)** — Детальное сравнение библиотек

Расширенный документ с полным сравнением:
- Что такое монады и как они работают
- Result vs Either — в чем разница
- **neverthrow** (Result монада, Rust-style)
- **@sweet-monads/either** (Either монада, Haskell-style) с примерами
- **fp-ts** (полная экосистема монад)
- Детальная таблица сравнения всех библиотек
- Когда какую библиотеку использовать

**Особенности @sweet-monads/either:**
- `mergeInMany` — накопление ВСЕХ ошибок (идеально для форм!)
- `mapLeft` — трансформация ошибок
- Right/Left терминология (Haskell)

**Читай этот документ**, если нужно глубоко понять различия между библиотеками для принятия решения.

---

## 🎯 Рекомендуемый порядок изучения

### Для начинающих:
1. **INVARIANTS.md** — понять валидацию
2. **ERROR_HANDLING.md** — понять иерархию ошибок
3. **ERROR_ESCALATION.md** — понять Result Pattern и neverthrow

### Для опытных:
1. **ERROR_ESCALATION_EXTENDED.md** — детальное сравнение монад
2. **ERROR_HANDLING.md** — архитектурные правила
3. **INVARIANTS.md** — паттерны переиспользования

---

## 💡 Ключевые правила проекта

### 1. Инварианты в Domain Layer
```typescript
// ✅ ХОРОШО: Self-validating Value Object
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .andThen(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, 'ResourceName')
      )
      .map(validValue => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

### 2. Ошибки по слоям
```typescript
// Domain Layer
class InvariantViolationError extends DomainError { }

// Application Layer  
class ValidationError extends Error { }

// Infrastructure Layer
class NetworkError extends Error { }
```

### 3. Result для type-safe обработки
```typescript
// ✅ ХОРОШО: Result делает ошибки явными
function findUser(id: string): Result<User, NotFoundError> {
  // Компилятор заставит обработать NotFoundError!
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
