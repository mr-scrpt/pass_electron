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

- **`app/routes/`** - Remix routes (Presentation Layer)
- **`app/components/`** - React компоненты (Presentation Layer)
- **`app/core/`** - Core Systems (modal, keymap, focus, notification)
- **`app/domain/`** - Domain Layer (entities, aggregates, events)
- **`app/application/`** - Application Layer (use cases)
- **`app/infrastructure/`** - Infrastructure Layer (API, repositories)
- **`app/hooks/`** - React Hooks
- **`app/types/`** - TypeScript типы (re-exports)

См. [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) для полной информации о модулях, архитектурных границах и правилах импорта

---

## Доменные сущности

### Resource (Ресурс)

Основная сущность приложения - набор паролей и связанных данных.

```typescript
interface Resource {
  id: string;
  namespace: string;        // Например: "social"
  name: string;             // Например: "facebook"
  secret: SecretField;      // Основной пароль (обязательное поле)
  customFields: CustomField[]; // Дополнительные поля
  createdAt: string;        // ISO date
  updatedAt: string;        // ISO date
}

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

```typescript
interface ResourceListItem {
  id: string;
  namespace: string;
  name: string;
  secretPreview?: string;   // Первые символы + ***
  fieldsCount: number;
  updatedAt: string;
}
```

### Namespace (Неймспейс)

Категория для группировки ресурсов:

```typescript
interface Namespace {
  name: string;             // Например: "social", "work", "banking"
  resourceCount?: number;   // Количество ресурсов в этом неймспейсе
}
```

### Password Generation Options

Параметры для генерации паролей:

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
// core/modal/types.ts

export type AppMode = 'navigation' | 'editing';

export interface ModeContext {
  mode: AppMode;
  route: string;
  metadata?: Record<string, any>;
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
// core/modal/ModalManager.ts

export class ModalManager {
  private mode: AppMode = 'navigation';
  private editingContext: EditingContext | null = null;
  private listeners = new Set<ModeChangeListener>();
  private route: string = '/';
  
  getMode(): AppMode {
    return this.mode;
  }
  
  getContext(): ModeContext {
    return {
      mode: this.mode,
      route: this.route,
      metadata: this.editingContext 
        ? { editing: this.editingContext }
        : undefined
    };
  }
  
  setRoute(route: string): void {
    this.route = route;
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
// core/modal/ModalContext.tsx

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
// core/keymap/types.ts

export interface KeyBinding {
  key: string;              // 's', 'enter', 'escape'
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export interface ActionContext {
  mode: AppMode;
  route: string;
  editingContext?: EditingContext;
  focusedElement?: HTMLElement;
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
// core/keymap/KeymapRegistry.ts

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
// core/keymap/KeymapExecutor.ts

import { KeyBinding, ActionContext } from './types';
import { KeymapRegistry } from './KeymapRegistry';
import { ModalManager } from '../modal/ModalManager';

export class KeymapExecutor {
  constructor(
    private registry: KeymapRegistry,
    private modalManager: ModalManager
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
      focusedElement: document.activeElement as HTMLElement
    };
  }
}
```

#### KeymapContext (React)

```typescript
// core/keymap/KeymapContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { keymapRegistry, KeymapRegistry } from './KeymapRegistry';
import { KeymapExecutor } from './KeymapExecutor';
import { modalManager } from '../modal/ModalManager';
import type { Keymap, ActionContext } from './types';

interface KeymapContextValue {
  registry: KeymapRegistry;
  activeKeymaps: Keymap[];
}

const KeymapContext = createContext<KeymapContextValue | null>(null);

const keymapExecutor = new KeymapExecutor(keymapRegistry, modalManager);

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

```typescript
// core/keymap/keymaps/navigation.ts

import { Keymap } from '../types';
import { focusManager } from '../../focus/FocusManager';

export const navigationKeymaps: Keymap[] = [
  {
    id: 'nav-down',
    name: 'Navigate Down',
    binding: { key: 'j' },
    action: () => focusManager.focusNext(),
    description: 'Move focus down',
    modes: ['navigation'],
    icon: 'arrow-down.svg'
  },
  {
    id: 'nav-up',
    name: 'Navigate Up',
    binding: { key: 'k' },
    action: () => focusManager.focusPrevious(),
    description: 'Move focus up',
    modes: ['navigation'],
    icon: 'arrow-up.svg'
  },
  {
    id: 'nav-enter',
    name: 'Select/Enter',
    binding: { key: 'enter' },
    action: async (ctx) => {
      const focused = focusManager.getFocused();
      if (focused?.onEnter) {
        await focused.onEnter();
      }
    },
    description: 'Select item or enter edit mode',
    modes: ['navigation'],
    icon: 'enter.svg'
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
```

##### Editing Keymaps

```typescript
// core/keymap/keymaps/editing.ts

import { Keymap } from '../types';
import { modalManager } from '../../modal/ModalManager';

export const editingKeymaps: Keymap[] = [
  {
    id: 'edit-escape',
    name: 'Exit Edit Mode',
    binding: { key: 'escape' },
    action: () => {
      modalManager.enterNavigationMode();
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
// core/keymap/keymaps/resource.ts

import { Keymap } from '../types';
import { modalManager } from '../../modal/ModalManager';
import { apiClient } from '~/lib/api/client';
import { notificationManager } from '../../notification/NotificationManager';

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
        
        try {
          await apiClient.deleteResource(resourceId);
          notificationManager.success('Resource deleted');
          window.location.href = '/';
        } catch (error) {
          notificationManager.error('Failed to delete resource');
        }
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
      action: (ctx) => {
        // Триггерим добавление поля через custom event
        const event = new CustomEvent('add-custom-field');
        window.dispatchEvent(event);
      },
      description: 'Add custom field',
      modes: ['navigation'],
      routes: ['/resources/:id', '/resources/new'],
      icon: 'plus.svg'
    },
    {
      id: 'resource-copy-secret',
      name: 'Copy Secret',
      binding: { key: 'c' },
      action: async (ctx) => {
        const event = new CustomEvent('copy-secret');
        window.dispatchEvent(event);
      },
      description: 'Copy secret to clipboard',
      modes: ['navigation'],
      routes: ['/resources/:id'],
      icon: 'copy.svg'
    }
  ];
}
```

##### Index (регистрация)

```typescript
// core/keymap/keymaps/index.ts

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
