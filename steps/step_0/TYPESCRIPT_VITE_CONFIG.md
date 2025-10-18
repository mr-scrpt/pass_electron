# TypeScript & Vite Configuration

Настройка TypeScript paths и Vite с алиасами для доступа к DDD слоям из presentation layer.

## 🎯 Цель

Чтобы presentation мог импортировать из DDD слоев:

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import { queries } from '~composition'           // ← 4 уровня выше!
import { Resource } from '~domain/resource/Resource'
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
      "~domain/*": ["./src/domain/*"],
      "~application/*": ["./src/application/*"],
      "~infrastructure/*": ["./src/infrastructure/*"],
      "~composition/*": ["./src/composition/*"],
      "~shared/*": ["./src/shared/*"]
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
      // ✅ Алиасы для DDD слоев (абсолютные пути)
      '~domain': path.resolve(projectRoot, 'src/domain'),
      '~application': path.resolve(projectRoot, 'src/application'),
      '~infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
      '~composition': path.resolve(projectRoot, 'src/composition'),
      '~shared': path.resolve(projectRoot, 'src/shared'),
      
      // ✅ Алиас для локальных импортов внутри presentation
      '~': path.resolve(__dirname, './src'),
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
3. **`resolve.alias`** - Vite резолвит `~domain/` → `src/domain/`

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

// ✅ Импорты из DDD слоев через алиасы
import { queries } from '~composition'
import { Resource } from '~domain/resource/Resource'
import { ResourceId } from '~domain/resource/ResourceId'

// ✅ Локальные импорты внутри presentation
import { ResourceList } from '~/components/ResourceList'
import { useModal } from '~/hooks/useModal'

export async function loader({ request }: Route.LoaderArgs) {
  // Vite резолвит ~composition → src/composition/
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
import { DomainError } from '~domain/shared/errors/DomainError'

// ❌ Domain НЕ импортирует из других слоев!
// import { queries } from '~composition'  // ← ЗАПРЕЩЕНО
```

### В src/composition/queries/ResourceQueries.ts

```typescript
// ✅ Composition импортирует из всех слоев
import { ListResourcesQuery } from '~application/queries/ListResourcesQuery'
import { getQueryBus } from '../ServiceContainer'

export const queries = {
  resources: {
    async list(request: Request) {
      const query = new ListResourcesQuery()
      return getQueryBus().execute(query)
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
import { Resource } from '~domain/resource/Resource'
import { ListResourcesQuery } from '~application/queries/ListResourcesQuery'
import { MockResourceRepository } from '~infrastructure/persistence/MockResourceRepository'
import { queries } from '~composition'

console.log('✅ Все импорты работают!')
```

Запустите `pnpm dev:web` - не должно быть ошибок резолва модулей.

---

## 6️⃣ Troubleshooting

### Ошибка: Cannot find module '~domain/...'

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
- [ ] Импорты `~domain/*` работают в routes

---

**Следующий шаг**: Создание базовых файлов React Router (root.tsx, routes, etc.)
