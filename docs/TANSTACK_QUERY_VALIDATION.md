# TanStack Query + Validation Pattern

**Статус:** ✅ Архитектура (2025-01-27)  
**Версия:** 1.0

---

## 🎯 Проблема: throw vs Callbacks

### **Что приходит из команды:**

```typescript
Promise<Validation<IError[], void>>
```

**Два варианта:**
1. ✅ **Right (success)** - команда выполнена успешно
2. ❌ **Left (errors)** - массив бизнес-ошибок (ValidationError, DuplicateError, NotFoundError)

---

## ❌ Неправильно: throw для Domain ошибок

```typescript
export function useCreateResource() {
  return useMutation<void, IError[], CreateResourceParams>({
    mutationFn: async (params) => {
      const result = await commands.createResource(params)
      
      if (result.isLeft()) {
        throw result.value  // ❌ ПРОБЛЕМА!
      }
      
      return result.value
    },
  })
}
```

### **Проблемы:**

1. ❌ **Семантически неверно** - "Ресурс уже существует" это **ожидаемый** результат, а не exception
2. ❌ **Domain ошибки != Exceptions** - превращаем валидный бизнес-результат в исключительную ситуацию
3. ❌ **Теряем контроль** - TanStack Query воспринимает как failure (retry, error boundary)
4. ❌ **Смешиваем слои** - Domain errors обрабатываются как Infrastructure errors
5. ❌ **Логика нотификаций в hook** - нарушение разделения ответственности

---

## ✅ Правильно: Callbacks БЕЗ throw

### **Архитектура:**

```
┌─────────────────────────────────────────┐
│  Component (UI Logic)                    │
│  - showNotification()                    │
│  - queryClient.invalidateQueries()      │
│  - navigate()                            │
└────────────┬────────────────────────────┘
             ↓ callbacks
┌────────────▼────────────────────────────┐
│  useCommandMutation (Request Logic)      │
│  - mutationFn                            │
│  - onSuccess / onValidationError         │
└────────────┬────────────────────────────┘
             ↓ calls
┌────────────▼────────────────────────────┐
│  ServiceContainer (Business Logic)       │
│  - commands.createResource()             │
└──────────────────────────────────────────┘
```

---

## 🛠️ Реализация

### **1. useCommandMutation wrapper:**

```typescript
// src/presentation/web/react/src/hooks/useCommandMutation.ts

export function useCommandMutation<TData, TVariables>(
  options: {
    mutationFn: (variables: TVariables) => Promise<Validation<IError[], TData>>
    onSuccess?: (data: TData, variables: TVariables) => void
    onValidationError?: (errors: IError[], variables: TVariables) => void
    onInfrastructureError?: (error: Error, variables: TVariables) => void
  }
)
```

**Принцип:**
- ✅ **НЕ throw** для Domain ошибок
- ✅ **Callbacks** вместо статусов
- ✅ **Разделение** Domain (retry ❌) и Infrastructure (retry ✅) ошибок

---

### **2. Определение hook:**

```typescript
// hooks/mutations/useCreateResource.ts

export function useCreateResource() {
  return useCommandMutation<void, CreateResourceParams>({
    mutationFn: (params) => commands.createResource(params),
  })
}
```

**Что делает:**
- ✅ ТОЛЬКО запрос к ServiceContainer
- ❌ БЕЗ нотификаций
- ❌ БЕЗ invalidation
- ❌ БЕЗ навигации

---

### **3. Использование в компоненте:**

