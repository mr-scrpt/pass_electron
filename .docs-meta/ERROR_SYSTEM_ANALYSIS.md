# Анализ системы ошибок - Полная проверка

## 🎯 Цель анализа

Проверить согласованность системы ошибок с требованиями:
1. ✅ Аккумуляция ошибок от спецификаций через VO → Aggregate → Handler → Composition
2. ✅ Infrastructure errors логируются, пользователю показывается другой текст
3. ✅ Контекстно-зависимые ошибки (exists = плохо для CREATE, хорошо для UPDATE)
4. ❌ Согласованность документации с кодом

---

## 📊 Текущее состояние

### 1. **Аккумуляция ошибок** - ✅ РАБОТАЕТ (частично)

#### ✅ Specifications → Invariants → Value Objects

**Работает через ValidationCombinators.sequence() + mergeInMany:**

```typescript
// Specifications возвращают Validation<BaseError, T>
NotEmptySpec.isSatisfiedBy(value)      // Validation<BaseError, string>
LengthRangeSpec.isSatisfiedBy(value)   // Validation<BaseError, string>

// Invariant накапливает через sequence
ResourceNameInvariant.validate(value, entityType) {
  return ValidationCombinators.sequence(
    [
      CommonNotEmptySpec.for({...}).isSatisfiedBy(value),
      CommonLengthSpec.for({...}).isSatisfiedBy(value),
    ],
    () => value
  )
  .mapLeft((errors) => 
    errors.map((err) => new ValidationError(entityType, [err.message]))
  )
}
// Validation<ValidationError[], string>

// Value Object использует Invariant
ResourceName.create(value) {
  return ResourceNameInvariant.instance
    .validate(value, ResourceName.ENTITY_TYPE)
    .map((validValue) => new ResourceName(validValue))
}
// Validation<ValidationError[], ResourceName>
```

**Результат:** ✅ Все ошибки валидации собираются в массив `ValidationError[]`

---

#### ❌ Value Objects → Aggregate - НЕ РАБОТАЕТ

**Проблема:** Aggregate НЕ аккумулирует ошибки Value Objects!

```typescript
// ❌ ТЕКУЩАЯ РЕАЛИЗАЦИЯ
class Resource {
  static generate(
    namespace: Namespace,      // УЖЕ созданные VO!
    name: ResourceName,         // УЖЕ созданные VO!
    secret: string
  ): Resource {
    return new Resource(...)
  }
}

// Создание Resource в Handler:
const namespaceResult = Namespace.create(input.namespace)  // Left(['error1'])
const nameResult = ResourceName.create(input.name)         // Left(['error2'])

// ❌ ПРОБЛЕМА: Нужно комбинировать результаты ВРУЧНУЮ!
if (namespaceResult.isLeft()) return namespaceResult
if (nameResult.isLeft()) return nameResult

const resource = Resource.generate(
  namespaceResult.value,
  nameResult.value,
  input.secret
)
```

**Что нужно:**

```typescript
// ✅ ПРАВИЛЬНО: Aggregate должен принимать Validation и комбинировать
class Resource {
  static create(
    namespace: Validation<ValidationError[], Namespace>,
    name: Validation<ValidationError[], ResourceName>,
    secret: string
  ): Validation<ValidationError[], Resource> {
    
    // Комбинируем ВСЕ ошибки через mergeInMany!
    return mergeInMany([namespace, name])
      .map(([ns, nm]) => new Resource(
        ResourceId.generate(),
        ns,
        nm,
        secret,
        new Date(),
        new Date()
      ))
  }
}

// В Handler - одна строка!
return Resource.create(
  Namespace.create(input.namespace),     // Left(['error1'])
  ResourceName.create(input.name),       // Left(['error2'])
  input.secret
)
// => Left(['error1', 'error2']) - ВСЕ ошибки!
```

**Вывод:** ❌ Аккумуляция обрывается на уровне Aggregate

---

#### ✅ Handler → Composition - РАБОТАЕТ

```typescript
// Handler возвращает Validation
async handle(query: ListResourcesQuery): Promise<Validation<Error[], ResourceListItemDTO[]>> {
  return (await this.repository.findAll())
    .mapLeft((errors) =>
      this.transformInfrastructureErrors(errors, 'find all resources')
    )
    .map((resources) => resources.map(this.toDTO))
}

// Composition возвращает Validation
queries.resources.list(request) {
  return handler.handle(query)
}

// Presentation обрабатывает через fold
.fold(
  (errors) => json({ errors }),  // ВСЕ ошибки!
  (data) => json({ data })
)
```

