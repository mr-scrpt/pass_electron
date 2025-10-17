# API Contracts - API Контракты

Контракты для взаимодействия с backend API.

## Base URL

```
Production: https://api.password-manager.com
Development: http://localhost:3000
Mock: In-memory (no HTTP)
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>  # (если требуется аутентификация)
```

## Response Format

### Success Response

```typescript
interface SuccessResponse<T> {
  data: T
  meta?: ResponseMeta
}

interface ResponseMeta {
  timestamp: string
  requestId: string
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  meta: {
    timestamp: string
    requestId: string
  }
}
```

---

## Resource Endpoints

### GET /api/resources

Получить список всех ресурсов.

**Query Parameters:**
```typescript
interface ListResourcesParams {
  namespace?: string  // Фильтр по неймспейсу
  search?: string     // Поисковый запрос
  limit?: number      // Лимит результатов (default: 100)
  offset?: number     // Смещение (default: 0)
}
```

**Response:**
```typescript
interface ListResourcesResponse {
  data: ResourceDTO[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

interface ResourceDTO {
  id: string
  namespace: string
  name: string
  secretPreview?: string  // Первые 2 символа + ***
  customFieldsCount: number
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}
```

**Status Codes:**
- `200 OK` - Успешно
- `400 Bad Request` - Некорректные параметры
- `500 Internal Server Error` - Ошибка сервера

---

### GET /api/resources/:id

Получить детали конкретного ресурса.

**Path Parameters:**
```typescript
interface GetResourceParams {
  id: string  // Resource ID
}
```

**Response:**
```typescript
interface GetResourceResponse {
  data: ResourceDetailDTO
}

interface ResourceDetailDTO {
  id: string
  namespace: string
  name: string
  secret: SecretFieldDTO
  customFields: CustomFieldDTO[]
  createdAt: string
  updatedAt: string
}

interface SecretFieldDTO {
  id: string
  label: 'secret'
  value: string           // Зашифрованное значение
  createdAt: string
  updatedAt: string
}

interface CustomFieldDTO {
  id: string
  label: string
  value: string           // Зашифрованное значение
  createdAt: string
  updatedAt: string
}
```

**Status Codes:**
- `200 OK` - Успешно
- `404 Not Found` - Ресурс не найден
- `500 Internal Server Error` - Ошибка сервера

---

### POST /api/resources

Создать новый ресурс.

**Request Body:**
```typescript
interface CreateResourceRequest {
  namespace: string
  name: string
  secretValue: string
  customFields?: Array<{
    label: string
    value: string
  }>
}
```

**Response:**
```typescript
interface CreateResourceResponse {
  data: ResourceDetailDTO
}
```

**Status Codes:**
- `201 Created` - Ресурс создан
- `400 Bad Request` - Некорректные данные
- `409 Conflict` - Ресурс уже существует
- `422 Unprocessable Entity` - Ошибка валидации
- `500 Internal Server Error` - Ошибка сервера

**Validation Errors:**
```typescript
interface ValidationErrorResponse {
  error: {
    code: 'VALIDATION_ERROR'
    message: string
    details: {
      field: string
      constraint: string
      value: any
    }[]
  }
}
```

---

### PUT /api/resources/:id

Обновить ресурс.

**Path Parameters:**
```typescript
interface UpdateResourceParams {
  id: string
}
```

**Request Body:**
```typescript
interface UpdateResourceRequest {
  namespace?: string
  name?: string
}
```

**Response:**
```typescript
interface UpdateResourceResponse {
  data: ResourceDetailDTO
}
```

**Status Codes:**
- `200 OK` - Успешно обновлено
- `400 Bad Request` - Некорректные данные
- `404 Not Found` - Ресурс не найден
- `409 Conflict` - Конфликт имени
- `422 Unprocessable Entity` - Ошибка валидации
- `500 Internal Server Error` - Ошибка сервера

---

### DELETE /api/resources/:id

Удалить ресурс.

**Path Parameters:**
```typescript
interface DeleteResourceParams {
  id: string
}
```

**Response:**
```typescript
interface DeleteResourceResponse {
  data: {
    id: string
    deleted: true
  }
}
```

**Status Codes:**
- `200 OK` - Успешно удалено
- `404 Not Found` - Ресурс не найден
- `500 Internal Server Error` - Ошибка сервера

---

## Field Endpoints

### POST /api/resources/:resourceId/fields

Добавить кастомное поле к ресурсу.

**Path Parameters:**
```typescript
interface AddFieldParams {
  resourceId: string
}
```

**Request Body:**
```typescript
interface AddFieldRequest {
  label: string
  value: string
}
```

