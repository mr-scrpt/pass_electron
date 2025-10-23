# План рефакторинга VO на Specification Pattern

**Дата:** 2025-01-22  
**Статус:** Планирование

---

## 🎯 Проблема

В Step 1 VO используют **инлайн валидацию** вместо **Specification Pattern**:

### ❌ Текущий подход (инлайн):

```typescript
export class Namespace {
  static create(value: string): Validation<InvariantViolationError[], Namespace> {
    const validations = [
      value && value.trim()
        ? valid(value)
        : invalid(new InvariantViolationError('Namespace', 'cannot be empty')),
      
      value.length >= 2 && value.length <= 50
        ? valid(value)
        : invalid(new InvariantViolationError('Namespace', 'must be 2-50 characters')),
      
      /^[a-z0-9-_]+$/.test(value)
        ? valid(value)
        : invalid(new InvariantViolationError('Namespace', 'invalid format'))
    ]
    
    return ValidationCombinators.sequence(validations, () => new Namespace(value))
  }
}
```

**Проблемы:**
- ❌ Дублирование логики валидации
- ❌ Нет переиспользования
- ❌ Сложно тестировать
- ❌ Не следует Specification Pattern

---

## ✅ Правильный подход (Specification Pattern):

```typescript
export class Namespace {
  static create(value: string): Validation<ValidationError[], Namespace> {
    const specs = [
      new NotEmptySpec('Namespace'),           // ✅ Переиспользуемая
      new LengthRangeSpec(2, 50, 'Namespace'), // ✅ Переиспользуемая
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace'), // ✅ Переиспользуемая
      new NotReservedNamespaceSpec()           // ✅ Бизнес-специфичная
    ]

    return ValidationCombinators.sequence(
      specs.map(spec => spec.isSatisfiedBy(value)),
      () => new Namespace(value)
    )
  }
}
```

**Преимущества:**
- ✅ Переиспользование спецификаций
- ✅ Легко тестировать
- ✅ Композиция общих + бизнес-специфичных
- ✅ Следует Specification Pattern

---

## 📋 План рефакторинга

### Этап 1: Создать общие спецификации

**Файл:** `src/shared/specification/StringSpecifications.ts`

```typescript
export class NotEmptySpec implements ISpecification<string> {
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value && value.trim()
      ? valid(value)
      : invalid(new ValidationError(this.entityType, "cannot be empty"))
  }
}

export class LengthRangeSpec implements ISpecification<string> {
  constructor(
    private min: number,
    private max: number,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value.length >= this.min && value.length <= this.max
      ? valid(value)
      : invalid(new ValidationError(
          this.entityType,
          `must be ${this.min}-${this.max} characters`
        ))
  }
}

export class PatternSpec implements ISpecification<string> {
  constructor(
    private pattern: RegExp,
    private message: string,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return this.pattern.test(value)
      ? valid(value)
      : invalid(new ValidationError(this.entityType, this.message))
  }
}
```

**Файл:** `src/shared/specification/UuidSpecifications.ts`

```typescript
export class UuidV4Spec implements ISpecification<string> {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return UuidV4Spec.UUID_V4_REGEX.test(value)
      ? valid(value)
      : invalid(new ValidationError(this.entityType, `Invalid UUID: ${value}`))
  }
}
```

---

### Этап 2: Создать бизнес-специфичные спецификации

**Файл:** `src/domain/resource/specifications/NotReservedNamespaceSpec.ts`

```typescript
export class NotReservedNamespaceSpec implements ISpecification<string> {
  private static readonly RESERVED_NAMESPACES = [
    'system',
    'admin',
    'root',
    'config',
    'settings'
  ]

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    const isReserved = NotReservedNamespaceSpec.RESERVED_NAMESPACES.includes(
      value.toLowerCase()
    )

    return !isReserved
      ? valid(value)
      : invalid(new ValidationError(
          'Namespace',
          `"${value}" is a reserved namespace and cannot be used`
        ))
  }
}
```

---

### Этап 3: Обновить Value Objects

#### 3.1 ResourceId

**Было:**
```typescript
static create(value: string): Either<InvariantViolationError, ResourceId> {
  return UuidInvariant.validate(value, ResourceId.ENTITY_TYPE)
    .map(validValue => new ResourceId(validValue))
}
```

**Стало:**
```typescript
static create(value: string): Validation<ValidationError[], ResourceId> {
  const specs = [
    new UuidV4Spec(ResourceId.ENTITY_TYPE)
  ]

  return ValidationCombinators.sequence(
    specs.map(spec => spec.isSatisfiedBy(value)),
    () => new ResourceId(value)
  )
}
```

#### 3.2 Namespace

