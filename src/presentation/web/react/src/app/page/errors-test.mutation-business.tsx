import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNotificationManager } from "@/platform";
import { invalid, valid } from "@/main/shared";
import { BaseError } from "@/main/shared";

/**
 * Expected Error - Mutation Business Rule
 * Business rule violations показываются через notifications
 * URL: /errors-test/mutation-business
 */

// Симуляция mutation function
async function withdrawMoney(amount: number) {
  const accountBalance = 1000;

  // Business rule: insufficient funds
  if (amount > accountBalance) {
    return invalid([
      new BaseError({
        entityType: "Transaction",
        message: `Insufficient funds. Balance: $${accountBalance}, requested: $${amount}`,
        code: "BUSINESS_RULE_VIOLATION",
      }),
    ]);
  }

  // Business rule: minimum withdrawal
  if (amount < 10) {
    return invalid([
      new BaseError({
        entityType: "Transaction",
        message: "Minimum withdrawal amount is $10",
        code: "BUSINESS_RULE_VIOLATION",
      }),
    ]);
  }

  // Success
  return valid({
    newBalance: accountBalance - amount,
    message: `Successfully withdrew $${amount}`,
  });
}

export default function MutationBusiness() {
  const notificationManager = useNotificationManager();
  const [amount, setAmount] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await withdrawMoney(Number(amount));

      // Преобразуем Validation в Promise
      if (result.isLeft()) {
        throw result.value; // ✅ Глобальный onError покажет notifications
      }

      return result.value;
    },

    onSuccess: (data) => {
      // ✅ Success обрабатываем локально
      notificationManager.notify({
        level: "success",
        message: `${data.message}. New balance: $${data.newBalance}`,
        duration: 3000,
      });

      // Reset
      setAmount("");
    },

    // ✅ onError убрали - работает глобальный обработчик!
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-ctp-text mb-6">
          Expected Error: Business Rule
        </h1>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-ctp-mauve mb-4">
            ✅ Правильная обработка через TanStack Query
          </h2>
          <div className="space-y-2 text-ctp-subtext0">
            <p>
              <strong className="text-ctp-text">Balance:</strong> $1000
            </p>
            <p>
              <strong className="text-ctp-text">Rules:</strong>
            </p>
            <ul className="list-disc list-inside ml-4">
              <li>Minimum: $10</li>
              <li>Maximum: $1000 (balance)</li>
            </ul>
            <p className="text-ctp-green mt-4">
              ✅ Business rule violations → Toast notifications
            </p>
            <p className="text-ctp-green">
              ✅ НЕ попадает в ErrorBoundary!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-ctp-surface0 p-6 rounded-lg space-y-4">
          <div>
            <label htmlFor="amount" className="block text-ctp-text mb-2">
              Withdrawal Amount ($):
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1"
              className="w-full px-4 py-2 bg-ctp-base text-ctp-text rounded border border-ctp-surface1 focus:border-ctp-mauve focus:outline-none"
              placeholder="Enter amount"
            />
            <p className="text-ctp-subtext1 text-sm mt-1">
              Попробуй: $50 (✅), $5 (❌ min), $1500 (❌ insufficient)
            </p>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink disabled:opacity-50"
          >
            {mutation.isPending ? "Processing..." : "Withdraw"}
          </button>
        </form>

        {/* Status indicator */}
        {mutation.isSuccess && (
          <div className="mt-6 p-4 bg-ctp-green/20 border-2 border-ctp-green rounded-lg">
            <p className="text-ctp-green font-semibold">
              ✅ Transaction successful! (check notifications)
            </p>
          </div>
        )}

        {mutation.isError && (
          <div className="mt-6 p-4 bg-ctp-yellow/20 border-2 border-ctp-yellow rounded-lg">
            <p className="text-ctp-yellow font-semibold">
              ⚠️ Business Rule Violation (check notifications)
            </p>
            <p className="text-ctp-subtext0 mt-2">
              Смотри Toast notifications вверху экрана!
            </p>
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
