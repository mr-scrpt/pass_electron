# План обновления: Aggregates, Entities и Application Layer Validation

**Дата:** 2025-01-22  
**Статус:** Планирование

---

## 🎯 Цели

### 1. Aggregates и Entities
- ✅ Привести к единому стилю с Validation API
- ✅ Использовать ValidationCombinators для бизнес-правил
- ✅ Показать правильную работу с доменными событиями

### 2. Application Layer Validation
- ✅ Валидация на уровне Commands/Queries
- ✅ Проверка уникальности (через Repository)
- ✅ Бизнес-правила уровня приложения
- ✅ Координация между Aggregates

---

## 📋 Часть 1: Aggregates и Entities

### Проблемы в текущей документации

#### 1. Step 1 - упрощенный Resource
**Файл:** `steps/step_1/README.md` (строка 537)

**Текущий код:**
```typescript
export class Resource {
  constructor(
    public readonly id: ResourceId,
    public readonly namespace: Namespace,
    public readonly name: ResourceName,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
```

**Проблемы:**
- ❌ Нет методов создания с валидацией
- ❌ Нет бизнес-методов
- ❌ Слишком упрощенно для production

---

### Решение: Production Aggregate Root

#### Resource Aggregate Root [#class:Resource|#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts
import { Validation, ValidationCombinators, valid, invalid } from '@/shared/validation'
import { ResourceId } from '../value-objects/ResourceId'
import { ResourceName } from '../value-objects/ResourceName'
import { Namespace } from '../value-objects/Namespace'
import { CustomField } from '../entities/CustomField'
import { FieldId } from '../value-objects/FieldId'
import { 
  InvariantViolationError,
  InvalidOperationError,
  DuplicateError 
} from '@/domain/shared/errors'

/**
 * Resource Aggregate Root
 * 
 * Aggregate Root - это точка входа для работы с группой связанных объектов.
 * Гарантирует консистентность данных и инкапсулирует бизнес-логику.
 * 
 * Правила Aggregate:
 * 1. Внешний мир работает ТОЛЬКО через Aggregate Root
 * 2. Entities внутри Aggregate недоступны напрямую
 * 3. Все изменения через методы Aggregate Root
 * 4. Aggregate гарантирует инварианты
 */
export class Resource {
  private _customFields: CustomField[] = []
  
  private constructor(
    private readonly _id: ResourceId,
    private _namespace: Namespace,
    private _name: ResourceName,
    private _secret: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}
  
  // ==================== Factory Methods ====================
  
  /**
   * Создать новый Resource
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
   * Восстановить Resource из хранилища
   * Используется Repository для гидратации
   */
  static reconstitute(
    id: ResourceId,
    namespace: Namespace,
    name: ResourceName,
    secret: string,
    customFields: CustomField[],
    createdAt: Date,
    updatedAt: Date
  ): Resource {
    const resource = new Resource(id, namespace, name, secret, createdAt, updatedAt)
    resource._customFields = customFields
    return resource
  }
  
  // ==================== Business Methods ====================
  
  /**
   * Добавить кастомное поле
   * Бизнес-правила:
   * - Максимум 20 полей
   * - Уникальные метки (labels)
   */
  addCustomField(
    label: string,
    value: string
  ): Validation<InvariantViolationError, CustomField> {
    // Инвариант: не более 20 полей
    if (this._customFields.length >= 20) {
      return invalid(new InvalidOperationError(
        'Resource',
        'Cannot add more than 20 custom fields'
      ))
    }
    
    // Инвариант: уникальные метки
    if (this._customFields.some(f => f.getLabel() === label)) {
      return invalid(new DuplicateError(
        'CustomField',
        `Field with label "${label}" already exists`
      ))
    }
    
    // Создаем Entity
    const fieldId = FieldId.generate()
    const field = new CustomField(fieldId, label, value, false)
    
    this._customFields.push(field)
    this._updatedAt = new Date()
    
    return valid(field)
  }
  
