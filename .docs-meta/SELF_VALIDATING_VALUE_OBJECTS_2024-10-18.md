# Self-Validating Value Objects: Принцип DDD (2024-10-18)

## 📋 Проблема

Возник вопрос о правильной реализации Value Objects:

```typescript
// Текущая реализация
class ResourceName {
  static create(value: string) {
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}
```

**Вопрос**: Не нарушает ли это принципы DDD? Не должна ли валидация быть отдельной операцией?

---

## 🎯 Ответ: Self-Validating Value Objects

Согласно принципам DDD (Domain-Driven Design), **Value Objects должны быть самовалидирующимися** (self-validating).

### Ключевой принцип

> **Value Object отвечает за свою валидность.**
> 
> Если объект `ResourceName` существует, он **гарантированно валиден**.

---

## ✅ Правильная реализация

### Вариант 1: С атомарными инвариантами

```typescript
// app/domain/resource/ResourceName.ts
import { Result } from 'neverthrow'
import { InvariantViolationError } from '~/domain/shared/errors'
import { StringInvariant } from '~/domain/shared/invariants'

export class ResourceName {
  // ✅ КРИТИЧЕСКИ ВАЖНО: private конструктор
  private constructor(private readonly value: string) {}
  
  /**
   * Фабричный метод с self-validation
   * Валидация происходит ВНУТРИ Value Object
   */
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    // ✅ Value Object использует инварианты как УТИЛИТЫ
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .andThen(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, 'ResourceName')
      )
      .map(validValue => new ResourceName(validValue))
      // ✅ Конструктор вызывается ПОСЛЕ валидации, внутри map
  }
  
  getValue(): string {
    return this.value
  }
}
```

### Вариант 2: С композитным инвариантом (оптимизированный)

```typescript
// app/domain/resource/ResourceName.ts
import { Result } from 'neverthrow'
import { InvariantViolationError } from '~/domain/shared/errors'
import { IdentifierInvariant } from '~/domain/shared/invariants'

export class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    // ✅ Value Object использует композитный инвариант как утилиту
    // ✅ Валидация все равно происходит ВНУТРИ Value Object
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(validValue => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

**Оба варианта правильные!** Разница только в уровне переиспользования композиции.

---

## ❌ Неправильная реализация

### Антипаттерн: Валидация снаружи

```typescript
// ❌ НЕПРАВИЛЬНО
class ResourceName {
  // ❌ Public конструктор - можно обойти валидацию!
  constructor(private readonly value: string) {}
}

// ❌ Валидация снаружи Value Object
function createResourceName(value: string): Result<ResourceName, InvariantViolationError> {
  return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
    .map(v => new ResourceName(v))
}

// Проблема 1: можно создать невалидный объект
const invalid = new ResourceName('') // ❌ Никакой валидации!

// Проблема 2: нарушение инкапсуляции
// Value Object не отвечает за свою валидность
```

**Проблемы**:
1. ⚠️ Можно обойти валидацию через `new ResourceName()`
2. ⚠️ Value Object не гарантирует свою валидность
3. ⚠️ Нарушение принципа инкапсуляции
4. ⚠️ Двойная ответственность (валидатор делает работу Value Object)

---

## 🎓 Принципы из DDD источников

### 1. Nikola Poša - "Self-validating Domain Model"

> "Self-validation, but also immutability, are a guarantee that a value object is valid for the entire time of its existence. We no longer have to worry about whether we need to validate a parameter or it has already been validated."

### 2. Domain Centric - "Validating Value Objects"

> "Value Objects are responsible for keeping their state consistent so sanity checking data on construction can be considered a good practice."

### 3. Enterprise Craftsmanship

> "If someone tries to create an entity or aggregate composed of value objects anywhere in the application, type-safe contract guarantees that the object is in a valid state."

---

## 🔑 Ключевые моменты

### 1. Инварианты - это утилиты, не валидаторы

```typescript
// ✅ StringInvariant - это утилита для переиспользования логики
class StringInvariant {
  static validateLength(value: string, min: number, max: number, entityType: string) {
    // Переиспользуемая логика
  }
}

