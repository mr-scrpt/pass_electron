//  src/presentation/web/react/src/app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";

// ✅ Инициализация приложения (выполняется и на сервере и на клиенте)
import "./setup";

import { getValidatedNotificationManager } from "@/main/composition";
import { NotificationProvider } from "./provider/notification.provider";
import "../styles/tailwind.css";
import { useNotificationManager } from "@/platform/web/hook/useNotificationManager";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-ctp-base text-ctp-text">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  const notificationManager = useNotificationManager();

  return (
    <NotificationProvider manager={notificationManager}>
      <Outlet />
    </NotificationProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

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
