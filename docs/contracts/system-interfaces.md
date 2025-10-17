# System Interfaces - Интерфейсы систем

Контракты для всех систем приложения.

## Repository Interfaces (Domain Layer)

### IResourceRepository

```typescript
/**
 * Репозиторий для работы с ресурсами
 * Интерфейс определен в Domain Layer
 * Реализации в Infrastructure Layer
 */
interface IResourceRepository {
  /**
   * Найти ресурс по ID
   */
  findById(id: ResourceId): Promise<Resource | null>
  
  /**
   * Получить все ресурсы
   */
  findAll(): Promise<Resource[]>
  
  /**
   * Найти ресурсы по неймспейсу
   */
  findByNamespace(namespace: Namespace): Promise<Resource[]>
  
  /**
   * Поиск ресурсов по запросу
   * Ищет в namespace и name
   */
  search(query: string): Promise<Resource[]>
  
  /**
   * Сохранить ресурс (create или update)
   */
  save(resource: Resource): Promise<void>
  
  /**
   * Удалить ресурс
   */
  delete(id: ResourceId): Promise<void>
  
  /**
   * Проверить существование ресурса
   */
  exists(namespace: Namespace, name: ResourceName): Promise<boolean>
}
```

### INamespaceRepository

```typescript
/**
 * Репозиторий для работы с неймспейсами
 */
interface INamespaceRepository {
  /**
   * Получить все неймспейсы
   */
  findAll(): Promise<NamespaceInfo[]>
  
  /**
   * Найти неймспейс по имени
   */
  findByName(name: string): Promise<NamespaceInfo | null>
  
  /**
   * Получить количество ресурсов в неймспейсе
   */
  getResourceCount(namespace: string): Promise<number>
}
```

### IPasswordGeneratorService

```typescript
/**
 * Сервис для генерации паролей
 */
interface IPasswordGeneratorService {
  /**
   * Сгенерировать пароль
   */
  generate(options: PasswordGenerationOptions): Promise<GeneratedPassword>
  
  /**
   * Оценить силу пароля
   */
  assessStrength(password: string): PasswordStrength
  
  /**
   * Получить настройки по умолчанию
   */
  getDefaultOptions(): PasswordGenerationOptions
}
```

---

## Modal System

### IModalManager

```typescript
/**
 * Менеджер режимов приложения
 */
interface IModalManager {
  /**
   * Получить текущий режим
   */
  getMode(): AppMode
  
  /**
   * Получить полный контекст
   */
  getContext(): ModeContext
  
  /**
   * Установить текущий route
   */
  setRoute(route: string, params?: Record<string, string>): void
  
  /**
   * Войти в режим навигации
   */
  enterNavigationMode(): void
  
  /**
   * Войти в режим редактирования
   */
  enterEditingMode(context: EditingState): void
  
  /**
   * Получить контекст редактирования (если в режиме editing)
   */
  getEditingContext(): EditingState | null
  
  /**
   * Подписаться на изменения режима
   */
  subscribe(listener: ModeChangeListener): Unsubscribe
}

type ModeChangeListener = (context: ModeContext) => void
type Unsubscribe = () => void
```

---

## Keymap System

### IKeymapRegistry

```typescript
/**
 * Реестр кеймапов
 */
interface IKeymapRegistry {
  /**
   * Зарегистрировать кеймап
   */
  register(keymap: Keymap): void
  
  /**
   * Отменить регистрацию кеймапа
   */
  unregister(keymapId: KeymapId): void
  
  /**
   * Зарегистрировать несколько кеймапов
   */
  registerMultiple(keymaps: Keymap[]): void
  
  /**
   * Получить все активные кеймапы для контекста
   */
  getActiveKeymaps(context: ActionContext): Keymap[]
  
  /**
   * Найти кеймап по привязке клавиш
   */
  findByBinding(binding: KeyBinding, context: ActionContext): Keymap | null
  
  /**
   * Получить кеймап по ID
   */
  findById(id: KeymapId): Keymap | null
  
  /**
   * Подписаться на изменения реестра
   */
  subscribe(listener: KeymapChangeListener): Unsubscribe
}

type KeymapChangeListener = () => void
```

