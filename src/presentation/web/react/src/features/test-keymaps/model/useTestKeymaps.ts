// src/presentation/web/react/src/features/test-keymaps/model/useTestKeymaps.ts
import { useState, useEffect } from "react";
import { useKeymapListener } from "../../../hooks/useKeymap";
import { useKeymaps } from "../../../shared/keymap/useKeymaps";
import { useNotification } from "../../../shared/provider/NotificationContext";
import { testKeymapConfig } from "../config/keymaps";

/**
 * Тип элемента списка для навигации
 */
type NavigationItem = {
  id: number;
  name: string;
  isFocused: boolean;  // ✅ Флаг фокуса - компонент не знает логику
};

/**
 * Композиционный хук для тестовой страницы кеймапов
 * 
 * ✅ Биндит конфиг кеймапов к зависимостям (state, notifications)
 * ✅ Возвращает только то что нужно для UI
 * ✅ Вся логика кеймапов в декларативном конфиге
 * ✅ Data Enrichment - обогащает items флагом isFocused
 * 
 * @layer Presentation/Features
 */
export function useTestKeymaps(): { counter: number; items: NavigationItem[] } {
  const [counter, setCounter] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { notificationManager } = useNotification();

  // ✅ Активируем слушатель для navigation режима
  // (нужно вручную, так как кол-во режимов может быть динамическим)
  useKeymapListener({
    route: "/test-keymaps",
    mode: "navigation",
  });

  // ✅ Биндим конфиг к зависимостям (state + notifications)
  useKeymaps(testKeymapConfig, {
    incrementCounter: () => {
      setCounter(c => c + 1);
    },
    showSuccess: (counter: number) => {
      notificationManager.notify({
        level: "success",
        message: `✅ Success! Counter: ${counter}`,
        duration: 3000,
      });
    },
    showWarning: () => {
      notificationManager.notify({
        level: "warning",
        message: "⚠️ Warning: This is a test warning",
        duration: 3000,
      });
    },
    showError: () => {
      notificationManager.notify({
        level: "error",
        message: "❌ Error: This is a test error",
        duration: 3000,
      });
    },
    showInfo: () => {
      notificationManager.notify({
        level: "info",
        message: "ℹ️ Info: This is a test info message",
        duration: 3000,
      });
    },
    focusNext: () => {
      setFocusedIndex(i => {
        const newIndex = (i + 1) % 5;
        notificationManager.notify({
          level: "info",
          message: `Focus: Item ${newIndex}`,
          duration: 1000,
        });
        return newIndex;
      });
    },
    focusPrevious: () => {
      setFocusedIndex(i => {
        const newIndex = (i - 1 + 5) % 5;
        notificationManager.notify({
          level: "info",
          message: `Focus: Item ${newIndex}`,
          duration: 1000,
        });
        return newIndex;
      });
    },
  });

  // ✅ Side effect: показываем success после инкремента counter
  useEffect(() => {
    if (counter > 0) {
      notificationManager.notify({
        level: "success",
        message: `✅ Success! Counter: ${counter}`,
        duration: 3000,
      });
    }
  }, [counter, notificationManager]);

  // ✅ Возвращаем обогащенные данные - компонент НЕ знает про focusedIndex
  return {
    counter,
    // Обогащаем items флагом isFocused
    items: Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Test Item ${i}`,
      isFocused: focusedIndex === i,  // ✅ Логика фокуса скрыта от компонента
    })),
  };
}
