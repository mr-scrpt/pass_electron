import type { ComponentProps } from "react";
import { Meta, Links, Scripts, ScrollRestoration } from "react-router";

type HtmlLayoutProps = ComponentProps<"html"> & { locale?: string };

export const HtmlLayout = (props: HtmlLayoutProps) => {
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
        className="bg-ctp-base text-ctp-text flex items-center justify-center"
        style={{ minHeight: "100dvh" }}
      >
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};
