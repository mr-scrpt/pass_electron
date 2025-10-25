# Анализ системы ошибок на соответствие DDD и Clean Architecture

## 🎯 Цель анализа

Проверить соответствие текущей системы ошибок принципам:
- **Domain-Driven Design** (Eric Evans)
- **Clean Architecture** (Uncle Bob)
- **Dependency Rule** - зависимости направлены к Domain
- **Shared Kernel vs Shared Utilities** - разделение бизнес-логики и технических утилит

---

## 📋 Текущее состояние

### Структура файлов ошибок

```
src/
├── shared/                              # ⚠️ Shared Utilities (технический слой)
│   └── errors/
│       ├── AppError.ts                  # ❌ interface AppError - Application концепция!
│       ├── BaseError.ts                 # ⚠️ implements AppError
│       ├── ErrorClassifier.ts           # ✅ Утилита (технический)
│       ├── ValidationError.ts           # ⚠️ extends BaseError
│       └── index.ts
│
├── domain/
│   └── shared/                          # ✅ Shared Kernel (DDD - бизнес-логика)
│       └── errors/
│           ├── InvariantViolationError.ts  # ⚠️ extends BaseError (→ AppError)
│           ├── NotFoundError.ts            # ⚠️ extends BaseError (→ AppError)
│           ├── DuplicateError.ts           # ⚠️ extends BaseError (→ AppError)
│           ├── InvalidOperationError.ts    # ⚠️ extends BaseError (→ AppError)
│           └── index.ts
│
├── application/
│   └── errors/
│       ├── GenericApplicationError.ts   # ✅ implements AppError
│       ├── CommandValidationError.ts    # ✅ implements AppError
│       └── index.ts
│
└── infrastructure/
    └── errors/
        ├── NetworkError.ts              # ✅ implements AppError
        ├── StorageError.ts              # ✅ implements AppError
        ├── ApiError.ts                  # ✅ implements AppError
        └── index.ts
```

---

## 🔴 ПРОБЛЕМЫ: Нарушения архитектурных границ

### Проблема #1: AppError в Shared Utilities ❌ КРИТИЧНО

**Текущее:**
```typescript
// src/shared/errors/AppError.ts
export interface AppError extends Error {
  readonly code: string;
  readonly isOperational: boolean;  // ⚠️ Application/Infrastructure концепция!
  readonly severity: 'low' | 'medium' | 'high';
}
```

**Почему это проблема:**

1. **`src/shared/` - НЕ бизнес-логика!**
   - По документации `PROJECT_STRUCTURE.md` (строки 488-573):
   - `src/shared/` = **Shared Utilities** (framework-agnostic утилиты)
   - `src/domain/shared/` = **Shared Kernel** (DDD - бизнес-логика)

2. **`AppError` - это Application/Infrastructure концепция!**
   - `isOperational` используется в `ErrorClassifier` для разделения operational vs infrastructure errors
   - Это логика **Application Layer**, а не shared утилита
   - Domain НЕ должен знать о концепции "operational vs infrastructure"

3. **Нарушение Dependency Rule:**
   ```
   Domain errors → extends BaseError → implements AppError
   
   Domain зависит от Application концепции! ❌
   ```

**Согласно документации:**

`ARCHITECTURE_BOUNDARIES.md` (строки 24-29):
```markdown
### 4. Shared Utilities 🔧
- **Роль**: Framework-agnostic утилиты (Validation API, Specification Pattern)
- **Зависимости**: Библиотеки-утилиты (`@sweet-monads/either`, `lodash`)
- **Экспорты**: Validation API, Specification Pattern, Type re-exports

**Примечание:** Это НЕ DDD слой! Это технические утилиты для изоляции от конкретных библиотек.
```

