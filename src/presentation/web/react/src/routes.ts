//  src/presentation/web/react/src/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("test-notifications", "routes/test-notifications.tsx"),
] satisfies RouteConfig;
