# Быстрая справка по тегам v2.0

## 📌 Формат

```markdown
### Заголовок секции [#тег1|#тег2|#тег3]

Описание блока...

\`\`\`typescript
// код без тегов на строках
\`\`\`
```

**Ключевое правило:** Теги в квадратных скобках `[#тег1|#тег2]`, через пайп `|`

---

## 🏷️ Типы тегов

### Структура
```markdown
## Дерево структуры [#structure:tree]
### Примеры импортов [#structure:path|#code]
### TypeScript paths [#structure:alias|#config]
```

### Код
```markdown
### Value Object [#code|#class:ResourceId]
### Vite config [#config]
### Установка [#command]
```

### Сущности
```markdown
### ResourceId [#class:ResourceId|#code]
### IRepository [#interface:IResourceRepository|#code]
### GET /api/resources [#api:GET-resources]
```

---

## 🔍 Поиск

```bash
# Найти все деревья структуры
grep -r "\[#structure:tree\]" docs/ steps/

# Найти все примеры с путями
grep -r "#structure:path" docs/ steps/

# Найти конкретный класс
grep -r "#class:ResourceId" docs/ steps/

# Найти все интерфейсы
grep -r "#interface:" docs/ steps/

# Найти все команды
grep -r "\[#command\]" docs/ steps/
```

---

## ✅ Правильные примеры

### Дерево структуры
```markdown
## Domain Layer [#structure:tree]

\`\`\`
src/domain/
├── resource/
│   ├── aggregates/
│   └── value-objects/
└── shared/
\`\`\`
```

### Код с путями
```markdown
### Примеры импортов [#structure:path|#code]

\`\`\`typescript
// src/presentation/web/react/src/routes/_index.tsx
import { Resource } from '@/domain'
import { queries } from '@/composition'
\`\`\`
```

### Класс
```markdown
### ResourceId Value Object [#class:ResourceId|#code]

**Файл:** `src/domain/resource/value-objects/ResourceId.ts`

\`\`\`typescript
export class ResourceId {
  private constructor(private readonly _value: string) {}
  static create(value: string): Result<ResourceId, Error>
}
\`\`\`
```

### Конфигурация
```markdown
### TypeScript paths [#structure:alias|#config]

\`\`\`json
{
  "paths": {
    "@/domain": ["./src/domain/index.ts"]
  }
}
\`\`\`
```

### Команды
```markdown
### Установка neverthrow [#command]

\`\`\`bash
pnpm add neverthrow
\`\`\`
```

---

## ❌ Неправильно

```markdown
### Примеры импортов

\`\`\`typescript
import { Resource } from '@/domain'  #structure:  ❌
import { queries } from '@/composition'  #structure:  ❌
\`\`\`
```

**Проблема:** Теги на каждой строке

**Правильно:**
```markdown
### Примеры импортов [#structure:path|#code]

\`\`\`typescript
import { Resource } from '@/domain'
import { queries } from '@/composition'
\`\`\`
```

---

## 🎯 Когда использовать

| Ситуация | Теги |
|----------|------|
| Дерево директорий | `[#structure:tree]` |
| Код с импортами/путями | `[#structure:path\|#code]` |
| Конфиг с алиасами | `[#structure:alias\|#config]` |
| Определение класса | `[#class:ClassName\|#code]` |
| Определение интерфейса | `[#interface:IName\|#code]` |
| API endpoint | `[#api:METHOD-endpoint]` |
| Bash команды | `[#command]` |
| Просто код | `[#code]` |
| Просто конфиг | `[#config]` |

---

## 📚 Полная документация

- `.docs-meta/TAG_SYSTEM_V2.md` - полное описание системы
- `.docs-meta/TAG_SYSTEM_MIGRATION_PLAN.md` - план миграции

---

**Версия:** 2.0  
**Дата:** 2025-10-19
