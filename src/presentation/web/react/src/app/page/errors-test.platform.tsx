import { useLogger } from "@/platform";

/**
 * РЕАЛЬНАЯ Platform ошибка
 * URL: /page/errors-test/platform
 */
export default function PlatformError() {
  const logger = useLogger();
  logger.info("Platform error test");

  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-ctp-text mb-6">
          Platform Error Test
        </h1>
        <p className="text-ctp-green">
          ✅ DI работает - Logger инициализирован
        </p>
      </div>
    </div>
  );
}
