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

## 📁 Структура Domain Layer [#structure:tree]

### resource/ - Bounded Context для управления ресурсами
- **aggregates/** - Aggregate Roots (главные сущности)
- **entities/** - Entities (сущности внутри Aggregate)
- **value-objects/** - Value Objects (неизменяемые значения)
- **invariants/** - Domain-специфичные инварианты (например, NamespaceInvariant)
- **specifications/** - Бизнес-правила (например, NotReservedNamespaceSpec)
- **repositories/** - Repository Interfaces
- **events/** - Domain Events

### shared/ - Shared Kernel (переиспользуемое между доменами)
- **errors/** - Базовые ошибки (InvariantViolationError, ValidationError)
- **invariants/** - Shared инварианты (используются везде, например UuidInvariant)
- **specification/** - Common спецификации
- **base/** - Базовые классы/интерфейсы

---

## 1.1. Создать переиспользуемые инварианты (Shared Kernel)

> **📚 Детали**: [INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) — Полное описание паттерна Invariants

### UuidInvariant

> **📚 Примечание:** Для валидации используется `ValidationError` из `@/shared/errors` (технический тип).  
> Подробнее: [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)

**Файл: `src/domain/shared/invariants/UuidInvariant.ts`**

#### IInvariant Interface [#interface:IInvariant|#code|#structure:path]

Сначала создаем интерфейс для всех инвариантов (контракт).

**Файл: `src/domain/shared/invariants/IInvariant.ts`**

```typescript
// src/domain/shared/invariants/IInvariant.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'

/**
 * Интерфейс для инвариантов
 * Инварианты валидируют данные через Specification Pattern
 * 
 * @template T - тип валидируемого значения
 */
export interface IInvariant<T> {
  /**
   * Валидация значения
   * 
   * @param value - значение для валидации
   * @param entityType - тип сущности (для сообщений об ошибках)
   * @returns Validation с массивом ошибок или валидным значением
   */
  validate(value: T, entityType: string): Validation<ValidationError[], T>
}
```

#### UuidInvariant [#class:UuidInvariant|#code|#structure:path]

**Паттерн:** Singleton (один экземпляр на всё приложение)

**Файл: `src/domain/shared/invariants/UuidInvariant.ts`**

```typescript
// src/domain/shared/invariants/UuidInvariant.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'
import { CommonNotEmptySpec, CommonPatternSpec } from '../specification'
import { IInvariant } from './IInvariant'

/**
 * Инвариант для валидации UUID v4
 * 
 * Реализует IInvariant<string>
 * Singleton паттерн - один экземпляр на всё приложение (stateless)
 */
export class UuidInvariant implements IInvariant<string> {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Singleton instance
  private static readonly _instance = new UuidInvariant();

  // Приватный конструктор - нельзя создать извне
  private constructor() {}

  /**
   * Получить singleton instance
   */
  static get instance(): UuidInvariant {
    return UuidInvariant._instance;
  }

