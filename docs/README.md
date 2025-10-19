# Password Manager - Документация `#documentation` `#navigation`

## Структура документации

### 🚀 Начало работы
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** `#file:docs/GETTING_STARTED.md` - Руководство по началу разработки
- **[DDD_AND_CLEAN_ARCHITECTURE.md](./DDD_AND_CLEAN_ARCHITECTURE.md)** `#file:docs/DDD_AND_CLEAN_ARCHITECTURE.md` - Обзор: как DDD и Clean Architecture сочетаются в проекте
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** `#file:docs/PROJECT_STRUCTURE.md` - Структура проекта, архитектурные границы и правила импорта

### 🚨 Обработка ошибок (`error-handling/`)
- **[INVARIANTS.md](./error-handling/INVARIANTS.md)** `#file:docs/error-handling/INVARIANTS.md` - Инварианты и Shared Kernel для переиспользуемых правил валидации
- **[ERROR_HANDLING.md](./error-handling/ERROR_HANDLING.md)** `#file:docs/error-handling/ERROR_HANDLING.md` - Обработка ошибок: Domain/Application/Infrastructure Errors
- **[ERROR_ESCALATION.md](./error-handling/ERROR_ESCALATION.md)** `#file:docs/error-handling/ERROR_ESCALATION.md` - Эскалация ошибок: Result Pattern и монады (neverthrow)
  - **[ERROR_ESCALATION_EXTENDED.md](./error-handling/ERROR_ESCALATION_EXTENDED.md)** `#file:docs/error-handling/ERROR_ESCALATION_EXTENDED.md` - Расширенное сравнение всех библиотек (@sweet-monads/either, fp-ts)

### 🏗️ Архитектура и паттерны
- **[TYPES_AND_ENTITIES.md](./TYPES_AND_ENTITIES.md)** - Типизация в DDD: Value Objects, Entities, DTO ⭐
- **[ARCHITECTURE_BOUNDARIES.md](./ARCHITECTURE_BOUNDARIES.md)** - Правила импортов между слоями, алиасы, ESLint enforcement ⭐
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Поток данных, CQRS + Facades, DI Container (Remix специфика)
- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - Command Bus паттерн для UI команд (DDD + Hexagonal Architecture)
- **[QUERY_HANDLERS.md](./QUERY_HANDLERS.md)** - Query Handlers и Facade для чтения данных в Loaders (CQRS)
- **[COMPOSITION_LAYER.md](./COMPOSITION_LAYER.md)** - Декомпозиция Composition Layer, Multi-UI поддержка, константы
- **[ADAPTER_PATTERN_DI.md](./ADAPTER_PATTERN_DI.md)** - Канонический подход к внедрению внешних зависимостей (Adapter Pattern + DI)

### 📦 Electron (`electron/`)
Документация по Packaging Layer - упаковка приложения в desktop формат.

- **[README.md](./electron/README.md)** - Архитектура и структура Electron, конфигурация без magic strings

> **Важно:** Electron НЕ часть архитектуры приложения, это packaging layer. Приложение работает одинаково в браузере и Electron.

### 🎨 UI/UX (`ui/`)
Документация по визуальному оформлению и UI компонентам.

- **[CATPPUCCIN_MOCHA.md](./ui/CATPPUCCIN_MOCHA.md)** - Цветовая палитра Catppuccin Mocha для Tailwind CSS

### 📘 Концепты (`concepts/`)
Концептуальные документы и архитектурное видение проекта.

- **[THEORETICAL_CONCEPT.md](./concepts/THEORETICAL_CONCEPT.md)** - Начальная концепция и идеи
- **[IMPLEMENT_CONCEPT_OUTER.md](./concepts/IMPLEMENT_CONCEPT_OUTER.md)** - Детальный план реализации
- **[ARCHITECTURE_DESIGN.md](./concepts/ARCHITECTURE_DESIGN.md)** - Верхнеуровневая архитектура (DDD)

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
4. `error-handling/INVARIANTS.md` - Инварианты и Shared Kernel (важно для понимания Domain Layer)
5. `TYPES_AND_ENTITIES.md` - Типизация: Value Objects, Entities, DTO ⭐
6. `error-handling/ERROR_HANDLING.md` - Обработка ошибок (Domain/Application/Infrastructure)
7. `PROJECT_STRUCTURE.md` - Структура проекта и архитектурные границы
8. `ARCHITECTURE_BOUNDARIES.md` - Правила импортов, алиасы, ESLint enforcement ⭐
9. `DATA_FLOW.md` - Работа с данными (CQRS + Facades, DI Container)
10. `COMMAND_BUS.md` - Command Bus для UI команд (CQRS - Commands)
11. `QUERY_HANDLERS.md` - Query Handlers для чтения данных (CQRS - Queries)
12. `COMPOSITION_LAYER.md` - Декомпозиция Composition Layer и Multi-UI поддержка
13. `ADAPTER_PATTERN_DI.md` - Внедрение внешних зависимостей (Adapter Pattern + DI)
14. `contracts/domain-types.md` - Типы предметной области
15. `contracts/system-interfaces.md` - Интерфейсы систем
16. `contracts/api-contracts.md` - API контракты
17. `contracts/events.md` - События системы

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
