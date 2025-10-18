# Отчет об обновлении: Композитные инварианты (2024-10-18)

## 📋 Цель обновления

Добавить поддержку композитных инвариантов для устранения дублирования композиций валидаций в Value Objects.

---

## ✅ Что добавлено

### 1. Новый класс IdentifierInvariant

**Файл**: `app/domain/shared/invariants/IdentifierInvariant.ts`

Композитный инвариант, который инкапсулирует повторяющиеся композиции валидаций:

```typescript
export class IdentifierInvariant {
  /**
   * Валидация длинного идентификатора (для ресурсов)
   * - Длина: 1-100 символов
   * - Формат: буквы, цифры, дефис, подчеркивание
   */
  static validateResourceIdentifier(value: string, entityType: string): Result<string, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 100, entityType)
      .andThen(v => StringInvariant.validateAlphanumericWithDashUnderscore(v, entityType))
  }
  
  /**
   * Валидация короткого идентификатора (для namespace, labels)
   * - Длина: 1-50 символов
   * - Формат: буквы, цифры, дефис, подчеркивание
   */
  static validateShortIdentifier(value: string, entityType: string): Result<string, InvariantViolationError> {
    return StringInvariant.validateLength(value, 1, 50, entityType)
      .andThen(v => StringInvariant.validateAlphanumericWithDashUnderscore(v, entityType))
  }
}
```

---

## 📊 Обновленные файлы

### 1. docs/error-handling/INVARIANTS.md

**Что добавлено:**
- ✅ Класс `IdentifierInvariant` с композитными методами
- ✅ Секция "🎯 Композитные инварианты" с объяснением проблемы и решения
- ✅ Преимущества композитных инвариантов (DRY, Ubiquitous Language, читаемость, изменяемость, тестируемость)
- ✅ Рекомендации когда использовать / не использовать композитные инварианты
- ✅ Обновлены примеры `ResourceName` и `Namespace` для использования `IdentifierInvariant`

**Было**:
```typescript
class ResourceName {
  static create(value: string) {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .andThen(v => StringInvariant.validateAlphanumericWithDashUnderscore(v, 'ResourceName'))
      .map(v => new ResourceName(v))
  }
}
```

**Стало**:
```typescript
class ResourceName {
  static create(value: string) {
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}
```

---

### 2. docs/PROJECT_STRUCTURE.md

**Что обновлено:**
- ✅ Структура `domain/shared/invariants/` теперь включает `IdentifierInvariant.ts` с комментарием "Композитные правила"
- ✅ Комментарий "Атомарные операции" для `StringInvariant.ts`
- ✅ Обновлен Public API для `invariants/index.ts` с экспортом `IdentifierInvariant`

**Новая структура**:
```
app/domain/shared/invariants/
├── UuidInvariant.ts
├── StringInvariant.ts          # Атомарные операции
├── EmailInvariant.ts
├── IdentifierInvariant.ts      # Композитные правила
└── index.ts
```

---

## 🎯 Концептуальная модель

### Атомарные инварианты (StringInvariant)

Базовые операции валидации:
- `validateLength()` - проверка длины
- `validateAlphanumericWithDashUnderscore()` - проверка формата
- `validateSlug()` - проверка slug формата

### Композитные инварианты (IdentifierInvariant)

Композиция атомарных операций для частых случаев:
- `validateResourceIdentifier()` - для ResourceName (длина 1-100 + формат)
- `validateShortIdentifier()` - для Namespace, CustomFieldLabel (длина 1-50 + формат)

### Гибридный подход

```typescript
// ✅ Частый случай - используем композитный
class ResourceName {
  static create(value: string) {
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}

// ✅ Уникальный случай - композируем вручную
class SpecialName {
  static create(value: string) {
    return StringInvariant.validateLength(value, 5, 200, 'SpecialName')
      .andThen(v => StringInvariant.validateSlug(v, 'SpecialName'))
      .map(v => new SpecialName(v))
  }
}
```

---

## 📈 Преимущества композитных инвариантов

### 1. DRY (Don't Repeat Yourself)
Композиция определена **один раз**, переиспользуется везде.

### 2. Ubiquitous Language
`validateResourceIdentifier` **говорит ЧТО проверяется**, не нужно читать implementation.

### 3. Читаемость
**1 строка** вместо 3-4 строк цепочки `andThen`.

### 4. Изменяемость
Изменил правила валидации в одном месте → **автоматически изменилось везде**.

### 5. Тестируемость
**Один набор тестов** для композитного инварианта вместо дублирования тестов.

