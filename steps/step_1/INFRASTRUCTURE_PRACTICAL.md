# Infrastructure Layer - Mock Repository

Создание Mock Repository для тестирования и разработки.

> **Назад:** [APPLICATION_LAYER_PIPELINE.md](./APPLICATION_LAYER_PIPELINE.md)

---

## 🎯 Цель

Создать `MockResourceRepository` с in-memory данными для тестирования Handlers.

---

## 📦 Структура

```
src/infrastructure/repositories/
├── MockResourceRepository.ts
└── index.ts
```

---

## 1. MockResourceRepository

**Файл: `src/infrastructure/repositories/MockResourceRepository.ts`**

```typescript
import type { IResourceRepository } from "@/domain";
import { Resource, Namespace, ResourceName, ResourceId } from "@/domain";
import type { Validation } from "@/shared/validation";
import { valid, invalid } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { NotFoundError } from "@/shared/errors";

// Mock данные
const mockResources: Resource[] = [
  Resource.create(
    Namespace.create('social'),
    ResourceName.create('Facebook'),
    'facebook-password-123'
  ).value as Resource,
  
  Resource.create(
    Namespace.create('social'),
    ResourceName.create('Twitter'),
    'twitter-password-456'
  ).value as Resource,
  
  Resource.create(
    Namespace.create('work'),
    ResourceName.create('Jira'),
    'jira-password-789'
  ).value as Resource,
  
  Resource.create(
    Namespace.create('work'),
    ResourceName.create('Slack'),
    'slack-password-abc'
  ).value as Resource,
];

export class MockResourceRepository implements IResourceRepository {
  private resources: Resource[] = [...mockResources];

  async findAll(): Promise<Validation<IError[], Resource[]>> {
    // Симуляция async операции
    await this.delay(100);
    
    return valid([...this.resources]);
  }

  async findById(id: ResourceId): Promise<Validation<IError[], Resource | null>> {
    await this.delay(50);
    
    const resource = this.resources.find((r) => r.id.equals(id));
    return valid(resource || null);
  }

  async findByNamespace(namespace: Namespace): Promise<Validation<IError[], Resource[]>> {
    await this.delay(50);
    
    const filtered = this.resources.filter((r) =>
      r.namespace.equals(namespace)
    );
    
    return valid(filtered);
  }

  async search(query: string): Promise<Validation<IError[], Resource[]>> {
    await this.delay(100);
    
    const lowerQuery = query.toLowerCase();
    const filtered = this.resources.filter(
      (r) =>
        r.name.getValue().toLowerCase().includes(lowerQuery) ||
        r.namespace.getValue().toLowerCase().includes(lowerQuery)
    );
    
    return valid(filtered);
  }

  async save(resource: Resource): Promise<Validation<IError[], Resource>> {
    await this.delay(150);
    
    // Проверка дубликата (можно раскомментировать для тестирования)
    // const exists = this.resources.some(r => 
    //   r.namespace.equals(resource.namespace) && 
    //   r.name.equals(resource.name)
    // );
    // if (exists) {
    //   return invalid([new DuplicateError('Resource', resource.name.getValue())]);
    // }
    
    this.resources.push(resource);
    return valid(resource);
  }

  async update(resource: Resource): Promise<Validation<IError[], Resource>> {
    await this.delay(150);
    
    const index = this.resources.findIndex((r) => r.id.equals(resource.id));
    
    if (index === -1) {
      return invalid([new NotFoundError('Resource', resource.id.getValue())]);
    }
    
    this.resources[index] = resource;
    return valid(resource);
  }

  async delete(id: ResourceId): Promise<Validation<IError[], void>> {
    await this.delay(100);
    
    const index = this.resources.findIndex((r) => r.id.equals(id));
    
    if (index === -1) {
      return invalid([new NotFoundError('Resource', id.getValue())]);
    }
    
    this.resources.splice(index, 1);
    return valid(undefined);
  }

  // Helper для симуляции задержки сети
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Utility методы для тестирования
  reset(): void {
    this.resources = [...mockResources];
  }

  getAll(): Resource[] {
    return [...this.resources];
  }
}
```

---

## 2. Public API

**Файл: `src/infrastructure/repositories/index.ts`**

```typescript
export { MockResourceRepository } from './MockResourceRepository';
```

---

## 3. Инициализация Repository (example)

**Файл: `src/composition/repositories.ts` (пример)**