### IKeymapExecutor

```typescript
/**
 * Исполнитель кеймапов
 */
interface IKeymapExecutor {
  /**
   * Обработать нажатие клавиши
   */
  handleKeyDown(event: KeyboardEvent): Promise<void>
  
  /**
   * Подключить обработчик к window
   */
  attachToWindow(): Unsubscribe
  
  /**
   * Выполнить кеймап вручную
   */
  execute(keymapId: KeymapId, context: ActionContext): Promise<void>
}
```

---

## Focus System

### IFocusManager

```typescript
/**
 * Менеджер фокуса для навигации
 */
interface IFocusManager {
  /**
   * Зарегистрировать элемент для фокуса
   */
  register(element: FocusableElement): void
  
  /**
   * Отменить регистрацию элемента
   */
  unregister(elementId: string): void
  
  /**
   * Установить фокус на элемент
   */
  focus(elementId: string): void
  
  /**
   * Переместить фокус на следующий элемент
   */
  focusNext(): void
  
  /**
   * Переместить фокус на предыдущий элемент
   */
  focusPrevious(): void
  
  /**
   * Переместить фокус на первый элемент
   */
  focusFirst(): void
  
  /**
   * Переместить фокус на последний элемент
   */
  focusLast(): void
  
  /**
   * Получить текущий фокусированный элемент
   */
  getFocused(): FocusableElement | null
  
  /**
   * Триггерить Enter на текущем элементе
   */
  triggerEnter(): Promise<void>
  
  /**
   * Очистить все элементы (при смене route/mode)
   */
  clear(): void
  
  /**
   * Подписаться на изменения фокуса
   */
  subscribe(listener: FocusChangeListener): Unsubscribe
}

type FocusChangeListener = (focused: FocusableElement | null) => void
```

---

## Notification System

### INotificationManager

```typescript
/**
 * Менеджер уведомлений
 */
interface INotificationManager {
  /**
   * Показать уведомление об успехе
   */
  success(message: string, duration?: number): NotificationId
  
  /**
   * Показать уведомление об ошибке
   */
  error(message: string, duration?: number): NotificationId
  
  /**
   * Показать информационное уведомление
   */
  info(message: string, duration?: number): NotificationId
  
  /**
   * Показать предупреждение
   */
  warning(message: string, duration?: number): NotificationId
  
  /**
   * Показать кастомное уведомление
   */
  show(notification: Omit<Notification, 'id' | 'createdAt'>): NotificationId
  
  /**
   * Закрыть уведомление
   */
  dismiss(id: NotificationId): void
  
  /**
   * Закрыть все уведомления
   */
  dismissAll(): void
  
  /**
   * Получить все активные уведомления
   */
  getAll(): Notification[]
  
  /**
   * Подписаться на изменения уведомлений
   */
  subscribe(listener: NotificationChangeListener): Unsubscribe
}

type NotificationChangeListener = (notifications: Notification[]) => void
```

---

## CQRS: Commands & Queries

### Command Bus (Запись данных)

#### ICommand

```typescript
/**
 * Базовый интерфейс для всех команд
 * Commands выражают намерение выполнить UI действие (изменение состояния)
 */
interface ICommand {
  readonly type: string;
}
```

### ICommandHandler

```typescript
/**
 * Обработчик команды
 * Реализуется в Presentation Layer
 */
interface ICommandHandler<T extends ICommand> {
  handle(command: T): Promise<void> | void;
}
```

### ICommandBus

```typescript
/**
 * Command Bus - посредник между Core Systems и UI
 * 
 * Port (интерфейс) определяется в Application Layer
 * Adapter (реализация) находится в Infrastructure Layer
 * 
 * Используется для изоляции Core Systems от Browser API
 */
interface ICommandBus {
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

### UI Commands

```typescript
/**
 * Команда: Удалить ресурс
 */
