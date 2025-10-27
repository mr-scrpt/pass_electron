# React Hooks - TanStack Query Integration

**Адаптеры между TanStack Query и ServiceContainer**

---

## 🚀 Quick Start

### **1. Query (чтение данных):**

```typescript
import { useResources } from '@/hooks'

function ResourceList() {
  const { data, isLoading, error } = useResources()
  
  if (isLoading) return <Spinner />
  if (error) return <ErrorBanner errors={error} />
  
  return <List items={data} />
}
```

### **2. Mutation (изменение данных):**

```typescript
import { useCreateResource } from '@/hooks'
import { useNotification } from '@/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { resourceKeys } from '../lib/query-keys'
import { useEffect } from 'react'

function CreateForm() {
  const create = useCreateResource()
  const { showSuccess, showError } = useNotification()
  const queryClient = useQueryClient()
  
  // ✅ Стандартные флаги TanStack Query
  useEffect(() => {
    if (create.isSuccess) {
      showSuccess('Resource created!')
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    }
    
    if (create.isError) {
      showError(create.error.map(e => e.getMessage()).join(', '))
    }
  }, [create.isSuccess, create.isError])
  
  const handleSubmit = (formData) => {
    create.mutate({
      namespace: formData.namespace,
      name: formData.name,
      secret: formData.secret,
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <button disabled={create.isPending}>
        {create.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

### **3. Invalidation:**

```typescript
import { useInvalidateResources } from '@/hooks'

function ResourceDetail() {
  const invalidate = useInvalidateResources()
  
  const handleRefresh = () => {
    // Обновить только списки
    invalidate.invalidateLists()
    
    // Или обновить всё
    invalidate.invalidateAll()
    
    // Или только конкретный ресурс
    invalidate.invalidateDetail(resourceId)
  }
  
  return (
    <button onClick={handleRefresh}>Refresh</button>
  )
}
```

---

## 📁 Структура

```
hooks/
├── queries/              # Queries (чтение)
│   ├── useResources.ts
│   └── index.ts
│
├── mutations/            # Mutations (запись)
│   ├── useCreateResource.ts
│   ├── useDeleteResource.ts
│   └── index.ts
│
└── index.ts              # Public API
```

---

## 🎯 Как создать новый hook?

### **Query Hook (чтение):**

```typescript
// hooks/queries/useResource.ts
import { useQuery } from '@tanstack/react-query'
import { queries } from '@/composition'
import type { ResourceDTO } from '@/application/queries/dtos'
import type { IError } from '@/shared/errors'

export function useResource(id: string) {
  return useQuery<ResourceDTO, IError[]>({
    queryKey: ['resource', id],  // ← Уникальный ключ
    
    queryFn: async () => {
      const result = await queries.get(id)
      
      if (result.isLeft()) {
        throw result.value
      }
      
      return result.value
    },
    
    enabled: !!id,  // ← Выполнится только если есть ID
  })
}
```

### **Mutation Hook (запись):**

```typescript
// hooks/mutations/useUpdateResource.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commands } from '@/composition'
import type { UpdateResourceCommand } from '@/application/commands'
import type { IError } from '@/shared/errors'

export function useUpdateResource() {
  const queryClient = useQueryClient()
  
  return useMutation<void, IError[], UpdateResourceCommand>({
    mutationFn: async (command) => {
      const result = await commands.updateResource(command)
      
      if (result.isLeft()) {
        throw result.value
      }
      
      return result.value
    },
    
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['resource', variables.resourceId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['resources'] 
      })
    }
  })
}
```

---

## ✅ Принципы

1. ✅ **Hooks вызывают ServiceContainer facades** - `queries.list()`, `commands.createResource()`
2. ✅ **БЕЗ throw для Domain ошибок** - управляем состояниями вручную
3. ✅ **Стандартные флаги как в TanStack Query** - `isPending`, `isSuccess`, `isError`
4. ✅ **Компонент работает с флагами** - через `useEffect` на `isSuccess`/`isError`
5. ✅ **Query keys централизованы** - `resourceKeys.list()`, `resourceKeys.detail(id)`
6. ✅ **Invalidation через хук** - `useInvalidateResources()`

---

## 🛠️ useValidatedMutation

Wrapper для мутаций БЕЗ throw, управляет состояниями вручную:

```typescript
export function useCreateResource() {
  return useValidatedMutation<void, CreateResourceParams>({
    mutationFn: (params) => commands.createResource(params),
  })
}
```

**Что возвращает:**
- ✅ `isPending` - запрос в процессе
- ✅ `isSuccess` - успешно (Right)
- ✅ `isError` - ошибка (Left)
- ✅ `data` - данные при успехе
- ✅ `error: IError[]` - ошибки при неудаче
- ✅ `mutate()` - выполнить мутацию
- ✅ `reset()` - сбросить состояние

**Как работает:**
- Right → `isSuccess: true`, `data: T`
- Left → `isError: true`, `error: IError[]`
- БЕЗ throw для Domain ошибок!

---

## 📚 Документация

Полная документация: [`/docs/TANSTACK_QUERY_INTEGRATION.md`](../../../../docs/TANSTACK_QUERY_INTEGRATION.md)
