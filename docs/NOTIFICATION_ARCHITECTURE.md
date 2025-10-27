# Архитектура системы нотификаций

**Статус:** ✅ **РЕАЛИЗОВАНО** (2025-01-27)  
**Подход:** Platform Configs + Dependency Injection + Decorator Pattern

---

## ✅ Реализованная архитектура

### **Platform Configs Workspace**

Создан отдельный workspace `@password-manager/platform-configs` для управления platform-specific зависимостями:

```
src/presentation/platform-configs/
├── package.json              ← sonner здесь!
├── common/
│   └── index.ts             ← Базовые зависимости (repository, logger)
├── web/
│   ├── adapters/
│   │   └── SonnerNotificationDisplay.ts
│   └── index.ts             ← РАСШИРЯЕТ common + notification
└── electron/
    └── index.ts             ← РАСШИРЯЕТ common + ElectronDecorator
```

### **Ключевые решения:**

1. ✅ **Common конфиг** - базовые зависимости для всех платформ
2. ✅ **React НЕ знает о платформе** - получает deps через DI
3. ✅ **SonnerNotificationDisplay вынесен** - в platform-configs
4. ✅ **Vite чистый** - НЕТ условной логики по платформам
5. ✅ **Electron подменяет конфиг** - через build script
6. ✅ **Библиотеки централизованы** - sonner в platform-configs
7. ✅ **Decorator Pattern** - Electron расширяет Web без изменений

### **Как работает:**

**Web standalone:**
```bash
pnpm dev:web
# 1. configs/platform.config.ts → @password-manager/platform-configs/web
# 2. createPlatformDependencies() → createCommonDependencies()
# 3. SonnerNotificationDisplay (toast в окне)
# 4. initializeApp(deps) → ServiceContainer
```

**Electron:**
```bash
pnpm build:electron
# 1. prepare-web.sh копирует Web → electron/.build/web/
# 2. ПОДМЕНЯЕТ configs/platform.config.ts → platform-configs/electron
# 3. createPlatformDependencies() → createCommonDependencies()
# 4. ElectronNotificationDecorator(SonnerDisplay) - toast + OS
# 5. initializeApp(deps) → ServiceContainer
```

---

## 🎯 Ключевые принципы

1. **Web полностью самодостаточен** - НЕ знает об Electron/Mobile
2. **Application Layer platform-agnostic** - НЕ знает где выполняется
3. **Electron РАСШИРЯЕТ Web** через Decorator Pattern (а НЕ изменяет)
4. **Dependency Injection** на уровне entry point

---

## 🏗️ Архитектурные слои

### **Application Layer - контракт**

```typescript
// @/application/ports/INotificationManager.ts
interface INotificationManager {
  notify(params: CreateNotificationParams): string
  dismiss(id: string): void
  dismissAll(): void
  getHistory(): Notification[]
  subscribe(handler: (notification: Notification) => void): () => void
}
```

**Роль:** Бизнес-интерфейс для работы с уведомлениями  
**Знания:** ❌ НЕ знает о платформе, UI, Display  
**Зависимости:** Только типы данных (`Notification`, `CreateNotificationParams`)

---

### **Infrastructure Layer - реализация + делегирование**

#### **INotificationDisplay** (интерфейс)
```typescript
// @/infrastructure/notifications/INotificationDisplay.ts
interface INotificationDisplay {
  show(notification: Notification): void
  dismiss(id: string): void
  dismissAll(): void
}
```

**Роль:** Минималистичный контракт для рендеринга  
**Знания:** ❌ НЕ раскрывает детали платформы  
**Паттерн:** Strategy (разные стратегии отображения)

#### **WebNotificationManager** (класс)
```typescript
// @/infrastructure/notifications/WebNotificationManager.ts
class WebNotificationManager implements INotificationManager {
  constructor(private display: INotificationDisplay) {}
  
  notify(params) {
    // 1. Генерирует ID
    // 2. Сохраняет в history
    // 3. Делегирует отображение → display.show()
    // 4. Оповещает subscribers
  }
}
```

**Роль:** Бизнес-логика нотификаций (history, ID, subscribers)  
**Знания:** ❌ НЕ знает о конкретном UI (sonner, OS, console)  
**Паттерн:** Facade + Delegation

---

