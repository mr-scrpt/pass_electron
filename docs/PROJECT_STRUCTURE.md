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

## Общая структура [#structure:tree]

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
    ├── domain/                    # Domain Layer (DDD)
    │   ├── resource/              # Resource Bounded Context
    │   │   ├── aggregates/        # Aggregate Roots
    │   │   ├── entities/          # Entities
    │   │   ├── value-objects/     # Value Objects
    │   │   ├── repositories/      # Repository Interfaces
    │   │   ├── events/            # Domain Events
    │   │   └── index.ts           # Public API
    │   │
    │   ├── user/                  # User Bounded Context (пример)
    │   │   └── ...
    │   │
    │   └── shared/                # Shared Kernel (DDD)
    │       ├── errors/            # Domain Errors
    │       │   ├── DomainError.ts
    │       │   ├── InvariantViolationError.ts
    │       │   ├── NotFoundError.ts
    │       │   └── ...
    │       ├── invariants/        # Reusable Invariants (UuidInvariant)
    │       ├── specification/     # Domain Specifications
    │       │   └── common/        # CommonLengthSpec, CommonPatternSpec, etc.
    │       ├── base/              # Base classes/interfaces
    │       └── index.ts
    │
    ├── application/               # Application Layer (DDD)
    │   ├── queries/              
    │   ├── commands/             
    │   ├── ports/                
    │   └── services/             
    │
    ├── infrastructure/            # Infrastructure Layer (DDD)
    │   ├── persistence/          
    │   ├── services/             
    │   └── event-bus/            
    │
    ├── composition/                # Composition Root (DI Container)
    │   ├── ServiceContainer.ts   
    │   ├── modules/              
    │   ├── queries/               # Query Facades
    │   └── commands/              # Command Facades
    │
    ├── shared/                    # Shared Utilities (framework-agnostic)
    │   ├── validation/            # Validation API (фасад над @sweet-monads/either)
    │   ├── specification/         # ISpecification interface
    │   ├── errors/                # BaseError (базовый класс для ВСЕХ ошибок)
    │   └── types/                 # Type re-exports
    │
    └── presentation/              # Presentation Layer (DDD)
        │
        ├── platform-configs/      # Platform Configs workspace (NEW!)
        │   ├── package.json       # Platform-specific dependencies (sonner)
        │   ├── tsconfig.json      # TypeScript для platform-configs
        │   ├── README.md          # Быстрый старт
        │   │
        │   ├── common/            # Базовые зависимости (все платформы)
        │   │   └── index.ts       # createCommonDependencies()
        │   │
        │   ├── web/               # Web конфиг
        │   │   ├── adapters/
        │   │   │   └── SonnerNotificationDisplay.ts
        │   │   └── index.ts       # createPlatformDependencies()
        │   │
        │   └── electron/          # Electron конфиг
        │       └── index.ts       # createPlatformDependencies()
        │
        ├── electron/              # Electron-specific
        │   ├── adapters/
        │   │   └── ElectronNotificationDecorator.ts
        │   └── scripts/
        │       └── prepare-web.sh # Build script (подмена конфига)
        │
        └── web/                   # Web presentations
            └── react/             # React Router implementation
                ├── package.json   # Web-specific + platform-configs
                ├── vite.config.ts # Vite build tool config
                ├── tailwind.config.js
                ├── postcss.config.js
                │
                ├── configs/
                │   └── platform.config.ts  # Реэкспорт (подменяется!)
                │
                └── src/           # React Router code
                    ├── routes/
                    ├── components/
                    ├── hooks/
                    ├── styles/
                    ├── init.ts    # initializeApp(deps)
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

### Структура Composition Layer [#structure:tree]

