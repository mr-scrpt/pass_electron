import { getValidatedQueries } from "@/main/composition";

/**
 * РЕАЛЬНАЯ ошибка - забыли проверить Validation
 * URL: /page/errors-test/validation
 */
export async function loader() {
  const queriesResult = getValidatedQueries();
  const queries = queriesResult.value;
  const result = await queries.list();

  if (result.isLeft()) {
    throw result.value;
  }

  return { resources: result.value };
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