`PROJECT_STRUCTURE.md` (строки 556-561):
```markdown
**Правила:**
- ✅ **Только framework-agnostic утилиты** (не зависят от React, Express, etc.)
- ✅ **Не содержит бизнес-логики** (бизнес-логика в `src/domain/`)
- ❌ **Не должен зависеть от слоев архитектуры** (Domain, Application, Infrastructure)
```

**Вывод:** `AppError` НЕ должен быть в `src/shared/errors/`!

---

### Проблема #2: BaseError implements AppError ❌

**Текущее:**
```typescript
// src/shared/errors/BaseError.ts
export class BaseError extends Error implements AppError {
  readonly isOperational: boolean = true    // ⚠️ Application концепция!
  readonly severity: 'low' | 'medium' | 'high' = 'medium'
}

// src/domain/shared/errors/InvariantViolationError.ts
export class InvariantViolationError extends BaseError {
  // Автоматически становится AppError! ❌
}
```

**Почему это проблема:**

1. **Domain errors автоматически становятся AppError:**
   ```typescript
   InvariantViolationError extends BaseError implements AppError
   ```
   
   Domain errors получают `isOperational`, `severity` - Application концепции!

2. **Нарушение Dependency Inversion:**
   - Domain (внутренний слой) зависит от Application концепции (внешний слой)
   - Dependency Rule: зависимости должны идти К Domain, а НЕ ОТ Domain!

3. **Domain должен быть "чистым":**
   
   Из `ARCHITECTURE_DESIGN.md` (строки 533-547):
   ```markdown
   ### 3. Domain Layer
   
   **Правила:**
   - Не зависит от других слоев
   - Содержит всю бизнес-логику
   - Определяет интерфейсы для Infrastructure
   ```
   
   `ARCHITECTURE_BOUNDARIES.md` (строки 9-12):
   ```markdown
   ### 1. Domain Layer
   - **Роль**: Бизнес-логика, инварианты, доменные события
   - **Зависимости**: Shared (framework-agnostic утилиты)
   - **Экспорты**: Entities, Value Objects, Domain Events, Domain Errors, Repository Interfaces
   ```

**Вывод:** Domain errors НЕ должны implements AppError!

---

### Проблема #3: Смешивание концепций ❌

**Текущая иерархия:**

```
BaseError (Shared, implements AppError)
├── Domain Errors (domain/shared/errors/)
│   ├── InvariantViolationError     → isOperational: true ⚠️
│   ├── NotFoundError                → isOperational: true ⚠️
│   ├── DuplicateError               → isOperational: true ⚠️
│   └── InvalidOperationError        → isOperational: true ⚠️
│
├── ValidationError (shared/errors/) → isOperational: true ⚠️
│
└── Application Errors (application/errors/)
    ├── GenericApplicationError      → isOperational: true ✅
    └── CommandValidationError       → isOperational: true ✅

Infrastructure Errors (infrastructure/errors/)
├── NetworkError                     → isOperational: false ✅
├── StorageError                     → isOperational: false ✅
└── ApiError                         → isOperational: false ✅
```

**Проблема:**
- Domain errors имеют `isOperational` - это **не доменная концепция**!
- `isOperational` используется `ErrorClassifier` для решения "показывать пользователю или нет"
- Это решение **Application Layer**, а НЕ Domain!

---

## ✅ ПРАВИЛЬНАЯ архитектура

### Принципы из документации

`ARCHITECTURE_DESIGN.md` (строки 76-82):
```markdown
### Ключевые принципы

- **Dependency Inversion** — зависимости направлены к Domain Layer
- **Event-Driven Communication** — модули общаются через события
- **Single Responsibility** — каждый модуль решает одну задачу
- **Interface Segregation** — узкие, специфичные интерфейсы
```

`ARCHITECTURE_BOUNDARIES.md` (строки 45-61):
```markdown
## 🔒 Правила импортов между слоями

| Из слоя \ В слой | Domain | Application | Infrastructure | Shared | Composition | Presentation |
|-----------------|--------|-------------|----------------|--------|-------------|--------------|
| **Domain** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Application** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Infrastructure** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Shared** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

**Ключевые правила:**
- ✅ **Shared** может использоваться **всеми слоями**
- ❌ **Shared** НЕ может импортировать из слоев архитектуры
```

