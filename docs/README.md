# Password Manager - Документация

## Структура документации

### 🚀 Начало работы
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Руководство по началу разработки
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Структура проекта, архитектурные границы и правила импорта

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
3. `PROJECT_STRUCTURE.md` - Структура проекта и архитектурные границы
4. `contracts/domain-types.md` - Типы предметной области
5. `contracts/system-interfaces.md` - Интерфейсы систем
6. `contracts/api-contracts.md` - API контракты
7. `contracts/events.md` - События системы

## Технический стек

- **Platform**: Electron (desktop)
- **Framework**: Remix
- **Language**: TypeScript
- **Architecture**: DDD (Domain-Driven Design)
- **UI**: React
- **Data**: REST API + Mock Data

## Ключевые принципы

- **Event-Driven Architecture** - системы общаются через события
- **Dependency Inversion** - зависимости направлены к Domain Layer
- **Repository Pattern** - абстракция работы с данными
- **Clean Architecture** - четкое разделение слоев
