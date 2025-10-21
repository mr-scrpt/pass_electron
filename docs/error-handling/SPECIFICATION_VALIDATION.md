# Specification Pattern для валидации Value Objects

**Теги:** `#validation` `#specification` `#value-objects` `#invariants`

---

## 🎯 Применение Specification Pattern для валидации

Этот документ описывает **практическое применение** Specification Pattern для валидации инвариантов Value Objects в нашем проекте.

> 📖 **Теория:** См. [patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md) для полного описания паттерна

> 💡 **Архитектура:** См. [.docs-meta/VALIDATION_ARCHITECTURE.md](../../.docs-meta/VALIDATION_ARCHITECTURE.md) для полного плана архитектуры

---

## 📐 Архитектура валидации

### Обертка Validation [#code|#structure:]

```typescript
// src/shared/validation/Validation.ts  #structure:
import { Either, left, right } from '@sweet-monads/either'

/**
 * Результат валидации
 * Обертка над Either для изоляции библиотеки
 */
export type Validation<E, T> = Either<E, T>  // #interface:Validation

export const valid = <T>(value: T): Validation<never, T> => right(value)
export const invalid = <E>(error: E): Validation<E, never> => left(error)
```

### Базовый интерфейс [#code|#structure:|#interface:ISpecification]

```typescript
// src/shared/specification/ISpecification.ts  #structure:
import { Validation } from '@/shared/validation'  // #structure:

/**
 * Спецификация для валидации
 */
export interface ISpecification<T> {  // #interface:ISpecification
  isSatisfiedBy(value: T): Validation<any, T>
}
```

### Композитор спецификаций [#code|#structure:|#class:CompositeSpecification]

```typescript
// src/shared/specification/CompositeSpecification.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from './ISpecification'  // #structure:

export class CompositeSpecification<T> {  // #class:CompositeSpecification
  /**
   * Все спецификации должны пройти (AND)
   * Fail-fast: останавливается на первой ошибке
   */
  static allOf<T>(...specs: ISpecification<T>[]): ISpecification<T> {
    return {
      isSatisfiedBy: (value: T) => {
        for (const spec of specs) {
          const result = spec.isSatisfiedBy(value)
          if (result.isLeft()) return result
        }
        return valid(value)
      }
    }
  }

  /**
   * Накопление ВСЕХ ошибок
   */
  static allOfAccumulate<T, E = any>(...specs: ISpecification<T>[]): {
    isSatisfiedBy: (value: T) => Validation<E[], T>
  } {
    return {
      isSatisfiedBy: (value: T) => {
        const errors: E[] = []
        
        for (const spec of specs) {
          const result = spec.isSatisfiedBy(value)
          if (result.isLeft()) {
            errors.push(result.value)
          }
        }
        
        return errors.length > 0 ? invalid(errors) : valid(value)
      }
    }
  }
}
```

---

## 📚 Библиотека переиспользуемых спецификаций

### Строковые спецификации [#code|#structure:]

```typescript
// src/shared/specification/StringSpecifications.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from './ISpecification'  // #structure:

/**
 * Проверка на пустую строку
 */
export class NotEmptySpec implements ISpecification<string> {  // #class:NotEmptySpec
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value && value.trim()
      ? valid(value)
      : invalid(new ValidationError(this.entityType, "cannot be empty"))
  }
}

/**
 * Проверка диапазона длины
 */
export class LengthRangeSpec implements ISpecification<string> {  // #class:LengthRangeSpec
  constructor(
    private min: number,
    private max: number,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value.length >= this.min && value.length <= this.max
      ? valid(value)
      : invalid(new ValidationError(
          this.entityType,
          `must be ${this.min}-${this.max} characters`
        ))
  }
}

/**
 * Проверка по регулярному выражению
 */
export class PatternSpec implements ISpecification<string> {  // #class:PatternSpec
  constructor(
    private pattern: RegExp,
    private message: string,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return this.pattern.test(value)
      ? valid(value)
      : invalid(new ValidationError(this.entityType, this.message))
  }
}
```

### UUID спецификации [#code|#structure:]

```typescript
// src/shared/specification/UuidSpecifications.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from './ISpecification'  // #structure:

export class UuidV4Spec implements ISpecification<string> {  // #class:UuidV4Spec
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return UuidV4Spec.UUID_V4_REGEX.test(value)
      ? valid(value)
      : invalid(new ValidationError(this.entityType, `Invalid UUID: ${value}`))
  }
}
```

---

