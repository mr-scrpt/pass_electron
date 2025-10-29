/**
 * Index page для /test-folder-routing
 * URL: /test-folder-routing
 *
 * ⚠️ Папка называется "test-folder-routing._index" с ТОЧКОЙ!
 */
export default function TestFolderRoutingIndex() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-ctp-text mb-4">
        Index Page 222
      </h2>
      <p className="text-ctp-subtext0 mb-4">
        Это главная страница раздела. Файл находится в:
      </p>
      <code className="block bg-ctp-base p-4 rounded text-ctp-green mb-4">
        src/app/page/test-folder-routing._index/route.tsx
      </code>

      <div className="bg-ctp-mantle p-4 rounded mb-4">
        <h3 className="text-lg font-semibold text-ctp-mauve mb-2">
          ⚠️ Важно! Точки в названии папки!
        </h3>
        <p className="text-ctp-text mb-2">
          Папка называется:{" "}
          <code className="text-ctp-yellow">test-folder-routing._index</code>
        </p>
        <p className="text-ctp-subtext0">
          Точка в названии папки создает вложенность URL!
        </p>
      </div>

      <div className="bg-ctp-blue/20 border-2 border-ctp-blue p-4 rounded">
        <h3 className="text-lg font-semibold text-ctp-blue mb-2">
          ✅ Folder-Based Routing работает!
        </h3>
        <p className="text-ctp-text">
          Этот роут создан через папку с{" "}
          <code className="text-ctp-green">route.tsx</code> файлом.
        </p>
      </div>
    </div>
  );
}
