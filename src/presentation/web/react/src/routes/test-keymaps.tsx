// src/presentation/web/react/src/routes/test-keymaps.tsx
import { Link } from "react-router";
import { useTestKeymaps } from "../features/test-keymaps/model/useTestKeymaps";

/**
 * Тестовая страница для проверки Keymap системы
 * 
 * ✅ Чистый view компонент - только вызывает хук
 * ✅ Вся логика в композиционном хуке
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
  // ✅ Один композиционный хук - вся логика внутри
  const { counter, focusedIndex, items } = useTestKeymaps();

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

        {/* Focus Test Items */}
        <div className="bg-ctp-surface0 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-ctp-text mb-4">
            Focus Navigation Test
          </h2>
          <p className="text-ctp-subtext0 text-sm mb-4">
            Use <kbd className="px-2 py-1 bg-ctp-surface1 rounded">j</kbd> / 
            <kbd className="px-2 py-1 bg-ctp-surface1 rounded ml-1">k</kbd> to navigate
          </p>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className={`p-3 rounded transition-colors ${
                  focusedIndex === item.id
                    ? "bg-ctp-mauve text-ctp-base font-semibold"
                    : "bg-ctp-surface1 text-ctp-text"
                }`}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>

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
