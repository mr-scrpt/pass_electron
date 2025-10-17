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

## Event Bus

### IEventBus

```typescript
/**
 * Шина событий для коммуникации между системами
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

## Use Cases (Application Layer)

### Resource Management Use Cases

```typescript
/**
 * Use Case: Создать ресурс
 */
interface ICreateResourceUseCase {
  execute(command: CreateResourceCommand): Promise<Result<Resource, DomainError>>
}

interface CreateResourceCommand {
  namespace: string
  name: string
  secretValue: string
  customFields?: Array<{ label: string; value: string }>
}

/**
 * Use Case: Обновить ресурс
 */
interface IUpdateResourceUseCase {
  execute(command: UpdateResourceCommand): Promise<Result<Resource, DomainError>>
}

interface UpdateResourceCommand {
  resourceId: ResourceId
  name?: string
  namespace?: string
}

/**
 * Use Case: Добавить кастомное поле
 */
interface IAddCustomFieldUseCase {
  execute(command: AddCustomFieldCommand): Promise<Result<CustomField, DomainError>>
}

interface AddCustomFieldCommand {
  resourceId: ResourceId
  label: string
  value: string
}

/**
 * Use Case: Обновить поле
 */
interface IUpdateFieldUseCase {
  execute(command: UpdateFieldCommand): Promise<Result<void, DomainError>>
}

interface UpdateFieldCommand {
  resourceId: ResourceId
  fieldId: FieldId
  value: string
}

/**
 * Use Case: Удалить ресурс
 */
interface IDeleteResourceUseCase {
  execute(command: DeleteResourceCommand): Promise<Result<void, DomainError>>
}

interface DeleteResourceCommand {
  resourceId: ResourceId
}

/**
 * Use Case: Получить список ресурсов
 */
interface IListResourcesUseCase {
  execute(query: ListResourcesQuery): Promise<Result<ResourceListItem[], DomainError>>
}

interface ListResourcesQuery {
  namespace?: string
  search?: string
}

/**
 * Use Case: Получить детали ресурса
 */
interface IGetResourceUseCase {
  execute(query: GetResourceQuery): Promise<Result<Resource, DomainError>>
}

interface GetResourceQuery {
  resourceId: ResourceId
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
- `*UseCase` - use case интерфейс
- `*Command` - команда для use case
- `*Query` - запрос для use case
- `*Service` - domain/application service

### Async/Await

Все операции с внешними системами асинхронные (Promise).
Domain операции (без I/O) могут быть синхронными.