**Response:**
```typescript
interface AddFieldResponse {
  data: CustomFieldDTO
}
```

**Status Codes:**
- `201 Created` - Поле добавлено
- `400 Bad Request` - Некорректные данные
- `404 Not Found` - Ресурс не найден
- `409 Conflict` - Поле с таким label уже существует
- `422 Unprocessable Entity` - Ошибка валидации
- `500 Internal Server Error` - Ошибка сервера

---

### PUT /api/resources/:resourceId/fields/:fieldId

Обновить поле ресурса.

**Path Parameters:**
```typescript
interface UpdateFieldParams {
  resourceId: string
  fieldId: string
}
```

**Request Body:**
```typescript
interface UpdateFieldRequest {
  label?: string  // Только для customFields
  value?: string
}
```

**Response:**
```typescript
interface UpdateFieldResponse {
  data: SecretFieldDTO | CustomFieldDTO
}
```

**Status Codes:**
- `200 OK` - Успешно обновлено
- `400 Bad Request` - Некорректные данные
- `404 Not Found` - Ресурс или поле не найдено
- `422 Unprocessable Entity` - Ошибка валидации
- `500 Internal Server Error` - Ошибка сервера

**Примечание:** Label секретного поля ('secret') нельзя изменить.

---

### DELETE /api/resources/:resourceId/fields/:fieldId

Удалить кастомное поле.

**Path Parameters:**
```typescript
interface DeleteFieldParams {
  resourceId: string
  fieldId: string
}
```

**Response:**
```typescript
interface DeleteFieldResponse {
  data: {
    id: string
    deleted: true
  }
}
```

**Status Codes:**
- `200 OK` - Успешно удалено
- `400 Bad Request` - Нельзя удалить секретное поле
- `404 Not Found` - Ресурс или поле не найдено
- `500 Internal Server Error` - Ошибка сервера

**Примечание:** Секретное поле удалить нельзя.

---

## Namespace Endpoints

### GET /api/namespaces

Получить список всех неймспейсов.

**Response:**
```typescript
interface ListNamespacesResponse {
  data: NamespaceDTO[]
}

interface NamespaceDTO {
  name: string
  resourceCount: number
}
```

**Status Codes:**
- `200 OK` - Успешно
- `500 Internal Server Error` - Ошибка сервера

---

## Password Generation Endpoint

### POST /api/password/generate

Сгенерировать пароль.

**Request Body:**
```typescript
interface GeneratePasswordRequest {
  length: number                // 8-128
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean
  customCharset?: string
}
```

**Response:**
```typescript
interface GeneratePasswordResponse {
  data: {
    password: string
    strength: {
      score: number           // 0-100
      level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent'
      feedback: string[]
    }
  }
}
```

**Status Codes:**
- `200 OK` - Успешно
- `400 Bad Request` - Некорректные параметры
- `422 Unprocessable Entity` - Ошибка валидации
- `500 Internal Server Error` - Ошибка сервера

---

## Error Codes

### Common Error Codes

```typescript
type ErrorCode = 
  | 'VALIDATION_ERROR'          // Ошибка валидации
  | 'NOT_FOUND'                 // Ресурс не найден
  | 'CONFLICT'                  // Конфликт (дубликат)
  | 'UNAUTHORIZED'              // Не авторизован
  | 'FORBIDDEN'                 // Нет доступа
  | 'INTERNAL_ERROR'            // Внутренняя ошибка
  | 'BAD_REQUEST'               // Некорректный запрос
```

### Error Response Examples

**Validation Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "namespace",
        "constraint": "pattern",
        "value": "Social!"
      }
    ]
  }
}
```

**Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": {
      "resourceId": "123"
    }
  }
}
```

**Conflict:**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Resource already exists",
    "details": {
      "namespace": "social",
      "name": "facebook"
    }
  }
}
```

---

## Rate Limiting

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

При превышении лимита:
```
Status: 429 Too Many Requests
```

---

## Pagination

Для endpoints, возвращающих списки:

**Query Parameters:**
```typescript
interface PaginationParams {
  limit?: number   // default: 50, max: 100
  offset?: number  // default: 0
}
```

**Response Meta:**
```typescript
interface PaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
```

---

## Примечания

### Шифрование

Все значения полей (`value`) хранятся в зашифрованном виде на backend.
Client получает зашифрованные данные и расшифровывает локально.

### Timestamp Format

Все даты в формате ISO 8601:
```
2024-01-15T10:30:00.000Z
```

### Request IDs

Каждый response содержит `requestId` для трейсинга и отладки.

### CORS

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```
