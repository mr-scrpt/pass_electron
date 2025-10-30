import { useNotificationManager } from "@/platform";
import { handleExpectedErrors } from "@/shared/error-boundary/";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentProps } from "react";

type QueryProviderProps = ComponentProps<"div">;

export const QueryProvider = (props: QueryProviderProps) => {
  const { children } = props;
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