---

## 📋 Рекомендации по использованию

### ✅ Используй композитный инвариант, если:

1. **Повторяющаяся композиция** - одна и та же цепочка проверок в разных Value Objects
2. **Бизнес-концепция** - «идентификатор ресурса» - это понятие из домена
3. **Сложная логика** - больше 2-3 проверок в композиции
4. **Доменное правило** - композиция выражает бизнес-правило

### ❌ НЕ используй, если:

1. **Уникальная композиция** - используется только в одном месте
2. **Простая проверка** - одна-две операции
3. **Меняющиеся требования** - разные Value Objects нужны разные комбинации

---

## 🔄 Сравнение подходов

### Вариант 1: Атомарные инварианты (StringInvariant)

```typescript
class ResourceName {
  static create(value: string) {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .andThen(v => StringInvariant.validateAlphanumericWithDashUnderscore(v, 'ResourceName'))
      .map(v => new ResourceName(v))
  }
}
```

**Плюсы:**
- ✅ Гибкость
- ✅ Переиспользование мелких кусков

**Минусы:**
- ❌ Дублирование композиции
- ❌ Больше строк кода

---

### Вариант 3: Композитные инварианты (IdentifierInvariant)

```typescript
class ResourceName {
  static create(value: string) {
    return IdentifierInvariant.validateResourceIdentifier(value, 'ResourceName')
      .map(v => new ResourceName(v))
  }
}
```

**Плюсы:**
- ✅ **DRY** - нет дублирования
- ✅ **Читаемость** - одна строка
- ✅ **Ubiquitous Language** - понятное имя
- ✅ **Изменяемость** - изменения в одном месте

**Минусы:**
- ⚠️ Меньше гибкости (но редко нужна)

---

## 📊 Статистика изменений

| Метрика | До | После |
|---------|----|----|
| Строк в `ResourceName.create()` | 4 | 2 |
| Строк в `Namespace.create()` | 4 | 2 |
| Дублирование композиции | Да | Нет |
| Ubiquitous Language | Частично | Полностью |
| Место определения правил | Разные Value Objects | Один класс |

---

## 🔗 Связанные файлы

### Обновленные:
- ✅ `docs/error-handling/INVARIANTS.md` - добавлен IdentifierInvariant и секция о композитных инвариантах
- ✅ `docs/PROJECT_STRUCTURE.md` - обновлена структура invariants/ с комментариями

### Требуют синхронизации:
- ⚠️ `steps/step_1/README.md` - нужно добавить упоминание IdentifierInvariant (опционально)
- ⚠️ `docs/DDD_AND_CLEAN_ARCHITECTURE.md` - примеры уже используют композицию через атомарные, можно показать альтернативу

---

## 🎓 Итоговая структура invariants/

```
app/domain/shared/invariants/
├── UuidInvariant.ts              # Атомарные: UUID валидация
├── StringInvariant.ts            # Атомарные: операции со строками
│   ├── validateLength()
│   ├── validateAlphanumericWithDashUnderscore()
│   └── validateSlug()
├── EmailInvariant.ts             # Атомарные: email валидация
├── IdentifierInvariant.ts        # Композитные: идентификаторы
│   ├── validateResourceIdentifier()  # Композиция: length + format (длинный)
│   └── validateShortIdentifier()     # Композиция: length + format (короткий)
└── index.ts                      # Public API
```

---

## ✅ Выводы

### Что достигнуто:
1. ✅ Устранено дублирование композиций валидаций
2. ✅ Улучшена читаемость Value Objects (меньше строк)
3. ✅ Усилен Ubiquitous Language (именованные композиции)
4. ✅ Упрощена изменяемость (правила в одном месте)
5. ✅ Сохранена гибкость (можно использовать атомарные инварианты напрямую)

### Гибридный подход:
- **Атомарные инварианты** (`StringInvariant`) для базовых операций
- **Композитные инварианты** (`IdentifierInvariant`) для частых композиций
- **Прямая композиция** для уникальных случаев

### Рекомендации разработчикам:
1. Используй композитные инварианты для частых паттернов
2. Не бойся создавать новые композитные инварианты при необходимости
3. Документируй что проверяет композитный инвариант
4. Пиши тесты для композитных инвариантов

---

**Дата обновления**: 2024-10-18  
**Тип изменений**: Добавление функциональности (Composite Invariants)  
**Статус**: ✅ Завершено  
**Обратная совместимость**: ✅ Полная (атомарные инварианты не изменены)
