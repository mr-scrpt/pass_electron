# Data Flow - Поток данных в приложении

Этот документ описывает, как данные перемещаются между слоями архитектуры в Remix приложении с использованием DDD подхода и CQRS паттерна.

## Содержание

1. [Remix: Server vs Client](#remix-server-vs-client)
2. [CQRS + Facades](#cqrs--facades)
3. [Dependency Injection](#dependency-injection)
4. [Полный поток данных](#полный-поток-данных)
5. [Паттерны работы с данными](#паттерны-работы-с-данными)
6. [Best Practices](#best-practices)

---

## Remix: Server vs Client

### 🔑 Ключевое отличие от Next.js

В отличие от Next.js App Router (`'use server'`, `'use client'`), Remix использует **convention-based** разделение:

| Код | Где выполняется | Описание |
|-----|----------------|----------|
| `loader()` | ✅ **ТОЛЬКО сервер** | Загрузка данных перед рендерингом |
| `action()` | ✅ **ТОЛЬКО сервер** | Обработка форм (POST/PUT/DELETE) |
| React Component | 🔄 **Сервер (SSR) + Клиент** | Рендеринг UI |
| `useLoaderData()` | ✅ **Клиент** | Получение данных из loader |
| `useFetcher()` | ✅ **Клиент** | Client-side операции без навигации |

### ❌ Распространенное заблуждение

```typescript
// src/presentation/web/react/src/routes/_index.tsx
export async function loader() {  // ← НЕ клиент, это СЕРВЕР!
  // ⚠️ Старый подход - теперь используем Query Facade
  const service = getResourceService()
  const data = await service.listResources()
  return json({ data })
}

// ✅ Новый подход (CQRS)
export async function loader({ request }) {
  return queries.listResources(request)  // Одна строка!
}
```

**`loader()` - это 100% серверная функция!** Она выполняется на Node.js сервере.

---

## CQRS + Facades

**Проблема без Facades:**

```typescript
// ❌ ПЛОХО: Route Handler знает о деталях реализации
export async function loader() {
  const repository = new MockResourceRepository()  // Прямая зависимость
  const useCase = new ListResourcesUseCase(repository)
  const resources = await useCase.execute()
  return json({ resources })
}
```

**Что не так:**
- Нарушение Dependency Inversion
- Tight coupling с Infrastructure
- Невозможно легко переключить Mock ↔ Real API
- Дублирование кода композиции зависимостей

### Решение: CQRS + Facades

Мы используем **CQRS паттерн + Facade Pattern** для упрощения Presentation Layer:

- **Query Handlers** - обрабатывают чтение данных (CQRS - Read)
- **Command Handlers** - обрабатывают запись данных (CQRS - Write)
- **Facades** - предоставляют простой API для UI (queries.resources.list())
- **Request Parser** - парсит платформенно-специфичные запросы в DTO

### Архитектура с CQRS + Facades

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer (Route Handler)              │
│  - loader() / action()                           │
│  - Вызывает Facade (queries/commands)           │
└────────────┬────────────────────────────────────┘
             ↓
┌────────────┴────────────────────────────────────┐
│  Composition Layer (Facades)                     │
│  - queries.resources.list(request)               │
│  - Парсит request → создает Query → вызывает Bus│
└────────────┬────────────────────────────────────┘
             ↓
┌────────────┴────────────────────────────────────┐
│  Application Layer (Query/Command Handlers)      │
│  - ListResourcesQueryHandler                     │
│  - CreateResourceCommandHandler                  │
└────────────┬────────────────────────────────────┘
             ↓
┌────────────┴────────────────────────────────────┐
│  Repository Interface (Domain)                   │
│  - IResourceRepository                           │
└────────────┬────────────────────────────────────┘
             ↑ реализует
┌────────────┴────────────────────────────────────┐
│  Repository Implementation (Infrastructure)      │
│  - MockResourceRepository                        │
│  - ApiResourceRepository                         │
└─────────────────────────────────────────────────┘
```

---

## Dependency Injection

### DI Container (Composition Root)

Все зависимости создаются в **одном месте** - DI Container в Composition Root.

> **🎯 Важно**: Composition Root находится на верхнем уровне `src/composition/`, а НЕ в `infrastructure/`. Он знает обо всех слоях и связывает их, но сам не является частью ни одного слоя.

> **📘 Полное описание внедрения внешних зависимостей см. в [ADAPTER_PATTERN_DI.md](./ADAPTER_PATTERN_DI.md)**

**Файл: `src/composition/ServiceContainer.ts`**

```typescript
import { InMemoryQueryBus } from '@/infrastructure/queries'
import { ResourceModule } from './modules/ResourceModule'
import type { IQueryBus, IRequestParser } from '@/application'
import type { IClipboardService } from '@/application/ports'

/**
 * Composition Root - место, где создаются и связываются зависимости
 * ✅ НЕ знает о конкретных адаптерах (Web/CLI/Desktop)
 * ✅ Принимает готовые реализации при инициализации
 */
class ServiceContainer {
  private static queryBus: IQueryBus | null = null
  private static requestParser: IRequestParser | null = null
  private static initialized = false

  /**
   * Инициализация с готовыми адаптерами
   * ✅ Вызывается ОДИН РАЗ при старте (entry point)
   */
  static initialize(adapters: {
    requestParser: IRequestParser
    clipboard: IClipboardService
  }): void {
    if (this.initialized) return
    
    this.requestParser = adapters.requestParser
    SystemModule.initialize({ clipboard: adapters.clipboard })
    
    // Создаем Query Bus и регистрируем handlers
    const bus = new InMemoryQueryBus()
    ResourceModule.registerQueryHandlers(bus)
    this.queryBus = bus
    
    this.initialized = true
  }
  
  static getQueryBus(): IQueryBus {
    if (!this.queryBus) {
      throw new Error('ServiceContainer not initialized')
    }
    return this.queryBus
  }
  
  static getRequestParser(): IRequestParser {
    if (!this.requestParser) {
      throw new Error('ServiceContainer not initialized')
    }
    return this.requestParser
  }
  
  /**
   * Сброс контейнера (для тестов)
   */
  static reset(): void {
    this.queryBus = null
    this.requestParser = null
    this.initialized = false
  }
}
```

**Public API:**

```typescript
// src/composition/index.ts
export { queries } from './queries'
export { commands } from './commands'
export { ServiceContainer } from './ServiceContainer'
```

**Зачем Composition Root?**
- ✅ Единая точка управления всеми зависимостями
- ✅ Принимает готовые адаптеры (НЕ создает их сам)
- ✅ Легко переключать Mock ↔ Real API (меняем Repository в Module)
- ✅ Presentation Layer не знает о деталях реализации
- ✅ Легко тестировать - mock адаптеры при инициализации
- ✅ Не нарушает архитектурные границы

### Query Facades (упрощенный API для UI)

**Файл: `src/composition/queries/ResourceQueries.ts`**

```typescript
import { ListResourcesQuery } from '@/application/queries'
import { ServiceContainer } from '../ServiceContainer'

/**
 * Facade для Resource Queries
 * ✅ Loader в одну строку: queries.resources.list(request)
 */
export const resourceQueries = {
  async list(request: Request) {
    // 1. Парсим request (платформо-специфично)
    const parser = ServiceContainer.getRequestParser()
    const params = parser.parseListResourcesParams(request)
    
    // 2. Создаем Query
    const query = new ListResourcesQuery(params.namespace, params.search)
    
    // 3. Выполняем через Query Bus
    const queryBus = ServiceContainer.getQueryBus()
    return queryBus.execute(query)
  },
  
  async getById(request: Request) {
    const parser = ServiceContainer.getRequestParser()
    const params = parser.parseGetResourceByIdParams(request)
    
    const query = new GetResourceByIdQuery(params.id)
    const queryBus = ServiceContainer.getQueryBus()
    return queryBus.execute(query)
  }
}
```

**Public API:**

```typescript
// src/composition/queries/index.ts
export { resourceQueries } from './ResourceQueries'

export const queries = {
  resources: resourceQueries
}
```

---

## Полный поток данных

### GET Request (загрузка данных с CQRS)

```
1. Browser → GET /
   ↓
2. Remix вызывает loader() ← СЕРВЕР
   ↓
3. loader() → queries.resources.list(request) ← СЕРВЕР (Facade)
   ↓
4. Facade → Request Parser (парсит request в DTO) ← СЕРВЕР
   ↓
5. Facade → создает ListResourcesQuery ← СЕРВЕР
   ↓
6. Facade → Query Bus.execute(query) ← СЕРВЕР
   ↓
7. Query Bus → находит Handler по типу Query ← СЕРВЕР
   ↓
8. ListResourcesQueryHandler → handle(query) ← СЕРВЕР
   ↓
9. Handler → Repository.findAll() ← СЕРВЕР
   ↓
10. Mock Data → return data ← СЕРВЕР
   ↓
11. Handler → преобразует в DTO ← СЕРВЕР
   ↓
12. Handler → return { data, error? } ← СЕРВЕР
   ↓
13. Remix → SSR (рендер React компонента) ← СЕРВЕР
   ↓
14. Browser получает HTML + JSON
   ↓
15. React Hydration (компонент оживает) ← КЛИЕНТ
   ↓
16. useLoaderData() → получить данные ← КЛИЕНТ
   ↓
17. Рендер UI ← КЛИЕНТ
```

### Пример кода

**Route Handler (Presentation Layer):**

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '@/composition'

/**
 * ✅ ИДЕАЛЬНО: Loader в одну строку
 * Вся сложность инкапсулирована в Facade
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return queries.resources.list(request)  // ✅ Одна строка!
}
```

**Что происходит внутри Facade:**

```typescript
// src/composition/queries/ResourceQueries.ts
export const resourceQueries = {
  async list(request: Request) {
    // 1. Парсим request
    const parser = ServiceContainer.getRequestParser()
    const params = parser.parseListResourcesParams(request)
    
    // 2. Создаем Query
    const query = new ListResourcesQuery(params.namespace, params.search)
    
    // 3. Выполняем через Query Bus
    const queryBus = ServiceContainer.getQueryBus()
    return queryBus.execute(query)
  }
}
```

**Query Handler (Application Layer):**

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
export class ListResourcesQueryHandler {
  constructor(private repository: IResourceRepository) {}
  
  async handle(query: ListResourcesQuery): Promise<QueryResult<ResourceListItemDTO[]>> {
    try {
      // Получаем данные из репозитория
      const resources = await this.repository.findAll()
      
      // Преобразуем Domain Model → DTO
      const data: ResourceListItemDTO[] = resources.map(r => ({
        id: r.id,
        namespace: r.namespace,
        name: r.name,
        fieldsCount: r.customFields.length,
        updatedAt: r.updatedAt
      }))
      
      return { data }
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to load resources'
      }
    }
  }
}
```

**Клиентский компонент:**

```typescript
export default function Index() {
  // ✅ useLoaderData типизирован! TypeScript знает структуру
  const { data, error } = useLoaderData<typeof loader>()
  
  if (error) {
    return <ErrorMessage message={error} />
  }
  
  return (
    <div>
      <h1>Resources</h1>
      <ResourceList resources={data} />
    </div>
  )
}
```

### POST Request (мутации данных с Commands)

```
1. Browser → Form Submit (POST)
   ↓
2. Remix вызывает action() ← СЕРВЕР
   ↓
3. action() → commands.resources.create(request) ← СЕРВЕР (Facade)
   ↓
4. Facade → Request Parser (парсит FormData/JSON в DTO) ← СЕРВЕР
   ↓
5. Facade → создает CreateResourceCommand ← СЕРВЕР
   ↓
6. Facade → Command Bus.execute(command) ← СЕРВЕР
   ↓
7. Command Bus → находит Handler по типу Command ← СЕРВЕР
   ↓
8. CreateResourceCommandHandler → handle(command) ← СЕРВЕР
   ↓
9. Handler → Repository.save() ← СЕРВЕР
   ↓
10. Handler → Event Bus.publish('ResourceCreated') ← СЕРВЕР
   ↓
11. Handler → return { success: true } ← СЕРВЕР
   ↓
12. Redirect или return data ← СЕРВЕР
   ↓
13. Browser → Revalidation (перезагрузка loader)
```

**Пример:**

```typescript
// src/presentation/web/react/src/routes/resources.new.tsx
import { redirect } from 'react-router'
import { commands } from '@/composition'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ (action для мутаций)
 * ✅ Одна строка! Facade инкапсулирует всю логику
 */
export async function action({ request }: ActionFunctionArgs) {
  const result = await commands.resources.create(request)
  
  if (result.error) {
    return json({ error: result.error }, { status: 400 })
  }
  
  return redirect(`/resources/${result.data.id}`)
}
```

---

## Паттерны работы с данными

### 1. Server-side загрузка (Primary Pattern)

**Используй для:** Первичной загрузки данных

```typescript
// ✅ РЕКОМЕНДУЕТСЯ: Используй Query Facade
import { queries } from '@/composition'

export async function loader({ request }: LoaderFunctionArgs) {
  return queries.listResources(request)
}

export default function Index() {
  const { data } = useLoaderData<typeof loader>()
  return <List data={data} />
}
```

**Преимущества:**
- SEO friendly (данные в HTML)
- Быстрая первая отрисовка
- Нет loading состояний
- Type-safe

### 2. Client-side мутации (без перезагрузки)

**Используй для:** Операций без навигации (like, delete, update)

```typescript
export default function ResourceItem() {
  const fetcher = useFetcher()
  
  const handleDelete = (id: string) => {
    fetcher.submit(
      { intent: 'delete' },
      { method: 'DELETE', action: `/resources/${id}` }
    )
  }
  
  return (
    <button onClick={() => handleDelete(resource.id)}>
      {fetcher.state === 'submitting' ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

### 3. UI Hooks (для UI логики, НЕ для фетчинга)

**Используй для:** Переиспользуемой UI логики

```typescript
// src/domain/useResourceActions.ts
import { useFetcher, useNavigate } from 'react-router'

/**
 * Hook для действий с ресурсами
 * НЕ делает фетчинг данных, работает с уже полученными
 */
export function useResourceActions() {
  const fetcher = useFetcher()
  const navigate = useNavigate()
  
  const deleteResource = (id: string) => {
    if (confirm('Delete resource?')) {
      fetcher.submit(
        { intent: 'delete' },
        { method: 'DELETE', action: `/resources/${id}` }
      )
    }
  }
  
  const editResource = (id: string) => {
    navigate(`/resources/${id}/edit`)
  }
  
  return {
    deleteResource,
    editResource,
    isDeleting: fetcher.state === 'submitting'
  }
}
```

**Использование:**

```typescript
export default function ResourceList() {
  const { resources } = useLoaderData<typeof loader>()
  const { deleteResource, isDeleting } = useResourceActions()
  
  return (
    <>
      {resources.map(r => (
        <ResourceItem
          key={r.id}
          resource={r}
          onDelete={() => deleteResource(r.id)}
        />
      ))}
    </>
  )
}
```

### 4. Optimistic UI (для лучшего UX)

```typescript
export default function ResourceList() {
  const { resources } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  
  // Оптимистичное обновление
  const optimisticResources = fetcher.formData
    ? resources.filter(r => r.id !== fetcher.formData?.get('id'))
    : resources
  
  return (
    <>
      {optimisticResources.map(r => (
        <ResourceItem key={r.id} resource={r} />
      ))}
    </>
  )
}
```

---

## Best Practices

### ✅ DO: Правильные паттерны

1. **Используй `loader()` для загрузки данных через Query Facade**
   ```typescript
   import { queries } from '@/composition'
   
   export async function loader({ request }: LoaderFunctionArgs) {
     return queries.listResources(request)  // ✅ Одна строка
   }
   ```

2. **Используй Facades для чтения и записи**
   ```typescript
   // ✅ Для чтения (Queries)
   import { queries } from '@/composition'
   export async function loader({ request }) {
     return queries.resources.list(request)
   }
   
   // ✅ Для записи (Commands)
   import { commands } from '@/composition'
   export async function action({ request }) {
     return commands.resources.create(request)
   }
   ```

3. **Composition Root для всех зависимостей**
   ```typescript
   // Все зависимости в одном месте (src/composition/)
   export { queries } from './queries'
   export { commands } from './commands'
   ```

4. **Хуки для UI логики, не для фетчинга**
   ```typescript
   const { deleteResource } = useResourceActions()  // ✅ UI логика
   const { resources } = useLoaderData()            // ✅ Данные из loader
   ```

5. **Type-safe data flow**
   ```typescript
   const { resources } = useLoaderData<typeof loader>()  // Типизация
   ```

### DON'T: Антипаттерны

1. **НЕ создавай репозитории в loader напрямую**
   ```typescript
   // ПЛОХО
   export async function loader() {
     const repo = new MockResourceRepository()  // Прямая зависимость
     const useCase = new ListResourcesUseCase(repo)
     return json({ data: await useCase.execute() })
   }
   ```

2. **НЕ используй useState/useEffect для первичной загрузки**
   ```typescript
   // ПЛОХО
   export default function Index() {
     const [resources, setResources] = useState([])
     useEffect(() => {
       fetch('/api/resources').then(r => setResources(r))
     }, [])
   }
   ```

3. **НЕ мешай серверный и клиентский код**
   ```typescript
   // ПЛОХО - Repository на клиенте
   // ❌ ПЛОХО - Repository на клиенте
   export default function Index() {
     const repo = new MockResourceRepository()  // Только для сервера!
   }
   ```

4. **НЕ обходи Facade**
   ```typescript
   // ❌ ПЛОХО
   export async function loader() {
     const repo = getResourceRepository()
     return json({ data: await repo.findAll() })  // Минуешь Query Handler и Facade
   }
   ```

5. **НЕ дублируй композицию зависимостей**
   ```typescript
   // ❌ ПЛОХО - дублирование в каждом loader
   export async function loader1() {
     const repo = new MockResourceRepository()
     const handler = new ListResourcesQueryHandler(repo)
   }
   
   export async function loader2() {
     const repo = new MockResourceRepository()  // Дубль
     const handler = new ListResourcesQueryHandler(repo)
   }
   
   // ✅ ХОРОШО - используем Facade
   export async function loader1() {
     return queries.resources.list(request)
   }
   
   export async function loader2() {
     return queries.resources.list(request)
   }
   ```

---

## Сравнительная таблица: Remix vs Next.js

| Аспект | Remix | Next.js App Router |
|--------|-------|-------------------|
| **Серверный код** | `loader()`, `action()` | `'use server'` функции |
| **Клиентский код** | React компоненты | `'use client'` компоненты |
| **Получение данных** | `useLoaderData()` | `async` компоненты |
| **Мутации** | `action()` + `useFetcher()` | Server Actions |
| **Разделение** | Convention-based | Explicit директивы |
| **Type Safety** | Полная (через `typeof loader`) | Частичная |

---

## Чек-лист для работы с данными

При создании нового route:

- [ ] Определить нужен ли `loader()` (загрузка данных)
- [ ] Определить нужен ли `action()` (мутации)
- [ ] Импортировать `queries` или `commands` из `@/composition`
- [ ] Вызвать Facade: `queries.resources.list(request)` или `commands.resources.create(request)`
- [ ] Типизировать `useLoaderData<typeof loader>()`
- [ ] Для client-side операций использовать `useFetcher()`
- [ ] Для UI логики создать кастомный hook (если нужно)
- [ ] НЕ создавать репозитории/handlers напрямую в UI - только через Facades

---

## См. также

- [QUERY_HANDLERS.md](./QUERY_HANDLERS.md) - Query Handlers и Facade для чтения данных
- [COMMAND_BUS.md](./COMMAND_BUS.md) - Command Bus для UI команд
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура проекта
- [ARCHITECTURE_DESIGN.md](./concepts/ARCHITECTURE_DESIGN.md) - Архитектура
- [System Interfaces](./contracts/system-interfaces.md) - Интерфейсы