**Вывод:** ✅ Handler → Composition → Presentation работает

---

### 2. **Infrastructure Errors** - ✅ РАБОТАЕТ

#### ✅ Infrastructure errors implements AppError

```typescript
// NetworkError, StorageError, ApiError
export class NetworkError extends Error implements AppError {
  readonly code = 'NETWORK_ERROR'
  readonly isOperational = false  // ❌ НЕ показываем пользователю
  readonly severity = 'high'
}
```

#### ✅ ErrorClassifier классифицирует

```typescript
ErrorClassifier.classify(errors) → {
  operational: AppError[]       // isOperational: true
  infrastructure: AppError[]    // isOperational: false ⭐
  unknown: Error[]              // не AppError
}
```

#### ✅ BaseHandler трансформирует

```typescript
protected transformInfrastructureErrors(
  errors: Error[],
  operation: string,
): Error[] {
  const errorCheck = ErrorClassifier.check(errors)
  
  if (errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors) {
    ErrorClassifier.log(errors, this.logger, operation)  // ✅ Логируем
    
    return [
      new GenericApplicationError(
        `Cannot ${operation}: service temporarily unavailable`,  // ✅ Другой текст!
        errors
      )
    ]
  }
  
  return errors  // Operational errors пробрасываем
}
```

**Вывод:** ✅ Infrastructure errors логируются, пользователю другой текст

---

### 3. **Контекстно-зависимые ошибки** - ❌ НЕТ РЕАЛИЗАЦИИ

#### Описано в документации

**APPLICATION_ERROR_HANDLING.md (строки 24-68):**

```typescript
// КОНТЕКСТ 1: CREATE - существование это ПЛОХО
class CreateResourceCommandHandler {
  async handle(cmd) {
    const existingResult = await this.repo.findByName(name)
    
    if (existingResult.isRight() && existingResult.value !== null) {
      return invalid([
        new DuplicateResourceError(`Resource "${cmd.name}" already exists`)
      ])
    }
  }
}

// КОНТЕКСТ 2: UPDATE - НЕ существование это ПЛОХО
class UpdateResourceCommandHandler {
  async handle(cmd) {
    const existingResult = await this.repo.findById(cmd.id)
    
    if (existingResult.isRight() && existingResult.value === null) {
      return invalid([
        new ResourceNotFoundError(`Resource ${cmd.id} not found`)
      ])
    }
  }
}
```

**Проблема:** Документация описывает проблему, но НЕ показывает решение!

**Вывод:** ❌ Нет реализации, только описание проблемы

---

## 🔴 Критические противоречия

### Противоречие #1: BaseError vs AppError

#### Код:

```typescript
// BaseError НЕ implements AppError!
export class BaseError extends Error {
  // ❌ НЕТ isOperational!
  // ❌ НЕТ severity!
  constructor(
    public readonly entityType: string,
    message: string,
    public readonly code?: string,
  ) { }
}

// Domain errors extends BaseError
export class InvariantViolationError extends BaseError {
  constructor(entityType: string, message: string) {
    super(entityType, message, 'INVARIANT_VIOLATION')
  }
}
```

#### Документация ERROR_HANDLING.md (строки 92-98):

```markdown
├── domain/shared/errors/
│   ├── DomainError.ts       # Базовая доменная ошибка
│   ├── InvariantViolationError.ts
```

**Проблема:**
- Domain errors (InvariantViolationError) НЕ имеют `isOperational`
- ErrorClassifier классифицирует их как `unknown` (не AppError)
- Но должны быть `operational` (показываем пользователю!)

**Последствия:**

```typescript
const errors = [
  new InvariantViolationError('ResourceName', 'too short')  // Domain error
]

ErrorClassifier.classify(errors)
// => {
//   operational: [],
//   infrastructure: [],
//   unknown: [InvariantViolationError]  // ❌ Попала в unknown!
// }

// transformInfrastructureErrors видит unknown → логирует и скрывает!
// ❌ Пользователь НЕ увидит "too short"!
```

**Что нужно:**

