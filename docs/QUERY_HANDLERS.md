# Query Handlers & Facade Pattern

Чтение данных в Remix Loaders через Query Handlers и Facade, следуя CQRS, DDD и Clean Architecture.

## Проблема

### Антипаттерн - loader со сложной логикой [#code]

```typescript
// ❌ Loader делает слишком много
export async function loader({ request }: LoaderFunctionArgs) {
  const resourceService = getResourceService();  // Знает о DI
  const resources = await resourceService.listResources();  // Знает о сервисе
  return json({ resources });  // Делает сериализацию
}
```

## Решение

### Facade Pattern - одна строка [#code]

```typescript
// ✅ Одна строка - вся сложность инкапсулирована
export async function loader({ request }: LoaderFunctionArgs) {
  return queries.resources.list(request);
}
```

---

## CQRS Pattern

**Command Query Responsibility Segregation** - разделение чтения и записи.

### Commands (запись)
- Изменяют состояние
- Используются в Actions
- Возвращают void/ID
- Пример: `DeleteResourceCommand`

### Queries (чтение)
- Только читают данные
- Используются в Loaders
- Возвращают DTO
- Пример: `ListResourcesQuery`

---

## Реализация

### 1. Query Interfaces (Application Layer - CORE)

> ⚠️ **Архитектурное правило:**  
> Application Layer (CORE) использует **монады** `Validation<E, T>` для type-safe обработки ошибок.  
> Это обеспечивает Railway-oriented programming и композицию операций.

#### IQuery и IQueryHandler

##### Интерфейсы [#interface:IQuery|#interface:IQueryHandler|#code|#structure:path]

```typescript
import { Validation } from '@/shared/validation'

export interface IQuery {
  readonly type: string;
}

/**
 * Query Handler - обработчик запросов на чтение
 * 
 * Возвращает Validation<Error[], T> для:
 * - Type-safe обработки ошибок
 * - Railway-oriented programming
 * - Композиции операций
 * - Накопления множественных ошибок
 */
export interface IQueryHandler<TQuery extends IQuery, TResult> {
  handle(query: TQuery): Promise<Validation<Error[], TResult>>;
}
```

#### IQueryBus - шина запросов

##### IQueryBus интерфейс [#interface:IQueryBus|#code|#structure:path]

```typescript
import { Validation } from '@/shared/validation'

export interface IQueryBus {
  execute<TQuery extends IQuery, TResult>(
    query: TQuery
  ): Promise<Validation<Error[], TResult>>;
  
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void;
}
```

### 2. Query Classes

#### Resource Queries

##### Resource Query классы [#class:ListResourcesQuery|#class:GetResourceByIdQuery|#code|#structure:path]

```typescript
export class ListResourcesQuery implements IQuery {
  readonly type = 'ListResourcesQuery';
  constructor(public readonly filters?: { search?: string; namespace?: string }) {}
}

export class GetResourceByIdQuery implements IQuery {
  readonly type = 'GetResourceByIdQuery';
  constructor(public readonly resourceId: string) {}
}
```

### 3. Query Handlers

#### ListResourcesQueryHandler

##### ListResourcesQueryHandler класс [#class:ListResourcesQueryHandler|#code|#structure:path]

```typescript
import { valid, invalid, type Validation } from '@/shared/validation'
import type { IQueryHandler } from './IQueryHandler'
import type { ListResourcesQuery } from './ListResourcesQuery'
import type { ResourceListItemDTO } from './dtos/ResourceListItemDTO'

export class ListResourcesQueryHandler
  implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]> {
  
  constructor(private repository: IResourceRepository) {}
  
  async handle(
    query: ListResourcesQuery
  ): Promise<Validation<Error[], ResourceListItemDTO[]>> {
    try {
      // 1. Получаем Domain объекты
      const resources = await this.repository.findAll();
      
      // 2. Преобразуем Domain Model → DTO
      const dtos = resources.map(r => ({
        id: r.getId().getValue(),
        namespace: r.getNamespace().getValue(),
        name: r.getName().getValue(),
        secretPreview: '****',
        fieldsCount: r.getCustomFields().length,
        updatedAt: r.getUpdatedAt().toISOString()
      }));
      
      // 3. Возвращаем монаду (успех)
      return valid(dtos);
      
    } catch (error) {
      // Непредвиденные ошибки (сеть, DB)
      return invalid([
        new Error(
          `Failed to list resources: ${error instanceof Error ? error.message : String(error)}`
        )
      ]);
    }
  }
}

export interface ResourceListItemDTO {
  id: string;
  namespace: string;
  name: string;
  createdAt: string;
}
```

### 4. QueryBus Adapter (Infrastructure)

#### InMemoryQueryBus

##### InMemoryQueryBus класс [#class:InMemoryQueryBus|#code|#structure:path]

```typescript
export class InMemoryQueryBus implements IQueryBus {
  private handlers = new Map<string, IQueryHandler<any, any>>();
  
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void {
    this.handlers.set(queryType, handler);
  }
  
  async execute<TQuery extends IQuery, TResult>(
    query: TQuery
  ): Promise<QueryResult<TResult>> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      return { data: null as TResult, error: `No handler for ${query.type}` };
    }
    return handler.handle(query);
  }
}
```

### 5. Facade (Composition Root)

> 🔑 **Важно:** Composition Layer возвращает **монады** как есть.  
> Адаптация под framework происходит в Presentation Layer.

#### Query Facade

##### Query Facade [#code|#structure:path]

