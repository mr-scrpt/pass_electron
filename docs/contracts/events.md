# Domain Events - События предметной области

Все события, которые происходят в системе.

## Базовый интерфейс

```typescript
/**
 * Базовый интерфейс для всех доменных событий
 */
interface DomainEvent {
  readonly eventType: string
  readonly eventId: string
  readonly occurredAt: DateTime
  readonly aggregateId?: string
}
```

---

## Resource Context Events

### ResourceCreated

```typescript
/**
 * Событие создания ресурса
 */
interface ResourceCreated extends DomainEvent {
  readonly eventType: 'ResourceCreated'
  readonly aggregateId: ResourceId
  readonly data: {
    namespace: string
    name: string
    secretFieldId: FieldId
    customFieldsCount: number
  }
}
```

### ResourceUpdated

```typescript
/**
 * Событие обновления ресурса
 */
interface ResourceUpdated extends DomainEvent {
  readonly eventType: 'ResourceUpdated'
  readonly aggregateId: ResourceId
  readonly data: {
    changes: {
      namespace?: { from: string; to: string }
      name?: { from: string; to: string }
    }
  }
}
```

### ResourceDeleted

```typescript
/**
 * Событие удаления ресурса
 */
interface ResourceDeleted extends DomainEvent {
  readonly eventType: 'ResourceDeleted'
  readonly aggregateId: ResourceId
  readonly data: {
    namespace: string
    name: string
  }
}
```

### CustomFieldAdded

```typescript
/**
 * Событие добавления кастомного поля
 */
interface CustomFieldAdded extends DomainEvent {
  readonly eventType: 'CustomFieldAdded'
  readonly aggregateId: ResourceId
  readonly data: {
    fieldId: FieldId
    label: string
  }
}
```

### CustomFieldUpdated

```typescript
/**
 * Событие обновления кастомного поля
 */
interface CustomFieldUpdated extends DomainEvent {
  readonly eventType: 'CustomFieldUpdated'
  readonly aggregateId: ResourceId
  readonly data: {
    fieldId: FieldId
    changes: {
      label?: { from: string; to: string }
      valueChanged: boolean
    }
  }
}
```

### CustomFieldRemoved

```typescript
/**
 * Событие удаления кастомного поля
 */
interface CustomFieldRemoved extends DomainEvent {
  readonly eventType: 'CustomFieldRemoved'
  readonly aggregateId: ResourceId
  readonly data: {
    fieldId: FieldId
    label: string
  }
}
```

### SecretFieldUpdated

```typescript
/**
 * Событие обновления секретного поля
 */
interface SecretFieldUpdated extends DomainEvent {
  readonly eventType: 'SecretFieldUpdated'
  readonly aggregateId: ResourceId
  readonly data: {
    fieldId: FieldId
  }
}
```

---

## Mode Context Events

### ModeChanged

```typescript
/**
 * Событие изменения режима
 */
interface ModeChanged extends DomainEvent {
  readonly eventType: 'ModeChanged'
  readonly data: {
    from: AppMode
    to: AppMode
    route: string
  }
}
```

### NavigationModeEntered

```typescript
/**
 * Событие входа в режим навигации
 */
interface NavigationModeEntered extends DomainEvent {
  readonly eventType: 'NavigationModeEntered'
  readonly data: {
    route: string
    previousMode: AppMode
  }
}
```

### EditingModeEntered

```typescript
/**
 * Событие входа в режим редактирования
 */
interface EditingModeEntered extends DomainEvent {
  readonly eventType: 'EditingModeEntered'
  readonly data: {
    route: string
    resourceId: ResourceId
    fieldId: FieldId
    previousMode: AppMode
  }
}
```

### RouteChanged

```typescript
/**
 * Событие изменения маршрута
 */
interface RouteChanged extends DomainEvent {
  readonly eventType: 'RouteChanged'
  readonly data: {
    from: string
    to: string
    params: Record<string, string>
  }
}
```

---

## Keymap Context Events

### KeymapTriggered

```typescript
/**
 * Событие срабатывания кеймапа
 */
interface KeymapTriggered extends DomainEvent {
  readonly eventType: 'KeymapTriggered'
  readonly data: {
    keymapId: KeymapId
    keymapName: string
    binding: KeyBinding
    context: {
      mode: AppMode
      route: string
    }
  }
}
```

### KeymapRegistered

```typescript
/**
 * Событие регистрации кеймапа
 */
interface KeymapRegistered extends DomainEvent {
  readonly eventType: 'KeymapRegistered'
  readonly data: {
    keymapId: KeymapId
    name: string
    binding: KeyBinding
    modes: AppMode[]
  }
}
```

### KeymapUnregistered

```typescript
/**
 * Событие отмены регистрации кеймапа
 */
interface KeymapUnregistered extends DomainEvent {
  readonly eventType: 'KeymapUnregistered'
  readonly data: {
    keymapId: KeymapId
  }
}
```

### ActiveKeymapsChanged

```typescript
/**
 * Событие изменения активных кеймапов
 */
interface ActiveKeymapsChanged extends DomainEvent {
  readonly eventType: 'ActiveKeymapsChanged'
  readonly data: {
    activeKeymaps: KeymapId[]
    context: {
      mode: AppMode
      route: string
    }
  }
}
```

---

## Focus Context Events

### FocusChanged

```typescript
/**
 * Событие изменения фокуса
 */
interface FocusChanged extends DomainEvent {
  readonly eventType: 'FocusChanged'
  readonly data: {
    from: string | null
    to: string | null
    elementType?: FocusableType
  }
}
```

### FocusableElementRegistered

