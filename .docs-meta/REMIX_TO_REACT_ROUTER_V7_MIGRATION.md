# Миграция документации: Remix → React Router v7 (2025-01-18)

## 🎯 Обоснование

В декабре 2024 года Remix v2 был слит с React Router, став **React Router v7**. Все возможности Remix (SSR, server loaders, server actions, file-based routing) теперь являются частью React Router.

**Источники:**
- https://remix.run/blog/merging-remix-and-react-router
- https://reactrouter.com/
- https://reactrouter.com/upgrading/remix

---

## 📊 Обновленные файлы

### Steps (Пошаговые инструкции)

#### 1. `steps/step_0/README.md` ✅

**Изменения:**
- Команда создания проекта: `pnpm create remix@latest` → `npx create-react-router@latest`
- Технологический стек: "Remix" → "React Router v7"
- Package.json dependencies:
  - `@remix-run/node` → `react-router`
  - `@remix-run/react` → (удален, теперь в `react-router`)
  - `@remix-run/dev` → `@react-router/dev`
  - `@remix-run/serve` → `@react-router/serve`
- Scripts:
  - `remix vite:build` → `react-router build`
  - `remix vite:dev` → `react-router dev`
- TypeScript types: `@remix-run/node` → `@react-router/node`
- Vite plugin: `@remix-run/dev` → `@react-router/dev/vite`
- Импорт плагина: `import { vitePlugin as remix }` → `import { reactRouter }`
- Конфигурация Vite: `remix({ ... })` → `reactRouter()`
- Импорты в root.tsx и routes:
  - `from "@remix-run/react"` → `from "react-router"`
  - `from "@remix-run/node"` → типы из `./+types/route-name`

**Добавлено:**
- Примечание о слиянии Remix и React Router
- Упоминание что SSR включен из коробки
- Ссылки на новую документацию React Router v7

---

#### 2. `steps/step_1/README.md` ✅

**Изменения:**
- Поток данных: "Remix Loader" → "React Router Loader"
- Импорты в примерах кода:
  ```diff
  - import { useLoaderData } from '@remix-run/react'
  - import type { LoaderFunctionArgs } from '@remix-run/node'
  + import { useLoaderData } from 'react-router'
  + import type { Route } from './+types/_index'
  ```
- Типы для loader: `LoaderFunctionArgs` → `Route.LoaderArgs`
- Заголовки разделов: "Remix Route" → "React Router Route"
- Упоминания фреймворка: "Remix Framework" → "React Router v7 Framework"

**Добавлено:**
- Объяснение автоматической генерации типов через `+types/`

---

### Docs (Документация)

#### 3. `docs/DATA_FLOW.md` ✅

**Изменения:**
- Импорты:
  ```diff
  - import { type LoaderFunctionArgs } from '@remix-run/node'
  - import { redirect, type ActionFunctionArgs } from '@remix-run/node'
  - import { useFetcher, useNavigate } from '@remix-run/react'
  + import type { Route } from './+types/_index'
  + import { redirect } from 'react-router'
  + import type { Route } from './+types/resources.new'
  + import { useFetcher, useNavigate } from 'react-router'
  ```

---

#### 4. `docs/QUERY_HANDLERS.md` ✅

**Изменения:**
- Импорты:
  ```diff
  - import { json } from '@remix-run/node';
  + import { json } from 'react-router';
  ```

---

#### 5. `docs/COMMAND_BUS.md` ✅

**Изменения:**
- Импорты:
  ```diff
  - import { useFetcher, useNavigate } from '@remix-run/react';
  + import { useFetcher, useNavigate } from 'react-router';
  ```

---

#### 6. `docs/PROJECT_STRUCTURE.md` ✅

**Изменения:**
- Импорты:
  ```diff
  - import { type LoaderFunctionArgs } from '@remix-run/node'
  - import { useLoaderData } from '@remix-run/react'
  + import type { Route } from './+types/_index'
  + import { useLoaderData } from 'react-router'
  ```

---

#### 7. `docs/COMPOSITION_LAYER.md` ✅

