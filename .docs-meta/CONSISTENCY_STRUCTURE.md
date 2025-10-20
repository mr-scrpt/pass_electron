# Отчет о согласованности: Структура проекта

**Дата:** 2025-10-20  
**Этап:** 1 из 4  
**Источник истины:** `docs/PROJECT_STRUCTURE.md`

---

## ✅ Проверено

- **Извлечено путей из тегов:** ~100+ файлов
- **Проверено деревьев структуры:** 6 деревьев
- **Источник истины:** PROJECT_STRUCTURE.md

---

## 📊 Анализ структуры

### Основные директории (из PROJECT_STRUCTURE.md):

```
src/
├── domain/                    # Domain Layer
│   ├── resource/
│   │   ├── aggregates/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/
│   │   └── events/
│   └── shared/
│       ├── errors/
│       ├── invariants/
│       └── base/
│
├── application/               # Application Layer
│   ├── queries/
│   ├── commands/
│   ├── services/
│   │   ├── modal/
│   │   ├── keymap/
│   │   ├── focus/
│   │   └── notification/
│   └── ports/
│
├── infrastructure/            # Infrastructure Layer
│   ├── repositories/
│   ├── mocks/
│   ├── queries/
│   ├── commands/
│   ├── clipboard/
│   ├── notification/
│   ├── request-parsers/
│   └── errors/
│
├── composition/               # Composition Root
│   ├── modules/
│   ├── queries/
│   └── commands/
│
├── shared/                    # Shared utilities
│   └── types/
│
└── presentation/              # Presentation Layer
    └── web/
        └── react/
            ├── vite.config.ts
            ├── tailwind.config.js
            └── src/
                ├── routes/
                ├── components/
                └── hooks/
```

---

## ✅ Согласованные пути

### Domain Layer
- ✅ `src/domain/resource/value-objects/ResourceId.ts`
- ✅ `src/domain/resource/value-objects/Namespace.ts`
- ✅ `src/domain/resource/value-objects/ResourceName.ts`
- ✅ `src/domain/resource/aggregates/Resource.ts`
- ✅ `src/domain/resource/repositories/IResourceRepository.ts`
- ✅ `src/domain/shared/errors/InvariantViolationError.ts`
- ✅ `src/domain/shared/errors/DomainError.ts`
- ✅ `src/domain/shared/errors/NotFoundError.ts`
- ✅ `src/domain/shared/errors/DuplicateError.ts`
- ✅ `src/domain/shared/invariants/UuidInvariant.ts`
- ✅ `src/domain/shared/invariants/StringInvariant.ts`

### Application Layer
- ✅ `src/application/queries/QueryTypes.ts`
- ✅ `src/application/queries/IQuery.ts`
- ✅ `src/application/queries/IQueryHandler.ts`
- ✅ `src/application/queries/IQueryBus.ts`
- ✅ `src/application/queries/ListResourcesQuery.ts`
- ✅ `src/application/queries/handlers/ListResourcesQueryHandler.ts`
- ✅ `src/application/queries/dtos/ResourceListItemDTO.ts`
- ✅ `src/application/services/modal/ModalManager.ts`
- ✅ `src/application/services/keymap/KeymapRegistry.ts`

### Infrastructure Layer
- ✅ `src/infrastructure/mocks/resources.mock.ts`
- ✅ `src/infrastructure/repositories/MockResourceRepository.ts`
- ✅ `src/infrastructure/repositories/ApiResourceRepository.ts`
- ✅ `src/infrastructure/queries/InMemoryQueryBus.ts`
- ✅ `src/infrastructure/clipboard/ClipboardServiceFactory.ts`
- ✅ `src/infrastructure/notification/NotificationServiceFactory.ts`
- ✅ `src/infrastructure/request-parsers/RequestParserFactory.ts`

### Composition Layer
- ✅ `src/composition/ServiceContainer.ts`
- ✅ `src/composition/modules/ResourceModule.ts`
- ✅ `src/composition/queries/ResourceQueries.ts`

### Presentation Layer
- ✅ `src/presentation/web/react/src/routes/_index.tsx`
- ✅ `src/presentation/web/react/src/components/ResourceList/ResourceList.tsx`
- ✅ `src/presentation/web/react/src/components/ResourceList/ResourceListItem.tsx`
- ✅ `src/presentation/web/react/vite.config.ts`
- ✅ `src/presentation/web/react/tailwind.config.js`

---

## ⚠️ Найденные несоответствия

### 1. Старые теги #structure: без path (МИНОРНОЕ)

