//  src/presentation/web/react/src/app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  ignoredRouteFiles: ["**/provider/**", "**/*.test.tsx", "**/*.stories.tsx"],
  rootDirectory: "page",
}) satisfies RouteConfig;
