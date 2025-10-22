# Validation & Specification Pattern - Согласованный подход

**Дата:** 2025-01-22  
**Статус:** ✅ Согласовано  
**Версия:** 1.0

---

## 🎯 Основные решения

### 1. Библиотека: @sweet-monads/either

**Почему:**
- ✅ `mergeInMany` - накопление ВСЕХ ошибок (идеально для форм)
- ✅ `mapLeft` - трансформация ошибок
- ✅ Легкая (~2kb)
- ✅ Right/Left терминология (классическая Either монада)

**Установка:**
```bash
pnpm add @sweet-monads/either
```

---

### 2. Фасад над библиотекой

**Цель:** Изолировать библиотеку, упростить замену в будущем

**Файл:** `src/shared/validation/Validation.ts`

```typescript
import { Either, left, right } from '@sweet-monads/either'

export type Validation<E, T> = Either<E, T>

export const valid = <T>(value: T): Validation<never, T> => right(value)
export const invalid = <E>(error: E): Validation<E, never> => left(error)

/**
 * Создать Validation на основе условия
 * 
 * ЕДИНСТВЕННОЕ место где используется тернарник для создания Validation
 * Аналоги: fp-ts.fromPredicate, Ramda.ifElse, Haskell guards
 * 
 * Тернарник здесь неизбежен - это фундаментальная операция условного ветвления
 */
export const fromCondition = <E, T>(
  condition: boolean,
  value: T,
  error: E
): Validation<E, T> => {
  return condition ? valid(value) : invalid(error)
}
```

---

### 3. Fluent API для условной валидации

**Файл:** `src/shared/validation/helpers.ts`

```typescript
import { Validation, fromCondition } from './Validation'

class ValidationBuilder<T> {
  constructor(
    private readonly condition: boolean,
    private readonly value: T
  ) {}

  valid(): ValidBranch<T> {
    return new ValidBranch(this.condition, this.value)
  }
}

class ValidBranch<T> {
  constructor(
    private readonly condition: boolean,
    private readonly value: T
  ) {}

  invalid<E>(error: E): Validation<E, T> {
    return fromCondition(this.condition, this.value, error)
  }
}

/**
 * Fluent API для условной валидации
 * 
 * @example
 * isTrue(value && value.trim().length > 0, value)
 *   .valid()
 *   .invalid(new ValidationError('Entity', 'cannot be empty'))
 */
export function isTrue<T>(condition: boolean, value: T): ValidationBuilder<T> {
  return new ValidationBuilder(condition, value)
}
```

---

### 4. Комбинаторы для работы с валидацией

**Файл:** `src/shared/validation/ValidationCombinators.ts`

```typescript
import { mergeInMany } from '@sweet-monads/either'
import { Validation } from './Validation'

export class ValidationCombinators {
  /**
   * Накопление ВСЕХ ошибок валидации
   * Использует mergeInMany из @sweet-monads/either
   * 
   * @returns Validation<E[], T[]> - массив ошибок ИЛИ массив успешных значений
   */
  static accumulate<E, T>(
    validations: Validation<E, T>[]
  ): Validation<E[], T[]> {
    return mergeInMany(validations)
  }

  /**
   * Применить функцию к успешным значениям
   * Если есть ошибки - вернуть их
   * 
   * @example
   * ValidationCombinators.sequence(
   *   [namespaceResult, nameResult],
   *   ([ns, name]) => new Resource(ns, name)
   * )
   */
  static sequence<E, T, U>(
    validations: Validation<E, T>[],
    fn: (values: T[]) => U
  ): Validation<E[], U> {
    return mergeInMany(validations).map(fn)
  }
}
```

---

## 🎯 Specification Pattern

### 5. ISpecification интерфейс

**Файл:** `src/shared/specification/ISpecification.ts`

```typescript
import { Validation } from '@/shared/validation'
import { ValidationError } from './ValidationError'

/**
 * Спецификация для валидации
 * Возвращает Validation вместо boolean для накопления ошибок
 */
export interface ISpecification<T> {
  isSatisfiedBy(value: T): Validation<ValidationError, T>
}
```

---

### 6. ValidationError

**Файл:** `src/shared/specification/ValidationError.ts`

```typescript
/**
 * Ошибка валидации
 * Используется в спецификациях для описания нарушений правил
 */
export class ValidationError extends Error {
  constructor(
    public readonly entityType: string,
    public readonly message: string
  ) {
    super(`${entityType}: ${message}`)
    this.name = 'ValidationError'
  }
}
```

