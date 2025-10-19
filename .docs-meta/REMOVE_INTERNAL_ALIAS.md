# Удаление @internal/* алиасов

**Дата**: 2025-01-18  
**Причина**: Overengineering, нарушает принцип Public API

## 🎯 Проблема

`@internal/application` и `@internal/infrastructure` были введены чтобы:
- Явно показать что Composition Layer имеет особые права
- Визуально отличить "внутренний" доступ от обычного

**Но это плохое решение:**
1. ❌ Усложняет конфигурацию (специальные алиасы в tsconfig + vite)
2. ❌ Путает разработчиков
3. ❌ Нарушает принцип Public API (лезет в детали реализации)
4. ❌ На самом деле не нужно - Composition может импортировать через обычные `@/`

## ✅ Правильное решение

**Использовать Public API в каждом слое:**

```typescript
// src/application/queries/index.ts
export { ListResourcesQueryHandler } from './handlers/ListResourcesQueryHandler'
export { GetResourceByIdQueryHandler } from './handlers/GetResourceByIdQueryHandler'

// src/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
export { ApiResourceRepository } from './ApiResourceRepository'
```

**Composition импортирует через обычные алиасы:**

```typescript
// src/composition/modules/ResourceModule.ts
import { ListResourcesQueryHandler } from '@/application/queries'  // ✅ Через Public API
import { MockResourceRepository } from '@/infrastructure/repositories'  // ✅ Через Public API
```

## 📊 Найдено упоминаний

| Файл | Кол-во | Тип |
|------|--------|-----|
| `docs/ARCHITECTURE_BOUNDARIES.md` | 28 | Документация |
| `.docs-meta/ALIAS_CHANGE_TILDE_TO_AT.md` | 18 | Мета (не трогать) |
| `.docs-meta/PROJECT_STRUCTURE_DETAILED_UPDATE.md` | 11 | Мета (не трогать) |
| `steps/step_0/ESLINT_SETUP.md` | 8 | Инструкция |
| `.docs-meta/STEP_0_ESLINT_UPDATE.md` | 5 | Мета (не трогать) |
| `docs/PROJECT_STRUCTURE.md` | 4 | Документация |
| `steps/step_0/README.md` | 4 | Инструкция |
| `steps/step_0/TYPESCRIPT_VITE_CONFIG.md` | 3 | Инструкция |
| `steps/step_0/TAILWIND_SETUP.md` | 2 | Инструкция |

**Всего:** 83 упоминания в 9 файлах

## 🔧 План исправления

### 1. Документация (32 упоминания)

**docs/ARCHITECTURE_BOUNDARIES.md (28):**
- Убрать `@internal/*` из таблицы алиасов
- Заменить примеры на `@/application`, `@/infrastructure`
- Убрать ESLint правила для `@internal/*`
- Обновить диаграммы

**docs/PROJECT_STRUCTURE.md (4):**
- Убрать `@internal/*` из таблицы импортов
- Обновить примеры Composition Layer

### 2. Инструкции (17 упоминаний)

**steps/step_0/ESLINT_SETUP.md (8):**
- Убрать правила для `@internal/*`
- Обновить примеры

**steps/step_0/README.md (4):**
- Убрать `@internal/*` из tsconfig paths
- Обновить примеры

**steps/step_0/TYPESCRIPT_VITE_CONFIG.md (3):**
- Убрать `@internal/*` из vite.config
- Обновить примеры импортов

**steps/step_0/TAILWIND_SETUP.md (2):**
- Проверить и убрать если есть

### 3. Конфигурация

**tsconfig.json:**
```json
{
  "paths": {
    "@/*": ["./src/*"]
    // ❌ Убрать:
    // "@internal/application/*": ["./src/application/*"],
    // "@internal/infrastructure/*": ["./src/infrastructure/*"]
  }
}
```

**vite.config.ts:**
Уже исправлено - используется `vite-tsconfig-paths`, не нужны ручные алиасы

## 📝 Что заменить

### Было (неправильно):
```typescript
// Composition Layer
import { Handler } from '@internal/application/queries/Handler'
import { Repository } from '@internal/infrastructure/repositories/Repository'
```

### Стало (правильно):
```typescript
// Composition Layer
import { Handler } from '@/application/queries'  // ✅ Через Public API
import { Repository } from '@/infrastructure/repositories'  // ✅ Через Public API
```

### Правило для Presentation остается:
```typescript
// Presentation Layer
// ❌ НЕ может импортировать Application/Infrastructure напрямую
import { Handler } from '@/application/queries'  // ❌ ЗАПРЕЩЕНО

// ✅ Только через Composition facades
import { queries } from '@/composition'  // ✅ ПРАВИЛЬНО
```

## ✅ Преимущества

1. **Простота** - меньше алиасов, меньше конфигурации
2. **Единообразие** - все импортируют через Public API
3. **Инкапсуляция** - детали реализации скрыты за `index.ts`
4. **Гибкость** - можно менять структуру внутри слоя
5. **Понятность** - нет специальных "магических" алиасов

## 🔧 Дополнительно исправлено

### Устаревшие алиасы без слеша

**Было (неправильно):**
```typescript
import { Resource } from '@domain'  // ❌ Без слеша
import { queries } from '@api'      // ❌ Не существует + без слеша
import { Component } from '@client/components'  // ❌ Не нужен
```

**Стало (правильно):**
```typescript
import { Resource } from '@/domain'  // ✅ Со слешем
import { queries } from '@/composition'  // ✅ Правильное имя + слеш
import { Component } from '~/components'  // ✅ React Router alias
```

### Что исправлено:
1. `@domain` → `@/domain` (единый алиас для всех слоев)
2. `@api` → `@/composition` (правильное имя)
3. `@client` → `~` (React Router alias для локальных компонентов)

## 🎯 Документирование правил

Вместо специальных алиасов - просто документировать:

> **Composition Layer** - единственный слой, который может импортировать из всех остальных слоев.
> 
> **Все импорты через Public API (`index.ts`):**
> - Domain → `@/domain`
> - Application → `@/application/queries`, `@/application/commands`
> - Infrastructure → `@/infrastructure/repositories`, `@/infrastructure/services`
> - Composition → `@/composition`
>
> **Presentation Layer** может импортировать только:
> - Типы из Domain: `@/domain`
> - Facades из Composition: `@/composition`

## 📋 Чеклист выполнения

- [ ] Убрать `@internal/*` из docs/ARCHITECTURE_BOUNDARIES.md
- [ ] Убрать `@internal/*` из docs/PROJECT_STRUCTURE.md
- [ ] Убрать `@internal/*` из steps/step_0/ESLINT_SETUP.md
- [ ] Убрать `@internal/*` из steps/step_0/README.md
- [ ] Убрать `@internal/*` из steps/step_0/TYPESCRIPT_VITE_CONFIG.md
- [ ] Убрать `@internal/*` из steps/step_0/TAILWIND_SETUP.md
- [ ] Проверить tsconfig.json (если есть)
- [ ] Обновить все примеры кода
- [ ] Проверить что документация согласована