```typescript
// Вариант 1: BaseError implements AppError
export class BaseError extends Error implements AppError {
  readonly isOperational: boolean  // Добавить!
  readonly severity: 'low' | 'medium' | 'high'  // Добавить!
  
  constructor(
    public readonly entityType: string,
    message: string,
    public readonly code?: string,
    isOperational: boolean = true,  // По умолчанию true
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) {
    super(message)
    this.isOperational = isOperational
    this.severity = severity
  }
}

// InvariantViolationError автоматически станет AppError
export class InvariantViolationError extends BaseError {
  constructor(entityType: string, message: string) {
    super(
      entityType,
      message,
      'INVARIANT_VIOLATION',
      true,      // ✅ operational
      'medium'   // ✅ severity
    )
  }
}
```

---

### Противоречие #2: ValidationError в двух местах

#### Код:

```typescript
// 1. src/shared/errors/ValidationError.ts
export class ValidationError extends BaseError {
  constructor(
    entityType: string,
    public readonly errors: string[],
    context?: Record<string, unknown>
  ) {
    super(entityType, errors.join('; '), 'VALIDATION_ERROR', { ...context, errors })
  }
}

// 2. Используется в Invariants
ResourceNameInvariant.validate() {
  return specResult.mapLeft((errors) =>
    errors.map((err) => new ValidationError(entityType, [err.message]))
  )
}
```

#### Документация ERROR_HANDLING.md (строки 161-186):

```markdown
### ValidationError (для спецификаций)

Это **доменная** ошибка, которая используется внутри **спецификаций**

**Отличие от `InvariantViolationError`:**
- `ValidationError` - для сложных композитных правил (спецификаций).
- `InvariantViolationError` - для простых, атомарных инвариантов.
```

**Проблема:**
- ValidationError extends BaseError → НЕ AppError!
- Используется для валидации → должна быть operational!
- Но ErrorClassifier классифицирует как `unknown`

**Вывод:** ValidationError = InvariantViolationError по сути, дублирование!

---

### Противоречие #3: Aggregate не аккумулирует

#### Код:

```typescript
class Resource {
  static generate(
    namespace: Namespace,      // УЖЕ созданные!
    name: ResourceName,
    secret: string
  ): Resource {
    return new Resource(...)
  }
}
```

#### Документация VALIDATION_COMBINATORS.md:

```markdown
# ValidationCombinators - Накопление ошибок валидации

При создании Value Object нужно собрать **ВСЕ ошибки валидации**
```

**Проблема:** 
- VO собирают ошибки ✅
- Aggregate НЕ собирает ошибки ❌
- Аккумуляция обрывается!

---

## ✅ Предложения решений

### Решение #1: BaseError implements AppError

```typescript
// src/shared/errors/BaseError.ts
import type { AppError } from './AppError'

export class BaseError extends Error implements AppError {
  public readonly timestamp: Date
  public readonly isOperational: boolean
  public readonly severity: 'low' | 'medium' | 'high'

  constructor(
    public readonly entityType: string,
    message: string,
    public readonly code?: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error,
    isOperational: boolean = true,      // ✅ Новое!
    severity: 'low' | 'medium' | 'high' = 'medium'  // ✅ Новое!
  ) {
    super(message)
    this.name = "BaseError"
    this.timestamp = new Date()
    this.isOperational = isOperational
    this.severity = severity
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
```

**Последствия:**
- ✅ InvariantViolationError автоматически станет AppError (isOperational: true)
- ✅ ValidationError автоматически станет AppError
- ✅ ErrorClassifier правильно классифицирует Domain errors как operational
- ✅ Пользователь увидит сообщения валидации

---

### Решение #2: Aggregate.create() возвращает Validation

```typescript
// src/domain/resource/aggregates/Resource.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { mergeInMany } from '@sweet-monads/either'
import type { ValidationError } from '@/shared/errors'

export class Resource {
  private constructor(
    public readonly id: ResourceId,
    public readonly namespace: Namespace,
    public readonly name: ResourceName,
    public readonly secret: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Создание Resource с накоплением ВСЕХ ошибок Value Objects
   */
  static create(
    namespace: Validation<ValidationError[], Namespace>,
    name: Validation<ValidationError[], ResourceName>,
    secret: string
  ): Validation<ValidationError[], Resource> {
    
    // ✅ Комбинируем ВСЕ ошибки через mergeInMany!
    return mergeInMany([namespace, name])
      .map(([ns, nm]) => new Resource(
        ResourceId.generate(),
        ns,
        nm,
        secret,
        new Date(),
        new Date()
      ))
  }
}
```

