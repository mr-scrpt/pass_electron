# Catppuccin Mocha - Цветовая схема

Проект использует цветовую схему Catppuccin Mocha.** — популярную темную цветовую схему с пастельными оттенками.

> **📚 Официальная документация**: [catppuccin/tailwindcss](https://github.com/catppuccin/tailwindcss)  
> **🎨 Интерактивная палитра**: [tailwindcss.catppuccin.com](https://tailwindcss.catppuccin.com/)

---

## 🎨 Палитра Catppuccin Mocha

### Accent Colors (Акцентные цвета)

| Имя | HEX | RGB | Использование |
|-----|-----|-----|---------------|
| **Rosewater** | `#f5e0dc` | `rgb(245, 224, 220)` | Мягкий акцент |
| **Flamingo** | `#f2cdcd` | `rgb(242, 205, 205)` | Светлый розовый |
| **Pink** | `#f5c2e7` | `rgb(245, 194, 231)` | Розовый |
| **Mauve** | `#cba6f7` | `rgb(203, 166, 247)` | Фиолетовый (primary) |
| **Red** | `#f38ba8` | `rgb(243, 139, 168)` | Красный (ошибки) |
| **Maroon** | `#eba0ac` | `rgb(235, 160, 172)` | Темно-красный |
| **Peach** | `#fab387` | `rgb(250, 179, 135)` | Оранжевый (акцент) |
| **Yellow** | `#f9e2af` | `rgb(249, 226, 175)` | Желтый (предупреждения) |
| **Green** | `#a6e3a1` | `rgb(166, 227, 161)` | Зеленый (успех) |
| **Teal** | `#94e2d5` | `rgb(148, 226, 213)` | Бирюзовый |
| **Sky** | `#89dceb` | `rgb(137, 220, 235)` | Небесный |
| **Sapphire** | `#74c7ec` | `rgb(116, 199, 236)` | Сапфир |
| **Blue** | `#89b4fa` | `rgb(137, 180, 250)` | Синий (primary) |
| **Lavender** | `#b4befe` | `rgb(180, 190, 254)` | Лавандовый |

### Neutral Colors (Нейтральные цвета)

| Имя | HEX | RGB | Использование |
|-----|-----|-----|---------------|
| **Text** | `#cdd6f4` | `rgb(205, 214, 244)` | Основной текст |
| **Subtext1** | `#bac2de` | `rgb(186, 194, 222)` | Вторичный текст |
| **Subtext0** | `#a6adc8` | `rgb(166, 173, 200)` | Tertiary текст |
| **Overlay2** | `#9399b2` | `rgb(147, 153, 178)` | Overlay элементы |
| **Overlay1** | `#7f849c` | `rgb(127, 132, 156)` | Overlay элементы |
| **Overlay0** | `#6c7086` | `rgb(108, 112, 134)` | Комментарии |
| **Surface2** | `#585b70` | `rgb(88, 91, 112)` | Поверхности |
| **Surface1** | `#45475a` | `rgb(69, 71, 90)` | Карточки |
| **Surface0** | `#313244` | `rgb(49, 50, 68)` | Поверхности |
| **Base** | `#1e1e2e` | `rgb(30, 30, 46)` | Основной фон |
| **Mantle** | `#181825` | `rgb(24, 24, 37)` | Mantle фон |
| **Crust** | `#11111b` | `rgb(17, 17, 27)` | Границы/рамки |

---

## 🚀 Установка

### Вариант 1: Официальный плагин (рекомендуется)

#### Установка [#command:pnpm-add-catppuccin]

```bash
pnpm add -D @catppuccin/tailwindcss
```

**В вашем CSS файле (`app/styles/tailwind.css`):**

#### CSS конфигурация [#code]

```css
@import "tailwindcss";

/* Импортируем Catppuccin Mocha тему */
@import "@catppuccin/tailwindcss/mocha.css";
```

**Использование в компонентах:**

```tsx
<div className="bg-ctp-base text-ctp-text">
  <h1 className="text-ctp-mauve">Hello Catppuccin!</h1>
  <button className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base">
    Click Me
  </button>
</div>
```

**Все цвета имеют префикс `ctp-`:**
- `bg-ctp-base` — основной фон
- `text-ctp-text` — основной текст
- `border-ctp-surface0` — границы
- `bg-ctp-mauve` — фиолетовый акцент

---

### Вариант 2: Ручная конфигурация Tailwind

Если не хотите использовать плагин, можно настроить цвета вручную в `tailwind.config.js`:

#### Tailwind конфигурация (ручная) [#config:tailwind]

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Catppuccin Mocha
        mocha: {
          // Accent colors
          rosewater: '#f5e0dc',
          flamingo: '#f2cdcd',
          pink: '#f5c2e7',
          mauve: '#cba6f7',
          red: '#f38ba8',
          maroon: '#eba0ac',
          peach: '#fab387',
          yellow: '#f9e2af',
          green: '#a6e3a1',
          teal: '#94e2d5',
          sky: '#89dceb',
          sapphire: '#74c7ec',
          blue: '#89b4fa',
          lavender: '#b4befe',
          // Neutral colors
          text: '#cdd6f4',
          subtext1: '#bac2de',
          subtext0: '#a6adc8',
          overlay2: '#9399b2',
          overlay1: '#7f849c',
          overlay0: '#6c7086',
          surface2: '#585b70',
          surface1: '#45475a',
          surface0: '#313244',
          base: '#1e1e2e',
          mantle: '#181825',
          crust: '#11111b',
        }
      },
    },
  },
  plugins: [],
}
```

**Использование в компонентах:**

```tsx
<div className="bg-mocha-base text-mocha-text">
  <h1 className="text-mocha-mauve">Hello Catppuccin!</h1>
  <button className="bg-mocha-blue hover:bg-mocha-sapphire text-mocha-base">
    Click Me
  </button>
