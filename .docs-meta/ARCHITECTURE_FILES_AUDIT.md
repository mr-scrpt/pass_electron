# Аудит файлов архитектуры и шагов - Validation API

**Дата:** 2025-01-22  
**Статус:** Найдены проблемы

---

## 🔍 Проведенная проверка

### Команды поиска:

```bash
# 1. Поиск прямого использования Either
grep -rn "import.*Either.*from.*@sweet-monads" docs/ steps/ --include="*.md"

# 2. Поиск left/right
grep -rn "left\|right" docs/ steps/ --include="*.md" | grep -v "Right/Left"

# 3. Поиск Validation API
grep -rn "import.*Validation.*from.*@/shared" docs/ steps/ --include="*.md"
```

---

## ❌ Найденные проблемы

### 1. Файлы с прямым использованием `Either`

#### `docs/TYPES_AND_ENTITIES.md`
**Строки:** 164, 421

**Проблема:**
```typescript
import { Either, right, left } from '@sweet-monads/either'
```

**Должно быть:**
```typescript
import { Validation, valid, invalid } from '@/shared/validation'
```

---

#### `docs/DDD_AND_CLEAN_ARCHITECTURE.md`
**Строки:** 117, 175

**Проблема:**
```typescript
import { Either, right, left } from '@sweet-monads/either'
```

**Должно быть:**
```typescript
import { Validation, valid, invalid } from '@/shared/validation'
```

---

#### `steps/step_1/README.md`
**Множество упоминаний**

**Проблемы:**
1. Прямое использование `Either` в примерах VO
2. Императивные проверки с `if/else`
3. Fail-fast подход
4. Нет упоминания о `Validation` API
5. Нет упоминания о `ValidationCombinators`

---

## 📋 План исправления

### Приоритет 1: Файлы архитектуры

#### 1. `docs/TYPES_AND_ENTITIES.md`

**Что обновить:**
- [ ] Заменить `Either` на `Validation` в примере ResourceId (строка 164)
- [ ] Заменить `right/left` на `valid/invalid`
- [ ] Заменить `Either` на `Validation` в примере Resource (строка 421)
- [ ] Добавить секцию о Validation API
- [ ] Добавить ссылку на VALIDATION_COMBINATORS.md

**Примерный объем:** 5-10 правок

---

#### 2. `docs/DDD_AND_CLEAN_ARCHITECTURE.md`

**Что обновить:**
- [ ] Заменить `Either` на `Validation` в примере Resource (строка 117)
- [ ] Заменить `right/left` на `valid/invalid`
- [ ] Заменить `Either` на `Validation` в примере ResourceName (строка 175)
- [ ] Добавить примечание о Validation API
- [ ] Добавить ссылку на VALIDATION_COMBINATORS.md

**Примерный объем:** 5-10 правок

---

### Приоритет 2: Step 1

#### 3. `steps/step_1/README.md`

**Что обновить:**
- [ ] Добавить новую секцию "Шаг 0: Подготовка - Validation API"
  - [ ] Создание `src/shared/validation/Validation.ts`
  - [ ] Создание `src/shared/validation/ValidationCombinators.ts`
  - [ ] Создание `src/shared/validation/index.ts`
  - [ ] Объяснение зачем нужна абстракция

- [ ] Обновить секцию "Шаг 1: Value Objects"
  - [ ] Обновить пример Namespace (строка 238)
  - [ ] Обновить пример ResourceName (строка 299)
  - [ ] Показать два варианта:
    - Упрощенный (fail-fast с Validation)
    - Улучшенный (ValidationCombinators)
  - [ ] Добавить сравнение подходов

- [ ] Добавить ссылки на документацию
  - [ ] VALIDATION_COMBINATORS.md
  - [ ] SPECIFICATION_VALIDATION.md

**Примерный объем:** 50-100 строк новой документации

---

## 🎯 Рекомендуемый подход для Step 1

### Вариант 1: Упрощенный (для начинающих)

**Использовать `Validation` но с простыми проверками:**

```typescript
import { Validation, valid, invalid } from '@/shared/validation'

export class Namespace {
  static create(value: string): Validation<InvariantViolationError, Namespace> {
    if (!value) {
      return invalid(new InvariantViolationError('Namespace', 'cannot be empty'))
    }
    
    if (value.length < 2 || value.length > 50) {
      return invalid(new InvariantViolationError('Namespace', 'must be 2-50 characters'))
    }
    
    if (!/^[a-z0-9-_]+$/.test(value)) {
      return invalid(new InvariantViolationError('Namespace', 'invalid format'))
    }
    
    return valid(new Namespace(value))
  }
}
```