---

### Решение #1: Разделить BaseError и AppError

**Идея:** 
- `BaseError` - чисто технический базовый класс (без `isOperational`, `severity`)
- `AppError` - интерфейс для Application/Infrastructure errors
- Domain errors extends BaseError (чистые!)
- Application/Infrastructure errors implements AppError

#### Новая структура

```typescript
// ============================================================
// src/shared/errors/BaseError.ts
// ✅ Чисто технический класс, БЕЗ Application концепций
// ============================================================
export interface BaseErrorProps {
  readonly entityType: string;
  readonly message: string;
  readonly code: string;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error;
}

export class BaseError extends Error {
  public readonly timestamp: Date;
  public readonly entityType: string;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(props: BaseErrorProps) {
    super(props.message);
    this.name = "BaseError";
    this.timestamp = new Date();
    this.entityType = props.entityType;
    this.code = props.code;
    this.context = props.context;
    this.cause = props.cause;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // ❌ НЕТ isOperational!
  // ❌ НЕТ severity!
}
```

```typescript
// ============================================================
// src/application/errors/AppError.ts
// ✅ Application концепция - переносим сюда!
// ============================================================
export interface AppError extends Error {
  readonly code: string;
  readonly isOperational: boolean;  // ✅ Application концепция
  readonly severity: 'low' | 'medium' | 'high';
  readonly context?: Record<string, unknown>;
  readonly cause?: Error;
}
```

```typescript
// ============================================================
// src/domain/shared/errors/InvariantViolationError.ts
// ✅ Чистая Domain ошибка, БЕЗ Application концепций
// ============================================================
import { BaseError } from '@/shared/errors';

export class InvariantViolationError extends BaseError {
  constructor(
    entityType: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super({
      entityType,
      message,
      code: 'INVARIANT_VIOLATION',
      context,
    });
    this.name = 'InvariantViolationError';
  }
  
  // ❌ НЕТ isOperational - это НЕ доменная концепция!
  // ❌ НЕТ severity - это НЕ доменная концепция!
}
```

```typescript
// ============================================================
// src/application/errors/GenericApplicationError.ts
// ✅ Application ошибка implements AppError
// ============================================================
import type { AppError } from './AppError';

export class GenericApplicationError extends Error implements AppError {
  readonly code = 'APPLICATION_ERROR';
  readonly isOperational = true;      // ✅ Application решает!
  readonly severity = 'medium' as const;
  readonly cause?: Error;
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, cause?: Error, context?: Record<string, unknown>) {
    super(message);
    this.name = 'GenericApplicationError';
    this.cause = cause;
    this.context = context;
  }
}
```

```typescript
// ============================================================
// src/infrastructure/errors/NetworkError.ts
// ✅ Infrastructure ошибка implements AppError
// ============================================================
import type { AppError } from '@/application/errors/AppError';

export class NetworkError extends Error implements AppError {
  readonly code = 'NETWORK_ERROR';
  readonly isOperational = false;     // ✅ Infrastructure решает!
  readonly severity = 'high' as const;
  readonly cause?: Error;
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, cause?: Error, context?: Record<string, unknown>) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
    this.context = context;
  }
}
```

---

### Решение #2: ErrorClassifier адаптирует Domain errors

**Идея:** Domain errors - чистые, Application Layer решает как их интерпретировать

