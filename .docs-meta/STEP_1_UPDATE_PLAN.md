# План обновления Step 1 - Validation API

**Дата:** 2025-01-22  
**Статус:** Планирование

---

## 🎯 Проблема

В `steps/step_1/README.md` используется упрощенный подход к валидации Value Objects:
- ❌ Прямое использование `Either` из `@sweet-monads/either`
- ❌ Императивные проверки с `if/else`
- ❌ Fail-fast подход (останавливается на первой ошибке)
- ❌ Нет упоминания о `Validation` API
- ❌ Нет упоминания о `ValidationCombinators`

**Текущий код:**
```typescript
static create(value: string): Either<InvariantViolationError, Namespace> {
  if (!value) {
    return left(new InvariantViolationError(Namespace.ENTITY_TYPE, 'cannot be empty'))
  }
  
  if (value.length < Namespace.MIN_LENGTH || value.length > Namespace.MAX_LENGTH) {
    return left(new InvariantViolationError(
      Namespace.ENTITY_TYPE,
      `must be ${Namespace.MIN_LENGTH}-${Namespace.MAX_LENGTH} characters`
    ))
  }
  
  if (!Namespace.PATTERN.test(value)) {
    return left(new InvariantViolationError(
      Namespace.ENTITY_TYPE,
      'must contain only lowercase letters, numbers, - and _'
    ))
  }
  
  return right(new Namespace(value))
}
```

---

## 📋 Что нужно обновить

### 1. Добавить секцию "Подготовка: Validation API"

**Перед созданием Value Objects** нужно создать абстракцию над монадами.

#### 1.1. Создать `src/shared/validation/`

**Файлы:**
- `Validation.ts` - тип и базовые функции
- `ValidationCombinators.ts` - комбинаторы для накопления ошибок
- `index.ts` - Public API

#### 1.2. Объяснить зачем нужна абстракция

**Причины:**
1. Изоляция от библиотеки `@sweet-monads/either`
2. Возможность легко заменить библиотеку
3. Понятные имена: `Validation`, `valid`, `invalid`
4. Накопление ВСЕХ ошибок для лучшего UX

---

### 2. Обновить примеры Value Objects

#### Вариант A: Упрощенный (для Step 1)

Использовать `Validation` но с простыми проверками:

```typescript
import { Validation, valid, invalid } from '@/shared/validation'
import { InvariantViolationError } from '@/domain/shared'

export class Namespace {
  private static readonly ENTITY_TYPE = 'Namespace'
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/
  
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<InvariantViolationError, Namespace> {
    // Упрощенный вариант: fail-fast
    if (!value) {
      return invalid(new InvariantViolationError(Namespace.ENTITY_TYPE, 'cannot be empty'))
    }
    
    if (value.length < Namespace.MIN_LENGTH || value.length > Namespace.MAX_LENGTH) {
      return invalid(new InvariantViolationError(
        Namespace.ENTITY_TYPE,
        `must be ${Namespace.MIN_LENGTH}-${Namespace.MAX_LENGTH} characters`
      ))
    }
    
    if (!Namespace.PATTERN.test(value)) {
      return invalid(new InvariantViolationError(
        Namespace.ENTITY_TYPE,
        'must contain only lowercase letters, numbers, - and _'
      ))
    }
    
    return valid(new Namespace(value))
  }
  
  getValue(): string {
    return this._value
  }
  
  equals(other: Namespace): boolean {
    return this._value === other._value
  }
}
```

**Преимущества:**
- ✅ Использует `Validation` API
- ✅ Простой для понимания
- ✅ Подходит для первого шага

**Недостатки:**
- ⚠️ Fail-fast (останавливается на первой ошибке)
- ⚠️ Императивный стиль

#### Вариант B: С накоплением ошибок (рекомендуется)

Использовать `ValidationCombinators` и спецификации:

