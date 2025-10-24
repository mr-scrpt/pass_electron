# Инварианты (Domain Invariants)

**Инвариант** — это бизнес-правило, которое должно **всегда** соблюдаться. В DDD инварианты обеспечивают консистентность данных и защищают границы модели.

> 💡 **Современный подход:** Для валидации инвариантов рекомендуется использовать **[Specification Pattern](./SPECIFICATION_VALIDATION.md)** вместо if-ов. Этот документ описывает классический подход через утилиты-инварианты.

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

// ✅ ХОРОШО: инвариант в Value Object через Specification Pattern
class ResourceName {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    // Инвариант: имя от 1 до 100 символов
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec('ResourceName'),
      new LengthRangeSpec(1, 100, 'ResourceName')
    )
    return spec.isSatisfiedBy(value).map(v => new ResourceName(v))
  }
}

// 📖 См. SPECIFICATION_VALIDATION.md для деталей
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
src/domain/                          #structure:
├── shared/                          # Shared Kernel (минимум!) #structure:
│   ├── invariants/                  # Shared инварианты #structure:
│   │   ├── IInvariant.ts            # Интерфейс #interface:IInvariant
│   │   ├── UuidInvariant.ts         # UUID (везде) #class:UuidInvariant
│   │   └── index.ts
│   ├── errors/                      # Domain ошибки #structure:
│   │   ├── InvariantViolationError.ts  #class:InvariantViolationError
│   │   ├── ValidationError.ts       #class:ValidationError
│   │   ├── DomainError.ts           #class:DomainError
│   │   └── index.ts
│   └── index.ts
│
└── resource/                        # Resource Bounded Context #structure:
    ├── invariants/                  # Resource-специфичные #structure:
    │   ├── NamespaceInvariant.ts    # Namespace #class:NamespaceInvariant
    │   ├── ResourceNameInvariant.ts # ResourceName #class:ResourceNameInvariant
    │   └── index.ts
    ├── value-objects/               #structure:
    │   ├── ResourceId.ts            # → UuidInvariant #class:ResourceId
    │   ├── Namespace.ts             # → NamespaceInvariant #class:Namespace
    │   ├── ResourceName.ts          # → ResourceNameInvariant #class:ResourceName
    │   └── index.ts
    └── ...
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

**Файл: `src/domain/shared/invariants/IInvariant.ts`**

#### IInvariant интерфейс [#interface:IInvariant|#code|#structure:path]

```typescript
// src/domain/shared/invariants/IInvariant.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'

/**
 * Общий интерфейс для всех инвариантов
 * Generic <T> для разных типов данных
 */
export interface IInvariant<T> {
  validate(value: T, entityType: string): Validation<ValidationError[], T>
}
```

**Файл: `src/domain/resource/invariants/NamespaceInvariant.ts`**

#### NamespaceInvariant [#class:NamespaceInvariant|#code|#structure:path]

```typescript
// src/domain/resource/invariants/NamespaceInvariant.ts
import { Validation, ValidationCombinators } from "@/shared/validation"
import { ValidationError } from "@/shared/errors"
import {
  CommonNotEmptySpec,
  CommonLengthSpec,
  CommonPatternSpec,
} from "@/domain/shared/specification"
import { IInvariant } from "@/domain/shared/invariants"

/**
 * Инвариант для валидации Namespace (Resource Bounded Context)
 * Правила: 2-50 символов, lowercase, буквы/цифры/-/_
 * 
 * Singleton паттерн - один экземпляр на всё приложение
 */
export class NamespaceInvariant implements IInvariant<string> {
  // ✅ Правила ВНУТРИ инварианта
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/
  private static readonly PATTERN_MESSAGE =
    "must contain only lowercase letters, numbers, - and _"

  private static readonly _instance = new NamespaceInvariant()
  private constructor() {}
  
  static get instance(): NamespaceInvariant {
    return NamespaceInvariant._instance
  }

  validate(
    value: string,
    entityType: string,
  ): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonLengthSpec.for({
          entityType,
          minLength: NamespaceInvariant.MIN_LENGTH,
          maxLength: NamespaceInvariant.MAX_LENGTH,
        }).isSatisfiedBy(value),
        CommonPatternSpec.for({
          entityType,
          pattern: NamespaceInvariant.PATTERN,
          message: NamespaceInvariant.PATTERN_MESSAGE,
        }).isSatisfiedBy(value),
      ],
      () => value,
    )
  }
}
```

**Файл: `src/domain/shared/invariants/index.ts`**

#### Shared Invariants Public API [#code|#structure:path]

```typescript
// src/domain/shared/invariants/index.ts
export type { IInvariant } from './IInvariant'
export { UuidInvariant } from './UuidInvariant'
```

**Файл: `src/domain/resource/invariants/index.ts`**

#### Resource Invariants Public API [#code|#structure:path]

```typescript
// src/domain/resource/invariants/index.ts
export { NamespaceInvariant } from './NamespaceInvariant'
export { ResourceNameInvariant } from './ResourceNameInvariant'
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
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'
import { ResourceNameInvariant } from '../invariants'

/**
 * Value Object для имени ресурса
 * Self-validating: гарантирует валидность при создании
 * 
 * Инварианты:
 * - Длина: 1-100 символов
 */
export class ResourceName {
  private static readonly ENTITY_TYPE = 'ResourceName'
  private constructor(private readonly _value: string) {}
  
  /**
   * Фабричный метод с валидацией (self-validation)
   * 
   * ВАЖНО: Валидация происходит ВНУТРИ Value Object.
   * ResourceNameInvariant - это domain-специфичный инвариант,
   * который инкапсулирует правила валидации.
   */
  static create(value: string): Validation<ValidationError[], ResourceName> {
    // ✅ Value Object делегирует валидацию инварианту
    // ✅ Конструктор private → невозможно обойти валидацию
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .map((validValue: string) => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this._value
  }
}
```

