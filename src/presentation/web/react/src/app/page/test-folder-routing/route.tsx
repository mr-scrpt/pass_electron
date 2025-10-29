import { Outlet, Link } from "react-router";

/**
 * Layout для /test-folder-routing
 * Демонстрация folder-based routing в React Router v7
 */
export default function TestFolderRoutingLayout() {
  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-ctp-text mb-6">
          ✅ Folder-Based Routing Test 11
        </h1>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-ctp-mauve mb-4">
            Навигация:
          </h2>
          <div className="flex gap-4">
            <Link
              to="/test-folder-routing"
              className="px-4 py-2 bg-ctp-blue text-ctp-base rounded hover:bg-ctp-sapphire"
            >
              Index
            </Link>
            <Link
              to="/test-folder-routing/example-1"
              className="px-4 py-2 bg-ctp-green text-ctp-base rounded hover:bg-ctp-teal"
            >
              Example 1
            </Link>
            <Link
              to="/test-folder-routing/example-2"
              className="px-4 py-2 bg-ctp-peach text-ctp-base rounded hover:bg-ctp-yellow"
            >
              Example 2
            </Link>
          </div>
        </div>

        {/* ✅ Дочерние роуты рендерятся здесь */}
        <div className="bg-ctp-surface0 p-6 rounded-lg">
          <Outlet />
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
