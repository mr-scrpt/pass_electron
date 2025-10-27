//  src/presentation/web/react/src/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
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
    <NotificationProvider manager={appServices!.notificationManager}>
      <Outlet />
    </NotificationProvider>
  );
}
