# Platform Configs

**Workspace для platform-specific конфигураций и зависимостей**

---

## 🎯 Что это?

Централизованное место для управления зависимостями, специфичными для разных платформ (Web, Electron, Mobile).

**Проблема которую решаем:**
- ❌ React/Web не должен знать о Electron
- ❌ Vite не должен содержать условную логику по платформам
- ❌ Библиотеки не должны дублироваться

**Решение:**
- ✅ Common конфиг - базовые зависимости (repository, logger)
- ✅ Platform-specific конфиги расширяют common
- ✅ DI - зависимости инжектятся через `createPlatformDependencies()`

---

## 📂 Структура

```
platform-configs/
├── common/
│   └── index.ts              # Базовые зависимости (все платформы)
│
├── web/
│   ├── adapters/
│   │   └── SonnerNotificationDisplay.ts
│   └── index.ts              # Web конфиг (РАСШИРЯЕТ common)
│
└── electron/
    └── index.ts              # Electron конфиг (РАСШИРЯЕТ common)
```

---

## 🔧 Как использовать

### **1. Common конфиг (базовые зависимости):**

```typescript
// common/index.ts
export function createCommonDependencies() {
  return {
    repository: new MockResourceRepository(),
    logger: createConsoleLogger()
  }
}
```

### **2. Web конфиг (расширяет common):**

```typescript
// web/index.ts
export function createPlatformDependencies() {
  const common = createCommonDependencies()  // Базовые
  
  const notificationManager = new WebNotificationManager(
    new SonnerNotificationDisplay()
  )
  
  return { ...common, notificationManager }
}
```

### **3. Electron конфиг (расширяет common + переопределяет):**

```typescript
// electron/index.ts
export function createPlatformDependencies() {
  const common = createCommonDependencies()  // Базовые
  
  // Decorator Pattern - расширяем Web
  const notificationManager = new WebNotificationManager(
    new ElectronNotificationDecorator(
      new SonnerNotificationDisplay()
    )
  )
  
  const logger = createElectronLogger()  // Переопределяем
  
  return { ...common, notificationManager, logger }
}
```

### **4. React (НЕ знает о платформе):**

```typescript
// web/react/src/root.tsx
import { createPlatformDependencies } from '../configs/platform.config'

const deps = createPlatformDependencies()  // ← Какая платформа? НЕ знаем!
const appServices = initializeApp(deps)
```

---

## 🛠️ Как добавить новую зависимость

### **Общая для всех платформ:**

```typescript
// common/index.ts
export interface CommonDependencies {
  repository: IResourceRepository
  logger: ILogger
  storage: IStorage  // ← Новая
}

export function createCommonDependencies() {
  return {
    repository: new MockResourceRepository(),
    logger: createConsoleLogger(),
    storage: new LocalStorage()  // ← Новая
  }
}
```

### **Специфичная для платформы:**

```typescript
// electron/index.ts
export function createPlatformDependencies() {
  const common = createCommonDependencies()
  
  // Electron-специфичная
  const ipc = new ElectronIPC()
  
  return { ...common, ipc }
}
```

---

## 🚀 Добавить новую платформу (Mobile)

**1. Создать конфиг:**

```typescript
// mobile/index.ts
import { createCommonDependencies } from '../common'

export function createPlatformDependencies() {
  const common = createCommonDependencies()
  
  // Mobile-специфичные
  const notificationManager = new WebNotificationManager(
    new MobileNotificationDisplay()
  )
  
  return { ...common, notificationManager }
}
```

**2. Обновить tsconfig:**

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

**3. Использовать в Mobile app:**

```typescript
// mobile/react-native/App.tsx
import { createPlatformDependencies } from '@password-manager/platform-configs/mobile'

const deps = createPlatformDependencies()
initializeApp(deps)
```

---

## 📋 Зависимости

### **Что НЕ должно быть здесь:**
- ❌ Бизнес-логика (Domain, Application)
- ❌ UI компоненты React
- ❌ Роутинг

### **Что ДОЛЖНО быть здесь:**
- ✅ Адаптеры к внешним библиотекам (sonner, electron)
- ✅ Platform-specific реализации интерфейсов
- ✅ DI конфигурация

---

## 🔗 Документация

Полная документация: [`/docs/PLATFORM_CONFIGS_ARCHITECTURE.md`](../../../docs/PLATFORM_CONFIGS_ARCHITECTURE.md)

---

## ⚠️ Правила

### **DO ✅**
- ✅ Базовые зависимости в `common/`
- ✅ Platform-specific в `web/` или `electron/`
- ✅ Decorator Pattern для расширения
- ✅ Типизация всех зависимостей

### **DON'T ❌**
- ❌ НЕ дублировать common зависимости
- ❌ НЕ использовать `any`
- ❌ НЕ использовать `@ts-ignore`
- ❌ НЕ добавлять platform логику в Web адаптеры
