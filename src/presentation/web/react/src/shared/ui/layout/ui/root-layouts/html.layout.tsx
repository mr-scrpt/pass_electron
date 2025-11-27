import type { ComponentProps } from "react";
import { Meta, Links, Scripts, ScrollRestoration } from "react-router";
import { PageLayout } from "@/shared/ui/page-layout";

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
      <PageLayout>
        {children}
        <ScrollRestoration />
        <Scripts />
      </PageLayout>
    </html>
  );
};

// import { PageLayout as LayoutPage } from "@/shared/ui/page-layout";

// export const PageMain = () => {
//   // А здесь мы хотим использовать наш удобный API
//   return (
//     <>
//       <LayoutPage.Header>...</LayoutPage.Header>
//       <LayoutPage.Main>...</LayoutPage.Main>
//       <LayoutPage.Footer>...</LayoutPage.Footer>
//     </>
//   );
// };
