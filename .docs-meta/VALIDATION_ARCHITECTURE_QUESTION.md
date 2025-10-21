# Вопрос: Архитектура валидации Value Objects с fail-fast и accumulate режимами

## 📋 Контекст проекта

### Архитектура
- **DDD (Domain-Driven Design)** + **Clean Architecture**
- **Hexagonal Architecture** (Ports & Adapters)
- **CQRS** (Command Query Responsibility Segregation)

### Структура слоев
```
src/
├── domain/              # Domain Layer (центр, без зависимостей)
│   └── resource/
│       ├── value-objects/
│       │   ├── Namespace.ts
│       │   └── ResourceName.ts
│       ├── aggregates/
│       │   └── Resource.ts
│       └── repositories/
│           └── IResourceRepository.ts
├── application/         # Application Layer (Use Cases, Commands, Queries)
│   ├── commands/
│   │   └── handlers/
│   │       └── CreateResourceHandler.ts
│   └── queries/
├── infrastructure/      # Infrastructure Layer (DB, API, External Services)
├── composition/         # Composition Root (DI Container)
└── shared/              # Shared utilities (используется всеми слоями)
    ├── specification/   # Specification Pattern
    │   ├── ISpecification.ts
    │   ├── CompositeSpecification.ts
    │   └── StringSpecifications.ts (NotEmptySpec, LengthRangeSpec, PatternSpec)
    └── validation/
        └── Validation.ts (Either-based Result type)
```

### Используемые паттерны
- **Specification Pattern** - для декларативной валидации (избегаем if-hell)
- **Always-Valid Domain Model** - невозможно создать невалидный Value Object
- **Result/Either Pattern** - вместо exceptions (используем `@sweet-monads/either`)

### Текущая реализация Specification Pattern

```typescript
// src/shared/specification/CompositeSpecification.ts
export class CompositeSpecification {
  // Fail-fast - останавливается на первой ошибке
  static allOf<T>(...specs: ISpecification<T>[]): ISpecification<T> {
    return {
      isSatisfiedBy(value: T): Validation<ValidationError, T> {
        for (const spec of specs) {
          const result = spec.isSatisfiedBy(value)
          if (result.isLeft()) {
            return result  // Останавливаемся на первой ошибке
          }
        }
        return valid(value)
      }
    }
  }

  // Accumulate - собирает ВСЕ ошибки
  static allOfAccumulate<T>(...specs: ISpecification<T>[]): ISpecification<T> {
    return {
      isSatisfiedBy(value: T): Validation<ValidationError[], T> {
        const errors: ValidationError[] = []
        for (const spec of specs) {
          const result = spec.isSatisfiedBy(value)
          if (result.isLeft()) {
            errors.push(result.value)
          }
        }
        return errors.length === 0 ? valid(value) : invalid(errors)
      }
    }
  }
}
```

---

## 🎯 Проблема

Нужно реализовать валидацию Value Objects с двумя режимами:

### 1. Fail-fast (для Domain Layer)
- Value Object проверяет инварианты при создании
- Останавливается на первой ошибке
- Принцип **Always-Valid Domain Model**

### 2. Accumulate (для Application Layer)
- Собирает ВСЕ ошибки валидации
- Используется для:
  - Логирования (полная картина ошибок)
  - Нотификаций (отправка всех ошибок пользователю)
  - Batch обработки (валидация множества объектов)
  - Формы UI (показать все ошибки сразу)

### Требования
1. ✅ **Нет дублирования** - спецификации (инварианты) определены ОДИН раз
2. ✅ **Always-Valid Domain Model** - Value Object всегда fail-fast
3. ✅ **Не привязано к UI** - accumulate для любых целей (логирование, нотификации, batch)
4. ✅ **Чистый DDD** - не нарушать архитектурные принципы
5. ✅ **Простота** - избегать overengineering

---

## 🔄 Варианты решения

### Вариант A: Дублирование проверок (Domain + Application)

```typescript
// ===== Domain Layer =====
// src/domain/resource/value-objects/Namespace.ts
export class Namespace {
  private constructor(private readonly _value: string) {}

  // ⭐ Fail-fast валидация
  static create(value: string): Validation<ValidationError, Namespace> {
    return CompositeSpecification.allOf(
      new NotEmptySpec('Namespace'),
      new LengthRangeSpec(2, 50, 'Namespace'),
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
    ).isSatisfiedBy(value).map(v => new Namespace(v))
  }

  getValue(): string {
    return this._value
  }
}
```

