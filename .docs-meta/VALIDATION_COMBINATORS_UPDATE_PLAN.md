# План обновления ValidationCombinators в документации

**Дата:** 2025-01-22  
**Статус:** В процессе

---

## 🎯 Цель

Обновить всю документацию с правильной реализацией `ValidationCombinators`:
- ✅ Использовать `mergeInMany` вместо императивного кода
- ✅ Правильные импорты `Validation<E, T>`
- ✅ Функциональный стиль вместо циклов и if/else
- ✅ Добавить теги согласно TAG_SYSTEM_V2.md

---

## 📋 Файлы для обновления

### 1. ✅ docs/error-handling/VALIDATION_COMBINATORS.md
**Статус:** Создан новый файл  
**Содержит:**
- Правильную реализацию с `mergeInMany`
- Примеры использования
- Преимущества подхода
- Теги: `[#class:ValidationCombinators|#code|#structure:path]`

---

### 2. ⏳ docs/error-handling/SPECIFICATION_VALIDATION.md
**Что обновить:**

#### Секция "Композитор спецификаций" (строки 59-104)
**Было:** `CompositeSpecification.allOf` и `allOfAccumulate`  
**Стало:** Использовать `ValidationCombinators.sequence`

**Старый код:**
```typescript
export class CompositeSpecification<T> {
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

**Новый код:**
```typescript
// Использование ValidationCombinators вместо CompositeSpecification
import { ValidationCombinators } from '@/shared/validation'