```typescript
import { Validation, ValidationCombinators } from '@/shared/validation'
import { InvariantViolationError } from '@/domain/shared'

export class Namespace {
  private static readonly ENTITY_TYPE = 'Namespace'
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/
  
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<InvariantViolationError[], Namespace> {
    const validations = [
      // Проверка на пустоту
      value && value.trim()
        ? valid(value)
        : invalid(new InvariantViolationError(Namespace.ENTITY_TYPE, 'cannot be empty')),
      
      // Проверка длины
      value.length >= Namespace.MIN_LENGTH && value.length <= Namespace.MAX_LENGTH
        ? valid(value)
        : invalid(new InvariantViolationError(
            Namespace.ENTITY_TYPE,
            `must be ${Namespace.MIN_LENGTH}-${Namespace.MAX_LENGTH} characters`
          )),
      
      // Проверка паттерна
      Namespace.PATTERN.test(value)
        ? valid(value)
        : invalid(new InvariantViolationError(
            Namespace.ENTITY_TYPE,
            'must contain only lowercase letters, numbers, - and _'
          ))
    ]
    
    // ValidationCombinators.sequence накапливает ВСЕ ошибки
    return ValidationCombinators.sequence(
      validations,
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

**Преимущества:**
- ✅ Накопление ВСЕХ ошибок
- ✅ Лучший UX (пользователь видит все проблемы сразу)
- ✅ Функциональный подход

**Недостатки:**
- ⚠️ Чуть сложнее для первого шага

---

## 🎯 Рекомендуемый подход

### Для Step 1: Комбинированный подход

1. **Сначала показать упрощенный вариант (Вариант A)**
   - Использует `Validation` API
   - Fail-fast для простоты
   - Легко понять

2. **Затем показать улучшенный вариант (Вариант B)**
   - С накоплением ошибок
   - С `ValidationCombinators`
   - Объяснить преимущества

3. **Добавить примечание**
   > 💡 **Для production:** Рекомендуется использовать Specification Pattern (см. [SPECIFICATION_VALIDATION.md](../../docs/error-handling/SPECIFICATION_VALIDATION.md)) для переиспользуемых правил валидации.

---

## 📝 Структура обновления

### Секция 1: Подготовка (новая)

```markdown
## 📦 Шаг 0: Подготовка - Validation API

Перед созданием Value Objects создадим абстракцию над монадами.

### 0.1. Создать Validation API

**Зачем?**
- Изоляция от библиотеки `@sweet-monads/either`
- Понятные имена: `Validation`, `valid`, `invalid`
- Накопление ВСЕХ ошибок для лучшего UX

**Файлы:**
1. `src/shared/validation/Validation.ts`
2. `src/shared/validation/ValidationCombinators.ts`
3. `src/shared/validation/index.ts`

[Код файлов...]

### 0.2. Почему не использовать Either напрямую?

[Объяснение...]
```

### Секция 2: Value Objects (обновить)

```markdown
## 🎯 Шаг 1: Domain Layer - Value Objects

### 1.1. Создать Value Object: Namespace (упрощенный)

[Вариант A - fail-fast...]

### 1.2. Улучшенный вариант с накоплением ошибок

[Вариант B - ValidationCombinators...]

### 1.3. Сравнение подходов

[Таблица сравнения...]
```

---

## ✅ Чек-лист обновления

### Файлы для обновления:

- [ ] `steps/step_1/README.md`
  - [ ] Добавить секцию "Шаг 0: Validation API"
  - [ ] Обновить примеры Namespace
  - [ ] Обновить примеры ResourceName
  - [ ] Добавить сравнение подходов
  - [ ] Добавить ссылки на VALIDATION_COMBINATORS.md

### Новые файлы (если нужны):

- [ ] `steps/step_1/VALIDATION_API_SETUP.md` (опционально)
  - Детальное описание создания Validation API
  - Примеры использования
  - Тесты

---

## 📖 Ссылки на документацию

- [VALIDATION_COMBINATORS.md](../../docs/error-handling/VALIDATION_COMBINATORS.md) - ValidationCombinators с mergeInMany
- [SPECIFICATION_VALIDATION.md](../../docs/error-handling/SPECIFICATION_VALIDATION.md) - Specification Pattern
- [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - Value Objects vs TypeScript типы

---

**Следующий шаг:** Обсудить с пользователем какой вариант использовать в Step 1
