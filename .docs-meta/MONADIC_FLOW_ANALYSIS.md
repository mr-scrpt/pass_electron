# Монадический поток данных через все слои

## 🎯 Цель

Проанализировать согласованность использования монад (`isTrue`, `Validation`, `.map()`, `.mapLeft()`, `.fold()`) через все архитектурные слои от Value Objects до Handlers.

---

## 📊 Текущее состояние

### 1. **Shared Layer** - Specifications ✅ СОГЛАСОВАНО

**Файл:** `src/shared/specification/StringSpecifications.ts`

```typescript
// ✅ Использует isTrue БЕЗ fold
isSatisfiedBy(value: string): Validation<BaseError, string> {
  return isTrue(condition, value)
    .valid()
    .invalid(new BaseError(...))
    // Возвращает Validation<BaseError, string>
}
```

**Паттерн:**
- `isTrue(condition, value)` → ValidationBuilder
- `.valid()` → ValidBranch
- `.invalid(error)` → Validation<E, T>
- **Возвращает монаду**, не извлекает

---

### 2. **Domain Layer - Invariants** ✅ СОГЛАСОВАНО

**Файл:** `src/domain/resource/invariants/ResourceNameInvariant.ts`

```typescript
validate(value: string, entityType: string): Validation<ValidationError[], string> {
  const specResult = ValidationCombinators.sequence(
    [
      CommonNotEmptySpec.for({...}).isSatisfiedBy(value),
      CommonLengthSpec.for({...}).isSatisfiedBy(value),
    ],
    () => value
  );
  
  // Трансформация BaseError[] → ValidationError[]
  return specResult.mapLeft((errors) =>
    errors.map((err) => new ValidationError(...))
  );
}
```

**Паттерн:**
- `ValidationCombinators.sequence([...specs], fn)` → комбинирует спецификации
- `.mapLeft()` для трансформации типа ошибок
- **Возвращает монаду**, работает в pipeline

---

### 3. **Domain Layer - Value Objects → Aggregate** ✅ РАБОТАЕТ (исправлено 2025-10-24)

**Файл:** `src/domain/resource/value-objects/ResourceName.ts`

```typescript
static create(value: string): Validation<ValidationError[], ResourceName> {
  return ResourceNameInvariant.instance
    .validate(value, ResourceName.ENTITY_TYPE)
    .map((validValue: string) => new ResourceName(validValue));
}
```

**Паттерн:**
- Получает `Validation<ValidationError[], string>` от Invariant
- `.map()` для трансформации `string → ResourceName`
- **Возвращает монаду**, не извлекает

---

### 4. **Domain Layer - Aggregate** ✅ РАБОТАЕТ (исправлено 2025-10-24)

**Файл:** `src/domain/resource/aggregates/Resource.ts`

```typescript
static create(
  namespace: Validation<ValidationError[], Namespace>,
  name: Validation<ValidationError[], ResourceName>,
  secret: string,
): Validation<ValidationError[], Resource> {
  
  // Комбинируем ВСЕ ошибки через mergeInMany!
  return mergeInMany([namespace, name])
    .mapLeft((errorsArray) => errorsArray.flat())  // Flatten ValidationError[][] → ValidationError[]
    .map(([ns, nm]) => new Resource(...))
}
```

**Использование в Handler:**

```typescript
// ✅ Одна строка - ВСЕ ошибки автоматически!
const resourceResult = Resource.create(
  Namespace.create(input.namespace),   // может быть Left(['error1', 'error2'])
  ResourceName.create(input.name),     // может быть Left(['error3'])
  input.secret
)
// => Left(['error1', 'error2', 'error3']) - ВСЕ ошибки!

if (resourceResult.isLeft()) {
  return resourceResult  // Все ошибки валидации уже собраны!
}

// Сохраняем в Repository
return this.repository.save(resourceResult.value)
```

**Паттерн:**
- `mergeInMany([...validations])` → комбинирует ВСЕ Validation
- `.mapLeft(flat())` → превращает `ValidationError[][]` в `ValidationError[]`
- `.map()` → создает Resource из успешных Value Objects
- **Возвращает монаду**, аккумуляция работает!

---

### 5. **Application Layer - Query Handlers** ✅ СОГЛАСОВАНО

