# Шаг 0: Настройка окружения и зависимостей

## 🎯 Цель

Подготовить проект с нуля: установить все необходимые зависимости, настроить TypeScript, Remix, Electron, Tailwind CSS и создать базовую структуру.

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

### 1.1 Создать Remix проект

```bash
# Создаем проект с Remix (если еще не создан)
npx create-remix@latest

# Выбираем опции:
# - Where should we create your new project? ./
# - What type of app do you want to create? Just the basics
# - Where do you want to deploy? Choose Remix App Server
# - TypeScript or JavaScript? TypeScript
# - Do you want me to run `npm install`? Yes
```

Или если проект уже существует, переходим к следующему шагу.

---

## 📥 Шаг 2: Установка зависимостей

### 2.1 Основные зависимости

```bash
# React и Remix (если не установлены)
npm install @remix-run/node@latest @remix-run/react@latest @remix-run/serve@latest

# Electron
npm install electron

# Дополнительные утилиты
npm install cross-env
```

### 2.2 TypeScript и типы

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node

# Типы для Electron
npm install --save-dev @types/electron
```

### 2.3 Tailwind CSS

```bash
npm install --save-dev tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2.4 Dev зависимости

```bash
# Vite (обычно уже установлен с Remix)
npm install --save-dev vite @remix-run/dev

# ESLint и Prettier
npm install --save-dev eslint prettier eslint-config-prettier
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Concurrently для запуска нескольких процессов
npm install --save-dev concurrently wait-on
```

### 2.5 Проверка package.json

После установки ваш `package.json` должен содержать примерно следующее:

```json
{
  "name": "password-manager",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "build": "remix vite:build",
    "dev": "remix vite:dev",
    "dev:electron": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
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

### 3.1 TypeScript конфигурация

**Файл: `tsconfig.json`**

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

### 3.2 Remix конфигурация

**Файл: `remix.config.js`**

```javascript
/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildPath: "build/index.js",
  tailwind: true,
  postcss: true,
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
};
```

### 3.3 Vite конфигурация

**Файл: `vite.config.ts`**

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

**Установить vite-tsconfig-paths**:
```bash
npm install --save-dev vite-tsconfig-paths
```

### 3.4 Tailwind CSS конфигурация

**Файл: `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Кастомные цвета для темы (опционально)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
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

### 3.5 ESLint конфигурация

**Файл: `.eslintrc.cjs`**

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

### 3.6 Prettier конфигурация

**Файл: `.prettierrc`**

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

### 3.7 Electron main process

**Файл: `electron/main.ts`**

```typescript
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // preload: path.join(__dirname, 'preload.js'),
    },
  })

  // В режиме разработки загружаем с dev сервера
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // В продакшене загружаем собранные файлы
    mainWindow.loadFile(path.join(__dirname, '../public/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
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
mkdir -p app/domain/resource
mkdir -p app/domain/repositories
mkdir -p app/domain/events
mkdir -p app/application/use-cases
mkdir -p app/application/services
mkdir -p app/infrastructure/api
mkdir -p app/infrastructure/repositories
mkdir -p app/infrastructure/mocks
mkdir -p app/infrastructure/event-bus
mkdir -p app/infrastructure/storage
mkdir -p app/infrastructure/clipboard
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
├── core/                      # Основные системы
│   ├── modal/
│   ├── keymap/
│   ├── focus/
│   └── notification/
├── domain/                    # Domain Layer
│   ├── resource/
│   ├── repositories/
│   └── events/
├── application/               # Application Layer
│   ├── use-cases/
│   └── services/
├── infrastructure/            # Infrastructure Layer
│   ├── api/
│   ├── repositories/
│   ├── mocks/
│   ├── event-bus/
│   ├── storage/
│   └── clipboard/
├── hooks/                     # React Hooks
├── types/                     # TypeScript Types
├── styles/                    # Стили
├── root.tsx                   # Root layout
└── entry.client.tsx           # Client entry (создается автоматически)
```

---

## 🎨 Шаг 5: Настройка стилей

### 5.1 Создать глобальные стили

**Файл: `app/styles/tailwind.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Базовые стили */
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  /* Кастомные компоненты */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200;
  }
}

@layer utilities {
  /* Кастомные утилиты */
  .text-balance {
    text-wrap: balance;
  }
}
```

### 5.2 Создать root layout

**Файл: `app/root.tsx`**

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
npm run dev
```

Откройте браузер на `http://localhost:5173` - должна отобразиться тестовая страница.

### 8.2 Проверить TypeScript

```bash
npm run typecheck
```

Не должно быть ошибок.

### 8.3 Запустить Electron (опционально)

```bash
npm run dev:electron
```

Должно открыться Electron окно с приложением.

### 8.4 Проверить линтер

```bash
npm run lint
```

---

## 📋 Финальный чек-лист

- [ ] Node.js >= 20.0.0 установлен
- [ ] npm или yarn установлен
- [ ] Проект инициализирован
- [ ] Все зависимости установлены (`npm install`)
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
- [ ] `npm run dev` работает без ошибок
- [ ] `npm run typecheck` проходит успешно
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
npm install --save-dev vite-tsconfig-paths
```

### Ошибка: Tailwind стили не применяются

**Решение**: Проверьте что:
1. `tailwind.css` импортирован в `root.tsx`
2. В `tailwind.config.js` правильно указан `content`
3. Dev сервер перезапущен

### Ошибка: TypeScript не видит типы Remix

**Решение**: 
```bash
npm install --save-dev @remix-run/node
```

### Electron не запускается

**Решение**: Убедитесь что:
1. В `package.json` указано `"main": "electron/main.ts"`
2. Dev сервер Remix запущен на порту 5173
3. Установлен `wait-on` и `concurrently`

---

## 📚 Полезные ссылки

- [Remix Documentation](https://remix.run/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
