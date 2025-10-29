/**
 * Example 2 page
 * URL: /test-folder-routing/example-2
 * 
 * ⚠️ Папка называется "test-folder-routing.example-2" с ТОЧКАМИ!
 */
export default function Example2() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-ctp-text mb-4">
        Example 2 Page
      </h2>
      <p className="text-ctp-subtext0 mb-4">
        Файл роута:
      </p>
      <code className="block bg-ctp-base p-4 rounded text-ctp-green mb-4">
        src/app/page/test-folder-routing.example-2/route.tsx
      </code>

      <div className="bg-ctp-mantle p-4 rounded mb-4">
        <h3 className="text-lg font-semibold text-ctp-peach mb-2">
          📁 Правильное именование папок
        </h3>
        <p className="text-ctp-text mb-2">
          ✅ <code className="text-ctp-green">test-folder-routing.example-2</code>
        </p>
        <p className="text-ctp-text mb-2">
          ❌ <code className="text-ctp-red line-through">test-folder-routing/example-2</code>
        </p>
        <p className="text-ctp-subtext0 mt-4">
          <strong>Правило:</strong> Точки в названии папки создают вложенность URL!
        </p>
      </div>

      <div className="bg-ctp-surface1 p-4 rounded">
        <h3 className="text-lg font-semibold text-ctp-blue mb-2">
          📂 Что можно хранить в папке:
        </h3>
        <ul className="list-disc list-inside space-y-2 text-ctp-subtext0">
          <li>
            <code className="text-ctp-green">route.tsx</code> - определяет роут
          </li>
          <li>
            <code className="text-ctp-yellow">*.tsx</code> - компоненты (НЕ роуты)
          </li>
          <li>
            <code className="text-ctp-blue">*.ts</code> - утилиты, хуки
          </li>
          <li>
            <code className="text-ctp-pink">*.css</code> - стили
          </li>
          <li>
            И любые другие файлы!
          </li>
        </ul>
      </div>
    </div>
  );
}
