# Composition Layer - Декомпозиция и масштабирование

Документ описывает структуру Composition Layer, декомпозицию при росте количества сущностей, и паттерны для поддержки нескольких типов UI (Web, CLI, Desktop).

---

## Проблема масштабирования

При росте количества доменных сущностей монолитные файлы становятся огромными:

```typescript
// ❌ Антипаттерн: все в одном файле (1000+ строк)
class ServiceContainer {
  static getResourceService() { ... }
  static getEntryService() { ... }
  static getSecretService() { ... }
  // ... еще 50 методов
}
```

---

## Решение: Декомпозиция по доменным сущностям

### Структура

```
app/composition/
├── index.ts                      # Public API
├── ServiceContainer.ts           # Root Container
├── config/
│   └── Environment.ts            # Константы окружений
├── modules/                      # DI Modules по сущностям
│   ├── ResourceModule.ts
│   ├── EntryModule.ts
│   └── SecretModule.ts
├── queries/                      # Query Facades по сущностям
│   ├── index.ts
│   ├── ResourceQueries.ts
│   └── EntryQueries.ts
└── commands/                     # Command Facades по сущностям
    ├── index.ts
    ├── ResourceCommands.ts
    └── EntryCommands.ts
```

---

## Константы (нет Magic Strings)

### Environment

```typescript
// app/composition/config/Environment.ts
export const Environment = {
  WEB: 'web',
  CLI: 'cli',
  DESKTOP: 'desktop'
} as const

export type EnvironmentType = typeof Environment[keyof typeof Environment]
```

### QueryTypes

```typescript
// app/application/queries/QueryTypes.ts
export const QueryTypes = {
  RESOURCE: {
    LIST: 'ListResourcesQuery',
    GET_BY_ID: 'GetResourceByIdQuery'
  },
  ENTRY: {
    LIST: 'ListEntriesQuery',
    GET_BY_ID: 'GetEntryByIdQuery'
  }
} as const
```

### CommandTypes

```typescript
// app/application/commands/CommandTypes.ts
export const CommandTypes = {
  RESOURCE: {
    CREATE: 'CreateResourceCommand',
    UPDATE: 'UpdateResourceCommand',
    DELETE: 'DeleteResourceCommand'
  }
} as const
```

### RequestParamKeys

```typescript
// app/application/ports/RequestParamKeys.ts
export const RequestParamKeys = {
  RESOURCE: {
    NAMESPACE: 'namespace',
    SEARCH: 'search'
  },
  ENTRY: {
    RESOURCE_ID: 'resourceId',
    SEARCH: 'search'
  },
  COMMON: {
    ID: 'id'
  }
} as const
```

---

## Request Parser Abstraction (Multi-UI)

### Проблема

Facade не должен зависеть от Web-специфичных типов (Request). Иначе невозможно использовать в CLI/Desktop.

### Решение: Strategy Pattern + DI

**Port (Application Layer):**
```typescript
// app/application/ports/IRequestParser.ts
export interface IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams
  parseGetResourceByIdParams(input: unknown): GetResourceByIdParams
}

export interface ListResourcesParams {
  namespace?: string
  search?: string
}
```

**Adapters (Infrastructure Layer):**

```typescript
// app/infrastructure/request-parsers/WebRequestParser.ts
export class WebRequestParser implements IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const url = new URL((input as Request).url)
    return {
      namespace: url.searchParams.get(RequestParamKeys.RESOURCE.NAMESPACE) || undefined,
      search: url.searchParams.get(RequestParamKeys.RESOURCE.SEARCH) || undefined
    }
  }
}
```

```typescript
// app/infrastructure/request-parsers/CLIRequestParser.ts
export class CLIRequestParser implements IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const options = input as Record<string, any>
    return {
      namespace: options.namespace || options.n,
      search: options.search || options.s
    }
  }
}
```

---

## DI Modules

```typescript
// app/composition/modules/ResourceModule.ts
export class ResourceModule {
  private static repository: IResourceRepository | null = null
  private static service: ResourceService | null = null

  static getService(): ResourceService {
    if (!this.service) {
      this.service = new ResourceService(this.getRepository())
    }
    return this.service
  }

  static registerQueryHandlers(bus: IQueryBus): void {
    bus.register(QueryTypes.RESOURCE.LIST, new ListResourcesQueryHandler(this.getService()))
    bus.register(QueryTypes.RESOURCE.GET_BY_ID, new GetResourceByIdQueryHandler(this.getService()))
  }

  static registerCommandHandlers(bus: ICommandBus): void {
    bus.register(CommandTypes.RESOURCE.CREATE, new CreateResourceCommandHandler(this.getService()))
  }
}
```