**Файл:** `src/application/queries/handlers/ListResourcesQueryHandler.ts`

```typescript
async handle(query: ListResourcesQuery): Promise<Validation<Error[], ResourceListItemDTO[]>> {
  this.logQueryExecution('ListResourcesQuery');

  return (await this.repository.findAll())
    .mapLeft((errors) =>
      this.transformInfrastructureErrors(errors, 'find all resources')
    )
    .map((resources) => resources.map(this.toDTO))
    .map((dtos) => {
      this.logQuerySuccess(...);
      return dtos;
    });
}
```

**Проблема в `transformInfrastructureErrors`:**

```typescript
// ❌ ТЕКУЩЕЕ (несогласовано):
protected transformInfrastructureErrors(
  errors: (AppError | Error)[],
  operation: string,
): (AppError | Error)[] {  // ❌ Возвращает массив, а не монаду!
  
  // Используется if
  if (hasInfraOrUnknown) {
    ErrorClassifier.log(errors, this.logger, operation);
  }

  // Используется isTrue, но сразу извлекает через fold
  return isTrue(!hasInfraOrUnknown, errors)
    .valid()
    .invalid([new GenericApplicationError(...)])
    .fold(
      (genericError) => genericError,
      (originalErrors) => originalErrors
    );  // ❌ fold извлекает из монады
}
```

---

## 🔍 Анализ проблемы

### Несогласованность паттернов

| Слой | Метод | Возвращает | Использование |
|------|-------|------------|---------------|
| **Shared/Specs** | `isSatisfiedBy()` | `Validation<E, T>` ✅ | `isTrue(...).valid().invalid(error)` |
| **Domain/Invariants** | `validate()` | `Validation<E[], T>` ✅ | `.mapLeft()` pipeline |
| **Domain/VO** | `create()` | `Validation<E[], T>` ✅ | `.map()` pipeline |
| **Application/Handlers** | `transformInfrastructureErrors()` | `Error[]` ❌ | `isTrue(...).fold()` |

**Проблема:**
- Везде используется монадический стиль БЕЗ извлечения
- Только в `transformInfrastructureErrors` используется `.fold()` для извлечения
- Это нарушает единообразие pipeline

---

## ✅ Решение: Согласованный монадический стиль

### Вариант 1: Вернуть монаду из transformInfrastructureErrors

**Идея:** Метод возвращает `Validation`, а НЕ `Error[]`

```typescript
protected transformInfrastructureErrors(
  errors: (AppError | Error)[],
  operation: string,
): Validation<(AppError | Error)[], (AppError | Error)[]> {
  
  const errorCheck = ErrorClassifier.check(errors);
  const hasInfraOrUnknown = errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors;

  // Side-effect логирования
  if (hasInfraOrUnknown) {
    ErrorClassifier.log(errors, this.logger, operation);
  }

  // ✅ Возвращаем монаду
  return isTrue(!hasInfraOrUnknown, errors)
    .valid()
    .invalid([new GenericApplicationError(...)]);
}
```

**Использование в Handler:**
```typescript
return (await this.repository.findAll())
  .mapLeft((errors) => this.transformInfrastructureErrors(errors, 'find all resources'))
  // ❌ Проблема: mapLeft принимает (E) => F, а не (E) => Validation<F, T>
```

**НЕ РАБОТАЕТ!** `.mapLeft()` ожидает функцию `(E) => F`, а не `(E) => Validation<F, T>`

---

### Вариант 2: flatMapLeft (если есть)

```typescript
return (await this.repository.findAll())
  .flatMapLeft((errors) => this.transformInfrastructureErrors(errors, 'find all resources'))
  .map(...)
```

**Проверим наличие `flatMapLeft` в `@sweet-monads/either`:**

❓ Нужно проверить API библиотеки

---

### Вариант 3: Использовать тернарник БЕЗ isTrue ✅ РЕКОМЕНДУЕТСЯ

**Идея:** `isTrue` избыточен когда мы сразу извлекаем значение

