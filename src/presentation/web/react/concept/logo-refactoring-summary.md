# Logo Component Refactoring Summary

## 🎯 Objectives Achieved

Повышена **декларативность** Logo компонента в соответствии с архитектурой UI kit.

---

## ✨ Ключевые изменения

### 1. **Выделение логики в хуки** (как в Input/Button)

Вместо прямого использования `cn()` в компоненте, вся логика построения классов вынесена в специализированные хуки:

#### Created Hooks:

**`useLogoContainerClassBuilder.model.ts`**
```typescript
// Строит классы для контейнера
const containerClass = useLogoContainerClassBuilder({ className });
```

**`useLogoIconClassBuilder.model.ts`**
```typescript
// Строит классы для иконки
const iconClass = useLogoIconClassBuilder({ size, view });
```

**`useLogoTextClassBuilder.model.ts`**
```typescript
// Строит классы для текста
const textClass = useLogoTextClassBuilder({ view, animate });
```

### 2. **Использование коллекций вместо условий**

#### ❌ Было (императивно):
```typescript
const isLock = variant === LOGO_VARIANT.LOCK;
const isPrimary = view === LOGO_VIEW.PRIMARY;
const viewString = isPrimary ? "PRIMARY" : "SECONDARY";

// ...

{isLock ? (
  <LockSVG view={viewString} animate={animate} />
) : (
  <ShieldSVG view={viewString} animate={animate} />
)}
```

#### ✅ Стало (декларативно):
```typescript
const SVGComponent = logoVariantSVG[variant];

// ...

<SVGComponent view={view} animate={animate} />
```

**Создан файл [`variant-svg.map.tsx`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/data/variant-svg.map.tsx):**
```typescript
export const logoVariantSVG = {
  [LOGO_VARIANT.LOCK]: LockSVG,
  [LOGO_VARIANT.SHIELD]: ShieldSVG,
} satisfies EnsureAllKeys<LogoVariantType, FC<SVGComponentProps>>;
```

### 3. **Декларативные маппинги для цветов**

#### ❌ Было:
```typescript
isPrimary ? "text-ctp-mauve" : "text-ctp-green"
```

#### ✅ Стало:

**Создан файл [`text-color.cln.ts`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/data/text-color.cln.ts):**
```typescript
export const logoTextColorCln = {
  [LOGO_VIEW.PRIMARY]: "text-ctp-mauve",
  [LOGO_VIEW.SECONDARY]: "text-ctp-green",
} satisfies Record<LogoViewType, string>;
```

Затем используется в хуке:
```typescript
cn(logoTextBaseCls, logoTextColorCln[view], ...)
```

### 4. **Базовые классы вынесены в data layer**

**Создан файл [`base.cls.ts`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/data/base.cls.ts):**
```typescript
export const logoBaseCls = ["inline-flex", "items-center", "gap-3"];
export const logoIconBaseCls = ["flex-shrink-0"];
export const logoTextBaseCls = ["font-bold", "text-lg"];
```

---

## 📊 Сравнение до/после

### До рефакторинга:
- ❌ Условия `isLock`, `isPrimary`
- ❌ Тернарные операторы для выбора компонентов
- ❌ Строковые конверсии `viewString`
- ❌ Inline построение классов через `cn()`
- ❌ Хардкод классов в компоненте

### После рефакторинга:
- ✅ Коллекция `logoVariantSVG` для выбора компонента
- ✅ Хуки для построения всех классов
- ✅ Прямая передача branded types в SVG
- ✅ Декларативные маппинги в data layer
- ✅ Полное разделение ответственности

---

## 📁 Новая структура

```
logo/
├── domain/
│   ├── size.type.ts
│   ├── view.type.ts
│   └── variant.type.ts
├── data/
│   ├── lock-svg.tsx
│   ├── shield-svg.tsx
│   ├── size.cln.ts           ← Moved from domain/
│   ├── view.cln.ts           ← Moved from domain/
│   ├── variant-svg.map.tsx   ← NEW: SVG коллекция
│   ├── text-color.cln.ts     ← NEW: Цвета текста
│   └── base.cls.ts           ← NEW: Базовые классы
├── model/
│   ├── useLogoContainerClassBuilder.model.ts  ← NEW
│   ├── useLogoIconClassBuilder.model.ts       ← NEW
│   └── useLogoTextClassBuilder.model.ts       ← NEW
└── ui/
    └── logo.tsx              ← REFACTORED
```

---

## 🎯 Результат

### [`logo.tsx`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/ui/logo.tsx) теперь полностью декларативен:

```typescript
export const Logo = (props: LogoProps) => {
  const {
    size = LOGO_SIZE.L,
    view = LOGO_VIEW.PRIMARY,
    variant = LOGO_VARIANT.LOCK,
    withText = false,
    animate = true,
    className,
    ...rest
  } = props;

  // Get SVG component from collection using variant as key
  const SVGComponent = logoVariantSVG[variant];

  // Build classes using hooks
  const containerClass = useLogoContainerClassBuilder({ className });
  const iconClass = useLogoIconClassBuilder({ size, view });
  const textClass = useLogoTextClassBuilder({ view, animate });

  return (
    <div className={containerClass} {...rest}>
      <div className={iconClass}>
        <SVGComponent view={view} animate={animate} />
      </div>
      {withText && <span className={textClass}>Password Manager</span>}
    </div>
  );
};
```

### Преимущества:

1. **Читаемость** ↑ - нет вложенных условий
2. **Поддерживаемость** ↑ - логика в отдельных модулях
3. **Расширяемость** ↑ - добавить новый variant = добавить в коллекцию
4. **Типизация** ↑ - `EnsureAllKeys` гарантирует полноту маппингов
5. **Консистентность** ↑ - следует паттернам Input и Button

---

## 🔧 Техники архитектуры

### 1. **Полиморфизм через коллекции**
Вместо `if/else` используем `Record/Map` для динамического выбора компонентов.

### 2. **Хуки для инкапсуляции логики**
Каждый аспект UI (контейнер, иконка, текст) имеет свой хук.

### 3. **Branded Types + EnsureAllKeys**
Гарантия типобезопасности при работе с коллекциями.

### 4. **Separation of Concerns**
- **domain/** - типы и константы
- **data/** - данные (классы, маппинги, SVG)
- **model/** - логика (хуки)
- **ui/** - представление (компонент)

---

## ✅ Checklist

- [x] Устранены все условные операторы
- [x] Вся логика классов в хуках
- [x] SVG выбираются через коллекцию
- [x] Цвета задаются через маппинг
- [x] Branded types передаются напрямую
- [x] TypeScript ошибки исправлены
- [x] Код следует паттернам Input/Button

