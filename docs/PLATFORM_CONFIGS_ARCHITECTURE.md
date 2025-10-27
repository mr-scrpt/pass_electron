# Platform Configs Architecture

**Статус:** ✅ Реализовано (2025-01-27)  
**Версия:** 2.0 (Common Config + DI)

---

## 🎯 Главная цель

**Изоляция platform-specific зависимостей** от React/Web приложения через:
- Dependency Injection (DI)
- Common конфиг для базовых зависимостей
- Build-time подмена конфигов для разных платформ

---

## 📦 Архитектура

### **Структура** `[#structure:presentation/platform-configs/]`

```
src/presentation/
├── platform-configs/              # ← Platform Configs workspace
│   ├── package.json              # sonner, MockResourceRepository
│   ├── tsconfig.json             # TypeScript для platform-configs
│   │
│   ├── common/                   # ← БАЗОВЫЕ зависимости (все платформы)
│   │   └── index.ts              # createCommonDependencies()
│   │
│   ├── web/                      # ← WEB конфиг
│   │   ├── adapters/
│   │   │   └── SonnerNotificationDisplay.ts
│   │   └── index.ts              # createPlatformDependencies()
│   │
│   └── electron/                 # ← ELECTRON конфиг
│       └── index.ts              # createPlatformDependencies()
│
├── web/react/                    # ← React приложение
│   ├── package.json              # sonner (для UI), platform-configs
│   ├── configs/
│   │   └── platform.config.ts    # ← ПОДМЕНЯЕТСЯ build script
│   └── src/
│       ├── init.ts               # initializeApp(deps)
│       └── root.tsx              # createPlatformDependencies()
│
└── electron/
    └── scripts/
        └── prepare-web.sh        # ← Build script (подмена конфига)
```

---

## 🏗️ Три уровня конфигурации

### **1. Common Config** `[#structure:platform-configs/common/]`

Базовые зависимости, **общие для ВСЕХ платформ**:

```typescript
// src/presentation/platform-configs/common/index.ts
import { MockResourceRepository } from '@/infrastructure/repositories'
import type { ILogger } from '@/application/ports'
import type { IResourceRepository } from '@/domain/resource/repositories'

export interface CommonDependencies {
  repository: IResourceRepository
  logger: ILogger
}

export function createCommonDependencies(): CommonDependencies {
  console.log('[Platform Config] 📦 Loading COMMON dependencies')
  
  const repository = new MockResourceRepository()  // Общий для всех
  const logger = createConsoleLogger()             // Дефолтный
  
  return { repository, logger }
}
```

**Принципы:**
- ✅ Содержит ТОЛЬКО общие зависимости
- ✅ НЕ содержит platform-specific логику
- ✅ Может быть переопределен платформой

---

### **2. Web Config** `[#structure:platform-configs/web/]`

**РАСШИРЯЕТ** common, добавляет Web-специфичные зависимости:

```typescript
// src/presentation/platform-configs/web/index.ts
import { SonnerNotificationDisplay } from './adapters/SonnerNotificationDisplay'
import { WebNotificationManager } from '@/infrastructure/notifications'
import { createCommonDependencies } from '../common'

export interface PlatformDependencies {
  notificationManager: INotificationManager
  logger: ILogger
  repository: IResourceRepository
}

export function createPlatformDependencies(): PlatformDependencies {
  console.log('[Platform Config] 🌐 Loading WEB configuration')
  
  // ✅ Получаем базовые зависимости из common
  const common = createCommonDependencies()
  
  // ✅ Добавляем Web-специфичные
  const display = new SonnerNotificationDisplay()
  const notificationManager = new WebNotificationManager(display)
  
  return {
    ...common,  // repository, logger
    notificationManager
  }
}
```

**Адаптер:** `SonnerNotificationDisplay` `[#class:SonnerNotificationDisplay]`

