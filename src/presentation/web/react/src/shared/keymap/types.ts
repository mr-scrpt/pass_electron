// src/presentation/web/react/src/shared/keymap/types.ts

/**
 * Типы для декларативной системы кеймапов
 * 
 * @layer Presentation/Shared
 */

/**
 * Определение одного кеймапа (без context - он берется из режима)
 */
export type KeymapDef<TDeps> = {
  key: string;
  description: string;
  action: (deps: TDeps) => void | Promise<void>;
};

/**
 * Режим (mode) - набор кеймапов с общим контекстом
 */
export type KeymapMode<TDeps> = {
  route: string;
  mode: "navigation" | "editing";
  keymaps: KeymapDef<TDeps>[];
};

/**
 * Конфигурация feature - несколько режимов
 * 
 * @example
 * const myConfig: FeatureKeymapConfig<MyDeps> = {
 *   navigation: {
 *     route: "/my-page",
 *     mode: "navigation",
 *     keymaps: [{ key: "J", action: (deps) => deps.next() }]
 *   },
 *   editing: {
 *     route: "/my-page",
 *     mode: "editing",
 *     keymaps: [{ key: "Escape", action: (deps) => deps.exit() }]
 *   }
 * }
 */
export type FeatureKeymapConfig<TDeps> = {
  [modeName: string]: KeymapMode<TDeps>;
};
