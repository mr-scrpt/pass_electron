# TanStack Query Integration

**Статус:** ✅ Архитектура (2025-01-27)  
**Версия:** 1.0 (React Query v5)

---

## 🎯 Цель

Интеграция **TanStack Query** (React Query) как **UI State Management слоя** между React компонентами и ServiceContainer.

**Что решает:**
- ✅ Кеширование данных
- ✅ Дедупликация запросов
- ✅ Автоматический рефетчинг
- ✅ Optimistic updates
- ✅ Loading/Error states
- ✅ Stale-while-revalidate
- ✅ Invalidation и refetch

---

## 📦 Архитектура

### **Слои взаимодействия с данными:**

```
┌─────────────────────────────────────────────┐
│  UI Components (React)                       │
│  - ResourceList.tsx                          │
│  - ResourceDetail.tsx                        │
│  - CreateResourceForm.tsx                   │
└────────────┬────────────────────────────────┘
             ↓ использует
┌────────────▼────────────────────────────────┐
│  React Hooks + TanStack Query (NEW!)        │ ← UI State Management
│  - useResources() - кеширование             │
│  - useCreateResource() - optimistic updates │
│  - useDeleteResource() - invalidation       │
└────────────┬────────────────────────────────┘
             ↓ вызывает
┌────────────▼────────────────────────────────┐
│  ServiceContainer Facades                    │
│  - queries.list()                            │
│  - commands.createResource()                 │
│  - commands.deleteResource()                 │
└────────────┬────────────────────────────────┘
             ↓ использует
┌────────────▼────────────────────────────────┐
│  Application Layer (Handlers)                │
│  - ListResourcesQueryHandler                 │
│  - CreateResourceCommandHandler              │
│  - DeleteResourceCommandHandler              │
└──────────────────────────────────────────────┘
```

---

## 🏗️ Структура

### **Hooks организация:**

```
src/presentation/web/react/src/hooks/
├── queries/                    # Queries (чтение данных)
│   ├── useResources.ts        # Список ресурсов + кеширование
│   ├── useResource.ts         # Один ресурс по ID
│   ├── useNamespaces.ts       # Список namespace
│   └── index.ts               # Public API
│
├── mutations/                  # Mutations (изменение данных)
│   ├── useCreateResource.ts   # Создание + invalidation
│   ├── useUpdateResource.ts   # Обновление + optimistic
│   ├── useDeleteResource.ts   # Удаление + optimistic
│   └── index.ts               # Public API
│
└── index.ts                    # Public API (queries + mutations)
```

---

## 🔧 Реализация

### **1. Query Hook - чтение данных** `[#code]`

```typescript
// src/presentation/web/react/src/hooks/queries/useResources.ts
import { useQuery } from '@tanstack/react-query'
import { queries } from '@/composition'
import type { ResourceListItemDTO } from '@/application/queries/dtos'
import type { IError } from '@/shared/errors'

export function useResources() {
  return useQuery<ResourceListItemDTO[], IError[]>({
    queryKey: ['resources'],  // ← Ключ кеша
    
    queryFn: async () => {
      // Вызываем ServiceContainer facade
      const result = await queries.list()
      
      // Validation<IError[], T> → T или throw Error
      if (result.isLeft()) {
        throw result.value  // TanStack Query обработает как error
      }
      
      return result.value
    },
    
    // Опции кеширования
    staleTime: 5 * 60 * 1000,  // 5 минут - данные свежие
    gcTime: 10 * 60 * 1000,    // 10 минут - в кеше
  })
}
```

**Ключевые моменты:**
- ✅ `queryKey: ['resources']` - уникальный ключ для кеша
- ✅ `queryFn` вызывает `queries.list()` (ServiceContainer facade)
- ✅ `Validation<IError[], T>` → `T` (успех) или `throw` (ошибка)
- ✅ `staleTime` - время свежести данных
- ✅ `gcTime` - время хранения в кеше

---

### **2. Mutation Hook - создание данных** `[#code]`

```typescript
// src/presentation/web/react/src/hooks/mutations/useCreateResource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commands } from '@/composition'
import type { CreateResourceCommand } from '@/application/commands'
import type { IError } from '@/shared/errors'

export function useCreateResource() {
  const queryClient = useQueryClient()
  
  return useMutation<void, IError[], CreateResourceCommand>({
    mutationFn: async (command: CreateResourceCommand) => {
      // Вызываем ServiceContainer facade
      const result = await commands.createResource(command)
      
      if (result.isLeft()) {
        throw result.value
      }
      
      return result.value
    },
    
    // После успешного создания - invalidate кеш
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['resources']  // ← Автоматический рефетч списка
      })
    }
  })
}
```

**Ключевые моменты:**
- ✅ `mutationFn` вызывает `commands.createResource()` (ServiceContainer facade)
- ✅ `onSuccess` - автоматическая invalidation кеша
- ✅ TanStack Query автоматически рефетчит invalidated queries

