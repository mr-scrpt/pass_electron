# Infrastructure - Repository Implementations

## MockResourceRepository

Mock реализация `IResourceRepository` для разработки и тестирования.

### Архитектура

```
mockData.ts (простые объекты)
     ↓
MockResourceRepository
     ├─ storage: ResourceData[]        ← In-memory хранилище (DTO)
     ├─ toDomain(data) → Resource      ← DTO → Domain
     └─ toData(resource) → ResourceData ← Domain → DTO
     ↓
IResourceRepository (возвращает Domain объекты)
```

### Характеристики

- ✅ **In-memory хранилище** - простые объекты (DTO) в памяти
- ✅ **Моковые данные** - 4 предзаполненных ресурса в `mockData.ts`
- ✅ **Преобразование DTO ↔ Domain** - как в реальном API/DB Repository
- ✅ **Симуляция задержки** - имитация сетевых запросов
- ✅ **Type-safe** - возвращает `Validation<IError[], T>`
- ✅ **DDD-compliant** - реализует интерфейс из Domain Layer

### Моковые данные (mockData.ts)

```typescript
// 4 ресурса (простые объекты):
{
  id: "550e8400-e29b-41d4-a716-446655440001",
  namespace: "social",
  name: "Facebook",
  secret: "facebook-password-123",
  createdAt: "2025-01-20T10:00:00.000Z",
  updatedAt: "2025-01-20T10:00:00.000Z"
}
// ... ещё 3 ресурса (Twitter, Jira, Slack)
```

### Пример использования

```typescript
import { MockResourceRepository } from '@/infrastructure/repositories';
import { Namespace } from '@/domain';

const repository = new MockResourceRepository();

// Получить все ресурсы
const allResult = await repository.findAll();
allResult.map(resources => {
  console.log(`Found ${resources.length} resources`);
});

// Найти по namespace
const namespaceValidation = Namespace.create('social');
if (namespaceValidation.isRight()) {
  const socialResult = await repository.findByNamespace(namespaceValidation.value);
  socialResult.map(resources => {
    console.log(`Social resources: ${resources.length}`);
  });
}

// Поиск
const searchResult = await repository.search('face');
searchResult.map(resources => {
  console.log(`Search results: ${resources.length}`);
});
```

### Utility методы

```typescript
// Сбросить к начальному состоянию
repository.reset();

// Получить все простые данные (для отладки)
const all = repository.getAll(); // ResourceData[]

// Количество
const count = repository.count(); // number
```

### Как работает преобразование DTO ↔ Domain

```typescript
// 1. При чтении из storage (DTO → Domain)
private toDomain(data: ResourceData): Validation<IError[], Resource> {
  return Resource.create(
    Namespace.create(data.namespace),
    ResourceName.create(data.name),
    data.secret
  );
}

// 2. При записи в storage (Domain → DTO)
private toData(resource: Resource): ResourceData {
  return {
    id: resource.id.getValue(),
    namespace: resource.namespace.getValue(),
    name: resource.name.getValue(),
    secret: resource.secret,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString()
  };
}
```

**Зачем это нужно?**
- ✅ Имитирует реальный API/DB Repository (они работают с DTO)
- ✅ Domain объекты НЕ хранятся напрямую (сериализация/десериализация)
- ✅ Простая замена на ApiResourceRepository без изменения логики

### Миграция на ApiResourceRepository

Когда понадобится реальный API:

```typescript
// 1. Создать ApiResourceRepository.ts
export class ApiResourceRepository implements IResourceRepository {
  constructor(private readonly apiClient: IApiClient) {}
  
  async findAll(): Promise<Validation<IError[], Resource[]>> {
    try {
      const response = await this.apiClient.get('/api/resources');
      const resources = response.data.map(dto => this.toDomain(dto));
      return valid(resources);
    } catch (error) {
      return invalid([new NetworkError('Failed to fetch resources')]);
    }
  }
}

// 2. Заменить в Composition Layer
// Было:
const repository = new MockResourceRepository();

// Стало:
const repository = new ApiResourceRepository(apiClient);
```

---

## См. также

- [Domain IResourceRepository](../../domain/resource/repositories/IResourceRepository.ts) - интерфейс
- [DDD_AND_CLEAN_ARCHITECTURE.md](../../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - Repository Pattern
