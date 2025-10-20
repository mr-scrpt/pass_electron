# Composition Layer - Декомпозиция и масштабирование

Документ описывает структуру Composition Layer, декомпозицию при росте количества сущностей, и паттерны для поддержки нескольких типов UI (Web, CLI, Desktop).

---

## Проблема масштабирования

### Антипаттерн - монолитный контейнер [#code]

При росте количества доменных сущностей монолитные файлы становятся огромными:

#### Антипаттерн - монолитный ServiceContainer [#code]

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

### Структура [#structure:tree]

```
src/composition/                
├── index.ts                      # Public API
├── ServiceContainer.ts           # Root Container
├── config/                     
│   └── Environment.ts            # Константы окружений
├── modules/                      # DI Modules по сущностям #structure:
│   ├── ResourceModule.ts       ResourceModule
│   ├── EntryModule.ts          EntryModule
│   └── SecretModule.ts         SecretModule
├── queries/                      # Query Facades по сущностям #structure:
│   ├── index.ts
│   ├── ResourceQueries.ts
│   └── EntryQueries.ts
└── commands/                     # Command Facades по сущностям #structure:
    ├── index.ts
    ├── ResourceCommands.ts
    └── EntryCommands.ts
```

---

## Константы (нет Magic Strings)

### Environment

#### Environment конфиг [#code|#structure:path]

```typescript
// src/composition/config/Environment.ts
export const Environment = {
  WEB: 'web',
  CLI: 'cli',
  DESKTOP: 'desktop'
} as const

export type EnvironmentType = typeof Environment[keyof typeof Environment]
```

### QueryTypes

#### QueryTypes константы [#code|#structure:path]

```typescript
// src/application/queries/QueryTypes.ts
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

#### CommandTypes константы [#code|#structure:path]

```typescript
// src/application/commands/CommandTypes.ts
export const CommandTypes = {
  RESOURCE: {
    CREATE: 'CreateResourceCommand',
    UPDATE: 'UpdateResourceCommand',
    DELETE: 'DeleteResourceCommand'
  }
} as const
```

### RequestParamKeys

#### RequestParamKeys константы [#code|#structure:path]

```typescript
// src/application/ports/RequestParamKeys.ts
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

### Фабрики адаптеров (Infrastructure Layer)

> **📘 Полное описание Adapter Pattern + DI см. в [ADAPTER_PATTERN_DI.md](./ADAPTER_PATTERN_DI.md)**

**Port (Application Layer):**

#### IRequestParser интерфейс [#interface:IRequestParser|#code|#structure:path]

```typescript
// src/application/ports/IRequestParser.ts
export interface IRequestParser {  //
  parseListResourcesParams(input: unknown): ListResourcesParams
  parseGetResourceByIdParams(input: unknown): GetResourceByIdParams
}

export interface ListResourcesParams {
  namespace?: string
  search?: string
}
```

#### WebRequestParser - адаптер для Web

##### WebRequestParser [#class:WebRequestParser|#code|#structure:path]

```typescript
// src/infrastructure/request-parsers/WebRequestParser.ts
export class WebRequestParser implements IRequestParser {  //
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const url = new URL((input as Request).url)
    return {
      namespace: url.searchParams.get(RequestParamKeys.RESOURCE.NAMESPACE) || undefined,
      search: url.searchParams.get(RequestParamKeys.RESOURCE.SEARCH) || undefined
    }
  }
}
```

#### CLIRequestParser

##### CLIRequestParser [#class:CLIRequestParser|#code|#structure:path]

