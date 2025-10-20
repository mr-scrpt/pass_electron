# Связи между тегами - Руководство по рефакторингу

**Цель:** При изменении одного тега знать, какие другие теги нужно проверить.

---

## Правила связей

### 1. При изменении имени (class/interface)

**Если меняешь:** `#class:Resource` или `#interface:IResourceRepository`

**Проверь также:**
- `#structure:tree` - деревья структуры (имена файлов)
- `#structure:path` - пути в примерах кода (импорты, комментарии)

**Пример:**
```bash
# Меняем Resource → ResourceAggregate

# 1. Найти все определения
grep -r "#class:Resource" docs/ steps/

# 2. Проверить деревья структуры
grep -r "#structure:tree" docs/ steps/ | grep -i "resource\.ts"

# 3. Проверить пути в коде
grep -r "#structure:path" docs/ steps/ | grep -i "resource"
```

---

### 2. При изменении структуры директорий

**Если меняешь:** `#structure:tree` (перемещение/переименование директорий)

**Проверь также:**
- `#structure:path` - пути в примерах кода
- `#alias:` - алиасы импортов (если меняется корневая директория)

**Пример:**
```bash
# Меняем domain/resource/ → domain/resources/

# 1. Найти все деревья
grep -r "#structure:tree" docs/ steps/ | grep "domain/resource"

# 2. Проверить пути
grep -r "#structure:path" docs/ steps/ | grep "domain/resource"

# 3. Проверить алиасы (если нужно)
grep -r "#alias:" docs/ steps/
```

---

### 3. При изменении API endpoints

**Правило:** Используем общий тег `#api:routes` для блоков с несколькими endpoints, а не перечисляем каждый.

**Если меняешь:** API routes (добавление/удаление/изменение)

**Проверь также:**
- `#api:routes` - блоки с перечислением всех endpoints
- `#structure:path` - примеры вызовов API в коде
- `#code` - блоки с примерами fetch/axios
- `#interface:` - Repository интерфейсы (могут использовать эти endpoints)

**Пример:**
```bash
# Меняем /api/resources → /api/v1/resources

# 1. Найти все блоки с API routes
grep -r "#api:routes" docs/ steps/

# 2. Проверить примеры кода
grep -r "api/resources" docs/ steps/

# 3. Проверить Repository интерфейсы
grep -r "#interface:.*Repository" docs/ steps/
```

---

### 4. При изменении команды

**Если меняешь:** `#command:pnpm-dev`

**Проверь также:**
- `#code` - блоки с bash командами
- `#structure:path` - упоминания в путях к скриптам

**Пример:**
```bash
# Меняем pnpm dev → pnpm start

# 1. Найти все команды
grep -r "#command:pnpm" docs/ steps/

# 2. Проверить блоки кода
grep -r "pnpm dev" docs/ steps/
```

---

### 5. При изменении алиаса

**Если меняешь:** `#alias:@/`

**Проверь также:**
- `#structure:path` - все примеры импортов
- `#code` - блоки с TypeScript кодом

**Пример:**
```bash
# Меняем @/ → ~/

# 1. Найти все алиасы
grep -r "#alias:@/" docs/ steps/

# 2. Проверить все импорты
grep -r "#structure:path.*@/" docs/ steps/
```

---

## Таблица связей

| Изменяемый тег | Связанные теги | Что проверять |
|----------------|----------------|---------------|
| `#class:Name` | `#structure:tree`, `#structure:path` | Имена файлов, импорты |
| `#interface:Name` | `#structure:tree`, `#structure:path` | Имена файлов, импорты |
| `#structure:tree` | `#structure:path`, `#alias:` | Пути в коде, алиасы |
| `#api:routes` | `#structure:path`, `#code`, `#interface:*Repository` | Примеры вызовов, Repository |
| `#command:name` | `#code` | Блоки команд |
| `#alias:prefix` | `#structure:path`, `#code` | Импорты, примеры |
| `#config` | `#structure:path` | Файлы конфигурации |

---

## Универсальная команда рефакторинга

