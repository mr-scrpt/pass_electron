# ✅ Обновление алиасов: Разделение по назначению + ESLint

**Дата**: 2025-01-18  
**Изменение**: Заменили единый `@/` на специализированные алиасы с enforcement через ESLint

---

## 🎯 Причина изменения

### Проблема с единым алиасом

Единый алиас `@/` для всего `src/` не соблюдает архитектурные границы:
- Presentation может импортировать напрямую из Application/Infrastructure
- Нет enforcement на уровне инструментов
- Нарушается Dependency Rule

### Решение: Разделение алиасов по назначению

1. **Public API** (`@domain`, `@api`) — указывают на `index.ts` (только экспортированное)
2. **Локальные** (`@client/*`) — для компонентов внутри Presentation
3. **Internal** (`@internal/*`) — доступ к реализациям ТОЛЬКО для Composition
4. **ESLint enforcement** — автоматическая проверка правил импортов

---

## ✅ Что изменено

### Root TypeScript config

**Было (единый алиас):**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // Доступ ко всему, нет контроля
    }
  }
}
```

**Стало (разделение по назначению):**
```json
{
  "compilerOptions": {
    "paths": {
      "@domain": ["./src/domain/index.ts"],              // Public API типов
      "@domain/*": ["./src/domain/*"],                    // Для Domain внутри себя
      "@api": ["./src/composition/index.ts"],            // Facades
      "@client/*": ["./src/presentation/web/react/src/*"],  // Локальные
      "@internal/application/*": ["./src/application/*"],   // Только Composition
      "@internal/infrastructure/*": ["./src/infrastructure/*"]
    }
  }
}
```

### Vite config

**Было (единый алиас):**
```typescript
resolve: {
  alias: {
    '@': path.resolve(projectRoot, 'src'),  // Доступ ко всему
  }
}
```

**Стало (разделение по назначению):**
```typescript
resolve: {
  alias: {
    // Public API - указывают на index.ts
    '@domain': path.resolve(projectRoot, 'src/domain/index.ts'),
    '@api': path.resolve(projectRoot, 'src/composition/index.ts'),
    
    // Локальные
    '@client': path.resolve(projectRoot, 'src/presentation/web/react/src'),
    
    // Internal - только для Composition Layer
    '@internal/application': path.resolve(projectRoot, 'src/application'),
    '@internal/infrastructure': path.resolve(projectRoot, 'src/infrastructure'),
  }
}
```

---

## 📝 Примеры импортов

### Было (единый алиас, нет контроля):
```typescript
// В Presentation - все работает, но нарушает архитектуру!
import { Resource } from '@/domain/resource/Resource'
import { queries } from '@/composition'
import { GetResourcesHandler } from '@/application/queries/GetResourcesHandler'  // ❌ Не должно работать!
import { ApiClient } from '@/infrastructure/api/ApiClient'  // ❌ Не должно работать!
```

### Стало (разделение, с ESLint enforcement):
```typescript
// В Presentation - только разрешенные импорты
import { Resource, ResourceId } from '@domain'  // ✅ Public API типов
import { queries } from '@api'  // ✅ Facades
import { ResourceList } from '@client/components/ResourceList'  // ✅ Локальные

// ❌ ESLint запретит эти импорты в Presentation!
// import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'
// import { ApiClient } from '@internal/infrastructure/api/ApiClient'

// В Composition - доступ к реализациям
import { Resource } from '@domain'  // ✅
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'  // ✅
import { ApiClient } from '@internal/infrastructure/api/ApiClient'  // ✅
```

---

## 🔍 Разница между алиасами

### Public API алиасы (на index.ts)

```typescript
'@domain': path.resolve(projectRoot, 'src/domain/index.ts')
```

- Указывает на **конкретный файл**
- Можно импортировать **ТОЛЬКО** то, что экспортировано из `index.ts`
- Это **Public API** слоя

**Пример:**
```typescript
// ✅ Работает (если экспортировано в index.ts)
import { Resource, ResourceId } from '@domain'

