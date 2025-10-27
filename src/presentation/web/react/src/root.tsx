//  src/presentation/web/react/src/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, isRouteErrorResponse } from "react-router";
import { Toaster } from "sonner";
import { initializeApp } from "./init";
import { createPlatformDependencies } from "../configs/platform.config";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./styles/tailwind.css";

/**
 * ✅ ЕДИНСТВЕННОЕ место инициализации ServiceContainer
 * 
 * 1. Получаем platform-specific зависимости (logger, notificationManager)
 * 2. Передаем в initializeApp
 * 3. ServiceContainer создает бизнес-слой (repository, handlers)
 * 
 * React НЕ знает какая платформа (Web или Electron).
 */
const deps = createPlatformDependencies();
const appServices = initializeApp(deps);

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-ctp-base text-ctp-text">
        {children}
        <Toaster 
          position="top-right"
          richColors
          theme="dark"
          expand={false}
          duration={4000}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <NotificationProvider manager={appServices.notificationManager}>
      <Outlet />
    </NotificationProvider>
  );
}

/**
 * Root ErrorBoundary - перехватывает все необработанные ошибки
 * 
 * Автоматически вызывается React Router когда:
 * - loader/action выбрасывает ошибку
 * - компонент роута выбрасывает ошибку
 * - любой дочерний компонент выбрасывает ошибку
 * 
 * @layer Presentation
 */
export function ErrorBoundary() {
  const error = useRouteError();

  // ❌ НЕ можем использовать useNotificationManager здесь!
  // ErrorBoundary рендерится ВМЕСТО Root, то есть ВНЕ NotificationProvider
  // Уведомления показывать нельзя, только UI

  // HTTP ошибки (404, 500, etc)
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ctp-base">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-ctp-red mb-4">
            {error.status}
          </h1>
          <h2 className="text-2xl font-semibold text-ctp-text mb-2">
            {error.statusText}
          </h2>
          <p className="text-ctp-subtext0">{error.data}</p>
        </div>
      </div>
    );
  }

  // JavaScript ошибки
  if (error instanceof Error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ctp-base p-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-ctp-red mb-4">
            Something went wrong
          </h1>
          <p className="text-ctp-text mb-4">{error.message}</p>
          {import.meta.env.DEV && error.stack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-ctp-mauve mb-2">
                Stack Trace (dev only)
              </summary>
              <pre className="text-left bg-ctp-surface0 text-ctp-text p-4 rounded overflow-auto text-sm">
                {error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Неизвестные ошибки
  return (
    <div className="min-h-screen flex items-center justify-center bg-ctp-base">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ctp-red mb-4">Unknown Error</h1>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