```typescript
// src/presentation/platform-configs/web/adapters/SonnerNotificationDisplay.ts
import type { Notification } from '@/application/ports'
import type { INotificationDisplay } from '@/infrastructure/notifications'
import { toast } from 'sonner'

export class SonnerNotificationDisplay implements INotificationDisplay {
  show(notification: Notification): void {
    switch (notification.level) {
      case 'success': toast.success(notification.message, { id: notification.id }); break
      case 'error': toast.error(notification.message, { id: notification.id }); break
      case 'info': toast.info(notification.message, { id: notification.id }); break
      case 'warning': toast.warning(notification.message, { id: notification.id }); break
    }
  }

  dismiss(id: string): void {
    toast.dismiss(id)
  }

  dismissAll(): void {
    toast.dismiss()
  }
}
```

**Принципы:**
- ✅ РАСШИРЯЕТ common (не дублирует)
- ✅ Добавляет ТОЛЬКО Web-специфичное (notifications)
- ✅ НЕ знает об Electron

---

### **3. Electron Config** `[#structure:platform-configs/electron/]`

**РАСШИРЯЕТ** common + **ПЕРЕОПРЕДЕЛЯЕТ** logger:

```typescript
// src/presentation/platform-configs/electron/index.ts
import { SonnerNotificationDisplay } from '../web/adapters/SonnerNotificationDisplay'
import { ElectronNotificationDecorator } from '@/presentation/electron/adapters/ElectronNotificationDecorator'
import { WebNotificationManager } from '@/infrastructure/notifications'
import { createCommonDependencies } from '../common'

export function createPlatformDependencies(): PlatformDependencies {
  console.log('[Platform Config] ⚡ Loading ELECTRON configuration')
  
  // ✅ Получаем базовые зависимости из common
  const common = createCommonDependencies()
  
  // ✅ Добавляем Electron-специфичные: Notification system
  // 1️⃣ Переиспользуем Web адаптер
  const webDisplay = new SonnerNotificationDisplay()
  
  // 2️⃣ РАСШИРЯЕМ через Decorator (добавляет OS notifications)
  const electronDisplay = new ElectronNotificationDecorator(webDisplay)
  const notificationManager = new WebNotificationManager(electronDisplay)
  
  // ✅ ПЕРЕОПРЕДЕЛЯЕМ logger на Electron-specific (файловый лог)
  const logger = createElectronLogger()
  
  return {
    ...common,  // repository из common
    notificationManager,
    logger  // ПЕРЕОПРЕДЕЛЯЕМ ConsoleLogger
  }
}
```

**Decorator:** `ElectronNotificationDecorator` `[#class:ElectronNotificationDecorator]`

```typescript
// src/presentation/electron/adapters/ElectronNotificationDecorator.ts
/// <reference lib="dom" />

import type { Notification as AppNotification } from '@/application/ports'
import type { INotificationDisplay } from '@/infrastructure/notifications'

export class ElectronNotificationDecorator implements INotificationDisplay {
  constructor(private readonly baseDisplay: INotificationDisplay) {}

  show(notification: AppNotification): void {
    // 1️⃣ ВСЕГДА показываем через базовый Display (toast в окне)
    this.baseDisplay.show(notification)

    // 2️⃣ ДОПОЛНИТЕЛЬНО показываем в OS (если важное)
    if (this.shouldShowInOS(notification)) {
      this.showOSNotification(notification)
    }
  }

  private shouldShowInOS(notification: AppNotification): boolean {
    return notification.level === 'error' || notification.level === 'warning'
  }

  private showOSNotification(notification: AppNotification): void {
    // Feature detection
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    // Создаем OS notification через Web API
    new Notification('Password Manager', {
      body: notification.message,
      tag: notification.id,
      requireInteraction: notification.level === 'error'
    })
  }

  dismiss(id: string): void {
    this.baseDisplay.dismiss(id)
  }

  dismissAll(): void {
    this.baseDisplay.dismissAll()
  }
}
```

**Принципы:**
- ✅ РАСШИРЯЕТ Web через Decorator Pattern
- ✅ ПЕРЕОПРЕДЕЛЯЕТ только нужное (logger)
- ✅ Переиспользует Web адаптер (не дублирует)

---

## 🔄 Dependency Injection Flow

### **Web standalone:**

