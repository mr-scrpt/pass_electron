# Проверка потока данных через слои

**Дата:** 2025-10-20  
**Вопрос:** Правильно ли что Presentation получает DTO?

---

## 🔍 Анализ потока данных

### Текущий поток:

```
1. Repository (Infrastructure)
   ↓ возвращает Resource[] (Domain типы)
   
2. Query Handler (Application)
   ↓ преобразует Domain → DTO
   ↓ возвращает ResourceListItemDTO[] (DTO)
   
3. Facade (Composition)
   ↓ возвращает QueryResult<ResourceListItemDTO[]>
   
4. Route loader (Presentation)
   ↓ вызывает queries.resources.list()
   ↓ получает DTO
   
5. React Component (Presentation)
   ↓ импортирует ResourceListItemDTO из Application ❌
   ↓ использует DTO для рендеринга
```

---

## ⚠️ Найденная проблема

### Presentation импортирует из Application напрямую (НАРУШЕНИЕ)

**Файл:** `steps/step_1/README.md` строка 959

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx
import type { ResourceListItemDTO } from '@/application/queries/dtos'  // ❌ НАРУШЕНИЕ!

interface Props {
  resource: ResourceListItemDTO
}
```

**Проблема:** Presentation НЕ должен импортировать из Application напрямую!

**Правила из ARCHITECTURE_BOUNDARIES.md:**

| Presentation | Domain | Application | Infrastructure | Composition |
|--------------|--------|-------------|----------------|-------------|
| Может импортировать | ✅ типы | ❌ | ❌ | ✅ |

**Presentation может импортировать:**
- ✅ Domain типы (Value Objects, Entities)
- ✅ Composition facades
- ❌ **НЕ может Application** (Query/Command Handlers, DTO)
- ❌ НЕ может Infrastructure

---

## 🤔 Вопрос: Где должны быть DTO?

### Вариант 1: DTO в Application (текущее состояние)

**Проблема:**
- Presentation импортирует из Application
- Нарушение Dependency Rule

**Плюсы:**
- DTO рядом с Query Handlers (логично)

**Минусы:**
- ❌ Presentation зависит от Application
- ❌ Нарушение Clean Architecture

---

### Вариант 2: DTO в Shared

```
src/shared/
└── dtos/
    └── ResourceListItemDTO.ts
```

**Плюсы:**
- ✅ Presentation может импортировать
- ✅ Application может импортировать
- ✅ Не нарушает Dependency Rule

**Минусы:**
- DTO далеко от Query Handlers

---

### Вариант 3: DTO в Composition (экспортируются через Public API)

```typescript
// src/composition/index.ts
export type { ResourceListItemDTO } from '@/application/queries/dtos'
```

```typescript
// Presentation
import type { ResourceListItemDTO } from '@/composition'  // ✅
```

**Плюсы:**
- ✅ DTO остаются в Application
- ✅ Presentation импортирует через Composition
- ✅ Не нарушает Dependency Rule

**Минусы:**
- Composition экспортирует типы (не только facades)

---

### Вариант 4: Presentation использует Domain типы

```typescript
// Presentation
import type { Resource } from '@/domain'  // ✅

interface Props {
  resource: Resource  // Domain Aggregate
}
```

**Проблема:**
- Resource - это класс с методами
- Presentation получает JSON из loader
- Нужно преобразовывать JSON → Resource класс

---

## ✅ Рекомендуемое решение: Вариант 3

**DTO остаются в Application, но экспортируются через Composition**

### Почему это правильно:

1. **DTO - это контракт между Application и Presentation**
   - Query Handler создает DTO
   - Presentation использует DTO
   - Composition - посредник между ними

2. **Не нарушает Dependency Rule**
   - Presentation → Composition ✅
   - Composition → Application ✅
   - Presentation НЕ зависит от Application напрямую ✅

3. **DTO рядом с Query Handlers**
   - Логично - Handler создает DTO
   - Легко поддерживать

### Реализация:

```typescript
// src/composition/index.ts
export { queries } from './queries'
export { commands } from './commands'

// Экспортируем DTO для Presentation
export type { ResourceListItemDTO } from '@/application/queries/dtos'
export type { ResourceDetailDTO } from '@/application/queries/dtos'
```

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx
import type { ResourceListItemDTO } from '@/composition'  // ✅ Через Composition

interface Props {
  resource: ResourceListItemDTO
}
```

---

## 📋 Что нужно исправить

### 1. Добавить экспорт DTO в Composition

**Файл:** `src/composition/index.ts`

```typescript
// Facades
export { queries } from './queries'
export { commands } from './commands'

// DTO для Presentation (реэкспорт из Application)
export type { ResourceListItemDTO } from '@/application/queries/dtos'
export type { ResourceDetailDTO } from '@/application/queries/dtos'
```

### 2. Обновить импорты в Presentation

**Было:**
```typescript
import type { ResourceListItemDTO } from '@/application/queries/dtos'  // ❌
```

**Стало:**
```typescript
import type { ResourceListItemDTO } from '@/composition'  // ✅
```

---

## 🎯 Выводы

### Текущее состояние: ⚠️ НАРУШЕНИЕ (70%)

**Проблемы:**
- ❌ Presentation импортирует из Application напрямую
- ❌ Нарушение Dependency Rule
- ❌ Нарушение Clean Architecture

**Правильные части:**
- ✅ Repository возвращает Domain типы
- ✅ Query Handler преобразует Domain → DTO
- ✅ Facade возвращает DTO

### После исправления: ✅ ПРАВИЛЬНО (100%)

**Поток данных:**
```
Repository → Domain типы
    ↓
Query Handler → DTO (Application)
    ↓
Facade → DTO
    ↓
Composition Public API → реэкспорт DTO
    ↓
Presentation → импортирует DTO через Composition ✅
```

**Зависимости:**
- Presentation → Composition ✅
- Composition → Application ✅
- Application → Domain ✅
- Infrastructure → Domain ✅

---

**Статус:** ⚠️ ТРЕБУЕТ ИСПРАВЛЕНИЯ  
**Критичных проблем:** 1  
**Решение:** Экспортировать DTO через Composition Public API
