# Package.json Setup - Настройка package.json и workspaces

Инструкция по настройке package.json и pnpm workspaces для проекта с DDD структурой.

---

## 📦 Стратегия управления зависимостями

### Разделение по уровням архитектуры

**Root package.json**
- **Что**: Общие зависимости для DDD слоев (domain, application, infrastructure)
- **Почему**: DDD слои должны быть независимы от UI framework
- **Зависимости**: neverthrow, typescript, testing tools

**presentation/web/react/package.json**
- **Что**: Зависимости только для web UI
- **Почему**: Framework as Implementation Detail (Clean Architecture)
- **Зависимости**: React Router, Vite, Tailwind, UI-specific libraries

**Мотивация**: Легко добавить CLI, Mobile, Desktop без влияния на Domain/Application слои.

---

## 🎯 Последовательность настройки

### 1. Root package.json

**Файл**: `package.json` в корне проекта

**Что настроить**:
- `name`, `version`, `private: true`, `type: "module"`
- Scripts для запуска workspaces (`dev:web`, `build:web`)
- Общие зависимости (neverthrow, typescript)
- Dev tools (eslint, prettier, vitest)
- Engines (node, pnpm версии)

**Критично**: НЕ добавлять поле `workspaces` — используем `pnpm-workspace.yaml`!

**Детали**: См. раздел "Детальные инструкции → Root package.json" ниже

---

### 2. pnpm Workspaces

**Файл**: `pnpm-workspace.yaml` в корне проекта

**Что настроить**:
- Путь к web presentation: `src/presentation/web/react`
- Опционально: пути для будущих presentations (CLI, Mobile)

**Мотивация**: 
- Shared зависимости hoisted в root (экономия места)
- Изолированные зависимости для каждого presentation
- Команды для конкретных workspaces: `pnpm --filter`

**Детали**: См. раздел "Детальные инструкции → pnpm Workspaces" ниже

---

### 3. Web Presentation package.json

**Файл**: `src/presentation/web/react/package.json`

**Метод**: Использовать React Router CLI (автоматически создает актуальные версии)

**Последовательность**:
1. Создать проект через CLI во временной папке
2. Скопировать сгенерированные файлы в `react/`
3. Изменить `name` на `@password-manager/web`
4. Добавить Catppuccin для Tailwind
5. Удалить временную папку

**Критично**: Не копировать версии пакетов вручную — CLI всегда создает актуальные!

**Детали**: См. раздел "Детальные инструкции → Web Presentation" ниже

---

### 4. Финальная установка

**Команда**: `pnpm install` из корня проекта

**Что происходит**:
- Устанавливаются root зависимости
- Устанавливаются зависимости всех workspaces
- Hoisting общих зависимостей в root node_modules

**Проверка**: `pnpm list --depth=0` должен показать workspaces

---

## 📋 Детальные инструкции

### Root package.json

**Файл:** `package.json` (в корне проекта)

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
3. Скопировать `package.json`:
   - `temp/package.json` → `react/package.json`
4. Изменить `"name"` на `"@password-manager/web"` в `react/package.json`
5. Удалить временную папку: `rm -rf temp`

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

- [ ] Создан `package.json` в корне (без поля `workspaces`!)
- [ ] Создан `pnpm-workspace.yaml`
- [ ] Создан `src/presentation/web/react/package.json` через CLI
- [ ] Установлены зависимости: `pnpm install`
- [ ] `pnpm list --depth=0` показывает `@password-manager/web` workspace

---

## 📚 Контекст

- `../../docs/PROJECT_STRUCTURE.md` - полная структура проекта
- `.docs-meta/PROJECT_STRUCTURE_RATIONALE.md` - обоснование структуры
