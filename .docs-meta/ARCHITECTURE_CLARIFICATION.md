# Уточнение архитектуры: DDD ядро, Event Bus, Composition Layer

**Дата:** 2025-10-20  
**Вопрос:** Как коммуницирует DDD ядро? Что такое Composition Layer?

---

## 🎯 Краткий ответ

Ты **почти правильно** понимаешь, но есть нюансы:

1. ✅ **DDD ядро (Domain + Application)** коммуницирует через **Domain Events**
2. ✅ **Composition Layer НЕ часть классического DDD** - это из Clean Architecture
3. ⚠️ **Presentation ЯВЛЯЕТСЯ частью DDD** (внешний слой), но получает данные через Composition
4. ✅ **Event Bus** - для асинхронной коммуникации между системами

---

## 📊 Детальное объяснение

### 1. DDD ядро и коммуникация

**DDD ядро состоит из:**
- Domain Layer (центр)
- Application Layer (оркестрация)

**Коммуникация ВНУТРИ ядра:**

```
Domain Layer (Aggregate)
    ↓ публикует Domain Event
Event Bus (Infrastructure реализация)
    ↓ доставляет событие
Application Layer (Event Handler)
    ↓ обрабатывает событие
```

**Пример:**
```typescript
// Domain - Aggregate публикует событие
class Resource {
  addCustomField(field: CustomField) {
    // ... бизнес-логика
    this.domainEvents.push(new CustomFieldAdded(this.id, field.id))
  }
}

// Application - обработчик события
class CustomFieldAddedHandler {
  handle(event: CustomFieldAdded) {
    // Логика после добавления поля
    // Например, отправить уведомление
  }
}
```

---

### 2. Composition Layer - НЕ часть DDD

**Откуда Composition Layer:**
- ❌ НЕ из классического DDD (Eric Evans)
- ✅ Из **Dependency Injection Principles** (Mark Seemann) - Composition Root
- ✅ Из **Clean Architecture** (Uncle Bob) - место сборки
- ✅ Из **Hexagonal Architecture** - Bootstrap layer

**Почему нужен отдельный слой:**

В классическом DDD:
```
Presentation → Application → Domain
                ↑
         Infrastructure
```

**Проблема:** Где делать DI?
- Если в Infrastructure → Infrastructure зависит от Application ❌
- Если в Presentation → Presentation зависит от Application ❌
- Нарушение Dependency Rule!

**Решение Clean Architecture:**
```
Presentation → Composition → Application → Domain
                    ↓              ↑
              Infrastructure ------┘
```

Composition - **единственное место** где все слои пересекаются.

---

### 3. Presentation - это часть DDD (внешний слой)

**Классический DDD (Eric Evans):**
```
User Interface Layer (Presentation)
    ↓
Application Layer
    ↓
Domain Layer
    ↓
Infrastructure Layer
```

**Presentation в DDD:**
- ✅ Часть DDD архитектуры (внешний слой)
- ✅ Отвечает за UI/UX
- ✅ Получает данные от Application Layer

**НО в Clean Architecture:**
- Presentation НЕ должен зависеть от Application напрямую
- Presentation получает данные через Composition (посредник)

---

### 4. Как работает Event Bus

**Event Bus - для асинхронной коммуникации между системами:**

```typescript
// System A (Modal) публикует событие
eventBus.publish(new ModalOpened('create-resource'))

// System B (Keymap) подписывается и реагирует
eventBus.subscribe('ModalOpened', (event) => {
  // Переключить кеймап на modal режим
  keymapRegistry.activateContext('modal')
})
```

**Где используется Event Bus:**

1. **Domain Events** (внутри ядра)
   - Aggregate публикует событие
   - Application обрабатывает

2. **Межсистемная коммуникация** (Application Layer)
   - Modal System → Keymap System
   - Focus System → Notification System
   - Слабая связанность

---

## 🏗️ Полная картина архитектуры

### Слои и их роли:

```
┌─────────────────────────────────────────┐
│     Presentation Layer (DDD внешний)    │  ← Часть DDD!
│  - React Router routes                  │
│  - React components                     │
│  - Получает данные через Composition    │
└──────────────┬──────────────────────────┘
               │
               ↓ queries.resources.list()
┌──────────────────────────────────────────┐
│     Composition Layer (НЕ DDD!)         │  ← Clean Architecture!
│  - DI Container                          │
│  - Facades (queries, commands)           │
│  - Единственное место пересечения слоев │
└─────┬────────────────────────────────┬───┘
      │                                │
      ↓                                ↓
┌─────────────────┐          ┌──────────────────┐
│  Application    │          │ Infrastructure   │
│  (DDD ядро)     │          │ (DDD адаптеры)   │
│  - Handlers     │          │ - Repositories   │
│  - Services     │          │ - Event Bus      │
└────────┬────────┘          └────────┬─────────┘
         │                            │
         └────────────┬───────────────┘
                      ↓
              ┌───────────────┐
              │    Domain     │  ← DDD центр
              │  - Aggregates │
              │  - Events     │
              └───────────────┘
```

