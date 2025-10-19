# Infrastructure Types - Типы инфраструктурного слоя

Типы для Infrastructure Layer (API, Storage, External Services).

## Configuration

### App Configuration

```typescript
/**
 * Конфигурация приложения
 */
interface AppConfig {
  mode: 'development' | 'production' | 'test'
  useMocks: boolean
  api: ApiConfig
  features: FeatureFlags
}

interface ApiConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

interface FeatureFlags {
  enableClipboard: boolean
  enableNotifications: boolean
  enableKeyboardShortcuts: boolean
}
```

---

## API Client Types

### API Response Types

```typescript
/**
 * Типы для работы с API
 */
interface ApiResponse<T> {
  data: T
  meta?: ApiResponseMeta
}

interface ApiResponseMeta {
  timestamp: string
  requestId: string
  pagination?: PaginationInfo
}

interface PaginationInfo {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
```

### API Error Types

```typescript
/**
 * Ошибка API
 */
interface ApiError extends Error {
  code: ApiErrorCode
  status: number
  details?: any
  requestId?: string
}

type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
```

### Request Options

```typescript
/**
 * Опции для HTTP запросов
 */
interface RequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  timeout?: number
  retry?: boolean
  retryAttempts?: number
  signal?: AbortSignal
}
```

---

## Repository Implementation Types

### Mock Repository Types

```typescript
/**
 * Конфигурация для Mock Repository
 */
interface MockRepositoryConfig<T> {
  initialData: T[]
  delay?: number           // Имитация задержки сети
  errorRate?: number       // 0-1, вероятность ошибки
}

/**
 * Состояние Mock Repository
 */
interface MockRepositoryState<T> {
  data: Map<string, T>
  accessLog: AccessLogEntry[]
}

interface AccessLogEntry {
  timestamp: DateTime
  operation: 'read' | 'write' | 'delete'
  entityId: string
}
```

### API Repository Types

```typescript
/**
 * Mapper для преобразования DTO ↔ Domain
 */
interface DomainMapper<TDomain, TDTO> {
  toDomain(dto: TDTO): TDomain
  toDTO(domain: TDomain): TDTO
  toDomainList(dtos: TDTO[]): TDomain[]
  toDTOList(domains: TDomain[]): TDTO[]
}

/**
 * Cache для API Repository
 */
interface RepositoryCache<T> {
  get(key: string): T | null
  set(key: string, value: T, ttl?: number): void
  invalidate(key: string): void
  clear(): void
}
```

---

## Storage Types

### Local Storage

```typescript
/**
 * Интерфейс для работы с localStorage
 */
interface ILocalStorage {
  getItem<T>(key: string): T | null
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
  clear(): void
  keys(): string[]
}

/**
 * Storage Key
 */
type StorageKey =
  | 'app-settings'
  | 'user-preferences'
  | 'keymap-customizations'
  | 'recent-resources'
```

### Settings Types

```typescript
/**
 * Настройки приложения (хранятся локально)
 */
interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  keymapStyle: 'vim' | 'emacs' | 'default'
  notifications: NotificationSettings
}

interface NotificationSettings {
  enabled: boolean
  duration: number
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  soundEnabled: boolean
}

/**
 * Пользовательские предпочтения
 */
interface UserPreferences {
  defaultNamespace?: string
  passwordGenerationDefaults: PasswordGenerationOptions
  recentlyUsedNamespaces: string[]
  favoriteResources: ResourceId[]
}
```

---

## Event Bus Implementation

### Event Bus Types

```typescript
/**
 * Подписка на события
 */
interface EventSubscription {
  id: string
  eventType: string
  handler: EventHandler<any>
  once: boolean
}

/**
 * Очередь событий
 */
interface EventQueue {
  enqueue(event: DomainEvent): void
  dequeue(): DomainEvent | null
  peek(): DomainEvent | null
  isEmpty(): boolean
  clear(): void
}

/**
 * Middleware для Event Bus
 */
type EventMiddleware = (
  event: DomainEvent,
  next: () => void
) => void

/**
 * Логгер событий
 */
interface EventLogger {
  log(event: DomainEvent): void
  getHistory(filter?: EventFilter): DomainEvent[]
}

interface EventFilter {
  eventType?: string
  aggregateId?: string
  from?: DateTime
  to?: DateTime
}
```

---

## Clipboard Service Types

```typescript
/**
 * Результат копирования в буфер
 */
interface ClipboardResult {
  success: boolean
  error?: ClipboardError
}

/**
 * Ошибка буфера обмена
 */
interface ClipboardError extends Error {
  code: ClipboardErrorCode
}

type ClipboardErrorCode =
  | 'NOT_SUPPORTED'
  | 'PERMISSION_DENIED'
  | 'CLIPBOARD_BLOCKED'
  | 'UNKNOWN_ERROR'
```

---

## Encryption Types

```typescript
/**
 * Сервис шифрования (если реализуется на клиенте)
 */
interface IEncryptionService {
  encrypt(plaintext: string, key: string): EncryptedValue
  decrypt(encrypted: EncryptedValue, key: string): string
  generateKey(): string
  deriveKey(password: string, salt: string): string
}

/**
 * Результат шифрования
 */
interface EncryptionResult {
  encryptedData: string
  iv: string
  algorithm: EncryptionAlgorithm
}

type EncryptionAlgorithm = 'AES-256-GCM' | 'AES-256-CBC'
```

---

## Logger Types

