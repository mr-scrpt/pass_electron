# План миграции на систему тегов v2.0

## 🔴 Проблема

Текущая реализация тегов **НЕПРАВИЛЬНАЯ**:
- ❌ Теги на каждой строке кода
- ❌ Избыточность и шум
- ❌ Не помогает навигации, а мешает

**Пример неправильного:**
```typescript
import { Resource } from '@/domain'  #structure:
import { queries } from '@/composition'  #structure:
import { ResourceList } from '@/components/ResourceList'  #structure:
```

**Должно быть:**
```markdown
### Примеры импортов [#structure:path|#code]

\`\`\`typescript
import { Resource } from '@/domain'
import { queries } from '@/composition'
import { ResourceList } from '@/components/ResourceList'
\`\`\`
```

---

## ✅ Новая система (v2.0)

### Типы тегов:

**Формат:** `[#тег1|тег2]` - в квадратных скобках, через пайп

1. **Структура:**
   - `#structure:tree` - дерево структуры
   - `#structure:path` - пути в коде
   - `#structure:alias` - алиасы

2. **Код:**
   - `#code` - TypeScript/JavaScript
   - `#config` - JSON/YAML/конфиги
   - `#command` - bash команды

3. **Сущности:**
   - `#class:ClassName` - классы
   - `#interface:InterfaceName` - интерфейсы
   - `#api:METHOD-endpoint` - API

### Правила:
- ✅ Формат: `[#тег1|тег2]` в квадратных скобках
- ✅ Теги в заголовках секций
- ✅ Один набор тегов на блок, не на строку
- ✅ Комбинации: `[#structure:path|#code]`
- ✅ Специфичные теги: `[#class:ResourceId|#code]`

---

## 📊 Статистика текущей проблемы

### Всего файлов документации: 33

**Обработано НЕПРАВИЛЬНО (15 файлов):**

**Этап 1-3 (12 файлов):**
- docs/DDD_AND_CLEAN_ARCHITECTURE.md
- docs/COMPOSITION_LAYER.md
- docs/TYPES_AND_ENTITIES.md
- docs/COMMAND_BUS.md
- docs/QUERY_HANDLERS.md
- docs/DATA_FLOW.md
- docs/ARCHITECTURE_BOUNDARIES.md
- docs/error-handling/ERROR_HANDLING.md
- docs/error-handling/INVARIANTS.md
- docs/error-handling/ERROR_ESCALATION.md
- docs/GETTING_STARTED.md
- docs/concepts/IMPLEMENT_CONCEPT_OUTER.md

**Этап 4 (3 файла):**
- steps/step_0/README.md
- steps/step_0/TYPESCRIPT_VITE_CONFIG.md
- steps/step_1/README.md

