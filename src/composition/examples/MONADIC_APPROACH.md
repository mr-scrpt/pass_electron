# Монадический подход в Composition Layer

## ✅ **НЕТ throw - ТОЛЬКО монады!**

### **Принципы:**

1. **НЕТ `if` для проверок** - используем `isTrue().valid().invalid()`
2. **НЕТ императивного извлечения** - используем `.chain()` / `.asyncChain()`
3. **НЕТ `throw`** - возвращаем `Validation<IError[], T>`
4. **НЕТ `as any`** - используем generics в `register<TQuery, TResult>()`
5. **Type-safe** - TypeScript автоматически выводит типы

---

## 🔧 **До и После**

### **❌ ДО: Процедурный стиль (НЕПРАВИЛЬНО)**

```typescript
// ❌ Процедурный стиль с if/throw
private static checkInitialization() {
  if (!this.repository || !this.logger) {
    throw new Error('Not initialized')  // ❌ throw!
  }
  return { repository: this.repository, logger: this.logger }
}

static registerQueryHandlers(queryBus: IQueryBus): void {
  queryBus.register('ListResourcesQuery', async (query) => {
    const initResult = this.checkInitialization()
    
    if (initResult.isLeft()) {  // ❌ if!
      return initResult
    }
    
    const { repository, logger } = initResult.value  // ❌ императивное извлечение
    const handler = new ListResourcesQueryHandler(repository, logger)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return handler.handle(query as any)  // ❌ as any!
  })
}
```

### **✅ ПОСЛЕ: Монадический подход (ПРАВИЛЬНО)**

```typescript
// ✅ Монадический подход БЕЗ if
private static checkInitialization(): Validation<IError[], { repository: IResourceRepository; logger: ILogger }> {
  return isTrue(
    this.repository !== null && this.logger !== null,
    { repository: this.repository!, logger: this.logger! }
  )
    .valid()
    .invalid([
      new InfrastructureError(
        'ResourceModule',
        'Module not initialized. Call ResourceModule.initialize() first.',
        { repository: this.repository === null, logger: this.logger === null }
      )
    ])
}

// ✅ Функциональная композиция через .asyncChain()
static registerQueryHandlers(queryBus: IQueryBus): void {
  queryBus.register<ListResourcesQuery, ResourceListItemDTO[]>(  // ✅ Generics для type-safety
    'ListResourcesQuery',
    async (query) => {
      return this.checkInitialization()
        .asyncChain(async ({ repository, logger }) => {  // ✅ .asyncChain() вместо if
          const handler = new ListResourcesQueryHandler(repository, logger)
          return handler.handle(query)  // ✅ TypeScript знает типы!
        })
    }
  )
}
```

---

## 📊 **Паттерны использования**

### **1. Проверка инициализации через `isTrue()`**

```typescript
// ✅ БЕЗ if - используем isTrue().valid().invalid()
static getQueries(): Validation<IError[], QueryFacade> {
  return isTrue(
    this.queryFacade !== null,
    this.queryFacade!
  )
    .valid()
    .invalid([
      new InfrastructureError(
        'ServiceContainer',
        'Container not initialized. Call initialize() first.'
      )
    ])
}
```

### **2. Регистрация handlers через `.asyncChain()`**

```typescript
// ✅ Функциональная композиция
queryBus.register<ListResourcesQuery, ResourceListItemDTO[]>(
  'ListResourcesQuery',
  async (query) => {
    return this.checkInitialization()
      .asyncChain(async ({ repository, logger }) => {
        const handler = new ListResourcesQueryHandler(repository, logger)
        return handler.handle(query)
      })
  }
)
```

### **3. Использование в Routes через `.asyncChain()`**

```typescript
// ✅ Монадическая композиция в loader
export async function loader() {
  return ServiceContainer.getQueries()
    .asyncChain(async (queries) => {
      return queries.list()
    })
    .then(result => 
      result
        .map((resources) => ({ resources }))
        .mapLeft((errors) => ({ errors }))
        .value
    )
}
```

---

## 🎯 **Почему это важно**

### **1. Type Safety**
```typescript
// ✅ TypeScript автоматически выводит типы
queryBus.register<ListResourcesQuery, ResourceListItemDTO[]>(...)
// query: ListResourcesQuery
// handler.handle(query) возвращает Promise<Validation<IError[], ResourceListItemDTO[]>>
```

### **2. Композиция**
```typescript
// ✅ Функциональная композиция через .asyncChain()
checkInitialization()
  .asyncChain(({ repository, logger }) => {
    // Здесь repository и logger автоматически извлечены из Right
    const handler = new ListResourcesQueryHandler(repository, logger)
    return handler.handle(query)
  })

// ❌ VS процедурный стиль с if
const result = checkInitialization()
if (result.isLeft()) return result
const { repository, logger } = result.value
...
```

### **3. Единообразие**
```typescript
// ✅ Везде один подход - монады
// ResourceModule
this.checkInitialization().asyncChain(...)

// ServiceContainer  
ServiceContainer.getQueries().asyncChain(...)

// Routes
ServiceContainer.getQueries().asyncChain(...).then(...)
```

---

## 📋 **Checklist для проверки кода**

- [ ] ❌ НЕТ `if (condition) { throw ... }` - используй `isTrue().valid().invalid()`
- [ ] ❌ НЕТ `if (result.isLeft()) return result` - используй `.chain()` или `.asyncChain()`
- [ ] ❌ НЕТ `const value = result.value` - используй `.map()` или `.chain()`
- [ ] ❌ НЕТ `as any` - используй generics в `register<TQuery, TResult>()`
- [ ] ❌ НЕТ `// eslint-disable-next-line` - решай проблему, не обходи
- [ ] ✅ ИСПОЛЬЗУЙ `.chain()` для синхронных операций
- [ ] ✅ ИСПОЛЬЗУЙ `.asyncChain()` для async операций
- [ ] ✅ ИСПОЛЬЗУЙ generics для type-safety

---

## 🔗 **См. также**

- **[CreateResourceCommandHandler.ts](../../application/commands/handlers/CreateResourceCommandHandler.ts)** - эталонный пример монадического подхода
- **[BASE_HANDLERS_REFERENCE.md](../../../docs/error-handling/BASE_HANDLERS_REFERENCE.md)** - базовые handlers с монадами
- **[PIPELINE_HANDLERS_GUIDE.md](../../../docs/error-handling/PIPELINE_HANDLERS_GUIDE.md)** - Pipeline Pattern

---

**Дата создания:** 2025-01-26  
**Версия:** 1.0 (Monadic Composition Layer)
