# Шаг 0: Настройка окружения и зависимостей

## 🎯 Цель

Подготовить проект с нуля: установить все необходимые зависимости, настроить TypeScript, Remix, Electron, Tailwind CSS и создать базовую структуру.

> **📦 Менеджер пакетов**: В этом проекте используется **pnpm**. Если он не установлен:
> ```bash
> npm install -g pnpm
> ```

---

## 💡 Как и Next.js, Remix CLI делает все за вас!

### ✅ Что Remix CLI создает автоматически (одной командой):

- TypeScript + `tsconfig.json`
- React + React DOM + все типы
- Remix (@remix-run/node, @remix-run/react, @remix-run/dev, @remix-run/serve)
- Vite + `vite.config.ts`
- ESLint + `.eslintrc.cjs`
- `.gitignore`
- `app/root.tsx` (root layout)
- `app/routes/_index.tsx` (главная страница)
- `package.json` с готовыми scripts

### 🔧 Что нужно добавить **для нашего проекта**:

- **Electron** (desktop-специфично)
- **Tailwind CSS** (опционально, можно выбрать при инициализации)
- **Concurrently + wait-on** (для запуска Electron с Remix dev server)
- **Prettier** (опционально)
- **Структура папок DDD** (Domain, Application, Infrastructure, Composition)
- **Electron main process** (`electron/main.ts`)

> **Итого:** Remix CLI уже настроил ~90% проекта. Нам нужно только добавить Electron и DDD структуру!

---

## 📦 Технологический стек

### Основные зависимости
- **Remix** - Full-stack фреймворк для React
- **Electron** - Desktop приложение
- **React** - UI библиотека
- **TypeScript** - Типизация
- **Tailwind CSS** - Стили

### Dev зависимости
- **Vite** - Сборщик (используется Remix)
- **ESLint** - Линтер
- **Prettier** - Форматирование кода

---

## 🚀 Шаг 1: Инициализация проекта

### 1.1 Создать Remix проект (все в одной команде!)

```bash
# Создаем проект с Remix
pnpm create remix@latest

# Выбираем опции:
# ✅ Where should we create your new project? ./password-manager (или .)
# ✅ What type of app do you want to create? Just the basics
# ✅ Where do you want to deploy? Choose Remix App Server
# ✅ TypeScript or JavaScript? TypeScript
# ✅ Do you want me to run `pnpm install`? Yes
```

**🎉 Готово! Remix CLI уже установил:**
- ✅ TypeScript
- ✅ React + React DOM
- ✅ Remix (@remix-run/node, @remix-run/react, @remix-run/dev, @remix-run/serve)
- ✅ Vite
- ✅ ESLint
- ✅ Все TypeScript типы (@types/react, @types/react-dom)

> **Как и Next.js**, Remix создает полностью готовый к работе проект одной командой!

---

## 📥 Шаг 2: Установка дополнительных зависимостей

Remix уже установил все базовое. Теперь добавим **специфичные для нашего проекта** зависимости:

### 2.1 Electron (для desktop приложения)

```bash
# Electron - это не входит в Remix по умолчанию (desktop-специфично)
pnpm add -D electron @types/electron

# Утилиты для запуска Electron вместе с Remix dev сервером
pnpm add -D concurrently wait-on
```

### 2.2 Tailwind CSS (если не выбрали при инициализации)

```bash
# Если НЕ выбрали Tailwind при создании проекта
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
```

**Примечание:** Если при `pnpm create remix@latest` выбрали опцию с Tailwind, этот шаг можно пропустить!

### 2.3 Catppuccin Mocha — цветовая схема (рекомендуется)

```bash
# Официальный плагин Catppuccin для Tailwind CSS
pnpm add -D @catppuccin/tailwindcss
```

> **📚 Детали**: [docs/ui/CATPPUCCIN_MOCHA.md](../../docs/ui/CATPPUCCIN_MOCHA.md)

### 2.4 Дополнительные утилиты (опционально)