```typescript
// components/CreateResourceForm.tsx

function CreateResourceForm() {
  const create = useCreateResource()
  const { showSuccess, showError } = useNotification()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const handleSubmit = (formData) => {
    create.mutate(formData, {
      onSuccess: () => {
        // ✅ UI логика В КОМПОНЕНТЕ
        showSuccess('Resource created successfully')
        queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
        navigate('/resources')
      },
      
      onValidationError: (errors) => {
        // ✅ Domain ошибки
        showError(errors.map(e => e.message).join(', '))
      },
      
      onInfrastructureError: (error) => {
        // ✅ Network ошибки
        showError('Network error. Please try again.')
      }
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

**Что делает:**
- ✅ Показывает нотификации
- ✅ Инвалидирует кеш
- ✅ Навигация после успеха
- ✅ Обработка ошибок

---

## 📊 Сравнение подходов

| Критерий | throw Domain errors | Callbacks |
|----------|---------------------|-----------|
| **Семантика** | ❌ Domain ошибки = exceptions | ✅ Domain ошибки = результат |
| **Разделение** | ❌ UI логика в hook | ✅ UI логика в компоненте |
| **TanStack Query** | ❌ Retry на Domain ошибках | ✅ Retry только Infrastructure |
| **Читаемость** | ❌ throw скрывает логику | ✅ Явная обработка |
| **Гибкость** | ❌ Одна стратегия | ✅ Разные стратегии для разных компонентов |

---

## 🎓 Принципы

### **Separation of Concerns:**

| Слой | Ответственность |
|------|----------------|
| **Hook** | Запрос к ServiceContainer |
| **Component** | UI (нотификации, invalidation, навигация) |
| **ServiceContainer** | Бизнес-логика, валидация |

### **Domain vs Infrastructure ошибки:**

| Тип ошибки | Источник | Обработка | Retry? |
|------------|----------|-----------|--------|
| **Domain** | ValidationError, DuplicateError | onValidationError | ❌ Нет |
| **Infrastructure** | NetworkError, TimeoutError | onInfrastructureError | ✅ Да |

### **Validation Pattern:**

```typescript
// ✅ Validation монада
Validation<IError[], T>
  .isRight() → успех
  .isLeft()  → Domain ошибки

// ❌ НЕ throw
throw result.value  // Превращает Result в Exception

// ✅ Callbacks
onSuccess: (data) => { /* UI logic */ }
onValidationError: (errors) => { /* UI logic */ }
```

---

## 🔧 Расширения

### **Глобальные callbacks:**

```typescript
export function useCreateResource() {
  return useCommandMutation({
    mutationFn: (params) => commands.createResource(params),
    
    // ✅ Глобальная логика (логирование, аналитика)
    onSuccess: (data, variables) => {
      console.log('Resource created:', data)
      analytics.track('resource_created', { namespace: variables.namespace })
    },
  })
}
```

**В компоненте добавляем UI логику:**
```typescript
create.mutate(data, {
  onSuccess: () => {
    showSuccess('Created!')  // ← Дополнительно к глобальному callback
  }
})
```

---

### **Переиспользование стратегий:**

```typescript
// hooks/useResourceMutationCallbacks.ts
export function useResourceMutationCallbacks() {
  const { showSuccess, showError } = useNotification()
  const queryClient = useQueryClient()
  
  return {
    onSuccess: () => {
      showSuccess('Success!')
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
    
    onValidationError: (errors: IError[]) => {
      showError(errors.map(e => e.message).join(', '))
    },
    
    onInfrastructureError: (error: Error) => {
      showError('Network error. Please try again.')
    }
  }
}
```

**Использование:**
```typescript
function CreateResourceForm() {
  const create = useCreateResource()
  const callbacks = useResourceMutationCallbacks()
  
  const handleSubmit = (data) => {
    create.mutate(data, callbacks)  // ← Переиспользуем
  }
}
```

---

## 📚 Связанные документы

- [TanStack Query Integration](./TANSTACK_QUERY_INTEGRATION.md) - полная архитектура
- [Error Handling](./error-handling/ERROR_HANDLING.md) - Validation Pattern
- [Composition Layer](./COMPOSITION_LAYER.md) - ServiceContainer и Facades

---

**Последнее обновление:** 2025-01-27  
**Версия:** 1.0