---

### **3. Mutation Hook с Optimistic Updates** `[#code]`

```typescript
// src/presentation/web/react/src/hooks/mutations/useDeleteResource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commands } from '@/composition'
import type { DeleteResourceCommand } from '@/application/commands'
import type { ResourceListItemDTO } from '@/application/queries/dtos'
import type { IError } from '@/shared/errors'

export function useDeleteResource() {
  const queryClient = useQueryClient()
  
  return useMutation<void, IError[], DeleteResourceCommand, { previousResources?: ResourceListItemDTO[] }>({
    mutationFn: async (command: DeleteResourceCommand) => {
      const result = await commands.deleteResource(command)
      
      if (result.isLeft()) {
        throw result.value
      }
      
      return result.value
    },
    
    // ✅ OPTIMISTIC UPDATE - мгновенно обновляем UI
    onMutate: async (command: DeleteResourceCommand) => {
      // 1. Отменяем текущие рефетчи
      await queryClient.cancelQueries({ queryKey: ['resources'] })
      
      // 2. Сохраняем предыдущее состояние (для rollback)
      const previousResources = queryClient.getQueryData<ResourceListItemDTO[]>(['resources'])
      
      // 3. Мгновенно обновляем UI - удаляем ресурс
      queryClient.setQueryData<ResourceListItemDTO[]>(['resources'], (old) => {
        if (!old) return []
        return old.filter(resource => resource.id !== command.resourceId)
      })
      
      // 4. Возвращаем context для rollback
      return { previousResources }
    },
    
    // ✅ ROLLBACK - если ошибка, откатываем
    onError: (error, command, context) => {
      if (context?.previousResources) {
        queryClient.setQueryData(['resources'], context.previousResources)
      }
    },
    
    // ✅ SETTLE - всегда рефетчим после завершения
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    }
  })
}
```

**Optimistic Updates flow:**
1. **onMutate** - мгновенно обновляем UI (до ответа сервера)
2. **mutationFn** - отправляем запрос
3. **onSuccess** - ничего не делаем (UI уже обновлен)
4. **onError** - откатываем UI к предыдущему состоянию
5. **onSettled** - рефетчим для синхронизации с сервером

---

## 🎨 Использование в компонентах

### **Query в компоненте:** `[#code]`

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceList.tsx
import { useResources } from '@/hooks'

