//  src/presentation/web/react/src/app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

// ✅ Инициализация приложения (выполняется и на сервере и на клиенте)
import "./setup";

import { orElse } from "@/main/shared";
import { NotificationProvider } from "./provider/notification.provider";
import { useNotificationManager, useLogger } from "@/platform";
import {
  handleRouteError,
  handlePlatformError,
  handleIError,
  handleJavaScriptError,
  handleUnknown,
} from "@/shared/error-boundary";
import "../styles/tailwind.css";

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
  const logger = useLogger();

  // ✅ Монадическая цепочка обработчиков с orElse
  const component = orElse(() => handlePlatformError(error, logger))(
    orElse(() => handleIError(error, logger))(
      orElse(() => handleJavaScriptError(error, logger))(
        orElse(() => handleUnknown(error, logger))(
          handleRouteError(error)
        )
      )
    )
  ).value;

  return <>{component}</>;
}
