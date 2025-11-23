# Group Hover Animation Implementation

## 🎯 Задача

Реализовать единую анимацию при hover на любую часть логотипа (SVG или текст "Password Manager").

## ❌ Проблема (было)

```typescript
// group класс был на SVG элементе
<svg className={animate ? "group" : ""}>
  {/* элементы с group-hover: */}
</svg>
```

**Результат**: анимация срабатывала только при наведении на SVG, но не на текст.

---

## ✅ Решение (стало)

### 1. **Переместили `group` на контейнер**

**`useLogoContainerClassBuilder.model.ts`:**
```typescript
export const useLogoContainerClassBuilder = (params) => {
  const { className, animate } = params;
  return cn(logoBaseCls, animate && "group", className);
};
```

Теперь `group` применяется к `<div>` контейнеру, оборачивающему и SVG, и текст.

### 2. **Убрали `group` из SVG компонентов**

**`lock-svg.tsx` и `shield-svg.tsx`:**
```typescript
// Убрали:
// className={animate ? "group" : ""}

<svg viewBox="0 0 48 48" fill="none">
  {/* SVG элементы с group-hover: классами */}
</svg>
```

SVG элементы продолжают использовать `group-hover:`, но теперь реагируют на родительский `group`.

### 3. **Добавили анимацию для текста**

**`useLogoTextClassBuilder.model.ts`:**
```typescript
return cn(
  logoTextBaseCls,
  logoTextColorCln[view],
  animate && [
    "transition-all duration-300",
    "group-hover:scale-105",  // ← Масштабирование при hover
  ],
);
```

Текст теперь тоже анимируется при hover на контейнер.

### 4. **Обновили Logo компонент**

**`logo.tsx`:**
```typescript
// Передаем animate в container builder
const containerClass = useLogoContainerClassBuilder({ className, animate });
```

---

## 📊 Структура DOM

```html
<div class="group ...">  <!-- ← group класс здесь -->
  <div class="...">
    <svg>
      <!-- Элементы с group-hover: классами -->
      <circle class="group-hover:opacity-60" />
      <rect class="group-hover:scale-105" />
      <path class="group-hover:stroke-width-4" />
    </svg>
  </div>
  <span class="group-hover:scale-105">  <!-- ← Текст тоже анимируется -->
    Password Manager
  </span>
</div>
```

---

## 🎬 Поведение

### Hover на SVG:
- ✅ SVG анимируется (glow, scale, stroke)
- ✅ Текст масштабируется

### Hover на текст "Password Manager":
- ✅ SVG анимируется (glow, scale, stroke)
- ✅ Текст масштабируется

### Результат:
**Единая анимация всего логотипа** независимо от того, на какую часть наводим курсор.

---

## 🔧 Измененные файлы

1. [`useLogoContainerClassBuilder.model.ts`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/model/useLogoContainerClassBuilder.model.ts)
   - Добавлен параметр `animate`
   - Добавлен класс `group` при `animate=true`

2. [`useLogoTextClassBuilder.model.ts`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/model/useLogoTextClassBuilder.model.ts)
   - Обновлены классы анимации
   - Добавлен `group-hover:scale-105`

3. [`logo.tsx`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/ui/logo.tsx)
   - Передача `animate` в `useLogoContainerClassBuilder`

4. [`lock-svg.tsx`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/data/lock-svg.tsx)
   - Удален `className={animate ? "group" : ""}`

5. [`shield-svg.tsx`](file:///home/mr/Hellkitchen/solution/pass/electron/project/src/presentation/web/react/src/shared/ui/logo/data/shield-svg.tsx)
   - Удален `className={animate ? "group" : ""}`

---

## ✅ Результат

- Hover на **любую часть** логотипа → анимация **всего** логотипа
- SVG glow эффект увеличивается
- SVG lock/shield масштабируется
- Текст "Password Manager" масштабируется
- Все анимации синхронизированы (duration: 300ms)

**Улучшенный UX**: логотип теперь чувствуется как единое целое!
