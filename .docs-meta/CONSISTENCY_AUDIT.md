# Аудит согласованности проекта с системой тегов

**Дата**: 2025-01-19  
**Цель**: Создать систему тегов/якорей для быстрого поиска и рефакторинга

---

## 📋 Категории сущностей

### 1. 🏗️ Архитектурные слои
### 2. 📁 Структура директорий
### 3. 🔤 Термины и концепции DDD
### 4. 💾 Типы данных и интерфейсы
### 5. 🔄 Паттерны и практики
### 6. 📦 Импорты и алиасы
### 7. 🛠️ Инструменты и конфигурация

---

## 1. 🏗️ АРХИТЕКТУРНЫЕ СЛОИ

### Теги: `#layer-domain` `#layer-application` `#layer-infrastructure` `#layer-composition` `#layer-presentation`

| Тег | Слой | Путь | Описание |
|-----|------|------|----------|
| `#layer-domain` | Domain Layer | `src/domain/` | Бизнес-логика, DDD паттерны |
| `#layer-application` | Application Layer | `src/application/` | Use Cases, CQRS |
| `#layer-infrastructure` | Infrastructure Layer | `src/infrastructure/` | Внешние зависимости |
| `#layer-composition` | Composition Root | `src/composition/` | DI Container |
| `#layer-presentation` | Presentation Layer | `src/presentation/web/react/` | UI, React Router |

**Файлы с описанием:**
- `docs/PROJECT_STRUCTURE.md` `#layer-domain` `#layer-application` `#layer-infrastructure` `#layer-composition` `#layer-presentation`
- `docs/DDD_AND_CLEAN_ARCHITECTURE.md` `#layer-domain` `#layer-application`
- `docs/ARCHITECTURE_BOUNDARIES.md` `#layer-domain` `#layer-application` `#layer-infrastructure`
- `docs/COMPOSITION_LAYER.md` `#layer-composition`

**Правило зависимостей:**
```
Presentation → Composition → Application → Domain
                ↓
         Infrastructure → Domain
```

---

## 2. 📁 СТРУКТУРА ДИРЕКТОРИЙ

### 2.1 Domain Layer Structure

#### Теги: `#domain-structure` `#bounded-context` `#shared-kernel`

**Bounded Context (модуль):**
```
#bounded-context-resource
src/domain/resource/
├── aggregates/      #aggregate-root
├── entities/        #entity
├── value-objects/   #value-object
├── repositories/    #repository-interface
├── events/          #domain-event
└── index.ts         #public-api
```

**Shared Kernel:**
```
#shared-kernel
src/domain/shared/
├── errors/          #domain-error
├── invariants/      #invariant
├── base/            #base-class
└── index.ts         #public-api
```

**Файлы с описанием:**
- `docs/PROJECT_STRUCTURE.md` (строки 162-235) `#domain-structure` `#bounded-context` `#shared-kernel`
- `docs/TYPES_AND_ENTITIES.md` (строки 57-90) `#bounded-context-resource`
- `steps/step_1/README.md` (строки 66-94) `#domain-structure`
- `.docs-meta/DOMAIN_LAYER_STRUCTURE_ANALYSIS.md` `#domain-structure` `#bounded-context`
- `.docs-meta/DOMAIN_STRUCTURE_FINAL_REPORT.md` `#domain-structure`

### 2.2 Application Layer Structure

#### Теги: `#cqrs` `#query-handler` `#command-handler`

```
#layer-application
src/application/
├── queries/         #query-handler #cqrs-read
│   ├── handlers/
│   ├── dtos/        #dto
│   └── index.ts
├── commands/        #command-handler #cqrs-write
│   ├── handlers/
│   └── index.ts
└── ports/           #port-interface
```

**Файлы с описанием:**
- `docs/QUERY_HANDLERS.md` `#query-handler` `#cqrs`
- `docs/COMMAND_BUS.md` `#command-handler` `#cqrs`
- `docs/DATA_FLOW.md` `#cqrs` `#query-handler`

---

## 3. 🔤 ТЕРМИНЫ И КОНЦЕПЦИИ DDD

### Теги: `#ddd-*` `#pattern-*`