// В Value Object:
static create(value: string): Validation<InvariantViolationError[], Namespace> {
  const specs = [
    new NotEmptySpec('Namespace'),
    new LengthRangeSpec(2, 50, 'Namespace'),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
  ]

  return ValidationCombinators.sequence(
    specs.map(spec => spec.isSatisfiedBy(value)),
    () => new Namespace(value)
  )
}
```

#### Примеры использования (строки 343-430)
**Обновить:** Все примеры с `CompositeSpecification.allOf` на `ValidationCombinators.sequence`

#### Best Practices (строки 804-816)
**Обновить:** Убрать разделение на fail-fast и accumulate, показать только accumulate подход

---

### 3. ⏳ .docs-meta/VALIDATION_ARCHITECTURE.md
**Статус:** ✅ Обновлен  
**Содержит:**
- Правильную реализацию `ValidationCombinators`
- Разделение на `Validation.ts` и `ValidationCombinators.ts`
- Теги: `[#class:ValidationCombinators|#code|#structure:]`

---

### 4. ⏳ .docs-meta/SHARED_LAYER_IMPLEMENTATION.md
**Что обновить:**

#### Секция "ValidationCombinators" (строка 65)
**Обновить:** Описание методов `accumulate()` и `sequence()`

**Было:**
```
│   ├── ValidationCombinators.ts  # Фасад для accumulate/sequence
```

**Стало:**
```
│   ├── ValidationCombinators.ts  # accumulate(), sequence() с mergeInMany
```

#### Примеры импортов (строки 166-206)
**Добавить:** Примеры использования `ValidationCombinators.sequence`

---

### 5. ⏳ .docs-meta/SHARED_LAYER_SYNC_REPORT.md
**Что обновить:**

#### Примеры импортов (строки 195-206)
**Добавить:** Примеры использования `ValidationCombinators`

---

### 6. ⏳ docs/PROJECT_STRUCTURE.md
**Что обновить:**

#### Секция "Shared Layer" (строка 505)
**Обновить:** Описание `ValidationCombinators.ts`

**Было:**
```
│   ├── ValidationCombinators.ts  # Фасад для accumulate/sequence
```

**Стало:**
```
│   ├── ValidationCombinators.ts  # accumulate(), sequence() - накопление ошибок
```

---

### 7. ⏳ .docs-meta/VALIDATION_ARCHITECTURE_QUESTION.md
**Что обновить:**

#### Все упоминания ValidationCombinators
**Обновить:** Примеры кода с правильной реализацией

---

## 🔍 Поиск всех упоминаний

### Команды для поиска:

```bash
# ValidationCombinators
grep -rn "ValidationCombinators" docs/ .docs-meta/ steps/

# CompositeSpecification
grep -rn "CompositeSpecification" docs/ .docs-meta/ steps/

# allOf и allOfAccumulate
grep -rn "allOf\|allOfAccumulate" docs/ .docs-meta/ steps/

# accumulate и sequence
grep -rn "accumulate\|sequence" docs/ .docs-meta/ steps/
```

---

## ✅ Правила обновления

### 1. Теги согласно TAG_SYSTEM_V2.md

**Формат:** `[#тег1|#тег2|#тег3]` - в квадратных скобках, через пайп

**Для ValidationCombinators:**
- Заголовок: `### ValidationCombinators [#class:ValidationCombinators|#code|#structure:path]`
- Реальный файл: добавить путь в комментарии `// src/shared/validation/ValidationCombinators.ts`
- Примеры: только `[#code]` без тегов класса

### 2. Структура кода

**Validation.ts:**
```typescript
// src/shared/validation/Validation.ts
import { Either, left, right } from '@sweet-monads/either'

export type Validation<E, T> = Either<E, T>
export const valid = <T>(value: T): Validation<never, T> => right(value)
export const invalid = <E>(error: E): Validation<E, never> => left(error)
```

**ValidationCombinators.ts:**
```typescript
// src/shared/validation/ValidationCombinators.ts
import { mergeInMany } from '@sweet-monads/either'
import { Validation } from './Validation'

export class ValidationCombinators {
  static accumulate<E, T>(
    validations: Validation<E, T>[]
  ): Validation<E[], T[]> {
    return mergeInMany(validations)
  }

  static sequence<E, T, U>(
    validations: Validation<E, T>[],
    fn: (values: T[]) => U
  ): Validation<E[], U> {
    return mergeInMany(validations).map(fn)
  }
}
```

### 3. Использование в Value Objects

```typescript
import { Validation, ValidationCombinators } from '@/shared/validation'
import { NotEmptySpec, LengthRangeSpec, PatternSpec } from '@/shared/specification'

export class Namespace {
  static create(value: string): Validation<InvariantViolationError[], Namespace> {
    const specs = [
      new NotEmptySpec('Namespace'),
      new LengthRangeSpec(2, 50, 'Namespace'),
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
    ]

    return ValidationCombinators.sequence(
      specs.map(spec => spec.isSatisfiedBy(value)),
      () => new Namespace(value)
    )
  }
}
```

---

## 📊 Прогресс

| Файл | Статус | Примечание |
|------|--------|------------|
| VALIDATION_COMBINATORS.md | ✅ Создан | Новый файл с правильной реализацией |
| VALIDATION_ARCHITECTURE.md | ✅ Обновлен | ValidationCombinators с mergeInMany |
| SPECIFICATION_VALIDATION.md | ⏳ Ожидает | Заменить CompositeSpecification |
| SHARED_LAYER_IMPLEMENTATION.md | ⏳ Ожидает | Обновить описание |
| SHARED_LAYER_SYNC_REPORT.md | ⏳ Ожидает | Добавить примеры |
| PROJECT_STRUCTURE.md | ⏳ Ожидает | Обновить описание |
| VALIDATION_ARCHITECTURE_QUESTION.md | ⏳ Ожидает | Обновить примеры |

---

## 🎯 Следующие шаги

1. ✅ Создан VALIDATION_COMBINATORS.md
2. ✅ Обновлен VALIDATION_ARCHITECTURE.md
3. ⏳ Обновить SPECIFICATION_VALIDATION.md
4. ⏳ Обновить остальные файлы
5. ⏳ Сделать коммит и пуш

---

**Канонический источник:** `docs/error-handling/VALIDATION_COMBINATORS.md`
