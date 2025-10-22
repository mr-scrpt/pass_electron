# План обновления Query и Command Handlers

**Дата:** 2025-01-22  
**Статус:** Планирование

---

## 🎯 Цель

Обновить Query и Command Handlers на использование Validation API вместо try-catch.

---

## 🔍 Текущее состояние

### ✅ Документация актуальна:

1. **docs/QUERY_HANDLERS.md** - не использует Either ✅
2. **docs/COMMAND_BUS.md** - не использует Either ✅
3. **docs/APPLICATION_LAYER_VALIDATION.md** - создан с Validation API ✅

### ❌ Step 1 требует обновления:

**Файл:** `steps/step_1/README.md`

**Проблема:** ListResourcesQueryHandler использует try-catch

```typescript
// ❌ ТЕКУЩИЙ КОД (try-catch)
async handle(query: ListResourcesQuery): Promise<QueryResult<ResourceListItemDTO[]>> {
  try {
    const resources = await this.repository.findAll()
    const dtos = resources.map(...)
    return { data: dtos }
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

---

## 📋 План обновления

### 1. Обновить ListResourcesQueryHandler в Step 1

**Должно быть:**

```typescript
// ✅ ПРАВИЛЬНО (Validation API)
import { Validation, valid, invalid } from '@/shared/validation'

async handle(
  query: ListResourcesQuery
): Promise<Validation<QueryError[], ResourceListItemDTO[]>> {
  try {
    // Получаем Domain типы из репозитория
    const resources = await this.repository.findAll()
    
    // Преобразуем Domain → DTO
    const dtos: ResourceListItemDTO[] = resources.map(resource => ({
      id: resource.getId().getValue(),
      namespace: resource.getNamespace().getValue(),
      name: resource.getName().getValue(),
      createdAt: resource.getCreatedAt().toISOString(),
      updatedAt: resource.getUpdatedAt().toISOString()
    }))
    
    return valid(dtos)
  } catch (error) {
    return invalid([
      new QueryError(
        'ListResourcesQuery',
        `Failed to fetch resources: ${error.message}`
      )
    ])
  }
}
```

**Ключевые изменения:**
1. ✅ Импорт `Validation` вместо `QueryResult`
2. ✅ Возвращаем `Validation<Error[], DTO[]>`
3. ✅ Используем `valid()` и `invalid()`
4. ✅ Используем getters вместо прямого доступа к полям
5. ✅ Try-catch только для инфраструктурных ошибок

---

### 2. Обновить IQueryHandler интерфейс

**Файл:** `src/application/queries/IQueryHandler.ts`

**Было:**
```typescript
export interface IQueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<QueryResult<TResult>>
}

export type QueryResult<T> = {
  data: T
  error?: string
}
```

**Стало:**
```typescript
import { Validation } from '@/shared/validation'
import { QueryError } from '@/domain/shared/errors'

export interface IQueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<Validation<QueryError[], TResult>>
}
```

**Почему:**
- ✅ Type-safe ошибки
- ✅ Накопление ошибок
- ✅ Единый подход с Domain Layer

---

### 3. Добавить QueryError в Domain

**Файл:** `src/domain/shared/errors/QueryError.ts`

```typescript
// src/domain/shared/errors/QueryError.ts
import { ApplicationError } from './ApplicationError'

/**
 * Ошибка выполнения запроса
 * Application Layer ошибка для Query Handlers
 */
export class QueryError extends ApplicationError {
  readonly code = 'QUERY_ERROR'
  
  constructor(
    readonly queryType: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(message, context)
    this.name = 'QueryError'
  }
}
```

---

### 4. Обновить примеры в Step 1

#### A. Обновить описание QueryResult

**Было:**
```typescript
export type QueryResult<T> = {
  data: T
  error?: string
}
```

**Стало:**
```typescript
// QueryResult больше не нужен!
// Используем Validation<Error[], T>
```

#### B. Обновить примеры использования в loader

**Было:**
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const result = await queries.resources.list(request)
  
  if (result.error) {
    throw new Error(result.error)
  }
  
  return { resources: result.data }
}
```

**Стало:**
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const result = await queries.resources.list(request)
  
  // Обработка Validation
  if (result.isLeft()) {
    // Логируем ошибки
    console.error('Query failed:', result.value)
    throw new Error('Failed to load resources')
  }
  
  return { resources: result.value }
}
```

---

## 📊 Сравнение подходов

### Было (try-catch + QueryResult):

```typescript
// ❌ Проблемы:
// 1. Нет type-safety для ошибок
// 2. error?: string - слишком общее
// 3. Нужно проверять result.error вручную
// 4. Легко забыть обработку

async handle(query: Q): Promise<QueryResult<T>> {
  try {
    const data = await this.repository.findAll()
    return { data }
  } catch (error) {
    return { data: [], error: error.message }  // Теряем тип ошибки
  }
}
```

### Стало (Validation API):

```typescript
// ✅ Преимущества:
// 1. Type-safe ошибки (QueryError[])
// 2. Накопление ошибок
// 3. Явный контракт в типе
// 4. Компилятор заставит обработать

async handle(query: Q): Promise<Validation<QueryError[], T>> {
  try {
    const data = await this.repository.findAll()
    return valid(data)
  } catch (error) {
    return invalid([new QueryError('QueryType', error.message)])
  }
}
```

---

## 🔧 Command Handlers

Command Handlers аналогично:

### Было:
```typescript
async handle(command: C): Promise<CommandResult>

type CommandResult = {
  success: boolean
  error?: string
}
```

### Стало:
```typescript
async handle(command: C): Promise<Validation<CommandError[], void>>

// Или если возвращаем ID:
async handle(command: C): Promise<Validation<CommandError[], string>>
```

---

## ✅ Чек-лист обновления

### Step 1:

- [ ] Обновить IQueryHandler интерфейс
- [ ] Добавить QueryError
- [ ] Обновить ListResourcesQueryHandler
- [ ] Обновить примеры в loader
- [ ] Обновить описание QueryResult
- [ ] Добавить объяснение Validation в Query

### Документация:

- [ ] Проверить QUERY_HANDLERS.md
- [ ] Проверить COMMAND_BUS.md
- [ ] Проверить APPLICATION_LAYER_VALIDATION.md
- [ ] Добавить примеры в Step 1

---

## 📖 Связанные документы

- [APPLICATION_LAYER_VALIDATION.md](../docs/APPLICATION_LAYER_VALIDATION.md) - уже содержит правильные примеры
- [VALIDATION_COMBINATORS.md](../docs/error-handling/VALIDATION_COMBINATORS.md) - Validation API
- [QUERY_HANDLERS.md](../docs/QUERY_HANDLERS.md) - Query Handlers
- [COMMAND_BUS.md](../docs/COMMAND_BUS.md) - Command Bus

---

**Следующий шаг:** Обновить Step 1 с правильными примерами Query Handler
