# План обновления документации (v2.0)

## ✅ Выполнено

### docs/error-handling/README.md
- ✅ Добавлен раздел о POLYMORPHIC_ERROR_SYSTEM.md на первое место
- ✅ Помечены устаревшие документы (ERROR_HANDLING.md, APPLICATION_ERROR_HANDLING.md)
- ✅ Обновлен порядок изучения (3 варианта)
- ✅ Обновлены примеры кода на IError
- ✅ Добавлена история версий (v1.0 → v2.0)

## 🔄 Требуется обновление

### docs/error-handling/ (11 файлов)

1. **ERROR_HANDLING.md** - помечен как Legacy, но нужно:
   - Добавить предупреждение в начале
   - Обновить примеры кода на IError
   - Добавить ссылку на POLYMORPHIC_ERROR_SYSTEM.md

2. **APPLICATION_ERROR_HANDLING.md** - частично устарел:
   - Заменить `isOperational` на `isExpected()`
   - Заменить ErrorClassifier на методы IError
   - Обновить примеры handlers с tapLeft

3. **BASE_HANDLERS_REFERENCE.md** - нужно:
   - Обновить код BaseQueryHandler с tapLeft
   - Обновить код BaseCommandHandler с tapLeft
   - Заменить isOperational на isExpected()

4. **ERROR_CLASSIFIER_REFERENCE.md** - устарел полностью:
   - Пометить как deprecated
   - Добавить ссылку на методы IError
   - Объяснить миграцию

5. **ERROR_ESCALATION.md** - актуален, но нужно:
   - Добавить примеры с tapLeft/tapRight
   - Обновить сигнатуры на Validation<IError[], T>

6. **ERROR_ESCALATION_EXTENDED.md** - актуален, минорные правки

7. **INVARIANTS.md** - актуален, добавить:
   - Упоминание что errors implements IError

8. **SPECIFICATION_VALIDATION.md** - актуален, минорные правки

9. **VALIDATION_COMBINATORS.md** - актуален

10. **VALIDATION_EVOLUTION.md** - актуален, добавить:
    - Финальный этап: IError полиморфизм

### steps/step_1/ (13 файлов)

1. **README.md** - актуален, минорные правки

2. **ERROR_SETUP.md** - ПОЛНОСТЬЮ УСТАРЕЛ:
   - Переписать под IError + BaseError
   - Показать новый BaseErrorProps интерфейс
   - Обновить примеры
   - Объяснить implements IError

3. **INFRASTRUCTURE_ERRORS.md** - устарел:
   - Обновить NetworkError/StorageError/ApiError на IError
   - Показать методы isExpected(), getLogLevel(), toUserError()

4. **VALIDATION_SETUP.md** - актуален, добавить:
   - tapLeft, tapRight, fromNullable

5. **SPECIFICATION_SETUP.md** - актуален

6. **DOMAIN_LAYER_SETUP.md** - проверить примеры

7. **APPLICATION_LAYER_SETUP.md** - проверить Handler примеры

8. **Остальные** - проверить на соответствие

## 📊 Приоритеты

### Высокий (критично для v2.0):
1. ERROR_SETUP.md - переписать полностью
2. ERROR_HANDLING.md - добавить предупреждение
3. INFRASTRUCTURE_ERRORS.md - обновить на IError
4. APPLICATION_ERROR_HANDLING.md - обновить API

### Средний (улучшения):
5. BASE_HANDLERS_REFERENCE.md - обновить код
6. ERROR_CLASSIFIER_REFERENCE.md - пометить deprecated
7. ERROR_ESCALATION.md - добавить tapLeft примеры

### Низкий (минорные правки):
8. VALIDATION_EVOLUTION.md - добавить финальный этап
9. Остальные файлы - проверка и минорные правки

## 🎯 План действий

1. ✅ README.md обновлен
2. 📝 ERROR_SETUP.md - СЕЙЧАС
3. 📝 INFRASTRUCTURE_ERRORS.md
4. 📝 ERROR_HANDLING.md
5. 📝 APPLICATION_ERROR_HANDLING.md
6. 📝 Остальные по приоритету
