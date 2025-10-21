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

> **📦 Файл уже создан**: `eslint.config.js` в корне проекта

**Что нужно добавить**: Плагин `boundaries` для проверки архитектурных границ

### Изменения в eslint.config.js

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

---

## 📋 Добавить scripts в package.json

**Root `package.json`:**

#### Package.json Scripts [#config]

```json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix"
  }
}
```

---

## ✅ Проверка работы

### 1. Запустить линтер

#### Run Lint [#command]

```bash
pnpm lint
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

- [ ] `eslint` и плагины установлены
- [ ] `eslint.config.js` создан
- [ ] Scripts добавлены в `package.json`
- [ ] `pnpm lint` работает без ошибок
- [ ] Тест на нарушение правил показывает ошибку
- [ ] IDE подхватывает ESLint конфигурацию

---

**Теперь архитектурные границы защищены автоматически!** 🛡️
