# Architecture Boundaries & Import Rules

Правила импортов между слоями DDD + настройка алиасов и ESLint для их enforcement.

---

## 🏗️ Слои архитектуры

### 1. Domain Layer
- **Роль**: Бизнес-логика, инварианты, доменные события
- **Зависимости**: Никаких! Полностью изолирован
- **Экспорты**: Entities, Value Objects, Domain Events, Domain Errors, Repository Interfaces

### 2. Application Layer
- **Роль**: Use Cases (Query/Command Handlers), валидация, оркестрация
- **Зависимости**: Domain
- **Экспорты**: Query/Command типы, Result типы

### 3. Infrastructure Layer
- **Роль**: Адаптеры (API, Storage, Clipboard, etc.)
- **Зависимости**: Domain (реализует интерфейсы)
- **Экспорты**: Repository реализации, Service реализации, Factories

### 4. Composition Layer ⭐
- **Роль**: DI Container + Facades для упрощения UI
- **Зависимости**: Domain, Application, Infrastructure
- **Экспорты**: `queries`, `commands` facades

**Примечание:** Это НЕ классический DDD слой! Это **Composition Root** из DI паттернов.

### 5. Presentation Layer
- **Роль**: UI (React Router routes, компоненты)
- **Зависимости**: Domain (типы), Composition (facades)
- **Экспорты**: Нет (конечный слой)

---

## 🔒 Правила импортов между слоями

| Из слоя \ В слой | Domain | Application | Infrastructure | Composition | Presentation |
|-----------------|--------|-------------|----------------|-------------|--------------|
| **Domain** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Application** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Infrastructure** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Composition** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Presentation** | ✅* | ❌ | ❌ | ✅ | ✅ |

**\*** Presentation импортирует из Domain **ТОЛЬКО типы** (через Public API)

---

## 📦 Алиасы TypeScript/Vite

### Публичные алиасы (доступны всем)

```typescript
// vite.config.ts
resolve: {
  alias: {
    // ✅ Public API - указывают на index.ts (только экспортированное)
    '@domain': path.resolve(projectRoot, 'src/domain/index.ts'),
    '@api': path.resolve(projectRoot, 'src/composition/index.ts'),
    
    // ✅ Локальные алиасы для Presentation
    '@client': path.resolve(projectRoot, 'src/presentation/web/react/src'),
    
    // ⚠️ Internal - указывают на директорию (доступ ко всем файлам)
    // Использовать ТОЛЬКО внутри разрешенных слоев!
    '@internal/application': path.resolve(projectRoot, 'src/application'),
    '@internal/infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
  }
}
```

### Таблица назначения

| Алиас | Указывает на | Кто может использовать | Зачем |
|-------|--------------|------------------------|-------|
| `@domain` | `src/domain/index.ts` | Все слои | Типы, entities, value objects |
| `@api` | `src/composition/index.ts` | Presentation | Facades (queries, commands) |
| `@client` | `src/presentation/web/react/src` | Только Presentation | Локальные компоненты/hooks |
| `@internal/application` | `src/application/` (директория) | Composition | Доступ к handlers |
| `@internal/infrastructure` | `src/infrastructure/` (директория) | Composition | Доступ к адаптерам |

---

## 🔍 Примеры импортов

### ✅ Presentation Layer (правильно)

```typescript
// src/presentation/web/react/src/routes/_index.tsx

// ✅ Типы из Domain через Public API
import { Resource, ResourceId, Namespace } from '@domain'

// ✅ Facades из Composition
import { queries, commands } from '@api'

// ✅ Локальные компоненты через @client
import { ResourceList } from '@client/components/ResourceList'
import { useModal } from '@client/hooks/useModal'

// ❌ НЕЛЬЗЯ импортировать handlers напрямую!
// import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'

// ❌ НЕЛЬЗЯ импортировать infrastructure!
// import { ApiClient } from '@internal/infrastructure/api/ApiClient'

export async function loader() {
  // ✅ Используем facade
  return await queries.resources.list()
}
```

### ✅ Composition Layer (правильно)

```typescript
// src/composition/queries.ts

// ✅ Типы из Domain
import { Resource } from '@domain'

// ✅ Handlers через @internal (доступ к реализации)
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'
import { GetResourceByIdHandler } from '@internal/application/queries/GetResourceByIdHandler'

// ✅ Инфраструктура через @internal
import { ApiResourceRepository } from '@internal/infrastructure/repositories/ApiResourceRepository'

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

```typescript
// src/application/queries/GetResourcesHandler.ts

// ✅ Только Domain
import { Resource, IResourceRepository } from '@domain'

export class GetResourcesHandler {
  constructor(private repository: IResourceRepository) {}
  
  async execute(): Promise<Resource[]> {
    return await this.repository.findAll()
  }
}
```

### ✅ Domain Layer (правильно)

```typescript
// src/domain/resource/Resource.ts