| Термин | Тег | Определение | Файлы |
|--------|-----|-------------|-------|
| **Aggregate Root** | `#aggregate-root` | Главная сущность с глобальным ID | `docs/DDD_AND_CLEAN_ARCHITECTURE.md` (строки 200-235) |
| **Entity** | `#entity` | Объект с идентичностью | `docs/DDD_AND_CLEAN_ARCHITECTURE.md` (строки 98-125) |
| **Value Object** | `#value-object` | Неизменяемое значение | `docs/TYPES_AND_ENTITIES.md` (строки 130-180) |
| **Repository** | `#repository-interface` | Контракт для хранилища | `docs/DDD_AND_CLEAN_ARCHITECTURE.md` (строки 236-252) |
| **Domain Event** | `#domain-event` | Событие домена | `docs/DDD_AND_CLEAN_ARCHITECTURE.md` (строки 254-280) |
| **Bounded Context** | `#bounded-context` | Автономный модуль | `.docs-meta/DOMAIN_LAYER_STRUCTURE_ANALYSIS.md` |
| **Shared Kernel** | `#shared-kernel` | Общий переиспользуемый код | `.docs-meta/DOMAIN_LAYER_STRUCTURE_ANALYSIS.md` |
| **Invariant** | `#invariant` | Правило валидации | `docs/error-handling/INVARIANTS.md` |
| **DTO** | `#dto` | Data Transfer Object | `docs/TYPES_AND_ENTITIES.md` (строки 271-295) |

**Ключевые файлы:**
- `docs/DDD_AND_CLEAN_ARCHITECTURE.md` - все DDD паттерны
- `docs/TYPES_AND_ENTITIES.md` - Value Objects, Entities, DTO
- `docs/error-handling/INVARIANTS.md` - Invariants

---

## 4. 💾 ТИПЫ ДАННЫХ И ИНТЕРФЕЙСЫ

### 4.1 Value Objects

#### Тег: `#value-object-*`

| Value Object | Тег | Путь | Инвариант |
|--------------|-----|------|-----------|
| ResourceId | `#value-object-resourceid` | `src/domain/resource/value-objects/ResourceId.ts` | UUID v4 |
| Namespace | `#value-object-namespace` | `src/domain/resource/value-objects/Namespace.ts` | 2-50 chars, lowercase |
| ResourceName | `#value-object-resourcename` | `src/domain/resource/value-objects/ResourceName.ts` | 1-100 chars |
| FieldId | `#value-object-fieldid` | `src/domain/resource/value-objects/FieldId.ts` | UUID v4 |
| FieldValue | `#value-object-fieldvalue` | `src/domain/resource/value-objects/FieldValue.ts` | Encrypted string |

**Файлы с примерами:**
- `docs/TYPES_AND_ENTITIES.md` (строки 147-180) `#value-object`
- `steps/step_1/README.md` (строки 180-268) `#value-object-resourceid` `#value-object-namespace` `#value-object-resourcename`

### 4.2 Entities & Aggregates

#### Тег: `#entity-*` `#aggregate-*`

| Сущность | Тег | Путь | Тип |
|----------|-----|------|-----|
| Resource | `#aggregate-resource` | `src/domain/resource/aggregates/Resource.ts` | Aggregate Root |
| CustomField | `#entity-customfield` | `src/domain/resource/entities/CustomField.ts` | Entity |
| SecretField | `#entity-secretfield` | `src/domain/resource/entities/SecretField.ts` | Entity |

**Файлы с примерами:**
- `docs/DDD_AND_CLEAN_ARCHITECTURE.md` (строки 103-125) `#aggregate-resource`
- `docs/TYPES_AND_ENTITIES.md` (строки 389-455) `#aggregate-resource`

### 4.3 Repository Interfaces

#### Тег: `#repository-*`

| Repository | Тег | Путь | Методы |
|------------|-----|------|--------|
| IResourceRepository | `#repository-resource` | `src/domain/resource/repositories/IResourceRepository.ts` | findById, findAll, save, delete |
| INamespaceRepository | `#repository-namespace` | `src/domain/resource/repositories/INamespaceRepository.ts` | findAll, findByName |

**Файлы с описанием:**
- `docs/DDD_AND_CLEAN_ARCHITECTURE.md` (строки 241-251) `#repository-interface`
- `steps/step_1/README.md` (строки 323-340) `#repository-resource`

### 4.4 DTOs

#### Тег: `#dto-*`

| DTO | Тег | Путь | Использование |
|-----|-----|------|---------------|
| ResourceListItemDTO | `#dto-resource-list` | `src/application/queries/dtos/ResourceListItemDTO.ts` | Список ресурсов |
| ResourceDetailDTO | `#dto-resource-detail` | `src/application/queries/dtos/ResourceDetailDTO.ts` | Детали ресурса |
| CustomFieldDTO | `#dto-customfield` | `src/application/queries/dtos/ResourceDetailDTO.ts` | Кастомное поле |

