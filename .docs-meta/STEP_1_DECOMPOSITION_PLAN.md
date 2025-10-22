# Step 1 Decomposition Plan

**Дата:** 2025-01-22  
**Статус:** В процессе

## Проблема

`steps/step_1/README.md` содержит 2647 строк - слишком большой файл для удобной навигации.

## Решение

Декомпозировать по аналогии со `step_0` - вынести тематические разделы в отдельные файлы.

## Структура файлов

### 1. `VALIDATION_SETUP.md` (~200 строк)
**Разделы:** 0.1-0.4  
**Содержание:**
- Создание структуры Shared Layer
- Validation.ts (фасад над @sweet-monads/either)
- ValidationCombinators.ts (accumulate, sequence)
- Public API

### 2. `SPECIFICATION_SETUP.md` (~300 строк)
**Раздел:** 0.5  
**Содержание:**
- ISpecification интерфейс
- ValidationError класс
- Fluent API (isTrue().valid().invalid())
- Common* спецификации (CommonLengthSpec, CommonPatternSpec, CommonNotEmptySpec)
- Public API для спецификаций

### 3. `DOMAIN_LAYER_SETUP.md` (~500 строк)
**Разделы:** 1.1-1.7  
**Содержание:**
- Инварианты (InvariantViolationError, UuidInvariant)
- Value Object: ResourceId
- Спецификации для Namespace
- Value Object: Namespace
- Спецификации для ResourceName
- Value Object: ResourceName
- Aggregate Root: Resource

### 4. `APPLICATION_LAYER_SETUP.md` (~300 строк)
**Разделы:** Application Layer  
**Содержание:**
- Query Types, IQuery, IQueryHandler, IQueryBus
- ListResourcesQuery
- ListResourcesQueryHandler
- ResourceListItemDTO
- Public API

### 5. `INFRASTRUCTURE_SETUP.md` (~200 строк)
**Разделы:** Infrastructure Layer  
**Содержание:**
- Mock data (resources.mock.ts)
- MockResourceRepository
- InMemoryQueryBus
- Public API

### 6. `COMPOSITION_SETUP.md` (~200 строк)
**Разделы:** Composition Layer  
**Содержание:**
- ServiceContainer
- ResourceModule (DI)
- ResourceQueries (Facade)
- Public API

### 7. `PRESENTATION_SETUP.md` (~200 строк)
**Разделы:** Presentation Layer  
**Содержание:**
- ResourceList компонент
- ResourceListItem компонент
- Route _index.tsx
- Loader integration

### 8. `VALIDATION_EXAMPLES.md` (~400 строк)
**Разделы:** Примеры валидации  
**Содержание:**
- Накопление ошибок (mergeInMany)
- CreateResourceCommand Handler
- RenameResourceCommand Handler
- Stateful vs Stateless валидация
- Почему Domain не может проверить уникальность

### 9. `README.md` (~400 строк)
**Основной файл**  
**Содержание:**
- Цель и визуализация архитектуры
- Порядок реализации (ссылки на файлы)
- Структура файлов проекта
- Чек-лист выполнения
- Что вы изучите
- FAQ

## Порядок создания

1. ✅ Создать план (этот файл)
2. ✅ VALIDATION_SETUP.md
3. ✅ SPECIFICATION_SETUP.md
4. ✅ DOMAIN_LAYER_SETUP.md
5. ✅ APPLICATION_LAYER_SETUP.md
6. ✅ INFRASTRUCTURE_SETUP.md
7. ✅ COMPOSITION_SETUP.md
8. ✅ PRESENTATION_SETUP.md
9. ✅ VALIDATION_EXAMPLES.md
10. ⏳ Обновить README.md (оставить только навигацию)
11. ⏳ Коммит

## Ожидаемый результат

- `README.md`: ~400 строк (было 2647)
- 8 тематических файлов: ~2200 строк
- Улучшенная навигация
- Легче поддерживать
- Проще читать
