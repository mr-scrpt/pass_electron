# Specification Pattern для валидации Value Objects

**Теги:** `#validation` `#specification` `#value-objects` `#invariants`

---

## 🎯 Применение Specification Pattern для валидации

Этот документ описывает **практическое применение** Specification Pattern для валидации инвариантов Value Objects в нашем проекте.

> 📖 **Теория:** См. [patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md) для полного описания паттерна

---

## 📐 Архитектура валидации

### Базовый интерфейс

```typescript
// src/domain/shared/specification/ISpecification.ts
import { Either } from '@sweet-monads/either'
import { InvariantViolationError } from '../errors/InvariantViolationError'

/**
 * Спецификация для валидации
 * Возвращает Either вместо boolean для обработки ошибок
 */
export interface ISpecification<T> {
  isSatisfiedBy(value: T): Either<InvariantViolationError, T>
}
```

### Композитор спецификаций

```typescript
// src/domain/shared/specification/CompositeSpecification.ts
import { Either, left, right } from '@sweet-monads/either'
import { ISpecification } from './ISpecification'
import { InvariantViolationError } from '../errors/InvariantViolationError'

export class CompositeSpecification<T> {
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
        return right(value)
      }
    }
  }

  /**
   * Накопление ВСЕХ ошибок
   * Для показа всех проблем валидации сразу
   */
  static allOfAccumulate<T>(...specs: ISpecification<T>[]): {
    isSatisfiedBy: (value: T) => Either<InvariantViolationError[], T>
  } {
    return {
      isSatisfiedBy: (value: T) => {
        const errors: InvariantViolationError[] = []
        
        for (const spec of specs) {
          const result = spec.isSatisfiedBy(value)
          if (result.isLeft()) {
            errors.push(result.value)
          }
        }
        
        return errors.length > 0 ? left(errors) : right(value)
      }
    }
  }
}
```

---

## 📚 Библиотека переиспользуемых спецификаций

### Строковые спецификации

```typescript
// src/domain/shared/specification/StringSpecifications.ts
import { Either, left, right } from '@sweet-monads/either'
import { ISpecification } from './ISpecification'
import { InvariantViolationError } from '../errors/InvariantViolationError'

/**
 * Проверка на пустую строку
 */
export class NotEmptySpec implements ISpecification<string> {
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Either<InvariantViolationError, string> {
    return value && value.trim()
      ? right(value)
      : left(new InvariantViolationError(this.entityType, "cannot be empty"))
  }
}

/**
 * Проверка диапазона длины
 */
export class LengthRangeSpec implements ISpecification<string> {
  constructor(
    private min: number,
    private max: number,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Either<InvariantViolationError, string> {
    return value.length >= this.min && value.length <= this.max
      ? right(value)
      : left(new InvariantViolationError(
          this.entityType,
          `must be ${this.min}-${this.max} characters`
        ))
  }
}

/**
 * Проверка по регулярному выражению
 */
export class PatternSpec implements ISpecification<string> {
  constructor(
    private pattern: RegExp,
    private message: string,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Either<InvariantViolationError, string> {
    return this.pattern.test(value)
      ? right(value)
      : left(new InvariantViolationError(this.entityType, this.message))
  }
}

/**
 * Проверка на lowercase
 */
export class LowercaseSpec implements ISpecification<string> {
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Either<InvariantViolationError, string> {
    return value === value.toLowerCase()
      ? right(value)
      : left(new InvariantViolationError(this.entityType, "must be lowercase"))
  }
}
```

### UUID спецификации

```typescript
// src/domain/shared/specification/UuidSpecifications.ts
import { Either, left, right } from '@sweet-monads/either'
import { ISpecification } from './ISpecification'
import { InvariantViolationError } from '../errors/InvariantViolationError'

/**
 * Проверка UUID v4
 */
export class UuidV4Spec implements ISpecification<string> {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Either<InvariantViolationError, string> {
    return UuidV4Spec.UUID_V4_REGEX.test(value)
      ? right(value)
      : left(new InvariantViolationError(
          this.entityType,
          `Invalid UUID format: ${value}`
        ))
  }
}
```