**Файлы с описанием:**
- `docs/TYPES_AND_ENTITIES.md` (строки 271-295) `#dto`
- `steps/step_1/README.md` (строки 275-295) `#dto-resource-list`

---

## 5. 🔄 ПАТТЕРНЫ И ПРАКТИКИ

### Теги: `#pattern-*` `#practice-*`

| Паттерн | Тег | Описание | Файлы |
|---------|-----|----------|-------|
| CQRS | `#pattern-cqrs` | Command Query Responsibility Segregation | `docs/QUERY_HANDLERS.md`, `docs/COMMAND_BUS.md` |
| Repository Pattern | `#pattern-repository` | Абстракция хранилища | `docs/DDD_AND_CLEAN_ARCHITECTURE.md` |
| Facade Pattern | `#pattern-facade` | Упрощение API | `docs/COMPOSITION_LAYER.md` |
| Adapter Pattern | `#pattern-adapter` | Изоляция платформ | `docs/COMPOSITION_LAYER.md` |
| Factory Pattern | `#pattern-factory` | Создание объектов | `docs/COMPOSITION_LAYER.md` |
| Result Pattern | `#pattern-result` | Обработка ошибок | `docs/error-handling/ERROR_ESCALATION.md` |
| Event-Driven | `#pattern-event-driven` | Коммуникация через события | `docs/DDD_AND_CLEAN_ARCHITECTURE.md` |
| Dependency Injection | `#pattern-di` | Инверсия зависимостей | `docs/COMPOSITION_LAYER.md` |

**Практики:**
- `#practice-domain-first` - Domain First подход
- `#practice-public-api` - Импорты через Public API
- `#practice-immutability` - Неизменяемость Value Objects
- `#practice-type-safety` - Строгая типизация

---

## 6. 📦 ИМПОРТЫ И АЛИАСЫ

### Теги: `#import-*` `#alias-*`

### 6.1 TypeScript Path Aliases

| Алиас | Тег | Путь | Использование |
|-------|-----|------|---------------|
| `@/domain` | `#alias-domain` | `src/domain` | Domain Layer |
| `@/application` | `#alias-application` | `src/application` | Application Layer |
| `@/infrastructure` | `#alias-infrastructure` | `src/infrastructure` | Infrastructure Layer |
| `@/composition` | `#alias-composition` | `src/composition` | Composition Root |
| `@/shared` | `#alias-shared` | `src/shared` | Shared utilities |

**Файлы с конфигурацией:**
- `tsconfig.json` `#alias-domain` `#alias-application` `#alias-infrastructure`
- `steps/step_0/TYPESCRIPT_VITE_CONFIG.md` `#alias-domain`

### 6.2 Правила импортов

#### Тег: `#import-rule-*`

**Локальные импорты (внутри модуля):**
```typescript
// #import-rule-local
// src/domain/resource/aggregates/Resource.ts
import { ResourceId } from '../value-objects/ResourceId'  // ✅
```

**Кросс-модульные (через Public API):**
```typescript
// #import-rule-public-api
import { Resource, ResourceId } from '@/domain/resource'  // ✅
import { DomainError } from '@/domain/shared/errors'      // ✅
```

**Запрещенные (прямые импорты):**
```typescript
// #import-rule-forbidden
import { Resource } from '@/domain/resource/Resource.ts'  // ❌
```

**Файлы с правилами:**
- `docs/PROJECT_STRUCTURE.md` (строки 820-920) `#import-rule-public-api` `#import-rule-forbidden`
- `docs/ARCHITECTURE_BOUNDARIES.md` `#import-rule-public-api`
- `.docs-meta/PUBLIC_API_IMPORT_RULES.md` (если есть) `#import-rule-public-api`

---

## 7. 🛠️ ИНСТРУМЕНТЫ И КОНФИГУРАЦИЯ

### Теги: `#tool-*` `#config-*`

| Инструмент | Тег | Файл конфигурации | Описание |
|------------|-----|-------------------|----------|
| TypeScript | `#tool-typescript` | `tsconfig.json` | Типизация |
| Vite | `#tool-vite` | `vite.config.ts` | Build tool |
| React Router | `#tool-react-router` | `react-router.config.ts` | Routing |
| pnpm | `#tool-pnpm` | `pnpm-workspace.yaml` | Package manager |
| Tailwind CSS | `#tool-tailwind` | `tailwind.config.js` | Styling |
| ESLint | `#tool-eslint` | `.eslintrc.js` | Linting |