```bash
# Prettier для форматирования (если хотите)
pnpm add -D prettier eslint-config-prettier

# cross-env для кросс-платформенных env переменных
pnpm add -D cross-env
```

### 2.5 Проверка package.json

После установки дополнительных зависимостей ваш `package.json` должен содержать примерно следующее:

```json
{
  "name": "password-manager",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "build": "remix vite:build",
    "dev": "remix vite:dev",
    "dev:electron": "concurrently \"pnpm dev\" \"wait-on http://localhost:5173 && electron .\"",
    "start": "remix-serve ./build/server/index.js",
    "typecheck": "tsc",
    "lint": "eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@remix-run/node": "^2.x.x",
    "@remix-run/react": "^2.x.x",
    "@remix-run/serve": "^2.x.x",
    "cross-env": "^7.0.3",
    "electron": "^28.x.x",
    "react": "^18.x.x",
    "react-dom": "^18.x.x"
  },
  "devDependencies": {
    "@remix-run/dev": "^2.x.x",
    "@types/node": "^20.x.x",
    "@types/react": "^18.x.x",
    "@types/react-dom": "^18.x.x",
    "@typescript-eslint/eslint-plugin": "^6.x.x",
    "@typescript-eslint/parser": "^6.x.x",
    "autoprefixer": "^10.x.x",
    "concurrently": "^8.x.x",
    "eslint": "^8.x.x",
    "eslint-config-prettier": "^9.x.x",
    "postcss": "^8.x.x",
    "prettier": "^3.x.x",
    "tailwindcss": "^3.x.x",
    "typescript": "^5.x.x",
    "vite": "^5.x.x",
    "wait-on": "^7.x.x"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## ⚙️ Шаг 3: Настройка конфигурационных файлов

> **✅ Remix CLI уже создал:** `tsconfig.json`, `vite.config.ts`, `.gitignore`, `app/root.tsx`, `app/routes/_index.tsx`
> 
> Нужно только **дополнить** конфиги для наших нужд (Electron, Tailwind, алиасы путей)

### 3.1 TypeScript конфигурация (проверить/дополнить)

**Файл: `tsconfig.json`** (уже создан Remix CLI)

```json
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "**/.server/**/*.ts",
    "**/.server/**/*.tsx",
    "**/.client/**/*.ts",
    "**/.client/**/*.tsx"
  ],
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "types": ["@remix-run/node", "vite/client"],
    "isolatedModules": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "target": "ES2022",
    "strict": true,
    "allowJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },
    "noEmit": true
  }
}
```

**Ключевые настройки**:
- `paths: { "~/*": ["./app/*"] }` - алиас для удобного импорта
- `strict: true` - строгая типизация
- `moduleResolution: "Bundler"` - для Vite

### 3.2 Vite конфигурация (дополнить для алиасов путей)

**Файл: `vite.config.ts`** (уже создан Remix CLI, нужно дополнить)

```typescript
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
});
```

**Установить vite-tsconfig-paths** (для работы алиасов `~/...`):
```bash
pnpm add -D vite-tsconfig-paths
```

### 3.3 Tailwind CSS конфигурация (если устанавливали отдельно)

> **🎨 Полная документация**: [docs/ui/CATPPUCCIN_MOCHA.md](../../docs/ui/CATPPUCCIN_MOCHA.md)

**Файл: `tailwind.config.js`**

Если установили Catppuccin плагин (рекомендуется):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  plugins: [],
}
```

> **💡 Примечание**: При использовании официального плагина `@catppuccin/tailwindcss` цвета подключаются через CSS импорт (см. шаг 5.1), поэтому в `tailwind.config.js` дополнительная конфигурация не нужна.

