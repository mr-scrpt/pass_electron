# Data Flow - Поток данных в приложении

Детальное описание работы с данными в Remix + Clean Architecture приложении.

## Содержание

1. [Remix: Server vs Client](#remix-server-vs-client)
2. [Application Services Layer](#application-services-layer)
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
// app/routes/_index.tsx
export async function loader() {  // ← НЕ клиент, это СЕРВЕР!
  const service = getResourceService()
  const data = await service.listResources()
  return json({ data })
}
```

**`loader()` - это 100% серверная функция!** Она выполняется на Node.js сервере.

---

## Application Services Layer

### Зачем нужен Application Service?

**Проблема без Application Service:**

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

### Решение: Application Service

Application Service - это **координатор Use Cases**, который:
- Инкапсулирует композицию зависимостей
- Управляет транзакциями (в будущем)
- Предоставляет высокоуровневый API для UI
- Скрывает детали реализации от Presentation Layer

### Архитектура с Application Service

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer (Route Handler)              │
│  - loader() / action()                           │
│  - Вызывает Application Service                 │
└────────────┬────────────────────────────────────┘
             ↓
┌────────────┴────────────────────────────────────┐
│  Application Service                             │
│  - ResourceService                               │
│  - Координация Use Cases                        │
│  - Высокоуровневый API                          │
└────────────┬────────────────────────────────────┘
             ↓
┌────────────┴────────────────────────────────────┐
│  Use Cases                                       │
│  - ListResourcesUseCase                          │
│  - CreateResourceUseCase                         │
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

Все зависимости создаются в **одном месте** - DI Container.

**Файл: `app/infrastructure/di/container.ts`**

```typescript
import { MockResourceRepository } from '~/infrastructure/repositories'
import { ResourceService } from '~/application/services/ResourceService'
import type { IResourceRepository } from '~/domain/repositories'

/**
 * DI Container - единая точка управления зависимостями
 * Паттерн: Composition Root
 */
class ServiceContainer {
  private static resourceService: ResourceService | null = null
  
  /**
   * Получить ResourceService (Singleton)
   */
  static getResourceService(): ResourceService {
    if (!this.resourceService) {
      const repository = this.createResourceRepository()
      this.resourceService = new ResourceService(repository)
    }
    return this.resourceService
  }
  
  /**
   * Создать Repository (Mock или Real)
   * Переключение через environment переменную
   */
  private static createResourceRepository(): IResourceRepository {
    const useMock = process.env.USE_MOCK_DATA !== 'false'
    
    if (useMock) {
      return new MockResourceRepository()
    } else {
      // В будущем:
      // return new ApiResourceRepository(apiClient)
      throw new Error('Real API not implemented yet')
    }
  }
  
  /**
   * Сброс контейнера (для тестов)
   */
  static reset(): void {
    this.resourceService = null
  }
}

// Фабричные функции для удобства
export const getResourceService = () => ServiceContainer.getResourceService()

// Для тестов
export const resetContainer = () => ServiceContainer.reset()
```

### Application Service

**Файл: `app/application/services/ResourceService.ts`**

```typescript
import type { IResourceRepository } from '~/domain/repositories'
import { ListResourcesUseCase } from '~/application/use-cases'
import type { ResourceListItem } from '~/domain/resource'

/**
 * Query для списка ресурсов
 */
export interface ListResourcesQuery {
  namespace?: string
  search?: string
}

/**
 * Application Service для работы с ресурсами
 * 
 * Ответственность:
 * - Координация Use Cases
 * - Управление транзакциями (в будущем)
 * - Высокоуровневый API для Presentation Layer
 */
export class ResourceService {
  constructor(private resourceRepository: IResourceRepository) {}
  
  /**
   * Получить список ресурсов
   */
  async listResources(query?: ListResourcesQuery): Promise<ResourceListItem[]> {
    const useCase = new ListResourcesUseCase(this.resourceRepository)
    return await useCase.execute(query)
  }
  
  /**
   * Получить ресурс по ID
   */
  async getResourceById(id: string): Promise<ResourceListItem | null> {
    return await this.resourceRepository.findById(id)
  }
  
  /**
   * В будущем здесь будут методы для:
   * - createResource()
   * - updateResource()
   * - deleteResource()
   * - addCustomField()
   * и т.д.
   */
}
```

**Public API:**

```typescript
// app/application/services/index.ts
export { ResourceService } from './ResourceService'
export type { ListResourcesQuery } from './ResourceService'
```

---

## Полный поток данных

### GET Request (загрузка данных)

```
1. Browser → GET /
   ↓
2. Remix вызывает loader() ← СЕРВЕР
   ↓
3. loader() → getResourceService() ← СЕРВЕР
   ↓
4. DI Container → new ResourceService(repository) ← СЕРВЕР
   ↓
5. ResourceService → listResources() ← СЕРВЕР
   ↓
6. ListResourcesUseCase → execute() ← СЕРВЕР
   ↓
7. Repository → findAll() ← СЕРВЕР
   ↓
8. Mock Data → return data ← СЕРВЕР
   ↓
9. Remix → SSR (рендер React компонента) ← СЕРВЕР
   ↓
10. Browser получает HTML + JSON
   ↓
11. React Hydration (компонент оживает) ← КЛИЕНТ
   ↓
12. useLoaderData() → получить данные ← КЛИЕНТ
   ↓
13. Рендер UI ← КЛИЕНТ
```

### Пример кода

**Route Handler (Presentation Layer):**

```typescript
// app/routes/_index.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getResourceService } from '~/infrastructure/di/container'
import { ResourceList } from '~/components/ResourceList'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ
 * Выполняется ТОЛЬКО на сервере (Node.js)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // 1. Получаем сервис из DI Container
  const resourceService = getResourceService()
  
  // 2. Вызываем метод сервиса
  const resources = await resourceService.listResources()
  
  // 3. Возвращаем данные (будут сериализованы в JSON)
  return json({ resources })
}

/**
 * ✅ КЛИЕНТСКИЙ КОМПОНЕНТ (+ SSR)
 * Выполняется на сервере (SSR) и клиенте (hydration)
 */
export default function Index() {
  // Получаем данные из loader (типизированные)
  const { resources } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <h1>Resources</h1>
      <ResourceList resources={resources} />
    </div>
  )
}
```

### POST Request (мутации данных)

```
1. Browser → Form Submit (POST)
   ↓
