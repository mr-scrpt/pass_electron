# С чем работает Presentation Layer: Классический DDD vs Наш проект

**Дата:** 2025-10-20  
**Вопрос:** Presentation может работать только с Composition? Но в DDD нет Composition!

---

## 🎯 Краткий ответ

**В классическом DDD:**
- Presentation → Application Layer (напрямую)

**В нашем проекте (DDD + Clean Architecture):**
- Presentation → Composition Layer → Application Layer

**Почему разница:** Clean Architecture добавляет Dependency Rule, который классический DDD не детализирует.

---

## 📚 Классический DDD (Eric Evans, 2003)

### Layered Architecture в DDD

```
┌─────────────────────────────────────┐
│   User Interface Layer              │  ← Presentation
│   (Presentation)                    │
└──────────────┬──────────────────────┘
               ↓ вызывает напрямую
┌──────────────▼──────────────────────┐
│   Application Layer                 │
│   - Application Services            │
│   - Use Cases                       │
└──────────────┬──────────────────────┘
               ↓ использует
┌──────────────▼──────────────────────┐
│   Domain Layer                      │
│   - Entities, Value Objects         │
│   - Aggregates, Domain Services     │
└──────────────┬──────────────────────┘
               ↓ определяет интерфейсы
┌──────────────▼──────────────────────┐
│   Infrastructure Layer              │
│   - Repositories, External Services │
└─────────────────────────────────────┘
```

### Пример из классического DDD:

```typescript
// Presentation Layer (Controller)
class ResourceController {
  constructor(
    private resourceService: ResourceApplicationService  // ← Напрямую!
  ) {}
  
  async listResources(req, res) {
    const resources = await this.resourceService.listResources()
    res.json(resources)
  }
}

// Application Layer (Application Service)
class ResourceApplicationService {
  constructor(private repository: IResourceRepository) {}
  
  async listResources() {
    return await this.repository.findAll()
  }
}
```

**Presentation напрямую зависит от Application!**

---

## 🏗️ Clean Architecture (Uncle Bob, 2012)

### Dependency Rule

**Главное правило Clean Architecture:**
> Зависимости направлены только внутрь, к центру (Domain)

```
Внешние слои → Внутренние слои
Presentation → Use Cases → Entities
```

**Проблема с классическим DDD:**
```
Presentation → Application
```

Это нарушает принцип "Framework as Detail":
- Presentation (UI Framework) не должен знать о деталях Application
- Application не должен зависеть от того, откуда его вызывают

### Решение Clean Architecture: Composition Root

**Composition Root (Mark Seemann, "Dependency Injection Principles"):**
- Единственное место где создаются и связываются зависимости
- Находится на верхнем уровне приложения
- Знает обо всех слоях (исключение из Dependency Rule)

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
└──────────────┬──────────────────────┘
               ↓ использует Facade
┌──────────────▼──────────────────────┐
│   Composition Root                  │  ← Новый слой!
│   - DI Container                    │
│   - Facades (queries, commands)     │
│   - Знает обо всех слоях            │
└─────┬────────────────────────────┬──┘
      ↓                            ↓
┌─────▼──────────┐      ┌──────────▼────┐
│  Application   │      │ Infrastructure │
└────────┬───────┘      └────────┬───────┘
         └──────────┬────────────┘
                    ↓
            ┌───────▼────────┐
            │    Domain      │
            └────────────────┘
```

---

## 🔄 Как это работает в нашем проекте

### 1. Классический DDD подход (если бы не было Composition)

```typescript
// ❌ ПЛОХО: Presentation знает о деталях Application
export async function loader() {
  const repository = new MockResourceRepository()  // Создание зависимости
  const handler = new ListResourcesQueryHandler(repository)
  const result = await handler.execute()
  return json(result)
}
```

**Проблемы:**
- Presentation создает зависимости (нарушение SRP)
- Tight coupling с конкретными реализациями
- Невозможно легко переключить Mock ↔ Real
- Дублирование кода DI в каждом route

---

### 2. Наш подход (DDD + Clean Architecture)

```typescript
// ✅ ХОРОШО: Presentation использует Facade
export async function loader() {
  return queries.resources.list()  // Одна строка!
}
```

**Что происходит внутри:**

#### Шаг 1: Presentation вызывает Facade

```typescript
// src/presentation/web/react/src/routes/_index.tsx
export async function loader() {
  return queries.resources.list()  // ← Facade из Composition
}
```

#### Шаг 2: Composition создает Handler и вызывает

```typescript
// src/composition/queries/ResourceQueries.ts
export const queries = {
  resources: {
    async list() {
      // Composition знает как создать Handler
      const repository = ServiceContainer.getRepository()
      const handler = new ListResourcesQueryHandler(repository)
      return await handler.execute()
    }
  }
}
```

#### Шаг 3: Application Handler выполняет логику

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
class ListResourcesQueryHandler {
  constructor(private repository: IResourceRepository) {}
  
  async execute() {
    const resources = await this.repository.findAll()
    return resources.map(toDTO)
  }
}
```