---

### 7. Общие спецификации (Common)

**⚠️ ВАЖНО:** Префикс `Common` показывает что это базовые классы для создания синглтонов в Domain Layer

#### CommonLengthSpec

**Файл:** `src/shared/specification/common/CommonLengthSpec.ts`

```typescript
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '../ISpecification'
import { ValidationError } from '../ValidationError'

/**
 * Общая спецификация для проверки длины строки
 * 
 * ⚠️ НЕ ИСПОЛЬЗОВАТЬ НАПРЯМУЮ В DOMAIN LAYER!
 * Создавайте синглтоны в domain/specifications/ с фиксированной конфигурацией
 * 
 * @example
 * // ❌ НЕПРАВИЛЬНО - использование напрямую
 * new CommonLengthSpec('Namespace', 2, 50)
 * 
 * // ✅ ПРАВИЛЬНО - создать синглтон в domain/specifications/
 * export const NAMESPACE_LENGTH_SPEC = new CommonLengthSpec('Namespace', 2, 50)
 */
export class CommonLengthSpec implements ISpecification<string> {
  constructor(
    private readonly entityType: string,
    private readonly minLength: number,
    private readonly maxLength: number
  ) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(
      value.length >= this.minLength && value.length <= this.maxLength,
      value
    )
      .valid()
      .invalid(new ValidationError(
        this.entityType,
        `must be ${this.minLength}-${this.maxLength} characters`
      ))
  }
}
```

#### CommonPatternSpec

**Файл:** `src/shared/specification/common/CommonPatternSpec.ts`

```typescript
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '../ISpecification'
import { ValidationError } from '../ValidationError'

/**
 * Общая спецификация для проверки по регулярному выражению
 * 
 * ⚠️ НЕ ИСПОЛЬЗОВАТЬ НАПРЯМУЮ В DOMAIN LAYER!
 */
export class CommonPatternSpec implements ISpecification<string> {
  constructor(
    private readonly entityType: string,
    private readonly pattern: RegExp,
    private readonly message: string
  ) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(this.pattern.test(value), value)
      .valid()
      .invalid(new ValidationError(this.entityType, this.message))
  }
}
```

#### CommonNotEmptySpec

**Файл:** `src/shared/specification/common/CommonNotEmptySpec.ts`

```typescript
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '../ISpecification'
import { ValidationError } from '../ValidationError'

/**
 * Общая спецификация для проверки на пустоту
 * 
 * ⚠️ НЕ ИСПОЛЬЗОВАТЬ НАПРЯМУЮ В DOMAIN LAYER!
 */
export class CommonNotEmptySpec implements ISpecification<string> {
  constructor(private readonly entityType: string) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(value && value.trim().length > 0, value)
      .valid()
      .invalid(new ValidationError(this.entityType, 'cannot be empty'))
  }
}
```

---

### 8. Public API для Shared Layer

**Файл:** `src/shared/specification/index.ts`

```typescript
export type { ISpecification } from './ISpecification'
export { ValidationError } from './ValidationError'

// ⚠️ Общие спецификации - НЕ использовать напрямую в Domain!
// Создавайте синглтоны в domain/specifications/
export { CommonLengthSpec } from './common/CommonLengthSpec'
export { CommonPatternSpec } from './common/CommonPatternSpec'
export { CommonNotEmptySpec } from './common/CommonNotEmptySpec'
```

**Файл:** `src/shared/validation/index.ts`

```typescript
export type { Validation } from './Validation'
export { valid, invalid, fromCondition } from './Validation'
export { isTrue } from './helpers'
export { ValidationCombinators } from './ValidationCombinators'
```

---

## 🎯 Domain Layer - Спецификации

### 9. Синглтоны для доменных сущностей

**Принцип:** Бизнес-правила (конфигурация) инкапсулированы в синглтонах

#### Namespace спецификации

**Файл:** `src/domain/resource/specifications/namespace-specs.ts`

```typescript
import { 
  CommonLengthSpec,
  CommonPatternSpec,
  CommonNotEmptySpec
} from '@/shared/specification'

/**
 * Спецификации для Namespace
 * Синглтоны с фиксированной конфигурацией (бизнес-правила)
 */

export const NAMESPACE_NOT_EMPTY_SPEC = new CommonNotEmptySpec('Namespace')

export const NAMESPACE_LENGTH_SPEC = new CommonLengthSpec('Namespace', 2, 50)

export const NAMESPACE_PATTERN_SPEC = new CommonPatternSpec(
  'Namespace',
  /^[a-z0-9-_]+$/,
  'must contain only lowercase letters, numbers, - and _'
)
```

