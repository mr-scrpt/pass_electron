# Specification Pattern для валидации Value Objects

---

## 🎯 Применение Specification Pattern для валидации

Этот документ описывает **практическое применение** Specification Pattern для валидации инвариантов Value Objects в нашем проекте.

> 📖 **Теория:** См. [patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md) для полного описания паттерна

> 💡 **Эволюция подхода:** См. [VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md) для полного пути от try-catch к Specification Pattern

---

## 📑 Содержание

1. [Архитектура валидации](#-архитектура-валидации)
2. [Библиотека переиспользуемых спецификаций](#-библиотека-переиспользуемых-спецификаций)
3. [Бизнес-специфичные спецификации](#-бизнес-специфичные-спецификации) ⭐
4. [Использование в Value Objects](#-использование-в-value-objects)
5. [Использование в Application Layer](#-использование-в-application-layer)
6. [Тестирование спецификаций](#-тестирование-спецификаций)
7. [Best Practices](#-best-practices)
8. [Структура файлов](#-структура-файлов)


## 📐 Архитектура валидации

### Обертка Validation [#code]

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

### Базовый интерфейс [#interface:ISpecification|#code]

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

### ValidationCombinators для накопления ошибок [#class:ValidationCombinators|#code|#structure:path]

```typescript
// src/shared/validation/ValidationCombinators.ts
import { mergeInMany } from '@sweet-monads/either'
import { Validation } from './Validation'

/**
 * Комбинаторы для работы с валидацией
 * Используют функциональный подход (монады) вместо императивного
 */
export class ValidationCombinators {
  /**
   * Накопление ВСЕХ ошибок валидации
   * Использует mergeInMany из @sweet-monads/either
   * 
   * @returns Either<E[], T[]> - массив ошибок ИЛИ массив успешных значений
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
   * Это applicative functor pattern:
   * - Если все validations успешны -> применяем fn к значениям
   * - Если есть ошибки -> возвращаем массив ошибок
   */
  static sequence<E, T, U>(
    validations: Validation<E, T>[],
    fn: (values: T[]) => U
  ): Validation<E[], U> {
    return mergeInMany(validations).map(fn)
  }
}
```

> 📖 **Детальное описание:** См. [VALIDATION_COMBINATORS.md](./VALIDATION_COMBINATORS.md) для полного объяснения работы `mergeInMany` и преимуществ функционального подхода.

---

## 📚 Библиотека переиспользуемых спецификаций

### Строковые спецификации [#code]

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

### UUID спецификации [#code]

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

## 🏢 Бизнес-специфичные спецификации

### Разница между общими и бизнес-специфичными

**Общие спецификации** (`src/shared/specification/`):
- ✅ Переиспользуемые правила (NotEmpty, LengthRange, Pattern, UUID)
- ✅ Не зависят от бизнес-логики
- ✅ Могут использоваться в любом домене

**Бизнес-специфичные** (`src/domain/{context}/specifications/`):
- ✅ Содержат бизнес-правила конкретного домена
- ✅ Могут зависеть от других доменных сущностей
- ✅ Могут требовать доступ к Repository
- ✅ Инкапсулируют Ubiquitous Language

### Примеры бизнес-специфичных спецификаций [#code]

#### 1. NotReservedNamespaceSpec - проверка зарезервированных имен [#class:NotReservedNamespaceSpec]

```typescript
// src/domain/resource/specifications/NotReservedNamespaceSpec.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from '@/shared/specification'  // #structure:
import { ValidationError } from '@/shared/specification'  // #structure:

/**
 * Бизнес-правило: некоторые namespace зарезервированы системой
 */
export class NotReservedNamespaceSpec implements ISpecification<string> {  // #class:NotReservedNamespaceSpec
  private static readonly RESERVED_NAMESPACES = [
    'system',
    'admin',
    'root',
    'config',
    'settings'
  ]

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    const isReserved = NotReservedNamespaceSpec.RESERVED_NAMESPACES.includes(
      value.toLowerCase()
    )

    return !isReserved
      ? valid(value)
      : invalid(new ValidationError(
          'Namespace',
          `"${value}" is a reserved namespace and cannot be used`
        ))
  }
}
```

#### 2. UniqueResourceNameSpec - проверка уникальности через Repository [#class:UniqueResourceNameSpec]

```typescript
// src/domain/resource/specifications/UniqueResourceNameSpec.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from '@/shared/specification'  // #structure:
import { ValidationError } from '@/shared/specification'  // #structure:
import { IResourceRepository } from '../repositories/IResourceRepository'  // #structure:
import { Namespace } from '../value-objects/Namespace'  // #structure:

/**
 * Бизнес-правило: имя ресурса должно быть уникальным в пределах namespace
 * 
 * ВАЖНО: Эта спецификация асинхронная, т.к. требует доступ к Repository
 */
export class UniqueResourceNameSpec {  // #class:UniqueResourceNameSpec
  constructor(
    private readonly repository: IResourceRepository,
    private readonly namespace: Namespace
  ) {}

  async isSatisfiedBy(name: string): Promise<Validation<ValidationError, string>> {
    const existing = await this.repository.findByNamespaceAndName(
      this.namespace,
      name
    )

    return !existing
      ? valid(name)
      : invalid(new ValidationError(
          'ResourceName',
          `Resource "${name}" already exists in namespace "${this.namespace.getValue()}"`
        ))
  }
}
```

#### 3. ValidPasswordStrengthSpec - проверка сложности пароля [#class:ValidPasswordStrengthSpec]

```typescript
// src/domain/resource/specifications/ValidPasswordStrengthSpec.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from '@/shared/specification'  // #structure:
import { ValidationError } from '@/shared/specification'  // #structure:

/**
 * Бизнес-правило: пароль должен соответствовать требованиям безопасности
 */
export class ValidPasswordStrengthSpec implements ISpecification<string> {  // #class:ValidPasswordStrengthSpec
  private static readonly MIN_LENGTH = 8
  
  // Коллекция правил валидации
  private static readonly RULES = [
    {
      enabled: true,
      test: (value: string) => value.length >= ValidPasswordStrengthSpec.MIN_LENGTH,
      message: `at least ${ValidPasswordStrengthSpec.MIN_LENGTH} characters`
    },
    {
      enabled: true,
      test: (value: string) => /[A-Z]/.test(value),
      message: 'at least one uppercase letter'
    },
    {
      enabled: true,
      test: (value: string) => /[a-z]/.test(value),
      message: 'at least one lowercase letter'
    },
    {
      enabled: true,
      test: (value: string) => /\d/.test(value),
      message: 'at least one digit'
    },
    {
      enabled: true,
      test: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
      message: 'at least one special character'
    }
  ]

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    // Собираем ошибки из правил
    const errors = ValidPasswordStrengthSpec.RULES
      .filter(rule => rule.enabled && !rule.test(value))
      .map(rule => rule.message)

    return errors.length === 0
      ? valid(value)
      : invalid(new ValidationError(
          'Password',
          `Password must contain: ${errors.join(', ')}`
        ))
  }
}
```

### Композиция общих и бизнес-специфичных спецификаций [#code]

```typescript
// src/domain/resource/value-objects/Namespace.ts  #structure:
import { Validation, ValidationCombinators } from '@/shared/validation'  // #structure:
import { ValidationError } from '@/shared/specification'  // #structure:
import { 
  NotEmptySpec,      // ✅ Общая
  LengthRangeSpec,   // ✅ Общая
  PatternSpec        // ✅ Общая
} from '@/shared/specification'  // #structure:
import { 
  NotReservedNamespaceSpec  // ✅ Бизнес-специфичная
} from '../specifications/NotReservedNamespaceSpec'  // #structure:

export class Namespace {  // #class:Namespace
  static create(value: string): Validation<ValidationError[], Namespace> {
    // Комбинируем общие и бизнес-специфичные спецификации
    const specs = [
      new NotEmptySpec('Namespace'),           // Общая
      new LengthRangeSpec(2, 50, 'Namespace'), // Общая
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace'), // Общая
      new NotReservedNamespaceSpec()           // Бизнес-специфичная! ⭐
    ]

    // ValidationCombinators.sequence накапливает ВСЕ ошибки
    return ValidationCombinators.sequence(
      specs.map(spec => spec.isSatisfiedBy(value)),
      () => new Namespace(value)
    )
  }
}
```

---

## 🎯 Использование в Value Objects

### Пример: Namespace [#code|#structure:|#class:Namespace]

```typescript
// src/domain/resource/value-objects/Namespace.ts  #structure:
import { Validation, ValidationCombinators } from '@/shared/validation'  // #structure:
import { ValidationError } from '@/shared/specification'  // #structure:
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
   * Создать Namespace с накоплением ВСЕХ ошибок
   */
  static create(value: string): Validation<ValidationError[], Namespace> {
    const specs = [
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
    ]

    // ValidationCombinators.sequence накапливает ВСЕ ошибки
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

## 🔄 Использование в Application Layer

### Command Handler с валидацией [#code]

```typescript
// src/application/commands/handlers/CreateResourceHandler.ts  #structure:
import { Validation } from '@/shared/validation'  // #structure:
import { ValidationError } from '@/shared/specification'  // #structure:
import { Namespace } from '@/domain/resource/value-objects/Namespace'  // #structure:
import { ResourceName } from '@/domain/resource/value-objects/ResourceName'  // #structure:
import { IResourceRepository } from '@/domain/resource/repositories/IResourceRepository'  // #structure:
import { UniqueResourceNameSpec } from '@/domain/resource/specifications/UniqueResourceNameSpec'  // #structure:

export class CreateResourceHandler {  // #class:CreateResourceHandler
  constructor(private readonly repository: IResourceRepository) {}

  async execute(command: CreateResourceCommand): Promise<Validation<ValidationError[], Resource>> {
    // 1. Валидация Namespace (синхронная)
    const namespaceResult = Namespace.create(command.namespace)
    if (namespaceResult.isLeft()) {
      return invalid([namespaceResult.value])
    }
    const namespace = namespaceResult.value

    // 2. Валидация ResourceName (синхронная)
    const nameResult = ResourceName.create(command.name)
    if (nameResult.isLeft()) {
      return invalid([nameResult.value])
    }

    // 3. Проверка уникальности (асинхронная, бизнес-правило)
    const uniqueSpec = new UniqueResourceNameSpec(this.repository, namespace)
    const uniqueResult = await uniqueSpec.isSatisfiedBy(command.name)
    if (uniqueResult.isLeft()) {
      return invalid([uniqueResult.value])
    }

    // 4. Создание ресурса
    const resource = Resource.create({
      namespace,
      name: nameResult.value,
      secret: command.secret
    })

    // 5. Сохранение
    await this.repository.save(resource)
    
    return valid(resource)
  }
}
```

### Query Handler с фильтрацией по спецификации [#code]

```typescript
// src/application/queries/handlers/GetStrongPasswordsHandler.ts  #structure:
import { ValidPasswordStrengthSpec } from '@/domain/resource/specifications/ValidPasswordStrengthSpec'  // #structure:

export class GetStrongPasswordsHandler {  // #class:GetStrongPasswordsHandler
  constructor(private readonly repository: IResourceRepository) {}

  async execute(): Promise<Resource[]> {
    const allResources = await this.repository.findAll()
    const strengthSpec = new ValidPasswordStrengthSpec()

    // Фильтруем только ресурсы с сильными паролями
    return allResources.filter(resource => {
      const result = strengthSpec.isSatisfiedBy(resource.getSecret())
      return result.isRight()
    })
  }
}
```

---

## 🧪 Тестирование спецификаций

### Тестирование общих спецификаций [#code]

```typescript
// src/shared/specification/__tests__/NotEmptySpec.test.ts  #structure:
import { describe, it, expect } from 'vitest'
import { NotEmptySpec } from '../StringSpecifications'  // #structure:

describe('NotEmptySpec', () => {  // #class:NotEmptySpec
  const spec = new NotEmptySpec('TestEntity')

  it('should pass for non-empty string', () => {
    const result = spec.isSatisfiedBy('hello')
    
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toBe('hello')
    }
  })

  it('should fail for empty string', () => {
    const result = spec.isSatisfiedBy('')
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('cannot be empty')
    }
  })

  it('should fail for whitespace-only string', () => {
    const result = spec.isSatisfiedBy('   ')
    
    expect(result.isLeft()).toBe(true)
  })
})
```

### Тестирование бизнес-специфичных спецификаций [#code]

```typescript
// src/domain/resource/specifications/__tests__/NotReservedNamespaceSpec.test.ts  #structure:
import { describe, it, expect } from 'vitest'
import { NotReservedNamespaceSpec } from '../NotReservedNamespaceSpec'  // #structure:

describe('NotReservedNamespaceSpec', () => {  // #class:NotReservedNamespaceSpec
  const spec = new NotReservedNamespaceSpec()

  it('should pass for non-reserved namespace', () => {
    const result = spec.isSatisfiedBy('my-namespace')
    
    expect(result.isRight()).toBe(true)
  })

  it('should fail for reserved namespace "system"', () => {
    const result = spec.isSatisfiedBy('system')
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('reserved namespace')
    }
  })

  it('should be case-insensitive', () => {
    const result = spec.isSatisfiedBy('ADMIN')
    
    expect(result.isLeft()).toBe(true)
  })
})
```

### Тестирование композиции спецификаций [#code]

```typescript
// src/domain/resource/value-objects/__tests__/Namespace.test.ts  #structure:
import { describe, it, expect } from 'vitest'
import { Namespace } from '../Namespace'  // #structure:

describe('Namespace.create', () => {  // #class:Namespace
  it('should create valid namespace', () => {
    const result = Namespace.create('my-namespace')
    
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.getValue()).toBe('my-namespace')
    }
  })

  it('should fail for empty string', () => {
    const result = Namespace.create('')
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('cannot be empty')
    }
  })

  it('should fail for too short namespace', () => {
    const result = Namespace.create('a')
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('2-50 characters')
    }
  })

  it('should fail for invalid pattern', () => {
    const result = Namespace.create('My Namespace')
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('invalid format')
    }
  })

  it('should fail for reserved namespace', () => {
    const result = Namespace.create('system')
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('reserved namespace')
    }
  })
})

