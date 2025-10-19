# Electron - Packaging Layer

> **⚠️ Ключевая концепция**: Electron **НЕ является частью архитектуры приложения**. Это **packaging layer** - способ упаковки веб-приложения в desktop формат.

---

## 🎯 Философия

Наше приложение построено на **Clean Architecture** и может работать в разных окружениях:

- 🌐 **Web** - браузер (любой современный браузер)
- 🖥️ **Desktop** - Electron (Windows, macOS, Linux)
- 💻 **CLI** - командная строка (потенциально в будущем)

**Electron - это лишь одна из упаковок того же приложения.**

```
┌───────────────────────────────────────────────┐
│         Packaging Layer (Interchangeable)     │
│                                               │
│  ┌──────────┐  ┌──────┐  ┌──────────┐        │
│  │ Electron │  │ Web  │  │   CLI    │        │
│  │ (Desktop)│  │(Browser)│(Terminal)│        │
│  └────┬─────┘  └───┬──┘  └────┬─────┘        │
└───────┼────────────┼──────────┼───────────────┘
        │            │          │
        └────────────┼──────────┘
                     ▼
┌───────────────────────────────────────────────┐
│      Application (Clean Architecture)         │
│   Presentation → Composition → Application    │
│            → Domain ← Infrastructure          │
│                                               │
│   ✅ НЕ ЗНАЕТ об Electron                    │
│   ✅ Работает в любой среде                  │
└───────────────────────────────────────────────┘
```

---

## 📁 Структура Electron

Electron код должен быть **изолирован** от основного приложения:

```
project/
├── electron/                   # ← Packaging Layer
│   ├── main.ts                # Main process (Node.js)
│   ├── config.ts              # Константы (нет magic strings!)
│   ├── types.ts               # TypeScript типы
│   └── preload.ts             # Preload script (если нужен IPC)
│
├── app/                        # ← Application (НЕ знает об Electron!)
│   ├── routes/
│   ├── composition/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
│
└── docs/
    └── electron/               # ← Документация Electron
        ├── README.md           # Этот файл
        ├── CONFIGURATION.md    # Конфигурация
        └── SECURITY.md         # Безопасность
```

### Принцип разделения:

- **`electron/`** - знает только об упаковке и окне
- **`app/`** - само приложение, **не знает** об Electron
- Никаких импортов из `electron/` в `app/`!

---

## 🏗️ Архитектура Electron

### Main Process vs Renderer Process

```
┌─────────────────────────────────────────┐
│         Main Process (Node.js)          │
│                                         │
│  • Запускает приложение                │
│  • Создает окна (BrowserWindow)        │
│  • Имеет доступ к Node.js API          │
│  • Управляет жизненным циклом          │
│                                         │
│  📄 Файл: electron/main.ts             │
└─────────────┬───────────────────────────┘
              │
              │ создает
              ▼
┌─────────────────────────────────────────┐
│     Renderer Process (Chromium)         │
│                                         │
│  • Веб-страница (React, Remix)         │
│  • НЕТ доступа к Node.js (безопасность)│
│  • Изолированный контекст              │
│  • Общается с Main через IPC           │
│                                         │
│  📁 Код: app/* (наше приложение)       │
└─────────────────────────────────────────┘
```

---

## 📝 Файлы Electron

### `electron/config.ts` - Конфигурация

**Цель**: Убрать все magic strings и числа из кода.

```typescript
/**
 * Electron Configuration
 * Все константы в одном месте!
 */
export const ElectronConfig = {
  /**
   * Размеры окна
   */
  WINDOW: {
    WIDTH: 1200,           // ✅ Не хардкодим в main.ts
    HEIGHT: 800,
    MIN_WIDTH: 800,
    MIN_HEIGHT: 600,
  },

  /**
   * URL и пути
   */
  URLS: {
    DEV_SERVER: 'http://localhost:5173',  // ✅ Порт Remix dev
    PRODUCTION_PATH: '../build/client/index.html',
  },

  /**
   * Настройки безопасности
   */
  SECURITY: {
    NODE_INTEGRATION: false,      // ❌ НЕ давать доступ к Node.js
    CONTEXT_ISOLATION: true,      // ✅ Изолировать контекст
    SANDBOX: true,                // ✅ Включить sandbox
  },

  /**
   * Режимы работы
   */
  MODE: {
    DEVELOPMENT: 'development',   // ✅ Не 'dev', не 'DEV'
    PRODUCTION: 'production',
  },
} as const

// Утилиты
export function getLoadURL(): string {
  return isDevelopment() 
    ? ElectronConfig.URLS.DEV_SERVER 
    : ElectronConfig.URLS.PRODUCTION_PATH
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === ElectronConfig.MODE.DEVELOPMENT
}
```

