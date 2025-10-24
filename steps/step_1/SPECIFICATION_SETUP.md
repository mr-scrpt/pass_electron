# Specification Pattern Setup (Shared Layer)

> **Назад:** [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)  
> **Далее:** [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)

---

## 🎯 Цель

Создать переиспользуемые спецификации для валидации, которые можно комбинировать.

> **📚 Детали**: [VALIDATION_SPECIFICATION_APPROACH.md](../../.docs-meta/VALIDATION_SPECIFICATION_APPROACH.md) — Полный согласованный подход ⭐

---

## Зачем нужны спецификации?

**Проблема прямой валидации:**
- ❌ Дублирование правил (длина, паттерн, пустота)
- ❌ Бизнес-правила размазаны по коду
- ❌ Сложно тестировать

**Решение - Specification Pattern:**
- ✅ Переиспользуемые правила
- ✅ Бизнес-правила инкапсулированы
- ✅ Легко комбинировать
- ✅ Накопление ВСЕХ ошибок

---

## 0.5.1. Создать ISpecification интерфейс [#interface:ISpecification|#code|#structure:path]

**Файл: `src/shared/specification/ISpecification.ts`**

```typescript
// src/shared/specification/ISpecification.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'

/**
 * Спецификация для валидации
 * Возвращает Validation вместо boolean для накопления ошибок
 */
export interface ISpecification<T> {
  isSatisfiedBy(value: T): Validation<ValidationError, T>
}
```

**Почему `isSatisfiedBy`?**
- Классический метод из Specification Pattern (Eric Evans, DDD)
- Возвращает `Validation` вместо `boolean` для накопления ошибок
- Позволяет комбинировать спецификации

---

## 0.5.2. Создать ValidationError [#class:ValidationError|#code|#structure:path]

**Файл: `src/shared/errors/ValidationError.ts`**

```typescript
// src/shared/errors/ValidationError.ts

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

**Современный подход:**
- ✅ `ValidationError` - для ВСЕХ валидаций через Specification Pattern
- ✅ Накопление всех ошибок через `ValidationCombinators.sequence()`
- ✅ Единообразие - один тип ошибки везде

---

## 0.5.3. Создать Fluent API для условной валидации

#### Fluent API Helper (helpers.ts) [#class:ValidationBuilder|#class:ValidBranch|#code|#structure:path]

**Файл: `src/shared/validation/helpers.ts`**

⚠️ **Примечание:** `helpers.ts` остается в `src/shared/validation/` потому что это технический хелпер (fluent API), а не Domain логика.

```typescript
// src/shared/validation/helpers.ts
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

#### Validation Type (Validation.ts) [#code|#structure:path]

**Обновить `src/shared/validation/Validation.ts`:**

```typescript
// src/shared/validation/Validation.ts
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

#### Public API (index.ts) [#code|#structure:path]

**Обновить `src/shared/validation/index.ts`:**

```typescript
// src/shared/validation/index.ts
export type { Validation } from './Validation'
export { valid, invalid, fromCondition } from './Validation'
export { isTrue } from './helpers'
export { ValidationCombinators } from './ValidationCombinators'
```

**Почему Fluent API?**
- Читаемость: `isTrue(condition, value).valid().invalid(error)`
- Скрывает тернарник в одном месте (`fromCondition`)
- Типобезопасность

---

## 0.5.4. Создать общие спецификации (Common)

⚠️ **ВАЖНО:** Префикс `Common` показывает что это базовые классы для создания синглтонов в Domain Layer. НЕ использовать напрямую!

### CommonLengthSpec [#class:CommonLengthSpec|#code|#structure:path]

**Файл: `src/domain/shared/specification/common/CommonLengthSpec.ts`**

```typescript
// src/domain/shared/specification/common/CommonLengthSpec.ts
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '../ISpecification'
import { ValidationError } from '../ValidationError'

/**
 * Конфигурация для проверки длины
 */
export interface LengthConfig {
  readonly entityType: string
  readonly minLength: number
  readonly maxLength: number
}

/**
 * Общая спецификация для проверки длины строки
 * 
 * Singleton Factory Pattern - экземпляры кэшируются по комбинации параметров
 * Использует именованные параметры для предотвращения ошибок
 * 
 * @example
 * CommonLengthSpec.for({
 *   entityType: 'Namespace',
 *   minLength: 2,
 *   maxLength: 50,
 * })
 */
export class CommonLengthSpec implements ISpecification<string> {
  // Flyweight: кэш экземпляров по ключу "entityType:min:max"
  private static readonly _instances = new Map<string, CommonLengthSpec>()

  private constructor(private readonly config: LengthConfig) {}

  /**
   * Получить или создать экземпляр
   * @param config - конфигурация с именованными параметрами
   */
  static for(config: LengthConfig): CommonLengthSpec {
    const key = `${config.entityType}:${config.minLength}:${config.maxLength}`
    
    if (!CommonLengthSpec._instances.has(key)) {
      CommonLengthSpec._instances.set(key, new CommonLengthSpec(config))
    }
    
    return CommonLengthSpec._instances.get(key)!
  }

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(
      value.length >= this.config.minLength && value.length <= this.config.maxLength,
      value
    )
      .valid()
      .invalid(new ValidationError(
        this.config.entityType,
        `must be ${this.config.minLength}-${this.config.maxLength} characters`
      ))
  }
}
```

### CommonPatternSpec [#class:CommonPatternSpec|#code|#structure:path]

**Файл: `src/domain/shared/specification/common/CommonPatternSpec.ts`**

```typescript
// src/domain/shared/specification/common/CommonPatternSpec.ts
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '../ISpecification'
import { ValidationError } from '../ValidationError'

