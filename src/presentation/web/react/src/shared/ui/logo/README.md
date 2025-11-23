# Logo Component

UI kit компонент для отображения логотипа Password Manager с различными вариациями.

## Quick Start

```tsx
import { Logo, LOGO_SIZE, LOGO_VIEW, LOGO_VARIANT } from "@/shared/ui/logo";

// Базовое использование
<Logo />

// С текстом
<Logo withText={true} />

// Полная конфигурация
<Logo
  size={LOGO_SIZE.L}
  view={LOGO_VIEW.PRIMARY}
  variant={LOGO_VARIANT.LOCK}
  withText={true}
  animate={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `LogoSizeType` | `LOGO_SIZE.L` | Размер: S (24px), M (32px), L (48px), XL (64px) |
| `view` | `LogoViewType` | `LOGO_VIEW.PRIMARY` | Цветовая схема: PRIMARY (mauve), SECONDARY (green) |
| `variant` | `LogoVariantType` | `LOGO_VARIANT.LOCK` | Форма: LOCK (замок), SHIELD (щит) |
| `withText` | `boolean` | `false` | Показывать текст "Password Manager" |
| `animate` | `boolean` | `true` | Включить hover анимации |
| `className` | `string` | `undefined` | Дополнительные CSS классы |

## Architecture

```
logo/
├── domain/          # Types & Classes
│   ├── size.type.ts
│   ├── size.cln.ts
│   ├── view.type.ts
│   ├── view.cln.ts
│   └── variant.type.ts
├── data/            # SVG Components
│   ├── lock-svg.tsx
│   └── shield-svg.tsx
├── ui/              # React Component
│   └── logo.tsx
└── index.ts         # Exports
```

## Demo

См. `/concept/logo-demo.tsx` для полного showcase всех вариаций.

## Colors (Catppuccin Mocha)

- **PRIMARY**: Lavender → Mauve → Pink gradient
- **SECONDARY**: Green → Teal gradient
