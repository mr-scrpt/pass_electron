// src/presentation/web/react/src/routes/test-error.tsx
import { useEffect, useState } from "react";

/**
 * Тестовая страница для проверки ErrorBoundary
 * 
 * ❌ Намеренно выбрасывает ошибку через 1 секунду
 * ✅ Проверяет что ErrorBoundary из root.tsx перехватывает
 * ✅ Проверяет что notification показывается
 */
export default function TestError() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    // ❌ Намеренно выбрасываем ошибку
    throw new Error("🧨 Test Error: This is a deliberate error to test ErrorBoundary!");
  }, [countdown]);

  return (
    <div className="min-h-screen bg-ctp-base flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">💣</div>
        <h1 className="text-3xl font-bold text-ctp-red mb-4">
          Error incoming...
        </h1>
        <div className="text-8xl font-bold text-ctp-mauve mb-4">
          {countdown}
        </div>
        <p className="text-ctp-subtext0">
          This page will throw an error to test the ErrorBoundary system
        </p>
      </div>
    </div>
  );
}
