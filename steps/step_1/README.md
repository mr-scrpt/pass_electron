# Шаг 1: Вывод списка моковых ресурсов

## 🎯 Цель

Создать минимальный end-to-end поток данных для отображения списка моковых ресурсов на главной странице `/`.

**Поток данных**:
```
MockRepository → Use Case → Remix Loader → React Component → UI
```

## 📊 Визуализация архитектуры

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Request                       │
│                     GET /                                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│              Remix Loader (Server)                       │
│  app/routes/_index.tsx::loader()                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│          Application Layer (Use Case)                    │
│  ListResourcesUseCase.execute()                          │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│         Infrastructure Layer (Repository)                │
│  MockResourceRepository.findAll()                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│              Mock Data (in-memory)                       │
│  mockResources[] - статический массив                   │
└────────────────────┬────────────────────────────────────┘
                     ↓ (return data)
                     ↓
┌────────────────────┴────────────────────────────────────┐
│            React Component (Client)                      │
│  ResourceList → ResourceListItem                         │
│  отрисовка в браузере                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Порядок реализации

> **📘 Важно**: Перед началом ознакомьтесь с [DATA_FLOW.md](../../docs/DATA_FLOW.md) для понимания работы с данными в Remix + Clean Architecture

### Этап 1: Domain Layer (Типы и интерфейсы)

Domain Layer - это основа архитектуры. Здесь определяются типы и контракты, независимые от фреймворков.

#### 1.1 Создать базовые типы

**Файл: `app/domain/resource/types.ts`**
```typescript
export type ResourceId = string
export type FieldId = string
export type DateTime = string // ISO 8601
```

#### 1.2 Создать Value Object: Namespace

**Файл: `app/domain/resource/Namespace.ts`**
```typescript
export class Namespace {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Namespace {
    // Валидация: 2-50 символов, lowercase
    if (!value || value.length < 2 || value.length > 50) {
      throw new Error('Namespace must be 2-50 characters')
    }
    if (!/^[a-z0-9-_]+$/.test(value)) {
      throw new Error('Namespace must contain only lowercase letters, numbers, - and _')
    }
    return new Namespace(value)
  }
  
  get value(): string {
    return this._value
  }
  
  equals(other: Namespace): boolean {
    return this._value === other._value
  }
}
```

**Зачем класс, а не просто строка?**
- Инкапсуляция валидации
- Гарантия корректности данных
- Невозможность создать невалидный Namespace
- Бизнес-логика в одном месте

#### 1.3 Создать Value Object: ResourceName

**Файл: `app/domain/resource/ResourceName.ts`**
```typescript
export class ResourceName {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): ResourceName {
    if (!value || value.length < 1 || value.length > 100) {
      throw new Error('ResourceName must be 1-100 characters')
    }
    return new ResourceName(value)
  }
  
  get value(): string {
    return this._value
  }
  
  equals(other: ResourceName): boolean {
    return this._value === other._value
  }
}
```

#### 1.4 Создать тип для списка ресурсов

**Файл: `app/domain/resource/ResourceListItem.ts`**
```typescript
import type { ResourceId, DateTime } from './types'

/**
 * Упрощенное представление ресурса для списков
 * Не содержит чувствительных данных (только preview)
 */
export interface ResourceListItem {
  id: ResourceId
  namespace: string        // Простая строка для отображения
  name: string            // Простая строка для отображения
  secretPreview?: string  // Первые символы + ***
  fieldsCount: number
  updatedAt: DateTime
}
```

**Почему здесь строки, а не Value Objects?**
- ResourceListItem - это DTO для отображения
- Не содержит бизнес-логики
- Удобно для сериализации и передачи в UI

#### 1.5 Создать Public API для domain/resource

**Файл: `app/domain/resource/index.ts`**
```typescript
export { Namespace } from './Namespace'
export { ResourceName } from './ResourceName'
export type { ResourceListItem } from './ResourceListItem'
export type { ResourceId, FieldId, DateTime } from './types'
```

#### 1.6 Создать интерфейс репозитория

