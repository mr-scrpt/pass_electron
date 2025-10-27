// src/presentation/web/react/src/features/test-keymaps/config/keymaps.ts

/**
 * Типизируем зависимости для этой feature
 */
export type TestKeymapActions = {
  incrementCounter: () => void;
  showSuccess: (counter: number) => void;
  showWarning: () => void;
  showError: () => void;
  showInfo: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
};

/**
 * Конфигурация кеймапа с фабрикой action
 */
export type KeymapConfig<TDeps> = {
  key: string;
  description: string;
  context: {
    route?: string;
    mode?: "navigation" | "editing";
  };
  action: (deps: TDeps) => void | Promise<void>;
};

/**
 * Конфиг кеймапов для тестовой страницы
 * 
 * 📝 NOTE: Это пример для будущего - как можно сделать декларативные конфиги
 * Сейчас используется императивный подход в useTestKeymaps.ts
 * 
 * ✅ Чистые данные - без React, без зависимостей
 * ✅ TypeScript проверяет что все deps предоставлены
 * 
 * @layer Presentation/Features
 */
export const testKeymapConfigs: KeymapConfig<TestKeymapActions>[] = [
  {
    key: "Ctrl+1",
    description: "Show success notification",
    context: { route: "/test-keymaps", mode: "navigation" },
    action: (deps) => {
      deps.incrementCounter();
      // deps.showSuccess вызовется в хуке после инкремента
    },
  },
  {
    key: "Ctrl+2",
    description: "Show warning notification",
    context: { route: "/test-keymaps", mode: "navigation" },
    action: (deps) => {
      deps.showWarning();
    },
  },
  {
    key: "Ctrl+3",
    description: "Show error notification",
    context: { route: "/test-keymaps", mode: "navigation" },
    action: (deps) => {
      deps.showError();
    },
  },
  {
    key: "Ctrl+4",
    description: "Show info notification",
    context: { route: "/test-keymaps", mode: "navigation" },
    action: (deps) => {
      deps.showInfo();
    },
  },
  {
    key: "j",
    description: "Focus next item",
    context: { route: "/test-keymaps", mode: "navigation" },
    action: (deps) => {
      deps.focusNext();
    },
  },
  {
    key: "k",
    description: "Focus previous item",
    context: { route: "/test-keymaps", mode: "navigation" },
    action: (deps) => {
      deps.focusPrevious();
    },
  },
];
