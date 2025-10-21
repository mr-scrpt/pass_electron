# Specification Pattern

**Теги:** `#pattern` `#ddd` `#specification` `#business-rules`

---

## 🎯 Что такое Specification Pattern?

**Specification Pattern** — это DDD паттерн для инкапсуляции бизнес-правил в переиспользуемые объекты-спецификации.

### Определение (Eric Evans, Domain-Driven Design)

> "A specification is a predicate that determines if an object does or does not satisfy some criteria."

**Спецификация** — это предикат (функция возвращающая boolean), который определяет, удовлетворяет ли объект некоторому критерию.

---

## 🎭 Три основных применения

### 1. Валидация (Validation)

Проверка, удовлетворяет ли объект бизнес-правилам.

```typescript
// Проверка Value Object при создании
const spec = new LengthRangeSpec(2, 50)
const result = spec.isSatisfiedBy("namespace")  // Either<Error, string>

if (result.isRight()) {
  // Валидно!
}
```

**Примеры:**
- Проверка инвариантов Value Objects
- Валидация форм
- Проверка бизнес-правил перед операцией

### 2. Фильтрация (Selection/Querying)

Выборка объектов из коллекции по критериям.

```typescript
// Фильтрация ресурсов
const activeSpec = new IsActiveSpec()
const recentSpec = new CreatedAfterSpec(new Date('2024-01-01'))

const filteredResources = allResources.filter(resource =>
  activeSpec.isSatisfiedBy(resource) && recentSpec.isSatisfiedBy(resource)
)
```

**Примеры:**
- Фильтрация списков
- Поиск по критериям
- Построение динамических запросов

### 3. Построение объектов (Construction-to-order)

Создание объектов, удовлетворяющих спецификации.

```typescript
// Генерация пароля по спецификации
const passwordSpec = CompositeSpecification.allOf(
  new MinLengthSpec(12),
  new ContainsUppercaseSpec(),
  new ContainsNumberSpec(),
  new ContainsSpecialCharSpec()
)

const password = generatePasswordSatisfying(passwordSpec)
```

**Примеры:**
- Генерация данных по правилам
- Factory с условиями
- Построение запросов к БД

---

## 📐 Базовая архитектура

### Интерфейс спецификации

```typescript
// Базовый интерфейс (generic)
interface ISpecification<T> {
  isSatisfiedBy(candidate: T): boolean
}

// С Either для обработки ошибок (наш проект)
interface ISpecification<T> {
  isSatisfiedBy(candidate: T): Either<Error, T>
}
```

### Композитные спецификации

```typescript
// AND - все должны пройти
class AndSpecification<T> implements ISpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && 
           this.right.isSatisfiedBy(candidate)
  }
}

// OR - хотя бы одна должна пройти
class OrSpecification<T> implements ISpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || 
           this.right.isSatisfiedBy(candidate)
  }
}

// NOT - инверсия
class NotSpecification<T> implements ISpecification<T> {
  constructor(private spec: ISpecification<T>) {}

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate)
  }
}
```

---

## 🔄 Примеры использования

### Сценарий 1: Фильтрация ресурсов

```typescript
// Спецификации для фильтрации
class ActiveResourceSpec implements ISpecification<Resource> {
  isSatisfiedBy(resource: Resource): boolean {
    return resource.isActive
  }
}

class ResourceByNamespaceSpec implements ISpecification<Resource> {
  constructor(private namespace: string) {}
  
  isSatisfiedBy(resource: Resource): boolean {
    return resource.namespace.getValue() === this.namespace
  }
}

class CreatedAfterSpec implements ISpecification<Resource> {
  constructor(private date: Date) {}
  
  isSatisfiedBy(resource: Resource): boolean {
    return resource.createdAt > this.date
  }
}

// Использование
const spec = new AndSpecification(
  new ActiveResourceSpec(),
  new ResourceByNamespaceSpec('social')
)

const filtered = allResources.filter(r => spec.isSatisfiedBy(r))
```

### Сценарий 2: Бизнес-правила

```typescript
// Проверка: можно ли удалить ресурс?
class CanDeleteResourceSpec implements ISpecification<Resource> {
  constructor(private currentUser: User) {}
  
  isSatisfiedBy(resource: Resource): boolean {
    // Бизнес-правило: только владелец или админ может удалить
    return resource.ownerId === this.currentUser.id || 
           this.currentUser.isAdmin
  }
}

class HasNoActiveReferencesSpec implements ISpecification<Resource> {
  constructor(private repository: IResourceRepository) {}
  
  async isSatisfiedBy(resource: Resource): Promise<boolean> {
    const references = await this.repository.findReferencesTo(resource.id)
    return references.length === 0
  }
}

// Использование
const canDelete = new AndSpecification(
  new CanDeleteResourceSpec(currentUser),
  new HasNoActiveReferencesSpec(repository)
)

if (await canDelete.isSatisfiedBy(resource)) {
  await repository.delete(resource)
}
```

