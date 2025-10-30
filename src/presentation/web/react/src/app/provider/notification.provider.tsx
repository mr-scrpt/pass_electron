import type { INotificationManager } from "@/main/composition";
import { Toast } from "@/platform/web/ui/toast";
import { NotificationProviderInstanse } from "@/shared/provider/NotificationContext";
import { type ComponentProps } from "react";

type NotificationProviderProps = ComponentProps<"div"> & {
  manager: INotificationManager;
};

export const NotificationProvider = (props: NotificationProviderProps) => {
  const { children, manager } = props;
  return (
    <NotificationProviderInstanse value={manager}>
      {children}
      <Toast />
    </NotificationProviderInstanse>
  );
};
