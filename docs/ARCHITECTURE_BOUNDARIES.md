# Architecture Boundaries & Import Rules

Правила импортов между слоями DDD + настройка алиасов и ESLint для их enforcement.

---

## 🏗️ Слои архитектуры

### 1. Domain Layer
- **Роль**: Бизнес-логика, инварианты, доменные события
- **Зависимости**: Shared (framework-agnostic утилиты)
- **Экспорты**: Entities, Value Objects, Domain Events, Domain Errors, Repository Interfaces

### 2. Application Layer
- **Роль**: Use Cases (Query/Command Handlers), валидация, оркестрация
- **Зависимости**: Domain, Shared
- **Экспорты**: Query/Command типы, Result типы

### 3. Infrastructure Layer
- **Роль**: Адаптеры (API, Storage, Clipboard, etc.)
- **Зависимости**: Domain (реализует интерфейсы), Shared
- **Экспорты**: Repository реализации, Service реализации, Factories

### 4. Shared Utilities 🔧
- **Роль**: Framework-agnostic утилиты (Validation API, Specification Pattern)
- **Зависимости**: Библиотеки-утилиты (`@sweet-monads/either`, `lodash`)
- **Экспорты**: Validation API, Specification Pattern, Type re-exports

**Примечание:** Это НЕ DDD слой! Это технические утилиты для изоляции от конкретных библиотек.

### 5. Composition Layer ⭐
- **Роль**: DI Container + Facades для упрощения UI
- **Зависимости**: Domain, Application, Infrastructure, Shared
- **Экспорты**: `queries`, `commands` facades

**Примечание:** Это НЕ классический DDD слой! Это **Composition Root** из DI паттернов.

### 6. Presentation Layer
- **Роль**: UI (React Router routes, компоненты)
- **Зависимости**: Domain (типы), Composition (facades), Shared
- **Экспорты**: Нет (конечный слой)

---

## 🔒 Правила импортов между слоями

| Из слоя \ В слой | Domain | Application | Infrastructure | Shared | Composition | Presentation |
|-----------------|--------|-------------|----------------|--------|-------------|--------------|
| **Domain** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Application** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Infrastructure** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Shared** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Composition** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Presentation** | ✅* | ❌ | ❌ | ✅ | ✅ | ✅ |

**\*** Presentation импортирует из Domain **ТОЛЬКО типы** (через Public API)

**Ключевые правила:**
- ✅ **Shared** может использоваться **всеми слоями** (Domain, Application, Infrastructure, Composition, Presentation)
- ❌ **Shared** НЕ может импортировать из слоев архитектуры (только библиотеки-утилиты)

---

## 📦 Алиасы TypeScript/Vite

### Публичные алиасы (доступны всем)

#### Конфигурация tsconfig.json

##### tsconfig.json [#code|#config]

```typescript
// Примечание: В проекте используется vite-tsconfig-paths для автоматической
// синхронизации алиасов из tsconfig.json. Ручная настройка не требуется.

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]  // Единый алиас для всех слоев
    }
  }
}
```

### Правила импортов через Public API

| Слой | Может импортировать | Через алиас | Примеры |
|------|-------------------|-------------|--------|
| **Domain** | Domain, Shared | `@/domain/shared/*`, `@/shared/*` | Errors, Invariants, Validation API |
| **Application** | Domain, Shared | `@/domain`, `@/shared/*` | Entities, Value Objects, Specifications |
| **Infrastructure** | Domain, Shared | `@/domain`, `@/shared/*` | Repository Interfaces, Validation API |
| **Shared** | Библиотеки-утилиты | - | `@sweet-monads/either`, `lodash` |
| **Composition** | Domain, Application, Infrastructure, Shared | `@/domain`, `@/application/*`, `@/infrastructure/*`, `@/shared/*` | Handlers, Repositories, Validation |
| **Presentation** | Domain (типы), Composition (facades), Shared | `@/domain`, `@/composition`, `@/shared/*` | DTO, queries, commands, Validation |

**Важно:** 
- ✅ Все импорты через Public API (`index.ts`)
- ✅ **Shared** может использоваться всеми слоями
- ✅ **Shared** НЕ может импортировать из слоев архитектуры
- ✅ Composition - единственный слой с доступом ко всем остальным

---

## 🔍 Примеры импортов

### ✅ Presentation Layer (правильно)

#### Пример импортов в route

##### Route импорты [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx

// ✅ Типы из Domain через Public API
import { Resource, ResourceId, Namespace } from '@/domain'

// ✅ Facades из Composition
import { queries, commands } from '@/composition'

// ✅ Локальные компоненты
import { ResourceList } from '@/components/ResourceList'
import { useModal } from '@/hooks/useModal'

