import { BaseError, invalid } from "@/main/shared";
import { useAppQuery } from "@/shared/adapter/useAppQuery";

/**
 * ПРАВИЛЬНАЯ обработка через TanStack Query
 * URL: /page/errors-test/query
 */
export default function QueryError() {
  const { data, error, isError, isLoading } = useAppQuery({
    queryKey: ["test-query-validation"],
    queryFn: async () => {
      return invalid([
        new BaseError({
          entityType: "Resource",
          message: "Resource ID is invalid",
          code: "VALIDATION_ERROR",
        }),
        new BaseError({
          entityType: "Resource",
          message: "Resource not found",
          code: "NOT_FOUND",
        }),
      ]);
    },
  });

  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-ctp-text mb-6">
          Query Error Test (✅ Правильно)
        </h1>

        {isLoading && (
          <div className="p-4 bg-ctp-surface0 rounded">
            <p className="text-ctp-text">Loading...</p>
          </div>
        )}

        {isError && (
          <div className="p-6 bg-ctp-red/20 border-2 border-ctp-red rounded-lg">
            <h2 className="text-xl font-semibold text-ctp-red mb-4">
              ✅ Query Errors (правильная обработка!)
            </h2>
            <p className="text-ctp-subtext0 mb-4">
              НЕ попали в ErrorBoundary - обработаны в компоненте
            </p>
            <ul className="list-disc list-inside space-y-2">
              {error.map((err, idx) => (
                <li key={idx} className="text-ctp-text">
                  <strong>{err.getCode()}:</strong> {err.getMessage()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data && (
          <div className="p-4 bg-ctp-green/20 border border-ctp-green rounded">
            <p className="text-ctp-green">✅ Query Success!</p>
          </div>
        )}

        <div className="mt-6">
          <a
            href="/errors-test"
            className="inline-block px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink"
          >
            ← Back
          </a>
        </div>
      </div>
    </div>
  );
}
