# Adapter Pattern + Dependency Injection

**Канонический подход к внедрению внешних зависимостей** (платформо-специфичных сервисов, HTTP клиентов, etc.) в приложение.

## Проблема

Multi-platform приложение (Web, Desktop, CLI) требует разных реализаций:
- **Web**: `navigator.clipboard`, `fetch`, `localStorage`
- **Desktop (Electron)**: `window.electronAPI`, IPC
- **CLI**: `process.stdin`, file system

**Плохое решение** — `if/else` в коде:

#### Антипаттерн - проверки платформы в Composition

##### Антипаттерн [#code]

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

#### Поток зависимостей [#diagram:flow]

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

#### IMyService - интерфейс

##### IMyService Port [#interface:IMyService|#code|#structure:path]

```typescript
// app/application/ports/IMyService.ts
export interface IMyService {
  doSomething(param: string): Promise<Result>
}
```

### Шаг 2: Adapters (Infrastructure Layer)

#### Адаптеры для разных платформ

##### Adapters [#class:WebMyService|#class:DesktopMyService|#code|#structure:path]

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

#### MyServiceFactory

##### MyServiceFactory [#class:MyServiceFactory|#code|#structure:path]

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

#### SystemModule

##### SystemModule [#class:SystemModule|#code|#structure:path]

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

#### ServiceContainer

##### ServiceContainer [#class:ServiceContainer|#code|#structure:path]

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

#### Инициализация в entry points

##### Entry points [#code|#structure:path]

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

#### Clipboard Service - полная реализация

##### ClipboardService [#interface:IClipboardService|#class:WebClipboardService|#class:ElectronClipboardService|#class:ClipboardServiceFactory|#code|#structure:path]

```typescript
// app/application/ports/IClipboardService.ts
export interface IClipboardService {
  write(text: string): Promise<void>
  read(): Promise<string>
}

// app/infrastructure/clipboard/WebClipboardService.ts
export class WebClipboardService implements IClipboardService {
  async write(text: string) {
    await navigator.clipboard.writeText(text)
  }
  async read() {
    return await navigator.clipboard.readText()
  }
}

// app/infrastructure/clipboard/ElectronClipboardService.ts
export class ElectronClipboardService implements IClipboardService {
  async write(text: string) {
    await window.electronAPI.writeClipboard(text)
  }
  async read() {
    return await window.electronAPI.readClipboard()
  }
}

// app/infrastructure/clipboard/ClipboardServiceFactory.ts
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

#### Request Parser - полная реализация

##### RequestParser [#interface:IRequestParser|#class:WebRequestParser|#class:CLIRequestParser|#class:RequestParserFactory|#code|#structure:path]

```typescript
// app/application/ports/IRequestParser.ts
export interface IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams
  parseGetResourceByIdParams(input: unknown): GetResourceByIdParams
}

// app/infrastructure/request-parsers/RemixRequestParser.ts
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

// app/infrastructure/request-parsers/CLIRequestParser.ts
export class CLIRequestParser implements IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const options = input as Record<string, any>
    return {
      namespace: options.namespace,
      search: options.search
    }
  }
}

// app/infrastructure/request-parsers/DesktopRequestParser.ts
export class DesktopRequestParser implements IRequestParser {
  parseListResourcesParams(input: unknown): ListResourcesParams {
    const message = input as IPCMessage
    return {
      namespace: message.payload.namespace,
      search: message.payload.search
    }
  }
}

// app/infrastructure/request-parsers/RequestParserFactory.ts
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

#### Notification Service - полная реализация

##### NotificationService [#interface:INotificationService|#class:BrowserNotificationService|#class:ElectronNotificationService|#class:ConsoleNotificationService|#class:NotificationServiceFactory|#code|#structure:path]

```typescript
// app/application/ports/INotificationService.ts
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

// app/infrastructure/notification/WebNotificationService.ts
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

// app/infrastructure/notification/ElectronNotificationService.ts
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

// app/infrastructure/notification/CLINotificationService.ts
export class CLINotificationService implements INotificationService {
  async show(notification: NotificationMessage) {
    const color = notification.type === 'error' ? chalk.red : chalk.green
    console.log(color(`${notification.title}: ${notification.message}`))
  }
  async dismiss(id: string) {
    // Nothing to dismiss in CLI
  }
}

// app/infrastructure/notification/NotificationServiceFactory.ts
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

#### Антипаттерн

##### Environment checks [#code]

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

#### Антипаттерн

##### Прямое использование API [#code]

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

#### Антипаттерн

##### Factory с конкретным типом [#code]

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

#### Правильная изоляция

##### Infrastructure Factory [#code]

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

- [ ] Определить **Port** (интерфейс) в `app/application/ports/` #structure:application/ports/
- [ ] Создать **Adapters** для каждой платформы в `app/infrastructure/my-service/` #structure:infrastructure/
- [ ] Создать **Factory** в `app/infrastructure/my-service/MyServiceFactory.ts`
- [ ] Обновить **DI Module** (или создать новый) в `app/composition/modules/` #structure:composition/modules/
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
