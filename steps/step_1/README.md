# Шаг 1: Вывод списка моковых ресурсов

## 🎯 Цель

Создать минимальный end-to-end поток данных для отображения списка моковых ресурсов на главной странице `/`.

> **📦 Менеджер пакетов**: В проекте используется **pnpm**. Все команды используют `pnpm` вместо `npm`.

**Поток данных (CQRS)**:

#### Data Flow [#diagram:flow]

```
MockRepository → Query Handler → Query Bus → Facade → React Router Loader → React Component → UI
```

## 📊 Визуализация архитектуры

#### Architecture Diagram [#diagram:architecture]

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Request                       │
│                     GET /                                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│         React Router v7 Loader (Server)                 │
│  src/presentation/web/react/src/routes/_index.tsx::loader()                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│          Composition Layer (Facade)                      │
│  queries.resources.list(request)                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│          Application Layer (Query Handler)               │
│  ListResourcesQueryHandler.handle(query)                 │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│         Infrastructure Layer (Repository)                │
│  MockResourceRepository.findAll()                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│              Mock Data (in-memory)                       │
│  mockResources[] - статический массив                   │
└────────────────────┬────────────────────────────────────┘
                     ↓ (return data)
                     ↓
┌────────────────────┴────────────────────────────────────┐
│            React Component (Client)                      │
│  ResourceList → ResourceListItem                         │
│  отрисовка в браузере                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Порядок реализации

