Система обработки ошибок: Domain/Application/Infrastructure Errors

error_handling, domain_errors, architecture, ddd, clean_architecture

## Иерархия ошибок

### Domain Errors (app/domain/shared/errors/)
- **DomainError** - базовая доменная ошибка
- **InvariantViolationError** - нарушение инварианта
- **NotFoundError** - сущность не найдена
- **DuplicateError** - дубликат сущности
- **InvalidOperationError** - недопустимая операция

### Application Errors (app/application/errors/)
- **ValidationError** - ошибка валидации команд/запросов
- **CommandError** - ошибка выполнения команды
- **QueryError** - ошибка выполнения запроса

### Infrastructure Errors (app/infrastructure/errors/)
- **NetworkError** - сетевая ошибка
- **ApiError** - ошибка API
- **StorageError** - ошибка хранилища

## Архитектурные правила

1. **Domain Layer** - выбрасывает только DomainError
2. **Application Layer** - выбрасывает Application Errors, перехватывает Domain Errors
3. **Infrastructure Layer** - выбрасывает Infrastructure Errors, преобразует в Domain Errors (404 → NotFoundError)
4. **Presentation Layer** - обрабатывает все ошибки для показа пользователю

## Ключевые принципы

- Ошибки следуют архитектурным границам
- Domain ошибки - часть Ubiquitous Language
- Infrastructure ошибки преобразуются в Domain на границе
- Application Layer возвращает CommandResult/QueryResult вместо throws

## Документация

Создан файл `docs/ERROR_HANDLING.md` с полным описанием:
- Структура ошибок
- Примеры использования
- Преобразование между слоями
- Обработка в Presentation Layer
- Правила и анти-паттерны
- Тестирование