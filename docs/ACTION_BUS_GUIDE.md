# Action Bus - Quick Start Guide

## 🎯 **Что такое Action Bus?**

**Action Bus** - система для коммуникации между Core Systems (Keymap, Modal, etc.) и Presentation Layer (UI handlers).

### **Отличия от CQRS Command Bus:**

| Аспект | CQRS Command Bus | Action Bus |
|--------|------------------|------------|
| **Цель** | Бизнес-операции | UI взаимодействия |
| **Команды** | `CreateResourceCommand` | `ShowRandomResourceAction` |
| **Handlers** | Application Layer | Presentation Layer |
| **Регистрация** | Статическая (modules) | Динамическая (useEffect) |
| **Cleanup** | Нет | Да (unregister) |
| **Возврат** | `Validation<IError[], void>` | `void` |

---

## 📦 **Архитектура**

```
┌─────────────────────────────────────────┐
│  Application Layer (Core)               │
│  ├── actions/                           │
│  │   ├── IAction.ts                     │
│  │   ├── IActionBus.ts (Port)           │
│  │   └── ShowRandomResourceAction.ts    │
│  └── services/keymap/                   │
│      └── keymaps/home.ts                │
└──────────────┬────────────────────────────┘
               │
┌──────────────▼────────────────────────────┐
│  Infrastructure Layer (Adapter)          │
│  └── actions/                            │
│      └── InMemoryActionBus.ts            │
└──────────────┬────────────────────────────┘
               │
┌──────────────▼────────────────────────────┐
│  Presentation Layer (Handlers)           │
│  └── routes/home.tsx                     │
│      └── ShowRandomResourceHandler       │
└──────────────────────────────────────────┘
```

---

## 🚀 **Пример: Ctrl+I → Случайный ресурс**

### **1. Создаем Action (Application Layer)**

```typescript
// src/application/actions/actions/ShowRandomResourceAction.ts
import type { IAction } from '../IAction'

export class ShowRandomResourceAction implements IAction {
  readonly type = 'ShowRandomResourceAction'
  constructor() {}
}
```

### **2. Создаем Keymap (Application Layer)**

```typescript
// src/application/services/keymap/keymaps/home.ts
import type { Keymap } from '../types'
import { ShowRandomResourceAction } from '@/application/actions'

export const homeKeymaps: Keymap[] = [
  {
    id: 'show-random-resource',
    name: 'Show Random Resource',
    binding: { key: 'i', ctrl: true },
    action: async (ctx) => {
      // ✅ Keymap НЕ ЗНАЕТ о React, setState, DOM
      await ctx.actionBus?.dispatch(
        new ShowRandomResourceAction()
      )
    },
    description: 'Show random resource from list',
    modes: ['navigation'],
    routes: ['/']
  }
]
```

### **3. Создаем Handler (Presentation Layer)**

```typescript
// src/presentation/web/react/src/routes/home.tsx
import { useState, useEffect } from 'react'
import type { IActionHandler } from '@/application/actions'
import { ShowRandomResourceAction } from '@/application/actions'
import { ServiceContainer } from '@/composition'

// Handler - знает о React state
class ShowRandomResourceHandler implements IActionHandler<ShowRandomResourceAction> {
  constructor(
    private resources: ResourceListItemDTO[],
    private setRandomResource: (resource: ResourceListItemDTO | null) => void
  ) {}
  
  handle(_action: ShowRandomResourceAction): void {
    if (this.resources.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * this.resources.length)
    const randomResource = this.resources[randomIndex]
    
    // ✅ Обновляем UI (React state)
    this.setRandomResource(randomResource)
    
    // ✅ Логируем на сервере
    console.log('🎲 Random Resource:', randomResource)
  }
}

export default function Home() {
  const data = useLoaderData<LoaderData>()
  const resources = data.resources ?? []
  const [randomResource, setRandomResource] = useState<ResourceListItemDTO | null>(null)
  
  // ✅ Регистрация handler в useEffect
  useEffect(() => {
    const actionBusResult = ServiceContainer.getActionBus()
    
    return actionBusResult
      .map(actionBus => {
        const handler = new ShowRandomResourceHandler(resources, setRandomResource)
        
        actionBus.register('ShowRandomResourceAction', handler)
        
        // Cleanup при unmount
        return () => {
          actionBus.unregister('ShowRandomResourceAction')
        }
      })
      .mapLeft(() => () => {})
      .value
  }, [resources])
  
  return (
    <div>
      {randomResource && (
        <div className="random-highlight">
          🎲 {randomResource.namespace}/{randomResource.name}
        </div>
      )}
      {/* ... */}
    </div>
  )
}
```

---

## ✅ **Workflow:**

1. **User** нажимает `Ctrl+I`
2. **KeymapExecutor** → вызывает `homeKeymaps[0].action(ctx)`
3. **Keymap** → `ctx.actionBus.dispatch(new ShowRandomResourceAction())`
4. **Action Bus** → находит handler
5. **ShowRandomResourceHandler** → выбирает случайный ресурс, обновляет state, логирует
6. **React** → ре-рендерит UI с выделенным ресурсом

---

## 🎯 **Когда использовать Action Bus?**

### **✅ Используй Action Bus для:**
- Навигации (`NavigateToAction`)
- Копирования в буфер (`CopyToClipboardAction`)
- UI взаимодействий (`ShowRandomResourceAction`)
- Системных действий (открыть modal, сменить фокус)

### **❌ НЕ используй Action Bus для:**
- Бизнес-операций (используй CQRS Command Bus)
- Изменения данных в repository (используй Commands)
- Domain logic (используй Domain Layer)

---

## 📚 **См. также:**

- **[COMMAND_BUS.md](./COMMAND_BUS.md)** - детальное описание паттерна
- **[COMPOSITION_LAYER.md](./COMPOSITION_LAYER.md)** - DI Container
- **[DATA_FLOW.md](./DATA_FLOW.md)** - поток данных через слои

---

**Дата:** 2025-01-26  
**Версия:** 1.0 (Action Bus Implementation)
