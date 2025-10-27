import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vite Configuration
 * 
 * ✅ НЕ знает о платформах (Web, Electron, Mobile)
 * ✅ Чистый конфиг без условной логики
 * 
 * Platform-specific конфигурация происходит через:
 * - configs/platform.config.ts реэкспорт (подменяется Electron build script)
 * - @password-manager/platform-configs workspace package
 */
export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  publicDir: "public"
});
