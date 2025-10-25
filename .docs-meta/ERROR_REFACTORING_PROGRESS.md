# Прогресс рефакторинга системы ошибок

## ✅ Завершено

### 1. Создан минимальный интерфейс IError
- `getMessage()`, `getCode()`, `getContext()` - технические методы
- `isExpected()` - классификация expected/unexpected
- `getLogLevel()` - уровень логирования
- `toUserError()` - трансформация для показа пользователю

### 2. Обновлен BaseError
- Реализует IError
- Используется для Domain errors
- `isExpected() = true`, `getLogLevel() = 'info'`
- `toUserError()` возвращает себя (показываем как есть)

### 3. Обновлены Infrastructure errors
- **NetworkError** - implements IError
- **StorageError** - implements IError
- **ApiError** - implements IError
- Все: `isExpected() = false`, `getLogLevel() = 'error'`
- `toUserError()` возвращает GenericApplicationError

### 4. Обновлен GenericApplicationError
- Реализует IError
- `isExpected() = true`, `getLogLevel() = 'warn'`
- Используется для замены Infrastructure errors на generic message

### 5. Добавлены монадные операторы
- `tapLeft` - side effects на левом значении
- `tapRight` - side effects на правом значении
- `fromNullable` - проверка на null/undefined

### 6. Исправлены BaseQueryHandler и BaseCommandHandler
- Обновлен конструктор GenericApplicationError (один error вместо массива)

### 7. Проверки
- ✅ TypeScript компилируется (tsc --noEmit)
- ✅ ESLint проходит (только несвязанные warnings в сгенерированных файлах)

## 🔄 Следующие шаги

### 1. Примеры специфичных Domain errors
Нужно создать примеры:
- `DuplicateNameError` - для Resource
- `LongNameError` - для ResourceName
- Другие domain-специфичные ошибки

### 2. Обновить Handlers для использования tapLeft
Переписать handlers для использования монадного подхода:
```typescript
return result
  .mapLeft(tapLeft(errors => 
    errors.forEach(error => 
      this.logger.log(error.getLogLevel(), error.getMessage())
    )
  ))
  .mapLeft(errors => 
    errors.map(error => error.toUserError())
  );
```

### 3. Обновить Repository interfaces
Repository должны возвращать `Validation<IError[], T>` вместо `Validation<Error[], T>`

### 4. Обновить Value Objects
Value Objects должны возвращать `Validation<IError[], VO>` вместо текущих типов ошибок

### 5. Тестирование
- Проверить работу с реальными данными
- Убедиться что ошибки правильно трансформируются
- Проверить логирование

## 📝 Документация

После завершения всех шагов написать:
- Руководство по системе ошибок
- Примеры использования
- Архитектурные решения
