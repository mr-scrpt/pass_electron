# Tailwind CSS Setup - Настройка стилей

> **Тип**: Дополнительная библиотека (опционально)
> 
> **Зачем**: Готовая система стилей с Catppuccin темой для красивого UI

---

## 🎯 Цель

Настроить **Tailwind CSS v4** с темой **Catppuccin Mocha** для presentation layer.

> **💡 Примечание**: Tailwind - это **опциональная** зависимость. Можно использовать любую другую систему стилей (CSS Modules, styled-components, etc.)

---

## 📦 Установка

> **⚠️ ВАЖНО**: Устанавливать **только** в web presentation workspace, НЕ в root!

```bash
# Перейти в presentation/web/react директорию
cd src/presentation/web/react

# Установить Tailwind v4 и Catppuccin
pnpm add -D @tailwindcss/vite @catppuccin/tailwindcss
```

**Что устанавливаем:**
- `@tailwindcss/vite` - Tailwind v4 как Vite plugin
- `@catppuccin/tailwindcss` - Catppuccin цветовая палитра

**Зависимости автоматически добавятся** в `src/presentation/web/react/package.json`

---

## ⚙️ Конфигурация

### 1. Обновить `vite.config.ts`

Добавить Tailwind plugin:

**Файл:** `src/presentation/web/react/vite.config.ts`

```typescript
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite"; // ← Добавить
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const projectRoot = path.resolve(__dirname, "../../../..");

export default defineConfig({
  root: projectRoot,
  plugins: [
    tailwindcss(), // ← Добавить перед reactRouter!
    reactRouter({
      appDirectory: "src/presentation/web/react/src",
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@domain": path.resolve(projectRoot, "src/domain/index.ts"),
      "@api": path.resolve(projectRoot, "src/composition/index.ts"),
      "@client": path.resolve(projectRoot, "src/presentation/web/react/src"),
      "@internal/application": path.resolve(projectRoot, "src/application"),
      "@internal/infrastructure": path.resolve(projectRoot, "src/infrastructure"),
    },
  },
});
```

### 2. Создать `tailwind.config.js`

**Файл:** `src/presentation/web/react/tailwind.config.js`

```javascript
import { catppuccin } from '@catppuccin/tailwindcss'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    catppuccin({
      prefix: 'ctp',
      defaultFlavour: 'mocha',
    }),
  ],
}
```

**Опции Catppuccin:**
- `prefix: 'ctp'` - префикс для классов (например: `bg-ctp-base`, `text-ctp-mauve`)
- `defaultFlavour: 'mocha'` - темная тема Catppuccin

> **📚 См. также**: [docs/ui/CATPPUCCIN_MOCHA.md](../../docs/ui/CATPPUCCIN_MOCHA.md) - полное описание цветовой схемы

### 3. Создать CSS файл

**Файл:** `src/presentation/web/react/src/styles/tailwind.css`

```css
@import "tailwindcss";
```

> **💡 Tailwind v4**: В новой версии достаточно одной строки `@import "tailwindcss"`!

### 4. Импортировать в `root.tsx`

**Файл:** `src/presentation/web/react/src/root.tsx`

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

---

## ✅ Проверка работы

### 1. Создать тестовый компонент

**Файл:** `src/presentation/web/react/src/routes/_index.tsx`

```typescript
export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ctp-base">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ctp-mauve mb-4">
          🔐 Password Manager
        </h1>
        <p className="text-ctp-text">
          Tailwind CSS + Catppuccin Mocha ✅
        </p>
      </div>
    </div>
  )
}
```

### 2. Запустить dev сервер

```bash
cd src/presentation/web/react
pnpm dev
```

Открой `http://localhost:5173` - должна быть темная страница с фиолетовым заголовком!

---

## 🎨 Использование Catppuccin цветов

### Основные цвета

```typescript
// Фоны
<div className="bg-ctp-base">      {/* Основной фон */}
<div className="bg-ctp-mantle">    {/* Вторичный фон */}
<div className="bg-ctp-crust">     {/* Третичный фон */}

// Текст
<p className="text-ctp-text">      {/* Основной текст */}
<p className="text-ctp-subtext1">  {/* Вторичный текст */}

// Акценты
<button className="bg-ctp-mauve">  {/* Фиолетовый */}
<button className="bg-ctp-blue">   {/* Синий */}
<button className="bg-ctp-green">  {/* Зеленый */}
<button className="bg-ctp-red">    {/* Красный */}
```

### Полная палитра

См. [docs/ui/CATPPUCCIN_MOCHA.md](../../docs/ui/CATPPUCCIN_MOCHA.md) для:
- Полного списка цветов
- Семантического использования
- Примеров компонентов
- Темной/светлой темы

---

## 🔄 Альтернативы Tailwind

Если не хочешь использовать Tailwind, можно взять:

### CSS Modules
```bash
# Уже поддерживается Vite из коробки
# Просто создай файл Component.module.css
```

### styled-components
```bash
cd src/presentation/web/react
pnpm add styled-components
pnpm add -D @types/styled-components
```

### Emotion
```bash
cd src/presentation/web/react
pnpm add @emotion/react @emotion/styled
```

### Обычный CSS
```typescript
// root.tsx
import "./styles/global.css"
```

---

## 📋 Чеклист

- [ ] `@tailwindcss/vite` установлен
- [ ] `@catppuccin/tailwindcss` установлен
- [ ] `tailwind.config.js` создан
- [ ] `tailwindcss()` добавлен в `vite.config.ts`
- [ ] `styles/tailwind.css` создан
- [ ] `tailwind.css` импортирован в `root.tsx`
- [ ] Тестовая страница показывает Catppuccin цвета

---

## 🔗 Связанные документы

- [docs/ui/CATPPUCCIN_MOCHA.md](../../docs/ui/CATPPUCCIN_MOCHA.md) - полная палитра цветов
- [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md) - базовая настройка Vite
- [Catppuccin официальная документация](https://github.com/catppuccin/catppuccin)

---

**Tailwind настроен! Теперь можно использовать готовую систему стилей с красивой темой.** 🎨
