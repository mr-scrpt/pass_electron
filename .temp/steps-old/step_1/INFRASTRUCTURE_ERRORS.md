# Infrastructure Errors - v2.0

Infrastructure errors используются в Infrastructure Layer (Repository, Services) для обозначения технических проблем.

> **📚 Детали:** [POLYMORPHIC_ERROR_SYSTEM.md](../../docs/error-handling/POLYMORPHIC_ERROR_SYSTEM.md) - Полная документация v2.0

---

## 🎯 Ключевой принцип v2.0

**Все Infrastructure errors implements `IError` с `isExpected(): false`**

```typescript
import type { IError } from '@/shared/errors';

export class NetworkError extends Error implements IError {
  isExpected() { return false; }      // ✅ Unexpected!
  getLogLevel() { return 'error'; }    // ✅ Логируем как error
  toUserError() { return new GenericApplicationError('...', this); }
}
```

**Преимущества:**
- ✅ Полиморфная обработка через `error.isExpected()` — БЕЗ `instanceof`
- ✅ Автоматическое логирование через `error.getLogLevel()`
- ✅ Трансформация через `error.toUserError()` — БЕЗ тернарников

---

## 📁 Структура

```
src/infrastructure/
└── errors/
    ├── NetworkError.ts      # Сетевые проблемы
    ├── StorageError.ts      # Проблемы хранилища
    ├── ApiError.ts          # Ошибки внешних API
    └── index.ts
```

---

## 🔴 Infrastructure Errors

### NetworkError [#class:NetworkError|#code]

**Файл:** `src/infrastructure/errors/NetworkError.ts`

```typescript
import type { IError } from '@/shared/errors';
import { GenericApplicationError } from '@/application/errors';

export class NetworkError extends Error implements IError {
  private readonly _message: string;
  private readonly _context?: Record<string, unknown>;
  readonly cause?: Error;

  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NetworkError';
    this._message = message;
    this.cause = cause;
    this._context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ============================================
  // IError interface methods
  // ============================================

  getMessage(): string {
    return `Network error: ${this._message}`;
  }

  getCode(): string {
    return 'NETWORK_ERROR';
  }

  getContext(): Record<string, unknown> {
    return {
      cause: this.cause?.message,
      stack: this.cause?.stack,
      ...this._context,
    };
  }

  isExpected(): boolean {
    return false;  // ✅ Infrastructure = unexpected
  }

  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error';  // ✅ Логируем как error
  }

  toUserError(): IError {
    return new GenericApplicationError(
      'Service temporarily unavailable',
      this
    );
  }
}
```

**Использование:**
```typescript
import { NetworkError } from '@/infrastructure/errors';
import { invalid } from '@/shared/validation';

// В Repository/Service
try {
  const response = await fetch(url);
} catch (error) {
  return invalid([
    new NetworkError(
      'Failed to connect to server',
      error as Error,
      { url, timeout }
    )
  ]);
}
```

### StorageError [#class:StorageError|#code]

**Файл:** `src/infrastructure/errors/StorageError.ts`

```typescript
import type { IError } from '@/shared/errors';
import { GenericApplicationError } from '@/application/errors';

export class StorageError extends Error implements IError {
  private readonly _message: string;
  private readonly _context?: Record<string, unknown>;
  readonly cause?: Error;

  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'StorageError';
    this._message = message;
    this.cause = cause;
    this._context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  getMessage(): string {
    return `Storage error: ${this._message}`;
  }

  getCode(): string {
    return 'STORAGE_ERROR';
  }

  getContext(): Record<string, unknown> {
    return {
      cause: this.cause?.message,
      stack: this.cause?.stack,
      ...this._context,
    };
  }

  isExpected(): boolean {
    return false;
  }

  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error';
  }

  toUserError(): IError {
    return new GenericApplicationError(
      'Data access problem. Please try again.',
      this
    );
  }
}
```

**Использование:**
```typescript
import { StorageError } from '@/infrastructure/errors';

// В Repository
try {
  await fs.writeFile(path, data);
} catch (error) {
  return invalid([
    new StorageError(
      'Failed to write to file',
      error as Error,
      { path }
    )
  ]);
}
```

### ApiError [#class:ApiError|#code]

**Файл:** `src/infrastructure/errors/ApiError.ts`

```typescript
import type { IError } from '@/shared/errors';
import { GenericApplicationError } from '@/application/errors';

export class ApiError extends Error implements IError {
  private readonly _message: string;
  private readonly _context?: Record<string, unknown>;
  public readonly statusCode?: number;
  readonly cause?: Error;

  constructor(
    message: string,
    statusCode?: number,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this._message = message;
    this.statusCode = statusCode;
    this.cause = cause;
    this._context = { ...context, statusCode };

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  getMessage(): string {
    return `API error: ${this._message} (${this.statusCode})`;
  }

  getCode(): string {
    return 'API_ERROR';
  }

  getContext(): Record<string, unknown> {
    return {
      statusCode: this.statusCode,
      cause: this.cause?.message,
      stack: this.cause?.stack,
      ...this._context,
    };
  }

  isExpected(): boolean {
    return false;
  }

  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error';
  }

  toUserError(): IError {
    return new GenericApplicationError(
      'External service error. Please try again later.',
      this
    );
  }
}
```