### **Presentation Layer - платформо-специфичные реализации**

#### **Web: SonnerNotificationDisplay**
```typescript
// @/presentation/web/react/adapters/SonnerNotificationDisplay.ts
class SonnerNotificationDisplay implements INotificationDisplay {
  show(notification: Notification): void {
    toast[notification.level](notification.message)
  }
}
```

**Роль:** Web реализация через sonner toast  
**Знания:** ✅ Знает о sonner, ❌ НЕ знает об Electron  
**Паттерн:** Adapter (адаптирует sonner к INotificationDisplay)

#### **Electron: ElectronNotificationDecorator**
```typescript
// @/presentation/electron/adapters/ElectronNotificationDecorator.ts
class ElectronNotificationDecorator implements INotificationDisplay {
  constructor(private baseDisplay: INotificationDisplay) {}  // ← Оборачивает Web!
  
  show(notification: Notification): void {
    // 1️⃣ ВСЕГДА показываем toast (делегируем Web Display)
    this.baseDisplay.show(notification)
    
    // 2️⃣ ДОПОЛНИТЕЛЬНО показываем OS (для error/warning)
    if (this.shouldShowInOS(notification)) {
      new Notification('App', { body: notification.message })
    }
  }
}
```

**Роль:** Расширение Web через OS notifications  
**Знания:** ✅ Знает о Web Display + Electron API  
**Паттерн:** Decorator (расширяет, а НЕ заменяет)

---

## 📊 Архитектурная диаграмма

```
┌─────────────────────────────────────────────────────────┐
│  Application Layer                                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │ INotificationManager                            │    │
│  │ notify({ level, message })                      │    │
│  │                                                  │    │
│  │ ❌ НЕ знает о платформе                         │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────┼───────────────────────────────┘
                          │ implements
┌─────────────────────────▼───────────────────────────────┐
│  Infrastructure Layer                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ WebNotificationManager                          │    │
│  │ - history[]                                     │    │
│  │ - subscribers                                   │    │
│  │ - ID generation                                 │    │
│  │                                                  │    │
│  │ ❌ НЕ знает о UI реализации                     │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────┼───────────────────────────────┘
                          │ delegates to
┌─────────────────────────▼───────────────────────────────┐
│  Infrastructure Layer                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ INotificationDisplay                            │    │
│  │ show(notification)                              │    │
│  │                                                  │    │
│  │ ❌ Минималистичный контракт                     │    │
│  └──────────────────────┬──────────────────────────┘    │
└─────────────────────────┼───────────────────────────────┘
                          │ implements
              ┌───────────┴───────────┐
              ▼                       ▼
┌─────────────────────────┐  ┌────────────────────────────┐
│  Web Platform           │  │  Electron Platform         │
│                         │  │                            │
│  SonnerNotification     │  │  ElectronNotification      │
│  Display                │  │  Decorator                 │
│                         │  │                            │
│  - toast.success()      │  │  - wraps: SonnerDisplay    │
│  - toast.error()        │  │  - adds: OS Notification   │
│                         │  │                            │
│  ✅ Знает о sonner      │  │  ✅ Знает о Web + Electron │
│  ❌ НЕ знает о Electron │  │                            │
└─────────────────────────┘  └────────────────────────────┘
```

---

## 🔄 Data Flow

### **Web (только toast):**
```
1. Application Layer
   notify({ level: 'error', message: 'Failed!' })
   ↓
2. WebNotificationManager (Infrastructure)
   - Генерирует ID: "notification-1234"
   - Сохраняет в history[]
   - Делегирует: display.show(notification)
   ↓
3. SonnerNotificationDisplay (Presentation/Web)
   - toast.error('Failed!')
   ↓
4. UI
   [Toast в окне приложения]
```

### **Electron (toast + OS):**
```
1. Application Layer
   notify({ level: 'error', message: 'Sync failed!' })
   ↓
2. WebNotificationManager (Infrastructure)
   - Генерирует ID: "notification-5678"
   - Сохраняет в history[]
   - Делегирует: display.show(notification)
   ↓
3. ElectronNotificationDecorator (Presentation/Electron)
   - baseDisplay.show(notification)  // ← Делегирует Web Display
     ↓
     3.1. SonnerNotificationDisplay
          - toast.error('Sync failed!')
   - shouldShowInOS(notification)  // ← Проверяет level === 'error'
     ↓ true
   - new Notification('App', { body: 'Sync failed!' })
   ↓
4. UI
   [Toast в окне] + [OS notification в трее]
```

