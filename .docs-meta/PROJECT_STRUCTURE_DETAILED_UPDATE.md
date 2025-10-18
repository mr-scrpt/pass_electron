# ✅ PROJECT_STRUCTURE.md - Детальное обновление

**Дата**: 2025-01-18  
**Изменение**: Добавлены детальные объяснения происхождения каждого слоя, правила импортов, Public API vs Внутренности

---

## 🎯 Что обновлено

### 1. Раздел "Архитектурные слои"

Для каждого слоя добавлено:

#### 📚 Откуда взят слой
- **Domain**: Классический DDD (Eric Evans)
- **Application**: DDD + CQRS (Greg Young) + Hexagonal Architecture (Ports)
- **Infrastructure**: DDD + Hexagonal (Adapters) + Clean Architecture (Frameworks & Drivers)
- **Composition** ⭐: DI Principles (Mark Seemann) + Clean Architecture + Hexagonal (Bootstrap)
- **Presentation**: DDD + Clean + Hexagonal (Primary Adapters)

#### ❓ Почему нужен
Объяснение зачем каждый слой существует в архитектуре

#### ✅ Что решает
Конкретные проблемы, которые решает каждый слой

#### 📋 Правила импортов
Детальные правила для каждого слоя:
- ✅ Что МОЖЕТ импортировать (через какие алиасы)
- ❌ Что НЕ МОЖЕТ импортировать
- ✅ Public API
- 🔒 Внутренности (приватные части)

---

## 🔑 Ключевые дополнения

### Composition Layer - НЕ из DDD!

Добавлено явное объяснение:

```
⚠️ Composition Root НЕ является частью классического DDD!

Откуда:
- Dependency Injection Principles (Mark Seemann) - Composition Root
- Clean Architecture (Uncle Bob) - место сборки приложения
- Hexagonal Architecture - Bootstrap layer

Почему отдельный слой:
- DDD не говорит ГДЕ делать DI
- Clean Architecture требует: Infrastructure НЕ должен зависеть от Application
- Dependency Rule: зависимости направлены к Domain
- Если DI в Infrastructure → Infrastructure зависит от Application = НАРУШЕНИЕ!
```

### Правила импортов с алиасами

Обновлена таблица зависимостей:

| Слой | Алиасы | Примечание |
|------|--------|------------|
| **Domain** | `@domain/*` (только внутри себя) | Полностью изолирован |
| **Application** | `@domain` | Только Public API |
| **Infrastructure** | `@domain` | Только интерфейсы |
| **Composition** ⭐ | `@domain`, `@internal/application/*`, `@internal/infrastructure/*` | **Единственный** кто может `@internal/*` |
| **Presentation** | `@domain`, `@api`, `@client/*` | ❌ НЕ может `@internal/*` |

### Public API vs Внутренности

Добавлен раздел "Правило Public API":

```markdown
- ✅ Public API экспортируется через index.ts
- 🔒 Внутренности (реализация) НЕ экспортируются
- ✅ Импортировать ТОЛЬКО через index.ts (через алиасы)
- ❌ Импорт напрямую из файлов реализации - ЗАПРЕЩЕН

Почему это важно:
- Инкапсуляция - детали реализации скрыты
- Гибкость - можно менять внутреннюю структуру без влияния на других
- Контракт - index.ts это контракт модуля
- Безопасность рефакторинга - изменения внутри модуля не ломают других
```

---

## 📝 Обновленные примеры

### 1. Public API vs Внутренности

#### ❌ Неправильно:
```typescript
// Обход Public API - ЗАПРЕЩЕН!
import { Resource } from '@/domain/resource/Resource.ts'
import { GetResourcesHandler } from '@/application/queries/handlers/GetResourcesHandler.ts'
```

#### ✅ Правильно:
```typescript
// Через Public API (index.ts)
import { Resource, ResourceId } from '@domain'
import { queries } from '@api'
```

### 2. Presentation → Только Public API

#### ❌ Неправильно:
```typescript
// НАРУШЕНИЕ архитектуры!
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'
import { ApiResourceRepository } from '@internal/infrastructure/repositories/ApiResourceRepository'

export async function loader() {
  const repo = new ApiResourceRepository()  // DI в Presentation
  const handler = new GetResourcesHandler(repo)
  return await handler.execute()
}
```

#### ✅ Правильно:
```typescript
// Через Facade
import { queries } from '@api'

export async function loader() {
  return await queries.resources.list()  // Одна строка!
}
```

### 3. Composition → Единственный для @internal/*

```typescript
// src/composition/queries.ts - ТОЛЬКО здесь можно @internal/*
import { Resource } from '@domain'  // ✅ Public API
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'  // ✅
import { ApiResourceRepository } from '@internal/infrastructure/repositories/ApiResourceRepository'  // ✅

export const queries = {
  resources: {
    async list() {
      // ✅ DI логика здесь!
      const repository = new ApiResourceRepository()
      const handler = new GetResourcesHandler(repository)
      return await handler.execute()
    }
  }
}
```

### 4. Domain → Полная изоляция

```typescript
// src/domain/resource/Resource.ts
import { ResourceId } from './ResourceId'  // ✅
import { DomainError } from '@domain/shared/errors/DomainError'  // ✅

// ❌ ЗАПРЕЩЕНО
// import { queries } from '@api'
// import { ApiClient } from '@internal/infrastructure/api/ApiClient'
```

---

## 📊 Итоговая таблица: Откуда каждый слой

| Слой | Источник | Почему нужен | Что решает |
|------|----------|--------------|------------|
| **Domain** | DDD (Eric Evans) | Бизнес-логика не зависит от технологий | Изоляция бизнес-правил |
| **Application** | DDD + CQRS + Hexagonal | Оркестрация use cases | Валидация, трансакции, DTO↔Domain |
| **Infrastructure** | DDD + Hexagonal + Clean | Изоляция технических деталей | Работа с API/DB/внешними системами |
| **Composition** ⭐ | DI Principles + Clean + Hexagonal | Соблюдение Dependency Rule | DI, сборка приложения, упрощение Presentation |
| **Presentation** | DDD + Clean + Hexagonal | Framework as Detail | UI, навигация, пользовательский ввод |

---

## 🎯 Главные правила (новая секция)

### 1. Dependency Rule (Clean Architecture)
Зависимости направлены только внутрь → к Domain Layer

### 2. Public API через `index.ts`
- ✅ Импортировать **ТОЛЬКО** через `index.ts` (через алиасы)
- 🔒 Внутренности модулей - ПРИВАТНЫЕ

### 3. Алиасы строго разделены
- `@domain` - Public API типов (указывает на `index.ts`)
- `@api` - Facades (указывает на `index.ts`)  
- `@client/*` - Локальные компоненты Presentation
- `@internal/*` - ТОЛЬКО для Composition Layer!

### 4. ESLint enforcement
- Presentation НЕ может импортировать `@internal/*`
- Domain полностью изолирован
- Infrastructure НЕ зависит от Application

---

## ✅ Связь с другими документами

Обновлены ссылки на:
- `ARCHITECTURE_BOUNDARIES.md` - детали правил импортов
- `COMPOSITION_LAYER.md` - подробнее о Composition Root
- Остальные документы архитектуры

---

**Статус**: ✅ PROJECT_STRUCTURE.md полностью обновлен с детальными объяснениями происхождения каждого слоя, правилами импортов и разделением Public API vs Внутренности