```
1. root.tsx
   ↓
2. createPlatformDependencies()  ← platform-configs/web
   ↓
3. createCommonDependencies()    ← platform-configs/common
   ↓
4. { repository, logger, notificationManager }
   ↓
5. initializeApp(deps)
   ↓
6. ServiceContainer.initialize(deps)
```

### **Electron:**

```
1. root.tsx
   ↓
2. createPlatformDependencies()  ← platform-configs/electron (ПОДМЕНЕНО!)
   ↓
3. createCommonDependencies()    ← platform-configs/common
   ↓
4. ElectronNotificationDecorator(SonnerDisplay)  ← РАСШИРЕНИЕ
   ↓
5. { repository, logger (Electron), notificationManager }
   ↓
6. initializeApp(deps)
   ↓
7. ServiceContainer.initialize(deps)
```

---

## 🛠️ Build Script для Electron

### **prepare-web.sh** `[#structure:electron/scripts/]`

```bash
#!/bin/bash

# Копирует Web → Electron/.build/web/
# ПОДМЕНЯЕТ configs/platform.config.ts на Electron версию

set -e

echo "📦 Preparing Web for Electron..."

WEB_SRC="src/presentation/web/react"
BUILD_DIR="src/presentation/electron/.build/web"

# 1️⃣ Очистить старую сборку
rm -rf "$BUILD_DIR"

# 2️⃣ Копировать Web
cp -r "$WEB_SRC" "$BUILD_DIR"

# 3️⃣ ПОДМЕНИТЬ конфиг
cat > "$BUILD_DIR/configs/platform.config.ts" << 'EOF'
/**
 * Platform Configuration - Electron Entry Point
 * 
 * ⚠️ ЭТОТ ФАЙЛ ПОДМЕНЕН Electron build script!
 */
export * from '@password-manager/platform-configs/electron'
EOF

echo "✅ Web prepared for Electron!"
```

### **Реэкспорт конфигов:**

**Web version** (дефолт):
```typescript
// src/presentation/web/react/configs/platform.config.ts
export * from '@password-manager/platform-configs/web'
```

**Electron version** (подменяется):
```typescript
// src/presentation/electron/.build/web/configs/platform.config.ts
export * from '@password-manager/platform-configs/electron'
```

---

## 📋 Package Dependencies

### **Root package.json:**
```json
{
  "dependencies": {
    "@sweet-monads/either": "^3.3.1"
  }
}
```

### **platform-configs/package.json:**
```json
{
  "name": "@password-manager/platform-configs",
  "dependencies": {
    "sonner": "^2.0.7"
  }
}
```

### **web/react/package.json:**
```json
{
  "dependencies": {
    "@password-manager/platform-configs": "workspace:*",
    "sonner": "^2.0.7"  ← Для UI компонента <Toaster />
  }
}
```

**Почему `sonner` в двух местах?**
- `platform-configs` - для адаптера (вызывает `toast.success()`)
- `web/react` - для UI компонента (`<Toaster />` рендерит toast'ы)

---

## 🎨 React Integration

### **init.ts** `[#structure:web/react/src/]`

```typescript
// src/presentation/web/react/src/init.ts
import { ServiceContainer } from "@/composition"
import type { INotificationManager, ILogger } from "@/application/ports"
import type { IResourceRepository } from "@/domain/resource/repositories"

export interface PlatformDependencies {
  notificationManager: INotificationManager
  logger: ILogger
  repository: IResourceRepository
}

export function initializeApp(deps: PlatformDependencies): AppServices | null {
  ServiceContainer.initialize({
    repository: deps.repository,
    logger: deps.logger,
    notificationManager: deps.notificationManager
  })
  
  return { notificationManager: deps.notificationManager }
}
```

### **root.tsx** `[#structure:web/react/src/]`

```typescript
// src/presentation/web/react/src/root.tsx
import { Toaster } from "sonner"
import { initializeApp } from "./init"
import { createPlatformDependencies } from "../configs/platform.config"

// ✅ Получаем platform-specific зависимости
const deps = createPlatformDependencies()
const appServices = initializeApp(deps)

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  )
}
```

**Принципы:**
- ✅ React НЕ создает зависимости сам
- ✅ React НЕ знает о платформе
- ✅ Все через DI

---

## 🔧 TypeScript Configuration

### **platform-configs/tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    
    "baseUrl": "../../..",
    "paths": {
      "@/domain": ["src/domain/index.ts"],
      "@/application": ["src/application/index.ts"],
      "@/infrastructure": ["src/infrastructure/index.ts"],
      "@/composition": ["src/composition/index.ts"],
      "@/presentation/*": ["src/presentation/*"]
    }
  },
  "include": [
    "common/**/*.ts",
    "web/**/*.ts",
    "electron/**/*.ts"
  ]
}
```

**Ключевые моменты:**
- `baseUrl: "../../.."` - корень проекта
- `paths` - указывают на DDD слои
- `include` - все три конфига (common, web, electron)

---

## ✅ Принципы архитектуры

### **1. Common First**
```typescript
// ❌ НЕПРАВИЛЬНО - дублирование
// web/index.ts
const repository = new MockResourceRepository()
const logger = createConsoleLogger()

