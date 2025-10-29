import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNotificationManager } from "@/platform";
import { invalid, valid } from "@/main/shared";
import { BaseError } from "@/main/shared";

/**
 * Expected Error - Mutation Validation
 * Validation errors показываются через notifications
 * URL: /errors-test/mutation-validation
 */

// Симуляция mutation function
async function submitForm(data: { name: string; email: string }) {
  // Validation
  const errors: BaseError[] = [];

  if (!data.name || data.name.length < 3) {
    errors.push(
      new BaseError({
        entityType: "Form",
        message: "Name must be at least 3 characters",
        code: "VALIDATION_ERROR",
      })
    );
  }

  if (!data.email || !data.email.includes("@")) {
    errors.push(
      new BaseError({
        entityType: "Form",
        message: "Invalid email format",
        code: "VALIDATION_ERROR",
      })
    );
  }

  // Возвращаем Validation
  if (errors.length > 0) {
    return invalid(errors);
  }

  return valid({ message: "Form submitted successfully!" });
}

export default function MutationValidation() {
  const notificationManager = useNotificationManager();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await submitForm({ name, email });

      // Преобразуем Validation в Promise
      if (result.isLeft()) {
        throw result.value; // TanStack Query поймает как error
      }

      return result.value; // TanStack Query поймает как data
    },
    
    onSuccess: (data) => {
      // ✅ Показываем success notification
      notificationManager.notify({
        level: "success",
        message: data.message,
        duration: 3000,
      });

      // Reset form
      setName("");
      setEmail("");
    },
    
    onError: (errors: BaseError[]) => {
      // ✅ Показываем error notifications
      errors.forEach((err) => {
        notificationManager.notify({
          level: "error",
          message: err.getMessage(),
          duration: 5000,
        });
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-ctp-text mb-6">
          Expected Error: Mutation Validation
        </h1>

        <div className="bg-ctp-surface0 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-ctp-mauve mb-4">
            ✅ Правильная обработка через TanStack Query
          </h2>
          <p className="text-ctp-subtext0 mb-2">
            <strong>onError:</strong> Показываем Toast notifications
          </p>
          <p className="text-ctp-subtext0 mb-2">
            <strong>onSuccess:</strong> Показываем success notification
          </p>
          <p className="text-ctp-green mt-2">
            ✅ НЕ попадает в ErrorBoundary!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-ctp-surface0 p-6 rounded-lg space-y-4">
          <div>
            <label htmlFor="name" className="block text-ctp-text mb-2">
              Name (min 3 chars):
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-ctp-base text-ctp-text rounded border border-ctp-surface1 focus:border-ctp-mauve focus:outline-none"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-ctp-text mb-2">
              Email:
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-ctp-base text-ctp-text rounded border border-ctp-surface1 focus:border-ctp-mauve focus:outline-none"
              placeholder="Enter email"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full px-4 py-2 bg-ctp-mauve text-ctp-base rounded hover:bg-ctp-pink disabled:opacity-50"
          >
            {mutation.isPending ? "Submitting..." : "Submit (попробуй невалидные данные!)"}
          </button>
        </form>

        {/* Status indicator */}
        {mutation.isSuccess && (
          <div className="mt-6 p-4 bg-ctp-green/20 border-2 border-ctp-green rounded-lg">
            <p className="text-ctp-green font-semibold">
              ✅ Success! (check notifications)
            </p>
          </div>
        )}

        {mutation.isError && (
          <div className="mt-6 p-4 bg-ctp-red/20 border-2 border-ctp-red rounded-lg">
            <p className="text-ctp-red font-semibold">
              ❌ Validation Errors (check notifications)
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
