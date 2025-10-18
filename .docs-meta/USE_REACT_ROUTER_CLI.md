# ✅ Обновлен подход: Используем React Router CLI

**Дата**: 2025-01-18  
**Изменение**: Вместо ручного создания используем `pnpm dlx create-react-router@latest`

---

## 🎯 Проблема

**Старый подход (ручное создание):**
```bash
cd src/presentation/web/react
pnpm init
# Вручную копировать содержимое package.json из документации
# Риск: версии пакетов могут устареть в документации
```

**Проблемы:**
- ❌ Нужно вручную обновлять версии в документации
- ❌ Легко ошибиться при копировании
- ❌ Не используем официальный инструмент React Router

---

## ✅ Новый подход (React Router CLI)

```bash
cd src/presentation/web

# Создать временный проект через CLI (аналог npx)
pnpm dlx create-react-router@latest temp

# CLI создаст проект с актуальными версиями:
# - react@latest
# - react-router@latest
# - vite@latest
# - tailwindcss@latest (через @tailwindcss/vite)
# - typescript@latest
# - все правильные scripts + готовые конфиги!

# Скопировать нужные файлы
cp temp/package.json react/package.json
cp temp/tsconfig.json react/tsconfig.json
cp temp/vite.config.ts react/vite.config.ts
cp temp/react-router.config.ts react/react-router.config.ts

# Изменить name на "@password-manager/web" в package.json
# Изменить paths в tsconfig.json: "./app/*" → "./src/*"
# Добавить DDD алиасы в vite.config.ts

# Удалить временную папку
rm -rf temp

# Добавить только Catppuccin (Tailwind v4 уже установлен!)
cd react
pnpm add -D @catppuccin/tailwindcss
```

**Преимущества:**
- ✅ **Актуальные версии** всегда (из CLI)
- ✅ **Не завязаны на версии в документации** — CLI всегда даст latest
- ✅ **Правильные scripts** для React Router
- ✅ **Официальный инструмент** — не устареет
- ✅ **Меньше ошибок** — не копируем руками
- ✅ **Легко обновлять** — просто запустить CLI заново

🎉 **Бонус:** CLI использует современный стек (Tailwind v4 через `@tailwindcss/vite`, Vite 7+, React 19+)

---

## 📝 Что обновлено в документации

### 1. `steps/step_0/PACKAGE_JSON_SETUP.md`

**Секция "2️⃣ Web Presentation package.json":**

**Было:**
```markdown
### Команды установки:

```bash
cd src/presentation/web/react
pnpm init
# Скопировать содержимое выше в package.json
pnpm install
```
```

**Стало:**
```markdown
## 2️⃣ Web Presentation package.json (через React Router CLI)

> **💡 Используем React Router CLI** — он создаст проект с актуальными версиями пакетов.

### Шаг 1: Создать проект через CLI во временной папке

```bash
cd src/presentation/web
pnpm create react-router@latest temp

# Выбрать опции:
# - Template: Basic
# - TypeScript: Yes
# - Package manager: pnpm
```

### Шаг 2: Скопировать package.json
...

### Шаг 3: Удалить временную папку
...

### Шаг 4: Установить дополнительные зависимости
```

### 2. `steps/step_0/README.md`

**Секция "Быстрый старт":**

**Было:**
```markdown
2. **Создать root `package.json`** (DDD слои)
3. **Создать `src/presentation/web/react/package.json`** (Web UI)
```

**Стало:**
```markdown
2. **Создать root `package.json`** (DDD слои — neverthrow, typescript, etc.)
3. **Создать web `package.json` через React Router CLI** ⭐
   ```bash
   cd src/presentation/web
   pnpm create react-router@latest temp
   cp temp/package.json react/package.json
   rm -rf temp
   ```
```

---

## 🔄 Алгоритм использования CLI

### Для первоначальной настройки:

```bash
# 1. Создать структуру
mkdir -p src/presentation/web/react

# 2. Использовать CLI
cd src/presentation/web
pnpm create react-router@latest temp

# 3. Скопировать нужное
cp temp/package.json react/package.json
# Опционально: скопировать другие файлы конфигурации

# 4. Настроить
cd react
# Изменить "name" в package.json
# Добавить Tailwind и другие зависимости

# 5. Удалить временное
cd ..
rm -rf temp
```

### Для обновления версий в будущем:

```bash
# Заново создать через CLI
cd src/presentation/web
pnpm create react-router@latest temp-new

# Сравнить package.json
diff temp-new/package.json react/package.json

# Обновить версии вручную или скопировать заново
# (аккуратно, чтобы не потерять кастомные изменения)

# Удалить временное
rm -rf temp-new
```

---

## ⚙️ Что делает React Router CLI

CLI создает полноценный проект со следующими файлами:

```
temp/
├── package.json              # ← НАМ НУЖЕН!
├── tsconfig.json             # ← Можем использовать как референс
├── vite.config.ts            # ← Адаптируем под нашу структуру
├── react-router.config.ts    # ← Опционально
├── app/
│   ├── root.tsx              # ← Можем взять за основу
│   └── routes/
│       └── _index.tsx
└── public/
```

**Что берем из CLI:**
- ✅ `package.json` — актуальные версии
- ✅ `tsconfig.json` — референс для настроек
- ⚠️ `vite.config.ts` — адаптируем под нашу структуру
- ⚠️ `app/root.tsx` — можем использовать как шаблон

**Что НЕ берем:**
- ❌ `app/` структура — у нас своя (DDD)
- ❌ `public/` — создадим свою если нужно

---

## 📊 Сравнение подходов

| Критерий | Ручное создание | React Router CLI |
|----------|-----------------|------------------|
| Актуальность версий | ❌ Устаревают в docs | ✅ Всегда актуальные |
| Ошибки | ⚠️ Риск при копировании | ✅ Официальный tool |
| Scripts | ⚠️ Нужно знать какие | ✅ Автоматически правильные |
| Время | ⚠️ 5-10 минут | ✅ 2-3 минуты |
| Обновление | ❌ Вручную искать что изменилось | ✅ Запустить CLI снова |

---

## ✅ Итог

**Новый workflow:**
1. CLI создает проект с актуальными версиями
2. Мы берем `package.json`
3. Адаптируем под нашу структуру
4. Добавляем Tailwind и другие зависимости

**Преимущества:**
- ✅ Всегда актуальные версии
- ✅ Меньше ручной работы
- ✅ Меньше ошибок
- ✅ Используем официальный инструмент

**Документация обновлена:**
- ✅ `PACKAGE_JSON_SETUP.md` — детальная инструкция с CLI
- ✅ `README.md` — краткий обзор с упоминанием CLI

---

**Статус**: ✅ Подход обновлен в документации
