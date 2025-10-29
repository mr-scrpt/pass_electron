import { getValidatedNotificationManager } from "@/main/composition";
import { DependencyResolutionError } from "../../errors/DependencyResolutionError";

export const useNotificationManager = () => {
  return getValidatedNotificationManager().mapLeft((errors) => {
    throw new DependencyResolutionError("NotificationManager", errors);
  }).value;
};
