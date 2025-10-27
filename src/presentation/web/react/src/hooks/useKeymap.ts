// presentation/web/react/hooks/useKeymap.ts

import type {
  Keymap,
  KeymapContext,
} from "@/presentation/shared/systems/keymap";
import { useEffect, useState } from "react";
import { useKeymapExecutor, useKeymapRegistry } from "./useKeymapSystems";

/**
 * React hook для регистрации горячих клавиш
 *
 * @example
 * useKeymap({
 *   key: 'Enter',
 *   description: 'Open resource',
 *   context: { route: '/resources', mode: 'navigation' },
 *   action: () => navigate(`/resources/${focusedId}`),
 * })
 */
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

/**
 * Hook для получения активных клавиш в текущем контексте
 */
export function useActiveKeymaps(context: KeymapContext): Keymap[] {
  const registry = useKeymapRegistry();
  const [keymaps, setKeymaps] = useState<Keymap[]>([]);

  useEffect(() => {
    const active = registry.findForContext(context);
    setKeymaps(active);
  }, [context.route, context.mode]);

  return keymaps;
}

/**
 * Hook для обработки событий клавиатуры
 */
export function useKeymapListener(context: KeymapContext) {
  const executor = useKeymapExecutor();

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      // Игнорируем если фокус в input/textarea (кроме navigation mode)
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

      // Предотвратить поведение по умолчанию если обработали
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