---

## 🎯 Использование в Value Objects

### Пример 1: Namespace

```typescript
// src/domain/resource/value-objects/Namespace.ts
import { Either } from "@sweet-monads/either"
import { InvariantViolationError } from "@/domain/shared"
import { CompositeSpecification } from "@/domain/shared/specification"
import { 
  NotEmptySpec, 
  LengthRangeSpec, 
  PatternSpec 
} from "@/domain/shared/specification/StringSpecifications"

export class Namespace {
  private static readonly ENTITY_TYPE = "Namespace"
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/

  private constructor(private readonly _value: string) {}

  /**
   * Fail-fast: останавливается на первой ошибке
   * Используется для UI форм (показываем одну ошибку за раз)
   */
  static create(value: string): Either<InvariantViolationError, Namespace> {
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
   * Accumulate: собирает ВСЕ ошибки
   * Используется для серверной валидации (возвращаем все проблемы сразу)
   */
  static createWithAllErrors(
    value: string
  ): Either<InvariantViolationError[], Namespace> {
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

### Пример 2: ResourceName

```typescript
// src/domain/resource/value-objects/ResourceName.ts
import { Either } from "@sweet-monads/either"
import { InvariantViolationError } from "@/domain/shared"
import { CompositeSpecification } from "@/domain/shared/specification"
import { 
  NotEmptySpec, 
  LengthRangeSpec 
} from "@/domain/shared/specification/StringSpecifications"

export class ResourceName {
  private static readonly ENTITY_TYPE = "ResourceName"
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 100

  private constructor(private readonly _value: string) {}

  static create(value: string): Either<InvariantViolationError, ResourceName> {
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec(ResourceName.ENTITY_TYPE),
      new LengthRangeSpec(
        ResourceName.MIN_LENGTH,
        ResourceName.MAX_LENGTH,
        ResourceName.ENTITY_TYPE
      )
    )

    return spec.isSatisfiedBy(value).map(v => new ResourceName(v))
  }

  getValue(): string {
    return this._value
  }

  equals(other: ResourceName): boolean {
    return this._value === other._value
  }
}
```

### Пример 3: ResourceId

```typescript
// src/domain/resource/value-objects/ResourceId.ts
import { Either } from "@sweet-monads/either"
import { InvariantViolationError } from "@/domain/shared"
import { CompositeSpecification } from "@/domain/shared/specification"
import { NotEmptySpec } from "@/domain/shared/specification/StringSpecifications"
import { UuidV4Spec } from "@/domain/shared/specification/UuidSpecifications"

export class ResourceId {
  private static readonly ENTITY_TYPE = 'ResourceId'
  
  private constructor(private readonly _value: string) {}

  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID())
  }

  static create(value: string): Either<InvariantViolationError, ResourceId> {
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec(ResourceId.ENTITY_TYPE),
      new UuidV4Spec(ResourceId.ENTITY_TYPE)
    )

    return spec.isSatisfiedBy(value).map(v => new ResourceId(v))
  }

  getValue(): string {
    return this._value
  }

  equals(other: ResourceId): boolean {
    return this._value === other._value
  }
}
```

---

## 🔧 Кастомные бизнес-спецификации

### Проверка на зарезервированные значения

```typescript
// src/domain/resource/specifications/ResourceSpecifications.ts
import { Either, left, right } from '@sweet-monads/either'
import { ISpecification } from '@/domain/shared/specification'
import { InvariantViolationError } from '@/domain/shared'

/**
 * Проверка на зарезервированные namespace
 */
