import { useEffect } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { ServiceContainer } from "@/composition";
import { useNotificationManager } from "../contexts/NotificationContext";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const testType = formData.get("type") as string;

  const commandsResult = ServiceContainer.getCommands();
  if (commandsResult.isLeft()) {
    return { errors: commandsResult.value, type: testType };
  }

  const commands = commandsResult.value;

  if (testType === "success") {
    // ✅ Валидные данные - успех
    const result = await commands.createResource({
      namespace: "test", // Несуществующий namespace
      name: `success-${Date.now()}`, // Уникальное имя
      secret: "test123",
    });

    if (result.isLeft()) {
      return { errors: result.value, type: testType };
    }

    // Получаем список ресурсов чтобы найти ID только что созданного
    const queriesResult = ServiceContainer.getQueries();
    if (queriesResult.isLeft()) {
      return {
        success: true,
        message: "Resource created successfully!",
        type: testType,
      };
    }

    const queries = queriesResult.value;
    const resourcesResult = await queries.list();

    if (resourcesResult.isLeft()) {
      return {
        success: true,
        message: "Resource created successfully!",
        type: testType,
      };
    }

    // Находим последний созданный ресурс в namespace "test"
    const testResources = resourcesResult.value.filter(
      (r) => r.namespace === "test",
    );
    const lastResource = testResources[testResources.length - 1];

    return {
      success: true,
      message: "Resource created successfully!",
      resourceId: lastResource?.id, // ID для отложенного удаления
      type: testType,
    };
  }

  if (testType === "error") {
    // ❌ Невалидные данные - Domain аккумулирует ошибки от ResourceName:
    // 1. name пустой → "cannot be empty"
    // 2. name пустой → "must be 1-100 characters"
    // ResourceNameInvariant.sequence() аккумулирует ОБЕ ошибки!
    const result = await commands.createResource({
      namespace: "e", // ✅ Валиден, не существует → checkUniqueness пройдет
      name: "", // ❌ Пустой → 2 ValidationError от sequence()
      secret: "test123",
    });

    return result
      .map(() => ({
        success: true,
        message: "Unexpected success",
        type: testType,
      }))
      .mapLeft((errors) => ({
        // Flatten на случай вложенных массивов + сериализация для JSON
        errors: errors.flat().map((e) => ({
          message:
            typeof e.getMessage === "function" ? e.getMessage() : String(e),
        })),
        type: testType,
      })).value;
  }

  return { errors: [{ message: "Unknown test type" }], type: testType };
}

export default function TestNotifications() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const notificationManager = useNotificationManager();

  // ✅ Показываем нотификации ТОЛЬКО при изменении data через useEffect
  useEffect(() => {
    if (!data) return;

    // Показываем нотификацию только после завершения action
    if (navigation.state === "idle") {
      if ("success" in data && data.success) {
        // ✅ Успех - показываем нотификацию
        notificationManager.notify({
          level: "success",
          message: data.message || "Operation successful!",
          duration: 4000,
        });

        // 🆕 Если есть resourceId - показываем warning через 5 секунд
        if ("resourceId" in data && data.resourceId) {
          const resourceId = data.resourceId;

          console.log(
            `[TestNotifications] Scheduling notification for ${resourceId} in 5 seconds...`,
          );

          const timeoutId = setTimeout(() => {
            console.log(
              `[TestNotifications] Showing delayed notification for ${resourceId}...`,
            );

            // Показываем warning нотификацию через 5 секунд
            notificationManager.notify({
              level: "warning",
              message: `⏰ Test resource would be auto-deleted (ID: ${resourceId.slice(0, 8)}...)`,
              duration: 5000,
            });

            console.log(`[TestNotifications] Delayed notification shown`);
          }, 5000);

          // Cleanup - отменяем таймер при unmount
          return () => {
            clearTimeout(timeoutId);
            console.log(
              `[TestNotifications] Timeout cleared for ${resourceId}`,
            );
          };
        }
      } else if ("errors" in data && data.errors) {
        // ❌ Ошибки - показываем каждую
        const errors = data.errors as Array<{ message: string }>;

        // Аккумулированные ошибки из Domain показываем как одну нотификацию
        const errorMessages = errors.map((e) => e.message).join("; ");

        notificationManager.notify({
          level: "error",
          message: `Validation failed: ${errorMessages}`,
          duration: 6000,
        });
      }
    }
  }, [data, navigation.state, notificationManager]);

  return (
    <div className="min-h-screen bg-ctp-base p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-ctp-mauve mb-2">
          Test Notifications
        </h1>
        <p className="text-ctp-subtext0 mb-8">
          Тестирование потока ошибок: Domain → Application → Presentation
        </p>

        <div className="space-y-4">
          {/* ✅ Кнопка успеха */}
          <div className="bg-ctp-surface0 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-ctp-green mb-2">
              ✅ Success Test + Auto-Delete
            </h2>
            <p className="text-ctp-subtext0 mb-4">
              1. Создаем ресурс с валидными данными → Success toast
              <br />
              2. Ждем 5 секунд → Warning toast (эмуляция удаления)
              <br />
              <span className="text-ctp-yellow">
                ⏰ Можно нажимать много раз - каждый ресурс создается с
                уникальным именем
              </span>
            </p>
            <Form method="post">
              <input type="hidden" name="type" value="success" />
              <button
                type="submit"
                className="px-4 py-2 bg-ctp-green text-ctp-base rounded hover:bg-ctp-teal transition-colors"
              >
                Create Valid Resource
              </button>
            </Form>
          </div>

          {/* ❌ Кнопка ошибки */}
          <div className="bg-ctp-surface0 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-ctp-red mb-2">
              ❌ Error Test
            </h2>
            <p className="text-ctp-subtext0 mb-4">
              Создаем ресурс с невалидными данными:
              <br />
              <code className="text-ctp-flamingo">
                namespace: "error-test" (валиден)
              </code>
              <br />
              <code className="text-ctp-flamingo">name: "" (пустой)</code>
              <br />
              <span className="text-ctp-yellow">
                ✅ ResourceNameInvariant.sequence() аккумулирует 2 ошибки:
                <br />
                &nbsp;&nbsp;1. "cannot be empty"
                <br />
                &nbsp;&nbsp;2. "must be 1-100 characters"
              </span>
            </p>
            <Form method="post">
              <input type="hidden" name="type" value="error" />
              <button
                type="submit"
                className="px-4 py-2 bg-ctp-red text-ctp-base rounded hover:bg-ctp-maroon transition-colors"
              >
                Create Invalid Resource
              </button>
            </Form>
          </div>
        </div>

        {/* Результат последнего action */}
        {data && (
          <div className="mt-8 bg-ctp-surface0 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-ctp-text mb-2">
              Last Action Result:
            </h3>
            <pre className="text-ctp-subtext0 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/"
            className="text-ctp-blue hover:text-ctp-sapphire underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
