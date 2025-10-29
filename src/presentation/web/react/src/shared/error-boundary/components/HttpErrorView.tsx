interface HttpErrorViewProps {
  status: number;
  statusText: string;
  data?: string;
}

/**
 * Компонент для отображения HTTP ошибок (404, 500, etc.)
 */
export function HttpErrorView({ status, statusText, data }: HttpErrorViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ctp-base">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ctp-red mb-4">{status}</h1>
        <h2 className="text-2xl font-semibold text-ctp-text mb-2">
          {statusText}
        </h2>
        {data && <p className="text-ctp-subtext0">{data}</p>}
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
