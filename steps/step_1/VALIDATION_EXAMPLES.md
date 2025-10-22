# Validation Examples

> **Назад:** [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)  
> **Далее:** [README.md](./README.md)

---

## 🎯 Цель

Показать примеры накопления ошибок валидации через спецификации.

---

## Пример: Накопление ВСЕХ ошибок

```typescript
// Невалидные данные
const input = {
  namespace: "a",           // ❌ Слишком короткий (минимум 2)
  name: "My@Resource",      // ❌ Недопустимый символ @
  secret: "123"             // ❌ Слишком короткий (минимум 8)
}

// Создаем Resource
const resourceResult = Resource.create("a", "My@Resource", "123")

// Resource.create() внутри вызывает спецификации:
// Namespace.create("a") → Left([ValidationError("Namespace", "must be 2-50 characters")])
// ResourceName.create("My@Resource") → Left([ValidationError("ResourceName", "must contain only letters, numbers, - and _")])

// ValidationCombinators.sequence накапливает ВСЕ ошибки:
// Left([
//   ValidationError("Namespace", "must be 2-50 characters"),
//   ValidationError("ResourceName", "must contain only letters, numbers, - and _")
// ])

if (resourceResult.isLeft()) {
  // ✅ Пользователь видит ВСЕ ошибки сразу!
  console.log(resourceResult.value) // массив ValidationError[]
}
```

**Преимущества:**
- ✅ Лучший UX - все ошибки сразу
- ✅ Меньше итераций исправления
- ✅ Функциональный подход

---

## Пример: Зарезервированный namespace

```typescript
const result = Namespace.create("admin")

// Проверяются ВСЕ спецификации:
// 1. NAMESPACE_NOT_EMPTY_SPEC ✅
// 2. NAMESPACE_LENGTH_SPEC ✅
// 3. NAMESPACE_PATTERN_SPEC ✅
// 4. NOT_RESERVED_NAMESPACE_SPEC ❌

// Left([
//   ValidationError("Namespace", "admin is a reserved namespace and cannot be used")
// ])
```

---

## Пример: Успешная валидация

```typescript
const result = Resource.create("social", "facebook", "MyPassword123!")

// Все спецификации пройдены ✅
// Right(Resource { ... })

if (result.isRight()) {
  const resource = result.value
  console.log(resource.getNamespace().getValue()) // "social"
}
```

---

## Почему Domain не может проверить уникальность?

```typescript
// ❌ НЕПРАВИЛЬНО - Domain знает о Repository
class Resource {
  static async create(
    namespace: string,
    name: string,
    repository: IResourceRepository  // ❌ Зависимость от Infrastructure!
  ) {
    // Domain НЕ должен делать I/O!
    const existing = await repository.findByNamespaceAndName(...)
  }
}

// ✅ ПРАВИЛЬНО - проверка уникальности в Application Layer
class CreateResourceCommandHandler {
  async handle(command: CreateResourceCommand) {
    // 1. Domain валидация (stateless)
    const resourceResult = Resource.create(...)
    
    // 2. Application валидация (I/O)
    const existing = await this.repository.findByNamespaceAndName(...)
    if (existing) {
      return invalid([new DuplicateResourceError(...)])
    }
  }
}
```

**Почему?**
- Domain Layer не должен зависеть от Infrastructure
- I/O операции - это ответственность Application Layer
- Domain фокусируется на бизнес-правилах (stateless)

---

## ✅ Ключевые принципы

1. **Спецификации** - переиспользуемые правила валидации
2. **Накопление ошибок** - лучший UX
3. **Stateless валидация** - в Domain Layer
4. **Stateful валидация** - в Application Layer
5. **Dependency Rule** - Domain не зависит от Infrastructure

---

> **Назад:** [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)  
> **Далее:** [README.md](./README.md)