```typescript
// ============================================================
// src/application/shared/ErrorClassifier.ts
// ✅ Application Layer решает: Domain error = operational
// ============================================================
import type { AppError } from '@/application/errors/AppError';
import { BaseError } from '@/shared/errors';

export class ErrorClassifier {
  
  /**
   * Классификация ошибок
   * Domain errors (BaseError) интерпретируются как operational
   */
  static classify(errors: Error[]): {
    operational: (AppError | BaseError)[];
    infrastructure: AppError[];
    unknown: Error[];
  } {
    const operational: (AppError | BaseError)[] = [];
    const infrastructure: AppError[] = [];
    const unknown: Error[] = [];

    for (const error of errors) {
      // ✅ Domain errors (BaseError) = operational (показываем пользователю)
      if (error instanceof BaseError) {
        operational.push(error);
        continue;
      }
      
      // Application/Infrastructure errors
      if (this.isAppError(error)) {
        if (error.isOperational) {
          operational.push(error);
        } else {
          infrastructure.push(error);
        }
        continue;
      }
      
      // Неизвестные ошибки
      unknown.push(error);
    }

    return { operational, infrastructure, unknown };
  }
  
  private static isAppError(error: Error): error is AppError {
    return (
      'code' in error &&
      'isOperational' in error &&
      'severity' in error &&
      typeof (error as any).isOperational === 'boolean'
    );
  }
}
```

**Логика:**
- **Domain errors** (`BaseError`) → `operational` (показываем пользователю) ✅
- **Application errors** с `isOperational: true` → `operational` ✅
- **Infrastructure errors** с `isOperational: false` → `infrastructure` (логируем, скрываем) ✅
- **Unknown errors** → `unknown` (логируем как critical) ✅

---

## 📊 Сравнение БЫЛО → СТАЛО

### БЫЛО (текущее) ❌

```
BaseError (shared, implements AppError)
  ↑
  ├─ InvariantViolationError    isOperational: true  ⚠️
  ├─ GenericApplicationError    isOperational: true  ✅
  └─ NetworkError               isOperational: false ✅

ПРОБЛЕМА:
- Domain зависит от Application концепции (AppError)
- Нарушение Dependency Rule
- BaseError "заражен" Application логикой
```

### СТАЛО (правильное) ✅

```
BaseError (shared, чистый технический класс)
  ↑
  └─ InvariantViolationError    ✅ Чистая Domain ошибка

AppError (application/errors/, интерфейс)
  ↑
  ├─ GenericApplicationError    isOperational: true  ✅
  └─ NetworkError               isOperational: false ✅

РЕШЕНИЕ:
- Domain errors чистые (только BaseError)
- Application/Infrastructure errors implements AppError
- ErrorClassifier адаптирует Domain errors → operational
- Dependency Rule соблюдается!
```

---

## 🎯 Соответствие документации

### ✅ Соответствует PROJECT_STRUCTURE.md

`PROJECT_STRUCTURE.md` (строки 234-256):
```markdown
└── shared/                                    
    ├── errors/                                
    │   ├── DomainError.ts                     # ✅ Базовые Domain Errors
    │   ├── InvariantViolationError.ts         # ✅ Чистая Domain ошибка
    │   ├── NotFoundError.ts                   # ✅ Чистая Domain ошибка
```

Наши Domain errors в `domain/shared/errors/` - **соответствует Shared Kernel (DDD)** ✅

---

### ✅ Соответствует ARCHITECTURE_BOUNDARIES.md

`ARCHITECTURE_BOUNDARIES.md` (строки 58-61):
```markdown
**Ключевые правила:**
- ✅ **Shared** может использоваться **всеми слоями**
- ❌ **Shared** НЕ может импортировать из слоев архитектуры
```

BaseError в `src/shared/errors/` - технический базовый класс, используется всеми ✅
AppError в `src/application/errors/` - Application концепция ✅

---

### ✅ Соответствует Dependency Rule

```
Presentation → Composition → Application → Domain
                              ↓
                         Infrastructure → Domain
                              ↓
                            Shared ← все слои
```

- Domain errors extends BaseError (Shared) ✅
- Application/Infrastructure errors implements AppError (Application) ✅
- Domain НЕ знает об AppError ✅
- ErrorClassifier (Application) адаптирует Domain errors ✅