// ❌ НЕЛЬЗЯ импортировать Application/Infrastructure напрямую!
// import { GetResourcesHandler } from '@/application/queries/handlers/GetResourcesHandler'  // ❌
// import { ApiClient } from '@/infrastructure/api/ApiClient'  // ❌

export async function loader() {
  // ✅ Используем facade
  return await queries.resources.list()
}
```

### ✅ Composition Layer (правильно)

#### Пример импортов в Facade

##### Facade импорты [#code|#structure:path]

```typescript
// src/composition/queries/ResourceQueries.ts

// ✅ Типы из Domain
import { Resource } from '@/domain'

// ✅ Handlers через Public API
import { GetResourcesHandler } from '@/application/queries'
import { GetResourceByIdHandler } from '@/application/queries'

// ✅ Инфраструктура через Public API
import { ApiResourceRepository } from '@/infrastructure/repositories'

// Facade для упрощения UI
export const queries = {
  resources: {
    async list() {
      const handler = new GetResourcesHandler(new ApiResourceRepository())
      return await handler.execute()
    },
    async getById(id: string) {
      const handler = new GetResourceByIdHandler(new ApiResourceRepository())
      return await handler.execute({ id })
    }
  }
}
```

### ✅ Application Layer (правильно)

#### Пример импортов в Handler

##### Handler импорты [#code|#structure:path]

```typescript
// src/application/queries/handlers/GetResourcesHandler.ts

// ✅ Только Domain
import { Resource, IResourceRepository } from '@/domain'

export class GetResourcesHandler {
  constructor(private repository: IResourceRepository) {}
  
  async execute(): Promise<Resource[]> {
    return await this.repository.findAll()
  }
}
```

### ✅ Domain Layer (правильно)

#### Пример импортов в Aggregate

##### Aggregate импорты [#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts

// ✅ Только другие Domain объекты (относительные пути или через @/domain)
import { ResourceId } from '../value-objects/ResourceId'
import { Namespace } from '../value-objects/Namespace'
import { DomainError } from '@/domain/shared'

// ❌ НЕЛЬЗЯ импортировать из других слоев!
// import { GetResourcesHandler } from '@/application/queries'  // ❌
```

---

## 🛡️ ESLint Configuration

### Установка плагинов

#### Команда установки

##### Установка ESLint плагина [#command:pnpm]

```bash
pnpm add -D eslint-plugin-boundaries
```

### Конфигурация

#### ESLint config

##### eslint.config.js [#code|#config]

```javascript
// eslint.config.js
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**/*' },
        { type: 'application', pattern: 'src/application/**/*' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**/*' },
        { type: 'composition', pattern: 'src/composition/**/*' },
        { type: 'presentation', pattern: 'src/presentation/**/*' },
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/*.spec.ts'],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          // Domain - полностью изолирован
          {
            from: 'domain',
            allow: ['domain'],
          },
          
          // Application - только Domain
          {
            from: 'application',
            allow: ['domain'],
          },
          
          // Infrastructure - только Domain
          {
            from: 'infrastructure',
            allow: ['domain'],
          },
          
          // Composition - доступ ко всем
          {
            from: 'composition',
            allow: ['domain', 'application', 'infrastructure'],
          },
          
          // Presentation - только Domain (типы) и Composition (facades)
          {
            from: 'presentation',
            allow: ['domain', 'composition', 'presentation'],
          },
        ],
      }],
      
      // Запрет прямого импорта Application/Infrastructure в Presentation
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/application/*', '@/infrastructure/*'],
            message: 'Presentation cannot import Application/Infrastructure directly. Use @/composition facades instead.',
          },
        ],
      }],
    },
  },
]
```

---

## 📁 Структура Public API (index.ts)

Каждый слой должен экспортировать публичный API через `index.ts`.

### Domain Layer Public API

#### Domain index.ts

##### Domain Public API [#code|#structure:path]

```typescript
// src/domain/index.ts

// Entities
export { Resource } from './resource/aggregates/Resource'

// Value Objects
export { ResourceId } from './resource/value-objects/ResourceId'
export { ResourceName } from './resource/value-objects/ResourceName'
export { Namespace } from './resource/value-objects/Namespace'
export { SecretField } from './resource/entities/SecretField'

// Repository Interfaces
export type { IResourceRepository } from './resource/repositories/IResourceRepository'
export type { IPasswordGeneratorService } from './resource/services/IPasswordGeneratorService'

// Domain Events
export { ResourceCreated } from './resource/events/ResourceCreated'
export { ResourceUpdated } from './resource/events/ResourceUpdated'

// Domain Errors
export { DomainError } from './shared/errors/DomainError'
export { InvariantViolationError } from './shared/errors/InvariantViolationError'
```

### Composition Layer Public API

#### Composition index.ts

##### Composition Public API [#code|#structure:path]

