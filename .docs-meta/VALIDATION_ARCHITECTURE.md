# Validation Architecture - Правильная архитектура валидации

**Дата:** 2025-01-21  
**Статус:** План рефакторинга

---

## 🎯 Проблема

**Текущее состояние:**
- ❌ Specification в `src/domain/shared/specification/` - неправильно!
- ❌ Прямая зависимость Domain от `@sweet-monads/either` - нарушение изоляции
- ❌ Нет обертки над Either - библиотека протекает в Domain
- ❌ В документации нет тегов `#structure:`, `#class:`, `#interface:`

**Что нужно:**
- ✅ Переместить Specification в `src/shared/specification/`
- ✅ Создать обертку `Validation<E, T>` над Either
- ✅ Изолировать библиотеку @sweet-monads/either
- ✅ Добавить теги в документацию

---

## 📁 Правильная структура

### Файловая структура [#structure:tree]

```
src/
├── shared/                                    #structure:
│   ├── validation/                            #structure:
│   │   ├── Validation.ts                      #structure:
│   │   ├── index.ts                           #structure:
│   │   └── README.md
│   │
│   └── specification/                         #structure:
│       ├── ISpecification.ts                  #structure:
│       ├── CompositeSpecification.ts          #structure:
│       ├── StringSpecifications.ts            #structure:
│       ├── UuidSpecifications.ts              #structure:
│       ├── index.ts                           #structure:
│       └── README.md
│
├── domain/
│   ├── shared/
│   │   └── errors/                            #structure:
│   │       ├── InvariantViolationError.ts     #structure:
│   │       └── index.ts                       #structure:
│   │
│   └── resource/
│       ├── specifications/                    #structure:
│       │   └── ResourceSpecifications.ts      #structure:
│       │
│       └── value-objects/                     #structure:
│           ├── Namespace.ts                   #structure:
│           ├── ResourceName.ts                #structure:
│           └── ResourceId.ts                  #structure:
```

---

## 🔧 Код обертки Validation

### 1. Validation Type [#code|#structure:]

```typescript
// src/shared/validation/Validation.ts  #structure:
import { Either, left, right } from '@sweet-monads/either'

/**
 * Результат валидации
 * Обертка над Either для изоляции библиотеки @sweet-monads/either
 * 
 * @template E - Тип ошибки валидации
 * @template T - Тип успешного значения
 */
export type Validation<E, T> = Either<E, T>  // #interface:Validation

/**
 * Создать успешный результат валидации
 * 
 * @example
 * const result = valid('hello')  // Validation<never, string>
 */
export const valid = <T>(value: T): Validation<never, T> => right(value)

/**
 * Создать неудачный результат валидации
 * 
 * @example
 * const result = invalid(new Error('Invalid'))  // Validation<Error, never>
 */
export const invalid = <E>(error: E): Validation<E, never> => left(error)

/**
 * Re-export методов Either для работы с Validation
 * Позволяет использовать map, chain, fold без прямого импорта Either
 */
export type { Either } from '@sweet-monads/either'
```

### 2. ValidationCombinators [#class:ValidationCombinators|#code|#structure:]

```typescript
// src/shared/validation/ValidationCombinators.ts  #structure:
import { mergeInMany } from '@sweet-monads/either'
import { Validation } from './Validation'

/**
 * Комбинаторы для работы с валидацией
 * Используют функциональный подход (монады) вместо императивного
 */
export class ValidationCombinators {  // #class:ValidationCombinators
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

### 3. Public API [#code|#structure:]

```typescript
// src/shared/validation/index.ts  #structure:
export type { Validation } from './Validation'
export { valid, invalid } from './Validation'
export { ValidationCombinators } from './ValidationCombinators'

// Re-export Either методов для удобства
export { left, right } from '@sweet-monads/either'
```

---

## 🎯 Обновленный ISpecification

### ISpecification с Validation [#code|#structure:|#interface:ISpecification]

```typescript
// src/shared/specification/ISpecification.ts  #structure:
import { Validation } from '@/shared/validation'  // #structure:
import { InvariantViolationError } from '@/domain/shared/errors'  // #structure:

/**
 * Спецификация для валидации
 * Возвращает Validation вместо boolean для обработки ошибок
 */
