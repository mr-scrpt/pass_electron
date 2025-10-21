# Аудит упоминаний neverthrow в документации

**Дата:** 2025-10-21  
**Цель:** Найти все упоминания neverthrow для замены на @sweet-monads/either

---

## 📊 Сводка

**Всего файлов с упоминаниями neverthrow:** 10

### ✅ Обновлено (4 файла)
1. ✅ `docs/error-handling/ERROR_ESCALATION.md`
2. ✅ `docs/error-handling/ERROR_ESCALATION_EXTENDED.md`
3. ✅ `docs/error-handling/INVARIANTS.md`
4. ✅ `docs/error-handling/ERROR_HANDLING.md` (~95%)

### ⏹️ Требуют обновления (6 файлов)

#### Основная документация (3 файла)
1. ⏹️ `docs/README.md` - 1 упоминание (описание)
2. ⏹️ `docs/TYPES_AND_ENTITIES.md` - 2 упоминания (импорты)
3. ⏹️ `docs/DDD_AND_CLEAN_ARCHITECTURE.md` - 2 упоминания (импорты)

#### Error handling (2 файла)
4. ⏹️ `docs/error-handling/README.md` - 4 упоминания (описания)
5. ⏹️ `docs/error-handling/ERROR_HANDLING.md` - 4 упоминания (остатки в примерах)

#### Steps (3 файла)
6. ⏹️ `steps/step_0/README.md` - 1 упоминание
7. ⏹️ `steps/step_0/PACKAGE_JSON_SETUP.md` - 4 упоминания
8. ⏹️ `steps/step_1/README.md` - 4 упоминания

---

## 📝 Детальный список

### 1. docs/README.md
**Упоминания:** 1
**Строка 13:**
```markdown
- **[ERROR_ESCALATION.md](./error-handling/ERROR_ESCALATION.md)** - Эскалация ошибок: Result Pattern и монады (neverthrow)
```

**Действие:** Заменить `(neverthrow)` на `(@sweet-monads/either)`

---

### 2. docs/TYPES_AND_ENTITIES.md
**Упоминания:** 2
**Строки 164, 421:**
```typescript
import { Result, ok, err } from 'neverthrow'
```

**Действие:** Заменить на `import { Either, right, left } from '@sweet-monads/either'`

---

### 3. docs/DDD_AND_CLEAN_ARCHITECTURE.md
**Упоминания:** 2
**Строки 108, 166:**
```typescript
import { Result, ok, err } from 'neverthrow'
import { Result } from 'neverthrow'
```

**Действие:** Заменить на @sweet-monads/either импорты

---

### 4. docs/error-handling/README.md
**Упоминания:** 4
**Строки 51, 70, 90:**
- Описания neverthrow как рекомендуемой библиотеки
- Сравнение с другими библиотеками

**Действие:** Обновить описания, сделать @sweet-monads/either основной рекомендацией

---

### 5. docs/error-handling/ERROR_HANDLING.md
**Упоминания:** 4 (остатки)
**Строки 610, 814, 844, 983:**
```typescript
import { ResultAsync, errAsync, okAsync } from 'neverthrow'
import { ResultAsync } from 'neverthrow'
import { Result, ok, combine } from 'neverthrow'
import { Result, err } from 'neverthrow'
```

**Действие:** Заменить на @sweet-monads/either (asyncChain, fromPromise, merge)

---

### 6. docs/error-handling/ERROR_ESCALATION_EXTENDED.md
**Упоминания:** ~15
**Строки 49-70, 98-110, 373-440:**
- Раздел "1. neverthrow"
- Таблицы сравнения
- Рекомендации когда использовать

**Действие:** Обновить описания, переместить neverthrow на 2-е место после @sweet-monads/either

---

### 7. steps/step_0/README.md
**Упоминания:** 1
**Строка 123:**
```markdown
- Root `package.json` - зависимости для DDD слоев (neverthrow, typescript, eslint)
```

**Действие:** Заменить `neverthrow` на `@sweet-monads/either`

---

### 8. steps/step_0/PACKAGE_JSON_SETUP.md
**Упоминания:** 4
**Строки 39, 61, 207, 220:**
```json
"neverthrow": "^8.1.2"
```
```markdown
- `dependencies` - neverthrow для error handling
- `neverthrow` - используется в Application Layer
pnpm add neverthrow
```

**Действие:** Заменить все на `@sweet-monads/either`

---

### 9. steps/step_1/README.md
**Упоминания:** 4
**Строки 130, 199, 238, 299:**
```typescript
import { Result, ok, err } from 'neverthrow'
import { Result } from 'neverthrow'
```

**Действие:** Заменить на @sweet-monads/either импорты + обновить типы Result → Either

---

## 🎯 Приоритеты обновления

### Высокий приоритет (критичные для разработки)
1. ⭐ **steps/step_1/README.md** - основной туториал
2. ⭐ **steps/step_0/PACKAGE_JSON_SETUP.md** - установка зависимостей
3. ⭐ **docs/error-handling/README.md** - навигация

### Средний приоритет (архитектурная документация)
4. **docs/TYPES_AND_ENTITIES.md**
5. **docs/DDD_AND_CLEAN_ARCHITECTURE.md**
6. **docs/error-handling/ERROR_HANDLING.md** (остатки)

### Низкий приоритет (описания)
7. **docs/README.md**
8. **steps/step_0/README.md**
9. **docs/error-handling/ERROR_ESCALATION_EXTENDED.md** (обновить порядок)

---

## 📈 Прогресс

- **Завершено:** 4/10 файлов (40%)
- **Осталось:** 6 файлов
- **Оценка времени:** 2-3 часа

---

## 🔍 Команды для поиска

```bash
# Найти все упоминания neverthrow
grep -r "neverthrow" docs/ steps/

# Найти все импорты Result
grep -r "import.*Result.*from" docs/ steps/

# Найти все использования ok, err
grep -r "return ok\|return err" docs/ steps/

# Найти все типы Result<
grep -r "Result<" docs/ steps/
```

---

## ✅ Следующие шаги

1. Обновить steps/step_1/README.md (высокий приоритет)
2. Обновить steps/step_0/PACKAGE_JSON_SETUP.md
3. Обновить docs/error-handling/README.md
4. Обновить архитектурную документацию
5. Финальная проверка всех файлов
