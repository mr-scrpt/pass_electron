# Система тегов для путей к файлам

**Дата**: 2025-01-19  
**Цель**: Быстро находить все упоминания конкретных файлов при рефакторинге

---

## 🎯 Проблема

При переименовании файла или изменении его пути нужно обновить:
- Примеры кода с импортами
- Пути в инструкциях (steps/)
- Структуру директорий в документации
- Ссылки на файлы

**Обычный поиск не помогает:**
```bash
grep -r "ResourceId.ts"  # Найдет только точное совпадение
# Не найдет: ResourceId, import ResourceId, class ResourceId
```

---

## ✅ Решение: Теги для файлов

### Формат тега: `#file:{path}`

```
#file:domain/resource/value-objects/ResourceId.ts
#file:domain/resource/aggregates/Resource.ts
#file:domain/shared/errors/InvariantViolationError.ts
```

### Где размещать теги:

1. **В заголовках примеров кода:**
```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`** `#file:domain/resource/value-objects/ResourceId.ts`
```

2. **В структуре директорий:**
```markdown
```
src/domain/resource/
├── value-objects/
│   └── ResourceId.ts          #file:domain/resource/value-objects/ResourceId.ts
```
```

3. **В примерах импортов:**
```markdown
```typescript
// #file:domain/resource/aggregates/Resource.ts
import { ResourceId } from '../value-objects/ResourceId'  // #file:domain/resource/value-objects/ResourceId.ts
```
```

---

## 📋 Каталог файлов с тегами

### Domain Layer - Value Objects

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| ResourceId.ts | `#file:domain/resource/value-objects/ResourceId.ts` | TYPES_AND_ENTITIES.md, step_1/README.md, INVARIANTS.md |
| Namespace.ts | `#file:domain/resource/value-objects/Namespace.ts` | TYPES_AND_ENTITIES.md, step_1/README.md |
| ResourceName.ts | `#file:domain/resource/value-objects/ResourceName.ts` | TYPES_AND_ENTITIES.md, step_1/README.md |
| FieldId.ts | `#file:domain/resource/value-objects/FieldId.ts` | TYPES_AND_ENTITIES.md |
| FieldValue.ts | `#file:domain/resource/value-objects/FieldValue.ts` | TYPES_AND_ENTITIES.md |

### Domain Layer - Aggregates

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| Resource.ts | `#file:domain/resource/aggregates/Resource.ts` | DDD_AND_CLEAN_ARCHITECTURE.md, TYPES_AND_ENTITIES.md |

### Domain Layer - Entities

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| CustomField.ts | `#file:domain/resource/entities/CustomField.ts` | TYPES_AND_ENTITIES.md |
| SecretField.ts | `#file:domain/resource/entities/SecretField.ts` | TYPES_AND_ENTITIES.md |

### Domain Layer - Repositories

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| IResourceRepository.ts | `#file:domain/resource/repositories/IResourceRepository.ts` | DDD_AND_CLEAN_ARCHITECTURE.md, step_1/README.md |
| INamespaceRepository.ts | `#file:domain/resource/repositories/INamespaceRepository.ts` | TYPES_AND_ENTITIES.md |

### Domain Layer - Events

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| ResourceCreated.ts | `#file:domain/resource/events/ResourceCreated.ts` | PROJECT_STRUCTURE.md |
| ResourceUpdated.ts | `#file:domain/resource/events/ResourceUpdated.ts` | PROJECT_STRUCTURE.md |
| ResourceDeleted.ts | `#file:domain/resource/events/ResourceDeleted.ts` | PROJECT_STRUCTURE.md |

### Domain Layer - Shared Kernel

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| InvariantViolationError.ts | `#file:domain/shared/errors/InvariantViolationError.ts` | ERROR_HANDLING.md, INVARIANTS.md, step_1/README.md |
| DomainError.ts | `#file:domain/shared/errors/DomainError.ts` | ERROR_HANDLING.md, DDD_AND_CLEAN_ARCHITECTURE.md |
| UuidInvariant.ts | `#file:domain/shared/invariants/UuidInvariant.ts` | INVARIANTS.md, step_1/README.md |
| StringInvariant.ts | `#file:domain/shared/invariants/StringInvariant.ts` | INVARIANTS.md |
| IRepository.ts | `#file:domain/shared/base/IRepository.ts` | PROJECT_STRUCTURE.md |
| DomainEvent.ts | `#file:domain/shared/base/DomainEvent.ts` | PROJECT_STRUCTURE.md |

### Application Layer - DTOs

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| ResourceListItemDTO.ts | `#file:application/queries/dtos/ResourceListItemDTO.ts` | TYPES_AND_ENTITIES.md, step_1/README.md |
| ResourceDetailDTO.ts | `#file:application/queries/dtos/ResourceDetailDTO.ts` | TYPES_AND_ENTITIES.md |

