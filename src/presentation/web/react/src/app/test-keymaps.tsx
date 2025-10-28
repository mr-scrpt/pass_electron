// src/presentation/web/react/src/routes/test-keymaps.tsx
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { useNotificationManager } from "../contexts/NotificationContext";
import { List } from "../shared/ui/NavigationList";
import { withKeymapNavigation } from "../shared/keymap/withKeymapNavigation";
import { testKeymapConfig } from "../features/test-keymaps/config/keymaps";

/**
 * Тип элемента для тестового списка
 */
type TestItem = {
  id: number;
  name: string;
};

/**
 * ✅ Создаем контейнер с кеймапами через HOC
 * 
 * Чистый компонент List оборачивается HOC
 * который добавляет логику фокуса, кеймапы и highlight стили
 */
const KeymapNavigationList = withKeymapNavigation<TestItem>(List, {
  keymapConfig: testKeymapConfig,
  getDeps: ({ focusNext, focusPrevious }) => ({
    // Из navigation получаем focusNext/Previous
    focusNext,
    focusPrevious,
    // Добавляем остальные deps из компонента
    incrementCounter: () => {},  // будет переопределено ниже
    showSuccess: () => {},
    showWarning: () => {},
    showError: () => {},
    showInfo: () => {},
  }),
});

/**
 * Тестовая страница для проверки Keymap системы
 * 
 * ✅ Использует чистые компоненты + HOC
 * ✅ Компоненты переиспользуемые
 * ✅ Кеймапы добавляются через HOC
 * 
 * Горячие клавиши:
 * - Ctrl+1 → Success notification
 * - Ctrl+2 → Warning notification  
 * - Ctrl+3 → Error notification
 * - Ctrl+4 → Info notification
 * - j → Focus next
 * - k → Focus previous
 */
export default function TestKeymaps() {
  const [counter, setCounter] = useState(0);
  const notification = useNotificationManager();

  // ✅ Данные для списка (чистые, без isFocused)
  const items: TestItem[] = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    name: `Test Item ${i}`,
  }));

  // ✅ Side effect: показываем success после инкремента
  useEffect(() => {
    if (counter > 0) {
      notification.notify({
        level: "success",
        message: `✅ Success! Counter: ${counter}`,
        duration: 3000,
      });
    }
  }, [counter, notification]);

  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="text-ctp-mauve hover:text-ctp-pink mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-ctp-mauve mb-2">
            🎹 Keymap Test Page
          </h1>
          <p className="text-ctp-subtext0">
            Test keyboard shortcuts and notification system
          </p>
        </div>

        {/* Counter */}
        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-ctp-text mb-2">
            Counter: <span className="text-ctp-green">{counter}</span>
          </h2>
          <p className="text-ctp-subtext0 text-sm">
            Press <kbd className="px-2 py-1 bg-ctp-surface1 rounded">Ctrl+1</kbd> to increment
          </p>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-ctp-text mb-4">
            Available Shortcuts
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <kbd className="px-2 py-1 bg-ctp-surface1 rounded text-ctp-green">Ctrl+1</kbd>
              <span className="ml-2 text-ctp-subtext0">Success notification</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-ctp-surface1 rounded text-ctp-yellow">Ctrl+2</kbd>
              <span className="ml-2 text-ctp-subtext0">Warning notification</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-ctp-surface1 rounded text-ctp-red">Ctrl+3</kbd>
              <span className="ml-2 text-ctp-subtext0">Error notification</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-ctp-surface1 rounded text-ctp-blue">Ctrl+4</kbd>
              <span className="ml-2 text-ctp-subtext0">Info notification</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-ctp-surface1 rounded text-ctp-mauve">j</kbd>
              <span className="ml-2 text-ctp-subtext0">Focus next</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-ctp-surface1 rounded text-ctp-mauve">k</kbd>
              <span className="ml-2 text-ctp-subtext0">Focus previous</span>
            </div>
          </div>
        </div>

        {/* Focus Test Items - используем HOC компонент */}
        <KeymapNavigationList
          items={items}
          getItemId={(item) => item.id}
          renderItem={(item) => item.name}
          title="Focus Navigation Test"
          description="Use j / k to navigate"
        />

        {/* Test Error Link */}
        <div className="mt-8 p-6 bg-ctp-red/10 border-2 border-ctp-red rounded-lg">
          <h3 className="text-lg font-semibold text-ctp-red mb-2">
            🧨 Test Error Boundary
          </h3>
          <p className="text-ctp-subtext0 mb-4">
            Click the button below to test the ErrorBoundary system
          </p>
          <Link
            to="/test-error"
            className="inline-block px-4 py-2 bg-ctp-red text-ctp-base rounded hover:bg-ctp-maroon transition-colors"
          >
            Trigger Error →
          </Link>
        </div>
      </div>
    </div>
  );
}