class DeleteResourceCommand implements ICommand {
  readonly type = 'DeleteResourceCommand';
  constructor(public readonly resourceId: string) {}
}

/**
 * Команда: Навигация
 */
class NavigateToCommand implements ICommand {
  readonly type = 'NavigateToCommand';
  constructor(public readonly path: string) {}
}

/**
 * Команда: Показать уведомление
 */
class ShowNotificationCommand implements ICommand {
  readonly type = 'ShowNotificationCommand';
  constructor(
    public readonly message: string,
    public readonly level: 'success' | 'error' | 'info' | 'warning'
  ) {}
}

/**
 * Команда: Копировать в буфер обмена
 */
class CopyToClipboardCommand implements ICommand {
  readonly type = 'CopyToClipboardCommand';
  constructor(public readonly text: string) {}
}
```

---

## Query Bus (Чтение данных)

### IQuery

```typescript
/**
 * Базовый интерфейс для всех Queries
 * Queries выражают намерение получить данные (read-only)
 */
interface IQuery {
  readonly type: string;
}
```

### IQueryHandler

```typescript
/**
 * Обработчик Query
 * Реализуется в Application Layer
 */
interface IQueryHandler<TQuery extends IQuery, TResult> {
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}

/**
 * Результат выполнения Query
 */
interface QueryResult<T = any> {
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}
```

### IQueryBus

```typescript
/**
 * Query Bus - посредник для Query Handlers
 * 
 * Port (интерфейс) в Application Layer
 * Adapter (реализация) в Infrastructure Layer
 * 
 * Используется для чтения данных в Loaders
 */
interface IQueryBus {
  /**
   * Выполнить Query
   */
  execute<TQuery extends IQuery, TResult>(
    query: TQuery
  ): Promise<QueryResult<TResult>>;
  
  /**
   * Зарегистрировать Query Handler
   */
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void;
}
```

### Resource Queries

```typescript
/**
 * Query: Получить список ресурсов
 */
class ListResourcesQuery implements IQuery {
  readonly type = 'ListResourcesQuery';
  constructor(public readonly filters?: { search?: string; namespace?: string }) {}
}

/**
 * Query: Получить ресурс по ID
 */
class GetResourceByIdQuery implements IQuery {
  readonly type = 'GetResourceByIdQuery';
  constructor(public readonly resourceId: string) {}
}

/**
 * DTO: Ресурс в списке
 */
interface ResourceListItemDTO {
  id: string;
  namespace: string;
  name: string;
  createdAt: string;
}

/**
 * DTO: Детальная информация о ресурсе
 */