### Application Layer - Query Handlers

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| ListResourcesQueryHandler.ts | `#file:application/queries/handlers/ListResourcesQueryHandler.ts` | QUERY_HANDLERS.md, DATA_FLOW.md |
| GetResourceByIdQueryHandler.ts | `#file:application/queries/handlers/GetResourceByIdQueryHandler.ts` | QUERY_HANDLERS.md |

### Application Layer - Command Handlers

| Файл | Тег | Упоминается в |
|------|-----|---------------|
| CreateResourceCommandHandler.ts | `#file:application/commands/handlers/CreateResourceCommandHandler.ts` | COMMAND_BUS.md |
| UpdateResourceCommandHandler.ts | `#file:application/commands/handlers/UpdateResourceCommandHandler.ts` | COMMAND_BUS.md |

---

## 🔍 Команды поиска

### Найти все упоминания конкретного файла:

```bash
# Найти все упоминания ResourceId.ts
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/ steps/

# Найти все упоминания Resource.ts
grep -r "#file:domain/resource/aggregates/Resource.ts" docs/ steps/

# Найти все упоминания IResourceRepository.ts
grep -r "#file:domain/resource/repositories/IResourceRepository.ts" docs/ steps/
```

### Найти все файлы в конкретной директории:

```bash
# Все файлы в value-objects/
grep -r "#file:domain/resource/value-objects/" docs/ steps/

# Все файлы в aggregates/
grep -r "#file:domain/resource/aggregates/" docs/ steps/

# Все файлы в shared/errors/
grep -r "#file:domain/shared/errors/" docs/ steps/
```

### Найти все упоминания файлов по паттерну:

```bash
# Все Value Objects
grep -r "#file:.*value-objects/" docs/ steps/

# Все Repository интерфейсы
grep -r "#file:.*repositories/" docs/ steps/

# Все DTO
grep -r "#file:.*dtos/" docs/ steps/
```

---

## 🔄 Сценарии использования

### Сценарий 1: Переименование файла

**Задача:** Переименовать `ResourceId.ts` → `ResourceIdentifier.ts`

```bash
# 1. Найти все упоминания
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/ steps/

# Результат:
# docs/TYPES_AND_ENTITIES.md:147
# docs/error-handling/INVARIANTS.md:89
# steps/step_1/README.md:180

# 2. Обновить все найденные файлы:
# - Изменить путь в заголовке
# - Изменить имя класса в примерах
# - Обновить импорты
# - Обновить тег на новый

# 3. Заменить тег везде:
# #file:domain/resource/value-objects/ResourceId.ts
# →
# #file:domain/resource/value-objects/ResourceIdentifier.ts
```

### Сценарий 2: Перемещение файла

**Задача:** Переместить `ResourceId.ts` из `value-objects/` в `identifiers/`

```bash
# 1. Найти все упоминания
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/ steps/

# 2. Обновить:
# - Пути в структуре директорий
# - Импорты в примерах кода
# - Инструкции в steps/

# 3. Обновить тег:
# #file:domain/resource/value-objects/ResourceId.ts
# →
# #file:domain/resource/identifiers/ResourceId.ts
```

### Сценарий 3: Удаление файла

**Задача:** Удалить `FieldValue.ts` (больше не нужен)

```bash
# 1. Найти все упоминания
grep -r "#file:domain/resource/value-objects/FieldValue.ts" docs/ steps/

# 2. Удалить или обновить:
# - Убрать из структуры директорий
# - Удалить примеры кода
# - Обновить инструкции
# - Удалить из Public API примеров
```

### Сценарий 4: Проверка согласованности

**Задача:** Убедиться что все файлы в документации существуют

```bash
# 1. Получить список всех файлов из тегов
grep -rh "#file:" docs/ steps/ | sort | uniq

# 2. Сравнить со структурой проекта
# 3. Найти несоответствия
```

---

## 📊 Комбинация с концептуальными тегами

### Файл может иметь несколько тегов:

```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`**
`#file:domain/resource/value-objects/ResourceId.ts` `#value-object-resourceid` `#value-object`

```typescript
// #file:domain/resource/value-objects/ResourceId.ts
// #value-object-resourceid
import { Result } from 'neverthrow'
import { UuidInvariant } from '@/domain/shared/invariants'  // #file:domain/shared/invariants/UuidInvariant.ts
```
```

**Преимущества:**
- `#file:*` - для поиска по конкретному пути
- `#value-object-resourceid` - для поиска концепции
- `#value-object` - для поиска всех Value Objects

---

## 🎯 Правила использования

### 1. Всегда добавлять тег файла в:

- ✅ Заголовках примеров кода
- ✅ Структуре директорий
- ✅ Инструкциях по созданию файлов
- ✅ Примерах импортов (в комментариях)

### 2. Формат тега:

```
#file:{относительный_путь_от_src}
```

**Правильно:**
```
#file:domain/resource/value-objects/ResourceId.ts
#file:application/queries/dtos/ResourceListItemDTO.ts
```