```
src/composition/                       
├── ServiceContainer.ts                
├── modules/                           
│   └── ResourceModule.ts              
├── queries/                           
│   └── ResourceQueries.ts             
├── commands/                          
│   └── ResourceCommands.ts            
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

### Структура Domain Layer [#structure:tree]

```
src/domain/                                    #structure:
├── resource/                                  #structure:
│   ├── aggregates/                            #structure:
│   │   ├── Resource.ts                        #structure:
│   │   └── index.ts                           #structure:
│   │
│   ├── entities/                              #structure:
│   │   ├── SecretField.ts                     #structure:
│   │   ├── CustomField.ts                     #structure:
│   │   └── index.ts                           #structure:
│   │
│   ├── value-objects/                         #structure:
│   │   ├── ResourceId.ts                      #structure:
│   │   ├── ResourceName.ts                    #structure:
│   │   ├── Namespace.ts                       #structure:
│   │   ├── FieldValue.ts                      #structure:
│   │   └── index.ts                           #structure:
│   │
│   ├── invariants/                            # Инварианты специфичные для Resource #structure:
│   │   ├── NamespaceInvariant.ts              # Валидация Namespace #structure:
│   │   ├── ResourceNameInvariant.ts           # Валидация ResourceName #structure:
│   │   └── index.ts                           #structure:
│   │
│   ├── repositories/                          #structure:
│   │   ├── IResourceRepository.ts             #structure:
│   │   ├── INamespaceRepository.ts            #structure:
│   │   └── index.ts                           #structure:
│   │
│   ├── events/                                #structure:
│   │   ├── ResourceCreated.ts                 #structure:
│   │   ├── ResourceUpdated.ts                 #structure:
│   │   ├── ResourceDeleted.ts                 #structure:
│   │   └── index.ts                           #structure:
│   │
│   ├── errors/                                #structure:
│   │   ├── DuplicateFieldLabelError.ts        #structure:
│   │   ├── ResourceLockedError.ts             #structure:
│   │   └── index.ts                           #structure:
│   │
│   └── index.ts                               #structure:
│
├── user/                                      #structure:
│   ├── aggregates/                            #structure:
│   │   ├── User.ts                            #structure:
│   │   └── index.ts                           #structure:
│   ├── value-objects/                         #structure:
│   │   ├── UserId.ts                          #structure:
│   │   ├── Email.ts                           #structure:
│   │   ├── Password.ts                        #structure:
│   │   └── index.ts                           #structure:
│   ├── repositories/                          #structure:
│   │   ├── IUserRepository.ts                 #structure:
│   │   └── index.ts                           #structure:
│   ├── events/                                #structure:
│   │   ├── UserRegistered.ts                  #structure:
│   │   ├── UserLoggedIn.ts                    #structure:
│   │   └── index.ts                           #structure:
│   └── index.ts                               #structure:
│
└── shared/                                    #structure:
    ├── errors/                                #structure:
    │   ├── DomainError.ts                     #structure:
    │   ├── InvariantViolationError.ts         #structure:
    │   ├── NotFoundError.ts                   #structure:
    │   ├── DuplicateError.ts                  #structure:
    │   ├── InvalidOperationError.ts           #structure:
    │   └── index.ts                           #structure:
    │
    ├── invariants/                            #structure:
    │   ├── IInvariant.ts                      # Интерфейс для инвариантов #structure:
    │   ├── UuidInvariant.ts                   # Shared - используется везде #structure:
    │   └── index.ts                           #structure:
    │
    ├── base/                                  #structure:
    │   ├── IRepository.ts                     #structure:
    │   ├── DomainEvent.ts                     #structure:
    │   ├── Entity.ts                          #structure:
    │   ├── ValueObject.ts                     #structure:
    │   └── index.ts                           #structure:
    │
    └── index.ts                               #structure:
