# Package.json Setup `#package-json` `#setup` `#dependencies` - Настройка package.json и workspaces

Инструкция по настройке package.json и pnpm workspaces для проекта с DDD структурой.

---

## 📦 Стратегия

**Root package.json** - зависимости для DDD слоев (domain, application, infrastructure)  
**Web package.json** - зависимости только для UI (react, vite, tailwind)  
**Мотивация**: Легко добавить CLI/Mobile без влияния на Domain

---

## 1️⃣ Root package.json

**Файл**: `package.json` в корне проекта

Создать файл вручную или через `pnpm init`, затем настроить:

```json
{
  "name": "password-manager",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  
  "scripts": {
    "dev:web": "pnpm --filter @password-manager/web dev",
    "build:web": "pnpm --filter @password-manager/web build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix"
  },
  
  "dependencies": {
    "neverthrow": "^8.1.2"
  },
  
  "devDependencies": {
    "@types/node": "^22.10.5",
    "typescript": "^5.7.2",
    "eslint": "^9.18.0",
    "@eslint/js": "^9.18.0",
    "typescript-eslint": "^8.20.0",
    "prettier": "^3.4.2",
    "vitest": "^2.1.8"
  },
  
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

**Что настраиваем:**
- `scripts` - команды для запуска workspaces через `pnpm --filter`
- `dependencies` - neverthrow для error handling (Application Layer)
- `devDependencies` - TypeScript, ESLint, Prettier, Vitest
- `engines` - требования к версиям Node.js и pnpm

---

## 2️⃣ pnpm Workspaces

**Файл**: `pnpm-workspace.yaml` в корне проекта

Создать файл:

```yaml
packages:
  - 'src/presentation/web/react'
  # Для будущего:
  # - 'src/presentation/cli'
  # - 'src/presentation/mobile/expo'
```

**Зачем**:
- Shared зависимости hoisted в root (экономия места)
- Изолированные зависимости для каждого presentation
- Команды для конкретных workspaces: `pnpm --filter @password-manager/web dev`

**⚠️ Критично**: В root `package.json` НЕ добавлять поле `workspaces` — используем `pnpm-workspace.yaml`!

---

## 3️⃣ Web Presentation через CLI

**Файлы**: 
- `src/presentation/web/react/package.json`
- `src/presentation/web/react/tsconfig.json`
- `src/presentation/web/react/vite.config.ts`
- `src/presentation/web/react/react-router.config.ts`

**Метод**: Использовать React Router CLI (автоматически создает актуальные версии)

**Шаги**:
1. Из `src/presentation/web/` запустить: `pnpm dlx create-react-router@latest temp`
2. Выбрать: Template=Basic, TypeScript=Yes, Package manager=pnpm
3. Скопировать конфиги:
   ```bash
   cp temp/package.json react/package.json
   cp temp/tsconfig.json react/tsconfig.json
   cp temp/vite.config.ts react/vite.config.ts
   cp temp/react-router.config.ts react/react-router.config.ts
   ```
4. Изменить `"name"` на `"@password-manager/web"` в `react/package.json`
5. Удалить временную папку: `rm -rf temp`

**⚠️ Важно**: Конфиги из CLI нужно будет адаптировать под DDD структуру (см. шаги 3-4 в главном README)

**Почему CLI**:
- ✅ Всегда актуальные версии пакетов
- ✅ Готовые конфиги без ошибок
- ✅ Не нужно копировать устаревшие примеры

---

## 4️⃣ Финальная установка

```bash
# Из корня проекта
pnpm install
```

**Что происходит**:
- Устанавливаются root зависимости
- Устанавливаются зависимости всех workspaces
- Hoisting общих зависимостей в root node_modules

**Проверка**:
```bash
pnpm list --depth=0
# Должно показать:
# password-manager@1.0.0
#   @password-manager/web -> src/presentation/web/react
```

---

## 📋 Правило разделения зависимостей

### Root package.json (для domain/application/infrastructure)

```bash
# Из корня проекта
pnpm add <package>              # dependency
pnpm add -D <package>           # devDependency
```

### Web package.json (только для UI)

**Способ 1: Через --filter (удобнее)**
```bash
# Из корня проекта
pnpm add <package> --filter @password-manager/web
pnpm add -D <package> --filter @password-manager/web
```

**Способ 2: Перейти в workspace**
```bash
cd src/presentation/web/react
pnpm add <package>
pnpm add -D <package>
```

### Примеры

**Root:**
- `neverthrow` - используется в Application Layer
- `typescript` - используется везде

**Web workspace:**
- `react`, `react-router` - только UI
- `vite`, `tailwindcss` - только для web build

**Команды:**
```bash
# Root
pnpm add neverthrow
pnpm add -D typescript vitest

# Web (из корня через --filter)
pnpm add react react-dom --filter @password-manager/web
pnpm add -D vite @tailwindcss/vite --filter @password-manager/web
```

---

## ✅ Чеклист настройки

- [ ] Создан `package.json` в корне (без поля `workspaces`!)
- [ ] Создан `pnpm-workspace.yaml`
- [ ] Создан `src/presentation/web/react/package.json` через CLI
- [ ] Установлены зависимости: `pnpm install`
- [ ] `pnpm list --depth=0` показывает `@password-manager/web` workspace

---

## 📚 Контекст

- `../../docs/PROJECT_STRUCTURE.md` - полная структура проекта
- `.docs-meta/PROJECT_STRUCTURE_RATIONALE.md` - обоснование структуры
