# Package.json Setup - Композиция шагов настройки

Высокоуровневое описание последовательности настройки package.json для проекта с DDD структурой и pnpm workspaces.

---

## 📦 Стратегия управления зависимостями

### Разделение по уровням архитектуры

**Root package.json** (обязательно)
- **Что**: Общие зависимости для DDD слоев (domain, application, infrastructure)
- **Почему**: DDD слои должны быть независимы от UI framework
- **Зависимости**: neverthrow, typescript, testing tools

**presentation/web/react/package.json** (обязательно)
- **Что**: Зависимости только для web UI
- **Почему**: Framework as Implementation Detail (Clean Architecture)
- **Зависимости**: React Router, Vite, Tailwind, UI-specific libraries

**Мотивация**: Легко добавить CLI, Mobile, Desktop без влияния на Domain/Application слои.

---

## 🎯 Последовательность настройки

### 1. Root package.json (обязательно)

**Файл**: `package.json` в корне проекта

**Что настроить**:
- ✅ `name`, `version`, `private: true`, `type: "module"`
- ✅ Scripts для запуска workspaces (`dev:web`, `build:web`)
- ✅ Общие зависимости (neverthrow, typescript)
- ✅ Dev tools (eslint, prettier, vitest)
- ✅ Engines (node, pnpm версии)

**Детальная инструкция**: См. раздел "Root package.json" ниже

**Критично**: НЕ добавлять поле `workspaces` — используем `pnpm-workspace.yaml`!

---

### 2. pnpm Workspaces (обязательно)

**Файл**: `pnpm-workspace.yaml` в корне проекта

**Что настроить**:
- ✅ Путь к web presentation: `src/presentation/web/react`
- ⚠️ Опционально: пути для будущих presentations (CLI, Mobile)

**Детальная инструкция**: См. раздел "pnpm Workspaces" ниже

**Мотивация**: 
- Shared зависимости hoisted в root (экономия места)
- Изолированные зависимости для каждого presentation
- Команды для конкретных workspaces: `pnpm --filter`

---

### 3. Web Presentation package.json (обязательно)

**Файл**: `src/presentation/web/react/package.json`

**Метод**: Использовать React Router CLI (автоматически создает актуальные версии)

**Последовательность**:
1. ✅ Создать проект через CLI во временной папке
2. ✅ Скопировать сгенерированные файлы в `react/`
3. ✅ Изменить `name` на `@password-manager/web`
4. ✅ Добавить Catppuccin для Tailwind
5. ✅ Адаптировать конфиги под DDD структуру
6. ✅ Удалить временную папку

**Детальная инструкция**: См. раздел "Web Presentation" ниже

**Критично**: Не копировать версии пакетов вручную — CLI всегда создает актуальные!

---

### 4. TypeScript paths и Vite алиасы (обязательно)

**Файлы**: 
- Root `tsconfig.json`
- `src/presentation/web/react/tsconfig.json`
- `src/presentation/web/react/vite.config.ts`

**Что настроить**:
- ✅ Алиасы: `@domain`, `@api`, `@client/*`, `@internal/*`
- ✅ Paths в TypeScript
- ✅ Resolve в Vite

**Детальная инструкция**: [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md)

**Мотивация**: Clean imports без относительных путей (`../../../`)

---

### 5. Tailwind конфигурация (обязательно)

**Файл**: `src/presentation/web/react/tailwind.config.js`

**Что настроить**:
- ✅ Catppuccin Mocha theme
- ✅ Content paths для React Router
- ✅ Плагины (@catppuccin/tailwindcss)

**Детальная инструкция**: [TAILWIND_SETUP.md](./TAILWIND_SETUP.md)

**Мотивация**: Консистентный дизайн системы, тёмная тема из коробки

---

### 6. ESLint конфигурация (обязательно)

**Файл**: `eslint.config.js` в корне проекта

**Что настроить**:
- ✅ Flat Config (новый формат ESLint 9)
- ✅ TypeScript правила
- ✅ Ignore patterns
- ✅ Архитектурные границы (опционально, см. ESLINT_SETUP.md)

**Детальная инструкция**: [ESLINT_SETUP.md](./ESLINT_SETUP.md)

**Мотивация**: Enforce архитектурных правил на уровне линтера

---

### 7. Финальная установка (обязательно)

**Команда**: `pnpm install` из корня проекта