**Преимущества:**
- ✅ Нет magic strings
- ✅ Легко изменить порт
- ✅ Централизованная конфигурация
- ✅ TypeScript автокомплит
- ✅ Легко тестировать

---

### `electron/types.ts` - Типы

**Цель**: Type safety для Electron кода.

```typescript
/**
 * Electron Types
 */
import type { BrowserWindow as ElectronBrowserWindow } from 'electron'

/**
 * Конфигурация окна браузера
 */
export interface BrowserWindowConfig {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  webPreferences: WebPreferences
}

/**
 * Настройки веб-контента
 */
export interface WebPreferences {
  nodeIntegration: boolean
  contextIsolation: boolean
  sandbox: boolean
}

/**
 * Режим работы приложения
 */
export type AppMode = 'development' | 'production'

/**
 * Состояние приложения
 */
export interface AppState {
  mainWindow: ElectronBrowserWindow | null
  isQuitting: boolean
}
```

**Преимущества:**
- ✅ Автокомплит в IDE
- ✅ Проверка типов на этапе компиляции
- ✅ Документация через типы
- ✅ Рефакторинг безопасен

---

### `electron/main.ts` - Main Process

**Цель**: Чистый код без magic strings, использующий config и types.

```typescript
/**
 * Electron Main Process
 * Точка входа для desktop приложения
 */
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { ElectronConfig, getLoadURL, isDevelopment } from './config'
import type { AppState, BrowserWindowConfig } from './types'

// ES Modules поддержка __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Состояние приложения
const appState: AppState = {
  mainWindow: null,
  isQuitting: false,
}

/**
 * Создать конфигурацию окна
 * ✅ Все значения из config.ts
 */
function createWindowConfig(): BrowserWindowConfig {
  return {
    width: ElectronConfig.WINDOW.WIDTH,        // ✅ Не 1200
    height: ElectronConfig.WINDOW.HEIGHT,      // ✅ Не 800
    minWidth: ElectronConfig.WINDOW.MIN_WIDTH,
    minHeight: ElectronConfig.WINDOW.MIN_HEIGHT,
    webPreferences: {
      nodeIntegration: ElectronConfig.SECURITY.NODE_INTEGRATION,
      contextIsolation: ElectronConfig.SECURITY.CONTEXT_ISOLATION,
      sandbox: ElectronConfig.SECURITY.SANDBOX,
    },
  }
}

/**
 * Создать главное окно приложения
 */
function createWindow(): void {
  const config = createWindowConfig()
  appState.mainWindow = new BrowserWindow(config)

  // Загрузить URL (dev server или production build)
  const loadURL = getLoadURL()  // ✅ Не хардкодим URL
  
  if (isDevelopment()) {
    appState.mainWindow.loadURL(loadURL)
    appState.mainWindow.webContents.openDevTools()
  } else {
    appState.mainWindow.loadFile(path.join(__dirname, loadURL))
  }

  appState.mainWindow.on('closed', () => {
    appState.mainWindow = null
  })
}

// Lifecycle handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

**Ключевые моменты:**
- ✅ Все константы из `config.ts`
- ✅ Типизированное состояние `appState`
- ✅ Функции с одной ответственностью
- ✅ Чистый, читаемый код

---

### `electron/preload.ts` - Preload Script (опционально)

**Цель**: Безопасный мост между Main и Renderer процессами (если нужен IPC).

```typescript
/**
 * Electron Preload Script
 * Работает в изолированном контексте
 */
import { contextBridge, ipcRenderer } from 'electron'

