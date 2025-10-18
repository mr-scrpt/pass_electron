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

## ⏱️ Шаг 3: Настройка TypeScript и Vite ✅ ОБЯЗАТЕЛЬНО

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)

В этом шаге настраиваем:
- **TypeScript paths** - алиасы для DDD слоёв (`@domain`, `@api`, `@client/*`, `@internal/*`)
- **Vite config** - алиасы и build для React Router

### Быстрый обзор алиасов

**Root `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@domain": ["./src/domain/index.ts"],        // Public API типов
      "@api": ["./src/composition/index.ts"],      // Facades
      "@client/*": ["./src/presentation/web/react/src/*"],  // Локальные
      "@internal/application/*": ["./src/application/*"],   // Только для Composition
      "@internal/infrastructure/*": ["./src/infrastructure/*"]
    }
  }
}
```

**Ключевые настройки:**
- `root: projectRoot` - Vite знает корень проекта
- `appDirectory` - где React Router ищет routes
- `resolve.alias` - алиасы для DDD слоев

**Полная инструкция с примерами**: [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)

---

## 🛡️ Шаг 4: Настройка ESLint с архитектурными границами 🟡 ОПЦИОНАЛЬНО

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [ESLINT_SETUP.md](./ESLINT_SETUP.md)
> 
> **📚 ПРАВИЛА АРХИТЕКТУРЫ**: [docs/ARCHITECTURE_BOUNDARIES.md](../../docs/ARCHITECTURE_BOUNDARIES.md)

**Опционально**, но **крайне рекомендуется**: автоматическая проверка архитектурных границ.

### Что проверяется

- ✅ **Presentation** НЕ может импортировать `@internal/*` (только `@domain`, `@api`, `@client/*`)
- ✅ **Domain** полностью изолирован (не импортирует другие слои)
- ✅ **Infrastructure** НЕ зависит от Application
- ✅ **Composition** - единственный кто может использовать `@internal/*`

### Быстрая установка

```bash
# Установить ESLint + плагины
pnpm add -D eslint eslint-plugin-boundaries @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Создать eslint.config.js (см. ESLINT_SETUP.md)
```

**Полная инструкция**: [ESLINT_SETUP.md](./ESLINT_SETUP.md)

---

## 🎨 Дополнительные библиотеки (опционально)

Можно добавить дополнительные библиотеки для UI, стилей и т.д.

### Tailwind CSS + Catppuccin Mocha

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [TAILWIND_SETUP.md](./TAILWIND_SETUP.md)

Готовая система стилей с красивой темной темой:

```bash
# В presentation/web/react
cd src/presentation/web/react
pnpm add -D @tailwindcss/vite @catppuccin/tailwindcss
```

**Зачем:**
- ✅ Быстрая разработка UI с utility classes
- ✅ Catppuccin Mocha - красивая темная тема
- ✅ Готовые цвета: `bg-ctp-base`, `text-ctp-mauve`, и т.д.

**Альтернативы:** CSS Modules, styled-components, Emotion, обычный CSS

**Полная инструкция**: [TAILWIND_SETUP.md](./TAILWIND_SETUP.md)

### Будущие библиотеки

По мере развития проекта можно добавить:
- UI компоненты (Radix UI, Headless UI)
- Иконки (Lucide, Heroicons)
- Формы (React Hook Form, Zod)
- и др.

---

## ✅ Шаг 5: Проверка установки

После настройки package.json и конфигов проверь что всё работает:

### 5.1 Установить зависимости

```bash
# В корне проекта
pnpm install

# В web presentation
cd src/presentation/web/react
pnpm install
cd ../../../..
```

### 5.2 Создать минимальные файлы для теста

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

### 5.3 Запустить dev сервер

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
- [ ] Зависимости установлены (root + web)
- [ ] `tsconfig.json` с алиасами настроен
- [ ] `vite.config.ts` настроен
- [ ] `tailwind.config.js` настроен
- [ ] **`eslint.config.js` настроен** ⭐
- [ ] **`pnpm lint` работает** ⭐
- [ ] Тестовые файлы созданы
- [ ] `pnpm dev` работает
- [ ] Браузер показывает страницу с Catppuccin темой

