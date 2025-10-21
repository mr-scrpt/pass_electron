# TypeScript & Vite Configuration

> **Тип**: Обязательная настройка
> 
> **Зачем**: Алиасы для DDD слоев, сборка проекта

Настройка TypeScript paths и Vite с алиасами для доступа к DDD слоям из presentation layer.

## 🎯 Цель

Чтобы presentation мог импортировать из DDD слоев:

#### Import Example [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '@/composition'           // ← Единый алиас!
import { Resource } from '@/domain'               // ← Через Public API!
```

**Vite должен знать** где искать эти файлы.

---

## 1️⃣ TypeScript Configuration (Root) - для DDD слоев

**Файл: `tsconfig.json`** (в корне проекта)

Создать root tsconfig для проверки типов в DDD слоях (domain, application, infrastructure, composition).

#### Root tsconfig.json [#config|#structure:path]

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "noEmit": true,
    
    "baseUrl": ".",
    "paths": {
      "@/domain": ["./src/domain/index.ts"],
      "@/domain/*": ["./src/domain/*"],
      "@/application": ["./src/application/index.ts"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure": ["./src/infrastructure/index.ts"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/composition": ["./src/composition/index.ts"],
      "@/composition/*": ["./src/composition/*"]
    }
  },
  
  "include": [
    "src/domain/**/*.ts",
    "src/application/**/*.ts",
    "src/infrastructure/**/*.ts",
    "src/composition/**/*.ts",
    "src/shared/**/*.ts"
  ],
  
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "src/presentation"
  ]
}
```

**Зачем:**
- ✅ Проверка типов в DDD слоях независимо от UI
- ✅ `pnpm typecheck` проверяет domain/application/infrastructure/composition
- ✅ Presentation проверяется отдельно (свой tsconfig)
- ✅ Алиасы для кросс-модульных импортов внутри DDD слоев

---

## 2️⃣ TypeScript Configuration (Web Presentation)

> **📦 Файл уже создан**: React Router CLI сгенерировал `src/presentation/web/react/tsconfig.json`

**Что нужно изменить**: Добавить алиасы для доступа к DDD слоям

### Изменения в tsconfig.json

**Файл: `src/presentation/web/react/tsconfig.json`**

#### Web tsconfig.json - только изменения [#config|#structure:path]

