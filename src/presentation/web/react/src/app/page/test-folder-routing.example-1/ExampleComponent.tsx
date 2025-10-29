/**
 * Вспомогательный компонент для Example 1
 * ✅ Этот файл НЕ становится роутом!
 * Только route.tsx файлы становятся роутами.
 */
export function ExampleComponent() {
  return (
    <div className="bg-ctp-blue/20 border-2 border-ctp-blue p-4 rounded mt-4">
      <h4 className="text-lg font-semibold text-ctp-blue mb-2">
        ✅ Компонент из того же каталога
      </h4>
      <p className="text-ctp-text">
        Этот компонент находится в той же папке что и роут:
      </p>
      <code className="block bg-ctp-base p-2 rounded text-ctp-green text-sm mt-2">
        src/app/page/test-folder-routing.example-1/ExampleComponent.tsx
      </code>
      <p className="text-ctp-subtext0 mt-2">
        💡 Это файл <strong>НЕ роут</strong>, а обычный компонент!
      </p>
    </div>
  );
}
