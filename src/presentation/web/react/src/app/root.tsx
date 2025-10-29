import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

import "./setup";

import { orElse } from "@/main/shared";
import { useLogger, useNotificationManager } from "@/platform";
import {
  handleIError,
  handleJavaScriptError,
  handlePlatformError,
  handleRouteError,
  handleUnknown,
} from "@/shared/error-boundary";
import { handleExpectedErrors } from "@/shared/error-boundary/utils/handleExpectedErrors";
import "@/shared/styles/tailwind.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "./provider/notification.provider";

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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
      mutations: {
        onError: (error: unknown) =>
          handleExpectedErrors(error, notificationManager),
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider manager={notificationManager}>
        <Outlet />
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const logger = useLogger();

  const component = orElse(() => handlePlatformError(error, logger))(
    orElse(() => handleIError(error, logger))(
      orElse(() => handleJavaScriptError(error, logger))(
        orElse(() => handleUnknown(error, logger))(handleRouteError(error)),
      ),
    ),
  ).value;

  return <>{component}</>;
}