При любом изменении используй эту последовательность:

```bash
# 1. Найти основной тег
grep -r "#ТИП:ИМЯ" docs/ steps/

# 2. Найти связанные структуры
grep -r "#structure:tree\|#structure:path" docs/ steps/ | grep -i "ИМЯ"

# 3. Найти в коде (без тегов)
grep -ri "ИМЯ" docs/ steps/
```

**Пример для Resource:**
```bash
# 1. Основной тег
grep -r "#class:Resource" docs/ steps/

# 2. Структуры
grep -r "#structure:tree\|#structure:path" docs/ steps/ | grep -i "resource"

# 3. В коде
grep -ri "Resource\.ts\|export.*Resource\|import.*Resource" docs/ steps/
```

---

## Чек-лист рефакторинга

При изменении сущности:

- [ ] Найти все упоминания основного тега
- [ ] Проверить связанные теги (см. таблицу выше)
- [ ] Обновить все найденные места
- [ ] Заменить теги на новые значения
- [ ] Проверить grep без тегов (на случай пропусков)

---

## Примеры полного рефакторинга

### Пример 1: Переименование класса

**Задача:** `Resource` → `ResourceAggregate`

```bash
# Шаг 1: Найти все теги
grep -r "#class:Resource" docs/ steps/
# → Обновить на #class:ResourceAggregate

# Шаг 2: Найти в структурах
grep -r "#structure:tree\|#structure:path" docs/ steps/ | grep -i "resource\.ts"
# → Обновить Resource.ts → ResourceAggregate.ts

# Шаг 3: Найти экспорты/импорты
grep -ri "export.*Resource\|import.*Resource" docs/ steps/
# → Обновить вручную

# Шаг 4: Проверка
grep -ri "Resource[^A-Z]" docs/ steps/
# → Убедиться что не осталось старых упоминаний
```

### Пример 2: Перемещение директории

**Задача:** `domain/resource/` → `domain/resources/`

```bash
# Шаг 1: Найти деревья
grep -r "#structure:tree" docs/ steps/ | grep "domain/resource/"
# → Обновить пути в деревьях

# Шаг 2: Найти пути в коде
grep -r "#structure:path" docs/ steps/ | grep "domain/resource"
# → Обновить импорты

# Шаг 3: Проверить алиасы
grep -r "#alias:" docs/ steps/
# → Проверить нужно ли обновить

# Шаг 4: Проверка
grep -ri "domain/resource[^s]" docs/ steps/
# → Убедиться что все обновлено
```

### Пример 3: Изменение API

**Задача:** `/api/resources` → `/api/v1/resources`

```bash
# Шаг 1: Найти блоки с API routes
grep -r "#api:routes" docs/ steps/
# → Обновить все endpoints в блоках

# Шаг 2: Найти Repository интерфейсы
grep -r "#interface:.*Repository" docs/ steps/
# → Проверить не используют ли они эти endpoints

# Шаг 3: Найти примеры в коде
grep -ri "api/resources" docs/ steps/
# → Обновить все упоминания

# Шаг 4: Проверить Infrastructure слой
grep -ri "ApiResourceRepository\|HttpClient" docs/ steps/
# → Обновить примеры реализации
```

---

## Автоматизация (будущее)

Можно создать скрипт `.docs-meta/refactor.sh`:

```bash
#!/bin/bash
# Использование: ./refactor.sh class Resource ResourceAggregate

TYPE=$1  # class, interface, api, etc.
OLD=$2
NEW=$3

echo "🔍 Поиск #${TYPE}:${OLD}..."
grep -r "#${TYPE}:${OLD}" docs/ steps/

echo "🔍 Поиск в структурах..."
grep -r "#structure:tree\|#structure:path" docs/ steps/ | grep -i "${OLD}"

echo "🔍 Поиск в коде..."
grep -ri "${OLD}" docs/ steps/

echo "✅ Готово! Проверь результаты и обнови вручную."
```

---

**Дата создания:** 2025-10-19  
**Версия:** 1.0  
**Статус:** Активный