```typescript
protected transformInfrastructureErrors(
  errors: (AppError | Error)[],
  operation: string,
): (AppError | Error)[] {
  
  const errorCheck = ErrorClassifier.check(errors);
  const hasInfraOrUnknown = errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors;

  // Side-effect логирования
  if (hasInfraOrUnknown) {
    ErrorClassifier.log(errors, this.logger, operation);
  }

  // ✅ Честный тернарник - никаких монад
  return hasInfraOrUnknown
    ? [new GenericApplicationError(`Cannot ${operation}: service temporarily unavailable`, errors)]
    : errors;
}
```

**Почему это правильно:**
- `transformInfrastructureErrors` используется **ВНУТРИ `.mapLeft()`**
- `.mapLeft()` принимает функцию `(E) => F` (не монаду)
- Тернарник - это просто `Error[] → Error[]` трансформация
- Монады не нужны для простой трансформации данных

---

## 📋 Консистентный паттерн

### Когда использовать `isTrue`?

✅ **Используем `isTrue`**, когда:
- Метод **возвращает `Validation`** 
- Результат используется в **монадическом pipeline** (`.map()`, `.mapLeft()`, `.chain()`)
- Примеры: Specifications, Invariants, Value Objects

❌ **НЕ используем `isTrue`**, когда:
- Метод возвращает **не-монаду** (`Error[]`, `string`, etc.)
- Используется **внутри `.mapLeft()`** для трансформации
- Простая условная логика

---

## 🎯 Итоговое решение

### 1. Specifications (Shared) - БЕЗ изменений ✅
```typescript
isSatisfiedBy(value: string): Validation<BaseError, string> {
  return isTrue(condition, value)
    .valid()
    .invalid(new BaseError(...))
}
```

### 2. Invariants (Domain) - БЕЗ изменений ✅
```typescript
validate(...): Validation<ValidationError[], string> {
  return ValidationCombinators.sequence([...specs], () => value)
    .mapLeft((errors) => ...)
}
```

### 3. Value Objects (Domain) - БЕЗ изменений ✅
```typescript
static create(value: string): Validation<ValidationError[], ResourceName> {
  return ResourceNameInvariant.instance
    .validate(value, ...)
    .map((validValue) => new ResourceName(validValue));
}
```

### 4. Base Handlers (Application) - ✅ ИЗМЕНИТЬ

```typescript
//  src/application/shared/BaseQueryHandler.ts
protected transformInfrastructureErrors(
  errors: (AppError | Error)[],
  operation: string,
): (AppError | Error)[] {
  const errorCheck = ErrorClassifier.check(errors);
  const hasInfraOrUnknown = errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors;

  if (hasInfraOrUnknown) {
    ErrorClassifier.log(errors, this.logger, operation);
  }

  // ✅ Тернарник вместо isTrue + fold
  return hasInfraOrUnknown
    ? [new GenericApplicationError(`Cannot ${operation}: service temporarily unavailable`, errors)]
    : errors;
}
```

**Обоснование:**
- Метод используется **внутри `.mapLeft()`** как `(Error[]) => Error[]`
- Не нужны монады для простой трансформации
- Честнее и понятнее
- Согласуется с принципом "используй простейшее решение"

---

## 🔍 Правило применения монад

### Монадический стиль (isTrue + Validation)
```typescript
// ✅ Возвращаем Validation
isSatisfiedBy(value: T): Validation<E, T> {
  return isTrue(condition, value)
    .valid()
    .invalid(error)
}

// ✅ Используем в pipeline
return invariant.validate(...)
  .map(x => ...)
  .mapLeft(e => ...)
```

### Императивный стиль (тернарник/if)
```typescript
// ✅ Возвращаем простой тип
transform(errors: Error[]): Error[] {
  return condition
    ? transformedErrors
    : errors
}

// ✅ Используем внутри .mapLeft()
.mapLeft((errors) => this.transform(errors))
```

---

## 📊 Проверка согласованности

| Уровень | Возвращает | Стиль | Статус |
|---------|------------|-------|--------|
| Specification.isSatisfiedBy() | `Validation<E, T>` | Монадический | ✅ |
| Invariant.validate() | `Validation<E[], T>` | Монадический | ✅ |
| ValueObject.create() | `Validation<E[], VO>` | Монадический | ✅ |
| Handler.transformInfrastructureErrors() | `Error[]` | Императивный | ✅ |

**Все согласовано!** Монады используются когда возвращаем `Validation`, иначе - простая логика.

---

