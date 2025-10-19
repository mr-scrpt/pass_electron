# TypeScript & Vite Configuration `#typescript` `#vite` `#configuration`

> **Тип**: Обязательная настройка
> 
> **Зачем**: Алиасы для DDD слоев, сборка проекта

Настройка TypeScript paths и Vite с алиасами для доступа к DDD слоям из presentation layer.

## 🎯 Цель

Чтобы presentation мог импортировать из DDD слоев:

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '@/composition'           // ← Единый алиас!
import { Resource } from '@/domain'               // ← Через Public API!
```

**Vite должен знать** где искать эти файлы.

---

## 1️⃣ TypeScript Configuration (Root)

**Файл: `tsconfig.json`** (в корне проекта)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "noEmit": true,
    
    "baseUrl": ".",
    "paths": {
      "@domain": ["./src/domain/index.ts"],
      "@domain/*": ["./src/domain/*"],
      "@api": ["./src/composition/index.ts"],
      "@client/*": ["./src/presentation/web/react/src/*"],
      "@internal/application/*": ["./src/application/*"],
      "@internal/infrastructure/*": ["./src/infrastructure/*"]
    }
  },
  
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "electron/**/*.ts"
  ],
  
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

**Ключевые моменты:**
- ✅ `baseUrl: "."` - относительно корня проекта
- ✅ `paths` - алиасы для DDD слоев
- ✅ `moduleResolution: "Bundler"` - для Vite
- ✅ `include` охватывает весь `src/`

---

## 2️⃣ Vite Configuration (Web Presentation)

> **📦 Файл уже создан**: React Router CLI сгенерировал `src/presentation/web/react/vite.config.ts`
>
> **Текущее состояние** (сгенерированный файл):
> ```typescript
> import { reactRouter } from "@react-router/dev/vite";
> import tailwindcss from "@tailwindcss/vite";
> import { defineConfig } from "vite";
> import tsconfigPaths from "vite-tsconfig-paths";
> 
> export default defineConfig({
>   plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
> });
> ```

### ✅ Что уже настроено

**`vite-tsconfig-paths`** - автоматически синхронизирует алиасы из `tsconfig.json`!

Это значит:
- ✅ Vite автоматически читает `paths` из `tsconfig.json`
- ✅ Все алиасы (`@/domain`, `@/composition`, etc.) работают без ручной настройки
- ✅ Изменения в `tsconfig.json` автоматически применяются в Vite

### 🔧 Что нужно добавить (опционально)

Если нужны дополнительные настройки (порт, CSS, etc.), добавьте их в `defineConfig`:

```typescript
// src/presentation/web/react/vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  
  // 🔧 ДОБАВИТЬ (если нужно):
  server: {
    port: 5173,           // Кастомный порт
    strictPort: true,     // Не пытаться найти другой порт
  },
});
```

**Как это работает:**

1. **`tsconfigPaths()`** - читает `tsconfig.json` и создает Vite алиасы автоматически
2. **`reactRouter()`** - настраивает React Router v7
3. **`tailwindcss()`** - интеграция Tailwind CSS

> **💡 Важно**: Не нужно вручную настраивать `resolve.alias` - `tsconfigPaths` делает это за вас!

---

## 3️⃣ Примеры импортов

### В presentation/web/react/src/routes/_index.tsx

```typescript
import type { Route } from './+types/_index'

// ✅ Типы из Domain через Public API
import { Resource, ResourceId } from '@/domain'

// ✅ Facades из Composition
import { queries } from '@/composition'

// ✅ Локальные компоненты через ~ (React Router alias)
import { ResourceList } from '~/components/ResourceList'
import { useModal } from '~/hooks/useModal'

export async function loader({ request }: Route.LoaderArgs) {
  // vite-tsconfig-paths резолвит @/composition → src/composition/index.ts
  return queries.resources.list(request)
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const resources: Resource[] = loaderData.resources
  
  return <ResourceList resources={resources} />
}
```

### В src/domain/resource/Resource.ts

```typescript
// ✅ Domain импортирует ТОЛЬКО других Domain объектов
// Внутри модуля - локальные импорты (через ./)
import { ResourceId } from './ResourceId'
import { Namespace } from './Namespace'

