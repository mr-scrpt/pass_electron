// export { HtmlLayout as Layout } from "@/shared/ui/layout/ui/html.layout";

import { HtmlLayout } from "@/shared/ui/layout/ui/html.layout";
import type { ComponentProps } from "react";

type LayoutProps = ComponentProps<"div">;

import type { LinksFunction } from "react-router";
import tailwindStylesheet from "@/shared/styles/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "stylesheet", href: tailwindStylesheet },
];

export const Layout = (props: LayoutProps) => {
  const { children } = props;
  return <HtmlLayout>{children}</HtmlLayout>;
};
