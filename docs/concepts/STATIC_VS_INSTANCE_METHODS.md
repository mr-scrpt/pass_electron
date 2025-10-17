# Static vs Instance Methods - Образовательная справка

Документ объясняет, когда использовать статические методы, а когда обычные (instance) методы в классах.

---

## Основы

### Instance Methods (методы экземпляра)

```typescript
class UserService {
  constructor(private repository: IUserRepository) {}  // Получает зависимости

  // Instance method - работает с this
  async getUser(id: string): Promise<User> {
    return this.repository.findById(id)  // Использует this
  }
}

// Использование: нужно создать экземпляр
const repository = new MockUserRepository()
const service = new UserService(repository)  // new!
const user = await service.getUser('123')
```

### Static Methods (статические методы)

```typescript
class UserService {
  private static repository: IUserRepository = new MockUserRepository()

  // Static method - работает без this
  static async getUser(id: string): Promise<User> {
    return this.repository.findById(id)  // this = класс, не экземпляр
  }
}

// Использование: вызываем напрямую через класс
const user = await UserService.getUser('123')  // Без new!
```

---

## Когда использовать Static Methods

### ✅ 1. Singleton / Service Locator Pattern

**Использование:** Нужен единственный экземпляр класса во всем приложении.

```typescript
// app/composition/ServiceContainer.ts

class ServiceContainer {
  private static queryBus: IQueryBus | null = null  // Singleton

  // ✅ Static - создает и кэширует единственный экземпляр
  static getQueryBus(): IQueryBus {
    if (!this.queryBus) {
      this.queryBus = new InMemoryQueryBus()
    }
    return this.queryBus  // Всегда возвращает тот же объект
  }
}

// Везде получаем ОДИН И ТОТ ЖЕ QueryBus
const bus1 = ServiceContainer.getQueryBus()
const bus2 = ServiceContainer.getQueryBus()
console.log(bus1 === bus2)  // true ✅
```

**Почему static:**
- DI Container должен быть один на все приложение
- Не нужно создавать экземпляры ServiceContainer
- Глобальная точка доступа

### ✅ 2. Utility Functions (чистые функции)

**Использование:** Функции без состояния, только вычисления.

```typescript
// app/domain/value-objects/ResourceId.ts

class ResourceId {
  private constructor(private readonly value: string) {}

  // ✅ Static - фабричный метод (чистая функция)
  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID())
  }

  // ✅ Static - валидация (чистая функция)
  static isValid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }

  // ✅ Static - парсинг (фабричный метод)
  static fromString(value: string): ResourceId {
    if (!this.isValid(value)) {
      throw new Error('Invalid UUID')
    }
    return new ResourceId(value)
  }
}

// Использование без создания экземпляра
const id = ResourceId.generate()  // Без new ResourceId()!
const isValid = ResourceId.isValid('some-id')
```

**Почему static:**
- Не зависят от состояния экземпляра
- Логически принадлежат классу, а не объекту
- Удобно группировать связанные функции

### ✅ 3. Factory Methods / Named Constructors

**Использование:** Альтернативные способы создания объектов.

```typescript
// app/domain/value-objects/ResourceName.ts

class ResourceName {
  private constructor(private readonly value: string) {
    this.validate(value)
  }

  // ✅ Static - фабричный метод
  static create(value: string): ResourceName {
    return new ResourceName(value)
  }

  // ✅ Static - альтернативный конструктор
  static fromSlug(slug: string): ResourceName {
    const normalized = slug.replace(/-/g, '_').toUpperCase()
    return new ResourceName(normalized)
  }

  // ✅ Static - пустое значение
  static empty(): ResourceName {
    return new ResourceName('')
  }

  private validate(value: string): void {
    if (value.length > 255) throw new Error('Too long')
  }
}

// Использование
const name1 = ResourceName.create('my-resource')
const name2 = ResourceName.fromSlug('my-resource-slug')
const name3 = ResourceName.empty()
```

**Почему static:**
- Приватный конструктор (контроль создания)
- Семантические имена методов создания
- Value Object паттерн (DDD)

### ✅ 4. DI Module Pattern (наш случай)

**Использование:** Модули для управления зависимостями.