// ✅ Только другие Domain объекты (относительные пути или через @domain)
import { ResourceId } from './ResourceId'
import { Namespace } from './Namespace'
import { DomainError } from '@domain/shared/errors/DomainError'

// ❌ НЕЛЬЗЯ импортировать из других слоев!
// import { GetResourcesHandler } from '@internal/application/...'
```

---

## 🛡️ ESLint Configuration

### Установка плагинов

```bash
pnpm add -D eslint-plugin-boundaries
```

### Конфигурация

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
      
      // Запрет использования @internal/* в Presentation
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@internal/*'],
            message: 'Presentation cannot use @internal/* aliases. Use @domain or @api instead.',
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

```typescript
// src/domain/index.ts

// Entities
export { Resource } from './resource/Resource'

// Value Objects
export { ResourceId } from './resource/ResourceId'
export { ResourceName } from './resource/ResourceName'
export { Namespace } from './resource/Namespace'
export { SecretField } from './resource/SecretField'

// Repository Interfaces
export type { IResourceRepository } from './repositories/IResourceRepository'
export type { IPasswordGeneratorService } from './services/IPasswordGeneratorService'

// Domain Events
export { ResourceCreated } from './events/ResourceCreated'
export { ResourceUpdated } from './events/ResourceUpdated'

// Domain Errors
export { DomainError } from './shared/errors/DomainError'
export { InvariantViolationError } from './shared/errors/InvariantViolationError'
```

### Composition Layer Public API

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

```typescript
// src/presentation/web/react/src/components/ResourceList.tsx
import { Resource } from '@domain'
import { ResourceCard } from '@client/components/ResourceCard'
import { EmptyState } from '@client/components/EmptyState'

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

```typescript
// src/presentation/web/react/src/hooks/useModal.ts
import { useContext } from 'react'
import { ModalContext } from '@client/contexts/ModalContext'

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

```typescript
// ❌ НЕПРАВИЛЬНО
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'

export async function loader() {
  const handler = new GetResourcesHandler(???)  // А репозиторий откуда?
  return await handler.execute()
}

// ✅ ПРАВИЛЬНО
import { queries } from '@api'

export async function loader() {
  return await queries.resources.list()  // Всё внутри!
}
```

### 2. Domain импортирует Application

```typescript
// src/domain/resource/Resource.ts

// ❌ НЕПРАВИЛЬНО - Domain не должен знать об Application!
import { CreateResourceCommand } from '@internal/application/commands/CreateResourceCommand'

// ✅ ПРАВИЛЬНО - только Domain
import { ResourceId } from './ResourceId'
import { DomainError } from '@domain/shared/errors/DomainError'
```

### 3. Использование @internal в Presentation

```typescript
// ❌ НЕПРАВИЛЬНО
import { ApiClient } from '@internal/infrastructure/api/ApiClient'

// ✅ ПРАВИЛЬНО - через Composition facade
import { queries } from '@api'
```

---

## 🧪 Проверка правил

### Тесты на импорты

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
      
      expect(content).not.toContain('@internal/application')
      expect(content).not.toContain('@internal/infrastructure')
      expect(content).not.toContain('@api')
    })
  })
  
  it('Presentation не использует @internal/*', () => {
    const presentationFiles = findTypeScriptFiles('src/presentation')
    
    presentationFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8')
      
      expect(content).not.toContain('@internal/')
    })
  })
})

function findTypeScriptFiles(dir: string): string[] {
  // Implementation...
}
```

---

## 📊 Визуализация зависимостей

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
│  Imports: @domain, @internal/*           │
└─────┬────────────────────────────────────┘
      │
      ├─→ @internal/application
      │   ┌────────────────────────────┐
      │   │   Application Layer        │
      │   │  (Query/Command Handlers)  │
      │   │                            │
      │   │  Imports: @domain          │
      │   └──────────┬─────────────────┘
      │              │
      ├─→ @internal/infrastructure
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

## ✅ Чеклист настройки

- [ ] Создан `src/domain/index.ts` с Public API
- [ ] Создан `src/composition/index.ts` с facades
- [ ] Алиасы `@domain`, `@api`, `@client`, `@internal/*` в vite.config.ts
- [ ] Те же алиасы в tsconfig.json paths
- [ ] Установлен `eslint-plugin-boundaries`
- [ ] Настроены правила в eslint.config.js
- [ ] `pnpm lint` проходит без ошибок
- [ ] Presentation не использует `@internal/*`
- [ ] Domain не импортирует из других слоев

---

## 📚 Связанные документы

- [DDD & Clean Architecture](./DDD_AND_CLEAN_ARCHITECTURE.md)
- [Composition Layer](./COMPOSITION_LAYER.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [TypeScript & Vite Config](../steps/step_0/TYPESCRIPT_VITE_CONFIG.md)
