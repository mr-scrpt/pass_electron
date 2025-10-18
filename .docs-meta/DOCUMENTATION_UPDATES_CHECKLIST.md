# Чеклист обновлений документации: Private Constructor (2024-10-18)

## 📋 Что изменяем

### Основные изменения:

1. **Private конструктор** - добавляем `private` перед всеми конструкторами Value Objects
2. **Уточнение роли инвариантов** - инварианты это утилиты, не валидаторы
3. **Принцип self-validating** - Value Object отвечает за свою валидность

---

## ✅ Уже обновлены

Следующие файлы **уже содержат правильные примеры**:

- ✅ `docs/error-handling/INVARIANTS.md` - все примеры с `private constructor`
- ✅ `docs/DDD_AND_CLEAN_ARCHITECTURE.md` - примеры с `private constructor`
- ✅ `steps/step_1/README.md` - все Value Objects с `private constructor`
- ✅ `docs/contracts/README.md` - пример Namespace с `private constructor`
- ✅ `docs/concepts/ARCHITECTURE_DESIGN.md` - пример Namespace с `private constructor`

---

## 🔧 Требуют обновления

### 1. `docs/error-handling/README.md`

**Строка 104**: Добавить `private constructor`

```typescript
// ❌ СЕЙЧАС
class ResourceName {
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    StringInvariant.ensureLength(value, 1, 100, 'ResourceName')
    return success(new ResourceName(value))
  }
}

// ✅ ИСПРАВИТЬ
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .map(validValue => new ResourceName(validValue))
  }
}
```

---

### 2. `docs/error-handling/ERROR_HANDLING.md`

**Несколько мест** требуют добавления `private constructor`:

#### Строка ~138:
```typescript
// ❌ СЕЙЧАС
class ResourceName {
  static create(value: string): ResourceName {
    if (!value || value.length < 1) {
      throw new InvariantViolationError(...)
    }
    return new ResourceName(value)
  }
}

// ✅ ИСПРАВИТЬ
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): ResourceName {
    if (!value || value.length < 1) {
      throw new InvariantViolationError(...)
    }
    return new ResourceName(value)
  }
}
```

#### Строка ~771:
То же самое - добавить `private constructor`

#### Строка ~827:
То же самое (даже в антипримерах нужен private конструктор)

---

### 3. `docs/error-handling/ERROR_ESCALATION.md`

**Несколько примеров** требуют `private constructor`:

#### Строка ~145 (нативный Result):
```typescript
// ❌ СЕЙЧАС
class ResourceName {
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value || value.length < 1) {
      return failure(...)
    }
    return success(new ResourceName(value))
  }
}

// ✅ ИСПРАВИТЬ
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value || value.length < 1) {
      return failure(...)
    }
    return success(new ResourceName(value))
  }
}
```

#### Строка ~215 (neverthrow):
```typescript
// ✅ ИСПРАВИТЬ
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value) {
      return err(new InvariantViolationError('ResourceName', 'empty'))
    }
    return ok(new ResourceName(value))
  }
}
```

#### Строка ~364 (fp-ts):
```typescript
// ✅ ИСПРАВИТЬ
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    if (!value) return left(new InvariantViolationError('ResourceName', 'empty'))
    return right(new ResourceName(value))
  }
}
```

#### Строка ~441 (гибридный подход):
```typescript
// ✅ ИСПРАВИТЬ
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value) return failure(new InvariantViolationError(...))
    return success(new ResourceName(value))
  }
}
```

---

### 4. `docs/error-handling/ERROR_ESCALATION_EXTENDED.md`

**Проверить примеры** (вероятно тоже требуют `private constructor`)

#### Примерно строка ~187 (@sweet-monads/either):
```typescript
// ✅ ИСПРАВИТЬ
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    if (!value) {
      return left(new InvariantViolationError('ResourceName', 'cannot be empty'))
    }
    return right(new ResourceName(value))
  }
}
```

---

## 📝 Дополнительные улучшения

### Опционально: Добавить комментарии

Для образовательной ценности можно добавлять комментарии:

```typescript
export class ResourceName {
  // ✅ Private конструктор - невозможно создать через new извне
  private constructor(private readonly value: string) {}
  
  // ✅ Единственный способ создать объект - через фабричный метод
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .map(validValue => new ResourceName(validValue))
      // ✅ Конструктор вызывается ПОСЛЕ валидации
  }
}
```

---

## 🚫 НЕ изменять

Следующие классы **НЕ должны** иметь `private constructor`:

### DTO (Data Transfer Objects)
```typescript
// ✅ Правильно - public конструктор
export class ResourceListItemDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly namespace: string
  ) {}
}
```

### Commands / Queries
```typescript
// ✅ Правильно - public конструктор
export class DeleteResourceCommand implements ICommand {
  readonly type = 'DeleteResourceCommand';
  constructor(public readonly resourceId: string) {}
}
```

### Domain Events
```typescript
// ✅ Правильно - public конструктор
export class ResourceCreatedEvent {
  constructor(
    public readonly resourceId: ResourceId,
    public readonly occurredAt: Date
  ) {}
}
```

### Обычные классы (не Value Objects)
```typescript
// ✅ Правильно - public конструктор
export class ListResourcesQueryHandler {
  constructor(private readonly repository: IResourceRepository) {}
  
  async handle(query: ListResourcesQuery) {
    // ...
  }
}
```

---

## 🎯 Критерий: Когда нужен private конструктор?

### ✅ Нужен private конструктор:
- **Value Object** с валидацией (ResourceName, Namespace, Email, Age, etc.)
- **Entity** с валидацией инвариантов
- **Singleton** классы

### ❌ НЕ нужен private конструктор:
- **DTO** (Data Transfer Objects)
- **Commands** / **Queries**
- **Domain Events**
- **Handlers** (QueryHandler, CommandHandler)
- **Services** с DI
- **Утилитные классы** (MathUtils, StringUtils, etc.)

---

## 📊 Статистика

| Категория | Количество файлов |
|-----------|------------------|
| ✅ Уже правильно | 5 файлов |
| 🔧 Требуют обновления | 4 файла |
| 🚫 Не изменять | Все остальные |

---

## ✅ План действий

1. Обновить `error-handling/README.md` - добавить `private constructor` в пример
2. Обновить `error-handling/ERROR_HANDLING.md` - 3 места с примерами
3. Обновить `error-handling/ERROR_ESCALATION.md` - 4 примера
4. Проверить и обновить `error-handling/ERROR_ESCALATION_EXTENDED.md`
5. Финальная проверка всех файлов с `grep`

---

**Дата**: 2024-10-18  
**Тип**: Documentation Update  
**Статус**: ✅ ЗАВЕРШЕНО

---

## ✅ Результат

Все изменения успешно внесены! 

- Обновлено **4 файла**
- Исправлено **10 примеров** кода
- Добавлен `private constructor` во все Value Objects
- Добавлен метод `getValue()` для доступа к значению
- Сохранена вся валидационная логика

**Детали**: См. `.docs-meta/PRIVATE_CONSTRUCTOR_UPDATE_COMPLETE.md`