**Файл: `app/domain/repositories/IResourceRepository.ts`**
```typescript
import type { ResourceListItem, ResourceId, Namespace } from '../resource'

/**
 * Интерфейс репозитория ресурсов
 * Определен в Domain Layer, реализован в Infrastructure Layer
 */
export interface IResourceRepository {
  findAll(): Promise<ResourceListItem[]>
  findById(id: ResourceId): Promise<ResourceListItem | null>
  findByNamespace(namespace: Namespace): Promise<ResourceListItem[]>
  search(query: string): Promise<ResourceListItem[]>
}
```

**Почему интерфейс в Domain?**
- Domain определяет контракт
- Infrastructure реализует детали
- Dependency Inversion Principle (DIP)

#### 1.7 Создать Public API для repositories

**Файл: `app/domain/repositories/index.ts`**
```typescript
export type { IResourceRepository } from './IResourceRepository'
```

---

### Этап 2: Infrastructure Layer (Mock данные)

Infrastructure Layer реализует интерфейсы из Domain Layer.

#### 2.1 Создать моковые данные

**Файл: `app/infrastructure/mocks/resources.mock.ts`**
```typescript
import type { ResourceListItem } from '~/domain/resource'

export const mockResources: ResourceListItem[] = [
  {
    id: '1',
    namespace: 'social',
    name: 'facebook',
    secretPreview: 'Fb***',
    fieldsCount: 3,
    updatedAt: new Date('2024-10-15').toISOString()
  },
  {
    id: '2',
    namespace: 'social',
    name: 'twitter',
    secretPreview: 'Tw***',
    fieldsCount: 2,
    updatedAt: new Date('2024-10-14').toISOString()
  },
  {
    id: '3',
    namespace: 'work',
    name: 'github',
    secretPreview: 'Gh***',
    fieldsCount: 4,
    updatedAt: new Date('2024-10-16').toISOString()
  },
  {
    id: '4',
    namespace: 'banking',
    name: 'revolut',
    secretPreview: 'Re***',
    fieldsCount: 2,
    updatedAt: new Date('2024-10-13').toISOString()
  },
  {
    id: '5',
    namespace: 'social',
    name: 'instagram',
    secretPreview: 'In***',
    fieldsCount: 3,
    updatedAt: new Date('2024-10-12').toISOString()
  }
]
```

#### 2.2 Создать Public API для mocks

**Файл: `app/infrastructure/mocks/index.ts`**
```typescript
export { mockResources } from './resources.mock'
```

#### 2.3 Реализовать Mock Repository

**Файл: `app/infrastructure/repositories/MockResourceRepository.ts`**
```typescript
import type { IResourceRepository } from '~/domain/repositories'
import type { ResourceListItem, ResourceId, Namespace } from '~/domain/resource'
import { mockResources } from '../mocks'

/**
 * Mock реализация репозитория ресурсов
 * Использует in-memory данные для разработки
 */
export class MockResourceRepository implements IResourceRepository {
  async findAll(): Promise<ResourceListItem[]> {
    // Имитация асинхронности (как будто запрос к API)
    return Promise.resolve([...mockResources])
  }
  
  async findById(id: ResourceId): Promise<ResourceListItem | null> {
    const resource = mockResources.find(r => r.id === id)
    return Promise.resolve(resource ?? null)
  }
  
  async findByNamespace(namespace: Namespace): Promise<ResourceListItem[]> {
    const filtered = mockResources.filter(r => r.namespace === namespace.value)
    return Promise.resolve(filtered)
  }
  
  async search(query: string): Promise<ResourceListItem[]> {
    const lowerQuery = query.toLowerCase()
    const filtered = mockResources.filter(r => 
      r.namespace.includes(lowerQuery) ||
      r.name.includes(lowerQuery)
    )
    return Promise.resolve(filtered)
  }
}
```

**Ключевые моменты**:
- Реализует интерфейс `IResourceRepository`
- Возвращает копию данных (иммутабельность)
- Асинхронные методы (как у реального API)

#### 2.4 Создать Public API для repositories

**Файл: `app/infrastructure/repositories/index.ts`**
```typescript
export { MockResourceRepository } from './MockResourceRepository'
```

---

### Этап 3: Application Layer (Application Service + Use Case)

Application Layer содержит:
- **Application Services** - координируют Use Cases, управляют транзакциями
- **Use Cases** - содержат бизнес-логику конкретных операций

