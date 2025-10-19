# Command Bus Pattern - Паттерн Командной Шины `#command-bus` `#cqrs` `#hexagonal-architecture`

Документ описывает использование Command Bus паттерна для изоляции бизнес-логики от UI-специфичных действий в соответствии с DDD и Hexagonal Architecture.

## Содержание

1. [Зачем нужен Command Bus](#зачем-нужен-command-bus)
2. [DDD и Hexagonal Architecture](#ddd-и-hexagonal-architecture)
3. [Архитектура](#архитектура)
4. [Реализация](#реализация)
5. [Использование](#использование)
6. [Best Practices](#best-practices)

---

## Зачем нужен Command Bus

### Проблема без Command Bus [#code|#structure:path]

```typescript
// ❌ ПРОБЛЕМА: Core System зависит от Browser API
// app/core/keymap/keymaps/resource.ts

import { Keymap } from '../types';

export const resourceKeymaps: Keymap[] = [
  {
    id: 'resource-delete',
    action: () => {
      // Прямая зависимость от DOM API
      window.dispatchEvent(new CustomEvent('delete-resource', {
        detail: { resourceId: '123' }
      }));
    }
  }
];
```

**Что не так:**
- 🚫 Keymaps (Core System) зависит от Browser API (Infrastructure)
- 🚫 Нарушается Hexagonal Architecture (нет изоляции через Port)
- 🚫 Сложно тестировать (нужен DOM environment)
- 🚫 Невозможно заменить механизм коммуникации
- 🚫 Нет type-safety для команд

### Решение: Command Bus

Command Bus - это посредник между Core Systems и UI Layer, который:
- ✅ Изолирует бизнес-логику от UI реализации
- ✅ Предоставляет type-safe контракт через Commands
- ✅ Легко тестируется (mock CommandBus)
- ✅ Соответствует DDD и Hexagonal Architecture

---

## DDD и Hexagonal Architecture

### Command Bus в DDD

**Command** - это объект, выражающий намерение выполнить действие (Ubiquitous Language):
- `DeleteResourceCommand` - удалить ресурс
- `NavigateToCommand` - перейти на страницу
- `ShowNotificationCommand` - показать уведомление

**Command Handler** - это обработчик команды в Application Layer (CQRS - Write side).

**Command Bus** - это координатор, связывающий Commands с Handlers.

Паттерн описан в:
- Eric Evans "Domain-Driven Design" (2003)
- Vaughn Vernon "Implementing Domain-Driven Design" (2013)
- Microsoft ".NET Microservices Architecture" (CQRS pattern)

### Command Bus в Hexagonal Architecture

#### Port - интерфейс [#interface:ICommandBus|#code]

**Port** (интерфейс) - определяет ЧТО нужно Application Core:

```typescript
interface ICommandBus {
  dispatch<T extends ICommand>(command: T): Promise<void>;
}
```

#### Adapter - реализация [#class:InMemoryCommandBus|#code]

**Adapter** (реализация) - определяет КАК это сделать:

```typescript
class InMemoryCommandBus implements ICommandBus {
  // Конкретная реализация
}
```

**Правило:** Ports принадлежат Application Core, Adapters - Infrastructure.

```
┌─────────────────────────────────────────┐
│     Application Core                    │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  ICommandBus (Port)            │←────┼─── Core Systems используют
│  └────────────────────────────────┘     │
│                                          │
│  Commands: DeleteResourceCommand, etc.  │
└──────────────┬──────────────────────────┘
               │ implements
┌──────────────▼──────────────────────────┐
│     Infrastructure                       │
│                                          │
│  InMemoryCommandBus (Adapter)           │
│    - dispatch() реализация              │
│    - handlers registry                  │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│     Presentation Layer                   │
│                                          │
│  Command Handlers                        │
│    - DeleteResourceHandler               │
│    - NavigateToHandler                   │
└──────────────────────────────────────────┘
```

---

## Архитектура

### Структура слоев [#structure:tree]

```
app/
├── composition/                    # Composition Root #structure:
│   └── ServiceContainer.ts         # Создает CommandBus #class:ServiceContainer
│
├── application/                    # Application Layer #structure:
│   └── commands/                   # Commands & Ports #structure:
│       ├── ICommandBus.ts          # Port (интерфейс) #interface:ICommandBus
│       ├── ICommand.ts             # Базовый интерфейс команды #interface:ICommand
│       ├── ICommandHandler.ts      # Интерфейс обработчика #interface:ICommandHandler
│       ├── UICommands.ts           # Конкретные команды
│       └── index.ts
│
├── infrastructure/                 # Infrastructure Layer #structure:
│   └── commands/                   # Adapters #structure:
│       ├── InMemoryCommandBus.ts   # Реализация CommandBus #class:InMemoryCommandBus
│       └── index.ts
│
├── core/                          # Core Systems
│   └── keymap/
│       └── keymaps/
│           └── resource.ts         # Использует ICommandBus
│
└── routes/                        # Presentation Layer
    └── resources.$id.tsx           # Регистрирует Handlers
```

### Направление зависимостей

```
Core Systems (keymap)
    ↓ использует через ActionContext
ICommandBus (Port в Application)
    ↑ implements
InMemoryCommandBus (Adapter в Infrastructure)
    ↓ вызывает
Command Handlers (Presentation)
```

**Все зависимости направлены внутрь (к Application Core)** ✅

---

## Реализация

### 1. Ports (Application Layer)

#### ICommand - базовый интерфейс [#interface:ICommand|#code|#structure:path]

```typescript
/**
 * Базовый интерфейс для всех команд
 */
export interface ICommand {
  readonly type: string;
}
```

#### ICommandHandler - обработчик команды [#interface:ICommandHandler|#code|#structure:path]

```typescript
import type { ICommand } from './ICommand';

/**
 * Обработчик команды
 */
export interface ICommandHandler<T extends ICommand> {
  handle(command: T): Promise<void> | void;
}
```

#### ICommandBus - шина команд [#interface:ICommandBus|#code|#structure:path]

```typescript
import type { ICommand } from './ICommand';
import type { ICommandHandler } from './ICommandHandler';

/**
 * Command Bus - посредник между Core Systems и UI
 * 
 * Port (интерфейс) определяет ЧТО нужно Application Core.
 * Adapter (реализация) определяет КАК это сделать.
 */
export interface ICommandBus {
  /**
   * Отправить команду на выполнение
   */
  dispatch<T extends ICommand>(command: T): Promise<void>;
  
  /**
   * Зарегистрировать обработчик для типа команды
   */
  register<T extends ICommand>(
    commandType: string,
    handler: ICommandHandler<T>
  ): void;
  
  /**
   * Отменить регистрацию обработчика
   */
  unregister(commandType: string): void;
}
```

#### UI Команды [#class:DeleteResourceCommand|#class:NavigateToCommand|#class:ShowNotificationCommand|#class:CopyToClipboardCommand|#code|#structure:path]

```typescript
import type { ICommand } from './ICommand';

/**
 * Команда: Удалить ресурс
 */
export class DeleteResourceCommand implements ICommand {
  readonly type = 'DeleteResourceCommand';
  
  constructor(public readonly resourceId: string) {}
}

/**
 * Команда: Навигация на страницу
 */
export class NavigateToCommand implements ICommand {
  readonly type = 'NavigateToCommand';
  
  constructor(public readonly path: string) {}
}

/**
 * Команда: Показать уведомление
 */
export class ShowNotificationCommand implements ICommand {
  readonly type = 'ShowNotificationCommand';
  
  constructor(
    public readonly message: string,
    public readonly level: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) {}
}

/**
 * Команда: Копировать в буфер обмена
 */
export class CopyToClipboardCommand implements ICommand {
  readonly type = 'CopyToClipboardCommand';
  
  constructor(public readonly text: string) {}
}
```

#### Public API для Commands [#code|#structure:path]

```typescript
export type { ICommand } from './ICommand';
export type { ICommandHandler } from './ICommandHandler';
export type { ICommandBus } from './ICommandBus';
export * from './UICommands';
```

---

### 2. Adapter (Infrastructure Layer)

#### InMemoryCommandBus - реализация [#class:InMemoryCommandBus|#code|#structure:path]

```typescript
import type { 
  ICommandBus, 
  ICommand, 
  ICommandHandler 
} from '@/application/commands';

/**
 * In-Memory реализация Command Bus
 * 
 * Adapter: реализует Port (ICommandBus)
 * Выполняет команды синхронно в том же процессе
 */
export class InMemoryCommandBus implements ICommandBus {
  private handlers = new Map<string, ICommandHandler<any>>();
  
  register<T extends ICommand>(
    commandType: string,
    handler: ICommandHandler<T>
  ): void {
    if (this.handlers.has(commandType)) {
      console.warn(`Handler for command ${commandType} already registered. Overwriting.`);
    }
    this.handlers.set(commandType, handler);
  }
  
  unregister(commandType: string): void {
    this.handlers.delete(commandType);
  }
  
  async dispatch<T extends ICommand>(command: T): Promise<void> {
    const handler = this.handlers.get(command.type);
    
    if (!handler) {
      console.warn(`No handler registered for command: ${command.type}`);
      return;
    }
    
    try {
      await handler.handle(command);
    } catch (error) {
      console.error(`Error handling command ${command.type}:`, error);
      throw error;
    }
  }
}
```

#### Public API для Infrastructure Commands [#code|#structure:path]

```typescript
export { InMemoryCommandBus } from './InMemoryCommandBus';
```

---

### 3. Composition Root

#### Регистрация CommandBus [#code|#structure:path]

```typescript
import { InMemoryCommandBus } from '@/infrastructure/commands';
import type { ICommandBus } from '@/application/commands';

class ServiceContainer {
  private static commandBus: ICommandBus | null = null;
  
  /**
   * Получить CommandBus (Singleton)
   */
  static getCommandBus(): ICommandBus {
    if (!this.commandBus) {
      this.commandBus = new InMemoryCommandBus();
    }
    return this.commandBus;
  }
  
  // ... другие сервисы
}

export const getCommandBus = () => ServiceContainer.getCommandBus();
```

---

## Использование

### 1. В Core Systems (Keymaps)

#### Определение Keymap с CommandBus [#code|#structure:path]

```typescript
import type { ICommandBus } from '@/application/commands';

export interface ActionContext {
  mode: AppMode;
  route: string;
  editingContext?: EditingContext;
  
  // Зависимости (Dependency Injection)
  commandBus?: ICommandBus;           // ✅ Добавлено
  modalManager?: ModalManager;
  focusManager?: FocusManager;
  notificationManager?: NotificationManager;
}
```

#### Пример Keymap с командами [#code|#structure:path]

```typescript
import { Keymap } from '../types';
import { 
  DeleteResourceCommand,
  ShowNotificationCommand 
} from '@/application/commands';

/**
 * ✅ ПРАВИЛЬНО: Использует CommandBus через абстракцию
 */
export const resourceKeymaps: Keymap[] = [
  {
    id: 'resource-delete',
    name: 'Delete Resource',
    binding: { key: 'd', shift: true },
    action: async (ctx) => {
      if (!confirm('Delete this resource?')) return;
      
      const resourceId = ctx.editingContext?.resourceId;
      if (!resourceId) return;
      
      // ✅ Через ICommandBus (Port)
      await ctx.commandBus?.dispatch(
        new DeleteResourceCommand(resourceId)
      );
    },
    description: 'Delete resource',
    modes: ['navigation'],
    routes: ['/resources/:id']
  }
];
```

---

### 2. В KeymapExecutor (передача CommandBus)

#### KeymapExecutor с CommandBus [#code|#structure:path]

```typescript
import type { ICommandBus } from '@/application/commands';

export class KeymapExecutor {
  constructor(
    private registry: KeymapRegistry,
    private modalManager: ModalManager,
    private focusManager: FocusManager,
    private notificationManager: NotificationManager,
    private commandBus: ICommandBus  // ✅ Добавлено
  ) {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  
  private buildActionContext(): ActionContext {
    const modalContext = this.modalManager.getContext();
    
    return {
      mode: modalContext.mode,
      route: modalContext.route,
      editingContext: modalContext.editingContext || undefined,
      focusedElement: document.activeElement as HTMLElement,
      
      // Передаем зависимости
      commandBus: this.commandBus,  // ✅ Добавлено
      modalManager: this.modalManager,
      focusManager: this.focusManager,
      notificationManager: this.notificationManager
    };
  }
}
```

---

### 3. В Presentation Layer (Command Handlers)

#### Регистрация Handlers [#code|#structure:path]

```typescript
import { useEffect } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { getCommandBus } from '@/composition';
import { 
  DeleteResourceCommand,
  NavigateToCommand,
  type ICommandHandler 
} from '@/application/commands';

/**
 * Handler для удаления ресурса
 */
class DeleteResourceHandler implements ICommandHandler<DeleteResourceCommand> {
  constructor(private fetcher: any) {}
  
  async handle(command: DeleteResourceCommand): Promise<void> {
    this.fetcher.submit(
      { intent: 'delete' },
      { method: 'DELETE', action: `/resources/${command.resourceId}` }
    );
  }
}

/**
 * Handler для навигации
 */
class NavigateToHandler implements ICommandHandler<NavigateToCommand> {
  constructor(private navigate: any) {}
  
  handle(command: NavigateToCommand): void {
    this.navigate(command.path);
  }
}

export default function ResourceDetail() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  
  useEffect(() => {
    const commandBus = getCommandBus();
    
    // Регистрируем handlers
    const deleteHandler = new DeleteResourceHandler(fetcher);
    const navigateHandler = new NavigateToHandler(navigate);
    
    commandBus.register('DeleteResourceCommand', deleteHandler);
    commandBus.register('NavigateToCommand', navigateHandler);
    
    // Cleanup
    return () => {
      commandBus.unregister('DeleteResourceCommand');
      commandBus.unregister('NavigateToCommand');
    };
  }, [fetcher, navigate]);
  
  return <div>Resource Detail</div>;
}
```

---

## Best Practices

### ✅ DO: Правильные практики

#### 1. Команды как Value Objects [#code]

```typescript
   // ✅ Immutable, содержит только данные
   export class DeleteResourceCommand implements ICommand {
     readonly type = 'DeleteResourceCommand';
     constructor(public readonly resourceId: string) {}
   }
```

#### 2. Type-safe dispatch [#code]

```typescript
   // ✅ TypeScript проверяет типы
   await commandBus.dispatch(new DeleteResourceCommand('123'));
```

#### 3. Регистрация handlers в Composition Root [#code]

```typescript
   // ✅ С cleanup
   useEffect(() => {
     commandBus.register('MyCommand', handler);
     return () => commandBus.unregister('MyCommand');
   }, []);
```

#### 4. Один handler на команду [#code]

```typescript
   // ✅ Четкая ответственность
   class DeleteResourceHandler implements ICommandHandler<DeleteResourceCommand> {
     async handle(command: DeleteResourceCommand): Promise<void> {
       // Только логика удаления
     }
   }
```

#### 5. Команды именуются в повелительном наклонении [#code]

```typescript
   // ✅ Выражают намерение
   DeleteResourceCommand
   NavigateToCommand
   ShowNotificationCommand
```

---

### ❌ DON'T: Антипаттерны

#### 1. НЕ обходить CommandBus

```typescript
   // ❌ Прямой вызов DOM API
   window.dispatchEvent(new CustomEvent('delete'));
   
   // ✅ Через CommandBus
   commandBus.dispatch(new DeleteResourceCommand(id));
```

#### 2. НЕ создавать богатые команды [#code]

```typescript
   // ❌ Богатая команда с логикой
   class DeleteResourceCommand {
     constructor(public readonly resourceId: string) {}
     async handle(): Promise<void> {
       // Логика удаления
     }
   }
```

#### 3. НЕ регистрировать handlers в render [#code]

```typescript
   // ❌ Регистрация при каждом рендере
   function Component() {
     commandBus.register('MyCommand', handler);
   }
   
   // ✅ В useEffect с cleanup
   useEffect(() => {
     commandBus.register('MyCommand', handler);
     return () => commandBus.unregister('MyCommand');
   }, []);
```

#### 4. НЕ делать команды мутабельными [#code]

```typescript
   // ❌ Мутабельная команда
   class DeleteResourceCommand {
     public resourceId: string;
     constructor(resourceId: string) {
       this.resourceId = resourceId;
     }
   }
   
   // ✅ Immutable команда
   class DeleteResourceCommand {
     public readonly resourceId: string;
     constructor(resourceId: string) {
       this.resourceId = resourceId;
     }
   }
```

#### 5. НЕ игнорировать ошибки [#code]

```typescript
   // ❌ Без обработки
   await commandBus.dispatch(command);
   
   // ✅ С обработкой
   try {
     await commandBus.dispatch(command);
   } catch (error) {
     // Обработка ошибки
   }
   ```

---

## Преимущества подхода

1. **✅ Изоляция от Browser API**
   - Core Systems не зависят от DOM
   - Легко тестировать с mock CommandBus

2. **✅ Type Safety**
   - TypeScript проверяет команды
   - Автокомплит для полей команд

3. **✅ Тестируемость**
   ```typescript
   // Mock CommandBus для тестов
   const mockCommandBus: ICommandBus = {
     dispatch: jest.fn(),
     register: jest.fn(),
     unregister: jest.fn()
   };
   ```

4. **✅ Гибкость**
   - Легко заменить реализацию (WebWorker, IPC)
   - Можно добавить middleware (логирование, undo/redo)

5. **✅ Соответствие DDD + Hexagonal**
   - Commands выражают намерения (Ubiquitous Language)
   - ICommandBus - Port, InMemoryCommandBus - Adapter
   - Зависимости направлены к Application Core

---

## См. также

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура проекта
- [DATA_FLOW.md](./DATA_FLOW.md) - Поток данных
- [contracts/system-interfaces.md](./contracts/system-interfaces.md) - Интерфейсы систем
- [concepts/ARCHITECTURE_DESIGN.md](./concepts/ARCHITECTURE_DESIGN.md) - Архитектура

---

## Литература

- Eric Evans "Domain-Driven Design" (2003)
- Vaughn Vernon "Implementing Domain-Driven Design" (2013)
- Alistair Cockburn "Hexagonal Architecture" (2005)
- Microsoft ".NET Microservices Architecture" - CQRS pattern
- Martin Fowler "Command Query Separation"