```typescript
// ===== Application Layer =====
// src/application/validation/NamespaceValidator.ts
export class NamespaceValidator {
  // ⭐ Accumulate валидация (ДУБЛИРОВАНИЕ спецификаций)
  static validateWithAllErrors(value: string): Validation<ValidationError[], string> {
    return CompositeSpecification.allOfAccumulate(
      new NotEmptySpec('Namespace'),           // Дублируется
      new LengthRangeSpec(2, 50, 'Namespace'), // Дублируется
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace') // Дублируется
    ).isSatisfiedBy(value)
  }
}
```

```typescript
// src/application/commands/handlers/CreateResourceHandler.ts
export class CreateResourceHandler {
  async execute(dto: CreateResourceDTO): Promise<Either<CommandError, Resource>> {
    // Этап 1: Accumulate для логирования/нотификаций
    const validation = NamespaceValidator.validateWithAllErrors(dto.namespace)
    if (validation.isLeft()) {
      logger.error('All validation errors:', validation.value)
      await notificationService.sendBulk(validation.value)
      return left(new ValidationError(validation.value))
    }

    // Этап 2: Создание Value Object (fail-fast, уже валидно)
    const namespace = Namespace.create(dto.namespace).unwrap()
    
    // ...
  }
}
```

**Плюсы:**
- ✅ Value Object НЕ знает о спецификациях (они inline)
- ✅ Простота
- ✅ Не нарушает архитектурные правила

**Минусы:**
- ❌ Дублирование спецификаций (Domain + Application)
- ❌ При изменении инвариантов нужно менять в двух местах

---

### Вариант B: Спецификации в Value Object + getSpecs()

```typescript
// ===== Domain Layer =====
// src/domain/resource/value-objects/Namespace.ts
export class Namespace {
  // ⚠️ Value Object ЗНАЕТ о спецификациях
  private static readonly SPECS = [
    new NotEmptySpec('Namespace'),
    new LengthRangeSpec(2, 50, 'Namespace'),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
  ]

  private constructor(private readonly _value: string) {}

  // Fail-fast валидация
  static create(value: string): Validation<ValidationError, Namespace> {
    return CompositeSpecification.allOf(...Namespace.SPECS)
      .isSatisfiedBy(value)
      .map(v => new Namespace(v))
  }

  // ⚠️ Экспортируем спецификации для переиспользования
  static getSpecs(): ISpecification<string>[] {
    return [...Namespace.SPECS]
  }

  getValue(): string {
    return this._value
  }
}
```

```typescript
// ===== Application Layer =====
// src/application/validation/ValidatorFactory.ts
export class ValidatorFactory {
  static forNamespace(mode: 'fail-fast' | 'accumulate'): ISpecification<string> {
    const specs = Namespace.getSpecs()  // Переиспользуем спецификации из Domain
    
    return mode === 'fail-fast'
      ? CompositeSpecification.allOf(...specs)
      : CompositeSpecification.allOfAccumulate(...specs)
  }
}
```

```typescript
// src/application/commands/handlers/CreateResourceHandler.ts
export class CreateResourceHandler {
  async execute(dto: CreateResourceDTO): Promise<Either<CommandError, Resource>> {
    // Этап 1: Accumulate для логирования/нотификаций
    const validator = ValidatorFactory.forNamespace('accumulate')
    const validation = validator.isSatisfiedBy(dto.namespace)
    
    if (validation.isLeft()) {
      logger.error('All validation errors:', validation.value)
      await notificationService.sendBulk(validation.value)
      return left(new ValidationError(validation.value))
    }

    // Этап 2: Создание Value Object (fail-fast, уже валидно)
    const namespace = Namespace.create(dto.namespace).unwrap()
    
    // ...
  }
}
```

**Плюсы:**
- ✅ Нет дублирования - спецификации определены ОДИН раз
- ✅ Простота
- ✅ Гибкость - Application Layer конфигурирует режим

**Минусы:**
- ❌ Value Object ЗНАЕТ о спецификациях (хранит SPECS)
- ❌ Value Object ЗНАЕТ о режимах валидации (через getSpecs)
- ⚠️ Нарушение SRP? (Value Object отвечает за данные И за спецификации)

---

### Вариант C: Спецификации в отдельном файле + Factory

