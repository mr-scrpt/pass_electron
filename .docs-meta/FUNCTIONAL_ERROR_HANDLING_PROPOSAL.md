# Функциональный подход к ошибкам в DDD - Предложение

## 🎯 Цель

Исправить архитектурные противоречия используя **Railway Oriented Programming** и **монадический подход**, БЕЗ `instanceof`.

---

## 📚 Авторитетные источники

### 1. Scott Wlaschin - Railway Oriented Programming

**Источник:** [Railway oriented programming](https://blog.logrocket.com/what-is-railway-oriented-programming/)

**Ключевая идея:**
> "Errors should be part of your domain model"

Railway Oriented Programming - это функциональный подход к обработке ошибок:
- **Success track** (Right) - успешный путь
- **Failure track** (Left) - путь с ошибками
- **Композиция** - функции соединяются как вагоны поезда
- **БЕЗ try-catch** - только монады

**Принципы:**
```
Success → Success → Success → Success  ✅
Success → Failure → Failure → Failure  ❌ (но контролируемо!)
```

---

### 2. Khalil Stemmler - Functional Error Handling with Express.js and DDD

**Источник:** [Functional Error Handling with Express.js and DDD](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/functional-error-handling/)

**Ключевая идея:**
> "Expressing errors explicitly is important to domain modeling"

**Подход:**
```typescript
// ❌ ПЛОХО - неявные ошибки
function createUser(email: string): User | null {
  // Что пошло не так? Непонятно!
}

// ✅ ХОРОШО - явные ошибки через Either
type Response = Either<
  | CreateUserError.EmailInvalidError
  | CreateUserError.UsernameTakenError
  | CreateUserError.AccountAlreadyExistsError,
  User
>

function createUser(email: string): Response {
  // ВСЕ возможные ошибки в сигнатуре!
}
```

**Преимущества:**
1. **Semantic Clarity** - сигнатура = документация
2. **Compile-Time Safety** - TypeScript заставляет обработать все случаи
3. **Functional Flow** - композиция через `.map()`, `.chain()`, `.mapLeft()`
4. **Enhanced Testability** - все пути явные

---

### 3. Mark Seemann - Decoupling application errors from domain models

**Источник:** [Decoupling application errors from domain models](https://blog.ploeh.dk/2017/01/03/decoupling-application-errors-from-domain-models/)

**Ключевая проблема:**
```fsharp
// ❌ ПРОБЛЕМА - Domain зависит от Application errors
type Error = 
  | ValidationError of string    // Application concern!
  | CapacityExceeded             // Domain concern!

// Domain функция возвращает Error
let checkCapacity: Result<Reservation, Error>
// Domain загрязнен Application концепциями!
```

**Решение - разделить типы ошибок:**
```fsharp
// ✅ Domain - свой тип ошибок
type BookingError = CapacityExceeded

let checkCapacity: Result<Reservation, BookingError>

// ✅ Application - свой тип ошибок
type Error = 
  | ValidationError of string
  | DomainError

// ✅ Mapping через mapFailure
let imp = 
  validateReservation candidate 
  |> mapFailure ValidationError           // string → ValidationError
  |> checkCapacity 
  |> mapFailure (fun _ -> DomainError)    // BookingError → DomainError
```

**Ключевая функция - `mapFailure`:**
```fsharp
let mapFailure f result =
  match result with
  | Success succ -> Success succ
  | Failure fail -> Failure (f fail)
```

**Преимущества:**
1. **Domain чистый** - не знает о ValidationError
2. **Application управляет** - маппит ошибки как нужно
3. **Нет coupling** - можно переиспользовать Domain в других приложениях
4. **Композиция** - mapping встраивается в pipeline

---

## ✅ РЕШЕНИЕ: Discriminated Unions + Railway

### Принцип: Каждый слой - свои типы ошибок

```typescript
// ============================================================
// Domain Layer - чистые доменные ошибки
// ============================================================
type ResourceDomainError =
  | { type: 'InvariantViolation'; entityType: string; message: string }
  | { type: 'NotFound'; entityType: string; message: string }
  | { type: 'Duplicate'; entityType: string; message: string }
  | { type: 'InvalidOperation'; entityType: string; message: string }

// ============================================================
// Application Layer - application ошибки
// ============================================================
type ApplicationError =
  | { type: 'Validation'; message: string; errors: string[] }
  | { type: 'Domain'; error: ResourceDomainError }
  | { type: 'Infrastructure'; message: string; severity: 'high' | 'medium' }
  | { type: 'Unexpected'; message: string; cause?: Error }

// ============================================================
// Infrastructure Layer - infrastructure ошибки
// ============================================================
type InfrastructureError =
  | { type: 'Network'; message: string; cause?: Error }
  | { type: 'Storage'; message: string; cause?: Error }
  | { type: 'Api'; message: string; statusCode?: number }
```

---

### Как избежать instanceof - Discriminated Unions

**TypeScript Discriminated Unions:**
```typescript
// ✅ Type guard через проверку поля 'type'
function isValidationError(error: ApplicationError): error is { type: 'Validation'; message: string; errors: string[] } {
  return error.type === 'Validation';
}

function isDomainError(error: ApplicationError): error is { type: 'Domain'; error: ResourceDomainError } {
  return error.type === 'Domain';
}

// ✅ TypeScript автоматически сужает тип!
if (isValidationError(error)) {
  console.log(error.errors);  // ✅ TypeScript знает что это ValidationError
}
```

**Или через switch:**
```typescript
function handleError(error: ApplicationError) {
  switch (error.type) {
    case 'Validation':
      // TypeScript знает: error = { type: 'Validation', errors: string[] }
      return json({ errors: error.errors });
      
    case 'Domain':
      // TypeScript знает: error = { type: 'Domain', error: ResourceDomainError }
      return json({ error: error.error.message });
      
    case 'Infrastructure':
      // TypeScript знает: error = { type: 'Infrastructure', severity: ... }
      log.error(error.message, error.severity);
      return json({ error: 'Service unavailable' });
  }
}
```

**БЕЗ instanceof - только проверка type!**

---

### Mapping между слоями - mapLeft

**Из Domain в Application:**
```typescript
// Domain функция возвращает свой тип ошибок
function createResource(
  namespace: Validation<ResourceDomainError[], Namespace>,
  name: Validation<ResourceDomainError[], ResourceName>,
  secret: string
): Validation<ResourceDomainError[], Resource>

// Application маппит в свои ошибки
const result = createResource(
  Namespace.create(input.namespace),
  ResourceName.create(input.name),
  input.secret
)
  .mapLeft((domainErrors) => 
    domainErrors.map(err => ({
      type: 'Domain' as const,
      error: err
    }))
  );
// Теперь: Validation<ApplicationError[], Resource>
```

**Из Infrastructure в Application:**
```typescript
// Infrastructure возвращает свои ошибки
async function findAll(): Promise<Validation<InfrastructureError[], Resource[]>>

// Application маппит
const result = await repository.findAll()
  .mapLeft((infraErrors) =>
    infraErrors.map(err => {
      if (err.type === 'Network' || err.type === 'Storage') {
        return {
          type: 'Infrastructure' as const,
          message: 'Service temporarily unavailable',
          severity: 'high' as const
        };
      }
      return err;
    })
  );
// Теперь: Validation<ApplicationError[], Resource[]>
```

---

## 🏗️ Архитектура решения

### Структура файлов

```
src/
├── domain/
│   └── shared/
│       └── errors/
│           ├── DomainErrorTypes.ts        # ✅ Discriminated union
│           ├── createDomainError.ts       # ✅ Helper functions
│           └── index.ts
│
├── application/
│   └── errors/
│       ├── ApplicationErrorTypes.ts       # ✅ Discriminated union
│       ├── ErrorMapper.ts                 # ✅ Domain → Application
│       └── index.ts
│
└── infrastructure/
    └── errors/
        ├── InfrastructureErrorTypes.ts    # ✅ Discriminated union
        └── index.ts
```

---

### Реализация

#### 1. Domain Layer - чистые типы

```typescript
// src/domain/shared/errors/DomainErrorTypes.ts

/**
 * Доменные ошибки - чистые, БЕЗ Application концепций
 * Используем discriminated union для type-safety
 */
export type InvariantViolation = {
  readonly type: 'InvariantViolation';
  readonly entityType: string;
  readonly message: string;
  readonly context?: Record<string, unknown>;
}

export type NotFoundError = {
  readonly type: 'NotFound';
  readonly entityType: string;
  readonly message: string;
  readonly searchCriteria?: Record<string, unknown>;
}

export type DuplicateError = {
  readonly type: 'Duplicate';
  readonly entityType: string;
  readonly message: string;
  readonly conflictingData?: Record<string, unknown>;
}

export type InvalidOperationError = {
  readonly type: 'InvalidOperation';
  readonly entityType: string;
  readonly message: string;
  readonly operation?: string;
}

// ✅ Union type - все доменные ошибки
export type DomainError =
  | InvariantViolation
  | NotFoundError
  | DuplicateError
  | InvalidOperationError;
```

```typescript
// src/domain/shared/errors/createDomainError.ts

/**
 * Helper functions для создания ошибок
 * (чтобы не писать вручную объекты каждый раз)
 */
export const createInvariantViolation = (
  entityType: string,
  message: string,
  context?: Record<string, unknown>
): InvariantViolation => ({
  type: 'InvariantViolation',
  entityType,
  message,
  context,
});

export const createNotFoundError = (
  entityType: string,
  message: string,
  searchCriteria?: Record<string, unknown>
): NotFoundError => ({
  type: 'NotFound',
  entityType,
  message,
  searchCriteria,
});

// ... остальные helpers
```

---

#### 2. Application Layer - свои типы + mapping

```typescript
// src/application/errors/ApplicationErrorTypes.ts

import type { DomainError } from '@/domain/shared/errors';

/**
 * Application Layer ошибки
 * Включают Domain ошибки через union
 */
export type ValidationErrorType = {
  readonly type: 'Validation';
  readonly message: string;
  readonly errors: string[];
}

export type DomainErrorType = {
  readonly type: 'Domain';
  readonly error: DomainError;  // ✅ Обертка для Domain ошибок
}

export type InfrastructureErrorType = {
  readonly type: 'Infrastructure';
  readonly message: string;
  readonly severity: 'high' | 'medium' | 'low';
  readonly cause?: Error;
}

export type UnexpectedErrorType = {
  readonly type: 'Unexpected';
  readonly message: string;
  readonly cause?: Error;
}

// ✅ Union type - все Application ошибки
export type ApplicationError =
  | ValidationErrorType
  | DomainErrorType
  | InfrastructureErrorType
  | UnexpectedErrorType;
```

```typescript
// src/application/errors/ErrorMapper.ts

import type { DomainError } from '@/domain/shared/errors';
import type { InfrastructureError } from '@/infrastructure/errors';
import type { ApplicationError } from './ApplicationErrorTypes';

/**
 * Mapping Domain → Application
 */
export const mapDomainError = (error: DomainError): ApplicationError => ({
  type: 'Domain',
  error,
});

/**
 * Mapping Infrastructure → Application
 */
export const mapInfrastructureError = (error: InfrastructureError): ApplicationError => {
  // Логируем (если нужно)
  logger.error('Infrastructure error', { error });
  
  return {
    type: 'Infrastructure',
    message: 'Service temporarily unavailable',
    severity: 'high',
    cause: error as any,
  };
};
```

---

#### 3. Использование в коде

**Value Object:**
```typescript
// src/domain/resource/value-objects/ResourceName.ts
import { createInvariantViolation } from '@/domain/shared/errors';

export class ResourceName {
  static create(value: string): Validation<DomainError[], ResourceName> {
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .mapLeft((errors) =>
        errors.map((err) => createInvariantViolation(
          ResourceName.ENTITY_TYPE,
          err.message,
          { value }
        ))
      )
      .map((validValue) => new ResourceName(validValue));
  }
}
```

**Aggregate:**
```typescript
// src/domain/resource/aggregates/Resource.ts
export class Resource {
  static create(
    namespace: Validation<DomainError[], Namespace>,
    name: Validation<DomainError[], ResourceName>,
    secret: string,
  ): Validation<DomainError[], Resource> {
    
    return mergeInMany([namespace, name])
      .mapLeft((errors) => errors.flat())  // DomainError[][] → DomainError[]
      .map(([ns, nm]) => new Resource({...}));
  }
}
```

**Handler - mapping Domain → Application:**
```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
import { mapDomainError, mapInfrastructureError } from '@/application/errors';

export class CreateResourceCommandHandler {
  async handle(cmd: CreateResourceCommand): Promise<Validation<ApplicationError[], Resource>> {
    
    // 1. Domain возвращает DomainError[]
    const resourceResult = Resource.create(
      Namespace.create(cmd.namespace),
      ResourceName.create(cmd.name),
      cmd.secret
    );
    
    if (resourceResult.isLeft()) {
      // 2. Маппим Domain → Application
      return resourceResult.mapLeft((errors) => 
        errors.map(mapDomainError)
      );
    }
    
    // 3. Infrastructure возвращает InfrastructureError[]
    const saveResult = await this.repository.save(resourceResult.value);
    
    if (saveResult.isLeft()) {
      // 4. Маппим Infrastructure → Application
      return saveResult.mapLeft((errors) =>
        errors.map(mapInfrastructureError)
      );
    }
    
    return saveResult;
  }
}
```

**Presentation - обработка через type guard:**
```typescript
// src/presentation/web/react/src/routes/resources.new.tsx
export async function action({ request }: ActionFunctionArgs) {
  const result = await commands.resources.create(formData);
  
  if (result.isLeft()) {
    const errors = result.value;
    
    // ✅ Type guard через switch (БЕЗ instanceof!)
    const response = errors.map(error => {
      switch (error.type) {
        case 'Validation':
          return { status: 400, errors: error.errors };
          
        case 'Domain':
          // Domain error - показываем пользователю
          return { status: 400, message: error.error.message };
          
        case 'Infrastructure':
          // Infrastructure - скрываем детали
          return { status: 503, message: 'Service unavailable' };
          
        case 'Unexpected':
          return { status: 500, message: 'Internal error' };
      }
    });
    
    return json(response);
  }
  
  return redirect('/resources');
}
```

---

## 🎯 Преимущества подхода

### 1. БЕЗ instanceof ✅

**Было:**
```typescript
if (error instanceof InvariantViolationError) { }
if (error instanceof NetworkError) { }
```

**Стало:**
```typescript
if (error.type === 'InvariantViolation') { }
if (error.type === 'Infrastructure') { }
```

**Или:**
```typescript
switch (error.type) {
  case 'InvariantViolation': ...
  case 'Infrastructure': ...
}
```

---

### 2. Полное соответствие DDD/Clean Architecture ✅

**Dependency Rule соблюдается:**
```
Domain → чистые DomainError (discriminated union)
  ↑
Application → ApplicationError (включает DomainError через union)
  ↑
Infrastructure → InfrastructureError
  ↑
Application маппит через mapDomainError, mapInfrastructureError
```

**Domain чистый:**
- НЕ знает о `isOperational`, `severity`
- НЕ зависит от Application
- Только бизнес-концепции

---

### 3. Type-Safety от TypeScript ✅

```typescript
function handleError(error: ApplicationError) {
  switch (error.type) {
    case 'Validation':
      // ✅ TypeScript знает: error.errors существует
      console.log(error.errors);
      
    case 'Domain':
      // ✅ TypeScript знает: error.error существует
      console.log(error.error.entityType);
      
    case 'Infrastructure':
      // ✅ TypeScript знает: error.severity существует
      console.log(error.severity);
  }
}
```

**Если забыли case → TypeScript ошибка!**

---

### 4. Монадический flow ✅

```typescript
// Railway Oriented Programming
Resource.create(...)           // Validation<DomainError[], Resource>
  .mapLeft(mapDomainError)     // Validation<ApplicationError[], Resource>
  .chain(repository.save)      // Validation<ApplicationError[], void>
  .mapLeft(mapInfraError)      // Validation<ApplicationError[], void>
  .fold(
    (errors) => handleErrors(errors),
    (success) => handleSuccess(success)
  )
```

**Все в одном pipeline, БЕЗ try-catch, БЕЗ if-else hell!**

---

## 📊 Сравнение: БЫЛО → СТАЛО

| Аспект | БЫЛО (BaseError) | СТАЛО (Discriminated Unions) |
|--------|------------------|------------------------------|
| **instanceof** | ✅ Используется | ❌ НЕ нужен |
| **Type narrowing** | instanceof | type === 'X' |
| **Domain чистота** | ❌ Знает о isOperational | ✅ Только domain info |
| **Dependency Rule** | ❌ Domain → Application | ✅ Соблюдается |
| **Mapping** | ❌ Нет | ✅ mapDomainError |
| **TypeScript** | Partial type-safety | ✅ Full type-safety |
| **Railway** | ✅ Работает | ✅ Работает лучше |

---

## 📝 План миграции

### Этап 1: Создать discriminated unions
- [ ] `DomainErrorTypes.ts` - union domain errors
- [ ] `ApplicationErrorTypes.ts` - union application errors
- [ ] `InfrastructureErrorTypes.ts` - union infrastructure errors
- [ ] Helper functions для создания ошибок

### Этап 2: Создать mappers
- [ ] `mapDomainError` - Domain → Application
- [ ] `mapInfrastructureError` - Infrastructure → Application
- [ ] `ErrorMapper.ts` - централизованные mapping functions

### Этап 3: Мигрировать Domain Layer
- [ ] Обновить Specifications - возвращать `DomainError`
- [ ] Обновить Invariants - использовать `createInvariantViolation`
- [ ] Обновить Value Objects - возвращать `Validation<DomainError[], VO>`
- [ ] Обновить Aggregates - использовать `DomainError`

### Этап 4: Мигрировать Application Layer
- [ ] Обновить Handlers - маппинг через `mapDomainError`
- [ ] Обновить ErrorClassifier - switch по `error.type`
- [ ] Обновить transformInfrastructureErrors - mapping

### Этап 5: Мигрировать Infrastructure
- [ ] NetworkError, StorageError, ApiError → discriminated unions
- [ ] Возвращать `InfrastructureError`

### Этап 6: Обновить Presentation
- [ ] Обработка через switch (error.type)
- [ ] Убрать все instanceof

### Этап 7: Удалить старое
- [ ] Удалить BaseError класс (если не нужен)
- [ ] Удалить AppError из shared
- [ ] Обновить документацию

---

## 📚 Связанные документы

- `docs/PROJECT_STRUCTURE.md` - структура проекта
- `docs/ARCHITECTURE_BOUNDARIES.md` - dependency rule
- `.docs-meta/DDD_ERROR_SYSTEM_ANALYSIS.md` - анализ текущей системы
- `.docs-meta/ERROR_SYSTEM_ANALYSIS.md` - детали текущей реализации

---

## 🎯 Итог

### Преимущества предложенного решения:

1. ✅ **БЕЗ instanceof** - только discriminated unions
2. ✅ **Соответствие DDD** - Domain чистый
3. ✅ **Соответствие Clean Architecture** - Dependency Rule
4. ✅ **Railway Oriented Programming** - монадический flow
5. ✅ **Type-Safety** - TypeScript контролирует все
6. ✅ **Mapping** - явное преобразование между слоями
7. ✅ **Читаемость** - switch вместо if-instanceof hell

### Авторитеты поддерживают:

- ✅ **Scott Wlaschin** - Railway Oriented Programming
- ✅ **Khalil Stemmler** - Functional Error Handling in DDD
- ✅ **Mark Seemann** - Decoupling domain from application errors

**Это проверенный, функциональный подход к ошибкам в DDD!**
