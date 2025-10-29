import { Link } from "react-router";

/**
 * Главная страница тестирования ErrorBoundary
 * URL: /errors-test
 */
export default function ErrorsTestIndex() {
  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-ctp-text mb-8">
          Error Handling Test Suite
        </h1>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-ctp-mauve mb-4">
            1. HTTP Errors
          </h2>
          <p className="text-ctp-subtext0 mb-4">
            → <code>handleRouteError</code> → <code>HttpErrorView</code>
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/errors-test/http-404"
              className="px-4 py-2 bg-ctp-red text-ctp-base rounded hover:bg-ctp-maroon text-center"
            >
              404 Not Found
            </Link>
            <Link
              to="/errors-test/http-500"
              className="px-4 py-2 bg-ctp-red text-ctp-base rounded hover:bg-ctp-maroon text-center"
            >
              500 Server Error
            </Link>
          </div>
        </div>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-ctp-mauve mb-4">
            2. Platform Errors
          </h2>
          <p className="text-ctp-subtext0 mb-4">
            → <code>handlePlatformError</code> → <code>ErrorView</code>
          </p>
          <Link
            to="/errors-test/platform"
            className="block px-4 py-2 bg-ctp-peach text-ctp-base rounded hover:bg-ctp-yellow text-center"
          >
            DI Error
          </Link>
        </div>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-ctp-mauve mb-4">
            3. Domain Errors
          </h2>
          <p className="text-ctp-subtext0 mb-4">
            → <code>handleIError</code> → <code>ErrorView</code>
            <br />
            <span className="text-ctp-red">⚠️ Плохая практика!</span>
          </p>
          <Link
            to="/errors-test/validation"
            className="block px-4 py-2 bg-ctp-yellow text-ctp-base rounded hover:bg-ctp-peach text-center"
          >
            Validation Errors
          </Link>
        </div>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-ctp-mauve mb-4">
            4. JavaScript Errors
          </h2>
          <p className="text-ctp-subtext0 mb-4">
            → <code>handleJavaScriptError</code> → <code>ErrorView</code>
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/errors-test/javascript"
              className="px-4 py-2 bg-ctp-teal text-ctp-base rounded hover:bg-ctp-sky text-center"
            >
              TypeError
            </Link>
            <Link
              to="/errors-test/network"
              className="px-4 py-2 bg-ctp-teal text-ctp-base rounded hover:bg-ctp-sky text-center"
            >
              Network Error
            </Link>
          </div>
        </div>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-ctp-mauve mb-4">
            5. Expected Errors (✅ Правильно)
          </h2>
          <p className="text-ctp-subtext0 mb-4">
            <span className="text-ctp-green">
              ✅ НЕ попадают в ErrorBoundary!
            </span>
            <br />
            Показываются через notifications + в UI
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/errors-test/mutation-validation"
              className="px-4 py-2 bg-ctp-green text-ctp-base rounded hover:bg-ctp-teal text-center"
            >
              Mutation: Validation (useMutation)
            </Link>
            <Link
              to="/errors-test/mutation-business"
              className="px-4 py-2 bg-ctp-green text-ctp-base rounded hover:bg-ctp-teal text-center"
            >
              Mutation: Business Rule (useMutation)
            </Link>
            <Link
              to="/errors-test/query"
              className="px-4 py-2 bg-ctp-green text-ctp-base rounded hover:bg-ctp-teal text-center"
            >
              Query: Validation (useValidatedQuery)
            </Link>
          </div>
        </div>

        <div className="mt-8">
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