**Если НЕ используете плагин** (ручная конфигурация):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Catppuccin Mocha (ручная конфигурация)
        mocha: {
          // Accent colors
          mauve: '#cba6f7',
          blue: '#89b4fa',
          green: '#a6e3a1',
          red: '#f38ba8',
          yellow: '#f9e2af',
          // Neutral colors
          text: '#cdd6f4',
          base: '#1e1e2e',
          surface0: '#313244',
          surface1: '#45475a',
          // ... см. docs/ui/CATPPUCCIN_MOCHA.md для полного списка
        }
      },
    },
  },
  plugins: [],
}
```

**Файл: `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3.4 ESLint конфигурация (уже создан Remix CLI)

**Файл: `.eslintrc.cjs`** - уже существует, можно дополнить

```javascript
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
};
```

### 3.5 Prettier конфигурация (опционально)

**Файл: `.prettierrc`** - создать если хотите использовать Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**Файл: `.prettierignore`**

```
node_modules
build
public/build
.cache
```

### 3.6 Electron setup

> **📚 Полная документация**: [docs/electron/README.md](../../docs/electron/README.md)
> 
> **Ключевая концепция:** Electron - это **packaging layer**, НЕ часть архитектуры. Приложение работает одинаково в браузере и Electron.

Создайте структуру для Electron с правильной организацией кода:

**Структура:**
```
electron/
├── main.ts      # Main process
├── config.ts    # Константы (нет magic strings!)
├── types.ts     # TypeScript типы
└── preload.ts   # Preload script (опционально, для IPC)
```

**Краткий пример `electron/config.ts`:**

```typescript
export const ElectronConfig = {
  WINDOW: {
    WIDTH: 1200,
    HEIGHT: 800,
  },
  URLS: {
    DEV_SERVER: 'http://localhost:5173',
    PRODUCTION_PATH: '../build/client/index.html',
  },
  SECURITY: {
    NODE_INTEGRATION: false,
    CONTEXT_ISOLATION: true,
    SANDBOX: true,
  },
} as const
```

**Краткий пример `electron/main.ts`:**

