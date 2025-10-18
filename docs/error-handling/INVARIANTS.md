# Инварианты (Domain Invariants)

**Инвариант** — это бизнес-правило, которое должно **всегда** соблюдаться. В DDD инварианты обеспечивают консистентность данных и защищают границы модели.

---

## 🎯 Где живут инварианты?

### 1. Value Objects

Value Objects **инкапсулируют инварианты** при создании:

```typescript
// ❌ ПЛОХО: валидация размазана по коду
if (name.length < 1 || name.length > 100) {
  throw new Error('Invalid name')
}

// ✅ ХОРОШО: инвариант в Value Object
class ResourceName {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): ResourceName {
    // Инвариант: имя от 1 до 100 символов
    if (!value || value.length < 1 || value.length > 100) {
      throw new InvariantViolationError('ResourceName', 'length must be 1-100 characters')
    }
    return new ResourceName(value)
  }
}
```

### 2. Aggregates

Aggregates **защищают инварианты** между своими entities:

```typescript
class Resource {
  // Инвариант: ресурс не может иметь дубликаты полей
  addCustomField(field: CustomField): void {
    if (this._customFields.some(f => f.label === field.label)) {
      throw new InvariantViolationError('Resource', 'duplicate field labels not allowed')
    }
    this._customFields.push(field)
  }
}
```

---

## 📁 Структура файлов

### Переиспользуемые инварианты

Для **общих правил валидации** создаем **Shared Kernel**:

```
app/domain/
├── shared/                      # Shared Kernel
│   ├── invariants/              # Переиспользуемые инварианты
│   │   ├── UuidInvariant.ts     # Валидация UUID
│   │   ├── StringInvariant.ts   # Валидация строк
│   │   ├── EmailInvariant.ts    # Валидация email
│   │   └── index.ts
│   ├── errors/                  # Domain ошибки
│   │   ├── InvariantViolationError.ts
│   │   ├── DomainError.ts
│   │   └── index.ts
│   └── index.ts
├── value-objects/
│   ├── ResourceId.ts            # Использует UuidInvariant
│   ├── Namespace.ts
│   └── index.ts
```

---

## 🔧 Реализация

### Шаг 1: Domain Error

**Файл: `app/domain/shared/errors/DomainError.ts`**

```typescript
/**
 * Базовая ошибка домена
 */
export abstract class DomainError extends Error {
  abstract readonly code: string
  
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    // Сохраняем правильный stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}
```

**Файл: `app/domain/shared/errors/InvariantViolationError.ts`**

```typescript
import { DomainError } from './DomainError'

/**
 * Ошибка нарушения инварианта
 * Выбрасывается когда не соблюдено бизнес-правило
 */
export class InvariantViolationError extends DomainError {
  readonly code = 'INVARIANT_VIOLATION'
  
  constructor(
    readonly entityType: string,
    readonly invariant: string
  ) {
    super(`${entityType}: ${invariant}`)
  }
}
```

**Файл: `app/domain/shared/errors/index.ts`**

```typescript
export { DomainError } from './DomainError'
export { InvariantViolationError } from './InvariantViolationError'
```

---

### Шаг 2: Переиспользуемые инварианты

**Файл: `app/domain/shared/invariants/UuidInvariant.ts`**

```typescript
import { InvariantViolationError } from '../errors'

/**
 * Инварианты для UUID
 * 
 * UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * где x - любая hex цифра, y - одна из [8, 9, a, b]
 */
export class UuidInvariant {
  private static readonly UUID_V4_REGEX = 
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  /**
   * Проверка что строка является валидным UUID v4
   * @throws InvariantViolationError если не валиден
   */
  static ensureValidUuid(value: string, entityType: string): void {
    if (!value) {
      throw new InvariantViolationError(
        entityType,
        'UUID cannot be empty'
      )
    }
    
    if (!this.UUID_V4_REGEX.test(value)) {
      throw new InvariantViolationError(
        entityType,
        `Invalid UUID format: ${value}`
      )
    }
  }
  
  /**
   * Проверка что строка является валидным UUID v4 (без throws)
   * Полезно для type guards
   */
  static isValidUuid(value: string): boolean {
    return !!value && this.UUID_V4_REGEX.test(value)
  }
}
```

**Файл: `app/domain/shared/invariants/StringInvariant.ts`**