> **📘 Важно**: Перед началом ознакомьтесь с документацией:
> - [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - типизация в DDD: Value Objects, Entities, DTO ⭐
> - [DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - как DDD и Clean Architecture сочетаются
> - [COMPOSITION_LAYER.md](../../docs/COMPOSITION_LAYER.md) - декомпозиция и Multi-UI поддержка
> - [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers и CQRS паттерн
> - [DATA_FLOW.md](../../docs/DATA_FLOW.md) - поток данных в React Router

### Этап 0: Создание структуры папок

Перед началом создадим структуру Domain Layer согласно DDD Best Practices:

#### Create Domain Structure [#command]

```bash
# Создать структуру Domain Layer
mkdir -p src/domain/resource/{aggregates,entities,value-objects,repositories,events}
mkdir -p src/domain/shared/{errors,invariants,base}
```

**Структура:**
- `resource/` - Bounded Context для управления ресурсами
  - `aggregates/` - Aggregate Roots (главные сущности)
  - `entities/` - Entities (сущности внутри Aggregate)
  - `value-objects/` - Value Objects (неизменяемые значения)
  - `repositories/` - Repository Interfaces
  - `events/` - Domain Events
- `shared/` - Shared Kernel (переиспользуемое)
  - `errors/` - Базовые ошибки
  - `invariants/` - Переиспользуемые правила валидации
  - `base/` - Базовые классы/интерфейсы

> **📚 Детали**: [PROJECT_STRUCTURE.md#domain-layer](../../docs/PROJECT_STRUCTURE.md#1-domain-layer-srcdomain-) — Структура Domain Layer

---

## 📦 Подготовка: Validation API (Shared Layer)

Перед созданием Value Objects нужно создать абстракцию над монадами для валидации.

> **📚 Детали**: [VALIDATION_COMBINATORS.md](../../docs/error-handling/VALIDATION_COMBINATORS.md) — ValidationCombinators с mergeInMany ⭐

### Зачем нужна абстракция?

**Проблема прямого использования `@sweet-monads/either`:**
- ❌ Зависимость Domain от конкретной библиотеки
- ❌ Сложно заменить библиотеку в будущем
- ❌ Неинтуитивные имена: `Either`, `left`, `right`

**Решение - Validation API:**
- ✅ Изоляция от библиотеки
- ✅ Понятные имена: `Validation`, `valid`, `invalid`
- ✅ Накопление ВСЕХ ошибок для лучшего UX
- ✅ Легко заменить библиотеку

---

### 0.1. Создать структуру Shared Layer

#### Create Shared Structure [#command]

```bash
# Создать структуру Shared Layer
mkdir -p src/shared/validation
mkdir -p src/shared/specification
```

---

### 0.2. Создать Validation API

#### Validation.ts [#code|#structure:path]

```typescript
// src/shared/validation/Validation.ts
import { Either, left, right } from '@sweet-monads/either'

/**
 * Результат валидации
 * Обертка над Either для изоляции библиотеки
 */
export type Validation<E, T> = Either<E, T>

/**
 * Создать успешный результат валидации
 */
export const valid = <T>(value: T): Validation<never, T> => right(value)

/**
 * Создать неудачный результат валидации
 */
export const invalid = <E>(error: E): Validation<E, never> => left(error)
```

---

### 0.3. Создать ValidationCombinators

#### ValidationCombinators.ts [#class:ValidationCombinators|#code|#structure:path]

```typescript
// src/shared/validation/ValidationCombinators.ts
import { mergeInMany } from '@sweet-monads/either'
import { Validation } from './Validation'

/**
 * Комбинаторы для работы с валидацией
 * Используют функциональный подход (монады) вместо императивного
 */
export class ValidationCombinators {
  /**
   * Накопление ВСЕХ ошибок валидации
   * Использует mergeInMany из @sweet-monads/either
   * 
   * @returns Either<E[], T[]> - массив ошибок ИЛИ массив успешных значений
   */
  static accumulate<E, T>(
    validations: Validation<E, T>[]
  ): Validation<E[], T[]> {
    return mergeInMany(validations)
  }

  /**
   * Применить функцию к успешным значениям
   * Если есть ошибки - вернуть их
   * 
   * Это applicative functor pattern:
   * - Если все validations успешны -> применяем fn к значениям
   * - Если есть ошибки -> возвращаем массив ошибок
   */
  static sequence<E, T, U>(
    validations: Validation<E, T>[],
    fn: (values: T[]) => U
  ): Validation<E[], U> {
    return mergeInMany(validations).map(fn)
  }
}
```

**Почему `mergeInMany`?**
- ✅ Функциональный подход (монады)
- ✅ Накапливает ВСЕ ошибки
- ✅ Лучший UX - пользователь видит все проблемы сразу
- ✅ Нет циклов и if/else

---

### 0.4. Создать Public API

#### Validation Public API [#code|#structure:path]

```typescript
// src/shared/validation/index.ts
export * from './Validation'
export * from './ValidationCombinators'
```

---

### Step 1: Domain Layer - Создание доменного слоя

Создание ядра приложения - Domain Layer. - это основа архитектуры. Здесь определяются типы и контракты, независимые от фреймворков.

#### 1.1 Создать переиспользуемые инварианты (Shared Kernel)

> **📚 Детали**: [docs/error-handling/INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) — Полное описание паттерна Invariants

**Файл: `src/domain/shared/errors/InvariantViolationError.ts`**

#### InvariantViolationError [#class:InvariantViolationError|#code|#structure:path]

```typescript
// src/domain/shared/errors/InvariantViolationError.ts
export class InvariantViolationError extends Error {
  readonly code = 'INVARIANT_VIOLATION'
  
  constructor(
    readonly entityType: string,
    readonly invariant: string
  ) {
    super(`${entityType}: ${invariant}`)
    this.name = 'InvariantViolationError'
  }
}
```

**Файл: `src/domain/shared/invariants/UuidInvariant.ts`**

#### UuidInvariant [#class:UuidInvariant|#code|#structure:path]

```typescript
// src/domain/shared/invariants/UuidInvariant.ts
import { Validation, valid, invalid } from '@/shared/validation'
import { InvariantViolationError } from '../errors/InvariantViolationError'

/**
 * Инварианты для UUID
 */
export class UuidInvariant {
  private static readonly UUID_V4_REGEX = 
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  /**
   * Валидация UUID v4 через Validation API
   */
  static validate(
    value: string,
    entityType: string
  ): Validation<InvariantViolationError, string> {
    if (!value) {
      return invalid(new InvariantViolationError(
        entityType,
        'cannot be empty'
      ))
    }
    
    if (!UuidInvariant.UUID_V4_REGEX.test(value)) {
      return invalid(new InvariantViolationError(
        entityType,
        'must be a valid UUID v4'
      ))
    }
    
    return valid(value)
  }
  
  /**
   * Type guard (не бросает)
   */
  static isValidUuid(value: string): boolean {
    return !!value && this.UUID_V4_REGEX.test(value)
  }
}
```

**Файл: `src/domain/shared/index.ts`**

#### Shared Public API [#code|#structure:path]

```typescript
// src/domain/shared/index.ts
export { InvariantViolationError } from './errors/InvariantViolationError'
export { UuidInvariant } from './invariants/UuidInvariant'
```

**Зачем Shared Kernel?**
- ✅ DRY — регулярное выражение в одном месте
- ✅ Переиспользование — можно использовать для `FieldId`, `EntryId`, etc.
- ✅ Тестируемость — один тест для всех UUID
- ✅ Изменяемость — изменить regex в одном месте

#### 1.2 Создать Value Object: ResourceId

> **📚 Детали**: [TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы](../../docs/TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы) — Почему класс, а не type alias

**Файл: `src/domain/resource/value-objects/ResourceId.ts`**

#### ResourceId [#class:ResourceId|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceId.ts
import { Either } from '@sweet-monads/either'
import { InvariantViolationError, UuidInvariant } from '@/domain/shared'

/**
 * Value Object для ID ресурса
 * Инвариант: должен быть валидным UUID v4
 */
export class ResourceId {
  private static readonly ENTITY_TYPE = 'ResourceId'
  private constructor(private readonly _value: string) {}
  
  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID())
  }
  
  static create(value: string): Either<InvariantViolationError, ResourceId> {
    // ✅ Используем переиспользуемый инвариант с Either
    return UuidInvariant.validate(value, ResourceId.ENTITY_TYPE)
      .map(validValue => new ResourceId(validValue))
  }
  
  getValue(): string {
    return this._value
  }
  
  equals(other: ResourceId): boolean {
    return this._value === other._value
  }
}
```

#### 1.3 Создать Value Object: Namespace

**Файл: `src/domain/resource/value-objects/Namespace.ts`**

#### Namespace [#class:Namespace|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/Namespace.ts
import { Validation, ValidationCombinators, valid, invalid } from '@/shared/validation'
import { InvariantViolationError } from '@/domain/shared'

/**
 * Value Object для namespace ресурса
 * Инвариант: 2-50 символов, lowercase, буквы/цифры/-/_
 * 
 * Использует ValidationCombinators для накопления ВСЕХ ошибок
 */
export class Namespace {
  private static readonly ENTITY_TYPE = 'Namespace'
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50
  private static readonly PATTERN = /^[a-z0-9-_]+$/
  
  private constructor(private readonly _value: string) {}
  
  /**
   * Создать Namespace с накоплением ВСЕХ ошибок валидации
   * 
   * @returns Validation<InvariantViolationError[], Namespace>
   *          - Left: массив ВСЕХ ошибок (лучший UX)
   *          - Right: валидный Namespace
   */
  static create(value: string): Validation<InvariantViolationError[], Namespace> {
    // Определяем все проверки
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

**Почему ValidationCombinators вместо if/else?**

**Было (императивно):**
```typescript
if (!value) return left(...)
if (value.length < 2) return left(...)  // Останавливается на первой ошибке!
if (!pattern.test(value)) return left(...)
```

**Стало (функционально):**
```typescript
const validations = [
  value ? valid(value) : invalid(...),
  value.length >= 2 ? valid(value) : invalid(...),
  pattern.test(value) ? valid(value) : invalid(...)
]
return ValidationCombinators.sequence(validations, () => new Namespace(value))
```

**Преимущества:**
- ✅ **Лучший UX** - пользователь видит ВСЕ ошибки сразу
- ✅ **Функциональный подход** - нет циклов и if/else
- ✅ **Декларативность** - просто список проверок
- ✅ **Готовность к Specification Pattern** - легко вынести в переиспользуемые спецификации

> 💡 **Для более сложных случаев:** См. [SPECIFICATION_VALIDATION.md](../../docs/error-handling/SPECIFICATION_VALIDATION.md) - Specification Pattern с переиспользуемыми правилами валидации.

#### 1.4 Создать Value Object: ResourceName

**Файл: `src/domain/resource/value-objects/ResourceName.ts`**

#### ResourceName [#class:ResourceName|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceName.ts
import { Validation, ValidationCombinators, valid, invalid } from '@/shared/validation'
import { InvariantViolationError } from '@/domain/shared'

/**
 * Value Object для имени ресурса
 * Инвариант: 1-100 символов
 * 
 * Использует ValidationCombinators для накопления ВСЕХ ошибок
 */
export class ResourceName {
  private static readonly ENTITY_TYPE = 'ResourceName'
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 100
  
  private constructor(private readonly _value: string) {}
  
  /**
   * Создать ResourceName с накоплением ВСЕХ ошибок валидации
   */
  static create(value: string): Validation<InvariantViolationError[], ResourceName> {
    const validations = [
      // Проверка на пустоту
      value && value.trim()
        ? valid(value)
        : invalid(new InvariantViolationError(ResourceName.ENTITY_TYPE, 'cannot be empty')),
      
      // Проверка длины
      value.length >= ResourceName.MIN_LENGTH && value.length <= ResourceName.MAX_LENGTH
        ? valid(value)
        : invalid(new InvariantViolationError(
            ResourceName.ENTITY_TYPE,
            `must be ${ResourceName.MIN_LENGTH}-${ResourceName.MAX_LENGTH} characters`
          ))
    ]
    
    return ValidationCombinators.sequence(
      validations,
      () => new ResourceName(value)
    )
  }
  
  getValue(): string {
    return this._value
  }
  
  equals(other: ResourceName): boolean {
    return this._value === other._value
  }
}
```

#### 1.5 Создать Aggregate Root: Resource

> **📚 Детали**: [TYPES_AND_ENTITIES.md#aggregates](../../docs/TYPES_AND_ENTITIES.md#aggregates) — Что такое Aggregate Root

**Файл: `src/domain/resource/aggregates/Resource.ts`**

#### Resource Aggregate [#class:Resource|#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ResourceId } from '../value-objects/ResourceId'
import { ResourceName } from '../value-objects/ResourceName'
import { Namespace } from '../value-objects/Namespace'
import { InvariantViolationError } from '@/domain/shared/errors'

/**
 * Resource Aggregate Root
 * 
 * Aggregate Root - это точка входа для работы с группой связанных объектов.
 * Гарантирует консистентность данных и инкапсулирует бизнес-логику.
 * 
 * Правила Aggregate:
 * 1. Внешний мир работает ТОЛЬКО через Aggregate Root
 * 2. Все изменения через методы Aggregate Root
 * 3. Aggregate гарантирует инварианты
 * 
 * Для Step 1 (упрощенная версия):
 * - Фабричный метод create() с валидацией
 * - Базовые getters
 * - Без CustomField entities (будет в Step 2)
 * - Без Domain Events (будет в Step 3)
 */
export class Resource {
  private constructor(
    private readonly _id: ResourceId,
    private readonly _namespace: Namespace,
    private readonly _name: ResourceName,
    private readonly _secret: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}
  
  /**
   * Создать новый Resource с валидацией
   * Накапливает ВСЕ ошибки валидации Value Objects
   */
  static create(
    namespace: string,
    name: string,
    secret: string
  ): Validation<InvariantViolationError[], Resource> {
    // Создаем Value Objects
    const namespaceVO = Namespace.create(namespace)
    const nameVO = ResourceName.create(name)
    const id = ResourceId.generate()
    
    // Комбинируем результаты валидации
    return ValidationCombinators.sequence(
      [namespaceVO, nameVO],
      ([ns, nm]) => new Resource(
        id,
        ns,
        nm,
        secret,
        new Date(),
        new Date()
      )
    )
  }
  
  /**
   * Восстановить Resource в валидном состоянии
   * 
   * Используется когда все Value Objects уже созданы и валидны.
   * НЕ выполняет валидацию повторно.
   * 
   * @param id - уже валидный ResourceId
   * @param namespace - уже валидный Namespace
   * @param name - уже валидный ResourceName
   * 
   * Паттерн из DDD: reconstitution без повторной валидации.
   * Domain не знает откуда пришли данные (память, файл, сеть).
   */
  static reconstitute(
    id: ResourceId,
    namespace: Namespace,
    name: ResourceName,
    secret: string,
    createdAt: Date,
    updatedAt: Date
  ): Resource {
    return new Resource(id, namespace, name, secret, createdAt, updatedAt)
  }
  
  // ==================== Getters ====================
  
  getId(): ResourceId {
    return this._id
  }
  
  getNamespace(): Namespace {
    return this._namespace
  }
  
  getName(): ResourceName {
    return this._name
  }
  
  getSecret(): string {
    return this._secret
  }
  
  getCreatedAt(): Date {
    return this._createdAt
  }
  
  getUpdatedAt(): Date {
    return this._updatedAt
  }
}
```

**Ключевые особенности Aggregate Root:**

1. **Private constructor** - создание только через фабричные методы
2. **create()** - для новых объектов с валидацией
3. **reconstitute()** - для восстановления в валидном состоянии (без повторной валидации)
4. **Getters вместо public полей** - инкапсуляция
5. **ValidationCombinators** - накопление ошибок

**Зачем Aggregate Root?**
- ✅ Точка входа для работы с группой связанных объектов
- ✅ Гарантирует консистентность данных
- ✅ Инкапсулирует бизнес-логику
- ✅ Управляет жизненным циклом дочерних Entity

> 💡 **В следующих шагах:** Добавим CustomField entities, бизнес-методы (addCustomField, updateName) и Domain Events

**Файл: `src/domain/resource/aggregates/index.ts`**

```typescript
export { Resource } from "./Resource";
```

#### 1.6 Создать DTO для списка ресурсов

> **📚 Детали**: [TYPES_AND_ENTITIES.md#dto-для-presentation-layer](../../docs/TYPES_AND_ENTITIES.md#dto-для-presentation-layer) — Зачем нужны DTO

**Файл: `src/application/queries/dtos/ResourceListItemDTO.ts`**

#### ResourceListItemDTO [#interface:ResourceListItemDTO|#code|#structure:path]

```typescript
// src/application/queries/dtos/ResourceListItemDTO.ts
/**
 * DTO для списка ресурсов
 * Простые примитивы для UI (не Value Objects!)
 */
export interface ResourceListItemDTO {
  id: string              // ResourceId → string
  namespace: string       // Namespace → string
  name: string           // ResourceName → string
  secretPreview?: string  // Первые символы + ***
  fieldsCount: number
  updatedAt: string      // Date → ISO string
}
```

**Почему здесь строки, а не Value Objects?**
- ResourceListItemDTO - это Data Transfer Object для Presentation Layer
- Не содержит бизнес-логики
- Удобно для JSON сериализации в React Router loaders
- Query Handler преобразует Domain модель в DTO

#### 1.7 Создать Public API для resource модуля

> **📚 Детали**: [PROJECT_STRUCTURE.md#public-api-модулей](../../docs/PROJECT_STRUCTURE.md#public-api-модулей) — Правила Public API

**Файл: `src/domain/resource/value-objects/index.ts`**

#### Value Objects Public API [#code|#structure:path]

```typescript
// src/domain/resource/value-objects/index.ts
// Public API для Value Objects
export { ResourceId } from './ResourceId'
export { Namespace } from './Namespace'
export { ResourceName } from './ResourceName'
```

**Файл: `src/domain/resource/index.ts`**

#### Resource Module Public API [#code|#structure:path]

```typescript
// src/domain/resource/index.ts
// Public API модуля resource
export * from './value-objects'
export * from './aggregates'     // Resource
export * from './repositories'   // IResourceRepository

// В будущем здесь появятся:
// export * from './entities'    // CustomField
// export * from './events'
```

#### 1.8 Создать интерфейс репозитория

**Файл: `src/domain/resource/repositories/IResourceRepository.ts`**

#### IResourceRepository [#interface:IResourceRepository|#code|#structure:path]

```typescript
// src/domain/resource/repositories/IResourceRepository.ts
import type { ResourceId } from '../value-objects/ResourceId'
import type { Namespace } from '../value-objects/Namespace'
import type { Resource } from '../aggregates/Resource'

/**
 * Интерфейс репозитория ресурсов
 * Определен в Domain Layer, реализован в Infrastructure Layer
 * 
 * ⚠️ Возвращает Domain типы (Resource), НЕ DTO!
 * Преобразование Domain → DTO происходит в Query Handler (Application Layer)
 */
export interface IResourceRepository {
  findAll(): Promise<Resource[]>
  findById(id: ResourceId): Promise<Resource | null>
  findByNamespace(namespace: Namespace): Promise<Resource[]>
  search(query: string): Promise<Resource[]>
}
```

**Почему интерфейс в Domain?**
- Domain определяет контракт
- Infrastructure реализует детали
- Dependency Inversion Principle (DIP)

#### 1.9 Создать Public API для repositories

**Файл: `src/domain/resource/repositories/index.ts`**

#### Domain Repositories Public API [#code|#structure:path]

```typescript
// src/domain/resource/repositories/index.ts
export { IResourceRepository } from './IResourceRepository'
```

---

### Этап 2: Infrastructure Layer (Mock данные)

Infrastructure Layer реализует интерфейсы из Domain Layer.

#### 2.1 Создать моковые данные

**Файл: `src/infrastructure/mocks/resources.mock.ts`**

#### Mock Resources Data [#code|#structure:path]

```typescript
// src/infrastructure/mocks/resources.mock.ts
import { Resource, ResourceId, Namespace, ResourceName } from '@/domain/resource'

/**
 * Mock данные для разработки
 * ⚠️ Используем Domain типы (Resource), НЕ DTO!
 * Infrastructure НЕ должен зависеть от Application Layer
 */
export const mockResources: Resource[] = [
  {
    id: '1',
    namespace: 'social',
    name: 'facebook',
    secretPreview: 'Fb***',
    fieldsCount: 3,
    updatedAt: new Date('2024-10-15').toISOString()
  },
  {
    id: '2',
    namespace: 'social',
    name: 'twitter',
    secretPreview: 'Tw***',
    fieldsCount: 2,
    updatedAt: new Date('2024-10-14').toISOString()
  },
  {
    id: '3',
    namespace: 'work',
    name: 'github',
    secretPreview: 'Gh***',
    fieldsCount: 4,
    updatedAt: new Date('2024-10-16').toISOString()
  },
  {
    id: '4',
    namespace: 'banking',
    name: 'revolut',
    secretPreview: 'Re***',
    fieldsCount: 2,
    updatedAt: new Date('2024-10-13').toISOString()
  },
  {
    id: '5',
    namespace: 'social',
    name: 'instagram',
    secretPreview: 'In***',
    fieldsCount: 3,
    updatedAt: new Date('2024-10-12').toISOString()
  }
]
```

#### 2.2 Создать Public API для mocks

**Файл: `src/infrastructure/mocks/index.ts`**

#### Mocks Public API [#code|#structure:path]

```typescript
// src/infrastructure/mocks/index.ts
export { mockResources } from './resources.mock'
```

#### 2.3 Реализовать Mock Repository

**Файл: `src/infrastructure/repositories/MockResourceRepository.ts`**

#### MockResourceRepository [#class:MockResourceRepository|#code|#structure:path]

```typescript
// src/infrastructure/repositories/MockResourceRepository.ts
import type { IResourceRepository } from '@/domain/repositories'
import type { Resource, ResourceId, Namespace } from '@/domain/resource'
import { mockResources } from '../mocks'

/**
 * Mock реализация репозитория ресурсов
 * Использует in-memory данные для разработки
 * 
 * ⚠️ Возвращает Domain типы (Resource), НЕ DTO!
 * Infrastructure НЕ должен зависеть от Application Layer
 */
export class MockResourceRepository implements IResourceRepository {
  async findAll(): Promise<Resource[]> {
    // Repository отвечает за преобразование данных в Domain модель
    // Domain не знает откуда данные (память, файл, API, БД)
    return Promise.resolve([...mockResources])
  }
  
  async findById(id: ResourceId): Promise<Resource | null> {
    const resource = mockResources.find(r => r.id.equals(id))
    return Promise.resolve(resource ?? null)
  }
  
  async findByNamespace(namespace: Namespace): Promise<Resource[]> {
    const filtered = mockResources.filter(r => r.namespace.equals(namespace))
    return Promise.resolve(filtered)
  }
  
  async search(query: string): Promise<Resource[]> {
    const lowerQuery = query.toLowerCase()
    const filtered = mockResources.filter(r => 
      r.namespace.getValue().includes(lowerQuery) ||
      r.name.getValue().includes(lowerQuery)
    )
    return Promise.resolve(filtered)
  }
}
```

**Ключевые моменты**:
- Реализует интерфейс `IResourceRepository`
- Возвращает копию данных (иммутабельность)
- Асинхронные методы (как у реального API)

#### 2.4 Создать Public API для repositories

**Файл: `src/infrastructure/repositories/index.ts`**

#### Infrastructure Repositories Public API [#code|#structure:path]

```typescript
// src/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
```

---

### Этап 3: Application Layer (CQRS - Query Handler)

Application Layer реализует CQRS паттерн для разделения чтения (Queries) и записи (Commands).

#### 3.1 Создать Query Types константы

**Файл: `src/application/queries/QueryTypes.ts`**

#### QueryTypes [#code|#structure:path]

```typescript
// src/application/queries/QueryTypes.ts
/**
 * Константы типов Query (нет magic strings!)
 */
export const QueryTypes = {
  RESOURCE: {
    LIST: 'ListResourcesQuery',
    GET_BY_ID: 'GetResourceByIdQuery'
  }
} as const
```

#### 3.2 Создать интерфейсы Query и QueryHandler

**Файл: `src/application/queries/IQuery.ts`**

#### IQuery [#interface:IQuery|#code|#structure:path]

```typescript
// src/application/queries/IQuery.ts
export interface IQuery {
  readonly type: string
}
```

**Файл: `src/application/queries/IQueryHandler.ts`**

#### IQueryHandler [#interface:IQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/IQueryHandler.ts
import { Validation } from '@/shared/validation'
import type { IQuery } from './IQuery'
import type { QueryError } from '@/domain/shared/errors'

/**
 * Query Handler интерфейс
 * 
 * Возвращает Validation вместо QueryResult для:
 * - Type-safe обработки ошибок
 * - Накопления множественных ошибок
 * - Единообразия с Domain Layer
 * 
 * @template Q - тип Query
 * @template R - тип результата (обычно DTO)
 */
export interface IQueryHandler<Q extends IQuery = IQuery, R = any> {
  handle(query: Q): Promise<Validation<QueryError[], R>>
}
```

**Файл: `src/application/queries/IQueryBus.ts`**

#### IQueryBus [#interface:IQueryBus|#code|#structure:path]

```typescript
// src/application/queries/IQueryBus.ts
import { Validation } from '@/shared/validation'
import type { IQuery, IQueryHandler } from './'
import type { QueryError } from '@/domain/shared/errors'

export interface IQueryBus {
  register<Q extends IQuery>(type: string, handler: IQueryHandler<Q>): void
  execute<Q extends IQuery, R = any>(query: Q): Promise<Validation<QueryError[], R>>
}
```

#### 3.3 Создать Query класс

**Файл: `src/application/queries/ListResourcesQuery.ts`**

#### ListResourcesQuery [#class:ListResourcesQuery|#code|#structure:path]

```typescript
// src/application/queries/ListResourcesQuery.ts
import { QueryTypes } from './QueryTypes'
import type { IQuery } from './IQuery'

export class ListResourcesQuery implements IQuery {
  readonly type = QueryTypes.RESOURCE.LIST
  
  constructor(
    readonly namespace?: string,
    readonly search?: string
  ) {}
}
```

#### 3.4 Создать Query Handler

**Файл: `src/application/queries/handlers/ListResourcesQueryHandler.ts`**

#### ListResourcesQueryHandler [#class:ListResourcesQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
import { Validation, valid, invalid } from '@/shared/validation'
import type { IQueryHandler } from '../IQueryHandler'
import type { ListResourcesQuery } from '../ListResourcesQuery'
import type { IResourceRepository } from '@/domain/repositories'
import type { ResourceListItemDTO } from '../dtos/ResourceListItemDTO'
import { QueryError } from '@/domain/shared/errors'

/**
 * Query Handler для получения списка ресурсов
 * Реализует CQRS паттерн для чтения данных
 * 
 * ⚠️ ВАЖНО: Преобразование Domain → DTO происходит ЗДЕСЬ!
 * Repository возвращает Domain типы (Resource)
 * Query Handler преобразует их в DTO для Presentation Layer
 * 
 * Application Layer валидация:
 * - Обработка инфраструктурных ошибок
 * - Преобразование Domain → DTO
 * - Фильтрация данных (в будущем)
 */
export class ListResourcesQueryHandler 
  implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]> {
  
  constructor(private repository: IResourceRepository) {}
  
  async handle(
    query: ListResourcesQuery
  ): Promise<Validation<QueryError[], ResourceListItemDTO[]>> {
    try {
      // Получаем Domain типы из репозитория
      const resources = await this.repository.findAll()
      
      // Преобразуем Domain → DTO
      const dtos: ResourceListItemDTO[] = resources.map(resource => ({
        id: resource.getId().getValue(),
        namespace: resource.getNamespace().getValue(),
        name: resource.getName().getValue(),
        createdAt: resource.getCreatedAt().toISOString(),
        updatedAt: resource.getUpdatedAt().toISOString()
      }))
      
      // В будущем: фильтрация по namespace и search
      // const filtered = query.namespace 
      //   ? dtos.filter(dto => dto.namespace === query.namespace)
      //   : dtos
      
      return valid(dtos)
    } catch (error) {
      // Обрабатываем только инфраструктурные ошибки
      return invalid([
        new QueryError(
          'ListResourcesQuery',
          `Failed to fetch resources: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      ])
    }
  }
}
```

**Ключевые особенности Query Handler:**

1. **Validation API** - type-safe обработка ошибок
2. **Domain → DTO** - преобразование происходит здесь
3. **Try-catch** - только для инфраструктурных ошибок
4. **Getters** - используем методы вместо прямого доступа

**Зачем Query Handler?**
- ✅ CQRS: разделение чтения (Query) и записи (Command)
- ✅ Инкапсулирует логику получения данных
- ✅ Легко тестировать
- ✅ Легко кешировать результаты
- ✅ Изолирован от UI

> 💡 **Application Layer валидация:** Query Handlers НЕ делают валидацию данных (это Domain Layer). Они только обрабатывают инфраструктурные ошибки и преобразуют Domain → DTO.

> 📚 **Для Command Handlers:** См. [APPLICATION_LAYER_VALIDATION.md](../../docs/APPLICATION_LAYER_VALIDATION.md) - примеры с проверкой уникальности через Repository.

#### 3.5 Создать Public API для queries

**Файл: `src/application/queries/index.ts`**

#### Queries Public API [#code|#structure:path]

```typescript
// src/application/queries/index.ts
export { QueryTypes } from './QueryTypes'
export type { IQuery } from './IQuery'
export type { IQueryHandler } from './IQueryHandler'
export type { IQueryBus } from './IQueryBus'
export { ListResourcesQuery } from './ListResourcesQuery'
export { ListResourcesQueryHandler } from './handlers/ListResourcesQueryHandler'

// DTO для Presentation (через Composition)
export type { ResourceListItemDTO } from './dtos/ResourceListItemDTO'
```

**Почему DTO экспортируются в Public API?**
- DTO нужны Presentation Layer для типизации компонентов
- Presentation НЕ может импортировать из внутренностей (`/dtos/`)
- DTO экспортируются в Public API Application, затем реэкспортируются в Composition
- Это позволяет Presentation импортировать DTO через `@/composition`

---

### 💡 Пример: Application Layer валидация (Command Handler)

> **Примечание:** В Step 1 мы создаем только Query Handler (чтение). Command Handlers (запись) будут в Step 4.
> 
> Но важно понять **разницу между Domain и Application валидацией** уже сейчас!

#### Двухуровневая валидация

```
┌─────────────────────────────────────────────────────┐
│  Application Layer Validation                        │
│  ✅ Проверка уникальности (через Repository)        │
│  ✅ Проверка существования связанных объектов       │
│  ✅ Бизнес-правила уровня приложения                │
└────────────────────┬────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────┐
│  Domain Layer Validation                             │
│  ✅ Инварианты Value Objects (формат, длина)       │
│  ✅ Бизнес-правила внутри Aggregate                 │
└─────────────────────────────────────────────────────┘
```

#### Пример: CreateResourceCommand Handler

```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
import { Validation, valid, invalid, ValidationCombinators } from '@/shared/validation'
import { Resource } from '@/domain/resource/aggregates/Resource'
import { Namespace } from '@/domain/resource/value-objects/Namespace'
import { ResourceName } from '@/domain/resource/value-objects/ResourceName'
import { IResourceRepository } from '@/domain/resource/repositories/IResourceRepository'
import { 
  InvariantViolationError, 
  DuplicateResourceError,
  CommandError 
} from '@/domain/shared/errors'
import type { ICommandHandler } from '../ICommandHandler'
import type { CreateResourceCommand } from '../CreateResourceCommand'

/**
 * Command Handler для создания нового ресурса
 * 
 * Двухуровневая валидация:
 * 1. Application Layer - проверка уникальности через Repository
 * 2. Domain Layer - валидация Value Objects через ValidationCombinators
 * 
 * Обработка ошибок:
 * - Накопление ошибок из Domain Layer
 * - Добавление ошибок Application Layer
 * - Раннее возвращение при критических ошибках
 */
export class CreateResourceCommandHandler 
  implements ICommandHandler<CreateResourceCommand, string> {
  
  constructor(
    private readonly repository: IResourceRepository
  ) {}
  
  async handle(
    command: CreateResourceCommand
  ): Promise<Validation<InvariantViolationError[], string>> {
    
    // ==================== Шаг 1: Application Layer Validation ====================
    
    // ✅ Проверка уникальности - ТОЛЬКО Application Layer может это сделать!
    // Domain не знает о Repository, не может проверить уникальность
    
    // Сначала валидируем параметры для поиска (нужны валидные VO для запроса)
    const namespaceResult = Namespace.create(command.namespace)
    const nameResult = ResourceName.create(command.name)
    
    // Проверяем базовую валидацию перед запросом в Repository
    // Если формат невалидный - нет смысла проверять уникальность
    const basicValidation = ValidationCombinators.sequence(
      [namespaceResult, nameResult],
      ([ns, name]) => ({ namespace: ns, name })
    )
    
    if (basicValidation.isLeft()) {
      // Возвращаем ошибки валидации формата
      return basicValidation as Validation<InvariantViolationError[], string>
    }
    
    const { namespace, name } = basicValidation.value
    
    // Теперь проверяем уникальность
    try {
      const existingResource = await this.repository.findByNamespaceAndName(
        namespace,
        name
      )
      
      if (existingResource) {
        // ✅ Application Layer ошибка - дубликат
        return invalid([
          new DuplicateResourceError(
            namespace.getValue(),
            name.getValue(),
            `Resource "${namespace.getValue()}:${name.getValue()}" already exists`
          )
        ])
      }
    } catch (error) {
      // Инфраструктурная ошибка при проверке
      return invalid([
        new CommandError(
          'CreateResourceCommand',
          `Failed to check uniqueness: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      ])
    }
    
    // ==================== Шаг 2: Domain Layer Validation ====================
    
    // ✅ Создаем Aggregate (полная валидация всех Value Objects)
    // Domain проверяет формат, длину, паттерны через ValidationCombinators
    const resourceResult = Resource.create(
      command.namespace,
      command.name,
      command.secret
    )
    
    // Если есть ошибки валидации Domain - возвращаем их
    // ValidationCombinators уже накопил ВСЕ ошибки
    if (resourceResult.isLeft()) {
      return resourceResult as Validation<InvariantViolationError[], string>
    }
    
    // ==================== Шаг 3: Persistence ====================
    
    const resource = resourceResult.value
    
    try {
      await this.repository.save(resource)
      
      // Возвращаем ID созданного ресурса
      return valid(resource.getId().getValue())
      
    } catch (error) {
      // Инфраструктурная ошибка при сохранении
      return invalid([
        new CommandError(
          'CreateResourceCommand',
          `Failed to save resource: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      ])
    }
  }
}
```

#### Ключевые моменты:

1. **Предварительная валидация перед запросом в Repository**
   ```typescript
   // ✅ Сначала валидируем формат (чтобы не делать лишний запрос в БД)
   const namespaceResult = Namespace.create(command.namespace)
   const nameResult = ResourceName.create(command.name)
   
   const basicValidation = ValidationCombinators.sequence(
     [namespaceResult, nameResult],
     ([ns, name]) => ({ namespace: ns, name })
   )
   
   if (basicValidation.isLeft()) {
     // Возвращаем ошибки формата (например: "Namespace too short")
     return basicValidation
   }
   ```

2. **Application валидация - проверка уникальности**
   ```typescript
   // ✅ Используем валидные VO для запроса
   const { namespace, name } = basicValidation.value
   
   const existingResource = await this.repository.findByNamespaceAndName(
     namespace,  // Уже валидный Namespace VO
     name        // Уже валидный ResourceName VO
   )
   
   if (existingResource) {
     return invalid([
       new DuplicateResourceError(
         namespace.getValue(),
         name.getValue(),
         `Resource "${namespace.getValue()}:${name.getValue()}" already exists`
       )
     ])
   }
   ```

3. **Domain валидация - создание Aggregate**
   ```typescript
   // ✅ ValidationCombinators накапливает ВСЕ ошибки
   const resourceResult = Resource.create(
     command.namespace,
     command.name,
     command.secret
   )
   
   if (resourceResult.isLeft()) {
     // Возвращаем ВСЕ накопленные ошибки Domain Layer
     // Например: ["Namespace too short", "Name invalid format", "Secret too weak"]
     return resourceResult
   }
   ```

4. **Раннее возвращение при ошибках**
   ```typescript
   // ✅ Останавливаемся при первой критической ошибке
   if (basicValidation.isLeft()) return basicValidation
   if (existingResource) return invalid([...])
   if (resourceResult.isLeft()) return resourceResult
   ```

5. **Try-catch только для инфраструктурных ошибок**
   ```typescript
   // ✅ Обрабатываем ошибки сети, БД, файловой системы
   try {
     await this.repository.save(resource)
   } catch (error) {
     return invalid([
       new CommandError('CreateResourceCommand', error.message)
     ])
   }
   ```

#### Почему Domain не может проверить уникальность?

```typescript
// ❌ НЕПРАВИЛЬНО - Domain знает о Repository
class Resource {
  static async create(
    namespace: string,
    name: string,
    repository: IResourceRepository  // ❌ Domain зависит от Infrastructure!
  ) {
    const existing = await repository.findByNamespaceAndName(...)  // ❌
    if (existing) return invalid([...])
    // ...
  }
}

// ✅ ПРАВИЛЬНО - Application проверяет уникальность
class CreateResourceCommandHandler {
  async handle(command: CreateResourceCommand) {
    // ✅ Application Layer имеет доступ к Repository
    const existing = await this.repository.findByNamespaceAndName(...)
    if (existing) return invalid([...])
    
    // ✅ Domain просто создает объект с валидацией формата
    const resource = Resource.create(namespace, name, secret)
  }
}
```

#### Пример накопления ошибок

**Сценарий:** Пользователь отправляет невалидные данные

```typescript
// Пользователь отправляет:
{
  namespace: "a",        // ❌ Слишком короткий (минимум 2 символа)
  name: "My@Resource",   // ❌ Недопустимый символ @
  secret: "123"          // ❌ Слишком короткий (минимум 8 символов)
}
```

**Шаг 1: Предварительная валидация**
```typescript
const namespaceResult = Namespace.create("a")
// Left([InvariantViolationError("Namespace", "Length must be between 2 and 50")])

const nameResult = ResourceName.create("My@Resource")
// Left([InvariantViolationError("ResourceName", "Must match pattern: ^[a-zA-Z0-9-_]+$")])

const basicValidation = ValidationCombinators.sequence(
  [namespaceResult, nameResult],
  ([ns, name]) => ({ namespace: ns, name })
)

// ✅ ValidationCombinators накопил ОБЕ ошибки!
// Left([
//   InvariantViolationError("Namespace", "Length must be between 2 and 50"),
//   InvariantViolationError("ResourceName", "Must match pattern: ^[a-zA-Z0-9-_]+$")
// ])

if (basicValidation.isLeft()) {
  // Возвращаем ВСЕ ошибки пользователю
  // Он видит сразу ОБЕ проблемы, а не по одной!
  return basicValidation
}
```

**Если бы формат был валидный, но ресурс существует:**
```typescript
const existingResource = await this.repository.findByNamespaceAndName(...)

if (existingResource) {
  // Возвращаем ошибку уникальности
  return invalid([
    new DuplicateResourceError(
      "social",
      "facebook",
      'Resource "social:facebook" already exists'
    )
  ])
}
```

**Если бы все прошло, но secret слабый:**
```typescript
const resourceResult = Resource.create("social", "facebook", "123")

// Resource.create() внутри вызывает ValidationCombinators
// Он накопит ВСЕ ошибки валидации secret
// Left([
//   InvariantViolationError("Secret", "Length must be at least 8 characters")
// ])

if (resourceResult.isLeft()) {
  return resourceResult
}
```

**Итог:** Пользователь получает **все ошибки сразу**, а не по одной!

> 📚 **Полная документация:** [APPLICATION_LAYER_VALIDATION.md](../../docs/APPLICATION_LAYER_VALIDATION.md) - детальные примеры Command и Query Handlers с валидацией.

---

### Этап 4: Infrastructure Layer (Query Bus)

Сначала создадим реализацию Query Bus в Infrastructure Layer.

#### 4.1 Создать Query Bus Implementation

**Файл: `src/infrastructure/queries/InMemoryQueryBus.ts`**

#### InMemoryQueryBus [#class:InMemoryQueryBus|#code|#structure:path]

```typescript
// src/infrastructure/queries/InMemoryQueryBus.ts
import type { IQueryBus, IQuery, IQueryHandler, QueryResult } from '@/application/queries'

/**
 * In-Memory реализация Query Bus
 * Хранит handlers в Map и диспетчеризует queries
 */
export class InMemoryQueryBus implements IQueryBus {
  private handlers = new Map<string, IQueryHandler>()
  
  register<Q extends IQuery>(type: string, handler: IQueryHandler<Q>): void {
    this.handlers.set(type, handler)
  }
  
  async execute<Q extends IQuery, R = any>(query: Q): Promise<QueryResult<R>> {
    const handler = this.handlers.get(query.type)
    
    if (!handler) {
      return {
        data: null as R,
        error: `No handler registered for query type: ${query.type}`
      }
    }
    
    return handler.handle(query)
  }
}
```

**Файл: `src/infrastructure/queries/index.ts`**

#### Query Bus Public API [#code|#structure:path]

```typescript
// src/infrastructure/queries/index.ts
export { InMemoryQueryBus } from './InMemoryQueryBus'
```

---

### Этап 5: Composition Root (Modules + Facades)

Composition Root связывает все слои через декомпозированную структуру.

#### 5.1 Создать ResourceModule

**Файл: `src/composition/modules/ResourceModule.ts`**

#### ResourceModule [#class:ResourceModule|#code|#structure:path]

```typescript
// src/composition/modules/ResourceModule.ts
import type { IResourceRepository } from '@/domain/repositories'
import type { IQueryBus } from '@/application/queries'
import { QueryTypes, ListResourcesQueryHandler } from '@/application/queries'
import { MockResourceRepository } from '@/infrastructure/repositories'

/**
 * DI Module для Resource сущности
 * Управляет зависимостями и регистрацией handlers
 */
export class ResourceModule {
  private static repository: IResourceRepository | null = null
  
  static getRepository(): IResourceRepository {
    if (!this.repository) {
      this.repository = new MockResourceRepository()
    }
    return this.repository
  }
  
  static registerQueryHandlers(bus: IQueryBus): void {
    const repository = this.getRepository()
    
    bus.register(
      QueryTypes.RESOURCE.LIST,
      new ListResourcesQueryHandler(repository)
    )
  }
  
  static reset(): void {
    this.repository = null
  }
}
```

#### 5.2 Создать ServiceContainer (упрощенная версия для Шага 1)

**Файл: `src/composition/ServiceContainer.ts`**

#### ServiceContainer [#class:ServiceContainer|#code|#structure:path]

```typescript
// src/composition/ServiceContainer.ts
import { InMemoryQueryBus } from '@/infrastructure/queries'
import { ResourceModule } from './modules/ResourceModule'
import type { IQueryBus } from '@/application/queries'

/**
 * Root DI Container - координирует все модули
 * 
 * Примечание: В будущем (когда добавим Request Parser для Multi-UI)
 * будет принимать адаптеры через initialize(adapters).
 * Пока упрощенная версия для Шага 1.
 */
export class ServiceContainer {
  private static queryBus: IQueryBus | null = null
  private static initialized = false
  
  /**
   * Инициализация контейнера
   * В Шаге 1 - без параметров (только Query Bus)
   * В будущих шагах - будет принимать адаптеры (requestParser, clipboard и т.д.)
   */
  static initialize(): void {
    if (this.initialized) return
    
    const bus = new InMemoryQueryBus()
    
    // Регистрируем handlers из модулей
    ResourceModule.registerQueryHandlers(bus)
    
    this.queryBus = bus
    this.initialized = true
  }
  
  static getQueryBus(): IQueryBus {
    if (!this.initialized) {
      // Auto-initialize для удобства в Шаге 1
      // В production коде лучше бросать ошибку
      this.initialize()
    }
    return this.queryBus!
  }
  
  static reset(): void {
    this.queryBus = null
    this.initialized = false
    ResourceModule.reset()
  }
}
```

#### 5.3 Создать Query Facade

**Файл: `src/composition/queries/ResourceQueries.ts`**

#### ResourceQueries Facade [#code|#structure:path]

```typescript
// src/composition/queries/ResourceQueries.ts
import { ListResourcesQuery } from '@/application/queries'
import { ServiceContainer } from '../ServiceContainer'

/**
 * Facade для Resource Queries
 * Упрощает работу с queries в Loaders (одна строка!)
 */
export const resourceQueries = {
  /**
   * Получить список ресурсов
   * Facade инкапсулирует создание Query и вызов Query Bus
   * 
   * Примечание: В будущем (Шаг 5) будет использовать Request Parser
   * для парсинга параметров. Пока парсим напрямую из Request.
   */
  async list(request: Request) {
    // Парсинг request напрямую (в будущем через Request Parser)
    const url = new URL(request.url)
    const namespace = url.searchParams.get('namespace') || undefined
    const search = url.searchParams.get('search') || undefined
    
    // Создаем Query
    const query = new ListResourcesQuery(namespace, search)
    
    // Выполняем через Query Bus
    const queryBus = ServiceContainer.getQueryBus()
    return queryBus.execute(query)
  }
}
```

**Файл: `src/composition/queries/index.ts`**

#### Queries Facade Public API [#code|#structure:path]

```typescript
// src/composition/queries/index.ts
export { resourceQueries } from './ResourceQueries'

// Единый объект для всех queries
export const queries = {
  resources: resourceQueries
}
```

#### 5.4 Создать Public API для Composition

**Файл: `src/composition/index.ts`**

#### Composition Public API [#code|#structure:path]

```typescript
// src/composition/index.ts
export { queries } from './queries'
export { ServiceContainer } from './ServiceContainer'

// DTO для Presentation (реэкспорт из Application)
export type { ResourceListItemDTO } from '@/application/queries'

// В будущих шагах здесь появятся commands и другие exports
```

**Почему реэкспорт DTO через Composition?**
- Presentation НЕ должен импортировать из Application напрямую (нарушение Dependency Rule)
- Composition - единственный посредник между Presentation и Application
- DTO экспортируются в Application Public API, затем реэкспортируются в Composition
- Presentation импортирует DTO из `@/composition`, а не из `@/application/queries/dtos`

**Зачем такая декомпозиция?**
- **Масштабируемость**: каждая сущность в своем Module
- **Facade Pattern**: loader в одну строку
- **Multi-UI**: легко добавить CLI/Desktop через Request Parser
- **Нет Magic Strings**: все константы в QueryTypes
- **Тестируемость**: каждый Module независим

---

### Этап 6: Presentation Layer (UI)

Presentation Layer отвечает за отображение данных пользователю.

#### 6.1 Создать компонент ResourceListItem

**Файл: `src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx`**

#### ResourceListItem Component [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx
import type { ResourceListItemDTO } from '@/composition'

interface Props {
  resource: ResourceListItemDTO
}

/**
 * Компонент для отображения одного ресурса в списке
 */
export function ResourceListItem({ resource }: Props) {
  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex justify-between items-center">
        {/* Левая часть: namespace и name */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            [{resource.namespace}]
          </span>
          <span className="font-semibold text-gray-900">
            {resource.name}
          </span>
        </div>
        
        {/* Правая часть: метаданные */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            {resource.fieldsCount} {resource.fieldsCount === 1 ? 'field' : 'fields'}
          </span>
          {resource.secretPreview && (
            <span className="font-mono text-xs text-gray-400">
              {resource.secretPreview}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### 6.2 Создать компонент ResourceList

**Файл: `src/presentation/web/react/src/components/ResourceList/ResourceList.tsx`**

#### ResourceList Component [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceList.tsx
import type { ResourceListItemDTO } from '@/composition'
import { ResourceListItem } from './ResourceListItem'

interface Props {
  resources: ResourceListItemDTO[]
}

/**
 * Компонент для отображения списка ресурсов
 */
export function ResourceList({ resources }: Props) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No resources found</p>
        <p className="text-sm mt-2">Create your first resource to get started</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {resources.map(resource => (
        <ResourceListItem key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
```

#### 6.3 Создать Public API для компонентов

**Файл: `src/presentation/web/react/src/components/ResourceList/index.ts`**

#### ResourceList Public API [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList/index.ts
export { ResourceList } from './ResourceList'
export { ResourceListItem } from './ResourceListItem'
```

#### 6.4 Создать React Router Route

**Файл: `src/presentation/web/react/src/routes/_index.tsx`**

#### Index Route [#code|#structure:path]

> **💡 React Router v7 Type Safety**: Импорт `import type { Route } from './+types/_index'` - это специальная фича React Router v7 для типобезопасности.
>
> **Как это работает:**
> - React Router **автоматически генерирует** типы для каждого route файла
> - Виртуальный путь `./+types/_index` создается на лету (не существует физически)
> - Содержит типы `Route.LoaderArgs`, `Route.ComponentProps`, `Route.ActionArgs`
> - Обеспечивает type safety между loader/action и компонентом
>
> **Подробнее**: [React Router v7 Type Safety](https://reactrouter.com/start/framework/type-safety)

#### Route Implementation [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { useLoaderData } from 'react-router'
import type { Route } from './+types/_index'  // ← Автогенерируемые типы React Router v7
import { queries } from '@/composition'
import { ResourceList } from '@/components/ResourceList'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ (НОВЫЙ ПОДХОД - CQRS)
 * 
 * Loader выполняется ТОЛЬКО на сервере (Node.js)
 * НЕ выполняется на клиенте
 * 
 * Используем Facade Pattern:
 * - queries.resources.list(request) - инкапсулирует ВСЮ логику
 * - Loader не знает о Query Bus, Query Handlers, Repository
 * - Вся сложность скрыта в Composition Layer
 */
export async function loader({ request }: Route.LoaderArgs) {
  // ✅ ОДНА СТРОКА! Facade инкапсулирует всё
  return queries.resources.list(request)
}

/**
 * ✅ КЛИЕНТСКИЙ КОМПОНЕНТ (+ SSR)
 * 
 * Выполняется:
 * - На сервере при SSR (первый рендер)
 * - На клиенте после hydration
 */
export default function Index() {
  // Получаем данные из loader (типизированные)
  // useLoaderData - это hook для получения данных,
  // НЕ для фетчинга (данные уже загружены в loader)
  const { resources } = useLoaderData<typeof loader>()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Заголовок */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Password Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your passwords securely
          </p>
        </header>
        
        {/* Список ресурсов */}
        <main>
          <ResourceList resources={resources} />
        </main>
      </div>
    </div>
  )
}
```

**Ключевые моменты React Router + CQRS:**

1. **`loader()` - это СЕРВЕР**, не клиент
   - Выполняется на Node.js
   - Имеет доступ к файловой системе, env переменным, внешним сервисам
   - Вызывается перед каждым рендерингом страницы

2. **Facade Pattern** - loader в одну строку
   - `queries.resources.list(request)` - вся логика инкапсулирована
   - Loader не знает о Query Bus, Handlers, Repository
   - Легко добавить кеширование, логирование, валидацию

3. **CQRS** - разделение чтения и записи
   - `queries.*` - для чтения данных (GET requests, loaders)
   - `commands.*` - для записи данных (POST/PUT/DELETE, actions)
   - Разные оптимизации для чтения и записи

4. **Type Safety**
   - `useLoaderData<typeof loader>()` - полная типизация
   - TypeScript знает структуру QueryResult<ResourceListItem[]>

**Детали см. в:**
- [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers и Facade
- [COMPOSITION_LAYER.md](../../docs/COMPOSITION_LAYER.md) - декомпозиция
- [DATA_FLOW.md](../../docs/DATA_FLOW.md) - поток данных

---

## 📁 Структура файлов

После выполнения шага у вас будет:

```
app/
├── domain/
│   ├── shared/                       # ← Shared Kernel (переиспользуемые инварианты)
│   │   ├── errors/
│   │   │   └── InvariantViolationError.ts
│   │   ├── invariants/
│   │   │   └── UuidInvariant.ts
│   │   └── index.ts
│   ├── value-objects/               # ← Value Objects
│   │   ├── ResourceId.ts
│   │   ├── Namespace.ts
│   │   ├── ResourceName.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IResourceRepository.ts
│       └── index.ts
│
├── application/
│   └── queries/                      # ← CQRS: Queries
│       ├── QueryTypes.ts             # ← Константы (нет magic strings)
│       ├── IQuery.ts
│       ├── IQueryHandler.ts
│       ├── IQueryBus.ts
│       ├── ListResourcesQuery.ts
│       ├── handlers/
│       │   └── ListResourcesQueryHandler.ts
│       ├── dtos/
│       │   └── ResourceListItemDTO.ts
│       └── index.ts
│
├── infrastructure/
│   ├── mocks/
│   │   ├── resources.mock.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── MockResourceRepository.ts
│   │   └── index.ts
│   └── queries/                      # ← Query Bus реализация
│       ├── InMemoryQueryBus.ts
│       └── index.ts
│
├── composition/                      # ← Composition Root (DI)
│   ├── modules/
│   │   └── ResourceModule.ts         # ← DI Module для Resource
│   ├── queries/
│   │   ├── ResourceQueries.ts        # ← Query Facade
│   │   └── index.ts
│   ├── ServiceContainer.ts           # ← Root Container (упрощенный для Шага 1)
│   └── index.ts
│
├── components/
│   └── ResourceList/
│       ├── ResourceList.tsx
│       ├── ResourceListItem.tsx
│       └── index.ts
│
└── routes/
    └── _index.tsx                    # ← Loader в 1 строку!
```

---

## ✅ Чек-лист выполнения

### Domain Layer
- [ ] Создать `src/domain/value-objects/ResourceId.ts`
- [ ] Создать `src/domain/value-objects/Namespace.ts`
- [ ] Создать `src/domain/value-objects/ResourceName.ts`
- [ ] Создать `src/domain/value-objects/index.ts`
- [ ] Создать `src/domain/repositories/IResourceRepository.ts`
- [ ] Создать `src/domain/repositories/index.ts`

### Application Layer (CQRS - Queries)
- [ ] Создать `src/application/queries/QueryTypes.ts`
- [ ] Создать `src/application/queries/IQuery.ts`
- [ ] Создать `src/application/queries/IQueryHandler.ts`
- [ ] Создать `src/application/queries/IQueryBus.ts`
- [ ] Создать `src/application/queries/ListResourcesQuery.ts`
- [ ] Создать `src/application/queries/handlers/ListResourcesQueryHandler.ts`
- [ ] Создать `src/application/queries/dtos/ResourceListItemDTO.ts`
- [ ] Создать `src/application/queries/index.ts`

### Infrastructure Layer
- [ ] Создать `src/infrastructure/mocks/resources.mock.ts`
- [ ] Создать `src/infrastructure/mocks/index.ts`
- [ ] Создать `src/infrastructure/repositories/MockResourceRepository.ts`
- [ ] Создать `src/infrastructure/repositories/index.ts`
- [ ] Создать `src/infrastructure/queries/InMemoryQueryBus.ts`
- [ ] Создать `src/infrastructure/queries/index.ts`

### Composition Root (DI + Facades)
- [ ] Создать `src/composition/modules/ResourceModule.ts`
- [ ] Создать `src/composition/ServiceContainer.ts` (с initialize(), без setEnvironment)
- [ ] Создать `src/composition/queries/ResourceQueries.ts`
- [ ] Создать `src/composition/queries/index.ts`
- [ ] Создать `src/composition/index.ts`

### Presentation Layer
- [ ] Создать `src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx`
- [ ] Создать `src/presentation/web/react/src/components/ResourceList/ResourceList.tsx`
- [ ] Создать `src/presentation/web/react/src/components/ResourceList/index.ts`
- [ ] Создать `src/presentation/web/react/src/routes/_index.tsx` (loader в 1 строку!)

### Запуск и проверка
- [ ] Запустить `pnpm dev`
- [ ] Открыть `http://localhost:5173` (или другой порт)
- [ ] Проверить что список ресурсов отображается
- [ ] Проверить стили и адаптивность
- [ ] Убедиться что loader содержит только: `return queries.resources.list(request)`

---

## 🎓 Что вы изучите

1. **Domain-Driven Design (DDD)**:
   - Value Objects (ResourceId, Namespace, ResourceName)
   - Repository Interfaces (IResourceRepository)
   - Dependency Inversion Principle

2. **Clean Architecture**:
   - Разделение на слои (Domain, Application, Infrastructure, Composition, Presentation)
   - Dependency Rule (зависимости к центру)
   - Public API модулей (index.ts)

3. **CQRS Pattern**:
   - Queries для чтения данных
   - Query Handlers для обработки
   - Query Bus для диспетчеризации
   - Разделение чтения и записи

4. **Composition Root**:
   - DI Modules по сущностям
   - Service Container координация
   - Facade Pattern для упрощения

5. **React Router v7 Framework**:
   - Server Loaders (SSR)
   - Facade упрощает loader до 1 строки
   - Type-safe data flow с автоматическими типами

6. **Паттерны**:
   - Facade Pattern
   - Module Pattern
   - Strategy Pattern (Request Parsers)
   - Dependency Injection

---

## 🚀 Запуск

```bash
# Установка зависимостей (если еще не установлены)
pnpm install

# Запуск dev сервера
pnpm dev

# Откройте браузер
# http://localhost:5173
```

---

## 🔍 Проверка результата

Вы должны увидеть:
- Заголовок "Password Manager"
- Список из 5 ресурсов
- Каждый ресурс показывает: namespace, name, количество полей
- При наведении - изменение фона

---

## 📝 Следующие шаги

После успешного завершения Шага 1:
- **Шаг 2**: Добавить поиск и фильтрацию (расширить Query Handler)
- **Шаг 3**: Создать страницу детального просмотра ресурса (новый Query Handler)
- **Шаг 4**: Добавить создание ресурса (Command Bus + Command Handlers)
- **Шаг 5**: Добавить Request Parser для Multi-UI поддержки (Web/CLI/Desktop)

---

## 💡 Советы

1. **Создавайте файлы по порядку** - снизу вверх (Domain → Infrastructure → Application → Presentation)
2. **Проверяйте типы** - TypeScript должен подсказывать автокомплит
3. **Используйте Public API** - импортируйте через `index.ts`
4. **Тестируйте постепенно** - после каждого этапа можно запустить и проверить

---

## ❓ FAQ

**Q: Зачем так много файлов для простого списка?**  
A: Мы строим масштабируемую архитектуру с CQRS и Clean Architecture. Когда добавятся новые фичи, структура уже будет готова. Каждый файл имеет одну ответственность.

**Q: Можно ли пропустить Value Objects?**  
A: Нет, они важны для валидации и инкапсуляции бизнес-правил. ResourceId.generate() гарантирует уникальность, Namespace.create() валидирует формат.

**Q: Зачем Query Handler если есть Repository?**  
A: Repository - это Infrastructure (работа с данными). Query Handler - это Application Layer (бизнес-логика чтения). Разделение позволяет добавить кеширование, логирование, трансформацию данных.

**Q: Зачем Facade если есть Query Bus?**  
A: Facade упрощает работу в Presentation Layer. Loader не знает о Query Bus, Query классах, парсинге параметров. Loader = 1 строка кода!

**Q: Почему Mock Repository асинхронный?**  
A: Чтобы код был готов к замене на реальный API без изменений. Все async/await остаются.

**Q: Что такое Entry сущность?**  
A: Entry - это Key-Value пара внутри Resource. Например, Resource "Gmail Account" содержит Entry: username, password, recovery_email.