// electron/index.ts
const repository = new MockResourceRepository()  // Дубликат!
const logger = createElectronLogger()
```

```typescript
// ✅ ПРАВИЛЬНО - common + расширение
// common/index.ts
export function createCommonDependencies() {
  return {
    repository: new MockResourceRepository(),
    logger: createConsoleLogger()
  }
}

// electron/index.ts
const common = createCommonDependencies()
const logger = createElectronLogger()  // Переопределяем
return { ...common, logger }
```

### **2. Decorator Pattern для расширения**
```typescript
// ❌ НЕПРАВИЛЬНО - изменяем Web адаптер
class SonnerNotificationDisplay {
  show(notification) {
    toast.success(notification.message)
    
    if (isElectron) {  // ← ПЛОХО! Web знает об Electron
      showOSNotification(notification)
    }
  }
}
```

```typescript
// ✅ ПРАВИЛЬНО - Decorator расширяет
class ElectronNotificationDecorator {
  constructor(private baseDisplay: INotificationDisplay) {}
  
  show(notification) {
    this.baseDisplay.show(notification)  // ← Делегируем Web
    if (this.shouldShowInOS(notification)) {
      this.showOSNotification(notification)  // ← Добавляем OS
    }
  }
}
```

### **3. React не знает о платформе**
```typescript
// ❌ НЕПРАВИЛЬНО
const display = isElectron 
  ? new ElectronNotificationDecorator(...)
  : new SonnerNotificationDisplay()

// ✅ ПРАВИЛЬНО
const deps = createPlatformDependencies()  // ← Не знаем что внутри!
initializeApp(deps)
```

---

## 🚀 Как добавить новую платформу (Mobile)

### **1. Создать конфиг:**

```typescript
// src/presentation/platform-configs/mobile/index.ts
import { createCommonDependencies } from '../common'
import { MobileNotificationDisplay } from './adapters/MobileNotificationDisplay'

export function createPlatformDependencies(): PlatformDependencies {
  const common = createCommonDependencies()
  
  // Mobile-специфичные
  const display = new MobileNotificationDisplay()
  const notificationManager = new WebNotificationManager(display)
  
  return {
    ...common,
    notificationManager
  }
}
```

### **2. Создать адаптер:**

```typescript
// src/presentation/platform-configs/mobile/adapters/MobileNotificationDisplay.ts
import type { Notification } from '@/application/ports'
import type { INotificationDisplay } from '@/infrastructure/notifications'
import { ToastAndroid } from 'react-native'

export class MobileNotificationDisplay implements INotificationDisplay {
  show(notification: Notification): void {
    ToastAndroid.show(notification.message, ToastAndroid.SHORT)
  }
  // ...
}
```

### **3. Обновить tsconfig:**

```json
{
  "include": [
    "common/**/*.ts",
    "web/**/*.ts",
    "electron/**/*.ts",
    "mobile/**/*.ts"  // ← Добавили
  ]
}
```

### **4. Создать Mobile entry point:**

```typescript
// src/presentation/mobile/react-native/App.tsx
import { createPlatformDependencies } from '@password-manager/platform-configs/mobile'

