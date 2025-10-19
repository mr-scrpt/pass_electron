# План внедрения минимальной системы тегов

**Дата начала**: 2025-01-19  
**Статус**: В процессе  
**Текущий этап**: 0 из 7

---

## 🎯 ЦЕЛЬ

Внедрить минимальную систему тегов (7 типов) во все 33 файла документации.

---

## 📋 ТИПЫ ТЕГОВ

1. `#structure:` - пути к директориям в структуре проекта
2. `#class:` - классы (ResourceId, Resource, etc.)
3. `#interface:` - интерфейсы (IResourceRepository, etc.)
4. `#api:` - API endpoints (GET /api/resources, etc.)
5. `#command:` - команды (npm run dev, etc.)
6. `#alias:` - алиасы импортов (@/, etc.)
7. Концептуальные - уже есть (#value-object, #layer-domain, etc.)

---

## 📊 ПЛАН РАБОТЫ (ПО ФАЙЛАМ)

**Стратегия:** Обрабатываем каждый файл один раз, добавляя ВСЕ нужные типы тегов сразу.

**Для каждого файла проверяем:**
- ✅ Есть структура проекта? → `#structure:`
- ✅ Есть классы? → `#class:`
- ✅ Есть интерфейсы? → `#interface:`
- ✅ Есть API endpoints? → `#api:`
- ✅ Есть команды? → `#command:`
- ✅ Есть алиасы импортов? → `#alias:`

---

### ГРУППА 1: Основная документация (10 файлов)
**Статус:** ⏳ Не начато

#### 1.1 docs/PROJECT_STRUCTURE.md
- [ ] `#structure:` - дерево структуры проекта
- [ ] `#class:` - примеры классов в структуре
- [ ] `#alias:` - примеры алиасов @/

#### 1.2 docs/GETTING_STARTED.md
- [ ] `#structure:` - упоминания структуры
- [ ] `#command:` - команды запуска
- [ ] `#alias:` - примеры импортов

#### 1.3 docs/DDD_AND_CLEAN_ARCHITECTURE.md
- [ ] `#class:` - примеры Value Objects, Entities
- [ ] `#interface:` - примеры интерфейсов
- [ ] `#structure:` - упоминания структуры слоёв

#### 1.4 docs/ARCHITECTURE_BOUNDARIES.md
- [ ] `#alias:` - правила алиасов
- [ ] `#class:` - примеры в импортах
- [ ] `#interface:` - примеры интерфейсов

#### 1.5 docs/TYPES_AND_ENTITIES.md
- [ ] `#class:` - Value Objects, Entities, Aggregates
- [ ] `#interface:` - DTO интерфейсы
- [ ] `#structure:` - структура типов

#### 1.6 docs/DATA_FLOW.md
- [ ] `#class:` - примеры классов в потоке данных
- [ ] `#interface:` - Query/Command Handlers
- [ ] `#api:` - примеры API endpoints
- [ ] `#alias:` - примеры импортов

#### 1.7 docs/COMMAND_BUS.md
- [ ] `#class:` - Command классы
- [ ] `#interface:` - ICommand интерфейсы
- [ ] `#alias:` - примеры импортов

#### 1.8 docs/QUERY_HANDLERS.md
- [ ] `#class:` - Query Handler классы
- [ ] `#interface:` - IQueryHandler интерфейсы
- [ ] `#alias:` - примеры импортов

#### 1.9 docs/COMPOSITION_LAYER.md
- [ ] `#class:` - примеры DI классов
- [ ] `#interface:` - интерфейсы сервисов
- [ ] `#structure:` - структура Composition
- [ ] `#alias:` - примеры импортов

#### 1.10 docs/ADAPTER_PATTERN_DI.md
- [ ] `#class:` - Adapter классы
- [ ] `#interface:` - Port интерфейсы
- [ ] `#api:` - примеры API вызовов
- [ ] `#alias:` - примеры импортов

**Чекпоинт 1:** Коммит "feat: добавлены теги в основную документацию (10 файлов)"

---

### ГРУППА 2: Error Handling (4 файла)
**Статус:** ⏳ Не начато

#### 2.1 docs/error-handling/INVARIANTS.md
- [ ] `#class:` - Invariant классы, Error классы
- [ ] `#interface:` - интерфейсы валидации
- [ ] `#alias:` - примеры импортов

#### 2.2 docs/error-handling/ERROR_HANDLING.md
- [ ] `#class:` - Error классы иерархии
- [ ] `#structure:` - структура ошибок по слоям

#### 2.3 docs/error-handling/ERROR_ESCALATION.md
- [ ] `#class:` - Result классы
- [ ] `#interface:` - Result интерфейсы

#### 2.4 docs/error-handling/ERROR_ESCALATION_EXTENDED.md
- [ ] `#class:` - примеры монад
- [ ] `#interface:` - интерфейсы Either/Result

**Чекпоинт 2:** Коммит "feat: добавлены теги в error-handling (4 файла)"

---

### ГРУППА 3: Contracts (6 файлов)
**Статус:** ⏳ Не начато

#### 3.1 docs/contracts/domain-types.md
- [ ] `#class:` - все доменные типы
- [ ] `#interface:` - интерфейсы типов

#### 3.2 docs/contracts/system-interfaces.md
- [ ] `#interface:` - все системные интерфейсы
- [ ] `#class:` - примеры реализаций

#### 3.3 docs/contracts/api-contracts.md
- [ ] `#api:` - все API endpoints
- [ ] `#interface:` - Request/Response интерфейсы

#### 3.4 docs/contracts/events.md
- [ ] `#class:` - Event классы
- [ ] `#interface:` - Event интерфейсы

#### 3.5 docs/contracts/infrastructure-types.md
- [ ] `#class:` - Infrastructure классы
- [ ] `#interface:` - Infrastructure интерфейсы

#### 3.6 docs/contracts/README.md
- [ ] Навигационный файл - минимум тегов

**Чекпоинт 3:** Коммит "feat: добавлены теги в contracts (6 файлов)"

---

### ГРУППА 4: Concepts (3 файла)
**Статус:** ⏳ Не начато

#### 4.1 docs/concepts/THEORETICAL_CONCEPT.md
- [ ] Исторический файл - минимум тегов

#### 4.2 docs/concepts/ARCHITECTURE_DESIGN.md
- [ ] `#class:` - примеры классов
- [ ] `#interface:` - примеры интерфейсов
- [ ] `#structure:` - архитектурная структура
- [ ] `#api:` - примеры API

#### 4.3 docs/concepts/IMPLEMENT_CONCEPT_OUTER.md
- [ ] `#class:` - примеры реализации
- [ ] `#interface:` - интерфейсы
- [ ] `#api:` - примеры API

**Чекпоинт 4:** Коммит "feat: добавлены теги в concepts (3 файла)"

---

### ГРУППА 5: Steps (6 файлов)
**Статус:** ⏳ Не начато

#### 5.1 steps/step_0/README.md
- [ ] `#command:` - команды установки
- [ ] `#structure:` - упоминания структуры

#### 5.2 steps/step_0/PACKAGE_JSON_SETUP.md
- [ ] `#command:` - npm/pnpm команды
- [ ] `#structure:` - структура workspaces

#### 5.3 steps/step_0/TYPESCRIPT_VITE_CONFIG.md
- [ ] `#alias:` - конфигурация алиасов
- [ ] `#command:` - команды сборки
- [ ] `#class:` - примеры импортов классов

#### 5.4 steps/step_0/TAILWIND_SETUP.md
- [ ] `#command:` - команды установки
- [ ] Минимум тегов (UI конфигурация)

#### 5.5 steps/step_0/ESLINT_SETUP.md
- [ ] `#command:` - команды линтинга
- [ ] Минимум тегов (конфигурация)

#### 5.6 steps/step_1/README.md
- [ ] `#structure:` - структура Domain Layer
- [ ] `#class:` - Value Objects, Entities, Aggregates
- [ ] `#interface:` - Repository интерфейсы
- [ ] `#alias:` - примеры импортов

**Чекпоинт 5:** Коммит "feat: добавлены теги в steps (6 файлов)"

---

### ГРУППА 6: Остальные (4 файла)
**Статус:** ⏳ Не начато

#### 6.1 docs/electron/README.md
- [ ] `#interface:` - Electron API интерфейсы
- [ ] `#structure:` - структура Electron
- [ ] `#command:` - команды Electron

#### 6.2 docs/ui/CATPPUCCIN_MOCHA.md
- [ ] Минимум тегов (UI палитра)

#### 6.3 docs/README.md
- [ ] Навигационный файл - минимум тегов

#### 6.4 docs/error-handling/README.md
- [ ] Навигационный файл - минимум тегов

**Чекпоинт 6:** Коммит "feat: добавлены теги в остальные файлы (4 файла)"

---

### ГРУППА 7: Финализация
**Статус:** ⏳ Не начато

#### Задачи:
- [ ] Проверить все 33 файла на наличие тегов
- [ ] Создать итоговый отчёт с примерами использования
- [ ] Обновить TAG_SYSTEM_GUIDE.md
- [ ] Создать файл с командами для поиска
- [ ] Протестировать все команды grep
- [ ] Обновить воспоминание в MCP

**Чекпоинт 7:** Коммит "feat: завершено внедрение минимальной системы тегов"

---

## 📊 ПРОГРЕСС

| Группа | Описание | Файлов | Статус |
|--------|----------|--------|--------|
| 1 | Основная документация | 10 | ⏳ Не начато |
| 2 | Error Handling | 4 | ⏳ Не начато |
| 3 | Contracts | 6 | ⏳ Не начато |
| 4 | Concepts | 3 | ⏳ Не начато |
| 5 | Steps | 6 | ⏳ Не начато |
| 6 | Остальные | 4 | ⏳ Не начато |
| 7 | Финализация | - | ⏳ Не начато |

**Общий прогресс:** 0/33 файлов (0%)

---

## 🔄 КАК ПРОДОЛЖИТЬ ПОСЛЕ ПЕРЕРЫВА

### Проверить текущий этап:
```bash
# Посмотреть этот файл
cat .docs-meta/TAG_IMPLEMENTATION_PLAN.md

# Найти последний чекпоинт
git log --oneline | grep "feat: добавлены теги"
```

### Продолжить с нужного этапа:
1. Открыть этот файл
2. Найти первый незавершённый этап (⏳)
3. Начать с первого незавершённого файла в этапе
4. После завершения этапа - сделать чекпоинт (коммит)

---

## 📝 ПРИМЕРЫ ТЕГИРОВАНИЯ

### Пример 1: #structure:
```markdown
## Структура проекта `#structure-tree`

```
src/
├── domain/                    #structure:domain/
│   ├── resource/              #structure:domain/resource/
│   │   ├── aggregates/        #structure:domain/resource/aggregates/
│   │   ├── value-objects/     #structure:domain/resource/value-objects/
```
```

### Пример 2: #class:
```typescript
// Определение
export class ResourceId {  // #class:ResourceId
  // ...
}

// Использование
import { ResourceId } from '@/domain'  // #class:ResourceId
const id = ResourceId.create(uuid)     // #class:ResourceId
```

### Пример 3: #interface:
```typescript
export interface IResourceRepository {  // #interface:IResourceRepository
  findById(id: string): Promise<Resource>
}
```

### Пример 4: #api:
```markdown
**GET /api/resources** `#api:GET:/api/resources`
```

### Пример 5: #command:
```bash
# #command:npm-run-dev
npm run dev
```

### Пример 6: #alias:
```typescript
// #alias:@/
import { Resource } from '@/domain'
```

---

## ⚠️ ВАЖНЫЕ ПРАВИЛА

1. **Не засорять** - добавлять теги только там, где они нужны
2. **Консистентность** - один класс = один тег везде
3. **Читаемость** - теги не должны мешать чтению
4. **Чекпоинты** - коммитить после каждого этапа
5. **Проверка** - тестировать grep после каждого этапа

---

## 🎯 КРИТЕРИИ УСПЕХА

- ✅ Все 7 этапов завершены
- ✅ Все 33 файла обработаны
- ✅ Все команды grep работают
- ✅ Документация читаема
- ✅ Система протестирована

---

**Создано**: 2025-01-19  
**Обновлено**: 2025-01-19  
**Статус**: Готов к выполнению  
**Текущий этап**: 0/7
