# Composition Layer с Query/Command Bus

## 🏗️ **Архитектура**

### **Структура:**
```
src/composition/
├── ServiceContainer.ts              # Root DI Container
├── modules/
│   ├── ResourceModule.ts            # Resource handlers registration
│   └── SystemModule.ts              # System services (Logger, etc.)
├── queries.ts                       # Query Facade
├── commands.ts                      # Command Facade
└── ConsoleLogger.ts                 # Simple logger implementation
```

### **Infrastructure:**
```
src/infrastructure/
├── queries/
│   └── InMemoryQueryBus.ts         # Query Bus implementation
└── commands/
    └── InMemoryCommandBus.ts       # Command Bus implementation
```

### **Application:**
```
src/application/
├── queries/
│   └── IQueryBus.ts                # Query Bus interface
└── commands/
    └── ICommandBus.ts              # Command Bus interface
```

---

## 🎯 **Компоненты**

### **1. Query/Command Bus**

**Query Bus:**
```typescript
interface IQueryBus {
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: (query: TQuery) => Promise<Validation<IError[], TResult>>
  ): void

  execute<TResult>(query: IQuery): Promise<Validation<IError[], TResult>>
}
```

**Command Bus:**
```typescript
interface ICommandBus {
  register<TCommand extends ICommand>(
    commandType: string,
    handler: (command: TCommand) => Promise<Validation<IError[], void>>
  ): void

  execute(command: ICommand): Promise<Validation<IError[], void>>
}
```

**Преимущества:**
- ✅ Динамическая регистрация handlers
- ✅ Готовность к middleware/interceptors
- ✅ Масштабируемость (легко добавлять модули)
- ✅ Тестируемость (mock bus)

---

### **2. Модули (Modules)**

Модули инкапсулируют DI для конкретных сущностей:

```typescript
export class ResourceModule {
  static initialize(config: {
    repository: IResourceRepository
    logger: ILogger
  }): void

  static registerQueryHandlers(queryBus: IQueryBus): void
  static registerCommandHandlers(commandBus: ICommandBus): void
  
  static reset(): void  // для тестов
}
```

**Преимущества:**
- ✅ Изоляция зависимостей по модулям
- ✅ Легко добавлять новые сущности
- ✅ Готовность к Multi-UI (Web/CLI/Desktop)

---

### **3. ServiceContainer**

Root DI Container - собирает все вместе:

```typescript
export class ServiceContainer {
  static initialize(config: {
    repository: IResourceRepository
    logger: ILogger
  }): void

  static getQueries(): QueryFacade
  static getCommands(): CommandFacade
  static getLogger(): ILogger
  
  static reset(): void  // для тестов
}
```

**Workflow:**
1. `initialize()` - инициализирует модули
2. Создает Query/Command Bus
3. Регистрирует handlers через модули
4. Создает Facades

---

### **4. Facades**

Unified API для Presentation Layer:

**QueryFacade:**
```typescript
export class QueryFacade {
  constructor(private readonly queryBus: IQueryBus) {}

  async list(): Promise<Validation<IError[], ResourceListItemDTO[]>> {
    const query: ListResourcesQuery = { type: 'ListResourcesQuery' }
    return this.queryBus.execute<ResourceListItemDTO[]>(query)
  }
}
```

**CommandFacade:**
```typescript
export class CommandFacade {
  constructor(private readonly commandBus: ICommandBus) {}

  async createResource(params: {
    namespace: string
    name: string
    secret: string
  }): Promise<Validation<IError[], void>> {
    const command = new CreateResourceCommand(...)
    return this.commandBus.execute(command)
  }
}
```

---

## 📝 **Использование**

### **1. Инициализация (entry point)**

```typescript
// src/presentation/web/react/src/entry.client.tsx
import { ServiceContainer } from '@/composition'
import { MockResourceRepository } from '@/infrastructure/repositories'
import { ConsoleLogger } from '@/composition/ConsoleLogger'

// Инициализируем контейнер ОДИН РАЗ
ServiceContainer.initialize({
  repository: new MockResourceRepository(),
  logger: new ConsoleLogger()
})
```

### **2. Использование в Routes (React Router)**

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { ServiceContainer } from '@/composition'

