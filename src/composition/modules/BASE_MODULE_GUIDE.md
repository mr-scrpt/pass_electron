# BaseModule - Унификация структуры модулей

## 🎯 **Проблема**

До BaseModule каждый модуль реализовывал свою логику инициализации и проверки:

```typescript
// ❌ Дублирование логики в каждом модуле
export class ResourceModule {
  private static repository: IResourceRepository | null = null
  private static logger: ILogger | null = null

  static initialize(config: {...}): void {
    this.repository = config.repository
    this.logger = config.logger
  }

  private static checkInitialization(): Validation<IError[], {...}> {
    return isTrue(
      this.repository !== null && this.logger !== null,
      { repository: this.repository!, logger: this.logger! }
    )
      .valid()
      .invalid([...])
  }
}

export class SystemModule {
  private static logger: ILogger | null = null

  static initialize(config: {...}): void {
    this.logger = config.logger
  }

  private static checkInitialization(): Validation<IError[], {...}> {
    return isTrue(
      this.logger !== null,
      this.logger!
    )
      .valid()
      .invalid([...])
  }
}
```

**Проблемы:**
- ❌ Дублирование кода `checkInitialization` в каждом модуле
- ❌ Нет единого интерфейса для модулей
- ❌ Static методы - нельзя использовать abstract class
- ❌ Сложно тестировать (нужно reset статики)
- ❌ Нет type-safety для структуры модуля

---

## ✅ **Решение: BaseModule**

Абстрактный класс с общей логикой инициализации и проверки:

```typescript
export abstract class BaseModule<TConfig, TDeps> {
  protected dependencies: TDeps | null = null

  initialize(config: TConfig): void {
    this.dependencies = this.buildDependencies(config)
  }

  protected abstract buildDependencies(config: TConfig): TDeps

  protected checkInitialization(): Validation<IError[], TDeps> {
    return isTrue(
      this.dependencies !== null,
      this.dependencies!
    )
      .valid()
      .invalid([
        new InfrastructureError(
          this.constructor.name,
          'Module not initialized. Call initialize() first.'
        )
      ])
  }

  abstract registerQueryHandlers(queryBus: IQueryBus): void
  abstract registerCommandHandlers(commandBus: ICommandBus): void

  reset(): void {
    this.dependencies = null
  }
}
```

---

## 📋 **Структура модуля**

### **1. Generic параметры:**

```typescript
BaseModule<TConfig, TDeps>
```

- **TConfig** - тип конфигурации при инициализации
- **TDeps** - тип зависимостей после инициализации

**Пример:**
```typescript
export class ResourceModule extends BaseModule<
  { repository: IResourceRepository; logger: ILogger },  // TConfig
  { repository: IResourceRepository; logger: ILogger }   // TDeps
> {
  // ...
}
```

### **2. Обязательные методы:**

#### **buildDependencies(config: TConfig): TDeps**
Преобразование конфигурации в зависимости.

```typescript
// Простой случай - config === deps
protected buildDependencies(config: {
  repository: IResourceRepository
  logger: ILogger
}): { repository: IResourceRepository; logger: ILogger } {
  return config
}

// Сложный случай - создание дополнительных зависимостей
protected buildDependencies(config: {
  apiKey: string
  baseUrl: string
}): { httpClient: HttpClient; cache: ICache } {
  return {
    httpClient: new HttpClient(config.baseUrl, config.apiKey),
    cache: new InMemoryCache()
  }
}
```

#### **registerQueryHandlers(queryBus: IQueryBus): void**
Регистрация Query handlers.

```typescript
registerQueryHandlers(queryBus: IQueryBus): void {
  queryBus.register<ListResourcesQuery, ResourceListItemDTO[]>(
    'ListResourcesQuery',
    async (query) => {
      return this.checkInitialization().asyncChain(
        async ({ repository, logger }) => {
          const handler = new ListResourcesQueryHandler(repository, logger)
          return handler.handle(query)
        }
      )
    }
  )
}
```

#### **registerCommandHandlers(commandBus: ICommandBus): void**
Регистрация Command handlers.

```typescript
registerCommandHandlers(commandBus: ICommandBus): void {
  commandBus.register<CreateResourceCommand>(
    'CreateResourceCommand',
    async (command) => {
      return this.checkInitialization().asyncChain(
        async ({ repository, logger }) => {
          const handler = new CreateResourceCommandHandler(repository, logger)
          return handler.handle(command)
        }
      )
    }
  )
}
```

---

## 🔧 **Создание нового модуля**

### **Шаг 1: Определить TConfig и TDeps**

```typescript
// TConfig - что получаем при инициализации
type UserModuleConfig = {
  repository: IUserRepository
  logger: ILogger
  emailService: IEmailService
}

// TDeps - что нужно handlers
type UserModuleDeps = {
  repository: IUserRepository
  logger: ILogger
  emailService: IEmailService
}
```

### **Шаг 2: Создать класс модуля**