#### 3.1 Создать Application Service

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
}
```

**Зачем Application Service?**
- Скрывает детали композиции Use Cases от UI
- Единая точка для координации операций
- Легко добавить транзакции, логирование, кеширование
- Изоляция Presentation от Infrastructure

#### 3.2 Создать Public API для Application Service

**Файл: `app/application/services/index.ts`**
```typescript
export { ResourceService } from './ResourceService'
export type { ListResourcesQuery } from './ResourceService'
```

#### 3.3 Создать Use Case для получения списка

**Файл: `app/application/use-cases/ListResources/ListResourcesUseCase.ts`**
```typescript
import type { IResourceRepository } from '~/domain/repositories'
import type { ResourceListItem } from '~/domain/resource'

/**
 * Запрос для получения списка ресурсов
 */
export interface ListResourcesQuery {
  namespace?: string
  search?: string
}

/**
 * Use Case: Получить список ресурсов
 * 
 * Ответственность:
 * - Координация получения данных из репозитория
 * - Применение фильтров (в будущем)
 * - Возврат данных в формате для UI
 */
export class ListResourcesUseCase {
  constructor(private repository: IResourceRepository) {}
  
  async execute(query: ListResourcesQuery = {}): Promise<ResourceListItem[]> {
    // Пока просто получаем все ресурсы
    // В будущем здесь будет фильтрация и поиск
    const resources = await this.repository.findAll()
    
    return resources
  }
}
```

**Зачем Use Case если есть Application Service?**
- Use Case содержит конкретную бизнес-операцию
- Application Service координирует несколько Use Cases
- Легко добавить логику (сортировка, фильтрация)
- Тестируемость каждой операции отдельно

#### 3.4 Создать Public API для Use Case

**Файл: `app/application/use-cases/ListResources/index.ts`**
```typescript
export { ListResourcesUseCase } from './ListResourcesUseCase'
export type { ListResourcesQuery } from './ListResourcesUseCase'
```

#### 3.5 Создать общий Public API для use-cases

**Файл: `app/application/use-cases/index.ts`**
```typescript
export { ListResourcesUseCase } from './ListResources'
export type { ListResourcesQuery } from './ListResources'
```

---

### Этап 4: Infrastructure Layer (DI Container)

Infrastructure Layer управляет зависимостями через DI Container.

#### 4.1 Создать DI Container (Composition Root)

**Файл: `app/infrastructure/di/container.ts`**
```typescript
import { MockResourceRepository } from '~/infrastructure/repositories'
import { ResourceService } from '~/application/services/ResourceService'
import type { IResourceRepository } from '~/domain/repositories'

