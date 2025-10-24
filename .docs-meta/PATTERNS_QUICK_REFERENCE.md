# 🚀 Краткая справка: Паттерны валидации

**Дата обновления:** 23 октября 2025

---

## 📦 Два паттерна

| Что | Паттерн | Использование |
|-----|---------|---------------|
| **Инварианты** | Singleton | `UuidInvariant.instance.validate(value, 'ResourceId')` |
| **Спецификации** | Singleton Factory | `CommonNotEmptySpec.for('ResourceId').isSatisfiedBy(value)` |

---

## 🔧 Инварианты (Singleton)

### UuidInvariant

```typescript
// Использование
UuidInvariant.instance.validate(value, 'ResourceId')
UuidInvariant.instance.validate(value, 'FieldId')
UuidInvariant.instance.isValidUuid(value)
```

**Ключевое:**
- ✅ Один экземпляр на всё приложение
- ✅ `entityType` - параметр метода (динамический)
- ✅ Stateless - нет состояния
- ✅ Реализует `IInvariant<string>`

### NamespaceInvariant

```typescript
// Использование
NamespaceInvariant.instance.validate(value, 'Namespace')
```

**Ключевое:**
- ✅ Один экземпляр на всё приложение
- ✅ Правила ВНУТРИ инварианта (2-50 символов, lowercase, pattern)
- ✅ Реализует `IInvariant<string>`
- ✅ Согласованно с `UuidInvariant`

### ResourceNameInvariant

```typescript
// Использование
ResourceNameInvariant.instance.validate(value, 'ResourceName')
```

**Ключевое:**
- ✅ Один экземпляр на всё приложение
- ✅ Правила ВНУТРИ инварианта (1-100 символов)
- ✅ Реализует `IInvariant<string>`
- ✅ Согласованно с другими инвариантами

### Создание нового инварианта

```typescript
export class EmailInvariant implements IInvariant<string> {
  private static readonly _instance = new EmailInvariant();
  private constructor() {}
  
  static get instance(): EmailInvariant {
    return EmailInvariant._instance;
  }
  
  validate(value: string, entityType: string): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for(entityType).isSatisfiedBy(value),
        CommonPatternSpec.for(entityType, EMAIL_REGEX, 'must be valid email')
          .isSatisfiedBy(value)
      ],
      () => value
    );
  }
}
```

---

## 📋 Спецификации (Singleton Factory)

### Доступные спецификации

```typescript
// Пустота
CommonNotEmptySpec.for('ResourceName').isSatisfiedBy(value)

// Длина
CommonLengthSpec.for('Namespace', 1, 50).isSatisfiedBy(value)

// Regex
CommonPatternSpec.for('Email', EMAIL_REGEX, 'invalid email').isSatisfiedBy(value)

// UUID
UuidV4Spec.for('ResourceId').isSatisfiedBy(value)

// Lowercase
LowercaseSpec.for('Namespace').isSatisfiedBy(value)
```

**Ключевое:**
- ✅ Экземпляры кэшируются по ключу
- ✅ `entityType` - фиксирован при создании
- ✅ Stateful - хранят entityType

### Создание новой спецификации

```typescript
export class EmailFormatSpec implements ISpecification<string> {
  private static readonly _instances = new Map<string, EmailFormatSpec>();
  
  private constructor(private readonly entityType: string) {}
  
  static for(entityType: string): EmailFormatSpec {
    if (!EmailFormatSpec._instances.has(entityType)) {
      EmailFormatSpec._instances.set(
        entityType,
        new EmailFormatSpec(entityType)
      );
    }
    return EmailFormatSpec._instances.get(entityType)!;
  }
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(EMAIL_REGEX.test(value), value)
      .valid()
      .invalid(new ValidationError(this.entityType, 'invalid email format'));
  }
}
```

---

## 🎯 Когда что использовать?

### Инвариант (Singleton)

**Используй когда:**
- ✅ Комбинация нескольких проверок
- ✅ Нужна переиспользуемость для разных типов
- ✅ `entityType` меняется динамически

**Пример:**
```typescript
// UuidInvariant для ResourceId, FieldId, EntryId
UuidInvariant.instance.validate(value, 'ResourceId')
UuidInvariant.instance.validate(value, 'FieldId')
```

### Спецификация (Singleton Factory)

**Используй когда:**
- ✅ Одна конкретная проверка
- ✅ Может использоваться в композиции
- ✅ `entityType` фиксирован