describe('Namespace.createWithAllErrors', () => {  // #class:Namespace
  it('should accumulate all errors', () => {
    const result = Namespace.createWithAllErrors('A')  // Слишком короткий + uppercase
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toHaveLength(2)  // 2 ошибки
      expect(result.value[0].message).toContain('2-50 characters')
      expect(result.value[1].message).toContain('invalid format')
    }
  })
})
```

### Тестирование асинхронных спецификаций [#code]

```typescript
// src/domain/resource/specifications/__tests__/UniqueResourceNameSpec.test.ts  #structure:
import { describe, it, expect, vi } from 'vitest'
import { UniqueResourceNameSpec } from '../UniqueResourceNameSpec'  // #structure:
import { Namespace } from '../../value-objects/Namespace'  // #structure:

describe('UniqueResourceNameSpec', () => {  // #class:UniqueResourceNameSpec
  it('should pass when resource does not exist', async () => {
    // Arrange
    const mockRepository = {
      findByNamespaceAndName: vi.fn().mockResolvedValue(null)
    }
    const namespace = Namespace.create('test').value as Namespace
    const spec = new UniqueResourceNameSpec(mockRepository as any, namespace)

    // Act
    const result = await spec.isSatisfiedBy('new-resource')

    // Assert
    expect(result.isRight()).toBe(true)
    expect(mockRepository.findByNamespaceAndName).toHaveBeenCalledWith(
      namespace,
      'new-resource'
    )
  })

  it('should fail when resource already exists', async () => {
    // Arrange
    const existingResource = { id: '123', name: 'existing' }
    const mockRepository = {
      findByNamespaceAndName: vi.fn().mockResolvedValue(existingResource)
    }
    const namespace = Namespace.create('test').value as Namespace
    const spec = new UniqueResourceNameSpec(mockRepository as any, namespace)

    // Act
    const result = await spec.isSatisfiedBy('existing')

    // Assert
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value.message).toContain('already exists')
    }
  })
})
```

---

## 📁 Структура файлов [#structure:tree]

```
src/
├── shared/                                    #structure:
│   ├── validation/                            #structure:
│   │   ├── Validation.ts                      #structure:
│   │   ├── ValidationCombinators.ts           #structure:
│   │   └── index.ts                           #structure:
│   │
│   └── specification/                         #structure:
│       ├── ISpecification.ts                  #structure:
│       ├── StringSpecifications.ts            #structure:
│       ├── UuidSpecifications.ts              #structure:
│       ├── __tests__/                         #structure:
│       │   ├── NotEmptySpec.test.ts           #structure:
│       │   ├── LengthRangeSpec.test.ts        #structure:
│       │   └── UuidV4Spec.test.ts             #structure:
│       └── index.ts                           #structure:
│
└── domain/
    ├── shared/
    │   └── errors/                            #structure:
    │       └── InvariantViolationError.ts     #structure:
    │
    └── resource/
        ├── specifications/                    #structure:
        │   ├── NotReservedNamespaceSpec.ts    #structure:
        │   ├── UniqueResourceNameSpec.ts      #structure:
        │   ├── ValidPasswordStrengthSpec.ts   #structure:
        │   ├── __tests__/                     #structure:
        │   │   ├── NotReservedNamespaceSpec.test.ts  #structure:
        │   │   └── UniqueResourceNameSpec.test.ts    #structure:
        │   └── index.ts                       #structure:
        │
        └── value-objects/                     #structure:
            ├── Namespace.ts                   #structure:
            ├── ResourceName.ts                #structure:
            ├── ResourceId.ts                  #structure:
            └── __tests__/                     #structure:
                └── Namespace.test.ts          #structure:
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

