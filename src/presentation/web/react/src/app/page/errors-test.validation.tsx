import { BaseError, invalid } from "@/main/shared";

/**
 * Domain Errors - ПЛОХАЯ ПРАКТИКА!
 * Expected errors (IError[]) выбрасываются через throw
 * URL: /errors-test/validation
 */
export async function loader() {
  // Симуляция Domain/Application ошибок
  const validationErrors = invalid([
    new BaseError({
      entityType: "Resource",
      message: "Resource name is required",
      code: "VALIDATION_ERROR",
    }),
    new BaseError({
      entityType: "Resource",
      message: "Namespace is invalid",
      code: "VALIDATION_ERROR",
    }),
  ]);

  // ❌ ПЛОХАЯ ПРАКТИКА - throw IError[]!
  // Expected errors НЕ ДОЛЖНЫ попадать в ErrorBoundary
  if (validationErrors.isLeft()) {
    throw validationErrors.value;
  }

  return { data: "success" };
}

export default function ValidationError() {
  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-ctp-text">
          ✅ Нет ошибок
        </h1>
      </div>
    </div>
  );
}