```json
{
  "include": [
    // ... остальная конфигурация без изменений
    "**/*",
    "**/.server/**/*",
    "**/.client/**/*",
    ".react-router/types/**/*"
  ],
  "compilerOptions": {
    // ... остальная конфигурация без изменений
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "types": ["node", "vite/client"],
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "rootDirs": [".", "./.react-router/types"],
    "baseUrl": ".",
    
    // ✏️ ИЗМЕНИТЬ ЭТОТ БЛОК:
    "paths": {
      "@/*": ["./src/*"],                                    // Локальные файлы
      "@/domain": ["../../../domain/index.ts"],              // Domain Public API
      "@/composition": ["../../../composition/index.ts"],    // Composition Facades
      "@/application": ["../../../application/index.ts"],    // Application Public API (для DTO)
      "@/infrastructure": ["../../../infrastructure/index.ts"] // Infrastructure Public API
    },
    
    // ... остальная конфигурация без изменений
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

**Что изменилось:**

**Было (сгенерировано CLI):**
```json
"paths": {
  "~/*": ["./app/*"]
}
```

**Стало (с доступом к DDD слоям):**
```json
"paths": {
  "@/*": ["./src/*"],                                    // ← Изменили ~ на @
  "@/domain": ["../../../domain/index.ts"],              // ← Добавили
  "@/composition": ["../../../composition/index.ts"],    // ← Добавили
  "@/application": ["../../../application/index.ts"],    // ← Добавили
  "@/infrastructure": ["../../../infrastructure/index.ts"] // ← Добавили
}
```

**Почему `../../../`?**
```
src/presentation/web/react/  ← мы здесь (tsconfig.json)
    ↑
    ├── src/           ← локальные файлы (@/*)
    └── ../../../      ← 3 уровня вверх = корень проекта
        ├── domain/
        ├── composition/
        └── application/
```

**Ключевые моменты:**
- ✅ `@/*` - локальные файлы presentation (вместо `~/*`)
- ✅ `@/domain` - Public API Domain Layer
- ✅ `@/composition` - Facades из Composition
- ✅ `@/application` - Public API Application (для DTO)
- ✅ Остальная конфигурация остается без изменений

---

## 3️⃣ Vite Configuration (Web Presentation)

> **📦 Файл уже создан**: React Router CLI сгенерировал `src/presentation/web/react/vite.config.ts`
>
> **Текущее состояние** (сгенерированный файл):
>
> #### Generated vite.config.ts [#code|#structure:path]
>
> ```typescript
> // src/presentation/web/react/vite.config.ts
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

#### Custom vite.config.ts [#code|#structure:path]

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

## 4️⃣ Примеры импортов

### В presentation/web/react/src/routes/_index.tsx

#### Route with Imports [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import type { Route } from './+types/_index'

// ✅ Типы из Domain через Public API
import { Resource, ResourceId } from '@/domain'

// ✅ Facades из Composition
import { queries } from '@/composition'

// ✅ Локальные компоненты через @/
import { ResourceList } from '@/components/ResourceList'
import { useModal } from '@/hooks/useModal'

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

#### Domain Imports [#code|#structure:path]

```typescript
// src/domain/resource/Resource.ts
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

#### Composition Imports [#code|#structure:path]

```typescript
// src/composition/queries/ResourceQueries.ts
// ✅ Типы из Domain через Public API
import { Resource } from '@/domain'

// ✅ Handlers через Public API (Composition имеет доступ ко всем)
import { GetResourcesHandler } from '@/application/queries'

// ✅ Инфраструктура через Public API
import { ApiResourceRepository } from '@/infrastructure/repositories'

// Facade для упрощения UI
export const queries = {
  resources: {
    async list() {
      // ✅ DI логика здесь! Composition - единственный слой с доступом ко всем
      const repository = new ApiResourceRepository()
      const handler = new GetResourcesHandler(repository)
      return await handler.execute()
    }
  }
}
```

---

## 5️⃣ Проверка конфигурации

### TypeScript

#### Check TypeScript [#command]

```bash
# Проверка Web Presentation (есть файлы)
pnpm typecheck

# Проверка DDD слоев (когда будут файлы после Step 1)
pnpm typecheck:root

# Не должно быть ошибок импортов
```

### Vite

#### Run Dev Server [#command]

```bash
# Запуск dev server
pnpm dev:web

# Vite должен успешно резолвить все импорты
```

### Тест импортов

Создайте тестовый файл:

#### Test Imports [#code|#structure:path]

```typescript
// src/presentation/web/react/src/test-imports.ts

// Тестируем что все алиасы работают
import { Resource } from '@/domain'        // Public API
import { queries } from '@/composition'    // Facades
import { ResourceList } from '@/components/ResourceList'  // Локальные

// ❌ Эти импорты НЕ должны работать в Presentation!
// import { ListResourcesHandler } from '@/application/queries/handlers/ListResourcesHandler'
// import { ApiClient } from '@/infrastructure/api/ApiClient'

console.log('✅ Все импорты работают!')
```

Запустите `pnpm dev:web` - не должно быть ошибок резолва модулей.

---

## 6️⃣ Troubleshooting

### Ошибка: Cannot find module '@/domain' или '@/composition'

**Проблема**: `vite-tsconfig-paths` не читает `tsconfig.json`.

**Решение**:
1. Проверить что `vite-tsconfig-paths` установлен:

#### Install Plugin [#command]

   ```bash
   pnpm add -D vite-tsconfig-paths
   ```

2. Проверить что плагин добавлен в `vite.config.ts`:

#### Check Plugin [#code]

   ```typescript
   import tsconfigPaths from "vite-tsconfig-paths";
   
   export default defineConfig({
     plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],  // ← Должен быть
   });
   ```

3. Перезапустить dev server:

#### Restart Server [#command]

   ```bash
   pnpm dev:web
   ```

### Ошибка: Module not found in routes

**Проблема**: React Router не находит routes.

**Решение**: React Router CLI автоматически настраивает `appDirectory`. Если проблема осталась:

1. Проверить структуру:

#### Check Structure [#structure:tree]

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

#### Check Paths [#config]

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

### Root tsconfig (для DDD слоев):
- [ ] Создан `tsconfig.json` в корне проекта
- [ ] Настроены `paths` для алиасов `@/domain`, `@/application`, etc.
- [ ] `include` содержит DDD слои (domain, application, infrastructure, composition)
- [ ] `exclude` содержит `src/presentation`
- [ ] `pnpm typecheck` проходит без ошибок (когда будут файлы в DDD слоях)

### Web tsconfig (для Presentation):
- [ ] ✅ `src/presentation/web/react/tsconfig.json` уже создан React Router CLI
- [ ] Изменен `paths` - добавлены алиасы для DDD слоев
- [ ] Изменен `~/*` на `@/*` для локальных файлов
- [ ] ✅ `vite.config.ts` уже создан React Router CLI
- [ ] ✅ `vite-tsconfig-paths` уже установлен и настроен
- [ ] (Опционально) Добавлены дополнительные настройки в `vite.config.ts` (порт, etc.)

### Проверка:
- [ ] `pnpm dev:web` запускается без ошибок
- [ ] Импорты `@/domain`, `@/composition` работают в routes
- [ ] Локальные импорты `@/*` работают в components

---

## 🔗 Связанные документы

- [TAILWIND_SETUP.md](./TAILWIND_SETUP.md) - настройка Tailwind CSS (опционально)
- [docs/ARCHITECTURE_BOUNDARIES.md](../../docs/ARCHITECTURE_BOUNDARIES.md) - правила импортов
- [docs/PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) - структура проекта
