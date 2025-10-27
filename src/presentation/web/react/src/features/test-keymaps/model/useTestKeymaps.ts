// src/presentation/web/react/src/features/test-keymaps/model/useTestKeymaps.ts
import { useState, useEffect } from "react";
import { useKeymapListener, useKeymap } from "../../../hooks/useKeymap";
import { useNotificationManager } from "../../../contexts/NotificationContext";

/**
 * Композиционный хук для тестовой страницы кеймапов
 * 
 * ✅ Содержит всю логику (state, notifications, keymaps)
 * ✅ Чистый view компонент - только вызывает этот хук
 * 
 * @layer Presentation/Features
 */
export function useTestKeymaps() {
  const [counter, setCounter] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const notification = useNotificationManager();

  // ✅ Активируем слушатель для этого роута
  useKeymapListener({
    route: "/test-keymaps",
    mode: "navigation",
  });

  // ✅ Регистрируем клавиши с биндингом к state/notifications
  useKeymap({
    key: "Ctrl+1",
    context: { route: "/test-keymaps", mode: "navigation" },
    description: "Success notification + increment counter",
    action: () => {
      setCounter(c => c + 1);
    },
  });

  useKeymap({
    key: "Ctrl+2",
    context: { route: "/test-keymaps", mode: "navigation" },
    description: "Warning notification",
    action: () => {
      notification.notify({
        level: "warning",
        message: "⚠️ Warning: This is a test warning",
        duration: 3000,
      });
    },
  });

  useKeymap({
    key: "Ctrl+3",
    context: { route: "/test-keymaps", mode: "navigation" },
    description: "Error notification",
    action: () => {
      notification.notify({
        level: "error",
        message: "❌ Error: This is a test error",
        duration: 3000,
      });
    },
  });

  useKeymap({
    key: "Ctrl+4",
    context: { route: "/test-keymaps", mode: "navigation" },
    description: "Info notification",
    action: () => {
      notification.notify({
        level: "info",
        message: "ℹ️ Info: This is a test info message",
        duration: 3000,
      });
    },
  });

  useKeymap({
    key: "J",  // ✅ KeymapExecutor normalizeKey делает toUpperCase()
    context: { route: "/test-keymaps", mode: "navigation" },
    description: "Focus next item",
    action: () => {
      setFocusedIndex(i => {
        const newIndex = (i + 1) % 5;
        notification.notify({
          level: "info",
          message: `Focus: Item ${newIndex}`,
          duration: 1000,
        });
        return newIndex;
      });
    },
  });

  useKeymap({
    key: "K",  // ✅ KeymapExecutor normalizeKey делает toUpperCase()
    context: { route: "/test-keymaps", mode: "navigation" },
    description: "Focus previous item",
    action: () => {
      setFocusedIndex(i => {
        const newIndex = (i - 1 + 5) % 5;
        notification.notify({
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
      notification.notify({
        level: "success",
        message: `✅ Success! Counter: ${counter}`,
        duration: 3000,
      });
    }
  }, [counter, notification]);

  // ✅ Возвращаем только то что нужно для UI
  return {
    counter,
    focusedIndex,
    items: Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Test Item ${i}`,
    })),
  };
}