// ❌ НЕ работает (index.ts не экспортирует)
import { ResourceRepository } from '@domain/repositories/ResourceRepository'
```

### Internal алиасы (на директорию)

```typescript
'@internal/application': path.resolve(projectRoot, 'src/application')
```

- Указывает на **директорию**
- Можно импортировать **ЛЮБОЙ файл**
- Используется **ТОЛЬКО** в Composition Layer (ESLint проверит)

**Пример:**
```typescript
// В Composition - ✅ разрешено
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'

// В Presentation - ❌ ESLint запретит!
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'
```

---

## 📄 Обновленные файлы документации

1. **`steps/step_0/README.md`**
   - Секция "Шаг 3" - обзор TypeScript paths
   - Секция "Результат" - чеклист

2. **`steps/step_0/PACKAGE_JSON_SETUP.md`**
   - Секция "Шаг 5.1" - изменение tsconfig paths
   - Секция "Шаг 5.2" - Vite алиасы

3. **`steps/step_0/TYPESCRIPT_VITE_CONFIG.md`**
   - Все примеры импортов обновлены
   - TypeScript конфигурация обновлена
   - Vite конфигурация упрощена (единый алиас `@`)
   - Все примеры кода в routes, domain, composition

---

## ✅ Преимущества нового подхода

1. **Enforcement на уровне инструментов** — ESLint запрещает неправильные импорты
2. **Соблюдение Dependency Rule** — Presentation не может импортировать Infrastructure
3. **Явный Public API** — алиасы на `index.ts` показывают что является публичным
4. **Безопасность рефакторинга** — изменения внутри слоя не затрагивают других
5. **Легко понять назначение** — `@domain` (типы), `@api` (facades), `@client` (локальные)
6. **Composition Root изолирован** — только он имеет доступ к `@internal/*`

---

## 🛡️ ESLint Enforcement

### Установка

```bash
pnpm add -D eslint-plugin-boundaries
```

### Конфигурация (eslint.config.js)

```javascript
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**/*' },
        { type: 'application', pattern: 'src/application/**/*' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**/*' },
        { type: 'composition', pattern: 'src/composition/**/*' },
        { type: 'presentation', pattern: 'src/presentation/**/*' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'presentation', allow: ['domain', 'composition', 'presentation'] },
          { from: 'composition', allow: ['domain', 'application', 'infrastructure'] },
          { from: 'application', allow: ['domain'] },
          { from: 'infrastructure', allow: ['domain'] },
          { from: 'domain', allow: [] },
        ],
      }],
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@internal/*'],
          message: 'Presentation cannot use @internal/* aliases.',
        }],
      }],
    },
  },
]
```

---

## 📚 Обновленные файлы

### Документация

1. **`docs/ARCHITECTURE_BOUNDARIES.md`** ⭐ (новый)
   - Полное описание правил импортов
   - ESLint конфигурация
   - Примеры правильных/неправильных импортов
   - Визуализация зависимостей

2. **`steps/step_0/TYPESCRIPT_VITE_CONFIG.md`**
   - Обновлены tsconfig paths
   - Обновлены Vite алиасы
   - Новые примеры импортов

3. **`steps/step_0/PACKAGE_JSON_SETUP.md`**
   - Шаг 5.1: новые tsconfig paths
   - Шаг 5.2: новые Vite алиасы

4. **`steps/step_0/README.md`**
   - Быстрый обзор алиасов

---

## ✅ Итог

- ✅ Алиасы разделены по назначению
- ✅ Public API через `@domain`, `@api`
- ✅ Локальные компоненты через `@client/*`
- ✅ Internal доступ через `@internal/*` (только Composition)
- ✅ ESLint enforcement настроен
- ✅ Документация полностью обновлена

**Теперь импорты в Presentation:**
```typescript
import { Resource } from '@domain'          // Типы
import { queries } from '@api'              // Facades
import { ResourceList } from '@client/components/ResourceList'  // Локальные
```

**Теперь импорты в Composition:**
```typescript
import { Resource } from '@domain'
import { GetResourcesHandler } from '@internal/application/queries/GetResourcesHandler'
import { ApiClient } from '@internal/infrastructure/api/ApiClient'
```

---

**Статус**: ✅ Архитектурные границы защищены на уровне инструментов
