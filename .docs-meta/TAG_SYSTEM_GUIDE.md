# Руководство по системе тегов проекта

**Дата**: 2025-01-19  
**Версия**: 1.0

## 🎯 Назначение

Система тегов позволяет быстро находить и обновлять связанные сущности при рефакторинге.

## 📋 Основные категории тегов

### 1. Архитектурные слои
- `#layer-domain`
- `#layer-application`
- `#layer-infrastructure`
- `#layer-composition`
- `#layer-presentation`

### 2. DDD паттерны
- `#aggregate-root`
- `#entity`
- `#value-object`
- `#repository-interface`
- `#domain-event`
- `#bounded-context`
- `#shared-kernel`

### 3. Структура
- `#domain-structure`
- `#public-api`
- `#import-rule-local`
- `#import-rule-public-api`
- `#import-rule-forbidden`

### 4. Конкретные сущности
- `#value-object-resourceid`
- `#value-object-namespace`
- `#value-object-resourcename`
- `#aggregate-resource`
- `#entity-customfield`
- `#repository-resource`
- `#dto-resource-list`

### 5. Пути к файлам (NEW!)
- `#file:domain/resource/value-objects/ResourceId.ts`
- `#file:domain/resource/aggregates/Resource.ts`
- `#file:domain/shared/errors/InvariantViolationError.ts`
- `#file:application/queries/dtos/ResourceListItemDTO.ts`

**Формат:** `#file:{относительный_путь_от_src}`

## 🔍 Команды поиска

```bash
# Найти все упоминания Domain Layer
grep -r "#layer-domain" docs/ steps/

# Найти все Value Objects
grep -r "#value-object" docs/ steps/

# Найти конкретный Value Object
grep -r "#value-object-resourceid" docs/ steps/

# Найти все правила импортов
grep -r "#import-rule" docs/

# Найти все упоминания конкретного файла (NEW!)
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/ steps/

# Найти все файлы в директории (NEW!)
grep -r "#file:domain/resource/value-objects/" docs/ steps/
```

## 📝 Использование

### При рефакторинге концепции:
1. Найти все упоминания: `grep -r "#value-object-resourceid"`
2. Обновить все найденные файлы
3. Проверить согласованность

### При переименовании файла (NEW!):
1. Найти все упоминания: `grep -r "#file:domain/resource/value-objects/ResourceId.ts"`
2. Обновить пути в найденных файлах
3. Заменить тег на новый путь

### При изменении структуры:
1. Найти: `grep -r "#domain-structure"`
2. Обновить все файлы с тегом
3. Обновить примеры кода

## 🎯 Разница между тегами

| Тип тега | Что находит | Когда использовать |
|----------|-------------|-------------------|
| `#value-object-resourceid` | Концепцию ResourceId | Изменение логики Value Object |
| `#file:domain/resource/value-objects/ResourceId.ts` | Конкретный файл | Переименование/перемещение файла |
| `#import-rule-public-api` | Правила импортов | Изменение архитектурных правил |

**Оба типа тегов нужны!** Они решают разные задачи.

## 📚 Полная документация

- `.docs-meta/CONSISTENCY_AUDIT.md` - Полный аудит с системой тегов
- `.docs-meta/FILE_PATH_TAGS.md` - Детальное описание тегов для файлов
