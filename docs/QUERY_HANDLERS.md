# Query Handlers & Facade Pattern

Чтение данных в Remix Loaders через Query Handlers и Facade, следуя CQRS, DDD и Clean Architecture.

## Проблема

```typescript
// ❌ Loader делает слишком много
export async function loader({ request }: LoaderFunctionArgs) {
  const resourceService = getResourceService();  // Знает о DI
  const resources = await resourceService.listResources();  // Знает о сервисе
  return json({ resources });  // Делает сериализацию
}
```

## Решение

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

### 1. Query Interfaces (Application Layer)

**`app/application/queries/IQueryHandler.ts`**

```typescript
export interface IQuery {
  readonly type: string;
}

export interface QueryResult<T = any> {
  data: T;
  error?: string;
}

export interface IQueryHandler<TQuery extends IQuery, TResult> {
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}
```

**`app/application/queries/IQueryBus.ts`**

```typescript
export interface IQueryBus {
  execute<TQuery extends IQuery, TResult>(
    query: TQuery
  ): Promise<QueryResult<TResult>>;
  
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void;
}
```

### 2. Query Classes

**`app/application/queries/ResourceQueries.ts`**

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

**`app/application/queries/handlers/ListResourcesQueryHandler.ts`**

```typescript
export class ListResourcesQueryHandler 
  implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]> {
  
  constructor(private resourceService: ResourceService) {}
  
  async handle(query: ListResourcesQuery): Promise<QueryResult<ResourceListItemDTO[]>> {
    try {
      const resources = await this.resourceService.listResources(query.filters);
      
      // Преобразуем Domain Model → DTO
      const data = resources.map(r => ({
        id: r.id.value,
        namespace: r.namespace.value,
        name: r.name.value,
        createdAt: r.createdAt.toISOString()
      }));
      
      return { data };
    } catch (error) {
      return { data: [], error: 'Failed to load resources' };
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

**`app/infrastructure/queries/InMemoryQueryBus.ts`**

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

**`app/composition/queries.ts`**

```typescript
import { json } from 'react-router';
import { getQueryBus } from './ServiceContainer';
import { ListResourcesQuery, GetResourceByIdQuery } from '~/application/queries';

/**
 * Facade: инкапсулирует QueryBus, парсинг Request, сериализацию
 */
export const queries = {
  async listResources(filtersOrRequest?: { search?: string } | Request) {
    let filters;
    
    if (filtersOrRequest instanceof Request) {
      const url = new URL(filtersOrRequest.url);
      filters = {
        search: url.searchParams.get('search') || undefined,
        namespace: url.searchParams.get('namespace') || undefined
      };
    } else {
      filters = filtersOrRequest;
    }

    const queryBus = getQueryBus();
    const result = await queryBus.execute(new ListResourcesQuery(filters));
    return json(result);
  },

  async getResourceById(resourceId: string) {
    const queryBus = getQueryBus();
    const result = await queryBus.execute(new GetResourceByIdQuery(resourceId));
    return json(result);
  }
};
```

**`app/composition/ServiceContainer.ts`** (обновление)

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

## Использование в Loaders

### Список ресурсов

```typescript
// app/routes/_index.tsx
import { queries } from '~/composition';

export async function loader({ request }: LoaderFunctionArgs) {
  return queries.resources.list(request);  // ✅ Одна строка!
}
```

### Детальная страница

```typescript
// app/routes/resources.$id.tsx
import { queries } from '~/composition';

export async function loader({ params }: LoaderFunctionArgs) {
  return queries.resources.getById(params.id!);  // ✅ Одна строка!
}
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

## Структура

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