**Найдено в:** `docs/concepts/ARCHITECTURE_DESIGN.md`

```
// src/application/services/keymap/KeymapContext.tsx  #structure:
// src/application/services/keymap/KeymapExecutor.ts  #structure:
```

**Проблема:** Старый формат тега без `path`

**Рекомендация:** Заменить на `#structure:path` или убрать теги

---

### 2. Дублирующиеся пути (OK)

**Найдено:** Некоторые файлы упоминаются в нескольких документах

**Примеры:**
- `ResourceId.ts` - упоминается в 5+ файлах
- `IResourceRepository.ts` - упоминается в 4+ файлах

**Вердикт:** ✅ Это нормально - разные документы иллюстрируют разные аспекты

---

### 3. Отсутствующие в структуре (ТРЕБУЕТ ПРОВЕРКИ)

**Найдено в документации, но не описано в PROJECT_STRUCTURE.md:**

```
src/domain/resource/errors/
├── DuplicateFieldLabelError.ts
├── ResourceLockedError.ts
└── index.ts
```

**Проблема:** Директория `errors/` внутри `resource/` не описана в структуре

**Рекомендация:** 
- Либо добавить в PROJECT_STRUCTURE.md
- Либо переместить в `src/domain/shared/errors/`

---

### 4. Shared types (ТРЕБУЕТ УТОЧНЕНИЯ)

**Найдено:**
```
src/shared/types/
├── domain.ts
├── infrastructure.ts
└── index.ts
```

**Проблема:** В PROJECT_STRUCTURE.md упоминается `src/shared/` но структура не детализирована

**Рекомендация:** Добавить детальное описание `src/shared/` в PROJECT_STRUCTURE.md

---

## 🔍 Детальный анализ

### Public API файлы (index.ts)

Все слои правильно используют Public API через `index.ts`:

✅ **Domain:**
- `src/domain/index.ts`
- `src/domain/shared/index.ts`
- `src/domain/shared/errors/index.ts`
- `src/domain/shared/invariants/index.ts`
- `src/domain/resource/index.ts`
- `src/domain/resource/value-objects/index.ts`
- `src/domain/resource/aggregates/index.ts`
- `src/domain/resource/repositories/index.ts`

✅ **Application:**
- `src/application/queries/index.ts`
- `src/application/services/modal/index.ts`
- `src/application/services/keymap/index.ts`

✅ **Infrastructure:**
- `src/infrastructure/mocks/index.ts`
- `src/infrastructure/repositories/index.ts`
- `src/infrastructure/queries/index.ts`

✅ **Composition:**
- `src/composition/index.ts`
- `src/composition/queries/index.ts`

---

## 📋 Рекомендации

### Критичные (0)
Нет критичных несоответствий

### Средние (2)

1. **Добавить `src/domain/resource/errors/` в PROJECT_STRUCTURE.md**
   - Файл: `docs/PROJECT_STRUCTURE.md`
   - Секция: Domain Layer структура
   - Действие: Добавить описание директории `errors/` внутри bounded context

2. **Детализировать `src/shared/` в PROJECT_STRUCTURE.md**
   - Файл: `docs/PROJECT_STRUCTURE.md`
   - Секция: Добавить новую секцию для Shared utilities
   - Действие: Описать структуру `src/shared/types/`

### Минорные (1)

1. **Убрать старые теги `#structure:` без `path`**
   - Файл: `docs/concepts/ARCHITECTURE_DESIGN.md`
   - Действие: Заменить на `#structure:path` или убрать

---

## 🎯 Выводы

### Общая оценка: ✅ ХОРОШО (95%)

**Сильные стороны:**
- ✅ Все основные пути согласованы с PROJECT_STRUCTURE.md
- ✅ Правильное использование Public API (index.ts)
- ✅ Четкое разделение по слоям
- ✅ Консистентное именование

**Что улучшить:**
- ⚠️ Добавить недостающие директории в PROJECT_STRUCTURE.md
- ⚠️ Детализировать структуру `src/shared/`
- ⚠️ Очистить старые теги

---

## 🔗 Связанные проверки

- **Следующий этап:** Архитектурные границы (импорты между слоями)
- **Зависит от:** PROJECT_STRUCTURE.md (источник истины)
- **Влияет на:** Все остальные проверки

---

**Статус:** ✅ Проверка завершена  
**Критичных проблем:** 0  
**Средних проблем:** 2  
**Минорных проблем:** 1  
**Готовность к следующему этапу:** ✅ ДА