  /**
   * Валидация UUID v4 через спецификации
   * Накапливает ВСЕ ошибки (пустота + формат)
   * 
   * @param value - значение для валидации
   * @param entityType - тип сущности (например "ResourceId", "FieldId")
   * @returns массив ValidationError[] или валидный string
   * 
   * ✅ Создает спецификации динамически с правильным entityType
   * ✅ Пользователь увидит "ResourceId: cannot be empty" вместо "UUID: cannot be empty"
   */
  validate(
    value: string,
    entityType: string
  ): Validation<ValidationError[], string> {
    // Используем именованные параметры для спецификаций
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonPatternSpec.for({
          entityType,
          pattern: UuidInvariant.UUID_V4_REGEX,
          message: "must be a valid UUID v4",
        }).isSatisfiedBy(value),
      ],
      () => value
    );
  }
  
  /**
   * Type guard для быстрой проверки формата
   */
  isValidUuid(value: string): boolean {
    return UuidInvariant.UUID_V4_REGEX.test(value);
  }
}
```

**Почему Singleton?**
- ✅ Stateless - нет внутреннего состояния
- ✅ `entityType` - параметр метода (динамический)
- ✅ Один экземпляр для всего приложения
- ✅ Реализует `IInvariant<string>` для полиморфизма

**Почему именованные параметры?**
- ✅ Невозможно перепутать `pattern` и `message`
- ✅ Самодокументируемый код
- ✅ IDE автодополнение
- ✅ Martin Fowler's Parameter Object Pattern

### NamespaceInvariant

**Паттерн:** Singleton (реализует `IInvariant<string>`)

**Файл: `src/domain/resource/invariants/NamespaceInvariant.ts`**

#### NamespaceInvariant [#class:NamespaceInvariant|#code|#structure:path]

```typescript
// src/domain/resource/invariants/NamespaceInvariant.ts
import { Validation, ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import {
  CommonNotEmptySpec,
  CommonLengthSpec,
  CommonPatternSpec,
} from "@/domain/shared/specification";
import { IInvariant } from "@/domain/shared/invariants";

/**
 * Инвариант для валидации Namespace
 * Правила: 2-50 символов, lowercase, буквы/цифры/-/_
 */
export class NamespaceInvariant implements IInvariant<string> {
  // Правила ВНУТРИ инварианта
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;
  private static readonly PATTERN = /^[a-z0-9-_]+$/;
  private static readonly PATTERN_MESSAGE =
    "must contain only lowercase letters, numbers, - and _";

  private static readonly _instance = new NamespaceInvariant();
  private constructor() {}
  
  static get instance(): NamespaceInvariant {
    return NamespaceInvariant._instance;
  }

  validate(
    value: string,
    entityType: string,
  ): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonLengthSpec.for({
          entityType,
          minLength: NamespaceInvariant.MIN_LENGTH,
          maxLength: NamespaceInvariant.MAX_LENGTH,
        }).isSatisfiedBy(value),
        CommonPatternSpec.for({
          entityType,
          pattern: NamespaceInvariant.PATTERN,
          message: NamespaceInvariant.PATTERN_MESSAGE,
        }).isSatisfiedBy(value),
      ],
      () => value,
    );
  }
}
```

### ResourceNameInvariant

**Паттерн:** Singleton (реализует `IInvariant<string>`)

**Файл: `src/domain/resource/invariants/ResourceNameInvariant.ts`**

#### ResourceNameInvariant [#class:ResourceNameInvariant|#code|#structure:path]

```typescript
// src/domain/resource/invariants/ResourceNameInvariant.ts
import { Validation, ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { CommonNotEmptySpec, CommonLengthSpec } from "@/domain/shared/specification";
import { IInvariant } from "@/domain/shared/invariants";

/**
 * Инвариант для валидации ResourceName
 * Правила: 1-100 символов
 */
export class ResourceNameInvariant implements IInvariant<string> {
  // Правила ВНУТРИ инварианта
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  private static readonly _instance = new ResourceNameInvariant();
  private constructor() {}
  
  static get instance(): ResourceNameInvariant {
    return ResourceNameInvariant._instance;
  }

  validate(
    value: string,
    entityType: string,
  ): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonLengthSpec.for({
          entityType,
          minLength: ResourceNameInvariant.MIN_LENGTH,
          maxLength: ResourceNameInvariant.MAX_LENGTH,
        }).isSatisfiedBy(value),
      ],
      () => value,
    );
  }
}
```

**Почему отдельные инварианты?**
- ✅ Согласованность с `UuidInvariant` - правила внутри
- ✅ DDD - Domain Service инкапсулирует бизнес-логику
- ✅ Реализуют `IInvariant<string>` для полиморфизма
- ✅ Value Object просто делегирует валидацию

**Почему в resource/invariants, а не в shared?**
- ✅ `NamespaceInvariant` и `ResourceNameInvariant` специфичны для Resource домена
- ✅ `UuidInvariant` действительно shared - используется везде (ResourceId, FieldId, EntryId...)
- ✅ Правильная организация по Bounded Context

### Public API для Shared Kernel

**Файл: `src/domain/shared/invariants/index.ts`**

```typescript
// src/domain/shared/invariants/index.ts
export type { IInvariant } from './IInvariant'
export { UuidInvariant } from './UuidInvariant'
```

**Файл: `src/domain/shared/index.ts`**

#### Shared Public API [#code|#structure:path]

```typescript
// src/domain/shared/index.ts
export * from './invariants'  // IInvariant, UuidInvariant
export * from './specification'  // Common спецификации
```

### Public API для Resource Bounded Context

**Файл: `src/domain/resource/invariants/index.ts`**

```typescript
// src/domain/resource/invariants/index.ts
export { NamespaceInvariant } from './NamespaceInvariant'
export { ResourceNameInvariant } from './ResourceNameInvariant'
```

**Зачем разделение?**
- ✅ DRY — валидация в одном месте
- ✅ Bounded Context — каждый домен управляет своими инвариантами
- ✅ Shared Kernel — только действительно общие вещи (UUID, IInvariant)
- ✅ Тестируемость — тест инварианта = тест всех Value Objects этого типа
- ✅ Изменяемость — изменить правила в одном месте
- ✅ Согласованность — все инварианты следуют одному паттерну

---

## 1.2. Создать Value Object: ResourceId

> **📚 Детали**: [TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы](../../docs/TYPES_AND_ENTITIES.md#value-objects-vs-typescript-типы) — Почему класс, а не type alias

**Файл: `src/domain/resource/value-objects/ResourceId.ts`**

#### ResourceId [#class:ResourceId|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceId.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'  // ✅ Явный импорт технического типа
import { UuidInvariant } from '@/domain/shared'

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
  
  static create(value: string): Validation<ValidationError[], ResourceId> {
    // ✅ Используем переиспользуемый инвариант (Singleton)
    // Возвращает массив ошибок (пустота + формат) или валидный ResourceId
    return UuidInvariant.instance.validate(value, ResourceId.ENTITY_TYPE)
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

## 1.3. Создать бизнес-специфичные спецификации

> **📚 Примечание:** Общие правила (длина, формат) валидируются через domain-специфичные инварианты (`NamespaceInvariant`, `ResourceNameInvariant`).  
> Здесь создаются только **бизнес-специфичные** правила (например, список зарезервированных namespace).

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
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'
import { NamespaceInvariant } from '../invariants'

/**
 * Value Object для namespace ресурса
 * Инвариант: 2-50 символов, lowercase, буквы/цифры/-/_
 */
export class Namespace {
  private static readonly ENTITY_TYPE = 'Namespace'
  
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<ValidationError[], Namespace> {
    // ✅ Используем NamespaceInvariant (Singleton)
    // Правила валидации ВНУТРИ инварианта
    return NamespaceInvariant.instance
      .validate(value, Namespace.ENTITY_TYPE)
      .map((validValue: string) => new Namespace(validValue))
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

## 1.5. Создать Value Object: ResourceName

**Файл: `src/domain/resource/value-objects/ResourceName.ts`**

#### ResourceName [#class:ResourceName|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/ResourceName.ts
import { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'
import { ResourceNameInvariant } from '../invariants'

/**
 * Value Object для имени ресурса
 * Инвариант: 1-100 символов
 */
export class ResourceName {
  private static readonly ENTITY_TYPE = 'ResourceName'
  
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<ValidationError[], ResourceName> {
    // ✅ Используем ResourceNameInvariant (Singleton)
    // Правила валидации ВНУТРИ инварианта
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .map((validValue: string) => new ResourceName(validValue))
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
import { ValidationError } from '@/shared/errors'  // ✅ Явный импорт технического типа
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
│   ├── invariants/
│   │   ├── IInvariant.ts                # Интерфейс для инвариантов
│   │   ├── UuidInvariant.ts             # Singleton (UUID) - используется везде
│   │   └── index.ts
│   ├── specification/            # Specification Pattern (создан в SPECIFICATION_SETUP)
│   │   ├── common/
│   │   │   ├── CommonLengthSpec.ts     # Singleton Factory
│   │   │   ├── CommonPatternSpec.ts    # Singleton Factory ← Используется для UUID!
│   │   │   └── CommonNotEmptySpec.ts   # Singleton Factory
│   │   └── index.ts
│   └── index.ts
│
└── resource/                     # Resource Bounded Context
    ├── invariants/               # Инварианты специфичные для Resource
    │   ├── NamespaceInvariant.ts        # Singleton (Namespace)
    │   ├── ResourceNameInvariant.ts     # Singleton (ResourceName)
    │   └── index.ts
    │
    ├── specifications/           # Бизнес-специфичные спецификации
    │   ├── NotReservedNamespaceSpec.ts  # Бизнес-правило
    │   └── index.ts
    │
    ├── value-objects/            # Value Objects
    │   ├── ResourceId.ts                # → UuidInvariant (shared)
    │   ├── Namespace.ts                 # → NamespaceInvariant (local)
    │   ├── ResourceName.ts              # → ResourceNameInvariant (local)
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
