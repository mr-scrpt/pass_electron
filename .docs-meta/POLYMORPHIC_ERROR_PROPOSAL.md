# Полиморфный подход к ошибкам через общий интерфейс

## 🎯 Идея

**Каждый слой создает свои ошибки, но все работают через общий интерфейс (контракт)**

- ✅ Domain errors - свои классы
- ✅ Application errors - свои классы
- ✅ Infrastructure errors - свои классы
- ✅ Но ВСЕ implements один интерфейс
- ✅ Работаем **полиморфно** через методы интерфейса
- ✅ **БЕЗ instanceof, БЕЗ switch/case**

---

## 📐 Архитектура

### Общий контракт (интерфейс)

```typescript
// ============================================================
// src/shared/errors/IError.ts
// Общий контракт для ВСЕХ ошибок приложения
// ============================================================

/**
 * Категория ошибки
 * Определяет откуда ошибка и как с ней работать
 */
export type ErrorCategory = 
  | 'validation'      // Ошибка валидации на границе приложения
  | 'domain'          // Доменная ошибка (бизнес-правило)
  | 'infrastructure'  // Ошибка инфраструктуры (сеть, БД, файловая система)
  | 'unexpected';     // Неожиданная ошибка (баг)

/**
 * Общий интерфейс для ВСЕХ ошибок
 * Каждая ошибка должна уметь "рассказать о себе"
 */
export interface IError {
  /**
   * Категория ошибки
   * Позволяет понять на каком уровне произошла ошибка
   */
  getCategory(): ErrorCategory;
  
  /**
   * Сообщение для логирования
   * Техническое описание ошибки
   */
  getMessage(): string;
  
  /**
   * Должна ли ошибка быть показана пользователю?
   * - true: validation, domain (показываем)
   * - false: infrastructure, unexpected (скрываем)
   */
  shouldShowToUser(): boolean;
  
  /**
   * Сообщение для пользователя
   * Может отличаться от технического getMessage()
   */
  getUserMessage(): string;
  
  /**
   * Уровень серьезности (для логирования)
   */
  getSeverity(): 'low' | 'medium' | 'high';
  
  /**
   * Дополнительный контекст (для отладки)
   */
  getContext(): Record<string, unknown>;
  
  /**
   * Код ошибки (для категоризации)
   */
  getCode(): string;
}
```

---

### Domain Layer - свои ошибки, implements IError

```typescript
// ============================================================
// src/domain/shared/errors/InvariantViolation.ts
// ============================================================

import type { IError, ErrorCategory } from '@/shared/errors/IError';

/**
 * Domain ошибка - нарушение инварианта
 * Implements IError, но это ЧИСТО доменная ошибка
 */
export class InvariantViolation implements IError {
  constructor(
    private readonly entityType: string,
    private readonly message: string,
    private readonly context?: Record<string, unknown>
  ) {}
  
  // ✅ Методы интерфейса - полиморфная работа
  getCategory(): ErrorCategory {
    return 'domain';
  }
  
  getMessage(): string {
    return `[${this.entityType}] ${this.message}`;
  }
  
  shouldShowToUser(): boolean {
    return true;  // ✅ Domain ошибки показываем пользователю
  }
  
  getUserMessage(): string {
    return this.message;  // Domain ошибки понятны пользователю
  }
  
  getSeverity(): 'low' | 'medium' | 'high' {
    return 'medium';
  }
  
  getContext(): Record<string, unknown> {
    return {
      entityType: this.entityType,
      ...this.context,
    };
  }
  
  getCode(): string {
    return 'INVARIANT_VIOLATION';
  }
  
  // ✅ Доменные методы (специфичные для этой ошибки)
  getEntityType(): string {
    return this.entityType;
  }
}
```

```typescript
// ============================================================
// src/domain/shared/errors/NotFoundError.ts
// ============================================================

export class NotFoundError implements IError {
  constructor(
    private readonly entityType: string,
    private readonly message: string,
    private readonly searchCriteria?: Record<string, unknown>
  ) {}
  
  getCategory(): ErrorCategory {
    return 'domain';
  }
  
  getMessage(): string {
    return `[${this.entityType}] ${this.message}`;
  }
  
  shouldShowToUser(): boolean {
    return true;
  }
  
  getUserMessage(): string {
    return this.message;
  }
  
  getSeverity(): 'low' | 'medium' | 'high' {
    return 'low';  // NotFound - не критично
  }
  
  getContext(): Record<string, unknown> {
    return {
      entityType: this.entityType,
      searchCriteria: this.searchCriteria,
    };
  }
  
  getCode(): string {
    return 'NOT_FOUND';
  }
  
  // ✅ Специфичный метод для NotFoundError
  getSearchCriteria(): Record<string, unknown> | undefined {
    return this.searchCriteria;
  }
}
```

---

### Infrastructure Layer - свои ошибки, implements IError