```typescript
// ===== Domain Layer =====
// src/domain/resource/value-objects/Namespace.ts
export class Namespace {
  private constructor(private readonly _value: string) {}

  // ⭐ Небезопасный конструктор - только для внутреннего использования
  static fromValidated(value: string): Namespace {
    return new Namespace(value)
  }

  getValue(): string {
    return this._value
  }
}
```

```typescript
// src/domain/resource/specifications/NamespaceSpecifications.ts
export class NamespaceSpecifications {
  static readonly specs = [
    new NotEmptySpec('Namespace'),
    new LengthRangeSpec(2, 50, 'Namespace'),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
  ] as const

  static getAll(): ISpecification<string>[] {
    return [...NamespaceSpecifications.specs]
  }
}
```

```typescript
// src/domain/resource/factories/NamespaceFactory.ts
export class NamespaceFactory {
  // Fail-fast валидация
  static create(value: string): Validation<ValidationError, Namespace> {
    const spec = CompositeSpecification.allOf(
      ...NamespaceSpecifications.getAll()
    )
    
    return spec
      .isSatisfiedBy(value)
      .map(validValue => Namespace.fromValidated(validValue))
  }
}
```

```typescript
// ===== Application Layer =====
// src/application/validation/ValidatorFactory.ts
export class ValidatorFactory {
  static forNamespace(mode: 'fail-fast' | 'accumulate'): ISpecification<string> {
    const specs = NamespaceSpecifications.getAll()
    
    return mode === 'fail-fast'
      ? CompositeSpecification.allOf(...specs)
      : CompositeSpecification.allOfAccumulate(...specs)
  }
}
```

```typescript
// src/application/commands/handlers/CreateResourceHandler.ts
export class CreateResourceHandler {
  async execute(dto: CreateResourceDTO): Promise<Either<CommandError, Resource>> {
    // Этап 1: Accumulate для логирования/нотификаций
    const validator = ValidatorFactory.forNamespace('accumulate')
    const validation = validator.isSatisfiedBy(dto.namespace)
    
    if (validation.isLeft()) {
      logger.error('All validation errors:', validation.value)
      await notificationService.sendBulk(validation.value)
      return left(new ValidationError(validation.value))
    }

    // Этап 2: Создание Value Object через Factory (fail-fast, уже валидно)
    const namespace = NamespaceFactory.create(dto.namespace).unwrap()
    
    // ...
  }
}
```

**Плюсы:**
- ✅ Value Object НЕ знает о спецификациях
- ✅ Нет дублирования - спецификации определены ОДИН раз
- ✅ Чистый DDD (Value Object, Specifications, Factory - отдельные концепты)

**Минусы:**
- ❌ Усложнение - дополнительные файлы (Specifications, Factory)
- ❌ Value Object все равно проверяет инварианты, просто через прокси (Factory)
- ⚠️ Overengineering?

---

### Вариант D: Strategy Pattern + DI

```typescript
// ===== Shared Layer =====
// src/shared/validation/ValidationStrategy.ts
export interface IValidationStrategy {
  validate<T>(
    value: T,
    specs: ISpecification<T>[]
  ): Validation<ValidationError | ValidationError[], T>
}

export class FailFastStrategy implements IValidationStrategy {
  validate<T>(value: T, specs: ISpecification<T>[]): Validation<ValidationError, T> {
    return CompositeSpecification.allOf(...specs).isSatisfiedBy(value)
  }
}

export class AccumulateStrategy implements IValidationStrategy {
  validate<T>(value: T, specs: ISpecification<T>[]): Validation<ValidationError[], T> {
    return CompositeSpecification.allOfAccumulate(...specs).isSatisfiedBy(value)
  }
}
```

```typescript
// ===== Domain Layer =====
// src/domain/resource/value-objects/Namespace.ts
export class Namespace {
  private static readonly SPECS = [
    new NotEmptySpec('Namespace'),
    new LengthRangeSpec(2, 50, 'Namespace'),
    new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
  ]

  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError, Namespace> {
    return CompositeSpecification.allOf(...Namespace.SPECS)
      .isSatisfiedBy(value)
      .map(v => new Namespace(v))
  }

  static getSpecs(): ISpecification<string>[] {
    return [...Namespace.SPECS]
  }

  getValue(): string {
    return this._value
  }
}
```

