# Система тегов v2.0 - Правильная концепция

## 🎯 Главный принцип

**Теги = флаги для блоков, а не для строк!**

**Формат:** `[#тег1|#тег2|#тег3]` - в квадратных скобках, через пайп

Тег ставится:
- В заголовке секции
- В описании блока кода
- Перед деревом структуры

**НЕ ставится на каждую строку внутри блока!**

---

## ✅ Правила обработки

1. ✅ **Теги ТОЛЬКО в заголовках** (### или ####)
2. ✅ **Каждый блок кода должен иметь подзаголовок**
3. ✅ **Несколько сущностей в одном блоке** → все теги через `|`
4. ❌ **НЕ ставить теги `#class:` и `#interface:` на экспортах**
5. ✅ **Экспорты помечаются только** `[#code|#structure:path]`
6. ✅ **API endpoints:** используем общий тег `#api:routes` вместо перечисления каждого
7. ✅ **Спецификации типов** (деревья структур): используем `#contract:name`
8. ✅ **Примеры vs Реальные файлы:**
   - **Примеры/абстракции** → только `[#code]`, БЕЗ тегов `#class:` или `#interface:`
   - **Реальные файлы** → `[#class:Name|#code|#structure:path]` + путь в комментарии
   - Путь в комментарии должен быть согласован с `docs/PROJECT_STRUCTURE.md`

---

## 📋 Типы тегов

### 1. Теги структуры

#### `#structure:tree`
Полное дерево структуры или его значительная часть

**Пример:**
```markdown
## Структура Domain Layer [#structure:tree]

\`\`\`
src/domain/
├── resource/
│   ├── aggregates/
│   ├── value-objects/
│   └── repositories/
└── shared/
    ├── errors/
    └── invariants/
\`\`\`
```

#### `#structure:path`
Упоминание путей к файлам/директориям в коде

**Пример:**
```markdown
### Примеры импортов [#structure:path|#code]

\`\`\`typescript
// src/presentation/web/react/src/routes/_index.tsx
import { Resource } from '@/domain'
import { queries } from '@/composition'
\`\`\`
```

#### `#structure:alias`
Алиасы и правила импортов

**Пример:**
```markdown
## TypeScript Paths [#structure:alias|#config]

\`\`\`json
{
  "paths": {
    "@/domain": ["./src/domain/index.ts"],
    "@/composition": ["./src/composition/index.ts"]
  }
}
\`\`\`
```

---

### 2. Теги кода

#### `#code`
Блок с примером кода (TypeScript, JavaScript)

**Пример:**
```markdown
### Value Object пример [#code|#class:ResourceId]

\`\`\`typescript
export class ResourceId {
  private constructor(private readonly _value: string) {}
  static create(value: string): Result<ResourceId, Error>
}
\`\`\`
```

#### `#config`
Блок с конфигурацией (JSON, YAML, etc.)

**Пример:**
```markdown
### Vite конфигурация [#config]

\`\`\`typescript
export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()]
})
\`\`\`
```

#### `#command`
Блок с командами терминала

**Пример:**
```markdown
### Установка зависимостей [#command]

\`\`\`bash
pnpm add neverthrow
pnpm add -D typescript
\`\`\`
```

---

### 3. Теги сущностей

#### `#class:`
Определение или использование класса

**Пример:**
```markdown
### ResourceId Value Object [#class:ResourceId|#code|#structure:path]

\`\`\`typescript
export class ResourceId {
  // ...
}
\`\`\`
```

#### `#interface:`
Определение или использование интерфейса

**Пример:**
```markdown
### Repository Interface [#interface:IResourceRepository|#code]

\`\`\`typescript
export interface IResourceRepository {
  findById(id: ResourceId): Promise<Resource | null>
}
\`\`\`
```

#### `#api:`
API endpoint

**Пример:**
```markdown
### GET /api/resources [#api:GET-resources]

Возвращает список всех ресурсов
```

---

### 4. Теги диаграмм

#### `#diagram:architecture`
Архитектурные схемы слоев (Hexagonal, Clean Architecture, Ports & Adapters)

**Пример:**
```markdown
## Hexagonal Architecture - Ports & Adapters [#diagram:architecture]

\`\`\`
┌─────────────────────────────────────────┐
│     Application Core                    │
│  ┌────────────────────────────────┐     │
│  │  ICommandBus (Port)            │←────┼───
│  └────────────────────────────────┘     │
└──────────────┬──────────────────────────┘
               │ implements
┌──────────────▼──────────────────────────┐
│     Infrastructure                       │
\`\`\`
```

#### `#diagram:flow`
Потоки данных между компонентами и слоями

**Пример:**
```markdown
## Поток данных CQRS [#diagram:flow]

\`\`\`
┌─────────────────────────────────────────────────┐
│  Presentation Layer (Route Handler)              │
└────────────┬────────────────────────────────────┘
             ↓
┌────────────┴────────────────────────────────────┐
│  Composition Layer (Facades)                     │
└────────────┬────────────────────────────────────┘
             ↓
┌────────────┴────────────────────────────────────┐
│  Application Layer (Query/Command Handlers)      │
\`\`\`
```

#### `#diagram:sequence`
Последовательности вызовов (шаги выполнения)

**Пример:**
```markdown
## GET Request - последовательность [#diagram:sequence]

\`\`\`
1. Browser → GET /
   ↓
2. Remix вызывает loader() ← СЕРВЕР
   ↓
3. loader() → queries.list()
   ↓
4. Query Handler → Repository
   ↓
5. Return DTO → Browser
\`\`\`
```

---

## ✅ Правильные примеры

### Пример 1: Дерево структуры

```markdown
## Domain Layer структура [#structure:tree]

\`\`\`
src/domain/
├── resource/
│   ├── aggregates/
│   │   └── Resource.ts
│   └── value-objects/
│       ├── ResourceId.ts
│       └── ResourceName.ts
└── shared/
    └── errors/
        └── DomainError.ts
\`\`\`
```

### Пример 2: Код с путями

```markdown
### Примеры импортов в Presentation [#structure:path|#code]

\`\`\`typescript
// src/presentation/web/react/src/routes/_index.tsx
import { Resource } from '@/domain'
import { queries } from '@/composition'
import { ResourceList } from '@/components/ResourceList'
\`\`\`
```

### Пример 3: Примеры vs Реальные файлы

**❌ НЕПРАВИЛЬНО - пример помечен как реальный файл:**
```markdown
### UI Commands [#class:DeleteResourceCommand|#code]

\`\`\`typescript
class DeleteResourceCommand implements ICommand {
  readonly type = 'DeleteResourceCommand';
  constructor(public readonly resourceId: string) {}
}
\`\`\`
```

**✅ ПРАВИЛЬНО - пример без тегов класса:**
```markdown
### UI Commands [#code]

\`\`\`typescript
/**
 * Команда: Удалить ресурс
 */
class DeleteResourceCommand implements ICommand {
  readonly type = 'DeleteResourceCommand';
  constructor(public readonly resourceId: string) {}
}
\`\`\`
```

**✅ ПРАВИЛЬНО - реальный файл с путем:**
```markdown
### ResourceId Value Object [#class:ResourceId|#code|#structure:path]

\`\`\`typescript
// src/domain/resource/value-objects/ResourceId.ts
export class ResourceId {
  private constructor(private readonly _value: string) {}
  static create(value: string): Result<ResourceId, InvariantViolationError>
}
\`\`\`
```

### Пример 3: Класс

```markdown
### ResourceId Value Object [#class:ResourceId|#code]

\`\`\`typescript
export class ResourceId {
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Result<ResourceId, InvariantViolationError> {
    return UuidInvariant.validate(value, 'ResourceId')
      .map(validValue => new ResourceId(validValue))
  }
  
  getValue(): string {
    return this._value
  }
}
\`\`\`
```

### Пример 4: Конфигурация

```markdown
### TypeScript paths [#structure:alias|#config]

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/domain": ["./src/domain/index.ts"],
      "@/composition": ["./src/composition/index.ts"]
    }
  }
}
\`\`\`
```

### Пример 5: Команды

```markdown
### Установка neverthrow [#command]

\`\`\`bash
pnpm add neverthrow
\`\`\`
```

---

## ❌ Неправильные примеры

### ❌ НЕ ДЕЛАТЬ: Теги на каждой строке

```markdown
### Примеры импортов

\`\`\`typescript
import { Resource } from '@/domain'  #structure:
import { queries } from '@/composition'  #structure:
import { ResourceList } from '@/components/ResourceList'  #structure:
\`\`\`
```

**Проблема:** Избыточность, теги на каждой строке

**Правильно:**
```markdown
### Примеры импортов [#structure:path|#code]

\`\`\`typescript
import { Resource } from '@/domain'
import { queries } from '@/composition'
import { ResourceList } from '@/components/ResourceList'
\`\`\`
```

---

## 🔍 Как использовать теги

### Сценарий 1: Изменение структуры проекта

**Задача:** Переименовать `src/domain/` в `src/core/domain/`

**Действия:**
1. Найти все блоки: `grep -r "#structure:" docs/ steps/`
2. Проверить каждый блок с тегом
3. Обновить пути в примерах кода
4. Обновить деревья структуры

### Сценарий 2: Изменение класса

**Задача:** Изменить API класса `ResourceId`

**Действия:**
1. Найти все упоминания: `grep -r "#class:ResourceId" docs/ steps/`
2. Проверить примеры кода
3. Обновить сигнатуры методов
4. Проверить согласованность

### Сценарий 3: Изменение алиасов

**Задача:** Изменить `@/domain` на `@domain`

**Действия:**
1. Найти все блоки: `grep -r "#structure:alias" docs/ steps/`
2. Обновить конфигурации
3. Найти примеры: `grep -r "#structure:path" docs/ steps/`
4. Обновить импорты в примерах

---

## 📊 Комбинации тегов

Теги можно комбинировать для точности:

| Комбинация | Значение |
|------------|----------|
| `[#structure:tree]` | Дерево структуры |
| `[#structure:path\|#code]` | Код с путями к файлам |
| `[#structure:alias\|#config]` | Конфигурация алиасов |
| `[#class:ResourceId\|#code]` | Код класса ResourceId |
| `[#interface:IRepository\|#code]` | Код интерфейса |
| `[#api:GET-resources]` | API endpoint GET |
| `[#command]` | Команды терминала |
| `[#diagram:architecture]` | Архитектурная схема |
| `[#diagram:flow]` | Диаграмма потока данных |
| `[#diagram:sequence]` | Последовательность вызовов |

---

## 🎯 Правила

1. **Формат** - `[#тег1|#тег2]` в квадратных скобках, через пайп
2. **Один набор тегов на блок** - не дублировать на каждую строку
3. **Теги в заголовках** - после заголовка, перед блоком кода
4. **Каждый блок кода должен иметь заголовок** - если несколько блоков идут подряд, создавай подзаголовки (#### Пример 1, #### Пример 2) с осмысленными названиями
5. **Несколько сущностей в одном блоке** - все теги через пайп: `[#class:ResourceId|#class:CustomField|#code]`
6. **Комбинируй теги** - для точности `[#structure:path|#code]`
7. **Специфичные теги** - `#class:ResourceId` лучше чем просто `#class`
8. **Консистентность** - один стиль во всей документации
9. **Примеры vs Реализация**:
   - **Реализация** (конкретные файлы проекта) → `[#class:Name|#code|#structure:path]`
   - **Best Practices / Примеры** (абстрактные паттерны) → `[#code]`
   - **Антипаттерны** (что НЕ делать) → `[#code]`

---

## 📝 Обновление .windsurf/rules/tags.md

Нужно обновить файл правил (вручную пользователем):

```markdown
Наша документация размечена системой тегов для быстрой навигации и консистентности.

**Формат:** [#тег1|#тег2|#тег3] - в квадратных скобках, через пайп

**Типы тегов:**

Структура:
- #structure:tree - полное дерево структуры
- #structure:path - пути к файлам в коде
- #structure:alias - алиасы и импорты

Код:
- #code - блок кода (TypeScript/JavaScript)
- #config - блок конфигурации (JSON/YAML)
- #command - команды терминала

Сущности:
- #class:ClassName - определение/использование класса
- #interface:InterfaceName - определение/использование интерфейса
- #api:METHOD-endpoint - API endpoint

Диаграммы:
- #diagram:architecture - архитектурные схемы слоев
- #diagram:flow - потоки данных между компонентами
- #diagram:sequence - последовательности вызовов

**Правила:**
- Теги ставятся на блок, НЕ на каждую строку
- Комбинируй теги: [#structure:path|#code]
- Используй специфичные теги: [#class:ResourceId|#code]
```

---

**Дата создания**: 2025-10-19  
**Версия**: 2.0  
**Статус**: Требует внедрения
