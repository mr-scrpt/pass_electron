//  src/presentation/web/react/react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src/app",

  serverBuildFile: "index.js",
  serverModuleFormat: "esm",
  ssr: true,
} satisfies Config;