```typescript
// app/composition/modules/ResourceModule.ts

class ResourceModule {
  private static repository: IResourceRepository | null = null
  private static service: ResourceService | null = null

  // ✅ Static - создает и кэширует зависимости (Singleton)
  static getService(): ResourceService {
    if (!this.service) {
      this.service = new ResourceService(this.getRepository())
    }
    return this.service
  }

  static getRepository(): IResourceRepository {
    if (!this.repository) {
      this.repository = new MockResourceRepository()
    }
    return this.repository
  }

  // ✅ Static - регистрация handlers
  static registerQueryHandlers(bus: IQueryBus): void {
    const service = this.getService()
    bus.register('ListResourcesQuery', new ListResourcesQueryHandler(service))
  }
}

// Использование - без создания экземпляра Module
const service = ResourceModule.getService()
ResourceModule.registerQueryHandlers(bus)
```

**Почему static:**
- Module сам по себе не несет состояние (только координирует)
- Нужен единственный набор зависимостей для Resource
- Удобная группировка связанных методов
- Не нужно создавать экземпляры Module

---

## Когда использовать Instance Methods

### ✅ 1. Объект с состоянием

**Использование:** Класс хранит данные, методы работают с этими данными.

```typescript
// app/domain/entities/Resource.ts

class Resource {
  constructor(
    private readonly _id: ResourceId,
    private _name: ResourceName,       // Состояние!
    private _namespace: Namespace      // Состояние!
  ) {}

  // ❌ НЕ static - работает с состоянием this
  rename(newName: ResourceName): void {
    this.ensureNotLocked()  // Читает this._metadata
    this._name = newName    // Меняет this._name
  }

  // ❌ НЕ static - читает состояние
  get name(): ResourceName {
    return this._name  // Возвращает this._name
  }

  // ❌ НЕ static - проверяет состояние
  private ensureNotLocked(): void {
    if (this._metadata.isLocked) {  // Читает this
      throw new Error('Locked')
    }
  }
}

// Использование - создаем экземпляры с разным состоянием
const resource1 = new Resource(id1, name1, namespace1)
const resource2 = new Resource(id2, name2, namespace2)

resource1.rename(newName)  // Меняет resource1, не влияет на resource2
```

**Почему НЕ static:**
- Каждый Resource имеет свои данные
- Методы работают с конкретным экземпляром
- Инкапсуляция состояния

### ✅ 2. Dependency Injection (внедрение зависимостей)

**Использование:** Класс зависит от внешних сервисов/репозиториев.

```typescript
// app/application/services/ResourceService.ts

class ResourceService {
  // ❌ НЕ static поля - зависимости инжектятся через конструктор
  constructor(
    private readonly repository: IResourceRepository,
    private readonly domainService: ResourceDuplicationService
  ) {}

  // ❌ НЕ static - использует инжектированные зависимости
  async listResources(): Promise<Resource[]> {
    return this.repository.findAll()  // Использует this.repository
  }

  async duplicateResource(id: ResourceId): Promise<Resource> {
    const source = await this.repository.findById(id)
    return this.domainService.duplicate(source)  // Использует this.domainService
  }
}

// Использование - создаем с разными реализациями
const mockRepo = new MockResourceRepository()
const apiRepo = new ApiResourceRepository()

const service1 = new ResourceService(mockRepo, domainService)    // Для тестов
const service2 = new ResourceService(apiRepo, domainService)     // Для production
```

**Почему НЕ static:**
- Зависимости меняются (Mock vs Real API)
- Тестируемость (легко мокать)
- Инверсия зависимостей (DIP)
- Можно создать несколько экземпляров с разными зависимостями

### ✅ 3. Query/Command Handlers

**Использование:** Handlers зависят от сервисов.

```typescript
// app/application/queries/handlers/ListResourcesQueryHandler.ts

class ListResourcesQueryHandler implements IQueryHandler {
  // ❌ НЕ static - зависимость через конструктор
  constructor(private readonly service: ResourceService) {}

  // ❌ НЕ static - использует this.service
  async handle(query: ListResourcesQuery): Promise<QueryResult> {
    const resources = await this.service.listResources()  // this.service
    return { data: resources.map(this.toDTO) }
  }

  private toDTO(resource: Resource): ResourceDTO {
    return { id: resource.id.getValue(), name: resource.name.getValue() }
  }
}

// Использование - создаем с разными сервисами
const handler1 = new ListResourcesQueryHandler(mockService)
const handler2 = new ListResourcesQueryHandler(realService)
```

**Почему НЕ static:**
- Зависит от ResourceService
- Нужна гибкость (разные реализации сервиса)
- Тестируемость

---

## Сравнение на примере

### ❌ ПЛОХО: Static где не нужно

