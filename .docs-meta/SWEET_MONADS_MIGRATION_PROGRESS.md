# Миграция на @sweet-monads/either - Прогресс

**Дата начала:** 2025-10-21  
**Причина:** Необходимость накопления всех ошибок валидации (`mergeInMany`)

---

## 📋 План миграции

### Этап 1: Основная документация (error-handling/)
- [x] ERROR_ESCALATION.md ✅ (100%)
- [x] ERROR_ESCALATION_EXTENDED.md ✅ (100%)
- [x] INVARIANTS.md ✅ (100%)
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

#### ERROR_ESCALATION.md (100%) ✅
- ✅ Заголовок и введение
- ✅ Установка библиотеки
- ✅ Установка библиотеки
- ✅ Базовое использование
- ✅ Монадические операции (map, chain, fold, merge, mergeInMany, mapLeft)
- ✅ Полный пример Command Handler
- ✅ Async операции (asyncChain)
- ✅ Преимущества библиотеки
- ✅ Эскалация Domain → Application
- ✅ Эскалация Infrastructure → Domain
- ✅ Presentation Layer примеры
- ✅ План миграции

**Коммиты:** 
- `50cfc6c` - docs: начать переход на @sweet-monads/either в ERROR_ESCALATION.md (часть 1/5)
- `bf0323e` - docs: завершить миграцию ERROR_ESCALATION.md на @sweet-monads/either (100%)

#### ERROR_ESCALATION_EXTENDED.md (100%) ✅
- ✅ Изменена рекомендация с neverthrow на @sweet-monads/either
- ✅ Обновлены примеры архитектуры
- ✅ Добавлены уникальные возможности (mergeInMany, mapLeft)

**Коммит:** `38dda25` - docs: обновить рекомендацию в ERROR_ESCALATION_EXTENDED.md

#### INVARIANTS.md (100%) ✅
- ✅ StringInvariant - все методы
- ✅ IdentifierInvariant - композитные инварианты
- ✅ Value Objects примеры (ResourceName, Namespace)
- ✅ Правильные и неправильные паттерны
- ✅ Рекомендации

**Коммит:** `4ac7d9e` - docs: мигрировать INVARIANTS.md на @sweet-monads/either

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
- **Завершено:** 3 файла (ERROR_ESCALATION.md, ERROR_ESCALATION_EXTENDED.md, INVARIANTS.md)
- **Прогресс:** ~18% (3/17 файлов)
- **Оценка времени:** 5-7 часов осталось

---

## 🎯 Следующие шаги

1. ✅ ~~Завершить ERROR_ESCALATION.md~~
2. ✅ ~~Обновить ERROR_ESCALATION_EXTENDED.md~~
3. ✅ ~~Обновить INVARIANTS.md~~
4. ⏳ Обновить ERROR_HANDLING.md (следующий)
5. Обновить steps/step_1/README.md
6. Обновить архитектурную документацию (5 файлов)
7. Коммитить после каждого файла

---

## 📝 Примечания

- Все примеры должны использовать `Either<Error, Success>` (ошибка первая!)
- В `fold()` порядок аргументов: `(error, success)` - ошибка первая!
- Подчеркивать уникальные возможности: `mergeInMany` и `mapLeft`
- Добавлять комментарии о порядке аргументов где это важно