```typescript
// src/infrastructure/request-parsers/CLIRequestParser.ts
export class CLIRequestParser implements IRequestParser {  //
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

### ResourceModule

#### ResourceModule класс [#class:ResourceModule|#code|#structure:path]

```typescript
// src/composition/modules/ResourceModule.ts
export class ResourceModule {  //
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

### SystemModule

#### SystemModule класс [#class:SystemModule|#code|#structure:path]

```typescript
// src/composition/modules/SystemModule.ts
import type { IClipboardService, IStorageService } from '@/application/ports'  //

/**
 * Module для системных адаптеров (не доменных)
 * ✅ НЕ знает о платформах (Web/CLI/Desktop)
 * ✅ Принимает готовые реализации при инициализации
 */
export class SystemModule {  //
  private static clipboard: IClipboardService | null = null
  private static storage: IStorageService | null = null

  /**
   * Инициализация с готовыми адаптерами
   * ✅ Вызывается ОДИН РАЗ из ServiceContainer
   */
  static initialize(adapters: {
    clipboard: IClipboardService
    storage?: IStorageService
  }): void {
    this.clipboard = adapters.clipboard
    this.storage = adapters.storage || null
  }

  static getClipboardService(): IClipboardService {
    if (!this.clipboard) {
      throw new Error('SystemModule not initialized')
    }
    return this.clipboard
  }

  static getStorageService(): IStorageService {
    if (!this.storage) {
      throw new Error('StorageService not initialized')
    }
    return this.storage
  }
}
```

---

## Root Container

### ServiceContainer

#### ServiceContainer класс [#class:ServiceContainer|#code|#structure:path]

```typescript
// src/composition/ServiceContainer.ts
import type { IRequestParser } from '@/application/ports'  //
import type { IQueryBus } from '@/application/queries'  //
import type { IClipboardService } from '@/application/ports'  //
import { InMemoryQueryBus } from '@/infrastructure/queries'  //
import { ResourceModule, SystemModule } from './modules'  //

/**
 * Root DI Container
 * ✅ НЕ знает о конкретных адаптерах (Web/CLI/Desktop)
 * ✅ Принимает готовые реализации при инициализации
 */
export class ServiceContainer {  //
  private static queryBus: IQueryBus | null = null
  private static requestParser: IRequestParser | null = null
  private static initialized = false

  /**
   * Инициализация контейнера с готовыми адаптерами
   * ✅ Вызывается ОДИН РАЗ при старте приложения (entry point)
   * ✅ НЕ содержит if/else для выбора адаптеров
   */
  static initialize(adapters: {
    requestParser: IRequestParser
    clipboard: IClipboardService
    // ... другие системные адаптеры
  }): void {
    if (this.initialized) return

    // Инициализируем Request Parser
    this.requestParser = adapters.requestParser

    // Инициализируем системные модули
    SystemModule.initialize({
      clipboard: adapters.clipboard
    })

    // Создаем и регистрируем Query Bus
    const bus = new InMemoryQueryBus()
    ResourceModule.registerQueryHandlers(bus)
    EntryModule.registerQueryHandlers(bus)
    this.queryBus = bus

    this.initialized = true
  }

  static getRequestParser(): IRequestParser {
    if (!this.requestParser) {
      throw new Error('ServiceContainer not initialized')
    }
    return this.requestParser
  }

  static getQueryBus(): IQueryBus {
    if (!this.queryBus) {
      throw new Error('ServiceContainer not initialized')
    }
    return this.queryBus
  }

  static getClipboardService(): IClipboardService {
    if (!this.initialized) {
      throw new Error('ServiceContainer not initialized')
    }
    return SystemModule.getClipboardService()
  }

  static reset(): void {
    this.queryBus = null
    this.requestParser = null
    this.initialized = false
  }
}
```

---

## Query Facades

### ResourceQueries

#### ResourceQueries facade [#code|#structure:path]

```typescript
// src/composition/queries/ResourceQueries.ts
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

### Public API для Queries

#### Queries index [#code|#structure:path]

```typescript
// src/composition/queries/index.ts
export { resourceQueries } from './ResourceQueries'
export { entryQueries } from './EntryQueries'

export const queries = {
  resources: resourceQueries,
  entries: entryQueries
}
```

---

## Public API

### Composition index

#### Composition index.ts [#code|#structure:path]

```typescript
// src/composition/index.ts
export { queries } from './queries'
export { commands } from './commands'
export { ServiceContainer } from './ServiceContainer'
export { Environment, type EnvironmentType } from './config/Environment'
```

---

## Фабрики адаптеров (Infrastructure Layer)

**Знание о платформах изолировано в Infrastructure:**

### RequestParserFactory

#### RequestParserFactory класс [#class:RequestParserFactory|#code|#structure:path]

```typescript
// src/infrastructure/request-parsers/RequestParserFactory.ts
import type { IRequestParser } from '@/application/ports'  //
import { RemixRequestParser } from './RemixRequestParser'  //
import { CLIRequestParser } from './CLIRequestParser'  //
import { DesktopRequestParser } from './DesktopRequestParser'  //

export class RequestParserFactory {  //
  static createForWeb(): IRequestParser {
    return new RemixRequestParser()
  }
  
  static createForCLI(): IRequestParser {
    return new CLIRequestParser()
  }
  
