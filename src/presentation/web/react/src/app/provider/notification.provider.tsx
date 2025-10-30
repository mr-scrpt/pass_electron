import { useNotificationManager } from "@/platform";
import { Toast } from "@/platform/web/ui/toast";
import { NotificationProviderInstanse } from "@/shared/provider/NotificationContext";
import { type ComponentProps } from "react";

type NotificationProviderProps = ComponentProps<"div">;

export const NotificationProvider = (props: NotificationProviderProps) => {
  const { children } = props;
  const manager = useNotificationManager();
  return (
    <NotificationProviderInstanse value={manager}>
      {children}
      <Toast />
    </NotificationProviderInstanse>
  );
};
