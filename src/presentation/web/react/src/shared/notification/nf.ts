import type { IError } from "@/main/shared/errors";
import { useNotification } from "../provider/NotificationContext";

export const useAppNotification = () => {
  const { notificationManager } = useNotification();
  const nv = {
    success: (message: string) => {
      notificationManager.notify({
        level: "success",
        message,
      });
    },

    error: (error: IError[]) => {
      error.map((er) =>
        notificationManager.notify({
          level: "error",
          message: er.getMessage(),
        }),
      );
    },
  };

  return { nv };
};
