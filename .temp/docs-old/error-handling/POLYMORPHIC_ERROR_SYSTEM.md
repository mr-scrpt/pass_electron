# Полиморфная система ошибок через IError

## 🎯 Архитектурное решение

**Принцип:** Каждый слой создает свои специфичные ошибки, но все реализуют общий интерфейс `IError` и работают полиморфно через методы интерфейса.

**БЕЗ:**
- ❌ `instanceof` - проверка типа
- ❌ `switch/case` - перечисление кодов ошибок
- ❌ Дискриминированных union types

**С:**
- ✅ Полиморфизм через методы интерфейса
- ✅ Монадический подход (`tapLeft`, `mapLeft`)
- ✅ Функциональная композиция

---

## 📐 Интерфейс IError

```typescript
// src/shared/errors/IError.ts

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

## 🏗️ Реализация по слоям

### Domain Layer - Expected errors

```typescript
// src/shared/errors/BaseError.ts
export class BaseError extends Error implements IError {
  // Базовый класс для Domain errors
  
  isExpected(): boolean {
    return true;  // Domain errors всегда expected
  }
  
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'info';  // Domain errors = info
  }
  
  toUserError(): IError {
    return this;  // Показываем как есть
  }
}

// src/domain/shared/errors/InvariantViolationError.ts
export class InvariantViolationError extends BaseError {
  constructor(entityType: string, message: string) {
    super({
      entityType,
      message,
      code: 'INVARIANT_VIOLATION',
    });
  }
  
  // ✅ Наследует isExpected() = true
  // ✅ Наследует getLogLevel() = 'info'
  // ✅ Наследует toUserError() = this
}
```

**Специфичные Domain errors:**

```typescript
// src/domain/resource/errors/DuplicateNameError.ts
export class DuplicateNameError implements IError {
  constructor(
    private readonly name: string,
    private readonly existingResourceId: string
  ) {}
  
  getMessage(): string {
    return `Resource with name "${this.name}" already exists`;
  }
  
  getCode(): string {
    return 'DUPLICATE_NAME';
  }
  
  getContext(): Record<string, unknown> {
    return {
      name: this.name,
      existingResourceId: this.existingResourceId,
    };
  }
  
  isExpected(): boolean {
    return true;
  }
  
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'info';
  }
  
  toUserError(): IError {
    return this;
  }
  
  // ✅ Специфичные методы для этой ошибки
  getExistingResourceId(): string {
    return this.existingResourceId;
  }
}
```

---

### Infrastructure Layer - Unexpected errors

```typescript
// src/infrastructure/errors/NetworkError.ts
export class NetworkError extends Error implements IError {
  constructor(
    private readonly _message: string,
    readonly cause?: Error
  ) {
    super(_message);
    this.name = 'NetworkError';
  }
  
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
    };
  }
  
  isExpected(): boolean {
    return false;  // ✅ Infrastructure = unexpected
  }
  
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error';  // ✅ Infrastructure = error
  }
  
  toUserError(): IError {
    // ✅ Заменяем на generic message
    return new GenericApplicationError(
      'Service temporarily unavailable',
      this
    );
  }
}
```

---

### Application Layer - Generic errors

```typescript
// src/application/errors/GenericApplicationError.ts
export class GenericApplicationError extends Error implements IError {
  constructor(
    private readonly _message: string,
    readonly cause?: Error | IError
  ) {
    super(_message);
    this.name = 'GenericApplicationError';
  }
  
  getMessage(): string {
    return this._message;
  }
  
  getCode(): string {
    return 'APPLICATION_ERROR';
  }
  
  getContext(): Record<string, unknown> {
    return {
      cause: this.cause?.message,
    };
  }
  
  isExpected(): boolean {
    return true;  // ✅ Показываем пользователю
  }
  
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'warn';  // ✅ Application = warn
  }
  
  toUserError(): IError {
    return this;  // Уже generic message
  }
}
```

---

## 🔄 Использование с монадами

### Монадные операторы

```typescript
// src/shared/validation/Validation.ts

/**
 * Выполняет side effect на левом значении (ошибке)
 * Возвращает исходную монаду
 */
export const tapLeft = <E, T>(
  fn: (error: E) => void,
) => (validation: Validation<E, T>): Validation<E, T> => {
  if (validation.isLeft()) {
    fn(validation.value);
  }
  return validation;
};
```

---

### Command Handler - полиморфная обработка

```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
export class CreateResourceCommandHandler {
  
  async handle(cmd: CreateResourceCommand): Promise<Validation<IError[], Resource>> {
    
    // 1. Domain создает специфичные ошибки
    const resourceResult = Resource.create(
      Namespace.create(cmd.namespace),
      ResourceName.create(cmd.name),
      cmd.secret
    );
    
    // 2. Проверяем дубликат
    const duplicateCheck = await this.checkDuplicate(cmd.name);
    
    // 3. Комбинируем и обрабатываем полиморфно
    return mergeInMany([resourceResult, duplicateCheck])
      .mapLeft(errors => errors.flat())
      
      // ✅ Side effect - логирование через методы IError
      .mapLeft(tapLeft(errors => 
        errors.forEach(error => 
          this.logger.log(
            error.getLogLevel(),      // БЕЗ тернарника!
            error.getMessage(), 
            error.getContext()
          )
        )
      ))
      
      // ✅ Трансформация через метод IError
      .mapLeft(errors => 
        errors.map(error => error.toUserError())  // БЕЗ проверки типа!
      )
      
      .chain(([resource]) => this.repository.save(resource));
  }
  
