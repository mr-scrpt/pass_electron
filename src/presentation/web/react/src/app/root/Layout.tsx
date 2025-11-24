import { HtmlLayout } from "@/shared/ui/layout/ui/html.layout";
import { UIKitLayout } from "@/shared/ui/layout/ui/uikit.layout";
import type { ComponentProps } from "react";
import { useLocation } from "react-router";

type LayoutProps = ComponentProps<"div">;

import type { LinksFunction } from "react-router";
import tailwindStylesheet from "@/shared/styles/tailwind.css?url";
import { RootProvider } from "../provider/root.provider";

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "stylesheet", href: tailwindStylesheet },
];

/**
 * Root Layout - выбирает layout в зависимости от пути
 */
export const Layout = (props: LayoutProps) => {
  const { children } = props;
  const location = useLocation();

  // UIKit использует отдельный layout без ограничений ширины и Header
  if (location.pathname.startsWith("/uikit")) {
    return (
      <RootProvider>
        <UIKitLayout>{children}</UIKitLayout>
      </RootProvider>
    );
  }

  // Основное приложение использует стандартный layout
  return (
    <RootProvider>
      <HtmlLayout>{children}</HtmlLayout>
    </RootProvider>
  );
};
