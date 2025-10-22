# Application Layer Validation

**Теги:** `#application-layer` `#validation` `#commands` `#queries` `#cqrs`

---

## 🎯 Концепция двухуровневой валидации

В DDD + Clean Architecture валидация происходит на **двух уровнях**:

```
┌─────────────────────────────────────────────────────┐
│  Application Layer Validation                        │
│  ✅ Проверка уникальности (через Repository)        │
│  ✅ Проверка существования связанных объектов       │
│  ✅ Бизнес-правила уровня приложения                │
│  ✅ Координация между Aggregates                    │
└────────────────────┬────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────┐
│  Domain Layer Validation                             │
│  ✅ Инварианты Value Objects                        │
│  ✅ Бизнес-правила внутри Aggregate                 │
│  ✅ Консистентность данных                          │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Разделение ответственности

### Domain Layer отвечает за:

1. **Инварианты Value Objects**
   - Формат (UUID, email, URL)
   - Длина строк
   - Паттерны (regex)
   - Диапазоны значений

2. **Бизнес-правила внутри Aggregate**
   - Максимум полей в Resource
   - Уникальность меток CustomField внутри Resource
   - Состояния и переходы

**Пример:**
```typescript
// Domain Layer
class Resource {
  addCustomField(label: string, value: string): Validation<Error, CustomField> {
    // ✅ Бизнес-правило: максимум 20 полей
    if (this._customFields.length >= 20) {
      return invalid(new InvalidOperationError('Cannot add more than 20 fields'))
    }
    
    // ✅ Бизнес-правило: уникальные метки ВНУТРИ Resource
    if (this._customFields.some(f => f.getLabel() === label)) {
      return invalid(new DuplicateError(`Field "${label}" already exists`))
    }
    
    // Создаем Entity
    const field = new CustomField(FieldId.generate(), label, value, false)
    this._customFields.push(field)
    
    return valid(field)
  }
}
```

---

### Application Layer отвечает за:

1. **Проверка уникальности через Repository**
   - Namespace уже существует?
   - Resource с таким именем уже есть?
   - Email уже зарегистрирован?

2. **Проверка существования связанных объектов**
   - Resource существует перед обновлением?
   - User существует перед назначением?

3. **Координация между Aggregates**
   - Проверка прав доступа
   - Проверка квот
   - Проверка зависимостей

**Пример:**
```typescript
// Application Layer
class CreateResourceCommandHandler {
  async handle(command: CreateResourceCommand): Promise<Validation<Error[], string>> {
    // ✅ Application Layer: проверка уникальности
    const existing = await this.repository.findByNamespaceAndName(
      command.namespace,
      command.name
    )
    
    if (existing) {
      return invalid([new DuplicateError('Resource already exists')])
    }
    
    // ✅ Domain Layer: валидация Value Objects
    const resourceResult = Resource.create(
      command.namespace,
      command.name,
      command.secret
    )
    
    if (resourceResult.isLeft()) {
      return resourceResult
    }
    
    // Сохраняем
    await this.repository.save(resourceResult.value)
    return valid(resourceResult.value.getId().getValue())
  }
}
```

---

## 🔧 Command Validation

### Структура Command Handler

```typescript
class CommandHandler {
  async handle(command: Command): Promise<Validation<Error[], Result>> {
    // 1. Application Layer Validation
    // 2. Domain Layer Validation
    // 3. Persistence
    // 4. Return Result
  }
}
```

---

### Пример 1: CreateResourceCommand

#### Command [#class:CreateResourceCommand|#code|#structure:path]

```typescript
// src/application/commands/CreateResourceCommand.ts
export class CreateResourceCommand {
  constructor(
    public readonly namespace: string,
    public readonly name: string,
    public readonly secret: string
  ) {}
}
```

#### Handler [#class:CreateResourceCommandHandler|#code|#structure:path]

```typescript
// src/application/commands/handlers/CreateResourceCommandHandler.ts
import { Validation, ValidationCombinators, valid, invalid } from '@/shared/validation'
import { ICommandHandler } from '../ICommandHandler'
import { CreateResourceCommand } from '../CreateResourceCommand'
import { Resource } from '@/domain/resource/aggregates/Resource'
import { IResourceRepository } from '@/domain/resource/repositories/IResourceRepository'
import { 
  InvariantViolationError,
  DuplicateError,
  ApplicationError 
} from '@/domain/shared/errors'

export class CreateResourceCommandHandler implements ICommandHandler<CreateResourceCommand> {
  constructor(
    private readonly repository: IResourceRepository
  ) {}
  