---

## 📊 Сравнение: Классический DDD vs Наш проект

### Классический DDD

**Presentation → Application:**
```typescript
// Presentation
class ResourceController {
  constructor(
    private service: ResourceApplicationService  // ← Прямая зависимость
  ) {}
  
  async list() {
    return await this.service.listResources()
  }
}
```

**Плюсы:**
- ✅ Проще (меньше слоев)
- ✅ Прямолинейно

**Минусы:**
- ❌ Presentation зависит от Application (tight coupling)
- ❌ Нужно создавать зависимости в Presentation
- ❌ Дублирование DI кода

---

### Наш проект (DDD + Clean Architecture)

**Presentation → Composition → Application:**
```typescript
// Presentation
export async function loader() {
  return queries.resources.list()  // ← Facade
}

// Composition
const queries = {
  resources: {
    list: () => handler.execute()  // ← Создает Handler
  }
}
```

**Плюсы:**
- ✅ Presentation не знает о деталях Application
- ✅ Легко переключить Mock ↔ Real (в одном месте)
- ✅ Нет дублирования DI кода
- ✅ Соблюдается Dependency Rule

**Минусы:**
- ⚠️ Дополнительный слой (Composition)
- ⚠️ Чуть сложнее понять

---

## 🎯 Ответ на твой вопрос

### Q: "Presentation может работать только с Composition?"

**В нашем проекте - ДА:**
- Presentation импортирует только из `@/composition` (facades)
- Presentation импортирует типы из `@/domain` (Value Objects, Entities)
- Presentation НЕ импортирует из `@/application` напрямую

### Q: "В DDD нет Composition, с чем там работает Presentation?"

**В классическом DDD:**
- Presentation работает с Application Layer напрямую
- Presentation создает Application Services
- Нет явного слоя для DI

**Пример из книги Eric Evans:**
```java
// Presentation (Web Controller)
public class ResourceController {
    private ResourceApplicationService service;
    
    public ResourceController() {
        // Создание зависимостей в Presentation
        this.service = new ResourceApplicationService(
            new ResourceRepository()
        );
    }
    
    public List<Resource> list() {
        return service.listResources();
    }
}
```

---

## 🔍 Почему мы добавили Composition Layer

### Проблемы классического DDD:

1. **Где делать DI?**
   - В Presentation? → Presentation зависит от деталей
   - В Infrastructure? → Infrastructure зависит от Application (нарушение!)

2. **Дублирование кода:**
   - Каждый Controller создает зависимости
   - Код DI размазан по всему Presentation

3. **Сложно переключить Mock ↔ Real:**
   - Нужно менять код в каждом Controller

### Решение: Composition Root

**Composition Root (из DI Principles):**
- Единственное место создания зависимостей
- Изолирует DI логику от бизнес-логики
- Упрощает Presentation (одна строка вместо 10)

**В нашем проекте:**
```typescript
// ServiceContainer - DI Container
class ServiceContainer {
  static getRepository(): IResourceRepository {
    return new MockResourceRepository()  // ← Одно место переключения
  }
}

// Facade - упрощает Presentation
const queries = {
  resources: {
    list: () => {
      const repo = ServiceContainer.getRepository()
      const handler = new ListResourcesQueryHandler(repo)
      return handler.execute()
    }
  }
}
```

---

## 📋 Итоговая таблица

| Аспект | Классический DDD | Наш проект (DDD + Clean) |
|--------|------------------|--------------------------|
| **Presentation работает с** | Application напрямую | Composition (Facade) |
| **DI где?** | В Presentation или Infrastructure | В Composition Root |
| **Зависимости Presentation** | Application Services | Facades + Domain типы |
| **Переключение Mock ↔ Real** | В каждом Controller | В одном месте (ServiceContainer) |
| **Дублирование DI** | Да (в каждом Controller) | Нет (в Composition) |
| **Соответствие Clean Arch** | Частично | Полностью |

---

## 🎯 Выводы

1. **В классическом DDD:**
   - Presentation → Application (напрямую)
   - Нет явного слоя для DI
   - Проще, но менее гибко

2. **В нашем проекте:**
   - Presentation → Composition → Application
   - Composition Root для DI
   - Сложнее, но более гибко и соответствует Clean Architecture

3. **Почему добавили Composition:**
   - Clean Architecture требует Dependency Rule
   - Нужно место для DI (не в Presentation, не в Infrastructure)
   - Упрощает Presentation (одна строка вместо 10)

4. **Presentation может работать только с Composition?**
   - ✅ Да, для получения данных (через Facades)
   - ✅ Да, для типов (через реэкспорт DTO)
   - ✅ Может импортировать Domain типы напрямую (Value Objects)

---

**Итог:** Composition Layer - это адаптация DDD под требования Clean Architecture. В классическом DDD его нет, но Clean Architecture требует явного места для DI и соблюдения Dependency Rule.
