# Обработка ошибок в Application Layer

Практическое руководство по обработке ошибок в Command/Query Handlers с использованием монад, ErrorClassifier и базовых паттернов для переиспользования логики.

> 📖 **Теория:** См. [ERROR_HANDLING.md](./ERROR_HANDLING.md) для понимания иерархии ошибок по слоям  
> 📖 **Монады:** См. [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) для понимания Either Pattern  
> 📖 **Валидация:** См. [SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md) для Specification Pattern

---

## 📋 Содержание

1. [Проблема контекстно-зависимых ошибок](#1-проблема-контекстно-зависимых-ошибок)
2. [Классификация ошибок БЕЗ instanceof](#2-классификация-ошибок-без-instanceof)
3. [ErrorClassifier - утилита классификации](#3-errorclassifier---утилита-классификации)
4. [BaseCommandHandler - переиспользуемые методы](#4-basecommandhandler---переиспользуемые-методы)
5. [Практические примеры](#5-практические-примеры)
6. [Логирование](#6-логирование)
7. [Интеграция с Presentation Layer](#7-интеграция-с-presentation-layer)
8. [Тестирование](#8-тестирование)

---

## 1. Проблема контекстно-зависимых ошибок

### 1.1. Одна проверка - разные контексты

**Проблема:** Одна и та же проверка может быть **разной ошибкой** в разных контекстах!

#### Пример: Проверка существования ресурса [#code]

```typescript
// ==================== КОНТЕКСТ 1: CREATE - существование это ПЛОХО ====================

class CreateResourceCommandHandler {
  async handle(cmd: CreateResourceCommand): Promise<Validation<Error[], Resource>> {
    // Проверяем существование
    const existingResult = await this.repo.findByName(name)
    
    // Если нашли - это ОШИБКА для CREATE!
    if (existingResult.isRight() && existingResult.value !== null) {
      return invalid([
        new DuplicateResourceError(`Resource "${cmd.name}" already exists`)
      ])
    }
    
    // Создаем новый ресурс...
  }
}

// ==================== КОНТЕКСТ 2: UPDATE - НЕ существование это ПЛОХО ====================

class UpdateResourceCommandHandler {
  async handle(cmd: UpdateResourceCommand): Promise<Validation<Error[], Resource>> {
    // Проверяем существование
    const existingResult = await this.repo.findById(cmd.id)
    
    // Если НЕ нашли - это ОШИБКА для UPDATE!
    if (existingResult.isRight() && existingResult.value === null) {
      return invalid([
        new ResourceNotFoundError(`Resource ${cmd.id} not found`)
      ])
    }
    
    // Обновляем существующий ресурс...
  }
}
```

### 1.2. Repository может вернуть разные типы ошибок

#### Что может вернуть Repository [#code]

```typescript
// Repository возвращает:
type FindResult = Validation<Error[], Resource | null>

// Возможные ошибки в Left:
// 1. ResourceNotFoundError (domain) - операционная, показываем пользователю
// 2. NetworkError (infrastructure) - НЕ операционная, НЕ показываем!
// 3. DatabaseError (infrastructure) - НЕ операционная, НЕ показываем!
// 4. UnknownError - баг, логируем с stack trace
```

#### ❌ Неправильный подход [#code]

```typescript
class CreateResourceCommandHandler {
  async handle(cmd: CreateResourceCommand): Promise<Validation<Error[], Resource>> {
    const existingResult = await this.repo.findByName(name)
    
    // ❌ НЕПРАВИЛЬНО! Возвращаем ЛЮБУЮ ошибку!
    if (existingResult.isLeft()) {
      return existingResult  // Может быть NetworkError!
    }
    
    // Что если сеть упала? Мы НЕ ЗНАЕМ есть ли дубликат!
    // Но продолжаем создавать ресурс - это БАГ!
  }
}
```

**Проблемы:**
1. ❌ Если NetworkError - мы НЕ знаем есть ли дубликат
2. ❌ Нельзя продолжать выполнение команды
3. ❌ Нельзя создавать ресурс без проверки дубликата
4. ❌ Возвращаем infrastructure ошибку пользователю (не должны!)

---

## 2. Классификация ошибок БЕЗ instanceof

### 2.1. Проблема с instanceof

#### ❌ Хрупкий код с instanceof [#code]

```typescript
// ❌ ПРОБЛЕМА 1: Magic strings, нужно помнить все типы
const hasInfrastructureError = errors.some(e => 
  e instanceof NetworkError ||           // Что если добавим новый тип?
  e instanceof DatabaseError ||          // Нужно обновить ВЕЗДЕ!
  e instanceof ExternalServiceError      // Легко забыть!
)

// ❌ ПРОБЛЕМА 2: Дублирование в каждом handler
class CreateResourceCommandHandler {
  async handle(cmd: CreateResourceCommand) {
    const result = await this.repo.findByName(name)
    
    if (result.isLeft()) {
      // Копипаста этого кода в КАЖДОМ handler!
      const errors = result.value
      const operational = errors.filter(e => e.isOperational)
      const infrastructure = errors.filter(e => !e.isOperational)
      
      if (infrastructure.length > 0) {
        return invalid([new ApplicationError('Service error')])
      }
    }
  }
}
```

### 2.2. ✅ Решение: isOperational + code fields

См. полный код базовых классов ошибок в [ERROR_HANDLING.md](./ERROR_HANDLING.md#структура).

**Ключевые поля:**
- `isOperational: boolean` - операционная (true) или infrastructure (false)
- `code: string` - код ошибки для программной обработки
- `severity: 'low' | 'medium' | 'high'` - уровень для логирования
- `cause?: Error[]` - вложенные ошибки

---

## 3. ErrorClassifier - утилита классификации

### 3.1. Типы классификации

#### ErrorClassification types [#interface:ErrorClassification|#code]

```typescript
/**
 * Результат классификации ошибок
 */
export type ErrorClassification = {
  /** Операционные ошибки (показываем пользователю) */
  operational: AppError[]
  
  /** Инфраструктурные ошибки (логируем, не показываем) */
  infrastructure: AppError[]
  
  /** Неизвестные ошибки (баги, логируем с stack trace) */
  unknown: Error[]
}

/**
 * Результат быстрой проверки наличия ошибок
 */
export type ErrorCheckResult = {
  hasInfrastructureErrors: boolean
  hasOperationalErrors: boolean
  hasUnknownErrors: boolean
  hasAnyErrors: boolean
  classification: ErrorClassification
}
```

### 3.2. ErrorClassifier - основные методы

#### ErrorClassifier API [#class:ErrorClassifier|#code]

```typescript
/**
 * Утилита для классификации и работы с ошибками
 * 
 * Файл: src/shared/errors/ErrorClassifier.ts
 */
export class ErrorClassifier {
  // Классифицирует ошибки по типам БЕЗ instanceof
  static classify(errors: Error[]): ErrorClassification
  
  // Проверяет наличие + классификация
  static check(errors: Error[]): ErrorCheckResult
  
  // Быстрые проверки
  static hasInfrastructureErrors(errors: Error[]): boolean
  static hasOperationalErrors(errors: Error[]): boolean
  
  // Извлечение по типу
  static getInfrastructure(errors: Error[]): AppError[]
  static getOperational(errors: Error[]): AppError[]
  
  // Generic сообщение для пользователя
  static getUserMessage(errors: Error[]): string
  
  // Логирование с правильными уровнями
  static log(errors: Error[], logger: ILogger, context: string): void
}
```

> 📄 **Полный код:** См. [ERROR_CLASSIFIER_REFERENCE.md](./ERROR_CLASSIFIER_REFERENCE.md)

### 3.3. Примеры использования ErrorClassifier

#### Пример 1: Простая проверка [#code]

```typescript
const result = await this.repo.findByName(name)

if (result.isLeft()) {
  // ✅ Один вызов вместо 10 строк!
  const errorCheck = ErrorClassifier.check(result.value)
  
  if (errorCheck.hasInfrastructureErrors) {
    // Логируем и возвращаем generic
    ErrorClassifier.log(result.value, this.logger, 'find resource')
    return invalid([
      new GenericApplicationError('Cannot verify duplicates: service error')
    ])
  }
  
  // Только operational - можем продолжать или вернуть
}
```

#### Пример 2: Классификация [#code]

```typescript
const result = await this.repo.save(resource)

if (result.isLeft()) {
  const { operational, infrastructure, unknown } = ErrorClassifier.classify(result.value)
  
  if (infrastructure.length > 0) {
    this.logger.error('Infrastructure errors', { errors: infrastructure })
    return invalid([new GenericApplicationError('Service error')])
  }
  
  if (unknown.length > 0) {
    this.logger.error('Unknown errors', { errors: unknown })
    return invalid([new GenericApplicationError('Unexpected error')])
  }
  
  // Только operational - пробрасываем
  return result
}
```

---

## 4. BaseCommandHandler - переиспользуемые методы

### 4.1. Базовый класс для Command Handlers

#### BaseCommandHandler API [#class:BaseCommandHandler|#code]

```typescript
/**
 * Базовый класс для Command Handlers с общей логикой обработки ошибок
 * 
 * Файл: src/application/shared/BaseCommandHandler.ts
 */
export abstract class BaseCommandHandler {
  protected readonly logger: ILogger
  
  constructor(logger: ILogger) {
    super(logger)
  }
  
  // Проверка infrastructure ошибок
  protected checkInfrastructureErrors(
    errors: Error[],
    operation: string
  ): Validation<Error[], never> | null
  
  // Трансформация Domain → Application
  protected transformDomainErrors(
    result: Validation<Error[], never>,
    operation: string
  ): Validation<Error[], never>
  
  // Обработка результата Repository
  protected handleRepositoryResult<T>(
    result: Validation<Error[], T>,
    operation: string
  ): Validation<Error[], T> | null
  
  // Вспомогательные методы логирования
  protected logCommandExecution(commandName: string, context?: Record<string, unknown>): void
  protected logCommandSuccess(commandName: string, result?: unknown): void
}
```

> 📄 **Полный код:** См. [BASE_HANDLERS_REFERENCE.md](./BASE_HANDLERS_REFERENCE.md)

### 4.2. Шаблон использования

#### Как использовать BaseCommandHandler [#code]

```typescript
class MyCommandHandler extends BaseCommandHandler {
  constructor(
    private readonly repo: IRepository,
    logger: ILogger
  ) {
    super(logger)
  }
  
  async handle(cmd: MyCommand): Promise<Validation<Error[], Result>> {
    // 1. Проверка чего-то в Repository
    const checkResult = await this.repo.findSomething()
    
    if (checkResult.isLeft()) {
      // ✅ Один вызов!
      const error = this.checkInfrastructureErrors(checkResult.value, 'find something')
      if (error !== null) return error
    }
    
    // 2. Domain операция
    const domainResult = DomainEntity.create(...)
    
    if (domainResult.isLeft()) {
      // ✅ Один вызов!
      return this.transformDomainErrors(domainResult, 'create entity')
    }
    
    // 3. Сохранение
    const saveResult = await this.repo.save(domainResult.value)
    
    // ✅ Один вызов!
    const error = this.handleRepositoryResult(saveResult, 'save entity')
    if (error !== null) return error
    
    return saveResult
  }
}
```

---

## 5. Практические примеры

### 5.1. CreateResourceCommandHandler

#### Полный пример CREATE [#class:CreateResourceCommandHandler|#code]

```typescript
import { BaseCommandHandler } from '@/application/shared/BaseCommandHandler'
import { ResourceName, Namespace, Resource } from '@/domain'
import { DuplicateResourceError } from '@/domain/shared/errors'
import { CommandValidationError } from '@/application/errors'
import type { IResourceRepository } from '@/domain/repositories'
import type { ILogger } from '@/application/ports'
import type { Validation } from '@/shared/validation'
import { combine, invalid, valid } from '@sweet-monads/either'

export class CreateResourceCommandHandler extends BaseCommandHandler {
  constructor(
    private readonly repo: IResourceRepository,
    logger: ILogger
  ) {
    super(logger)
  }
  
  async handle(cmd: CreateResourceCommand): Promise<Validation<Error[], Resource>> {
    this.logCommandExecution('CreateResourceCommand', { name: cmd.name })
    
    // 1. Валидация Value Objects
    const validationResult = this.validateCommand(cmd)
    if (validationResult.isLeft()) return validationResult
    
    const [name, namespace] = validationResult.value
    
    // 2. Проверка дубликатов
    const duplicateCheck = await this.checkDuplicates(name)
    if (duplicateCheck.isLeft()) return duplicateCheck
    
    // 3. Создание агрегата
    const resourceResult = Resource.create(name, namespace, cmd.secret)
    if (resourceResult.isLeft()) {
      return this.transformDomainErrors(resourceResult, 'create resource')
    }
    
    // 4. Сохранение
    const saveResult = await this.repo.save(resourceResult.value)
    const error = this.handleRepositoryResult(saveResult, 'save resource')
    if (error !== null) return error
    
    this.logCommandSuccess('CreateResourceCommand')
    return saveResult
  }
  
  private validateCommand(
    cmd: CreateResourceCommand
  ): Validation<Error[], [ResourceName, Namespace]> {
    const nameResult = ResourceName.create(cmd.name)
    const namespaceResult = Namespace.create(cmd.namespace)
    
    const result = combine([nameResult, namespaceResult])
    
    if (result.isLeft()) {
      return result.mapLeft(errors =>
        errors.map(e => new CommandValidationError(e.message))
      )
    }
    
    return result
  }
  
  private async checkDuplicates(
    name: ResourceName
  ): Validation<Error[], null> {
    const existingResult = await this.repo.findByName(name)
    
    if (existingResult.isLeft()) {
      // ✅ Проверяем infrastructure ошибки
      const error = this.checkInfrastructureErrors(
        existingResult.value,
        'verify duplicates'
      )
      if (error !== null) return error
      
      // Только operational - OK для CREATE (значит дубликата нет)
      this.logger.debug('No duplicate found')
      return valid(null)
    }
    
    // Нашли существующий - ОШИБКА для CREATE!
    if (existingResult.value !== null) {
      return invalid([
        new DuplicateResourceError(`Resource "${name.getValue()}" already exists`)
      ])
    }
    
    return valid(null)
  }
}
```

### 5.2. UpdateResourceCommandHandler

#### Полный пример UPDATE [#class:UpdateResourceCommandHandler|#code]

```typescript
import { BaseCommandHandler } from '@/application/shared/BaseCommandHandler'
import { ResourceId, ResourceName, Resource } from '@/domain'
import { ResourceNotFoundError } from '@/domain/shared/errors'
import type { Validation } from '@/shared/validation'
import { invalid, valid } from '@sweet-monads/either'

export class UpdateResourceCommandHandler extends BaseCommandHandler {
  constructor(
    private readonly repo: IResourceRepository,
    logger: ILogger
  ) {
    super(logger)
  }
  
  async handle(cmd: UpdateResourceCommand): Promise<Validation<Error[], Resource>> {
    this.logCommandExecution('UpdateResourceCommand', { id: cmd.id })
    
    // 1. Валидация ID
    const idResult = ResourceId.create(cmd.id)
    if (idResult.isLeft()) {
      return this.transformDomainErrors(idResult, 'validate resource id')
    }
    
    // 2. Поиск существующего ресурса
    const resourceResult = await this.findExistingResource(idResult.value)
    if (resourceResult.isLeft()) return resourceResult
    
    const resource = resourceResult.value
    
    // 3. Валидация нового имени
    if (cmd.newName) {
      const nameResult = ResourceName.create(cmd.newName)
      if (nameResult.isLeft()) {
        return this.transformDomainErrors(nameResult, 'validate new name')
      }
      
      // 4. Обновление имени
      const updateResult = resource.updateName(nameResult.value)
      if (updateResult.isLeft()) {
        return this.transformDomainErrors(updateResult, 'update resource name')
      }
    }
    
    // 5. Сохранение
    const saveResult = await this.repo.save(resource)
    const error = this.handleRepositoryResult(saveResult, 'save updated resource')
    if (error !== null) return error
    
    this.logCommandSuccess('UpdateResourceCommand')
    return saveResult
  }
  
  private async findExistingResource(
    id: ResourceId
  ): Validation<Error[], Resource> {
    const result = await this.repo.findById(id)
    
    if (result.isLeft()) {
      // ✅ Проверяем infrastructure ошибки
      const error = this.checkInfrastructureErrors(result.value, 'find resource')
      if (error !== null) return error
      
      // Только operational - пробрасываем
      return result
    }
    
    // Не нашли - ОШИБКА для UPDATE!
    if (result.value === null) {
      return invalid([
        new ResourceNotFoundError(`Cannot update: resource ${id.getValue()} not found`)
      ])
    }
    
    return valid(result.value)
  }
}
```

---

## 6. Логирование

### 6.1. Правила логирования

#### Что логировать [#code]

```typescript
// ✅ ЛОГИРУЕМ:
// 1. Infrastructure ошибки - уровень ERROR
// 2. Unknown ошибки - уровень ERROR + stack trace
// 3. Выполнение команд - уровень INFO
// 4. Успех команд - уровень INFO

// ❌ НЕ ЛОГИРУЕМ как ERROR:
// 1. Operational ошибки (они идут пользователю) - только INFO/WARN
// 2. Валидационные ошибки (они идут пользователю) - только INFO
```

### 6.2. Использование ErrorClassifier.log()

#### Автоматическое логирование [#code]

```typescript
const result = await this.repo.save(resource)

if (result.isLeft()) {
  // ✅ Автоматическое логирование с правильными уровнями
  ErrorClassifier.log(result.value, this.logger, 'save resource')
  
  // Теперь обрабатываем...
  const errorCheck = ErrorClassifier.check(result.value)
  
  if (errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors) {
    return invalid([new GenericApplicationError('Service error')])
  }
  
  return result
}
```

---

## 7. Интеграция с Presentation Layer

### 7.1. Разделение в React Router Action

#### Пример обработки в Action [#code]

```typescript
import { ErrorClassifier } from '@/shared/errors/ErrorClassifier'
import { commands } from '@/composition'
import { redirect, json } from 'react-router'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  
  const result = await commands.resources.create({
    name: formData.get('name') as string,
    namespace: formData.get('namespace') as string,
    secret: formData.get('secret') as string
  })
  
  if (result.isLeft()) {
    // ✅ Используем ErrorClassifier
    const { operational, infrastructure, unknown } = ErrorClassifier.classify(result.value)
    
    // Логируем технические
    if (infrastructure.length > 0 || unknown.length > 0) {
      console.error('Technical errors:', { infrastructure, unknown })
    }
    
    // Показываем пользователю
    if (operational.length > 0) {
      return json({
        errors: operational.map(e => ({
          code: e.code,
          message: e.message
        }))
      }, { status: 400 })
    }
    
    // Только технические - generic
    return json({
      error: 'Service temporarily unavailable. Please try again later.'
    }, { status: 503 })
  }
  
  return redirect(`/resources/${result.value.id.getValue()}`)
}
```

---

## 8. Тестирование

### 8.1. Тесты для ErrorClassifier

#### Пример unit тестов [#code]

```typescript
import { describe, it, expect } from 'vitest'
import { ErrorClassifier } from '../ErrorClassifier'
import { InvariantViolationError } from '@/domain/shared/errors'
import { NetworkError } from '@/infrastructure/errors'

describe('ErrorClassifier', () => {
  describe('classify()', () => {
    it('should classify operational errors', () => {
      const errors = [
        new InvariantViolationError('Invalid value'),
        new Error('Unknown error')
      ]
      
      const result = ErrorClassifier.classify(errors)
      
      expect(result.operational).toHaveLength(1)
      expect(result.infrastructure).toHaveLength(0)
      expect(result.unknown).toHaveLength(1)
    })
  })
  
  describe('check()', () => {
    it('should return correct flags', () => {
      const errors = [
        new NetworkError('Connection failed'),
        new InvariantViolationError('Invalid')
      ]
      
      const result = ErrorClassifier.check(errors)
      
      expect(result.hasInfrastructureErrors).toBe(true)
      expect(result.hasOperationalErrors).toBe(true)
    })
  })
})
```

---

## 🎯 Итого

### Ключевые паттерны

1. ✅ **isOperational вместо instanceof** - надежно, масштабируемо
2. ✅ **ErrorClassifier** - инкапсулирует всю логику классификации
3. ✅ **BaseCommandHandler** - переиспользуемые методы для handlers
4. ✅ **Контекстная трансформация** - разные ошибки в разных контекстах
5. ✅ **Логирование только infrastructure** - operational идут пользователю

### Что получили

- 🚀 **Нет дублирования** - пишем один раз, используем везде
- 🎯 **Type-safe** - TypeScript проверяет типы
- 🧪 **Легко тестировать** - можно mock ErrorClassifier
- 📦 **DRY** - вся логика в одном месте
- 🔧 **Легко расширять** - добавляем новые типы ошибок

---

## 📚 Связанные документы

- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - иерархия ошибок
- [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) - монады и Either Pattern
- [ERROR_CLASSIFIER_REFERENCE.md](./ERROR_CLASSIFIER_REFERENCE.md) - полный код ErrorClassifier
- [BASE_HANDLERS_REFERENCE.md](./BASE_HANDLERS_REFERENCE.md) - полный код BaseCommandHandler
- [ARCHITECTURE_BOUNDARIES.md](../ARCHITECTURE_BOUNDARIES.md) - монады в CORE
