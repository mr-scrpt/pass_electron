# Анализ стратегии тегирования для согласованности

**Цель:** Система тегов для быстрого поиска и обновления связанных мест при изменениях

---

## 🎯 ДИНАМИЧЕСКИЕ СУЩНОСТИ (что может меняться)

### 1. Структура проекта
**Что меняется:**
- Пути к директориям
- Названия слоёв
- Организация модулей

**Где упоминается:**
- PROJECT_STRUCTURE.md
- GETTING_STARTED.md
- step_0/README.md
- step_1/README.md
- Примеры импортов во всех файлах

**Нужные теги:**
- `#structure:domain/resource/` - путь к директории
- `#structure:application/queries/` - путь к директории
- `#structure-tree` - блоки с деревом структуры

### 2. Названия файлов и классов
**Что меняется:**
- ResourceId.ts → ResourceIdentifier.ts
- Resource.ts → ResourceAggregate.ts
- GetResourcesHandler → ListResourcesHandler

**Где упоминается:**
- Примеры кода во всех файлах
- Импорты
- Описания типов

**Нужные теги:**
- `#class:ResourceId` - класс ResourceId
- `#class:Resource` - класс Resource
- `#class:GetResourcesHandler` - класс Handler
- `#file:domain/resource/value-objects/ResourceId.ts` - путь к файлу

### 3. Типы и интерфейсы
**Что меняется:**
- Сигнатуры интерфейсов
- Названия полей
- Типы данных

**Где упоминается:**
- contracts/domain-types.md
- contracts/system-interfaces.md
- Примеры использования

**Нужные теги:**
- `#interface:IResourceRepository` - интерфейс
- `#type:Resource` - тип
- `#type:ModeContext` - тип

### 4. API endpoints
**Что меняется:**
- Пути endpoints
- Методы HTTP
- Форматы запросов/ответов

**Где упоминается:**
- contracts/api-contracts.md
- Примеры в DATA_FLOW.md
- Примеры в ADAPTER_PATTERN_DI.md

**Нужные теги:**
- `#api:GET:/api/resources` - endpoint
- `#api:POST:/api/resources` - endpoint

### 5. Алиасы импортов
**Что меняется:**
- @/ → ~/
- @domain → @/domain
- Правила импортов

**Где упоминается:**
- ARCHITECTURE_BOUNDARIES.md
- PROJECT_STRUCTURE.md
- step_0/TYPESCRIPT_VITE_CONFIG.md
- Все примеры кода

**Нужные теги:**
- `#alias:@/` - алиас импорта
- `#import-example` - пример импорта

### 6. Команды и конфигурация
**Что меняется:**
- npm scripts
- Команды запуска
- Конфигурация инструментов

**Где упоминается:**
- step_0/PACKAGE_JSON_SETUP.md
- step_0/TYPESCRIPT_VITE_CONFIG.md
- GETTING_STARTED.md

**Нужные теги:**
- `#command:npm-run-dev` - команда
- `#config:tsconfig` - конфигурация

### 7. Концептуальные правила
**Что меняется:**
- Архитектурные правила
- Паттерны проектирования
- Best practices

**Где упоминается:**
- Множество файлов

**Нужные теги:**
- `#rule:public-api-only` - правило
- `#rule:dependency-direction` - правило
- `#pattern:result` - паттерн

---

## 📋 ИТОГОВАЯ СТРАТЕГИЯ ТЕГИРОВАНИЯ

### Обязательные теги для каждого блока:

#### 1. Блоки с структурой проекта
```markdown
## Структура `#structure-tree`

```
src/
├── domain/           #structure:domain/
│   ├── resource/     #structure:domain/resource/
│   │   ├── aggregates/   #structure:domain/resource/aggregates/
```
```

#### 2. Примеры кода с импортами
```typescript
// #import-example #alias:@/
import { Resource } from '@/domain'  // #class:Resource #file:domain/resource/aggregates/Resource.ts
import { ResourceId } from '@/domain'  // #class:ResourceId #file:domain/resource/value-objects/ResourceId.ts
```

#### 3. Определения классов/интерфейсов
```typescript
// #class:ResourceId #value-object
export class ResourceId {
  // #file:domain/resource/value-objects/ResourceId.ts
}

// #interface:IResourceRepository #repository-interface
export interface IResourceRepository {
  // #file:domain/repositories/IResourceRepository.ts
}
```

#### 4. API endpoints
```typescript
// #api:GET:/api/resources #api-endpoint
GET /api/resources

// #api:POST:/api/resources/:id #api-endpoint
POST /api/resources/:id
```

#### 5. Команды
```bash
# #command:npm-run-dev
npm run dev

# #command:pnpm-install
pnpm install
```

#### 6. Конфигурация
```json
// #config:tsconfig #config-paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // #alias:@/
    }
  }
}
```

---

## 🎯 ПРИМЕНЕНИЕ

### Сценарий 1: Переименование ResourceId → ResourceIdentifier

```bash
# 1. Найти все упоминания класса
grep -r "#class:ResourceId" docs/ steps/

# 2. Найти все упоминания файла
grep -r "#file:domain/resource/value-objects/ResourceId.ts" docs/ steps/

# 3. Обновить все найденные места
# 4. Заменить теги на новые
```

### Сценарий 2: Изменение структуры domain/resource/

```bash
# 1. Найти все упоминания структуры
grep -r "#structure:domain/resource/" docs/ steps/

# 2. Найти дерево структуры
grep -r "#structure-tree" docs/ steps/

# 3. Обновить все деревья структуры
```

### Сценарий 3: Изменение алиаса @/ → ~/

```bash
# 1. Найти все упоминания алиаса
grep -r "#alias:@/" docs/ steps/

# 2. Найти все примеры импортов
grep -r "#import-example" docs/ steps/

# 3. Обновить все примеры
```

### Сценарий 4: Изменение API endpoint

```bash
# 1. Найти все упоминания endpoint
grep -r "#api:GET:/api/resources" docs/ steps/

# 2. Обновить все примеры
```

---

## ✅ ПЛАН ДЕЙСТВИЙ

1. ✅ Добавить теги структуры (`#structure:`) во все блоки с деревом
2. ✅ Добавить теги классов (`#class:`) во все примеры кода
3. ✅ Добавить теги интерфейсов (`#interface:`) во все определения
4. ✅ Добавить теги API (`#api:`) во все endpoints
5. ✅ Добавить теги команд (`#command:`) во все команды
6. ✅ Добавить теги конфигурации (`#config:`) во все конфиги
7. ✅ Добавить теги алиасов (`#alias:`) во все импорты

---

## 📊 ОЦЕНКА ОБЪЁМА РАБОТЫ

- **Файлов для обработки:** 33
- **Блоков с кодом:** ~200-300
- **Блоков со структурой:** ~20-30
- **Примеров импортов:** ~100-150
- **API endpoints:** ~20-30
- **Команд:** ~30-40

**Время:** 2-3 часа работы

**Результат:** Полная согласованность документации при любых изменениях

---

**Создано**: 2025-01-19  
**Статус**: Анализ завершён, готов к внедрению