## 🔍 Иерархия ошибок в проекте ✅ ОБНОВЛЕНО (2025-10-24)

### Domain Errors (extends BaseError implements AppError) ✅

```typescript
// ✅ BaseError теперь implements AppError!
export class BaseError extends Error implements AppError {
  readonly isOperational: boolean = true    // По умолчанию operational
  readonly severity: 'low' | 'medium' | 'high' = 'medium'
}

// Domain errors автоматически AppError через наследование
export class InvariantViolationError extends BaseError  // ✅ isOperational: true
export class NotFoundError extends BaseError            // ✅ isOperational: true
export class DuplicateError extends BaseError           // ✅ isOperational: true
export class InvalidOperationError extends BaseError    // ✅ isOperational: true
```

**Свойства:**
- Наследуют от `BaseError implements AppError` ✅
- `isOperational: true` - показываем пользователю ✅
- `severity: 'medium'` - для логирования
- Используются в Domain Layer
- ErrorClassifier классифицирует их как `operational` ✅

### Application Errors (implements AppError)
```typescript
export class GenericApplicationError extends Error implements AppError {
  readonly code = 'APPLICATION_ERROR'
  readonly isOperational = true   // ✅ Operational
  readonly severity = 'medium'
}

export class CommandValidationError extends Error implements AppError {
  readonly code = 'COMMAND_VALIDATION_ERROR'
  readonly isOperational = true   // ✅ Operational
  readonly severity = 'medium'
}
```

**Свойства:**
- implements `AppError` → имеют `isOperational`, `code`, `severity`
- `isOperational: true` → показываем пользователю
- ErrorClassifier классифицирует как `operational`

### Infrastructure Errors (implements AppError) ⭐ НОВОЕ
```typescript
export class NetworkError extends Error implements AppError {
  readonly code = 'NETWORK_ERROR'
  readonly isOperational = false  // ❌ Infrastructure
  readonly severity = 'high'
}

export class StorageError extends Error implements AppError {
  readonly code = 'STORAGE_ERROR'
  readonly isOperational = false  // ❌ Infrastructure
  readonly severity = 'high'
}

export class ApiError extends Error implements AppError {
  readonly code = 'API_ERROR'
  readonly isOperational = false  // ❌ Infrastructure
  readonly severity = 'high'
}
```

**Свойства:**
- implements `AppError` → имеют `isOperational`, `code`, `severity`
- `isOperational: false` → НЕ показываем детали пользователю
- `severity: 'high'` → критические проблемы инфраструктуры
- ErrorClassifier классифицирует как `infrastructure`

---

## 🎯 Repository возвращает:

```typescript
interface IResourceRepository {
  findAll(): Promise<Validation<Error[], Resource[]>>
  //                            ^^^^^^^ Может быть:
  //                            - BaseError (Domain) → unknown
  //                            - NetworkError (Infrastructure) → infrastructure
  //                            - StorageError (Infrastructure) → infrastructure
  //                            - Error (обычный) → unknown
}
```

**ErrorClassifier классифицирует через duck typing:**

```typescript
ErrorClassification = {
  operational: AppError[]       // isOperational: true
  infrastructure: AppError[]    // isOperational: false
  unknown: Error[]              // не AppError (BaseError, обычный Error)
}
```

---

## ✅ Выводы

1. **`isTrue` ТОЛЬКО для Validation**
   - Specifications возвращают `Validation` → используют `isTrue`
   - Invariants работают с `Validation` → pipeline
   - Value Objects работают с `Validation` → pipeline

2. **Тернарник для трансформаций**
   - `transformInfrastructureErrors` это `Error[] → Error[]` 
   - Используется внутри `.mapLeft()`
   - Монады излишни

3. **Единый стиль**
   - Монады для API (методы возвращают Validation)
   - Тернарник/if для внутренних трансформаций

4. **НЕТ `.fold()` в pipeline**
   - `.fold()` только в самом конце (Presentation Layer)
   - Внутри слоев - только `.map()`, `.mapLeft()`, `.chain()`

5. **Infrastructure Errors implements AppError**
   - `isOperational: false` для всех Infrastructure errors
   - ErrorClassifier автоматически классифицирует их
   - `transformInfrastructureErrors` заменяет их на `GenericApplicationError`