```typescript
// src/composition/modules/UserModule.ts
import { BaseModule } from './BaseModule'
import type { IUserRepository } from '@/domain'
import type { ILogger } from '@/application/ports'
import type { IEmailService } from '@/infrastructure/email'
import type { IQueryBus } from '@/application/queries/IQueryBus'
import type { ICommandBus } from '@/application/commands/ICommandBus'

export class UserModule extends BaseModule<
  UserModuleConfig,
  UserModuleDeps
> {
  protected buildDependencies(config: UserModuleConfig): UserModuleDeps {
    return config  // Простой случай - config === deps
  }

  registerQueryHandlers(queryBus: IQueryBus): void {
    queryBus.register<ListUsersQuery, UserListItemDTO[]>(
      'ListUsersQuery',
      async (query) => {
        return this.checkInitialization().asyncChain(
          async ({ repository, logger }) => {
            const handler = new ListUsersQueryHandler(repository, logger)
            return handler.handle(query)
          }
        )
      }
    )
  }

  registerCommandHandlers(commandBus: ICommandBus): void {
    commandBus.register<CreateUserCommand>(
      'CreateUserCommand',
      async (command) => {
        return this.checkInitialization().asyncChain(
          async ({ repository, logger, emailService }) => {
            const handler = new CreateUserCommandHandler(
              repository,
              logger,
              emailService
            )
            return handler.handle(command)
          }
        )
      }
    )
  }
}
```

### **Шаг 3: Добавить в ServiceContainer**

```typescript
// src/composition/ServiceContainer.ts
export class ServiceContainer {
  private static resourceModule = new ResourceModule()
  private static systemModule = new SystemModule()
  private static userModule = new UserModule()  // 🆕

  static initialize(config: {
    repository: IResourceRepository
    userRepository: IUserRepository  // 🆕
    logger: ILogger
    emailService: IEmailService  // 🆕
  }): void {
    // ...
    
    this.userModule.initialize({  // 🆕
      repository: config.userRepository,
      logger: config.logger,
      emailService: config.emailService
    })

    // Register handlers
    this.userModule.registerQueryHandlers(queryBus)  // 🆕
    this.userModule.registerCommandHandlers(commandBus)  // 🆕
  }
}
```

---

## 💡 **Преимущества**

### **1. Type Safety**
```typescript
// ✅ TypeScript проверяет что модуль реализует все методы
export class UserModule extends BaseModule<Config, Deps> {
  // Ошибка если не реализовать:
  // - buildDependencies
  // - registerQueryHandlers
  // - registerCommandHandlers
}
```

### **2. DRY - общая логика**
```typescript
// ✅ checkInitialization реализован один раз в BaseModule
this.checkInitialization().asyncChain(...)

// ❌ Без BaseModule - дублирование в каждом модуле
```

### **3. Тестируемость**
```typescript
// ✅ Легко mock инстанс
const mockUserModule = new UserModule()
mockUserModule.initialize({
  repository: mockRepository,
  logger: mockLogger,
  emailService: mockEmailService
})

// ❌ Static - сложно тестировать
```

### **4. Единый интерфейс**
```typescript
// ✅ Все модули имеют одинаковую структуру
interface IModule {
  initialize(config: unknown): void
  registerQueryHandlers(queryBus: IQueryBus): void
  registerCommandHandlers(commandBus: ICommandBus): void
  reset(): void
}
```

---

## 📊 **Паттерны использования**

### **Паттерн 1: Простой модуль (config === deps)**

```typescript
export class ResourceModule extends BaseModule<
  { repository: IResourceRepository; logger: ILogger },
  { repository: IResourceRepository; logger: ILogger }
> {
  protected buildDependencies(config) {
    return config  // Просто возвращаем config
  }
}
```

### **Паттерн 2: Создание дополнительных зависимостей**

```typescript
export class ApiModule extends BaseModule<
  { apiKey: string; baseUrl: string; logger: ILogger },
  { httpClient: HttpClient; logger: ILogger }
> {
  protected buildDependencies(config) {
    return {
      httpClient: new HttpClient(config.baseUrl, config.apiKey),
      logger: config.logger
    }
  }
}
```

### **Паттерн 3: Модуль без handlers**

```typescript
export class SystemModule extends BaseModule<
  { logger: ILogger },
  { logger: ILogger }
> {
  protected buildDependencies(config) {
    return config
  }

  // Нет Query handlers
  registerQueryHandlers(_queryBus: IQueryBus): void {
    // No query handlers in SystemModule
  }

  // Нет Command handlers
  registerCommandHandlers(_commandBus: ICommandBus): void {
    // No command handlers in SystemModule
  }

  // Дополнительный метод для получения Logger
  getLogger(): Validation<IError[], ILogger> {
    return this.checkInitialization().map(({ logger }) => logger)
  }
}
```

---

## 🎯 **Лучшие практики**

### **1. TConfig === TDeps когда возможно**
```typescript
// ✅ Простой случай
export class SimpleModule extends BaseModule<
  { service: IService },
  { service: IService }
> {
  protected buildDependencies(config) {
    return config
  }
}
```

### **2. Используйте checkInitialization в handlers**
```typescript
// ✅ Монадический подход
registerQueryHandlers(queryBus: IQueryBus): void {
  queryBus.register<MyQuery, MyResult>(
    'MyQuery',
    async (query) => {
      return this.checkInitialization().asyncChain(
        async (deps) => {
          const handler = new MyQueryHandler(deps)
          return handler.handle(query)
        }
      )
    }
  )
}
```

### **3. Generic типы для type-safety**
```typescript
// ✅ Используйте generics в register
queryBus.register<ListUsersQuery, UserListItemDTO[]>(
  'ListUsersQuery',
  async (query) => {
    // TypeScript знает типы!
    return this.checkInitialization().asyncChain(...)
  }
)
```

---

## 🔗 **См. также**

- **[ResourceModule.ts](./ResourceModule.ts)** - пример простого модуля
- **[SystemModule.ts](./SystemModule.ts)** - пример модуля без handlers
- **[ServiceContainer.ts](../ServiceContainer.ts)** - использование модулей
- **[MONADIC_APPROACH.md](../examples/MONADIC_APPROACH.md)** - монадический подход

---

**Дата создания:** 2025-01-26  
**Версия:** 1.0 (BaseModule pattern)
