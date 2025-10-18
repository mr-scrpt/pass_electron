# Package.json Setup - Настройка зависимостей

Детальная инструкция по настройке package.json для проекта с DDD структурой и workspaces.

## 📦 Стратегия управления зависимостями

### Root package.json
- Общие зависимости для **DDD слоев** (domain, application, infrastructure)
- pnpm workspaces конфигурация
- Scripts для запуска всего проекта

### presentation/web/react/package.json
- **Только** зависимости для web UI
- React Router, Vite, Tailwind
- Scripts для dev/build web presentation

---

## 1️⃣ Корневой package.json

**Файл: `package.json`** (в корне проекта)

```json
{
  "name": "password-manager",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  
  "workspaces": [
    "src/presentation/web/react"
  ],
  
  "scripts": {
    "dev:web": "pnpm --filter @password-manager/web dev",
    "build:web": "pnpm --filter @password-manager/web build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  
  "dependencies": {
    "neverthrow": "^6.2.0"
  },
  
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "prettier": "^3.1.1",
    "vitest": "^1.0.4"
  },
  
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**Команды установки:**

```bash
cd password-manager
pnpm init
# Скопировать содержимое выше в package.json
pnpm install
```

---

## 2️⃣ Web Presentation package.json

**Файл: `src/presentation/web/react/package.json`**

```json
{
  "name": "@password-manager/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router": "^7.0.0"
  },
  
  "devDependencies": {
    "@react-router/dev": "^7.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@catppuccin/tailwindcss": "^1.0.0"
  }
}
```

**Команды установки:**

```bash
cd src/presentation/web/react
pnpm init
# Скопировать содержимое выше в package.json
pnpm install
```

---

## 3️⃣ pnpm Workspaces

**Файл: `pnpm-workspace.yaml`** (в корне проекта)

```yaml
packages:
  - 'src/presentation/web/react'
  # Future presentations:
  # - 'src/presentation/cli'
  # - 'src/presentation/mobile/expo'
```

**Зачем workspaces?**
- ✅ Shared зависимости hoisted в корень (neverthrow, typescript)
- ✅ Каждый presentation имеет свои зависимости
- ✅ Команды для конкретных workspaces: `pnpm --filter`

---

## 4️⃣ Установка зависимостей

### Из корня проекта:

```bash
# Установить ВСЕ зависимости (root + workspaces)
pnpm install

# Установить в root workspace (DDD слои)
pnpm add neverthrow

# Установить в web presentation
pnpm --filter @password-manager/web add react react-dom

# Установить dev зависимость в web
pnpm --filter @password-manager/web add -D vite
```

### Запуск:

```bash
# Из корня проекта
pnpm dev:web

# Или напрямую
cd src/presentation/web/react
pnpm dev
```

---

## 5️⃣ Какие пакеты куда устанавливать?

### Root package.json (для DDD слоев)

```bash
# Application Layer - error handling
pnpm add neverthrow

# Infrastructure Layer - HTTP client (если нужно)
pnpm add axios

# Dev tools для ВСЕГО проекта
pnpm add -D typescript @types/node vitest
```

**Правило**: Если зависимость используется в `src/domain/`, `src/application/`, или `src/infrastructure/` — устанавливайте в root.

### presentation/web/react/package.json (для UI)

```bash
cd src/presentation/web/react

# React ecosystem
pnpm add react react-dom react-router

# Build tools
pnpm add -D vite @react-router/dev

# Styling
pnpm add -D tailwindcss postcss autoprefixer
```

**Правило**: Если зависимость используется только в `src/presentation/web/react/src/` — устанавливайте там.

---

## 6️⃣ Проверка установки

```bash
# Проверить что workspaces настроены
pnpm list --depth=0

# Должно показать:
# password-manager (root)
#   @password-manager/web -> src/presentation/web/react

# Проверить зависимости root
pnpm list --depth=0
# neverthrow, typescript, etc.

# Проверить зависимости web
pnpm --filter @password-manager/web list --depth=0
# react, react-router, vite, etc.
```

---

## 📊 Итоговая структура node_modules

```
password-manager/
├── node_modules/                 # ← Root dependencies (shared)
│   ├── neverthrow/               # ← Application Layer использует
│   ├── typescript/               # ← Все используют
│   └── @types/node/              # ← Все используют
│
└── src/presentation/web/react/
    └── node_modules/             # ← Web-specific
        ├── react/                # ← ТОЛЬКО для web
        ├── react-router/         # ← ТОЛЬКО для web
        └── vite/                 # ← ТОЛЬКО для web
```

**pnpm делает hoisting** - общие пакеты поднимаются в root node_modules.

---

## ✅ Чеклист

- [ ] Создан `package.json` в корне с workspaces
- [ ] Создан `pnpm-workspace.yaml`
- [ ] Создан `src/presentation/web/react/package.json`
- [ ] Установлены зависимости: `pnpm install`
- [ ] Проверка: `pnpm list --depth=0` показывает workspaces
- [ ] Команда `pnpm dev:web` работает (после настройки vite.config)

---

**Следующий шаг**: [TypeScript и Vite конфигурация](./TYPESCRIPT_VITE_CONFIG.md)
