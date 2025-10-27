import { createContext, useContext, type ReactNode } from "react";
import type { INotificationManager } from "@/application/ports";

const NotificationContext = createContext<INotificationManager | null>(null);

interface NotificationProviderProps {
  manager: INotificationManager;
  children: ReactNode;
}

export function NotificationProvider({
  manager,
  children,
}: NotificationProviderProps) {
  return (
    <NotificationContext.Provider value={manager}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationManager(): INotificationManager {
  const manager = useContext(NotificationContext);
  if (!manager) {
    throw new Error(
      "useNotificationManager must be used within NotificationProvider",
    );
  }
  return manager;
}
