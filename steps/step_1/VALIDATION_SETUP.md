# Validation API Setup (Shared Layer)

> **Назад:** [README.md](./README.md)  
> **Далее:** [ERROR_SETUP.md](./ERROR_SETUP.md)

---

## 🎯 Цель

Создать абстракцию над `@sweet-monads/either` для изоляции библиотеки и упрощения работы с валидацией.

> **📚 Детали**: [VALIDATION_COMBINATORS.md](../../docs/error-handling/VALIDATION_COMBINATORS.md) — ValidationCombinators с mergeInMany

---

## Зачем нужна абстракция?

**Проблема прямого использования `@sweet-monads/either`:**
- ❌ Зависимость Domain от конкретной библиотеки
- ❌ Сложно заменить библиотеку в будущем
- ❌ Неинтуитивные имена: `Either`, `left`, `right`

**Решение - Validation API:**
- ✅ Изоляция от библиотеки
- ✅ Понятные имена: `Validation`, `valid`, `invalid`
- ✅ Накопление ВСЕХ ошибок для лучшего UX
- ✅ Легко заменить библиотеку

---

## 0.1. Создать структуру Shared Layer

#### Create Shared Structure [#command]

```bash
# Создать структуру Shared Layer
mkdir -p src/shared/validation
```

---

## 0.2. Создать Validation API

**Файл: `src/shared/validation/Validation.ts`**

#### Validation.ts [#code|#structure:path]

```typescript
// src/shared/validation/Validation.ts
import { Either, left, right } from '@sweet-monads/either'

/**
 * Результат валидации
 * Обертка над Either для изоляции библиотеки
 */
export type Validation<E, T> = Either<E, T>

/**
 * Создать успешный результат валидации
 */
export const valid = <T>(value: T): Validation<never, T> => right(value)

/**
 * Создать неудачный результат валидации
 */
export const invalid = <E>(error: E): Validation<E, never> => left(error)
```

**Зачем фасад?**
- Изолирует `@sweet-monads/either` от остального кода
- Позволяет легко заменить библиотеку в будущем
- Более понятные имена для Domain Layer

---

## 0.3. Создать ValidationCombinators

**Файл: `src/shared/validation/ValidationCombinators.ts`**

#### ValidationCombinators.ts [#class:ValidationCombinators|#code|#structure:path]

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

**Почему `mergeInMany`?**
- ✅ Функциональный подход (монады)
- ✅ Накапливает ВСЕ ошибки
- ✅ Лучший UX - пользователь видит все проблемы сразу
- ✅ Нет циклов и if/else

**Пример использования:**

```typescript
// Создаем Value Objects
const namespaceVO = Namespace.create(namespace)  // Validation<ValidationError[], Namespace>
const nameVO = ResourceName.create(name)         // Validation<ValidationError[], ResourceName>

// Комбинируем результаты - накапливаем ВСЕ ошибки
return ValidationCombinators.sequence(
  [namespaceVO, nameVO],
  ([ns, nm]) => new Resource(id, ns, nm, secret, new Date(), new Date())
)

// Если есть ошибки в обоих VO - вернутся ОБЕ ошибки, а не только первая!
```

---

## 0.4. Создать helper функции (v2.0)

**Файл: `src/shared/validation/helpers.ts`**

#### helpers.ts [#code]

```typescript
// src/shared/validation/helpers.ts
import type { Validation } from './Validation';

/**
 * tapLeft - side effect для Left (ошибок)
 * Используется для логирования, метрик, etc
 * НЕ изменяет значение, только выполняет side effect
 */
export const tapLeft = <E, T>(fn: (error: E) => void) => {
  return (value: E): E => {
    fn(value);
    return value;
  };
};

/**
 * tapRight - side effect для Right (успеха)
 * Используется для логирования успешных операций
 */
export const tapRight = <E, T>(fn: (value: T) => void) => {
  return (value: T): T => {
    fn(value);
    return value;
  };
};

/**
 * fromNullable - конвертация null/undefined в Validation
 */
export function fromNullable<E, T>(
  value: T | null | undefined,
  error: E
): Validation<E, T> {
  return value != null ? valid(value) : invalid(error);
}
```

**Использование:**

```typescript
// tapLeft для логирования ошибок
return result
  .mapLeft(tapLeft(errors => 
    errors.forEach(error => logger.error(error.getMessage()))
  ))
  .mapLeft(errors => errors.map(error => error.toUserError()));

// fromNullable для опциональных значений
const user = fromNullable(
  maybeUser,
  new NotFoundError('User', userId)
);
```

---

## 0.5. Создать Public API

**Файл: `src/shared/validation/index.ts`**

#### Validation Public API [#code]

```typescript
// src/shared/validation/index.ts
export * from './Validation';
export * from './ValidationCombinators';
export * from './helpers';
```

**Почему Public API?**
- Инкапсуляция - скрываем детали реализации
- Контракт - `index.ts` это контракт модуля
- Гибкость - можно менять внутреннюю структуру

---

## ✅ Результат

После выполнения этого шага у вас будет:

```
src/shared/
└── validation/
    ├── Validation.ts              # Фасад над @sweet-monads/either
    ├── ValidationCombinators.ts   # accumulate, sequence
    ├── helpers.ts                 # tapLeft, tapRight, fromNullable (v2.0)
    └── index.ts                   # Public API
```

**Ключевые возможности:**
- ✅ `Validation<E, T>` - type-safe результат валидации
- ✅ `valid/invalid` - создание результатов
- ✅ `accumulate/sequence` - комбинаторы
- ✅ `tapLeft/tapRight` - side effects (логирование) **NEW v2.0**
- ✅ `fromNullable` - работа с null/undefined **NEW v2.0**

**Что дальше?**

Теперь создаем базовый класс ошибок! → [ERROR_SETUP.md](./ERROR_SETUP.md)

---

> **Назад:** [README.md](./README.md)  
> **Далее:** [ERROR_SETUP.md](./ERROR_SETUP.md)
