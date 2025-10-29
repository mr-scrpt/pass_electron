import type { INotificationManager } from "@/main/composition";
import { createStrictContext, useStrictContext } from "@/shared/lib/react";

const NotificationContext = createStrictContext<INotificationManager>();
export const NotificationProviderInstanse = NotificationContext.Provider;

export const useNotification = () => {
  const notificationManager = useStrictContext(NotificationContext);
  return { notificationManager };
};
