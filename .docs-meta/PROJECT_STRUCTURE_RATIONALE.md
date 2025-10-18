# Обоснование структуры проекта

**Дата создания**: 2025-01-18  
**Тип**: Архитектурное решение

## 🎯 Проблема

Изначально проект имел структуру где DDD слои находились внутри `app/` — директории, специфичной для React Router:

```
app/                      # React Router convention
├── domain/              # ❌ Domain внутри framework!
├── application/
├── infrastructure/
└── routes/              # React Router routing
```

**Противоречия:**
1. Domain оказывался вложенным в UI framework директорию
2. Структура подразумевала что Domain принадлежит React Router
3. Нарушался принцип "Framework — деталь реализации"
4. Vite конфиг лежал в корне хотя нужен только для web presentation

---

## ✅ Решение: Screaming Architecture + Hexagonal

### Новая структура

```
password-manager/
├── package.json          # Общие зависимости (DDD слои)
├── tsconfig.json         # TypeScript для ВСЕГО проекта
│
├── electron/             # Packaging (вне архитектуры)
│
└── src/                  # Application code
    │
    ├── domain/           # ✅ Domain Layer (DDD, center)
    ├── application/      # ✅ Application Layer (DDD)
    ├── infrastructure/   # ✅ Infrastructure Layer (DDD)
    ├── composition/      # ✅ Composition Root (DI)
    ├── shared/           # ✅ Shared utilities
    │
    └── presentation/     # ✅ Presentation Layer (outer)
        └── web/
            └── react/    # ✅ React Router + Vite ЗДЕСЬ
                ├── package.json   # Web-specific deps
                ├── vite.config.ts # Build tool
                └── src/
```

---

## 🎨 Ключевые принципы

### 1. Screaming Architecture (Robert C. Martin)

> "Архитектура должна кричать о своем назначении, а не о фреймворках"

```
✅ Правильно (новая структура):
src/
├── domain/          # "Это Password Manager!"
├── application/
└── presentation/

❌ Неправильно (старая структура):
app/                 # "Это React Router app"
├── domain/
└── routes/
```

### 2. Dependency Rule (Clean Architecture)

Зависимости направлены внутрь, к Domain:

```
Presentation (outer) → Application → Domain (center)
                         ↑
Infrastructure ─────────┘
```

Domain не знает о фреймворках:
- ✅ Domain — чистый TypeScript, zero framework deps
- ✅ Framework изолирован в `presentation/web/react/`

### 3. Framework as Implementation Detail

UI Framework — это **деталь реализации**, не часть бизнес-логики:

```
src/presentation/
├── web/
│   ├── react/       # React Router + Vite
│   └── nextjs/      # Next.js + Turbopack (future)
├── mobile/
│   └── expo/        # Expo + Metro (future)
└── cli/
    └── commander/   # Commander + ESBuild (future)
```

Каждый presentation имеет:
- ✅ Свой build tool config
- ✅ Свои зависимости (package.json)
- ✅ Изоляцию от других presentations
- ✅ Доступ к DDD слоям через алиасы

---

## 📦 Package.json стратегия

### Root package.json (общие зависимости)

```json
{
  "workspaces": [
    "src/presentation/web/react",
    "src/presentation/cli"
  ],
  "dependencies": {
    // ✅ Зависимости для DDD слоев
    "neverthrow": "^6.0.0"  // Application: error handling
  }
}
```

### presentation/web/react/package.json

```json
{
  "name": "@password-manager/web",
  "dependencies": {
    // ✅ ТОЛЬКО web-specific
    "react": "^18.3.0",
    "react-router": "^7.0.0"
  },
  "devDependencies": {
    // ✅ ТОЛЬКО build tools для web
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

**Преимущества:**
- Domain/Application слои не зависят от React
- Web presentation не тащит CLI dependencies
- Легко добавить новый presentation без конфликтов

---

## 🔧 Build tool конфигурация

### Vite в presentation/web/react/

```typescript
// src/presentation/web/react/vite.config.ts
import { reactRouter } from "@react-router/dev/vite"
import path from "path"

const projectRoot = path.resolve(__dirname, '../../../..')