#### Бизнес-специфичные спецификации

**Файл:** `src/domain/resource/specifications/NotReservedNamespaceSpec.ts`

```typescript
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification, ValidationError } from '@/shared/specification'

/**
 * Бизнес-правило: некоторые namespace зарезервированы системой
 */
export class NotReservedNamespaceSpec implements ISpecification<string> {
  private static readonly RESERVED_NAMESPACES = [
    'system',
    'admin',
    'root',
    'config',
    'settings'
  ]

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    const isNotReserved = !NotReservedNamespaceSpec.RESERVED_NAMESPACES.includes(
      value.toLowerCase()
    )
    
    return isTrue(isNotReserved, value)
      .valid()
      .invalid(new ValidationError(
        'Namespace',
        `"${value}" is a reserved namespace and cannot be used`
      ))
  }
}

export const NOT_RESERVED_NAMESPACE_SPEC = new NotReservedNamespaceSpec()
```

#### Public API для спецификаций

**Файл:** `src/domain/resource/specifications/index.ts`

```typescript
// Namespace спецификации
export {
  NAMESPACE_NOT_EMPTY_SPEC,
  NAMESPACE_LENGTH_SPEC,
  NAMESPACE_PATTERN_SPEC
} from './namespace-specs'

export { 
  NotReservedNamespaceSpec,
  NOT_RESERVED_NAMESPACE_SPEC 
} from './NotReservedNamespaceSpec'

// ResourceName спецификации
export {
  RESOURCE_NAME_NOT_EMPTY_SPEC,
  RESOURCE_NAME_LENGTH_SPEC,
  RESOURCE_NAME_PATTERN_SPEC
} from './resource-name-specs'

// CustomField спецификации
export {
  CUSTOM_FIELD_KEY_NOT_EMPTY_SPEC,
  CUSTOM_FIELD_KEY_LENGTH_SPEC,
  CUSTOM_FIELD_KEY_PATTERN_SPEC,
  CUSTOM_FIELD_VALUE_LENGTH_SPEC
} from './custom-field-specs'
```

---

## 🎯 Domain Layer - Value Objects

### 10. Использование спецификаций в Value Objects

**Паттерн:** Композиция спецификаций через `ValidationCombinators.sequence`

**Файл:** `src/domain/resource/value-objects/Namespace.ts`

```typescript
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ValidationError } from '@/shared/specification'
import {
  NAMESPACE_NOT_EMPTY_SPEC,
  NAMESPACE_LENGTH_SPEC,
  NAMESPACE_PATTERN_SPEC,
  NOT_RESERVED_NAMESPACE_SPEC
} from '../specifications'

export class Namespace {
  private constructor(private readonly _value: string) {}

  /**
   * Создать Namespace с валидацией
   * Композиция общих и бизнес-специфичных спецификаций
   */
  static create(value: string): Validation<ValidationError[], Namespace> {
    const specs = [
      NAMESPACE_NOT_EMPTY_SPEC,        // Общая спецификация
      NAMESPACE_LENGTH_SPEC,           // Общая спецификация
      NAMESPACE_PATTERN_SPEC,          // Общая спецификация
      NOT_RESERVED_NAMESPACE_SPEC      // Бизнес-специфичная
    ]

    return ValidationCombinators.sequence(
      specs.map(spec => spec.isSatisfiedBy(value)),
      () => new Namespace(value)
    )
  }

  getValue(): string {
    return this._value
  }

  equals(other: Namespace): boolean {
    return this._value === other._value
  }
}
```

---

## 🎯 Единый стиль валидации во всех слоях

### Value Objects (Domain):
```typescript
const specs = [NAMESPACE_NOT_EMPTY_SPEC, NAMESPACE_LENGTH_SPEC, NAMESPACE_PATTERN_SPEC]
return ValidationCombinators.sequence(
  specs.map(spec => spec.isSatisfiedBy(value)),
  () => new Namespace(value)
)
```

### Entity (Domain):
```typescript
const specs = [CUSTOM_FIELD_KEY_NOT_EMPTY_SPEC, CUSTOM_FIELD_KEY_LENGTH_SPEC]
return ValidationCombinators.accumulate(
  specs.map(spec => spec.isSatisfiedBy(key))
).map(() => new CustomField(...))
```