**Использование:**
```typescript
import { ApiError } from '@/infrastructure/errors';

// В Service/Repository
if (!response.ok && response.status >= 500) {
  return invalid([
    new ApiError(
      `API error: ${response.statusText}`,
      response.status,
      undefined,
      { url, method }
    )
  ]);
}
```

---

## ⚙️ Полиморфная классификация v2.0

**Классификация через методы IError:**

```typescript
const errors: IError[] = [
  new NetworkError('Connection failed'),
  new StorageError('Disk full'),
  new InvariantViolationError('...'),  // Domain error
];

// ✅ Полиморфно - БЕЗ instanceof!
errors.forEach(error => {
  if (!error.isExpected()) {
    // Infrastructure errors
    logger.log(error.getLogLevel(), error.getMessage());
    const userError = error.toUserError();  // Трансформируем
  }
});
```

**Преимущества:**
- ✅ БЕЗ `instanceof` проверок
- ✅ БЕЗ `switch/case` на кодах
- ✅ Типобезопасно - компилятор проверяет

---

## 🔄 Обработка в Application Layer v2.0

**Полиморфная обработка через tapLeft:**

```typescript
import { tapLeft } from '@/shared/validation';
import type { IError } from '@/shared/errors';

// В Handler
return (await this.repository.findAll())
  // ✅ Side effect - логирование
  .mapLeft(tapLeft((errors: IError[]) => 
    errors.forEach(error => 
      this.logger.log(
        error.getLogLevel(),    // Полиморфно!
        error.getMessage(), 
        error.getContext()
      )
    )
  ))
  // ✅ Трансформация
  .mapLeft(errors => 
    errors.map(error => error.toUserError())  // Полиморфно!
  );
```

**Преимущества:**
- ✅ БЕЗ тернарников - только методы
- ✅ Монадный подход - `tapLeft` для side effects
- ✅ Функциональная композиция

**Что происходит:**
1. Repository возвращает `Validation<IError[], Data>`
2. `tapLeft` логирует ошибки полиморфно
3. `mapLeft` трансформирует unexpected → GenericApplicationError
4. Expected (доменные) остаются как есть

---

## 📋 IError методы Infrastructure Errors

| Метод | Значение | Зачем |
|--------|----------|-------|
| `getCode()` | `'NETWORK_ERROR'`, `'STORAGE_ERROR'`, `'API_ERROR'` | Программная обработка |
| `isExpected()` | `false` | ✅ Unexpected - скрываем от пользователя |
| `getLogLevel()` | `'error'` | Критическая проблема - error level |
| `getContext()` | `Record<string, unknown>` | Дополнительные данные для логов |
| `getMessage()` | Техническое сообщение | Для логов |
| `toUserError()` | `GenericApplicationError` | Трансформация в generic message |

---

## ✅ Правила v2.0

1. **Всегда implements IError**
   - Для полиморфной обработки

2. **isExpected(): false**
   - Infrastructure errors - это unexpected
   - Скрываем от пользователя

3. **getLogLevel(): 'error'**
   - Критические проблемы - error level

4. **toUserError()**
   - Возвращаем GenericApplicationError
   - Детали скрыты

5. **Возвращаем через invalid()**
   ```typescript
   return invalid([new NetworkError(...)]);
   ```

6. **Application Layer обрабатывает полиморфно**
   ```typescript
   .mapLeft(errors => errors.map(error => error.toUserError()))
   ```

---

## 🔍 Отличие от Domain Errors v2.0

| Аспект | Domain Errors | Infrastructure Errors |
|--------|---------------|----------------------|
| **Базовый класс** | `extends BaseError implements IError` | `extends Error implements IError` |
| **isExpected()** | `true` | `false` |
| **getLogLevel()** | `'info'` | `'error'` |
| **toUserError()** | `return this` (показываем) | `return new GenericApplicationError(...)` |
| **Логирование** | info level | ✅ error level |
| **Показываем пользователю** | ✅ Как есть | ❌ Generic message |

---

## 📚 Связанные документы

- ⭐ [POLYMORPHIC_ERROR_SYSTEM.md](../../docs/error-handling/POLYMORPHIC_ERROR_SYSTEM.md) - Полная документация v2.0
- [ERROR_SETUP.md](./ERROR_SETUP.md) - IError интерфейс и BaseError
- [ERROR_HANDLING.md](../../docs/error-handling/ERROR_HANDLING.md) - Иерархия ошибок (Legacy)