**Файлы с описанием:**
- `steps/step_0/TYPESCRIPT_VITE_CONFIG.md` `#tool-typescript` `#tool-vite`
- `steps/step_0/PACKAGE_JSON_SETUP.md` `#tool-pnpm`

---

## 8. 🔍 СИСТЕМА ПОИСКА ПО ТЕГАМ

### Команды для поиска

```bash
# Найти все упоминания Domain Layer
grep -r "#layer-domain" docs/ steps/ .docs-meta/

# Найти все Value Objects
grep -r "#value-object" docs/ steps/

# Найти все примеры импортов
grep -r "#import-rule" docs/

# Найти все упоминания CQRS
grep -r "#pattern-cqrs" docs/

# Найти все упоминания Bounded Context
grep -r "#bounded-context" docs/ .docs-meta/

# Найти конкретный Value Object
grep -r "#value-object-resourceid" docs/ steps/
```

### Поиск по категориям

```bash
# Архитектурные слои
grep -r "#layer-" docs/ | grep -E "(domain|application|infrastructure|composition|presentation)"

# DDD паттерны
grep -r "#ddd-" docs/ | grep -E "(aggregate|entity|value-object|repository|event)"

# Паттерны проектирования
grep -r "#pattern-" docs/ | grep -E "(cqrs|repository|facade|adapter|factory)"

# Правила импортов
grep -r "#import-rule-" docs/
```

---

## 9. 📊 КАРТА ЗАВИСИМОСТЕЙ

### Ключевые связи между сущностями

```
#aggregate-resource
  ├─ использует #value-object-resourceid
  ├─ использует #value-object-namespace
  ├─ использует #value-object-resourcename
  ├─ содержит #entity-customfield
  └─ генерирует #domain-event

#repository-resource
  ├─ определен в #layer-domain
  ├─ реализован в #layer-infrastructure
  └─ использует #aggregate-resource

#query-handler
  ├─ использует #repository-interface
  ├─ преобразует #aggregate-root в #dto
  └─ возвращает #pattern-result

#layer-composition
  ├─ связывает #layer-application и #layer-infrastructure
  ├─ использует #pattern-di
  └─ предоставляет #pattern-facade
```

---

## 10. ✅ ЧЕКЛИСТ СОГЛАСОВАННОСТИ

### При добавлении нового Value Object:

- [ ] Создать файл в `src/domain/{context}/value-objects/` `#value-object`
- [ ] Добавить тег `#value-object-{name}` в комментарии
- [ ] Экспортировать в `value-objects/index.ts` `#public-api`
- [ ] Экспортировать в `{context}/index.ts` `#public-api`
- [ ] Добавить пример в `docs/TYPES_AND_ENTITIES.md` `#value-object`
- [ ] Обновить `steps/step_*/README.md` если нужно

### При добавлении нового Bounded Context:

- [ ] Создать структуру `src/domain/{context}/` `#bounded-context`
- [ ] Создать подпапки: aggregates/, entities/, value-objects/, repositories/, events/
- [ ] Создать Public API (`index.ts`) в каждой подпапке `#public-api`
- [ ] Добавить описание в `docs/PROJECT_STRUCTURE.md` `#domain-structure`
- [ ] Добавить тег `#bounded-context-{name}`

### При изменении структуры:

- [ ] Обновить все файлы с тегом `#domain-structure`
- [ ] Обновить все примеры импортов `#import-rule`
- [ ] Обновить `steps/step_1/README.md` `#domain-structure`
- [ ] Проверить согласованность с `.docs-meta/DOMAIN_STRUCTURE_FINAL_REPORT.md`

---

## 11. 🎯 ПРИОРИТЕТНЫЕ ФАЙЛЫ ДЛЯ РЕФАКТОРИНГА

### Канонические источники истины (Source of Truth):

1. **Структура проекта:**
   - `docs/PROJECT_STRUCTURE.md` `#layer-domain` `#domain-structure` `#public-api`
   - `.docs-meta/DOMAIN_STRUCTURE_FINAL_REPORT.md` `#domain-structure`

2. **Типы и сущности:**
   - `docs/TYPES_AND_ENTITIES.md` `#value-object` `#entity` `#dto`
   - `docs/contracts/domain-types.md` (если есть)

