import { Outlet } from "react-router";

// import type { LinksFunction } from "react-router";
// import tailwindStylesheet from "@/shared/styles/tailwind.css?url";
//
// export const links: LinksFunction = () => [
//   { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
//   { rel: "stylesheet", href: tailwindStylesheet },
// ];
// import "../setup";

export default function Root() {
  return <Outlet />;
}