```typescript
// src/composition/index.ts

export { queries } from './queries'
export { commands } from './commands'

// Опционально: типы для удобства
export type { 
  GetResourcesResult,
  GetResourceByIdResult,
  CreateResourceResult 
} from './types'
```

---

## 🎨 Примеры использования @client

### Компоненты

#### Пример компонента

##### ResourceList компонент [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList.tsx
import { Resource } from '@/domain'
import { ResourceCard } from '~/components/ResourceCard'
import { EmptyState } from '~/components/EmptyState'

export function ResourceList({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return <EmptyState />
  }
  
  return (
    <div>
      {resources.map(resource => (
        <ResourceCard key={resource.id.value} resource={resource} />
      ))}
    </div>
  )
}
```

### Hooks

#### Пример custom hook

##### useModal hook [#code|#structure:path]

```typescript
// src/presentation/web/react/src/hooks/useModal.ts
import { useContext } from 'react'
import { ModalContext } from '~/contexts/ModalContext'

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}
```

---

## ❌ Анти-паттерны

### 1. Прямой импорт handlers в Presentation

#### Антипаттерн

##### Прямой импорт handlers [#code]

```typescript
// ❌ НЕПРАВИЛЬНО - Presentation не может импортировать Application!
import { GetResourcesHandler } from '@/application/queries'

export async function loader() {
  const handler = new GetResourcesHandler(???)  // А репозиторий откуда?
  return await handler.execute()
}

// ✅ ПРАВИЛЬНО
import { queries } from '@/composition'

export async function loader() {
  return await queries.resources.list()  // Всё внутри!
}
```

### 2. Domain импортирует Application

#### Антипаттерн

##### Domain импортирует Application [#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts

// ❌ НЕПРАВИЛЬНО - Domain не должен знать об Application!
import { CreateResourceCommand } from '@/application/commands'

// ✅ ПРАВИЛЬНО - только Domain
import { ResourceId } from '../value-objects/ResourceId'
import { DomainError } from '@/domain/shared'
```

### 3. Прямой импорт Infrastructure в Presentation

#### Антипаттерн

##### Прямой импорт Infrastructure [#code]

```typescript
// ❌ НЕПРАВИЛЬНО - Presentation не может импортировать Infrastructure!
import { ApiClient } from '@/infrastructure/api'

// ✅ ПРАВИЛЬНО - через Composition facade
import { queries } from '@/composition'
```

---

## 🧪 Проверка правил

### Тесты на импорты

#### Пример теста

##### Архитектурный тест [#code|#structure:path]

```typescript
// tests/architecture.test.ts
import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

describe('Architecture Boundaries', () => {
  it('Domain не импортирует из других слоев', () => {
    const domainFiles = findTypeScriptFiles('src/domain')
    
    domainFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8')
      
      expect(content).not.toContain('@/application')
      expect(content).not.toContain('@/infrastructure')
      expect(content).not.toContain('@/composition')  // Domain не знает о Composition
    })
  })
  
  it('Presentation не импортирует Application/Infrastructure', () => {
    const presentationFiles = findTypeScriptFiles('src/presentation')
    
    presentationFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8')
      
      expect(content).not.toContain('@/application/')
      expect(content).not.toContain('@/infrastructure/')
    })
  })
})

function findTypeScriptFiles(dir: string): string[] {
  // Implementation...
}
```

---

## 📊 Визуализация зависимостей [#diagram:architecture]

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Router routes, components)      │
│                                         │
│  Imports: @domain, @api, @client        │
└──────────────┬──────────────────────────┘
               │
               ↓ @api (facades)
┌──────────────────────────────────────────┐
│         Composition Layer ⭐              │
│     (DI Container + Facades)             │
│                                          │
│  Imports: @/domain, @/application,     │
│           @/infrastructure              │
└─────┬────────────────────────────────┐
      │
      ├─→ @/application (Public API)
      │   ┌────────────────────────────┐
      │   │   Application Layer        │
      │   │  (Query/Command Handlers)  │
      │   │                            │
      │   │  Imports: @/domain         │
      │   └──────┬─────────────────┐
      │              │
      ├─→ @/infrastructure (Public API)
      │   ┌────────────────────────────┐
      │   │   Infrastructure Layer     │
      │   │  (API, Storage, Adapters)  │
      │   │                            │
      │   │  Imports: @domain          │
      │   └──────────┬─────────────────┘
      │              │
      └──────────────↓
         ┌─────────────────────────┐
         │     Domain Layer        │
         │ (Entities, VOs, Events) │
         │                         │
         │  Imports: НИЧЕГО!       │
         └─────────────────────────┘