```typescript
// ============================================================
// src/infrastructure/errors/NetworkError.ts
// ============================================================

export class NetworkError implements IError {
  constructor(
    private readonly message: string,
    private readonly cause?: Error,
    private readonly statusCode?: number
  ) {}
  
  getCategory(): ErrorCategory {
    return 'infrastructure';
  }
  
  getMessage(): string {
    return `Network error: ${this.message}`;
  }
  
  shouldShowToUser(): boolean {
    return false;  // ✅ Infrastructure ошибки НЕ показываем
  }
  
  getUserMessage(): string {
    return 'Service temporarily unavailable';  // Generic message
  }
  
  getSeverity(): 'low' | 'medium' | 'high' {
    return 'high';  // Network - критично
  }
  
  getContext(): Record<string, unknown> {
    return {
      statusCode: this.statusCode,
      cause: this.cause?.message,
    };
  }
  
  getCode(): string {
    return 'NETWORK_ERROR';
  }
  
  // ✅ Специфичный метод для NetworkError
  getStatusCode(): number | undefined {
    return this.statusCode;
  }
}
```

---

### Application Layer - свои ошибки, implements IError

```typescript
// ============================================================
// src/application/errors/ValidationError.ts
// ============================================================

export class ValidationError implements IError {
  constructor(
    private readonly errors: string[]
  ) {}
  
  getCategory(): ErrorCategory {
    return 'validation';
  }
  
  getMessage(): string {
    return `Validation failed: ${this.errors.join(', ')}`;
  }
  
  shouldShowToUser(): boolean {
    return true;  // ✅ Validation ошибки показываем
  }
  
  getUserMessage(): string {
    return this.errors.join('; ');
  }
  
  getSeverity(): 'low' | 'medium' | 'high' {
    return 'low';
  }
  
  getContext(): Record<string, unknown> {
    return {
      errors: this.errors,
    };
  }
  
  getCode(): string {
    return 'VALIDATION_ERROR';
  }
  
  // ✅ Специфичный метод
  getErrors(): string[] {
    return this.errors;
  }
}
```

---

## 🔧 Полиморфная работа - БЕЗ instanceof, БЕЗ switch

### Обработка ошибок через методы интерфейса

```typescript
// ============================================================
// Application Layer - BaseQueryHandler
// ============================================================

export abstract class BaseQueryHandler {
  
  /**
   * Обработка ошибок - ПОЛИМОРФНО через методы IError
   * БЕЗ instanceof, БЕЗ switch/case!
   */
  protected handleErrors(errors: IError[], operation: string): IError[] {
    const result: IError[] = [];
    
    for (const error of errors) {
      // ✅ Работаем ТОЛЬКО через методы интерфейса
      
      // Логируем ВСЕ ошибки
      this.logger.log(
        error.getSeverity(),
        `[${operation}] ${error.getMessage()}`,
        error.getContext()
      );
      
      // Решаем показывать ли пользователю
      if (error.shouldShowToUser()) {
        // ✅ Показываем как есть (domain, validation)
        result.push(error);
      } else {
        // ✅ Infrastructure/Unexpected - заменяем на generic
        result.push(new GenericApplicationError(
          error.getUserMessage(),
          error
        ));
      }
    }
    
    return result;
  }
}
```

**БЕЗ проверки типа - только методы!**

---

### Presentation Layer - обработка через методы

```typescript
// ============================================================
// Presentation Layer - route handler
// ============================================================

export async function loader() {
  const result = await queries.resources.list();
  
  if (result.isLeft()) {
    const errors = result.value;
    
    // ✅ Работаем через методы - БЕЗ switch!
    return json({
      errors: errors.map(error => ({
        message: error.getUserMessage(),
        code: error.getCode(),
        severity: error.getSeverity(),
      }))
    });
  }
  
  return json({ data: result.value });
}
```

**БЕЗ instanceof, БЕЗ switch - только методы интерфейса!**

---

## 🎯 Преимущества

### 1. Полиморфизм ✅

```typescript
function handle(error: IError) {
  // Работаем одинаково для ВСЕХ ошибок
  if (error.shouldShowToUser()) {
    ui.show(error.getUserMessage());
  } else {
    logger.error(error.getMessage(), error.getContext());
  }
}

// Можем передать ЛЮБУЮ ошибку
handle(new InvariantViolation(...));     // Domain
handle(new NetworkError(...));           // Infrastructure
handle(new ValidationError(...));        // Application
```

---

### 2. Каждый слой - свои ошибки ✅

```typescript
// Domain Layer
class InvariantViolation implements IError {
  // Свои поля, свои методы
  getEntityType(): string { }
}

// Infrastructure Layer
class NetworkError implements IError {
  // Свои поля, свои методы
  getStatusCode(): number { }
}

// НО работаем через общий интерфейс!
```

---

### 3. БЕЗ instanceof, БЕЗ switch ✅

```typescript
// ❌ НЕ НУЖНО
if (error instanceof InvariantViolation) { }

// ❌ НЕ НУЖНО
switch (error.type) {
  case 'InvariantViolation': ...
}

// ✅ ТОЛЬКО методы интерфейса
if (error.shouldShowToUser()) {
  show(error.getUserMessage());
}
```

---