**НЕ обработаны (18 файлов):**
- docs/ADAPTER_PATTERN_DI.md
- docs/concepts/ARCHITECTURE_DESIGN.md
- docs/concepts/THEORETICAL_CONCEPT.md
- docs/contracts/* (6 файлов)
- docs/electron/README.md
- docs/error-handling/ERROR_ESCALATION_EXTENDED.md
- docs/error-handling/README.md
- docs/PROJECT_STRUCTURE.md
- docs/README.md
- docs/ui/CATPPUCCIN_MOCHA.md
- steps/step_0/ESLINT_SETUP.md
- steps/step_0/PACKAGE_JSON_SETUP.md
- steps/step_0/TAILWIND_SETUP.md

**Проблемы:**
- ~370+ тегов `#structure:` на строках кода (в 15 файлах)
- Нет тегов `#code`, `#config`, `#command` нигде
- Нет специфичных тегов (`#class:`, `#interface:`) нигде
- 18 файлов вообще без тегов

---

## 🔧 План исправления

### Вариант 1: Полная переработка (рекомендуется)

**Шаги:**
1. Удалить все неправильные теги `#structure:` из строк кода (15 файлов)
2. Добавить правильные теги в заголовки всех секций (33 файла)
3. Добавить теги `#code`, `#config`, `#command` (33 файла)
4. Добавить специфичные теги `#class:`, `#interface:` (33 файла)

**Время:** 15-20 часов (для всех 33 файлов)

**Разбивка:**
- Очистка 15 файлов от неправильных тегов: 3-4 часа
- Добавление правильных тегов в 33 файла: 12-16 часов

**Результат:**
- ✅ Чистая документация (33 файла)
- ✅ Правильная навигация
- ✅ Полная система тегов

### Вариант 2: Постепенная миграция

**Шаги:**
1. Оставить текущие теги как есть
2. Добавлять новые теги по мере работы
3. Постепенно удалять старые

**Время:** Растянуто во времени

**Результат:**
- ⚠️ Смешанная система
- ⚠️ Путаница

### Вариант 3: Откат и начать заново

**Шаги:**
1. Откатить все коммиты с тегами
2. Начать с правильной системы
3. Обработать все 33 файла по новым правилам

**Время:** 18-22 часа (все 33 файла с нуля)

**Результат:**
- ✅ Чистая история
- ✅ Правильная система с начала
- ✅ Все 33 файла обработаны

---

## 🎯 Рекомендация: Вариант 1

**Почему:**
- Сохраняем историю коммитов
- Исправляем ошибки
- Получаем правильную систему

**Порядок работы:**

### Этап 1: Очистка (2-3 часа)
Удалить все `#structure:` из строк кода:
```bash
# Найти все файлы с проблемой
grep -rl "#structure:" docs/ steps/ | grep -v ".docs-meta"

# Для каждого файла удалить теги из строк кода
# (оставить только в заголовках)
```

### Этап 2: Добавление правильных тегов (4-5 часов)

**Приоритет 1: Структура**
- Добавить `[#structure:tree]` к деревьям
- Добавить `[#structure:path|#code]` к примерам с путями
- Добавить `[#structure:alias|#config]` к конфигам алиасов

**Приоритет 2: Код**
- Добавить `[#code]` к TypeScript примерам
- Добавить `[#config]` к JSON/YAML
- Добавить `[#command]` к bash командам

**Приоритет 3: Сущности**
- Добавить `[#class:ClassName|#code]` к классам
- Добавить `[#interface:InterfaceName|#code]` к интерфейсам
- Добавить `[#api:METHOD-endpoint]` к API

### Этап 3: Проверка (1-2 часа)
- Проверить консистентность
- Протестировать поиск
- Обновить документацию

---

## 📝 Примеры исправлений

### До (неправильно):
```markdown
### Примеры импортов

\`\`\`typescript
// src/presentation/web/react/src/routes/_index.tsx
import { Resource } from '@/domain'  #structure:
import { queries } from '@/composition'  #structure:
\`\`\`
```

### После (правильно):
```markdown
### Примеры импортов [#structure:path|#code]

\`\`\`typescript
// src/presentation/web/react/src/routes/_index.tsx
import { Resource } from '@/domain'
import { queries } from '@/composition'
\`\`\`
```

---

### До (неправильно):
```markdown
**Файл: `src/domain/resource/value-objects/ResourceId.ts`**  `#structure:`

\`\`\`typescript
export class ResourceId {
  // ...
}
\`\`\`
```

### После (правильно):
```markdown
### ResourceId Value Object [#class:ResourceId|#code|#structure:path]

**Файл:** `src/domain/resource/value-objects/ResourceId.ts`

\`\`\`typescript
export class ResourceId {
  // ...
}
\`\`\`
```

---

## 🚀 Следующие шаги

1. **Согласовать** план с пользователем
2. **Выбрать** вариант исправления
3. **Начать** миграцию
4. **Обновить** `.windsurf/rules/tags.md` (вручную пользователем)

---

**Дата создания**: 2025-10-19  
**Статус**: Ожидает решения
