# Getting Started - Начало разработки

Руководство по началу работы над проектом Password Manager.

## Обзор документации

### 1. Концепты (concepts/)
Изучите концептуальные документы для понимания архитектуры:
- `THEORETICAL_CONCEPT.md` - исходная концепция
- `ARCHITECTURE_DESIGN.md` - детальная архитектура с DDD
- `IMPLEMENT_CONCEPT_OUTER.md` - план реализации

### 2. Контракты (contracts/)
Детальные спецификации типов и интерфейсов:
- `domain-types.md` - все доменные типы
- `system-interfaces.md` - интерфейсы систем
- `api-contracts.md` - REST API спецификация
- `events.md` - все события системы
- `infrastructure-types.md` - типы инфраструктуры

---

## Порядок изучения

```
1. concepts/THEORETICAL_CONCEPT.md
   └─→ Понять идею и требования
   
2. concepts/ARCHITECTURE_DESIGN.md
   └─→ Изучить архитектурное решение
   
3. PROJECT_STRUCTURE.md
   └─→ Изучить структуру проекта и архитектурные границы
   
4. contracts/domain-types.md
   └─→ Понять доменную модель
   
5. contracts/system-interfaces.md
   └─→ Изучить контракты систем
   
6. contracts/events.md
   └─→ Понять взаимодействие через события
   
7. contracts/api-contracts.md
   └─→ Изучить API спецификацию
```

---

## Структура проекта