## 🎯 Использование в Value Objects

### Пример: Namespace [#code|#structure:|#class:Namespace]

```typescript
// src/domain/resource/value-objects/Namespace.ts  #structure:
import { Validation } from '@/shared/validation'  // #structure:
import { ValidationError } from '@/shared/specification'  // #structure:
import { CompositeSpecification } from '@/shared/specification'  // #structure:
import { 
  NotEmptySpec, 
  LengthRangeSpec, 
  PatternSpec 
} from '@/shared/specification'  // #structure:

export class Namespace {  // #class:Namespace
  private static readonly ENTITY_TYPE = "Namespace"
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/

  private constructor(private readonly _value: string) {}

  /**
   * Создать Namespace (fail-fast)
   */
  static create(value: string): Validation<ValidationError, Namespace> {
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec(Namespace.ENTITY_TYPE),
      new LengthRangeSpec(
        Namespace.MIN_LENGTH,
        Namespace.MAX_LENGTH,
        Namespace.ENTITY_TYPE
      ),
      new PatternSpec(
        Namespace.PATTERN,
        "must contain only lowercase letters, numbers, - and _",
        Namespace.ENTITY_TYPE
      )
    )

    return spec.isSatisfiedBy(value).map(v => new Namespace(v))
  }

  /**
   * Создать Namespace (accumulate - все ошибки)
   */
  static createWithAllErrors(
    value: string
  ): Validation<ValidationError[], Namespace> {
    const spec = CompositeSpecification.allOfAccumulate(
      new NotEmptySpec(Namespace.ENTITY_TYPE),
      new LengthRangeSpec(
        Namespace.MIN_LENGTH,
        Namespace.MAX_LENGTH,
        Namespace.ENTITY_TYPE
      ),
      new PatternSpec(
        Namespace.PATTERN,
        "must contain only lowercase letters, numbers, - and _",
        Namespace.ENTITY_TYPE
      )
    )

    return spec.isSatisfiedBy(value).map(v => new Namespace(v))
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

## 📁 Структура файлов [#structure:tree]

```
src/
├── shared/                                    #structure:
│   ├── validation/                            #structure:
│   │   ├── Validation.ts                      #structure:
│   │   └── index.ts                           #structure:
│   │
│   └── specification/                         #structure:
│       ├── ISpecification.ts                  #structure:
│       ├── CompositeSpecification.ts          #structure:
│       ├── StringSpecifications.ts            #structure:
│       ├── UuidSpecifications.ts              #structure:
│       └── index.ts                           #structure:
│
└── domain/
    ├── shared/
    │   └── errors/                            #structure:
    │       └── InvariantViolationError.ts     #structure:
    │
    └── resource/
        └── value-objects/                     #structure:
            ├── Namespace.ts                   #structure:
            ├── ResourceName.ts                #structure:
            └── ResourceId.ts                  #structure:
```

---

## 🎯 Best Practices

### 1. Используйте Validation вместо Either

```typescript
// ✅ ХОРОШО: Validation изолирует библиотеку
import { Validation, valid, invalid } from '@/shared/validation'

// ❌ ПЛОХО: Прямой импорт Either
import { Either, left, right } from '@sweet-monads/either'
```

### 2. Спецификации в src/shared/

```typescript
// ✅ ХОРОШО: Общие спецификации в shared
import { NotEmptySpec } from '@/shared/specification'

// ❌ ПЛОХО: Спецификации в domain
import { NotEmptySpec } from '@/domain/shared/specification'
```

### 3. Fail-fast для UI, Accumulate для API

```typescript
// ✅ UI: показываем первую ошибку
static create(value: string): Validation<Error, T> {
  const spec = CompositeSpecification.allOf(...)
  return spec.isSatisfiedBy(value).map(v => new T(v))
}

// ✅ API: возвращаем ВСЕ ошибки
static createWithAllErrors(value: string): Validation<Error[], T> {
  const spec = CompositeSpecification.allOfAccumulate(...)
  return spec.isSatisfiedBy(value).map(v => new T(v))
}
```

---

## 🔗 Связанные документы

- **[patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md)** - Полное описание Specification Pattern ⭐
- **[.docs-meta/VALIDATION_ARCHITECTURE.md](../../.docs-meta/VALIDATION_ARCHITECTURE.md)** - План архитектуры Validation
- **[INVARIANTS.md](./INVARIANTS.md)** - Инварианты и Shared Kernel
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Обработка ошибок
- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** - Either Pattern и монады