**Преимущества:**
- ✅ Использует `Validation` API (изоляция от библиотеки)
- ✅ Простой для понимания
- ✅ Подходит для первого шага

**Недостатки:**
- ⚠️ Fail-fast (останавливается на первой ошибке)
- ⚠️ Императивный стиль

---

### Вариант 2: С накоплением ошибок (рекомендуется)

**Использовать `ValidationCombinators`:**

```typescript
import { Validation, ValidationCombinators, valid, invalid } from '@/shared/validation'

export class Namespace {
  static create(value: string): Validation<InvariantViolationError[], Namespace> {
    const validations = [
      value && value.trim()
        ? valid(value)
        : invalid(new InvariantViolationError('Namespace', 'cannot be empty')),
      
      value.length >= 2 && value.length <= 50
        ? valid(value)
        : invalid(new InvariantViolationError('Namespace', 'must be 2-50 characters')),
      
      /^[a-z0-9-_]+$/.test(value)
        ? valid(value)
        : invalid(new InvariantViolationError('Namespace', 'invalid format'))
    ]
    
    return ValidationCombinators.sequence(
      validations,
      () => new Namespace(value)
    )
  }
}
```

**Преимущества:**
- ✅ Накопление ВСЕХ ошибок
- ✅ Лучший UX (пользователь видит все проблемы сразу)
- ✅ Функциональный подход
- ✅ Готовность к Specification Pattern

**Недостатки:**
- ⚠️ Чуть сложнее для первого шага

---

### Вариант 3: Комбинированный (оптимальный)

**Показать оба варианта:**

1. **Сначала упрощенный** (Вариант 1)
   - Легко понять
   - Быстро начать

2. **Затем улучшенный** (Вариант 2)
   - Показать преимущества
   - Объяснить когда использовать

3. **Добавить примечание:**
   > 💡 **Для production:** Рекомендуется использовать Specification Pattern (см. [SPECIFICATION_VALIDATION.md](../../docs/error-handling/SPECIFICATION_VALIDATION.md)) для переиспользуемых правил валидации.

---

## 📊 Итоговая статистика

### Файлы требующие обновления:

| Файл | Проблем | Приоритет | Объем |
|------|---------|-----------|-------|
| `docs/TYPES_AND_ENTITIES.md` | 2 импорта | 🔴 Высокий | 5-10 правок |
| `docs/DDD_AND_CLEAN_ARCHITECTURE.md` | 2 импорта | 🔴 Высокий | 5-10 правок |
| `steps/step_1/README.md` | Множество | 🔴 Высокий | 50-100 строк |

**Всего:** 3 файла, ~70-120 строк изменений

---

## ✅ Следующие шаги

### 1. Обсудить с пользователем

**Вопросы:**
1. Какой вариант использовать в Step 1?
   - Упрощенный (fail-fast)
   - С накоплением ошибок
   - Комбинированный (оба)

2. Нужно ли создавать отдельный файл `VALIDATION_API_SETUP.md`?
   - Да - детальное описание
   - Нет - включить в README.md

3. Как показывать Specification Pattern?
   - В Step 1 (сразу)
   - В Step 2 (позже)
   - Только в документации

### 2. Обновить файлы

После согласования с пользователем:
- [ ] Обновить `docs/TYPES_AND_ENTITIES.md`
- [ ] Обновить `docs/DDD_AND_CLEAN_ARCHITECTURE.md`
- [ ] Обновить `steps/step_1/README.md`
- [ ] Создать коммит
- [ ] Запушить изменения

---

## 📖 Связанные документы

- [VALIDATION_COMBINATORS.md](../docs/error-handling/VALIDATION_COMBINATORS.md) - ValidationCombinators с mergeInMany
- [SPECIFICATION_VALIDATION.md](../docs/error-handling/SPECIFICATION_VALIDATION.md) - Specification Pattern
- [STEP_1_UPDATE_PLAN.md](./STEP_1_UPDATE_PLAN.md) - Детальный план обновления Step 1

---

**Дата создания:** 2025-01-22  
**Статус:** ⏳ Ожидает обсуждения с пользователем
