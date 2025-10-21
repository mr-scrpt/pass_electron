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

#### Install Tailwind [#command]

```bash
# Из корня проекта - установить в web workspace через --filter
pnpm add -D @tailwindcss/vite @catppuccin/tailwindcss --filter @password-manager/web
```

**Что устанавливаем:**
- `@tailwindcss/vite` - Tailwind v4 как Vite plugin
- `@catppuccin/tailwindcss` - Catppuccin цветовая палитра

**Зависимости автоматически добавятся** в `src/presentation/web/react/package.json`

---

## ⚙️ Конфигурация

### 1. Обновить `vite.config.ts`

> **📦 Файл уже создан**: React Router CLI создал `src/presentation/web/react/vite.config.ts`

**Что нужно добавить**: Импорт и плагин Tailwind

**Файл:** `src/presentation/web/react/vite.config.ts`

#### Vite Config - только изменения [#config|#structure:path]

```typescript
// src/presentation/web/react/vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite"; // ← ДОБАВИТЬ импорт
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(), // ← ДОБАВИТЬ плагин (перед reactRouter!)
    reactRouter(),
    tsconfigPaths()
  ],
});
```

**Что добавляется:**
1. **Импорт** `tailwindcss` из `@tailwindcss/vite`
2. **Плагин** `tailwindcss()` в массив plugins (перед `reactRouter()`)

**Зачем перед reactRouter:**
- Tailwind обрабатывает CSS до того, как React Router обработает компоненты
- Правильный порядок загрузки стилей

### 2. Создать `tailwind.config.js`

> **💡 Важно**: Используем `.js` (не `.ts`), так как Catppuccin не экспортирует TypeScript типы

**Файл:** `src/presentation/web/react/tailwind.config.js`

#### Tailwind Config [#config|#structure:path]

```javascript
// src/presentation/web/react/tailwind.config.js
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

**Почему `.js`, а не `.ts`:**
- Catppuccin - JavaScript пакет без TypeScript типов
- В `.ts` файле будут ошибки типов (но код работает)
- `.js` файл избегает ошибок TypeScript

> **📚 См. также**: [docs/ui/CATPPUCCIN_MOCHA.md](../../docs/ui/CATPPUCCIN_MOCHA.md) - полное описание цветовой схемы

### 3. Создать CSS файл

**Файл:** `src/presentation/web/react/src/styles/tailwind.css`

#### Tailwind CSS [#code|#structure:path]

```css
/* src/presentation/web/react/src/styles/tailwind.css */
@import "tailwindcss";
```

> **💡 Tailwind v4**: В новой версии достаточно одной строки `@import "tailwindcss"`!

### 4. Импортировать в `root.tsx`

**Файл:** `src/presentation/web/react/src/root.tsx`

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

---

## ✅ Проверка работы

### 1. Создать тестовый компонент

**Файл:** `src/presentation/web/react/src/routes/_index.tsx`

#### Test Component [#code|#structure:path]

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
          Tailwind CSS + Catppuccin Mocha ✅
        </p>
      </div>
    </div>
  )
}
```

### 2. Запустить dev сервер

#### Run Dev Server [#command]

```bash
# Из корня проекта
pnpm dev:web
```

Открой `http://localhost:5173` - должна быть темная страница с фиолетовым заголовком!

---

## 🎨 Использование Catppuccin цветов

### Основные цвета

#### Color Examples [#code]

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

#### CSS Modules Info [#code]

```bash
# Уже поддерживается Vite из коробки
# Просто создай файл Component.module.css
```

### styled-components

#### Install Styled Components [#command]

```bash
# Из корня проекта - установить в web workspace
pnpm add styled-components --filter @password-manager/web
pnpm add -D @types/styled-components --filter @password-manager/web
```

### Emotion

#### Install Emotion [#command]

```bash
# Из корня проекта - установить в web workspace
pnpm add @emotion/react @emotion/styled --filter @password-manager/web
```

### Обычный CSS

#### Import CSS [#code|#structure:path]

```typescript
// src/presentation/web/react/src/root.tsx
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
