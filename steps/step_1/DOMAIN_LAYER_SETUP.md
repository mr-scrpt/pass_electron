# Domain Layer Setup

> **Назад:** [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)  
> **Далее:** [APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md)

---

## 🎯 Цель

Создать ядро приложения - Domain Layer. Это основа архитектуры, независимая от фреймворков.

> **📚 Детали**: 
> - [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - типизация в DDD: Value Objects, Entities, DTO
> - [DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - DDD и Clean Architecture

---

## 1.1. Создать переиспользуемые инварианты (Shared Kernel)

> **📚 Детали**: [INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) — Полное описание паттерна Invariants

### InvariantViolationError

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

### UuidInvariant

**Файл: `src/domain/shared/invariants/UuidInvariant.ts`**

#### UuidInvariant [#class:UuidInvariant|#code|#structure:path]

#### UuidSpecs [#code|#structure:path]

Сначала создаем синглтоны-спецификации с фиксированной конфигурацией (бизнес-правила).

**Файл: `src/domain/shared/specification/UuidSpecs.ts`**

```typescript
// src/domain/shared/specification/UuidSpecs.ts
import { 
  CommonNotEmptySpec,
  CommonPatternSpec
} from '@/domain/shared/specification'

/**
 * Спецификации для UUID
 * Синглтоны с фиксированной конфигурацией (бизнес-правила)
 * 
 * ✅ Единообразно с Namespace и ResourceName спецификациями
 */

export const UUID_NOT_EMPTY_SPEC = new CommonNotEmptySpec('UUID')

export const UUID_FORMAT_SPEC = new CommonPatternSpec(
  'UUID',
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  'must be a valid UUID v4'
)
```

**Почему CommonPatternSpec?**
- ✅ Переиспользование - UUID это просто regex паттерн
- ✅ Единообразие - тот же подход что и NAMESPACE_PATTERN_SPEC
- ✅ Конфигурация в синглтоне - regex и message в одном месте

#### UuidInvariant [#class:UuidInvariant|#code|#structure:path]

**Файл: `src/domain/shared/invariants/UuidInvariant.ts`**

```typescript
// src/domain/shared/invariants/UuidInvariant.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'  // ✅ Явный импорт из технического слоя
import { UUID_NOT_EMPTY_SPEC, UUID_FORMAT_SPEC } from '../specification/UuidSpecs'

/**
 * Инварианты для UUID
 * Использует Specification Pattern - единообразно с Value Objects
 */
export class UuidInvariant {
  /**
   * Валидация UUID v4 через спецификации
   * Накапливает ВСЕ ошибки (пустота + формат)
   * 
   * ✅ Единообразно с Namespace.create() и ResourceName.create()
   */
  static validate(
    value: string,
    entityType: string
  ): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence(
      [
        UUID_NOT_EMPTY_SPEC.isSatisfiedBy(value),
        UUID_FORMAT_SPEC.isSatisfiedBy(value)
      ],
      () => value
    )
  }
  
  /**
   * Type guard (не бросает)
   */
  static isValidUuid(value: string): boolean {
    return UUID_FORMAT_SPEC.isSatisfiedBy(value).isRight()
  }
}
```

**Почему спецификации?**
- ✅ Единообразие - тот же паттерн что и у Value Objects
- ✅ Переиспользование - можно использовать UUID_FORMAT_SPEC отдельно
- ✅ Накопление ошибок - пользователь видит все проблемы сразу
- ✅ Один стиль везде - консистентность кода
```

### Public API для Shared Kernel

**Файл: `src/domain/shared/index.ts`**

#### Shared Public API [#code|#structure:path]

```typescript
// src/domain/shared/index.ts
export { InvariantViolationError } from './errors/InvariantViolationError'
export { UuidInvariant } from './invariants/UuidInvariant'
export * from './specification/UuidSpecs'  // UUID спецификации
```

**Зачем Shared Kernel?**
- ✅ DRY — регулярное выражение в одном месте
- ✅ Переиспользование — можно использовать для `FieldId`, `EntryId`, etc.
- ✅ Тестируемость — один тест для всех UUID
- ✅ Изменяемость — изменить regex в одном месте

---

## 1.2. Создать Value Object: ResourceId

> **📚 Детали**: [TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы](../../docs/TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы) — Почему класс, а не type alias

**Файл: `src/domain/resource/value-objects/ResourceId.ts`**

#### ResourceId [#class:ResourceId|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceId.ts
import { Validation } from '@/shared/validation'
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
  
  static create(value: string): Validation<InvariantViolationError[], ResourceId> {
    // ✅ Используем переиспользуемый инвариант
    // Возвращает массив ошибок (пустота + формат) или валидный ResourceId
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

**Почему класс, а не `type ResourceId = string`?**
- ✅ Валидация - невозможно создать невалидный ResourceId
- ✅ Инкапсуляция - детали реализации скрыты
- ✅ Type Safety - TypeScript различает ResourceId и string
- ✅ Бизнес-логика - методы `generate()`, `equals()`

---

## 1.3. Создать спецификации для Namespace

Сначала создаем синглтоны-спецификации с фиксированной конфигурацией (бизнес-правила).

### NamespaceSpecs

**Файл: `src/domain/resource/specifications/NamespaceSpecs.ts`**

```typescript
// src/domain/resource/specifications/NamespaceSpecs.ts
import { 
  CommonLengthSpec,
  CommonPatternSpec,
  CommonNotEmptySpec
} from '@/domain/shared/specification'

/**
 * Спецификации для Namespace
 * Синглтоны с фиксированной конфигурацией (бизнес-правила)
 */

export const NAMESPACE_NOT_EMPTY_SPEC = new CommonNotEmptySpec('Namespace')

export const NAMESPACE_LENGTH_SPEC = new CommonLengthSpec('Namespace', 2, 50)

export const NAMESPACE_PATTERN_SPEC = new CommonPatternSpec(
  'Namespace',
  /^[a-z0-9-_]+$/,
  'must contain only lowercase letters, numbers, - and _'
)
```

### NotReservedNamespaceSpec (бизнес-правило)

**Файл: `src/domain/resource/specifications/NotReservedNamespaceSpec.ts`**

```typescript
// src/domain/resource/specifications/NotReservedNamespaceSpec.ts
import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '@/shared/specification'  // ✅ Явный импорт технического типа
import { ValidationError } from '@/shared/errors'        // ✅ Явный импорт технического типа

/**
 * Бизнес-правило: некоторые namespace зарезервированы системой
 */
export class NotReservedNamespaceSpec implements ISpecification<string> {
  private static readonly RESERVED_NAMESPACES = [
    'system',
    'admin',
    'root',
    'config',
    'settings'
  ]

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    const isNotReserved = !NotReservedNamespaceSpec.RESERVED_NAMESPACES.includes(
      value.toLowerCase()
    )
    
    return isTrue(isNotReserved, value)
      .valid()
      .invalid(new ValidationError(
        'Namespace',
        `"${value}" is a reserved namespace and cannot be used`
      ))
  }
}

export const NOT_RESERVED_NAMESPACE_SPEC = new NotReservedNamespaceSpec()
```

### Public API для спецификаций

**Файл: `src/domain/resource/specifications/index.ts`**

```typescript
// src/domain/resource/specifications/index.ts

// Namespace спецификации
export {
  NAMESPACE_NOT_EMPTY_SPEC,
  NAMESPACE_LENGTH_SPEC,
  NAMESPACE_PATTERN_SPEC
} from './NamespaceSpecs'

export { 
  NotReservedNamespaceSpec,
  NOT_RESERVED_NAMESPACE_SPEC 
} from './NotReservedNamespaceSpec'
```

---

## 1.4. Создать Value Object: Namespace

**Файл: `src/domain/resource/value-objects/Namespace.ts`**

#### Namespace [#class:Namespace|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/Namespace.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ValidationError } from '@/domain/shared/specification'
import {
  NAMESPACE_NOT_EMPTY_SPEC,
  NAMESPACE_LENGTH_SPEC,
  NAMESPACE_PATTERN_SPEC,
  NOT_RESERVED_NAMESPACE_SPEC
} from '../specifications'

/**
 * Value Object для namespace ресурса
 * 
 * Использует Specification Pattern для композиции правил валидации
 */
export class Namespace {
  private constructor(private readonly _value: string) {}
  
  /**
   * Создать Namespace с накоплением ВСЕХ ошибок валидации
   * Композиция общих и бизнес-специфичных спецификаций
   * 
   * @returns Validation<ValidationError[], Namespace>
   *          - Left: массив ВСЕХ ошибок (лучший UX)
   *          - Right: валидный Namespace
   */
  static create(value: string): Validation<ValidationError[], Namespace> {
    const specs = [
      NAMESPACE_NOT_EMPTY_SPEC,        // Общая спецификация
      NAMESPACE_LENGTH_SPEC,           // Общая спецификация
      NAMESPACE_PATTERN_SPEC,          // Общая спецификация
      NOT_RESERVED_NAMESPACE_SPEC      // Бизнес-специфичная
    ]

    return ValidationCombinators.sequence(
      specs.map(spec => spec.isSatisfiedBy(value)),
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

**Почему Specification Pattern?**

**Преимущества:**
- ✅ **Переиспользование** - одна спецификация для всех Value Objects
- ✅ **Бизнес-правила инкапсулированы** - конфигурация в синглтонах
- ✅ **Лучший UX** - пользователь видит ВСЕ ошибки сразу
- ✅ **Легко тестировать** - каждая спецификация тестируется отдельно
- ✅ **Композиция** - легко комбинировать правила

---

## 1.5. Создать спецификации для ResourceName

**Файл: `src/domain/resource/specifications/ResourceNameSpecs.ts`**

```typescript
// src/domain/resource/specifications/ResourceNameSpecs.ts
import { 
  CommonLengthSpec,
  CommonPatternSpec,
  CommonNotEmptySpec
} from '@/domain/shared/specification'

/**
 * Спецификации для ResourceName
 * Синглтоны с фиксированной конфигурацией (бизнес-правила)
 */

export const RESOURCE_NAME_NOT_EMPTY_SPEC = new CommonNotEmptySpec('ResourceName')

export const RESOURCE_NAME_LENGTH_SPEC = new CommonLengthSpec('ResourceName', 2, 100)

export const RESOURCE_NAME_PATTERN_SPEC = new CommonPatternSpec(
  'ResourceName',
  /^[a-zA-Z0-9-_]+$/,
  'must contain only letters, numbers, - and _'
)
```

**Обновить `src/domain/resource/specifications/index.ts`:**

```typescript
// src/domain/resource/specifications/index.ts

// Namespace спецификации
export {
  NAMESPACE_NOT_EMPTY_SPEC,
  NAMESPACE_LENGTH_SPEC,
  NAMESPACE_PATTERN_SPEC
} from './NamespaceSpecs'

export { 
  NotReservedNamespaceSpec,
  NOT_RESERVED_NAMESPACE_SPEC 
} from './NotReservedNamespaceSpec'

// ResourceName спецификации
export {
  RESOURCE_NAME_NOT_EMPTY_SPEC,
  RESOURCE_NAME_LENGTH_SPEC,
  RESOURCE_NAME_PATTERN_SPEC
} from './ResourceNameSpecs'
```

---

## 1.6. Создать Value Object: ResourceName

**Файл: `src/domain/resource/value-objects/ResourceName.ts`**

#### ResourceName [#class:ResourceName|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceName.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ValidationError } from '@/domain/shared/specification'
import {
  RESOURCE_NAME_NOT_EMPTY_SPEC,
  RESOURCE_NAME_LENGTH_SPEC,
  RESOURCE_NAME_PATTERN_SPEC
} from '../specifications'

/**
 * Value Object для имени ресурса
 * 
 * Использует Specification Pattern для композиции правил валидации
 */
export class ResourceName {
  private constructor(private readonly _value: string) {}
  
  /**
   * Создать ResourceName с накоплением ВСЕХ ошибок валидации
   * Композиция общих спецификаций
   */
  static create(value: string): Validation<ValidationError[], ResourceName> {
    const specs = [
      RESOURCE_NAME_NOT_EMPTY_SPEC,
      RESOURCE_NAME_LENGTH_SPEC,
      RESOURCE_NAME_PATTERN_SPEC
    ]

    return ValidationCombinators.sequence(
      specs.map(spec => spec.isSatisfiedBy(value)),
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

---

## 1.7. Создать Aggregate Root: Resource

> **📚 Детали**: [TYPES_AND_ENTITIES.md#aggregates](../../docs/TYPES_AND_ENTITIES.md#aggregates) — Что такое Aggregate Root

**Файл: `src/domain/resource/aggregates/Resource.ts`**

#### Resource Aggregate [#class:Resource|#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ValidationError } from '@/domain/shared/specification'
import { ResourceId } from '../value-objects/ResourceId'
import { ResourceName } from '../value-objects/ResourceName'
import { Namespace } from '../value-objects/Namespace'

/**
 * Props для создания Resource
 * Object Parameter Pattern - именованные параметры вместо позиционных
 */
interface ResourceProps {
  id: ResourceId
  namespace: Namespace
  name: ResourceName
  secret: string
  createdAt: Date
  updatedAt: Date
}

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
 * - Фабричный метод create() с валидацией через спецификации
 * - Базовые getters
 * - Object Parameter Pattern для конструктора
 * - Без CustomField entities (будет в Step 2)
 * - Без Domain Events (будет в Step 3)
 */
export class Resource {
  private readonly _id: ResourceId
  private readonly _namespace: Namespace
  private readonly _name: ResourceName
  private readonly _secret: string
  private readonly _createdAt: Date
  private readonly _updatedAt: Date

  private constructor(props: ResourceProps) {
    this._id = props.id
    this._namespace = props.namespace
    this._name = props.name
    this._secret = props.secret
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }
  
  /**
   * Создать новый Resource с валидацией
   * Накапливает ВСЕ ошибки валидации Value Objects (через спецификации)
   */
  static create(
    namespace: string,
    name: string,
    secret: string
  ): Validation<ValidationError[], Resource> {
    // Создаем Value Objects (они используют спецификации внутри)
    const namespaceVO = Namespace.create(namespace)
    const nameVO = ResourceName.create(name)
    const id = ResourceId.generate()
    
    // Комбинируем результаты валидации
    return ValidationCombinators.sequence(
      [namespaceVO, nameVO],
      ([ns, nm]) => new Resource({
        id,
        namespace: ns,
        name: nm,
        secret,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    )
  }
  
  /**
   * Восстановить Resource в валидном состоянии
   * 
   * Используется когда все Value Objects уже созданы и валидны.
   * НЕ выполняет валидацию повторно.
   * 
   * Object Parameter Pattern - именованные параметры, порядок не важен
   * 
   * Паттерн из DDD: reconstitution без повторной валидации.
   * Domain не знает откуда пришли данные (память, файл, сеть).
   */
  static reconstitute(props: ResourceProps): Resource {
    return new Resource(props)
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
export { Resource } from './Resource'
```

---

## ✅ Результат

После выполнения этого шага у вас будет:

```
src/domain/
├── shared/                       # Shared Kernel
│   ├── errors/
│   │   ├── InvariantViolationError.ts  # Для простых инвариантов
│   │   └── ValidationError.ts          # Для спецификаций
│   ├── invariants/
│   │   ├── UuidInvariant.ts            # Использует спецификации
│   │   └── index.ts
│   ├── specification/            # Specification Pattern (создан в SPECIFICATION_SETUP)
│   │   ├── UuidSpecs.ts                # UUID синглтоны-спецификации
│   │   ├── ISpecification.ts
│   │   ├── common/
│   │   │   ├── CommonLengthSpec.ts
│   │   │   ├── CommonPatternSpec.ts    # ← Используется для UUID!
│   │   │   └── CommonNotEmptySpec.ts
│   │   └── index.ts
│   └── index.ts
│
└── resource/                     # Resource Bounded Context
    ├── specifications/           # Бизнес-правила (синглтоны)
    │   ├── NamespaceSpecs.ts
    │   ├── NotReservedNamespaceSpec.ts
    │   ├── ResourceNameSpecs.ts
    │   └── index.ts
    │
    ├── value-objects/            # Value Objects
    │   ├── ResourceId.ts
    │   ├── Namespace.ts
    │   ├── ResourceName.ts
    │   └── index.ts
    │
    └── aggregates/               # Aggregate Roots
        ├── Resource.ts
        └── index.ts
```

**Что дальше?**

Теперь можно создавать Application Layer! → [APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md)

---

> **Назад:** [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)  
> **Далее:** [APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md)
