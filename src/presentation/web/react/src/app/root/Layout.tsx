import { Links, Meta, Scripts, ScrollRestoration } from "react-router";
import "@/shared/styles/tailwind.css";

/**
 * HTML Layout обертка для всего приложения
 * @layer Presentation/Root
 */
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
