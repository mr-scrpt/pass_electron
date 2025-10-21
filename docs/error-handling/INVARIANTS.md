# Инварианты (Domain Invariants)

**Инвариант** — это бизнес-правило, которое должно **всегда** соблюдаться. В DDD инварианты обеспечивают консистентность данных и защищают границы модели.

---

## 🎯 Где живут инварианты?

### 1. Value Objects

Value Objects **инкапсулируют инварианты** при создании:

#### Антипаттерн [#code]

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

#### Resource Aggregate [#class:Resource|#code]

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

#### Структура Shared Kernel [#structure:tree]

```
src/domain/                      #structure:
├── shared/                      # Shared Kernel #structure:
│   ├── invariants/              # Переиспользуемые инварианты #structure:
│   │   ├── UuidInvariant.ts     # Валидация UUID #class:UuidInvariant
│   │   ├── StringInvariant.ts   # Валидация строк #class:StringInvariant
│   │   ├── EmailInvariant.ts    # Валидация email #class:EmailInvariant
│   │   └── index.ts
│   ├── errors/                  # Domain ошибки #structure:
│   │   ├── InvariantViolationError.ts  #class:InvariantViolationError
│   │   ├── DomainError.ts         #class:DomainError
│   │   └── index.ts
│   └── index.ts
├── value-objects/               #structure:
│   ├── ResourceId.ts            # Использует UuidInvariant #class:ResourceId
│   ├── Namespace.ts             #class:Namespace
│   └── index.ts
```

---

## 🔧 Реализация

### Шаг 1: Domain Error

**Файл: `src/domain/shared/errors/DomainError.ts`**

#### DomainError [#class:DomainError|#code|#structure:path]

```typescript
// src/domain/shared/errors/DomainError.ts
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

**Файл: `src/domain/shared/errors/InvariantViolationError.ts`**

#### InvariantViolationError [#class:InvariantViolationError|#code|#structure:path]

```typescript
// src/domain/shared/errors/InvariantViolationError.ts
import { DomainError } from './DomainError'

/**
 * Ошибка нарушения инварианта
 * Выбрасывается когда не соблюдено бизнес-правило
 */ // #class:InvariantViolationError
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

**Файл: `src/domain/shared/errors/index.ts`**

#### Errors index.ts [#code|#structure:path]

```typescript
// src/domain/shared/errors/index.ts
export { DomainError } from './DomainError'
export { InvariantViolationError } from './InvariantViolationError'
```

---

### Шаг 2: Переиспользуемые инварианты

**Файл: `src/domain/shared/invariants/UuidInvariant.ts`**

#### UuidInvariant [#class:UuidInvariant|#code|#structure:path]

```typescript
// src/domain/shared/invariants/UuidInvariant.ts
import { InvariantViolationError } from '../errors'

/**
 * Инварианты для UUID
 * 
 * UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * где x - любая hex цифра, y - одна из [8, 9, a, b]
 */ // #class:UuidInvariant
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

**Файл: `src/domain/shared/invariants/StringInvariant.ts`**

#### StringInvariant [#class:StringInvariant|#code|#structure:path]

```typescript
// src/domain/shared/invariants/StringInvariant.ts
import { Either, right, left } from '@sweet-monads/either'
import { InvariantViolationError } from '../errors'

/**
 * Инварианты для строк
 * Переиспользуемые правила валидации строк
 */ // #class:StringInvariant
export class StringInvariant {
  /**
   * Проверка длины строки
   * Возвращает Either для type-safe обработки
   */
  static validateLength(
    value: string,
    minLength: number,
    maxLength: number,
    entityType: string
  ): Either<InvariantViolationError, string> {
    if (!value) {
      return left(new InvariantViolationError(
        entityType,
        'cannot be empty'
      ))
    }
    
    if (value.length < minLength || value.length > maxLength) {
      return left(new InvariantViolationError(
        entityType,
        `must be ${minLength}-${maxLength} characters`
      ))
    }
    
    return right(value)
  }
  
  /**
   * Проверка: буквы, цифры, дефис, подчеркивание
   * Используется для: ResourceName, Namespace, CustomField labels
   */
  static validateAlphanumericWithDashUnderscore(
    value: string,
    entityType: string
  ): Either<InvariantViolationError, string> {
    const PATTERN = /^[a-zA-Z0-9-_]+$/
    
    if (!PATTERN.test(value)) {
      return left(new InvariantViolationError(
        entityType,
        'must contain only letters, numbers, - and _'
      ))
    }
    
    return right(value)
  }
  
  /**
   * Проверка: slug формат (lowercase, дефисы)
   * Используется для URL-friendly идентификаторов
   */
  static validateSlug(
    value: string,
    entityType: string
  ): Either<InvariantViolationError, string> {
    const PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    
    if (!PATTERN.test(value)) {
      return left(new InvariantViolationError(
        entityType,
        'must be a valid slug (lowercase, numbers, hyphens)'
      ))
    }
    
    return right(value)
  }
}
```

**Файл: `src/domain/shared/invariants/IdentifierInvariant.ts`**

#### IdentifierInvariant [#class:IdentifierInvariant|#code|#structure:path]

```typescript
// src/domain/shared/invariants/IdentifierInvariant.ts
import { Either } from '@sweet-monads/either'
import { InvariantViolationError } from '../errors'
import { StringInvariant } from './StringInvariant'