**Использование в Handler:**

```typescript
class CreateResourceCommandHandler {
  async handle(cmd: CreateResourceCommand): Promise<Validation<Error[], Resource>> {
    
    // ✅ Одна строка - ВСЕ ошибки собираются автоматически!
    const resourceResult = Resource.create(
      Namespace.create(cmd.namespace),       // может быть Left(['error1', 'error2'])
      ResourceName.create(cmd.name),         // может быть Left(['error3'])
      cmd.secret
    )
    // => Left(['error1', 'error2', 'error3']) - ВСЕ ошибки!
    
    if (resourceResult.isLeft()) {
      // Все ошибки валидации уже собраны!
      return resourceResult
    }
    
    // Сохраняем в Repository
    return this.repository.save(resourceResult.value)
  }
}
```

**Последствия:**
- ✅ Аккумуляция работает от Specifications до Handler
- ✅ Пользователь видит ВСЕ ошибки сразу
- ✅ Код Handler упрощается

---

### Решение #3: Контекстно-зависимые ошибки через Specifications

**Идея:** Создать переиспользуемые спецификации для проверки существования

```typescript
// src/domain/shared/specification/existence/ResourceExistsSpec.ts
export class ResourceExistsSpec implements ISpecification<ResourceId> {
  constructor(
    private readonly repository: IResourceRepository,
    private readonly entityType: string
  ) {}
  
  async isSatisfiedBy(id: ResourceId): Promise<Validation<BaseError, ResourceId>> {
    const result = await this.repository.findById(id)
    
    return result.chain((resource) => 
      isTrue(resource !== null, id)
        .valid()
        .invalid(new NotFoundError(this.entityType, id.getValue()))
    )
  }
}

export class ResourceNotExistsSpec implements ISpecification<ResourceName> {
  constructor(
    private readonly repository: IResourceRepository,
    private readonly entityType: string
  ) {}
  
  async isSatisfiedBy(name: ResourceName): Promise<Validation<BaseError, ResourceName>> {
    const result = await this.repository.findByName(name)
    
    return result.chain((resource) =>
      isTrue(resource === null, name)
        .valid()
        .invalid(new DuplicateError(this.entityType, name.getValue()))
    )
  }
}
```

**Использование в Handlers:**

```typescript
// CREATE - не должен существовать
class CreateResourceCommandHandler {
  async handle(cmd: CreateResourceCommand) {
    const nameResult = ResourceName.create(cmd.name)
    
    if (nameResult.isLeft()) return nameResult
    
    // ✅ Проверяем что НЕ существует
    const notExistsSpec = new ResourceNotExistsSpec(this.repository, 'Resource')
    const checkResult = await notExistsSpec.isSatisfiedBy(nameResult.value)
    
    if (checkResult.isLeft()) return checkResult  // DuplicateError
    
    // Создаем...
  }
}

// UPDATE - должен существовать
class UpdateResourceCommandHandler {
  async handle(cmd: UpdateResourceCommand) {
    const idResult = ResourceId.create(cmd.id)
    
    if (idResult.isLeft()) return idResult
    
    // ✅ Проверяем что существует
    const existsSpec = new ResourceExistsSpec(this.repository, 'Resource')
    const checkResult = await existsSpec.isSatisfiedBy(idResult.value)
    
    if (checkResult.isLeft()) return checkResult  // NotFoundError
    
    // Обновляем...
  }
}
```

**Последствия:**
- ✅ Переиспользуемые спецификации
- ✅ Декларативный стиль
- ✅ Разные ошибки в разных контекстах

---

## 📋 План согласования

### Этап 1: Исправить BaseError ⭐ КРИТИЧНО

1. Добавить `isOperational` и `severity` в BaseError
2. Обновить все наследники (InvariantViolationError, NotFoundError, etc.)
3. Убедиться что ValidationError тоже работает

**Приоритет:** 🔴 ВЫСОКИЙ (без этого ErrorClassifier неправильно классифицирует)

---

### Этап 2: Aggregate.create() с Validation