```typescript
import { Result, ok, err } from 'neverthrow'
import { InvariantViolationError } from '../errors'

/**
 * Инварианты для строк
 * Переиспользуемые правила валидации строк
 */
export class StringInvariant {
  /**
   * Проверка длины строки
   * Возвращает Result для type-safe обработки
   */
  static validateLength(
    value: string,
    minLength: number,
    maxLength: number,
    entityType: string
  ): Result<string, InvariantViolationError> {
    if (!value) {
      return err(new InvariantViolationError(
        entityType,
        `value cannot be empty`
      ))
    }
    
    if (value.length < minLength || value.length > maxLength) {
      return err(new InvariantViolationError(
        entityType,
        `length must be between ${minLength} and ${maxLength} characters`
      ))
    }
    
    return ok(value)
  }
  
  /**
   * Проверка: буквы, цифры, дефис, подчеркивание
   * Используется для: ResourceName, Namespace, CustomField labels
   */
  static validateAlphanumericWithDashUnderscore(
    value: string,
    entityType: string
  ): Result<string, InvariantViolationError> {
    const PATTERN = /^[a-zA-Z0-9-_]+$/
    
    if (!PATTERN.test(value)) {
      return err(new InvariantViolationError(
        entityType,
        'must contain only alphanumeric characters, dashes and underscores'
      ))
    }
    return ok(value)
  }
  
  /**
   * Проверка: slug формат (lowercase, дефисы)
   * Используется для URL-friendly идентификаторов
   */
  static validateSlug(
    value: string,
    entityType: string
  ): Result<string, InvariantViolationError> {
    const PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    
    if (!PATTERN.test(value)) {
      return err(new InvariantViolationError(
        entityType,
        'must be a valid slug (lowercase letters, numbers, and dashes)'
      ))
    }
    return ok(value)
  }
}
```

**Файл: `app/domain/shared/invariants/IdentifierInvariant.ts`**

```typescript
import { Result } from 'neverthrow'
import { InvariantViolationError } from '../errors'
import { StringInvariant } from './StringInvariant'

/**
 * Композитный инвариант для идентификаторов
 * Применяет набор правил валидации как единое целое
 */
export class IdentifierInvariant {
  /**
   * Валидация длинного идентификатора (для ресурсов)
   * Применяет:
   * - Длина: 1-100 символов
   * - Формат: буквы, цифры, дефис, подчеркивание
   */
  static validateResourceIdentifier(
    value: string,
    entityType: string
  ): Result<string, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 100, entityType)
      .andThen(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, entityType)
      )
  }
  
  /**
   * Валидация короткого идентификатора (для namespace, labels)
   * Применяет:
   * - Длина: 1-50 символов
   * - Формат: буквы, цифры, дефис, подчеркивание
   */
  static validateShortIdentifier(
    value: string,
    entityType: string
  ): Result<string, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 50, entityType)
      .andThen(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, entityType)
      )
  }
}
```

**Файл: `app/domain/shared/invariants/index.ts`**

```typescript
export { UuidInvariant } from './UuidInvariant'
export { StringInvariant } from './StringInvariant'
export { IdentifierInvariant } from './IdentifierInvariant'
```

**Файл: `app/domain/shared/index.ts`**

```typescript
export * from './errors'
export * from './invariants'
```

---

### Шаг 3: Использование в Value Objects

> **Принцип DDD**: Value Objects должны быть **self-validating** (самовалидирующимися).
> Инварианты - это **переиспользуемые утилиты**, которые Value Object использует ВНУТРИ себя.

**Файл: `app/domain/resource/ResourceName.ts`**

```typescript
import { Result } from 'neverthrow'
import { InvariantViolationError } from '~/domain/shared/errors'
import { IdentifierInvariant } from '~/domain/shared/invariants'

/**
 * Value Object для имени ресурса
 * Self-validating: гарантирует валидность при создании
 * 
 * Инварианты:
 * - Длина: 1-100 символов
 * - Формат: буквы, цифры, дефис, подчеркивание
 */
export class ResourceName {
  private constructor(private readonly value: string) {}
  
  /**
   * Фабричный метод с валидацией (self-validation)
   * 
   * ВАЖНО: Валидация происходит ВНУТРИ Value Object.
   * IdentifierInvariant - это утилита для переиспользования логики,
   * не внешний валидатор.
   */
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    // ✅ Value Object использует утилиту ВНУТРИ себя
    // ✅ Конструктор private → невозможно обойти валидацию
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(validValue => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

**Файл: `app/domain/resource/Namespace.ts`**

```typescript
import { Result } from 'neverthrow'
import { InvariantViolationError } from '~/domain/shared/errors'
import { IdentifierInvariant } from '~/domain/shared/invariants'

