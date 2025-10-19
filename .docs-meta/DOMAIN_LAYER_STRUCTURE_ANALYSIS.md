# Анализ структуры Domain Layer

**Дата**: 2025-01-18  
**Проблема**: Путаница с импортами `@/domain` vs `@/domain/shared/errors`

## 🤔 Текущая проблема

```typescript
import { Resource } from '@/domain'              // Public API верхнего уровня
import { DomainError } from '@/domain/shared/errors'  // Лезет "ниже" Public API
```

**Вопрос:** Почему один импорт через Public API верхнего уровня, а другой через подпапку?

## 📚 Исследование: Лучшие практики DDD

### 1. Организация по Bounded Context (модулям)

**Источник:** [DEV Community - DDD File Structure](https://dev.to/stevescruz/domain-driven-design-ddd-file-structure-4pja)

**Ключевая идея:** Группировать по **доменам (модулям)**, а не по типам файлов.

**Плохо (по типам):**
```
domain/
├── entities/
│   ├── Resource.ts
│   ├── CustomField.ts
├── value-objects/
│   ├── ResourceId.ts
│   ├── Namespace.ts
└── repositories/
    └── IResourceRepository.ts
```

**Хорошо (по модулям):**
```
domain/
├── resource/              # Bounded Context: Resource
│   ├── Resource.ts        # Aggregate Root
│   ├── CustomField.ts     # Entity
│   ├── ResourceId.ts      # Value Object
│   ├── Namespace.ts       # Value Object
│   ├── IResourceRepository.ts
│   └── index.ts           # Public API модуля
├── shared/                # Shared Kernel
│   ├── errors/
│   ├── invariants/
│   └── index.ts
└── index.ts               # Public API всего Domain
```

### 2. Что такое Shared Kernel?

**Источник:** [Sapiens Works - DDD Bounded Contexts](https://blog.sapiensworks.com/post/2014/10/31/DDD-Identifying-Bounded-Contexts-and-Aggregates-Entities-and-Value-Objects.aspx)

**Shared Kernel** - это общие концепции, которые используются **несколькими Bounded Contexts**.

**Примеры Shared Kernel:**
- Базовые ошибки (DomainError, InvariantViolationError)
- Переиспользуемые инварианты (UuidInvariant, EmailInvariant)
- Общие Value Objects (Money, Email, если используются везде)
- Domain Events (если нужны в разных контекстах)

**Важно:** Shared Kernel должен быть **минимальным**! Слишком большой Shared Kernel = coupling.

### 3. Структура по Vaughn Vernon (Implementing DDD)

**Источник:** [ByteScrum - DDD Folder Structure](https://blog.bytescrum.com/a-comprehensive-guide-to-domain-driven-design-ddd-with-a-practical-folder-structure-example)

```
domain/
├── customers/             # Bounded Context
│   ├── Customer.ts        # Aggregate Root
│   ├── Address.ts         # Value Object
│   ├── CustomerRepository.ts
│   └── index.ts
├── orders/                # Bounded Context
│   ├── Order.ts           # Aggregate Root
│   ├── OrderLine.ts       # Entity
│   ├── OrderRepository.ts
│   └── index.ts
└── products/              # Bounded Context
    ├── Product.ts
    ├── ProductRepository.ts
    └── index.ts
```

**Ключевое правило:** Каждый Bounded Context - это **автономный модуль** со своим Public API.

## 🎯 Финальная рекомендуемая структура

### ✅ Принятое решение: Модули + Shared/Base

```
src/domain/
├── resource/              # Bounded Context: Resource Management
│   ├── aggregates/        # Aggregate Roots
│   │   └── Resource.ts
│   ├── entities/          # Entities (не Aggregate Roots)
│   │   └── CustomField.ts
│   ├── value-objects/     # Value Objects этого контекста
│   │   ├── ResourceId.ts
│   │   ├── Namespace.ts
│   │   ├── ResourceName.ts
│   │   └── FieldValue.ts
│   ├── repositories/      # Repository интерфейсы
│   │   └── IResourceRepository.ts
│   ├── events/            # Domain Events этого контекста
│   │   ├── ResourceCreated.ts
│   │   └── ResourceUpdated.ts
│   └── index.ts           # Public API модуля
│
├── shared/                # Shared Kernel (переиспользуемое)
│   ├── errors/            # Базовые ошибки
│   │   ├── DomainError.ts
│   │   ├── InvariantViolationError.ts
│   │   ├── NotFoundError.ts
│   │   └── index.ts
│   ├── invariants/        # Переиспользуемые инварианты
│   │   ├── UuidInvariant.ts
│   │   ├── EmailInvariant.ts
│   │   └── index.ts
│   ├── base/              # Базовые классы/интерфейсы
│   │   ├── IRepository.ts     # Базовый интерфейс репозитория
│   │   ├── DomainEvent.ts     # Базовый класс событий
│   │   ├── Entity.ts          # Базовый класс Entity (опционально)
│   │   ├── ValueObject.ts     # Базовый класс VO (опционально)
│   │   └── index.ts
│   └── index.ts           # Public API Shared Kernel
│
└── index.ts               # Public API всего Domain Layer
```

### ❌ Анти-паттерн: Плоская структура (НЕ использовать)

```
src/domain/
├── resource/              # Всё в одной куче - непонятно что есть что
│   ├── Resource.ts        # Aggregate? Entity?
│   ├── CustomField.ts     # Entity? Value Object?
│   ├── ResourceId.ts      # Value Object
│   ├── Namespace.ts       # Value Object
│   ├── IResourceRepository.ts
│   └── index.ts
```

**Проблема:** Нет явной структуры, всё смешано.

## ✅ Решение проблемы импортов

### Текущая ситуация (путаница):
```typescript
import { Resource } from '@/domain'              // Откуда?
import { DomainError } from '@/domain/shared/errors'  // Откуда?
```

### С новой структурой (понятно):

**Вариант A: Всё через верхний Public API**
```typescript
// src/domain/index.ts экспортирует всё
export * from './resource'
export * from './shared/errors'
export * from './shared/invariants'

// Использование
import { Resource, DomainError, InvariantViolationError } from '@/domain'
```

**Вариант B: Через модульные Public API (рекомендуется)**
```typescript
// Импорты явно показывают откуда что берется
import { Resource, ResourceId, Namespace } from '@/domain/resource'
import { DomainError, InvariantViolationError } from '@/domain/shared/errors'
import { UuidInvariant } from '@/domain/shared/invariants'
```

## 🎯 Рекомендация

**Использовать Вариант 1 (Модули + Shared) + Вариант B (модульные импорты)**

### Почему?

1. **Явность** - сразу видно откуда импорт
2. **Bounded Context** - каждый модуль изолирован
3. **Масштабируемость** - легко добавить новые контексты
4. **DDD Best Practice** - соответствует Vaughn Vernon и Eric Evans

### Пример использования:

```typescript
// Domain Layer (внутри resource/)
import { ResourceId } from './value-objects/ResourceId'  // Локальный
import { DomainError } from '@/domain/shared/errors'     // Shared Kernel

// Application Layer
import { Resource } from '@/domain/resource'
import { InvariantViolationError } from '@/domain/shared/errors'

// Presentation Layer
import { Resource } from '@/domain/resource'  // Только типы
```

## 📋 План миграции

1. ✅ Создать структуру `domain/resource/aggregates/`, `entities/`, `value-objects/`
2. ✅ Переместить файлы в соответствующие папки
3. ✅ Создать `index.ts` в каждой подпапке
4. ✅ Обновить импорты во всех файлах
5. ✅ Обновить документацию

## ✅ Финальное решение

**Принятая структура:**
```
domain/
├── resource/          # Bounded Context (всё для resource)
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   ├── events/
│   └── index.ts
├── user/              # Bounded Context (всё для user)
└── shared/            # Shared Kernel (только общее)
    ├── errors/
    ├── invariants/
    ├── base/          # IRepository, DomainEvent
    └── index.ts
```

**Ключевое правило:** Бизнес-домены (resource, user) НЕ смешиваются с техническими концепциями (shared). Каждый Bounded Context автономен и содержит всё необходимое.

## 🔗 Источники

1. [DEV Community - DDD File Structure](https://dev.to/stevescruz/domain-driven-design-ddd-file-structure-4pja)
2. [ByteScrum - DDD with Practical Folder Structure](https://blog.bytescrum.com/a-comprehensive-guide-to-domain-driven-design-ddd-with-a-practical-folder-structure-example)
3. [Sapiens Works - Identifying Bounded Contexts](https://blog.sapiensworks.com/post/2014/10/31/DDD-Identifying-Bounded-Contexts-and-Aggregates-Entities-and-Value-Objects.aspx)
4. Vaughn Vernon - "Implementing Domain-Driven Design"
5. Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software"
