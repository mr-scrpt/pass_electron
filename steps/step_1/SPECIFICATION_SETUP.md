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

**Файл: `src/domain/shared/specification/ISpecification.ts`**

```typescript
// src/domain/shared/specification/ISpecification.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '../errors/ValidationError'

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

**Файл: `src/domain/shared/errors/ValidationError.ts`**

```typescript
// src/domain/shared/errors/ValidationError.ts

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

**Отличие от `InvariantViolationError`:**
- `ValidationError` - для спецификаций (сложные композиции)
- `InvariantViolationError` - для простых инвариантов (UUID, Email)

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

### CommonPatternSpec [#class:CommonPatternSpec|#code|#structure:path]

**Файл: `src/domain/shared/specification/common/CommonPatternSpec.ts`**

```typescript
// src/domain/shared/specification/common/CommonPatternSpec.ts
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

### CommonNotEmptySpec [#class:CommonNotEmptySpec|#code|#structure:path]

**Файл: `src/domain/shared/specification/common/CommonNotEmptySpec.ts`**

```typescript
// src/domain/shared/specification/common/CommonNotEmptySpec.ts
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

**Почему `Common*`?**
- Явно показывает что это базовые классы
- Предотвращает прямое использование в Domain
- Направляет на создание синглтонов с бизнес-правилами

---

## 0.5.5. Создать Public API для спецификаций [#code|#structure:path]

**Файл: `src/domain/shared/specification/index.ts`**

```typescript
// src/domain/shared/specification/index.ts

export type { ISpecification } from './ISpecification'
export { ValidationError } from '../errors/ValidationError'

// ⚠️ Общие спецификации - НЕ использовать напрямую в Domain!
// Создавайте синглтоны в domain/specifications/
export { CommonLengthSpec } from './common/CommonLengthSpec'
export { CommonPatternSpec } from './common/CommonPatternSpec'
export { CommonNotEmptySpec } from './common/CommonNotEmptySpec'
```

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
