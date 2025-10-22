# Shared Layer Refactoring Plan

**Дата:** 2025-01-22  
**Статус:** Планирование  
**Цель:** Упростить структуру, перенести Specification Pattern в `domain/shared/`

---

## 🎯 Проблема

Текущая структура создает путаницу:
- `src/shared/specification/` - Domain паттерн лежит вне Domain Layer
- `ValidationError` - Domain ошибка лежит в `src/shared/`
- Непонятно: "Где искать ISpecification? В shared или domain/shared?"

---

## 📊 Текущая структура (ДО рефакторинга)

```
src/
├── shared/                          # Технический слой
│   ├── validation/
│   │   ├── Validation.ts
│   │   ├── helpers.ts               # isTrue
│   │   ├── ValidationCombinators.ts
│   │   └── index.ts
│   └── specification/               # ← ПЕРЕНОСИМ
│       ├── ISpecification.ts
│       ├── ValidationError.ts
│       ├── common/
│       │   ├── CommonLengthSpec.ts
│       │   ├── CommonPatternSpec.ts
│       │   └── CommonNotEmptySpec.ts
│       └── index.ts
│
└── domain/
    └── shared/                      # Shared Kernel
        ├── errors/
        │   └── InvariantViolationError.ts
        ├── invariants/
        │   └── UuidInvariant.ts
        └── index.ts
```

---

## 📊 Целевая структура (ПОСЛЕ рефакторинга)

```
src/
├── shared/                          # ТОЛЬКО фасады над библиотеками
│   └── validation/
│       ├── Validation.ts            # Фасад над @sweet-monads/either
│       ├── ValidationCombinators.ts # Фасад над mergeInMany
│       └── index.ts
│
└── domain/
    └── shared/                      # Shared Kernel (все Domain)
        ├── errors/
        │   ├── InvariantViolationError.ts
        │   └── ValidationError.ts   # ← ПЕРЕНЕСЛИ
        │
        ├── invariants/
        │   └── UuidInvariant.ts
        │
        ├── specification/           # ← ПЕРЕНЕСЛИ
        │   ├── ISpecification.ts
        │   ├── helpers.ts           # isTrue fluent API
        │   ├── common/
        │   │   ├── CommonLengthSpec.ts
        │   │   ├── CommonPatternSpec.ts
        │   │   └── CommonNotEmptySpec.ts
        │   └── index.ts
        │
        └── index.ts
```

---

## 🔄 Шаги рефакторинга

### Этап 1: Создать новую структуру

```bash
mkdir -p src/domain/shared/specification/common
```

### Этап 2: Создать файлы в новом месте

1. `src/domain/shared/specification/ISpecification.ts`
2. `src/domain/shared/specification/ValidationError.ts`
3. `src/domain/shared/specification/helpers.ts`
4. `src/domain/shared/specification/common/CommonLengthSpec.ts`
5. `src/domain/shared/specification/common/CommonPatternSpec.ts`
6. `src/domain/shared/specification/common/CommonNotEmptySpec.ts`
7. `src/domain/shared/specification/index.ts`

### Этап 3: Обновить импорты

**Было:**
```typescript
import { ISpecification, ValidationError } from '@/shared/specification'
import { CommonLengthSpec } from '@/shared/specification'
```

**Станет:**
```typescript
import { ISpecification, ValidationError } from '@/domain/shared/specification'
import { CommonLengthSpec } from '@/domain/shared/specification'
```

**Файлы для обновления:**
- `src/domain/resource/specifications/NamespaceSpecs.ts`
- `src/domain/resource/specifications/NotReservedNamespaceSpec.ts`
- `src/domain/resource/specifications/ResourceNameSpecs.ts`
- `src/domain/resource/value-objects/Namespace.ts`
- `src/domain/resource/value-objects/ResourceName.ts`
- `src/domain/resource/aggregates/Resource.ts`

### Этап 4: Обновить Public API

**Файл: `src/domain/shared/index.ts`**

```typescript
// src/domain/shared/index.ts
export { InvariantViolationError } from './errors/InvariantViolationError'
export { UuidInvariant } from './invariants/UuidInvariant'

// Specification Pattern
export type { ISpecification } from './specification/ISpecification'
export { ValidationError } from './specification/ValidationError'
export { isTrue } from './specification/helpers'

// Common спецификации
export { 
  CommonLengthSpec,
  CommonPatternSpec,
  CommonNotEmptySpec
} from './specification'
```

### Этап 5: Удалить старые файлы

```bash
rm -rf src/shared/specification/
```

### Этап 6: Обновить документацию

Файлы для обновления:
- `steps/step_1/SPECIFICATION_SETUP.md`
- `steps/step_1/DOMAIN_LAYER_SETUP.md`
- `steps/step_1/README.md` (структура папок)
- `docs/PROJECT_STRUCTURE.md`

---

## ✅ Преимущества после рефакторинга

1. ✅ **Проще понять:** Все Domain-related в Domain Layer
2. ✅ **Меньше путаницы:** `src/shared/` только для фасадов
3. ✅ **Правильная DDD структура:** Specification Pattern в Shared Kernel
4. ✅ **Единый Public API:** `@/domain/shared` вместо двух мест

---

## 📝 Изменения в импортах

| Файл | Старый импорт | Новый импорт |
|------|---------------|--------------|
| NamespaceSpecs.ts | `@/shared/specification` | `@/domain/shared/specification` |
| NotReservedNamespaceSpec.ts | `@/shared/specification` | `@/domain/shared/specification` |
| ResourceNameSpecs.ts | `@/shared/specification` | `@/domain/shared/specification` |
| Namespace.ts | `@/shared/specification` | `@/domain/shared/specification` |
| ResourceName.ts | `@/shared/specification` | `@/domain/shared/specification` |
| Resource.ts | `@/shared/specification` | `@/domain/shared/specification` |

---

## 🎯 Статус

- ⏳ **Планирование** - этот документ
- ⏳ **Обновление документации** - следующий шаг
- ⏳ **Реализация** - когда начнем кодить

---

## 📚 Связанные документы

- `.docs-meta/VALIDATION_SPECIFICATION_APPROACH.md` - общий подход
- `docs/PROJECT_STRUCTURE.md` - структура проекта
- `steps/step_1/SPECIFICATION_SETUP.md` - setup спецификаций
