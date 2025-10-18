# ✅ Обновление пакетов до актуальных версий (2025)

**Дата**: 2025-01-18  
**Причина**: Устаревшие версии пакетов (ESLint 8, старые React/TypeScript)

---

## 🔴 Проблема

При запуске `pnpm install` появились предупреждения:

```
WARN  The "workspaces" field in package.json is not supported by pnpm. 
      Create a "pnpm-workspace.yaml" file instead.
      
WARN  deprecated eslint@8.57.1: This version is no longer supported.
```

**Что было устарело:**
- `eslint@8.55.0` → устарел, нужен v9
- `@typescript-eslint/eslint-plugin@6.15.0` → старый формат
- `@typescript-eslint/parser@6.15.0` → старый формат
- `neverthrow@6.2.0` → устарела
- `typescript@5.3.3` → не последняя
- `@types/node@20.10.0` → старая
- `react@18.2.0` → вышла v19
- `vite@5.0.0` → вышла v6
- Поле `workspaces` в package.json вместо `pnpm-workspace.yaml`

---

## ✅ Что обновлено

### 1. Root package.json

**Было:**
```json
{
  "workspaces": ["src/presentation/web/react"],
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
  }
}
```

**Стало:**
```json
{
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

**Изменения:**
- ✅ Убрано поле `workspaces` (для pnpm нужен отдельный файл)
- ✅ `eslint@9.18.0` вместо `@8.55.0`
- ✅ `typescript-eslint@8.20.0` вместо двух старых пакетов
- ✅ `@eslint/js@9.18.0` добавлен (нужен для ESLint 9)
- ✅ `neverthrow@8.1.2` вместо `@6.2.0`
- ✅ `typescript@5.7.2` вместо `@5.3.3`
- ✅ `@types/node@22.10.5` вместо `@20.10.0`
- ✅ `vitest@2.1.8` вместо `@1.0.4`
- ✅ `prettier@3.4.2` вместо `@3.1.1`
- ✅ `pnpm: ">=9.0.0"` вместо `>=8.0.0`

### 2. Создан pnpm-workspace.yaml

**Файл: `pnpm-workspace.yaml`**
```yaml
packages:
  - 'src/presentation/web/react'
```

Теперь workspaces настроены правильно для pnpm.

### 3. Web presentation package.json

**Обновлено в документации `PACKAGE_JSON_SETUP.md`:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.5.0"
  },
  "devDependencies": {
    "@react-router/dev": "^7.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vite": "^6.0.7",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "@catppuccin/tailwindcss": "^1.0.3"
  }
}
```

**Изменения:**
- ✅ `react@19.0.0` вместо `@18.2.0`
- ✅ `react-dom@19.0.0` вместо `@18.2.0`
- ✅ `react-router@7.5.0` вместо `@7.0.0`
- ✅ `@react-router/dev@7.5.0` вместо `@7.0.0`
- ✅ `@types/react@19.0.0` вместо `@18.2.0`
- ✅ `@types/react-dom@19.0.0` вместо `@18.2.0`
- ✅ `vite@6.0.7` вместо `@5.0.0`
- ✅ `tailwindcss@3.4.17` вместо `@3.4.0`
- ✅ `postcss@8.4.49` вместо `@8.4.0`
- ✅ `autoprefixer@10.4.20` вместо `@10.4.0`
- ✅ `@catppuccin/tailwindcss@1.0.3` вместо `@1.0.0`

### 4. ESLint 9 Flat Config

**Создан файл: `eslint.config.js`**

```javascript
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

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
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
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

**Ключевые изменения:**
- ✅ Flat Config формат (не `.eslintrc.cjs`)
- ✅ `typescript-eslint` вместо двух пакетов
- ✅ `projectService: true` — автоопределение tsconfig
- ✅ Native `ignores` вместо `.eslintignore`

### 5. Обновлена документация

**Файл: `steps/step_0/PACKAGE_JSON_SETUP.md`**

Добавлена секция "7️⃣ ESLint 9 конфигурация (Flat Config)" с:
- ✅ Полным примером `eslint.config.js`
- ✅ Объяснением ключевых изменений
- ✅ Предупреждением что `.eslintrc.*` устарел

---

## 📊 Таблица обновлений

| Пакет | Было | Стало | Изменение |
|-------|------|-------|-----------|
| neverthrow | 6.2.0 | 8.1.2 | Major ⬆️ |
| typescript | 5.3.3 | 5.7.2 | Minor ⬆️ |
| @types/node | 20.10.0 | 22.10.5 | Major ⬆️ |
| eslint | 8.55.0 | 9.18.0 | Major ⬆️ |
| typescript-eslint | — | 8.20.0 | Новый ✨ |
| @eslint/js | — | 9.18.0 | Новый ✨ |
| vitest | 1.0.4 | 2.1.8 | Major ⬆️ |
| prettier | 3.1.1 | 3.4.2 | Minor ⬆️ |
| react | 18.2.0 | 19.0.0 | Major ⬆️ |
| react-dom | 18.2.0 | 19.0.0 | Major ⬆️ |
| react-router | 7.0.0 | 7.5.0 | Minor ⬆️ |
| vite | 5.0.0 | 6.0.7 | Major ⬆️ |
| tailwindcss | 3.4.0 | 3.4.17 | Patch ⬆️ |

**Всего обновлено**: 13 пакетов  
**Major updates**: 7  
**Minor updates**: 3  
**Patch updates**: 1  
**Новые пакеты**: 2

---

## ⚠️ Breaking Changes

### ESLint 9

**Старый формат (`.eslintrc.cjs`) больше не работает!**

❌ **Удалить если есть:**
- `.eslintrc.cjs`
- `.eslintrc.js`
- `.eslintrc.json`
- `.eslintignore`

✅ **Создать:**
- `eslint.config.js` (Flat Config)

**Пакеты:**
- ❌ `@typescript-eslint/eslint-plugin`
- ❌ `@typescript-eslint/parser`
- ✅ `typescript-eslint` (заменяет оба)
- ✅ `@eslint/js` (базовые правила)

### React 19

**Изменения в типах:**
- `@types/react@19` может требовать обновления кода
- Некоторые deprecated API удалены

### Vite 6

**Требует Node.js >= 18.0.0**

---

## ✅ Проверка

```bash
# Удалить старые node_modules и lockfile
rm -rf node_modules pnpm-lock.yaml
rm -rf src/presentation/web/react/node_modules

# Установить заново
pnpm install

# Проверить что нет предупреждений про workspaces
# Проверить что нет deprecated warnings
```

**Результат:**
```
✓ Все пакеты установлены
✓ Нет предупреждений про workspaces
✓ Нет deprecated warnings
✓ ESLint 9 работает
```

---

## 📝 Дополнительно

### Старые пакеты удалены из документации

- ✅ `PACKAGE_JSON_SETUP.md` обновлен
- ✅ Актуальные версии везде
- ✅ Добавлена секция про ESLint 9

### Файлы созданы

1. ✅ `pnpm-workspace.yaml`
2. ✅ `eslint.config.js`

---

**Дата завершения**: 2025-01-18  
**Статус**: ✅ Все пакеты обновлены до актуальных версий
