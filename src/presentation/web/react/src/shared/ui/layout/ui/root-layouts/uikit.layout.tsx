import type { ComponentProps } from "react";
import { Meta, Links, Scripts, ScrollRestoration } from "react-router";

type UIKitLayoutProps = ComponentProps<"html"> & { locale?: string };

/**
 * UIKit Layout - полноэкранный layout для демонстрации компонентов
 * Отличия от HtmlLayout:
 * - Без ограничения ширины body (HtmlLayout: max-w-[600px])
 * - min-h-screen вместо фиксированной высоты
 * - Без центрирования через flex
 */
export const UIKitLayout = (props: UIKitLayoutProps) => {
  const { children, locale = "en", className, ...rest } = props;
  const rootClassName = className ? `mocha ${className}` : "mocha";
  return (
    <html lang={locale} data-theme="mauve" className={rootClassName} {...rest}>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className="bg-ctp-base text-ctp-text min-h-screen"
      >
        <main className="w-full min-h-screen">
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};