**Изменения:**
- Импорты:
  ```diff
  - import { RemixBrowser } from '@remix-run/react'
  + import { HydratedRouter } from 'react-router/dom'
  ```
- Заголовок раздела: "Web (Remix)" → остался без изменений (контекст понятен)

---

#### 8. `docs/electron/README.md` ✅

**Изменения:**
- Импорты в entry.client.tsx:
  ```diff
  - import { RemixBrowser } from '@remix-run/react'
  + import { HydratedRouter } from 'react-router/dom'
  ```

---

## 📋 Ключевые изменения в API

### Пакеты

| Remix v2 | React Router v7 |
|----------|-----------------|
| `@remix-run/react` | `react-router` |
| `@remix-run/node` | `react-router` (runtime) + `./+types/*` (типы) |
| `@remix-run/dev` | `@react-router/dev` |
| `@remix-run/serve` | `@react-router/serve` |

### Импорты

```diff
# Компоненты и хуки
- from "@remix-run/react"
+ from "react-router"

# Типы loader/action
- import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
+ import type { Route } from "./+types/route-name"
+ // Используем Route.LoaderArgs, Route.ActionArgs

# Утилиты (json, redirect, etc.)
- from "@remix-run/node"
+ from "react-router"
```

### Типизация (Главное улучшение!)

**Было (Remix):**
```typescript
import type { LoaderFunctionArgs } from "@remix-run/node"

export async function loader({ request }: LoaderFunctionArgs) {
  // ...
}

// В компоненте нужно явно указывать тип
export default function Route() {
  const data = useLoaderData<{ resources: Resource[] }>()
}
```

**Стало (React Router v7):**
```typescript
import type { Route } from "./+types/route-name"

export async function loader({ request }: Route.LoaderArgs) {
  // ...
}

// Типы генерируются автоматически!
export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  // loaderData уже типизирован!
}
```

### Vite Plugin

**Было:**
```typescript
import { vitePlugin as remix } from "@remix-run/dev"

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
})
```

**Стало:**
```typescript
import { reactRouter } from "@react-router/dev/vite"

export default defineConfig({
  plugins: [
    reactRouter(),
    // future flags больше не нужны - всё включено по умолчанию
  ],
})
```

---

## 🎨 Что НЕ изменилось

Следующие аспекты **остались идентичными**:

1. ✅ **SSR из коробки** - работает так же
2. ✅ **Server loaders** - та же концепция и API
3. ✅ **Server actions** - без изменений
4. ✅ **File-based routing** - та же структура `app/routes/`
5. ✅ **useLoaderData, useFetcher, useNavigate** - те же хуки
6. ✅ **Form component** - без изменений
7. ✅ **Vite** - тот же сборщик
8. ✅ **TypeScript** - та же интеграция
9. ✅ **Концепция loader/action** - полностью совместимо

**Вывод**: Это переименование пакетов + улучшение типизации, не переписывание!

---

## 💡 Преимущества React Router v7

### 1. Улучшенная типизация

Автоматическая генерация типов через `+types/`:
- ✅ Не нужно вручную типизировать loader/action
- ✅ Автоматический вывод типов в компонентах
- ✅ Type-safe параметры маршрутов

### 2. Упрощенная конфигурация

- ✅ Меньше пакетов (все в `react-router`)
- ✅ Нет future flags (включено по умолчанию)
- ✅ Проще Vite конфигурация

### 3. Единая экосистема

- ✅ React Router - единое имя для всего
- ✅ Лучшая документация
- ✅ Больше примеров в сообществе

---

## 📚 Обновленная документация

### Ссылки

**React Router v7:**
- Главная: https://reactrouter.com/
- Миграция с Remix: https://reactrouter.com/upgrading/remix
- SSR Guide: https://reactrouter.com/start/framework/rendering
- Loaders & Actions: https://reactrouter.com/start/framework/data-loading

**Устаревшее (Remix):**
- ~~https://remix.run/docs~~ - теперь перенаправляет на React Router

---

## ✅ Статус миграции

### Обновлено файлов: **8**

