# Шаг 0: Настройка окружения и зависимостей

## 🎯 Цель

Подготовить проект с правильной DDD структурой:
- **`src/`** - Domain, Application, Infrastructure, Composition (DDD слои)
- **`src/presentation/web/react/`** - React Router + Vite (UI framework изолирован)
- **pnpm workspaces** - управление зависимостями
- **TypeScript paths** - алиасы для удобных импортов

> **📦 Менеджер пакетов**: В этом проекте используется **pnpm**. Если он не установлен:
>
> #### Install pnpm [#command]
>
> ```bash
> npm install -g pnpm
> ```

---

## 🏗️ Архитектурный подход

### Почему НЕ используем React Router CLI?

React Router CLI создает структуру `app/` что противоречит Clean Architecture:

#### Wrong Structure [#structure:tree]

```
app/              # ❌ Framework директория
├── domain/       # ❌ Domain внутри framework!
└── routes/
```

**Наш подход**: Domain в центре, Framework снаружи

#### Correct Structure [#structure:tree]

```
src/
├── domain/               # ✅ DDD: Domain Layer
├── application/          # ✅ DDD: Application Layer
├── infrastructure/       # ✅ DDD: Infrastructure Layer
├── composition/          # ✅ DDD: Composition Root
└── presentation/         # ✅ DDD: Presentation Layer
    └── web/react/        # ✅ React Router изолирован
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

#### Create Directories [#command]

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

#### Init Git [#command]

```bash
git init
```

---

## 📥 Шаг 2: Настройка package.json и pnpm Workspaces ✅ ОБЯЗАТЕЛЬНО

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [PACKAGE_JSON_SETUP.md](./PACKAGE_JSON_SETUP.md)

**Что настраиваем:**
- Root `package.json` - зависимости для DDD слоев (neverthrow, typescript, eslint)
- `pnpm-workspace.yaml` - конфигурация workspaces
- Web `package.json` - зависимости для UI (react, vite, tailwind)

**Зачем:**
- Разделение зависимостей: DDD слои независимы от UI framework
- Легко добавить другие presentations (CLI, Mobile) без влияния на Domain

**Структура:**

#### Workspaces Structure [#structure:tree]

```
password-manager/
├── package.json              # Root: DDD слои
├── pnpm-workspace.yaml       # Workspaces
└── src/presentation/web/react/
    └── package.json          # Web: React Router, Vite