export class NotReservedNamespaceSpec implements ISpecification<string> {
  private static readonly RESERVED = ['system', 'admin', 'root', 'default']
  
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Either<InvariantViolationError, string> {
    if (NotReservedNamespaceSpec.RESERVED.includes(value.toLowerCase())) {
      return left(
        new InvariantViolationError(
          this.entityType,
          `"${value}" is a reserved namespace`
        )
      )
    }
    return right(value)
  }
}
```

### Async спецификация: проверка уникальности

```typescript
/**
 * Async спецификация: проверка уникальности в БД
 */
export class UniqueNamespaceSpec implements ISpecification<string> {
  constructor(
    private checkUnique: (value: string) => Promise<boolean>,
    private entityType: string
  ) {}
  
  async isSatisfiedBy(value: string): Promise<Either<InvariantViolationError, string>> {
    const isUnique = await this.checkUnique(value)
    if (!isUnique) {
      return left(
        new InvariantViolationError(this.entityType, `"${value}" already exists`)
      )
    }
    return right(value)
  }
}
```

### Использование кастомных спецификаций

```typescript
// Добавляем проверку на зарезервированные namespace
static create(value: string): Either<InvariantViolationError, Namespace> {
  const spec = CompositeSpecification.allOf(
    new NotEmptySpec(Namespace.ENTITY_TYPE),
    new LengthRangeSpec(2, 50, Namespace.ENTITY_TYPE),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', Namespace.ENTITY_TYPE),
    new NotReservedNamespaceSpec(Namespace.ENTITY_TYPE)  // ✨ Кастомная!
  )

  return spec.isSatisfiedBy(value).map(v => new Namespace(v))
}

// Async валидация с проверкой уникальности
static async createUnique(
  value: string,
  repository: INamespaceRepository
): Promise<Either<InvariantViolationError, Namespace>> {
  // Сначала sync валидация
  const syncSpec = CompositeSpecification.allOf(
    new NotEmptySpec(Namespace.ENTITY_TYPE),
    new LengthRangeSpec(2, 50, Namespace.ENTITY_TYPE),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', Namespace.ENTITY_TYPE)
  )

  const syncResult = syncSpec.isSatisfiedBy(value)
  if (syncResult.isLeft()) return syncResult

  // Потом async проверка
  const uniqueSpec = new UniqueNamespaceSpec(
    (v) => repository.isUnique(v),
    Namespace.ENTITY_TYPE
  )

  return (await uniqueSpec.isSatisfiedBy(value)).map(v => new Namespace(v))
}
```

---

## 🧪 Тестирование

### Тестирование отдельных спецификаций

```typescript
// tests/domain/shared/specification/NotEmptySpec.test.ts
import { NotEmptySpec } from '@/domain/shared/specification/StringSpecifications'

describe('NotEmptySpec', () => {
  const spec = new NotEmptySpec('TestEntity')

  it('should pass for non-empty string', () => {
    const result = spec.isSatisfiedBy('test')
    expect(result.isRight()).toBe(true)
  })

  it('should fail for empty string', () => {
    const result = spec.isSatisfiedBy('')
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('cannot be empty')
    }
  })

  it('should fail for whitespace only', () => {
    const result = spec.isSatisfiedBy('   ')
    expect(result.isLeft()).toBe(true)
  })
})
```

### Тестирование Value Object с спецификациями

```typescript
// tests/domain/resource/value-objects/Namespace.test.ts
import { Namespace } from '@/domain/resource/value-objects/Namespace'

