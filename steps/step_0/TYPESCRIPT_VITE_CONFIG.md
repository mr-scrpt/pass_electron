# TypeScript & Vite Configuration

Настройка TypeScript paths и Vite с алиасами для доступа к DDD слоям из presentation layer.

## 🎯 Цель

Чтобы presentation мог импортировать из DDD слоев:

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '@/composition'           // ← Единый алиас!
import { Resource } from '@/domain/resource/Resource'
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

**Файл: `src/presentation/web/react/vite.config.ts`**

```typescript
import { reactRouter } from "@react-router/dev/vite"
import { defineConfig } from "vite"
import path from "path"

// Путь к корню проекта (4 уровня выше)
const projectRoot = path.resolve(__dirname, '../../../..')

export default defineConfig({
  // ✅ Указываем корень проекта
  root: projectRoot,
  
  plugins: [
    reactRouter({
      // ✅ Где искать React Router код (относительно root)
      appDirectory: "src/presentation/web/react/src",
    }),
  ],
  
  resolve: {
    alias: {
      // ✅ Public API - указывают на index.ts (только экспортированное)
      '@domain': path.resolve(projectRoot, 'src/domain/index.ts'),
      '@api': path.resolve(projectRoot, 'src/composition/index.ts'),
      
      // ✅ Локальные алиасы для Presentation
      '@client': path.resolve(projectRoot, 'src/presentation/web/react/src'),
      
      // ⚠️ Internal - указывают на директорию (доступ ко всем файлам)
      // Использовать ТОЛЬКО внутри Composition Layer!
      '@internal/application': path.resolve(projectRoot, 'src/application'),
      '@internal/infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
    }
  },
  
  css: {
    postcss: {
      // ✅ PostCSS config рядом с vite.config.ts
      config: path.resolve(__dirname),
    }
  },
  
  server: {
    port: 5173,
    strictPort: true,
  },
})
```

**Как это работает:**

1. **`root: projectRoot`** - Vite знает что корень в `password-manager/`
2. **`appDirectory`** - React Router ищет routes в `src/presentation/web/react/src/`
3. **`resolve.alias`** - Vite резолвит алиасы:
   - `@domain` → `src/domain/index.ts` (только Public API)
   - `@api` → `src/composition/index.ts` (facades)
   - `@client` → `src/presentation/web/react/src` (локальные компоненты)
   - `@internal/*` → директории (для Composition Layer)

---

## 3️⃣ Tailwind CSS Configuration

**Файл: `src/presentation/web/react/tailwind.config.js`**

```javascript
/** 
 * Tailwind CSS configuration for Web Presentation Layer
 * Used only in: src/presentation/web/react/
 */
export default {
  content: [
    "./src/**/*.{ts,tsx}",  // ← Относительно vite.config.ts
  ],
  plugins: [
    require("@catppuccin/tailwindcss")({
      prefix: "ctp",
      defaultFlavour: "mocha",
    }),
  ],
}
```

**Файл: `src/presentation/web/react/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 4️⃣ Примеры импортов

### В presentation/web/react/src/routes/_index.tsx

```typescript
import type { Route } from './+types/_index'

// ✅ Типы из Domain через Public API
import { Resource, ResourceId } from '@domain'

// ✅ Facades из Composition
import { queries } from '@api'

// ✅ Локальные компоненты через @client
import { ResourceList } from '@client/components/ResourceList'
import { useModal } from '@client/hooks/useModal'

export async function loader({ request }: Route.LoaderArgs) {
  // Vite резолвит @api → src/composition/index.ts
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
import { ResourceId } from './ResourceId'
import { Namespace } from './Namespace'
import { DomainError } from '@domain/shared/errors/DomainError'

// ❌ Domain НЕ импортирует из других слоев!
// import { queries } from '@api'  // ← ЗАПРЕЩЕНО
// import { Handler } from '@internal/application'  // ← ЗАПРЕЩЕНО
```

### В src/composition/queries/ResourceQueries.ts

```typescript
// ✅ Типы из Domain через Public API
import { Resource } from '@domain'

// ✅ Handlers через @internal (доступ к реализации)
import { ListResourcesHandler } from '@internal/application/queries/ListResourcesHandler'

// ✅ Инфраструктура через @internal
import { ApiResourceRepository } from '@internal/infrastructure/repositories/ApiResourceRepository'

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

## 5️⃣ Проверка конфигурации

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
import { Resource } from '@domain'  // Public API
import { queries } from '@api'      // Facades
import { ResourceList } from '@client/components/ResourceList'  // Локальные

// ❌ Эти импорты НЕ должны работать в Presentation!
// import { ListResourcesHandler } from '@internal/application/queries/ListResourcesHandler'
// import { ApiClient } from '@internal/infrastructure/api/ApiClient'

console.log('✅ Все импорты работают!')
```

Запустите `pnpm dev:web` - не должно быть ошибок резолва модулей.

---

## 6️⃣ Troubleshooting

### Ошибка: Cannot find module '@domain' или '@api'

**Проблема**: Vite не резолвит алиасы.

**Решение**:
```typescript
// vite.config.ts - проверить что projectRoot правильный
const projectRoot = path.resolve(__dirname, '../../../..')
console.log('Project root:', projectRoot)  // Должен быть /path/to/password-manager
```

### Ошибка: Module not found in routes

**Проблема**: React Router не находит routes.

**Решение**:
```typescript
// vite.config.ts
reactRouter({
  appDirectory: "src/presentation/web/react/src",  // ← Проверить путь
})
```

### TypeScript не видит типы

**Проблема**: `tsconfig.json` paths не синхронизирован с Vite.

**Решение**: Убедиться что пути в `tsconfig.json` и `vite.config.ts` совпадают.

---

## ✅ Чеклист

- [ ] Создан `tsconfig.json` в корне с paths
- [ ] Создан `vite.config.ts` в `src/presentation/web/react/`
- [ ] Алиасы в vite совпадают с tsconfig paths
- [ ] `projectRoot` в vite.config указывает на корень проекта
- [ ] Создан `tailwind.config.js` в presentation
- [ ] Создан `postcss.config.js` в presentation
- [ ] `pnpm typecheck` проходит без ошибок
- [ ] `pnpm dev:web` запускается
- [ ] Импорты `@domain`, `@api`, `@client` работают в routes
- [ ] Импорты `@internal/*` работают ТОЛЬКО в composition

---

**Следующий шаг**: Создание базовых файлов React Router (root.tsx, routes, etc.)
