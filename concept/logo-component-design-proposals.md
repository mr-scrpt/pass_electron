# Logo Component Design Proposals

Предложения по реализации компонента **Logo** как части UI kit с вариациями.

---

## Анализ существующей архитектуры

### Паттерны из существующих компонентов:

#### Title Component
```typescript
- size: TITLE_SIZE (S, M, L, XL)
- view: TITLE_VIEW (PRIMARY, SECONDARY)
- as: ElementType (h1, h2, h3, etc.)
```

#### Input/Button Component
```typescript
- size: INPUT_SIZE (S, M, L, XL)
- view: INPUT_VIEW (PRIMARY, SECONDARY, OUTLINE)
- state: INPUT_STATE (IDLE, ERROR, SUCCESS, etc.)
- disabled/readOnly states
```

### Общая структура:
```
component/
├── domain/
│   ├── size.type.ts       # Enum + Type
│   ├── size.cln.ts        # Tailwind classes
│   ├── view.type.ts       # Enum + Type
│   └── view.cln.ts        # Tailwind classes
├── ui/
│   └── component.tsx      # React component
└── index.ts               # Exports
```

---

## 🎨 Вариант 1: Минимальный (Size + View)

### Простейший подход - фокус на размере и визуальном стиле

#### Props:
```typescript
interface LogoProps {
  size?: LogoSizeType;      // S, M, L, XL
  view?: LogoViewType;       // LOCK, SHIELD, ICON_ONLY, FULL
  className?: string;
}
```

#### Domain Types:

**size.type.ts:**
```typescript
export enum LOGO_SIZE {
  S,    // 24px
  M,    // 32px
  L,    // 48px
  XL,   // 64px
}
```

**view.type.ts:**
```typescript
export enum LOGO_VIEW {
  LOCK,        // Gradient lock (variant 3)
  SHIELD,      // Minimalist shield (variant 2)
  ICON_ONLY,   // Just icon
  FULL,        // Icon + "Password Manager" text
}
```

### ✅ Плюсы:
- Простая и понятная API
- Легко расширяется
- Консистентна с Title

### ❌ Минусы:
- Нет вариаций эффектов (glow, shadows)
- Ограниченная кастомизация

---

## 🎨 Вариант 2: Расширенный (Size + View + Variant)

### Добавляем варианты эффектов для premium look

#### Props:
```typescript
interface LogoProps {
  size?: LogoSizeType;       // S, M, L, XL
  view?: LogoViewType;        // LOCK, SHIELD
  variant?: LogoVariantType;  // FLAT, GLOW, PREMIUM
  withText?: boolean;         // Show "Password Manager" text
  theme?: ThemeType;          // Моно/Поли хроматическая палитра
  className?: string;
}
```

#### Domain Types:

**variant.type.ts:**
```typescript
export enum LOGO_VARIANT {
  FLAT,      // Без эффектов - чистый дизайн
  GLOW,      // С эффектом свечения
  PREMIUM,   // Gradient + shadow + glow
}
```

**theme.type.ts:**
```typescript
export enum LOGO_THEME {
  MOCHA,       // Catppuccin Mocha
  LATTE,       // Catppuccin Latte
  FRAPPE,      // Catppuccin Frappe
  MACCHIATO,   // Catppuccin Macchiato
}
```

### ✅ Плюсы:
- Гибкая кастомизация
- Подходит для разных контекстов (sidebar, header, splash)
- Поддержка тем

### ❌ Минусы:
- Более сложная API
- Больше комбинаций для тестирования

---

## 🎨 Вариант 3: Композитный (Separate Components)

### Разделение на отдельные специализированные компоненты

#### Структура:
```typescript
<Logo />           // Default (48px, lock, premium variant)
<LogoIcon />       // Just icon, no text
<LogoFull />       // Icon + text
<LogoCompact />    // Small icon для навбаров
```

#### Base Logo Props:
```typescript
interface LogoBaseProps {
  size?: number | LogoSizePreset;  // Custom size OR preset
  variant?: 'flat' | 'glow' | 'premium';
  className?: string;
  onClick?: () => void;
  href?: string;  // Превращает в интерактивную ссылку
}
```

