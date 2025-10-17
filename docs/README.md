# Password Manager - Документация

## Структура документации

### 🚀 Начало работы
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Руководство по началу разработки
- **[DDD_AND_CLEAN_ARCHITECTURE.md](./DDD_AND_CLEAN_ARCHITECTURE.md)** - Обзор: как DDD и Clean Architecture сочетаются в проекте
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Структура проекта, архитектурные границы и правила импорта
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Поток данных, Application Services, DI Container (Remix специфика)
- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - Command Bus паттерн для UI команд (DDD + Hexagonal Architecture)
- **[QUERY_HANDLERS.md](./QUERY_HANDLERS.md)** - Query Handlers и Facade для чтения данных в Loaders (CQRS)
- **[COMPOSITION_LAYER.md](./COMPOSITION_LAYER.md)** - Декомпозиция Composition Layer, Multi-UI поддержка, константы

### 📘 Концепты (`concepts/`)
Концептуальные документы и архитектурное видение проекта.

- **[THEORETICAL_CONCEPT.md](./concepts/THEORETICAL_CONCEPT.md)** - Начальная концепция и идеи
- **[IMPLEMENT_CONCEPT_OUTER.md](./concepts/IMPLEMENT_CONCEPT_OUTER.md)** - Детальный план реализации
- **[ARCHITECTURE_DESIGN.md](./concepts/ARCHITECTURE_DESIGN.md)** - Верхнеуровневая архитектура (DDD)
- **[STATIC_VS_INSTANCE_METHODS.md](./concepts/STATIC_VS_INSTANCE_METHODS.md)** - Образовательная справка: когда использовать static vs instance методы

### 📋 Контракты (`contracts/`)
Типы, интерфейсы и контракты приложения.

- **[domain-types.md](./contracts/domain-types.md)** - Доменные типы и сущности
- **[infrastructure-types.md](./contracts/infrastructure-types.md)** - Типы инфраструктурного слоя
- **[api-contracts.md](./contracts/api-contracts.md)** - API контракты и endpoints
- **[events.md](./contracts/events.md)** - Domain Events и их контракты
- **[system-interfaces.md](./contracts/system-interfaces.md)** - Интерфейсы систем

## Порядок чтения

Для понимания проекта рекомендуется читать в следующем порядке:

1. `concepts/THEORETICAL_CONCEPT.md` - Общая идея
2. `concepts/ARCHITECTURE_DESIGN.md` - Архитектура
3. `DDD_AND_CLEAN_ARCHITECTURE.md` - Как DDD и Clean Architecture сочетаются в проекте
4. `PROJECT_STRUCTURE.md` - Структура проекта и архитектурные границы
5. `DATA_FLOW.md` - Работа с данными (Application Services, DI Container)
6. `COMMAND_BUS.md` - Command Bus для UI команд (CQRS - Commands)
7. `QUERY_HANDLERS.md` - Query Handlers для чтения данных (CQRS - Queries)
8. `COMPOSITION_LAYER.md` - Декомпозиция Composition Layer и Multi-UI поддержка
9. `contracts/domain-types.md` - Типы предметной области
10. `contracts/system-interfaces.md` - Интерфейсы систем
11. `contracts/api-contracts.md` - API контракты
12. `contracts/events.md` - События системы

### 📚 Дополнительно

- `concepts/STATIC_VS_INSTANCE_METHODS.md` - Образовательная справка о статических и обычных методах

## Технический стек

- **Platform**: Electron (desktop)
- **Framework**: Remix
- **Language**: TypeScript
- **Architecture**: DDD (Domain-Driven Design) + Clean Architecture
- **Patterns**: CQRS, Repository, Hexagonal Architecture
- **UI**: React
- **Data**: REST API + Mock Data

## Ключевые принципы

- **DDD Tactical Patterns** - Entity, Value Object, Aggregate, Repository, Domain Service
- **Clean Architecture** - зависимости направлены к центру (Domain Layer)
- **CQRS** - разделение Commands (запись) и Queries (чтение)
- **Hexagonal Architecture** - Ports & Adapters для изоляции Domain
- **Dependency Inversion** - зависимости от абстракций, а не от реализаций
- **Event-Driven** - Domain Events для коммуникации между системами