- ✅ `steps/step_0/README.md` - установка и настройка
- ✅ `steps/step_1/README.md` - первый функционал
- ✅ `docs/DATA_FLOW.md` - поток данных
- ✅ `docs/QUERY_HANDLERS.md` - query handlers
- ✅ `docs/COMMAND_BUS.md` - command bus
- ✅ `docs/PROJECT_STRUCTURE.md` - структура проекта
- ✅ `docs/COMPOSITION_LAYER.md` - composition layer
- ✅ `docs/electron/README.md` - Electron интеграция

### Примеров кода обновлено: **15+**

### Строк документации изменено: **~200**

---

## 🔍 Проверка согласованности

### Автоматическая проверка

```bash
# Поиск оставшихся упоминаний @remix-run
grep -r "@remix-run" docs/ steps/ --include="*.md"
# Результат: не найдено ✅

# Поиск LoaderFunctionArgs (старый тип)
grep -r "LoaderFunctionArgs" docs/ steps/ --include="*.md"
# Результат: не найдено ✅

# Поиск ActionFunctionArgs (старый тип)
grep -r "ActionFunctionArgs" docs/ steps/ --include="*.md"
# Результат: не найдено ✅
```

---

## 📋 Checklist для будущих обновлений

При добавлении новых примеров кода убедитесь:

- [ ] Используете `react-router` вместо `@remix-run/*`
- [ ] Типы из `./+types/route-name` вместо `@remix-run/node`
- [ ] `Route.LoaderArgs` вместо `LoaderFunctionArgs`
- [ ] `Route.ActionArgs` вместо `ActionFunctionArgs`
- [ ] `Route.ComponentProps` для типизации компонента
- [ ] `HydratedRouter` вместо `RemixBrowser`
- [ ] `reactRouter()` Vite plugin вместо `remix()`

---

## 🚀 Миграция реального кода (когда начнется реализация)

Когда начнете писать код, используйте codemod от React Router:

```bash
# Автоматическое обновление импортов
npx codemod remix/2/react-router/upgrade

# Или вручную через package.json
npm uninstall @remix-run/react @remix-run/node @remix-run/dev
npm install react-router @react-router/dev
```

**Документация по миграции:**
https://reactrouter.com/upgrading/remix

---

## 🎯 Итог

### Что было сделано:

1. ✅ Обновлены все import statements с `@remix-run/*` на `react-router`
2. ✅ Обновлены типы с `LoaderFunctionArgs` на `Route.LoaderArgs`
3. ✅ Обновлена команда создания проекта
4. ✅ Обновлена конфигурация Vite
5. ✅ Обновлен package.json пример
6. ✅ Добавлены пояснения об изменениях
7. ✅ Обновлены ссылки на документацию

### Архитектура осталась неизменной:

- ✅ DDD + Clean Architecture
- ✅ CQRS (Query/Command Handlers)
- ✅ Facade Pattern
- ✅ Dependency Injection
- ✅ Event-Driven Architecture
- ✅ Value Objects, Aggregates, Repositories
- ✅ Все паттерны работают идентично

### Улучшения от React Router v7:

- ✅ Лучшая типизация (автоматическая через `+types/`)
- ✅ Упрощенная конфигурация
- ✅ Единая экосистема
- ✅ Актуальная документация

---

**Дата миграции**: 2025-01-18  
**Тип изменений**: Documentation Update (Breaking API Changes)  
**Статус**: ✅ **ЗАВЕРШЕНО**  
**Обратная совместимость**: ⚠️ Нет (новые пакеты и импорты)  
**Влияние на архитектуру**: ✅ Нет (только названия пакетов)

---

## 📞 Поддержка

При возникновении вопросов по миграции:
- React Router Discord: https://rmx.as/discord
- GitHub Discussions: https://github.com/remix-run/react-router/discussions
- Документация: https://reactrouter.com/

---

**Следующие шаги**:
1. При создании нового проекта использовать `npx create-react-router@latest`
2. Следовать обновленным инструкциям в `steps/step_0/README.md`
3. Использовать новые импорты и типы из React Router v7
