# TODO: Исправить формат тегов #structure:

## ⚠️ Проблема

В 12 файлах теги добавлены в **неправильном формате**: `#structure:path/to/module/`

Правильный формат: просто `#structure:` (без пути)

---

## 📝 Файлы требующие исправления

### Этап 1: Приоритетные файлы (3 файла)
```bash
docs/DDD_AND_CLEAN_ARCHITECTURE.md
docs/COMPOSITION_LAYER.md
docs/TYPES_AND_ENTITIES.md
```

### Этап 2: Документация по слоям (4 файла)
```bash
docs/COMMAND_BUS.md
docs/QUERY_HANDLERS.md
docs/DATA_FLOW.md
docs/ARCHITECTURE_BOUNDARIES.md
```

### Этап 3: Error Handling (3 файла)
```bash
docs/error-handling/ERROR_HANDLING.md
docs/error-handling/INVARIANTS.md
docs/error-handling/ERROR_ESCALATION.md
```

### Этап 4: Основные файлы (2 файла)
```bash
docs/GETTING_STARTED.md
docs/concepts/IMPLEMENT_CONCEPT_OUTER.md
```

---

## 🔧 Как исправить

### Вариант 1: Через sed (автоматически)

```bash
# Для каждого файла:
sed -i 's/#structure:[^ ]*/#structure:/g' docs/DDD_AND_CLEAN_ARCHITECTURE.md
sed -i 's/#structure:[^ ]*/#structure:/g' docs/COMPOSITION_LAYER.md
# ... и так далее для всех 12 файлов
```

### Вариант 2: Через find + sed (все файлы сразу)

```bash
# Найти и заменить во всех файлах
find docs/ -name "*.md" -type f -exec sed -i 's/#structure:[^ ]*/#structure:/g' {} +
```

### Вариант 3: Вручную через редактор

1. Открыть файл
2. Find & Replace (Regex)
3. Найти: `#structure:[^ ]*`
4. Заменить на: `#structure:`

---

## ✅ Проверка после исправления

```bash
# Убедиться что не осталось тегов с путями:
grep -r "#structure:[^:]" docs/ steps/

# Если команда ничего не вернула - всё исправлено!
```

---

## 📊 Прогресс

- [ ] Этап 1: 3 файла
- [ ] Этап 2: 4 файла  
- [ ] Этап 3: 3 файла
- [ ] Этап 4: 2 файла

**Всего: 12 файлов**

---

**Создано**: 2025-10-19  
**Статус**: Ожидает исправления