1. Изменить `Resource.generate()` на `Resource.create()`
2. Принимать `Validation<ValidationError[], VO>` вместо готовых VO
3. Использовать `mergeInMany` для аккумуляции

**Приоритет:** 🟡 СРЕДНИЙ (улучшает UX - все ошибки сразу)

---

### Этап 3: Контекстно-зависимые ошибки

1. Создать спецификации для проверки существования
2. Использовать в Handlers

**Приоритет:** 🟢 НИЗКИЙ (можно пока делать вручную в Handlers)

---

## 🎯 Итоговая оценка

| Требование | Статус | Примечание |
|------------|--------|------------|
| **1. Аккумуляция ошибок** | 🟡 ЧАСТИЧНО | Работает до Aggregate, дальше обрывается |
| **2. Infrastructure errors** | ✅ РАБОТАЕТ | Логируются, пользователю другой текст |
| **3. Контекстно-зависимые** | ❌ НЕТ | Только описание проблемы в docs |
| **4. Согласованность** | 🔴 КРИТИЧНО | BaseError НЕ implements AppError! |

---

## 🚨 Критическая проблема

**BaseError НЕ implements AppError** → Domain errors попадают в `unknown` → ErrorClassifier скрывает их от пользователя!

**Необходимо исправить НЕМЕДЛЕННО!**

---

## ✅ ИСПРАВЛЕНО (2025-10-24)

### Что было сделано:

#### 1. BaseError implements AppError ✅

```typescript
// БЫЛО:
export class BaseError extends Error {
  // ❌ НЕТ isOperational
  // ❌ НЕТ severity
}

// СТАЛО:
export class BaseError extends Error implements AppError {
  readonly isOperational: boolean    // ✅
  readonly severity: 'low' | 'medium' | 'high'  // ✅
  
  constructor(
    entityType: string,
    message: string,
    code: string,  // Теперь обязательный
    context?: Record<string, unknown>,
    cause?: Error,
    isOperational: boolean = true,      // ✅ Domain = operational
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) { }
}
```

**Последствия:**
- ✅ InvariantViolationError теперь AppError (isOperational: true)
- ✅ NotFoundError теперь AppError (isOperational: true)
- ✅ DuplicateError теперь AppError (isOperational: true)
- ✅ ErrorClassifier правильно классифицирует Domain errors как `operational`
- ✅ Пользователь видит все сообщения валидации!

---

#### 2. Aggregate.create() с Validation ✅

```typescript
// БЫЛО:
class Resource {
  static generate(
    namespace: Namespace,      // УЖЕ созданные
    name: ResourceName,
    secret: string
  ): Resource { }
}

// СТАЛО:
class Resource {
  static create(
    namespace: Validation<ValidationError[], Namespace>,
    name: Validation<ValidationError[], ResourceName>,
    secret: string
  ): Validation<ValidationError[], Resource> {
    
    return mergeInMany([namespace, name])
      .mapLeft((errorsArray) => errorsArray.flat())  // Flatten
      .map(([ns, nm]) => new Resource(...))
  }
}
```

**Использование в Handler:**

```typescript
// ✅ Одна строка - ВСЕ ошибки автоматически!
return Resource.create(
  Namespace.create(input.namespace),   // Left(['error1', 'error2'])
  ResourceName.create(input.name),     // Left(['error3'])
  input.secret
)
// => Left(['error1', 'error2', 'error3']) - ВСЕ ошибки!
```

**Последствия:**
- ✅ Аккумуляция работает от Specifications до Handler
- ✅ Пользователь видит ВСЕ ошибки сразу (лучший UX)
- ✅ Код Handler упрощается

---

### Итоговая таблица (после исправлений)

| Требование | Статус | Примечание |
|------------|--------|------------|
| **1. Аккумуляция ошибок** | ✅ РАБОТАЕТ | От Specifications до Handler |
| **2. Infrastructure errors** | ✅ РАБОТАЕТ | Логируются, пользователю другой текст |
| **3. Контекстно-зависимые** | 🟡 ДОКА | Есть описание, реализация по мере необходимости |
| **4. Согласованность** | ✅ ИСПРАВЛЕНО | BaseError = AppError |

---

### Что НЕ делали:

**Контекстно-зависимые ошибки** - решили делать по мере необходимости в Handlers вручную. Спецификации для проверки существования можно добавить позже когда будут реальные use cases.
