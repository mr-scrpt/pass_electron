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

- **`app/domain/`** - Domain Layer (бизнес-логика, entities, value objects)
- **`app/application/`** - Application Layer (use cases, orchestration)
- **`app/core/`** - Core Systems (modal, keymap, focus, notification)
- **`app/infrastructure/`** - Infrastructure Layer (API, repositories, storage)
- **`app/routes/`** - Presentation Layer (Remix routes)
- **`app/components/`** - Presentation Layer (React компоненты)
- **`app/hooks/`** - React Hooks для доступа к системам
- **`docs/`** - Документация проекта
- **`tests/`** - Unit, integration и e2e тесты

**Ключевые принципы**:
- Зависимости направлены к Domain Layer (Clean Architecture)
- Модули изолированы и общаются через Event Bus
- Каждый модуль имеет четкий Public API через `index.ts`
- Domain Layer полностью независим от фреймворков

---

## Этапы разработки

### Этап 1: Foundation (Основа)

**1.1. Setup Project**
```bash
# Создать Remix + Electron проект
# Настроить TypeScript
# Настроить окружение
```

**1.2. Domain Layer**
- [ ] Создать Value Objects (Namespace, ResourceName, etc.)
- [ ] Создать Entities (Resource, SecretField, CustomField)
- [ ] Создать Repository Interfaces
- [ ] Создать Domain Events
- [ ] Написать unit тесты для домена

**1.3. Infrastructure Layer (Mock)**
- [ ] Создать Mock Data
- [ ] Реализовать MockResourceRepository
- [ ] Реализовать MockNamespaceRepository
- [ ] Создать Event Bus

**1.4. Composition Root**
- [ ] Создать ServiceContainer (DI Container)
- [ ] Настроить зависимости

---

### Этап 2: Core Systems (Ядро систем)

**2.1. Modal System**
- [ ] Реализовать ModalManager
- [ ] Создать ModeContext
- [ ] Реализовать React Context (ModalProvider)
- [ ] Создать useModal hook
- [ ] Написать тесты

**2.2. Keymap System**
- [ ] Реализовать KeymapRegistry
- [ ] Реализовать KeymapExecutor
- [ ] Создать базовые кеймапы (navigation, editing)
- [ ] Реализовать React Context (KeymapProvider)
- [ ] Создать useKeymap hook
- [ ] Написать тесты

**2.3. Focus System**
- [ ] Реализовать FocusManager
- [ ] Реализовать React Context (FocusProvider)
- [ ] Создать useFocusable hook
- [ ] Написать тесты

**2.4. Notification System**
- [ ] Реализовать NotificationManager
- [ ] Реализовать React Context (NotificationProvider)
- [ ] Создать useNotification hook
- [ ] Написать тесты

---

### Этап 3: Application Layer

> **📘 Детали работы с Application Services и DI см. в [DATA_FLOW.md](./DATA_FLOW.md)**

**3.1. Application Services**
- [ ] ResourceService
- [ ] Настроить DI Container

**3.2. Use Cases**
- [ ] CreateResourceUseCase
- [ ] UpdateResourceUseCase
- [ ] DeleteResourceUseCase
- [ ] ListResourcesUseCase
- [ ] GetResourceUseCase
- [ ] AddCustomFieldUseCase
- [ ] UpdateFieldUseCase
- [ ] Написать integration тесты

---

### Этап 4: Presentation Layer

**4.1. Базовые компоненты**
- [ ] Layout компоненты
- [ ] KeymapStatusBar
- [ ] NotificationToast

**4.2. Resource List**
- [ ] ResourceList компонент
- [ ] ResourceListItem компонент
- [ ] ResourceSearch компонент
- [ ] Route: `_index.tsx`

**4.3. Resource Detail**
- [ ] ResourceDetail компонент
- [ ] FieldEditor компонент
- [ ] DynamicFieldList компонент
- [ ] Route: `resources.$id.tsx`

**4.4. Resource Creation**
- [ ] NamespaceCloud компонент
- [ ] CreateResourceForm компонент
- [ ] Route: `resources.new.tsx`

**4.5. Password Generator**
- [ ] GeneratorForm компонент
- [ ] PasswordStrength компонент
- [ ] Route: `generator.tsx`

---

### Этап 5: Integration

**5.1. Интеграция систем**
- [ ] Подключить все провайдеры в root.tsx
- [ ] Настроить роутинг
- [ ] Интегрировать кеймапы со страницами
- [ ] Протестировать взаимодействие систем

**5.2. Styling**
- [ ] Настроить Tailwind CSS
- [ ] Создать дизайн-систему
- [ ] Стилизовать компоненты
- [ ] Адаптировать под режимы (navigation/editing)

---

### Этап 6: Real API Integration

**6.1. API Client**
- [ ] Реализовать HttpClient
- [ ] Создать API mappers (DTO ↔ Domain)
- [ ] Реализовать ApiResourceRepository
- [ ] Реализовать ApiNamespaceRepository
- [ ] Настроить переключение Mock ↔ Real API

**6.2. Error Handling**
- [ ] Обработка API ошибок
- [ ] Retry механизм
- [ ] Offline режим
- [ ] Валидация на клиенте

---

### Этап 7: Polish & Testing

**7.1. E2E тесты**
- [ ] Создание ресурса
- [ ] Редактирование ресурса
- [ ] Удаление ресурса
- [ ] Навигация с клавиатуры
- [ ] Генерация пароля

**7.2. Performance**
- [ ] Оптимизация рендеринга
- [ ] Lazy loading
- [ ] Мемоизация

**7.3. Accessibility**
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators

**7.4. Documentation**
- [ ] API документация
- [ ] User guide
- [ ] Developer guide

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

### 1. Инициализация проекта

```bash
# Создать Remix проект
npx create-remix@latest

# Выбрать:
# - TypeScript
# - Remix App Server

# Установить зависимости
cd project
pnpm install

# Установить Electron
pnpm add -D electron electron-builder
```

### 2. Настройка TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "~/*": ["./app/*"]
    }
  }
}
```

### 3. Создание базовой структуры

```bash
# Создать основные директории
mkdir -p app/{composition,domain,application,infrastructure,core,components,hooks,types}
mkdir -p app/domain/{resource,repositories,events}
mkdir -p app/core/{modal,keymap,focus,notification}
mkdir -p app/infrastructure/{api,repositories,mocks,event-bus}
```

### 4. Первые файлы

Начните с создания базовых типов в `app/types/domain.ts` используя контракты из `docs/contracts/domain-types.md`.

### 5. Запуск

```bash
# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test
```

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