```typescript
/**
 * Логгер приложения
 */
interface ILogger {
  debug(message: string, context?: any): void
  info(message: string, context?: any): void
  warn(message: string, context?: any): void
  error(message: string, error?: Error, context?: any): void
}

/**
 * Запись в логе
 */
interface LogEntry {
  timestamp: DateTime
  level: LogLevel
  message: string
  context?: any
  error?: {
    name: string
    message: string
    stack?: string
  }
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
```

---

## HTTP Client Implementation

### Interceptors

```typescript
/**
 * Request interceptor
 */
type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>

/**
 * Response interceptor
 */
type ResponseInterceptor = (
  response: HttpResponse<any>
) => HttpResponse<any> | Promise<HttpResponse<any>>

/**
 * Error interceptor
 */
type ErrorInterceptor = (
  error: HttpError
) => Promise<never> | Promise<HttpResponse<any>>
```

### Retry Configuration

```typescript
/**
 * Конфигурация повторных попыток
 */
interface RetryConfig {
  maxAttempts: number
  delay: number
  backoff: 'linear' | 'exponential'
  retryableStatuses: number[]
  onRetry?: (attempt: number, error: HttpError) => void
}
```

---

## Mock Data Types

### Mock Data Generator

```typescript
/**
 * Генератор моковых данных
 */
interface IMockDataGenerator {
  generateResources(count: number): Resource[]
  generateNamespaces(count: number): NamespaceInfo[]
  generateCustomFields(count: number): CustomField[]
  generatePassword(options: PasswordGenerationOptions): string
}

/**
 * Конфигурация генератора
 */
interface MockDataConfig {
  resourceCount: number
  namespaceCount: number
  avgFieldsPerResource: number
  seed?: number          // Для воспроизводимости
}
```

---

## Performance Monitoring

### Performance Metrics

```typescript
/**
 * Метрики производительности
 */
interface PerformanceMetrics {
  apiCalls: ApiCallMetric[]
  renderTimes: RenderMetric[]
  keymapExecutions: KeymapMetric[]
}

interface ApiCallMetric {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: DateTime
}

interface RenderMetric {
  component: string
  duration: number
  timestamp: DateTime
}

interface KeymapMetric {
  keymapId: KeymapId
  executionTime: number
  timestamp: DateTime
}
```

---

## Dependency Injection Container

### DI Container Types

```typescript
/**
 * DI Container для управления зависимостями
 */
interface IDIContainer {
  register<T>(token: Token<T>, factory: Factory<T>): void
  registerSingleton<T>(token: Token<T>, factory: Factory<T>): void
  resolve<T>(token: Token<T>): T
  has(token: Token<any>): boolean
}

type Token<T> = string | symbol | { new(...args: any[]): T }

type Factory<T> = (container: IDIContainer) => T

/**
 * Tokens для основных сервисов
 */
const TOKENS = {
  ResourceRepository: Symbol('IResourceRepository'),
  NamespaceRepository: Symbol('INamespaceRepository'),
  PasswordGenerator: Symbol('IPasswordGeneratorService'),
  ModalManager: Symbol('IModalManager'),
  KeymapRegistry: Symbol('IKeymapRegistry'),
  KeymapExecutor: Symbol('IKeymapExecutor'),
  FocusManager: Symbol('IFocusManager'),
  NotificationManager: Symbol('INotificationManager'),
  EventBus: Symbol('IEventBus'),
  HttpClient: Symbol('IHttpClient'),
  Logger: Symbol('ILogger')
} as const
```

---

## Testing Types

### Test Doubles

```typescript
/**
 * Mock для Repository
 */
interface MockRepository<T> extends IResourceRepository {
  __addMockData(data: T[]): void
  __clear(): void
  __getCallHistory(): RepositoryCall[]
}

interface RepositoryCall {
  method: string
  args: any[]
  timestamp: DateTime
}

/**
 * Spy для EventBus
 */
interface EventBusSpy extends IEventBus {
  __getPublishedEvents(): DomainEvent[]
  __getSubscriptions(): EventSubscription[]
  __clear(): void
}
```

### Test Fixtures

```typescript
/**
 * Фикстуры для тестов
 */
interface TestFixtures {
  resources: Resource[]
  namespaces: NamespaceInfo[]
  keymaps: Keymap[]
  notifications: Notification[]
}

/**
 * Builder для тестовых данных
 */
interface ResourceBuilder {
  withNamespace(namespace: string): ResourceBuilder
  withName(name: string): ResourceBuilder
  withSecret(secret: string): ResourceBuilder
  withCustomField(label: string, value: string): ResourceBuilder
  build(): Resource
}
```

---

## Environment Types

```typescript
/**
 * Environment variables
 */
interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test'
  API_BASE_URL?: string
  USE_MOCKS?: 'true' | 'false'
  LOG_LEVEL?: LogLevel
  ENCRYPTION_KEY?: string
}

/**
 * Runtime environment
 */
interface RuntimeEnvironment {
  isElectron: boolean
  isBrowser: boolean
  platform: 'win32' | 'darwin' | 'linux'
  version: string
}
```

---

## Примечания

### Type Safety

Все типы Infrastructure Layer строго типизированы.
Используются generic types для переиспользования.

### Error Handling

Все async операции возвращают `Promise<T>` или `Result<T, E>`.
Никогда не throw exceptions в production коде Infrastructure Layer.

### Naming Convention

- `I*` - интерфейс (ILogger, IHttpClient)
- `*Config` - конфигурация
- `*Result` - результат операции
- `*Error` - тип ошибки
- `Mock*` - mock реализация для тестов
