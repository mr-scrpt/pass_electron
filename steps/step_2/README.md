# Step 2: Domain Layer Extension - CustomField Entity

> ⚠️ **СТАТУС: ЧЕРНОВИК / НАБРОСОК**  
> Этот документ находится в стадии разработки и используется для планирования и обсуждения содержимого Step 2.  
> Структура и содержание могут значительно измениться.

---

## 🎯 Цель

Расширить Domain Layer добавлением **CustomField Entity** и связанной бизнес-логики для управления дополнительными полями ресурса.

> **📚 Контекст из Step 1:**
> - ✅ Value Objects: ResourceId, Namespace, ResourceName, Secret
> - ✅ Aggregate Root: Resource (упрощенная версия)
> - ✅ Инварианты: UuidInvariant, NamespaceInvariant, ResourceNameInvariant
> - ⏭️ CustomField Entity - **будет в Step 2**

---

## 📋 План Step 2 (черновик)

### 1. CustomField Entity

**Что создаем:**
- `src/domain/resource/entities/CustomField.ts`
- Entity с уникальным ID
- Поля: `id`, `name`, `value`, `type`

**Почему Entity, а не Value Object:**
- ✅ Находится в коллекции (может быть много CustomField)
- ✅ Имеет уникальный ID для идентификации
- ✅ Нужны операции CRUD по ID
- ✅ Может быть несколько полей с одинаковым name

**Структура:**
```typescript
class CustomField {
  constructor(
    public readonly id: FieldId,        // Entity - имеет ID!
    public readonly name: string,       // Название поля (email, phone, etc.)
    public readonly value: string,      // Значение
    public readonly type: FieldType     // Тип поля
  ) {}
}
```

---

### 2. FieldId Value Object

**Что создаем:**
- `src/domain/resource/value-objects/FieldId.ts`
- Обертка над UUID для ID полей
- Использует `UuidInvariant` (shared)

**Структура:**
```typescript
class FieldId {
  static generate(): FieldId
  static create(value: string): Validation<ValidationError[], FieldId>
  getValue(): string
  equals(other: FieldId): boolean
}
```

---

### 3. FieldType Value Object

**Что создаем:**
- `src/domain/resource/value-objects/FieldType.ts`
- Enum-like Value Object для типов полей
- Возможные типы: `text`, `email`, `url`, `note`

**Структура:**
```typescript
class FieldType {
  static readonly TEXT = new FieldType('text')
  static readonly EMAIL = new FieldType('email')
  static readonly URL = new FieldType('url')
  static readonly NOTE = new FieldType('note')
  
  static create(value: string): Validation<ValidationError[], FieldType>
}
```

---

### 4. Расширение Resource Aggregate

**Что добавляем:**
- Поле: `private _customFields: CustomField[]`
- Методы:
  - `addCustomField(name: string, value: string, type: FieldType): void`
  - `updateCustomField(fieldId: FieldId, newValue: string): void`
  - `removeCustomField(fieldId: FieldId): void`
  - `getCustomFields(): CustomField[]`
  - `getCustomField(fieldId: FieldId): CustomField | undefined`

**Почему методы, а не прямой доступ:**
- ✅ Aggregate Root управляет консистентностью
- ✅ Валидация и бизнес-правила в одном месте
- ✅ Можно добавить Domain Events позже (Step 3)

---

### 5. Инварианты для CustomField (опционально)

**Рассмотреть:**
- Валидация `name` (длина, формат)
- Валидация `value` в зависимости от `type`
  - Email: проверка формата email
  - URL: проверка формата URL
  - Text/Note: длина

**Варианты:**
- Создать `CustomFieldInvariant`
- ИЛИ: валидация внутри методов Resource
- ИЛИ: валидация в конструкторе CustomField

---

## 🤔 Вопросы для обсуждения

1. **Валидация CustomField:**
   - Где валидировать: в CustomField конструкторе или в методах Resource?
   - Нужны ли отдельные инварианты для полей?

2. **Типы полей:**
   - Достаточно ли `text`, `email`, `url`, `note`?
   - Нужны ли дополнительные типы (`password`, `phone`, `date`)?

3. **Ограничения:**
   - Максимальное количество CustomField на Resource?
   - Уникальность `name` внутри Resource?

4. **Value Objects для name/value:**
   - Оставить примитивами или создать VO (`FieldName`, `FieldValue`)?
   - Плюсы VO: валидация, Type Safety
   - Минусы VO: больше кода

---

## 📁 Структура после Step 2

```
src/domain/resource/
├── aggregates/
│   ├── Resource.ts                    # Расширен методами для CustomField
│   └── index.ts
│
├── entities/                          # ← НОВОЕ
│   ├── CustomField.ts                 # ← Entity с ID
│   └── index.ts
│
├── value-objects/
│   ├── ResourceId.ts
│   ├── Namespace.ts
│   ├── ResourceName.ts
│   ├── Secret.ts
│   ├── FieldId.ts                     # ← НОВОЕ
│   ├── FieldType.ts                   # ← НОВОЕ
│   └── index.ts
│
├── invariants/
│   ├── NamespaceInvariant.ts
│   ├── ResourceNameInvariant.ts
│   └── index.ts
│
└── specifications/
    ├── NotReservedNamespaceSpec.ts
    └── index.ts
```

---

## 🎯 Ожидаемый результат

После Step 2:
- ✅ CustomField Entity реализована
- ✅ Resource может управлять коллекцией CustomField
- ✅ Полная CRUD функциональность для дополнительных полей
- ✅ Type-safe работа с полями
- ✅ Валидация на уровне Domain

---

## 🔗 Связи

- **Назад:** [Step 1: Domain Layer Setup](../step_1/DOMAIN_LAYER_SETUP.md)
- **Далее:** Step 3: Domain Events (TBD)

---

> 💡 **Примечание:** Этот документ будет дополняться и уточняться по мере обсуждения деталей реализации.