```typescript
// ===== Application Layer =====
// src/application/validation/ConfigurableValidator.ts
export class ConfigurableValidator<T> {
  constructor(
    private readonly strategy: IValidationStrategy,
    private readonly specs: ISpecification<T>[]
  ) {}

  validate(value: T): Validation<ValidationError | ValidationError[], T> {
    return this.strategy.validate(value, this.specs)
  }
}

export class ValidatorFactory {
  static forNamespace(mode: 'fail-fast' | 'accumulate'): ConfigurableValidator<string> {
    const strategy = mode === 'fail-fast' 
      ? new FailFastStrategy() 
      : new AccumulateStrategy()
    
    return new ConfigurableValidator(strategy, Namespace.getSpecs())
  }
}
```

**Плюсы:**
- ✅ Нет дублирования
- ✅ Гибкость - легко добавить новые стратегии
- ✅ DI-friendly

**Минусы:**
- ❌ Value Object знает о спецификациях
- ❌ Высокая сложность
- ⚠️ Overengineering для простой задачи?

---

## ❓ Вопросы для анализа

1. **Какой вариант лучше соответствует принципам DDD и Clean Architecture?**

2. **Допустимо ли хранить спецификации внутри Value Object (`private static readonly SPECS`)?**
   - Это нарушение SRP?
   - Это нарушение принципа "Value Object отвечает только за данные"?

3. **Является ли дублирование спецификаций (Вариант A) приемлемым компромиссом?**
   - Спецификации все равно определены один раз (в shared/specification/)
   - Дублируется только их использование (Domain fail-fast, Application accumulate)

4. **Вариант C (Factory + отдельные Specifications) - это overengineering или правильный DDD?**
   - Value Object все равно проверяет инварианты, просто через прокси
   - Дополнительные файлы и слои абстракции

5. **Есть ли другие варианты, которые мы не рассмотрели?**

---

## 🎯 Критерии оценки

При выборе варианта учитывайте:

1. **DDD принципы:**
   - Always-Valid Domain Model
   - Value Object отвечает за инварианты
   - Separation of Concerns

2. **Clean Architecture:**
   - Dependency Rule (зависимости к центру)
   - Domain Layer не зависит от Application Layer

3. **Практичность:**
   - Простота поддержки
   - Избегание overengineering
   - DRY (Don't Repeat Yourself)

4. **Гибкость:**
   - Легко добавить новые режимы валидации
   - Легко изменить инварианты

---

## 📚 Дополнительный контекст

### Текущая реализация спецификаций (shared/specification/)

```typescript
// src/shared/specification/StringSpecifications.ts
export class NotEmptySpec implements ISpecification<string> {
  constructor(private readonly entityType: string) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    if (!value || value.trim().length === 0) {
      return invalid(new ValidationError(this.entityType, 'cannot be empty'))
    }
    return valid(value)
  }
}

export class LengthRangeSpec implements ISpecification<string> {
  constructor(
    private readonly min: number,
    private readonly max: number,
    private readonly entityType: string
  ) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    if (value.length < this.min || value.length > this.max) {
      return invalid(
        new ValidationError(this.entityType, `must be ${this.min}-${this.max} characters`)
      )
    }
    return valid(value)
  }
}

export class PatternSpec implements ISpecification<string> {
  constructor(
    private readonly pattern: RegExp,
    private readonly message: string,
    private readonly entityType: string
  ) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    if (!this.pattern.test(value)) {
      return invalid(new ValidationError(this.entityType, this.message))
    }
    return valid(value)
  }
}
```

### Использование в реальном сценарии

```typescript
// Command Handler должен:
// 1. Провалидировать DTO с accumulate (для логирования/нотификаций)
// 2. Создать Value Objects с fail-fast (Always-Valid)
// 3. Создать Aggregate
// 4. Сохранить через Repository

export class CreateResourceHandler {
  async execute(dto: CreateResourceDTO): Promise<Either<CommandError, Resource>> {
    // Шаг 1: Валидация DTO (accumulate)
    // - Логируем ВСЕ ошибки
    // - Отправляем нотификации по всем ошибкам
    // - Возвращаем все ошибки пользователю
    
    // Шаг 2: Создание Value Objects (fail-fast)
    // - Always-Valid Domain Model
    // - Невозможно создать невалидный объект
    
    // Шаг 3: Создание Aggregate
    // Шаг 4: Сохранение
  }
}
```

---

## 🙏 Просьба

Пожалуйста, проанализируйте все варианты и дайте рекомендацию:

1. Какой вариант лучше соответствует DDD и Clean Architecture?
2. Какие есть альтернативные решения?
3. Какие компромиссы приемлемы, а какие нет?

Спасибо!
