# Шаг 0: Настройка окружения и зависимостей

## 🎯 Цель

Подготовить проект с правильной DDD структурой:
- **`src/`** - Domain, Application, Infrastructure, Composition (DDD слои)
- **`src/presentation/web/react/`** - React Router + Vite (UI framework изолирован)
- **pnpm workspaces** - управление зависимостями
- **TypeScript paths** - алиасы для удобных импортов

> **📦 Менеджер пакетов**: В этом проекте используется **pnpm**. Если он не установлен:
> ```bash
> npm install -g pnpm
> ```

---

## 🏗️ Архитектурный подход

### Почему НЕ используем React Router CLI?

React Router CLI создает структуру `app/` что противоречит Clean Architecture:

```
app/              # ❌ Framework директория
├── domain/       # ❌ Domain внутри framework!
└── routes/
```

**Наш подход**: Domain в центре, Framework снаружи

```
src/
├── domain/           # ✅ DDD: Domain Layer
├── application/      # ✅ DDD: Application Layer
├── infrastructure/   # ✅ DDD: Infrastructure Layer
├── composition/      # ✅ DDD: Composition Root
└── presentation/     # ✅ DDD: Presentation Layer
    └── web/react/    # ✅ React Router изолирован
        ├── vite.config.ts   # ✅ Build tool здесь
        └── package.json     # ✅ Web dependencies здесь
```

> **Принцип**: "Framework — деталь реализации, не часть бизнес-логики"

---

## 📦 Технологический стек

### Основные зависимости
- **React Router v7** - Full-stack фреймворк для React (SSR, loaders, actions)
- **Electron** - Desktop приложение
- **React** - UI библиотека
- **TypeScript** - Типизация
- **Tailwind CSS** - Стили

### Dev зависимости
- **Vite** - Сборщик (используется React Router)
- **ESLint** - Линтер
- **Prettier** - Форматирование кода

---

## 🚀 Шаг 1: Создание структуры проекта

### 1.1 Создать директории

```bash
# Создаем корень проекта
mkdir password-manager
cd password-manager

# Создаем DDD структуру
mkdir -p src/{domain,application,infrastructure,composition,shared}
mkdir -p src/domain/{resource,shared/{errors,invariants}}
mkdir -p src/application/{queries,commands,ports,services}
mkdir -p src/infrastructure/{persistence,services,event-bus}

# Создаем Presentation Layer с React Router
mkdir -p src/presentation/web/react/src/{routes,components,hooks,styles}

# Electron packaging
mkdir -p electron

# Документация
mkdir -p docs
```

### 1.2 Инициализировать Git

```bash
git init
```

---

## 📥 Шаг 2: Настройка package.json и pnpm Workspaces

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [PACKAGE_JSON_SETUP.md](./PACKAGE_JSON_SETUP.md)

В этом проекте используется **pnpm workspaces** для разделения зависимостей:

### Структура package.json файлов

```
password-manager/
├── package.json                              # ✅ Root: DDD слои (domain, application, etc.)
├── pnpm-workspace.yaml                       # ✅ Workspaces конфигурация
└── src/presentation/web/react/
    └── package.json                          # ✅ Web: React Router, Vite, Tailwind
```

### Почему так?

**Root `package.json`:**
- Зависимости для DDD слоев (Domain, Application, Infrastructure)
- Общие dev-зависимости (TypeScript, ESLint)
- **НЕ содержит**: React, Vite, Tailwind (это только для web presentation)

**Web `package.json`:**
- React Router, React, Vite
- Tailwind CSS, PostCSS
- **Изолирован** от других presentation layers

### Быстрый старт

1. **Создать `pnpm-workspace.yaml`** в корне
2. **Создать root `package.json`** (DDD слои — neverthrow, typescript, etc.)
3. **Создать web конфиги через React Router CLI** ⭐
   ```bash
   cd src/presentation/web
   pnpm dlx create-react-router@latest temp
   # Копируем: package.json, tsconfig.json, vite.config.ts, react-router.config.ts
   cp temp/{package.json,tsconfig.json,vite.config.ts,react-router.config.ts} react/
   rm -rf temp
   ```