</div>
```

---

## 🎨 Рекомендуемые комбинации

### Фоны и текст

```tsx
// Основной фон приложения
<body className="bg-mocha-base text-mocha-text">

// Карточки
<div className="bg-mocha-surface0 border border-mocha-surface2">

// Модальные окна
<div className="bg-mocha-mantle border border-mocha-crust">
```

### Кнопки

```tsx
// Primary кнопка
<button className="bg-mocha-mauve text-mocha-base hover:bg-mocha-lavender">
  Primary Action
</button>

// Secondary кнопка
<button className="bg-mocha-surface0 text-mocha-text hover:bg-mocha-surface1">
  Secondary Action
</button>

// Success кнопка
<button className="bg-mocha-green text-mocha-base hover:bg-mocha-teal">
  Success
</button>

// Danger кнопка
<button className="bg-mocha-red text-mocha-base hover:bg-mocha-maroon">
  Delete
</button>
```

### Уведомления

```tsx
// Success
<div className="bg-mocha-green/20 border border-mocha-green text-mocha-green">

// Warning
<div className="bg-mocha-yellow/20 border border-mocha-yellow text-mocha-yellow">

// Error
<div className="bg-mocha-red/20 border border-mocha-red text-mocha-red">

// Info
<div className="bg-mocha-blue/20 border border-mocha-blue text-mocha-blue">
```

### Инпуты

```tsx
<input 
  className="
    bg-mocha-surface0 
    text-mocha-text 
    border border-mocha-surface2 
    focus:border-mocha-mauve 
    focus:ring-mocha-mauve
    placeholder:text-mocha-overlay0
  "
  placeholder="Enter text..."
/>
```

---

## 📐 Семантические алиасы

Рекомендуется создать семантические алиасы для цветов в `tailwind.config.js`:

```javascript
colors: {
  // Semantic colors (на основе Catppuccin Mocha)
  primary: '#cba6f7',      // mocha-mauve
  secondary: '#89b4fa',    // mocha-blue
  success: '#a6e3a1',      // mocha-green
  warning: '#f9e2af',      // mocha-yellow
  error: '#f38ba8',        // mocha-red
  info: '#89dceb',         // mocha-sky
  
  // Background colors
  'bg-primary': '#1e1e2e',   // mocha-base
  'bg-secondary': '#313244', // mocha-surface0
  'bg-tertiary': '#45475a',  // mocha-surface1
  
  // Text colors
  'text-primary': '#cdd6f4',   // mocha-text
  'text-secondary': '#bac2de', // mocha-subtext1
  'text-tertiary': '#a6adc8',  // mocha-subtext0
  'text-muted': '#6c7086',     // mocha-overlay0
}
```

**Использование:**

```tsx
<button className="bg-primary text-bg-primary hover:bg-secondary">
  Primary Button
</button>
```

---

## 🌙 Dark Mode (опционально)

Если в будущем потребуется light theme (Latte):

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // или 'media'
  theme: {
    extend: {
      colors: {
        // Dark theme (Mocha)
        mocha: { /* ... */ },
        // Light theme (Latte)
        latte: {
          rosewater: '#dc8a78',
          flamingo: '#dd7878',
          pink: '#ea76cb',
          // ... остальные цвета Latte
        }
      }
    }
  }
}
```

---

## 📚 Дополнительные ресурсы

- **Официальный сайт**: [catppuccin.com](https://catppuccin.com)
- **GitHub репозиторий**: [catppuccin/catppuccin](https://github.com/catppuccin/catppuccin)
- **Tailwind плагин**: [catppuccin/tailwindcss](https://github.com/catppuccin/tailwindcss)
- **NPM пакет**: [@catppuccin/tailwindcss](https://www.npmjs.com/package/@catppuccin/tailwindcss)
- **Интерактивная палитра**: [tailwindcss.catppuccin.com](https://tailwindcss.catppuccin.com/)
- **Палитра с hex кодами**: [catppuccin.com/palette](https://catppuccin.com/palette/)

---

## ⚡ Quick Start

Для быстрого старта обновите `app/styles/tailwind.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-mocha-base text-mocha-text;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-mocha-mauve text-mocha-base hover:bg-mocha-lavender;
  }
  
  .btn-secondary {
    @apply bg-mocha-surface0 text-mocha-text hover:bg-mocha-surface1;
  }
  
  .card {
    @apply bg-mocha-surface0 rounded-lg shadow-sm border border-mocha-surface2;
  }
}
```

---

**🎨 Catppuccin — это community-driven проект с активной поддержкой!**
