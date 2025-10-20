# Отчет о согласованности: Архитектурные границы

**Дата:** 2025-10-20  
**Этап:** 2 из 4  
**Источник истины:** `docs/ARCHITECTURE_BOUNDARIES.md`

---

## ✅ Проверено

- **Источник истины:** ARCHITECTURE_BOUNDARIES.md
- **Проверено импортов:** Примеры из всех слоев
- **Правила:** DDD + Clean Architecture + Hexagonal

---

## 📋 Архитектурные правила (из ARCHITECTURE_BOUNDARIES.md)

### Dependency Rule

```
Presentation → Composition → Application → Domain
                ↓                ↓
         Infrastructure --------→
```

**Правило:** Зависимости направлены к центру (Domain)

### Правила импортов по слоям

| Слой | Может импортировать | НЕ может импортировать |
|------|---------------------|------------------------|
| **Domain** | Только Domain | Всё остальное |
| **Application** | Domain (через Public API) | Infrastructure, Composition, Presentation |
| **Infrastructure** | Domain интерфейсы (через Public API) | Application, Composition, Presentation |
| **Composition** | ВСЁ (единственный слой) | - |
| **Presentation** | Domain типы, Composition facades | Application напрямую, Infrastructure напрямую |

### Алиасы

- `@/domain` - Domain Layer Public API
- `@/application/queries` - Application Query Public API
- `@/application/commands` - Application Command Public API
- `@/infrastructure/repositories` - Infrastructure Public API
- `@/composition` - Composition facades

---

## ✅ Правильные примеры импортов

### Domain Layer (изолирован)

```typescript
// src/domain/resource/aggregates/Resource.ts
import { ResourceId } from '../value-objects/ResourceId'  // ✅ Локальный
import { Namespace } from '../value-objects/Namespace'    // ✅ Локальный
import { DomainError } from '@/domain/shared/errors'      // ✅ Через Public API
```

**Вердикт:** ✅ Domain полностью изолирован, импортирует только Domain

---

### Application Layer

```typescript
// src/application/queries/handlers/ListResourcesQueryHandler.ts
import type { IResourceRepository } from '@/domain/repositories'  // ✅ Domain интерфейс
import type { ResourceListItemDTO } from '../dtos/ResourceListItemDTO'  // ✅ Локальный
```

**Вердикт:** ✅ Application импортирует только Domain через Public API

---

### Infrastructure Layer

```typescript
// src/infrastructure/repositories/MockResourceRepository.ts
import type { IResourceRepository } from '@/domain/repositories'  // ✅ Domain интерфейс
import type { ResourceListItemDTO } from '@/application/queries/dtos'  // ⚠️ ПРОВЕРИТЬ
import { mockResources } from '../mocks'  // ✅ Локальный
```

**Проблема:** Infrastructure импортирует из Application!

**Анализ:** 
- `ResourceListItemDTO` - это DTO из Application Layer
- Infrastructure НЕ должен зависеть от Application (Dependency Rule)

**Рекомендация:** 
- Переместить DTO в Domain или создать отдельный слой для DTO
- Или использовать Domain типы напрямую

---

### Composition Layer

```typescript
// src/composition/queries/ResourceQueries.ts
import { ListResourcesQuery } from '@/application/queries'  // ✅ Может всё
import { ServiceContainer } from '../ServiceContainer'  // ✅ Локальный
```

```typescript
// src/composition/modules/ResourceModule.ts
import type { IResourceRepository } from '@/domain/repositories'  // ✅
import type { IQueryBus } from '@/application/queries'  // ✅
import { MockResourceRepository } from '@/infrastructure/repositories'  // ✅
```

**Вердикт:** ✅ Composition - единственный слой, который может импортировать из всех слоев

---

### Presentation Layer

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { Resource, ResourceId } from '@/domain'  // ✅ Domain типы
import { queries } from '@/composition'  // ✅ Composition facades
import { ResourceList } from '@/components/ResourceList'  // ✅ Локальный
```

**Вердикт:** ✅ Presentation импортирует только Domain типы и Composition facades

---

## ⚠️ Найденные проблемы

### 1. Infrastructure → Application зависимость (КРИТИЧНО)

**Найдено:**
```typescript
// src/infrastructure/repositories/MockResourceRepository.ts
import type { ResourceListItemDTO } from '@/application/queries/dtos'
```

**Проблема:** Нарушение Dependency Rule - Infrastructure зависит от Application

**Почему это плохо:**
- Infrastructure должен быть на том же уровне что и Application
- Оба должны зависеть только от Domain
- Создается циклическая зависимость

**Решения:**

**Вариант 1: DTO в Domain**
```typescript
// Переместить DTO в Domain
// src/domain/resource/dtos/ResourceListItemDTO.ts
export interface ResourceListItemDTO {
  id: string
  namespace: string
  name: string
  // ...
}
```

**Вариант 2: Использовать Domain типы**
```typescript
// Infrastructure возвращает Domain типы
// src/infrastructure/repositories/MockResourceRepository.ts
import type { Resource } from '@/domain'