/**
 * API доступный из renderer process
 * window.electronAPI.someMethod()
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Пример: читать файл
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  
  // Пример: записать в clipboard
  writeClipboard: (text: string) => ipcRenderer.invoke('write-clipboard', text),
})
```

**Важно:**
- Используется только если нужны системные API
- Безопасный способ общения Main ↔ Renderer
- Renderer не имеет прямого доступа к Node.js

---

## 🔐 Безопасность

### Критически важные настройки:

```typescript
webPreferences: {
  nodeIntegration: false,      // ❌ НИКОГДА не включайте!
  contextIsolation: true,      // ✅ ВСЕГДА включайте!
  sandbox: true,               // ✅ ВСЕГДА включайте!
}
```

### Почему это важно?

| Настройка | Значение | Почему |
|-----------|----------|--------|
| `nodeIntegration: false` | ❌ Renderer НЕ может использовать Node.js | Защита от XSS атак |
| `contextIsolation: true` | ✅ Изолированный контекст | Разделение preload и renderer |
| `sandbox: true` | ✅ Renderer в изолированной среде | Дополнительная защита |

**Правило:** Renderer process (ваше React приложение) **НЕ ДОЛЖЕН** иметь доступ к Node.js API.

---

## 🚀 Режимы работы

### Development режим:

```typescript
if (isDevelopment()) {
  // Загружаем с Remix dev сервера
  mainWindow.loadURL('http://localhost:5173')
  
  // Открываем DevTools
  mainWindow.webContents.openDevTools()
}
```

**Преимущества:**
- ✅ Hot Module Replacement (HMR)
- ✅ DevTools для отладки
- ✅ Быстрая разработка

### Production режим:

```typescript
if (!isDevelopment()) {
  // Загружаем из build папки
  mainWindow.loadFile(path.join(__dirname, '../build/client/index.html'))
}
```

**Преимущества:**
- ✅ Работает оффлайн
- ✅ Оптимизированный код
- ✅ Готово к распространению

---

## 🎨 Кастомизация

### Изменить размер окна:

```typescript
// electron/config.ts
WINDOW: {
  WIDTH: 1400,      // Изменить с 1200
  HEIGHT: 900,      // Изменить с 800
  MIN_WIDTH: 1000,  // Изменить с 800
  MIN_HEIGHT: 700,  // Изменить с 600
}
```

### Изменить порт dev сервера:

```typescript
// electron/config.ts
URLS: {
  DEV_SERVER: 'http://localhost:3000',  // Изменить с 5173
}
```

### Добавить иконку приложения:

```typescript
// electron/config.ts
WINDOW: {
  ICON_PATH: './resources/icon.png',  // Добавить
}

// electron/main.ts (в createWindowConfig)
icon: path.join(__dirname, ElectronConfig.WINDOW.ICON_PATH)
```

### Добавить меню:

```typescript
// electron/menu.ts (новый файл)
import { Menu } from 'electron'

export function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    // ...
  ]
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// electron/main.ts
import { createAppMenu } from './menu'

app.whenReady().then(() => {
  createAppMenu()  // Создать меню
  createWindow()
})
```

---

## 🔄 Взаимодействие с приложением

### ❌ НЕПРАВИЛЬНО: Приложение знает об Electron

```typescript
// app/some-component.tsx
import { ipcRenderer } from 'electron'  // ❌ НЕТ!

function Component() {
  const handleSave = () => {
    ipcRenderer.send('save-file')  // ❌ Приложение зависит от Electron
  }
}
```

### ✅ ПРАВИЛЬНО: Через Adapter Pattern + DI

> **📘 Полное описание паттерна см. в [ADAPTER_PATTERN_DI.md](../ADAPTER_PATTERN_DI.md)**

**Шаг 1: Порт (интерфейс) в Application Layer**

```typescript
// app/application/ports/IClipboardService.ts
export interface IClipboardService {
  write(text: string): Promise<void>
  read(): Promise<string>
}
```

**Шаг 2: Адаптеры в Infrastructure Layer**

```typescript
// app/infrastructure/clipboard/WebClipboardService.ts (Web версия)
export class WebClipboardService implements IClipboardService {
  async write(text: string): Promise<void> {
    await navigator.clipboard.writeText(text)
  }
  async read(): Promise<string> {
    return await navigator.clipboard.readText()
  }
}

// app/infrastructure/clipboard/ElectronClipboardService.ts (Electron версия)
export class ElectronClipboardService implements IClipboardService {
  async write(text: string): Promise<void> {
    // @ts-ignore - window.electronAPI доступен через preload
    await window.electronAPI.writeClipboard(text)
  }
  async read(): Promise<string> {
    // @ts-ignore
    return await window.electronAPI.readClipboard()
  }
}
```

**Шаг 3: Фабрика адаптеров в Infrastructure (изолирует знание о платформах)**

```typescript
// app/infrastructure/clipboard/ClipboardServiceFactory.ts
import type { IClipboardService } from '~/application/ports'
import { WebClipboardService } from './WebClipboardService'
import { ElectronClipboardService } from './ElectronClipboardService'

/**
 * Фабрика создает правильный адаптер
 * ✅ Infrastructure знает о платформах
 * ✅ Composition НЕ знает о платформах
 */
