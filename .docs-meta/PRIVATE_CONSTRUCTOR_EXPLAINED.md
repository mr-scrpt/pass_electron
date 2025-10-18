# Private Constructor: Детальное объяснение (2024-10-18)

## 🎯 Что такое private конструктор?

`private` конструктор - это конструктор класса, который **можно вызвать только внутри самого класса**.

```typescript
class ResourceName {
  private constructor(private readonly value: string) {}
  //      ^^^^^^^ это модификатор доступа
}
```

---

## 📊 Что он делает?

### ❌ Миф: "Класс нельзя инстанциировать"

**Неправильно!** Класс **можно** инстанциировать, но **только внутри самого класса**.

```typescript
class ResourceName {
  private constructor(private readonly value: string) {}
  
  // ✅ МОЖНО: Внутри класса
  static create(value: string): ResourceName {
    return new ResourceName(value) // ✅ Работает
  }
}

// ❌ НЕЛЬЗЯ: Извне класса
const name = new ResourceName('test') // ❌ Ошибка компиляции
```

### ✅ Правда: "Контроль создания экземпляров"

Private конструктор дает **полный контроль** над тем, как и когда создаются экземпляры.

---

## 🔍 Детальное сравнение

### Вариант 1: Public конструктор (по умолчанию)

```typescript
class ResourceName {
  // Конструктор public по умолчанию (если не указан модификатор)
  constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, Error> {
    if (value.length < 1 || value.length > 100) {
      return err(new Error('Invalid length'))
    }
    return ok(new ResourceName(value))
  }
}

// Способ 1: Через фабричный метод (с валидацией)
const result1 = ResourceName.create('valid')
result1.match(
  (name) => console.log('Valid:', name),
  (error) => console.error('Error:', error)
)

// Способ 2: Напрямую (БЕЗ валидации) ⚠️
const name2 = new ResourceName('') // Невалидный объект!
const name3 = new ResourceName('x'.repeat(1000)) // Тоже невалидный!

// Проблема:
function processResource(name: ResourceName) {
  // name может быть невалидным!
  // Нужно валидировать заново?
  if (name.getValue().length === 0) {
    throw new Error('Invalid name!')
  }
  // ...
}
```

**Проблемы:**
1. ⚠️ **Два пути создания** - через `create()` и через `new`
2. ⚠️ **Можно обойти валидацию** - просто используй `new`
3. ⚠️ **Нет гарантий** - `ResourceName` может быть невалидным
4. ⚠️ **Нужна повторная валидация** - в каждом месте использования

---

### Вариант 2: Private конструктор (рекомендуется)

```typescript
class ResourceName {
  // ✅ Конструктор private - вызывать можно только внутри класса
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, Error> {
    if (value.length < 1 || value.length > 100) {
      return err(new Error('Invalid length'))
    }
    // ✅ Внутри класса можем вызвать private конструктор
    return ok(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}

// Способ 1: Через фабричный метод (единственный способ)
const result = ResourceName.create('valid')

// Способ 2: Напрямую - НЕВОЗМОЖНО ❌
const name = new ResourceName('')
//           ^^^^^^^^^^^^^^^^^^^
// Error: Constructor of class 'ResourceName' is private
// and only accessible within the class declaration.

// Решение:
function processResource(name: ResourceName) {
  // ✅ name ГАРАНТИРОВАННО валиден!
  // Валидация не нужна - если объект существует, он прошел валидацию
  console.log(name.getValue())
}
```

**Преимущества:**
1. ✅ **Один путь создания** - только через `create()`
2. ✅ **Невозможно обойти валидацию** - TypeScript не скомпилируется
3. ✅ **Гарантия валидности** - тип `ResourceName` = валидный объект
4. ✅ **Не нужна повторная валидация** - доверяем типу

---

## 🎓 Как работает private конструктор?

### Правило доступа

```typescript
class ResourceName {
  private constructor(value: string) {
    console.log('Конструктор вызван с:', value)
  }
  
  // ✅ МОЖНО: Статический метод внутри класса
  static create(value: string): ResourceName {
    return new ResourceName(value) // ✅ Работает
  }
  
  // ✅ МОЖНО: Метод экземпляра внутри класса
  clone(): ResourceName {
    return new ResourceName(this.value) // ✅ Работает
  }
  
  // ✅ МОЖНО: Любой другой метод внутри класса
  static empty(): ResourceName {
    return new ResourceName('default') // ✅ Работает
  }
}

// ❌ НЕЛЬЗЯ: Извне класса
const name = new ResourceName('test')
// Error: Constructor of class 'ResourceName' is private

// ✅ МОЖНО: Через публичный статический метод
const name = ResourceName.create('test') // ✅ Работает
```

---

## 💡 Когда использовать private конструктор?

### ✅ Используй, когда:

1. **Нужна валидация при создании**
   ```typescript
   class Email {
     private constructor(private readonly value: string) {}
     
     static create(value: string): Result<Email, Error> {
       if (!value.includes('@')) {
         return err(new Error('Invalid email'))
       }
       return ok(new Email(value))
     }
   }
   ```

2. **Гарантия инварианта (Value Object)**
   ```typescript
   class Age {
     private constructor(private readonly value: number) {}
     
     static create(value: number): Result<Age, Error> {
       if (value < 0 || value > 150) {
         return err(new Error('Invalid age'))
       }
       return ok(new Age(value))
     }
   }
   ```