**Было:**
```typescript
static create(value: string): Validation<InvariantViolationError[], Namespace> {
  const validations = [
    value && value.trim() ? valid(value) : invalid(...),
    value.length >= 2 && value.length <= 50 ? valid(value) : invalid(...),
    /^[a-z0-9-_]+$/.test(value) ? valid(value) : invalid(...)
  ]
  
  return ValidationCombinators.sequence(validations, () => new Namespace(value))
}
```

**Стало:**
```typescript
static create(value: string): Validation<ValidationError[], Namespace> {
  const specs = [
    new NotEmptySpec('Namespace'),
    new LengthRangeSpec(2, 50, 'Namespace'),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace'),
    new NotReservedNamespaceSpec()  // Бизнес-правило!
  ]

  return ValidationCombinators.sequence(
    specs.map(spec => spec.isSatisfiedBy(value)),
    () => new Namespace(value)
  )
}
```

#### 3.3 ResourceName

**Было:**
```typescript
static create(value: string): Validation<InvariantViolationError[], ResourceName> {
  const validations = [
    value && value.trim() ? valid(value) : invalid(...),
    value.length >= 2 && value.length <= 100 ? valid(value) : invalid(...),
    /^[a-zA-Z0-9-_]+$/.test(value) ? valid(value) : invalid(...)
  ]
  
  return ValidationCombinators.sequence(validations, () => new ResourceName(value))
}
```

**Стало:**
```typescript
static create(value: string): Validation<ValidationError[], ResourceName> {
  const specs = [
    new NotEmptySpec('ResourceName'),
    new LengthRangeSpec(2, 100, 'ResourceName'),
    new PatternSpec(/^[a-zA-Z0-9-_]+$/, 'invalid format', 'ResourceName')
  ]

  return ValidationCombinators.sequence(
    specs.map(spec => spec.isSatisfiedBy(value)),
    () => new ResourceName(value)
  )
}
```

---

### Этап 4: Обновить Aggregate

**Resource.create()** должен использовать VO со спецификациями:

```typescript
static create(
  namespace: string,
  name: string,
  secret: string
): Validation<ValidationError[], Resource> {
  // VO уже используют спецификации внутри
  const namespaceResult = Namespace.create(namespace)
  const nameResult = ResourceName.create(name)
  const idResult = ResourceId.generate()  // Всегда валидный

  // ValidationCombinators накапливает ВСЕ ошибки
  return ValidationCombinators.sequence(
    [namespaceResult, nameResult],
    ([ns, nm]) => new Resource(
      idResult,
      ns,
      nm,
      secret,
      new Date(),
      new Date()
    )
  )
}
```

---

### Этап 5: Обновить документацию

**Файлы для обновления:**
1. `steps/step_1/README.md` - примеры VO
2. `docs/error-handling/SPECIFICATION_VALIDATION.md` - уже правильный ✅
3. `docs/error-handling/INVARIANTS.md` - проверить

---

## 📊 Сравнение подходов

| Аспект | Инлайн валидация | Specification Pattern |
|--------|------------------|----------------------|
| **Переиспользование** | ❌ Нет | ✅ Да |
| **Тестирование** | ❌ Сложно | ✅ Легко |
| **Композиция** | ❌ Нет | ✅ Да |
| **Бизнес-правила** | ❌ Смешаны | ✅ Отдельно |
| **Читаемость** | ⚠️ Средняя | ✅ Высокая |

---

## ✅ Чек-лист

### Создание спецификаций:
- [ ] Создать `src/shared/specification/ISpecification.ts`
- [ ] Создать `src/shared/specification/StringSpecifications.ts`
- [ ] Создать `src/shared/specification/UuidSpecifications.ts`
- [ ] Создать `src/shared/specification/index.ts`
- [ ] Создать `src/domain/resource/specifications/NotReservedNamespaceSpec.ts`
- [ ] Создать `src/domain/resource/specifications/index.ts`

### Обновление VO:
- [ ] Обновить `ResourceId.create()`
- [ ] Обновить `Namespace.create()`
- [ ] Обновить `ResourceName.create()`

### Обновление Aggregate:
- [ ] Обновить `Resource.create()`

### Обновление документации:
- [ ] Обновить `steps/step_1/README.md`
- [ ] Проверить `docs/error-handling/SPECIFICATION_VALIDATION.md`
- [ ] Проверить `docs/error-handling/INVARIANTS.md`

### Коммит:
- [ ] Коммит изменений
- [ ] Push в репозиторий

---

## 🔗 Связанные документы

- [SPECIFICATION_VALIDATION.md](../docs/error-handling/SPECIFICATION_VALIDATION.md) - правильный подход ✅
- [VALIDATION_COMBINATORS.md](../docs/error-handling/VALIDATION_COMBINATORS.md) - ValidationCombinators
- [INVARIANTS.md](../docs/error-handling/INVARIANTS.md) - инварианты

---

**Следующий шаг:** Начать с создания общих спецификаций в `src/shared/specification/`
