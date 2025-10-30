import { Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotificationManager } from "@/platform";
import { NotificationProvider } from "../provider/notification.provider";
import { handleExpectedErrors } from "@/shared/error-boundary/utils/handleExpectedErrors";
import "../setup";

/**
 * Root компонент приложения
 * Настраивает React Query и глобальные провайдеры
 * @layer Presentation/Root
 */
export default function Root() {
  const notificationManager = useNotificationManager();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
      mutations: {
        onError: (error: unknown) =>
          handleExpectedErrors(error, notificationManager),
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider manager={notificationManager}>
        <Outlet />
      </NotificationProvider>
    </QueryClientProvider>
  );
}