  async handle(
    command: CreateResourceCommand
  ): Promise<Validation<ApplicationError[], string>> {
    // ==================== Шаг 1: Application Layer Validation ====================
    
    // Проверка уникальности namespace + name
    const existingResource = await this.repository.findByNamespaceAndName(
      command.namespace,
      command.name
    )
    
    if (existingResource) {
      return invalid([
        new DuplicateError(
          'Resource',
          `Resource with namespace "${command.namespace}" and name "${command.name}" already exists`
        )
      ])
    }
    
    // ==================== Шаг 2: Domain Layer Validation ====================
    
    // Создаем Aggregate (валидация Value Objects)
    const resourceResult = Resource.create(
      command.namespace,
      command.name,
      command.secret
    )
    
    // Если есть ошибки валидации - возвращаем их
    if (resourceResult.isLeft()) {
      // Преобразуем Domain ошибки в Application ошибки
      return resourceResult as Validation<ApplicationError[], string>
    }
    
    // ==================== Шаг 3: Persistence ====================
    
    const resource = resourceResult.value
    
    try {
      await this.repository.save(resource)
      
      // Возвращаем ID созданного ресурса
      return valid(resource.getId().getValue())
    } catch (error) {
      return invalid([
        new ApplicationError(
          'CreateResourceCommand',
          `Failed to save resource: ${error.message}`
        )
      ])
    }
  }
}
```

**Ключевые моменты:**

1. **Application Validation первая** - проверка уникальности
2. **Domain Validation вторая** - создание Aggregate с валидацией VO
3. **Раннее возвращение** - если есть ошибки, не продолжаем
4. **Try-catch для persistence** - обработка инфраструктурных ошибок

---

### Пример 2: UpdateResourceNameCommand

#### Command [#class:UpdateResourceNameCommand|#code|#structure:path]

```typescript
// src/application/commands/UpdateResourceNameCommand.ts
export class UpdateResourceNameCommand {
  constructor(
    public readonly resourceId: string,
    public readonly newName: string
  ) {}
}
```

#### Handler [#class:UpdateResourceNameCommandHandler|#code|#structure:path]

```typescript
// src/application/commands/handlers/UpdateResourceNameCommandHandler.ts
import { Validation, valid, invalid } from '@/shared/validation'
import { ICommandHandler } from '../ICommandHandler'
import { UpdateResourceNameCommand } from '../UpdateResourceNameCommand'
import { Resource } from '@/domain/resource/aggregates/Resource'
import { ResourceId } from '@/domain/resource/value-objects/ResourceId'
import { IResourceRepository } from '@/domain/resource/repositories/IResourceRepository'
import { 
  InvariantViolationError,
  NotFoundError,
  ApplicationError 
} from '@/domain/shared/errors'

