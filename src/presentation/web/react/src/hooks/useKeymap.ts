import type {
  Keymap,
  KeymapContext,
} from "@/systems/keymap";
import { useEffect, useState } from "react";
import { useKeymapExecutor, useKeymapRegistry } from "./useKeymapSystems";

export function useKeymap(keymap: Keymap) {
  const registry = useKeymapRegistry();

  useEffect(() => {
    registry.register(keymap);

    return () => {
      const route = keymap.context.route;
      registry.unregister(keymap.key, {
        route: typeof route === "string" ? route : route?.source || "",
        mode: keymap.context.mode,
      });
    };
  }, [keymap.key, keymap.context.route, keymap.context.mode]);
}

export function useActiveKeymaps(context: KeymapContext): Keymap[] {
  const registry = useKeymapRegistry();
  const [keymaps, setKeymaps] = useState<Keymap[]>([]);

  useEffect(() => {
    const active = registry.findForContext(context);
    setKeymaps(active);
  }, [context.route, context.mode]);

  return keymaps;
}

export function useKeymapListener(context: KeymapContext) {
  const executor = useKeymapExecutor();

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (context.mode !== "navigation") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }
      }

      const handled = await executor.execute(
        {
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          metaKey: e.metaKey,
        },
        context,
      );

      if (handled) {
        e.preventDefault();
      }
    };

    const handleKeyPressWrapper = (e: KeyboardEvent) => {
      void handleKeyPress(e);
    };

    window.addEventListener("keydown", handleKeyPressWrapper);
    return () => window.removeEventListener("keydown", handleKeyPressWrapper);
  }, [context.route, context.mode]);
}