```typescript
import { MockResourceRepository } from "@/infrastructure/repositories";
import type { IResourceRepository } from "@/domain";

// Singleton instance
let repositoryInstance: IResourceRepository | null = null;

export function getResourceRepository(): IResourceRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MockResourceRepository();
  }
  return repositoryInstance;
}
```

---

## 4. Использование в Handlers (example)

**Файл: `src/composition/queries.ts` (пример)**

```typescript
import { ListResourcesQueryHandler } from "@/application/queries";
import { getResourceRepository } from "./repositories";
import { consoleLogger } from "./logger";

// Создаем Handler с зависимостями
export const listResourcesHandler = new ListResourcesQueryHandler(
  getResourceRepository(),
  consoleLogger
);

// Использование
const query = new ListResourcesQuery();
const result = await listResourcesHandler.handle(query);

result.map((dtos) => {
  console.log('Resources:', dtos);
}).mapLeft((errors) => {
  console.error('Errors:', errors);
});
```

---

## ✅ Проверка

```bash
# Компиляция
pnpm tsc --noEmit

# Запуск тестов (если настроены)
pnpm test
```

---

## 🧪 Тестирование Repository

```typescript
// test/infrastructure/MockResourceRepository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MockResourceRepository } from '@/infrastructure/repositories';
import { Namespace, ResourceId } from '@/domain';

describe('MockResourceRepository', () => {
  let repository: MockResourceRepository;

  beforeEach(() => {
    repository = new MockResourceRepository();
    repository.reset();
  });

  it('findAll возвращает все ресурсы', async () => {
    const result = await repository.findAll();
    
    expect(result.isRight()).toBe(true);
    result.map(resources => {
      expect(resources.length).toBeGreaterThan(0);
    });
  });

  it('findByNamespace фильтрует по namespace', async () => {
    const namespace = Namespace.create('social').value!;
    const result = await repository.findByNamespace(namespace);
    
    expect(result.isRight()).toBe(true);
    result.map(resources => {
      resources.forEach(r => {
        expect(r.namespace.equals(namespace)).toBe(true);
      });
    });
  });

  it('save добавляет новый ресурс', async () => {
    const initialCount = repository.getAll().length;
    
    const resource = Resource.create(
      Namespace.create('test'),
      ResourceName.create('Test Resource'),
      'test-secret'
    ).value!;
    
    const result = await repository.save(resource);
    
    expect(result.isRight()).toBe(true);
    expect(repository.getAll().length).toBe(initialCount + 1);
  });
});
```

---

## 🎯 Особенности Mock Repository

### 1. In-Memory хранилище

```typescript
private resources: Resource[] = [...mockResources];
```

- Данные хранятся в памяти
- При перезапуске приложения - сбрасываются
- Для тестирования - `reset()` метод

### 2. Симуляция задержки сети

```typescript
await this.delay(100);  // Симуляция 100ms задержки
```

- Имитирует реальные API вызовы
- Помогает тестировать асинхронное поведение
- Показывает loading states в UI

### 3. Validation ответы

```typescript
// Успех
return valid(resource);

// Ошибка
return invalid([new NotFoundError('Resource', id)]);
```

- Всегда возвращает `Validation<IError[], T>`
- Соответствует контракту интерфейса
- Type-safe обработка ошибок

---

## 🔄 Миграция на реальный API

Когда понадобится реальный API:

```typescript
// src/infrastructure/repositories/ApiResourceRepository.ts
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

  // ... другие методы
}
```

**Замена в Composition Layer:**
```typescript
// Было:
repositoryInstance = new MockResourceRepository();

// Стало:
repositoryInstance = new ApiResourceRepository(apiClient);
```

---

## 📚 См. также

- [../../docs/QUICK_START.md](../../docs/QUICK_START.md) - быстрый старт
- [../../docs/PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) - структура проекта

---

## 🎉 Шаг 1 завершен!

Теперь у вас есть:
- ✅ Pipeline Pattern
- ✅ Base Handlers с helper методами
- ✅ Domain Layer (Value Objects + Aggregates)
- ✅ Application Layer (Query + Command Handlers с Pipeline)
- ✅ Infrastructure Layer (Mock Repository)

**Следующий шаг:** Интеграция с React Router (Presentation Layer)

---

**Дата создания:** 2025-01-25  
**Версия:** 1.0 (Pipeline approach)
