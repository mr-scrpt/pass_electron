/**
 * React Hooks - Public API
 *
 * Адаптеры между TanStack Query и ServiceContainer.
 *
 * @layer Presentation (React Hooks)
 */

// Queries (чтение данных)
export * from "./queries";

// Mutations (изменение данных)
export * from "./mutations";

// Обёртки над TanStack Query
export { useValidatedQuery } from "./useValidatedQuery";
export { useAppMutation as useValidatedMutation } from "./useValidatedMutation";

// Keyboard & Modal системы
export { useKeymap, useActiveKeymaps, useKeymapListener } from "./useKeymap";
export { useModal } from "./useModal";
export { useFocus } from "./useFocus";

// Утилиты
export { useInvalidateResources } from "./useInvalidateResources";