### Сценарий 3: Query построение

```typescript
// Преобразование спецификации в SQL WHERE
class SpecificationToSqlConverter {
  convert<T>(spec: ISpecification<T>): string {
    if (spec instanceof ResourceByNamespaceSpec) {
      return `namespace = '${spec.namespace}'`
    }
    if (spec instanceof CreatedAfterSpec) {
      return `created_at > '${spec.date.toISOString()}'`
    }
    if (spec instanceof AndSpecification) {
      return `(${this.convert(spec.left)} AND ${this.convert(spec.right)})`
    }
    // ...
  }
}

// Использование
const spec = new AndSpecification(
  new ResourceByNamespaceSpec('social'),
  new CreatedAfterSpec(new Date('2024-01-01'))
)

const sql = converter.convert(spec)
// → "(namespace = 'social' AND created_at > '2024-01-01T00:00:00.000Z')"
```

### Сценарий 4: Генерация данных

```typescript
// Генератор паролей по спецификации
class PasswordGenerator {
  generate(spec: ISpecification<string>): string {
    let password: string
    let attempts = 0
    const maxAttempts = 1000

    do {
      password = this.generateRandom()
      attempts++
    } while (!spec.isSatisfiedBy(password) && attempts < maxAttempts)

    if (!spec.isSatisfiedBy(password)) {
      throw new Error('Cannot generate password satisfying specification')
    }

    return password
  }

  private generateRandom(): string {
    // Генерация случайного пароля
  }
}

// Использование
const passwordSpec = new AndSpecification(
  new MinLengthSpec(12),
  new AndSpecification(
    new ContainsUppercaseSpec(),
    new AndSpecification(
      new ContainsNumberSpec(),
      new ContainsSpecialCharSpec()
    )
  )
)

const password = generator.generate(passwordSpec)
```

---

## ✅ Преимущества

1. **Переиспользование** - спецификации можно комбинировать
2. **Тестируемость** - каждая спецификация тестируется отдельно
3. **Декларативность** - код читается как бизнес-правила
4. **Гибкость** - динамическое построение правил
5. **Разделение ответственности** - правила отделены от объектов
6. **Ubiquitous Language** - спецификации = термины из предметной области

---

## ⚠️ Когда НЕ использовать

1. **Простые проверки** - `if (value > 0)` не нужно оборачивать в спецификацию
2. **Одноразовые правила** - если правило используется только в одном месте
3. **Performance-critical код** - спецификации добавляют overhead
4. **Слишком простой домен** - overkill для CRUD приложений

---

## 🎯 Применение в нашем проекте

### 1. Валидация Value Objects

**Документ:** [error-handling/SPECIFICATION_VALIDATION.md](../error-handling/SPECIFICATION_VALIDATION.md)

Использование Specification Pattern для валидации инвариантов при создании Value Objects.

```typescript
// Пример
const spec = CompositeSpecification.allOf(
  new NotEmptySpec('Namespace'),
  new LengthRangeSpec(2, 50, 'Namespace'),
  new PatternSpec(/^[a-z0-9-_]+$/, 'invalid', 'Namespace')
)

return spec.isSatisfiedBy(value).map(v => new Namespace(v))
```

### 2. Фильтрация ресурсов (будущее)

```typescript
// Пример для Query Handlers
class ListResourcesQueryHandler {
  async handle(query: ListResourcesQuery) {
    const spec = this.buildSpecification(query.filters)
    const resources = await this.repository.findSatisfying(spec)
    return resources.map(r => this.mapper.toDTO(r))
  }

  private buildSpecification(filters: Filters): ISpecification<Resource> {
    const specs: ISpecification<Resource>[] = []
    
    if (filters.namespace) {
      specs.push(new ResourceByNamespaceSpec(filters.namespace))
    }
    if (filters.createdAfter) {
      specs.push(new CreatedAfterSpec(filters.createdAfter))
    }
    
    return CompositeSpecification.allOf(...specs)
  }
}
```

---

## 📚 Дополнительные ресурсы

### Книги
- **Domain-Driven Design** - Eric Evans (глава 9: Specifications)
- **Implementing Domain-Driven Design** - Vaughn Vernon
- **Patterns of Enterprise Application Architecture** - Martin Fowler

### Статьи
- [Specification Pattern - Martin Fowler](https://martinfowler.com/apsupp/spec.pdf)
- [Specifications - Vladimir Khorikov](https://enterprisecraftsmanship.com/posts/specification-pattern-c-implementation/)

---

## 🔗 Связанные документы

- **[error-handling/SPECIFICATION_VALIDATION.md](../error-handling/SPECIFICATION_VALIDATION.md)** - Практическое применение для валидации Value Objects ⭐
- **[error-handling/INVARIANTS.md](../error-handling/INVARIANTS.md)** - Инварианты и Shared Kernel
- **[DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** - DDD паттерны
