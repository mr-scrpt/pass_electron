import type { INotificationManager } from "@/main/application/ports";
import { NotificationProviderInstanse } from "@/shared/provider/NotificationContext";
import { type ReactNode } from "react";

interface NotificationProviderProps {
  manager: INotificationManager;
  children: ReactNode;
}

export function NotificationProvider({
  manager,
  children,
}: NotificationProviderProps) {
  return (
    <NotificationProviderInstanse value={manager}>
      {children}
    </NotificationProviderInstanse>
  );
}

