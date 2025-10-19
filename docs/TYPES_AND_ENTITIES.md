# Types and Entities - Типизация в DDD проекте `#types` `#ddd` `#value-object` `#entity`

Полное руководство по работе с типами, классами и сущностями в проекте Password Manager.

## Содержание

1. [Основные понятия](#основные-понятия)
2. [Структура типов в Domain Layer](#структура-типов-в-domain-layer)
3. [Value Objects vs TypeScript типы](#value-objects-vs-typescript-типы)
4. [DTO для Presentation Layer](#dto-для-presentation-layer)
5. [Правила импорта типов](#правила-импорта-типов)
6. [Примеры использования](#примеры-использования)
7. [Чек-лист](#чек-лист)

---

## Основные понятия

### Три типа "типов" в проекте

1. **Value Objects (классы)** - Domain Layer, содержат бизнес-логику
2. **Entities (классы)** - Domain Layer, имеют идентичность
3. **DTO (интерфейсы)** - Application Layer, простые объекты для UI

```typescript
// 1. Value Object (класс с логикой) #class:ResourceId
export class ResourceId {
  private constructor(private readonly _value: string) {}
  static create(value: string): Result<ResourceId, InvariantViolationError>
  getValue(): string
}

// 2. Entity (класс с идентичностью) #class:CustomField
export class CustomField {
  constructor(
    public readonly id: FieldId,  // Value Object
    public label: string,
    public value: string,
    public isSecret: boolean
  ) {}
}

// 3. DTO (интерфейс без логики) #interface:ResourceListItemDTO
export interface ResourceListItemDTO {
  id: string
  namespace: string
  name: string
  fieldsCount: number
  updatedAt: string
}
```

---

## Структура типов в Domain Layer

### Модуль Resource (Bounded Context)

```
src/domain/resource/            #structure:domain/resource/
├── index.ts                    # Public API модуля
│
├── aggregates/                 # Aggregate Roots #structure:domain/resource/aggregates/
│   ├── index.ts
│   └── Resource.ts             # Aggregate Root (класс) #class:Resource
│
├── entities/                   # Entities (не Aggregate Roots) #structure:domain/resource/entities/
│   ├── index.ts
│   ├── SecretField.ts          # Entity (класс) #class:SecretField
│   └── CustomField.ts          # Entity (класс) #class:CustomField
│
├── value-objects/              # Value Objects #structure:domain/resource/value-objects/
│   ├── index.ts
│   ├── ResourceId.ts           # Value Object (класс) #class:ResourceId
│   ├── FieldId.ts              # Value Object (класс) #class:FieldId
│   ├── ResourceName.ts         # Value Object (класс) #class:ResourceName
│   ├── Namespace.ts            # Value Object (класс) #class:Namespace
│   └── FieldValue.ts           # Value Object (класс) #class:FieldValue
│
├── repositories/               # Repository Interfaces #structure:domain/resource/repositories/
│   ├── index.ts
│   ├── IResourceRepository.ts  #interface:IResourceRepository
│   └── INamespaceRepository.ts #interface:INamespaceRepository
│
└── events/                     # Domain Events
    ├── index.ts
    ├── ResourceCreated.ts
    ├── ResourceUpdated.ts
    └── ResourceDeleted.ts
```

### Public API (index.ts)

```typescript
// src/domain/resource/index.ts  #structure:domain/resource/

// ✅ Экспортируем через подмодули (Public API)
export * from './aggregates'      // #class:Resource
export * from './entities'        // #class:SecretField #class:CustomField
export * from './value-objects'   // #class:ResourceId #class:Namespace
export * from './repositories'    // #interface:IResourceRepository
export * from './events'

// ❌ НЕ экспортируем TypeScript type aliases
// export type ResourceId = string  // НЕТ! У нас класс
```

```typescript
// src/domain/resource/aggregates/index.ts  #structure:domain/resource/aggregates/
export { Resource } from './Resource'
```

```typescript
// src/domain/resource/entities/index.ts  #structure:domain/resource/entities/
export { SecretField } from './SecretField'
export { CustomField } from './CustomField'
```

```typescript
// src/domain/resource/value-objects/index.ts  #structure:domain/resource/value-objects/
export { ResourceId } from './ResourceId'
export { FieldId } from './FieldId'
export { ResourceName } from './ResourceName'
export { Namespace } from './Namespace'
export { FieldValue } from './FieldValue'
```

---

## Value Objects vs TypeScript типы

### ❌ НЕПРАВИЛЬНО - Type Alias

```typescript
// ❌ Просто тип без логики
export type ResourceId = string

// Проблемы:
// - Нет валидации
// - Можно передать любую строку
// - Нет бизнес-логики
```

### ✅ ПРАВИЛЬНО - Value Object (класс)

```typescript
// src/domain/resource/value-objects/ResourceId.ts  #structure:domain/resource/value-objects/
import { Result, ok, err } from 'neverthrow'
import { UuidInvariant } from '@/domain/shared/invariants'  // #alias:@/ #structure:domain/shared/invariants/
import { InvariantViolationError } from '@/domain/shared/errors'  // #alias:@/ #structure:domain/shared/errors/

/**
 * Value Object для ID ресурса
 * Инвариант: должен быть валидным UUID v4
 */ // #class:ResourceId
export class ResourceId {
  private constructor(private readonly _value: string) {}
  
  /**
   * Генерирует новый ID
   */
  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID())
  }
  
  /**
   * Создает ID из строки с валидацией
   */
  static create(value: string): Result<ResourceId, InvariantViolationError> {
    return UuidInvariant.validate(value, 'ResourceId')
      .map(validValue => new ResourceId(validValue))
  }
  
  /**
   * Извлекает примитивное значение
   */
  getValue(): string {
    return this._value
  }
  
  /**
   * Сравнивает два ID
   */
  equals(other: ResourceId): boolean {
    return this._value === other._value
  }
}
```

### Преимущества Value Objects

1. **Валидация** - невозможно создать невалидный объект
2. **Инкапсуляция** - детали реализации скрыты
3. **Бизнес-логика** - методы для работы с данными
4. **Type Safety** - TypeScript различает разные Value Objects

```typescript
// ✅ Type Safety с Value Objects
function updateResource(id: ResourceId, name: ResourceName) {
  // Компилятор не даст перепутать
}

updateResource(resourceId, resourceName)  // ✅ OK
updateResource(resourceName, resourceId)  // ❌ Ошибка компиляции!

// ❌ Без Value Objects (просто строки)
function updateResource(id: string, name: string) {
  // Можно перепутать - компилятор не поможет
}

updateResource(name, id)  // ✅ Компилируется, но логически неверно!
```

---

## DTO для Presentation Layer

### Зачем нужны DTO?

**DTO (Data Transfer Object)** - простые объекты для передачи данных между слоями.

```
Domain (классы)  →  Application (DTO)  →  Presentation (JSON)
```

### Структура DTO

```
src/application/                                  #structure:application/
├── queries/                                      #structure:application/queries/
│   └── dtos/                                     #structure:application/queries/dtos/
│       ├── index.ts                              # Public API
│       ├── ResourceListItemDTO.ts                # Для списка
│       ├── ResourceDetailDTO.ts                  # Для детальной страницы
│       ├── CustomFieldDTO.ts                     # Для полей
│       └── NamespaceDTO.ts                       # Для неймспейсов
│
└── commands/                                     #structure:application/commands/
    └── dtos/                                     #structure:application/commands/dtos/
        ├── index.ts
        ├── CreateResourceDTO.ts
        └── UpdateResourceDTO.ts
```

### Примеры DTO

```typescript
// src/application/queries/dtos/ResourceListItemDTO.ts  #structure:application/queries/dtos/

/**
 * DTO для списка ресурсов
 * Оптимизирован для отображения в списке
 */
export interface ResourceListItemDTO {
  id: string              // ResourceId → string
  namespace: string       // Namespace → string
  name: string           // ResourceName → string
  fieldsCount: number
  updatedAt: string      // Date → ISO string
}
```

```typescript
// src/application/queries/dtos/ResourceDetailDTO.ts  #structure:application/queries/dtos/

/**
 * DTO для детальной страницы ресурса
 * Содержит полную информацию
 */
export interface ResourceDetailDTO {
  id: string
  namespace: string
  name: string
  secret: string
  customFields: CustomFieldDTO[]
  createdAt: string
  updatedAt: string
}

export interface CustomFieldDTO {
  id: string
  label: string
  value: string
  isSecret: boolean
}
```

```typescript
// src/application/queries/dtos/index.ts (Public API)  #structure:application/queries/dtos/

export type { ResourceListItemDTO } from './ResourceListItemDTO'
export type { ResourceDetailDTO, CustomFieldDTO } from './ResourceDetailDTO'
export type { NamespaceDTO } from './NamespaceDTO'
```

### Преобразование Domain → DTO

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts  #structure:application/queries/handlers/
import { Resource } from '@/domain'
import type { ResourceListItemDTO } from '../dtos'

export class ListResourcesQueryHandler {
  async handle(query: ListResourcesQuery): Promise<QueryResult<ResourceListItemDTO[]>> {
    // 1. Получаем Domain объекты (с Value Objects)
    const resources: Resource[] = await this.repository.findAll()
    
    // 2. Преобразуем Domain → DTO (классы → примитивы)
    const dtos: ResourceListItemDTO[] = resources.map(resource => ({
      id: resource.id.getValue(),              // ResourceId → string
      namespace: resource.namespace.getValue(), // Namespace → string
      name: resource.name.getValue(),          // ResourceName → string
      fieldsCount: resource.customFields.length,
      updatedAt: resource.updatedAt.toISOString()  // Date → string
    }))
    
    return { data: dtos }
  }
}
```

---

## Правила импорта типов

### 1. Внутри Domain - Локальные импорты

```typescript
// src/domain/resource/aggregates/Resource.ts  #structure:domain/resource/aggregates/

// ✅ Локальные импорты (внутри модуля)
import { ResourceId } from '../value-objects/ResourceId'  #structure:domain/resource/value-objects/
import { ResourceName } from '../value-objects/ResourceName'  #structure:domain/resource/value-objects/
import { Namespace } from '../value-objects/Namespace'  #structure:domain/resource/value-objects/
import { CustomField } from '../entities/CustomField'  #structure:domain/resource/entities/

// ✅ Кросс-модульные импорты (через Public API)
import { DomainError } from '@/domain/shared/errors'  #structure:domain/shared/errors/
import { UuidInvariant } from '@/domain/shared/invariants'  #structure:domain/shared/invariants/
```

### 2. Application Layer - Импорт из Domain

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts  #structure:application/queries/handlers/

// ✅ Импортируем классы из Domain через Public API
import { Resource } from '@/domain'

// ✅ Импортируем интерфейсы репозиториев
import type { IResourceRepository } from '@/domain/resource'

// ✅ Импортируем DTO
import type { ResourceListItemDTO } from '../dtos'  #structure:application/queries/dtos/
```

### 3. Presentation Layer - Только DTO

```typescript
// src/presentation/web/react/src/routes/_index.tsx  #structure:presentation/web/react/src/routes/

// ✅ Импортируем DTO из Application
import type { ResourceListItemDTO } from '@/application/queries/dtos'  #structure:application/queries/dtos/

// ✅ Импортируем facades из Composition
import { queries } from '@/composition'  #structure:composition/

// ❌ НЕ импортируем Domain классы напрямую
// import { Resource, ResourceId } from '@/domain'  // ЗАПРЕЩЕНО!
```

### Таблица правил импорта

| Слой | Может импортировать | Примеры |
|------|-------------------|---------|
| **Domain** | Только другие Domain объекты | `ResourceId`, `DomainError` |
| **Application** | Domain классы, DTO | `Resource`, `ResourceListItemDTO` |
| **Infrastructure** | Domain интерфейсы | `IResourceRepository` |
| **Composition** | Всё (единственный слой) | Domain, Application, Infrastructure |
| **Presentation** | DTO, Facades | `ResourceListItemDTO`, `queries` |

---

## Примеры использования

### Пример 1: Создание Resource в Domain

```typescript
// src/domain/resource/aggregates/Resource.ts  #structure:domain/resource/aggregates/
import { Result, ok, err } from 'neverthrow'
import { ResourceId } from '../value-objects/ResourceId'  #structure:domain/resource/value-objects/
import { ResourceName } from '../value-objects/ResourceName'  #structure:domain/resource/value-objects/
import { Namespace } from '../value-objects/Namespace'  #structure:domain/resource/value-objects/
import { CustomField } from '../entities/CustomField'  #structure:domain/resource/entities/
import { DomainError } from '@/domain/shared/errors'  #structure:domain/shared/errors/

export class Resource {
  constructor(
    public readonly id: ResourceId,        // ✅ Класс
    public readonly namespace: Namespace,  // ✅ Класс
    public readonly name: ResourceName,    // ✅ Класс
    private secret: string,
    private customFields: CustomField[],   // ✅ Массив классов
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
  
  /**
   * Фабричный метод - принимает примитивы, создает Value Objects
   */
  static create(
    namespace: string,
    name: string,
    secret: string
  ): Result<Resource, DomainError> {
    // Создаем Value Objects из примитивов
    const namespaceVO = Namespace.create(namespace)
    const nameVO = ResourceName.create(name)
    const id = ResourceId.generate()
    
    // Комбинируем результаты валидации
    return Result.combine([namespaceVO, nameVO])
      .map(([ns, nm]) => new Resource(
        id,
        ns,
        nm,
        secret,
        [],
        new Date(),
        new Date()
      ))
  }
  
  /**
   * Бизнес-метод - работает с классами
   */
  addCustomField(label: string, value: string): Result<void, DomainError> {
    // Инвариант: не более 20 полей
    if (this.customFields.length >= 20) {
      return err(new InvalidOperationError('Cannot add more than 20 fields'))
    }
    
    // Инвариант: уникальные метки
    if (this.customFields.some(f => f.label === label)) {
      return err(new DuplicateFieldLabelError(label))
    }
    
    // Создаем Entity
    const fieldId = FieldId.generate()
    const field = new CustomField(fieldId, label, value, false)
    
    this.customFields.push(field)
    return ok(undefined)
  }
}
```

### Пример 2: Handler преобразует Domain → DTO

```typescript
// src/application/queries/handlers/GetResourceByIdQueryHandler.ts  #structure:application/queries/handlers/
import { Resource, IResourceRepository } from '@/domain/resource'
import type { ResourceDetailDTO, CustomFieldDTO } from '../dtos'  #structure:application/queries/dtos/

export class GetResourceByIdQueryHandler {
  constructor(private repository: IResourceRepository) {}
  
  async handle(query: GetResourceByIdQuery): Promise<QueryResult<ResourceDetailDTO>> {
    try {
      // 1. Получаем Domain объект (с классами)
      const resource: Resource = await this.repository.findById(query.id)
      
      // 2. Преобразуем Domain → DTO (классы → примитивы)
      const dto: ResourceDetailDTO = {
        id: resource.id.getValue(),              // ResourceId → string
        namespace: resource.namespace.getValue(), // Namespace → string
        name: resource.name.getValue(),          // ResourceName → string
        secret: resource.secret,
        customFields: resource.customFields.map(field => ({
          id: field.id.getValue(),               // FieldId → string
          label: field.label,
          value: field.value,
          isSecret: field.isSecret
        })),
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString()
      }
      
      return { data: dto }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
```

### Пример 3: Presentation использует DTO

```typescript
// src/presentation/web/react/src/routes/resources.$id.tsx  #structure:presentation/web/react/src/routes/
import { useLoaderData } from 'react-router'
import { queries } from '@/composition'  #structure:composition/

// ✅ Импортируем DTO тип
import type { ResourceDetailDTO } from '@/application/queries/dtos'  #structure:application/queries/dtos/

export async function loader({ params }: Route.LoaderArgs) {
  // Получаем DTO через facade
  return queries.resources.getById(params.id!)
}

export default function ResourceDetail() {
  // TypeScript знает что это ResourceDetailDTO
  const { data } = useLoaderData<typeof loader>()
  
  if (!data) {
    return <div>Resource not found</div>
  }
  
  return (
    <div>
      <h1>{data.name}</h1>              {/* string */}
      <p>Namespace: {data.namespace}</p> {/* string */}
      
      <h2>Custom Fields</h2>
      {data.customFields.map(field => (
        <div key={field.id}>            {/* string */}
          <label>{field.label}</label>
          <input type="text" value={field.value} />
        </div>
      ))}
    </div>
  )
}
```

---

## Чек-лист

### При создании Value Object

- [ ] Создан класс (не type alias)
- [ ] Приватный конструктор
- [ ] Статический метод `create()` с валидацией
- [ ] Метод `getValue()` для извлечения примитива
- [ ] Использованы Shared Invariants для валидации
- [ ] Экспортирован через `index.ts` модуля

### При создании Entity

- [ ] Создан класс
- [ ] Имеет поле `id` (Value Object)
- [ ] Публичные поля для состояния
- [ ] Методы для изменения состояния (если нужно)
- [ ] Экспортирован через `index.ts` модуля

### При создании Aggregate

- [ ] Создан класс Aggregate Root
- [ ] Использует Value Objects для полей
- [ ] Фабричный метод `create()` принимает примитивы
- [ ] Бизнес-методы проверяют инварианты Aggregate
- [ ] Экспортирован через `index.ts` модуля

### При создании DTO

- [ ] Создан интерфейс (не класс)
- [ ] Все поля - примитивы (string, number, boolean)
- [ ] Названия полей понятные для UI
- [ ] Экспортирован через `index.ts` в `dtos/`
- [ ] Используется в Handler для преобразования

### При импорте типов

- [ ] Domain импортирует только другие Domain объекты
- [ ] Application импортирует Domain классы и DTO
- [ ] Presentation импортирует только DTO и facades
- [ ] Используются алиасы (`@/domain`, `@/application`)
- [ ] Нет прямых импортов из файлов (только через `index.ts`)

---

## Связанные документы

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура проекта
- [error-handling/INVARIANTS.md](./error-handling/INVARIANTS.md) - Инварианты и валидация
- [DDD_AND_CLEAN_ARCHITECTURE.md](./DDD_AND_CLEAN_ARCHITECTURE.md) - DDD паттерны
- [DATA_FLOW.md](./DATA_FLOW.md) - Поток данных через слои