export class UpdateResourceNameCommandHandler 
  implements ICommandHandler<UpdateResourceNameCommand> {
  
  constructor(
    private readonly repository: IResourceRepository
  ) {}
  
  async handle(
    command: UpdateResourceNameCommand
  ): Promise<Validation<ApplicationError[], void>> {
    // ==================== Шаг 1: Валидация ID ====================
    
    const resourceIdResult = ResourceId.create(command.resourceId)
    
    if (resourceIdResult.isLeft()) {
      return invalid([resourceIdResult.value])
    }
    
    const resourceId = resourceIdResult.value
    
    // ==================== Шаг 2: Проверка существования ====================
    
    const resource = await this.repository.findById(resourceId)
    
    if (!resource) {
      return invalid([
        new NotFoundError(
          'Resource',
          `Resource with id "${command.resourceId}" not found`
        )
      ])
    }
    
    // ==================== Шаг 3: Domain Logic ====================
    
    // Вызываем бизнес-метод Aggregate
    const updateResult = resource.updateName(command.newName)
    
    if (updateResult.isLeft()) {
      return updateResult as Validation<ApplicationError[], void>
    }
    
    // ==================== Шаг 4: Persistence ====================
    
    try {
      await this.repository.save(resource)
      return valid(undefined)
    } catch (error) {
      return invalid([
        new ApplicationError(
          'UpdateResourceNameCommand',
          `Failed to update resource: ${error.message}`
        )
      ])
    }
  }
}
```

**Ключевые моменты:**

1. **Валидация ID** - проверяем формат UUID
2. **Проверка существования** - Resource должен существовать
3. **Вызов бизнес-метода** - `resource.updateName()`
4. **Сохранение изменений** - через Repository

---

## 🔍 Query Validation

### Структура Query Handler

```typescript
class QueryHandler {
  async handle(query: Query): Promise<Validation<Error[], DTO>> {
    // 1. Валидация параметров запроса
    // 2. Поиск через Repository
    // 3. Преобразование Domain → DTO
    // 4. Return DTO
  }
}
```

---

### Пример 1: GetResourceByIdQuery

#### Query [#class:GetResourceByIdQuery|#code|#structure:path]

```typescript
// src/application/queries/GetResourceByIdQuery.ts
export class GetResourceByIdQuery {
  constructor(
    public readonly resourceId: string
  ) {}
}
```

#### Handler [#class:GetResourceByIdQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/GetResourceByIdQueryHandler.ts
import { Validation, valid, invalid } from '@/shared/validation'
import { IQueryHandler } from '../IQueryHandler'
import { GetResourceByIdQuery } from '../GetResourceByIdQuery'
import { ResourceId } from '@/domain/resource/value-objects/ResourceId'
import { IResourceRepository } from '@/domain/resource/repositories/IResourceRepository'
import { ResourceDetailDTO } from '../dtos/ResourceDetailDTO'
import { 
  InvariantViolationError,
  NotFoundError,
  QueryError 
} from '@/domain/shared/errors'

export class GetResourceByIdQueryHandler 
  implements IQueryHandler<GetResourceByIdQuery, ResourceDetailDTO> {
  
  constructor(
    private readonly repository: IResourceRepository
  ) {}
  
  async handle(
    query: GetResourceByIdQuery
  ): Promise<Validation<QueryError[], ResourceDetailDTO>> {
    // ==================== Шаг 1: Валидация параметров ====================
    
    const resourceIdResult = ResourceId.create(query.resourceId)
    
    if (resourceIdResult.isLeft()) {
      return invalid([resourceIdResult.value])
    }
    
    const resourceId = resourceIdResult.value
    
    // ==================== Шаг 2: Поиск ====================
    
    try {
      const resource = await this.repository.findById(resourceId)
      
      if (!resource) {
        return invalid([
          new NotFoundError(
            'Resource',
            `Resource with id "${query.resourceId}" not found`
          )
        ])
      }
      
      // ==================== Шаг 3: Domain → DTO ====================
      
      const dto: ResourceDetailDTO = {
        id: resource.getId().getValue(),
        namespace: resource.getNamespace().getValue(),
        name: resource.getName().getValue(),
        createdAt: resource.getCreatedAt().toISOString(),
        updatedAt: resource.getUpdatedAt().toISOString()
      }
      
      return valid(dto)
    } catch (error) {
      return invalid([
        new QueryError(
          'GetResourceByIdQuery',
          `Failed to fetch resource: ${error.message}`
        )
      ])
    }
  }
}
```

---

### Пример 2: GetResourceByNamespaceAndNameQuery

#### Query [#class:GetResourceByNamespaceAndNameQuery|#code|#structure:path]

```typescript
// src/application/queries/GetResourceByNamespaceAndNameQuery.ts
export class GetResourceByNamespaceAndNameQuery {
  constructor(
    public readonly namespace: string,
    public readonly name: string
  ) {}
}
```

#### Handler [#class:GetResourceByNamespaceAndNameQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/GetResourceByNamespaceAndNameQueryHandler.ts
import { Validation, ValidationCombinators, valid, invalid } from '@/shared/validation'
import { IQueryHandler } from '../IQueryHandler'
import { GetResourceByNamespaceAndNameQuery } from '../GetResourceByNamespaceAndNameQuery'
import { IResourceRepository } from '@/domain/resource/repositories/IResourceRepository'
import { ResourceDetailDTO } from '../dtos/ResourceDetailDTO'
import { Namespace } from '@/domain/resource/value-objects/Namespace'
import { ResourceName } from '@/domain/resource/value-objects/ResourceName'
import { 
  InvariantViolationError,
  NotFoundError,
  QueryError 
} from '@/domain/shared/errors'

