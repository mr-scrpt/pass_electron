# Error Setup (Shared Layer) - v2.0

> **Назад:** [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)  
> **Далее:** [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)

---

## 🎯 Цель

Создать **полиморфную систему ошибок** через интерфейс `IError` и базовый класс `BaseError` для Domain errors.

> **📚 Детали**: [POLYMORPHIC_ERROR_SYSTEM.md](../../docs/error-handling/POLYMORPHIC_ERROR_SYSTEM.md) - Полная документация v2.0

---

## Зачем полиморфная система?

**Проблема с традиционным подходом:**
- ❌ `instanceof` проверки везде
- ❌ `switch/case` на кодах ошибок
- ❌ Тернарники для логирования и трансформации
- ❌ Хрупкая поддержка (забыл добавить case → баг)

**Решение - IError полиморфизм:**
- ✅ Работа через методы интерфейса (`getMessage()`, `getLogLevel()`, `toUserError()`)
- ✅ БЕЗ `instanceof`, БЕЗ `switch/case`, БЕЗ тернарников
- ✅ Каждый слой — свои ошибки, но работают одинаково
- ✅ Type Safety — компилятор проверяет
- ✅ Монадный подход (`tapLeft`, `mapLeft`)

---

## 0.6. Создать IError интерфейс

**Файл: `src/shared/errors/IError.ts`**

### IError [#interface:IError|#code]

```typescript
// src/shared/errors/IError.ts

/**
 * Минимальный интерфейс для всех ошибок в приложении
 * Технические методы без Application концепций
 */
export interface IError {
  /**
   * Техническое сообщение об ошибке
   */
  getMessage(): string;

  /**
   * Уникальный код ошибки для категоризации
   */
  getCode(): string;

  /**
   * Контекст ошибки для отладки
   */
  getContext(): Record<string, unknown>;

  /**
   * Является ли ошибка ожидаемой (expected) или неожиданной (unexpected)
   * - true: Domain errors, Validation errors (показываем пользователю)
   * - false: Infrastructure errors, Bugs (скрываем, логируем)
   */
  isExpected(): boolean;

  /**
   * Уровень логирования для этой ошибки
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug';

  /**
   * Трансформация ошибки для показа пользователю
   * Expected errors возвращают себя
   * Unexpected errors возвращают generic ошибку
   */
  toUserError(): IError;
}
```

---

## 0.7. Создать BaseError

**Файл: `src/shared/errors/BaseError.ts`**

### BaseError [#class:BaseError|#code]

```typescript
// src/shared/errors/BaseError.ts
import type { IError } from './IError';

/**
 * Параметры для создания BaseError
 * Используем именованные поля для предотвращения ошибок с порядком параметров
 */
export interface BaseErrorProps {
  readonly entityType: string;
  readonly message: string;
  readonly code: string;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error;
}

/**
 * Базовый класс для ошибок приложения
 *
 * Используется как основа для Domain errors
 * Infrastructure errors НЕ используют BaseError (имплементируют IError напрямую)
 *
 * @property entityType - тип сущности или компонента где произошла ошибка
 * @property message - человекочитаемое описание ошибки
 * @property code - код ошибки (для категоризации)
 * @property context - контекст (дополнительные данные)
 * @property cause - причина (вложенная ошибка)
 */
export class BaseError extends Error implements IError {
  public readonly timestamp: Date;
  public readonly entityType: string;
  private readonly _message: string;
  private readonly _code: string;
  private readonly _context?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(props: BaseErrorProps) {
    super(props.message);
    this.name = "BaseError";
    this.timestamp = new Date();
    this.entityType = props.entityType;
    this._message = props.message;
    this._code = props.code;
    this._context = props.context;
    this.cause = props.cause;

    // Сохраняем stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Сохраняем причину (для цепочки ошибок)
    if (props.cause && "cause" in Error.prototype) {
      this.cause = props.cause;
    }
  }

  // ============================================
  // IError interface methods
  // ============================================

  getMessage(): string {
    return `[${this.entityType}] ${this._message}`;
  }

  getCode(): string {
    return this._code;
  }

  getContext(): Record<string, unknown> {
    return {
      entityType: this.entityType,
      timestamp: this.timestamp.toISOString(),
      ...this._context,
    };
  }

  /**
   * BaseError используется для Domain errors
   * Domain errors всегда ожидаемые (expected)
   */
  isExpected(): boolean {
    return true;
  }

  /**
   * Domain errors логируем как info
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'info';
  }

  /**
   * Domain errors показываем пользователю как есть
   */
  toUserError(): IError {
    return this;
  }

  // ============================================
  // Utility methods
  // ============================================

  /**
   * Для обратной совместимости
   */
  get code(): string {
    return this._code;
  }

  get context(): Record<string, unknown> | undefined {
    return this._context;
  }

  /**
   * Получить полное описание ошибки включая контекст
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      entityType: this.entityType,
      message: this._message,
      code: this._code,
      context: this._context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause:
        this.cause instanceof BaseError
          ? this.cause.toJSON()
          : this.cause?.message,
    };
  }

  /**
   * Краткое представление для логов
   */
  toString(): string {
    const parts = [this.name, `[${this.entityType}]`, this._message];
    if (this._code) parts.push(`(${this._code})`);
    return parts.join(" ");
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
// 1. Простая ошибка валидации (в спецификациях)
import { invalid } from '@/shared/validation'
import { BaseError } from '@/shared/errors'

// В спецификации
isSatisfiedBy(value: string): Validation<BaseError, string> {
  return value.length > 0
    ? valid(value)
    : invalid(new BaseError('ResourceId', 'Invalid UUID format'))
}

// 2. Ошибка с кодом (для категоризации)
return invalid(
  new BaseError('Namespace', 'must be lowercase', 'INVALID_FORMAT')
)

// 3. Ошибка с контекстом (для debugging)
return invalid(
  new BaseError(
    'Resource',
    'Cannot add more than 20 fields',
    'LIMIT_EXCEEDED',
    { currentCount: 20, attemptedToAdd: 1 }
  )
)

// 4. Накопление нескольких ошибок (Railway-oriented programming)
const namespaceResult = Namespace.create(data.namespace)  // Validation<BaseError[], Namespace>
const nameResult = ResourceName.create(data.name)         // Validation<BaseError[], ResourceName>

return ValidationCombinators.sequence(
  [namespaceResult, nameResult],
  ([ns, name]) => new Resource(id, ns, name)
)
// Если обе проверки провалились - вернутся ОБЕ ошибки BaseError[]
```

> ⚠️ **Важно**: В нашем приложении используется **Railway-oriented programming** с монадами `Validation<E, T>`.  
> Мы **НЕ используем** `try-catch` и `throw` для бизнес-логики!

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