export class Namespace {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<Namespace, InvariantViolationError> {
    // ✅ Переиспользуем композитный инвариант!
    return IdentifierInvariant.validateShortIdentifier(value, 'Namespace')
      .map(validValue => new Namespace(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

---

## 🏛️ Self-Validating Value Objects (принцип DDD)

### Ключевой принцип

**Value Object отвечает за свою валидность**. Если объект `ResourceName` существует, он **гарантированно валиден**.

### ✅ ПРАВИЛЬНО: Валидация ВНУТРИ Value Object

```typescript
class ResourceName {
  // ✅ Private конструктор - критически важно!
  private constructor(private readonly value: string) {}
  
  // ✅ Валидация происходит ВНУТРИ Value Object
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    // Value Object использует инварианты как УТИЛИТЫ
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(validValue => new ResourceName(validValue))
      // ✅ Конструктор вызывается ПОСЛЕ успешной валидации
  }
}

// Использование
const result = ResourceName.create(input)
// Если result.isOk() → объект гарантированно валиден
```

### ❌ НЕПРАВИЛЬНО: Валидация СНАРУЖИ Value Object

```typescript
class ResourceName {
  // ❌ Public конструктор - можно обойти валидацию!
  constructor(private readonly value: string) {}
}

// ❌ Валидация снаружи - нарушение инкапсуляции
function createResourceName(value: string): Result<ResourceName, InvariantViolationError> {
  return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
    .map(v => new ResourceName(v))
}

// Проблема: можно создать невалидный объект
const invalid = new ResourceName('') // ❌ Никакой валидации!
```

### Роль инвариантов

**Инварианты - это переиспользуемые утилиты**, а не внешние валидаторы:

```typescript
// ✅ StringInvariant - это утилита (как Math.max)
class StringInvariant {
  static validateLength(value: string, min: number, max: number, entityType: string) {
    // Переиспользуемая логика проверки
  }
}

// ✅ Value Object использует утилиту ВНУТРИ себя
class ResourceName {
  static create(value: string) {
    // Это НЕ внешняя валидация, это использование утилиты
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}
```

**Аналогия**: Использование `StringInvariant` - это как использование `Math.max()` внутри класса. Это не нарушает инкапсуляцию, это переиспользование логики.

### Гарантии self-validation

1. **Невозможно создать невалидный объект** - конструктор `private`
2. **Валидность на протяжении всей жизни** - immutability
3. **Не нужно валидировать повторно** - если объект существует, он валиден
4. **Type safety** - компилятор заставит обработать ошибку создания

```typescript
// ✅ Если у вас есть ResourceName, он точно валиден
function processResource(name: ResourceName) {
  // Не нужна валидация - объект уже валиден!
  console.log(name.getValue())
}

// Валидация только при создании
const result = ResourceName.create(userInput)
result.match(
  (validName) => processResource(validName), // ✅ Гарантированно валиден
  (error) => console.error(error)            // Обработка ошибки
)
```

---

## 🎯 Композитные инварианты

### Зачем нужны?

**Проблема**: Одна и та же композиция валидаций повторяется в разных Value Objects.

```typescript
// ❌ ПРОБЛЕМА: Дублирование
class ResourceName {
  static create(value: string) {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .andThen(v => StringInvariant.validateAlphanumericWithDashUnderscore(v, 'ResourceName'))
      .map(v => new ResourceName(v))
  }
}

class Namespace {
  static create(value: string) {
    return StringInvariant.validateLength(value, 1, 50, 'Namespace')  // Та же композиция!
      .andThen(v => StringInvariant.validateAlphanumericWithDashUnderscore(v, 'Namespace'))
      .map(v => new Namespace(v))
  }
}
```

**Решение**: Композитный инвариант инкапсулирует повторяющуюся композицию:

```typescript
// ✅ РЕШЕНИЕ: Композитный инвариант
class ResourceName {
  static create(value: string) {
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}

class Namespace {
  static create(value: string) {
    return IdentifierInvariant.validateShortIdentifier(value, 'Namespace')
      .map(v => new Namespace(v))
  }
}
```

### Преимущества композитных инвариантов

1. **DRY** - композиция определена один раз
2. **Ubiquitous Language** - `validateResourceIdentifier` говорит ЧТО проверяется
3. **Читаемость** - одна строка вместо цепочки
4. **Изменяемость** - изменил правила в одном месте → изменилось везде
5. **Тестируемость** - один тест для композиции

### Когда использовать?

✅ **Используй композитный инвариант, если:**
- Повторяющаяся композиция в разных местах
- Бизнес-концепция («идентификатор ресурса»)
- Сложная логика (больше 2-3 проверки)

❌ **НЕ используй, если:**
- Уникальная композиция (только в одном месте)
- Простая проверка (одна-две операции)

---

## 📚 Ключевые преимущества

### 1. **Ubiquitous Language**
- `validateAlphanumericWithDashUnderscore` - понятно что это
- Не нужно знать regex

### 2. **DRY (Don't Repeat Yourself)**
- Изменил в одном месте → изменилось везде
- ResourceName и Namespace используют один инвариант

### 3. **Type Safety**
- `Result<T, E>` делает ошибки явными
- Компилятор заставит обработать

### 4. **Читаемость**
```typescript
// Понятно что проверяется
StringInvariant.validateAlphanumericWithDashUnderscore(value, 'ResourceName')

// vs magic regex
if (!/^[a-zA-Z0-9-_]+$/.test(value)) { ... }  // ⛔ что это?
```

---

## 🎯 Рекомендации

1. **Всегда именуй regex** - не используй magic patterns
2. **Result вместо throw** - type-safe обработка ошибок
3. **Переиспользуй** - общие инварианты в Shared Kernel
4. **Документируй** - описывай что проверяет инвариант

---

## 🔗 См. также

- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Иерархия ошибок
- [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) - Result Pattern и neverthrow
- [../DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md) - DDD паттерны
    return new ResourceId(crypto.randomUUID())
  }
  
  getValue(): string {
    return this._value
  }
  
  equals(other: ResourceId): boolean {
    return this._value === other._value
  }
  
  toString(): string {
    return this._value
  }
}
```

**Файл: `app/domain/value-objects/Namespace.ts`** (обновленный)

```typescript
import { StringInvariant } from '../shared/invariants'

/**
 * Value Object для namespace ресурса
 * Инварианты:
 * - длина 2-50 символов
 * - только lowercase, цифры, дефис и подчеркивание
 */
export class Namespace {
  private static readonly PATTERN = /^[a-z0-9-_]+$/
  
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Namespace {
    // ✅ Используем переиспользуемые инварианты
    StringInvariant.ensureLength(value, 2, 50, 'Namespace')
    StringInvariant.ensurePattern(
      value,
      this.PATTERN,
      'Namespace',
      'value',
      'lowercase letters, numbers, dash and underscore'
    )
    
    return new Namespace(value)
  }
  