  static createForDesktop(): IRequestParser {
    return new DesktopRequestParser()
  }
}
```

### ClipboardServiceFactory

#### ClipboardServiceFactory класс [#class:ClipboardServiceFactory|#code|#structure:path]

```typescript
// src/infrastructure/clipboard/ClipboardServiceFactory.ts
import type { IClipboardService } from '@/application/ports'  //
import { WebClipboardService } from './WebClipboardService'  //
import { ElectronClipboardService } from './ElectronClipboardService'  //

export class ClipboardServiceFactory {  //
  static createForWeb(): IClipboardService {
    return new WebClipboardService()
  }
  
  static createForDesktop(): IClipboardService {
    return new ElectronClipboardService()
  }
}
```

---

## Использование

### Web (Remix)

#### Web entry point [#code|#structure:path]

```typescript
// src/presentation/web/react/src/entry.client.tsx
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import { ServiceContainer } from '@/composition'  //
import { RequestParserFactory } from '@/infrastructure/request-parsers'  //
import { ClipboardServiceFactory } from '@/infrastructure/clipboard'  //

// ✅ Entry point знает что это Web
// ✅ Создает Web адаптеры через фабрики
const requestParser = RequestParserFactory.createForWeb()
const clipboard = ClipboardServiceFactory.createForWeb()

// ✅ Инициализируем контейнер готовыми адаптерами
ServiceContainer.initialize({
  requestParser,
  clipboard
})

// Далее обычный React Router код
hydrateRoot(document, <HydratedRouter />)
```

#### Пример использования в route

##### Route loader [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/resources._index.tsx
import { queries } from '@/composition'  //

export async function loader({ request }) {
  return queries.resources.list(request)  // ✅ Одна строка
}
```

### CLI

#### CLI entry point [#code|#structure:path]

```typescript
// cli/index.ts
import { program } from 'commander'
import { ServiceContainer, queries } from '@/composition'  //
import { RequestParserFactory } from '@/infrastructure/request-parsers'  //
import { ClipboardServiceFactory } from '@/infrastructure/clipboard'  //

// ✅ Entry point знает что это CLI
// ✅ Создает CLI адаптеры через фабрики
const requestParser = RequestParserFactory.createForCLI()
const clipboard = ClipboardServiceFactory.createForCLI()

// ✅ Инициализируем контейнер готовыми адаптерами
ServiceContainer.initialize({
  requestParser,
  clipboard
})

program.command('list')
  .option('-n, --namespace <namespace>')
  .action(async (options) => {
    const result = await queries.resources.list(options)
    console.table(result.data)
  })
```

### Desktop (Electron)

#### Electron entry point [#code|#structure:path]

```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import { ServiceContainer, queries } from '@/composition'
import { RequestParserFactory } from '@/infrastructure/request-parsers'
import { ClipboardServiceFactory } from '@/infrastructure/clipboard'

// ✅ Entry point знает что это Desktop (Electron)
// ✅ Создает Desktop адаптеры через фабрики
const requestParser = RequestParserFactory.createForDesktop()
const clipboard = ClipboardServiceFactory.createForDesktop()

app.whenReady().then(() => {
  // ✅ Инициализируем контейнер готовыми адаптерами
  ServiceContainer.initialize({
    requestParser,
    clipboard
  })
  
  createWindow()
  
  // IPC handlers используют facades
  ipcMain.handle('resource:list', (event, params) => 
    queries.resources.list(params)
  )
})
```

---

## Зависимости

### Поток зависимостей [#diagram:flow]

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
3. **Нет Magic Strings** - все константы в одном месте (QueryTypes, CommandTypes, RequestParamKeys)
4. **Изоляция знаний о платформах**:
   - ✅ Composition Layer НЕ знает о Web/CLI/Desktop
   - ✅ Фабрики в Infrastructure знают о платформах
   - ✅ Entry points создают адаптеры и инжектят в контейнер
5. **Никаких `if/else` при получении сервисов** - только при создании (один раз)
6. **Тестируемость**:
   - Легко мокать адаптеры при инициализации
   - `ServiceContainer.initialize({ requestParser: mockParser, clipboard: mockClipboard })`
7. **Loader в 1 строку** - вся сложность инкапсулирована
8. **Консистентность** - один подход для всех адаптеров (Request Parser, Clipboard, Storage, etc.)

---

## Связанные документы

- **[DDD_AND_CLEAN_ARCHITECTURE.md](./DDD_AND_CLEAN_ARCHITECTURE.md)** - Как DDD и Clean Architecture сочетаются
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Структура проекта
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Поток данных
- **[QUERY_HANDLERS.md](./QUERY_HANDLERS.md)** - Query Handlers и CQRS
- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - Command Bus
- **[electron/README.md](./electron/README.md)** - Electron как Packaging Layer (пример того же подхода для системных адаптеров)