```typescript
import { MockResourceRepository } from '@/infrastructure/repositories'
import { 
  ListResourcesQuery,
  ListResourcesQueryHandler,
  GetResourceByIdQuery,
  GetResourceByIdQueryHandler
} from '@/application/queries'

// ==================== Infrastructure ====================
const resourceRepository = new MockResourceRepository()

// ==================== Application (Query Handlers) ====================
const listResourcesHandler = new ListResourcesQueryHandler(resourceRepository)
const getResourceByIdHandler = new GetResourceByIdQueryHandler(resourceRepository)

// ==================== Facades для Presentation ====================

/**
 * Query Facade - возвращает Validation монады
 * 
 * Presentation Layer сам адаптирует под свой framework:
 * - React Router → throw Response
 * - GraphQL → { data, errors }
 * - CLI → console + exit
 */
export const queries = {
  resources: {
    /**
     * Получить список ресурсов
     * @returns Validation<Error[], ResourceListItemDTO[]>
     */
    list: () => listResourcesHandler.handle(new ListResourcesQuery()),
    
    /**
     * Получить ресурс по ID
     * @returns Validation<Error[], ResourceDetailDTO>
     */
    getById: (id: string) => getResourceByIdHandler.handle(new GetResourceByIdQuery(id))
  }
};
```

#### Регистрация handlers в ServiceContainer

##### ServiceContainer.getQueryBus [#code|#structure:path]

```typescript
static getQueryBus(): IQueryBus {
  if (!this.queryBus) {
    const bus = new InMemoryQueryBus();
    const resourceService = this.getResourceService();
    
    bus.register('ListResourcesQuery', new ListResourcesQueryHandler(resourceService));
    bus.register('GetResourceByIdQuery', new GetResourceByIdQueryHandler(resourceService));
    
    this.queryBus = bus;
  }
  return this.queryBus;
}
```

---

## Использование в Presentation Layer

### Архитектурные границы

```
┌─────────────────────────────────┐
│ CORE (Application Layer - монады)  │
│                                 │
│ Validation<Error[], DTO>       │
└───────────────┬─────────────────┘
                 ↓
┌───────────────┴─────────────────┐
│ Composition Layer (Facade)       │
│ queries.resources.list()        │
│ → возвращает Validation        │
└───────────────┬─────────────────┘
                 ↓
┌───────────────┴─────────────────┐
│ Presentation Layer (Адаптация)  │
│                                 │
│ Адаптирует монаду под framework: │
│ - React Router → Response/throw  │
│ - GraphQL → { data, errors }    │
│ - CLI → console + exit          │
└─────────────────────────────────┘
```

### React Router - Адаптация монад

#### Loader для списка [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '@/composition'

/**
 * Loader - адаптирует Validation монаду под React Router
 */
export async function loader() {
  // 1. Получаем монаду из CORE
  const result = await queries.resources.list()
  
  // 2. Адаптируем под React Router
  if (result.isLeft()) {
    // Railway Left → React Router Error Response
    throw new Response('Failed to load resources', { status: 500 })
  }
  
  // Railway Right → React Router Data
  return { resources: result.value }
}
```

#### Loader для деталей [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/resources.$id.tsx
import { queries } from '@/composition'

export async function loader({ params }: LoaderFunctionArgs) {
  const result = await queries.resources.getById(params.id!)
  
  if (result.isLeft()) {
    throw new Response('Resource not found', { status: 404 })
  }
  
  return { resource: result.value }
}
```

### GraphQL - Адаптация монад (пример)

```typescript
// src/presentation/graphql/resolvers/resource.ts
import { queries } from '@/composition'

const resolvers = {
  Query: {
    resources: async () => {
      const result = await queries.resources.list()
      
      // Адаптация монады под GraphQL response
      return {
        data: result.isRight() ? result.value : null,
        errors: result.isLeft() ? result.value.map(e => ({
          message: e.message,
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })) : null
      }
    }
  }
}
```

### CLI - Адаптация монад (пример)

```typescript
// src/presentation/cli/commands/list.ts
import { queries } from '@/composition'

program
  .command('list')
  .action(async () => {
    const result = await queries.resources.list()
    
    // Адаптация монады под CLI output
    if (result.isLeft()) {
      console.error('❌ Error:', result.value.map(e => e.message).join('\n'))
      process.exit(1)
    }
    
    console.table(result.value)
  })
```

---

## Преимущества

1. **✅ Простота** - loader в одну строку
2. **✅ Инкапсуляция** - вся логика в Handler
3. **✅ Тестируемость** - легко mock QueryBus
4. **✅ CQRS** - разделение чтения/записи
5. **✅ Type Safety** - TypeScript проверяет типы
6. **✅ DDD + Hexagonal** - Ports & Adapters

---

## Best Practices

### ✅ DO

- Query только читает данные (read-only)
- Возвращать DTO, не Domain Objects
- Обрабатывать ошибки в Handler
- Использовать Facade в loaders

### ❌ DON'T

- НЕ изменять данные в Query
- НЕ возвращать Value Objects в DTO
- НЕ дублировать логику в loaders
- НЕ смешивать Query и Command

---

## Структура [#structure:tree]

```
app/
├── composition/
│   ├── queries.ts          # Facade
│   └── ServiceContainer.ts
├── application/queries/
│   ├── IQueryHandler.ts    # Ports
│   ├── IQueryBus.ts
│   ├── ResourceQueries.ts
│   └── handlers/
└── infrastructure/queries/
    └── InMemoryQueryBus.ts # Adapter
```

---

## См. также

- [COMMAND_BUS.md](./COMMAND_BUS.md) - Commands для записи
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура
- [DATA_FLOW.md](./DATA_FLOW.md) - Поток данных