---

## 🔧 Что нужно изменить

### Изменение #1: Убрать AppError из BaseError

```typescript
// БЫЛО:
export class BaseError extends Error implements AppError {
  readonly isOperational: boolean = true;
  readonly severity: 'low' | 'medium' | 'high' = 'medium';
}

// СТАЛО:
export class BaseError extends Error {
  // Только технические поля
  readonly timestamp: Date;
  readonly entityType: string;
  readonly code: string;
  // БЕЗ isOperational, БЕЗ severity
}
```

### Изменение #2: Переместить AppError в Application

```bash
# БЫЛО:
src/shared/errors/AppError.ts

# СТАЛО:
src/application/errors/AppError.ts
```

### Изменение #3: Обновить ErrorClassifier

```typescript
// Адаптация: Domain errors (BaseError) = operational
if (error instanceof BaseError) {
  operational.push(error);
  continue;
}
```

### Изменение #4: Обновить импорты

```typescript
// Infrastructure errors
import type { AppError } from '@/application/errors/AppError';  // ✅ Из Application!

// Domain errors
import { BaseError } from '@/shared/errors';  // ✅ Чистый BaseError
```

---

## 📝 Итоговая оценка

| Критерий | Текущее | Правильное | Статус |
|----------|---------|------------|--------|
| **BaseError в Shared** | ✅ | ✅ | ✅ OK |
| **AppError в Shared** | ❌ | ❌ (должен в Application) | 🔴 ПРОБЛЕМА |
| **BaseError implements AppError** | ❌ | ❌ (не должен) | 🔴 ПРОБЛЕМА |
| **Domain errors чистые** | ❌ (имеют isOperational) | ✅ (только BaseError) | 🔴 ПРОБЛЕМА |
| **Dependency Rule** | ❌ (Domain → Application) | ✅ (Domain → Shared) | 🔴 ПРОБЛЕМА |
| **ErrorClassifier адаптирует** | ❌ (проверяет isOperational) | ✅ (instanceof BaseError) | 🔴 ПРОБЛЕМА |

---

## 🎯 Выводы

### Противоречия с DDD и Clean Architecture

1. ❌ **AppError в Shared Utilities** - нарушение разделения технического и бизнес-логики
2. ❌ **BaseError implements AppError** - Domain зависит от Application концепции
3. ❌ **Domain errors с isOperational** - Domain знает о presentation логике
4. ❌ **Нарушение Dependency Rule** - зависимости идут ОТ Domain к Application

### Что работает правильно

1. ✅ **Аккумуляция ошибок** - работает от Specifications до Handler
2. ✅ **Infrastructure errors** - правильно implements AppError
3. ✅ **ErrorClassifier** - правильная идея, неправильная реализация
4. ✅ **BaseError в Shared** - правильное место для технического базового класса

### Рекомендации

**Критично (нарушает архитектуру):**
1. Переместить `AppError` из `src/shared/errors/` в `src/application/errors/`
2. Убрать `implements AppError` из `BaseError`
3. Убрать `isOperational` и `severity` из `BaseError`
4. Обновить `ErrorClassifier` - адаптировать Domain errors через `instanceof BaseError`

**Результат:**
- ✅ Domain errors чистые (не знают о Application)
- ✅ Dependency Rule соблюдается
- ✅ Shared Utilities = технические утилиты (без бизнес-логики)
- ✅ Application Layer решает как интерпретировать Domain errors

---

## 📚 Связанные документы

- `docs/PROJECT_STRUCTURE.md` - разделение Shared Kernel vs Shared Utilities
- `docs/ARCHITECTURE_BOUNDARIES.md` - Dependency Rule, правила импортов
- `docs/concepts/ARCHITECTURE_DESIGN.md` - принципы DDD и Clean Architecture
- `.docs-meta/ERROR_SYSTEM_ANALYSIS.md` - текущий анализ системы ошибок
