# Composition Layer Setup

> **Назад:** [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)  
> **Далее:** [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)

---

## 🎯 Цель

Создать Composition Root для Dependency Injection.

> **📚 Детали**: [COMPOSITION_LAYER.md](../../docs/COMPOSITION_LAYER.md) - Composition Root

---

## Создать Composition Root

Создаем Dependency Injection для Application Layer.

**Файл: `src/composition/index.ts`**

#### Composition Root [#code|#structure:path]

```typescript
// src/composition/index.ts
import { MockResourceRepository } from '@/infrastructure/repositories'
import { 
  ListResourcesQuery,
  ListResourcesQueryHandler 
} from '@/application/queries'

/**
 * Composition Root - место сборки зависимостей
 * 
 * 🔑 Единственное место где:
 * - Создаются экземпляры классов
 * - Внедряются зависимости
 * - Экспортируются facades для Presentation
 */

// ==================== Infrastructure ====================
const resourceRepository = new MockResourceRepository()

// ==================== Application (Query Handlers) ====================
const listResourcesHandler = new ListResourcesQueryHandler(resourceRepository)

// ==================== Facades для Presentation ====================

/**
 * Query Facade - упрощенный API для Presentation Layer
 * 
 * Преимущества:
 * - Presentation не знает про Query объекты
 * - Presentation не знает про QueryHandler
 * - Presentation получает только DTO
 * - Одна строка вместо 3-5 строк DI кода
 */
export const queries = {
  resources: {
    /**
     * Получить список всех ресурсов
     * @returns Validation<Error[], ResourceListItemDTO[]>
     */
    list: () => listResourcesHandler.handle(new ListResourcesQuery())
  }
}

// В следующих шагах добавим:
// export const commands = { ... }
```

**Ключевые моменты:**
- ✅ **Репозиторий** создается здесь (Infrastructure)
- ✅ **QueryHandler** получает репозиторий через constructor
- ✅ **Facade** `queries.*` упрощает использование в Presentation
- ✅ **Presentation** видит только `queries.resources.list()`

---

## ✅ Результат

```
src/composition/
└── index.ts       # Composition Root + Query Facade
```

**Что экспортируем:**
- `queries.resources.list()` - facade для Presentation Layer

**Что дальше?**

Presentation Layer с React компонентами! → [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)

---

> **Назад:** [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)  
> **Далее:** [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)
