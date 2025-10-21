import type { Config } from "@react-router/dev/config";

export default {
  // Указываем где находятся routes и root.tsx
  appDirectory: "src",
  
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
} satisfies Config;