> **📂 Детальная структура проекта с архитектурными границами и правилами импорта описана в [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

Краткий обзор основных директорий:

- **`src/domain/`** - Domain Layer (бизнес-логика, entities, value objects)
- **`src/application/`** - Application Layer (Query/Command Handlers, CQRS)
- **`src/application/services/`** - Application Services (modal, keymap, focus, notification)
- **`src/infrastructure/`** - Infrastructure Layer (API, repositories, storage)
- **`src/composition/`** - Composition Root (DI Container)
- **`src/presentation/web/react/`** - Presentation Layer (React Router, UI)
- **`docs/`** - Документация проекта
- **`tests/`** - Unit, integration и e2e тесты

**Ключевые принципы**:
- Зависимости направлены к Domain Layer (Clean Architecture)
- Модули изолированы и общаются через Event Bus
- Каждый модуль имеет четкий Public API через `index.ts`
- Domain Layer полностью независим от фреймворков

---

## Этапы разработки

> **📘 Каждый этап детально описан в `steps/`**

### Этап 0: Setup Environment

> **📦 [steps/step_0/README.md](../steps/step_0/README.md)** — Настройка окружения и зависимостей

- [ ] Инициализировать Remix проект
- [ ] Установить зависимости (Electron, Tailwind, Catppuccin)
- [ ] Настроить конфигурационные файлы
- [ ] Создать структуру папок
- [ ] Настроить Electron
- [ ] Проверить что всё работает

### Этап 1: Foundation (Domain Layer + Mock Data)

> **📦 [steps/step_1/README.md](../steps/step_1/README.md)** — Domain Layer и первый функционал

**1.1. Domain Layer**
- [ ] Создать Shared Kernel (инварианты, ошибки)
- [ ] Создать Value Objects (ResourceId, Namespace, ResourceName, etc.)
- [ ] Создать Entities (Resource, SecretField, CustomField)
- [ ] Создать Repository Interfaces
- [ ] Создать Domain Events
- [ ] Написать unit тесты для домена

**1.2. Infrastructure Layer (Mock)**
- [ ] Создать Mock Data
- [ ] Реализовать MockResourceRepository
- [ ] Реализовать MockNamespaceRepository
- [ ] Создать Event Bus

**1.3. Composition Root**
- [ ] Создать ServiceContainer (DI Container)
- [ ] Настроить зависимости

---

### Этап 2: Core Systems (Ядро систем)

> **📦 Будет описан в steps/step_2/README.md**

- [ ] Modal System (режимы navigation/editing)
- [ ] Keymap System (горячие клавиши)
- [ ] Focus System (управление фокусом)
- [ ] Notification System (toast уведомления)

---

### Этап 3: Application Layer (CQRS)

> **📦 Будет описан в steps/step_3/README.md**  
> **📘 Детали CQRS**: [DATA_FLOW.md](./DATA_FLOW.md), [COMMAND_BUS.md](./COMMAND_BUS.md), [QUERY_HANDLERS.md](./QUERY_HANDLERS.md)

- [ ] Query Handlers для чтения (List, GetById)
- [ ] Command Handlers для записи (Create, Update, Delete)
- [ ] Query/Command Buses
- [ ] Интеграция с DI Container

---

### Этап 4: Presentation Layer (UI)

> **📦 Будет описан в steps/step_4/README.md**

- [ ] Базовые компоненты и Layout
- [ ] Страница списка ресурсов (`_index.tsx`)
- [ ] Страница деталей ресурса (`resources.$id.tsx`)
- [ ] Страница создания ресурса (`resources.new.tsx`)
- [ ] Генератор паролей (`generator.tsx`)

---

### Этапы 5-7: Integration, API, Polish

> **📦 Будут описаны в steps/step_5-7/README.md**

- **Этап 5**: Интеграция систем, стилизация
- **Этап 6**: Real API Integration, обработка ошибок
- **Этап 7**: E2E тесты, производительность, accessibility

---

## Инструменты разработки

### Required
- Node.js 18+
- pnpm (или npm/yarn)
- TypeScript 5+

### Recommended
- VS Code
- TypeScript ESLint
- Prettier
- Git

### Testing
- Vitest (unit tests)
- React Testing Library
- Playwright (e2e tests)

---

## Начало работы

> **📦 Детальная инструкция**: [steps/step_0/README.md](../steps/step_0/README.md) — полное руководство по настройке окружения с нуля

### Краткий обзор:

1. **Инициализация** — `pnpm create remix@latest` (Remix CLI создаст всё за вас!)
2. **Зависимости** — установить Electron, Tailwind CSS, Catppuccin
3. **Конфигурация** — настроить `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`
4. **Структура папок** — создать DDD структуру (Domain, Application, Infrastructure, etc.)
5. **Electron setup** — создать `electron/main.ts` и `electron/config.ts`
6. **Стили** — настроить Tailwind CSS с Catppuccin Mocha темой
7. **Проверка** — запустить `pnpm dev` и убедиться что всё работает

**Следуйте шагу 0 для детальных инструкций** ⬆️

---

## Принципы разработки

### 1. Test-Driven Development
Пишите тесты перед реализацией.

### 2. Domain First
Начинайте с Domain Layer, затем Application, затем Infrastructure, и наконец Presentation.

### 3. Type Safety
Используйте строгую типизацию TypeScript. Избегайте `any`.

### 4. Pure Functions
Domain и Application логика должна быть в виде чистых функций где возможно.

### 5. Immutability
Value Objects неизменяемы. Используйте `readonly`.

### 6. Event-Driven
Используйте события для коммуникации между системами.

### 7. Separation of Concerns
Каждый модуль решает одну задачу.

---

## Полезные ресурсы

### DDD
- Evans, Eric. "Domain-Driven Design"
- Vernon, Vaughn. "Implementing Domain-Driven Design"

### Architecture
- Martin, Robert C. "Clean Architecture"
- Freeman, Steve. "Growing Object-Oriented Software, Guided by Tests"

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Effective TypeScript](https://effectivetypescript.com/)

### Remix
- [Remix Documentation](https://remix.run/docs)

### Electron
- [Electron Documentation](https://www.electronjs.org/docs)

---

## Контакты и поддержка

При возникновении вопросов:
1. Проверьте документацию в `docs/`
2. Изучите контракты в `docs/contracts/`
3. Посмотрите примеры использования

---

## Следующие шаги

1. ✅ Изучите всю документацию
2. ⏭️ Настройте окружение разработки
3. ⏭️ Создайте базовую структуру проекта
4. ⏭️ Начните с Domain Layer (Value Objects и Entities)
5. ⏭️ Реализуйте Mock repositories
6. ⏭️ Постройте Core Systems
7. ⏭️ Создайте UI компоненты

**Удачи в разработке! 🚀**