/**
 * Композитные инварианты для идентификаторов
 * Комбинируют несколько проверок
 */
export class IdentifierInvariant {
  /**
   * Валидация идентификатора ресурса
   * 1-100 символов, буквы/цифры/-/_
   */
  static validateResourceIdentifier(
    value: string,
    entityType: string
  ): Either<InvariantViolationError, string> {
    return StringInvariant.validateLength(value, 1, 100, entityType)
      .chain(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, entityType)
      )
  }
  
  /**
   * Валидация короткого идентификатора (namespace)
   * 1-50 символов, буквы/цифры/-/_
   */
  static validateShortIdentifier(
    value: string,
    entityType: string
  ): Either<InvariantViolationError, string> {
    return StringInvariant.validateLength(value, 1, 50, entityType)
      .chain(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, entityType)
      )
  }
}
```

**Файл: `src/domain/shared/invariants/index.ts`**

#### Invariants index.ts [#code|#structure:path]

```typescript
// src/domain/shared/invariants/index.ts
export { UuidInvariant } from './UuidInvariant'
export { StringInvariant } from './StringInvariant'
export { IdentifierInvariant } from './IdentifierInvariant'
```

**Файл: `src/domain/shared/index.ts`**

#### Shared index.ts [#code|#structure:path]

```typescript
// src/domain/shared/index.ts
export * from './errors'
export * from './invariants'
```

---

### Шаг 3: Использование в Value Objects

> **Принцип DDD**: Value Objects должны быть **self-validating** (самовалидирующимися).
> Инварианты - это **переиспользуемые утилиты**, которые Value Object использует ВНУТРИ себя.

**Файл: `src/domain/resource/value-objects/ResourceName.ts`**

#### ResourceName Value Object [#class:ResourceName|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceName.ts
import { Either } from '@sweet-monads/either'
import { InvariantViolationError, IdentifierInvariant } from '@/domain/shared'

/**
 * Value Object для имени ресурса
 * Self-validating: гарантирует валидность при создании
 * 
 * Инварианты:
 * - Длина: 1-100 символов
 * - Формат: буквы, цифры, дефис, подчеркивание
 */
export class ResourceName {
  private static readonly ENTITY_TYPE = 'ResourceName'
  private constructor(private readonly value: string) {}
  
  /**
   * Фабричный метод с валидацией (self-validation)
   * 
   * ВАЖНО: Валидация происходит ВНУТРИ Value Object.
   * IdentifierInvariant - это утилита для переиспользования логики,
   * не внешний валидатор.
   */
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    // ✅ Value Object использует утилиту ВНУТРИ себя
    // ✅ Конструктор private → невозможно обойти валидацию
    return IdentifierInvariant.validateResourceIdentifier(value, ResourceName.ENTITY_TYPE)
      .map(validValue => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

**Файл: `src/domain/resource/value-objects/Namespace.ts`**

#### Namespace Value Object [#class:Namespace|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/Namespace.ts
import { Either } from '@sweet-monads/either'
import { InvariantViolationError, IdentifierInvariant } from '@/domain/shared'

export class Namespace {
  private static readonly ENTITY_TYPE = 'Namespace'
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, Namespace> {
    // ✅ Переиспользуем композитный инвариант!
    return IdentifierInvariant.validateShortIdentifier(value, Namespace.ENTITY_TYPE)
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

#### Self-validating Value Object [#class:ResourceName|#code]

```typescript
class ResourceName {
  // ✅ Private конструктор - критически важно!
  private constructor(private readonly value: string) {}
  
  // ✅ Валидация происходит ВНУТРИ Value Object
  static create(value: string): Either<InvariantViolationError, ResourceName> {
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

#### Антипаттерн [#code]

```typescript
class ResourceName {
  // ❌ Public конструктор - можно обойти валидацию!
  constructor(private readonly value: string) {}
}

// ❌ Валидация снаружи - нарушение инкапсуляции
function createResourceName(value: string): Either<InvariantViolationError, ResourceName> {
  return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
    .map(v => new ResourceName(v))
}

// Проблема: можно создать невалидный объект
const invalid = new ResourceName('') // ❌ Никакой валидации!
```

### Роль инвариантов

**Инварианты - это переиспользуемые утилиты**, а не внешние валидаторы:

#### Инварианты как утилиты [#class:StringInvariant|#code]

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

#### Гарантии валидности [#code]

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

#### Антипаттерн - дублирование [#code]

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

#### Композитный инвариант [#class:IdentifierInvariant|#code]

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
- `Either<E, T>` делает ошибки явными
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
2. **Either вместо throw** - type-safe обработка ошибок
3. **Переиспользуй** - общие инварианты в Shared Kernel
4. **Документируй** - описывай что проверяет инвариант

---

## 🔗 См. также

- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Обработка ошибок: Domain/Application/Infrastructure Errors
- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок: Either Pattern и монады
- **[DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Value Objects и Entities
- **[contracts/domain-types.md](../contracts/domain-types.md)** — Domain типы и ошибки
- **[PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** — Структура Domain Layer
- **[steps/step_1/README.md](../../steps/step_1/README.md)** — Реализация Value Objects

---

**💡 Правило**: Если правило валидации используется больше одного раза — вынеси его в Invariant класс!
