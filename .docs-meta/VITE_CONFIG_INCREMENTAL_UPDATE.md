# Обновление TYPESCRIPT_VITE_CONFIG.md - Инкрементальный подход

**Дата**: 2025-01-18  
**Файл**: `steps/step_0/TYPESCRIPT_VITE_CONFIG.md`

## 🎯 Проблема

Документ показывал **полный код** `vite.config.ts`, но:
1. React Router CLI уже генерирует этот файл
2. Сгенерированный файл использует `vite-tsconfig-paths` для автоматической синхронизации
3. В будущих версиях CLI структура может измениться
4. Нужно давать **инструкции что добавить**, а не весь код

## ✅ Что исправлено

### 1. Показан текущий сгенерированный файл

**Добавлен блок:**
```markdown
> **📦 Файл уже создан**: React Router CLI сгенерировал `src/presentation/web/react/vite.config.ts`
>
> **Текущее состояние** (сгенерированный файл):
> ```typescript
> import { reactRouter } from "@react-router/dev/vite";
> import tailwindcss from "@tailwindcss/vite";
> import { defineConfig } from "vite";
> import tsconfigPaths from "vite-tsconfig-paths";
> 
> export default defineConfig({
>   plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
> });
> ```
```

### 2. Объяснено что уже работает

**Добавлен раздел "Что уже настроено":**
- `vite-tsconfig-paths` автоматически синхронизирует алиасы
- Не нужно вручную настраивать `resolve.alias`
- Изменения в `tsconfig.json` автоматически применяются

### 3. Даны инструкции что добавить

**Вместо полного кода:**
```typescript
// 🔧 ДОБАВИТЬ (если нужно):
server: {
  port: 5173,
  strictPort: true,
},
```

### 4. Обновлены примеры импортов

**Было:**
```typescript
import { queries } from '@api'
import { ResourceList } from '@client/components/ResourceList'
```

**Стало:**
```typescript
import { queries } from '@/composition'
import { ResourceList } from '~/components/ResourceList'  // React Router alias
```

### 5. Обновлен Troubleshooting

**Было**: Проверка `projectRoot` и ручных алиасов  
**Стало**: Проверка `vite-tsconfig-paths` плагина

### 6. Обновлен чеклист

**Убрано:**
- ❌ Алиасы в vite совпадают с tsconfig paths (не нужно)
- ❌ projectRoot в vite.config (не используется)

**Добавлено:**
- ✅ vite.config.ts уже создан React Router CLI
- ✅ vite-tsconfig-paths уже установлен и настроен

## 📋 Ключевые изменения

| Аспект | Было | Стало |
|--------|------|-------|
| **Подход** | Полный код файла | Инструкции что добавить |
| **Алиасы** | Ручная настройка `resolve.alias` | Автоматически через `vite-tsconfig-paths` |
| **Импорты** | `@api`, `@client` | `@/composition`, `~/components` |
| **Структура** | Сложная с `projectRoot` | Простая, CLI делает всё |
| **Обслуживание** | Нужно обновлять при изменении CLI | Устойчиво к изменениям CLI |

## 🎯 Преимущества нового подхода

1. **Устойчивость к изменениям CLI** - показываем только что добавить
2. **Простота** - меньше кода, меньше путаницы
3. **Актуальность** - работает с текущей версией React Router CLI
4. **Понятность** - явно указано что уже сделано, что нужно добавить

## 🔗 Связанные изменения

- ✅ Исправлены импорты в примерах (`@/domain`, `@/composition`)
- ✅ Убраны устаревшие алиасы (`@api`, `@client`)
- ✅ Добавлен React Router alias (`~`) для локальных импортов
- ✅ Обновлен Troubleshooting под новый подход

## 💡 Принцип для будущего

**Для конфигурационных файлов, генерируемых CLI:**
1. Показать текущее состояние (что уже есть)
2. Объяснить что уже работает
3. Дать инструкции что добавить (если нужно)
4. Не дублировать весь код файла

Это делает документацию:
- Устойчивой к изменениям инструментов
- Проще в поддержке
- Понятнее для пользователей