**Пример:**
```typescript
// Композиция спецификаций
ValidationCombinators.sequence([
  CommonNotEmptySpec.for('Namespace').isSatisfiedBy(value),
  CommonLengthSpec.for('Namespace', 1, 50).isSatisfiedBy(value),
  LowercaseSpec.for('Namespace').isSatisfiedBy(value)
], () => value)
```

---

## 💡 Полные примеры Value Objects

### Namespace

```typescript
export class Namespace {
  private static readonly ENTITY_TYPE = 'Namespace';
  
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<ValidationError[], Namespace> {
    // ✅ Используем NamespaceInvariant (Singleton)
    // Правила валидации ВНУТРИ инварианта
    return NamespaceInvariant.instance
      .validate(value, Namespace.ENTITY_TYPE)
      .map((validValue: string) => new Namespace(validValue));
  }
  
  getValue(): string {
    return this._value;
  }
}
```

### ResourceName

```typescript
export class ResourceName {
  private static readonly ENTITY_TYPE = 'ResourceName';
  
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<ValidationError[], ResourceName> {
    // ✅ Используем ResourceNameInvariant (Singleton)
    // Правила валидации ВНУТРИ инварианта
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .map((validValue: string) => new ResourceName(validValue));
  }
  
  getValue(): string {
    return this._value;
  }
}
```

### ResourceId (UUID через UuidInvariant)

```typescript
export class ResourceId {
  private static readonly ENTITY_TYPE = 'ResourceId';
  
  private constructor(private readonly _value: string) {}
  
  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID());
  }
  
  static create(value: string): Validation<ValidationError[], ResourceId> {
    // Используем UuidInvariant (Singleton)
    return UuidInvariant.instance
      .validate(value, ResourceId.ENTITY_TYPE)
      .map(validValue => new ResourceId(validValue));
  }
  
  getValue(): string {
    return this._value;
  }
}
```

---

## ⚠️ Частые ошибки

### ❌ НЕ создавать экземпляры напрямую

```typescript
// ❌ НЕПРАВИЛЬНО
const spec = new CommonNotEmptySpec('ResourceId');

// ✅ ПРАВИЛЬНО
const spec = CommonNotEmptySpec.for('ResourceId');
```

### ❌ НЕ пытаться создать Singleton экземпляр

```typescript
// ❌ НЕПРАВИЛЬНО
const invariant = new UuidInvariant();

// ✅ ПРАВИЛЬНО
const result = UuidInvariant.instance.validate(value, 'ResourceId');
```

---

## 📊 Производительность

### Кэширование спецификаций

```typescript
// Первый вызов - создается экземпляр
CommonNotEmptySpec.for('ResourceId')  // Создание ✅

// Последующие вызовы - из кэша
CommonNotEmptySpec.for('ResourceId')  // Из кэша ⚡
CommonNotEmptySpec.for('ResourceId')  // Из кэша ⚡

// Другой entityType - новый экземпляр
CommonNotEmptySpec.for('FieldId')     // Создание ✅
```

### Singleton инвариант

```typescript
// Всегда один и тот же экземпляр
UuidInvariant.instance  // Singleton ⚡
UuidInvariant.instance  // Singleton ⚡
```

---

## 🔗 Связанные файлы

**Интерфейсы:**
- `src/domain/shared/invariants/IInvariant.ts`
- `src/shared/specification/ISpecification.ts`

**Инварианты (Shared):**
- `src/domain/shared/invariants/IInvariant.ts`
- `src/domain/shared/invariants/UuidInvariant.ts`

**Инварианты (Resource Bounded Context):**
- `src/domain/resource/invariants/NamespaceInvariant.ts`
- `src/domain/resource/invariants/ResourceNameInvariant.ts`

**Спецификации (Domain):**
- `src/domain/shared/specification/common/CommonNotEmptySpec.ts`
- `src/domain/shared/specification/common/CommonLengthSpec.ts`
- `src/domain/shared/specification/common/CommonPatternSpec.ts`

**Спецификации (Shared):**
- `src/shared/specification/StringSpecifications.ts`
- `src/shared/specification/UuidSpecifications.ts`

**Валидация:**
- `src/shared/validation/Validation.ts`
- `src/shared/validation/helpers.ts` (isTrue)

**Ошибки:**
- `src/shared/errors/ValidationError.ts`

---

**Последнее обновление:** Рефакторинг 23 октября 2025 ✅