**Файл: `src/domain/resource/value-objects/Namespace.ts`**

#### Namespace Value Object [#class:Namespace|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/Namespace.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'
import { NamespaceInvariant } from '../invariants'

export class Namespace {
  private static readonly ENTITY_TYPE = 'Namespace'
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<ValidationError[], Namespace> {
    // ✅ Используем domain-специфичный инвариант
    // Правила (2-50 символов, lowercase, pattern) внутри инварианта
    return NamespaceInvariant.instance
      .validate(value, Namespace.ENTITY_TYPE)
      .map((validValue: string) => new Namespace(validValue))
  }
  
  getValue(): string {
    return this._value
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
  private constructor(private readonly _value: string) {}
  
  // ✅ Валидация происходит ВНУТРИ Value Object
  static create(value: string): Validation<ValidationError[], ResourceName> {
    // Value Object делегирует валидацию инварианту
    return ResourceNameInvariant.instance
      .validate(value, 'ResourceName')
      .map((validValue: string) => new ResourceName(validValue))
      // ✅ Конструктор вызывается ПОСЛЕ успешной валидации
  }
}

// Использование
const result = ResourceName.create(input)
// Если result.isSuccess() → объект гарантированно валиден
```

### ❌ НЕПРАВИЛЬНО: Валидация СНАРУЖИ Value Object

#### Антипаттерн [#code]

```typescript
class ResourceName {
  // ❌ Public конструктор - можно обойти валидацию!
  constructor(private readonly value: string) {}
}

// ❌ Валидация снаружи - нарушение инкапсуляции
function createResourceName(value: string): Validation<ValidationError[], ResourceName> {
  return ResourceNameInvariant.instance.validate(value, 'ResourceName')
    .map((v: string) => new ResourceName(v))
}

// Проблема: можно создать невалидный объект
const invalid = new ResourceName('') // ❌ Никакой валидации!
```

### Роль инвариантов

**Инварианты - это переиспользуемые утилиты**, а не внешние валидаторы:

#### Инварианты как Domain Services [#code]

```typescript
// ✅ Инвариант - это Domain Service (DDD паттерн)
class ResourceNameInvariant implements IInvariant<string> {
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 100
  
  validate(value: string, entityType: string): Validation<ValidationError[], string> {
    // Переиспользуемая логика проверки инкапсулирована
    return ValidationCombinators.sequence([...])
  }
}

// ✅ Value Object делегирует валидацию Domain Service
class ResourceName {
  static create(value: string) {
    // Value Object делегирует, НО валидация происходит ВНУТРИ create()
    return ResourceNameInvariant.instance
      .validate(value, 'ResourceName')
      .map((v: string) => new ResourceName(v))
  }
}
```

**Аналогия**: Использование инварианта - это делегирование Domain Service. Value Object остается self-validating, но переиспользует логику.

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
result.fold(
  (error) => console.error(error),           // Обработка ошибки
  (validName) => processResource(validName)  // ✅ Гарантированно валиден
)
```

---

## 🎯 Domain-специфичные инварианты

### Зачем нужны?

**Правило**: Каждый Value Object должен иметь свой инвариант с правилами внутри (согласованность с UuidInvariant).

#### ❌ БЫЛО: Правила в Value Object

```typescript
// ❌ ПРОБЛЕМА: Правила в самом Value Object
class ResourceName {
  private static readonly MIN_LENGTH = 1  // ❌ Правила ТУТ
  private static readonly MAX_LENGTH = 100
  
  static create(value: string) {
    return CommonNotEmptySpec.for({ entityType: 'ResourceName' }).isSatisfiedBy(value)
      .chain(() => CommonLengthSpec.for({
        entityType: 'ResourceName',
        minLength: 1,
        maxLength: 100,
      }).isSatisfiedBy(value))
      .map(() => new ResourceName(value))
  }
}

class Namespace {
  private static readonly MIN_LENGTH = 2  // ❌ Правила ТУТ (дублирование подхода)
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/
  
  static create(value: string) {
    // ❌ Композиция спецификаций в каждом VO
    return ValidationCombinators.sequence([...])
  }
}
```

#### ✅ СТАЛО: Правила в инварианте (согласованность)

```typescript
// ✅ РЕШЕНИЕ: Правила ВНУТРИ инварианта
class ResourceNameInvariant implements IInvariant<string> {
  // ✅ Правила ЗДЕСЬ
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 100
  
  validate(value: string, entityType: string): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence([...])
  }
}

class NamespaceInvariant implements IInvariant<string> {
  // ✅ Правила ЗДЕСЬ
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/
  
  validate(value: string, entityType: string): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence([...])
  }
}

// Value Objects просто делегируют
class ResourceName {
  static create(value: string) {
    return ResourceNameInvariant.instance.validate(value, 'ResourceName')
      .map((v: string) => new ResourceName(v))
  }
}

class Namespace {
  static create(value: string) {
    return NamespaceInvariant.instance.validate(value, 'Namespace')
      .map((v: string) => new Namespace(v))
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
NamespaceInvariant.instance.validate(value, 'Namespace')

// vs инлайн валидация с magic regex
if (!/^[a-z0-9-_]+$/.test(value) || value.length < 2 || value.length > 50) {
  // ⛔ что это? какие правила?
}
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