---

## 🔄 Поток данных (Query)

### 1. Presentation вызывает Facade

```typescript
// src/presentation/web/react/src/routes/_index.tsx
export async function loader() {
  return queries.resources.list()  // ← Через Composition!
}
```

### 2. Composition вызывает Query Handler

```typescript
// src/composition/queries/ResourceQueries.ts
export const queries = {
  resources: {
    async list() {
      const handler = container.getQueryHandler('ListResources')
      return await handler.execute()
    }
  }
}
```

### 3. Query Handler вызывает Repository

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
class ListResourcesQueryHandler {
  async execute() {
    const resources = await this.repository.findAll()  // Domain типы
    return resources.map(toDTO)  // Преобразование в DTO
  }
}
```

### 4. Repository возвращает Domain типы

```typescript
// src/infrastructure/repositories/MockResourceRepository.ts
class MockResourceRepository {
  async findAll(): Promise<Resource[]> {  // Domain Aggregate
    return mockResources
  }
}
```

---

## 🔄 Поток событий (Domain Events)

### 1. Aggregate публикует событие

```typescript
// src/domain/resource/aggregates/Resource.ts
class Resource {
  addCustomField(field: CustomField) {
    // Бизнес-логика
    this.domainEvents.push(new CustomFieldAdded(this.id, field.id))
  }
}
```

### 2. Command Handler публикует в Event Bus

```typescript
// src/application/commands/handlers/AddCustomFieldHandler.ts
class AddCustomFieldHandler {
  async execute(command: AddCustomFieldCommand) {
    const resource = await this.repository.findById(command.resourceId)
    resource.addCustomField(field)
    
    await this.repository.save(resource)
    
    // Публикуем Domain Events
    resource.domainEvents.forEach(event => {
      this.eventBus.publish(event)
    })
  }
}
```

### 3. Event Handler обрабатывает

```typescript
// src/application/event-handlers/CustomFieldAddedHandler.ts
class CustomFieldAddedHandler {
  handle(event: CustomFieldAdded) {
    // Побочные эффекты
    this.notificationService.show('Поле добавлено')
  }
}
```

---

## 📋 Ответы на твои вопросы

### Q1: "DDD ядро коммуницирует внутри себя по шине событий?"

✅ **Да, частично правильно:**
- Domain Aggregates публикуют Domain Events
- Application обрабатывает эти события
- Event Bus - это Infrastructure реализация

### Q2: "Composition не часть DDD?"

✅ **Правильно:**
- Composition Layer - из Clean Architecture
- В классическом DDD нет явного слоя для DI
- Composition Root решает проблему Dependency Rule

### Q3: "Composition дает внешнему миру получать данные?"

⚠️ **Почти правильно:**
- Composition дает **Presentation** получать данные
- Но Presentation - это НЕ "внешний мир"
- Presentation - это часть DDD (User Interface Layer)

### Q4: "Presentation это уровень DDD?"

✅ **Да, правильно:**
- Presentation = User Interface Layer в DDD
- Это внешний слой DDD архитектуры
- Но в Clean Architecture он получает данные через Composition (посредник)

---

## 🎯 Главные выводы

1. **DDD ядро:**
   - Domain + Application
   - Коммуникация через Domain Events

2. **Composition Layer:**
   - НЕ часть классического DDD
   - Из Clean Architecture
   - Решает проблему DI и Dependency Rule

3. **Presentation Layer:**
   - ЯВЛЯЕТСЯ частью DDD (внешний слой)
   - Получает данные через Composition (Clean Architecture требование)
   - НЕ "внешний мир", а часть приложения

4. **Event Bus:**
   - Infrastructure реализация
   - Для Domain Events (внутри ядра)
   - Для межсистемной коммуникации (Application Layer)

5. **Почему Composition отдельно:**
   - Clean Architecture: Infrastructure НЕ должен зависеть от Application
   - Composition - единственное место где слои пересекаются
   - Упрощает Presentation (одна строка вместо 10 строк DI)

---

**Итог:** Твое понимание **95% правильное**, только Presentation - это не "внешний мир", а часть DDD архитектуры (User Interface Layer).