export default defineConfig({
  // ✅ Указываем корень проекта
  root: projectRoot,
  
  plugins: [
    reactRouter({
      // ✅ React Router код относительно root
      appDirectory: "src/presentation/web/react/src",
    }),
  ],
  
  resolve: {
    alias: {
      // ✅ Алиасы для DDD слоев
      '~domain': path.resolve(projectRoot, 'src/domain'),
      '~application': path.resolve(projectRoot, 'src/application'),
      '~infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
      '~composition': path.resolve(projectRoot, 'src/composition'),
    }
  },
})
```

**Vite может работать с файлами выше своей директории!**

---

## 🎯 Архитектурные выгоды

### 1. Testability

```typescript
// tests/domain/Resource.test.ts
import { Resource } from '@/domain/resource/Resource'

// ✅ Тесты Domain без React, без Vite, без UI
describe('Resource', () => {
  it('should validate namespace', () => {
    // Pure unit test
  })
})
```

### 2. Multi-platform

Легко добавить CLI без затрагивания web:

```
src/presentation/
├── web/react/    # React Router (существует)
└── cli/          # Commander.js (новый)
    ├── esbuild.config.js
    └── src/
```

**Оба используют тот же** `src/domain/`, `src/application/`!

### 3. Framework migration

Захотели Next.js вместо React Router?

```
src/presentation/web/
├── react/        # Старый (можно удалить)
└── nextjs/       # Новый
    └── next.config.js
```

DDD слои **не затрагиваются**!

---

## 📊 Сравнение подходов

| Критерий | app/domain/ (старое) | src/domain/ (новое) |
|----------|----------------------|---------------------|
| **Архитектурная чистота** | ❌ Domain внутри framework | ✅ Framework внутри presentation |
| **Что видно первым** | React Router app | Password Manager (DDD) |
| **Добавить CLI** | Сложно (domain в app/) | Легко (новый presentation) |
| **Замена UI** | Переносить domain | Добавить presentation |
| **Test isolation** | Domain знает о app/ | Domain изолирован |
| **Screaming Architecture** | ❌ Кричит о React Router | ✅ Кричит о Password Manager |

---

## 🚀 Миграция (для будущего)

Когда начнете реализацию:

### 1. Создание структуры

```bash
mkdir -p src/{domain,application,infrastructure,composition,shared}
mkdir -p src/presentation/web/react/src/{routes,components,hooks,styles}
```

### 2. Package.json setup

```bash
# Root
pnpm init

# Web presentation
cd src/presentation/web/react
pnpm init
```

### 3. Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'src/presentation/web/react'
  - 'src/presentation/cli'
```

### 4. TypeScript paths

```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~domain/*": ["./src/domain/*"],
      "~application/*": ["./src/application/*"],
      "~infrastructure/*": ["./src/infrastructure/*"],
      "~composition/*": ["./src/composition/*"]
    }
  }
}
```

---

## 📚 Ссылки на концепции

### Clean Architecture
- Robert C. Martin - "Clean Architecture: A Craftsman's Guide to Software Structure"
- Dependency Rule: зависимости внутрь
- Framework Independence: бизнес-логика не знает о фреймворках

### Screaming Architecture
- Robert C. Martin - "Screaming Architecture" (blog post)
- Структура должна показывать назначение, не инструменты

### Hexagonal Architecture (Ports & Adapters)
- Alistair Cockburn
- Domain в центре, adapters снаружи
- UI Framework = adapter (presentation)

### Domain-Driven Design
- Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Domain Layer не зависит ни от чего
- Layered Architecture: UI → Application → Domain ← Infrastructure

---

## ✅ Итог

**Новая структура:**
- ✅ Соответствует Clean Architecture
- ✅ Соответствует Screaming Architecture  
- ✅ Соответствует Hexagonal Architecture
- ✅ Соответствует DDD
- ✅ Framework изолирован
- ✅ Легко добавлять presentations
- ✅ Domain полностью независим
- ✅ Тестируемость максимальна

**Компромиссы:**
- ⚠️ Более сложная структура (но правильная!)
- ⚠️ Нужны workspaces (pnpm/npm)
- ⚠️ Больше package.json файлов

**Вердикт**: Правильная архитектура важнее convenience!

---

**См. также:**
- `docs/PROJECT_STRUCTURE.md` - детальная структура
- `steps/step_0/README.md` - настройка с нуля
- `.docs-meta/REMIX_TO_REACT_ROUTER_V7_MIGRATION.md` - миграция фреймворка
