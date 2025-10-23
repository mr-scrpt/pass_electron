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
mkdir -p src/domain/resource/{aggregates,entities,value-objects,repositories,events,specifications}
mkdir -p src/domain/shared/{errors,invariants,specification/common}
mkdir -p src/shared/validation
```

### Шаг 1: Validation API → [VALIDATION_SETUP.md](./VALIDATION_SETUP.md)

Создать фасад над `@sweet-monads/either` для изоляции библиотеки.

**Что создаем:**
- `src/shared/validation/Validation.ts` - фасад над Either
- `src/shared/validation/ValidationCombinators.ts` - accumulate, sequence
- `src/shared/validation/helpers.ts` - isTrue fluent API

### Шаг 2: Specification Pattern → [SPECIFICATION_SETUP.md](./SPECIFICATION_SETUP.md)

Создать переиспользуемые спецификации для валидации.

**Что создаем:**
- `src/domain/shared/specification/ISpecification.ts` - интерфейс
- `src/domain/shared/errors/ValidationError.ts` - ошибка валидации
- `src/domain/shared/specification/common/` - Common* спецификации

### Шаг 3: Domain Layer → [DOMAIN_LAYER_SETUP.md](./DOMAIN_LAYER_SETUP.md)

Создать ядро приложения - Domain Layer.

**Что создаем:**
- Инварианты (UuidInvariant, InvariantViolationError)
- Value Objects (ResourceId, Namespace, ResourceName)
- Спецификации (NamespaceSpecs, ResourceNameSpecs)
- Aggregate Root (Resource)
- Repository Interface (IResourceRepository)

### Шаг 4: Application Layer → [APPLICATION_LAYER_SETUP.md](./APPLICATION_LAYER_SETUP.md)

Создать Application Layer с DTO.

**Что создаем:**
- DTO (ResourceListItemDTO)
- Repository Interface (IResourceRepository)
- Public API

### Шаг 5: Infrastructure Layer → [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)

Реализовать Infrastructure Layer с Mock данными.

**Что создаем:**
- Mock данные (resources.mock.ts)
- MockResourceRepository

### Шаг 6: Composition Layer → [COMPOSITION_SETUP.md](./COMPOSITION_SETUP.md)

Создать Composition Root для DI.

**Что создаем:**
- Упрощенный DI для Step 1
- Экспорт репозитория

### Шаг 7: Presentation Layer → [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)

Создать React компоненты и Routes.

**Что создаем:**
- ResourceList компонент
- Route с loader
- Преобразование Domain → DTO

### Дополнительно: Примеры валидации → [VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md)

Примеры накопления ошибок через спецификации.

---

## 📁 Итоговая структура файлов [#structure:tree]

После выполнения всех шагов у вас будет:

```
src/
├── shared/                     # Технические утилиты
│   └── validation/
│       ├── Validation.ts
│       ├── helpers.ts
│       ├── ValidationCombinators.ts
│       └── index.ts
│
└── domain/
    ├── shared/                 # Shared Kernel
    │   ├── errors/
    │   │   ├── InvariantViolationError.ts
    │   │   └── ValidationError.ts
    │   ├── invariants/
    │   │   └── UuidInvariant.ts
    │   ├── specification/
    │   │   ├── ISpecification.ts
    │   │   ├── common/
    │   │   │   ├── CommonLengthSpec.ts
    │   │   │   ├── CommonPatternSpec.ts
    │   │   │   └── CommonNotEmptySpec.ts
    │   │   └── index.ts
    │   └── index.ts
    │
    └── resource/               # Resource Bounded Context
        ├── specifications/
        │   ├── NamespaceSpecs.ts
        │   ├── NotReservedNamespaceSpec.ts
        │   ├── ResourceNameSpecs.ts
        │   └── index.ts
        ├── value-objects/
        │   ├── ResourceId.ts
        │   ├── Namespace.ts
        │   ├── ResourceName.ts
        │   └── index.ts
        ├── aggregates/
        │   ├── Resource.ts
        │   └── index.ts
        └── repositories/
            ├── IResourceRepository.ts
            └── index.ts
```

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

## 🎓 Что вы изучите

### Архитектурные паттерны
- **DDD (Domain-Driven Design)** - Value Objects, Aggregates, Specifications
- **Clean Architecture** - разделение слоев, Dependency Rule
- **CQRS** - Query Handlers для чтения данных
- **Specification Pattern** - переиспользуемые правила валидации
- **Repository Pattern** - абстракция над хранилищем

### Функциональное программирование
- **Монады** - Either для обработки ошибок
- **Функциональная композиция** - ValidationCombinators
- **Накопление ошибок** - mergeInMany для лучшего UX

### TypeScript Best Practices
- **Value Objects** - классы вместо примитивов
- **DTO** - интерфейсы для передачи данных
- **Type Safety** - строгая типизация
- **Public API** - инкапсуляция через index.ts

---

## ❓ FAQ

### Почему классы для Value Objects, а не type alias?

Value Objects - это не просто типы, это бизнес-концепции с валидацией и поведением. Классы обеспечивают:
- Невозможность создать невалидный объект
- Инкапсуляцию деталей реализации
- Методы для работы с данными

### Зачем Specification Pattern?

Спецификации позволяют:
- Переиспользовать правила валидации
- Комбинировать правила
- Накапливать ВСЕ ошибки (лучший UX)
- Тестировать правила отдельно

### Почему два shared/?

- `src/shared/` - технические утилиты (фасады над библиотеками)
- `src/domain/shared/` - Shared Kernel (DDD, переиспользуемая бизнес-логика)

Это разные концепции с разными целями.

### Почему helpers.ts в src/shared/validation/?

`isTrue` - это технический хелпер (fluent API), не Domain логика. Он изолирует детали реализации валидации.

---

## 📚 Связанные документы

- [PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) - структура проекта
- [TYPES_AND_ENTITIES.md](../../docs/TYPES_AND_ENTITIES.md) - типизация в DDD
- [DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - DDD паттерны
- [QUERY_HANDLERS.md](../../docs/QUERY_HANDLERS.md) - Query Handlers
- [DATA_FLOW.md](../../docs/DATA_FLOW.md) - поток данных
- [VALIDATION_COMBINATORS.md](../../docs/error-handling/VALIDATION_COMBINATORS.md) - ValidationCombinators
- [INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) - Invariants Pattern