// Кросс-модульные импорты внутри Domain - через @/domain
import { DomainError } from '@/domain/shared/errors'

// ❌ Domain НЕ импортирует из других слоев!
// import { queries } from '@api'  // ← ЗАПРЕЩЕНО
// import { Handler } from '@internal/application'  // ← ЗАПРЕЩЕНО
```

### В src/composition/queries/ResourceQueries.ts

```typescript
// ✅ Типы из Domain через Public API
import { Resource } from '@/domain'

// ✅ Handlers напрямую (Composition имеет доступ ко всему)
import { ListResourcesHandler } from '@/application/queries/handlers/ListResourcesHandler'

// ✅ Инфраструктура напрямую
import { ApiResourceRepository } from '@/infrastructure/repositories/ApiResourceRepository'

// Facade для упрощения UI
export const queries = {
  resources: {
    async list() {
      const handler = new ListResourcesHandler(new ApiResourceRepository())
      return await handler.execute()
    }
  }
}
```

---

## 4️⃣ Проверка конфигурации

### TypeScript

```bash
# Из корня проекта
pnpm typecheck

# Не должно быть ошибок импортов
```

### Vite

```bash
# Запуск dev server
pnpm dev:web

# Vite должен успешно резолвить все импорты
```

### Тест импортов

Создайте тестовый файл:

```typescript
// src/presentation/web/react/src/test-imports.ts

// Тестируем что все алиасы работают
import { Resource } from '@/domain'        // Public API
import { queries } from '@/composition'    // Facades
import { ResourceList } from '~/components/ResourceList'  // Локальные (React Router alias)

// ❌ Эти импорты НЕ должны работать в Presentation!
// import { ListResourcesHandler } from '@/application/queries/handlers/ListResourcesHandler'
// import { ApiClient } from '@/infrastructure/api/ApiClient'

console.log('✅ Все импорты работают!')
```

Запустите `pnpm dev:web` - не должно быть ошибок резолва модулей.

---

## 5️⃣ Troubleshooting

### Ошибка: Cannot find module '@/domain' или '@/composition'

**Проблема**: `vite-tsconfig-paths` не читает `tsconfig.json`.

**Решение**:
1. Проверить что `vite-tsconfig-paths` установлен:
   ```bash
   pnpm add -D vite-tsconfig-paths
   ```

2. Проверить что плагин добавлен в `vite.config.ts`:
   ```typescript
   import tsconfigPaths from "vite-tsconfig-paths";
   
   export default defineConfig({
     plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],  // ← Должен быть
   });
   ```

3. Перезапустить dev server:
   ```bash
   pnpm dev:web
   ```

### Ошибка: Module not found in routes

**Проблема**: React Router не находит routes.

**Решение**: React Router CLI автоматически настраивает `appDirectory`. Если проблема осталась:

1. Проверить структуру:
   ```
   src/presentation/web/react/
   ├── vite.config.ts
   └── src/
       └── routes/
           └── _index.tsx
   ```

2. Перезапустить dev server

### TypeScript не видит типы

**Проблема**: `tsconfig.json` paths не настроены.

**Решение**: Проверить что в `tsconfig.json` есть `paths`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`vite-tsconfig-paths` автоматически синхронизирует эти пути с Vite.

---

## ✅ Чеклист

- [ ] Создан `tsconfig.json` в корне с `paths`
- [ ] ✅ `vite.config.ts` уже создан React Router CLI
- [ ] ✅ `vite-tsconfig-paths` уже установлен и настроен
- [ ] (Опционально) Добавлены дополнительные настройки в `vite.config.ts` (порт, etc.)
- [ ] `pnpm typecheck` проходит без ошибок
- [ ] `pnpm dev:web` запускается
- [ ] Импорты `@/domain`, `@/composition` работают в routes
- [ ] Локальные импорты `~/components` работают (React Router alias)

---

## 🔗 Связанные документы

- [TAILWIND_SETUP.md](./TAILWIND_SETUP.md) - настройка Tailwind CSS (опционально)
- [docs/ARCHITECTURE_BOUNDARIES.md](../../docs/ARCHITECTURE_BOUNDARIES.md) - правила импортов
- [docs/PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) - структура проекта
