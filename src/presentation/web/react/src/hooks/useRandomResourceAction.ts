import { useEffect } from "react";
import type { ResourceListItemDTO } from "@/application/queries/dtos";
import { ServiceContainer } from "@/composition";
import { ShowRandomResourceAction } from "@/application/actions";
import { ShowRandomResourceHandler } from "../handlers/ShowRandomResourceHandler";
import { useNotificationManager } from "../contexts/NotificationContext";

export function useRandomResourceAction(
  resources: ResourceListItemDTO[],
  setRandomResource: (resource: ResourceListItemDTO | null) => void,
): void {
  const notificationManager = useNotificationManager();

  useEffect(() => {
    const actionBusResult = ServiceContainer.getActionBus();

    return actionBusResult
      .map((actionBus) => {
        const handler = new ShowRandomResourceHandler(
          resources,
          setRandomResource,
          notificationManager,
        );

        actionBus.register("ShowRandomResourceAction", handler);
        console.log("[useRandomResourceAction] Handler registered");

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.key === "i") {
            e.preventDefault();
            console.log("[useRandomResourceAction] Ctrl+I pressed");
            actionBus
              .dispatch(new ShowRandomResourceAction())
              .catch(console.error);
          }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
          window.removeEventListener("keydown", handleKeyDown);
          actionBus.unregister("ShowRandomResourceAction");
          console.log("[useRandomResourceAction] Handler unregistered");
        };
      })
      .mapLeft((errors) => {
        console.error("[useRandomResourceAction] Failed to get ActionBus:", errors);
        return () => {};
      }).value;
  }, [resources, setRandomResource, notificationManager]);
}