### 2. Общие спецификации в src/shared/, бизнес-специфичные в src/domain/

```typescript
// ✅ ХОРОШО: Общие спецификации в shared
import { NotEmptySpec, LengthRangeSpec } from '@/shared/specification'

// ✅ ХОРОШО: Бизнес-специфичные в domain
import { NotReservedNamespaceSpec } from '@/domain/resource/specifications'

// ❌ ПЛОХО: Бизнес-правила в shared
import { NotReservedNamespaceSpec } from '@/shared/specification'  // ❌
```

### 3. Именование спецификаций

```typescript
// ✅ ХОРОШО: Глагол + существительное + Spec
NotEmptySpec
ValidPasswordStrengthSpec
UniqueResourceNameSpec

// ❌ ПЛОХО: Неясное назначение
EmptySpec  // Проверяет на пустоту или на НЕ пустоту?
PasswordSpec  // Что именно проверяет?
ResourceSpec  // Слишком общее
```

### 4. Накопление ошибок для лучшего UX

```typescript
// ✅ ХОРОШО: Накапливаем ВСЕ ошибки
static create(value: string): Validation<Error[], T> {
  const specs = [
    new NotEmptySpec('Entity'),
    new LengthRangeSpec(2, 50, 'Entity'),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Entity')
  ]

  return ValidationCombinators.sequence(
    specs.map(spec => spec.isSatisfiedBy(value)),
    () => new T(value)
  )
}
```

**Почему накопление лучше:**
- ✅ Пользователь видит ВСЕ ошибки сразу
- ✅ Не нужно исправлять по одной ошибке за раз
- ✅ Лучший UX для форм

---

## 🔗 Связанные документы

- **[VALIDATION_COMBINATORS.md](./VALIDATION_COMBINATORS.md)** - ValidationCombinators с mergeInMany ⭐ **НОВОЕ**
- **[patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md)** - Полное описание Specification Pattern
- **[.docs-meta/VALIDATION_ARCHITECTURE.md](../../.docs-meta/VALIDATION_ARCHITECTURE.md)** - План архитектуры Validation
- **[INVARIANTS.md](./INVARIANTS.md)** - Инварианты и Shared Kernel
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Обработка ошибок
- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** - Either Pattern и монады
