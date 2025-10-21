# ESLint Setup - Настройка линтера с архитектурными правилами

> **См. также**: [docs/ARCHITECTURE_BOUNDARIES.md](../../docs/ARCHITECTURE_BOUNDARIES.md) - полное описание архитектурных границ

---

## 🎯 Цель

Настроить ESLint с **автоматической проверкой архитектурных границ**:
- ✅ Presentation НЕ может импортировать `@internal/*`
- ✅ Domain полностью изолирован
- ✅ Infrastructure НЕ зависит от Application
- ✅ Каждый слой импортирует ТОЛЬКО то, что разрешено

---

## 📦 Установка

> **⚠️ ВАЖНО**: Устанавливать в **root проекта**, НЕ в web presentation!

#### Install ESLint [#command]

```bash
# В корне проекта (password-manager/)
pnpm add -D eslint eslint-plugin-boundaries @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Что устанавливаем:**
- `eslint` - сам линтер
- `eslint-plugin-boundaries` - проверка архитектурных границ
- `@typescript-eslint/*` - поддержка TypeScript

**Зависимости автоматически добавятся** в root `package.json`

---

## ⚙️ Конфигурация ESLint

**Нужно два независимых конфига:**
1. **Root eslint.config.js** - для DDD слоев (только `.ts`, без React)
2. **Web eslint.config.js** - для React Router (`.ts` + `.tsx`, с React правилами)

---

### 1️⃣ Root ESLint (для DDD слоев)

> **📦 Файл уже создан**: `eslint.config.js` в корне проекта

**Что нужно добавить**: Плагин `boundaries` для проверки архитектурных границ

#### Изменения в eslint.config.js

**Файл: `eslint.config.js`** (в корне проекта)

#### eslint.config.js - только изменения [#config|#structure:path]

```javascript
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'  // ← ДОБАВИТЬ

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    
    // ✏️ ДОБАВИТЬ плагин boundaries
    plugins: {
      boundaries,
    },
    
    // ✏️ ДОБАВИТЬ настройки boundaries
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**/*' },
        { type: 'application', pattern: 'src/application/**/*' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**/*' },
        { type: 'composition', pattern: 'src/composition/**/*' },
        { type: 'presentation', pattern: 'src/presentation/**/*' },
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/*.spec.ts'],
    },
    
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // ✏️ ДОБАВИТЬ правила архитектурных границ
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          // Domain - полностью изолирован
          {
            from: 'domain',
            allow: ['domain'],  // Только внутри себя
          },
          
          // Application - только Domain
          {
            from: 'application',
            allow: ['domain'],
          },
          
          // Infrastructure - только Domain
          {
            from: 'infrastructure',
            allow: ['domain'],
          },
          
          // Composition - доступ ко всем (единственное исключение)
          {
            from: 'composition',
            allow: ['domain', 'application', 'infrastructure', 'composition'],
          },
          
          // Presentation - только Domain (типы) и Composition (facades)
          {
            from: 'presentation',
            allow: ['domain', 'composition', 'presentation'],
          },
        ],
      }],
      
      // ✏️ ДОБАВИТЬ запрет @internal/* в Presentation
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@internal/*'],
            message: 'Presentation cannot use @internal/* aliases. Use @domain or @api instead.',
          },
        ],
      }],
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/.cache/**',
      'eslint.config.js',
    ],
  }
)
```

**Что добавляется:**

1. **Импорт** `boundaries` плагина
2. **Секция `plugins`** с boundaries
3. **Секция `settings`** с определением слоев
4. **Правило `boundaries/element-types`** - проверка архитектурных границ
5. **Правило `no-restricted-imports`** - запрет `@internal/*` в Presentation

**Зачем Root ESLint:**
- ✅ Проверяет только DDD слои (domain, application, infrastructure, composition)
- ✅ Только `.ts` файлы (без React/JSX)
- ✅ Архитектурные границы между слоями
- ✅ Не знает про React Router

---

### 2️⃣ Web ESLint (для React Router)

> **📦 Файл уже создан**: React Router CLI создал конфиг в `src/presentation/web/react/`

**Проверка:** React Router обычно создает свой ESLint конфиг автоматически.

Если файла нет, создать `src/presentation/web/react/eslint.config.js`:

#### Web eslint.config.js [#config|#structure:path]

```javascript
// src/presentation/web/react/eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React правила
      'react/react-in-jsx-scope': 'off',  // React 17+
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/.react-router/**',
      'vite.config.ts',
      'react-router.config.ts',
    ],
  }
)
```

**Зачем Web ESLint:**
- ✅ Проверяет React компоненты и routes
- ✅ `.ts` и `.tsx` файлы
- ✅ React hooks правила
- ✅ JSX специфика
- ✅ Не проверяет DDD слои (это делает Root ESLint)

---

## 📋 Добавить scripts в package.json

**Root `package.json`:**

#### Package.json Scripts [#config]

```json
{
  "scripts": {
    "lint": "eslint src --ignore-pattern 'src/presentation'",
    "lint:web": "pnpm --filter @password-manager/web lint",
    "lint:fix": "eslint src --ignore-pattern 'src/presentation' --fix"
  }
}
```

**Что делают команды:**
- `lint` - проверяет DDD слои (исключая presentation)
- `lint:web` - проверяет Web presentation (через workspace)
- `lint:fix` - автофикс для DDD слоев

**Web `package.json`** (если нет):

Добавить в `src/presentation/web/react/package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

---

## ✅ Проверка работы

### 1. Запустить линтеры

#### Run Lint [#command]

```bash
# Проверить DDD слои (когда будут файлы после Step 1)
pnpm lint

# Проверить Web presentation
pnpm lint:web
```

### 2. Тест: попробовать нарушить правила

Создай тестовый файл:

#### Test Boundaries [#code|#structure:path]

```typescript
// src/presentation/web/react/src/test-boundaries.ts

// ❌ Это должно вызвать ошибку ESLint!
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'

// ✅ Это должно работать
import { Resource } from '@domain'
import { queries } from '@api'
```

Запусти `pnpm lint` - должна быть ошибка для `@internal/*` импорта!

---

## 🎯 Правила по слоям

| Слой | Может импортировать | Алиасы | ESLint проверит |
|------|---------------------|--------|-----------------|
| **Domain** | НИЧЕГО | `@domain/*` | ✅ Только внутри себя |
| **Application** | Domain | `@domain` | ✅ Только Public API |
| **Infrastructure** | Domain | `@domain` | ✅ Только интерфейсы |
| **Composition** ⭐ | Domain, Application, Infrastructure | `@domain`, `@internal/*` | ✅ Единственный кто может `@internal/*` |
| **Presentation** | Domain, Composition | `@domain`, `@api`, `@client/*` | ✅ НЕ может `@internal/*` |

---

## 🛠️ Настройка IDE

### VS Code

Добавь в `.vscode/settings.json`:

#### VSCode Settings [#config]

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 📚 Связанные документы

- [docs/ARCHITECTURE_BOUNDARIES.md](../../docs/ARCHITECTURE_BOUNDARIES.md) - Полное описание правил импортов
- [docs/PROJECT_STRUCTURE.md](../../docs/PROJECT_STRUCTURE.md) - Структура проекта
- [TYPESCRIPT_VITE_CONFIG.md](./TYPESCRIPT_VITE_CONFIG.md) - Настройка алиасов

---

## ✅ Чеклист

### Root ESLint (для DDD слоев):
- [ ] `eslint` и `eslint-plugin-boundaries` установлены
- [ ] `eslint.config.js` обновлен (добавлен boundaries плагин)
- [ ] Scripts добавлены в root `package.json`
- [ ] `pnpm lint` работает (когда будут файлы в DDD слоях)

### Web ESLint (для React Router):
- [ ] ✅ `eslint.config.js` уже создан React Router CLI (или создан вручную)
- [ ] Scripts добавлены в web `package.json`
- [ ] `pnpm lint:web` работает без ошибок
- [ ] Тест на нарушение правил показывает ошибку

### Общее:
- [ ] IDE подхватывает ESLint конфигурацию
- [ ] Два независимых конфига работают корректно

---

**Теперь архитектурные границы защищены автоматически!** 🛡️