interface ResourceDetailDTO {
  id: string;
  namespace: string;
  name: string;
  secret: {
    value: string;
    isSet: boolean;
  };
  customFields: Array<{
    id: string;
    name: string;
    value: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

## Event Bus

### IEventBus

```typescript
/**
 * Event Bus для коммуникации между системами
 */
interface IEventBus {
  /**
   * Опубликовать событие
   */
  publish<T extends DomainEvent>(event: T): void
  
  /**
   * Подписаться на тип события
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): Unsubscribe
  
  /**
   * Подписаться на все события
   */
  subscribeAll(handler: EventHandler<DomainEvent>): Unsubscribe
  
  /**
   * Очистить все подписки
   */
  clear(): void
}

type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>
```

---

## CQRS Handlers (Application Layer)

### Query Handlers (Read)

```typescript
/**
 * Query Handler: Получить список ресурсов
 */
interface IListResourcesQueryHandler {
  handle(query: ListResourcesQuery): Promise<QueryResult<ResourceListItemDTO[]>>
}

interface ListResourcesQuery {
  readonly type: 'ListResourcesQuery'
  namespace?: string
  search?: string
}

interface ResourceListItemDTO {
  id: string
  namespace: string
  name: string
  fieldsCount: number
  updatedAt: Date
}

/**
 * Query Handler: Получить детали ресурса
 */
interface IGetResourceByIdQueryHandler {
  handle(query: GetResourceByIdQuery): Promise<QueryResult<ResourceDetailDTO | null>>
}

interface GetResourceByIdQuery {
  readonly type: 'GetResourceByIdQuery'
  resourceId: string
}

interface ResourceDetailDTO {
  id: string
  namespace: string
  name: string
  secret: string
  customFields: Array<{
    id: string
    label: string
    value: string
  }>
  createdAt: Date
  updatedAt: Date
}
```

### Command Handlers (Write)

```typescript
/**
 * Command Handler: Создать ресурс
 */
interface ICreateResourceCommandHandler {
  handle(command: CreateResourceCommand): Promise<CommandResult<{ id: string }>>
}

interface CreateResourceCommand {
  readonly type: 'CreateResourceCommand'
  namespace: string
  name: string
  secretValue: string
  customFields?: Array<{ label: string; value: string }>
}

/**
 * Command Handler: Обновить ресурс
 */
interface IUpdateResourceCommandHandler {
  handle(command: UpdateResourceCommand): Promise<CommandResult<void>>
}

interface UpdateResourceCommand {
  readonly type: 'UpdateResourceCommand'
  resourceId: string
  name?: string
  namespace?: string
}

/**
 * Command Handler: Добавить кастомное поле
 */
interface IAddCustomFieldCommandHandler {
  handle(command: AddCustomFieldCommand): Promise<CommandResult<{ fieldId: string }>>
}

interface AddCustomFieldCommand {
  readonly type: 'AddCustomFieldCommand'
  resourceId: string
  label: string
  value: string
}

/**
 * Command Handler: Обновить поле
 */
interface IUpdateFieldCommandHandler {
  handle(command: UpdateFieldCommand): Promise<CommandResult<void>>
}

interface UpdateFieldCommand {
  readonly type: 'UpdateFieldCommand'
  resourceId: string
  fieldId: string
  value: string
}

/**
 * Command Handler: Удалить кастомное поле
 */
interface IDeleteCustomFieldCommandHandler {
  handle(command: DeleteCustomFieldCommand): Promise<CommandResult<void>>
}

interface DeleteCustomFieldCommand {
  readonly type: 'DeleteCustomFieldCommand'
  resourceId: string
  fieldId: string
}

/**
 * Command Handler: Удалить ресурс
 */
interface IDeleteResourceCommandHandler {
  handle(command: DeleteResourceCommand): Promise<CommandResult<void>>
}

interface DeleteResourceCommand {
  readonly type: 'DeleteResourceCommand'
  resourceId: string
}

/**
 * Общие типы результатов
 */
interface QueryResult<T> {
  data: T
  error?: string
}

interface CommandResult<T = void> {
  data?: T
  error?: string
  success: boolean
}
```

---

## HTTP Client (Infrastructure)

### IHttpClient

```typescript
/**
 * HTTP клиент для работы с API
 */
interface IHttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>
  delete<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>
}

interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, string>
  timeout?: number
}

interface HttpResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

/**
 * HTTP ошибка
 */
interface HttpError extends Error {
  status: number
  statusText: string
  response?: any
}
```

---

## Clipboard Service

### IClipboardService

```typescript
/**
 * Сервис для работы с буфером обмена
 */
interface IClipboardService {
  /**
   * Скопировать текст в буфер обмена
   */
  copy(text: string): Promise<void>
  
  /**
   * Прочитать текст из буфера обмена
   */
  read(): Promise<string>
  
  /**
   * Проверить доступность clipboard API
   */
  isAvailable(): boolean
}
```

---

## Примечания

### Dependency Inversion

Все интерфейсы определены в Domain/Application слоях.
Infrastructure Layer предоставляет конкретные реализации.

### Naming Convention

- `I*` - интерфейс (IModalManager, IResourceRepository)
- `*Query` - Query для CQRS (чтение данных)
- `*QueryHandler` - обработчик Query
- `*Command` - Command для CQRS (запись данных)
- `*CommandHandler` - обработчик Command
- `*Service` - domain service

### Async/Await

Все операции с внешними системами асинхронные (Promise).
Domain операции (без I/O) могут быть синхронными.