export class ClipboardServiceFactory {
  static createForWeb(): IClipboardService {
    return new WebClipboardService()
  }
  
  static createForDesktop(): IClipboardService {
    return new ElectronClipboardService()
  }
  
  static createForCLI(): IClipboardService {
    throw new Error('CLI clipboard not implemented')
  }
}
```

**Шаг 4: DI Module принимает готовую реализацию (не знает о платформах)**

```typescript
// app/composition/modules/SystemModule.ts
import type { IClipboardService } from '~/application/ports'

export class SystemModule {
  private static clipboardService: IClipboardService | null = null

  /**
   * Инициализация с готовой реализацией
   * ✅ НЕ знает откуда пришла реализация
   * ✅ Просто принимает IClipboardService
   */
  static initialize(services: {
    clipboard: IClipboardService
  }): void {
    this.clipboardService = services.clipboard
  }

  /**
   * Получить сервис (без if/else!)
   */
  static getClipboardService(): IClipboardService {
    if (!this.clipboardService) {
      throw new Error('SystemModule not initialized')
    }
    return this.clipboardService
  }
}
```

**Шаг 5: ServiceContainer инициализируется готовыми сервисами (не знает о платформах)**

```typescript
// app/composition/ServiceContainer.ts
import { SystemModule } from './modules/SystemModule'
import type { IClipboardService } from '~/application/ports'

/**
 * ServiceContainer принимает готовые реализации
 * ✅ НЕ импортирует ElectronClipboardService или WebClipboardService
 * ✅ НЕ знает об окружениях (Web/Desktop/CLI)
 * ✅ Просто инициализирует модули готовыми сервисами
 */
export class ServiceContainer {
  private static initialized = false

  /**
   * Инициализация с готовыми сервисами
   * ✅ Вызывается ОДИН РАЗ при старте
   */
  static initialize(services: {
    clipboard: IClipboardService
  }): void {
    if (this.initialized) return
    
    // Инициализируем модули готовыми сервисами
    SystemModule.initialize(services)
    
    this.initialized = true
  }

  /**
   * Получить сервис (делегирует модулю)
   */
  static getClipboardService(): IClipboardService {
    if (!this.initialized) {
      throw new Error('ServiceContainer not initialized. Call initialize() first')
    }
    return SystemModule.getClipboardService()
  }
}
```

**Шаг 6: Entry Point создает адаптеры через Фабрику (знает о платформе)**

```typescript
// app/entry.client.tsx (для Web)
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import { ServiceContainer } from '~/composition'
import { ClipboardServiceFactory } from '~/infrastructure/clipboard'

// ✅ Entry point знает что это Web
// ✅ Создает Web адаптер через фабрику
const clipboard = ClipboardServiceFactory.createForWeb()

// ✅ Инициализируем контейнер готовым сервисом
ServiceContainer.initialize({ clipboard })

// Далее обычный Remix код...
hydrateRoot(document, <RemixBrowser />)
```

```typescript
// electron/main.ts (для Desktop)
import { app, BrowserWindow } from 'electron'
import { ServiceContainer } from '../app/composition'
import { ClipboardServiceFactory } from '../app/infrastructure/clipboard'

// ✅ Entry point знает что это Desktop (Electron)
// ✅ Создает Desktop адаптер через фабрику
const clipboard = ClipboardServiceFactory.createForDesktop()

