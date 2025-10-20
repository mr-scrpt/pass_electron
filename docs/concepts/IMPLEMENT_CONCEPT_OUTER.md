# Password Manager - Архитектура клиентского приложения

## Оглавление

1. [Обзор](#обзор)
2. [Технологический стек](#технологический-стек)
3. [Общая архитектура](#общая-архитектура)
4. [Структура проекта](#структура-проекта)
5. [Доменные сущности](#доменные-сущности)
6. [Основные системы](#основные-системы)
   - [Система модальности](#система-модальности)
   - [Система кеймапов](#система-кеймапов)
   - [Система фокуса](#система-фокуса)
   - [Система уведомлений](#система-уведомлений)
7. [API Client](#api-client)
8. [Presentation Layer](#presentation-layer)
9. [Hooks](#hooks)
10. [Архитектурные принципы](#архитектурные-принципы)

---

## Обзор

Менеджер паролей - это desktop приложение с полной поддержкой управления с клавиатуры. Приложение работает в модальном режиме (навигация/редактирование) и взаимодействует с backend API для управления паролями.

### Ключевые особенности:

- **Keyboard-first**: Полное управление с клавиатуры
- **Модальность**: Два режима работы - навигация и редактирование, возможность легко добавлять новые режимы
- **Контекстные кеймапы**: Горячие клавиши зависят от текущего контекста
- **Real-time обратная связь**: Статус-бар с активными кеймапами
- **Уведомления**: Toast-нотификации об ошибках и успешных операциях

---

## Технологический стек

- **Platform**: Electron (desktop)
- **Frontend Framework**: Remix
- **Language**: TypeScript
- **UI**: React
- **Styling**: Tailwind CSS (предполагается)
- **API Communication**: Fetch API / HTTP

---

## Общая архитектура

### Диаграмма слоев [#diagram:layers]

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│         (Remix Routes + React Components)                │
│                                                           │
│  - ResourceList, ResourceDetail, PasswordGenerator       │
│  - KeymapStatusBar, NotificationToast                   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────┐
│                  Application Layer                       │
│    (State Management, Modal System, Keymap System)       │
│                                                           │
│  - ModalManager: Управление режимами приложения          │
│  - KeymapRegistry & Executor: Обработка кеймапов         │
│  - FocusManager: Управление фокусом для навигации        │
│  - NotificationManager: Уведомления пользователя         │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────┐
│              Infrastructure Layer                        │
│              (API Client, HTTP Service)                  │
│                                                           │
│  - APIClient: Взаимодействие с backend API               │
│  - HTTP utilities, error handling                        │
└─────────────────────────────────────────────────────────┘
```

### Архитектурные слои:

1. **Presentation Layer**: React компоненты, Remix routes, UI logic
2. **Application Layer**: Бизнес-логика клиента, управление состоянием, системы
3. **Infrastructure Layer**: Внешние взаимодействия (API, storage)

---

## Структура проекта

> **📂 Детальная структура проекта с архитектурными границами и правилами импорта описана в [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)**

Основные директории приложения:

- **`src/presentation/web/react/src/routes/`** - React Router routes (Presentation Layer)  #structure:
- **`src/presentation/web/react/src/components/`** - React компоненты (Presentation Layer)  #structure:
- **`src/application/services/`** - Application Services (modal, keymap, focus, notification)  #structure:
- **`src/domain/`** - Domain Layer (entities, aggregates, events)  #structure:
- **`src/application/`** - Application Layer (Query/Command Handlers, CQRS)  #structure:
- **`src/infrastructure/`** - Infrastructure Layer (API, repositories, adapters)  #structure:
- **`src/composition/`** - Composition Root (DI Container)  #structure:
- **`src/presentation/web/react/src/hooks/`** - React Hooks  #structure:

См. [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) для полной информации о модулях, архитектурных границах и правилах импорта

---

## Доменные сущности

### Resource

Основная сущность - пароль с метаданными:

#### Resource интерфейс [#interface:Resource|#code]

```typescript
interface Resource {
  id: ResourceId;
  namespace: Namespace;     // Например: "social" (Value Object)
  name: ResourceName;       // Например: "facebook" (Value Object)
  secret: SecretField;      // Основной пароль (обязательное поле)
  customFields: CustomField[]; // Дополнительные поля
  createdAt: DateTime;      // ISO date
  updatedAt: DateTime;      // ISO date
}

type ResourceId = string  // UUID

interface SecretField {
  id: string;
  label: 'secret';          // Всегда константа "secret"
  value: string;            // Зашифрованное значение
  createdAt: string;
  updatedAt: string;
}

interface CustomField {
  id: string;
  label: string;            // Произвольная метка (email, username, etc.)
  value: string;            // Зашифрованное значение
  createdAt: string;
  updatedAt: string;
}
```

**Ключевые правила:**
- У каждого ресурса есть `namespace` и `name` (например: `[social]: facebook`)
- Поле `secret` обязательное и всегда одно
- Можно добавлять неограниченное количество `customFields`
- Все значения хранятся в зашифрованном виде на backend

### ResourceListItem

Упрощенная версия ресурса для отображения в списках:

#### ResourceListItem интерфейс [#interface:ResourceListItem|#code]

```typescript
interface ResourceListItem {
  id: ResourceId;
  namespace: string;        // Простая строка для отображения
  name: string;             // Простая строка для отображения
  secretPreview?: string;   // Первые символы + ***
  fieldsCount: number;
  updatedAt: DateTime;
}
```

### Namespace (Неймспейс)

Категория для группировки ресурсов:

#### Namespace интерфейс [#interface:Namespace|#code]

```typescript
interface Namespace {
  name: string;             // Например: "social", "work", "banking"
  resourceCount?: number;   // Количество ресурсов в этом неймспейсе
}
```

### Password Generation Options

Параметры для генерации паролей:

#### Password интерфейсы [#code]

```typescript
interface PasswordGenerationOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;  // Исключить похожие символы (O/0, l/1)
  customCharset?: string;
}

interface GeneratedPassword {
  password: string;
  strength: PasswordStrength;
}

interface PasswordStrength {
  score: number;              // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  feedback: string[];
}
```

---

## Основные системы

### Система модальности

Управляет режимами работы приложения (навигация/редактирование).

#### Types

```typescript
// src/application/services/modal/types.ts  #structure:

export type AppMode = 'navigation' | 'editing';

export interface ModeContext {
  mode: AppMode;
  route: RouteInfo;         // Объект с path и params
  state: ModeState | null;  // Состояние текущего режима
}

export interface RouteInfo {
  path: string;
  params: Record<string, string>;
}

export interface EditingContext {
  resourceId?: string;
  fieldId?: string;
  originalValue?: string;
}

export type ModeChangeListener = (context: ModeContext) => void;
```

#### ModalManager

Singleton класс для управления режимами:

```typescript
// src/application/services/modal/ModalManager.ts  #structure:

export class ModalManager {
  private mode: AppMode = 'navigation';
  private editingContext: EditingContext | null = null;
  private listeners = new Set<ModeChangeListener>();
  private route: string = '/';
  private routeParams: Record<string, string> = {};
  
  getMode(): AppMode {
    return this.mode;
  }
  
  getContext(): ModeContext {
    return {
      mode: this.mode,
      route: {
        path: this.route,
        params: this.routeParams || {}
      },
      state: this.mode === 'editing' && this.editingContext
        ? { type: 'editing', ...this.editingContext }
        : this.mode === 'navigation'
        ? { type: 'navigation', focusedElementId: null, scrollPosition: 0 }
        : null
    };
  }
  
  setRoute(route: string, params?: Record<string, string>): void {
    this.route = route;
    this.routeParams = params || {};
    this.notifyListeners();
  }
  
  enterNavigationMode(): void {
    if (this.mode === 'navigation') return;
    
    this.mode = 'navigation';
    this.editingContext = null;
    this.notifyListeners();
  }
  
  enterEditingMode(context: EditingContext): void {
    if (this.mode === 'editing') return;
    
    this.mode = 'editing';
    this.editingContext = context;
    this.notifyListeners();
  }
  
  getEditingContext(): EditingContext | null {
    return this.editingContext;
  }
  
  subscribe(listener: ModeChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    const context = this.getContext();
    this.listeners.forEach(listener => listener(context));
  }
}

// Singleton instance
export const modalManager = new ModalManager();
```

#### ModalContext (React)

```typescript
// src/application/services/modal/ModalContext.tsx  #structure:

import { createContext, useContext, useEffect, useState } from 'react';
import { modalManager } from './ModalManager';
import type { ModeContext, EditingContext, AppMode } from './types';

interface ModalContextValue {
  mode: AppMode;
  context: ModeContext;
  enterNavigationMode: () => void;
  enterEditingMode: (context: EditingContext) => void;
  getEditingContext: () => EditingContext | null;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<ModeContext>(modalManager.getContext());
  
  useEffect(() => {
    return modalManager.subscribe((newContext) => {
      setContext(newContext);
    });
  }, []);
  
  const value: ModalContextValue = {
    mode: context.mode,
    context,
    enterNavigationMode: () => modalManager.enterNavigationMode(),
    enterEditingMode: (ctx) => modalManager.enterEditingMode(ctx),
    getEditingContext: () => modalManager.getEditingContext()
  };
  
  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider');
  }
  return context;
}
```

#### Использование

```typescript
// Пример: Переход в режим редактирования поля
const { enterEditingMode } = useModalContext();

const handleEditField = (fieldId: string) => {
  enterEditingMode({
    resourceId: resource.id,
    fieldId: fieldId,
    originalValue: field.value
  });
};

// Пример: Выход из режима редактирования
const { enterNavigationMode } = useModalContext();

const handleCancelEdit = () => {
  enterNavigationMode();
};
```

---

### Система кеймапов

Управляет горячими клавишами в зависимости от контекста.

#### Types

```typescript
// src/application/services/keymap/types.ts  #structure:

export interface KeyBinding {
  key: string;              // 's', 'enter', 'escape'
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export interface ActionContext {
  mode: AppMode;
  route: string;            // Простая строка для совместимости с keymaps
  editingContext?: EditingContext;
  focusedElement?: HTMLElement;
  
  // Зависимости передаются через ActionContext (Dependency Injection)
  commandBus?: ICommandBus;           // Command Bus для UI команд
  modalManager?: ModalManager;
  focusManager?: FocusManager;
  notificationManager?: NotificationManager;
  
  [key: string]: any;
}

export type KeymapAction = (context: ActionContext) => void | Promise<void>;

export interface Keymap {
  id: string;
  name: string;
  binding: KeyBinding;
  action: KeymapAction;
  description: string;
  icon?: string;
  
  // Условия активации
  modes: AppMode[];
  routes?: string[];        // Если undefined - активен на всех роутах
  condition?: (context: ActionContext) => boolean;
}

export type KeymapChangeListener = () => void;
```

#### KeymapRegistry

Реестр всех кеймапов с проверкой активности:

```typescript
// src/application/services/keymap/KeymapRegistry.ts  #structure:

import { Keymap, KeyBinding, ActionContext, KeymapChangeListener } from './types';

export class KeymapRegistry {
  private keymaps = new Map<string, Keymap>();
  private listeners = new Set<KeymapChangeListener>();
  
  register(keymap: Keymap): void {
    this.keymaps.set(keymap.id, keymap);
    this.notifyListeners();
  }
  
  unregister(keymapId: string): void {
    this.keymaps.delete(keymapId);
    this.notifyListeners();
  }
  
  registerMultiple(keymaps: Keymap[]): void {
    keymaps.forEach(keymap => this.keymaps.set(keymap.id, keymap));
    this.notifyListeners();
  }
  
  getActiveKeymaps(context: ActionContext): Keymap[] {
    return Array.from(this.keymaps.values()).filter(keymap => 
      this.isKeymapActive(keymap, context)
    );
  }
  
  findByBinding(binding: KeyBinding, context: ActionContext): Keymap | undefined {
    return this.getActiveKeymaps(context).find(keymap =>
      this.bindingsMatch(keymap.binding, binding)
    );
  }
  
  private isKeymapActive(keymap: Keymap, context: ActionContext): boolean {
    // Проверка режима
    if (!keymap.modes.includes(context.mode)) {
      return false;
    }
    
    // Проверка роута (если указан)
    if (keymap.routes && !this.routeMatches(keymap.routes, context.route)) {
      return false;
    }
    
    // Дополнительное условие
    if (keymap.condition && !keymap.condition(context)) {
      return false;
    }
    
    return true;
  }
  
  private routeMatches(patterns: string[], route: string): boolean {
    return patterns.some(pattern => {
      // Простое сравнение или паттерн с параметрами
      if (pattern === route) return true;
      
      // /resources/:id -> /resources/123
      const regex = new RegExp(
        '^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$'
      );
      return regex.test(route);
    });
  }
  
  private bindingsMatch(a: KeyBinding, b: KeyBinding): boolean {
    return (
      a.key === b.key &&
      (a.ctrl ?? false) === (b.ctrl ?? false) &&
      (a.shift ?? false) === (b.shift ?? false) &&
      (a.alt ?? false) === (b.alt ?? false) &&
      (a.meta ?? false) === (b.meta ?? false)
    );
  }
  
  subscribe(listener: KeymapChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const keymapRegistry = new KeymapRegistry();
```

#### KeymapExecutor

Обработчик нажатий клавиш:

```typescript
// src/application/services/keymap/KeymapExecutor.ts  #structure:

import { KeyBinding, ActionContext } from './types';
import { KeymapRegistry } from './KeymapRegistry';
import { ModalManager } from '../modal/ModalManager';

export class KeymapExecutor {
  constructor(
    private registry: KeymapRegistry,
    private commandBus: ICommandBus,     // Command Bus добавлен
    private modalManager: ModalManager,
    private focusManager: FocusManager,
    private notificationManager: NotificationManager
  ) {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  
  async handleKeyDown(event: KeyboardEvent): Promise<void> {
    const binding = this.eventToBinding(event);
    const context = this.buildActionContext();
    
    const keymap = this.registry.findByBinding(binding, context);
    
    if (keymap) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        await keymap.action(context);
      } catch (error) {
        console.error('Keymap action failed:', error);
      }
    }
  }
  
  attachToWindow(): () => void {
    window.addEventListener('keydown', this.handleKeyDown);
    return () => window.removeEventListener('keydown', this.handleKeyDown);
  }
  
  private eventToBinding(event: KeyboardEvent): KeyBinding {
    return {
      key: event.key.toLowerCase(),
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey
    };
  }
  
  private buildActionContext(): ActionContext {
    const modalContext = this.modalManager.getContext();
    const editingContext = this.modalManager.getEditingContext();
    
    return {
      mode: modalContext.mode,
      route: modalContext.route,
      editingContext: editingContext || undefined,
      focusedElement: document.activeElement as HTMLElement,
      
      // Передаем зависимости в ActionContext (Dependency Injection)
      commandBus: this.commandBus,         // Command Bus
      modalManager: this.modalManager,
      focusManager: this.focusManager,
      notificationManager: this.notificationManager
    };
  }
}
```

#### KeymapContext (React)

```typescript
// src/application/services/keymap/KeymapContext.tsx  #structure:

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { keymapRegistry, KeymapRegistry } from './KeymapRegistry';
import { KeymapExecutor } from './KeymapExecutor';
import { modalManager } from '../modal/ModalManager';
import { focusManager } from '../focus/FocusManager';
import { notificationManager } from '../notification/NotificationManager';
import { getCommandBus } from '@/composition';  #structure:
import type { Keymap, ActionContext } from './types';

interface KeymapContextValue {
  registry: KeymapRegistry;
  activeKeymaps: Keymap[];
}

const KeymapContext = createContext<KeymapContextValue | null>(null);

// ✅ Dependency Injection: KeymapExecutor получает все необходимые зависимости
const commandBus = getCommandBus();
const keymapExecutor = new KeymapExecutor(
  keymapRegistry,
  commandBus,            // Command Bus через Composition Root
  modalManager,
  focusManager,
  notificationManager
);

export function KeymapProvider({ children }: { children: ReactNode }) {
  const [activeKeymaps, setActiveKeymaps] = useState<Keymap[]>([]);
  
  useEffect(() => {
    // Подписываемся на изменения в registry
    const unsubRegistry = keymapRegistry.subscribe(() => {
      updateActiveKeymaps();
    });
    
    // Подписываемся на изменения в modalManager
    const unsubModal = modalManager.subscribe(() => {
      updateActiveKeymaps();
    });
    
    // Подключаем обработчик клавиатуры
    const unsubKeyboard = keymapExecutor.attachToWindow();
    
    updateActiveKeymaps();
    
    return () => {
      unsubRegistry();
      unsubModal();
      unsubKeyboard();
    };
  }, []);
  
  const updateActiveKeymaps = () => {
    const context: ActionContext = {
      mode: modalManager.getMode(),
      route: modalManager.getContext().route,
      editingContext: modalManager.getEditingContext() || undefined
    };
    
    setActiveKeymaps(keymapRegistry.getActiveKeymaps(context));
  };
  
  const value: KeymapContextValue = {
    registry: keymapRegistry,
    activeKeymaps
  };
  
  return (
    <KeymapContext.Provider value={value}>
      {children}
    </KeymapContext.Provider>
  );
}

export function useKeymapContext() {
  const context = useContext(KeymapContext);
  if (!context) {
    throw new Error('useKeymapContext must be used within KeymapProvider');
  }
  return context;
}
```

#### Определения кеймапов

##### Navigation Keymaps
import { Keymap } from '../types';

/**
 * ✅ ПРАВИЛЬНО: Keymaps не импортируют другие Core Systems напрямую
 * Вместо этого используют ActionContext, который предоставляет нужные зависимости
 */
export const navigationKeymaps: Keymap[] = [
  {
    id: 'nav-down',
    name: 'Navigate Down',
    binding: { key: 'j' },
    action: (ctx) => {
      // FocusManager передается через ActionContext
      ctx.focusManager?.focusNext();
    },
    description: 'Move focus down',
    modes: ['navigation'],
    icon: 'arrow-down.svg'
  },
  {
    id: 'nav-up',
    name: 'Navigate Up',
    binding: { key: 'k' },
    action: (ctx) => {
      ctx.focusManager?.focusPrevious();
    },
    description: 'Move focus up',
    modes: ['navigation'],
    icon: 'arrow-up.svg'
  },
  {
    id: 'select',
    name: 'Select/Enter',
    binding: { key: 'enter' },
    action: async (ctx) => {
      const focused = ctx.focusManager?.getFocused();
      if (focused?.onEnter) {
        await focused.onEnter();
      }
    },
    description: 'Select focused item',
    modes: ['navigation'],
    icon: 'check.svg'
  },
  {
    id: 'nav-search',
    name: 'Search',
    binding: { key: '/' },
    action: () => {
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
    },
    description: 'Focus search',
    modes: ['navigation'],
    routes: ['/'],
    icon: 'search.svg'
  },
  {
    id: 'nav-home',
    name: 'Go to Home',
    binding: { key: 'h', shift: true },
    action: () => {
      window.location.href = '/';
    },
    description: 'Navigate to home page',
    modes: ['navigation']
  }
];

// src/application/services/keymap/keymaps/editing.ts  #structure:

import { Keymap } from '../types';

/**
 * ✅ ПРАВИЛЬНО: Используем ActionContext вместо прямого импорта
 */
export const editingKeymaps: Keymap[] = [
  {
    id: 'exit-edit-mode',
    name: 'Exit Edit Mode',
    binding: { key: 'escape' },
    action: (ctx) => {
      // ModalManager передается через ActionContext
      ctx.modalManager?.enterNavigationMode();
    },
    description: 'Exit edit mode',
    modes: ['editing'],
    icon: 'escape.svg'
  },
  {
    id: 'edit-save',
    name: 'Save Changes',
    binding: { key: 's', ctrl: true },
    action: async (ctx) => {
      // Эта функция будет переопределяться на каждой странице
      const saveHandler = (window as any).__saveHandler;
      if (saveHandler) {
        await saveHandler(ctx);
      }
    },
    description: 'Save changes',
    modes: ['editing'],
    icon: 'save.svg'
  }
];
```

##### Resource Keymaps

```typescript
// src/application/services/keymap/keymaps/resource.ts  #structure:

import { Keymap } from '../types';
import { DeleteResourceCommand } from '@/application/commands';  #structure:

/**
 * ✅ ПРАВИЛЬНО: Используем CommandBus через абстракцию
 * Не зависим от Browser API или конкретных реализаций
 */
export function createResourceKeymaps(): Keymap[] {
  return [
    {
      id: 'resource-delete',
      name: 'Delete Resource',
      binding: { key: 'd', shift: true },
      action: async (ctx) => {
        if (!confirm('Delete this resource?')) return;
        
        const resourceId = ctx.editingContext?.resourceId;
        if (!resourceId) return;
        
        // ✅ ПРАВИЛЬНО: Используем Command Bus (Port/Adapter)
        // Keymap не зависит от DOM API или UI реализации
        await ctx.commandBus?.dispatch(  // #interface:ICommandBus
          new DeleteResourceCommand(resourceId)  // #class:DeleteResourceCommand
        );
      },
      description: 'Delete resource',
      modes: ['navigation'],
      routes: ['/resources/:id'],
      icon: 'trash.svg'
    },
    {
      id: 'resource-add-field',
      name: 'Add Custom Field',
      binding: { key: 'a' },
      action: async (ctx) => {
        // ✅ Через Command Bus
        const { ShowNotificationCommand } = await import('@/application/commands');  #structure:
        await ctx.commandBus?.dispatch(
          new ShowNotificationCommand('Add field UI would open here', 'info')
        );
      },
      description: 'Add custom field',
      modes: ['navigation'],
      routes: ['/resources/:id', '/resources/new'],
      icon: 'plus.svg'
    },
    {
      id: 'resource-copy',
      name: 'Copy Secret',
      binding: { key: 'c' },
      action: async (ctx) => {
        // ✅ Через Command Bus
        const { CopyToClipboardCommand } = await import('@/application/commands');  #structure:
        const secretValue = ctx.editingContext?.secretValue || 'secret';
        await ctx.commandBus?.dispatch(
          new CopyToClipboardCommand(secretValue)
        );
      },
      description: 'Copy secret to clipboard',
      modes: ['navigation'],
      routes: ['/resources/:id'],
      icon: 'copy.svg'
    }
  ];
}

```typescript
// src/application/services/keymap/keymaps/index.ts  #structure:

import { KeymapRegistry } from '../KeymapRegistry';
import { navigationKeymaps } from './navigation';
import { editingKeymaps } from './editing';
import { createResourceKeymaps } from './resource';

export function registerAllKeymaps(registry: KeymapRegistry) {
  registry.registerMultiple([
    ...navigationKeymaps,
    ...editingKeymaps,
    ...createResourceKeymaps()
  ]);
}
```

---

### Система ф