// ✅ Value Object использует утилиту ВНУТРИ себя
class ResourceName {
  static create(value: string) {
    // Это НЕ внешняя валидация
    // Это использование утилиты внутри Value Object
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}
```

**Аналогия**: Использование `StringInvariant.validateLength()` внутри Value Object - это как использование `Math.max()`. Это утилита, не нарушение инкапсуляции.

### 2. Private конструктор критически важен

```typescript
export class ResourceName {
  // ✅ Private - единственный способ создать объект через create()
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    return this.validate(value).map(v => new ResourceName(v))
  }
}

// ❌ НЕВОЗМОЖНО: new ResourceName('anything')
// ✅ МОЖНО: ResourceName.create('valid-name')
```

### 3. Гарантии self-validation

Если у вас есть объект типа `ResourceName`:
- ✅ Он **гарантированно валиден**
- ✅ Не нужно валидировать повторно
- ✅ Type safety на уровне компилятора
- ✅ Валидность на протяжении всей жизни (immutability)

```typescript
// ✅ Если параметр имеет тип ResourceName, он точно валиден
function processResource(name: ResourceName) {
  // Не нужна валидация - объект уже валиден!
  console.log(name.getValue())
}

// Валидация только при создании
const result = ResourceName.create(userInput)
result.match(
  (validName) => processResource(validName), // ✅ Гарантированно валиден
  (error) => handleError(error)
)
```

---

## 🔄 Result vs throw

Оба подхода корректны для DDD:

### С throw (классический подход):

```typescript
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): ResourceName {
    if (value.length < 1 || value.length > 100) {
      throw new InvariantViolationError('ResourceName', 'invalid length')
    }
    return new ResourceName(value)
  }
}
```

### С Result (функциональный подход):

```typescript
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}
```

**Оба правильные для DDD!** Разница в способе обработки ошибок:
- `throw` - императивный стиль (try-catch)
- `Result` - функциональный стиль (Railway-Oriented Programming)

---

## 📊 Сравнение подходов

| Критерий | Правильно (self-validating) | Неправильно (внешняя валидация) |
|----------|----------------------------|----------------------------------|
| **Конструктор** | `private` | `public` |
| **Валидация** | Внутри `create()` | Снаружи |
| **Можно обойти?** | ❌ Нет | ✅ Да |
| **Гарантия валидности** | ✅ Да | ❌ Нет |
| **Инкапсуляция** | ✅ Соблюдена | ❌ Нарушена |
| **DDD-compliant** | ✅ Да | ❌ Нет |

---

## ✅ Рекомендации

### Для Value Objects:

1. **Всегда** делай конструктор `private`
2. **Всегда** валидируй в фабричном методе (`create()`)
3. **Используй** инварианты как утилиты ВНУТРИ Value Object
4. **Возвращай** `Result<T, E>` для type-safe обработки ошибок
5. **Гарантируй** immutability

### Для инвариантов:

1. **Инварианты** - это переиспользуемые утилиты, не валидаторы
2. **Атомарные инварианты** (`StringInvariant`) для базовых операций
3. **Композитные инварианты** (`IdentifierInvariant`) для частых композиций
4. **Не выносить** валидацию за пределы Value Object

---

## 🔗 Источники

### Статьи:
- [Self-validating Domain Model — Nikola Poša](https://www.nikolaposa.in.rs/blog/2020/08/17/self-validating-domain-model/)
- [Validating Value Objects — Domain Centric](https://domaincentric.net/blog/validating-value-objects)
- [Value Objects and Error Messages · Enterprise Craftsmanship](https://enterprisecraftsmanship.com/posts/value-objects-error-messages/)

### DDD источники:
- Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Vaughn Vernon - "Implementing Domain-Driven Design"

---

## 📝 Обновленные файлы

1. ✅ `docs/error-handling/INVARIANTS.md` - добавлена секция "Self-Validating Value Objects"
2. ✅ Уточнена роль инвариантов как утилит
3. ✅ Показаны правильные и неправильные примеры
4. ✅ Объяснена важность `private` конструктора

---

**Дата**: 2024-10-18  
**Тип**: Clarification (уточнение архитектурных принципов)  
**Статус**: ✅ Завершено  
**DDD-compliant**: ✅ Да
