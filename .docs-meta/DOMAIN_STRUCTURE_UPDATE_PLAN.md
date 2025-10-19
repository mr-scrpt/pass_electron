# План обновления структуры Domain Layer

**Дата**: 2025-01-18  
**Статус**: В процессе

## ✅ Принятая структура

```
src/domain/
├── resource/                  # Bounded Context
│   ├── aggregates/
│   │   └── Resource.ts
│   ├── entities/
│   │   └── CustomField.ts
│   ├── value-objects/
│   │   ├── ResourceId.ts
│   │   ├── Namespace.ts
│   │   └── ResourceName.ts
│   ├── repositories/
│   │   └── IResourceRepository.ts
│   ├── events/
│   │   ├── ResourceCreated.ts
│   │   └── ResourceUpdated.ts
│   └── index.ts
│
├── user/                      # Bounded Context
│   └── ...
│
├── shared/                    # Shared Kernel
│   ├── errors/
│   │   ├── DomainError.ts
│   │   ├── InvariantViolationError.ts
│   │   └── index.ts
│   ├── invariants/
│   │   ├── UuidInvariant.ts
│   │   └── index.ts
│   ├── base/                  # Базовые классы/интерфейсы
│   │   ├── IRepository.ts
│   │   ├── DomainEvent.ts
│   │   └── index.ts
│   └── index.ts
│
└── index.ts
```

## 📋 Файлы требующие обновления

### 1. Основная документация

#### docs/PROJECT_STRUCTURE.md
- [ ] Обновить раздел "Domain Layer"
- [ ] Добавить подпапки aggregates/, entities/, value-objects/
- [ ] Добавить shared/base/ для базовых классов
- [ ] Обновить примеры импортов

#### docs/TYPES_AND_ENTITIES.md
- [ ] Обновить раздел "Структура типов в Domain Layer"
- [ ] Показать новую структуру с подпапками
- [ ] Обновить примеры расположения файлов

#### docs/DDD_AND_CLEAN_ARCHITECTURE.md
- [ ] Проверить примеры структуры Domain Layer
- [ ] Обновить если есть упоминания структуры

#### docs/ARCHITECTURE_BOUNDARIES.md
- [ ] Проверить примеры импортов из domain
- [ ] Обновить если нужно

### 2. Инструкции (steps/)

#### steps/step_1/README.md
- [ ] **КРИТИЧНО** - Обновить все пути к файлам
- [ ] Изменить `src/domain/resource/ResourceId.ts` на `src/domain/resource/value-objects/ResourceId.ts`
- [ ] Изменить `src/domain/resource/Namespace.ts` на `src/domain/resource/value-objects/Namespace.ts`
- [ ] Изменить `src/domain/resource/ResourceName.ts` на `src/domain/resource/value-objects/ResourceName.ts`
- [ ] Добавить создание подпапок aggregates/, entities/, value-objects/
- [ ] Обновить все примеры импортов

### 3. Примеры импортов по всей документации

**Старые импорты (нужно найти и заменить):**
```typescript
import { ResourceId } from './ResourceId'  // Внутри resource/
import { Resource } from '@/domain/resource/Resource'  // Прямой импорт файла
```

**Новые импорты:**
```typescript
// Внутри domain/resource/
import { ResourceId } from './value-objects/ResourceId'
import { Resource } from './aggregates/Resource'
import { CustomField } from './entities/CustomField'

// Снаружи (через Public API)
import { Resource, ResourceId, Namespace } from '@/domain/resource'
import { DomainError } from '@/domain/shared/errors'
import { IRepository } from '@/domain/shared/base'
```

## 🔍 Поиск упоминаний

### Команды для поиска:

```bash
# Найти все упоминания domain/resource/ без подпапок
grep -r "domain/resource/Resource" docs/ steps/

# Найти все упоминания domain/shared без /base
grep -r "domain/shared" docs/ steps/ | grep -v "errors" | grep -v "invariants"

# Найти импорты из domain
grep -r "from '@/domain" docs/ steps/
grep -r "from './Resource" docs/ steps/
```

## ✅ Ключевые изменения

### 1. Bounded Context = Автономный модуль

Каждый модуль содержит ВСЁ необходимое:
- Свои Aggregates
- Свои Entities  
- Свои Value Objects
- Свои Repository интерфейсы
- Свои Domain Events

### 2. Shared Kernel = Минимальный

В `shared/` только действительно общее:
- Базовые ошибки
- Переиспользуемые инварианты
- Базовые классы/интерфейсы (в `base/`)

### 3. Нет путаницы

Бизнес-домены (resource, user) НЕ смешиваются с техническими концепциями (shared).

## 📊 Прогресс

- [x] Анализ структуры (DOMAIN_LAYER_STRUCTURE_ANALYSIS.md)
- [x] Финальное решение принято
- [ ] docs/PROJECT_STRUCTURE.md
- [ ] docs/TYPES_AND_ENTITIES.md
- [ ] steps/step_1/README.md
- [ ] Все примеры импортов
- [ ] Итоговый отчет

## 🎯 Следующие шаги

1. Обновить PROJECT_STRUCTURE.md
2. Обновить TYPES_AND_ENTITIES.md
3. Обновить steps/step_1/README.md (самый важный!)
4. Найти и обновить все примеры импортов
5. Создать итоговый отчет об изменениях