export async function loader() {
  const queries = ServiceContainer.getQueries()
  const result = await queries.list()
  
  return result
    .map((resources) => ({ resources }))
    .mapLeft((errors) => ({ errors }))
    .value
}
```

### **3. Использование в Actions**

```typescript
import { ServiceContainer } from '@/composition'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const commands = ServiceContainer.getCommands()
  
  const result = await commands.createResource({
    namespace: formData.get('namespace') as string,
    name: formData.get('name') as string,
    secret: formData.get('secret') as string
  })
  
  return result
    .map(() => redirect('/'))
    .mapLeft((errors) => ({ errors }))
    .value
}
```

---

## 🔄 **Добавление новой сущности**

### **Шаг 1: Создать модуль**

```typescript
// src/composition/modules/UserModule.ts
export class UserModule {
  private static repository: IUserRepository | null = null
  private static logger: ILogger | null = null

  static initialize(config: {...}): void {
    this.repository = config.repository
    this.logger = config.logger
  }

  static registerQueryHandlers(queryBus: IQueryBus): void {
    queryBus.register(
      'ListUsersQuery',
      async (query) => {
        const handler = new ListUsersQueryHandler(this.repository!, this.logger!)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        return handler.handle(query as any)
      }
    )
  }

  static registerCommandHandlers(commandBus: ICommandBus): void {
    commandBus.register(
      'CreateUserCommand',
      async (command) => {
        const handler = new CreateUserCommandHandler(this.repository!, this.logger!)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        return handler.handle(command as any)
      }
    )
  }
}
```

### **Шаг 2: Обновить ServiceContainer**

```typescript
// src/composition/ServiceContainer.ts
import { UserModule } from './modules/UserModule'

static initialize(config: {
  resourceRepository: IResourceRepository
  userRepository: IUserRepository  // 🆕
  logger: ILogger
}): void {
  // ...
  UserModule.initialize({  // 🆕
    repository: config.userRepository,
    logger: config.logger
  })
  
  // Register handlers
  UserModule.registerQueryHandlers(queryBus)  // 🆕
  UserModule.registerCommandHandlers(commandBus)  // 🆕
}
```

### **Шаг 3: Обновить Facades**

```typescript
// src/composition/queries.ts
export class QueryFacade {
  async listUsers(): Promise<Validation<IError[], UserListItemDTO[]>> {
    const query: ListUsersQuery = { type: 'ListUsersQuery' }
    return this.queryBus.execute<UserListItemDTO[]>(query)
  }
}

// src/composition/commands.ts
export class CommandFacade {
  async createUser(params: {...}): Promise<Validation<IError[], void>> {
    const command = new CreateUserCommand(...)
    return this.commandBus.execute(command)
  }
}
```

---

## ✅ **Преимущества архитектуры**

1. **Модульность** - каждая сущность в своем модуле
2. **Масштабируемость** - легко добавлять новые сущности
3. **Тестируемость** - можно mock Bus и модули
4. **Multi-UI готовность** - разные инициализации для Web/CLI/Desktop
5. **Динамическая регистрация** - handlers регистрируются в runtime
6. **Middleware support** - готовность к interceptors/logging
7. **Чистая архитектура** - Dependency Rule соблюдается

---

## 🚨 **Технические ограничения**

### **Type casting в модулях**

Из-за ограничений TypeScript generic типов в Bus, требуется type casting:

```typescript
queryBus.register(
  'ListResourcesQuery',
  async (query) => {
    const handler = new ListResourcesQueryHandler(...)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    return handler.handle(query as any)
  }
)
```

**Почему:**
- Bus принимает generic `IQuery`, а handler ожидает конкретный `ListResourcesQuery`
- TypeScript не может автоматически вывести тип из строки `'ListResourcesQuery'`
- `as any` - технический долг паттерна, но изолирован в модулях

**Безопасность:**
- ✅ Type-safe на уровне Facades
- ✅ Type-safe в routes/actions
- ⚠️ Только внутри модулей нужен casting

---

## 📚 **См. также**

- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - детали Command Bus
- **[QUERY_HANDLERS.md](./QUERY_HANDLERS.md)** - Query Handlers
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - структура проекта
- **[DATA_FLOW.md](./DATA_FLOW.md)** - CQRS поток данных

---

**Дата создания:** 2025-01-26  
**Версия:** 1.0 (Query/Command Bus architecture)