**Что происходит**:
- ✅ Устанавливаются root зависимости
- ✅ Устанавливаются зависимости всех workspaces
- ✅ Hoisting общих зависимостей в root node_modules

**Проверка**: `pnpm list --depth=0` должен показать workspaces

---

## 📋 Детальные инструкции

### Root package.json

Создать файл вручную или через `pnpm init`, затем настроить:

**Обязательные поля**:
- `name`, `version`, `private: true`, `type: "module"`
- `scripts`: команды для workspaces
- `engines`: версии node и pnpm

**Обязательные зависимости**:
- `neverthrow` - error handling для Application Layer
- `typescript` - компилятор
- `@types/node` - типы Node.js

**Обязательные devDependencies**:
- `eslint`, `@eslint/js`, `typescript-eslint` - линтинг
- `prettier` - форматирование
- `vitest` - тестирование

**Опциональные**:
- `axios` - HTTP client (если нужно в Infrastructure Layer)

---

### pnpm Workspaces

Создать `pnpm-workspace.yaml` в корне:

**Обязательно**:
```yaml
packages:
  - 'src/presentation/web/react'
```

**Опционально** (для будущего):
```yaml
  # - 'src/presentation/cli'
  # - 'src/presentation/mobile/expo'
```

---

### Web Presentation

**Метод**: React Router CLI (рекомендуется)

**Шаги**:
1. Из `src/presentation/web/` запустить: `pnpm dlx create-react-router@latest temp`
2. Выбрать: Template=Basic, TypeScript=Yes, Package manager=pnpm
3. Скопировать файлы:
   - `temp/package.json` → `react/package.json`
   - `temp/tsconfig.json` → `react/tsconfig.json`
   - `temp/vite.config.ts` → `react/vite.config.ts`
   - `temp/react-router.config.ts` → `react/react-router.config.ts`
4. Изменить `"name"` на `"@password-manager/web"` в `react/package.json`
5. Установить Catppuccin: `cd react && pnpm add -D @catppuccin/tailwindcss`
6. Настроить TypeScript paths и Vite алиасы (см. TYPESCRIPT_VITE_CONFIG.md)
7. Удалить временную папку: `rm -rf temp`

**Почему CLI**:
- ✅ Всегда актуальные версии пакетов
- ✅ Готовые конфиги без ошибок
- ✅ Не нужно копировать устаревшие примеры

---

### Правило разделения зависимостей

**Root package.json** (если используется в domain/application/infrastructure):
```bash
pnpm add <package>              # dependency
pnpm add -D <package>           # devDependency
```

**presentation/web/react/package.json** (если используется только в UI):
```bash
cd src/presentation/web/react
pnpm add <package>              # dependency
pnpm add -D <package>           # devDependency
```

**Примеры**:
- `neverthrow` → root (используется в Application Layer)
- `react` → web presentation (только UI)
- `typescript` → root (используется везде)
- `vite` → web presentation (только для web build)

---

## ✅ Чеклист настройки

**Обязательные шаги**:
- [ ] Создан `package.json` в корне (без поля `workspaces`!)
- [ ] Создан `pnpm-workspace.yaml`
- [ ] Создан `src/presentation/web/react/package.json` через CLI
- [ ] Настроены TypeScript paths и Vite алиасы (см. TYPESCRIPT_VITE_CONFIG.md)
- [ ] Настроен Tailwind с Catppuccin (см. TAILWIND_SETUP.md)
- [ ] Создан `eslint.config.js` (см. ESLINT_SETUP.md)
- [ ] Установлены зависимости: `pnpm install`

**Проверка**:
- [ ] `pnpm list --depth=0` показывает `@password-manager/web` workspace
- [ ] `pnpm dev:web` запускает dev сервер
- [ ] `pnpm lint` проверяет код без ошибок
- [ ] Импорты с алиасами работают (`@domain`, `@api`, etc.)

---

## 📚 Связанные документы

**Обязательные для прочтения**:
1. [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md) - настройка алиасов и paths
2. [TAILWIND_SETUP.md](./TAILWIND_SETUP.md) - настройка Tailwind с Catppuccin
3. [ESLINT_SETUP.md](./ESLINT_SETUP.md) - настройка ESLint и архитектурных границ

**Контекст**:
- `../docs/PROJECT_STRUCTURE.md` - полная структура проекта
- `../docs/ARCHITECTURE_BOUNDARIES.md` - правила импортов между слоями
- `.docs-meta/PROJECT_STRUCTURE_RATIONALE.md` - обоснование структуры