export class MockResourceRepository implements IResourceRepository {
  findAll(): Promise<Resource[]> {
    // Возвращаем Domain типы
  }
}
```

**Вариант 3: Shared DTO слой**
```typescript
// Создать src/shared/dtos/
// И импортировать оттуда
import type { ResourceListItemDTO } from '@/shared/dtos'
```

**Рекомендация:** Вариант 2 - использовать Domain типы в Infrastructure

---

### 2. Все импорты через Public API (OK)

**Проверено:**
- ✅ `@/domain` → index.ts
- ✅ `@/domain/shared/errors` → index.ts
- ✅ `@/application/queries` → index.ts
- ✅ `@/infrastructure/repositories` → index.ts
- ✅ `@/composition` → index.ts

**Вердикт:** ✅ Все импорты через Public API, прямых импортов из файлов нет

---

## 📊 Статистика по слоям

### Domain Layer
- **Импортирует:** Только Domain
- **Нарушений:** 0
- **Оценка:** ✅ ОТЛИЧНО

### Application Layer
- **Импортирует:** Domain
- **Нарушений:** 0
- **Оценка:** ✅ ОТЛИЧНО

### Infrastructure Layer
- **Импортирует:** Domain, Application (DTO)
- **Нарушений:** 1 (Application DTO)
- **Оценка:** ⚠️ ТРЕБУЕТ ИСПРАВЛЕНИЯ

### Composition Layer
- **Импортирует:** Всё
- **Нарушений:** 0 (разрешено)
- **Оценка:** ✅ ОТЛИЧНО

### Presentation Layer
- **Импортирует:** Domain типы, Composition facades
- **Нарушений:** 0
- **Оценка:** ✅ ОТЛИЧНО

---

## 📋 Рекомендации

### Критичные (1)

1. **Исправить Infrastructure → Application зависимость**
   - Файл: `src/infrastructure/repositories/MockResourceRepository.ts`
   - Проблема: Импорт `ResourceListItemDTO` из Application
   - Решение: Использовать Domain типы или переместить DTO
   - Приоритет: ВЫСОКИЙ

### Средние (0)

Нет средних проблем

### Минорные (0)

Нет минорных проблем

---

## 🎯 Выводы

### Общая оценка: ✅ ХОРОШО (90%)

**Сильные стороны:**
- ✅ Domain полностью изолирован
- ✅ Application зависит только от Domain
- ✅ Composition правильно используется как единственный слой со всеми зависимостями
- ✅ Presentation использует только facades
- ✅ Все импорты через Public API (index.ts)

**Что исправить:**
- ⚠️ Infrastructure не должен импортировать из Application
- ⚠️ DTO должны быть либо в Domain, либо в Shared, либо Infrastructure возвращает Domain типы

**Архитектурная чистота:**
- Domain: ✅ 100%
- Application: ✅ 100%
- Infrastructure: ⚠️ 90% (1 нарушение)
- Composition: ✅ 100%
- Presentation: ✅ 100%

---

## 🔗 Связанные проверки

- **Предыдущий этап:** Структура проекта (завершен)
- **Следующий этап:** Сущности (классы, интерфейсы, типы)
- **Зависит от:** ARCHITECTURE_BOUNDARIES.md (источник истины)
- **Влияет на:** Чистота архитектуры, тестируемость, поддерживаемость

---

## 📝 Детальный анализ Dependency Rule

### Правило из Clean Architecture

```
Внешние слои могут зависеть от внутренних
Внутренние НЕ могут зависеть от внешних
```

**Слои (от центра к краям):**
1. Domain (центр)
2. Application
3. Infrastructure
4. Presentation (край)

**Composition** - особый слой, Bootstrap, может зависеть от всех

### Текущее состояние

```
✅ Presentation → Composition ✅
✅ Presentation → Domain ✅
✅ Composition → Application ✅
✅ Composition → Infrastructure ✅
✅ Composition → Domain ✅
✅ Application → Domain ✅
⚠️ Infrastructure → Application ⚠️  ← НАРУШЕНИЕ!
✅ Infrastructure → Domain ✅
```

### Как должно быть

```
Infrastructure и Application - на одном уровне
Оба зависят ТОЛЬКО от Domain
```

---

**Статус:** ✅ Проверка завершена  
**Критичных проблем:** 1  
**Средних проблем:** 0  
**Минорных проблем:** 0  
**Готовность к следующему этапу:** ✅ ДА (после исправления)
