// src/presentation/web/react/src/features/test-keymaps/config/keymaps.ts
import type { FeatureKeymapConfig } from "../../../shared/keymap/types";

/**
 * Типизируем зависимости для этой feature
 * 
 * ✅ Это контракт - что должен предоставить композиционный хук
 * ✅ TypeScript проверит что все deps переданы
 */
export type TestKeymapDeps = {
  // Navigation mode
  incrementCounter: () => void;
  showSuccess: (counter: number) => void;
  showWarning: () => void;
  showError: () => void;
  showInfo: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
};

/**
 * Конфиг кеймапов для тестовой страницы
 * 
 * ✅ Несколько режимов (navigation) в одной feature
 * ✅ Одна клавиша может иметь разные действия в разных режимах
 * ✅ Слушатели автоматически активируются для каждого режима
 * ✅ Чистые данные - без React, без зависимостей
 * 
 * @layer Presentation/Features
 */
export const testKeymapConfig: FeatureKeymapConfig<TestKeymapDeps> = {
  // Режим навигации
  navigation: {
    route: "/test-keymaps",
    mode: "navigation",
    keymaps: [
      {
        key: "Ctrl+1",
        description: "Increment counter + success notification",
        action: (deps) => {
          deps.incrementCounter();
        },
      },
      {
        key: "Ctrl+2",
        description: "Show warning notification",
        action: (deps) => {
          deps.showWarning();
        },
      },
      {
        key: "Ctrl+3",
        description: "Show error notification",
        action: (deps) => {
          deps.showError();
        },
      },
      {
        key: "Ctrl+4",
        description: "Show info notification",
        action: (deps) => {
          deps.showInfo();
        },
      },
      {
        key: "J",  // ✅ Uppercase - KeymapExecutor.normalizeKey делает toUpperCase()
        description: "Focus next item",
        action: (deps) => {
          deps.focusNext();
        },
      },
      {
        key: "K",  // ✅ Uppercase - KeymapExecutor.normalizeKey делает toUpperCase()
        description: "Focus previous item",
        action: (deps) => {
          deps.focusPrevious();
        },
      },
    ],
  },
};