---

## 🚀 Platform Detection (Entry Points)

### **Web Entry Point:**
```typescript
// @/presentation/web/react/src/init.ts
import { SonnerNotificationDisplay } from './adapters/SonnerNotificationDisplay'

export function initializeApp() {
  // Чистый Web - только toast
  const display = new SonnerNotificationDisplay()
  const manager = new WebNotificationManager(display)
  
  ServiceContainer.initialize({ notificationManager: manager })
}
```

**Результат:** Только toast в окне

---

### **Electron Entry Point:**
```typescript
// @/presentation/electron/init.electron.ts
import { SonnerNotificationDisplay } from '@/presentation/web/react/adapters/SonnerNotificationDisplay'
import { ElectronNotificationDecorator } from './adapters/ElectronNotificationDecorator'

export function initializeApp() {
  // 1️⃣ Переиспользуем Web Display
  const webDisplay = new SonnerNotificationDisplay()
  
  // 2️⃣ Оборачиваем в Decorator (добавляет OS)
  const electronDisplay = new ElectronNotificationDecorator(webDisplay)
  
  // 3️⃣ Передаем в Manager
  const manager = new WebNotificationManager(electronDisplay)
  
  ServiceContainer.initialize({ notificationManager: manager })
}
```

**Результат:** Toast + OS notifications (для error/warning)

---

## 🔧 Build Configuration

### **Vite Config (уже настроен):**

```typescript
// src/presentation/web/react/vite.config.ts
export default defineConfig(({ mode }) => {
  const isElectron = process.env.PLATFORM === 'electron';
  
  return {
    resolve: {
      alias: {
        // ✅ Динамический выбор entry point по платформе
        // @init (без /) чтобы не конфликтовать с @/* = ./src/*
        '@init': isElectron
          ? path.resolve(__dirname, '../../../electron/init.electron.ts')
          : path.resolve(__dirname, './src/init.ts')
      }
    }
  };
});
```

### **Root Component (использует алиас):**

```typescript
// src/presentation/web/react/src/root.tsx
import { initializeApp } from '@init'  // ← Алиас! Vite автоматически выбирает

const appServices = initializeApp()  // Web или Electron - прозрачно
```

**Примечание:** В текущей версии Web использует локальный импорт `"./init"`. 
Для Electron версии нужно будет изменить на `"@init"` алиас.

### **Package.json Scripts (будущее):**

```json
{
  "scripts": {
    "dev:web": "pnpm --filter @password-manager/web dev",
    "build:web": "pnpm --filter @password-manager/web build",
    
    "dev:electron": "PLATFORM=electron pnpm dev:web && electron .",
    "build:electron": "PLATFORM=electron pnpm build:web && electron-builder"
  }
}
```

**Примечание:** Electron scripts будут добавлены при настройке Electron окружения.

---

## 🎯 Как работает автоматическое переключение:

### **Web build:**
```bash
pnpm dev:web
# → PLATFORM не установлен
# → Vite resolve: @init → init.ts
# → Bundle: SonnerNotificationDisplay
```

### **Electron build (будущее):**
```bash
PLATFORM=electron pnpm dev:web
# → PLATFORM=electron
# → Vite resolve: @init → init.electron.ts
# → Bundle: SonnerNotificationDisplay + ElectronNotificationDecorator
```

**Web код НЕ изменяется!** Только environment variable меняет поведение.

**Примечание:** Для активации алиаса в root.tsx нужно будет изменить:
```typescript
// Было:
import { initializeApp } from "./init"

// Станет:
import { initializeApp } from "@init"
```

---

## ✅ Преимущества архитектуры

### **1. Полная независимость Web**
```typescript
// Web код НИКОГДА не изменяется для Electron
const display = new SonnerNotificationDisplay()  // ← Всегда одинаково
```

### **2. Open/Closed Principle**
- Web **закрыт для модификаций** (не меняется)
- Electron **открыт для расширения** (добавляет через Decorator)

### **3. Dependency Inversion**
```typescript
// Infrastructure НЕ зависит от Presentation
class WebNotificationManager {
  constructor(private display: INotificationDisplay) {}  // ← Интерфейс!
}
```

