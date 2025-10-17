# Adapter Pattern + Dependency Injection

**Канонический подход к внедрению внешних зависимостей** (платформо-специфичных сервисов, HTTP клиентов, etc.) в приложение.

## Проблема

Multi-platform приложение (Web, Desktop, CLI) требует разных реализаций:
- **Web**: `navigator.clipboard`, `fetch`, `localStorage`
- **Desktop (Electron)**: `window.electronAPI`, IPC
- **CLI**: `process.stdin`, file system

**Плохое решение** — `if/else` в коде:

```typescript
// ❌ ПЛОХО: Composition знает о платформах
class ServiceContainer {
  static getService() {
    if (process.env.IS_ELECTRON) {
      return new ElectronService()  // ❌ Знание об Electron
    }
    return new WebService()  // ❌ Знание о Web API
  }
}
```

**Проблемы:** Coupling, нарушает Clean Architecture, тяжело тестировать.

---

## Решение: Adapter Pattern + DI

**Ключевая идея:**
1. **Application Layer** → Port (интерфейс)
2. **Infrastructure Layer** → Adapters (реализации)
3. **Infrastructure Layer** → Factory (изолирует знание о платформах)
4. **Composition Layer** → принимает готовые адаптеры
5. **Entry Point** → создает адаптеры и инжектит

```
Entry Point (знает о платформе)
    ↓ создает через Factory
Infrastructure Factory
    ↓ возвращает IService
Composition Layer (НЕ знает о платформе)
    ↓ использует интерфейс
Application Layer (Port)
    ↑ реализуют
Infrastructure Adapters
```

---

## Пошаговая инструкция

### Шаг 1: Port (Application Layer)

```typescript
// app/application/ports/IMyService.ts
export interface IMyService {
  doSomething(param: string): Promise<Result>
}
```

### Шаг 2: Adapters (Infrastructure Layer)

```typescript
// app/infrastructure/my-service/WebMyService.ts
export class WebMyService implements IMyService {
  async doSomething(param: string): Promise<Result> {
    // Web-специфичная реализация
  }
}

// app/infrastructure/my-service/ElectronMyService.ts
export class ElectronMyService implements IMyService {
  async doSomething(param: string): Promise<Result> {
    // Electron-специфичная реализация
  }
}
```

### Шаг 3: Factory (Infrastructure Layer)

```typescript
// app/infrastructure/my-service/MyServiceFactory.ts
export class MyServiceFactory {
  static createForWeb(): IMyService {
    return new WebMyService()
  }
  
  static createForDesktop(): IMyService {
    return new ElectronMyService()
  }
}
```

### Шаг 4: DI Module (Composition Layer)

```typescript
// app/composition/modules/SystemModule.ts
export class SystemModule {
  private static myService: IMyService | null = null

  static initialize(services: { myService: IMyService }) {
    this.myService = services.myService
  }

  static getMyService(): IMyService {
    if (!this.myService) throw new Error('Not initialized')
    return this.myService
  }
}
```

### Шаг 5: ServiceContainer (Composition Layer)

```typescript
// app/composition/ServiceContainer.ts
export class ServiceContainer {
  static initialize(services: { myService: IMyService }) {
    SystemModule.initialize({ myService: services.myService })
  }

  static getMyService(): IMyService {
    return SystemModule.getMyService()
  }
}
```

### Шаг 6: Entry Points

```typescript
// app/entry.client.tsx (Web)
const myService = MyServiceFactory.createForWeb()
ServiceContainer.initialize({ myService })

// electron/main.ts (Desktop)
const myService = MyServiceFactory.createForDesktop()
ServiceContainer.initialize({ myService })
```

---

## Примеры из проекта

### 1. ClipboardService (Web/Electron)

**Проблема:** Буфер обмена — разные API (Web: `navigator.clipboard`, Electron: IPC).

**Решение:**

```typescript
// Port
export interface IClipboardService {
  write(text: string): Promise<void>
  read(): Promise<string>
}

// Web Adapter
export class WebClipboardService implements IClipboardService {
  async write(text: string) {
    await navigator.clipboard.writeText(text)
  }
  async read() {
    return await navigator.clipboard.readText()
  }
}

// Electron Adapter
export class ElectronClipboardService implements IClipboardService {
  async write(text: string) {
    await window.electronAPI.writeClipboard(text)
  }
  async read() {
    return await window.electronAPI.readClipboard()
  }
}

// Factory
export class ClipboardServiceFactory {
  static createForWeb(): IClipboardService {
    return new WebClipboardService()
  }
  static createForDesktop(): IClipboardService {
    return new ElectronClipboardService()
  }
}

// Entry Points
// Web: ClipboardServiceFactory.createForWeb()
// Desktop: ClipboardServiceFactory.createForDesktop()
```

---

### 2. RequestParser (Web/CLI/Desktop)

**Проблема:** Разные способы передачи параметров (URL params, CLI args, IPC).

**Решение:**

```typescript
// Port
export interface IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams
  parseGetResourceByIdParams(input: unknown): GetResourceByIdParams
}

// Web Adapter (Remix Request)
export class RemixRequestParser implements IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const request = input as Request
    const url = new URL(request.url)
    return {
      namespace: url.searchParams.get('namespace') || undefined,
      search: url.searchParams.get('search') || undefined
    }
  }
}

// CLI Adapter (Commander options)
export class CLIRequestParser implements IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const options = input as Record<string, any>
    return {
      namespace: options.namespace,
      search: options.search
    }
  }
}

// Desktop Adapter (IPC Message)
export class DesktopRequestParser implements IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const message = input as IPCMessage
    return {
      namespace: message.payload.namespace,
      search: message.payload.search
    }
  }
}

// Factory
export class RequestParserFactory {
  static createForWeb(): IRequestParser {
    return new RemixRequestParser()
  }
  static createForCLI(): IRequestParser {
    return new CLIRequestParser()
  }
  static createForDesktop(): IRequestParser {
    return new DesktopRequestParser()
  }
}

// Использование в Facade
export const resourceQueries = {
  async list(input: unknown) {
    const parser = ServiceContainer.getRequestParser()
    const params = parser.parseListResourcesParams(input)  // ✅ Не знаем откуда input
    const query = new ListResourcesQuery(params.namespace, params.search)
    return ServiceContainer.getQueryBus().execute(query)
  }
}
```