  /**
   * Обновить кастомное поле
   */
  updateCustomField(
    fieldId: FieldId,
    newValue: string
  ): Validation<InvariantViolationError, void> {
    const field = this._customFields.find(f => f.getId().equals(fieldId))
    
    if (!field) {
      return invalid(new InvalidOperationError(
        'Resource',
        `Field with id "${fieldId.getValue()}" not found`
      ))
    }
    
    field.updateValue(newValue)
    this._updatedAt = new Date()
    
    return valid(undefined)
  }
  
  /**
   * Удалить кастомное поле
   */
  removeCustomField(fieldId: FieldId): Validation<InvariantViolationError, void> {
    const index = this._customFields.findIndex(f => f.getId().equals(fieldId))
    
    if (index === -1) {
      return invalid(new InvalidOperationError(
        'Resource',
        `Field with id "${fieldId.getValue()}" not found`
      ))
    }
    
    this._customFields.splice(index, 1)
    this._updatedAt = new Date()
    
    return valid(undefined)
  }
  
  /**
   * Обновить имя ресурса
   */
  updateName(newName: string): Validation<InvariantViolationError[], void> {
    return ResourceName.create(newName).map(nameVO => {
      this._name = nameVO
      this._updatedAt = new Date()
      return undefined
    })
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
  
  getCustomFields(): readonly CustomField[] {
    return Object.freeze([...this._customFields])
  }
  
  getCreatedAt(): Date {
    return this._createdAt
  }
  
  getUpdatedAt(): Date {
    return this._updatedAt
  }
  
  // ==================== Domain Logic ====================
  
  /**
   * Проверить, содержит ли ресурс поле с указанной меткой
   */
  hasFieldWithLabel(label: string): boolean {
    return this._customFields.some(f => f.getLabel() === label)
  }
  
  /**
   * Получить количество кастомных полей
   */
  getFieldsCount(): number {
    return this._customFields.length
  }
}
```

---

### CustomField Entity

#### CustomField Entity [#class:CustomField|#code|#structure:path]

```typescript
// src/domain/resource/entities/CustomField.ts
import { FieldId } from '../value-objects/FieldId'

/**
 * CustomField Entity
 * 
 * Entity - это объект с идентичностью, который может изменяться.
 * В отличие от Value Object, Entity определяется ID, а не значением.
 * 
 * CustomField - это Entity внутри Resource Aggregate.
 * Доступ к CustomField ТОЛЬКО через Resource Aggregate Root.
 */
export class CustomField {
  constructor(
    private readonly _id: FieldId,
    private readonly _label: string,
    private _value: string,
    private _isHidden: boolean
  ) {}
  
  // ==================== Business Methods ====================
  
  /**
   * Обновить значение поля
   */
  updateValue(newValue: string): void {
    this._value = newValue
  }
  
  /**
   * Переключить видимость поля
   */
  toggleVisibility(): void {
    this._isHidden = !this._isHidden
  }
  
  /**
   * Скрыть поле
   */
  hide(): void {
    this._isHidden = true
  }
  
  /**
   * Показать поле
   */
  show(): void {
    this._isHidden = false
  }
  
  // ==================== Getters ====================
  
  getId(): FieldId {
    return this._id
  }
  
  getLabel(): string {
    return this._label
  }
  
  getValue(): string {
    return this._value
  }
  
  isHidden(): boolean {
    return this._isHidden
  }
  
  // ==================== Equality ====================
  