const deps = createPlatformDependencies()
initializeApp(deps)
```

**Готово!** Все базовые зависимости переиспользуются из common.

---

## 📊 Диаграммы

### **Архитектура зависимостей** `[#diagram:architecture]`

```
┌─────────────────────────────────────────────────┐
│  DDD Layers (Domain, Application, Infrastructure) │
│  - IResourceRepository                           │
│  - INotificationManager                          │
│  - ILogger                                       │
└────────────────┬────────────────────────────────┘
                 │ implements
          ┌──────┴────────┐
          │               │
┌─────────▼─────┐  ┌──────▼──────────┐
│ platform-      │  │ Presentation    │
│ configs        │  │ (Web/Electron)  │
│ - Common       │  │ - Adapters      │
│ - Web          │  │ - UI Components │
│ - Electron     │  │ - Routes        │
└────────────────┘  └─────────────────┘
```

### **Поток инициализации** `[#diagram:flow]`

```
┌──────────────────────────────────────┐
│  root.tsx (React)                     │
└────────────┬─────────────────────────┘
             ↓
┌────────────▼─────────────────────────┐
│  configs/platform.config.ts           │
│  (реэкспортирует нужный конфиг)      │
└────────────┬─────────────────────────┘
             ↓
┌────────────▼─────────────────────────┐
│  platform-configs/web или electron    │
│  createPlatformDependencies()         │
└────────────┬─────────────────────────┘
             ↓
┌────────────▼─────────────────────────┐
│  platform-configs/common              │
│  createCommonDependencies()           │
└────────────┬─────────────────────────┘
             ↓
┌────────────▼─────────────────────────┐
│  { repository, logger, notificationManager } │
└────────────┬─────────────────────────┘
             ↓
┌────────────▼─────────────────────────┐
│  init.ts                              │
│  initializeApp(deps)                  │
└────────────┬─────────────────────────┘
             ↓
┌────────────▼─────────────────────────┐
│  ServiceContainer.initialize(deps)    │
└───────────────────────────────────────┘
```

---

## 🧪 Тестирование

### **Проверка Web:**

```bash
pnpm dev:web
```

**Консоль браузера:**
```
[Platform Config] 📦 Loading COMMON dependencies
[Platform Config] 🌐 Loading WEB configuration
[App] ✅ ServiceContainer initialized successfully
```

### **Проверка Electron:**

```bash
pnpm build:electron
```

**Консоль Electron:**
```
[Platform Config] 📦 Loading COMMON dependencies
[Platform Config] ⚡ Loading ELECTRON configuration
[App] ✅ ServiceContainer initialized successfully
```

---

## 📝 Команды

```bash
# Development
pnpm dev:web                  # Web dev server

# Build
pnpm build:web                # Web production build
pnpm prepare:electron         # Подготовить Web для Electron
pnpm build:electron:web       # Собрать Web внутри Electron
pnpm build:electron           # Полная сборка Electron

# TypeScript
pnpm typecheck                # Проверка Web
cd src/presentation/platform-configs && npx tsc --noEmit  # Проверка platform-configs
```

---

## ⚠️ Правила и ограничения

### **DO ✅**
- ✅ Базовые зависимости в `common/`
- ✅ Platform-specific в `web/` или `electron/`
- ✅ Decorator Pattern для расширения Web
- ✅ Типизация всех зависимостей (IResourceRepository, ILogger)
- ✅ DI через `createPlatformDependencies()`

### **DON'T ❌**
- ❌ НЕ дублировать common зависимости в платформах
- ❌ НЕ использовать `any` для типов
- ❌ НЕ использовать `@ts-ignore` или `@ts-expect-error`
- ❌ НЕ добавлять platform логику в Web адаптеры
- ❌ НЕ изменять Web Display для Electron

---

## 🔗 Связанные документы

- `docs/NOTIFICATION_ARCHITECTURE.md` - детали системы нотификаций
- `docs/COMPOSITION_LAYER.md` - DI и ServiceContainer
- `docs/PROJECT_STRUCTURE.md` - общая структура проекта

---

**Последнее обновление:** 2025-01-27  
**Версия:** 2.0
