# Шаг 1: Вывод списка моковых ресурсов

## 🎯 Цель

Создать минимальный end-to-end поток данных для отображения списка моковых ресурсов на главной странице `/`.

> **📦 Менеджер пакетов**: В проекте используется **pnpm**. Все команды используют `pnpm` вместо `npm`.

---

## 📊 Визуализация архитектуры

### Поток данных (CQRS) [#diagram:sequence]

```
MockRepository → Query Handler → Query Bus → Facade → React Router Loader → React Component → UI
```

### Architecture Diagram [#diagram:flow]

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Request                       │
│                     GET /                                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│         React Router v7 Loader (Server)                 │
│  routes/_index.tsx::loader()                            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│          Composition Layer (Facade)                      │
│  queries.resources.list(request)                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌────────────────────┴────────────────────────────────────┐
│          Application Layer (Query Handler)               │
│  ListResourcesQueryHandler.handle(query)                 │
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
┌────────────────────┴────────────────────────────────────┐
│            React Component (Client)                      │
│  ResourceList → ResourceListItem                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Порядок реализации

> **📘 Важно**: Перед началом ознакомьтесь с документацией:
> - [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - типизация в DDD ⭐
> - [DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - DDD и Clean Architecture
> - [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers и CQRS
> - [DATA_FLOW.md](../../docs/DATA_FLOW.md) - поток данных в React Router

### Шаг 0: Подготовка

#### Создание структуры папок [#command]

```bash
# Создать структуру Domain Layer
mkdir -p src/domain/resource/{aggregates,entities,value-objects,invariants,repositories,events,specifications}
mkdir -p src/domain/shared/{errors,invariants,specification/common}
mkdir -p src/shared/validation
```

### Шаг 1: Validation API → [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)

Создать фасад над `@sweet-monads/either` для изоляции библиотеки.

**Что создаем:**
- `src/shared/validation/Validation.ts` - фасад над Either
- `src/shared/validation/ValidationCombinators.ts` - accumulate, sequence
- `src/shared/validation/helpers.ts` - isTrue fluent API

### Шаг 2: Error Setup → [ERROR_SETUP.md](./ERROR_SETUP.md)

Создать базовый класс **BaseError** для всех ошибок приложения.

**Что создаем:**
- `src/shared/errors/BaseError.ts` - базовый класс для ВСЕХ ошибок
- Поддержка `code`, `context`, `cause` (error chaining)
- `toJSON()` и `toString()` для логирования

### Шаг 3: Specification Pattern → [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)

Создать переиспользуемые спецификации для валидации.

**Что создаем:**
- `src/shared/specification/ISpecification.ts` - интерфейс
- `src/domain/shared/specification/common/` - Common* спецификации (используют BaseError)

### Шаг 4: Domain Layer → [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)

Создать ядро приложения - Domain Layer.

**Что создаем:**
- Shared инварианты (UuidInvariant, IInvariant, InvariantViolationError)
- Resource инварианты (NamespaceInvariant, ResourceNameInvariant)
- Value Objects (ResourceId, Namespace, ResourceName)
- Спецификации (NotReservedNamespaceSpec)
- Aggregate Root (Resource)
- Repository Interface (IResourceRepository)

### Шаг 5: Application Layer → [APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md)

Создать Application Layer с CQRS (Query Handlers) и DTO.

**Что создаем:**
- DTO (ResourceListItemDTO)
- CQRS интерфейсы (IQuery, IQueryHandler)
- Query объект (ListResourcesQuery)
- QueryHandler (ListResourcesQueryHandler) - маппинг Domain → DTO
- Repository Interface (IResourceRepository)
- Public API

### Шаг 6: Infrastructure Layer → [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)

Реализовать Infrastructure Layer с Mock данными.

**Что создаем:**
- Mock данные (resources.mock.ts)
- MockResourceRepository

### Шаг 7: Composition Layer → [COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md)

Создать Composition Root для DI.

**Что создаем:**
- Сборка зависимостей (Repository → QueryHandler)
- Query Facade для Presentation Layer
- Экспорт `queries.resources.list()`

### Шаг 8: Presentation Layer → [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)

Создать React компоненты и Routes.

**Что создаем:**
- ResourceList компонент
- Route с loader (использует queries facade)
- Обработка Validation результатов

---

## 📚 Дополнительно

- [VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md) - Примеры накопления ошибок через спецификации

---

## ✅ Чек-лист выполнения

### Shared Layer
- [ ] Validation API ([VALIDATION_SETUP.md](./VALIDATION_SETUP.md))
- [ ] Specification Pattern ([SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md))

### Domain Layer
- [ ] Инварианты и Value Objects ([DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md))
- [ ] Спецификации ([DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md))
- [ ] Aggregate Root ([DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md))
- [ ] Repository Interface ([DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md))

### Application Layer
- [ ] DTO ([APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md))

### Infrastructure Layer
- [ ] Mock данные ([INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md))
- [ ] MockResourceRepository ([INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md))

### Composition Layer
- [ ] DI setup ([COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md))

### Presentation Layer
- [ ] React компоненты ([PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md))
- [ ] Routes с loader ([PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md))

---

## 📚 Связанные документы

- [PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) - структура проекта
- [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - типизация в DDD
- [DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - DDD паттерны
- [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers
- [DATA_FLOW.md](../../docs/DATA_FLOW.md) - поток данных
- [VALIDATION_COMBINATORS.md](../../docs/error-handling/VALIDATION_COMBINATORS.md) - ValidationCombinators
- [INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) - Invariants Pattern