3. **DDD паттерны:**
   - `docs/DDD_AND_CLEAN_ARCHITECTURE.md` `#aggregate-root` `#entity` `#repository-interface`

4. **Правила импортов:**
   - `docs/ARCHITECTURE_BOUNDARIES.md` `#import-rule-public-api` `#import-rule-forbidden`

5. **Инструкции:**
   - `steps/step_1/README.md` `#domain-structure` `#value-object`

---

## 12. 📝 ИНСТРУКЦИЯ ПО ИСПОЛЬЗОВАНИЮ ТЕГОВ

### Для разработчика:

1. **При создании нового кода:**
   - Добавляй теги в комментарии: `// #value-object-resourceid`
   - Используй теги в документации: `#layer-domain`

2. **При рефакторинге:**
   - Ищи все упоминания: `grep -r "#value-object-resourceid"`
   - Обновляй все файлы с найденными тегами

3. **При добавлении документации:**
   - Добавляй теги в заголовки и примерах
   - Ссылайся на существующие теги

### Для AI/LLM:

1. **При анализе проекта:**
   - Используй теги для быстрого поиска связанных файлов
   - Группируй информацию по тегам

2. **При обновлении:**
   - Найди все файлы с тегом
   - Проверь согласованность между ними
   - Обнови все найденные упоминания

3. **При создании отчетов:**
   - Используй теги для структурирования
   - Ссылайся на теги в рекомендациях

---

## 13. 📁 ТЕГИ ДЛЯ ПУТЕЙ К ФАЙЛАМ

### Формат: `#file:{path}`

**Зачем нужны отдельные теги для файлов?**

Концептуальные теги (`#value-object-resourceid`) находят **концепцию**, но не **конкретный путь**.

При переименовании файла нужно обновить:
- Пути в инструкциях
- Структуру директорий
- Импорты в примерах
- Ссылки на файлы

### Примеры тегов файлов:

```
#file:domain/resource/value-objects/ResourceId.ts
#file:domain/resource/aggregates/Resource.ts
#file:domain/shared/errors/InvariantViolationError.ts
#file:application/queries/dtos/ResourceListItemDTO.ts
```

### Где размещать:

**В заголовках:**
```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`** `#file:domain/resource/value-objects/ResourceId.ts`
```

**В структуре:**
```markdown
│   └── ResourceId.ts          #file:domain/resource/value-objects/ResourceId.ts
```

**В коде:**
```typescript
// #file:domain/resource/aggregates/Resource.ts
import { ResourceId } from '../value-objects/ResourceId'  // #file:domain/resource/value-objects/ResourceId.ts
```

### Команды поиска:

```bash
# Найти все упоминания конкретного файла
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/ steps/

# Найти все файлы в директории
grep -r "#file:domain/resource/value-objects/" docs/ steps/

# Найти все Value Objects по паттерну
grep -r "#file:.*value-objects/" docs/ steps/
```

### Сценарий: Переименование файла

```bash
# 1. Найти все упоминания
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/ steps/

# 2. Обновить все найденные файлы
# 3. Заменить тег на новый путь
```

### Комбинация тегов:

Один файл может иметь несколько тегов:
```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`**
`#file:domain/resource/value-objects/ResourceId.ts` `#value-object-resourceid` `#value-object`
```

**Использование:**
- Рефакторинг файла → `#file:*`
- Рефакторинг концепции → `#value-object-resourceid`
- Поиск всех Value Objects → `#value-object`

**Детали:** См. `.docs-meta/FILE_PATH_TAGS.md`

---

## 14. 🔄 СЛЕДУЮЩИЕ ШАГИ

1. **Добавить теги в существующие файлы:**
   - [ ] `docs/PROJECT_STRUCTURE.md`
   - [ ] `docs/TYPES_AND_ENTITIES.md`
   - [ ] `docs/DDD_AND_CLEAN_ARCHITECTURE.md`
   - [ ] `steps/step_1/README.md`

2. **Создать индекс тегов:**
   - [ ] Полный список всех тегов
   - [ ] Карта связей между тегами
   - [ ] Примеры использования

3. **Автоматизация:**
   - [ ] Скрипт для поиска по тегам
   - [ ] Валидация согласованности тегов
   - [ ] Генерация отчетов по тегам

---

**Создано**: 2025-01-19  
**Версия**: 1.0  
**Статус**: В разработке