app.whenReady().then(() => {
  // ✅ Инициализируем контейнер готовым сервисом
  ServiceContainer.initialize({ clipboard })
  
  createWindow()
})
```

**Преимущества (тот же подход что Request Parser!):**
- ✅ **Никаких `if/else` при получении сервиса** - только при создании
- ✅ **Инициализация один раз при старте** - адаптеры создаются в entry point
- ✅ **SystemModule не знает о платформах** - просто принимает IClipboardService
- ✅ **ServiceContainer не знает о платформах** - не импортирует Electron/Web адаптеры
- ✅ **Фабрика в Infrastructure** - знание о платформах изолировано
- ✅ **Entry point выбирает адаптер** - `entry.client.tsx` vs `electron/main.ts`
- ✅ **Легко тестировать** - mock при инициализации
- ✅ **Консистентно с Request Parser** - одинаковый подход во всем приложении

**Сравнение с Request Parser:**

| Аспект | Request Parser | Clipboard Service |
|--------|---------------|-------------------|
| Фабрика | `infrastructure/request-parsers/` | `infrastructure/clipboard/ClipboardServiceFactory` |
| Где `if/else` | Entry point | Entry point |
| Что знает Composition | Только интерфейс `IRequestParser` | Только интерфейс `IClipboardService` |
| Инициализация | `ServiceContainer.initialize({ parser })` | `ServiceContainer.initialize({ clipboard })` |

---

## 📦 Сборка и распространение

### Установить electron-builder:

```bash
pnpm add -D electron-builder
```

### Конфигурация в `package.json`:

```json
{
  "scripts": {
    "build": "remix vite:build",
    "package": "electron-builder",
    "package:mac": "electron-builder --mac",
    "package:win": "electron-builder --win",
    "package:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.yourcompany.password-manager",
    "productName": "Password Manager",
    "directories": {
      "buildResources": "resources",
      "output": "dist"
    },
    "files": [
      "electron/**/*",
      "build/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.utilities",
      "target": ["dmg", "zip"],
      "icon": "resources/icon.icns"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "resources/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility",
      "icon": "resources/icon.png"
    }
  }
}
```

### Процесс сборки:

```bash
# 1. Собрать Remix приложение
pnpm build

# 2. Упаковать в Electron
pnpm package

# Результат в dist/
# - Password Manager-1.0.0.dmg (macOS)
# - Password Manager Setup 1.0.0.exe (Windows)
# - password-manager_1.0.0_amd64.deb (Linux)
```

---

## 🎯 Принципы работы с Electron

### 1. Separation of Concerns
- Electron отделен от приложения
- `electron/` vs `app/` - разные миры

### 2. No Magic Strings
- Все константы в `config.ts`
- Централизованная конфигурация

### 3. Type Safety
- Типы в `types.ts`
- Полная типизация Electron кода

### 4. Security First
- Безопасные настройки по умолчанию
- Никакого `nodeIntegration: true`!

### 5. Platform Agnostic
- Приложение не знает об Electron
- Adapter Pattern для системных API
- Легко портировать на Web/CLI

---

## ❓ FAQ

**Q: Зачем отделять Electron от приложения?**  
A: Чтобы приложение могло работать в браузере, CLI и других средах без изменений.

**Q: Можно ли использовать Node.js модули в React компонентах?**  
A: Нет! Renderer process изолирован. Используйте IPC через preload script.

**Q: Как добавить доступ к файловой системе?**  
A: Создайте `IFileSystemService` интерфейс в `application/ports/` и реализуйте `ElectronFileSystemService` в `infrastructure/`.

**Q: Нужно ли менять код приложения для Electron?**  
A: Нет! Приложение работает одинаково. Electron просто запускает Chromium локально.

**Q: Как обновлять приложение?**  
A: Используйте `electron-updater` пакет для автообновлений.

---

## 📚 Дополнительная документация

### Electron-специфичная:
- [CONFIGURATION.md](./CONFIGURATION.md) - Детальная настройка конфигурации
- [SECURITY.md](./SECURITY.md) - Безопасность и best practices
- [IPC.md](./IPC.md) - Inter-Process Communication (если нужен)
- [PACKAGING.md](./PACKAGING.md) - Сборка и распространение

### Архитектура приложения:
- [../ADAPTER_PATTERN_DI.md](../ADAPTER_PATTERN_DI.md) - Канонический подход к внедрению внешних зависимостей
- [../COMPOSITION_LAYER.md](../COMPOSITION_LAYER.md) - Composition Layer и DI
- [../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Структура проекта и архитектурные границы

---

## 🔗 Полезные ссылки

- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Builder](https://www.electron.build/)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
