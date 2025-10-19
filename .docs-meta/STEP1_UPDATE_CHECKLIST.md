# Чеклист обновления steps/step_1/README.md

**Дата**: 2025-01-19  
**Файл**: `steps/step_1/README.md`

## 📋 Что нужно обновить

### 1. Создание структуры папок

**Добавить перед созданием файлов:**

```bash
# Создать структуру Domain Layer
mkdir -p src/domain/resource/aggregates
mkdir -p src/domain/resource/entities
mkdir -p src/domain/resource/value-objects
mkdir -p src/domain/resource/repositories
mkdir -p src/domain/resource/events
mkdir -p src/domain/shared/errors
mkdir -p src/domain/shared/invariants
mkdir -p src/domain/shared/base
```

### 2. Обновить пути к файлам Value Objects

#### ResourceId
- **Было:** `src/domain/resource/ResourceId.ts`
- **Стало:** `src/domain/resource/value-objects/ResourceId.ts`

#### Namespace
- **Было:** `src/domain/resource/Namespace.ts`
- **Стало:** `src/domain/resource/value-objects/Namespace.ts`

#### ResourceName
- **Было:** `src/domain/resource/ResourceName.ts`
- **Стало:** `src/domain/resource/value-objects/ResourceName.ts`

### 3. Обновить Public API (index.ts)

#### src/domain/resource/index.ts
**Было:**
```typescript
export { ResourceId } from './ResourceId'
export { Namespace } from './Namespace'
export { ResourceName } from './ResourceName'
```

**Стало:**
```typescript
export * from './value-objects'
```

#### Добавить новые index.ts:

**src/domain/resource/value-objects/index.ts:**
```typescript
export { ResourceId } from './ResourceId'
export { Namespace } from './Namespace'
export { ResourceName } from './ResourceName'
```

### 4. Обновить импорты внутри файлов

Если в примерах есть импорты между Value Objects - обновить на относительные пути внутри value-objects/.

### 5. Добавить создание других подпапок (если есть примеры)

- `aggregates/` - если создается Resource
- `entities/` - если создается CustomField
- `repositories/` - если создается IResourceRepository
- `events/` - если создаются события

## 🔍 Поиск всех упоминаний

```bash
# Найти все пути к файлам
grep -n "src/domain/resource/ResourceId" steps/step_1/README.md
grep -n "src/domain/resource/Namespace" steps/step_1/README.md
grep -n "src/domain/resource/ResourceName" steps/step_1/README.md

# Найти локальные импорты
grep -n "from './ResourceId'" steps/step_1/README.md
grep -n "from './Namespace'" steps/step_1/README.md
grep -n "from './ResourceName'" steps/step_1/README.md
```

## ✅ Чеклист изменений

- [ ] Добавить создание папок aggregates/, entities/, value-objects/
- [ ] Обновить путь к ResourceId.ts
- [ ] Обновить путь к Namespace.ts
- [ ] Обновить путь к ResourceName.ts
- [ ] Обновить src/domain/resource/index.ts
- [ ] Создать src/domain/resource/value-objects/index.ts
- [ ] Обновить все импорты в примерах кода
- [ ] Проверить что все пути корректны

## 📝 Примечания

- Если в step_1 создаются только Value Objects - достаточно только value-objects/
- Если создаются Aggregates/Entities - добавить соответствующие папки
- Все локальные импорты внутри value-objects/ остаются с `./`
- Импорты из shared остаются через `@/domain/shared/...`