```typescript
import { app, BrowserWindow } from 'electron'
import { ElectronConfig } from './config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: ElectronConfig.WINDOW.WIDTH,    // ✅ Из config
    height: ElectronConfig.WINDOW.HEIGHT,  // ✅ Из config
    webPreferences: {
      nodeIntegration: ElectronConfig.SECURITY.NODE_INTEGRATION,
      contextIsolation: ElectronConfig.SECURITY.CONTEXT_ISOLATION,
      sandbox: ElectronConfig.SECURITY.SANDBOX,
    },
  })

  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    mainWindow.loadURL(ElectronConfig.URLS.DEV_SERVER)  // ✅ Из config
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, ElectronConfig.URLS.PRODUCTION_PATH))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

> **📘 Полная документация по Electron**: [docs/electron/README.md](../../docs/electron/README.md)
> - Детальные примеры кода с типами
> - Архитектура Main vs Renderer процессов
> - Безопасность и best practices
> - IPC коммуникация
> - Сборка и распространение

Обновить `package.json` для Electron:

```json
{
  "main": "electron/main.ts"
}
```

---

## 📁 Шаг 4: Создание базовой структуры папок

```bash
# Создаем структуру директорий
mkdir -p app/domain/entities
mkdir -p app/domain/value-objects
mkdir -p app/domain/repositories
mkdir -p app/domain/services
mkdir -p app/domain/events
mkdir -p app/application/queries
mkdir -p app/application/queries/handlers
mkdir -p app/application/commands
mkdir -p app/application/commands/handlers
mkdir -p app/application/ports
mkdir -p app/infrastructure/api
mkdir -p app/infrastructure/repositories
mkdir -p app/infrastructure/queries
mkdir -p app/infrastructure/commands
mkdir -p app/infrastructure/request-parsers
mkdir -p app/infrastructure/mocks
mkdir -p app/infrastructure/event-bus
mkdir -p app/infrastructure/storage
mkdir -p app/infrastructure/clipboard
mkdir -p app/composition/modules
mkdir -p app/composition/queries
mkdir -p app/composition/commands
mkdir -p app/composition/config
mkdir -p app/core/modal
mkdir -p app/core/keymap
mkdir -p app/core/focus
mkdir -p app/core/notification
mkdir -p app/components
mkdir -p app/hooks
mkdir -p app/types
mkdir -p app/styles
```

Итоговая структура:

```
app/
├── routes/                    # Remix routes (будут создаваться)
├── components/                # React компоненты
├── composition/               # Composition Root (DI Container)
│   ├── modules/               # DI Modules по сущностям
│   ├── queries/               # Query Facades
│   ├── commands/              # Command Facades
│   └── config/                # Константы (Environment)
├── core/                      # Основные системы
│   ├── modal/
│   ├── keymap/
│   ├── focus/
│   └── notification/
├── domain/                    # Domain Layer
│   ├── entities/              # Entities
│   ├── value-objects/         # Value Objects
│   ├── repositories/          # Repository Interfaces
│   ├── services/              # Domain Services
│   └── events/                # Domain Events
├── application/               # Application Layer (CQRS)
│   ├── queries/               # Query (CQRS - Read)
│   │   └── handlers/
│   ├── commands/              # Commands (CQRS - Write)
│   │   └── handlers/
│   └── ports/                 # Ports (Hexagonal Architecture)
├── infrastructure/            # Infrastructure Layer
│   ├── api/                   # API Client
│   ├── repositories/          # Repository Implementations
│   ├── queries/               # Query Bus Implementation
│   ├── commands/              # Command Bus Implementation
│   ├── request-parsers/       # Request Parsers (Web/CLI/Desktop)
│   ├── mocks/                 # Mock Data
│   ├── event-bus/             # Event Bus Implementation
│   ├── storage/               # Local Storage
│   └── clipboard/             # Clipboard Service
├── hooks/                     # React Hooks
├── types/                     # TypeScript Types
├── styles/                    # Стили
├── root.tsx                   # Root layout
└── entry.client.tsx           # Client entry (создается автоматически)
```

---

## 🎨 Шаг 5: Настройка стилей (Tailwind CSS)

### 5.1 Создать глобальные стили Tailwind

**Файл: `app/styles/tailwind.css`** (создать вручную)

```css
@import "tailwindcss";

/* Импортируем Catppuccin Mocha тему */
@import "@catppuccin/tailwindcss/mocha.css";

@layer base {
  /* Базовые стили с Catppuccin Mocha */
  body {
    @apply bg-ctp-base text-ctp-text;
  }
}

@layer components {
  /* Кастомные компоненты с Catppuccin цветами */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-ctp-mauve text-ctp-base hover:bg-ctp-lavender;
  }
  
  .btn-secondary {
    @apply bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1;
  }
  
  .card {
    @apply bg-ctp-surface0 rounded-lg shadow-sm border border-ctp-surface2;
  }
}

@layer utilities {
  /* Кастомные утилиты */
  .text-balance {
    text-wrap: balance;
  }
}
```

> **💡 Примечание**: Используем официальный плагин `@catppuccin/tailwindcss`.  
> Все цвета доступны с префиксом `ctp-`: `bg-ctp-base`, `text-ctp-text`, `border-ctp-mauve`, etc.  
> **📚 Полная документация**: [docs/ui/CATPPUCCIN_MOCHA.md](../../docs/ui/CATPPUCCIN_MOCHA.md)

### 5.2 Обновить root layout (подключить Tailwind)

**Файл: `app/root.tsx`** (уже создан Remix CLI, нужно добавить импорт стилей)

```typescript
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import styles from "~/styles/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
```

---

## 🔐 Шаг 6: Environment переменные (опционально)

### 6.1 Создать .env файл

**Файл: `.env`**

```env
# Development/Production
NODE_ENV=development

# API URL (для будущего использования)
API_URL=http://localhost:3000/api