### Aggregate (Domain):
```typescript
return CustomField.create(key, value)  // Использует спецификации внутри
  .map(field => new Resource(...))
```

### Command Handler (Application):
```typescript
const resourceResult = Resource.create(...)  // Использует спецификации через Domain
if (resourceResult.isLeft()) return resourceResult
```

### Query Handler (Application):
```typescript
const specs = [NAMESPACE_NOT_EMPTY_SPEC, NAMESPACE_LENGTH_SPEC]
const validation = ValidationCombinators.accumulate(
  specs.map(spec => spec.isSatisfiedBy(query.namespace))
)
```

---

## 📊 Структура проекта

```
src/
├── shared/
│   ├── validation/
│   │   ├── Validation.ts              # Фасад над @sweet-monads/either
│   │   ├── helpers.ts                 # isTrue fluent API
│   │   ├── ValidationCombinators.ts   # accumulate, sequence
│   │   └── index.ts                   # Public API
│   │
│   └── specification/
│       ├── ISpecification.ts          # Интерфейс спецификации
│       ├── ValidationError.ts         # Ошибка валидации
│       ├── common/
│       │   ├── CommonLengthSpec.ts    # Общая спецификация длины
│       │   ├── CommonPatternSpec.ts   # Общая спецификация паттерна
│       │   └── CommonNotEmptySpec.ts  # Общая спецификация пустоты
│       └── index.ts                   # Public API
│
└── domain/
    └── resource/
        ├── specifications/
        │   ├── namespace-specs.ts              # Синглтоны для Namespace
        │   ├── NotReservedNamespaceSpec.ts     # Бизнес-правило
        │   ├── resource-name-specs.ts          # Синглтоны для ResourceName
        │   ├── custom-field-specs.ts           # Синглтоны для CustomField
        │   └── index.ts                        # Public API
        │
        └── value-objects/
            ├── Namespace.ts                    # Использует спецификации
            ├── ResourceName.ts                 # Использует спецификации
            └── ResourceId.ts                   # Использует спецификации
```

---

## 🎯 План внедрения

### Этап 1: Shared Layer (базовая инфраструктура)
1. ⏳ Установить `@sweet-monads/either`
2. ⏳ Создать `src/shared/validation/` (Validation, helpers, ValidationCombinators)
3. ⏳ Создать `src/shared/specification/` (ISpecification, ValidationError)
4. ⏳ Создать `src/shared/specification/common/` (Common* спецификации)

### Этап 2: Domain Layer - Value Objects
1. ⏳ Создать `src/domain/resource/specifications/` (синглтоны)
2. ⏳ Реализовать `Namespace.create()` с валидацией
3. ⏳ Реализовать `ResourceName.create()` с валидацией
4. ⏳ Реализовать `ResourceId.create()` с валидацией

### Этап 3: Domain Layer - Entity
1. ⏳ Реализовать `CustomField.create()` с валидацией
2. ⏳ Реализовать `CustomField.updateValue()` с валидацией

### Этап 4: Domain Layer - Aggregate
1. ⏳ Реализовать `Resource.create()` с валидацией
2. ⏳ Реализовать `Resource.addCustomField()` с валидацией
3. ⏳ Реализовать `Resource.updateCustomField()` с валидацией

### Этап 5: Application Layer
1. ⏳ Command Handlers - использование валидации через Domain
2. ⏳ Query Handlers - валидация входных параметров

---

## 🎯 Ключевые принципы

1. ✅ **Единый стиль** - везде используем `specs.map(spec => spec.isSatisfiedBy(value))`
2. ✅ **Переиспользование** - Common* спецификации для общих правил
3. ✅ **Инкапсуляция** - бизнес-правила в синглтонах Domain Layer
4. ✅ **Композиция** - легко комбинировать спецификации
5. ✅ **Накопление ошибок** - `ValidationCombinators.accumulate` собирает ВСЕ ошибки
6. ✅ **Type-safe** - TypeScript проверяет типы на этапе компиляции
7. ✅ **Dependency Rule** - Shared не знает о Domain
8. ✅ **Fluent API** - `isTrue(condition, value).valid().invalid(error)`

---

## 📚 Связанные документы

- `docs/error-handling/INVARIANTS.md` - инварианты и валидация
- `docs/error-handling/ERROR_ESCALATION.md` - Result Pattern и монады
- `docs/TYPES_AND_ENTITIES.md` - Value Objects vs DTO
- `docs/DDD_AND_CLEAN_ARCHITECTURE.md` - DDD паттерны