  // ✅ БЕЗ if - используем isTrue
  private async checkDuplicate(name: string): Validation<IError[], void> {
    const existing = await this.repository.findByName(name);
    
    return isTrue(!existing, undefined)
      .valid()
      .invalid([new DuplicateNameError(name, existing!.id)]);
  }
}
```

---

## 💡 Преимущества

### 1. Полиморфизм - работа через методы

```typescript
function handleErrors(errors: IError[]): void {
  // ✅ Работаем ОДИНАКОВО для ВСЕХ ошибок
  errors.forEach(error => {
    // Логируем через методы
    logger.log(
      error.getLogLevel(),
      error.getMessage(),
      error.getContext()
    );
    
    // Показываем пользователю через методы
    if (error.isExpected()) {
      ui.show(error.toUserError().getMessage());
    }
  });
}

// ✅ Можем передать ЛЮБУЮ ошибку
handleErrors([
  new InvariantViolationError(...),  // Domain
  new NetworkError(...),              // Infrastructure
  new DuplicateNameError(...),        // Domain specific
]);
```

### 2. БЕЗ instanceof и switch/case

```typescript
// ❌ НЕ НУЖНО
if (error instanceof InvariantViolationError) { }

// ❌ НЕ НУЖНО
switch (error.getCode()) {
  case 'INVARIANT_VIOLATION': ...
  case 'NETWORK_ERROR': ...
}

// ✅ ТОЛЬКО методы интерфейса
if (error.isExpected()) {
  show(error.toUserError().getMessage());
}
```

### 3. Каждый слой - свои ошибки

```typescript
// Domain
class InvariantViolationError extends BaseError { }
class DuplicateNameError implements IError { }

// Infrastructure
class NetworkError implements IError { }
class StorageError implements IError { }

// Application
class GenericApplicationError implements IError { }

// ✅ Все работают через IError!
```

### 4. Функциональный подход

```typescript
// Композиция через монады
return result
  .mapLeft(tapLeft(logErrors))       // Side effect
  .mapLeft(transformToUser)          // Трансформация
  .chain(saveToRepository);          // Продолжаем цепочку
```

---

## 🔍 Сравнение подходов

| Аспект | instanceof/switch | **IError полиморфизм** |
|--------|-------------------|------------------------|
| Проверка типа | `instanceof` | БЕЗ проверки ✅ |
| Выбор действия | `switch (error.code)` | `error.method()` ✅ |
| Добавление ошибки | Обновить все switch | Просто implements IError ✅ |
| Логирование | `if/else` по типу | `error.getLogLevel()` ✅ |
| Трансформация | `if/else` по типу | `error.toUserError()` ✅ |
| Поддержка | Хрупкая (забыли case) | Надежная (компилятор) ✅ |

---

## 📊 Поток ошибок

```
┌─────────────────────────────────────────┐
│ Value Object создает InvariantViolation │
│ isExpected() = true                      │
│ getLogLevel() = 'info'                   │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────┴──────────────────────────┐
│ Aggregate аккумулирует через mergeInMany │
│ Validation<IError[], Aggregate>          │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────┴──────────────────────────┐
│ Repository может добавить NetworkError   │
│ isExpected() = false                     │
│ getLogLevel() = 'error'                  │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────┴──────────────────────────┐
│ Handler обрабатывает полиморфно          │
│ - tapLeft для логирования                │
│ - mapLeft для трансформации              │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────┴──────────────────────────┐
│ Presentation получает IError[]           │
│ - Expected показываем                    │
│ - Unexpected уже заменены на Generic     │
└──────────────────────────────────────────┘
```

---

## 🎯 Ключевые принципы

1. **Минимальный интерфейс** - только технические методы + классификация
2. **Полиморфизм через методы** - БЕЗ проверки типа
3. **Каждый слой свои ошибки** - специфичные классы
4. **Функциональный подход** - монады + композиция
5. **Domain чистый** - просто implements IError, не знает о Application
6. **Type Safety** - компилятор проверяет

---

## 📝 Чек-лист создания новой ошибки

### Domain Error

```typescript
// 1. Создать класс
export class MyDomainError implements IError {
  // 2. Конструктор с контекстом
  constructor(
    private readonly entityType: string,
    private readonly detail: string
  ) {}
  
  // 3. Реализовать IError
  getMessage(): string { return `[${this.entityType}] ${this.detail}`; }
  getCode(): string { return 'MY_DOMAIN_ERROR'; }
  getContext() { return { entityType: this.entityType }; }
  
  // 4. Domain = expected
  isExpected(): boolean { return true; }
  getLogLevel() { return 'info' as const; }
  toUserError() { return this; }
  
  // 5. Специфичные методы (опционально)
  getDetail(): string { return this.detail; }
}
```

### Infrastructure Error

```typescript
// 1. Создать класс
export class MyInfraError extends Error implements IError {
  // 2. Конструктор с cause
  constructor(
    private readonly _message: string,
    readonly cause?: Error
  ) {
    super(_message);
    this.name = 'MyInfraError';
  }
  
  // 3. Реализовать IError
  getMessage(): string { return `Infra: ${this._message}`; }
  getCode(): string { return 'MY_INFRA_ERROR'; }
  getContext() { return { cause: this.cause?.message }; }
  
  // 4. Infrastructure = unexpected
  isExpected(): boolean { return false; }
  getLogLevel() { return 'error' as const; }
  toUserError() {
    return new GenericApplicationError(
      'Generic message for user',
      this
    );
  }
}
```

---

## 🔗 Связанные документы

- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - общая система обработки ошибок
- [INVARIANTS.md](./INVARIANTS.md) - инварианты и валидация
- [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) - эскалация ошибок через слои
