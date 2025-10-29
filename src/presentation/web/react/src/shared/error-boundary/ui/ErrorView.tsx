interface ErrorViewProps {
  message: string;
  showDetails?: boolean;
  details?: string;
  onRetry?: () => void;
}

/**
 * Универсальный компонент для отображения ошибок
 */
export function ErrorView({
  message,
  showDetails = false,
  details,
  onRetry,
}: ErrorViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ctp-base p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-ctp-red mb-4">
          Something went wrong
        </h1>
        <p className="text-ctp-text mb-4">{message}</p>

        {showDetails && details && (
          <details className="mt-4">
            <summary className="cursor-pointer text-ctp-mauve mb-2">
              Stack Trace (dev only)
            </summary>
            <pre className="text-left bg-ctp-surface0 text-ctp-text p-4 rounded overflow-auto text-sm">
              {details}
            </pre>
          </details>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