```

**📌 Что говорит DDD о структуре Domain Layer:**

1. **Bounded Context** (`resource/`, `user/`) - автономные бизнес-модули
   - Каждый контекст содержит ВСЁ необходимое для своей работы
   - `aggregates/` - Aggregate Roots (главные сущности)
   - `entities/` - Entities (сущности внутри Aggregate)
   - `value-objects/` - Value Objects (неизменяемые значения)
   - `invariants/` - Domain-специфичные инварианты (например, NamespaceInvariant)
   - `specifications/` - Бизнес-правила (например, NotReservedNamespaceSpec)
   - `repositories/` - Repository Interfaces (специфичные для контекста)
   - `events/` - Domain Events (специфичные для контекста)
   - `index.ts` - Public API модуля

2. **Shared Kernel** (`shared/`) - минимальный общий код
   - `errors/` - Базовые Domain Errors
   - `invariants/` - Shared инварианты (используются везде, например UuidInvariant)
   - `specification/` - Common спецификации
   - `base/` - Базовые классы/интерфейсы (IRepository, DomainEvent)
   - ⚠️ **Только действительно общее!** Не раздувать Shared Kernel

3. **Ключевое правило:** Бизнес-домены (resource, user) НЕ смешиваются с техническими концепциями (shared)
   - Реализации в Infrastructure Layer

4. **Domain Events** (`events/`) - события, которые происходят в домене
   - Публикуются Aggregates при изменении состояния
   - Обрабатываются в Application/Infrastructure

**🎯 Ключевой принцип DDD**: Domain Layer знает **ЧТО** нужно сделать (интерфейсы), но НЕ знает **КАК** (реализации в Infrastructure).

**📋 Правила импортов:**
- ✅ **МОЖЕТ импортировать:** 
  - Другие Domain объекты через `@/domain/*` `#alias:@/`
  - Shared утилиты через `@/shared/*` `#alias:@/` (Validation API, Specification Pattern)
- ❌ **НЕ МОЖЕТ импортировать:** Application, Infrastructure, Composition, Presentation, React, HTTP, etc.
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
- Транзакционные границы
- Валидация команд/запросов
- Преобразование DTO ↔ Domain

### Структура Application Layer [#structure:tree]

```
src/application/                                       
├── queries/                                           
│   ├── QueryTypes.ts
│   ├── IQuery.ts                                      
│   ├── IQueryHandler.ts                               
│   ├── IQueryBus.ts                                   
│   ├── ListResourcesQuery.ts                          
│   ├── GetResourceByIdQuery.ts                        
│   ├── handlers/                                      
│   │   ├── ListResourcesQueryHandler.ts               
│   │   └── GetResourceByIdQueryHandler.ts             
│   ├── dtos/                                          
│   │   └── ResourceListItemDTO.ts                     
│   └── index.ts
├── commands/                                          
│   ├── CommandTypes.ts
│   ├── ICommand.ts                                    
│   ├── ICommandHandler.ts                             
│   ├── ICommandBus.ts                                 
│   ├── CreateResourceCommand.ts                       
│   ├── UpdateResourceCommand.ts                       
│   ├── DeleteResourceCommand.ts                       
│   ├── handlers/                                      
│   │   ├── CreateResourceCommandHandler.ts            
│   │   ├── UpdateResourceCommandHandler.ts            
│   │   └── DeleteResourceCommandHandler.ts            
│   └── index.ts
├── shared/                                            
│   ├── BaseQueryHandler.ts                            
│   ├── BaseCommandHandler.ts                          
│   ├── ApplicationPipelineContext.ts                  
│   └── index.ts
├── ports/                                             
│   ├── ILogger.ts                                     
│   ├── IRequestParser.ts                              
│   ├── IClipboardService.ts                           
│   ├── IStorageService.ts                             
│   └── index.ts
├── errors/                                            
│   ├── CommandError.ts                                
│   ├── QueryError.ts                                  
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
- **Query/Command Handlers** - используют Pipeline Pattern для композиции операций
- **shared/** - BaseQueryHandler, BaseCommandHandler с helper методами
- **Ports** - интерфейсы для адаптеров (Hexagonal Architecture), включая ILogger
- Реализует CQRS (Command Query Responsibility Segregation)
- Предоставляет высокоуровневый API для Presentation Layer через Facades

**Новое в 2025:**
- ✅ Pipeline Pattern для всех Handlers
- ✅ BaseHandlers с переиспользуемыми helper методами
- ✅ Функциональный стиль (asyncChain, fromCondition)
- ✅ Логирование ТОЛЬКО unexpected ошибок через ILogger

### 3. Application Services (`src/application/services/`)

**Назначение**: Основные системы приложения (Modal, Keymap, Focus, Notification).

### Структура Application Services [#structure:tree]

```
src/application/services/                              
├── modal/                                             
│   ├── ModalManager.ts                                
│   ├── IModalManager.ts                               
│   ├── types.ts
│   └── index.ts
├── keymap/                                            
│   ├── KeymapRegistry.ts                              
│   ├── KeymapExecutor.ts                              
│   ├── IKeymapRegistry.ts                             
│   ├── types.ts
│   └── index.ts
├── focus/                                             
│   ├── FocusManager.ts                                
│   ├── IFocusManager.ts                               
│   ├── types.ts
│   └── index.ts
└── notification/                                      
    ├── NotificationManager.ts                         
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

### Структура Infrastructure Layer [#structure:tree]

```
src/infrastructure/                                    
├── commands/                                          
│   ├── InMemoryCommandBus.ts                          
│   └── index.ts
├── queries/                                           
│   ├── InMemoryQueryBus.ts                            
│   └── index.ts
├── api/                                               
│   ├── client.ts                                      
│   ├── ResourceApiClient.ts                           
│   ├── NamespaceApiClient.ts                          
│   └── index.ts
├── repositories/                                      
│   ├── MockResourceRepository.ts                      
│   ├── ApiResourceRepository.ts                       
│   └── index.ts
├── mocks/                                             
│   ├── resources.mock.ts
│   └── index.ts
├── event-bus/                                         
│   ├── EventBus.ts                                    
│   └── index.ts
├── storage/                                           
│   ├── LocalStorage.ts                                
│   └── index.ts
├── clipboard/                                         
│   ├── ClipboardService.ts                            
│   └── index.ts
└── errors/                                            
    ├── NetworkError.ts                                
    ├── ApiError.ts                                    
    ├── StorageError.ts                                
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

### 5. Shared Utilities (`src/shared/`) 🔧

**📚 Откуда:**
- **НЕ из DDD** - это технический слой для утилит
- **Clean Architecture** - Framework-agnostic utilities
- **Hexagonal Architecture** - Shared infrastructure

**🎯 Назначение**: Framework-agnostic утилиты и паттерны, которые могут использоваться всеми слоями.

**❓ Почему нужен:**
- Изоляция Domain от конкретных библиотек (например, `@sweet-monads/either`)
- Переиспользуемые технические паттерны (Specification Pattern)
- Единая точка изменений при замене библиотек

**✅ Что решает:**
- **Фасад над монадами** - Domain не зависит от конкретной библиотеки
- **Specification Pattern** - переиспользуемые правила валидации
- **Type re-exports** - удобство импорта типов

**⚠️ ВАЖНО:** `src/shared/` ≠ `src/domain/shared/`
- `src/domain/shared/` - **Shared Kernel (DDD)** - бизнес-логика (Domain Errors, Invariants)
- `src/shared/` - **Shared Utilities** - технические утилиты (Validation API, Specification Pattern)

### Структура Shared Layer [#structure:tree]

```
src/shared/
├── validation/                # Validation API (фасад над @sweet-monads/either)
│   ├── Validation.ts          # type Validation<E, T>
│   ├── ValidationCombinators.ts  # Фасад для mergeInMany/sequence
│   ├── helpers.ts             # valid, invalid, fromCondition, asyncChain
│   └── index.ts
│
├── pipeline/                  # Pipeline Pattern (NEW 2025)
│   ├── Pipeline.ts            # Pipeline класс для композиции операций
│   ├── PipelineContext.ts     # Базовый контекст
│   └── index.ts
│
├── specification/             # Specification Pattern (базовый интерфейс)
│   ├── ISpecification.ts      # interface ISpecification<T>
│   └── index.ts
│
├── errors/                    # Базовые ошибки
│   ├── IError.ts              # Интерфейс для ошибок
│   ├── BaseError.ts           # Базовый класс для ВСЕХ ошибок
│   ├── ValidationError.ts     # Ошибки валидации
│   ├── DuplicateError.ts      # Ошибки дублирования
│   ├── NotFoundError.ts       # Ошибки "не найдено"
│   └── index.ts
│
└── types/                     # Type re-exports
    ├── domain.ts              # Re-export domain types
    ├── infrastructure.ts      # Re-export infrastructure types
    └── index.ts
```

**Что здесь:**

1. **validation/** - Фасад над `@sweet-monads/either`
   - ✅ Domain импортирует `Validation<E, T>` вместо `Either<E, T>`
   - ✅ Легко заменить библиотеку (sweet-monads → fp-ts → neverthrow)
   - ✅ `helpers.ts` - valid, invalid, fromCondition, asyncChain
   - ✅ Единая точка изменений

2. **pipeline/** - Pipeline Pattern для композиции операций ⭐ NEW 2025
   - ✅ Декларативное описание последовательности шагов
   - ✅ Поддержка retry, условных шагов, компенсаций (Saga)
   - ✅ Используется в Query/Command Handlers
   - ✅ Framework-agnostic паттерн

3. **specification/** - Базовый интерфейс Specification Pattern
   - ✅ `ISpecification<T>` - используется Domain спецификациями
   - ✅ Реальные спецификации живут в `src/domain/shared/specification/common/`

4. **errors/** - Базовые ошибки и интерфейс IError
   - ✅ `IError` - интерфейс для полиморфной обработки ошибок
   - ✅ `BaseError` - базовый класс для Domain, Application, Infrastructure errors
   - ✅ `ValidationError`, `DuplicateError`, `NotFoundError` - специализированные ошибки
   - ✅ Используется в ISpecification.isSatisfiedBy()
   - ✅ Поддержка code, context, cause (error chaining)

5. **types/** - Переэкспорт типов для удобства
   - ✅ Удобство импорта типов из разных слоев

**Правила:**
- ✅ **Только framework-agnostic утилиты** (не зависят от React, Express, etc.)
- ✅ **Не содержит бизнес-логики** (бизнес-логика в `src/domain/`)
- ✅ **Может использоваться любым слоем** (Domain, Application, Infrastructure)
- ✅ **Может зависеть от библиотек-утилит** (`@sweet-monads/either`, `lodash`, etc.)
- ❌ **Не должен зависеть от слоев архитектуры** (Domain, Application, Infrastructure)

**📋 Правила импортов:**
- ✅ **МОЖЕТ импортировать:** Библиотеки-утилиты (`@sweet-monads/either`, `lodash`)
- ❌ **НЕ МОЖЕТ импортировать:** Domain, Application, Infrastructure, Presentation
- ✅ **Public API:** Validation API, Specification Pattern, Type re-exports
- 🔒 **Внутренности:** Адаптеры библиотек - скрыты за фасадом

**Характеристики:**
- Framework-agnostic (не зависит от UI фреймворков)
- Технические паттерны (не бизнес-логика)
- Фасады над библиотеками (защита от vendor lock-in)
- Переиспользуемые утилиты (для всех слоев)

#### Shared index.ts - Public API [#code|#structure:path]

```typescript
// src/shared/index.ts
// Validation API
export type { Validation } from './validation'
export { valid, invalid, fromCondition, ValidationCombinators } from './validation'

// Pipeline Pattern
export { Pipeline } from './pipeline'
export type { PipelineContext } from './pipeline'

// Specification Pattern
export type { ISpecification } from './specification'

// BaseError
export { BaseError } from './errors'
export type { IError } from './errors'
```

#### Shared types index.ts [#code|#structure:path]

```typescript
// src/shared/types/index.ts
export * from './domain'
export * from './infrastructure'
```

#### Shared domain types [#code|#structure:path]

```typescript
// src/shared/types/domain.ts
// Re-export domain types for convenience
export type {
  Resource,
  ResourceId,
  Namespace,
  ResourceName
} from '@/domain'
```

#### Shared infrastructure types [#code|#structure:path]

```typescript
// src/shared/types/infrastructure.ts
// Re-export infrastructure types for convenience
export type {
  ResourceListItemDTO
} from '@/application/queries/dtos'
```

---

### 6. Presentation Layer (`src/presentation/`) 🎨

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

### Структура Presentation Layer [#structure:tree]

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

### 6.1. Platform Configs (`src/presentation/platform-configs/`) ⚙️

**NEW!** Workspace для platform-specific конфигураций и зависимостей.

**🎯 Назначение**: Централизованное управление зависимостями для разных платформ (Web, Electron, Mobile).

**📦 Структура:**

```
src/presentation/platform-configs/
├── common/                    # Базовые зависимости (все платформы)
│   └── index.ts              # repository, logger
│
├── web/                      # Web конфиг
│   ├── adapters/
│   │   └── SonnerNotificationDisplay.ts
│   └── index.ts              # РАСШИРЯЕТ common + notification
│
└── electron/                 # Electron конфиг
    └── index.ts              # РАСШИРЯЕТ common + ElectronDecorator
```

**✅ Что решает:**
- ❌ React НЕ знает о платформе (Web/Electron)
- ❌ Vite НЕ содержит условную логику
- ❌ Библиотеки НЕ дублируются
- ✅ DI через `createPlatformDependencies()`
- ✅ Decorator Pattern для расширения Web → Electron

**📚 Детали:** См. [`/docs/PLATFORM_CONFIGS_ARCHITECTURE.md`](./PLATFORM_CONFIGS_ARCHITECTURE.md)

---

## Архитектурные границы

### Правило зависимостей [#diagram:architecture]

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
| **Domain** | Shared | `@/domain/*`, `@/shared/*` | Изолирован от других слоев |
| **Application** | Domain, Shared | `@/domain`, `@/shared/*` | Только через Public API |
| **Infrastructure** | Domain (интерфейсы), Shared | `@/domain`, `@/shared/*` | Только интерфейсы, НЕ реализации |
| **Composition** ⭐ | Domain, Application, Infrastructure, Shared | `@/domain`, `@/application/*`, `@/infrastructure/*`, `@/shared/*` | **Единственный** слой с доступом ко всем |
| **Presentation** | Domain (типы), Composition (facades), Shared | `@/domain`, `@/composition`, `@/shared/*` | ❌ НЕ может импортировать Application/Infrastructure |
| **Shared** 🔧 | Библиотеки-утилиты | - | ❌ НЕ может импортировать слои архитектуры |

**Ключевые правила:**
- ✅ Все импорты через Public API (`index.ts`)
- ✅ **Shared** может использоваться **всеми слоями** (framework-agnostic утилиты)
- ✅ **Shared** НЕ может импортировать из слоев (Domain, Application, Infrastructure)
- ✅ Composition - единственный слой с доступом ко всем остальным

### ❌ Запрещенные зависимости

**Domain Layer НЕ МОЖЕТ**:
- Импортировать из Application, Infrastructure, Composition, Presentation
- ✅ **МОЖЕТ импортировать** из Shared (`@/shared/*`) - framework-agnostic утилиты
- Зависеть от React
- Зависеть от Remix
- Зависеть от HTTP библиотек
- Знать о UI

**Shared Layer НЕ МОЖЕТ**:
- Импортировать из Domain, Application, Infrastructure, Composition, Presentation
- Зависеть от UI фреймворков (React, Vue)
- Зависеть от серверных фреймворков (Express, Fastify)
- Содержать бизнес-логику
- ✅ **МОЖЕТ зависеть** от библиотек-утилит (`@sweet-monads/either`, `lodash`)

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

#### Composition index.ts [#code|#structure:path]

```typescript
// src/composition/index.ts
export { queries } from './queries'  // Facade для Loaders
export { getResourceService, getCommandBus, getQueryBus } from './ServiceContainer'
export { resetContainer } from './ServiceContainer'
```

### Domain Layer

#### Domain index.ts [#code|#structure:path]

```typescript
// src/domain/index.ts
export * from './shared'
export * from './resource'
export * from './user'
```

#### Domain shared index.ts [#code|#structure:path]

```typescript
// src/domain/shared/index.ts
export * from './errors'
export * from './invariants'
export * from './base'
```

#### Domain errors index.ts [#code|#structure:path]

```typescript
// src/domain/shared/errors/index.ts
export { DomainError } from './DomainError'
export { InvariantViolationError } from './InvariantViolationError'
export { NotFoundError } from './NotFoundError'
export { DuplicateError } from './DuplicateError'
export { InvalidOperationError } from './InvalidOperationError'
```

#### Domain base index.ts [#code|#structure:path]

```typescript
// src/domain/shared/base/index.ts
export { IRepository } from './IRepository'
export { DomainEvent } from './DomainEvent'
export { Entity } from './Entity'
export { ValueObject } from './ValueObject'
```

#### Domain resource index.ts [#code|#structure:path]

```typescript
// src/domain/resource/index.ts
export * from './aggregates'
export * from './entities'
export * from './value-objects'
export * from './repositories'
export * from './events'
```

#### Resource aggregates index.ts [#code|#structure:path]

```typescript
// src/domain/resource/aggregates/index.ts
export { Resource } from './Resource'
```

#### Resource entities index.ts [#code|#structure:path]

```typescript
// src/domain/resource/entities/index.ts
export { SecretField } from './SecretField'
export { CustomField } from './CustomField'
```

#### Resource value-objects index.ts [#code|#structure:path]

```typescript
// src/domain/resource/value-objects/index.ts
export { ResourceId } from './ResourceId'
export { ResourceName } from './ResourceName'
export { Namespace } from './Namespace'
export { FieldValue } from './FieldValue'
```

#### Resource invariants index.ts [#code|#structure:path]

```typescript
// src/domain/resource/invariants/index.ts
export { NamespaceInvariant } from './NamespaceInvariant'
export { ResourceNameInvariant } from './ResourceNameInvariant'
```

#### Resource repositories index.ts [#code|#structure:path]

```typescript
// src/domain/resource/repositories/index.ts
export { IResourceRepository } from './IResourceRepository'
export { INamespaceRepository } from './INamespaceRepository'
```

#### Resource events index.ts [#code|#structure:path]

```typescript
// src/domain/resource/events/index.ts
export { ResourceCreated } from './ResourceCreated'
export { ResourceUpdated } from './ResourceUpdated'
export { ResourceDeleted } from './ResourceDeleted'
```

#### Resource errors index.ts [#code|#structure:path]

```typescript
// src/domain/resource/errors/index.ts
export { DuplicateFieldLabelError } from './DuplicateFieldLabelError'
export { ResourceLockedError } from './ResourceLockedError'
```

### Core Systems

#### Modal service index.ts [#code|#structure:path]

```typescript
// src/application/services/modal/index.ts
export { ModalManager, modalManager } from './ModalManager'
export { ModalProvider, useModalContext } from './ModalContext'
export type { AppMode, ModeContext, EditingState } from './types'
```

#### Keymap service index.ts [#code|#structure:path]

```typescript
// src/application/services/keymap/index.ts
export { KeymapRegistry, keymapRegistry } from './KeymapRegistry'
export { KeymapExecutor } from './KeymapExecutor'
export { KeymapProvider, useKeymapContext } from './KeymapContext'
export { registerAllKeymaps } from './keymaps'
export type { Keymap, KeyBinding, ActionContext } from './types'
```

#### Focus service index.ts [#code|#structure:path]

```typescript
// src/application/services/focus/index.ts
export { FocusManager, focusManager } from './FocusManager'
export { FocusProvider, useFocusContext } from './FocusContext'
export type { FocusableElement, FocusableMetadata } from './types'
```

#### Notification service index.ts [#code|#structure:path]

```typescript
// src/application/services/notification/index.ts
export { NotificationManager, notificationManager } from './NotificationManager'
export { NotificationProvider, useNotificationContext } from './NotificationContext'
export type { Notification, NotificationType } from './types'
```

### Application Layer

#### Application commands index.ts [#code|#structure:path]

```typescript
// src/application/commands/index.ts
export type { ICommand } from './ICommand'
export type { ICommandHandler } from './ICommandHandler'
export type { ICommandBus } from './ICommandBus'
export * from './UICommands'
```

#### Application queries index.ts [#code|#structure:path]

```typescript
// src/application/queries/index.ts
export type { IQuery, IQueryHandler } from './IQueryHandler'
export type { IQueryBus } from './IQueryBus'
export { ListResourcesQuery, GetResourceByIdQuery } from './ResourceQueries'
export { ListResourcesQueryHandler, GetResourceByIdQueryHandler } from './handlers'
export type { ResourceListItemDTO, ResourceDetailDTO } from './dtos'
```

#### Commands Public API [#code|#structure:path]

```typescript
// src/application/commands/index.ts
export { CommandTypes } from './CommandTypes'
export type { ICommand } from './ICommand'
export type { ICommandHandler } from './ICommandHandler'
export type { ICommandBus } from './ICommandBus'
export { CreateResourceCommand } from './CreateResourceCommand'
export { CreateResourceCommandHandler } from './handlers/CreateResourceCommandHandler'
```

### Infrastructure Layer

#### Infrastructure index.ts [#code|#structure:path]

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

#### Infrastructure commands index.ts [#code|#structure:path]

```typescript
// src/infrastructure/commands/index.ts
export { InMemoryCommandBus } from './InMemoryCommandBus'
```

#### Infrastructure queries index.ts [#code|#structure:path]

```typescript
// src/infrastructure/queries/index.ts
export { InMemoryQueryBus } from './InMemoryQueryBus'
```

#### Infrastructure repositories index.ts [#code|#structure:path]

```typescript
// src/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
export { ApiResourceRepository } from './ApiResourceRepository'
```

### Components

#### Component index.ts [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ResourceList/index.ts
export { ResourceList } from './ResourceList'
export { ResourceListItem } from './ResourceListItem'
export { ResourceSearch } from './ResourceSearch'
```

### Hooks

#### Hooks index.ts [#code|#structure:path]

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

#### ❌ **НЕПРАВИЛЬНО** - Импорт из файлов реализации

##### Антипаттерн [#code]

```typescript
// Обход Public API - ЗАПРЕЩЕН!
import { Resource } from '@/domain/resource/Resource.ts'  // ❌
import { GetResourcesHandler } from '@/application/queries/handlers/GetResourcesHandler.ts'  // ❌
import { ApiClient } from '@/infrastructure/api/client.ts'  // ❌
```

#### ✅ **ПРАВИЛЬНО** - Только через Public API (`index.ts`)

##### Правильные импорты [#code]

```typescript
// Используем алиасы, которые указывают на index.ts
import { Resource, ResourceId, Namespace } from '@/domain'  // ✅ Public API
import { queries, commands } from '@/api'  // ✅ Facades
import { ResourceList } from '@/components/ResourceList'  // ✅ Локальные
```

### 2. Presentation → ТОЛЬКО Public API

#### ❌ **НЕПРАВИЛЬНО** - Прямой импорт handlers

##### Антипаттерн [#code]

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

#### ✅ **ПРАВИЛЬНО** - Использовать facades

##### Правильное использование [#code|#structure:path]

```typescript
// В Presentation Layer - Через Public API
import { queries } from '@/api'  // ✅ Facade

export async function loader() {
  return await queries.resources.list()  // ✅ Одна строка!
}
```

### 3. Composition → Единственный слой с доступом ко всем

#### ✅ **ПРАВИЛЬНО** - DI в Composition

##### DI в Composition [#code|#structure:path]

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

#### ❌ **НЕПРАВИЛЬНО** - Импорт из других слоев

##### Антипаттерн [#code]

```typescript
// src/domain/resource/Resource.ts
import { queries } from '@/api'  // ❌ ЗАПРЕЩЕНО!
import { ApiClient } from '@/internal/infrastructure/api/ApiClient'  // ❌ ЗАПРЕЩЕНО!
```

#### ✅ **ПРАВИЛЬНО** - Только другие Domain объекты

##### Правильные импорты в Domain [#code|#structure:path]

```typescript
// src/domain/resource/aggregates/Resource.ts
import { ResourceId } from '../value-objects/ResourceId'  // ✅ Локальный импорт
import { Namespace } from '../value-objects/Namespace'    // ✅
import { CustomField } from '../entities/CustomField'     // ✅
import { DomainError, DomainEvent } from '@/domain/shared' // ✅ Shared Kernel

// Domain определяет интерфейсы, не зная о реализации
interface IEventBus {
  publish<T>(event: T): void
}

// Infrastructure реализует
class EventBus implements IEventBus { ... }
```

### 5. Типы централизованы

#### Re-export типов [#code|#structure:path]

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

#### Loader с Query Facade [#code|#structure:path]

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

#### NotificationManager с Event Bus [#code|#structure:path]

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

#### Navigation keymaps [#code|#structure:path]

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

#### ResourceList с hooks [#code|#structure:path]

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

#### Root с Providers [#code|#structure:path]

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

#### Event Bus пример [#code]

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

#### ActionContext пример [#code]

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
| **Application** | DDD + CQRS + Hexagonal + **Pipeline** ⭐ | Оркестрация use cases с Pipeline | Композиция операций, валидация, DTO↔Domain, логирование | Query/Command типы, Handlers, Ports, BaseHandlers | Pipeline шаги, приватные методы |
| **Infrastructure** | DDD + Hexagonal + Clean | Изоляция технических деталей | Работа с API/DB/внешними системами | Репозитории, Services, Factories | Приватные методы |
| **Composition** ⭐ | DI Principles + Clean + Hexagonal | Соблюдение Dependency Rule | DI, сборка приложения, упрощение Presentation | queries, commands facades | DI логика, ServiceContainer |
| **Shared** | Clean Architecture | Framework-agnostic утилиты | Validation, Pipeline, Errors, Specifications | Validation API, Pipeline, IError, ISpecification | Адаптеры библиотек |
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

### Быстрый старт (2025)
- **[Quick Start](./QUICK_START.md)** ⭐ - Быстрый старт с Pipeline Pattern (НАЧНИ ЗДЕСЬ!)
- **[Pipeline Handlers Guide](./error-handling/PIPELINE_HANDLERS_GUIDE.md)** - Практическое руководство по Handlers
- **[Pipeline Pattern](./patterns/PIPELINE.md)** - Детальное описание Pipeline Pattern

### Архитектура
- [Getting Started](./GETTING_STARTED.md) - Руководство по началу работы
- [Architecture Boundaries](./ARCHITECTURE_BOUNDARIES.md) - Детали правил импортов и ESLint
- [Composition Layer](./COMPOSITION_LAYER.md) - Подробнее о Composition Root
- [DDD and Clean Architecture](./DDD_AND_CLEAN_ARCHITECTURE.md) - DDD паттерны
- **[Platform Configs Architecture](./PLATFORM_CONFIGS_ARCHITECTURE.md)** ⭐ **NEW!** - Platform-specific конфигурации и DI

### CQRS и обработка данных
- [Command Bus](./COMMAND_BUS.md) - Паттерн Command Bus для UI команд (CQRS - Commands)
- [Query Handlers](./QUERY_HANDLERS.md) - Query Handlers для чтения данных (CQRS - Queries)
- [Data Flow](./DATA_FLOW.md) - Поток данных и работа с Application Services

### Обработка ошибок
- [Error Handling](./error-handling/README.md) - Обработка ошибок, инварианты и Result Pattern
- [Invariants](./error-handling/INVARIANTS.md) - Инварианты и валидация в DDD
- [Error Escalation](./error-handling/ERROR_ESCALATION.md) - Either Pattern и монады

### Контракты и типы
- [Architecture Design](./concepts/ARCHITECTURE_DESIGN.md) - Детальная архитектура
- [System Interfaces](./contracts/system-interfaces.md) - Интерфейсы систем
- [Domain Types](./contracts/domain-types.md) - Доменные типы