### 4. Соответствие DDD ✅

```typescript
// Domain Layer
class InvariantViolation implements IError {
  getCategory() { return 'domain'; }
  shouldShowToUser() { return true; }
  // ✅ Domain НЕ знает о Application
  // ✅ Просто implements интерфейс
}

// Application Layer решает через методы
if (error.getCategory() === 'infrastructure') {
  // скрываем
} else {
  // показываем
}
```

**Domain чистый - просто реализует контракт!**

---

## 📊 Примеры использования

### Value Object

```typescript
// src/domain/resource/value-objects/ResourceName.ts
export class ResourceName {
  static create(value: string): Validation<IError[], ResourceName> {
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .mapLeft((errors) =>
        errors.map((err) => 
          new InvariantViolation(
            ResourceName.ENTITY_TYPE,
            err.message,
            { value }
          )
        )
      )
      .map((validValue) => new ResourceName(validValue));
  }
}
// Возвращает IError[] - полиморфно!
```

---

### Aggregate

```typescript
// src/domain/resource/aggregates/Resource.ts
export class Resource {
  static create(
    namespace: Validation<IError[], Namespace>,
    name: Validation<IError[], ResourceName>,
    secret: string,
  ): Validation<IError[], Resource> {
    
    return mergeInMany([namespace, name])
      .mapLeft((errors) => errors.flat())  // IError[][] → IError[]
      .map(([ns, nm]) => new Resource({...}));
  }
}
// Работает с IError[] - полиморфно!
```

---

### Handler

```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
export class CreateResourceCommandHandler {
  async handle(cmd: CreateResourceCommand): Promise<Validation<IError[], Resource>> {
    
    // 1. Domain возвращает IError[]
    const resourceResult = Resource.create(
      Namespace.create(cmd.namespace),
      ResourceName.create(cmd.name),
      cmd.secret
    );
    
    if (resourceResult.isLeft()) {
      // 2. Обрабатываем через методы интерфейса
      return resourceResult.mapLeft((errors) =>
        this.handleErrors(errors, 'create resource')
      );
    }
    
    // 3. Repository тоже возвращает IError[]
    return (await this.repository.save(resourceResult.value))
      .mapLeft((errors) =>
        this.handleErrors(errors, 'save resource')
      );
  }
  
  // ✅ Полиморфная обработка
  private handleErrors(errors: IError[], operation: string): IError[] {
    return errors.map(error => {
      // Логируем
      this.logger.log(error.getSeverity(), error.getMessage());
      
      // Решаем показывать ли пользователю
      if (error.shouldShowToUser()) {
        return error;  // Domain/Validation - показываем
      } else {
        return new GenericApplicationError(
          error.getUserMessage()  // Infrastructure - скрываем
        );
      }
    });
  }
}
```

---

## 🏗️ Структура файлов

```
src/
├── shared/
│   └── errors/
│       ├── IError.ts                  # ✅ Общий интерфейс
│       └── index.ts
│
├── domain/
│   └── shared/
│       └── errors/
│           ├── InvariantViolation.ts  # ✅ implements IError
│           ├── NotFoundError.ts       # ✅ implements IError
│           ├── DuplicateError.ts      # ✅ implements IError
│           └── index.ts
│
├── application/
│   └── errors/
│       ├── ValidationError.ts         # ✅ implements IError
│       ├── GenericApplicationError.ts # ✅ implements IError
│       └── index.ts
│
└── infrastructure/
    └── errors/
        ├── NetworkError.ts            # ✅ implements IError
        ├── StorageError.ts            # ✅ implements IError
        ├── ApiError.ts                # ✅ implements IError
        └── index.ts
```

---

## 📋 Сравнение: БЫЛО → СТАЛО

| Аспект | Discriminated Unions | Polymorphic Interface |
|--------|---------------------|----------------------|
| **instanceof** | ❌ НЕ нужен | ❌ НЕ нужен |
| **switch/case** | ✅ Используется | ❌ НЕ нужен |
| **Type narrowing** | type === 'X' | методы интерфейса |
| **Работа с ошибками** | switch (error.type) | error.shouldShowToUser() |
| **Каждый слой свои** | ✅ Union types | ✅ Свои классы |
| **Общая сигнатура** | ❌ Нет | ✅ IError interface |
| **Полиморфизм** | ❌ Через switch | ✅ Через методы |
| **DDD чистота** | ✅ Domain чистый | ✅ Domain чистый |

---

## 🎯 Итог

### Что получаем:

1. ✅ **Каждый слой - свои ошибки** (классы)
2. ✅ **Согласованы по интерфейсу** (IError)
3. ✅ **Работаем одинаково** (через методы)
4. ✅ **БЕЗ instanceof**
5. ✅ **БЕЗ switch/case**
6. ✅ **Полиморфизм** через OOP
7. ✅ **Соответствие DDD** - Domain чистый

### Принцип:

> "Программируй к интерфейсу, а не к реализации"

Каждый слой создает свои ошибки, но все они говорят на **общем языке** через методы IError!

**Это тебе подходит?**