  /**
   * Entity сравнивается по ID, а не по значению
   */
  equals(other: CustomField): boolean {
    return this._id.equals(other._id)
  }
}
```

---

## 📋 Часть 2: Application Layer Validation

### Концепция

**Domain Layer валидация:**
- ✅ Инварианты Value Objects (формат, длина, паттерн)
- ✅ Бизнес-правила внутри Aggregate (максимум полей, уникальность меток)

**Application Layer валидация:**
- ✅ Проверка уникальности через Repository (namespace уже существует?)
- ✅ Проверка существования связанных объектов
- ✅ Координация между Aggregates
- ✅ Бизнес-правила уровня приложения

---

### Command Validation

#### CreateResourceCommand Handler [#class:CreateResourceCommandHandler|#code|#structure:path]

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

/**
 * Handler для создания ресурса
 * 
 * Ответственность:
 * 1. Валидация команды (Application Layer)
 * 2. Проверка уникальности (через Repository)
 * 3. Создание Aggregate (Domain Layer)
 * 4. Сохранение через Repository
 */
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
      return resourceResult as Validation<ApplicationError[], string>
    }
    
    // ==================== Шаг 3: Persistence ====================
    
    const resource = resourceResult.value
    
    try {
      await this.repository.save(resource)
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

---

### Query Validation

#### GetResourceByNamespaceAndNameQuery Handler [#class:GetResourceByNamespaceAndNameQueryHandler|#code|#structure:path]

```typescript
// src/application/queries/handlers/GetResourceByNamespaceAndNameQueryHandler.ts
import { Validation, ValidationCombinators, valid, invalid } from '@/shared/validation'
import { IQueryHandler } from '../IQueryHandler'
import { GetResourceByNamespaceAndNameQuery } from '../GetResourceByNamespaceAndNameQuery'
import { IResourceRepository } from '@/domain/resource/repositories/IResourceRepository'
import { ResourceDetailDTO } from '../dtos/ResourceDetailDTO'
import { 
  InvariantViolationError,
  NotFoundError,
  QueryError 
} from '@/domain/shared/errors'
import { Namespace } from '@/domain/resource/value-objects/Namespace'
import { ResourceName } from '@/domain/resource/value-objects/ResourceName'

/**
 * Handler для получения ресурса по namespace и name
 * 
 * Ответственность:
 * 1. Валидация параметров запроса (Application Layer)
 * 2. Поиск через Repository
 * 3. Преобразование Domain → DTO
 */
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
    
    // Комбинируем валидацию
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
        customFields: resource.getCustomFields().map(field => ({
          id: field.getId().getValue(),
          label: field.getLabel(),
          value: field.getValue(),
          isHidden: field.isHidden()
        })),
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

---

## 📊 Структура обновления

### Файлы для обновления:

#### 1. Step 1
- [ ] `steps/step_1/README.md`
  - Обновить Resource Aggregate
  - Добавить CustomField Entity
  - Показать бизнес-методы

#### 2. Документация
- [ ] `docs/TYPES_AND_ENTITIES.md`
  - Обновить примеры Aggregate
  - Добавить примеры Entity
  - Показать разницу между Aggregate и Entity

- [ ] `docs/DDD_AND_CLEAN_ARCHITECTURE.md`
  - Обновить примеры Resource
  - Показать правила Aggregate

#### 3. Application Layer (новая документация)
- [ ] Создать `docs/APPLICATION_LAYER_VALIDATION.md`
  - Концепция двухуровневой валидации
  - Domain vs Application валидация
  - Примеры Command Handlers
  - Примеры Query Handlers
  - Проверка уникальности
  - Координация между Aggregates

---

## 🎯 Ключевые концепции

### 1. Двухуровневая валидация

```
┌─────────────────────────────────────────────────────┐
│  Application Layer Validation                        │
│  - Проверка уникальности (через Repository)         │
│  - Проверка существования связанных объектов        │
│  - Бизнес-правила уровня приложения                 │
└────────────────────┬────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────┐
│  Domain Layer Validation                             │
│  - Инварианты Value Objects                         │
│  - Бизнес-правила внутри Aggregate                  │
│  - Консистентность данных                           │
└─────────────────────────────────────────────────────┘
```

### 2. Aggregate Rules

1. **Внешний мир работает ТОЛЬКО через Aggregate Root**
2. **Entities внутри Aggregate недоступны напрямую**
3. **Все изменения через методы Aggregate Root**
4. **Aggregate гарантирует инварианты**

### 3. Entity vs Value Object

| Критерий | Value Object | Entity |
|----------|--------------|--------|
| Идентичность | ❌ Нет | ✅ Есть (ID) |
| Изменяемость | ❌ Immutable | ✅ Mutable |
| Сравнение | По значению | По ID |
| Пример | ResourceName | CustomField |

---

## ✅ Следующие шаги

1. Обновить Step 1 с полным Resource Aggregate
2. Добавить CustomField Entity
3. Обновить документацию
4. Создать APPLICATION_LAYER_VALIDATION.md
5. Добавить примеры Command/Query Handlers
6. Коммит и пуш

**Готов начать?** 🚀