/**
 * Конфигурация для проверки паттерна
 */
export interface PatternConfig {
  readonly entityType: string
  readonly pattern: RegExp
  readonly message: string
}

/**
 * Общая спецификация для проверки по регулярному выражению
 * 
 * Singleton Factory Pattern - экземпляры кэшируются по комбинации параметров
 * Использует именованные параметры для предотвращения ошибок
 * 
 * @example
 * CommonPatternSpec.for({
 *   entityType: 'Namespace',
 *   pattern: /^[a-z0-9-]+$/,
 *   message: 'must contain only lowercase letters, numbers, and hyphens',
 * })
 */
export class CommonPatternSpec implements ISpecification<string> {
  // Flyweight: кэш экземпляров по ключу "entityType:pattern:message"
  private static readonly _instances = new Map<string, CommonPatternSpec>()

  private constructor(private readonly config: PatternConfig) {}

  /**
   * Получить или создать экземпляр
   * @param config - конфигурация с именованными параметрами
   */
  static for(config: PatternConfig): CommonPatternSpec {
    const key = `${config.entityType}:${config.pattern.source}:${config.message}`
    
    if (!CommonPatternSpec._instances.has(key)) {
      CommonPatternSpec._instances.set(key, new CommonPatternSpec(config))
    }
    
    return CommonPatternSpec._instances.get(key)!
  }

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(this.config.pattern.test(value), value)
      .valid()
      .invalid(new ValidationError(this.config.entityType, this.config.message))
  }
}
```

### CommonNotEmptySpec [#class:CommonNotEmptySpec|#code|#structure:path]

**Файл: `src/domain/shared/specification/common/CommonNotEmptySpec.ts`**

```typescript
// src/domain/shared/specification/common/CommonNotEmptySpec.ts
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '../ISpecification'
import { ValidationError } from '../ValidationError'

/**
 * Конфигурация для проверки на пустоту
 */
export interface NotEmptyConfig {
  readonly entityType: string
}

/**
 * Общая спецификация для проверки на пустоту
 * 
 * Singleton Factory Pattern - экземпляры кэшируются по entityType
 * Использует именованные параметры для консистентности с другими спецификациями
 * 
 * @example
 * CommonNotEmptySpec.for({ entityType: 'Namespace' })
 */
export class CommonNotEmptySpec implements ISpecification<string> {
  // Flyweight: кэш экземпляров по entityType
  private static readonly _instances = new Map<string, CommonNotEmptySpec>()

  private constructor(private readonly config: NotEmptyConfig) {}

  /**
   * Получить или создать экземпляр
   * @param config - конфигурация с именованными параметрами
   */
  static for(config: NotEmptyConfig): CommonNotEmptySpec {
    const key = config.entityType
    
    if (!CommonNotEmptySpec._instances.has(key)) {
      CommonNotEmptySpec._instances.set(key, new CommonNotEmptySpec(config))
    }
    
    return CommonNotEmptySpec._instances.get(key)!
  }

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(value && value.trim().length > 0, value)
      .valid()
      .invalid(new ValidationError(this.config.entityType, 'cannot be empty'))
  }
}
```

**Почему именованные параметры + Flyweight?**

**Именованные параметры (Parameter Object Pattern):**
- ✅ Невозможно перепутать `minLength` и `maxLength`
- ✅ Невозможно перепутать `pattern` и `message`
- ✅ Самодокументируемый код
- ✅ IDE автодополнение с подсказками
- ✅ Легко добавлять новые параметры
- ✅ Martin Fowler's Parameter Object Pattern

**Flyweight Pattern (кэширование):**
- ✅ Экземпляры создаются один раз и переиспользуются
- ✅ Производительность - нет лишних аллокаций
- ✅ Экономия памяти
- ✅ Спецификации stateful (хранят конфигурацию)

---


---

## ✅ Результат [#structure:tree]

После выполнения этого шага у вас будет:

```
src/
├── shared/                        # Технические утилиты
│   └── validation/
│       ├── Validation.ts          # Фасад над @sweet-monads/either
│       ├── ValidationCombinators.ts
│       ├── helpers.ts             # isTrue fluent API
│       └── index.ts
│
└── domain/shared/                 # Shared Kernel
    ├── errors/
    │   └── ValidationError.ts     # Ошибка валидации
    └── specification/
        ├── ISpecification.ts      # Интерфейс спецификации
        ├── common/
        │   ├── CommonLengthSpec.ts
        │   ├── CommonPatternSpec.ts
        │   └── CommonNotEmptySpec.ts
        └── index.ts
```

**Что дальше?**

Теперь можно создавать Domain Layer с спецификациями! → [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)

---

> **Назад:** [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)  
> **Далее:** [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)