  get value(): string {
    return this._value
  }
  
  equals(other: Namespace): boolean {
    return this._value === other._value
  }
  
  toString(): string {
    return this._value
  }
}
```

**Файл: `app/domain/value-objects/ResourceName.ts`** (обновленный)

```typescript
import { StringInvariant } from '../shared/invariants'

/**
 * Value Object для имени ресурса
 * Инвариант: длина 1-100 символов
 */
export class ResourceName {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): ResourceName {
    // ✅ Переиспользуемый инвариант
    StringInvariant.ensureLength(value, 1, 100, 'ResourceName')
    return new ResourceName(value)
  }
  
  get value(): string {
    return this._value
  }
  
  equals(other: ResourceName): boolean {
    return this._value === other._value
  }
  
  toString(): string {
    return this._value
  }
}
```

---

## 🎯 Преимущества

### ✅ DO: Правильный подход

```typescript
// ✅ Инвариант в переиспользуемом классе
UuidInvariant.ensureValidUuid(value, 'ResourceId')

// ✅ Можно использовать везде
class FieldId {
  static create(value: string): FieldId {
    UuidInvariant.ensureValidUuid(value, 'FieldId')
    return new FieldId(value)
  }
}

// ✅ Type guard для валидации без throws
if (UuidInvariant.isValidUuid(input)) {
  // безопасно использовать
}
```

**Преимущества:**
1. 📦 **DRY** — код не дублируется
2. 🧪 **Тестируемость** — один класс = одно место тестов
3. 🔄 **Изменяемость** — изменить regex в одном месте
4. 📖 **Читаемость** — явное имя метода `ensureValidUuid`
5. 🎯 **Бизнес-правила** — инварианты в одном месте

### ❌ DON'T: Анти-паттерны

```typescript
// ❌ ПЛОХО: дублирование regex
class ResourceId {
  static create(value: string): ResourceId {
    if (!/^[0-9a-f]{8}-...$/i.test(value)) { // дубль
      throw new Error('Invalid')
    }
  }
}

class FieldId {
  static create(value: string): FieldId {
    if (!/^[0-9a-f]{8}-...$/i.test(value)) { // тот же regex!
      throw new Error('Invalid')
    }
  }
}

// ❌ ПЛОХО: валидация в Application Layer
class CreateResourceHandler {
  handle(command: CreateResourceCommand) {
    if (!/^[0-9a-f]{8}-...$/i.test(command.id)) { // не в Domain!
      throw new Error('Invalid')
    }
  }
}
```

---

## 📚 Примеры других инвариантов

### EmailInvariant

```typescript
export class EmailInvariant {
  private static readonly EMAIL_REGEX = 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  static ensureValidEmail(value: string, entityType: string): void {
    StringInvariant.ensureNotEmpty(value, entityType, 'email')
    
    if (!this.EMAIL_REGEX.test(value)) {
      throw new InvariantViolationError(
        entityType,
        'Invalid email format'
      )
    }
  }
}
```

### NumericInvariant

```typescript
export class NumericInvariant {
  static ensureRange(
    value: number,
    min: number,
    max: number,
    entityType: string,
    fieldName: string = 'value'
  ): void {
    if (value < min || value > max) {
      throw new InvariantViolationError(
        entityType,
        `${fieldName} must be between ${min} and ${max} (got ${value})`
      )
    }
  }
  