function ResourceList() {
  const { data, isLoading, error, refetch } = useResources()
  
  if (isLoading) {
    return <Spinner />
  }
  
  if (error) {
    return (
      <ErrorBanner 
        errors={error}  // IError[]
        onRetry={refetch}
      />
    )
  }
  
  return (
    <div>
      {data?.map(resource => (
        <ResourceListItem key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
```

**TanStack Query предоставляет:**
- ✅ `data: ResourceListItemDTO[]` - кешированные данные
- ✅ `isLoading: boolean` - начальная загрузка
- ✅ `isFetching: boolean` - фоновый рефетч
- ✅ `error: IError[]` - ошибки валидации
- ✅ `refetch()` - ручной рефетч

---

### **Mutation в компоненте:** `[#code]`

```typescript
// src/presentation/web/react/src/components/CreateResourceForm/CreateResourceForm.tsx
import { useCreateResource } from '@/hooks'
import { useNotification } from '@/hooks'

function CreateResourceForm() {
  const createResource = useCreateResource()
  const { showSuccess, showError } = useNotification()
  
  const handleSubmit = (formData: FormData) => {
    createResource.mutate(
      {
        namespace: formData.get('namespace') as string,
        name: formData.get('name') as string,
        secret: formData.get('secret') as string,
      },
      {
        onSuccess: () => {
          showSuccess('Resource created successfully')
        },
        onError: (errors) => {
          showError(errors.map(e => e.message).join(', '))
        }
      }
    )
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="namespace" />
      <input name="name" />
      <input name="secret" type="password" />
      
      <button 
        type="submit"
        disabled={createResource.isPending}
      >
        {createResource.isPending ? 'Creating...' : 'Create'}
      </button>
      
      {createResource.isError && (
        <ErrorBanner errors={createResource.error} />
      )}
    </form>
  )
}
```

**TanStack Query предоставляет:**
- ✅ `mutate(command, { onSuccess, onError })` - выполнить мутацию
- ✅ `isPending: boolean` - в процессе выполнения
- ✅ `isError: boolean` - произошла ошибка
- ✅ `error: IError[]` - ошибки валидации
- ✅ `reset()` - сбросить состояние

---

## ⚙️ Setup TanStack Query

### **1. Установка:**

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

### **2. QueryClient Provider:** `[#code]`

```typescript
// src/presentation/web/react/src/root.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 минут по умолчанию
      gcTime: 10 * 60 * 1000,        // 10 минут в кеше
      retry: 1,                       // 1 retry при ошибке
      refetchOnWindowFocus: false,    // НЕ рефетчить при фокусе
    },
    mutations: {
      retry: 0,  // НЕ retry мутации (Domain ошибки не должны retry)
    }
  }
})

export function App({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## 📋 Query Keys Convention

### **Правила именования:**

```typescript
// ✅ Список сущностей
['resources']
['namespaces']

// ✅ Одна сущность по ID
['resource', id]
['namespace', name]

// ✅ Фильтрация/Поиск
['resources', { namespace: 'work' }]
['resources', { search: 'password' }]

// ✅ Nested данные
['resource', id, 'fields']
['resource', id, 'history']
```

### **Invalidation стратегии:**

```typescript
// Invalidate весь список
queryClient.invalidateQueries({ queryKey: ['resources'] })

// Invalidate конкретный ресурс
queryClient.invalidateQueries({ queryKey: ['resource', id] })

// Invalidate все related queries
queryClient.invalidateQueries({ queryKey: ['resources', { namespace }] })
```

---

## 🎯 Принципы архитектуры

### **DO ✅**

1. ✅ **Hooks вызывают ServiceContainer facades**
   ```typescript
   const result = await queries.list()  // ✅ Facade
   ```

2. ✅ **Validation<IError[], T> → T или throw**
   ```typescript
   if (result.isLeft()) throw result.value  // ✅
   ```

3. ✅ **TanStack Query управляет UI state**
   ```typescript
   const { data, isLoading, error } = useResources()  // ✅
   ```

4. ✅ **Optimistic updates для UX**
   ```typescript
   onMutate: async () => { /* update UI */ }  // ✅
   ```

5. ✅ **Invalidation после мутаций**
   ```typescript
   onSuccess: () => queryClient.invalidateQueries()  // ✅
   ```

---

### **DON'T ❌**

1. ❌ **НЕ вызывать handlers напрямую**
   ```typescript
   const handler = new ListResourcesQueryHandler()  // ❌
   ```

2. ❌ **НЕ использовать useState для server data**
   ```typescript
   const [resources, setResources] = useState([])  // ❌
   ```

3. ❌ **НЕ retry Domain ошибки**
   ```typescript
   retry: 3  // ❌ ValidationError не должны retry
   ```

4. ❌ **НЕ добавлять бизнес-логику в hooks**
   ```typescript
   // ❌ Валидация должна быть в Domain Layer
   if (name.length < 3) throw new Error()
   ```

---

## 🔍 Debugging

### **React Query Devtools:**

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

**Показывает:**
- ✅ Все queries и их состояние
- ✅ Cache содержимое
- ✅ Stale/Fresh статус
- ✅ Refetch history
- ✅ Mutation history

---

## 🚀 Расширения

### **Infinite Queries:**

```typescript
export function useInfiniteResources() {
  return useInfiniteQuery({
    queryKey: ['resources', 'infinite'],
    queryFn: ({ pageParam = 0 }) => queries.listPaginated({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}
```

### **Dependent Queries:**

```typescript
export function useResourceFields(resourceId: string) {
  return useQuery({
    queryKey: ['resource', resourceId, 'fields'],
    queryFn: () => queries.getResourceFields(resourceId),
    enabled: !!resourceId,  // ← Выполнится только если есть ID
  })
}
```

### **Prefetching:**

```typescript
export function usePrefetchResource() {
  const queryClient = useQueryClient()
  
  return (resourceId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['resource', resourceId],
      queryFn: () => queries.getResource(resourceId)
    })
  }
}
```

---

## 📊 Диаграммы

### **Data Flow с TanStack Query** `[#diagram:flow]`

```
┌─────────────────────────────────────────┐
│  User clicks "Create Resource"           │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  Component вызывает mutation.mutate()    │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  TanStack Query вызывает mutationFn()    │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  Hook вызывает commands.createResource() │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  ServiceContainer → Handler              │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  Domain Logic + Repository               │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  Result: Validation<IError[], void>      │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  Hook: if isLeft() → throw error         │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  TanStack Query: onSuccess/onError       │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  Invalidate cache → refetch queries      │
└────────────┬────────────────────────────┘
             ↓
┌────────────▼────────────────────────────┐
│  UI updates with fresh data              │
└──────────────────────────────────────────┘
```

---

## 📚 Связанные документы

- [Platform Configs Architecture](./PLATFORM_CONFIGS_ARCHITECTURE.md) - DI и platform-specific зависимости
- [Composition Layer](./COMPOSITION_LAYER.md) - ServiceContainer и Facades
- [Data Flow](./DATA_FLOW.md) - Поток данных в приложении
- [Error Handling](./error-handling/README.md) - Validation Pattern и IError

---

**Последнее обновление:** 2025-01-27  
**Версия:** 1.0
