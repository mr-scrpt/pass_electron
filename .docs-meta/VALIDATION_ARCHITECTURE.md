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
import { Either, left, right, merge, mergeInMany } from '@sweet-monads/either'

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
 * Комбинаторы для работы с валидацией
 */
export const ValidationCombinators = {  // #class:ValidationCombinators
  /**
   * Комбинировать валидации (fail-fast)
   * Останавливается на первой ошибке
   * 
   * @example
   * const results = [valid(1), valid(2), invalid(new Error())]
   * const combined = ValidationCombinators.combine(results)
   * // Вернет invalid(new Error()) - первую ошибку
   */
  combine<E, T>(validations: Validation<E, T>[]): Validation<E, T[]> {
    return merge(validations) as Validation<E, T[]>
  },

  /**
   * Комбинировать валидации (accumulate)
   * Собирает ВСЕ ошибки
   * 
   * @example
   * const results = [invalid(err1), valid(2), invalid(err2)]
   * const combined = ValidationCombinators.combineAll(results)
   * // Вернет invalid([err1, err2]) - ВСЕ ошибки
   */
  combineAll<E, T>(validations: Validation<E, T>[]): Validation<E[], T[]> {
    return mergeInMany(validations) as Validation<E[], T[]>
  }
}

/**
 * Re-export методов Either для работы с Validation
 * Позволяет использовать map, chain, fold без прямого импорта Either
 */
export type { Either } from '@sweet-monads/either'
```

### 2. Public API [#code|#structure:]

```typescript
// src/shared/validation/index.ts  #structure:
export type { Validation } from './Validation'
export { valid, invalid, ValidationCombinators } from './Validation'

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

### CompositeSpecification [#code|#structure:|#class:CompositeSpecification]

```typescript
// src/shared/specification/CompositeSpecification.ts  #structure:
import { Validation, valid, invalid } from '@/shared/validation'  // #structure:
import { ISpecification } from './ISpecification'  // #structure:
import { InvariantViolationError } from '@/domain/shared/errors'  // #structure:

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
          // Используем методы Either через Validation
          if (result.isLeft()) return result
        }
        return valid(value)
      }
    }
  }

  /**
   * Накопление ВСЕХ ошибок
   * Для показа всех проблем валидации сразу
   */
  static allOfAccumulate<T>(...specs: ISpecification<T>[]): {
    isSatisfiedBy: (value: T) => Validation<InvariantViolationError[], T>
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
        
        return errors.length > 0 ? invalid(errors) : valid(value)
      }
    }
  }
}
```

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
import { Validation } from '@/shared/validation'  // #structure:
import { InvariantViolationError } from '@/domain/shared/errors'  // #structure:
import { CompositeSpecification } from '@/shared/specification'  // #structure:
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
   * Создать Namespace с валидацией (fail-fast)
   */
  static create(value: string): Validation<InvariantViolationError, Namespace> {
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

    // Используем map из Either (доступен через Validation)
    return spec.isSatisfiedBy(value).map(v => new Namespace(v))
  }

  /**
   * Создать Namespace с валидацией (accumulate - все ошибки)
   */
  static createWithAllErrors(
    value: string
  ): Validation<InvariantViolationError[], Namespace> {
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

## 🔄 План миграции

### Этап 1: Создать обертку Validation
- [ ] Создать `src/shared/validation/Validation.ts`
- [ ] Создать `src/shared/validation/index.ts`
- [ ] Создать `src/shared/validation/README.md`

### Этап 2: Переместить Specification
- [ ] Создать `src/shared/specification/`
- [ ] Переместить `ISpecification.ts`
- [ ] Переместить `CompositeSpecification.ts`
- [ ] Переместить `StringSpecifications.ts`
- [ ] Переместить `UuidSpecifications.ts`
- [ ] Обновить все импорты на `Validation`

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

- `docs/error-handling/SPECIFICATION_VALIDATION.md` - основной документ (требует обновления)
- `docs/patterns/SPECIFICATION_PATTERN.md` - теория паттерна
- `docs/PROJECT_STRUCTURE.md` - структура проекта
