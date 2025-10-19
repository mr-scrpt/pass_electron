# Query Handlers & Facade Pattern `#query-handlers` `#cqrs` `#facade-pattern`

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

**`src/application/queries/IQueryHandler.ts`**  `#structure:

```typescript
export interface IQuery {  // #interface:IQuery
  readonly type: string;
}

export interface QueryResult<T = any> {
  data: T;
  error?: string;
}

export interface IQueryHandler<TQuery extends IQuery, TResult> {  // #interface:IQueryHandler
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}
```

**`src/application/queries/IQueryBus.ts`**  `#structure:

```typescript
export interface IQueryBus {  // #interface:IQueryBus
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

**`src/application/queries/ResourceQueries.ts`**  `#structure:

```typescript
export class ListResourcesQuery implements IQuery {  // #class:ListResourcesQuery
  readonly type = 'ListResourcesQuery';
  constructor(public readonly filters?: { search?: string; namespace?: string }) {}
}

export class GetResourceByIdQuery implements IQuery {  // #class:GetResourceByIdQuery
  readonly type = 'GetResourceByIdQuery';
  constructor(public readonly resourceId: string) {}
}
```

### 3. Query Handlers

**`src/application/queries/handlers/ListResourcesQueryHandler.ts`**  `#structure:

```typescript
export class ListResourcesQueryHandler  // #class:ListResourcesQueryHandler
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

export interface ResourceListItemDTO {  // #interface:ResourceListItemDTO
  id: string;
  namespace: string;
  name: string;
  createdAt: string;
}
```

### 4. QueryBus Adapter (Infrastructure)

**`src/infrastructure/queries/InMemoryQueryBus.ts`**  `#structure:

```typescript
export class InMemoryQueryBus implements IQueryBus {  // #class:InMemoryQueryBus
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

**`src/composition/queries/index.ts`**  `#structure:

```typescript
import { json } from 'react-router';
import { getQueryBus } from '../ServiceContainer';  // #class:ServiceContainer #structure:
import { ListResourcesQuery, GetResourceByIdQuery } from '@/application/queries';  // #alias:@/ #class:ListResourcesQuery #class:GetResourceByIdQuery #structure:

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

**`src/composition/ServiceContainer.ts`** (обновление)  `#structure:

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
// src/presentation/web/react/src/routes/_index.tsx  #structure:
import { queries } from '@/composition';  // #alias:@/ #structure:

export async function loader({ request }: LoaderFunctionArgs) {
  return queries.resources.list(request);  // ✅ Одна строка!
}
```

### Детальная страница

```typescript
// src/presentation/web/react/src/routes/resources.$id.tsx  #structure:
import { queries } from '@/composition';  // #alias:@/ #structure:

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
├── composition/                  #structure:
│   ├── queries.ts          # Facade
│   └── ServiceContainer.ts  #class:ServiceContainer
├── application/queries/          #structure:
│   ├── IQueryHandler.ts    # Ports #interface:IQueryHandler
│   ├── IQueryBus.ts        #interface:IQueryBus
│   ├── ResourceQueries.ts  #class:ListResourcesQuery
│   └── handlers/           #structure:
└── infrastructure/queries/       #structure:
    └── InMemoryQueryBus.ts # Adapter #class:InMemoryQueryBus
```

---

## См. также

- [COMMAND_BUS.md](./COMMAND_BUS.md) - Commands для записи
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура
- [DATA_FLOW.md](./DATA_FLOW.md) - Поток данных