describe('Namespace', () => {
  describe('create (fail-fast)', () => {
    it('should create valid namespace', () => {
      const result = Namespace.create('my-namespace')
      expect(result.isRight()).toBe(true)
    })

    it('should fail for empty value', () => {
      const result = Namespace.create('')
      expect(result.isLeft()).toBe(true)
      if (result.isLeft()) {
        expect(result.value.message).toContain('cannot be empty')
      }
    })

    it('should fail for too short value', () => {
      const result = Namespace.create('a')
      expect(result.isLeft()).toBe(true)
      if (result.isLeft()) {
        expect(result.value.message).toContain('must be 2-50 characters')
      }
    })

    it('should fail for invalid pattern', () => {
      const result = Namespace.create('My-Namespace')  // uppercase
      expect(result.isLeft()).toBe(true)
      if (result.isLeft()) {
        expect(result.value.message).toContain('lowercase')
      }
    })
  })

  describe('createWithAllErrors (accumulate)', () => {
    it('should accumulate all errors', () => {
      const result = Namespace.createWithAllErrors('A')  // uppercase + too short
      
      expect(result.isLeft()).toBe(true)
      if (result.isLeft()) {
        expect(result.value).toHaveLength(2)  // 2 ошибки!
        expect(result.value[0].message).toContain('must be 2-50 characters')
        expect(result.value[1].message).toContain('lowercase')
      }
    })
  })
})
```

---

## 🎯 Best Practices

### 1. Одна спецификация = одно правило

```typescript
// ✅ ХОРОШО: Каждая спецификация проверяет одно правило
new NotEmptySpec('Namespace')
new LengthRangeSpec(2, 50, 'Namespace')
new PatternSpec(/^[a-z0-9-_]+$/, 'invalid', 'Namespace')

// ❌ ПЛОХО: Одна спецификация проверяет всё
class NamespaceValidationSpec implements ISpecification<string> {
  isSatisfiedBy(value: string) {
    // Проверяет и пустоту, и длину, и паттерн
  }
}
```

### 2. Переиспользуйте общие спецификации

```typescript
// ✅ ХОРОШО: Общие спецификации в shared/
import { NotEmptySpec, LengthRangeSpec } from '@/domain/shared/specification'

// ❌ ПЛОХО: Дублируем спецификации в каждом модуле
class NamespaceNotEmptySpec { ... }
class ResourceNameNotEmptySpec { ... }
```

### 3. Бизнес-специфичные спецификации в модуле

```typescript
// ✅ ХОРОШО: Специфичные правила рядом с Value Object
// src/domain/resource/specifications/ResourceSpecifications.ts
export class NotReservedNamespaceSpec { ... }

// src/domain/resource/value-objects/Namespace.ts
import { NotReservedNamespaceSpec } from '../specifications/ResourceSpecifications'
```

### 4. Используйте fail-fast для UI форм

```typescript
// ✅ ХОРОШО: Показываем первую ошибку
static create(value: string): Either<InvariantViolationError, Namespace> {
  const spec = CompositeSpecification.allOf(...)  // fail-fast
  return spec.isSatisfiedBy(value).map(v => new Namespace(v))
}
```

### 5. Используйте accumulate для серверной валидации

```typescript
// ✅ ХОРОШО: Возвращаем ВСЕ ошибки сразу
static createWithAllErrors(
  value: string
): Either<InvariantViolationError[], Namespace> {
  const spec = CompositeSpecification.allOfAccumulate(...)  // accumulate
  return spec.isSatisfiedBy(value).map(v => new Namespace(v))
}
```

---

## 📁 Структура файлов

```
src/domain/
├── shared/
│   ├── specification/
│   │   ├── ISpecification.ts              # Базовый интерфейс
│   │   ├── CompositeSpecification.ts      # Композитор
│   │   ├── StringSpecifications.ts        # Общие строковые спецификации
│   │   └── UuidSpecifications.ts          # UUID спецификации
│   └── errors/
│       └── InvariantViolationError.ts
│
└── resource/
    ├── specifications/
    │   └── ResourceSpecifications.ts      # Бизнес-специфичные спецификации
    └── value-objects/
        ├── Namespace.ts                   # Использует спецификации
        ├── ResourceName.ts
        └── ResourceId.ts
```

---

## 🔗 Связанные документы

- **[patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md)** - Полное описание Specification Pattern ⭐
- **[INVARIANTS.md](./INVARIANTS.md)** - Инварианты и Shared Kernel
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Обработка ошибок
- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** - Either Pattern и монады