2. Remix вызывает action() ← СЕРВЕР
   ↓
3. action() → getResourceService() ← СЕРВЕР
   ↓
4. ResourceService → createResource() ← СЕРВЕР
   ↓
5. CreateResourceUseCase → execute() ← СЕРВЕР
   ↓
6. Repository → save() ← СЕРВЕР
   ↓
7. Event Bus → publish('ResourceCreated') ← СЕРВЕР
   ↓
8. Redirect или return data ← СЕРВЕР
   ↓
9. Browser → Revalidation (перезагрузка loader)
```

**Пример:**

```typescript
// app/routes/resources.new.tsx
import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { getResourceService } from '~/infrastructure/di/container'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ
 * Обрабатывает POST запросы
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const resourceService = getResourceService()
  
  // Вызываем метод создания (в будущем)
  // await resourceService.createResource({
  //   namespace: formData.get('namespace'),
  //   name: formData.get('name'),
  //   secret: formData.get('secret')
  // })
  
  return redirect('/')
}
```

---

## Паттерны работы с данными

### 1. Server-side загрузка (Primary Pattern)

**Используй для:** Первичной загрузки данных

```typescript
// ✅ РЕКОМЕНДУЕТСЯ
export async function loader() {
  const service = getResourceService()
  const data = await service.listResources()
  return json({ data })
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
// app/hooks/useResourceActions.ts
import { useFetcher, useNavigate } from '@remix-run/react'

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

1. **Используй `loader()` для загрузки данных**
   ```typescript
   export async function loader() {
     const service = getResourceService()
     return json({ data: await service.getData() })
   }
   ```

2. **Используй Application Service в loader/action**
   ```typescript
   const service = getResourceService()  // ✅
   await service.listResources()          // ✅
   ```

3. **DI Container для всех зависимостей**
   ```typescript
   // Все зависимости в одном месте
   export const getResourceService = () => 
     ServiceContainer.getResourceService()
   ```

4. **Хуки для UI логики, не для фетчинга**
   ```typescript
   const { deleteResource } = useResourceActions()  // ✅ UI логика
   const { resources } = useLoaderData()            // ✅ Данные из loader
   ```

5. **Type-safe data flow**
   ```typescript
   const { resources } = useLoaderData<typeof loader>()  // ✅ Типизация
   ```

### ❌ DON'T: Антипаттерны

1. **НЕ создавай репозитории в loader напрямую**
   ```typescript
   // ❌ ПЛОХО
   export async function loader() {
     const repo = new MockResourceRepository()  // Прямая зависимость
     const useCase = new ListResourcesUseCase(repo)
     return json({ data: await useCase.execute() })
   }
   ```

2. **НЕ используй useState/useEffect для первичной загрузки**
   ```typescript
   // ❌ ПЛОХО
   export default function Index() {
     const [resources, setResources] = useState([])
     useEffect(() => {
       fetch('/api/resources').then(r => setResources(r))
     }, [])
   }
   ```

3. **НЕ мешай серверный и клиентский код**
   ```typescript
   // ❌ ПЛОХО - Repository на клиенте
   export default function Index() {
     const repo = new MockResourceRepository()  // Только для сервера!
   }
   ```

4. **НЕ обходи Application Service**
   ```typescript
   // ❌ ПЛОХО
   export async function loader() {
     const repo = getResourceRepository()
     return json({ data: await repo.findAll() })  // Минуешь Use Case
   }
   ```

5. **НЕ дублируй композицию зависимостей**
   ```typescript
   // ❌ ПЛОХО - дублирование в каждом loader
   export async function loader1() {
     const repo = new MockResourceRepository()
     const useCase = new ListResourcesUseCase(repo)
   }
   
   export async function loader2() {
     const repo = new MockResourceRepository()  // Дубль
     const useCase = new ListResourcesUseCase(repo)
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
- [ ] Использовать `getResourceService()` из DI Container
- [ ] Вызвать метод Application Service
- [ ] Типизировать `useLoaderData<typeof loader>()`
- [ ] Для client-side операций использовать `useFetcher()`
- [ ] Для UI логики создать кастомный hook (если нужно)
- [ ] НЕ создавать репозитории/use cases напрямую в UI

---

## См. также

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура проекта
- [ARCHITECTURE_DESIGN.md](./concepts/ARCHITECTURE_DESIGN.md) - Архитектура
- [System Interfaces](./contracts/system-interfaces.md) - Интерфейсы