---

### 3. Абстрактный пример — NotificationService

**Проблема (гипотетическая):** Уведомления с разными механизмами (Browser Notification API, Electron native, Console).

**Решение:**

```typescript
// Port
export interface INotificationService {
  show(notification: NotificationMessage): Promise<void>
  dismiss(id: string): Promise<void>
}

export interface NotificationMessage {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

// Web Adapter
export class WebNotificationService implements INotificationService {
  async show(notification: NotificationMessage) {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission()
    }
    const n = new Notification(notification.title, {
      body: notification.message,
      tag: notification.id
    })
    if (notification.duration) {
      setTimeout(() => n.close(), notification.duration)
    }
  }
  async dismiss(id: string) {
    // Browser API
  }
}

// Electron Adapter
export class ElectronNotificationService implements INotificationService {
  async show(notification: NotificationMessage) {
    await window.electronAPI.showNotification({
      title: notification.title,
      body: notification.message
    })
  }
  async dismiss(id: string) {
    await window.electronAPI.dismissNotification(id)
  }
}

// CLI Adapter
export class CLINotificationService implements INotificationService {
  async show(notification: NotificationMessage) {
    const color = notification.type === 'error' ? chalk.red : chalk.green
    console.log(color(`${notification.title}: ${notification.message}`))
  }
  async dismiss(id: string) {
    // Nothing to dismiss in CLI
  }
}

// Factory
export class NotificationServiceFactory {
  static createForWeb(): INotificationService {
    return new WebNotificationService()
  }
  static createForDesktop(): INotificationService {
    return new ElectronNotificationService()
  }
  static createForCLI(): INotificationService {
    return new CLINotificationService()
  }
}
```

---

## Анти-паттерны

### ❌ 1. Environment checks в Composition

```typescript
// ❌ ПЛОХО
class ServiceContainer {
  static getService() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return new ElectronService()
    }
    return new WebService()
  }
}

// ✅ ХОРОШО
class ServiceContainer {
  static initialize(services: { service: IService }) {
    this.service = services.service
  }
}
```

### ❌ 2. Прямое использование платформо-специфичных API

```typescript
// ❌ ПЛОХО
class Handler {
  async handle() {
    await navigator.clipboard.writeText('text')  // ❌ Web API напрямую
  }
}

// ✅ ХОРОШО
class Handler {
  constructor(private clipboard: IClipboardService) {}
  async handle() {
    await this.clipboard.write('text')  // ✅ Через интерфейс
  }
}
```

### ❌ 3. Factory возвращает конкретный класс

```typescript
// ❌ ПЛОХО
static createForWeb(): WebService {  // ❌ Конкретный класс
  return new WebService()
}

// ✅ ХОРОШО
static createForWeb(): IService {  // ✅ Интерфейс
  return new WebService()
}
```

---

## Архитектурные принципы

### ✅ Правило 1: Знание о платформах только в Infrastructure

```typescript
// Infrastructure - ЕДИНСТВЕННОЕ место
export class ServiceFactory {
  static createForWeb(): IService {
    return new WebService()  // ✅ Знание о Web
  }
}
```

### ✅ Правило 2: Composition НЕ знает о платформах

```typescript
// Composition - НЕ знает откуда
export class ServiceContainer {
  static initialize(services: { myService: IService }) {
    this.myService = services.myService  // ✅ Только интерфейс
  }
}
```

### ✅ Правило 3: Entry Point — единственное место решения

```typescript
// Entry Point - знает "это Web"
const service = ServiceFactory.createForWeb()
ServiceContainer.initialize({ myService: service })
```

### ✅ Правило 4: Application определяет контракт

```typescript
// Application - определяет ЧТО нужно (не КАК)
export interface IService {
  doSomething(): Promise<void>
}
```

---

## Чек-лист внедрения новой зависимости

- [ ] Определить **Port** (интерфейс) в `app/application/ports/`
- [ ] Создать **Adapters** для каждой платформы в `app/infrastructure/my-service/`
- [ ] Создать **Factory** в `app/infrastructure/my-service/MyServiceFactory.ts`
- [ ] Обновить **DI Module** (или создать новый) в `app/composition/modules/`
- [ ] Обновить **ServiceContainer.initialize()** добавить параметр
- [ ] Обновить все **Entry Points** (Web, Desktop, CLI) — создать адаптер и инжектить
- [ ] Убедиться что **Composition НЕ импортирует** конкретные адаптеры
- [ ] Убедиться что **Application НЕ использует** платформо-специфичные API напрямую

---

## См. также

- **[COMPOSITION_LAYER.md](./COMPOSITION_LAYER.md)** - Детали Composition Layer и DI
- **[electron/README.md](./electron/README.md)** - Примеры ClipboardService в контексте Electron
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Архитектурные границы и структура
- **[DDD_AND_CLEAN_ARCHITECTURE.md](./DDD_AND_CLEAN_ARCHITECTURE.md)** - Hexagonal Architecture (Ports & Adapters)