/**
 * DI Container - единая точка управления зависимостями
 * Паттерн: Composition Root
 * 
 * Все зависимости создаются здесь, а не в UI слое
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
   * В будущем здесь будет переключение через env
   */
  private static createResourceRepository(): IResourceRepository {
    // Пока используем только Mock
    // В будущем: process.env.USE_MOCK === 'true' ? Mock : Real
    return new MockResourceRepository()
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

**Зачем DI Container?**
- Единая точка управления всеми зависимостями
- Легко переключать Mock ↔ Real API
- Presentation Layer не знает о деталях реализации
- Легко тестировать (можно создать тестовый контейнер)

#### 4.2 Создать Public API для DI Container

**Файл: `app/infrastructure/di/index.ts`**
```typescript
export { getResourceService } from './container'
export { resetContainer } from './container'
```

---

### Этап 5: Presentation Layer (UI)

Presentation Layer отвечает за отображение данных пользователю.

#### 5.1 Создать компонент ResourceListItem

**Файл: `app/components/ResourceList/ResourceListItem.tsx`**
```typescript
import type { ResourceListItem } from '~/domain/resource'

interface Props {
  resource: ResourceListItem
}

/**
 * Компонент для отображения одного ресурса в списке
 */
export function ResourceListItem({ resource }: Props) {
  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex justify-between items-center">
        {/* Левая часть: namespace и name */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            [{resource.namespace}]
          </span>
          <span className="font-semibold text-gray-900">
            {resource.name}
          </span>
        </div>
        
        {/* Правая часть: метаданные */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            {resource.fieldsCount} {resource.fieldsCount === 1 ? 'field' : 'fields'}
          </span>
          {resource.secretPreview && (
            <span className="font-mono text-xs text-gray-400">
              {resource.secretPreview}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### 5.2 Создать компонент ResourceList

**Файл: `app/components/ResourceList/ResourceList.tsx`**
```typescript
import type { ResourceListItem as ResourceListItemType } from '~/domain/resource'
import { ResourceListItem } from './ResourceListItem'

interface Props {
  resources: ResourceListItemType[]
}

/**
 * Компонент для отображения списка ресурсов
 */
export function ResourceList({ resources }: Props) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No resources found</p>
        <p className="text-sm mt-2">Create your first resource to get started</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {resources.map(resource => (
        <ResourceListItem key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
```

#### 5.3 Создать Public API для компонентов

**Файл: `app/components/ResourceList/index.ts`**
```typescript
export { ResourceList } from './ResourceList'
export { ResourceListItem } from './ResourceListItem'
```

#### 5.4 Создать Remix Route

**Файл: `app/routes/_index.tsx`**
```typescript
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { getResourceService } from '~/infrastructure/di/container'
import { ResourceList } from '~/components/ResourceList'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ
 * 
 * Loader выполняется ТОЛЬКО на сервере (Node.js)
 * НЕ выполняется на клиенте
 * 
 * Аналог: getServerSideProps в Next.js Pages Router
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // 1. Получаем сервис из DI Container
  //    Все зависимости управляются в одном месте
  const resourceService = getResourceService()
  
  // 2. Вызываем метод Application Service
  //    Application Service координирует Use Cases
  const resources = await resourceService.listResources()
  
  // 3. Возвращаем данные (сериализуются в JSON)
  return json({ resources })
}

/**
 * ✅ КЛИЕНТСКИЙ КОМПОНЕНТ (+ SSR)
 * 
 * Выполняется:
 * - На сервере при SSR (первый рендер)
 * - На клиенте после hydration
 */
export default function Index() {
  // Получаем данные из loader (типизированные)
  // useLoaderData - это hook для получения данных,
  // НЕ для фетчинга (данные уже загружены в loader)
  const { resources } = useLoaderData<typeof loader>()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Заголовок */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Password Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your passwords securely
          </p>
        </header>
        
        {/* Список ресурсов */}
        <main>
          <ResourceList resources={resources} />
        </main>
      </div>
    </div>
  )
}
```

**Ключевые моменты Remix:**

1. **`loader()` - это СЕРВЕР**, не клиент
   - Выполняется на Node.js
   - Имеет доступ к файловой системе, БД, env переменным
   - Вызывается перед каждым рендерингом страницы

2. **Не путать с Next.js**
   - В Next.js: `'use server'` / `'use client'` (explicit)
   - В Remix: convention-based (по имени функции)

3. **Зачем Application Service?**
   - Loader НЕ создает репозитории напрямую
   - Loader получает готовый сервис из DI Container
   - Presentation Layer изолирован от Infrastructure

4. **Type Safety**
   - `useLoaderData<typeof loader>()` - полная типизация
   - TypeScript знает структуру данных

**Детали см. в [DATA_FLOW.md](../../docs/DATA_FLOW.md)**

---

## 📁 Структура файлов

После выполнения шага у вас будет:

```
app/
├── domain/
│   ├── resource/
│   │   ├── types.ts
│   │   ├── Namespace.ts
│   │   ├── ResourceName.ts
│   │   ├── ResourceListItem.ts
│   │   └── index.ts
│   └── repositories/
│       ├── IResourceRepository.ts
│       └── index.ts
│
├── infrastructure/
│   ├── di/                          # ← НОВОЕ: DI Container
│   │   ├── container.ts
│   │   └── index.ts
│   ├── mocks/
│   │   ├── resources.mock.ts
│   │   └── index.ts
│   └── repositories/
│       ├── MockResourceRepository.ts
│       └── index.ts
│
├── application/
│   ├── services/                     # ← НОВОЕ: Application Services
│   │   ├── ResourceService.ts
│   │   └── index.ts
│   └── use-cases/
│       ├── ListResources/
│       │   ├── ListResourcesUseCase.ts
│       │   └── index.ts
│       └── index.ts
│
├── components/
│   └── ResourceList/
│       ├── ResourceList.tsx
│       ├── ResourceListItem.tsx
│       └── index.ts
│
└── routes/
    └── _index.tsx
```

---

## ✅ Чек-лист выполнения

### Domain Layer
- [ ] Создать `app/domain/resource/types.ts`
- [ ] Создать `app/domain/resource/Namespace.ts`
- [ ] Создать `app/domain/resource/ResourceName.ts`
- [ ] Создать `app/domain/resource/ResourceListItem.ts`
- [ ] Создать `app/domain/resource/index.ts`
- [ ] Создать `app/domain/repositories/IResourceRepository.ts`
- [ ] Создать `app/domain/repositories/index.ts`

### Infrastructure Layer
- [ ] Создать `app/infrastructure/mocks/resources.mock.ts`
- [ ] Создать `app/infrastructure/mocks/index.ts`
- [ ] Создать `app/infrastructure/repositories/MockResourceRepository.ts`
- [ ] Создать `app/infrastructure/repositories/index.ts`
- [ ] Создать `app/infrastructure/di/container.ts` **← НОВОЕ**
- [ ] Создать `app/infrastructure/di/index.ts` **← НОВОЕ**

### Application Layer
- [ ] Создать `app/application/services/ResourceService.ts` **← НОВОЕ**
- [ ] Создать `app/application/services/index.ts` **← НОВОЕ**
- [ ] Создать `app/application/use-cases/ListResources/ListResourcesUseCase.ts`
- [ ] Создать `app/application/use-cases/ListResources/index.ts`
- [ ] Создать `app/application/use-cases/index.ts`

### Presentation Layer
- [ ] Создать `app/components/ResourceList/ResourceListItem.tsx`
- [ ] Создать `app/components/ResourceList/ResourceList.tsx`
- [ ] Создать `app/components/ResourceList/index.ts`
- [ ] Создать `app/routes/_index.tsx`

### Запуск и проверка
- [ ] Запустить `npm run dev`
- [ ] Открыть `http://localhost:5173` (или другой порт)
- [ ] Проверить что список ресурсов отображается
- [ ] Проверить стили и адаптивность

---

## 🎓 Что вы изучите

1. **Domain-Driven Design**:
   - Value Objects (Namespace, ResourceName)
   - Интерфейсы репозиториев
   - Типы и контракты

2. **Clean Architecture**:
   - Разделение на слои
   - Dependency Inversion
   - Public API модулей

3. **Remix Framework**:
   - Loader функции
   - Server-side data fetching
   - Type-safe data flow

4. **React Patterns**:
   - Component composition
   - Props typing
   - Conditional rendering

---

## 🚀 Запуск

```bash
# Установка зависимостей (если еще не установлены)
npm install

# Запуск dev сервера
npm run dev

# Откройте браузер
# http://localhost:5173
```

---

## 🔍 Проверка результата

Вы должны увидеть:
- Заголовок "Password Manager"
- Список из 5 ресурсов
- Каждый ресурс показывает: namespace, name, количество полей
- При наведении - изменение фона

---

## 📝 Следующие шаги

После успешного завершения Шага 1:
- **Шаг 2**: Добавить поиск и фильтрацию
- **Шаг 3**: Создать страницу детального просмотра ресурса
- **Шаг 4**: Добавить создание ресурса

---

## 💡 Советы

1. **Создавайте файлы по порядку** - снизу вверх (Domain → Infrastructure → Application → Presentation)
2. **Проверяйте типы** - TypeScript должен подсказывать автокомплит
3. **Используйте Public API** - импортируйте через `index.ts`
4. **Тестируйте постепенно** - после каждого этапа можно запустить и проверить

---

## ❓ FAQ

**Q: Зачем так много файлов для простого списка?**  
A: Мы строим масштабируемую архитектуру. Когда добавятся новые фичи, структура уже будет готова.

**Q: Можно ли пропустить Value Objects?**  
A: Нет, они важны для валидации и инкапсуляции бизнес-правил.

**Q: Почему Mock Repository асинхронный?**  
A: Чтобы код был готов к замене на реальный API без изменений.