3. **Сложная инициализация**
   ```typescript
   class Config {
     private constructor(
       private readonly host: string,
       private readonly port: number,
       private readonly secure: boolean
     ) {}
     
     static fromUrl(url: string): Result<Config, Error> {
       // Сложный парсинг URL
       const parsed = new URL(url)
       return ok(new Config(
         parsed.hostname,
         parseInt(parsed.port),
         parsed.protocol === 'https:'
       ))
     }
   }
   ```

4. **Singleton (один экземпляр)**
   ```typescript
   class Database {
     private static instance: Database | null = null
     
     private constructor() {
       console.log('Database initialized')
     }
     
     static getInstance(): Database {
       if (!this.instance) {
         this.instance = new Database()
       }
       return this.instance
     }
   }
   ```

---

### ❌ НЕ используй, когда:

1. **Простой data-класс без валидации**
   ```typescript
   // ❌ Не нужен private конструктор
   class Point {
     constructor(
       public readonly x: number,
       public readonly y: number
     ) {}
   }
   
   const p = new Point(10, 20) // Валидация не нужна
   ```

2. **Класс со статическими утилитами**
   ```typescript
   // ❌ Не нужен private конструктор (и вообще конструктор не нужен)
   class MathUtils {
     static add(a: number, b: number) { return a + b }
     static multiply(a: number, b: number) { return a * b }
   }
   
   // Даже можно запретить создание экземпляров
   class MathUtils {
     private constructor() {
       throw new Error('Cannot instantiate static class')
     }
     
     static add(a: number, b: number) { return a + b }
   }
   ```

3. **DTO (Data Transfer Object)**
   ```typescript
   // ❌ Не нужен private конструктор
   interface UserDTO {
     id: string
     name: string
     email: string
   }
   
   // Или class без логики
   class UserDTO {
     constructor(
       public id: string,
       public name: string,
       public email: string
     ) {}
   }
   ```

---

## 🎯 Итоговый паттерн для Value Objects

```typescript
import { Result, ok, err } from 'neverthrow'
import { InvariantViolationError } from '~/domain/shared/errors'
import { StringInvariant } from '~/domain/shared/invariants'

/**
 * Value Object с self-validation
 */
export class ResourceName {
  // ✅ 1. Private конструктор
  private constructor(private readonly value: string) {}
  
  /**
   * ✅ 2. Фабричный метод с валидацией
   */
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .andThen(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, 'ResourceName')
      )
      .map(validValue => new ResourceName(validValue))
      // ✅ 3. Конструктор вызывается ПОСЛЕ валидации
  }
  
  // ✅ 4. Публичные методы для работы со значением
  getValue(): string {
    return this.value
  }
  
  equals(other: ResourceName): boolean {
    return this.value === other.value
  }
  
  // ✅ 5. Можно добавлять другие фабричные методы
  static fromUpperCase(value: string): Result<ResourceName, InvariantViolationError> {
    return ResourceName.create(value.toLowerCase())
  }
}
```

---

## 🔑 Ключевые моменты

### 1. Private конструктор ≠ "класс нельзя создать"

```typescript
// ❌ Неправильное понимание
"Private конструктор делает класс неинстанциируемым"

// ✅ Правильное понимание
"Private конструктор контролирует КАК создаются экземпляры"
```

### 2. Можно вызывать внутри класса

```typescript
class ResourceName {
  private constructor(value: string) {}
  
  // ✅ Везде внутри класса можем вызвать конструктор
  static create(v: string) { return new ResourceName(v) }
  static empty() { return new ResourceName('') }
  clone() { return new ResourceName(this.value) }
}
```

### 3. Это про контроль, не про статику

```typescript
// ❌ НЕ про это
class MathUtils {
  private constructor() {} // Не нужен для статических утилит
  static add(a, b) { return a + b }
}

// ✅ Про это
class Email {
  private constructor(value: string) {} // Нужен для контроля валидации
  static create(value: string): Result<Email, Error> {
    // Валидация
    return ok(new Email(value))
  }
}
```

---

## 📊 Сравнительная таблица

| Аспект | Public конструктор | Private конструктор |
|--------|-------------------|---------------------|
| **Создание извне** | ✅ `new Class()` | ❌ Ошибка компиляции |
| **Создание внутри** | ✅ `new Class()` | ✅ `new Class()` |
| **Обход валидации** | ⚠️ Возможен | ✅ Невозможен |
| **Гарантия валидности** | ❌ Нет | ✅ Да |
| **Число способов создания** | ⚠️ Много | ✅ Контролируемо |
| **Type safety** | ⚠️ Слабая | ✅ Сильная |

---

## ✅ Рекомендации для Value Objects

1. **Всегда** делай конструктор `private`
2. **Всегда** создавай через фабричный метод `create()`
3. **Всегда** валидируй в `create()` перед вызовом конструктора
4. **Всегда** возвращай `Result<T, E>` для type-safe обработки
5. **Всегда** делай Value Object immutable (`readonly` поля)

```typescript
// ✅ Правильный Value Object
export class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    return validate(value).map(v => new ResourceName(v))
  }
  
  getValue(): string {
    return this.value
  }
}
```

---

**Дата**: 2024-10-18  
**Тип**: Technical explanation  
**Статус**: ✅ Завершено