```

---

## 🎯 Монады в CORE, Адаптация в Presentation

### Архитектурное правило: Railway-oriented Programming

**CORE (Domain + Application + Infrastructure) использует ТОЛЬКО монады** `Validation<E, T>`:

```
┌─────────────────────────────────────────┐
│  CORE (Application Layer)               │
│  ✅ Validation<Error[], T> - монады     │
│                                         │
│  IQueryHandler<Q, R> {                  │
│    handle(q: Q): Promise<Validation<E,R>>│
│  }                                      │
└─────────────────┬───────────────────────┘
                  │
                  │ Возвращает монаду
                  ↓
┌─────────────────┴───────────────────────┐
│  Composition Layer                      │
│  Возвращает монады как есть             │
│                                         │
│  queries.resources.list()               │
│  → Promise<Validation<Error[], DTO[]>>  │
└─────────────────┬───────────────────────┘
                  │
                  │ Монада передается дальше
                  ↓
┌─────────────────┴───────────────────────┐
│  Presentation Layer                     │
│  ⚙️ Адаптирует под свой framework       │
│                                         │
│  React Router: monada → throw Response  │
│  GraphQL: monada → { data, errors }     │
│  CLI: monada → console + exit           │
└─────────────────────────────────────────┘
```

### Почему монады в CORE?

1. ✅ **Type-safe** - TypeScript контролирует обработку ошибок
2. ✅ **Railway-oriented** - композиция операций
3. ✅ **Накопление ошибок** - можно собрать все ошибки валидации
4. ✅ **Единообразие** - один подход во всем ядре
5. ✅ **Тестируемость** - легко mock и проверить результат

### Примеры адаптации в Presentation

#### React Router - Адаптация монады

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '@/composition'

export async function loader() {
  // 1. Получаем монаду из CORE
  const result = await queries.resources.list()
  // result: Validation<Error[], ResourceListItemDTO[]>
  
  // 2. Адаптируем под React Router
  if (result.isLeft()) {
    // Railway Left → React Router Error Response
    throw new Response('Failed to load', { status: 500 })
  }
  
  // Railway Right → React Router Data
  return { resources: result.value }
}
```

#### GraphQL - Адаптация монады (пример)

```typescript
// src/presentation/graphql/resolvers.ts
import { queries } from '@/composition'

const resolvers = {
  Query: {
    resources: async () => {
      const result = await queries.resources.list()
      
      // Адаптация монады под GraphQL
      return {
        data: result.isRight() ? result.value : null,
        errors: result.isLeft() ? result.value.map(e => ({
          message: e.message,
          extensions: { code: 'INTERNAL_ERROR' }
        })) : null
      }
    }
  }
}
```

#### CLI - Адаптация монады (пример)

```typescript
// src/presentation/cli/commands/list.ts
import { queries } from '@/composition'

program.command('list').action(async () => {
  const result = await queries.resources.list()
  
  // Адаптация монады под CLI
  if (result.isLeft()) {
    console.error('❌ Error:', result.value.map(e => e.message).join('\n'))
    process.exit(1)
  }
  
  console.table(result.value)
})
```

### Ключевые принципы

1. ✅ **CORE всегда возвращает монады** - `Validation<E, T>`
2. ✅ **Composition прозрачно передает монады** - без изменений
3. ✅ **Presentation адаптирует под framework** - каждый по-своему
4. ✅ **Нет try-catch в бизнес-логике** - только монады
5. ✅ **Try-catch только для системных ошибок** - сеть, DB, файловая система

### Связанные документы

- [QUERY_HANDLERS.md](./QUERY_HANDLERS.md) - примеры адаптации монад
- [error-handling/ERROR_ESCALATION.md](./error-handling/ERROR_ESCALATION.md) - монады vs try-catch
- [error-handling/APPLICATION_ERROR_HANDLING.md](./error-handling/APPLICATION_ERROR_HANDLING.md) - обработка в Application Layer ⭐

---

## ✅ Чеклист настройки

- [ ] Создан `src/domain/index.ts` с Public API
- [ ] Создан `src/composition/index.ts` с facades
- [ ] Алиас `@/*` в tsconfig.json paths
- [ ] `vite-tsconfig-paths` установлен и настроен
- [ ] Созданы Public API (`index.ts`) в каждом слое
- [ ] Установлен `eslint-plugin-boundaries`
- [ ] Настроены правила в eslint.config.js
- [ ] `pnpm lint` проходит без ошибок
- [ ] Presentation не импортирует Application/Infrastructure
- [ ] Domain не импортирует из других слоев

---

## 📚 Связанные документы

- [DDD & Clean Architecture](./DDD_AND_CLEAN_ARCHITECTURE.md)
- [Composition Layer](./COMPOSITION_LAYER.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [TypeScript & Vite Config](../steps/step_0/TYPESCRIPT_VITE_CONFIG.md)
