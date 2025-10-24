# Реорганизация инвариантов по Bounded Context (2025-10-23)

## 🎯 Цель рефакторинга

Переместить domain-специфичные инварианты из `shared/` в соответствующие Bounded Context директории для правильной организации по DDD.

---

## 📋 Что изменилось

### Перемещенные файлы

**Было:**
```
src/domain/
├── shared/
│   └── invariants/
│       ├── IInvariant.ts
│       ├── UuidInvariant.ts
│       ├── NamespaceInvariant.ts        ← специфичен для Resource
│       ├── ResourceNameInvariant.ts     ← специфичен для Resource
│       └── index.ts
└── resource/
    └── value-objects/
```

**Стало:**
```
src/domain/
├── shared/
│   └── invariants/
│       ├── IInvariant.ts                # Интерфейс
│       ├── UuidInvariant.ts             # Shared - используется везде
│       └── index.ts
└── resource/
    ├── invariants/                      # ✅ НОВАЯ ДИРЕКТОРИЯ
    │   ├── NamespaceInvariant.ts
    │   ├── ResourceNameInvariant.ts
    │   └── index.ts
    └── value-objects/
```

---

## 🔄 Обновленные импорты

### В NamespaceInvariant.ts и ResourceNameInvariant.ts

**Было:**
```typescript
import { IInvariant } from "./IInvariant";
import { CommonNotEmptySpec, ... } from "../specification";
```

**Стало:**
```typescript
import { IInvariant } from "@/domain/shared/invariants";
import { CommonNotEmptySpec, ... } from "@/domain/shared/specification";
```

### В Namespace.ts и ResourceName.ts

**Было:**
```typescript
import { NamespaceInvariant } from "@/domain/shared";
```

**Стало:**
```typescript
import { NamespaceInvariant } from "../invariants";
```

---

## 📝 Обновленные Public API

### shared/invariants/index.ts

**Было:**
```typescript
export type { IInvariant } from './IInvariant'
export { UuidInvariant } from './UuidInvariant'
export { NamespaceInvariant } from './NamespaceInvariant'
export { ResourceNameInvariant } from './ResourceNameInvariant'
```

**Стало:**
```typescript
export type { IInvariant } from './IInvariant'
export { UuidInvariant } from './UuidInvariant'
```

### resource/invariants/index.ts (новый)

```typescript
export { NamespaceInvariant } from './NamespaceInvariant'
export { ResourceNameInvariant } from './ResourceNameInvariant'
```

---

## 🎓 Обоснование DDD

### Почему это правильно?

**1. Bounded Context изоляция**
- `NamespaceInvariant` и `ResourceNameInvariant` специфичны для Resource домена
- Они не используются (и не должны использоваться) другими доменами
- Держать их в `shared/` нарушает принцип минимального Shared Kernel

**2. Shared Kernel должен быть минимальным**
- В `shared/` только действительно общие вещи
- `UuidInvariant` используется везде (ResourceId, FieldId, EntryId...) → остается в shared
- `IInvariant` - интерфейс для всех инвариантов → остается в shared

**3. Согласованность с другими доменами**
- Когда появится User домен с `EmailInvariant` - он будет в `user/invariants/`
- Когда появится Payment домен с `AmountInvariant` - он будет в `payment/invariants/`

**4. Правильная организация кода**
```
domain/
├── shared/           # Минимум - только общие вещи
│   └── invariants/
│       ├── IInvariant.ts       # Интерфейс для всех
│       └── UuidInvariant.ts    # Используется везде
│
└── resource/         # Всё для Resource домена
    ├── invariants/
    ├── value-objects/
    ├── aggregates/
    └── specifications/
```

---

## ✅ Проверка

**Компиляция:**
```bash
pnpm exec tsc --noEmit
# Exit code: 0 ✅
```

**Файлы:**
- ✅ `/src/domain/resource/invariants/NamespaceInvariant.ts` - существует
- ✅ `/src/domain/resource/invariants/ResourceNameInvariant.ts` - существует
- ✅ `/src/domain/resource/invariants/index.ts` - существует
- ✅ `/src/domain/shared/invariants/index.ts` - обновлен
- ✅ `/src/domain/resource/value-objects/Namespace.ts` - импорт исправлен
- ✅ `/src/domain/resource/value-objects/ResourceName.ts` - импорт исправлен

---

## 📚 Обновленная документация

### Основные файлы

1. **steps/step_1/DOMAIN_LAYER_SETUP.md**
   - ✅ Обновлены пути к файлам
   - ✅ Обновлены импорты в примерах
   - ✅ Добавлена секция "Почему в resource/invariants, а не в shared?"
   - ✅ Обновлена итоговая структура

2. **docs/PROJECT_STRUCTURE.md**
   - ✅ Добавлена директория `resource/invariants/` в дерево
   - ✅ Обновлен список инвариантов в shared (только UuidInvariant)
   - ✅ Добавлена секция Public API для resource invariants

3. **.docs-meta/REFACTORING_REPORT_2025_10_23.md**
   - ✅ Обновлены пути к файлам
   - ✅ Обновлена финальная структура
   - ✅ Показано разделение shared vs resource

4. **.docs-meta/PATTERNS_QUICK_REFERENCE.md**
   - ✅ Список файлов разделен на Shared и Resource Bounded Context

---

## 🎯 Результат

### Преимущества новой структуры

1. ✅ **DDD Compliance** - правильное разделение по Bounded Context
2. ✅ **Минимальный Shared Kernel** - только действительно общие вещи
3. ✅ **Ясность** - понятно какие инварианты где используются
4. ✅ **Масштабируемость** - легко добавлять новые домены
5. ✅ **Согласованность** - все domain-специфичное в своем домене

### Правило для будущего

**Перед добавлением в shared/ спросить:**
> Используется ли это в НЕСКОЛЬКИХ доменах (не только в одном)?

- Да → `shared/`
- Нет → `{domain}/`

**Примеры:**
- `UuidInvariant` → используется в Resource, User, Payment → `shared/`
- `NamespaceInvariant` → используется только в Resource → `resource/`
- `EmailInvariant` (будущий) → используется только в User → `user/`

---

## 📅 Дата

**2025-10-23**

---

## ✨ Вердикт

**Структура теперь соответствует DDD принципам!**

- ✅ Bounded Context изоляция
- ✅ Минимальный Shared Kernel
- ✅ Правильная организация кода
- ✅ Готовность к масштабированию