  static ensurePositive(
    value: number,
    entityType: string,
    fieldName: string = 'value'
  ): void {
    if (value <= 0) {
      throw new InvariantViolationError(
        entityType,
        `${fieldName} must be positive (got ${value})`
      )
    }
  }
}
```

---

## 🧪 Тестирование

```typescript
import { UuidInvariant, InvariantViolationError } from '~/domain/shared'

describe('UuidInvariant', () => {
  describe('ensureValidUuid', () => {
    it('должен принимать валидный UUID v4', () => {
      expect(() => {
        UuidInvariant.ensureValidUuid(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test'
        )
      }).not.toThrow()
    })
    
    it('должен выбросить InvariantViolationError для невалидного UUID', () => {
      expect(() => {
        UuidInvariant.ensureValidUuid('invalid', 'Test')
      }).toThrow(InvariantViolationError)
    })
    
    it('должен выбросить InvariantViolationError для пустой строки', () => {
      expect(() => {
        UuidInvariant.ensureValidUuid('', 'Test')
      }).toThrow(InvariantViolationError)
    })
  })
  
  describe('isValidUuid', () => {
    it('должен вернуть true для валидного UUID', () => {
      expect(UuidInvariant.isValidUuid(
        '550e8400-e29b-41d4-a716-446655440000'
      )).toBe(true)
    })
    
    it('должен вернуть false для невалидного UUID', () => {
      expect(UuidInvariant.isValidUuid('invalid')).toBe(false)
    })
  })
})
```

---

## 📐 Архитектурные принципы

### 1. Инварианты в Domain Layer

```
✅ Domain Layer
   ├── shared/invariants/    ← Переиспользуемые правила
   ├── value-objects/        ← Используют инварианты
   └── entities/             ← Защищают инварианты

❌ Application Layer          НЕ содержит инварианты
❌ Infrastructure Layer       НЕ содержит инварианты
❌ Presentation Layer         НЕ содержит инварианты
```

### 2. Fail Fast

```typescript
// ✅ ХОРОШО: валидация при создании
const name = ResourceName.create(input)  // throws если невалидно

// ❌ ПЛОХО: отложенная валидация
const name = new ResourceName(input)     // может быть невалидным
if (!name.isValid()) throw new Error()   // проверка потом
```

### 3. Явные сообщения об ошибках

```typescript
// ✅ ХОРОШО: понятное сообщение
throw new InvariantViolationError(
  'ResourceName',
  'length must be 1-100 characters (got 150)'
)

// ❌ ПЛОХО: неявное сообщение
throw new Error('Invalid')
```

---

## 🔗 См. также

- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Обработка ошибок: Domain/Application/Infrastructure Errors
- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок: Result Pattern и монады
- **[DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Value Objects и Entities
- **[contracts/domain-types.md](../contracts/domain-types.md)** — Domain типы и ошибки
- **[PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** — Структура Domain Layer
- **[steps/step_1/README.md](../../steps/step_1/README.md)** — Реализация Value Objects

---

**💡 Правило**: Если правило валидации используется больше одного раза — вынеси его в Invariant класс!