---

## 🎯 Результат

После выполнения Шага 0 у вас:

✅ **DDD структура**: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/composition/`  
✅ **Presentation Layer изолирован**: `src/presentation/web/react/`  
✅ **pnpm workspaces**: Root + Web зависимости разделены  
✅ **TypeScript + Vite алиасы**: `@domain`, `@api`, `@client/*`, `@internal/*` ⭐  
✅ **ESLint с архитектурными границами**: Автоматическая проверка правил импортов ⭐  
✅ **Vite + React Router**: Готово для разработки  
✅ **Tailwind CSS + Catppuccin**: Стили настроены  

---

## 🚀 Следующий шаг

Переходи к **[Шагу 1](../step_1/README.md)** — создание Domain Layer и первого функционала (вывод списка ресурсов).

---

## 📚 Детальные инструкции

### 📋 Разделение ответственности

Каждый шаг настройки вынесен в отдельный файл с детальной инструкцией:

#### ✅ Обязательные шаги (для запуска проекта)

| Шаг | Файл инструкции | Что настраивается | Зачем |
|-----|----------------|-------------------|-------|
| **Шаг 2** | [PACKAGE_JSON_SETUP.md](./PACKAGE_JSON_SETUP.md) | • Root `package.json`<br>• Web `package.json`<br>• `pnpm-workspace.yaml`<br>• Какие пакеты куда | Управление зависимостями, workspaces |
| **Шаг 3** | [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md) | • Root `tsconfig.json` paths<br>• `vite.config.ts` алиасы | Алиасы для DDD слоев, сборка проекта |

#### 🟡 Опциональные шаги (рекомендуется)

| Шаг | Файл инструкции | Что настраивается | Зачем |
|-----|----------------|-------------------|-------|
| **Шаг 4** | [ESLINT_SETUP.md](./ESLINT_SETUP.md) | • `eslint.config.js`<br>• `eslint-plugin-boundaries`<br>• Архитектурные правила | Автоматическая проверка границ слоев |

#### 🎨 Дополнительные библиотеки (опционально)

| Библиотека | Файл инструкции | Что дает | Альтернативы |
|-----------|----------------|----------|--------------|
| **Tailwind CSS** | [TAILWIND_SETUP.md](./TAILWIND_SETUP.md) | • Utility-first CSS<br>• Catppuccin тема<br>• Готовые цвета | CSS Modules, styled-components, Emotion |
| **Будущие** | - | UI компоненты, иконки, формы | По мере необходимости |

### 🎯 Философия: Single Source of Truth

**Краткий обзор в README** → **Детальная инструкция в отдельном файле** → **Канонические правила в docs/**

```
README.md (этот файл)           ← Краткий обзор шагов + ссылки
    ↓ ссылается на
Обязательные:
├─ PACKAGE_JSON_SETUP.md        ← package.json и workspaces
└─ TYPESCRIPT_VITE_CONFIG.md    ← tsconfig, vite алиасы

Опциональные:
└─ ESLINT_SETUP.md              ← ESLint с boundaries

Дополнительные библиотеки:
└─ TAILWIND_SETUP.md            ← Tailwind CSS + Catppuccin

    ↓ ссылаются на
docs/ARCHITECTURE_BOUNDARIES.md ← Канонический источник правил
docs/PROJECT_STRUCTURE.md       ← Полная структура проекта
docs/ui/CATPPUCCIN_MOCHA.md     ← Цветовая палитра
```

**Преимущества:**
- ✅ Можно редактировать каждый файл независимо
- ✅ Нет дублирования
- ✅ README остается компактным
- ✅ Детали всегда в одном месте

### 🔗 Ссылки на документацию

- [docs/PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) — полная структура проекта
- [docs/ARCHITECTURE_BOUNDARIES.md](../../docs/ARCHITECTURE_BOUNDARIES.md) — правила импортов и алиасы ⭐