export class GetResourceByNamespaceAndNameQueryHandler 
  implements IQueryHandler<GetResourceByNamespaceAndNameQuery, ResourceDetailDTO> {
  
  constructor(
    private readonly repository: IResourceRepository
  ) {}
  
  async handle(
    query: GetResourceByNamespaceAndNameQuery
  ): Promise<Validation<QueryError[], ResourceDetailDTO>> {
    // ==================== Шаг 1: Валидация параметров ====================
    
    const namespaceVO = Namespace.create(query.namespace)
    const nameVO = ResourceName.create(query.name)
    
    // Комбинируем валидацию с накоплением ошибок
    const validationResult = ValidationCombinators.sequence(
      [namespaceVO, nameVO],
      ([ns, nm]) => ({ namespace: ns, name: nm })
    )
    
    if (validationResult.isLeft()) {
      return validationResult as Validation<QueryError[], ResourceDetailDTO>
    }
    
    const { namespace, name } = validationResult.value
    
    // ==================== Шаг 2: Поиск ====================
    
    try {
      const resource = await this.repository.findByNamespaceAndName(
        namespace.getValue(),
        name.getValue()
      )
      
      if (!resource) {
        return invalid([
          new NotFoundError(
            'Resource',
            `Resource with namespace "${namespace.getValue()}" and name "${name.getValue()}" not found`
          )
        ])
      }
      
      // ==================== Шаг 3: Domain → DTO ====================
      
      const dto: ResourceDetailDTO = {
        id: resource.getId().getValue(),
        namespace: resource.getNamespace().getValue(),
        name: resource.getName().getValue(),
        createdAt: resource.getCreatedAt().toISOString(),
        updatedAt: resource.getUpdatedAt().toISOString()
      }
      
      return valid(dto)
    } catch (error) {
      return invalid([
        new QueryError(
          'GetResourceByNamespaceAndNameQuery',
          `Failed to fetch resource: ${error.message}`
        )
      ])
    }
  }
}
```

**Ключевые моменты:**

1. **Валидация ВСЕХ параметров** - используем ValidationCombinators
2. **Накопление ошибок** - пользователь видит все проблемы сразу
3. **Преобразование Domain → DTO** - простые примитивы для UI
4. **Try-catch** - обработка инфраструктурных ошибок

---

## 📊 Сравнение Domain vs Application Validation

| Критерий | Domain Layer | Application Layer |
|----------|--------------|-------------------|
| **Что проверяет** | Инварианты VO, правила Aggregate | Уникальность, существование, координация |
| **Когда** | При создании/изменении объектов | Перед вызовом Domain методов |
| **Доступ к БД** | ❌ Нет | ✅ Да (через Repository) |
| **Зависимости** | Только Domain | Domain + Infrastructure |
| **Примеры** | UUID формат, длина строки, максимум полей | Namespace уже существует, Resource не найден |

---

## ✅ Best Practices

### 1. Всегда валидируйте на обоих уровнях

```typescript
// ❌ НЕПРАВИЛЬНО - пропущена Application валидация
async handle(command: CreateResourceCommand) {
  const resource = Resource.create(...)  // Только Domain валидация
  await this.repository.save(resource)
}

// ✅ ПРАВИЛЬНО
async handle(command: CreateResourceCommand) {
  // Application валидация
  const existing = await this.repository.findByNamespaceAndName(...)
  if (existing) return invalid([...])
  
  // Domain валидация
  const resource = Resource.create(...)
  if (resource.isLeft()) return resource
  
  await this.repository.save(resource.value)
}
```

### 2. Используйте ValidationCombinators для множественных проверок

```typescript
// ✅ ПРАВИЛЬНО - накопление ошибок
const validationResult = ValidationCombinators.sequence(
  [namespaceVO, nameVO, descriptionVO],
  ([ns, nm, desc]) => ({ namespace: ns, name: nm, description: desc })
)
```

### 3. Раннее возвращение при ошибках

```typescript
// ✅ ПРАВИЛЬНО
if (validationResult.isLeft()) {
  return validationResult  // Не продолжаем если есть ошибки
}

// Работаем с валидными данными
const { namespace, name } = validationResult.value
```

### 4. Try-catch только для инфраструктурных ошибок

```typescript
// ✅ ПРАВИЛЬНО
try {
  await this.repository.save(resource)
  return valid(resource.getId().getValue())
} catch (error) {
  // Обрабатываем только неожиданные ошибки
  return invalid([new ApplicationError(...)])
}
```

---

## 📖 Связанные документы

- [VALIDATION_COMBINATORS.md](./error-handling/VALIDATION_COMBINATORS.md) - ValidationCombinators с mergeInMany
- [SPECIFICATION_VALIDATION.md](./error-handling/SPECIFICATION_VALIDATION.md) - Specification Pattern
- [COMMAND_BUS.md](./COMMAND_BUS.md) - Command Bus и CQRS
- [QUERY_HANDLERS.md](./QUERY_HANDLERS.md) - Query Handlers
- [TYPES_AND_ENTITIES.md](./TYPES_AND_ENTITIES.md) - Value Objects, Entities, Aggregates

---

**Дата создания:** 2025-01-22  
**Статус:** ✅ Production ready