```typescript
/**
 * Событие регистрации элемента для фокуса
 */
interface FocusableElementRegistered extends DomainEvent {
  readonly eventType: 'FocusableElementRegistered'
  readonly data: {
    elementId: string
    order: number
    route: string
    mode: AppMode
  }
}
```

### FocusableElementUnregistered

```typescript
/**
 * Событие отмены регистрации элемента
 */
interface FocusableElementUnregistered extends DomainEvent {
  readonly eventType: 'FocusableElementUnregistered'
  readonly data: {
    elementId: string
  }
}
```

### FocusCleared

```typescript
/**
 * Событие очистки всех элементов фокуса
 */
interface FocusCleared extends DomainEvent {
  readonly eventType: 'FocusCleared'
  readonly data: {
    reason: 'route-change' | 'mode-change' | 'manual'
  }
}
```

---

## Notification Context Events

### NotificationRaised

```typescript
/**
 * Событие создания уведомления
 */
interface NotificationRaised extends DomainEvent {
  readonly eventType: 'NotificationRaised'
  readonly data: {
    notificationId: NotificationId
    type: NotificationType
    message: string
    duration: number | null
  }
}
```

### NotificationDismissed

```typescript
/**
 * Событие закрытия уведомления
 */
interface NotificationDismissed extends DomainEvent {
  readonly eventType: 'NotificationDismissed'
  readonly data: {
    notificationId: NotificationId
    reason: 'user-action' | 'timeout' | 'programmatic'
  }
}
```

---

## Application Events

### ApplicationInitialized

```typescript
/**
 * Событие инициализации приложения
 */
interface ApplicationInitialized extends DomainEvent {
  readonly eventType: 'ApplicationInitialized'
  readonly data: {
    version: string
    mode: 'production' | 'development'
    useMocks: boolean
  }
}
```

### ApplicationError

```typescript
/**
 * Событие ошибки приложения
 */
interface ApplicationError extends DomainEvent {
  readonly eventType: 'ApplicationError'
  readonly data: {
    error: {
      code: string
      message: string
      stack?: string
    }
    context?: any
  }
}
```

---

## Event Handlers

### Примеры подписчиков

```typescript
/**
 * Notification System подписывается на события Resource Context
 */
eventBus.subscribe<ResourceCreated>('ResourceCreated', (event) => {
  notificationManager.success(`Resource "${event.data.name}" created`)
})

eventBus.subscribe<ResourceDeleted>('ResourceDeleted', (event) => {
  notificationManager.info(`Resource "${event.data.name}" deleted`)
})

/**
 * Focus System подписывается на события Mode Context
 */
eventBus.subscribe<ModeChanged>('ModeChanged', (event) => {
  if (event.data.to === 'editing') {
    focusManager.clear()
  }
})

/**
 * Keymap System подписывается на события Mode Context
 */
eventBus.subscribe<ModeChanged>('ModeChanged', (event) => {
  keymapRegistry.updateActiveKeymaps()
})

eventBus.subscribe<RouteChanged>('RouteChanged', (event) => {
  keymapRegistry.updateActiveKeymaps()
})
```

---

## Event Naming Convention

### Правила именования

1. **Past Tense**: события описывают что произошло (Created, Updated, Deleted)
2. **Specific**: конкретное название (ResourceCreated, не EntityCreated)
3. **Domain Language**: используют термины из Ubiquitous Language

### Структура имени

```
{Aggregate}{Action}
```

Примеры:
- ResourceCreated
- CustomFieldAdded
- ModeChanged
- KeymapTriggered

---

## Event Publishing

### Пример публикации события

```typescript
// Domain Layer (Resource Aggregate)
class Resource {
  static create(namespace: Namespace, name: ResourceName, secretValue: string): Resource {
    const resource = new Resource(/* ... */)
    
    // Публикуем событие
    const event: ResourceCreated = {
      eventType: 'ResourceCreated',
      eventId: generateId(),
      occurredAt: new Date().toISOString(),
      aggregateId: resource.id,
      data: {
        namespace: namespace.value,
        name: name.value,
        secretFieldId: resource.secret.id,
        customFieldsCount: 0
      }
    }
    
    eventBus.publish(event)
    
    return resource
  }
}
```

---

## Event Ordering

### Гарантии порядка

События публикуются синхронно в порядке их возникновения.
Обработчики вызываются в порядке подписки.

### Пример последовательности

```
1. User нажимает Ctrl+S
        ↓
2. KeymapTriggered { keymapId: 'save-resource' }
        ↓
3. ResourceUpdated { aggregateId: '123', changes: {...} }
        ↓
4. NotificationRaised { type: 'success', message: 'Saved' }
```

---

## Event Persistence

События не персистируются (не Event Sourcing).
События существуют только в рамках runtime приложения.

Для истории изменений используются поля `createdAt` / `updatedAt` в сущностях.

---

## Testing Events

### Пример тестирования событий

```typescript
describe('Resource', () => {
  it('should publish ResourceCreated event', () => {
    const eventSpy = jest.fn()
    eventBus.subscribe('ResourceCreated', eventSpy)
    
    const resource = Resource.create(
      Namespace.create('social'),
      ResourceName.create('facebook'),
      'secret123'
    )
    
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'ResourceCreated',
        aggregateId: resource.id
      })
    )
  })
})
```

---

## Примечания

### Event Bus Implementation

Event Bus реализован в Infrastructure Layer.
Domain Layer использует его через интерфейс `IEventBus`.

### Performance

События обрабатываются синхронно.
Для тяжелых операций использовать async handlers.

### Error Handling

Ошибки в event handlers не должны прерывать основной поток.
Используется try-catch с логированием ошибок.
