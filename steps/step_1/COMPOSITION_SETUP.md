# Composition Layer Setup

> **Назад:** [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)  
> **Далее:** [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)

---

## 🎯 Цель

Создать Composition Root для Dependency Injection.

> **📚 Детали**: [COMPOSITION_LAYER.md](../../docs/COMPOSITION_LAYER.md) - Composition Root

---

## Упрощенная версия для Step 1

Для Step 1 создаем минимальный DI без ServiceContainer. Просто экспортируем готовые инстансы.

**Файл: `src/composition/index.ts`**

```typescript
// src/composition/index.ts
import { MockResourceRepository } from '@/infrastructure/repositories'

/**
 * Composition Root (упрощенная версия для Step 1)
 * 
 * В следующих шагах добавим:
 * - ServiceContainer
 * - ResourceModule
 * - Query/Command Facades
 */

// Создаем репозиторий
export const resourceRepository = new MockResourceRepository()

// В будущем здесь будут:
// export const queries = { ... }
// export const commands = { ... }
```

**Почему так просто?**
- Step 1 фокусируется на Domain Layer
- Полноценный DI добавим в следующих шагах
- Пока достаточно одного репозитория

---

## ✅ Результат

```
src/composition/
└── index.ts
```

**Что дальше?**

Presentation Layer с React компонентами! → [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)

---

> **Назад:** [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md)  
> **Далее:** [PRESENTATION_SETUP.md](./PRESENTATION_SETUP.md)