```typescript
// Антипаттерн: ResourceService как static
class ResourceService {
  private static repository: IResourceRepository = new MockResourceRepository()

  static async listResources(): Promise<Resource[]> {
    return this.repository.findAll()
  }
}

// Проблемы:
// 1. Нельзя заменить Repository (жестко зашит Mock)
// 2. Сложно тестировать (нельзя подставить Mock)
// 3. Нарушает DIP (зависит от конкретной реализации)
// 4. Глобальное состояние (проблемы в тестах)
```

### ✅ ХОРОШО: Instance с DI

```typescript
// ✅ ResourceService как instance
class ResourceService {
  constructor(private readonly repository: IResourceRepository) {}

  async listResources(): Promise<Resource[]> {
    return this.repository.findAll()
  }
}

// Преимущества:
// 1. Гибкость (любая реализация IResourceRepository)
// 2. Тестируемость (легко подставить Mock)
// 3. DIP (зависит от интерфейса)
// 4. Изолированность (каждый тест создает свой экземпляр)

// Использование
const mockRepo = new MockResourceRepository()
const service = new ResourceService(mockRepo)
```

---

## Правило большого пальца

### Используй Static когда:

1. **Singleton** - нужен один экземпляр на все приложение (ServiceContainer)
2. **Utility** - чистые функции без состояния (Math.max, Array.from)
3. **Factory** - фабричные методы создания (ResourceId.generate())
4. **Constants** - группировка констант (QueryTypes.RESOURCE.LIST)
5. **Namespacing** - логическая группировка функций

### Используй Instance когда:

1. **Состояние** - класс хранит данные (Entity, Value Object)
2. **DI** - зависимости инжектятся через конструктор (Service, Handler)
3. **Полиморфизм** - нужны разные реализации интерфейса
4. **Тестируемость** - нужно мокать зависимости
5. **По умолчанию** - если сомневаешься, используй instance

---

## В нашем проекте

### Static используем в:

| Класс | Почему Static |
|-------|---------------|
| `ServiceContainer` | Singleton DI Container - один на приложение |
| `ResourceModule` | Координатор зависимостей - не несет состояния, только группирует |
| `ResourceId.generate()` | Фабричный метод - чистая функция |
| `ResourceName.create()` | Named constructor - контролируем создание |
| `QueryTypes.RESOURCE.*` | Константы - группировка |
| `Environment.WEB` | Константы - группировка |

### Instance используем в:

| Класс | Почему Instance |
|-------|-----------------|
| `Resource` | Entity с состоянием |
| `ResourceName` | Value Object с состоянием |
| `ResourceService` | DI - зависит от Repository |
| `ListResourcesQueryHandler` | DI - зависит от Service |
| `WebRequestParser` | Реализация интерфейса - полиморфизм |
| `MockResourceRepository` | Реализация интерфейса - тестируемость |

---

## Важные моменты

### 1. Static = глобальное состояние

```typescript
// ⚠️ Static поля = глобальное состояние
class Counter {
  private static count = 0  // Общее для всех!

  static increment() {
    this.count++
  }
}

Counter.increment()  // count = 1
Counter.increment()  // count = 2

// Проблема в тестах:
test1() { Counter.increment(); expect(Counter.count).toBe(1) }  // ✅
test2() { Counter.increment(); expect(Counter.count).toBe(1) }  // ❌ count = 2!
```

**Решение:** Используй static только для Singleton-ов с методом reset().

### 2. Static нельзя наследовать полноценно

```typescript
abstract class BaseService {
  static getData() { ... }  // ❌ Static не полиморфен
}

class UserService extends BaseService {
  static getData() { ... }  // Переопределили, но не через super
}
```

**Решение:** Для полиморфизма используй instance methods.

### 3. Static сложнее мокать в тестах

```typescript
// ❌ Сложно мокать static
class UserService {
  static async getUser(id: string) { ... }
}

// Нельзя просто подставить mock
test('get user', async () => {
  // Как замокать UserService.getUser?
})
```

**Решение:** Используй instance + DI для лучшей тестируемости.

---

## Итог

- **Static** - для Singleton, Utility, Factory, Constants
- **Instance** - для состояния, DI, полиморфизма, по умолчанию
- **Наш проект:**
  - Static: ServiceContainer, Modules (координаторы), Factory methods, Constants
  - Instance: Entities, Services, Handlers, Repositories (бизнес-логика)

**Золотое правило:** Если сомневаешься - используй instance methods! Static только для специальных случаев.