### ✅ Плюсы:
- Семантически понятные названия
- Проще использовать для конкретных кейсов
- Меньше условной логики

### ❌ Минусы:
- Дублирование кода
- Больше файлов

---

## 🎨 Вариант 4: Compound Component Pattern

### Использование паттерна составных компонентов

#### Usage Example:
```tsx
<Logo size="L" variant="premium">
  <Logo.Icon type="lock" />
  <Logo.Text>Password Manager</Logo.Text>
</Logo>

// Или упрощенно:
<Logo.Lock size="L" />
<Logo.Shield size="M" variant="flat" />
<Logo.Full size="XL" />
```

#### Структура:
```typescript
Logo.Icon       // Иконка (lock/shield)
Logo.Text       // Текст
Logo.Lock       // Shorthand для lock icon
Logo.Shield     // Shorthand для shield icon
Logo.Full       // Icon + Text composite
```

### ✅ Плюсы:
- Максимальная гибкость
- Композиция из мелких блоков
- Современный паттерн

### ❌ Минусы:
- Сложнее в реализации
- Требует больше понимания от разработчика

---

## 🎯 Рекомендуемый подход: Гибрид варианта 2 и 3

### Комбинируем лучшее из обоих миров:

```typescript
// Основной компонент с полной кастомизацией
<Logo 
  size="L"
  view="LOCK"
  variant="PREMIUM"
  withText={true}
  theme="MOCHA"
/>

// Удобные алиасы для частых кейсов
<LogoLock size="L" variant="glow" />
<LogoShield size="M" />
<LogoCompact />  // Small lock, no text, for navbar
<LogoFull />     // Large lock with text, for splash
```

### Структура файлов:
```
logo/
├── domain/
│   ├── size.type.ts
│   ├── size.cln.ts
│   ├── view.type.ts
│   ├── variant.type.ts
│   └── theme.type.ts
├── data/
│   ├── lock-paths.ts      # SVG path data для lock
│   └── shield-paths.ts    # SVG path data для shield
├── ui/
│   ├── logo.tsx           # Основной компонент
│   ├── logo-lock.tsx      # Shorthand: Lock variant
│   ├── logo-shield.tsx    # Shorthand: Shield variant
│   ├── logo-compact.tsx   # Shorthand: Compact for navbar
│   └── logo-full.tsx      # Shorthand: Full with text
├── model/
│   └── useLogoClassBuilder.ts  # Hook для генерации классов
└── index.ts
```

---

## 📋 Сравнительная таблица

| Критерий | Вариант 1 | Вариант 2 | Вариант 3 | Вариант 4 | Гибрид |
|----------|-----------|-----------|-----------|-----------|--------|
| Простота API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Гибкость | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Консистентность с UI Kit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Легкость поддержки | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Время реализации | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## 💡 Примеры использования (Гибрид)

### В Header:
```tsx
<header>
  <Logo size="M" view="LOCK" variant="FLAT" withText={true} />
</header>
```

### В Sidebar (компактный):
```tsx
<aside>
  <LogoCompact />  {/* 32px, no text, subtle glow */}
</aside>
```

### На Splash Screen:
```tsx
<div className="splash">
  <LogoFull />  {/* 64px, premium variant, with text */}
</div>
```

### Custom размер:
```tsx
<Logo size={128} view="LOCK" variant="PREMIUM" />
```

---

## 🚀 Следующие шаги

1. **Выбрать подход** из предложенных вариантов
2. **Определить необходимые варианты**:
   - Какие size нужны? (S/M/L/XL или кастомные)
   - Какие view? (LOCK/SHIELD/оба)
   - Нужны ли variant? (FLAT/GLOW/PREMIUM)
   - Поддержка тем?
3. **Создать типы и domain layer**
4. **Реализовать SVG компоненты**
5. **Добавить shorthand компоненты** (если нужно)
6. **Создать storybook/demo страницу**

---

## ❓ Вопросы для обсуждения

1. Какие use case наиболее важны для вашего приложения?
2. Нужна ли поддержка анимаций (hover effects, pulse)?
3. Должен ли logo быть интерактивным (кликабельным)?
4. Нужна ли поддержка dark/light mode автоматически?
5. Какой вариант больше подходит под вашу архитектуру?

