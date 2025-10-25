# Паттерны проектирования

Технические и архитектурные паттерны, используемые в проекте.

## 📋 Содержание

### [Pipeline Pattern](./PIPELINE.md)

**Расположение:** `src/shared/pipeline/`

Функциональный паттерн для композиции последовательных монадических операций.

**Применение:**
- ✅ Domain Layer - композиция Specifications и сложная валидация
- ✅ Application Layer - CQRS Handlers с множественными шагами
- ✅ Infrastructure Layer - retry логика для внешних сервисов

**Возможности:**
- `.step()` - базовый шаг
- `.stepIf()` - условное выполнение
- `.stepWithRetry()` - retry для unexpected ошибок
- `.parallel()` - параллельное выполнение с аккумуляцией ошибок
- `.stepWithCompensation()` - Saga pattern (rollback)

**Пример:**
```typescript
import { Pipeline } from "@/shared/pipeline";

return new Pipeline<Context>()
  .step(ctx => this.checkUniqueness(ctx))
  .step(ctx => this.validateInput(ctx))
  .stepWithRetry(ctx => this.persistResource(ctx), 3)
  .execute({ command: cmd })
  .map(() => undefined);
```

---

### [Specification Pattern](./SPECIFICATION_PATTERN.md)

**Расположение:** `src/shared/specification/`, `src/domain/shared/specification/`

Паттерн для инкапсуляции бизнес-правил и валидационной логики.

**Применение:**
- ✅ Domain Layer - инварианты и бизнес-правила
- ✅ Переиспользование правил валидации
- ✅ Композиция сложных условий

---

## 🎯 Принципы использования паттернов

### 1. **Технические vs Domain паттерны**

**Технические (в `src/shared/`):**
- Pipeline - композиция операций
- Validation - монадическая обработка ошибок
- ISpecification - технический интерфейс

**Domain (в `src/domain/`):**
- Aggregate
- Entity
- Value Object
- Domain Events
- Specifications (бизнес-правила)

### 2. **Когда использовать Pipeline**

**✅ Используйте когда:**
- Нужна последовательность шагов (> 2-3 операций)
- Требуется retry логика
- Нужен Saga pattern (rollback)
- Условное выполнение шагов

**❌ НЕ используйте когда:**
- Простая цепочка (1-2 операции) - используйте chain/map
- Нет побочных эффектов - используйте чистые функции

### 3. **Когда использовать Specification**

**✅ Используйте когда:**
- Бизнес-правило переиспользуется
- Сложная валидационная логика
- Нужна композиция условий (AND/OR/NOT)

**❌ НЕ используйте когда:**
- Простая проверка (одно условие)
- Правило используется один раз

---

## 🔗 См. также

- [DDD and Clean Architecture](../DDD_AND_CLEAN_ARCHITECTURE.md)
- [Error Handling](../error-handling/README.md)
- [Data Flow (CQRS)](../DATA_FLOW.md)
