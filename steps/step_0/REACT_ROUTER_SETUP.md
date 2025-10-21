# React Router Setup - Минимальные файлы для запуска

> **⚠️ ВАЖНО**: Создай эти файлы **ПЕРЕД** настройкой TypeScript, ESLint и Tailwind!
>
> React Router требует эти файлы для запуска dev сервера.

---

## 🎯 Цель

Создать минимальный набор файлов, необходимых для запуска React Router v7.

**Что создаем:**
1. `react-router.config.ts` - конфигурация React Router
2. `src/root.tsx` - корневой компонент приложения
3. `src/routes.ts` - конфигурация маршрутов
4. `src/routes/home.tsx` - главная страница
5. `src/styles/tailwind.css` - базовые стили

---

## 📦 Предварительные требования

- ✅ Web workspace создан через React Router CLI
- ✅ `package.json` в `src/presentation/web/react/` существует
- ✅ Зависимости установлены: `pnpm install`

---

## 📁 Файлы для создания

### 1. React Router Config

**Файл:** `src/presentation/web/react/react-router.config.ts`

#### React Router Config [#config|#structure:path]

```typescript
// src/presentation/web/react/react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // Указываем где находятся routes и root.tsx
  appDirectory: "src",
  
  // Server-side render by default
  ssr: true,
} satisfies Config;
```

**Зачем:**
- `appDirectory: "src"` - React Router будет искать `root.tsx` в `src/`
- `ssr: true` - включен Server-Side Rendering

---

### 2. Root Component

**Файл:** `src/presentation/web/react/src/root.tsx`

#### Root Component [#code|#structure:path]

```typescript
// src/presentation/web/react/src/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./styles/tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-ctp-base text-ctp-text">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
```

**Что здесь:**
- `Layout` - обертка с HTML структурой
- `<Meta />`, `<Links />` - мета-теги и стили
- `<Scripts />` - JavaScript бандлы
- `<Outlet />` - рендерит дочерние routes
- `bg-ctp-base`, `text-ctp-text` - Catppuccin цвета (будут работать после настройки Tailwind)

---

### 3. Routes Config

**Файл:** `src/presentation/web/react/src/routes.ts`

#### Routes Config [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes.ts
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
] satisfies RouteConfig;
```

**Зачем:**
- Определяет маршруты приложения
- `index("routes/home.tsx")` - главная страница `/`

---

### 4. Home Route

**Файл:** `src/presentation/web/react/src/routes/home.tsx`

#### Home Route [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/home.tsx
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ctp-mauve mb-4">
          Password Manager
        </h1>
        <p className="text-ctp-subtext0">
          Step 0 Complete! 🎉
        </p>
      </div>
    </div>
  );
}
```

**Что здесь:**
- Простая тестовая страница
- Использует Tailwind классы
- Catppuccin цвета (`text-ctp-mauve`, `text-ctp-subtext0`)

---

### 5. Tailwind CSS

**Файл:** `src/presentation/web/react/src/styles/tailwind.css`

#### Tailwind CSS [#code|#structure:path]

```css
/* src/presentation/web/react/src/styles/tailwind.css */
@import "tailwindcss";

/* Catppuccin Mocha theme for Tailwind v4 */
@import "@catppuccin/tailwindcss/mocha.css";
```

**Зачем:**
- Базовые стили Tailwind v4
- Тема Catppuccin Mocha (темная)

---

## ✅ Проверка

После создания всех файлов:

#### Test Dev Server [#command]

```bash
# Из корня проекта
pnpm dev:web
```

**Ожидаемый результат:**
- ✅ Сервер запускается без ошибок
- ✅ Открывается `http://localhost:5173`
- ✅ Видна страница (пока белая, темная будет после настройки Tailwind)

**Если ошибки:**
- Проверь пути к файлам
- Проверь что все файлы созданы
- Проверь синтаксис (нет опечаток)

---

## 📋 Чеклист

- [ ] `react-router.config.ts` создан
- [ ] `src/root.tsx` создан
- [ ] `src/routes.ts` создан
- [ ] `src/routes/home.tsx` создан
- [ ] `src/styles/tailwind.css` создан
- [ ] `pnpm dev:web` запускается без ошибок
- [ ] Страница открывается в браузере

---

## 🚀 Следующие шаги

После создания этих файлов переходи к настройке:

1. **[TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)** - TypeScript paths и Vite
2. **[ESLINT_SETUP.md](./ESLINT_SETUP.md)** - ESLint с архитектурными границами
3. **[TAILWIND_SETUP.md](./TAILWIND_SETUP.md)** - Tailwind CSS с Catppuccin (уже частично настроен)

---

## 💡 Примечания

- **React Router v7** не создает эти файлы автоматически
- Без `root.tsx` сервер не запустится
- Без `routes.ts` будет ошибка конфигурации
- `appDirectory: "src"` обязателен для нашей структуры

---

## 🔗 Связанные документы

- [React Router v7 Documentation](https://reactrouter.com)
- [README.md](./README.md) - общая инструкция Step 0
