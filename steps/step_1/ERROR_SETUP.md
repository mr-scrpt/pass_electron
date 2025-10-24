# Error Setup (Shared Layer)

> **Назад:** [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)  
> **Далее:** [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)

---

## 🎯 Цель

Создать базовый класс ошибок **BaseError** для всего приложения. Все остальные ошибки (Domain, Application, Infrastructure) будут наследоваться от него.

> **📚 Детали**: [ERROR_HANDLING.md](../../docs/ERROR_HANDLING.md) - Иерархия ошибок

---

## Зачем единый базовый класс?

**Проблема без базового класса:**
- ❌ Каждый слой создает свои ошибки по-разному
- ❌ Нет единой структуры для логирования
- ❌ Сложно обрабатывать ошибки на границах слоев
- ❌ Нет поддержки цепочек ошибок (error chaining)

**Решение - BaseError:**
- ✅ Единая структура для ВСЕХ типов ошибок
- ✅ Поддержка контекста и метаданных
- ✅ Поддержка error chaining (вложенные ошибки)
- ✅ Timestamp для логирования
- ✅ Error codes для категоризации
- ✅ JSON сериализация для API/логов

---

## 0.6. Создать BaseError

**Файл: `src/shared/errors/BaseError.ts`**

### BaseError [#class:BaseError|#code|#structure:path]

```typescript
// src/shared/errors/BaseError.ts

/**
 * Базовый класс для ВСЕХ ошибок приложения
 * 
 * Используется как основа для:
 * - Domain errors (InvariantViolationError, NotFoundError, etc.)
 * - Application errors (CommandError, QueryError, etc.)
 * - Infrastructure errors (NetworkError, FileSystemError, etc.)
 * - Unexpected errors (системные, непредвиденные)
 * 
 * @property entityType - тип сущности или компонента где произошла ошибка
 * @property message - человекочитаемое описание ошибки
 * @property code - опциональный код ошибки (для категоризации)
 * @property context - опциональный контекст (дополнительные данные)
 * @property cause - опциональная причина (вложенная ошибка)
 */
export class BaseError extends Error {
  public readonly timestamp: Date
  
  constructor(
    public readonly entityType: string,
    message: string,
    public readonly code?: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'BaseError'
    this.timestamp = new Date()
    
    // Сохраняем stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
    
    // Сохраняем причину (для цепочки ошибок)
    if (cause && 'cause' in Error.prototype) {
      // @ts-ignore - ES2022 feature
      this.cause = cause
    }
  }
  
  /**
   * Получить полное описание ошибки включая контекст
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      entityType: this.entityType,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause instanceof BaseError ? this.cause.toJSON() : this.cause?.message
    }
  }
  
  /**
   * Краткое представление для логов
   */
  toString(): string {
    const parts = [this.name, `[${this.entityType}]`, this.message]
    if (this.code) parts.push(`(${this.code})`)
    return parts.join(' ')
  }
}
```

**Особенности BaseError:**
- ✅ `entityType` - контекст где произошла ошибка (ResourceId, Namespace, Repository, etc.)
- ✅ `code` - код для категоризации ('INVARIANT_VIOLATION', 'NOT_FOUND', 'DUPLICATE', etc.)
- ✅ `context` - дополнительные данные для debugging
- ✅ `cause` - вложенная ошибка (error chaining)
- ✅ `timestamp` - время возникновения
- ✅ `toJSON()` - сериализация для API/логов
- ✅ `toString()` - краткий формат для консоли

**Примеры использования:**

```typescript
// Простая ошибка валидации (используется в спецификациях)
throw new BaseError('ResourceId', 'Invalid UUID format')

// Ошибка с кодом
throw new BaseError('Namespace', 'must be lowercase', 'INVALID_FORMAT')

// Ошибка с контекстом
throw new BaseError(
  'Resource',
  'Cannot add more than 20 fields',
  'LIMIT_EXCEEDED',
  { currentCount: 20, attemptedToAdd: 1 }
)

// Ошибка с причиной (error chaining)
try {
  await saveToDatabase(resource)
} catch (err) {
  throw new BaseError(
    'ResourceRepository',
    'Failed to save resource',
    'PERSISTENCE_ERROR',
    { resourceId: resource.id },
    err as Error  // ← вложенная ошибка
  )
}
```

---

## 0.7. Создать Public API для errors

**Файл: `src/shared/errors/index.ts`**

```typescript
// src/shared/errors/index.ts
export { BaseError } from './BaseError'
```

---

## 0.8. Обновить Shared Public API

**Файл: `src/shared/index.ts`**

```typescript
// src/shared/index.ts - Public API для Shared Utilities

// Validation API (фасад над @sweet-monads/either)
export type { Validation } from './validation'
export { valid, invalid, fromCondition, isTrue, ValidationCombinators } from './validation'

// Specification Pattern (технический интерфейс)
export type { ISpecification } from './specification'

// BaseError (технический - базовый класс для всех ошибок)
export { BaseError } from './errors'
```

---

## ✅ Результат

После выполнения этого шага у вас будет:

```
src/shared/
├── validation/
│   ├── Validation.ts              # Фасад над @sweet-monads/either
│   ├── ValidationCombinators.ts   # accumulate, sequence
│   ├── helpers.ts                 # isTrue fluent API
│   └── index.ts
│
└── errors/                        # ← НОВОЕ
    ├── BaseError.ts               # Базовый класс для ВСЕХ ошибок
    └── index.ts                   # Public API
```

**Иерархия ошибок (будущая):**

```
BaseError (shared/errors/) - базовый для ВСЕХ
  │
  ├── InvariantViolationError (domain/shared/errors/) - Step 3
  ├── NotFoundError (domain/shared/errors/) - Step 3
  ├── DuplicateError (domain/shared/errors/) - Step 3
  ├── InvalidOperationError (domain/shared/errors/) - Step 3
  │
  ├── NetworkError (infrastructure/errors/) - будущее
  └── FileSystemError (infrastructure/errors/) - будущее
```

**Почему BaseError создается до спецификаций?**
- ✅ Спецификации используют BaseError для ошибок валидации
- ✅ Инварианты используют BaseError
- ✅ Domain Errors наследуются от BaseError
- ✅ Единая основа для всего приложения

**Что дальше?**

Теперь можно создавать спецификации используя BaseError! → [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)

---

> **Назад:** [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)  
> **Далее:** [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)