4. **Установить зависимости**:
   ```bash
   # Из корня проекта
   pnpm install
   ```

> **💡 Используем React Router CLI** — он создает конфиги с актуальными версиями!  
> Мы только модифицируем их под DDD структуру.
>
> **⚠️ ВАЖНО**: Tailwind, Vite, React устанавливаются ТОЛЬКО в `src/presentation/web/react/package.json`, НЕ в root!

**Полная инструкция со всеми командами**: [PACKAGE_JSON_SETUP.md](./PACKAGE_JSON_SETUP.md)

---

## ⚙️ Шаг 3: Настройка TypeScript, Vite и Tailwind CSS

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)

В этом шаге настраиваем:
- **TypeScript paths** - алиасы для DDD слоёв (`~domain`, `~application`, etc.)
- **Vite config** - алиасы и build для React Router (в `src/presentation/web/react/`)
- **Tailwind CSS** - конфигурация в presentation layer

### Быстрый обзор

**Root `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~domain/*": ["src/domain/*"],
      "~application/*": ["src/application/*"],
      "~infrastructure/*": ["src/infrastructure/*"],
      "~composition/*": ["src/composition/*"]
    }
  }
}
```

**`src/presentation/web/react/vite.config.ts`:**
- Настройка `root` и `appDirectory`
- Алиасы для импорта из DDD слоёв
- Интеграция PostCSS для Tailwind

**`src/presentation/web/react/tailwind.config.js`:**
- Catppuccin Mocha цветовая схема
- Paths для сканирования классов

**Полная инструкция с примерами**: [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)

---

---

## ✅ Шаг 4: Проверка установки

После настройки package.json и конфигов проверь что всё работает:

### 4.1 Установить зависимости

```bash
# В корне проекта
pnpm install

# В web presentation
cd src/presentation/web/react
pnpm install
cd ../../../..
```

### 4.2 Создать минимальные файлы для теста

Создай простые файлы чтобы проверить что всё работает:

**Файл: `src/presentation/web/react/src/root.tsx`**

```typescript
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import styles from "./styles/tailwind.css?url"

export function links() {
  return [{ rel: "stylesheet", href: styles }]
}

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
  )
}

export default function App() {
  return <Outlet />
}
```

**Файл: `src/presentation/web/react/src/routes/_index.tsx`**

```typescript
export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ctp-base">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ctp-mauve mb-4">
          🔐 Password Manager
        </h1>
        <p className="text-ctp-text">
          Setup complete! ✅
        </p>
      </div>
    </div>
  )
}
```

### 4.3 Запустить dev сервер

```bash
# Из root presentation директории
cd src/presentation/web/react
pnpm dev
```

Открой браузер на `http://localhost:5173` — должна показаться тестовая страница.

---

## 📋 Финальный чек-лист

- [ ] Структура `src/` создана
- [ ] Root `package.json` создан
- [ ] Web `package.json` создан  
- [ ] `pnpm-workspace.yaml` создан
- [ ] Зависимости установлены
- [ ] `tsconfig.json` с алиасами настроен
- [ ] `vite.config.ts` настроен
- [ ] `tailwind.config.js` настроен
- [ ] Тестовые файлы созданы
- [ ] `pnpm dev` работает
- [ ] Браузер показывает страницу с Catppuccin темой

---

## 🎯 Результат

После выполнения Шага 0 у вас:

✅ **DDD структура**: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/composition/`  
✅ **Presentation Layer изолирован**: `src/presentation/web/react/`  
✅ **pnpm workspaces**: Root + Web зависимости разделены  
✅ **TypeScript paths**: Алиасы `~domain/`, `~application/`, etc.  
✅ **Vite + React Router**: Готово для разработки  
✅ **Tailwind CSS + Catppuccin**: Стили настроены  

---

## 🚀 Следующий шаг

Переходи к **[Шагу 1](../step_1/README.md)** — создание Domain Layer и первого функционала (вывод списка ресурсов).

---

## 📚 Полезные ссылки

- [PACKAGE_JSON_SETUP.md](./PACKAGE_JSON_SETUP.md) — детальная настройка зависимостей
- [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md) — детальная настройка конфигов
- [docs/PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) — полная структура проекта
