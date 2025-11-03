// export { HtmlLayout as Layout } from "@/shared/ui/layout/ui/html.layout";

import { HtmlLayout } from "@/shared/ui/layout/ui/html.layout";
import type { ComponentProps } from "react";

type LayoutProps = ComponentProps<"div">;

import type { LinksFunction } from "react-router";
import tailwindStylesheet from "@/shared/styles/tailwind.css?url";
import { Header } from "@/widget/header/ui/header";
import { RootProvider } from "../provider/root.provider";

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "stylesheet", href: tailwindStylesheet },
];

export const Layout = (props: LayoutProps) => {
  const { children } = props;
  return (
    <RootProvider>
      <HtmlLayout>
        <Header className="w-full" />
        {children}
      </HtmlLayout>
    </RootProvider>
  );
};
