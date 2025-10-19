# Project Structure - Структура проекта

Детальное описание структуры проекта Password Manager с архитектурными границами и правилами импорта.

## Содержание

1. [Общая структура](#общая-структура)
2. [Архитектурные слои](#архитектурные-слои)
3. [Архитектурные границы](#архитектурные-границы)
4. [Public API модулей](#public-api-модулей)
5. [Правила импорта](#правила-импорта)
6. [Примеры правильного использования](#примеры-правильного-использования)

---

## Общая структура `#structure-tree`

```
password-manager/
├── package.json                   # Root: общие зависимости для DDD слоев
├── tsconfig.json                  # TypeScript для ВСЕГО проекта
├── pnpm-workspace.yaml           # pnpm workspaces configuration
│
├── docs/                          # Документация
│   ├── concepts/                  # Концептуальные документы
│   ├── contracts/                 # Типы и контракты
│   ├── error-handling/            # Документация по обработке ошибок
│   ├── GETTING_STARTED.md
│   ├── README.md
│   └── PROJECT_STRUCTURE.md      # ← Этот файл
│
├── electron/                      # Electron (packaging layer, вне архитектуры)
│   ├── main.ts
│   └── preload.ts
│
└── src/                           # Application code
    │
    ├── domain/                    # Domain Layer (DDD) #structure:domain/
    │   ├── resource/              # Resource Bounded Context #structure:domain/resource/
    │   │   ├── aggregates/        # Aggregate Roots #structure:domain/resource/aggregates/
    │   │   ├── entities/          # Entities #structure:domain/resource/entities/
    │   │   ├── value-objects/     # Value Objects #structure:domain/resource/value-objects/
    │   │   ├── repositories/      # Repository Interfaces #structure:domain/resource/repositories/
    │   │   ├── events/            # Domain Events #structure:domain/resource/events/
    │   │   └── index.ts           # Public API
    │   │
    │   ├── user/                  # User Bounded Context (пример)
    │   │   └── ...
    │   │
    │   └── shared/                # Shared Kernel
    │       ├── errors/            # Domain Errors
    │       ├── invariants/        # Reusable Invariants
    │       ├── base/              # Base classes/interfaces
    │       └── index.ts
    │
    ├── application/               # Application Layer (DDD) #structure:application/
    │   ├── queries/               #structure:application/queries/
    │   ├── commands/              #structure:application/commands/
    │   ├── ports/                 #structure:application/ports/
    │   └── services/              #structure:application/services/
    │
    ├── infrastructure/            # Infrastructure Layer (DDD) #structure:infrastructure/
    │   ├── persistence/           #structure:infrastructure/persistence/
    │   ├── services/              #structure:infrastructure/services/
    │   └── event-bus/             #structure:infrastructure/event-bus/
    │
    ├── composition/                # Composition Root (DI Container) #structure:composition/
    │   ├── ServiceContainer.ts    #class:ServiceContainer
    │   ├── modules/               #structure:composition/modules/
    │   ├── queries/               # Query Facades #structure:composition/queries/
    │   └── commands/              # Command Facades #structure:composition/commands/
    │
    ├── shared/                    # Shared utilities (framework-agnostic)
    │   └── types/
    │
    └── presentation/              # Presentation Layer (DDD) #structure:presentation/
        │
        └── web/                   # Web presentations #structure:presentation/web/
            └── react/             # React Router implementation #structure:presentation/web/react/
                ├── package.json   # Web-specific dependencies
                ├── vite.config.ts # Vite build tool config
                ├── tailwind.config.js
                ├── postcss.config.js
                │
                └── src/           # React Router code
                    ├── routes/
                    ├── components/
                    ├── hooks/
                    ├── styles/
                    ├── root.tsx
                    └── entry.client.tsx
```

---

## Архитектурные слои

### 0. Composition Root (`src/composition/`) ⚠️

**📚 Откуда:** НЕ из классического DDD! Это паттерн из:
- **Dependency Injection Principles** (Mark Seemann) - Composition Root
- **Clean Architecture** (Uncle Bob) - место сборки приложения
- **Hexagonal Architecture** - Bootstrap layer

**🎯 Назначение**: Единая точка управления зависимостями (DI Container).

**❓ Почему отдельный слой:**
- DDD не говорит ГДЕ делать DI
- Clean Architecture требует: Infrastructure НЕ должен зависеть от Application
- **Dependency Rule**: зависимости направлены к Domain
- Если DI в Infrastructure → Infrastructure зависит от Application = **нарушение!**

**✅ Что решает:**
- Упрощает Presentation (одна строка вместо 10 строк DI кода)
- Изолирует DI логику от бизнес-логики
- Единственное место переключения Mock ↔ Real
- Позволяет иметь разные DI для Web/CLI/Mobile

```
src/composition/                        #structure:composition/
├── ServiceContainer.ts                 #class:ServiceContainer
├── modules/                            #structure:composition/modules/
│   └── ResourceModule.ts               #class:ResourceModule
├── queries/                            #structure:composition/queries/
│   └── ResourceQueries.ts              #class:ResourceQueries
├── commands/                           #structure:composition/commands/
│   └── ResourceCommands.ts             #class:ResourceCommands
└── index.ts                            # Public API
```

**📋 Правила импортов:**
- ✅ **МОЖЕТ импортировать:** Domain, Application, Infrastructure (ВСЁ!)
- ❌ **НЕ МОЖЕТ импортировать:** Presentation
- ✅ **Public API:** Только `queries`, `commands` facades
- 🔒 **Внутренности:** DI логика, ServiceContainer - ПРИВАТНЫЕ

**Характеристики**:
- Знает обо ВСЕХ слоях приложения (единственное исключение Dependency Rule)
- Создает и связывает зависимости
- Не является частью классического DDD
- Единственное место где слои пересекаются
- Переключение Mock ↔ Real через конфигурацию

### 1. Domain Layer (`src/domain/`) 📘

**📚 Откуда:** Классический DDD (Eric Evans - "Domain-Driven Design")

**🎯 Назначение**: Бизнес-логика, независимая от фреймворков и внешних систем.

**❓ Почему нужен:**
- Бизнес-правила не должны зависеть от технологий
- Домен должен жить дольше чем фреймворки
- Ubiquitous Language (единый язык с бизнесом)

**✅ Что решает:**
- Изоляция бизнес-логики
- Переиспользуемость доменных объектов
- Легкость тестирования (нет внешних зависимостей)
- Возможность сменить UI/DB без изменения домена

```
src/domain/                                     #structure:domain/
├── resource/                                   #structure:domain/resource/
│   ├── aggregates/                             #structure:domain/resource/aggregates/
│   │   ├── Resource.ts                         #class:Resource
│   │   └── index.ts
│   │
│   ├── entities/                               #structure:domain/resource/entities/
│   │   ├── SecretField.ts                      #class:SecretField
│   │   ├── CustomField.ts                      #class:CustomField
│   │   └── index.ts
│   │
│   ├── value-objects/                          #structure:domain/resource/value-objects/
│   │   ├── ResourceId.ts                       #class:ResourceId
│   │   ├── ResourceName.ts                     #class:ResourceName
│   │   ├── Namespace.ts                        #class:Namespace
│   │   ├── FieldValue.ts                       #class:FieldValue
│   │   └── index.ts
│   │
│   ├── repositories/                           #structure:domain/resource/repositories/
│   │   ├── IResourceRepository.ts              #interface:IResourceRepository
│   │   ├── INamespaceRepository.ts             #interface:INamespaceRepository
│   │   └── index.ts
│   │
│   ├── events/                                 #structure:domain/resource/events/
│   │   ├── ResourceCreated.ts                  #interface:ResourceCreated
│   │   ├── ResourceUpdated.ts                  #interface:ResourceUpdated
│   │   ├── ResourceDeleted.ts                  #interface:ResourceDeleted
│   │   └── index.ts
│   │
│   └── index.ts
│
├── user/                                       #structure:domain/user/
│   ├── aggregates/                             #structure:domain/user/aggregates/
│   │   ├── User.ts                             #class:User
│   │   └── index.ts
│   ├── value-objects/                          #structure:domain/user/value-objects/
│   │   ├── UserId.ts                           #class:UserId
│   │   ├── Email.ts                            #class:Email
│   │   ├── Password.ts                         #class:Password
│   │   └── index.ts
│   ├── repositories/                           #structure:domain/user/repositories/
│   │   ├── IUserRepository.ts                  #interface:IUserRepository
│   │   └── index.ts
│   ├── events/                                 #structure:domain/user/events/
│   │   ├── UserRegistered.ts                   #interface:UserRegistered
│   │   ├── UserLoggedIn.ts                     #interface:UserLoggedIn
│   │   └── index.ts
│   └── index.ts
│
└── shared/                                     #structure:domain/shared/
    ├── errors/                                 #structure:domain/shared/errors/
    │   ├── DomainError.ts                      #class:DomainError
    │   ├── InvariantViolationError.ts          #class:InvariantViolationError
    │   ├── NotFoundError.ts                    #class:NotFoundError
    │   ├── DuplicateError.ts                   #class:DuplicateError
    │   ├── InvalidOperationError.ts            #class:InvalidOperationError
    │   └── index.ts
    │
    ├── invariants/                             #structure:domain/shared/invariants/
    │   ├── UuidInvariant.ts                    #class:UuidInvariant
    │   ├── StringInvariant.ts                  #class:StringInvariant
    │   ├── EmailInvariant.ts                   #class:EmailInvariant
    │   ├── IdentifierInvariant.ts              #class:IdentifierInvariant
    │   └── index.ts
    │
    ├── base/                                   #structure:domain/shared/base/
    │   ├── IRepository.ts                      #interface:IRepository
    │   ├── DomainEvent.ts                      #class:DomainEvent
    │   ├── Entity.ts                           #class:Entity
    │   ├── ValueObject.ts                      #class:ValueObject
    │   └── index.ts
    │
    └── index.ts
```

**📌 Что говорит DDD о структуре Domain Layer:**

1. **Bounded Context** (`resource/`, `user/`) - автономные бизнес-модули
   - Каждый контекст содержит ВСЁ необходимое для своей работы
   - `aggregates/` - Aggregate Roots (главные сущности)
   - `entities/` - Entities (сущности внутри Aggregate)
   - `value-objects/` - Value Objects (неизменяемые значения)
   - `repositories/` - Repository Interfaces (специфичные для контекста)
   - `events/` - Domain Events (специфичные для контекста)
   - `index.ts` - Public API модуля

2. **Shared Kernel** (`shared/`) - минимальный общий код
   - `errors/` - Базовые Domain Errors
   - `invariants/` - Переиспользуемые правила валидации
   - `base/` - Базовые классы/интерфейсы (IRepository, DomainEvent)
   - ⚠️ **Только действительно общее!** Не раздувать Shared Kernel

3. **Ключевое правило:** Бизнес-домены (resource, user) НЕ смешиваются с техническими концепциями (shared)
   - Реализации в Infrastructure Layer

4. **Domain Events** (`events/`) - события, которые происходят в домене
   - Публикуются Aggregates при изменении состояния
   - Обрабатываются в Application/Infrastructure

**🎯 Ключевой принцип DDD**: Domain Layer знает **ЧТО** нужно сделать (интерфейсы), но НЕ знает **КАК** (реализации в Infrastructure).

**📋 Правила импортов:**
- ✅ **МОЖЕТ импортировать:** НИЧЕГО! Полностью изолирован
- ✅ **Внутренние импорты:** Только другие Domain объекты через `@/domain/*` `#alias:@/`
- ❌ **НЕ МОЖЕТ импортировать:** Application, Infrastructure, Presentation, React, HTTP, etc.
- ✅ **Public API:** Entities, Value Objects, Domain Events, Repository Interfaces, Domain Errors
- 🔒 **Внутренности:** Приватные методы entities - НЕ экспортируются

**Характеристики**:
- НЕ зависит ни от какого другого слоя (центр архитектуры)
- Определяет интерфейсы для Infrastructure (Dependency Inversion)
- Содержит бизнес-инварианты
- Публикует Domain Events
- Содержит Shared Kernel с переиспользуемыми компонентами (errors, invariants)

### 2. Application Layer (`src/application/`) 📗

**📚 Откуда:** 
- **DDD** (Eric Evans) - Application Services
- **CQRS** (Greg Young) - Query/Command Handlers вместо Services
- **Hexagonal Architecture** (Alistair Cockburn) - Ports (интерфейсы адаптеров)

**🎯 Назначение**: Оркестрация бизнес-логики через CQRS (Query/Command Handlers).

**❓ Почему нужен:**
- Domain не должен знать о UI или API
- Нужен слой оркестрации use cases
- Разделение чтения (Query) и записи (Command)

**✅ Что решает:**
- Оркестрация Domain объектов
- Трансакционные границы
- Валидация команд/запросов
- Преобразование DTO ↔ Domain

```
src/application/                                        #structure:application/
├── queries/                                            #structure:application/queries/
│   ├── QueryTypes.ts
│   ├── IQuery.ts                                       #interface:IQuery
│   ├── IQueryHandler.ts                                #interface:IQueryHandler
│   ├── IQueryBus.ts                                    #interface:IQueryBus
│   ├── ListResourcesQuery.ts                           #interface:ListResourcesQuery
│   ├── GetResourceByIdQuery.ts                         #interface:GetResourceByIdQuery
│   ├── handlers/                                       #structure:application/queries/handlers/
│   │   ├── ListResourcesQueryHandler.ts                #class:ListResourcesQueryHandler
│   │   └── GetResourceByIdQueryHandler.ts              #class:GetResourceByIdQueryHandler
│   ├── dtos/                                           #structure:application/queries/dtos/
│   │   └── ResourceListItemDTO.ts                      #interface:ResourceListItemDTO
│   └── index.ts
├── commands/                                           #structure:application/commands/
│   ├── CommandTypes.ts
│   ├── ICommand.ts                                     #interface:ICommand
│   ├── ICommandHandler.ts                              #interface:ICommandHandler
│   ├── ICommandBus.ts                                  #interface:ICommandBus
│   ├── CreateResourceCommand.ts                        #interface:CreateResourceCommand
│   ├── UpdateResourceCommand.ts                        #interface:UpdateResourceCommand
│   ├── DeleteResourceCommand.ts                        #interface:DeleteResourceCommand
│   ├── handlers/                                       #structure:application/commands/handlers/
│   │   ├── CreateResourceCommandHandler.ts             #class:CreateResourceCommandHandler
│   │   ├── UpdateResourceCommandHandler.ts             #class:UpdateResourceCommandHandler
│   │   └── DeleteResourceCommandHandler.ts             #class:DeleteResourceCommandHandler
│   └── index.ts
├── ports/                                              #structure:application/ports/
│   ├── IRequestParser.ts                               #interface:IRequestParser
│   ├── IClipboardService.ts                            #interface:IClipboardService
│   ├── IStorageService.ts                              #interface:IStorageService
│   └── index.ts
├── errors/                                             #structure:application/errors/
│   ├── ValidationError.ts                              #class:ValidationError
│   ├── CommandError.ts                                 #class:CommandError
│   ├── QueryError.ts                                   #class:QueryError
│   └── index.ts
└── index.ts
```

**📋 Правила импортов:**
- ✅ **МОЖЕТ импортировать:** Domain (`@/domain`) `#alias:@/`
- ❌ **НЕ МОЖЕТ импортировать:** Infrastructure, Presentation, Composition, React, HTTP
- ✅ **Public API:** Query/Command типы, Result типы, Ports (интерфейсы)
- 🔒 **Внутренности:** Handlers реализации - доступны ТОЛЬКО через `@/internal/application/*` (для Composition)

**Характеристики**:
- Зависит только от Domain Layer (Dependency Rule)
- **Queries** - чтение данных (CQRS - Read)
- **Commands** - запись данных (CQRS - Write)
- **Query/Command Handlers** - содержат бизнес-логику операций
- **Ports** - интерфейсы для адаптеров (Hexagonal Architecture)
- Реализует CQRS (Command Query Responsibility Segregation)
- Предоставляет высокоуровневый API для Presentation Layer через Facades

### 3. Application Services (`src/application/services/`)

**Назначение**: Основные системы приложения (Modal, Keymap, Focus, Notification).

```
src/application/services/                               #structure:application/services/
├── modal/                                              #structure:application/services/modal/
│   ├── ModalManager.ts                                 #class:ModalManager
│   ├── IModalManager.ts                                #interface:IModalManager
│   ├── types.ts
│   └── index.ts
├── keymap/                                             #structure:application/services/keymap/
│   ├── KeymapRegistry.ts                               #class:KeymapRegistry
│   ├── KeymapExecutor.ts                               #class:KeymapExecutor
│   ├── IKeymapRegistry.ts                              #interface:IKeymapRegistry
│   ├── types.ts
│   └── index.ts
├── focus/                                              #structure:application/services/focus/
│   ├── FocusManager.ts                                 #class:FocusManager
│   ├── IFocusManager.ts                                #interface:IFocusManager
│   ├── types.ts
│   └── index.ts
└── notification/                                       #structure:application/services/notification/
    ├── NotificationManager.ts                          #class:NotificationManager
    ├── INotificationManager.ts
    ├── types.ts
    └── index.ts           # Public API
```

**Характеристики**:
- Каждая система изолирована
- Общаются через Event Bus
- Имеют четкий Public API
- React Context для UI находится в Presentation Layer

### 4. Infrastructure Layer (`src/infrastructure/`) 📙

**📚 Откуда:**
- **DDD** (Eric Evans) - Infrastructure Layer
- **Hexagonal Architecture** (Alistair Cockburn) - Adapters (внешний слой)
- **Clean Architecture** (Uncle Bob) - Frameworks & Drivers

**🎯 Назначение**: Реализация интерфейсов Domain Layer, работа с внешними системами.

**❓ Почему нужен:**
- Изоляция технических деталей от домена
- Возможность сменить DB/API без изменения бизнес-логики
- Dependency Inversion (Domain определяет интерфейсы, Infrastructure реализует)

**✅ Что решает:**
- Работа с внешними API
- Персистентность данных
- Реализация технических сервисов

```
src/infrastructure/                                     #structure:infrastructure/
├── commands/                                           #structure:infrastructure/commands/
│   ├── InMemoryCommandBus.ts                           #class:InMemoryCommandBus
│   └── index.ts
├── queries/                                            #structure:infrastructure/queries/
│   ├── InMemoryQueryBus.ts                             #class:InMemoryQueryBus
│   └── index.ts
├── api/                                                #structure:infrastructure/api/
│   ├── client.ts                                       #class:HttpClient
│   ├── ResourceApiClient.ts                            #class:ResourceApiClient
│   ├── NamespaceApiClient.ts                           #class:NamespaceApiClient
│   └── index.ts
├── repositories/                                       #structure:infrastructure/repositories/
│   ├── MockResourceRepository.ts                       #class:MockResourceRepository
│   ├── ApiResourceRepository.ts                        #class:ApiResourceRepository
│   └── index.ts
├── mocks/                                              #structure:infrastructure/mocks/
│   ├── resources.mock.ts
│   └── index.ts
├── event-bus/                                          #structure:infrastructure/event-bus/
│   ├── EventBus.ts                                     #class:EventBus
│   └── index.ts
├── storage/                                            #structure:infrastructure/storage/
│   ├── LocalStorage.ts                                 #class:LocalStorage
│   └── index.ts
├── clipboard/                                          #structure:infrastructure/clipboard/
│   ├── ClipboardService.ts                             #class:ClipboardService
│   └── index.ts
└── errors/                                             #structure:infrastructure/errors/
    ├── NetworkError.ts                                 #class:NetworkError
    ├── ApiError.ts                                     #class:ApiError
    ├── StorageError.ts                                 #class:StorageError
    └── index.ts
```

**📋 Правила импортов:**
- ✅ **МОЖЕТ импортировать:** Domain (`@/domain`) - ТОЛЬКО интерфейсы `#alias:@/`
- ❌ **НЕ МОЖЕТ импортировать:** Application, Presentation, Composition
- ✅ **Public API:** Repository реализации, Service реализации, Factories
- 🔒 **Внутренности:** Приватные методы адаптеров - доступны ТОЛЬКО через `@/internal/infrastructure/*` (для Composition)

**⚠️ КРИТИЧНО:** Infrastructure НЕ должен зависеть от Application!
Это нарушение Dependency Rule. DI логика должна быть в Composition.

**Характеристики**:
- Реализует интерфейсы из Domain Layer (Dependency Inversion)
- НЕ содержит бизнес-логику
- Адаптирует внешние системы (Adapter Pattern)
- НЕ знает о Application Layer (зависит только от Domain)

### 5. Presentation Layer (`src/presentation/`) 🎨

**📚 Откуда:**
- **DDD** (Eric Evans) - Presentation Layer (внешний слой)
- **Clean Architecture** (Uncle Bob) - Web/UI Layer
- **Hexagonal Architecture** (Alistair Cockburn) - Primary Adapters (входящие)

**🎯 Назначение**: UI фреймворки и компоненты.

**❓ Почему отдельно:**
- Framework as Implementation Detail (фреймворк - деталь реализации)
- UI меняется чаще чем бизнес-логика
- Возможность иметь несколько UI (Web, CLI, Mobile)

**✅ Что решает:**
- Отображение данных пользователю
- Сбор пользовательского ввода
- Навигация
- UI состояние

```
src/presentation/
└── web/                   # Web presentations
    └── react/             # React Router implementation
        ├── package.json   # ✅ Web-specific dependencies (react, react-router, vite)
        ├── vite.config.ts # ✅ Vite build tool (ONLY for web)
        ├── tailwind.config.js  # ✅ Tailwind CSS config
        ├── postcss.config.js   # ✅ PostCSS config
        │
        └── src/           # React Router code
            ├── routes/    # React Router file-based routing
            │   ├── _index.tsx         # GET /
            │   ├── resources.$id.tsx  # GET /resources/:id
            │   ├── resources.new.tsx  # GET /resources/new
            │   └── generator.tsx      # GET /generator
            │
            ├── components/   # React components
            │   ├── ResourceList/
            │   │   ├── ResourceList.tsx
            │   │   ├── ResourceListItem.tsx
            │   │   └── index.ts
            │   ├── ResourceDetail/
            │   └── PasswordGenerator/
            │
            ├── hooks/        # React hooks
            │   ├── useModal.ts
            │   ├── useKeymap.ts
            │   ├── useFocus.ts
            │   ├── useNotification.ts
            │   └── index.ts
            │
            ├── styles/       # Global styles
            │   └── tailwind.css
            │
            ├── root.tsx      # React Router root layout
            └── entry.client.tsx  # React Router client entry
```

**📋 Правила импортов:**
- ✅ **МОЖЕТ импортировать:** 
  - Domain (`@/domain`) - ТОЛЬКО типы через Public API
  - Composition (`@/api`) - ТОЛЬКО facades (queries, commands)
  - Локальные компоненты (`@/*`)
- ❌ **НЕ МОЖЕТ импортировать:**
  - Application handlers напрямую (`@/internal/application/*`) ← ESLint запретит!
  - Infrastructure напрямую (`@/internal/infrastructure/*`) ← ESLint запретит!
- ✅ **Public API:** React компоненты, hooks (для других Presentation слоев)
- 🔒 **Внутренности:** Приватные компоненты, утилиты - НЕ экспортируются

**Характеристики**:
- ✅ **UI фреймворк изолирован** - все React Router/Vite конфиги здесь
- ✅ **Собственные зависимости** - package.json только для web UI
- ✅ **Build tool здесь** - vite.config.ts рядом с кодом
- ✅ **Легко добавить другие UI** - CLI, Mobile, Next.js, etc.
- НЕ содержит бизнес-логику
- Использует hooks для доступа к Application Services
- Вызывает Queries/Commands через Composition Facades (`@/composition`)
- Импортирует Domain типы через алиасы (`@/domain`)

---

## Архитектурные границы

### Правило зависимостей

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (routes, components, hooks)        │
└────────────┬────────────────────────┘
             ↓ МОЖЕТ использовать
┌────────────┴────────────────────────┐
│      Application Layer              │
│  (query/command handlers)           │
└────────────┴────────────────────────┘
             ↓ МОЖЕТ использовать
┌────────────┴────────────────────────┐
│         Domain Layer                │
│  (entities, value objects, events)  │
└────────────┬────────────────────────┘
             ↑ РЕАЛИЗУЕТ интерфейсы
┌────────────┴────────────────────────┐
│     Infrastructure Layer            │
│  (api, repositories, storage)       │
└─────────────────────────────────────┘
```

**Главный принцип**: Зависимости направлены ТОЛЬКО внутрь (к Domain Layer).

### ✅ Разрешенные зависимости (через алиасы)

| Слой | Может импортировать | Алиасы | Примечание |
|------|---------------------|--------|------------|
| **Domain** | НИЧЕГО | `@/domain/*` (только внутри себя) | Полностью изолирован |
| **Application** | Domain | `@/domain` | Только через Public API |
| **Infrastructure** | Domain (интерфейсы) | `@/domain` | Только интерфейсы, НЕ реализации |
| **Composition** ⭐ | Domain, Application, Infrastructure | `@/domain`, `@/application/*`, `@/infrastructure/*` | **Единственный** слой с доступом ко всем |
| **Presentation** | Domain (типы), Composition (facades) | `@/domain`, `@/composition` | ❌ НЕ может импортировать Application/Infrastructure |

**Ключевое правило:** Все импорты через Public API (`index.ts`). Composition - единственный слой с доступом ко всем остальным.

### ❌ Запрещенные зависимости

**Domain Layer НЕ МОЖЕТ**:
- Импортировать из других слоев
- Зависеть от React
- Зависеть от Remix
- Зависеть от HTTP библиотек
- Знать о UI

**Application Layer НЕ МОЖЕТ**:
- Импортировать из Presentation
- Импортировать из Infrastructure (кроме типов)
- Зависеть от React напрямую

**Core Systems НЕ МОГУТ**:
- Импортировать друг друга напрямую
- Импортировать из Application Handlers
- Импортировать из Presentation

**Infrastructure Layer НЕ МОЖЕТ**:
- Импортировать из Application
- Импортировать из Presentation
- Содержать бизнес-логику

---

## Public API модулей

**Философия:** Каждый модуль имеет четкую границу между публичным API и внутренней реализацией.

### Правило Public API

- ✅ **Public API** экспортируется через `index.ts`
- 🔒 **Внутренности** (реализация) НЕ экспортируются
- ✅ Импортировать **ТОЛЬКО** через `index.ts` (через алиасы)
- ❌ Импорт напрямую из файлов реализации - **ЗАПРЕЩЕН**

**Почему это важно:**
- Инкапсуляция - детали реализации скрыты
- Гибкость - можно менять внутреннюю структуру без влияния на других
- Контракт - `index.ts` это контракт модуля
- Безопасность рефакторинга - изменения внутри модуля не ломают других

### Примеры Public API

### Composition Root

```typescript
// src/composition/index.ts
export { queries } from './queries'  // Facade для Loaders
export { getResourceService, getCommandBus, getQueryBus } from './ServiceContainer'
export { resetContainer } from './ServiceContainer'
```

### Domain Layer

```typescript
// src/domain/index.ts
export * from './shared'
export * from './resource'
export * from './user'
```

```typescript
// src/domain/shared/index.ts
export * from './errors'
export * from './invariants'
export * from './base'
```

```typescript
// src/domain/shared/errors/index.ts
export { DomainError } from './DomainError'
export { InvariantViolationError } from './InvariantViolationError'
export { NotFoundError } from './NotFoundError'
export { DuplicateError } from './DuplicateError'
export { InvalidOperationError } from './InvalidOperationError'
```

```typescript
// src/domain/shared/invariants/index.ts
export { UuidInvariant } from './UuidInvariant'
export { StringInvariant } from './StringInvariant'        // Атомарные операции
export { EmailInvariant } from './EmailInvariant'
export { IdentifierInvariant } from './IdentifierInvariant'  // Композитные правила
```

```typescript
// src/domain/shared/base/index.ts
export { IRepository } from './IRepository'
export { DomainEvent } from './DomainEvent'
export { Entity } from './Entity'
export { ValueObject } from './ValueObject'
```

```typescript
// src/domain/resource/index.ts
export * from './aggregates'
export * from './entities'
export * from './value-objects'
export * from './repositories'
export * from './events'
```

```typescript
// src/domain/resource/aggregates/index.ts
export { Resource } from './Resource'
```

```typescript
// src/domain/resource/entities/index.ts
export { SecretField } from './SecretField'
export { CustomField } from './CustomField'
```

```typescript
// src/domain/resource/value-objects/index.ts
export { ResourceId } from './ResourceId'
export { ResourceName } from './ResourceName'
export { Namespace } from './Namespace'
export { FieldValue } from './FieldValue'
```

```typescript
// src/domain/resource/repositories/index.ts
export { IResourceRepository } from './IResourceRepository'
export { INamespaceRepository } from './INamespaceRepository'
```

```typescript
// src/domain/resource/events/index.ts
export { ResourceCreated } from './ResourceCreated'
export { ResourceUpdated } from './ResourceUpdated'
export { ResourceDeleted } from './ResourceDeleted'
```

### Core Systems

```typescript
// src/application/services/modal/index.ts
export { ModalManager, modalManager } from './ModalManager'
export { ModalProvider, useModalContext } from './ModalContext'
export type { AppMode, ModeContext, EditingState } from './types'
```

```typescript
// src/application/services/keymap/index.ts
export { KeymapRegistry, keymapRegistry } from './KeymapRegistry'
export { KeymapExecutor } from './KeymapExecutor'
export { KeymapProvider, useKeymapContext } from './KeymapContext'
export { registerAllKeymaps } from './keymaps'
export type { Keymap, KeyBinding, ActionContext } from './types'
```

```typescript
// src/application/services/focus/index.ts
export { FocusManager, focusManager } from './FocusManager'
export { FocusProvider, useFocusContext } from './FocusContext'
export type { FocusableElement, FocusableMetadata } from './types'
```

```typescript
// src/application/services/notification/index.ts
export { NotificationManager, notificationManager } from './NotificationManager'
export { NotificationProvider, useNotificationContext } from './NotificationContext'
export type { Notification, NotificationType } from './types'
```

### Application Layer

```typescript
// src/application/commands/index.ts
export type { ICommand } from './ICommand'
export type { ICommandHandler } from './ICommandHandler'
export type { ICommandBus } from './ICommandBus'
export * from './UICommands'
```

```typescript
// src/application/queries/index.ts
export type { IQuery, IQueryHandler, QueryResult } from './IQueryHandler'
export type { IQueryBus } from './IQueryBus'
export * from './ResourceQueries'
```

```typescript
// app/application/commands/index.ts
export { CommandTypes } from './CommandTypes'
export type { ICommand } from './ICommand'
export type { ICommandHandler } from './ICommandHandler'
export type { ICommandBus } from './ICommandBus'
export { CreateResourceCommand } from './CreateResourceCommand'
export { CreateResourceCommandHandler } from './handlers/CreateResourceCommandHandler'
```

### Infrastructure Layer

```typescript
// src/infrastructure/index.ts
export * from './api'
export * from './repositories'
export * from './commands'
export * from './queries'
export * from './event-bus'
export * from './storage'
export * from './clipboard'
```

```typescript
// src/infrastructure/commands/index.ts
export { InMemoryCommandBus } from './InMemoryCommandBus'
```

```typescript
// src/infrastructure/queries/index.ts
export { InMemoryQueryBus } from './InMemoryQueryBus'
```

```typescript
// src/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
export { ApiResourceRepository } from './ApiResourceRepository'
```

### Components

```typescript
// src/presentation/web/react/src/components/ResourceList/index.ts
export { ResourceList } from './ResourceList'
export { ResourceListItem } from './ResourceListItem'
export { ResourceSearch } from './ResourceSearch'
```

### Hooks

```typescript
// src/presentation/web/react/src/hooks/index.ts
export { useModal } from './useModal'
export { useKeymap } from './useKeymap'
export { useFocus } from './useFocus'
export { useFocusable } from './useFocusable'
export { useNotification } from './useNotification'
```

---

## Правила импорта

### 1. Public API vs Внутренности

#### ❌ **НЕПРАВИЛЬНО** - Импорт из файлов реализации:
```typescript
// Обход Public API - ЗАПРЕЩЕН!
import { Resource } from '@/domain/resource/Resource.ts'  // ❌
import { GetResourcesHandler } from '@/application/queries/handlers/GetResourcesHandler.ts'  // ❌
import { ApiClient } from '@/infrastructure/api/client.ts'  // ❌
```

#### ✅ **ПРАВИЛЬНО** - Только через Public API (`index.ts`):
```typescript
// Используем алиасы, которые указывают на index.ts
import { Resource, ResourceId, Namespace } from '@/domain'  // ✅ Public API
import { queries, commands } from '@/api'  // ✅ Facades
import { ResourceList } from '@/components/ResourceList'  // ✅ Локальные
```

### 2. Presentation → ТОЛЬКО Public API

#### ❌ **НЕПРАВИЛЬНО** - Прямой импорт handlers:
```typescript
// В Presentation Layer - НАРУШЕНИЕ архитектуры!
import { GetResourcesHandler } from '@/internal/application/queries/GetResourcesHandler'  // ❌ ESLint запретит!
import { ApiResourceRepository } from '@/internal/infrastructure/repositories/ApiResourceRepository'  // ❌ ESLint запретит!

export async function loader() {
  const repo = new ApiResourceRepository()  // ❌ Прямая зависимость
  const handler = new GetResourcesHandler(repo)  // ❌ DI в Presentation
  return await handler.execute()
}
```

#### ✅ **ПРАВИЛЬНО** - Использовать facades:
```typescript
// В Presentation Layer - Через Public API
import { queries } from '@/api'  // ✅ Facade

export async function loader() {
  return await queries.resources.list()  // ✅ Одна строка!
}
```

### 3. Composition → Единственный слой с доступом ко всем

#### ✅ **ПРАВИЛЬНО** - DI в Composition:
```typescript
// src/composition/queries/ResourceQueries.ts
import { Resource } from '@/domain'  // ✅ Public API
import { GetResourcesHandler } from '@/application/queries'  // ✅ Через Public API
import { ApiResourceRepository } from '@/infrastructure/repositories'  // ✅ Через Public API

export const queries = {
  resources: {
    async list() {
      // ✅ DI логика здесь! Composition - единственный слой с доступом ко всем
      const repository = new ApiResourceRepository()
      const handler = new GetResourcesHandler(repository)
      return await handler.execute()
    }
  }
}
```

### 4. Domain → Полная изоляция

#### ❌ **НЕПРАВИЛЬНО** - Импорт из других слоев:
```typescript
// src/domain/resource/Resource.ts
import { queries } from '@/api'  // ❌ ЗАПРЕЩЕНО!
import { ApiClient } from '@/internal/infrastructure/api/ApiClient'  // ❌ ЗАПРЕЩЕНО!
```

#### ✅ **ПРАВИЛЬНО** - Только другие Domain объекты:
```typescript
// src/domain/resource/aggregates/Resource.ts
import { ResourceId } from '../value-objects/ResourceId'  // ✅ Локальный импорт
import { Namespace } from '../value-objects/Namespace'    // ✅
import { CustomField } from '../entities/CustomField'     // ✅
import { DomainError } from '@/domain/shared/errors'      // ✅ Shared Kernel
import { DomainEvent } from '@/domain/shared/base'        // ✅ Базовый класс

// Domain определяет интерфейсы, не зная о реализации
interface IEventBus {
  publish<T>(event: T): void
}

// Infrastructure реализует
class EventBus implements IEventBus { ... }
```

### 5. Типы централизованы

```typescript
// src/shared/types/domain.ts - Re-export domain types
export type { Resource, Namespace, SecretField } from '@/domain'

// src/shared/types/infrastructure.ts - Re-export infrastructure types
export type { ApiResponse, ApiError } from '@/infrastructure'

// src/shared/types/index.ts - Single entry point
export * from './domain'
export * from './infrastructure'
export * from './api'
```

---

## Примеры правильного использования

### Пример 1: Получение данных через Application Service

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { useLoaderData } from 'react-router'
import { queries } from '@/composition'
import { ResourceList } from '@/components/ResourceList'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ (НОВЫЙ ПОДХОД - CQRS)
 * Loader выполняется ТОЛЬКО на сервере
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // ✅ Используем Query Facade - одна строка!
  return queries.listResources(request)
}

/**
 * ✅ КЛИЕНТСКИЙ КОМПОНЕНТ (+ SSR)
 * Выполняется на сервере (SSR) и клиенте (hydration)
 */
export default function Index() {
  // Получаем данные из loader
  const { resources } = useLoaderData<typeof loader>()
  
  return <ResourceList resources={resources} />
}
```

### Пример 2: Взаимодействие систем через Event Bus

```typescript
// src/application/services/notification/NotificationManager.ts
import { IEventBus } from '@/domain'

export class NotificationManager {
  constructor(private eventBus: IEventBus) {
    // Подписываемся на события других систем
    this.subscribeToEvents()
  }
  
  private subscribeToEvents() {
    // Слушаем события Resource Context
    this.eventBus.subscribe('ResourceCreated', (event) => {
      this.success(`Resource "${event.data.name}" created`)
    })
    
    this.eventBus.subscribe('ResourceDeleted', (event) => {
      this.info(`Resource "${event.data.name}" deleted`)
    })
  }
}
```

### Пример 3: Keymap использует Focus через колбэк

```typescript
// src/application/services/keymap/keymaps/navigation.ts
import type { Keymap } from '../types'

// FocusManager НЕ импортируется напрямую
// Вместо этого используется через ActionContext

export const navigationKeymaps: Keymap[] = [
  {
    id: 'nav-down',
    name: 'Navigate Down',
    binding: { key: 'j' },
    action: (context) => {
      // FocusManager доступен через глобальный singleton
      // который передается в ActionContext при инициализации
      const { focusManager } = context
      focusManager?.focusNext()
    },
    modes: ['navigation']
  }
]
```

### Пример 4: React Component использует hooks

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceList.tsx
import { useModal, useFocus, useKeymap } from '../hooks'
import { useLoaderData } from 'react-router'

export function ResourceList() {
  const resources = useLoaderData<Resource[]>()
  const { mode } = useModal()
  const { activeKeymaps } = useKeymap()
  
  // Регистрируем элементы для навигации
  useFocus('resource-list', {
    elements: resources.map(r => r.id)
  })
  
  return (
    <div className={mode === 'navigation' ? 'nav-mode' : 'edit-mode'}>
      {resources.map(resource => (
        <ResourceItem key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
```

### Пример 5: Providers в root.tsx

```typescript
// src/presentation/web/react/src/root.tsx
// React Context providers (UI layer)
import { ModalProvider } from './contexts/ModalContext'
import { KeymapProvider } from './contexts/KeymapContext'
import { FocusProvider } from './contexts/FocusContext'
import { NotificationProvider } from './contexts/NotificationContext'

/**
 * ✅ ПРАВИЛЬНО: Презентационный слой использует только Public API систем
 * Providers получают зависимости внутри себя или через Composition Root
 */
export default function App() {
  return (
    <html>
      <body>
        <ModalProvider>
          <KeymapProvider>
            <FocusProvider>
              <NotificationProvider>
                <Outlet />
              </NotificationProvider>
            </FocusProvider>
          </KeymapProvider>
        </ModalProvider>
      </body>
    </html>
  )
}
```

**Примечание**: Если Providers нужны зависимости (например, EventBus), они должны:
- Либо создавать их внутри себя
- Либо получать через Composition Root
- ❌ **НЕ импортировать напрямую из Infrastructure**

---

## Паттерны коммуникации между системами

### 1. Event Bus (асинхронная коммуникация)

Используется для слабой связанности систем.

```typescript
// System A публикует событие
eventBus.publish({
  eventType: 'ResourceCreated',
  data: { ... }
})

// System B подписывается
eventBus.subscribe('ResourceCreated', (event) => {
  // Реагирует на событие
})
```

### 2. Singleton через ActionContext

Используется когда Keymap'ам нужен доступ к системам.

```typescript
// При инициализации KeymapExecutor
const executor = new KeymapExecutor(registry, modalManager, focusManager)

// Keymap получает доступ через context
action: (context) => {
  context.focusManager.focusNext()
}
```

### 3. React Context + Hooks

Используется для доступа из UI компонентов.

```typescript
// Provider в root.tsx
<ModalProvider>
  <App />
</ModalProvider>

// Hook в компоненте
const { mode, enterEditingMode } = useModal()
```

---

## Чек-лист для новых модулей

При добавлении нового модуля:

- [ ] Определить к какому слою он относится
- [ ] Создать `index.ts` с Public API
- [ ] Убедиться, что зависимости направлены внутрь
- [ ] Не импортировать модули того же уровня напрямую
- [ ] Использовать Event Bus для межсистемной коммуникации
- [ ] Документировать Public API
- [ ] Написать unit тесты

---

## 📚 Итоговая таблица: Откуда каждый слой

| Слой | Источник | Почему нужен | Что решает | Public API | Внутренности |
|------|----------|--------------|------------|------------|--------------|
| **Domain** | DDD (Eric Evans) | Бизнес-логика не зависит от технологий | Изоляция бизнес-правил | Entities, VOs, Events, Errors | Приватные методы |
| **Application** | DDD + CQRS + Hexagonal | Оркестрация use cases | Валидация, транзакции, DTO↔Domain | Query/Command типы, Handlers, Ports | Приватные методы |
| **Infrastructure** | DDD + Hexagonal + Clean | Изоляция технических деталей | Работа с API/DB/внешними системами | Репозитории, Services, Factories | Приватные методы |
| **Composition** ⭐ | DI Principles + Clean + Hexagonal | Соблюдение Dependency Rule | DI, сборка приложения, упрощение Presentation | queries, commands facades | DI логика, ServiceContainer |
| **Presentation** | DDD + Clean + Hexagonal | Framework as Detail | UI, навигация, пользовательский ввод | React компоненты, hooks | Приватные компоненты |

**Ключевое отличие Composition от классического DDD:**
- В классическом DDD нет явного слоя для DI
- Clean Architecture требует: Infrastructure НЕ зависит от Application
- Composition Root решает эту проблему, являясь единственным местом, где слои пересекаются

---

## 🎯 Главные правила

### 1. Dependency Rule (Clean Architecture)
Зависимости направлены только внутрь → к Domain Layer

### 2. Public API через `index.ts`
- ✅ Импортировать **ТОЛЬКО** через `index.ts` (через алиасы)
- 🔒 Внутренности модулей - ПРИВАТНЫЕ

### 3. Алиасы строго разделены
- `@/domain` - Public API типов (указывает на `index.ts`)
- `@/api` - Facades (указывает на `index.ts`)  
- `@/*` - Локальные компоненты и модули
- `@/internal/*` - ТОЛЬКО для Composition Layer!

### 4. ESLint enforcement
- Presentation НЕ может импортировать `@/internal/*`
- Domain полностью изолирован
- Infrastructure НЕ зависит от Application

---

## См. также

- [Getting Started](./GETTING_STARTED.md) - Руководство по началу работы
- [Architecture Boundaries](./ARCHITECTURE_BOUNDARIES.md) - Детали правил импортов и ESLint
- [Composition Layer](./COMPOSITION_LAYER.md) - Подробнее о Composition Root
- [Error Handling](./error-handling/README.md) - Обработка ошибок, инварианты и Result Pattern
- [Data Flow](./DATA_FLOW.md) - Поток данных и работа с Application Services
- [Command Bus](./COMMAND_BUS.md) - Паттерн Command Bus для UI команд (CQRS - Commands)
- [Query Handlers](./QUERY_HANDLERS.md) - Query Handlers для чтения данных (CQRS - Queries)
- [Architecture Design](./concepts/ARCHITECTURE_DESIGN.md) - Детальная архитектура
- [System Interfaces](./contracts/system-interfaces.md) - Интерфейсы систем
- [Domain Types](./contracts/domain-types.md) - Доменные типы