---

## Root Container

```typescript
// app/composition/ServiceContainer.ts
export class ServiceContainer {
  private static queryBus: IQueryBus | null = null
  private static requestParser: IRequestParser | null = null
  private static environment: EnvironmentType = Environment.WEB

  static setEnvironment(env: EnvironmentType): void {
    this.environment = env
    this.requestParser = null
  }

  static getRequestParser(): IRequestParser {
    if (!this.requestParser) {
      switch (this.environment) {
        case Environment.WEB: this.requestParser = new WebRequestParser(); break
        case Environment.CLI: this.requestParser = new CLIRequestParser(); break
        case Environment.DESKTOP: this.requestParser = new DesktopRequestParser(); break
      }
    }
    return this.requestParser
  }

  static getQueryBus(): IQueryBus {
    if (!this.queryBus) {
      const bus = new InMemoryQueryBus()
      ResourceModule.registerQueryHandlers(bus)
      EntryModule.registerQueryHandlers(bus)
      this.queryBus = bus
    }
    return this.queryBus
  }
}
```

---

## Query Facades

```typescript
// app/composition/queries/ResourceQueries.ts
export const resourceQueries = {
  async list(input: unknown) {
    const parser = ServiceContainer.getRequestParser()
    const params = parser.parseListResourcesParams(input)
    const query = new ListResourcesQuery(params.namespace, params.search)
    return ServiceContainer.getQueryBus().execute(query)
  },

  async getById(input: unknown) {
    const parser = ServiceContainer.getRequestParser()
    const params = parser.parseGetResourceByIdParams(input)
    const query = new GetResourceByIdQuery(params.id)
    return ServiceContainer.getQueryBus().execute(query)
  }
}
```

```typescript
// app/composition/queries/index.ts
export { resourceQueries } from './ResourceQueries'
export { entryQueries } from './EntryQueries'

export const queries = {
  resources: resourceQueries,
  entries: entryQueries
}
```

---

## Public API

```typescript
// app/composition/index.ts
export { queries } from './queries'
export { commands } from './commands'
export { ServiceContainer } from './ServiceContainer'
export { Environment, type EnvironmentType } from './config/Environment'
```

---

## Использование

### Web (Remix)

```typescript
// app/entry.server.tsx
import { ServiceContainer, Environment } from '~/composition'
ServiceContainer.setEnvironment(Environment.WEB)
```

```typescript
// app/routes/resources._index.tsx
import { queries } from '~/composition'

export async function loader({ request }) {
  return queries.resources.list(request)  // ✅ Одна строка
}
```

### CLI

```typescript
// cli/index.ts
import { ServiceContainer, Environment, queries } from '~/composition'
ServiceContainer.setEnvironment(Environment.CLI)

program.command('list')
  .option('-n, --namespace <namespace>')
  .action(async (options) => {
    const result = await queries.resources.list(options)
    console.table(result.data)
  })
```

### Desktop (Electron)

```typescript
// electron/main/index.ts
import { ServiceContainer, Environment, queries } from '~/composition'
ServiceContainer.setEnvironment(Environment.DESKTOP)

ipcMain.handle('resource:list', (event, params) => queries.resources.list(params))
```

---

## Зависимости

```
Presentation → Composition (facades only)
    ↓
ServiceContainer → все слои (исключение)
    ↓
Modules → Domain, Application, Infrastructure
    ↓
Application → Domain
    ↑
Infrastructure → Domain (implements)
```

---

## Преимущества

1. **Масштабируемость** - каждая сущность в отдельном Module
2. **Multi-UI** - один Facade для Web/CLI/Desktop
3. **Нет Magic Strings** - все константы в одном месте
4. **Тестируемость** - легко мокать IRequestParser
5. **Loader в 1 строку** - вся сложность инкапсулирована

---

## Связанные документы

- **[DDD_AND_CLEAN_ARCHITECTURE.md](./DDD_AND_CLEAN_ARCHITECTURE.md)** - Как DDD и Clean Architecture сочетаются
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Структура проекта
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Поток данных
- **[QUERY_HANDLERS.md](./QUERY_HANDLERS.md)** - Query Handlers и CQRS
- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - Command Bus