### **4. Легко тестировать**
```typescript
// Mock Display для тестов
class MockDisplay implements INotificationDisplay {
  calls: Notification[] = []
  show(n: Notification) { this.calls.push(n) }
}

const display = new MockDisplay()
const manager = new WebNotificationManager(display)

manager.notify({ level: 'info', message: 'Test' })
expect(display.calls).toHaveLength(1)
```

### **5. Расширяемость**
```typescript
// Цепочка декораторов
const display = new LoggingDecorator(
  new AnalyticsDecorator(
    new ElectronNotificationDecorator(
      new SonnerNotificationDisplay()
    )
  )
)
```

---

## 🔮 Будущие расширения

### **1. Focus-Aware стратегия**
```typescript
// ElectronNotificationDecorator
private shouldShowInOS(notification: Notification): boolean {
  const { BrowserWindow } = require('electron')
  const isAppFocused = BrowserWindow.getFocusedWindow() !== null
  
  // Показывать OS только если окно не в фокусе
  return !isAppFocused && (
    notification.level === 'error' || 
    notification.level === 'warning'
  )
}
```

### **2. Configurable стратегия**
```typescript
interface NotificationStrategy {
  shouldShowInOS(notification: Notification): boolean
}

class ElectronNotificationDecorator {
  constructor(
    baseDisplay: INotificationDisplay,
    strategy: NotificationStrategy = new DefaultStrategy()
  ) {}
}
```

### **3. Sound для критичных**
```typescript
class ElectronNotificationDecorator {
  private showOSNotification(notification: Notification): void {
    new Notification('App', {
      body: notification.message,
      silent: notification.level !== 'error'  // Звук только для ошибок
    })
  }
}
```

### **4. Mobile Platform**
```typescript
// @/presentation/mobile/adapters/MobileNotificationDecorator.ts
class MobileNotificationDecorator implements INotificationDisplay {
  constructor(private baseDisplay: INotificationDisplay) {}
  
  show(notification: Notification): void {
    this.baseDisplay.show(notification)
    
    // Используем React Native Push Notifications
    if (this.shouldShowPush(notification)) {
      PushNotification.localNotification({
        title: 'Password Manager',
        message: notification.message
      })
    }
  }
}
```

---

## 📁 Структура файлов

```
src/
├── application/
│   └── ports/
│       ├── INotificationManager.ts           # Бизнес-контракт
│       └── types/
│           └── Notification.ts               # Типы данных
│
├── infrastructure/
│   └── notifications/
│       ├── INotificationDisplay.ts           # Display контракт
│       ├── WebNotificationManager.ts         # Реализация Manager
│       └── ConsoleNotificationManager.ts     # Для тестов/CLI
│
└── presentation/
    ├── web/
    │   └── react/
    │       ├── src/
    │       │   ├── init.ts                   # Web entry point
    │       │   └── adapters/
    │       │       └── SonnerNotificationDisplay.ts  # Web Display
    │       └── ...
    │
    └── electron/
        ├── init.electron.ts                  # Electron entry point
        └── adapters/
            └── ElectronNotificationDecorator.ts  # Electron расширение
```

---

## 🎓 Используемые паттерны

| Паттерн | Где | Зачем |
|---------|-----|-------|
| **Strategy** | INotificationDisplay | Разные стратегии отображения |
| **Adapter** | SonnerNotificationDisplay | Адаптирует sonner к интерфейсу |
| **Decorator** | ElectronNotificationDecorator | Расширяет Web без изменений |
| **Facade** | WebNotificationManager | Упрощает работу с нотификациями |
| **Dependency Injection** | Entry points | Platform detection на старте |

---

## 📝 Ключевые принципы (повтор)

1. ✅ **Application Layer НЕ знает о платформе**
2. ✅ **Web полностью самодостаточен**
3. ✅ **Electron РАСШИРЯЕТ Web** (а не изменяет)
4. ✅ **DI на уровне entry point** (platform detection)
5. ✅ **Open/Closed Principle** (расширяемость без модификаций)
6. ✅ **Dependency Inversion** (зависимость от интерфейсов)

---

**Автор:** Refactored 2025-01-27  
**Версия:** 2.0 (Decorator Pattern)
