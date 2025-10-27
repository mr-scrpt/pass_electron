// src/presentation/web/react/src/shared/keymap/useKeymaps.ts
import { useEffect } from "react";
import { useKeymapRegistry } from "../../hooks/useKeymapSystems";
import type { FeatureKeymapConfig, KeymapMode } from "./types";

/**
 * Утилита для регистрации декларативных конфигов кеймапов
 * 
 * ✅ Принимает конфиг feature (несколько режимов) + зависимости
 * ✅ Биндит action-фабрики к dependencies
 * ✅ Регистрирует все кеймапы в KeymapRegistry
 * 
 * ⚠️ ВАЖНО: Слушатели нужно активировать вручную в композиционном хуке
 * для каждого режима через useKeymapListener, так как React hooks
 * нельзя вызывать динамически (количество режимов может меняться)
 * 
 * @example
 * // В композиционном хуке:
 * useKeymapListener({ route: "/test", mode: "navigation" });
 * useKeymaps(testKeymapConfig, deps);
 * 
 * @layer Presentation/Shared
 */
export function useKeymaps<TDeps>(
  config: FeatureKeymapConfig<TDeps>,
  deps: TDeps
) {
  const registry = useKeymapRegistry();

  useEffect(() => {
    // Регистрируем все кеймапы из всех режимов
    Object.values(config).forEach((mode: KeymapMode<TDeps>) => {
      mode.keymaps.forEach(keymap => {
        registry.register({
          key: keymap.key,
          description: keymap.description,
          context: {
            route: mode.route,
            mode: mode.mode,
          },
          // ✅ Биндим deps к action-фабрике
          action: () => keymap.action(deps)
        });
      });
    });

    // Cleanup: отписываемся при unmount
    return () => {
      Object.values(config).forEach((mode: KeymapMode<TDeps>) => {
        mode.keymaps.forEach(keymap => {
          registry.unregister(keymap.key, {
            route: mode.route,
            mode: mode.mode,
          });
        });
      });
    };
  }, [config, deps, registry]);
}
