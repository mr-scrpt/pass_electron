# Миграция на @sweet-monads/either - Прогресс

**Дата начала:** 2025-10-21  
**Причина:** Необходимость накопления всех ошибок валидации (`mergeInMany`)

---

## 📋 План миграции

### Этап 1: Основная документация (error-handling/)
- [ ] ERROR_ESCALATION.md (50% - в процессе)
- [ ] ERROR_ESCALATION_EXTENDED.md (обновить рекомендацию)
- [ ] INVARIANTS.md
- [ ] ERROR_HANDLING.md

### Этап 2: Архитектурная документация
- [ ] DDD_AND_CLEAN_ARCHITECTURE.md
- [ ] TYPES_AND_ENTITIES.md
- [ ] QUERY_HANDLERS.md
- [ ] COMMAND_BUS.md
- [ ] DATA_FLOW.md

### Этап 3: Steps (пошаговые инструкции)
- [ ] steps/step_1/README.md

### Этап 4: Contracts
- [ ] docs/contracts/domain-types.md
- [ ] docs/contracts/system-interfaces.md

### Этап 5: Остальные файлы
- [ ] COMPOSITION_LAYER.md
- [ ] GETTING_STARTED.md
- [ ] README.md

---

## ✅ Выполнено

### 2025-10-21

#### ERROR_ESCALATION.md (50%)
- ✅ Заголовок и введение
- ✅ Установка библиотеки
- ✅ Базовое использование
- ✅ Монадические операции (map, chain, fold, merge, mergeInMany, mapLeft)
- ✅ Полный пример Command Handler
- ✅ Async операции (asyncChain)
- ✅ Преимущества библиотеки
- ✅ Эскалация Domain → Application
- ✅ Эскалация Infrastructure → Domain
- ✅ Начало Presentation Layer
- ⏳ Осталось: завершить Presentation Layer примеры

**Коммит:** `50cfc6c` - docs: начать переход на @sweet-monads/either в ERROR_ESCALATION.md (часть 1/5)

---

## 🔄 Ключевые изменения

### Терминология

| neverthrow | @sweet-monads/either |
|------------|---------------------|
| `Result<T, E>` | `Either<E, T>` ⚠️ порядок аргументов! |
| `ok(value)` | `right(value)` |
| `err(error)` | `left(error)` |
| `andThen` | `chain` |
| `match` | `fold` ⚠️ порядок аргументов (left, right)! |
| `combine` | `merge` (fail-fast) |
| - | `mergeInMany` ⭐ (накопление всех ошибок) |
| - | `mapLeft` ⭐ (трансформация ошибок) |
| `ResultAsync` | `asyncChain`, `asyncMap` |
| `mapErr` | `mapLeft` |

### Важные отличия

1. **Порядок типов:**
   ```typescript
   // neverthrow
   Result<Success, Error>
   
   // @sweet-monads/either
   Either<Error, Success>  // ⚠️ Ошибка первая!
   ```

2. **Порядок в fold:**
   ```typescript
   // neverthrow
   result.match(
     (value) => ...,   // success first
     (error) => ...    // error second
   )
   
   // @sweet-monads/either
   result.fold(
     (error) => ...,   // error first!
     (value) => ...    // success second
   )
   ```

3. **Уникальные возможности @sweet-monads:**
   - `mergeInMany` - накопление всех ошибок
   - `mapLeft` - трансформация ошибок
   - `asyncChain`/`asyncMap` - встроены

---

## 📊 Статистика

- **Всего файлов для обновления:** ~15-20
- **Завершено:** 0.5 файла (ERROR_ESCALATION.md 50%)
- **Прогресс:** ~2%
- **Оценка времени:** 6-8 часов

---

## 🎯 Следующие шаги

1. Завершить ERROR_ESCALATION.md (Presentation Layer примеры)
2. Обновить ERROR_ESCALATION_EXTENDED.md (изменить рекомендацию)
3. Обновить INVARIANTS.md
4. Обновить ERROR_HANDLING.md
5. Коммитить после каждого файла

---

## 📝 Примечания

- Все примеры должны использовать `Either<Error, Success>` (ошибка первая!)
- В `fold()` порядок аргументов: `(error, success)` - ошибка первая!
- Подчеркивать уникальные возможности: `mergeInMany` и `mapLeft`
- Добавлять комментарии о порядке аргументов где это важно