# App settings
APP_NAME=Password Manager
APP_VERSION=0.1.0
```

### 6.2 Создать .env.example

**Файл: `.env.example`**

```env
NODE_ENV=development
API_URL=http://localhost:3000/api
APP_NAME=Password Manager
APP_VERSION=0.1.0
```

### 6.3 Обновить .gitignore

**Файл: `.gitignore`**

```
node_modules

/.cache
/build
/public/build
.env

# Electron
/dist
/out

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
*.tsbuildinfo
```

---

## 🧪 Шаг 7: Создание тестовой страницы

### 7.1 Создать индексную страницу

**Файл: `app/routes/_index.tsx`**

```typescript
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Password Manager" },
    { name: "description", content: "Secure password management" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          🔐 Password Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Environment setup complete!
        </p>
        <div className="card p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Next Steps:</h2>
          <ul className="text-left space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Dependencies installed</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>TypeScript configured</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Tailwind CSS setup</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Project structure created</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Шаг 8: Проверка установки

### 8.1 Запустить dev сервер

```bash
pnpm dev
```

Откройте браузер на `http://localhost:5173` - должна отобразиться тестовая страница.

### 8.2 Проверить TypeScript

```bash
pnpm typecheck
```

Не должно быть ошибок.

### 8.3 Запустить Electron (опционально)

```bash
pnpm dev:electron
```

Должно открыться Electron окно с приложением.

### 8.4 Проверить линтер

```bash
pnpm lint
```

---

## 📋 Финальный чек-лист

- [ ] Node.js >= 20.0.0 установлен
- [ ] pnpm установлен (`npm install -g pnpm`)
- [ ] Проект инициализирован
- [ ] Все зависимости установлены (`pnpm install`)
- [ ] `tsconfig.json` настроен с алиасами
- [ ] `remix.config.js` создан
- [ ] `vite.config.ts` настроен
- [ ] `tailwind.config.js` настроен
- [ ] `postcss.config.js` создан
- [ ] `.eslintrc.cjs` настроен
- [ ] `.prettierrc` создан
- [ ] `electron/main.ts` создан
- [ ] Структура папок создана
- [ ] `app/styles/tailwind.css` создан
- [ ] `app/root.tsx` создан
- [ ] `app/routes/_index.tsx` создан
- [ ] `.env` файл создан
- [ ] `.gitignore` обновлен
- [ ] `pnpm dev` работает без ошибок
- [ ] `pnpm typecheck` проходит успешно
- [ ] Браузер отображает тестовую страницу
- [ ] Tailwind CSS стили применяются

---

## 🎯 Результат

После выполнения Шага 0 у вас:

✅ Полностью настроенное окружение разработки  
✅ TypeScript с строгой типизацией  
✅ Remix + Vite для быстрой разработки  
✅ Tailwind CSS для стилей  
✅ Electron для desktop приложения  
✅ Готовая структура папок по Clean Architecture  
✅ Линтеры и форматтеры  
✅ Environment переменные  

---

## 🚀 Следующий шаг

После успешной настройки переходите к **[Шагу 1](../step_1/README.md)** - создание Domain Layer и первого функционала (вывод списка ресурсов).

---

## ❓ Troubleshooting

### Ошибка: "Cannot find module '~/*'"

**Решение**: Убедитесь что `vite-tsconfig-paths` установлен:
```bash
pnpm add -D vite-tsconfig-paths
```

### Ошибка: Tailwind стили не применяются

**Решение**: Проверьте что:
1. `tailwind.css` импортирован в `root.tsx`
2. В `tailwind.config.js` правильно указан `content`
3. Dev сервер перезапущен (`pnpm dev`)

### Ошибка: TypeScript не видит типы Remix

**Решение**: 
```bash
pnpm add -D @remix-run/node
```

### Electron не запускается

**Решение**: Убедитесь что:
1. В `package.json` указано `"main": "electron/main.ts"`
2. Dev сервер Remix запущен на порту 5173
3. Установлен `wait-on` и `concurrently`: `pnpm add -D wait-on concurrently`

---

## 📚 Полезные ссылки

- [Remix Documentation](https://remix.run/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
