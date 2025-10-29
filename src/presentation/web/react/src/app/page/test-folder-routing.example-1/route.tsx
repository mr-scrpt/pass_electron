import { ExampleComponent } from "./ExampleComponent";

/**
 * Example 1 page
 * URL: /test-folder-routing/example-1
 * 
 * ⚠️ Папка называется "test-folder-routing.example-1" с ТОЧКАМИ!
 */
export default function Example1() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-ctp-text mb-4">
        Example 1 Page
      </h2>
      <p className="text-ctp-subtext0 mb-4">
        Файл роута:
      </p>
      <code className="block bg-ctp-base p-4 rounded text-ctp-green mb-4">
        src/app/page/test-folder-routing.example-1/route.tsx
      </code>

      <div className="bg-ctp-mantle p-4 rounded mb-4">
        <h3 className="text-lg font-semibold text-ctp-mauve mb-2">
          🎯 Коллокация компонентов
        </h3>
        <p className="text-ctp-text mb-2">
          Папка: <code className="text-ctp-yellow">test-folder-routing.example-1</code>
        </p>
        <p className="text-ctp-subtext0">
          В этой же папке есть компонент <code className="text-ctp-green">ExampleComponent.tsx</code>
        </p>
        <p className="text-ctp-subtext0 mt-2">
          Он НЕ становится роутом - только <code className="text-ctp-green">route.tsx</code> это роут!
        </p>
      </div>

      {/* ✅ Используем компонент из той же папки */}
      <ExampleComponent />
    </div>
  );
}
