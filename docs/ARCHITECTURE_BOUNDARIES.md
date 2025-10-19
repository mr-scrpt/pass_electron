# Architecture Boundaries & Import Rules `#architecture-boundaries` `#import-rules` `#eslint`

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
| **Domain** | Только Domain | `@/domain/shared/*` | Errors, Invariants |
| **Application** | Domain | `@/domain` | Entities, Value Objects |
| **Infrastructure** | Domain | `@/domain` | Repository Interfaces |
| **Composition** | Domain, Application, Infrastructure | `@/domain`, `@/application/*`, `@/infrastructure/*` | Handlers, Repositories |
| **Presentation** | Domain (типы), Composition (facades) | `@/domain`, `@/composition` | DTO, queries, commands |

**Важно:** Все импорты через Public API (`index.ts`). Composition - единственный слой с доступом ко всем остальным.

---

## 🔍 Примеры импортов

### ✅ Presentation Layer (правильно)

```typescript
// src/presentation/web/react/src/routes/_index.tsx

// ✅ Типы из Domain через Public API
import { Resource, ResourceId, Namespace } from '@/domain'

// ✅ Facades из Composition
import { queries, commands } from '@/composition'

// ✅ Локальные компоненты (React Router alias)
import { ResourceList } from '~/components/ResourceList'
import { useModal } from '~/hooks/useModal'

// ❌ НЕЛЬЗЯ импортировать Application/Infrastructure напрямую!
// import { GetResourcesHandler } from '@/application/queries/handlers/GetResourcesHandler'  // ❌
// import { ApiClient } from '@/infrastructure/api/ApiClient'  // ❌

export async function loader() {
  // ✅ Используем facade
  return await queries.resources.list()
}
```

### ✅ Composition Layer (правильно)

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

```typescript
// src/application/queries/GetResourcesHandler.ts

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

```typescript
// src/domain/resource/aggregates/Resource.ts

// ✅ Только другие Domain объекты (относительные пути или через @domain)
import { ResourceId } from '../value-objects/ResourceId'
import { Namespace } from './Namespace'
import { DomainError } from '@domain/shared/errors/DomainError'

// ❌ НЕЛЬЗЯ импортировать из других слоев!
// import { GetResourcesHandler } from '@/application/queries'  // ❌
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

```typescript
// src/domain/resource/aggregates/Resource.ts

// ❌ НЕПРАВИЛЬНО - Domain не должен знать об Application!
import { CreateResourceCommand } from '@/application/commands'

// ✅ ПРАВИЛЬНО - только Domain
import { ResourceId } from '../value-objects/ResourceId'
import { DomainError } from '@/domain/shared/errors'
```

### 3. Прямой импорт Infrastructure в Presentation

```typescript
// ❌ НЕПРАВИЛЬНО - Presentation не может импортировать Infrastructure!
import { ApiClient } from '@/infrastructure/api'

// ✅ ПРАВИЛЬНО - через Composition facade
import { queries } from '@/composition'
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