export interface ISpecification<T> {  // #interface:ISpecification
  /**
   * Проверить удовлетворяет ли значение спецификации
   * 
   * @param value - Значение для проверки
   * @returns Validation с ошибкой или валидным значением
   */
  isSatisfiedBy(value: T): Validation<InvariantViolationError, T>
}
```

### ValidationCombinators для накопления ошибок

> 📖 **См. полное описание:** [docs/error-handling/VALIDATION_COMBINATORS.md](../docs/error-handling/VALIDATION_COMBINATORS.md)

ValidationCombinators используется для накопления ВСЕХ ошибок валидации. Подробности в отдельном документе.

---

## 📚 Примеры использования

### StringSpecifications [#code|#structure:]

```typescript
// src/shared/specification/StringSpecifications.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from './ISpecification'  // #structure:
import { InvariantViolationError } from '@/domain/shared/errors'  // #structure:

/**
 * Проверка на пустую строку
 */
export class NotEmptySpec implements ISpecification<string> {  // #class:NotEmptySpec
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<InvariantViolationError, string> {
    return value && value.trim()
      ? valid(value)
      : invalid(new InvariantViolationError(this.entityType, "cannot be empty"))
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
  
  isSatisfiedBy(value: string): Validation<InvariantViolationError, string> {
    return value.length >= this.min && value.length <= this.max
      ? valid(value)
      : invalid(new InvariantViolationError(
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
  
  isSatisfiedBy(value: string): Validation<InvariantViolationError, string> {
    return this.pattern.test(value)
      ? valid(value)
      : invalid(new InvariantViolationError(this.entityType, this.message))
  }
}
```

### Namespace Value Object [#code|#structure:|#class:Namespace]

```typescript
// src/domain/resource/value-objects/Namespace.ts  #structure:
import { Validation, ValidationCombinators } from '@/shared/validation'  // #structure:
import { InvariantViolationError } from '@/domain/shared/errors'  // #structure:
import { 
  NotEmptySpec, 
  LengthRangeSpec, 
  PatternSpec 
} from '@/shared/specification/StringSpecifications'  // #structure:

export class Namespace {  // #class:Namespace
  private static readonly ENTITY_TYPE = "Namespace"
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/

  private constructor(private readonly _value: string) {}

  /**
   * Создать Namespace с накоплением ВСЕХ ошибок
   */
  static create(value: string): Validation<InvariantViolationError[], Namespace> {
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

## 🔄 План миграции

### Этап 1: Создать обертку Validation
- [ ] Создать `src/shared/validation/Validation.ts`
- [ ] Создать `src/shared/validation/index.ts`
- [ ] Создать `src/shared/validation/README.md`

### Этап 2: Переместить Specification
- [ ] Создать `src/shared/specification/`
- [ ] Переместить `ISpecification.ts`
- [ ] Переместить `StringSpecifications.ts`
- [ ] Переместить `UuidSpecifications.ts`
- [ ] Обновить все импорты на `Validation`
- [ ] Использовать `ValidationCombinators` вместо `CompositeSpecification`

### Этап 3: Обновить Value Objects
- [ ] Обновить `Namespace.ts` - использовать `Validation`
- [ ] Обновить `ResourceName.ts` - использовать `Validation`
- [ ] Обновить `ResourceId.ts` - использовать `Validation`

### Этап 4: Обновить документацию
- [ ] Обновить `SPECIFICATION_VALIDATION.md` с тегами
- [ ] Обновить все примеры кода на `Validation`
- [ ] Добавить теги `#structure:`, `#class:`, `#interface:`
- [ ] Обновить импорты в примерах

### Этап 5: Обновить другие документы
- [ ] `ERROR_HANDLING.md` - заменить Either на Validation
- [ ] `ERROR_ESCALATION.md` - добавить раздел про Validation
- [ ] `INVARIANTS.md` - обновить примеры

---

## ✅ Преимущества новой архитектуры

1. **Изоляция библиотеки** - @sweet-monads/either не протекает в Domain
2. **Легкая замена** - можно заменить Either на другую библиотеку
3. **Понятные имена** - `Validation`, `valid`, `invalid` вместо `Either`, `left`, `right`
4. **Правильная структура** - Specification в `shared/`, не в `domain/`
5. **Теги для поиска** - `#structure:`, `#class:`, `#interface:` для быстрого рефакторинга

---

## 📖 Связанные документы

- `docs/error-handling/VALIDATION_COMBINATORS.md` - ValidationCombinators с mergeInMany ⭐
- `docs/error-handling/SPECIFICATION_VALIDATION.md` - основной документ ✅ Обновлен
- `docs/patterns/SPECIFICATION_PATTERN.md` - теория паттерна
- `docs/PROJECT_STRUCTURE.md` - структура проекта