**Неправильно:**
```
#file:src/domain/resource/value-objects/ResourceId.ts  ❌ (лишний src/)
#file:ResourceId.ts  ❌ (нет полного пути)
#file:domain/resource/value-objects/  ❌ (нет имени файла)
```

### 3. Размещение тега:

**В заголовках:**
```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`** `#file:domain/resource/value-objects/ResourceId.ts`
```

**В структуре (в конце строки):**
```markdown
│   └── ResourceId.ts          #file:domain/resource/value-objects/ResourceId.ts
```

**В коде (в комментарии):**
```typescript
// #file:domain/resource/aggregates/Resource.ts
import { ResourceId } from '../value-objects/ResourceId'  // #file:domain/resource/value-objects/ResourceId.ts
```

### 4. Обновление тегов:

При рефакторинге:
1. Найти все теги старого пути
2. Обновить на новый путь
3. Проверить что ничего не пропущено

---

## 💡 Преимущества vs grep по имени файла

### Обычный grep:
```bash
grep -r "ResourceId.ts" docs/
```
**Проблемы:**
- ❌ Найдет только точное совпадение имени
- ❌ Не найдет упоминания класса `ResourceId`
- ❌ Не найдет импорты без `.ts`
- ❌ Много ложных срабатываний

### С тегами:
```bash
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/
```
**Преимущества:**
- ✅ Точное совпадение - только этот файл
- ✅ Найдет все блоки где упоминается файл
- ✅ Нет ложных срабатываний
- ✅ Можно искать по паттернам директорий

---

## 🔗 Связь с другими системами тегов

### Иерархия тегов для одного файла:

```
ResourceId.ts имеет теги:

1. Путь к файлу:
   #file:domain/resource/value-objects/ResourceId.ts

2. Концепция:
   #value-object-resourceid

3. Категория:
   #value-object

4. Слой:
   #layer-domain

5. Структура:
   #domain-structure
   #bounded-context-resource
```

**Использование:**
- Рефакторинг файла → `#file:*`
- Рефакторинг концепции → `#value-object-resourceid`
- Поиск всех Value Objects → `#value-object`
- Изменение структуры → `#domain-structure`

---

## ✅ Чеклист внедрения

### Этап 1: Добавить теги в существующие файлы

- [ ] `docs/PROJECT_STRUCTURE.md` - добавить `#file:*` в структуру
- [ ] `docs/TYPES_AND_ENTITIES.md` - добавить `#file:*` в примеры
- [ ] `docs/DDD_AND_CLEAN_ARCHITECTURE.md` - добавить `#file:*` в примеры
- [ ] `steps/step_1/README.md` - добавить `#file:*` в инструкции
- [ ] `docs/error-handling/INVARIANTS.md` - добавить `#file:*` в примеры

### Этап 2: Создать каталог файлов

- [ ] Составить полный список файлов с тегами
- [ ] Указать где каждый файл упоминается
- [ ] Проверить согласованность

### Этап 3: Документировать правила

- [ ] Добавить правила в руководство
- [ ] Создать примеры использования
- [ ] Обновить чеклисты рефакторинга

---

## 📝 Примеры из реальной документации

### Пример 1: steps/step_1/README.md

**Было:**
```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`**
```

**Стало:**
```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`** `#file:domain/resource/value-objects/ResourceId.ts`
```

### Пример 2: docs/TYPES_AND_ENTITIES.md

**Было:**
```markdown
```typescript
// src/domain/resource/value-objects/ResourceId.ts
import { Result } from 'neverthrow'
```
```

**Стало:**
```markdown
```typescript
// #file:domain/resource/value-objects/ResourceId.ts
import { Result } from 'neverthrow'
import { UuidInvariant } from '@/domain/shared/invariants'  // #file:domain/shared/invariants/UuidInvariant.ts
```
```

### Пример 3: docs/PROJECT_STRUCTURE.md

**Было:**
```markdown
├── value-objects/
│   ├── ResourceId.ts
│   ├── ResourceName.ts
│   └── Namespace.ts
```

**Стало:**
```markdown
├── value-objects/              #file:domain/resource/value-objects/
│   ├── ResourceId.ts           #file:domain/resource/value-objects/ResourceId.ts
│   ├── ResourceName.ts         #file:domain/resource/value-objects/ResourceName.ts
│   └── Namespace.ts            #file:domain/resource/value-objects/Namespace.ts
```

---

## 🎯 Итог

**Теги для путей к файлам - это НЕ избыточно!**

### Разница с тегами импортов:

| Тип тега | Что находит | Когда использовать |
|----------|-------------|-------------------|
| `#import-rule-*` | **Правила** импортов | Изменение правил архитектуры |
| `#file:*` | **Конкретные файлы** | Рефакторинг файлов/путей |

### Оба нужны:

- `#import-rule-public-api` - "как правильно импортировать"
- `#file:domain/resource/value-objects/ResourceId.ts` - "где упоминается этот файл"

**Рекомендация:** Внедрить систему тегов для файлов параллельно с концептуальными тегами.