```

**Последовательность:**
1. Создать root `package.json`
2. Создать `pnpm-workspace.yaml`
3. Создать web `package.json` через React Router CLI
4. Установить зависимости: `pnpm install`

**Детали в**: [PACKAGE_JSON_SETUP.md](./PACKAGE_JSON_SETUP.md)

---

## ⏱️ Шаг 3: Настройка TypeScript и Vite ✅ ОБЯЗАТЕЛЬНО

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)

**Что настраиваем:**
- Root `tsconfig.json` - TypeScript paths для алиасов
- Web `vite.config.ts` - Vite алиасы и настройки сборки

**Зачем:**
- Clean imports без относительных путей (`../../../`)
- Presentation может импортировать из DDD слоев
- Vite правильно резолвит пути при сборке

**Алиасы:**
- `@/domain` - Public API Domain Layer
- `@/composition` - Facades из Composition Layer
- `@/*` - Локальные файлы presentation
- `@/application`, `@/infrastructure` - Только для Composition (запрещены в Presentation)

**Файлы:**
- `tsconfig.json` (root)
- `src/presentation/web/react/vite.config.ts`

**Детали в**: [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)

---

## 🛡️ Шаг 4: Настройка ESLint ✅ ОБЯЗАТЕЛЬНО

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [ESLINT_SETUP.md](./ESLINT_SETUP.md)

**Что настраиваем:**
- `eslint.config.js` - конфигурация линтера с TypeScript
- `eslint-plugin-boundaries` - автоматическая проверка архитектурных границ
- Scripts в `package.json` - команды для запуска линтера

**Зачем:**
- Автоматическая проверка архитектурных правил
- Presentation НЕ может импортировать напрямую из `@/application` или `@/infrastructure`
- Domain полностью изолирован от других слоев
- Ошибки на уровне линтера, а не runtime

**Проверяет:**
- ✅ Domain изолирован
- ✅ Application импортирует только Domain
- ✅ Infrastructure импортирует только Domain
- ✅ Composition имеет доступ ко всем слоям
- ✅ Presentation НЕ может импортировать напрямую из Application/Infrastructure

**Установка:**

#### Install ESLint [#command]

```bash
pnpm add -D eslint eslint-plugin-boundaries @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Детали в**: [ESLINT_SETUP.md](./ESLINT_SETUP.md)

---

## 🎨 Шаг 5: Tailwind CSS (опционально)

> **📚 ДЕТАЛЬНАЯ ИНСТРУКЦИЯ**: [TAILWIND_SETUP.md](./TAILWIND_SETUP.md)

**Что настраиваем:**
- Tailwind CSS v4 через `@tailwindcss/vite`
- Catppuccin Mocha theme для красивой темной темы
- `tailwind.config.js` с настройками

**Зачем:**
- Быстрая разработка UI с utility-first CSS
- Готовая темная тема из коробки
- Консистентная цветовая палитра

**Установка:**

#### Install Tailwind [#command]

```bash
cd src/presentation/web/react
pnpm add -D @tailwindcss/vite @catppuccin/tailwindcss
```

**⚠️ ВАЖНО:** Устанавливать ТОЛЬКО в web presentation, НЕ в root!

**Альтернативы:** CSS Modules, styled-components, Emotion, обычный CSS

**Детали в**: [TAILWIND_SETUP.md](./TAILWIND_SETUP.md)

---

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

#### Install Dependencies [#command]

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

#### Root Component [#code|#structure:path]

```typescript
// src/presentation/web/react/src/root.tsx
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

#### Index Route [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx
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

#### Run Dev Server [#command]

```bash
# Из root presentation директории
cd src/presentation/web/react
pnpm dev
```

Открой браузер на `http://localhost:5173` — должна показаться тестовая страница.

---

## 📋 Финальный чек-лист

**Шаг 1: Структура проекта**
- [ ] Директории `src/{domain,application,infrastructure,composition,presentation}` созданы
- [ ] Git инициализирован

**Шаг 2: Package.json и workspaces**
- [ ] Root `package.json` создан и настроен
- [ ] `pnpm-workspace.yaml` создан
- [ ] Web `package.json` создан через React Router CLI
- [ ] Зависимости установлены: `pnpm install`
- [ ] `pnpm list --depth=0` показывает workspace

**Шаг 3: TypeScript и Vite**
- [ ] Root `tsconfig.json` с алиасами настроен
- [ ] `src/presentation/web/react/vite.config.ts` настроен
- [ ] Импорты с алиасами работают

**Шаг 4: ESLint**
- [ ] `eslint.config.js` создан
- [ ] Scripts добавлены в root `package.json`
- [ ] `pnpm lint` работает без ошибок

**Шаг 5: Tailwind (опционально)**
- [ ] Зависимости установлены в web workspace
- [ ] `tailwind.config.js` создан
- [ ] Vite plugin настроен

---

## 🎯 Результат

После выполнения Шага 0 у вас:

✅ **DDD структура**: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/composition/`  
✅ **Presentation Layer изолирован**: `src/presentation/web/react/`  
✅ **pnpm workspaces**: Root + Web зависимости разделены  
✅ **TypeScript + Vite алиасы**: `@/domain`, `@/composition`, `@/*`, `@/application`, `@/infrastructure` ⭐  
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

#### ✅ Обязательные шаги

| Шаг | Файл инструкции | Что настраивается | Зачем |
|-----|----------------|-------------------|-------|
| **Шаг 2** | [PACKAGE_JSON_SETUP.md](./PACKAGE_JSON_SETUP.md) | • Root `package.json`<br>• Web `package.json`<br>• `pnpm-workspace.yaml` | Управление зависимостями, workspaces |
| **Шаг 3** | [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md) | • Root `tsconfig.json`<br>• `vite.config.ts` | Алиасы для DDD слоев, сборка проекта |
| **Шаг 4** | [ESLINT_SETUP.md](./ESLINT_SETUP.md) | • `eslint.config.js`<br>• Scripts в `package.json` | Линтинг + архитектурные границы |

#### 🎨 Опциональные шаги

| Шаг | Файл инструкции | Что настраивается | Альтернативы |
|-----|----------------|-------------------|--------------|
| **Шаг 5** | [TAILWIND_SETUP.md](./TAILWIND_SETUP.md) | • Tailwind CSS v4<br>• Catppuccin тема | CSS Modules, styled-components, Emotion |

### 🎯 Философия: Single Source of Truth

**Краткий обзор в README** → **Детальная инструкция в отдельном файле** → **Канонические правила в docs/**

#### Documentation Flow [#diagram:flow]

```
README.md (этот файл)           ← Краткий обзор шагов + ссылки
    ↓ ссылается на
Обязательные шаги:
├─ PACKAGE_JSON_SETUP.md        ← package.json и workspaces
├─ TYPESCRIPT_VITE_CONFIG.md    ← tsconfig, vite алиасы
└─ ESLINT_SETUP.md              ← ESLint + архитектурные границы

Опциональные шаги:
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
